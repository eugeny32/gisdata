// Перенос FramePose/read_frame_pose/write_frame_pose/_interp_frame_pose/
// _apply_frame_pose_to_points из slamcloude/worker/pipeline/s20.py (строки
// 71-155) — механический порт, логика не менялась.
//
// frame_pose.txt: "t x y z qx qy qz qw" построчно, интерполируемая
// body-frame траектория (SLAM или вендорская), используется для перевода
// точек LiDAR из body-frame в world_slam-frame.

import { readFileSync, writeFileSync } from "node:fs";

/**
 * @typedef {Object} FramePose
 * @property {Float64Array} times
 * @property {Float64Array} tx
 * @property {Float64Array} ty
 * @property {Float64Array} tz
 * @property {Float64Array} qx
 * @property {Float64Array} qy
 * @property {Float64Array} qz
 * @property {Float64Array} qw
 */

/** @returns {FramePose} */
export function readFramePose(path) {
  const text = readFileSync(path, "utf8");
  const cols = [[], [], [], [], [], [], [], []];
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 8) continue;
    for (let i = 0; i < 8; i++) cols[i].push(parseFloat(parts[i]));
  }
  if (cols[0].length === 0) {
    throw new Error(`frame_pose file is empty or unparseable: ${path}`);
  }
  const [times, tx, ty, tz, qx, qy, qz, qw] = cols.map((c) => Float64Array.from(c));
  return { times, tx, ty, tz, qx, qy, qz, qw };
}

/** @param {FramePose} fp */
export function writeFramePose(fp, path) {
  const lines = [];
  for (let i = 0; i < fp.times.length; i++) {
    lines.push(
      `${fp.times[i].toFixed(9)} ${fp.tx[i].toFixed(6)} ${fp.ty[i].toFixed(6)} ${fp.tz[i].toFixed(6)} ` +
        `${fp.qx[i].toFixed(9)} ${fp.qy[i].toFixed(9)} ${fp.qz[i].toFixed(9)} ${fp.qw[i].toFixed(9)}`
    );
  }
  writeFileSync(path, lines.join("\n") + "\n", "utf8");
}

/** Linear interpolation matching numpy.interp: clamps outside [xs[0], xs[-1]]. */
function interp(xs, ys, x) {
  const n = xs.length;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];
  // Binary search for the segment (xs assumed sorted ascending, same
  // assumption numpy.interp makes).
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] <= x) lo = mid; else hi = mid;
  }
  const t = (x - xs[lo]) / (xs[hi] - xs[lo]);
  return ys[lo] + t * (ys[hi] - ys[lo]);
}

/**
 * Vectorised interpolation returning {tx,ty,tz,qx,qy,qz,qw} at `times`.
 * @param {FramePose} fp
 * @param {Float64Array} times
 */
export function interpFramePose(fp, times) {
  // Continuous-sign quaternion (q and -q represent the same rotation;
  // flipping sign between consecutive samples so interp/slerp-by-lerp
  // doesn't take the "long way around") — same fix-up as s20.py.
  const n = fp.times.length;
  const qx = Float64Array.from(fp.qx);
  const qy = Float64Array.from(fp.qy);
  const qz = Float64Array.from(fp.qz);
  const qw = Float64Array.from(fp.qw);
  for (let i = 1; i < n; i++) {
    const dot = qx[i] * qx[i - 1] + qy[i] * qy[i - 1] + qz[i] * qz[i - 1] + qw[i] * qw[i - 1];
    if (dot < 0) {
      qx[i] = -qx[i]; qy[i] = -qy[i]; qz[i] = -qz[i]; qw[i] = -qw[i];
    }
  }

  const m = times.length;
  const out = {
    tx: new Float64Array(m), ty: new Float64Array(m), tz: new Float64Array(m),
    qx: new Float64Array(m), qy: new Float64Array(m), qz: new Float64Array(m), qw: new Float64Array(m),
  };
  for (let i = 0; i < m; i++) {
    const t = times[i];
    out.tx[i] = interp(fp.times, fp.tx, t);
    out.ty[i] = interp(fp.times, fp.ty, t);
    out.tz[i] = interp(fp.times, fp.tz, t);
    out.qx[i] = interp(fp.times, qx, t);
    out.qy[i] = interp(fp.times, qy, t);
    out.qz[i] = interp(fp.times, qz, t);
    out.qw[i] = interp(fp.times, qw, t);
  }
  return out;
}

/**
 * Transform points from body frame to world_slam frame using frame_pose.
 * @param {Float64Array} x
 * @param {Float64Array} y
 * @param {Float64Array} z
 * @param {Float64Array} times
 * @param {FramePose} fp
 * @returns {[Float64Array, Float64Array, Float64Array]}
 */
export function applyFramePoseToPoints(x, y, z, times, fp) {
  const { tx: itx, ty: ity, tz: itz, qx: iqx0, qy: iqy0, qz: iqz0, qw: iqw0 } = interpFramePose(fp, times);
  const n = x.length;
  const outX = new Float64Array(n);
  const outY = new Float64Array(n);
  const outZ = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let qx = iqx0[i], qy = iqy0[i], qz = iqz0[i], qw = iqw0[i];
    let norm = Math.sqrt(qx * qx + qy * qy + qz * qz + qw * qw);
    if (norm < 1e-9) norm = 1.0;
    qx /= norm; qy /= norm; qz /= norm; qw /= norm;

    const x2 = qx * qx, y2 = qy * qy, z2 = qz * qz;
    const wx = qw * qx, wy = qw * qy, wz = qw * qz;
    const xy = qx * qy, xz = qx * qz, yz = qy * qz;

    const px = x[i], py = y[i], pz = z[i];
    const wxBody = px * (1 - 2 * (y2 + z2)) + py * 2 * (xy - wz) + pz * 2 * (xz + wy);
    const wyBody = px * 2 * (xy + wz) + py * (1 - 2 * (x2 + z2)) + pz * 2 * (yz - wx);
    const wzBody = px * 2 * (xz - wy) + py * 2 * (yz + wx) + pz * (1 - 2 * (x2 + y2));

    outX[i] = wxBody + itx[i];
    outY[i] = wyBody + ity[i];
    outZ[i] = wzBody + itz[i];
  }
  return [outX, outY, outZ];
}
