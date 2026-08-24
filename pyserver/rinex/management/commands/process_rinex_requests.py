"""
Port of bin/process_rinex_requests.php. Processes ONE "pending" background
RINEX request per run (the one that''s been waiting longest) -- simple
model without a separate daemon: run on a schedule (systemd timer, every
1-2 minutes), same cadence as the PHP original under Task Scheduler.
"""

import shutil
import zipfile
from datetime import timedelta
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from rinex.gnss_ftp import gnss_day_folder, gnss_ftp_connect, gnss_ftp_list_files, gnss_parse_file_period_minutes, gnss_parse_file_timestamp
from rinex.models import RinexRequest
from rinex.rinex_merge import rinex_group_contiguous_files, rinex_merge_group

# Gap between the end of one file and the start of the next at which they
# still count as "back to back" and get merged into one -- more than this
# is a hole (station didn't send data / session drop), producing two
# separate files instead of one with a gap in the middle.
RINEX_GAP_TOLERANCE_MINUTES = 5


class Command(BaseCommand):
    help = "Process one pending RINEX background request (FTP fetch + optional per-day merge + zip)."

    def handle(self, *args, **options):
        results_dir = Path(settings.UPLOADS_ROOT) / "rinex_results"
        results_dir.mkdir(parents=True, exist_ok=True)

        with transaction.atomic():
            claim = (
                RinexRequest.objects.select_for_update(skip_locked=True)
                .filter(status="pending").order_by("created_at").first()
            )
            if not claim:
                self.stdout.write("Нет ожидающих запросов")
                return
            claim.status = "processing"
            claim.started_at = timezone.now()
            claim.save(update_fields=["status", "started_at"])
            request_id = claim.id

        rr = RinexRequest.objects.get(id=request_id)

        try:
            stations = [s.strip() for s in rr.stations.split(",") if s.strip()]
            date_from = rr.date_from_utc
            date_to = rr.date_to_utc
            want_types = set()
            if rr.want_obs:
                want_types.add("MO")
            if rr.want_nav:
                want_types.add("MN")
            merge_by_day = bool(rr.merge_by_day)

            if not stations or not want_types:
                self._fail(rr, "Не указаны станции или типы файлов")
                return

            ftp = gnss_ftp_connect()
            if ftp is None:
                self._fail(rr, "Не удалось подключиться к FTP gnss.host")
                return

            tmp_dir = results_dir / f"tmp_{request_id}"
            final_dir = results_dir / f"final_{request_id}"
            tmp_dir.mkdir(parents=True, exist_ok=True)
            final_dir.mkdir(parents=True, exist_ok=True)

            # Step 1 -- download every FTP file falling in [date_from, date_to]
            # by its OWN timestamp (gnss_parse_file_timestamp), not by the day
            # folder's bounds -- the last day's folder holds hours before and
            # after the requested window too, filter precisely.
            downloaded: dict[str, dict[str, list]] = {}
            cursor_day = date_from.replace(hour=0, minute=0, second=0, microsecond=0)
            last_day = date_to.replace(hour=0, minute=0, second=0, microsecond=0)
            file_index = 0
            try:
                while cursor_day <= last_day:
                    day_folder = gnss_day_folder(cursor_day)
                    for station in stations:
                        for f in gnss_ftp_list_files(ftp, day_folder, station):
                            ts = gnss_parse_file_timestamp(f["name"])
                            if ts is None or ts < date_from or ts > date_to:
                                continue
                            name_lower = f["name"].lower()
                            file_type = "MO" if "_mo." in name_lower else ("MN" if "_mn." in name_lower else None)
                            if file_type is None or file_type not in want_types:
                                continue
                            file_index += 1
                            local_path = tmp_dir / f"dl_{file_index}"
                            try:
                                with open(local_path, "wb") as fh:
                                    ftp.retrbinary(f"RETR /{f['path']}", fh.write)
                            except OSError:
                                continue  # skip missing/failed file, don't fail the whole request
                            downloaded.setdefault(station, {}).setdefault(file_type, []).append({
                                "local_path": str(local_path), "timestamp": ts,
                                "period_minutes": gnss_parse_file_period_minutes(f["name"]),
                            })
                    cursor_day += timedelta(days=1)
            finally:
                ftp.close()

            if not downloaded:
                self._fail(rr, "Не найдено файлов по заданным станциям/датам/типам")
                tmp_dir.rmdir()
                final_dir.rmdir()
                return

            # Step 2 -- group/merge. Without merge_by_day, each downloaded file
            # is just moved into the final folder under a readable name.
            file_count = 0
            for station, by_type in downloaded.items():
                for file_type, files in by_type.items():
                    if not merge_by_day:
                        for f in files:
                            name = f"{station}_{f['timestamp'].strftime('%Y%m%d_%H%M')}_{file_type}.rnx"
                            shutil.move(f["local_path"], final_dir / name)
                            file_count += 1
                        continue
                    groups = rinex_group_contiguous_files(files, RINEX_GAP_TOLERANCE_MINUTES)
                    for group in groups:
                        first = group[0]["timestamp"]
                        last = group[-1]["timestamp"]
                        name = (
                            f"{station}_{file_type}_{first.strftime('%Y%m%d')}_"
                            f"{first.strftime('%H%M')}-{last.strftime('%H%M')}.rnx"
                        )
                        local_paths = [g["local_path"] for g in group]
                        if len(local_paths) == 1:
                            shutil.move(local_paths[0], final_dir / name)
                        else:
                            rinex_merge_group(local_paths, str(final_dir / name))
                        file_count += 1

            # dl_* files were only needed up to this point (either renamed or
            # already read during merging) -- clean up whatever's left (files
            # that went into groups of >1).
            for leftover in tmp_dir.glob("dl_*"):
                leftover.unlink(missing_ok=True)
            tmp_dir.rmdir()

            # Step 3 -- zip the final folder into one downloadable archive.
            zip_rel_path = f"{request_id}.zip"
            zip_path = results_dir / zip_rel_path
            with zipfile.ZipFile(zip_path, "w") as zf:
                for f in final_dir.glob("*"):
                    zf.write(f, f.name)

            for f in final_dir.glob("*"):
                f.unlink(missing_ok=True)
            final_dir.rmdir()

            rr.status = "done"
            rr.result_path = zip_rel_path
            rr.file_count = file_count
            rr.completed_at = timezone.now()
            rr.save(update_fields=["status", "result_path", "file_count", "completed_at"])
            self.stdout.write(f"Запрос #{request_id}: готово, файлов в архиве: {file_count}")
        except Exception as exc:
            self._fail(rr, str(exc))

    def _fail(self, rr: RinexRequest, message: str):
        rr.status = "error"
        rr.error_message = message[:500]
        rr.completed_at = timezone.now()
        rr.save(update_fields=["status", "error_message", "completed_at"])
        self.stdout.write(f"Запрос #{rr.id}: ОШИБКА — {message}")