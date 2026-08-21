// Порт BUILD_OCTREE (tasks.py:642-667) — переиспользует уже проверенный в
// этой сессии приём (bin/copc_convert_worker.ps1): pdal translate, с
// fallback на untwine при провале (живой случай на проде — PDAL
// STATUS_STACK_OVERFLOW на очень больших облаках, см. docs/PREPROCESSING.md).
// Финальные артефакты — пара las (сжатый LAZ) + copc (COPC-октодерево) —
// то же самое, что Python-версия кладёт в processed-bucket.
import { execFileSync } from "node:child_process";
import { existsSync, statSync, mkdirSync, renameSync, unlinkSync } from "node:fs";
import { runStep } from "../lib/stepContext.mjs";

const PDAL_EXE = "C:\\Users\\admin\\miniforge3\\envs\\geo\\Library\\bin\\pdal.exe";
const UNTWINE_EXE = "C:\\Users\\admin\\miniforge3\\envs\\geo\\Library\\bin\\untwine.exe";
const PROJ_DIR = "C:\\Users\\admin\\miniforge3\\envs\\geo\\Library\\share\\proj";
const PROJ_ENV = { ...process.env, PROJ_DATA: PROJ_DIR, PROJ_LIB: PROJ_DIR };

await runStep(async (ctx) => {
  const scanId = ctx.scan_id;
  const input = ctx.intermediate.georeference;
  mkdirSync(`${ctx.scan_dir}/final`, { recursive: true });

  const lasFinal = `${ctx.scan_dir}/final/pointcloud.laz`;
  const copcFinal = `${ctx.scan_dir}/final/pointcloud.copc.laz`;
  const srsArgs = ctx.crs_proj4 ? ["--writers.las.a_srs", ctx.crs_proj4] : [];

  // ---- final compressed LAZ (input LAS -> real LASzip compression) ----
  execFileSync(PDAL_EXE, ["translate", input, lasFinal, ...srsArgs], { env: PROJ_ENV, stdio: "pipe" });

  // ---- COPC octree: pdal translate, fallback to untwine (see header) ----
  const tmpCopc = copcFinal.replace(/\.copc\.laz$/, ".converting.copc.laz");
  let pdalError = null;
  try {
    execFileSync(PDAL_EXE, ["translate", input, tmpCopc, ...(ctx.crs_proj4 ? ["--writers.copc.a_srs", ctx.crs_proj4] : [])], { env: PROJ_ENV, stdio: "pipe" });
    if (!existsSync(tmpCopc)) throw new Error("pdal translate reported success but output is missing");
  } catch (e) {
    pdalError = e;
    if (existsSync(tmpCopc)) unlinkSync(tmpCopc);
  }
  if (pdalError) {
    try {
      execFileSync(UNTWINE_EXE, ["-i", input, "-o", tmpCopc], { env: PROJ_ENV, stdio: "pipe" });
    } catch (e2) {
      throw new Error(`pdal translate failed (${pdalError.message}); untwine fallback also failed: ${e2.message}`);
    }
    if (!existsSync(tmpCopc)) throw new Error("untwine fallback reported success but output is missing");
  }
  renameSync(tmpCopc, copcFinal);

  return {
    assets: [
      { type: "las", path: `${scanId}/final/pointcloud.laz`, size: statSync(lasFinal).size },
      { type: "copc", path: `${scanId}/final/pointcloud.copc.laz`, size: statSync(copcFinal).size },
    ],
  };
});
