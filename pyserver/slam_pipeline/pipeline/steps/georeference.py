"""
Port of georeference_from_slam (s20.py:1380-1634) + _solve_yaw_similarity_transform
(1312-1343) + _smooth_residual_median (1346-1377). The real pipeline order
is COLORIZE BEFORE GEOREFERENCE (see tasks.py:539-546: colorize projects
the camera onto points in the LOCAL SLAM coordinate system, so it must run
before conversion to UTM) -- this step's input is intermediate/colorize.las.

_solve_yaw_similarity_transform here is implemented via the closed-form
complex-number solution (theta = arg(sum(conj(src)*dst))) instead of an
explicit 2x2 SVD -- mathematically identical to that result (this is the
standard absolute-orientation/Kabsch-in-2D result for pure rotation without
reflection), just doesn't need its own SVD implementation. Not a
simplification of the algorithm -- the same fit, computed a different way.

Only the BAG path (frame_pose + bag_rtk.pos, matches decode_raw.py) + PPK
path (shifting an already-georeferenced cloud by a trajectory correction)
-- as in tasks.py:575-639. If neither input is ready, pass-through.
"""

import shutil
from pathlib import Path

import numpy as np
import pyproj

from ..frame_pose import read_frame_pose
from ..las_io import read_las, write_las
from .ppk_correction import parse_pos


def _solve_yaw_similarity_transform(src_pts, dst_pts):
    """dst ~= R @ src + t (rotation about Z only + independent Z offset)."""
    src = np.asarray(src_pts, dtype=np.float64)
    dst = np.asarray(dst_pts, dtype=np.float64)
    src_c = src[:, :2].mean(axis=0)
    dst_c = dst[:, :2].mean(axis=0)
    src_cz = src[:, 2].mean()
    dst_cz = dst[:, 2].mean()

    s = src[:, :2] - src_c
    d = dst[:, :2] - dst_c
    sum_dot = float(np.sum(s[:, 0] * d[:, 0] + s[:, 1] * d[:, 1]))
    sum_cross = float(np.sum(s[:, 0] * d[:, 1] - s[:, 1] * d[:, 0]))
    theta = np.arctan2(sum_cross, sum_dot)
    cos_t, sin_t = np.cos(theta), np.sin(theta)
    r = np.array([[cos_t, -sin_t, 0], [sin_t, cos_t, 0], [0, 0, 1]])
    tx = dst_c[0] - (cos_t * src_c[0] - sin_t * src_c[1])
    ty = dst_c[1] - (sin_t * src_c[0] + cos_t * src_c[1])
    tz = dst_cz - src_cz
    return r, np.array([tx, ty, tz])


def _build_utm_projection(median_lon, median_lat, target_crs_wkt, target_crs_epsg):
    if target_crs_wkt:
        crs_def = target_crs_wkt
    elif target_crs_epsg:
        crs_def = f"EPSG:{target_crs_epsg}"
    else:
        zone = int((median_lon + 180) // 6) + 1
        hemisphere = "+north" if median_lat >= 0 else "+south"
        crs_def = f"+proj=utm +zone={zone} {hemisphere} +datum=WGS84 +units=m +no_defs"
    transformer = pyproj.Transformer.from_crs("EPSG:4326", crs_def, always_xy=True)
    inverse = pyproj.Transformer.from_crs(crs_def, "EPSG:4326", always_xy=True)
    return transformer, inverse, crs_def


def _wgs84_bbox_from_utm(x, y, inverse_transformer):
    x_min, x_max = float(x.min()), float(x.max())
    y_min, y_max = float(y.min()), float(y.max())
    corners = [(x_min, y_min), (x_max, y_min), (x_max, y_max), (x_min, y_max)]
    lons, lats = [], []
    for cx, cy in corners:
        lon, lat = inverse_transformer.transform(cx, cy)
        lons.append(lon)
        lats.append(lat)
    return [min(lons), min(lats), max(lons), max(lats)]


def run(ctx: dict) -> dict:
    scan_id = ctx["scan_id"]
    scan_dir = Path(ctx["scan_dir"])
    input_path = ctx["intermediate"]["colorize"]
    output_path = ctx["intermediate"]["georeference"]
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)

    bag_rtk_path = scan_dir / "intermediate" / "bag_rtk.pos"
    corrected_path = scan_dir / "intermediate" / "corrected.pos"
    inputs = {i["kind"]: i["path"] for i in (ctx.get("inputs") or [])}

    # Manual bypass (slam_scans.skip_georeference, see slam_scans.php): on
    # some captures the onboard GPS isn't accurate enough even after
    # outlier filtering (filter_rtk_outliers) and rigid alignment -- the
    # cloud stays in local SLAM coordinates instead of being tied to a bad
    # absolute frame.
    usable_bag_rtk = (
        not ctx.get("skip_georeference") and ctx.get("bag_lidar_enabled")
        and "frame_pose" in inputs and bag_rtk_path.is_file()
    )
    usable_ppk = not ctx.get("skip_georeference") and "trajectory" in inputs and corrected_path.is_file()

    if not usable_bag_rtk and not usable_ppk:
        shutil.copyfile(input_path, output_path)
        return {"assets": [{"type": "intermediate_laz", "path": f"{scan_id}/intermediate/georeference.las", "size": Path(output_path).stat().st_size}]}

    las = read_las(input_path)

    if usable_bag_rtk:
        frame_pose = read_frame_pose(inputs["frame_pose"])
        rtk = parse_pos(bag_rtk_path)
        if len(rtk["times"]) < 4:
            raise RuntimeError(f"RTK trajectory has only {len(rtk['times'])} epochs, need >= 4")

        rtk_times = np.asarray(rtk["times"])
        t_start = max(frame_pose.times[0], rtk_times[0])
        t_end = min(frame_pose.times[-1], rtk_times[-1])
        if t_end <= t_start:
            raise RuntimeError("No time overlap between SLAM trajectory and RTK")

        idx = np.nonzero((rtk_times >= t_start) & (rtk_times <= t_end))[0]
        if len(idx) < 4:
            raise RuntimeError(f"Only {len(idx)} RTK epochs in overlap, need >= 4")

        lons = np.asarray(rtk["lons"])[idx]
        lats = np.asarray(rtk["lats"])[idx]
        heights = np.asarray(rtk["heights"])[idx]
        median_lon = float(np.median(lons))
        median_lat = float(np.median(lats))
        utm, utm_inverse, utm_proj_def = _build_utm_projection(median_lon, median_lat, ctx.get("target_crs_wkt"), ctx.get("target_crs_epsg"))

        ux, uy = utm.transform(lons, lats)
        utm_pts = np.stack([ux, uy, heights], axis=1)

        rtk_tm = rtk_times[idx]
        slam_pts = np.stack([
            np.interp(rtk_tm, frame_pose.times, frame_pose.tx),
            np.interp(rtk_tm, frame_pose.times, frame_pose.ty),
            np.interp(rtk_tm, frame_pose.times, frame_pose.tz),
        ], axis=1)

        r, t_vec = _solve_yaw_similarity_transform(slam_pts, utm_pts)

        # CHANGED: was -- a per-point time-varying residual correction
        # (median-smoothed over a 20s sliding window, one correction PER
        # POINT interpolated by its own capture time). That's the right
        # tool for a heavily-drifting raw-odometry source (kiss-icp --
        # never actually wired up in this port, see module docstring)
        # where a single rigid fit can't track accumulating drift. It's the
        # WRONG tool here: frame_pose at this point is always a real
        # loop-closed SLAM trajectory (either our own compute_slam/
        # Voxel-SLAM native port, or the vendor's own
        # share_slam2_offline.exe output copied from the ZIP) --
        # internally consistent by construction. Layering a per-point
        # correction fit against noisy autonomous-GPS epochs (NavSatFix, no
        # RTK-FIXED gate -- see decode_raw.py's extract_rtk_epochs
        # docstring; even the filtered epochs still carry metres of
        # slowly-varying absolute bias, not just the multipath spikes
        # filter_rtk_outliers removes) on TOP of that just re-injects that
        # GPS noise as a moving, point-by-point warp: the same physical
        # wall, scanned at two different times, ends up with two different
        # corrections baked in -- this is what was actually producing the
        # doubled/smeared geometry, not the SLAM trajectory itself
        # (verified independently: alidarState.txt for scan 1 is smooth,
        # no time regressions, no implausible jumps). A single rigid
        # yaw+translation fit (computed above from ALL overlapping RTK
        # epochs at once, so it averages out epoch-level noise instead of
        # tracking it) still corrects for whatever slow absolute drift the
        # SLAM trajectory has -- that's the right amount of GPS trust for
        # an already-loop-closed source.
        xy = np.stack([las.x, las.y], axis=1) @ r[:2, :2].T
        out_x = xy[:, 0] + t_vec[0]
        out_y = xy[:, 1] + t_vec[1]
        out_z = las.z + t_vec[2]

        write_las(
            output_path, point_format=las.point_format, x=out_x, y=out_y, z=out_z,
            gps_time=las.gps_time, intensity=las.intensity, red=las.red, green=las.green, blue=las.blue,
        )

        bbox = _wgs84_bbox_from_utm(out_x, out_y, utm_inverse)
        return {
            # las_io.py deliberately doesn't write/read a CRS VLR (see its
            # docstring) -- the proj4 definition string travels via
            # slam_scans.crs_proj4 instead, so build_octree.py can pass it
            # to PDAL explicitly (--writers.copc.a_srs) rather than relying
            # on it being embedded in the intermediate LAS itself.
            "crs_proj4": utm_proj_def,
            "bbox": bbox,
            "assets": [{"type": "intermediate_laz", "path": f"{scan_id}/intermediate/georeference.las", "size": Path(output_path).stat().st_size}],
        }

    # PPK path (gnss.apply_trajectory_correction, gnss.py:147-194): shifts
    # an ALREADY-georeferenced cloud by a trajectory correction, using the
    # cloud's own embedded CRS to project the correction into the same
    # metres the points are stored in. las_io.py deliberately does not
    # read/write a CRS VLR (see its docstring), without that this port has
    # no reliable source CRS to project into here, so this path is left as
    # an explicit gap rather than silently applying the correction in the
    # wrong units. Not reached by the S20/bag workflow (the branch above
    # handles that); wire this up once a concrete non-bag/external-PPK
    # scenario needs it.
    raise RuntimeError(
        "PPK-путь georeference не реализован в этом порте: нужна CRS, встроенная в "
        "промежуточный LAS, а las_io.py сознательно её не хранит (см. докстринг). "
        "Актуально только для не-bag/внешних PPK-сценариев, не для стандартного пути S20."
    )
