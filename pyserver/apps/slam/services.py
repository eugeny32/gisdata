"""
Port of app/lib/slam.php's path/label helpers plus slam_link_tour(). Order
of steps lives in models.py::PIPELINE_ORDER (see its docstring for why
colorize runs BEFORE georeference: it projects the camera onto points in
the LOCAL SLAM frame, which hasn't been turned into UTM yet).
"""

import shutil
from pathlib import Path

from django.conf import settings

from .models import PIPELINE_ORDER, SlamProcessedAsset, SlamScan

STEP_LABELS = {
    "compute_slam": "SLAM (Voxel-SLAM)",
    "decode_raw": "Декодирование bag",
    "filter_outliers": "Фильтр выбросов",
    "bin_to_rinex": "BIN → RINEX",
    "ppk_correction": "PPK-коррекция",
    "colorize": "Раскраска по камере",
    "georeference": "Геореференсинг",
    "build_octree": "Построение октодерева",
}


def slam_step_label(step: str) -> str:
    return STEP_LABELS.get(step, step)


def slam_next_step(step: str) -> str | None:
    try:
        idx = PIPELINE_ORDER.index(step)
    except ValueError:
        return None
    return PIPELINE_ORDER[idx + 1] if idx + 1 < len(PIPELINE_ORDER) else None


def slam_scan_dir(scan_id: int) -> Path:
    return Path(settings.UPLOADS_ROOT) / "slam" / str(scan_id)


def slam_scan_jobs_dir(scan_id: int) -> Path:
    return slam_scan_dir(scan_id) / "jobs"


def slam_scan_logs_dir(scan_id: int) -> Path:
    return slam_scan_dir(scan_id) / "logs"


def slam_scan_intermediate_dir(scan_id: int) -> Path:
    return slam_scan_dir(scan_id) / "intermediate"


def slam_intermediate_path(scan_id: int, step: str) -> Path:
    """Intermediate pipeline output (mirrors tasks.py's intermediate_key).
    Extension is DELIBERATELY .las, not .laz -- slam/lib/las_io.py writes
    uncompressed LAS; real LAZ/COPC compression only happens in the very
    last step (build_octree.py) via pdal/untwine, same pattern as
    copc_convert_worker."""
    return slam_scan_intermediate_dir(scan_id) / f"{step}.las"


def slam_link_tour(scan_id: int) -> None:
    """Copies the scan's finished COPC into uploads/tours/ and creates/
    updates one tours row per scan (see sql/schema.sql tours.slam_scan_id)
    -- the gisdata viewer (tour_view.php/map.php) already does COPC
    streaming+LOD, nothing else needs writing (Фаза 5)."""
    from apps.tours.models import Tour  # local import -- avoids a slam/tours import cycle

    asset = (
        SlamProcessedAsset.objects.filter(scan_id=scan_id, asset_type="copc")
        .order_by("-created_at").values_list("file_path", flat=True).first()
    )
    if not asset:
        return

    scan = SlamScan.objects.filter(id=scan_id).first()
    if not scan:
        return

    src_abs = Path(settings.UPLOADS_ROOT) / "slam" / asset
    if not src_abs.is_file():
        return

    dest_rel_dir = f"slam_{scan_id}"
    dest_rel_path = f"{dest_rel_dir}/pointcloud.copc.laz"
    dest_abs_dir = Path(settings.UPLOADS_ROOT) / "tours" / dest_rel_dir
    dest_abs_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy(src_abs, dest_abs_dir / "pointcloud.copc.laz")

    lat = (scan.bbox_min_lat + scan.bbox_max_lat) / 2 if scan.bbox_min_lat is not None and scan.bbox_max_lat is not None else 0
    lon = (scan.bbox_min_lon + scan.bbox_max_lon) / 2 if scan.bbox_min_lon is not None and scan.bbox_max_lon is not None else 0

    tour = Tour.objects.filter(slam_scan_id=scan_id).first()
    if tour:
        tour.name = scan.name
        tour.lat = lat
        tour.lon = lon
        tour.file_path = dest_rel_path
        tour.file_format = "las"
        tour.save(update_fields=["name", "lat", "lon", "file_path", "file_format"])
    else:
        Tour.objects.create(
            name=scan.name, lat=lat, lon=lon, file_path=dest_rel_path,
            file_format="las", is_enabled=1, slam_scan_id=scan_id,
        )
