"""
Port of bin/splat_transform_worker.ps1. Converts one .ply tour into SOG
(streamed-LOD, GPU-sorted in the engine) + a collision .glb (-K, for Walk
mode). Spawned as a detached subprocess by process_splat_transforms.py
(subprocess.Popen, start_new_session=True, not waited on) -- this command
owns its own lock/error files and cleans them up itself.

The two splat-transform invocations are INDEPENDENT in success/failure --
a real case on the old server: two ~15.5M-gaussian tours, SOG finished
successfully in ~1h10m each, while the -K collider immediately failed with
"RangeError: Invalid array buffer length" (apparently an internal
splat-transform limit on very large/dense clouds). Previously a collider
failure AFTER a successful (and expensive!) SOG discarded the SOG too (one
shared lock/error for both outputs) -- the tour was left with no model at
all, even though the SOG for display was ready. Now: SOG is mandatory (its
failure = the whole conversion goes to .error, as before); the collider is
optional (Walk silently falls back to acting like Fly without it, see
tour-viewer.js's updateFlyCollision) -- its failure just writes
.collision.error and leaves the already-finished SOG alone.
"""

import subprocess
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Convert one PLY tour to SOG + collision .glb via @playcanvas/splat-transform. Internal -- spawned by process_splat_transforms."

    def add_arguments(self, parser):
        parser.add_argument("--input-ply", required=True)
        parser.add_argument("--output-sog", required=True)
        parser.add_argument("--output-collision", required=True)
        parser.add_argument("--lock-file", required=True)
        parser.add_argument("--error-file", required=True)

    def handle(self, *args, **options):
        input_ply = options["input_ply"]
        output_sog = options["output_sog"]
        output_collision = options["output_collision"]
        lock_file = Path(options["lock_file"])
        error_file = Path(options["error_file"])

        # The temp filename must itself end in .sog/.glb -- splat-transform
        # picks the output format by extension (same trick used for PDAL in
        # copc_convert_worker.py).
        tmp_sog = output_sog[: -len(".sog")] + ".converting.sog" if output_sog.endswith(".sog") else output_sog + ".converting"
        tmp_collision = output_collision[: -len(".glb")] + ".converting.glb" if output_collision.endswith(".glb") else output_collision + ".converting"
        collision_error_file = Path(output_collision + ".error")

        cli = [settings.SPLAT_TRANSFORM_NODE_EXE, settings.SPLAT_TRANSFORM_CLI]

        def run_splat_transform(*args):
            return subprocess.run(cli + list(args), capture_output=True, text=True)

        try:
            if error_file.is_file():
                error_file.unlink()

            # -G/--filter-floaters: drops gaussians not adjacent to any
            # "dense" voxel (defaults 0.05,0.1,0.004 -- voxel size,
            # occupancy threshold, min contribution) -- exactly the
            # isolated large semi-transparent splats with no neighbors
            # (a common artifact over water/reflections) that "glow" into
            # empty space instead of a real surface. Per user request: "if
            # there are no neighboring splats nearby, don't glow in that
            # direction." The tool's default parameters are used as-is --
            # not guessed, these are the splat-transform authors' own
            # tuned values for exactly this purpose.
            result = run_splat_transform("-w", input_ply, "-G", tmp_sog)
            if result.returncode != 0:
                raise RuntimeError(f"splat-transform (SOG) exited with code {result.returncode}: {result.stdout}{result.stderr}")
            if not Path(tmp_sog).is_file():
                raise RuntimeError(f"splat-transform reported success but SOG output is missing: {tmp_sog}")
            Path(tmp_sog).rename(output_sog)

            try:
                if collision_error_file.is_file():
                    collision_error_file.unlink()
                result = run_splat_transform("-w", input_ply, "-K", tmp_collision)
                if result.returncode != 0:
                    raise RuntimeError(f"splat-transform (collision) exited with code {result.returncode}: {result.stdout}{result.stderr}")
                if not Path(tmp_collision).is_file():
                    raise RuntimeError(f"splat-transform reported success but collision output is missing: {tmp_collision}")
                Path(tmp_collision).rename(output_collision)
            except Exception as exc:
                # The collider is optional (see module docstring) -- the
                # tour stays usable (SOG is already in place), just without
                # collisions in Walk mode.
                collision_error_file.write_text(str(exc), encoding="utf-8")
                Path(tmp_collision).unlink(missing_ok=True)
        except Exception as exc:
            error_file.write_text(str(exc), encoding="utf-8")
            Path(tmp_sog).unlink(missing_ok=True)
            Path(tmp_collision).unlink(missing_ok=True)
        finally:
            lock_file.unlink(missing_ok=True)
            # Stall-tracking sidecar files (see process_splat_transforms.py)
            # -- not needed after ANY completion (success or explicit
            # error), otherwise they'd linger as permanent clutter.
            Path(output_sog + ".progress").unlink(missing_ok=True)
            Path(output_sog + ".stall_retries").unlink(missing_ok=True)
