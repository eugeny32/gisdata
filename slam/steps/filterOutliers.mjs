// Порт FILTER_OUTLIERS — но не механический перенос: вместо ручного k-NN
// через scipy cKDTree (processing.py:93-125, k=8, std_ratio=2.0) используем
// `pdal pipeline` с filters.outlier (method: statistical) — тот же
// статистический критерий (mean distance к k ближайшим соседям, порог =
// mean + std_ratio*std), без необходимости писать k-d tree на Node; PDAL
// уже на сервере и уже доверенный инструмент в этом проекте (см.
// bin/copc_convert_worker.ps1).
import { execFileSync } from "node:child_process";
import { statSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { runStep } from "../lib/stepContext.mjs";

const PDAL_EXE = "C:\\Users\\admin\\miniforge3\\envs\\geo\\Library\\bin\\pdal.exe";
const PROJ_DIR = "C:\\Users\\admin\\miniforge3\\envs\\geo\\Library\\share\\proj";

await runStep(async (ctx) => {
  const scanId = ctx.scan_id;
  const input = ctx.intermediate.decode_raw;
  const output = ctx.intermediate.filter_outliers;
  mkdirSync(dirname(output), { recursive: true });

  const pipeline = {
    pipeline: [
      { type: "readers.las", filename: input },
      // k=8 neighbours, threshold = mean + 2.0*stddev — same parameters as
      // the Python port's scipy-based filter_outliers default (k, std_ratio).
      { type: "filters.outlier", method: "statistical", mean_k: 8, multiplier: 2.0 },
      // classification=7 (LAS "low point/noise") flags outliers instead of
      // silently dropping them if a downstream consumer wants them back;
      // filters.range below is what actually removes them from the output,
      // matching filter_outliers' behaviour of writing only the surviving
      // points.
      { type: "filters.range", limits: "Classification![7:7]" },
      // No extra_dims — decode_raw's input is written by our own minimal
      // LAS writer (slam/lib/lasIO.mjs, format 6, standard fields only,
      // 30 bytes/point) which never carries extra dimensions, and
      // georeference.mjs/colorize.mjs downstream only understand that
      // exact standard layout (see lasIO.mjs docstring).
      { type: "writers.las", filename: output, minor_version: 4, dataformat_id: 6 },
    ],
  };

  execFileSync(PDAL_EXE, ["pipeline", "--stdin"], {
    input: JSON.stringify(pipeline),
    env: { ...process.env, PROJ_DATA: PROJ_DIR, PROJ_LIB: PROJ_DIR },
    stdio: ["pipe", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
  });

  return {
    assets: [{ type: "intermediate_laz", path: `${scanId}/intermediate/filter_outliers.las`, size: statSync(output).size }],
  };
});
