"""
Mechanical port of the raw struct parsers in slam/lib/msgParsers.mjs
(itself ported from slamcloude/worker/pipeline/s20.py, lines 612-707,
909-947) -- offsets and invariant comments (envelope-time instead of
timebase, etc.) preserved unchanged, only Buffer.read*LE -> struct.unpack.

livox_ros_driver2/msg/CustomMsg is a vendor-custom ROS1 message type with
no standard definition `rosbags` can decode out of the box, so it (and the
other message types here, kept alongside it for one consistent decode
path) is still hand-parsed at the byte level rather than routed through
rosbags' typestore.
"""

import struct

import numpy as np

_CUSTOM_POINT_SIZE = 4 + 4 + 4 + 4 + 1 + 1 + 1  # offset_time,x,y,z,reflectivity,tag,line (packed, no padding)
_CUSTOM_POINT_DTYPE = np.dtype([
    ("offset_time", "<u4"), ("x", "<f4"), ("y", "<f4"), ("z", "<f4"),
    ("reflectivity", "u1"), ("tag", "u1"), ("line", "u1"),
])
assert _CUSTOM_POINT_DTYPE.itemsize == _CUSTOM_POINT_SIZE


def _header_end(raw: bytes) -> int:
    # uint32 seq + uint32 stamp.sec + uint32 stamp.nsec + (uint32 len + bytes) frame_id
    off = 12
    (fid_len,) = struct.unpack_from("<I", raw, off)
    return off + 4 + fid_len


def parse_custom_msg_lidar(raw: bytes, msg_time_sec: float):
    """
    Parse livox_ros_driver2/msg/CustomMsg (ROS1 wire format).

    msg_time_sec is the bag's own envelope timestamp for this message, used
    as the point-time base instead of the message's embedded `timebase`
    field: on real S20 recordings `timebase` runs on the Livox unit's own
    free-running/unsynced internal clock and can be off from the true
    recording time by a large, effectively constant offset (observed: ~1.5
    years) -- while every other topic (RTK, camera, on-device SLAM's own
    frame_pose.txt) is timestamped against the bag's envelope clock.

    Returns dict of numpy float64 arrays: x, y, z, t, intensity.
    """
    empty = {k: np.empty(0, dtype=np.float64) for k in ("x", "y", "z", "t", "intensity")}
    try:
        off = _header_end(raw)
        off += 8  # timebase -- unreliable, ignored (see docstring above)
        off += 4  # point_num (redundant with array length below)
        off += 4  # lidar_id (1) + rsvd (3)
        (arr_len,) = struct.unpack_from("<I", raw, off)
        off += 4

        need = off + arr_len * _CUSTOM_POINT_SIZE
        if arr_len == 0 or need > len(raw):
            return empty
        pts = np.frombuffer(raw, dtype=_CUSTOM_POINT_DTYPE, count=arr_len, offset=off)

        px = pts["x"].astype(np.float64)
        py = pts["y"].astype(np.float64)
        pz = pts["z"].astype(np.float64)
        # Livox emits a body-frame-origin sentinel point for every "no
        # return" sample within a scan -- on real data these are the vast
        # majority of points in some batches and, left in, create a massive
        # coincident cluster that makes downstream outlier removal
        # pathologically slow.
        range_sq = px * px + py * py + pz * pz
        finite = np.isfinite(px) & np.isfinite(py) & np.isfinite(pz)
        keep = finite & (range_sq > 1e-4)

        t = msg_time_sec + pts["offset_time"].astype(np.float64) / 1e9
        return {
            "x": px[keep], "y": py[keep], "z": pz[keep],
            "t": t[keep], "intensity": pts["reflectivity"].astype(np.float64)[keep],
        }
    except (struct.error, IndexError, ValueError):
        return empty


def parse_compressed_image_ros1(raw: bytes) -> bytes | None:
    """Parse sensor_msgs/msg/CompressedImage (ROS1 wire format). Returns a
    JPEG byte string or None."""
    try:
        off = _header_end(raw)
        (fmt_len,) = struct.unpack_from("<I", raw, off)
        off += 4 + fmt_len
        (data_len,) = struct.unpack_from("<I", raw, off)
        off += 4
        return raw[off:off + data_len]
    except (struct.error, IndexError):
        return None


def parse_nav_sat_fix_ros1(raw: bytes) -> dict | None:
    """Parse sensor_msgs/msg/NavSatFix (ROS1 wire format). Altitude is
    always 0.0 on this device (RTK agent computes no NTRIP-derived height
    here). Returns {status, lat, lon, alt} or None."""
    try:
        off = _header_end(raw)
        (status,) = struct.unpack_from("<b", raw, off)
        off += 3  # int8 status + uint16 service, no padding
        lat, lon, alt = struct.unpack_from("<3d", raw, off)
        if -90 <= lat <= 90 and -180 <= lon <= 180:
            return {"status": status, "lat": lat, "lon": lon, "alt": alt}
    except (struct.error, IndexError):
        pass
    return None


def parse_imu_ros1(raw: bytes) -> dict | None:
    """
    Read raw gyroscope (angular_velocity) + accelerometer
    (linear_acceleration) samples from sensor_msgs/msg/Imu (ROS1 tightly-
    packed wire format): Header, then orientation (4x float64) +
    orientation_covariance (9x float64) before angular_velocity (3x
    float64, rad/s) + angular_velocity_covariance (9x float64) before
    linear_acceleration (3x float64, m/s^2) -- offsets fixed regardless of
    header content since only frame_id has variable length, and
    _header_end already accounts for that.
    """
    try:
        off = _header_end(raw)
        off += 4 * 8  # orientation (x,y,z,w)
        off += 9 * 8  # orientation_covariance
        gx, gy, gz = struct.unpack_from("<3d", raw, off)
        off += 3 * 8
        off += 9 * 8  # angular_velocity_covariance
        ax, ay, az = struct.unpack_from("<3d", raw, off)
        return {"angular_velocity": (gx, gy, gz), "linear_acceleration": (ax, ay, az)}
    except (struct.error, IndexError):
        return None
