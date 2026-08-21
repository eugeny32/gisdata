"""
Port of DECODE_RAW (bag path) from slamcloude/worker/pipeline/tasks.py
(lines 284-481) + s20.bag_lidar_to_laz (738-803) + s20.bag_to_rtk_pos
(837-907) + s20._read_pvtsln_fixes (806-834) +
extract_camera_frames_from_bag (714-735). The PCD path (non-bag) is NOT
ported (see plan, Фаза 2): the S20 always writes a bag (bag_lidar_enabled=1
by default in the schema, see sql/schema.sql).

Deliberately NOT ported (see plan, Фаза 2): visual pose correction and the
kiss-icp fallback trajectory -- both were experiments in slamcloude that
didn't pay off (or have no Node/Python-stdlib equivalent lined up here) --
when there's no SLAM trajectory yet, this step just uses the vendor
frame_pose.txt from the ZIP as-is, the same degradation path the original
already has when both corrections fail.
"""

import shutil
import zipfile
from datetime import datetime, timezone
from pathlib import Path

import numpy as np

from ..frame_pose import apply_frame_pose_to_points, read_frame_pose
from ..las_io import write_las
from ..msg_parsers import parse_compressed_image_ros1, parse_custom_msg_lidar, parse_nav_sat_fix_ros1
from ..ros1_bag import read_messages

LIDAR_TOPICS = {"/livox/lidar", "/livox/lidar_node", "/points", "/livox/points"}
CAM_TOPICS = {
    "/usb_cam/image_raw/compressed": "nav",
    "/camera_agent/img_left/compressed": "left",
    "/camera_agent/img_right/compressed": "right",
}
FIX_TOPICS = {"/rtk_agent/navsatfix", "/rtk_agent/navsatfix_sync", "/navsatfix", "/fix", "/gnss/fix", "/ublox/fix"}


def _find_extracted_inputs(extract_dir: Path):
    files = [p for p in extract_dir.rglob("*") if p.is_file() and "__MACOSX" not in p.parts]
    bags = sorted((f for f in files if f.suffix.lower() == ".bag"), key=lambda f: f.stat().st_size, reverse=True)
    bag = bags[0] if bags else None
    frame_pose = next((f for f in files if f.name.lower().endswith("frame_pose.txt")), None)
    calibration = next((f for f in files if f.name.lower().endswith("calibration.yaml")), None)
    return bag, frame_pose, calibration


# RTK-FIXED-only gate (see s20.py _FIXED_POS_TYPES/_RTK_MAX_* docstring):
# NARROW_INT(50)/INS_RTKFIXED(56), HDOP<0.9, hgtstd<0.1m -- matches the
# vendor engine's own high-accuracy gate. This port only reads the
# NavSatFix fallback (horizontal-only, altitude always 0 on this device) --
# PVTSLNMsg is a vendor-custom ROS1 type that would need dynamic message-
# definition registration (rosbags' typestore) to decode its fields;
# without a real S20 bag to verify the field layout empirically, NavSatFix
# is the safe, spec-stable fallback for this initial port. Extending to
# PVTSLNMsg is a follow-up once a real bag is available to validate offsets
# against.
def _filter_rtk_outliers(epochs, window_s=2.0, threshold_m=2.0, min_neighbours=3, max_passes=6):
    """
    Reject epochs whose position deviates far from a TIME-windowed (not
    sample-count-windowed -- real S20 recordings drop GPS for tens of
    seconds at a time near buildings, and an index-based window pulls in
    "neighbours" from the far side of a real gap) local median. `status >=
    0` alone (see docstring above) accepts a plain autonomous GPS fix with
    NO accuracy gate at all -- real S20 recordings measurably mix sub-metre-
    accurate epochs with multipath outliers reaching an IMPLIED SPEED of 70+
    m/s between consecutive 0.1s-spaced epochs. windowS/thresholdM were
    picked from that same empirical gap. Runs to a fixed point instead of
    once (a handful of bad epochs cluster together and one pass doesn't
    fully clear them), capped so a pathological input can't loop forever.
    minNeighbours falls an epoch back to "keep as-is" when it's too isolated
    in time to judge.
    """
    r = 6378137.0
    to_rad = np.pi / 180

    def haversine(lat1, lon1, lat2, lon2):
        d_lat = (lat2 - lat1) * to_rad
        d_lon = (lon2 - lon1) * to_rad
        a = np.sin(d_lat / 2) ** 2 + np.cos(lat1 * to_rad) * np.cos(lat2 * to_rad) * np.sin(d_lon / 2) ** 2
        return 2 * r * np.arcsin(np.sqrt(a))

    cur = list(epochs)
    for _pass in range(max_passes):
        times = np.array([e[0] for e in cur])
        kept = []
        for i, (ti, lat_i, lon_i, _alt_i) in enumerate(cur):
            lo = np.searchsorted(times, ti - window_s, side="left")
            hi = np.searchsorted(times, ti + window_s, side="right")
            neighbour_idx = [j for j in range(lo, hi) if j != i]
            if len(neighbour_idx) < min_neighbours:
                kept.append(cur[i])
                continue
            lats = [cur[j][1] for j in neighbour_idx]
            lons = [cur[j][2] for j in neighbour_idx]
            med_lat, med_lon = float(np.median(lats)), float(np.median(lons))
            if haversine(lat_i, lon_i, med_lat, med_lon) <= threshold_m:
                kept.append(cur[i])
        if len(kept) == len(cur):
            break
        cur = kept
    return cur


def _extract_rtk_epochs(bag_path):
    epochs = []
    for _topic, time_sec, data in read_messages(bag_path, FIX_TOPICS):
        fix = parse_nav_sat_fix_ros1(data)
        if fix and fix["status"] >= 0:
            epochs.append((time_sec, fix["lat"], fix["lon"], fix["alt"]))
    epochs.sort(key=lambda e: e[0])
    return _filter_rtk_outliers(epochs)


def _write_rtk_pos(path, epochs):
    lines = [
        "% GNSS trajectory extracted from S20 ROS1 bag (RTK)",
        "%  GPST                  latitude(deg) longitude(deg)  height(m)   Q  ns",
    ]
    for ts_unix, lat, lon, alt in epochs:
        dt = datetime.fromtimestamp(ts_unix, tz=timezone.utc)
        stamp = dt.strftime("%Y/%m/%d %H:%M:%S.") + f"{dt.microsecond // 1000:03d}"
        lines.append(f"{stamp}  {lat:.9f}  {lon:.9f}  {alt:.4f}   1  1")
    Path(path).write_text("\n".join(lines) + "\n", encoding="utf-8")


def run(ctx: dict) -> dict:
    scan_id = ctx["scan_id"]
    scan_dir = Path(ctx["scan_dir"])
    extract_dir = scan_dir / "_extract"
    scan_dir.mkdir(parents=True, exist_ok=True)
    if extract_dir.exists():
        shutil.rmtree(extract_dir)
    with zipfile.ZipFile(ctx["raw_file_path"]) as zf:
        zf.extractall(extract_dir)

    bag, frame_pose_path, calibration = _find_extracted_inputs(extract_dir)
    if not bag:
        raise RuntimeError("No .bag file found in uploaded ZIP")

    inputs_out = []
    inputs_dir = scan_dir / "inputs"
    inputs_dir.mkdir(parents=True, exist_ok=True)

    # Prefer a Voxel-SLAM trajectory already registered by compute_slam;
    # fall back to the vendor's own frame_pose.txt from the ZIP (see module
    # docstring -- no kiss-icp/visual-correction refinement in this port).
    frame_pose_source = next((i for i in (ctx.get("inputs") or []) if i["kind"] == "frame_pose"), None)
    if not frame_pose_source and frame_pose_path:
        dst = inputs_dir / "frame_pose.txt"
        shutil.copyfile(frame_pose_path, dst)
        frame_pose_source = {"path": str(dst)}
        inputs_out.append({"kind": "frame_pose", "path": f"{scan_id}/inputs/frame_pose.txt", "size": dst.stat().st_size})
    frame_pose = read_frame_pose(frame_pose_source["path"]) if frame_pose_source else None

    if calibration:
        dst = inputs_dir / "calibration.yaml"
        shutil.copyfile(calibration, dst)
        inputs_out.append({"kind": "calibration", "path": f"{scan_id}/inputs/calibration.yaml", "size": dst.stat().st_size})

    # ---- LiDAR -> LAS (world_slam frame if a frame_pose is available) ----
    xs, ys, zs, ts, ints = [], [], [], [], []
    for _topic, time_sec, data in read_messages(bag, LIDAR_TOPICS):
        p = parse_custom_msg_lidar(data, time_sec)
        if p["x"].size:
            xs.append(p["x"]); ys.append(p["y"]); zs.append(p["z"]); ts.append(p["t"]); ints.append(p["intensity"])
    if not xs:
        raise RuntimeError("No LiDAR points extracted from bag")

    x, y, z = np.concatenate(xs), np.concatenate(ys), np.concatenate(zs)
    t, intensity = np.concatenate(ts), np.concatenate(ints)

    if frame_pose:
        t_clip = np.clip(t, frame_pose.times[0], frame_pose.times[-1])
        x, y, z = apply_frame_pose_to_points(x, y, z, t_clip, frame_pose)

    decode_raw_out = ctx["intermediate"]["decode_raw"]
    Path(decode_raw_out).parent.mkdir(parents=True, exist_ok=True)
    intensity_scaled = np.minimum(65535, intensity * 655)
    write_las(decode_raw_out, point_format=6, x=x, y=y, z=z, gps_time=t, intensity=intensity_scaled)

    # ---- Camera frames (best-effort) ----
    try:
        cam_dir = scan_dir / "camera_frames"
        cam_dir.mkdir(parents=True, exist_ok=True)
        n_cam = 0
        for topic, time_sec, data in read_messages(bag, set(CAM_TOPICS)):
            jpeg = parse_compressed_image_ros1(data)
            if jpeg and len(jpeg) > 100:
                alias = CAM_TOPICS[topic]
                fname = cam_dir / f"{alias}_{round(time_sec * 1e9):019d}.jpg"
                fname.write_bytes(jpeg)
                n_cam += 1
        if n_cam > 0:
            cam_zip = scan_dir / "camera_frames.zip"
            if cam_zip.exists():
                cam_zip.unlink()
            with zipfile.ZipFile(cam_zip, "w") as zf:
                for f in cam_dir.iterdir():
                    zf.write(f, f.name)
            inputs_out.append({"kind": "camera_frames", "path": f"{scan_id}/camera_frames.zip", "size": cam_zip.stat().st_size})
    except Exception:
        pass  # best-effort, matches tasks.py's except-and-continue

    # ---- RTK trajectory (best-effort, for georeference) ----
    try:
        epochs = _extract_rtk_epochs(bag)
        if epochs:
            rtk_path = scan_dir / "intermediate" / "bag_rtk.pos"
            rtk_path.parent.mkdir(parents=True, exist_ok=True)
            _write_rtk_pos(rtk_path, epochs)
    except Exception:
        pass  # best-effort

    shutil.rmtree(extract_dir)

    return {
        "num_points": int(x.shape[0]),
        "source_format": "bag",
        "inputs": inputs_out,
        "assets": [{"type": "intermediate_laz", "path": f"{scan_id}/intermediate/decode_raw.las", "size": Path(decode_raw_out).stat().st_size}],
    }
