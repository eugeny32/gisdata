"""
3DGS/point-cloud tours (map markers + model files), plus the saved
external-PostGIS connection profiles tours can be exported to
(pg_connections.php's "sync to PostGIS" feature, see tour sync_pg action
in a later phase).
"""

from django.db import models
from django.utils import timezone

from core.models import Admin
from users.models import UserSync


class PgConnection(models.Model):
    name = models.CharField(max_length=64, unique=True)
    host = models.CharField(max_length=255)
    port = models.IntegerField(default=5432)
    dbname = models.CharField(max_length=128)
    username = models.CharField(max_length=128)
    # Plaintext by explicit design — see sql/schema.sql comment.
    password = models.CharField(max_length=255)
    sslmode = models.CharField(max_length=20, default="prefer")
    is_default = models.SmallIntegerField(default=0)
    created_by = models.ForeignKey(
        Admin, db_column="created_by", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="pg_connections_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "pg_connections"

    def __str__(self):
        return self.name


class TourGroup(models.Model):
    name = models.CharField(max_length=128, unique=True)
    description = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "tour_groups"

    def __str__(self):
        return self.name


class Tour(models.Model):
    FORMAT_CHOICES = [("ply", "PLY"), ("splat", "Splat"), ("ksplat", "KSplat"), ("las", "LAS")]

    name = models.CharField(max_length=128)
    description = models.CharField(max_length=500, null=True, blank=True)
    lat = models.DecimalField(max_digits=10, decimal_places=7)
    lon = models.DecimalField(max_digits=10, decimal_places=7)
    file_path = models.CharField(max_length=255)
    file_format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default="ksplat")
    is_enabled = models.SmallIntegerField(default=1)
    # Publicly reachable without login via a direct link, independent of
    # is_enabled (which only governs visibility on the logged-in map) —
    # see tours/services.py::tour_is_public() ported from
    # app/lib/tours.php.
    is_public = models.SmallIntegerField(default=0)
    pg_connection = models.ForeignKey(
        PgConnection, on_delete=models.SET_NULL, null=True, blank=True, related_name="tours",
    )
    pg_synced_at = models.DateTimeField(null=True, blank=True)
    pg_sync_error = models.CharField(max_length=255, null=True, blank=True)
    group = models.ForeignKey(
        TourGroup, on_delete=models.SET_NULL, null=True, blank=True, related_name="tours",
    )
    created_by = models.ForeignKey(
        Admin, db_column="created_by", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="tours_created",
    )
    # Separate from created_by: users_sync accounts (self-service upload via
    # tour_user_upload.php) don't share admins' id space.
    created_by_user = models.ForeignKey(
        UserSync, on_delete=models.SET_NULL, null=True, blank=True, related_name="tours_created",
    )
    # One tour per finished SLAM scan — set automatically by the SLAM
    # pipeline's final step (slam.services.link_tour(), Фаза 7).
    slam_scan = models.OneToOneField(
        "slam_pipeline.SlamScan", on_delete=models.SET_NULL, null=True, blank=True, related_name="tour",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "tours"

    def __str__(self):
        return self.name


class TourFile(models.Model):
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE, related_name="files")
    file_path = models.CharField(max_length=255)
    file_format = models.CharField(max_length=10, choices=Tour.FORMAT_CHOICES)
    sort_order = models.IntegerField(default=0)

    class Meta:
        db_table = "tour_files"
        indexes = [models.Index(fields=["tour", "sort_order"], name="idx_tour_files_tour")]


class TourLayer(models.Model):
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE, related_name="layers")
    name = models.CharField(max_length=64)
    color = models.CharField(max_length=7, default="#ff3b30")
    is_visible = models.SmallIntegerField(default=1)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "tour_layers"


class TourAnnotation(models.Model):
    GEOM_CHOICES = [("point", "Point"), ("polyline", "Polyline"), ("polygon", "Polygon")]

    layer = models.ForeignKey(TourLayer, on_delete=models.CASCADE, related_name="annotations")
    geom_type = models.CharField(max_length=10, choices=GEOM_CHOICES)
    # JSON [[x,y,z], ...] in the tour model's LOCAL space (post-rotation) —
    # not geodetic, so a plain PostGIS geometry column doesn't apply here;
    # kept as opaque text exactly like the PHP original.
    coordinates = models.TextField()
    label = models.CharField(max_length=128, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "tour_annotations"
        indexes = [models.Index(fields=["layer"], name="idx_annotations_layer")]