// Порт DECODE_RAW (bag-путь) из slamcloude/worker/pipeline/tasks.py
// (строки 284-481) + s20.bag_lidar_to_laz (738-803) + s20.bag_to_rtk_pos
// (837-907) + s20._read_pvtsln_fixes (806-834) + extract_camera_frames_from_bag
// (714-735). PCD-путь (не-bag) НЕ переносится — S20 всегда пишет bag
// (bag_lidar_enabled=1 по умолчанию в схеме, см. sql/schema.sql).
//
// Сознательно НЕ перенесено (см. план, Фаза 2): визуальная коррекция позы
// и kiss-icp резервная траектория — оба признаны в slamcloude
// экспериментами, не оправдавшими себя (или без Node-эквивалента для
// kiss-icp) — при отсутствии SLAM-траектории (Фаза 3 ещё не готова) шаг
// просто использует вендорский frame_pose.txt из ZIP как есть, тот же
// путь деградации, что уже есть в оригинале при сбое обеих коррекций.

import { existsSync, readdirSync, statSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { join, extname } from "node:path";
import { runStep } from "../lib/stepContext.mjs";
import { readMessages } from "../lib/ros1bag.mjs";
import { parseCustomMsgLidar, parseCompressedImageRos1, parseNavSatFixRos1 } from "../lib/msgParsers.mjs";
import { readFramePose, applyFramePoseToPoints } from "../lib/framePose.mjs";
import { writeLas } from "../lib/lasIO.mjs";
import { extractZip, compressZip } from "../lib/winZip.mjs";

const LIDAR_TOPICS = ["/livox/lidar", "/livox/lidar_node", "/points", "/livox/points"];
const CAM_TOPICS = {
  "/usb_cam/image_raw/compressed": "nav",
  "/camera_agent/img_left/compressed": "left",
  "/camera_agent/img_right/compressed": "right",
};
const PVT_TOPICS = ["/rtk_agent/pvtsln", "/rtk_agent/pvtsln_sync"];
const FIX_TOPICS = ["/rtk_agent/navsatfix", "/rtk_agent/navsatfix_sync", "/navsatfix", "/fix", "/gnss/fix", "/ublox/fix"];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function findExtractedInputs(extractDir) {
  const files = walk(extractDir).filter((f) => !f.includes("__MACOSX"));
  const bags = files.filter((f) => extname(f).toLowerCase() === ".bag");
  bags.sort((a, b) => statSync(b).size - statSync(a).size);
  const bag = bags[0] || null;
  const framePose = files.find((f) => f.toLowerCase().endsWith("frame_pose.txt")) || null;
  const calibration = files.find((f) => f.toLowerCase().endsWith("calibration.yaml")) || null;
  return { bag, framePose, calibration };
}

await runStep(async (ctx) => {
  const scanId = ctx.scan_id;
  const scanDir = ctx.scan_dir;
  const extractDir = join(scanDir, "_extract");
  mkdirSync(scanDir, { recursive: true });
  if (existsSync(extractDir)) rmSync(extractDir, { recursive: true, force: true });
  extractZip(ctx.raw_file_path, extractDir);

  const { bag, framePose: framePosePath, calibration } = findExtractedInputs(extractDir);
  if (!bag) throw new Error("No .bag file found in uploaded ZIP");

  const inputsOut = [];
  const inputsDir = join(scanDir, "inputs");
  mkdirSync(inputsDir, { recursive: true });

  // Prefer a Voxel-SLAM trajectory already registered by compute_slam; fall
  // back to the vendor's own frame_pose.txt from the ZIP (see module
  // docstring — no kiss-icp/visual-correction refinement in this port).
  let frameposeSource = (ctx.inputs || []).find((i) => i.kind === "frame_pose");
  if (!frameposeSource && framePosePath) {
    const dst = join(inputsDir, "frame_pose.txt");
    copyFileSync(framePosePath, dst);
    frameposeSource = { path: dst };
    inputsOut.push({ kind: "frame_pose", path: `${scanId}/inputs/frame_pose.txt`, size: statSync(dst).size });
  }
  const framePose = frameposeSource ? readFramePose(frameposeSource.path) : null;

  if (calibration) {
    const dst = join(inputsDir, "calibration.yaml");
    copyFileSync(calibration, dst);
    inputsOut.push({ kind: "calibration", path: `${scanId}/inputs/calibration.yaml`, size: statSync(dst).size });
  }

  // ---- LiDAR -> LAS (world_slam frame if a frame_pose is available) ----
  let xs = [], ys = [], zs = [], ts = [], is_ = [];
  for (const msg of readMessages(bag, LIDAR_TOPICS)) {
    const p = parseCustomMsgLidar(msg.data, msg.timeSec);
    if (p.x.length) { xs.push(p.x); ys.push(p.y); zs.push(p.z); ts.push(p.t); is_.push(p.intensity); }
  }
  if (xs.length === 0) throw new Error("No LiDAR points extracted from bag");
  const concat = (arrs) => {
    const total = arrs.reduce((s, a) => s + a.length, 0);
    const out = new Float64Array(total);
    let off = 0;
    for (const a of arrs) { out.set(a, off); off += a.length; }
    return out;
  };
  let x = concat(xs), y = concat(ys), z = concat(zs);
  const t = concat(ts), intensity = concat(is_);

  if (framePose) {
    const tClip = new Float64Array(t.length);
    const t0 = framePose.times[0], t1 = framePose.times[framePose.times.length - 1];
    for (let i = 0; i < t.length; i++) tClip[i] = Math.min(Math.max(t[i], t0), t1);
    [x, y, z] = applyFramePoseToPoints(x, y, z, tClip, framePose);
  }

  const decodeRawOut = join(ctx.intermediate.decode_raw);
  mkdirSync(join(scanDir, "intermediate"), { recursive: true });
  const intensityScaled = new Float64Array(intensity.length);
  for (let i = 0; i < intensity.length; i++) intensityScaled[i] = Math.min(65535, intensity[i] * 655);
  writeLas(decodeRawOut, { pointFormat: 6, x, y, z, gpsTime: t, intensity: intensityScaled });

  // ---- Camera frames (best-effort) ----
  try {
    const camDir = join(scanDir, "camera_frames");
    mkdirSync(camDir, { recursive: true });
    let nCam = 0;
    for (const msg of readMessages(bag, Object.keys(CAM_TOPICS))) {
      const jpeg = parseCompressedImageRos1(msg.data);
      if (jpeg && jpeg.length > 100) {
        const alias = CAM_TOPICS[msg.topic];
        const fname = join(camDir, `${alias}_${String(Math.round(msg.timeSec * 1e9)).padStart(19, "0")}.jpg`);
        writeFileSync(fname, jpeg);
        nCam++;
      }
    }
    if (nCam > 0) {
      const camZip = join(scanDir, "camera_frames.zip");
      compressZip(camDir, camZip);
      inputsOut.push({ kind: "camera_frames", path: `${scanId}/camera_frames.zip`, size: statSync(camZip).size });
    }
  } catch {
    /* best-effort, matches tasks.py's except-and-continue */
  }

  // ---- RTK trajectory (best-effort, for georeference) ----
  try {
    const epochs = extractRtkEpochs(bag);
    if (epochs.length > 0) {
      const rtkPath = join(scanDir, "intermediate", "bag_rtk.pos");
      writeRtkPos(rtkPath, epochs);
    }
  } catch {
    /* best-effort */
  }

  rmSync(extractDir, { recursive: true, force: true });

  return {
    num_points: x.length,
    source_format: "bag",
    inputs: inputsOut,
    assets: [{ type: "intermediate_laz", path: `${scanId}/intermediate/decode_raw.las`, size: statSync(decodeRawOut).size }],
  };
});

// RTK-FIXED-only gate (see s20.py _FIXED_POS_TYPES/_RTK_MAX_* docstring):
// NARROW_INT(50)/INS_RTKFIXED(56), HDOP<0.9, hgtstd<0.1m — matches the
// vendor engine's own high-accuracy gate. This port only reads the
// NavSatFix fallback (horizontal-only, altitude always 0 on this device) —
// PVTSLNMsg is a vendor-custom ROS1 type requiring dynamic message-definition
// registration (rosbags' typestore in Python) to decode its fields; without
// a real S20 bag to verify the field layout empirically, NavSatFix is the
// safe, spec-stable fallback for this initial port (PVT_TOPICS is kept
// unused above as a marker for that follow-up). Extending to PVTSLNMsg is a
// follow-up once a real bag is available to validate offsets against.
/** Reject epochs whose position deviates far from a TIME-windowed (not
 *  sample-count-windowed — real S20 recordings drop GPS for tens of
 *  seconds at a time near buildings, and an index-based window pulls in
 *  "neighbours" from the far side of a real gap) local median. `fix.status
 *  >= 0` alone (see docstring above) accepts a plain autonomous GPS fix
 *  with NO accuracy gate at all — real S20 recordings measurably mix
 *  sub-metre-accurate epochs with multipath outliers reaching an IMPLIED
 *  SPEED of 70+ m/s between consecutive 0.1s-spaced epochs (confirmed
 *  empirically on scan 1 — obviously not a real position change; the whole
 *  SLAM trajectory for that scan fits in a ~21x22m box). Left unfiltered,
 *  those outliers don't just shift the map — georeference.mjs's
 *  smoothResidualMedian bakes them into a TIME-VARYING per-point
 *  correction, so the same physical wall scanned at two different times
 *  gets warped by two different offsets: exactly the doubled/smeared
 *  geometry seen in the rendered result, not a SLAM/deskew bug.
 *
 *  windowS/thresholdM were picked from that same empirical gap (legit
 *  epochs cluster under 1m of local deviation, outliers start above 10m).
 *  A handful of bad epochs sit right next to each other (the device
 *  appears to publish/hold a bad fix for 2-3 samples before recovering),
 *  which a single pass doesn't fully clear — run to a fixed point instead
 *  of just once (converges in a few passes on real data; capped so a
 *  pathological input can't loop forever). minNeighbours falls an epoch
 *  back to "keep as-is" when it's too isolated in time to judge (an epoch
 *  right next to a real multi-second dropout has few/no neighbours within
 *  windowS and must not be penalised for that). */
function filterRtkOutliers(epochs, windowS = 2.0, thresholdM = 2, minNeighbours = 3, maxPasses = 6) {
  const R = 6378137;
  const toRad = Math.PI / 180;
  const haversine = (lat1, lon1, lat2, lon2) => {
    const dLat = (lat2 - lat1) * toRad, dLon = (lon2 - lon1) * toRad;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  };
  const median = (arr) => {
    const s = [...arr].sort((a, b) => a - b);
    const m = s.length;
    return m % 2 ? s[(m - 1) / 2] : (s[m / 2 - 1] + s[m / 2]) / 2;
  };
  let cur = epochs;
  for (let pass = 0; pass < maxPasses; pass++) {
    const kept = [];
    for (let i = 0; i < cur.length; i++) {
      const ti = cur[i][0];
      const lats = [], lons = [];
      for (let j = i - 1; j >= 0 && ti - cur[j][0] <= windowS; j--) { lats.push(cur[j][1]); lons.push(cur[j][2]); }
      for (let j = i + 1; j < cur.length && cur[j][0] - ti <= windowS; j++) { lats.push(cur[j][1]); lons.push(cur[j][2]); }
      if (lats.length < minNeighbours || haversine(cur[i][1], cur[i][2], median(lats), median(lons)) <= thresholdM) {
        kept.push(cur[i]);
      }
    }
    if (kept.length === cur.length) break;
    cur = kept;
  }
  return cur;
}

function extractRtkEpochs(bagPath) {
  const epochs = [];
  for (const msg of readMessages(bagPath, FIX_TOPICS)) {
    const fix = parseNavSatFixRos1(msg.data);
    if (fix && fix.status >= 0) epochs.push([msg.timeSec, fix.lat, fix.lon, fix.alt]);
  }
  epochs.sort((a, b) => a[0] - b[0]);
  return filterRtkOutliers(epochs);
}

function writeRtkPos(path, epochs) {
  const lines = [
    "% GNSS trajectory extracted from S20 ROS1 bag (RTK)",
    "%  GPST                  latitude(deg) longitude(deg)  height(m)   Q  ns",
  ];
  for (const [tsUnix, lat, lon, alt] of epochs) {
    const d = new Date(tsUnix * 1000);
    const iso = d.toISOString(); // YYYY-MM-DDTHH:MM:SS.sssZ
    const stamp = `${iso.slice(0, 10).replace(/-/g, "/")} ${iso.slice(11, 23)}`;
    lines.push(`${stamp}  ${lat.toFixed(9)}  ${lon.toFixed(9)}  ${alt.toFixed(4)}   1  1`);
  }
  writeFileSync(path, lines.join("\n") + "\n", "utf8");
}
