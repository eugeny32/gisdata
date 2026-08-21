"""
Port of slam/lib/framePose.mjs (itself a port of FramePose/read_frame_pose/
write_frame_pose/_interp_frame_pose/_apply_frame_pose_to_points from
slamcloude/worker/pipeline/s20.py) -- mechanical port, logic unchanged.

frame_pose.txt: "t x y z qx qy qz qw" per line, an interpolatable body-frame
trajectory (SLAM or vendor), used to transform LiDAR points from body-frame
into the world_slam frame.

Vectorized with numpy (np.interp matches the JS port's own hand-rolled
interp() exactly -- both clamp outside [xs[0], xs[-1]], which the .mjs
docstring calls out explicitly as matching numpy.interp's own behavior).
"""

import numpy as np


class FramePose:
    __slots__ = ("times", "tx", "ty", "tz", "qx", "qy", "qz", "qw")

    def __init__(self, times, tx, ty, tz, qx, qy, qz, qw):
        self.times, self.tx, self.ty, self.tz = times, tx, ty, tz
        self.qx, self.qy, self.qz, self.qw = qx, qy, qz, qw


def read_frame_pose(path) -> FramePose:
    cols = [[] for _ in range(8)]
    with open(path, "r", encoding="utf-8") as f:
        for raw_line in f:
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split()
            if len(parts) < 8:
                continue
            for i in range(8):
                cols[i].append(float(parts[i]))
    if not cols[0]:
        raise ValueError(f"frame_pose file is empty or unparseable: {path}")
    arrs = [np.asarray(c, dtype=np.float64) for c in cols]
    return FramePose(*arrs)


def write_frame_pose(fp: FramePose, path) -> None:
    with open(path, "w", encoding="utf-8") as f:
        for i in range(len(fp.times)):
            f.write(
                f"{fp.times[i]:.9f} {fp.tx[i]:.6f} {fp.ty[i]:.6f} {fp.tz[i]:.6f} "
                f"{fp.qx[i]:.9f} {fp.qy[i]:.9f} {fp.qz[i]:.9f} {fp.qw[i]:.9f}\n"
            )


def interp_frame_pose(fp: FramePose, times):
    """Vectorised interpolation returning (tx,ty,tz,qx,qy,qz,qw) at `times`."""
    # Continuous-sign quaternion (q and -q represent the same rotation;
    # flip sign between consecutive samples so interpolation doesn't take
    # the "long way around") -- same fix-up as s20.py.
    qx, qy, qz, qw = fp.qx.copy(), fp.qy.copy(), fp.qz.copy(), fp.qw.copy()
    dot = qx[1:] * qx[:-1] + qy[1:] * qy[:-1] + qz[1:] * qz[:-1] + qw[1:] * qw[:-1]
    flip = np.cumprod(np.where(dot < 0, -1.0, 1.0))
    qx[1:] *= flip
    qy[1:] *= flip
    qz[1:] *= flip
    qw[1:] *= flip

    times = np.asarray(times, dtype=np.float64)
    return (
        np.interp(times, fp.times, fp.tx),
        np.interp(times, fp.times, fp.ty),
        np.interp(times, fp.times, fp.tz),
        np.interp(times, fp.times, qx),
        np.interp(times, fp.times, qy),
        np.interp(times, fp.times, qz),
        np.interp(times, fp.times, qw),
    )


def apply_frame_pose_to_points(x, y, z, times, fp: FramePose):
    """Transform points from body frame to world_slam frame using frame_pose."""
    itx, ity, itz, iqx, iqy, iqz, iqw = interp_frame_pose(fp, times)
    x = np.asarray(x, dtype=np.float64)
    y = np.asarray(y, dtype=np.float64)
    z = np.asarray(z, dtype=np.float64)

    norm = np.sqrt(iqx * iqx + iqy * iqy + iqz * iqz + iqw * iqw)
    norm = np.where(norm < 1e-9, 1.0, norm)
    qx, qy, qz, qw = iqx / norm, iqy / norm, iqz / norm, iqw / norm

    x2, y2, z2 = qx * qx, qy * qy, qz * qz
    wx, wy, wz = qw * qx, qw * qy, qw * qz
    xy, xz, yz = qx * qy, qx * qz, qy * qz

    wx_body = x * (1 - 2 * (y2 + z2)) + y * 2 * (xy - wz) + z * 2 * (xz + wy)
    wy_body = x * 2 * (xy + wz) + y * (1 - 2 * (x2 + z2)) + z * 2 * (yz - wx)
    wz_body = x * 2 * (xz - wy) + y * 2 * (yz + wx) + z * (1 - 2 * (x2 + y2))

    return wx_body + itx, wy_body + ity, wz_body + itz
