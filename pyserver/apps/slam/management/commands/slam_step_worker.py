"""
Port of bin/slam_step_worker.ps1. Dispatches one SLAM pipeline step.
Spawned as a detached subprocess by process_slam_jobs (subprocess.Popen,
start_new_session=True, not waited on) -- owns its own lock and writes
.done/.error on completion (same sidecar principle as
copc_convert_worker.py/splat_transform_worker.py), but unlike those two
this worker never touches the database at all -- all status logic lives in
process_slam_jobs, this command only runs the step function on the context
JSON and writes the result.

Unlike the old .ps1 (which had to convert DB snake_case step names to
camelCase .mjs filenames -- a conversion that was buggy on its first real
run, see the .ps1's own docstring), step names here are looked up directly
in slam.pipeline.steps.STEP_FUNCS with no name transformation at
all, since Python module names are snake_case already -- that whole class
of bug doesn't exist here.
"""

import json
import traceback
from pathlib import Path

from django.core.management.base import BaseCommand

from apps.slam.pipeline.steps import STEP_FUNCS


class Command(BaseCommand):
    help = "Run one SLAM pipeline step against a context file. Internal -- spawned by process_slam_jobs."

    def add_arguments(self, parser):
        parser.add_argument("--step", required=True)
        parser.add_argument("--context-file", required=True)
        parser.add_argument("--done-file", required=True)
        parser.add_argument("--error-file", required=True)
        parser.add_argument("--lock-file", required=True)

    def handle(self, *args, **options):
        step = options["step"]
        context_file = Path(options["context_file"])
        done_file = Path(options["done_file"])
        error_file = Path(options["error_file"])
        lock_file = Path(options["lock_file"])

        try:
            done_file.unlink(missing_ok=True)
            error_file.unlink(missing_ok=True)

            func = STEP_FUNCS.get(step)
            if func is None:
                raise RuntimeError(f"РќРµС‚ СЂРµР°Р»РёР·Р°С†РёРё С€Р°РіР°: {step}")

            ctx = json.loads(context_file.read_text(encoding="utf-8"))
            result = func(ctx) or {}

            done_file.parent.mkdir(parents=True, exist_ok=True)
            done_file.write_text(json.dumps(result), encoding="utf-8")
        except Exception as exc:
            error_file.parent.mkdir(parents=True, exist_ok=True)
            error_file.write_text(f"{exc}\n\n{traceback.format_exc()}", encoding="utf-8")
        finally:
            lock_file.unlink(missing_ok=True)


