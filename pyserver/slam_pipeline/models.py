"""
LiDAR/SLAM mobile-mapping processing pipeline (ported from the standalone
slamcloude project). One SlamJob row per pipeline step per scan, chained
in PIPELINE_ORDER (see services.py, Фаза 7 of the migration plan) —
mirrors bin/process_slam_jobs.php's orchestration, just claimed via
Django's select_for_update(skip_locked=True) instead of raw SQL.
"""

from django.db import models

from core.models import Admin

PIPELINE_ORDER = [
    "compute_slam", "decode_raw", "filter_outliers", "bin_to_rinex",
    "ppk_correction", "colorize", "georeference", "build_octree",
]


class SlamProject(models.Model):
    name = models.CharField(max_length=128)
    # target_crs_wkt takes priority over target_crs_epsg when both are set
    # (needed for local, non-EPSG projections — e.g. vendor FusionCRS_TM_87
    # on the SHARE S20 rig). See slam step "georeference".
    target_crs_epsg = models.IntegerField(null=True, blank=True)
    target_crs_wkt = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(
        Admin, db_column="created_by", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="slam_projects_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "slam_projects"

    def __str__(self):
        return self.name


class SlamScan(models.Model):
    STATUS_CHOICES = [
        ("uploaded", "Uploaded"), ("processing", "Processing"),
        ("completed", "Completed"), ("failed", "Failed"),
    ]

    project = models.ForeignKey(SlamProject, on_delete=models.CASCADE, related_name="scans")
    name = models.CharField(max_length=128)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="uploaded")
    raw_file_path = models.CharField(max_length=255, null=True, blank=True)
    bag_lidar_enabled = models.SmallIntegerField(default=1)
    rtk_fixed = models.SmallIntegerField(null=True, blank=True)
    # Manual bypass of GEOREFERENCE: on some captures the onboard GPS isn't
    # accurate enough even after outlier filtering + rigid alignment — better
    # to keep the cloud in local SLAM coordinates than tie it to a bad
    # absolute frame. See slam_scans admin toggle + the georeference step's
    # pass-through branch (Фаза 7).
    skip_georeference = models.SmallIntegerField(default=0)
    num_points = models.BigIntegerField(null=True, blank=True)
    source_format = models.CharField(max_length=16, null=True, blank=True)
    crs_epsg = models.IntegerField(null=True, blank=True)
    # Not always a real EPSG code — the auto-computed UTM zone is a bare
    # proj4 string. Intermediate LAZ files don't self-describe their CRS
    # (see slam/lib/lasIO.mjs's minimal writer), so it travels here instead
    # and feeds build_octree's --writers.copc.a_srs.
    crs_proj4 = models.CharField(max_length=500, null=True, blank=True)
    bbox_min_lon = models.FloatField(null=True, blank=True)
    bbox_min_lat = models.FloatField(null=True, blank=True)
    bbox_max_lon = models.FloatField(null=True, blank=True)
    bbox_max_lat = models.FloatField(null=True, blank=True)
    error_message = models.CharField(max_length=500, null=True, blank=True)
    created_by = models.ForeignKey(
        Admin, db_column="created_by", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="slam_scans_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "slam_scans"
        indexes = [models.Index(fields=["project", "created_at"], name="idx_slam_scans_project")]

    def __str__(self):
        return self.name


class SlamScanInput(models.Model):
    KIND_CHOICES = [(k, k) for k in (
        "trajectory", "rover_obs", "base_rinex", "nav",
        "rover_ppkraw_bin", "base_bin", "frame_pose",
        "project_info", "calibration", "camera_frames",
    )]

    scan = models.ForeignKey(SlamScan, on_delete=models.CASCADE, related_name="inputs")
    kind = models.CharField(max_length=20, choices=KIND_CHOICES)
    file_path = models.CharField(max_length=255)
    file_size = models.BigIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "slam_scan_inputs"
        constraints = [
            models.UniqueConstraint(fields=["scan", "kind"], name="uq_slam_input_scan_kind"),
        ]


class SlamJob(models.Model):
    STEP_CHOICES = [(s, s) for s in PIPELINE_ORDER]
    STATUS_CHOICES = [
        ("pending", "Pending"), ("processing", "Processing"),
        ("done", "Done"), ("error", "Error"), ("skipped", "Skipped"),
    ]

    scan = models.ForeignKey(SlamScan, on_delete=models.CASCADE, related_name="jobs")
    pipeline_step = models.CharField(max_length=20, choices=STEP_CHOICES)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="pending")
    stall_retries = models.IntegerField(default=0)
    error_message = models.CharField(max_length=2000, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    # Heartbeat updated by the worker while running — same stale-job
    # detection principle as bin/process_copc_conversions.php's file-based
    # lock, just as a DB column since SLAM steps don't always write one
    # steadily growing output file to watch.
    updated_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "slam_jobs"
        indexes = [models.Index(fields=["status", "created_at"], name="idx_slam_jobs_status")]
        constraints = [
            models.UniqueConstraint(fields=["scan", "pipeline_step"], name="uq_slam_job_scan_step"),
        ]


class SlamProcessedAsset(models.Model):
    ASSET_CHOICES = [(a, a) for a in ("intermediate_laz", "las", "copc", "mesh", "splat")]

    scan = models.ForeignKey(SlamScan, on_delete=models.CASCADE, related_name="assets")
    asset_type = models.CharField(max_length=20, choices=ASSET_CHOICES)
    step = models.CharField(max_length=20, null=True, blank=True)
    file_path = models.CharField(max_length=255)
    file_size = models.BigIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "slam_processed_assets"
        indexes = [models.Index(fields=["scan", "asset_type"], name="idx_slam_assets_scan")]