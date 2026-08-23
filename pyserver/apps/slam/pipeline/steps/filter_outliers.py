"""
Port of FILTER_OUTLIERS -- not a mechanical port: instead of the manual k-NN
via scipy cKDTree (processing.py:93-125, k=8, std_ratio=2.0) uses `pdal
pipeline` with filters.outlier (method: statistical) -- the same
statistical criterion (mean distance to k nearest neighbours, threshold =
mean + std_ratio*std), without needing to write a k-d tree by hand; PDAL is
already on the server and an already-trusted tool in this project (see
tours/management/commands/copc_convert_worker.py).
"""

import json
import os
import subprocess
from pathlib import Path

from django.conf import settings


def run(ctx: dict) -> dict:
    scan_id = ctx["scan_id"]
    input_path = ctx["intermediate"]["decode_raw"]
    output_path = ctx["intermediate"]["filter_outliers"]
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)

    pipeline = {
        "pipeline": [
            {"type": "readers.las", "filename": input_path},
            # k=8 neighbours, threshold = mean + 2.0*stddev -- same
            # parameters as the Python port's scipy-based filter_outliers
            # default (k, std_ratio).
            {"type": "filters.outlier", "method": "statistical", "mean_k": 8, "multiplier": 2.0},
            # classification=7 (LAS "low point/noise") flags outliers
            # instead of silently dropping them if a downstream consumer
            # wants them back; filters.range below is what actually removes
            # them from the output, matching filter_outliers' behaviour of
            # writing only the surviving points.
            {"type": "filters.range", "limits": "Classification![7:7]"},
            # No extra_dims -- decode_raw's input is written by our own
            # minimal LAS writer (las_io.py, format 6, standard fields
            # only, 30 bytes/point) which never carries extra dimensions,
            # and georeference.py/colorize.py downstream only understand
            # that exact standard layout (see las_io.py docstring).
            {"type": "writers.las", "filename": output_path, "minor_version": 4, "dataformat_id": 6},
        ],
    }

    env = os.environ.copy()
    if settings.PDAL_PROJ_DATA_DIR:
        env["PROJ_DATA"] = settings.PDAL_PROJ_DATA_DIR
        env["PROJ_LIB"] = settings.PDAL_PROJ_DATA_DIR

    result = subprocess.run(
        [settings.PDAL_EXE, "pipeline", "--stdin"],
        input=json.dumps(pipeline), env=env, capture_output=True, text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"pdal pipeline (filter_outliers) exited with code {result.returncode}: {result.stdout}{result.stderr}")

    return {
        "assets": [{"type": "intermediate_laz", "path": f"{scan_id}/intermediate/filter_outliers.las", "size": Path(output_path).stat().st_size}],
    }

