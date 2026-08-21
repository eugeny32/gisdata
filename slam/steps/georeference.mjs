// Порт georeference_from_slam (s20.py:1380-1634) + _solve_yaw_similarity_transform
// (1312-1343) + _smooth_residual_median (1346-1377). Реальный порядок шагов
// пайплайна — COLORIZE ПЕРЕД GEOREFERENCE (см. tasks.py:539-546: colorize
// проецирует камеру на точки в ЛОКАЛЬНОЙ SLAM-системе координат, поэтому
// должен работать до перевода в UTM) — вход этого шага: intermediate/colorize.las.
//
// _solve_yaw_similarity_transform здесь реализован через замкнутую форму
// комплексных чисел (theta = arg(sum(conj(src)*dst))) вместо явного SVD 2x2 —
// математически тождественно тому же результату (это стандартный результат
// абсолютной ориентации/Кабша в 2D для чистого вращения без отражения),
// просто не требует своей реализации SVD в JS. НЕ путать с "упрощением
// алгоритма" — это тот же самый fit, другой способ его посчитать.
//
// Только BAG-путь (frame_pose + bag_rtk.pos, соответствует decodeRaw.mjs) +
// PPK-путь (сдвиг уже георефренсенного облака по коррекции траектории) —
// как в tasks.py:575-639. Если ни один вход не готов — pass-through.
import { existsSync, statSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname } from "node:path";
import proj4 from "proj4";
import { runStep } from "../lib/stepContext.mjs";
import { readLas, writeLas } from "../lib/lasIO.mjs";
import { parsePos } from "./ppkCorrection.mjs";

function interp1d(xs, ys, x) {
  const n = xs.length;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] <= x) lo = mid; else hi = mid;
  }
  const t = (x - xs[lo]) / (xs[hi] - xs[lo]);
  return ys[lo] + t * (ys[hi] - ys[lo]);
}

/** dst ~= R @ src + t (rotation about Z only + independent Z offset). */
function solveYawSimilarityTransform(srcPts, dstPts) {
  const n = srcPts.length;
  let srcCx = 0, srcCy = 0, dstCx = 0, dstCy = 0, srcCz = 0, dstCz = 0;
  for (const [x, y] of srcPts) { srcCx += x; srcCy += y; }
  for (const [x, y] of dstPts) { dstCx += x; dstCy += y; }
  srcCx /= n; srcCy /= n; dstCx /= n; dstCy /= n;
  for (const [, , z] of srcPts) srcCz += z;
  for (const [, , z] of dstPts) dstCz += z;
  srcCz /= n; dstCz /= n;

  let sumCross = 0, sumDot = 0; // see module docstring: closed-form == 2x2 Kabsch/SVD
  for (let i = 0; i < n; i++) {
    const sx = srcPts[i][0] - srcCx, sy = srcPts[i][1] - srcCy;
    const dx = dstPts[i][0] - dstCx, dy = dstPts[i][1] - dstCy;
    sumDot += sx * dx + sy * dy;
    sumCross += sx * dy - sy * dx;
  }
  const theta = Math.atan2(sumCross, sumDot);
  const cos = Math.cos(theta), sin = Math.sin(theta);
  const R = [[cos, -sin, 0], [sin, cos, 0], [0, 0, 1]];
  const tx = dstCx - (cos * srcCx - sin * srcCy);
  const ty = dstCy - (sin * srcCx + cos * srcCy);
  const tz = dstCz - srcCz;
  return { R, t: [tx, ty, tz] };
}

function applyR2(R, x, y) {
  return [R[0][0] * x + R[0][1] * y, R[1][0] * x + R[1][1] * y];
}

function buildUtmProjection(medianLon, medianLat, targetCrsWkt, targetCrsEpsg) {
  let def;
  if (targetCrsWkt) def = targetCrsWkt;
  else if (targetCrsEpsg) def = `EPSG:${targetCrsEpsg}`; // only resolves if proj4js has this EPSG predefined
  else {
    const zone = Math.floor((medianLon + 180) / 6) + 1;
    const hemisphere = medianLat >= 0 ? "+north" : "+south";
    def = `+proj=utm +zone=${zone} ${hemisphere} +datum=WGS84 +units=m +no_defs`;
  }
  return { projection: proj4(def), def };
}

await runStep(async (ctx) => {
  const scanId = ctx.scan_id;
  const input = ctx.intermediate.colorize;
  const output = ctx.intermediate.georeference;
  mkdirSync(dirname(output), { recursive: true });

  const bagRtkPath = `${ctx.scan_dir}/intermediate/bag_rtk.pos`.replace(/\\/g, "/");
  const inputs = new Map((ctx.inputs || []).map((i) => [i.kind, i.path]));
  const correctedPath = `${ctx.scan_dir}/intermediate/corrected.pos`.replace(/\\/g, "/");

  // Ручной обход (slam_scans.skip_georeference, см. slam_scans.php): на
  // некоторых съёмках бортовой GPS недостаточно точен даже после фильтрации
  // выбросов (filterRtkOutliers) и жёсткого выравнивания — облако остаётся в
  // локальных SLAM-координатах вместо привязки к плохой абсолютной системе.
  const usableBagRtk = !ctx.skip_georeference && ctx.bag_lidar_enabled && inputs.has("frame_pose") && existsSync(bagRtkPath);
  const usablePpk = !ctx.skip_georeference && inputs.has("trajectory") && existsSync(correctedPath);

  if (!usableBagRtk && !usablePpk) {
    copyFileSync(input, output);
    return { assets: [{ type: "intermediate_laz", path: `${scanId}/intermediate/georeference.las`, size: statSync(output).size }] };
  }

  const las = readLas(input);

  if (usableBagRtk) {
    const { readFramePose } = await import("../lib/framePose.mjs");
    const framePose = readFramePose(inputs.get("frame_pose"));
    const rtk = parsePos(bagRtkPath);
    if (rtk.times.length < 4) throw new Error(`RTK trajectory has only ${rtk.times.length} epochs, need >= 4`);

    const tStart = Math.max(framePose.times[0], rtk.times[0]);
    const tEnd = Math.min(framePose.times[framePose.times.length - 1], rtk.times[rtk.times.length - 1]);
    if (tEnd <= tStart) throw new Error("No time overlap between SLAM trajectory and RTK");

    const idx = rtk.times.map((t, i) => i).filter((i) => rtk.times[i] >= tStart && rtk.times[i] <= tEnd);
    if (idx.length < 4) throw new Error(`Only ${idx.length} RTK epochs in overlap, need >= 4`);

    const medianLon = median(idx.map((i) => rtk.lons[i]));
    const medianLat = median(idx.map((i) => rtk.lats[i]));
    const { projection: utm, def: utmProjDef } = buildUtmProjection(medianLon, medianLat, ctx.target_crs_wkt, ctx.target_crs_epsg);

    const rtkTm = idx.map((i) => rtk.times[i]);
    const utmPts = idx.map((i) => {
      const [ux, uy] = utm.forward([rtk.lons[i], rtk.lats[i]]);
      return [ux, uy, rtk.heights[i]];
    });
    const slamPts = rtkTm.map((t) => [
      interp1d(framePose.times, framePose.tx, t),
      interp1d(framePose.times, framePose.ty, t),
      interp1d(framePose.times, framePose.tz, t),
    ]);

    const { R, t: tVec } = solveYawSimilarityTransform(slamPts, utmPts);

    // ИЗМЕНЕНО: было — per-point time-varying residual correction (median-
    // smoothed over a 20s sliding window, one correction PER POINT
    // interpolated by its own capture time). That's the right tool for a
    // heavily-drifting raw-odometry source (kiss-icp — never actually wired
    // up in this port, see module docstring) where a single rigid fit can't
    // track accumulating drift. It's the WRONG tool here: frame_pose at this
    // point is always a real loop-closed SLAM trajectory (either our own
    // compute_slam/Voxel-SLAM native port, or the vendor's own
    // share_slam2_offline.exe output copied from the ZIP) — internally
    // consistent by construction. Layering a per-point correction fit
    // against noisy autonomous-GPS epochs (NavSatFix, no RTK-FIXED gate —
    // see decodeRaw.mjs's extractRtkEpochs docstring; even the filtered
    // epochs still carry metres of slowly-varying absolute bias, not just
    // the multipath spikes filterRtkOutliers removes) on TOP of that just
    // re-injects that GPS noise as a moving, point-by-point warp: the same
    // physical wall, scanned at two different times, ends up with two
    // different corrections baked in — this is what was actually producing
    // the doubled/smeared geometry, not the SLAM trajectory itself (verified
    // independently: alidarState.txt for scan 1 is smooth, no time
    // regressions, no implausible jumps). A single rigid yaw+translation fit
    // (computed above from ALL overlapping RTK epochs at once, so it
    // averages out epoch-level noise instead of tracking it) still corrects
    // for whatever slow absolute drift the SLAM trajectory has — that's the
    // right amount of GPS trust for an already-loop-closed source.
    const n = las.count;
    const outX = new Float64Array(n), outY = new Float64Array(n), outZ = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const [ax, ay] = applyR2(R, las.x[i], las.y[i]);
      outX[i] = ax + tVec[0];
      outY[i] = ay + tVec[1];
      outZ[i] = las.z[i] + tVec[2];
    }

    writeLas(output, {
      pointFormat: las.pointFormat, x: outX, y: outY, z: outZ,
      gpsTime: las.gpsTime, intensity: las.intensity, red: las.red, green: las.green, blue: las.blue,
    });

    const bbox = wgs84BboxFromUtm(outX, outY, utm);
    return {
      // slam/lib/lasIO.mjs deliberately doesn't write/read a CRS VLR (see its
      // docstring) — the proj4 definition string travels via slam_scans.crs_proj4
      // instead, so build_octree.mjs can pass it to PDAL explicitly
      // (--writers.copc.a_srs) rather than relying on it being embedded in
      // the intermediate LAS itself.
      crs_proj4: utmProjDef,
      bbox,
      assets: [{ type: "intermediate_laz", path: `${scanId}/intermediate/georeference.las`, size: statSync(output).size }],
    };
  }

  // PPK path (gnss.apply_trajectory_correction, gnss.py:147-194): shifts an
  // ALREADY-georeferenced cloud by a trajectory correction, using the
  // cloud's own embedded CRS to project the correction into the same
  // metres the points are stored in. slam/lib/lasIO.mjs deliberately does
  // not read/write a CRS VLR (see its docstring) — without that, this port
  // has no reliable source CRS to project into here, so this path is left
  // as an explicit gap rather than silently applying the correction in the
  // wrong units. Not reached by the S20/bag workflow (the branch above
  // handles that); wire this up once a concrete non-bag/external-PPK
  // scenario needs it.
  throw new Error(
    "PPK-путь georeference не реализован в этом порте: нужна CRS, встроенная в " +
      "промежуточный LAS, а slam/lib/lasIO.mjs сознательно её не хранит (см. докстринг). " +
      "Актуально только для не-bag/внешних PPK-сценариев, не для стандартного пути S20."
  );
});

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const m = s.length;
  return m % 2 ? s[(m - 1) / 2] : (s[m / 2 - 1] + s[m / 2]) / 2;
}

function wgs84BboxFromUtm(x, y, utmProjection) {
  let xMin = Infinity, yMin = Infinity, xMax = -Infinity, yMax = -Infinity;
  for (let i = 0; i < x.length; i++) {
    if (x[i] < xMin) xMin = x[i]; if (x[i] > xMax) xMax = x[i];
    if (y[i] < yMin) yMin = y[i]; if (y[i] > yMax) yMax = y[i];
  }
  const corners = [[xMin, yMin], [xMax, yMin], [xMax, yMax], [xMin, yMax]].map((p) => utmProjection.inverse(p));
  const lons = corners.map((c) => c[0]), lats = corners.map((c) => c[1]);
  return [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)];
}
