"""
Port of PPK_CORRECTION (tasks.py:505-537 + gnss.py's parse_pos,
rnx2rtkp_available, run_rnx2rtkp, fixed_ratio). Best-effort, as in the
original: rover/base observations are rare for the S20 bag path (which has
its own RTK trajectory extracted from the bag, see decode_raw.py) -- this
step is meant for future non-bag/external-PPK scenarios; missing required
inputs just skips the step rather than failing the pipeline.
"""

import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path

from django.conf import settings

Q_FIXED = 1


def rnx2rtkp_available() -> bool:
    return shutil.which(settings.RNX2RTKP_EXE) is not None


def parse_pos(path) -> dict:
    """Parses an RTKLIB-style .pos file -- direct port of gnss.parse_pos."""
    rows = []
    with open(path, "r", encoding="utf-8") as f:
        for raw_line in f:
            line = raw_line.strip()
            if not line or line.startswith("%") or line.startswith("#"):
                continue
            parts = line.split()
            if len(parts) < 6:
                continue
            date_part, time_part, lat, lon, h, q = parts[:6]
            try:
                dt = datetime.strptime(f"{date_part} {time_part}", "%Y/%m/%d %H:%M:%S.%f").replace(tzinfo=timezone.utc)
            except ValueError:
                continue
            rows.append((dt.timestamp(), float(lat), float(lon), float(h), int(q)))
    rows.sort(key=lambda r: r[0])
    return {
        "times": [r[0] for r in rows], "lats": [r[1] for r in rows], "lons": [r[2] for r in rows],
        "heights": [r[3] for r in rows], "quality": [r[4] for r in rows],
    }


def fixed_ratio(traj: dict) -> float:
    if not traj["quality"]:
        return 0.0
    return sum(1 for q in traj["quality"] if q == Q_FIXED) / len(traj["quality"])


def run(ctx: dict) -> dict:
    inputs = {i["kind"]: i["path"] for i in (ctx.get("inputs") or [])}
    has_all = "base_rinex" in inputs and "rover_obs" in inputs and "trajectory" in inputs
    if not has_all or not rnx2rtkp_available():
        return {}  # best-effort skip -- matches tasks.py's early StepOutcome()

    out_pos = Path(ctx["scan_dir"]) / "intermediate" / "corrected.pos"
    out_pos.parent.mkdir(parents=True, exist_ok=True)
    args = [settings.RNX2RTKP_EXE, "-p", "2", "-o", str(out_pos), inputs["rover_obs"], inputs["base_rinex"]]
    if "nav" in inputs:
        args.append(inputs["nav"])
    subprocess.run(args, capture_output=True, timeout=3600, check=True)

    if not out_pos.is_file():
        raise RuntimeError("rnx2rtkp reported success but output .pos is missing")
    corrected = parse_pos(out_pos)
    return {"rtk_fixed": fixed_ratio(corrected) >= 0.5}

