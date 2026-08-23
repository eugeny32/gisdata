"""
Port of bin/process_copc_conversions.php. Background LAS -> COPC conversion
(no separate queue table -- status is determined by files on disk):
  foo.las
  foo.las.copc.laz          -- result (ready)
  foo.las.copc.laz.lock     -- conversion already running (this or a
                                previous run, see copc_convert_worker)
  foo.las.copc.laz.error    -- last attempt failed, not auto-retried
                                (needs manual investigation)

Concurrency -- no more than MAX_CONCURRENT pdal processes at once (room for
Postgres/NTRIP polling/RINEX queue on the same machine). Run on a schedule
(systemd timer); each run just tops up work to the limit and exits -- it
does not wait for already-running conversions to finish.
"""

import json
import subprocess
import sys
import time
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from apps.tours.models import Tour, TourFile

MAX_CONCURRENT = 10
# A "stalled" conversion -- a real case seen on the old server: the server
# rebooted / the process was killed mid-conversion of a 53GB file, leaving
# .lock behind with NO .converting.copc.laz and not a single log line --
# every run (every 2 minutes) silently treated the file as "already
# converting" and skipped it for over two weeks straight. The signal for a
# stall is: the .converting.copc.laz size hasn't grown for longer than
# STALL_MINUTES (or the file doesn't exist at all STARTUP_GRACE_MINUTES
# after the lock was created -- meaning PDAL never got around to starting,
# or died immediately). Progress between runs is compared via a .progress
# sidecar (below) -- PDAL itself never writes it, only this command
# maintains that state.
STALL_MINUTES = 120
STARTUP_GRACE_MINUTES = 15
# How many times a stalled file can be auto-restarted before giving up and
# writing .error (same as for a normal PDAL error -- from then on it needs
# manual investigation, not endless hammering of a file that reliably
# stalls/fails).
MAX_STALL_RETRIES = 3


class Command(BaseCommand):
    help = "Spawn LAS -> COPC conversions up to MAX_CONCURRENT, with stall detection for lock files left behind by a killed/rebooted worker."

    def handle(self, *args, **options):
        upload_dir = Path(settings.UPLOADS_ROOT) / "tours"
        log_dir = Path(settings.UPLOADS_ROOT) / "copc_logs"
        log_dir.mkdir(parents=True, exist_ok=True)

        las_files = list(
            set(
                list(Tour.objects.filter(file_format="las").values_list("file_path", flat=True))
                + list(TourFile.objects.filter(file_format="las").values_list("file_path", flat=True))
            )
        )

        # Pass 1: for EVERY file with an existing .lock, check whether it's
        # stalled before treating it as "already running" below. Done on
        # every run (every couple of minutes on schedule), not only when
        # looking for new work -- otherwise a stalled file would only ever
        # be detected once.
        for relative_path in las_files:
            base = upload_dir / relative_path
            lock_file = Path(str(base) + ".copc.laz.lock")
            if not lock_file.is_file():
                continue
            tmp_output = Path(str(base) + ".converting.copc.laz")
            progress_file = Path(str(base) + ".copc.laz.progress")
            retries_file = Path(str(base) + ".copc.laz.stall_retries")

            current_size = tmp_output.stat().st_size if tmp_output.is_file() else None
            prev = None
            if progress_file.is_file():
                try:
                    prev = json.loads(progress_file.read_text())
                except (OSError, ValueError):
                    prev = None

            stalled = False
            if current_size is None:
                # Not a single byte of output yet -- wait STARTUP_GRACE_MINUTES
                # in case PDAL just hasn't started writing yet (the lock being
                # created and the process actually starting aren't perfectly
                # simultaneous).
                lock_age_min = (time.time() - lock_file.stat().st_mtime) / 60
                if lock_age_min > STARTUP_GRACE_MINUTES:
                    stalled = True
                    self.stderr.write(f"Р—Р°РІРёСЃ (РЅРµС‚ РІС‹С…РѕРґРЅРѕРіРѕ С„Р°Р№Р»Р° СЃРїСѓСЃС‚СЏ {round(lock_age_min)} РјРёРЅ): {relative_path}")
            elif prev is not None and current_size <= prev["size"] and (time.time() - prev["at"]) / 60 > STALL_MINUTES:
                # Output file exists but hasn't grown in over STALL_MINUTES
                # since the last check -- the process is most likely dead
                # (otherwise PDAL would keep writing) but never removed its
                # own lock (its cleanup path never ran -- kill/reboot).
                stalled = True
                self.stderr.write(f"Р—Р°РІРёСЃ (РІС‹С…РѕРґРЅРѕР№ С„Р°Р№Р» РЅРµ СЂР°СЃС‚С‘С‚ РґРѕР»СЊС€Рµ {STALL_MINUTES} РјРёРЅ): {relative_path}")

            if current_size is not None and (prev is None or current_size > prev["size"]):
                # Real progress since the last check -- update the snapshot.
                progress_file.write_text(json.dumps({"size": current_size, "at": time.time()}))

            if not stalled:
                continue

            retries = int(retries_file.read_text()) if retries_file.is_file() else 0
            lock_file.unlink(missing_ok=True)
            tmp_output.unlink(missing_ok=True)
            progress_file.unlink(missing_ok=True)
            if retries + 1 >= MAX_STALL_RETRIES:
                Path(str(base) + ".copc.laz.error").write_text(
                    f"РљРѕРЅРІРµСЂС‚Р°С†РёСЏ Р·Р°РІРёСЃР°Р»Р° {retries} СЂР°Р· РїРѕРґСЂСЏРґ (СЃРµСЂРІРµСЂ РїРµСЂРµР·Р°РїСѓСЃРєР°Р»СЃСЏ/РїСЂРѕС†РµСЃСЃ СѓР±РёС‚ Р±РµР· Р·Р°РІРµСЂС€РµРЅРёСЏ) "
                    "вЂ” Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРёРµ РїРѕРїС‹С‚РєРё РѕСЃС‚Р°РЅРѕРІР»РµРЅС‹, РЅСѓР¶РЅРѕ СЂР°Р·РѕР±СЂР°С‚СЊСЃСЏ РІСЂСѓС‡РЅСѓСЋ.",
                    encoding="utf-8",
                )
                retries_file.unlink(missing_ok=True)
                self.stderr.write(f"{relative_path}: РїСЂРµРІС‹С€РµРЅ Р»РёРјРёС‚ Р°РІС‚РѕРїРѕРІС‚РѕСЂРѕРІ ({retries}), РїРѕРјРµС‡РµРЅ РєР°Рє .error")
            else:
                retries_file.write_text(str(retries + 1))
                self.stdout.write(f"{relative_path}: lock СЃРЅСЏС‚, Р±СѓРґРµС‚ РїРµСЂРµР·Р°РїСѓС‰РµРЅ (РїРѕРїС‹С‚РєР° {retries + 1}/{MAX_STALL_RETRIES})")

        # Count already-running conversions (lock file exists) by the actual
        # DB paths -- not by globbing the directory tree (file_path can live
        # in a group subfolder, see the schema.sql comment on
        # uploads/tours/<group-slug>/...).
        running_count = sum(
            1 for relative_path in las_files
            if Path(str(upload_dir / relative_path) + ".copc.laz.lock").is_file()
        )
        self.stdout.write(f"LAS-С„Р°Р№Р»РѕРІ РІ Р‘Р”: {len(las_files)}, СѓР¶Рµ Р·Р°РїСѓС‰РµРЅРЅС‹С… РєРѕРЅРІРµСЂС‚Р°С†РёР№ (lock): {running_count}")

        spawned = 0
        for relative_path in las_files:
            if running_count + spawned >= MAX_CONCURRENT:
                self.stdout.write(f"Р”РѕСЃС‚РёРіРЅСѓС‚ Р»РёРјРёС‚ РїР°СЂР°Р»Р»РµР»СЊРЅС‹С… РєРѕРЅРІРµСЂС‚Р°С†РёР№ ({MAX_CONCURRENT}) вЂ” РѕСЃС‚Р°Р»СЊРЅРѕРµ РІ СЃР»РµРґСѓСЋС‰РёР№ Р·Р°РїСѓСЃРє.")
                break

            input_las = upload_dir / relative_path
            if not input_las.is_file():
                continue
            output_copc = str(input_las) + ".copc.laz"
            lock_file = Path(output_copc + ".lock")
            error_file = Path(output_copc + ".error")

            if Path(output_copc).is_file() or lock_file.is_file() or error_file.is_file():
                continue

            # Create the lock HERE (synchronously, before spawning the
            # process) -- otherwise, with several files in one run, they
            # could all be counted as "not started yet" and MAX_CONCURRENT
            # could be exceeded before the child processes get a chance to
            # create their own locks.
            lock_file.touch()

            log_file = log_dir / f"{Path(relative_path).name}.log"
            with open(log_file, "a") as log_fh:
                subprocess.Popen(
                    [
                        sys.executable, str(Path(settings.BASE_DIR) / "manage.py"), "copc_convert_worker",
                        "--input-las", str(input_las),
                        "--output-copc", output_copc,
                        "--lock-file", str(lock_file),
                        "--error-file", str(error_file),
                    ],
                    stdin=subprocess.DEVNULL, stdout=log_fh, stderr=log_fh,
                    start_new_session=True,
                )
            spawned += 1
            self.stdout.write(f"Р—Р°РїСѓС‰РµРЅР° РєРѕРЅРІРµСЂС‚Р°С†РёСЏ: {relative_path} -> {relative_path}.copc.laz")

        self.stdout.write(f"Р—Р°РїСѓС‰РµРЅРѕ РЅРѕРІС‹С… РєРѕРЅРІРµСЂС‚Р°С†РёР№: {spawned}")

