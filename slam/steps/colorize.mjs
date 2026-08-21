// Порт colorize_laz (s20.py:1705-1893) + _load_calibration_camera
// (1637-1702). Реальный вызов в tasks.py (colorize.py:570:
// `s20.colorize_laz(local_in, cam_zip, frame_pose, local_out, cal_path)`)
// НИКОГДА не передаёт transform_path — та ветка (инверсия georeference-
// трансформа для уже-UTM облака) в реальном пайплайне мертвый код, потому
// что colorize всегда выполняется ДО georeference (см. georeference.mjs) —
// сознательно не портирована.
//
// ВАЖНО (перенесено как есть, не "исправлено"): несмотря на калибровочный
// ключ `fisheye_middle`, реальная проекция в исходном коде — обычная
// pinhole (fx,fy,cx,cy), БЕЗ компенсации дисторсии. Это поведение
// оригинала, не баг порта.
import { existsSync, statSync, mkdirSync, copyFileSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import jpeg from "jpeg-js";
import yaml from "js-yaml";
import { runStep } from "../lib/stepContext.mjs";
import { readLas, writeLas } from "../lib/lasIO.mjs";
import { readFramePose } from "../lib/framePose.mjs";
import { extractZip } from "../lib/winZip.mjs";

function loadCalibrationCamera(calPath) {
  if (!calPath || !existsSync(calPath)) return null;
  try {
    let text = readFileSync(calPath, "utf8");
    text = text.replace(/^%YAML:[\d.]+\s*\n/, "").replaceAll("!!opencv-matrix", "");
    const d = yaml.load(text);
    if (!d) return null;
    const intrinsic = d.intrinsic || d;
    let cam = null;
    for (const key of ["fisheye_middle", "usb_cam", "nav_cam", "camera", "cam0"]) {
      if (intrinsic[key]) { cam = intrinsic[key]; break; }
    }
    if (!cam && intrinsic.camera_matrix) cam = intrinsic;
    if (!cam) return null;
    const kRaw = cam.camera_matrix || cam.K;
    if (!kRaw) return null;
    const kData = kRaw.data ? kRaw.data : (Array.isArray(kRaw[0]) ? kRaw.flat() : kRaw);
    if (kData.length < 9) return null;
    const fx = kData[0], fy = kData[4], cx = kData[2], cy = kData[5];

    let rCamInBody = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    let tCamInBody = [0, 0, 0];
    const extRaw = d.extrinsic && d.extrinsic.lidar_middlecamera;
    if (extRaw) {
      const extData = extRaw.data ? extRaw.data : extRaw;
      if (extData.length >= 16) {
        // lidar_middlecamera maps LiDAR/body-frame -> camera frame; invert to
        // get camera pose in body frame (see s20.py _load_calibration_camera).
        const M = extData;
        const Rlc = [[M[0], M[1], M[2]], [M[4], M[5], M[6]], [M[8], M[9], M[10]]];
        const tlc = [M[3], M[7], M[11]];
        rCamInBody = transpose3(Rlc);
        tCamInBody = matVec3(scaleMat3(rCamInBody, -1), tlc);
      }
    }
    return { fx, fy, cx, cy, rCamInBody, tCamInBody };
  } catch {
    return null;
  }
}

function transpose3(m) { return [[m[0][0], m[1][0], m[2][0]], [m[0][1], m[1][1], m[2][1]], [m[0][2], m[1][2], m[2][2]]]; }
function scaleMat3(m, s) { return m.map((row) => row.map((v) => v * s)); }
function matVec3(m, v) { return [m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2], m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2], m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]]; }

function quatToMatrix(qx, qy, qz, qw) {
  return [
    [1 - 2 * (qy * qy + qz * qz), 2 * (qx * qy - qw * qz), 2 * (qx * qz + qw * qy)],
    [2 * (qx * qy + qw * qz), 1 - 2 * (qx * qx + qz * qz), 2 * (qy * qz - qw * qx)],
    [2 * (qx * qz - qw * qy), 2 * (qy * qz + qw * qx), 1 - 2 * (qx * qx + qy * qy)],
  ];
}

function interp1d(xs, ys, x) {
  const n = xs.length;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (xs[mid] <= x) lo = mid; else hi = mid; }
  const t = (x - xs[lo]) / (xs[hi] - xs[lo]);
  return ys[lo] + t * (ys[hi] - ys[lo]);
}

function nearestFrameIndex(navTs, t) {
  // Port of np.searchsorted + "closer neighbour" pick in colorize_laz.
  let lo = 0, hi = navTs.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (navTs[mid] < t) lo = mid + 1; else hi = mid; }
  const ni = Math.min(lo, navTs.length - 1);
  const li = Math.max(ni - 1, 0);
  return Math.abs(t - navTs[li]) < Math.abs(t - navTs[ni]) ? li : ni;
}

await runStep(async (ctx) => {
  const scanId = ctx.scan_id;
  const input = ctx.intermediate.filter_outliers;
  const output = ctx.intermediate.colorize;
  mkdirSync(dirname(output), { recursive: true });

  const inputs = new Map((ctx.inputs || []).map((i) => [i.kind, i.path]));
  if (!inputs.has("camera_frames")) {
    copyFileSync(input, output);
    return { assets: [{ type: "intermediate_laz", path: `${scanId}/intermediate/colorize.las`, size: statSync(output).size }] };
  }

  const cal = loadCalibrationCamera(inputs.get("calibration"));
  const { fx, fy, cx, cy, rCamInBody, tCamInBody } = cal || {
    fx: 500, fy: 500, cx: 320, cy: 240, rCamInBody: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], tCamInBody: [0, 0, 0],
  };
  const rBodyInCam = transpose3(rCamInBody);

  const camExtractDir = join(ctx.scan_dir, "_camera_extract");
  if (existsSync(camExtractDir)) rmSync(camExtractDir, { recursive: true, force: true });
  extractZip(inputs.get("camera_frames"), camExtractDir);
  let navNames = readdirSync(camExtractDir).filter((n) => n.startsWith("nav_") && n.endsWith(".jpg")).sort();
  if (navNames.length === 0) navNames = readdirSync(camExtractDir).filter((n) => n.startsWith("left_") && n.endsWith(".jpg")).sort();
  if (navNames.length === 0) {
    copyFileSync(input, output);
    rmSync(camExtractDir, { recursive: true, force: true });
    return { assets: [{ type: "intermediate_laz", path: `${scanId}/intermediate/colorize.las`, size: statSync(output).size }] };
  }
  const navTs = navNames.map((n) => Number(n.split("_")[1].split(".")[0]) / 1e9);

  const framePose = readFramePose(inputs.get("frame_pose"));
  // Continuous-sign quaternion (same fix-up as framePose.mjs's interpFramePose).
  const qx = Float64Array.from(framePose.qx), qy = Float64Array.from(framePose.qy);
  const qz = Float64Array.from(framePose.qz), qw = Float64Array.from(framePose.qw);
  for (let i = 1; i < qx.length; i++) {
    const dot = qx[i] * qx[i - 1] + qy[i] * qy[i - 1] + qz[i] * qz[i - 1] + qw[i] * qw[i - 1];
    if (dot < 0) { qx[i] *= -1; qy[i] *= -1; qz[i] *= -1; qw[i] *= -1; }
  }
  const tMin = framePose.times[0], tMax = framePose.times[framePose.times.length - 1];

  const las = readLas(input);
  const n = las.count;
  const ptTs = new Float64Array(n);
  const hasGpsTime = las.gpsTime && las.gpsTime.some((v) => v !== 0);
  for (let i = 0; i < n; i++) ptTs[i] = hasGpsTime ? Math.min(Math.max(las.gpsTime[i], tMin), tMax) : tMin + ((tMax - tMin) * i) / Math.max(n - 1, 1);

  // Bucket point indices by nearest camera frame (mirrors the vectorised
  // `ni == fi` mask loop in s20.py without materialising a full mask array).
  const buckets = new Map();
  for (let i = 0; i < n; i++) {
    const fi = nearestFrameIndex(navTs, ptTs[i]);
    if (!buckets.has(fi)) buckets.set(fi, []);
    buckets.get(fi).push(i);
  }

  const red = new Uint8Array(n), green = new Uint8Array(n), blue = new Uint8Array(n);
  for (const [fi, idxs] of buckets) {
    let img;
    try {
      const raw = readFileSync(join(camExtractDir, navNames[fi]));
      img = jpeg.decode(raw, { useTArray: true });
    } catch {
      continue;
    }
    const tf = Math.min(Math.max(navTs[fi], tMin), tMax);
    const itx = interp1d(framePose.times, framePose.tx, tf);
    const ity = interp1d(framePose.times, framePose.ty, tf);
    const itz = interp1d(framePose.times, framePose.tz, tf);
    let iqx = interp1d(framePose.times, qx, tf), iqy = interp1d(framePose.times, qy, tf);
    let iqz = interp1d(framePose.times, qz, tf), iqw = interp1d(framePose.times, qw, tf);
    const nr = Math.hypot(iqx, iqy, iqz, iqw);
    if (nr < 1e-9) continue;
    iqx /= nr; iqy /= nr; iqz /= nr; iqw /= nr;
    const rBw = quatToMatrix(iqx, iqy, iqz, iqw);
    const rWb = transpose3(rBw);

    for (const i of idxs) {
      const pw = [las.x[i] - itx, las.y[i] - ity, las.z[i] - itz];
      const pBody = matVec3(rWb, pw);
      const pCam = matVec3(rBodyInCam, [pBody[0] - tCamInBody[0], pBody[1] - tCamInBody[1], pBody[2] - tCamInBody[2]]);
      if (pCam[2] <= 0.1) continue;
      const u = Math.round((fx * pCam[0]) / pCam[2] + cx);
      const v = Math.round((fy * pCam[1]) / pCam[2] + cy);
      if (u < 0 || u >= img.width || v < 0 || v >= img.height) continue;
      const off = (v * img.width + u) * 4; // jpeg-js decodes to RGBA
      red[i] = img.data[off]; green[i] = img.data[off + 1]; blue[i] = img.data[off + 2];
    }
  }

  writeLas(output, {
    pointFormat: 7, x: las.x, y: las.y, z: las.z,
    gpsTime: las.gpsTime, intensity: las.intensity, red, green, blue,
  });
  rmSync(camExtractDir, { recursive: true, force: true });

  return { assets: [{ type: "intermediate_laz", path: `${scanId}/intermediate/colorize.las`, size: statSync(output).size }] };
});
