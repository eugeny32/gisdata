"""
COMPUTE_SLAM -- replaces the old stub. Prepares input for the native
voxelslam_native binary (see slam/native/, built on the server from
hku-mars/Voxel-SLAM without ROS1/Docker) and runs it as an external
process -- the same pattern already used for pdal/untwine
(build_octree.py).

Two files need preparing for the binary:
 - An intermediate binary file standing in for rosbag::View (see
   slam/native/compat/intermediate_format.hpp) -- LiDAR(CustomMsg)+IMU
   records from the bag file, sorted by envelope time.
 - A flat "key=value" text config (read via ParamReader, see
   slam/native/compat/param_reader.hpp) -- paths + algorithm parameters.
   NOT YAML: yaml-cpp (mingw-w64 0.9.0 on the old server) turned out to be
   broken (deterministically loses data on repeated YAML::Node traversal,
   see param_reader.hpp's docstring) -- config is trivial (2 levels of
   nesting, scalars and flat numeric lists), so instead of
   debugging/rebuilding yaml-cpp the dependency was dropped entirely. Kept
   on the new Linux build too, since it's the same trivial config either
   way.

Result of the binary -- alidarState.txt (text format "t x y z qx qy qz qw
...", see slam/native/src/voxelslam.hpp::read_lidarstate) -- BYTE-FOR-BYTE
the same format as frame_pose.txt (frame_pose.py), so it's simply
registered as ScanInputKind 'frame_pose' -- decode_raw.py already knows how
to pick it up instead of the vendor's frame_pose.txt from the ZIP (see
decode_raw.py's docstring), with no changes needed in downstream steps.

Best-effort, like the other optional enrichments in decode_raw.py: if the
bag is missing or the binary fails, this step just doesn't register a
frame_pose input -- downstream falls back to the vendor frame_pose.txt
(same degradation path the old stub already had).
"""

import re
import shutil
import struct
import subprocess
import zipfile
from pathlib import Path

import yaml
from django.conf import settings

from ..native_config import write_native_config_string
from ..ros1_bag import read_messages
from ..msg_parsers import parse_imu_ros1

LIDAR_TOPICS = {"/livox/lidar", "/livox/lidar_node", "/points", "/livox/points"}
# Not empirically confirmed (no real S20 bag on hand, see plan) -- the same
# defensive list-of-alternate-names approach already used for
# LIDAR_TOPICS/CAM_TOPICS/FIX_TOPICS in decode_raw.py. "/livox/imu" is
# Voxel-SLAM's own default (General/imu_topic, see voxelslam.cpp), the rest
# are common alternates.
IMU_TOPICS = {"/livox/imu", "/imu", "/imu/data", "/livox/imu_node"}

REC_IMU = 1
REC_LIDAR = 2
_CUSTOM_POINT_SIZE = 4 + 4 + 4 + 4 + 1 + 1 + 1  # offset_time,x,y,z,reflectivity,tag,line -- see intermediate_format.hpp


def _header_end(raw: bytes) -> int:
    off = 12
    (fid_len,) = struct.unpack_from("<I", raw, off)
    return off + 4 + fid_len


def _find_bag_and_calibration(extract_dir: Path):
    files = [p for p in extract_dir.rglob("*") if p.is_file() and "__MACOSX" not in p.parts]
    bags = sorted((f for f in files if f.suffix.lower() == ".bag"), key=lambda f: f.stat().st_size, reverse=True)
    bag = bags[0] if bags else None
    calibration = next((f for f in files if f.name.lower().endswith("calibration.yaml")), None)
    return bag, calibration


def _raw_custom_msg_points(raw: bytes):
    """
    Finds the offset and point count in the raw body of a
    livox_ros_driver/CustomMsg (ROS1 wire format), WITHOUT decoding
    individual points -- the byte layout (offset_time u32 + x/y/z f32 +
    reflectivity/tag/line u8, packed) already MATCHES CustomPoint from
    intermediate_format.hpp, so the needed bytes can just be copied as-is
    into the intermediate file.

    Deliberately does NOT reuse msg_parsers.parse_custom_msg_lidar -- that
    function already filters sentinel points (range<=1e-4) and rescales
    intensity for LAS output in decode_raw.py. The native code
    (feature_point.hpp livox_handler) does its own equivalent filtering
    (General/blind) and decimation (point_filter_num) over the RAW fields
    itself -- pre-filtering here would be redundant and risk diverging from
    the original ROS pipeline's semantics.
    """
    try:
        off = _header_end(raw)
        off += 8  # timebase (unused, see msg_parsers.py)
        off += 4  # point_num (redundant, array length below)
        off += 4  # lidar_id(1) + rsvd(3)
        (n,) = struct.unpack_from("<I", raw, off)
        off += 4
        need = off + n * _CUSTOM_POINT_SIZE
        if n == 0 or need > len(raw):
            return None
        return n, raw[off:need]
    except (struct.error, IndexError):
        return None


def _write_imu_record(f, time_sec, av, la):
    f.write(struct.pack("<Bd", REC_IMU, time_sec))
    f.write(struct.pack("<3d", *av))
    f.write(struct.pack("<3d", *la))


def _write_lidar_record(f, time_sec, count, point_bytes):
    f.write(struct.pack("<BdI", REC_LIDAR, time_sec, count))
    f.write(point_bytes)


def _write_intermediate_file(bag_path, out_path) -> int:
    """
    Writes the intermediate file (see intermediate_format.hpp), strictly
    ordered by envelope time. IMU samples are small (a few MB for a whole
    scan) -- read once and buffered entirely in memory. LiDAR points
    (potentially gigabytes for a long recording) are NEVER buffered -- read
    and written straight to the output file. Both streams (IMU-only,
    LiDAR-only) are each guaranteed monotonic in time on their own (a ROS
    topic is published strictly forward in time by one source) -- merging
    them like classic merge-sort gives a strictly globally-ordered result
    without fully buffering LiDAR, unlike "accumulate everything -> sort".

    Returns the total number of LiDAR messages written (0 => bag has no data).
    """
    imu = []
    for _topic, time_sec, data in read_messages(bag_path, IMU_TOPICS):
        parsed = parse_imu_ros1(data)
        if parsed:
            imu.append((time_sec, parsed["angular_velocity"], parsed["linear_acceleration"]))
    imu_idx = 0

    lidar_count = 0
    with open(out_path, "wb") as f:
        for _topic, time_sec, data in read_messages(bag_path, LIDAR_TOPICS):
            pts = _raw_custom_msg_points(data)
            if not pts:
                continue
            count, point_bytes = pts
            while imu_idx < len(imu) and imu[imu_idx][0] <= time_sec:
                _write_imu_record(f, *imu[imu_idx])
                imu_idx += 1
            _write_lidar_record(f, time_sec, count, point_bytes)
            lidar_count += 1
        while imu_idx < len(imu):
            _write_imu_record(f, *imu[imu_idx])
            imu_idx += 1
    return lidar_count


def _load_lidar_imu_extrinsic(calibration_path):
    """
    LiDAR->IMU extrinsic (General/extrinsic_tran/extrinsic_rota) -- MUST be
    non-empty 3/9-element vectors: the VOXEL_SLAM constructor
    (voxelslam.cpp:794-797) indexes vecT[0..2]/vecR[0..8] without a size
    check -- a missing key defaulting to an empty vector would be UB
    (out-of-bounds). Identity is only the fallback default if the file
    doesn't exist at all.

    FIXED (carried over from the .mjs port): the real calibration.yaml
    (verified on scan 1, "Shosseynaya 39A") stores the extrinsic as TWO
    SEPARATE top-level keys -- LIDAR_IMU_T (flat 3-vector) + LIDAR_IMU_R
    (3x3 opencv-matrix), NOT under extrinsic.lidar_imu (only cameras live
    there). The old code only looked for the second, nonexistent-for-this-
    file path and silently substituted an identity TRANSLATION -- the real
    [-0.011, -0.0233, 0.0441] m offset was silently lost. The
    calibration.yaml for scan e6b4bbe7 (see plan) is the only file
    previously seen where the extrinsic really did live under
    extrinsic.lidar_imu as a 4x4 -- kept as a fallback path in case another
    file uses that format.
    """
    identity = {"tran": [0, 0, 0], "rota": [1, 0, 0, 0, 1, 0, 0, 0, 1]}
    if not calibration_path or not Path(calibration_path).is_file():
        return identity
    try:
        text = Path(calibration_path).read_text(encoding="utf-8")
        text = re.sub(r"^%YAML:[\d.]+\s*\n", "", text)
        text = text.replace("!!opencv-matrix", "")
        d = yaml.safe_load(text) or {}

        t_raw = d.get("LIDAR_IMU_T")
        r_raw = d.get("LIDAR_IMU_R")
        if isinstance(t_raw, list) and len(t_raw) >= 3 and r_raw:
            r_mat = r_raw["data"] if isinstance(r_raw, dict) and "data" in r_raw else r_raw
            if isinstance(r_mat, list) and len(r_mat) >= 9:
                return {"tran": t_raw[:3], "rota": r_mat[:9]}

        ext_raw = (d.get("extrinsic") or {}).get("lidar_imu") or (d.get("extrinsic") or {}).get("imu_lidar")
        if ext_raw:
            data = ext_raw["data"] if isinstance(ext_raw, dict) and "data" in ext_raw else ext_raw
            if isinstance(data, list) and len(data) >= 16:
                # 4x4 row-major (same OpenCV-matrix convention as
                # lidar_middlecamera in colorize.py) -- top-left 3x3 =
                # rotation, right column = translation.
                rota = [data[0], data[1], data[2], data[4], data[5], data[6], data[8], data[9], data[10]]
                tran = [data[3], data[7], data[11]]
                return {"tran": tran, "rota": rota}
        return identity
    except (OSError, yaml.YAMLError, KeyError, IndexError, TypeError):
        return identity


def run(ctx: dict) -> dict:
    if not ctx.get("bag_lidar_enabled"):
        return {}
    raw_file_path = ctx.get("raw_file_path")
    if not raw_file_path or not Path(raw_file_path).is_file():
        return {}

    scan_id = ctx["scan_id"]
    scan_dir = Path(ctx["scan_dir"])
    extract_dir = scan_dir / "_extract_slam"
    scan_dir.mkdir(parents=True, exist_ok=True)
    if extract_dir.exists():
        shutil.rmtree(extract_dir)

    try:
        with zipfile.ZipFile(raw_file_path) as zf:
            zf.extractall(extract_dir)
        bag, calibration = _find_bag_and_calibration(extract_dir)
        if not bag:
            return {}

        intermediate_dir = scan_dir / "intermediate"
        intermediate_dir.mkdir(parents=True, exist_ok=True)
        intermediate_path = intermediate_dir / "compute_slam.bin"
        lidar_count = _write_intermediate_file(bag, intermediate_path)
        if lidar_count == 0:
            intermediate_path.unlink(missing_ok=True)
            return {}

        out_dir = scan_dir / "slam_out"
        if out_dir.exists():
            shutil.rmtree(out_dir)
        extrinsic = _load_lidar_imu_extrinsic(calibration)

        config = {
            "intermediate_path": str(intermediate_path),
            "General": {
                "save_path": f"{scan_dir}/",
                "bagname": "slam_out",
                "is_save_map": 0,
                "lidar_type": 0,
                "blind": 0.1,
                "point_filter_num": 3,
                "extrinsic_tran": extrinsic["tran"],
                "extrinsic_rota": extrinsic["rota"],
            },
            "Loop": {"enable": 1},
        }
        config_path = scan_dir / "voxelslam_config.txt"
        config_path.write_text(write_native_config_string(config), encoding="utf-8")

        if not Path(settings.VOXELSLAM_EXE).is_file():
            print(f"voxelslam_native binary not found at {settings.VOXELSLAM_EXE}; scan continues without a SLAM trajectory.")
            return {}

        try:
            result = subprocess.run(
                [settings.VOXELSLAM_EXE, str(config_path)], cwd=scan_dir,
                timeout=2 * 60 * 60,  # 2 hours -- same order of magnitude as STALL_MINUTES in process_slam_jobs.py
                capture_output=True, text=True,
            )
        except subprocess.TimeoutExpired:
            print("voxelslam_native timed out; scan continues without a SLAM trajectory.")
            return {}

        alidar_state_path = out_dir / "alidarState.txt"
        if result.returncode != 0 or not alidar_state_path.is_file():
            # returncode==0 without alidarState.txt is not a crash:
            # voxelslam_native (the vendor algorithm itself, not our port)
            # calls exit(0) directly in several places when there isn't
            # enough data for bundle adjustment (e.g. "Too Less Voxel" in
            # voxel_map.hpp) -- short/sparse scans. Both cases (a real
            # crash OR a vendor early-exit) behave the same: best-effort
            # degradation to the vendor frame_pose.txt, if there is one.
            print(
                f"voxelslam_native did not produce a SLAM trajectory (exit code={result.returncode}); "
                "scan continues without it (vendor frame_pose.txt, if present).\n"
                f"stdout: {(result.stdout or '')[-4000:]}\nstderr: {(result.stderr or '')[-4000:]}"
            )
            return {}

        inputs_dir = scan_dir / "inputs"
        inputs_dir.mkdir(parents=True, exist_ok=True)
        frame_pose_path = inputs_dir / "frame_pose.txt"
        shutil.copyfile(alidar_state_path, frame_pose_path)

        return {"inputs": [{"kind": "frame_pose", "path": f"{scan_id}/inputs/frame_pose.txt", "size": frame_pose_path.stat().st_size}]}
    finally:
        if extract_dir.exists():
            shutil.rmtree(extract_dir)

