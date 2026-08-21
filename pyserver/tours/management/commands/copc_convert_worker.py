"""
Port of bin/copc_convert_worker.ps1. Converts one LAS file to COPC via PDAL
(conda-forge "geo" env on the new server, same layout as the old Windows
server's miniforge3 env -- see settings.PDAL_EXE/UNTWINE_EXE). Spawned as a
detached subprocess by process_copc_conversions.py (subprocess.Popen,
start_new_session=True, not waited on) -- this command owns its own
lock/error files and cleans them up itself; the parent command doesn't
track PIDs.

untwine is a separate tool of the SAME PDAL project, purpose-built for
streaming COPC/EPT construction on arbitrarily large clouds (unlike
writers.copc inside `pdal translate`, sized more for moderate volumes) --
used as a FALLBACK after `pdal translate` fails, not a replacement: on the
old server, `pdal translate` alone handled 5 of 6 real files fine, and only
failed (STATUS_STACK_OVERFLOW) on a 1.58-billion-point/56GB file, most
likely an octree-construction stack overflow in PDAL at that scale.
"""

import os
import shutil
import subprocess
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Convert one LAS file to COPC (pdal translate, falling back to untwine). Internal -- spawned by process_copc_conversions."

    def add_arguments(self, parser):
        parser.add_argument("--input-las", required=True)
        parser.add_argument("--output-copc", required=True)
        parser.add_argument("--lock-file", required=True)
        parser.add_argument("--error-file", required=True)

    def handle(self, *args, **options):
        input_las = options["input_las"]
        output_copc = options["output_copc"]
        lock_file = Path(options["lock_file"])
        error_file = Path(options["error_file"])

        # PDAL/untwine pick the writer/output by the OUTPUT FILE'S EXTENSION --
        # a bare ".tmp" suffix breaks that autodetection, so the temp file
        # must itself end in ".copc.laz"; "in progress" is marked by
        # inserting ".converting" before that suffix instead.
        if output_copc.endswith(".copc.laz"):
            tmp_output = output_copc[: -len(".copc.laz")] + ".converting.copc.laz"
        else:
            tmp_output = output_copc + ".converting"

        env = os.environ.copy()
        if settings.PDAL_PROJ_DATA_DIR:
            env["PROJ_DATA"] = settings.PDAL_PROJ_DATA_DIR
            env["PROJ_LIB"] = settings.PDAL_PROJ_DATA_DIR

        try:
            if error_file.is_file():
                error_file.unlink()

            pdal_error = None
            try:
                result = subprocess.run(
                    [settings.PDAL_EXE, "translate", input_las, tmp_output],
                    env=env, capture_output=True, text=True,
                )
                if result.returncode != 0:
                    raise RuntimeError(f"pdal translate exited with code {result.returncode}: {result.stdout}{result.stderr}")
                if not Path(tmp_output).is_file():
                    raise RuntimeError(f"pdal translate reported success but output file is missing: {tmp_output}")
            except Exception as exc:
                pdal_error = str(exc)
                if Path(tmp_output).is_file():
                    Path(tmp_output).unlink(missing_ok=True)

            if pdal_error:
                # pdal translate failed -- fall back to untwine (see module docstring).
                result = subprocess.run(
                    [settings.UNTWINE_EXE, "-i", input_las, "-o", tmp_output],
                    env=env, capture_output=True, text=True,
                )
                if result.returncode != 0:
                    raise RuntimeError(
                        f"pdal translate failed ({pdal_error}); untwine fallback also exited with code {result.returncode}: {result.stdout}{result.stderr}"
                    )
                if not Path(tmp_output).is_file():
                    raise RuntimeError(
                        f"pdal translate failed ({pdal_error}); untwine fallback reported success but output is missing: {tmp_output}"
                    )

            shutil.move(tmp_output, output_copc)
        except Exception as exc:
            error_file.write_text(str(exc), encoding="utf-8")
            if Path(tmp_output).is_file():
                Path(tmp_output).unlink(missing_ok=True)
        finally:
            if lock_file.is_file():
                lock_file.unlink(missing_ok=True)
            # Stall-tracking sidecar files (see process_copc_conversions.py)
            # -- not needed after ANY completion (success or explicit
            # error), otherwise they'd linger as permanent clutter.
            progress_file = Path(output_copc + ".progress")
            retries_file = Path(output_copc + ".stall_retries")
            progress_file.unlink(missing_ok=True)
            retries_file.unlink(missing_ok=True)
