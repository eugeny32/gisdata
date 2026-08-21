"""
Port of bin/process_slam_jobs.php. Combines two patterns already proven
elsewhere in this project:

 - Atomic job claim via select_for_update(skip_locked=True) in a
   transaction (same trick as rinex's process_rinex_requests) -- guards
   against double-processing when scheduled runs overlap.
 - Spawning a step as a DETACHED subprocess with no wait (same trick as
   tours' process_copc_conversions/process_splat_transforms) -- SLAM steps
   can run for minutes/hours, the orchestrator must not block on them.

All DB logic lives in this command; the worker (slam_step_worker,
dispatching into slam_pipeline.pipeline.steps) knows nothing about the
database -- it only reads a context JSON and writes .done/.error files
(same sidecar principle as the .lock/.error files in the COPC/splat
pipelines), so Postgres access from the step implementations stays
centralized here.
"""

import json
import subprocess
import sys
import time
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from slam_pipeline.models import PIPELINE_ORDER, SlamJob, SlamProcessedAsset, SlamProject, SlamScan, SlamScanInput
from slam_pipeline.services import (
    slam_intermediate_path, slam_link_tour, slam_next_step,
    slam_scan_dir, slam_scan_intermediate_dir, slam_scan_jobs_dir, slam_scan_logs_dir,
)

# Same rationale as MAX_CONCURRENT=1 in the splat-transform pipeline (see
# tours/management/commands/process_splat_transforms.py) -- SLAM steps
# (especially compute_slam) are potentially just as memory-heavy, and the
# server has already gone down twice from parallel heavy conversions. No
# measured per-step memory profile yet -- not risking it.
MAX_CONCURRENT = 1
STALL_MINUTES = 120
STARTUP_GRACE_MINUTES = 15
MAX_STALL_RETRIES = 3


def _job_paths(scan_id: int, step: str) -> dict:
    jobs_dir = slam_scan_jobs_dir(scan_id)
    return {
        "dir": jobs_dir,
        "lock": jobs_dir / f"{step}.lock",
        "error": jobs_dir / f"{step}.error",
        "done": jobs_dir / f"{step}.done",
        "context": jobs_dir / f"{step}.context.json",
    }


class Command(BaseCommand):
    help = "Reconcile in-flight SLAM jobs and spawn new ones up to MAX_CONCURRENT."

    def handle(self, *args, **options):
        slam_upload_root = Path(settings.UPLOADS_ROOT) / "slam"
        slam_upload_root.mkdir(parents=True, exist_ok=True)

        self._reconcile_processing()
        spawned = self._spawn_new()
        self.stdout.write(f"Запущено новых job'ов: {spawned}")

    # -------------------------------------------------------------------
    # Pass 1: sort out "processing" jobs -- finished (done/error) or stalled
    # (lock disappeared/hasn't been touched in over STALL_MINUTES without a
    # result).
    # -------------------------------------------------------------------
    def _reconcile_processing(self):
        for job in SlamJob.objects.filter(status="processing").order_by("id"):
            scan_id = job.scan_id
            step = job.pipeline_step
            paths = _job_paths(scan_id, step)

            if paths["error"].is_file():
                msg = paths["error"].read_text(encoding="utf-8", errors="replace")[:2000]
                job.status, job.error_message, job.finished_at = "error", msg, timezone.now()
                job.save(update_fields=["status", "error_message", "finished_at"])
                SlamScan.objects.filter(id=scan_id).update(status="failed", error_message=msg)
                for p in ("error", "lock", "context"):
                    paths[p].unlink(missing_ok=True)
                self.stderr.write(f"Скан #{scan_id}, шаг {step}: ОШИБКА — {msg}")
                continue

            if paths["done"].is_file():
                self._finish_job(job, scan_id, step, paths)
                continue

            # Neither .done nor .error -- either still running, or stalled
            # (process killed by a crash/reboot before its finally ran).
            # Same rationale as in process_copc_conversions.py/
            # process_splat_transforms.py.
            lock_age_min = (time.time() - paths["lock"].stat().st_mtime) / 60 if paths["lock"].is_file() else None
            started_age_min = (timezone.now() - job.started_at).total_seconds() / 60 if job.started_at else 0
            stalled = False
            if lock_age_min is None and started_age_min > STARTUP_GRACE_MINUTES:
                stalled = True
                self.stderr.write(f"Скан #{scan_id}, шаг {step}: завис (лок пропал без результата спустя {round(started_age_min)} мин)")
            elif lock_age_min is not None and lock_age_min > STALL_MINUTES:
                stalled = True
                self.stderr.write(f"Скан #{scan_id}, шаг {step}: завис (лок не обновлялся дольше {STALL_MINUTES} мин)")

            if stalled:
                paths["lock"].unlink(missing_ok=True)
                paths["context"].unlink(missing_ok=True)
                if job.stall_retries + 1 >= MAX_STALL_RETRIES:
                    job.status = "error"
                    job.error_message = f"Шаг зависал {job.stall_retries} раз подряд (сервер перезапускался/процесс убит без завершения) — автоматические попытки остановлены."
                    job.finished_at = timezone.now()
                    job.save(update_fields=["status", "error_message", "finished_at"])
                    self.stderr.write(f"Скан #{scan_id}, шаг {step}: превышен лимит автоповторов ({job.stall_retries}), помечен как error")
                else:
                    job.status = "pending"
                    job.stall_retries += 1
                    job.started_at = None
                    job.save(update_fields=["status", "stall_retries", "started_at"])
                    self.stdout.write(f"Скан #{scan_id}, шаг {step}: будет перезапущен (попытка {job.stall_retries}/{MAX_STALL_RETRIES})")

    def _finish_job(self, job, scan_id, step, paths):
        meta = {}
        try:
            meta = json.loads(paths["done"].read_text(encoding="utf-8") or "{}")
        except (OSError, ValueError):
            pass

        with transaction.atomic():
            job.status, job.finished_at = "done", timezone.now()
            job.save(update_fields=["status", "finished_at"])

            scan_updates = {}
            if "num_points" in meta:
                scan_updates["num_points"] = int(meta["num_points"])
            if "source_format" in meta:
                scan_updates["source_format"] = str(meta["source_format"])
            if "crs_epsg" in meta:
                scan_updates["crs_epsg"] = int(meta["crs_epsg"])
            if "crs_proj4" in meta:
                scan_updates["crs_proj4"] = str(meta["crs_proj4"])
            if "rtk_fixed" in meta:
                scan_updates["rtk_fixed"] = 1 if meta["rtk_fixed"] else 0
            bbox = meta.get("bbox")
            if isinstance(bbox, list) and len(bbox) == 4:
                scan_updates["bbox_min_lon"], scan_updates["bbox_min_lat"], scan_updates["bbox_max_lon"], scan_updates["bbox_max_lat"] = bbox
            if scan_updates:
                SlamScan.objects.filter(id=scan_id).update(**scan_updates)

            for asset in meta.get("assets") or []:
                SlamProcessedAsset.objects.create(
                    scan_id=scan_id, asset_type=asset["type"], step=step,
                    file_path=asset["path"], file_size=int(asset.get("size") or 0),
                )

            for inp in meta.get("inputs") or []:
                SlamScanInput.objects.update_or_create(
                    scan_id=scan_id, kind=inp["kind"],
                    defaults={"file_path": inp["path"], "file_size": int(inp.get("size") or 0)},
                )

            next_step = slam_next_step(step)
            if next_step is not None:
                SlamJob.objects.get_or_create(scan_id=scan_id, pipeline_step=next_step, defaults={"status": "pending"})
            else:
                SlamScan.objects.filter(id=scan_id).update(status="completed")

        # build_octree is the last step: link the finished COPC to the
        # already-existing viewer (Фаза 5 -- the viewer already does
        # everything needed, "just wire it up"). tours.file_path is a
        # relative path inside uploads/tours/, not uploads/slam/, so we
        # copy (not move -- the original stays in slam_processed_assets)
        # the finished COPC into uploads/tours/slam_<scan_id>/ and create/
        # update one tours row per scan.
        if step == "build_octree":
            slam_link_tour(scan_id)

        for p in ("done", "lock", "context"):
            paths[p].unlink(missing_ok=True)
        next_step = slam_next_step(step)
        self.stdout.write(f"Скан #{scan_id}, шаг {step}: готово" + (f", следующий шаг: {next_step}" if next_step else " (пайплайн завершён)"))

    # -------------------------------------------------------------------
    # Pass 2: spawn new jobs (within MAX_CONCURRENT).
    # -------------------------------------------------------------------
    def _spawn_new(self) -> int:
        running_count = SlamJob.objects.filter(status="processing").count()
        self.stdout.write(f"Уже выполняется: {running_count} (лимит {MAX_CONCURRENT})")

        spawned = 0
        upload_dir = Path(settings.UPLOADS_ROOT) / "slam"
        while running_count + spawned < MAX_CONCURRENT:
            with transaction.atomic():
                claim = (
                    SlamJob.objects.select_for_update(skip_locked=True)
                    .filter(status="pending").order_by("id").first()
                )
                if not claim:
                    break
                job_id, scan_id, step = claim.id, claim.scan_id, claim.pipeline_step
                claim.status, claim.started_at, claim.updated_at, claim.error_message = "processing", timezone.now(), timezone.now(), None
                claim.save(update_fields=["status", "started_at", "updated_at", "error_message"])
                SlamScan.objects.filter(id=scan_id).update(status="processing")

            paths = _job_paths(scan_id, step)
            paths["dir"].mkdir(parents=True, exist_ok=True)
            slam_scan_logs_dir(scan_id).mkdir(parents=True, exist_ok=True)
            slam_scan_intermediate_dir(scan_id).mkdir(parents=True, exist_ok=True)

            scan = SlamScan.objects.get(id=scan_id)
            project = SlamProject.objects.get(id=scan.project_id)
            input_rows = list(SlamScanInput.objects.filter(scan_id=scan_id).values("kind", "file_path", "file_size"))

            context = {
                "scan_id": scan_id,
                "step": step,
                "scan_dir": str(slam_scan_dir(scan_id)),
                "raw_file_path": str(upload_dir / scan.raw_file_path) if scan.raw_file_path else None,
                "bag_lidar_enabled": bool(scan.bag_lidar_enabled),
                "skip_georeference": bool(scan.skip_georeference),
                "target_crs_epsg": project.target_crs_epsg,
                "target_crs_wkt": project.target_crs_wkt,
                "crs_proj4": scan.crs_proj4,
                "inputs": [{"kind": r["kind"], "path": str(upload_dir / r["file_path"])} for r in input_rows],
                "intermediate": {s: str(slam_intermediate_path(scan_id, s)) for s in PIPELINE_ORDER},
                "done_file": str(paths["done"]),
                "error_file": str(paths["error"]),
            }
            paths["context"].write_text(json.dumps(context, ensure_ascii=False), encoding="utf-8")
            paths["lock"].touch()

            log_file = slam_scan_logs_dir(scan_id) / f"{step}_{job_id}.log"
            with open(log_file, "a") as log_fh:
                subprocess.Popen(
                    [
                        sys.executable, str(Path(settings.BASE_DIR) / "manage.py"), "slam_step_worker",
                        "--step", step,
                        "--context-file", str(paths["context"]),
                        "--done-file", str(paths["done"]),
                        "--error-file", str(paths["error"]),
                        "--lock-file", str(paths["lock"]),
                    ],
                    stdin=subprocess.DEVNULL, stdout=log_fh, stderr=log_fh,
                    start_new_session=True,
                )
            spawned += 1
            self.stdout.write(f"Запущен шаг: скан #{scan_id}, {step} (job #{job_id})")

        return spawned
