"""
Port of BUILD_OCTREE -- reuses the same pattern as
tours/management/commands/copc_convert_worker.py: pdal translate, falling
back to untwine on failure (real production case -- PDAL
STATUS_STACK_OVERFLOW on very large clouds). Final artifacts: a compressed
LAZ + a COPC octree, matching what the upstream Python pipeline puts in its
processed bucket.
"""

import os
import subprocess
from pathlib import Path

from django.conf import settings


def _pdal_proj_env():
    env = os.environ.copy()
    if settings.PDAL_PROJ_DATA_DIR:
        env["PROJ_DATA"] = settings.PDAL_PROJ_DATA_DIR
        env["PROJ_LIB"] = settings.PDAL_PROJ_DATA_DIR
    return env


def run(ctx: dict) -> dict:
    scan_id = ctx["scan_id"]
    input_path = ctx["intermediate"]["georeference"]
    final_dir = Path(ctx["scan_dir"]) / "final"
    final_dir.mkdir(parents=True, exist_ok=True)

    las_final = final_dir / "pointcloud.laz"
    copc_final = final_dir / "pointcloud.copc.laz"
    srs_args = ["--writers.las.a_srs", ctx["crs_proj4"]] if ctx.get("crs_proj4") else []
    env = _pdal_proj_env()

    # ---- final compressed LAZ (input LAS -> real LASzip compression) ----
    result = subprocess.run(
        [settings.PDAL_EXE, "translate", input_path, str(las_final), *srs_args],
        env=env, capture_output=True, text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"pdal translate (final LAZ) exited with code {result.returncode}: {result.stdout}{result.stderr}")

    # ---- COPC octree: pdal translate, fallback to untwine (see header) ----
    tmp_copc = str(copc_final)[: -len(".copc.laz")] + ".converting.copc.laz"
    pdal_error = None
    copc_srs_args = ["--writers.copc.a_srs", ctx["crs_proj4"]] if ctx.get("crs_proj4") else []
    result = subprocess.run(
        [settings.PDAL_EXE, "translate", input_path, tmp_copc, *copc_srs_args],
        env=env, capture_output=True, text=True,
    )
    if result.returncode != 0:
        pdal_error = f"pdal translate exited with code {result.returncode}: {result.stdout}{result.stderr}"
    elif not Path(tmp_copc).is_file():
        pdal_error = "pdal translate reported success but output is missing"
    if pdal_error:
        Path(tmp_copc).unlink(missing_ok=True)
        result = subprocess.run(
            [settings.UNTWINE_EXE, "-i", input_path, "-o", tmp_copc],
            env=env, capture_output=True, text=True,
        )
        if result.returncode != 0:
            raise RuntimeError(f"pdal translate failed ({pdal_error}); untwine fallback also exited with code {result.returncode}: {result.stdout}{result.stderr}")
        if not Path(tmp_copc).is_file():
            raise RuntimeError(f"pdal translate failed ({pdal_error}); untwine fallback reported success but output is missing")
    Path(tmp_copc).rename(copc_final)

    return {
        "assets": [
            {"type": "las", "path": f"{scan_id}/final/pointcloud.laz", "size": las_final.stat().st_size},
            {"type": "copc", "path": f"{scan_id}/final/pointcloud.copc.laz", "size": copc_final.stat().st_size},
        ],
    }

