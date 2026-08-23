"""
Port of bin/process_splat_transforms.php. Background .ply -> SOG +
collision .glb conversion (PR5). Status is determined by files on disk, no
separate table (same approach as process_copc_conversions.py):
  foo.ply
  foo.ply.sog                -- finished streamed-LOD/SOG (for gsplat)
  foo.ply.collision.glb      -- finished collider (for Walk mode)
  foo.ply.sog.lock           -- conversion already running (one lock covers
                                 both outputs, see splat_transform_worker.py)
  foo.ply.sog.error          -- last attempt failed, not auto-retried

Concurrency -- same mechanism as process_copc_conversions.py, but see
MAX_CONCURRENT below for why the limit itself differs.
"""

import json
import subprocess
import sys
import time
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from apps.tours.models import Tour, TourFile

# Was 10 (copied from process_copc_conversions.py without adjusting for
# splat-transform being noticeably more memory-hungry per file) -- a real
# case on the old server: 3 large tours (~15-16M gaussians each) converted
# AT THE SAME TIME and the WHOLE SERVER WENT DOWN (not just SSH -- the
# entire machine needed a physical restart), twice in a row with the same
# set of files. Coincidence is unlikely -- almost certainly the combined
# memory of several parallel k-means splat conversions exhausted the
# machine's RAM. Until per-file memory usage is actually measured, this is
# lowered to sequential processing (1) as a safe default, not a number
# picked blindly -- raise it back only after measuring one conversion's
# peak memory for real.
MAX_CONCURRENT = 1
# Same mechanism and rationale as process_copc_conversions.py -- a real
# case on the old server: a server reboot killed every node.exe
# (splat-transform) process mid-conversion, leaving .sog.lock files behind
# with no chance for a finally block to run (the process itself, not just
# a child, was killed by the reboot) -- process_splat_transforms.php
# treated those files as "already converting" and would have skipped them
# forever.
STALL_MINUTES = 120
STARTUP_GRACE_MINUTES = 15
MAX_STALL_RETRIES = 3


class Command(BaseCommand):
    help = "Spawn PLY -> SOG+collision conversions up to MAX_CONCURRENT, with stall detection for lock files left behind by a killed/rebooted worker."

    def handle(self, *args, **options):
        upload_dir = Path(settings.UPLOADS_ROOT) / "tours"
        log_dir = Path(settings.UPLOADS_ROOT) / "splat_transform_logs"
        log_dir.mkdir(parents=True, exist_ok=True)

        ply_files = list(
            set(
                list(Tour.objects.filter(file_format="ply").values_list("file_path", flat=True))
                + list(TourFile.objects.filter(file_format="ply").values_list("file_path", flat=True))
            )
        )

        # Pass 1: same stalled/orphaned-conversion detection logic as
        # process_copc_conversions.py, here for .sog instead of .copc.laz.
        for relative_path in ply_files:
            base = upload_dir / relative_path
            lock_file = Path(str(base) + ".sog.lock")
            if not lock_file.is_file():
                continue
            tmp_output = Path(str(base) + ".converting.sog")
            progress_file = Path(str(base) + ".sog.progress")
            retries_file = Path(str(base) + ".sog.stall_retries")

            current_size = tmp_output.stat().st_size if tmp_output.is_file() else None
            prev = None
            if progress_file.is_file():
                try:
                    prev = json.loads(progress_file.read_text())
                except (OSError, ValueError):
                    prev = None

            stalled = False
            if current_size is None:
                lock_age_min = (time.time() - lock_file.stat().st_mtime) / 60
                if lock_age_min > STARTUP_GRACE_MINUTES:
                    stalled = True
                    self.stderr.write(f"Р—Р°РІРёСЃ (РЅРµС‚ РІС‹С…РѕРґРЅРѕРіРѕ С„Р°Р№Р»Р° СЃРїСѓСЃС‚СЏ {round(lock_age_min)} РјРёРЅ): {relative_path}")
            elif prev is not None and current_size <= prev["size"] and (time.time() - prev["at"]) / 60 > STALL_MINUTES:
                stalled = True
                self.stderr.write(f"Р—Р°РІРёСЃ (РІС‹С…РѕРґРЅРѕР№ С„Р°Р№Р» РЅРµ СЂР°СЃС‚С‘С‚ РґРѕР»СЊС€Рµ {STALL_MINUTES} РјРёРЅ): {relative_path}")

            if current_size is not None and (prev is None or current_size > prev["size"]):
                progress_file.write_text(json.dumps({"size": current_size, "at": time.time()}))

            if not stalled:
                continue

            retries = int(retries_file.read_text()) if retries_file.is_file() else 0
            lock_file.unlink(missing_ok=True)
            tmp_output.unlink(missing_ok=True)
            progress_file.unlink(missing_ok=True)
            if retries + 1 >= MAX_STALL_RETRIES:
                Path(str(base) + ".sog.error").write_text(
                    f"РљРѕРЅРІРµСЂС‚Р°С†РёСЏ Р·Р°РІРёСЃР°Р»Р° {retries} СЂР°Р· РїРѕРґСЂСЏРґ (СЃРµСЂРІРµСЂ РїРµСЂРµР·Р°РїСѓСЃРєР°Р»СЃСЏ/РїСЂРѕС†РµСЃСЃ СѓР±РёС‚ Р±РµР· Р·Р°РІРµСЂС€РµРЅРёСЏ) "
                    "вЂ” Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРёРµ РїРѕРїС‹С‚РєРё РѕСЃС‚Р°РЅРѕРІР»РµРЅС‹, РЅСѓР¶РЅРѕ СЂР°Р·РѕР±СЂР°С‚СЊСЃСЏ РІСЂСѓС‡РЅСѓСЋ.",
                    encoding="utf-8",
                )
                retries_file.unlink(missing_ok=True)
                self.stderr.write(f"{relative_path}: РїСЂРµРІС‹С€РµРЅ Р»РёРјРёС‚ Р°РІС‚РѕРїРѕРІС‚РѕСЂРѕРІ ({retries}), РїРѕРјРµС‡РµРЅ РєР°Рє .error")
            else:
                retries_file.write_text(str(retries + 1))
                self.stdout.write(f"{relative_path}: lock СЃРЅСЏС‚, Р±СѓРґРµС‚ РїРµСЂРµР·Р°РїСѓС‰РµРЅ (РїРѕРїС‹С‚РєР° {retries + 1}/{MAX_STALL_RETRIES})")

        running_count = sum(
            1 for relative_path in ply_files
            if Path(str(upload_dir / relative_path) + ".sog.lock").is_file()
        )
        self.stdout.write(f"PLY-С„Р°Р№Р»РѕРІ РІ Р‘Р”: {len(ply_files)}, СѓР¶Рµ Р·Р°РїСѓС‰РµРЅРЅС‹С… РєРѕРЅРІРµСЂС‚Р°С†РёР№ (lock): {running_count}")

        spawned = 0
        for relative_path in ply_files:
            if running_count + spawned >= MAX_CONCURRENT:
                self.stdout.write(f"Р”РѕСЃС‚РёРіРЅСѓС‚ Р»РёРјРёС‚ РїР°СЂР°Р»Р»РµР»СЊРЅС‹С… РєРѕРЅРІРµСЂС‚Р°С†РёР№ ({MAX_CONCURRENT}) вЂ” РѕСЃС‚Р°Р»СЊРЅРѕРµ РІ СЃР»РµРґСѓСЋС‰РёР№ Р·Р°РїСѓСЃРє.")
                break

            input_ply = upload_dir / relative_path
            if not input_ply.is_file():
                continue
            output_sog = str(input_ply) + ".sog"
            output_collision = str(input_ply) + ".collision.glb"
            lock_file = Path(output_sog + ".lock")
            error_file = Path(output_sog + ".error")

            if Path(output_sog).is_file() or lock_file.is_file() or error_file.is_file():
                continue

            lock_file.touch()

            log_file = log_dir / f"{Path(relative_path).name}.log"
            with open(log_file, "a") as log_fh:
                subprocess.Popen(
                    [
                        sys.executable, str(Path(settings.BASE_DIR) / "manage.py"), "splat_transform_worker",
                        "--input-ply", str(input_ply),
                        "--output-sog", output_sog,
                        "--output-collision", output_collision,
                        "--lock-file", str(lock_file),
                        "--error-file", str(error_file),
                    ],
                    stdin=subprocess.DEVNULL, stdout=log_fh, stderr=log_fh,
                    start_new_session=True,
                )
            spawned += 1
            self.stdout.write(f"Р—Р°РїСѓС‰РµРЅР° РєРѕРЅРІРµСЂС‚Р°С†РёСЏ: {relative_path} -> {relative_path}.sog + .collision.glb")

        self.stdout.write(f"Р—Р°РїСѓС‰РµРЅРѕ РЅРѕРІС‹С… РєРѕРЅРІРµСЂС‚Р°С†РёР№: {spawned}")

