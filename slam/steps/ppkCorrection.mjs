// Порт PPK_CORRECTION из slamcloude/worker/pipeline/tasks.py (505-537) +
// gnss.py (parse_pos, rnx2rtkp_available, run_rnx2rtkp, fixed_ratio).
// Best-effort, как и в оригинале: рован/базовые обсервации редки для
// bag-пути S20 (там своя RTK-траектория из bag, см. decodeRaw.mjs) — этот
// шаг предназначен для будущих не-bag/внешних PPK-сценариев, отсутствие
// нужных входов просто пропускает шаг, не валит пайплайн.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { runStep } from "../lib/stepContext.mjs";

const Q_FIXED = 1;

function rnx2rtkpAvailable() {
  try {
    execFileSync("where", ["rnx2rtkp.exe"], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

/** Parses an RTKLIB-style .pos file — direct port of gnss.parse_pos. */
export function parsePos(path) {
  const text = readFileSync(path, "utf8");
  const times = [], lats = [], lons = [], heights = [], quality = [];
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("%") || line.startsWith("#")) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 6) continue;
    const [datePart, timePart, lat, lon, h, q] = parts;
    const iso = `${datePart.replace(/\//g, "-")}T${timePart}Z`;
    const t = Date.parse(iso) / 1000;
    if (Number.isNaN(t)) continue;
    times.push(t); lats.push(parseFloat(lat)); lons.push(parseFloat(lon));
    heights.push(parseFloat(h)); quality.push(parseInt(q, 10));
  }
  const order = times.map((_, i) => i).sort((a, b) => times[a] - times[b]);
  const pick = (arr) => order.map((i) => arr[i]);
  return { times: pick(times), lats: pick(lats), lons: pick(lons), heights: pick(heights), quality: pick(quality) };
}

export function fixedRatio(traj) {
  if (!traj.quality.length) return 0;
  return traj.quality.filter((q) => q === Q_FIXED).length / traj.quality.length;
}

await runStep(async (ctx) => {
  const inputs = new Map((ctx.inputs || []).map((i) => [i.kind, i.path]));
  const hasAll = inputs.has("base_rinex") && inputs.has("rover_obs") && inputs.has("trajectory");
  if (!hasAll || !rnx2rtkpAvailable()) {
    return {}; // best-effort skip — matches tasks.py's early StepOutcome()
  }

  const outPos = join(ctx.scan_dir, "intermediate", "corrected.pos");
  mkdirSync(dirname(outPos), { recursive: true });
  const args = ["-p", "2", "-o", outPos, inputs.get("rover_obs"), inputs.get("base_rinex")];
  if (inputs.has("nav")) args.push(inputs.get("nav"));
  execFileSync("rnx2rtkp.exe", args, { stdio: "pipe", timeout: 3600_000 });

  if (!existsSync(outPos)) throw new Error("rnx2rtkp reported success but output .pos is missing");
  const corrected = parsePos(outPos);
  return { rtk_fixed: fixedRatio(corrected) >= 0.5 };
});
