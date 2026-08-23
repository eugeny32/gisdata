"""
Port of colorize_laz (s20.py:1705-1893) + _load_calibration_camera
(1637-1702). The real call site in tasks.py (colorize.py:570:
`s20.colorize_laz(local_in, cam_zip, frame_pose, local_out, cal_path)`)
NEVER passes transform_path -- that branch (inverting the georeference
transform for an already-UTM cloud) is dead code in the real pipeline,
because colorize always runs BEFORE georeference (see georeference.py) --
deliberately not ported.

IMPORTANT (carried over as-is, not "fixed"): despite the calibration key
`fisheye_middle`, the real projection in the source is plain pinhole
(fx,fy,cx,cy), WITHOUT distortion compensation. That's the original's
behaviour, not a porting bug.
"""

import re
import shutil
import zipfile
from pathlib import Path

import numpy as np
import yaml
from PIL import Image

from ..frame_pose import read_frame_pose
from ..las_io import read_las, write_las


def _load_calibration_camera(cal_path):
    if not cal_path or not Path(cal_path).is_file():
        return None
    try:
        text = Path(cal_path).read_text(encoding="utf-8")
        text = re.sub(r"^%YAML:[\d.]+\s*\n", "", text)
        text = text.replace("!!opencv-matrix", "")
        d = yaml.safe_load(text)
        if not d:
            return None
        intrinsic = d.get("intrinsic", d)
        cam = None
        for key in ("fisheye_middle", "usb_cam", "nav_cam", "camera", "cam0"):
            if intrinsic.get(key):
                cam = intrinsic[key]
                break
        if not cam and intrinsic.get("camera_matrix"):
            cam = intrinsic
        if not cam:
            return None
        k_raw = cam.get("camera_matrix") or cam.get("K")
        if not k_raw:
            return None
        if isinstance(k_raw, dict) and "data" in k_raw:
            k_data = k_raw["data"]
        elif isinstance(k_raw, list) and k_raw and isinstance(k_raw[0], list):
            k_data = [v for row in k_raw for v in row]
        else:
            k_data = k_raw
        if len(k_data) < 9:
            return None
        fx, fy, cx, cy = k_data[0], k_data[4], k_data[2], k_data[5]

        r_cam_in_body = np.eye(3)
        t_cam_in_body = np.zeros(3)
        ext_raw = (d.get("extrinsic") or {}).get("lidar_middlecamera")
        if ext_raw:
            ext_data = ext_raw["data"] if isinstance(ext_raw, dict) and "data" in ext_raw else ext_raw
            if len(ext_data) >= 16:
                # lidar_middlecamera maps LiDAR/body-frame -> camera frame;
                # invert to get camera pose in body frame (see
                # s20.py _load_calibration_camera).
                m = ext_data
                r_lc = np.array([[m[0], m[1], m[2]], [m[4], m[5], m[6]], [m[8], m[9], m[10]]])
                t_lc = np.array([m[3], m[7], m[11]])
                r_cam_in_body = r_lc.T
                t_cam_in_body = -r_cam_in_body @ t_lc
        return {"fx": fx, "fy": fy, "cx": cx, "cy": cy, "r_cam_in_body": r_cam_in_body, "t_cam_in_body": t_cam_in_body}
    except (OSError, yaml.YAMLError, KeyError, IndexError, TypeError):
        return None


def _quat_to_matrix(qx, qy, qz, qw):
    return np.array([
        [1 - 2 * (qy * qy + qz * qz), 2 * (qx * qy - qw * qz), 2 * (qx * qz + qw * qy)],
        [2 * (qx * qy + qw * qz), 1 - 2 * (qx * qx + qz * qz), 2 * (qy * qz - qw * qx)],
        [2 * (qx * qz - qw * qy), 2 * (qy * qz + qw * qx), 1 - 2 * (qx * qx + qy * qy)],
    ])


def run(ctx: dict) -> dict:
    scan_id = ctx["scan_id"]
    scan_dir = Path(ctx["scan_dir"])
    input_path = ctx["intermediate"]["filter_outliers"]
    output_path = ctx["intermediate"]["colorize"]
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)

    inputs = {i["kind"]: i["path"] for i in (ctx.get("inputs") or [])}
    if "camera_frames" not in inputs:
        shutil.copyfile(input_path, output_path)
        return {"assets": [{"type": "intermediate_laz", "path": f"{scan_id}/intermediate/colorize.las", "size": Path(output_path).stat().st_size}]}

    cal = _load_calibration_camera(inputs.get("calibration"))
    if cal:
        fx, fy, cx, cy = cal["fx"], cal["fy"], cal["cx"], cal["cy"]
        r_cam_in_body, t_cam_in_body = cal["r_cam_in_body"], cal["t_cam_in_body"]
    else:
        fx, fy, cx, cy = 500, 500, 320, 240
        r_cam_in_body, t_cam_in_body = np.eye(3), np.zeros(3)
    r_body_in_cam = r_cam_in_body.T

    cam_extract_dir = scan_dir / "_camera_extract"
    if cam_extract_dir.exists():
        shutil.rmtree(cam_extract_dir)
    with zipfile.ZipFile(inputs["camera_frames"]) as zf:
        zf.extractall(cam_extract_dir)

    nav_names = sorted(p.name for p in cam_extract_dir.iterdir() if p.name.startswith("nav_") and p.name.endswith(".jpg"))
    if not nav_names:
        nav_names = sorted(p.name for p in cam_extract_dir.iterdir() if p.name.startswith("left_") and p.name.endswith(".jpg"))
    if not nav_names:
        shutil.copyfile(input_path, output_path)
        shutil.rmtree(cam_extract_dir)
        return {"assets": [{"type": "intermediate_laz", "path": f"{scan_id}/intermediate/colorize.las", "size": Path(output_path).stat().st_size}]}
    nav_ts = np.array([int(n.split("_")[1].split(".")[0]) / 1e9 for n in nav_names])

    frame_pose = read_frame_pose(inputs["frame_pose"])
    # Continuous-sign quaternion (same fix-up as frame_pose.py's interp_frame_pose).
    qx, qy, qz, qw = frame_pose.qx.copy(), frame_pose.qy.copy(), frame_pose.qz.copy(), frame_pose.qw.copy()
    dot = qx[1:] * qx[:-1] + qy[1:] * qy[:-1] + qz[1:] * qz[:-1] + qw[1:] * qw[:-1]
    flip = np.cumprod(np.where(dot < 0, -1.0, 1.0))
    qx[1:] *= flip
    qy[1:] *= flip
    qz[1:] *= flip
    qw[1:] *= flip
    t_min, t_max = frame_pose.times[0], frame_pose.times[-1]

    las = read_las(input_path)
    n = las.count
    has_gps_time = las.gps_time is not None and np.any(las.gps_time != 0)
    if has_gps_time:
        pt_ts = np.clip(las.gps_time, t_min, t_max)
    else:
        pt_ts = t_min + (t_max - t_min) * np.arange(n) / max(n - 1, 1)

    # Bucket point indices by nearest camera frame (np.searchsorted +
    # "closer neighbour" pick, mirrors nearestFrameIndex in the .mjs port).
    ni = np.searchsorted(nav_ts, pt_ts)
    ni = np.clip(ni, 0, len(nav_ts) - 1)
    li = np.clip(ni - 1, 0, None)
    closer_to_li = np.abs(pt_ts - nav_ts[li]) < np.abs(pt_ts - nav_ts[ni])
    frame_idx = np.where(closer_to_li, li, ni)

    red = np.zeros(n, dtype=np.uint8)
    green = np.zeros(n, dtype=np.uint8)
    blue = np.zeros(n, dtype=np.uint8)

    for fi in np.unique(frame_idx):
        idxs = np.nonzero(frame_idx == fi)[0]
        try:
            img = Image.open(cam_extract_dir / nav_names[fi]).convert("RGB")
        except (OSError, ValueError):
            continue
        img_arr = np.asarray(img)
        h, w = img_arr.shape[0], img_arr.shape[1]

        tf = min(max(nav_ts[fi], t_min), t_max)
        itx = np.interp(tf, frame_pose.times, frame_pose.tx)
        ity = np.interp(tf, frame_pose.times, frame_pose.ty)
        itz = np.interp(tf, frame_pose.times, frame_pose.tz)
        iqx = np.interp(tf, frame_pose.times, qx)
        iqy = np.interp(tf, frame_pose.times, qy)
        iqz = np.interp(tf, frame_pose.times, qz)
        iqw = np.interp(tf, frame_pose.times, qw)
        nr = np.hypot(np.hypot(iqx, iqy), np.hypot(iqz, iqw))
        if nr < 1e-9:
            continue
        iqx, iqy, iqz, iqw = iqx / nr, iqy / nr, iqz / nr, iqw / nr
        r_bw = _quat_to_matrix(iqx, iqy, iqz, iqw)
        r_wb = r_bw.T

        pw = np.stack([las.x[idxs] - itx, las.y[idxs] - ity, las.z[idxs] - itz], axis=1)
        p_body = pw @ r_wb.T
        p_cam = (p_body - t_cam_in_body) @ r_body_in_cam.T

        valid = p_cam[:, 2] > 0.1
        u = np.round((fx * p_cam[:, 0]) / np.where(valid, p_cam[:, 2], 1) + cx).astype(np.int64)
        v = np.round((fy * p_cam[:, 1]) / np.where(valid, p_cam[:, 2], 1) + cy).astype(np.int64)
        in_bounds = valid & (u >= 0) & (u < w) & (v >= 0) & (v < h)

        sel = idxs[in_bounds]
        su, sv = u[in_bounds], v[in_bounds]
        red[sel] = img_arr[sv, su, 0]
        green[sel] = img_arr[sv, su, 1]
        blue[sel] = img_arr[sv, su, 2]

    write_las(
        output_path, point_format=7, x=las.x, y=las.y, z=las.z,
        gps_time=las.gps_time, intensity=las.intensity, red=red, green=green, blue=blue,
    )
    shutil.rmtree(cam_extract_dir)

    return {"assets": [{"type": "intermediate_laz", "path": f"{scan_id}/intermediate/colorize.las", "size": Path(output_path).stat().st_size}]}

