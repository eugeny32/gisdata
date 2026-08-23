"""
Port of bin/process_slam_jobs.php. Two-pass orchestrator for the SLAM
pipeline (see apps/slam/models.py::PIPELINE_ORDER):

  Pass 1 -- Reap:
    For every SlamJob in `processing` state, check for sidecar files
    written by slam_step_worker:
      jobs/<step>.done   -> JSON result from the worker
      jobs/<step>.error  -> traceback text on failure
    On success: parse result, update job to `done`, insert SlamProcessedAsset
    and SlamScanInput rows, update scan metadata (num_points, source_format,
    bbox, crs), create the next pipeline step's SlamJob, and call
    slam_link_tour() if this was build_octree.
    On failure: update job to `error` with the error text.
    On stall: if no .lock exists or it is older than STALL_MINUTES, reset
    job to `pending` and increment stall_retries. If stall_retries exceeds
    MAX_STALL_RETRIES, mark as `error` instead.

  Pass 2 -- Spawn:
    Claim ONE pending job using select_for_update(skip_locked=True) so that
    multiple orchestrator instances (or a future distributed lock) never
    double-claim. Write the context JSON + .lock sidecar, then spawn
    slam_step_worker as a detached subprocess (start_new_session=True).
    Only one job per run -- same as the PHP original's MAX_CONCURRENT=1.

Constants match the PHP original exactly.
"""

import json
import logging
import subprocess
import sys
import time
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.slam.models import PIPELINE_ORDER, SlamJob, SlamProcessedAsset, SlamScan, SlamScanInput
from apps.slam.services import slam_link_tour, slam_next_step
from apps.slam.pipeline.steps import STEP_FUNCS

logger = logging.getLogger(__name__)

MAX_CONCURRENT = 1
STALL_MINUTES = 120
STARTUP_GRACE_MINUTES = 15
MAX_STALL_RETRIES = 3


class Command(BaseCommand):
    help = "Orchestrate the SLAM pipeline: reap sidecars, advance jobs, spawn workers."

    def handle(self, *args, **options):
        now = timezone.now()
        self._reap(now)
        self._spawn(now)

    # ------------------------------------------------------------------
    # Pass 1: Reap finished / stalled jobs
    # ------------------------------------------------------------------
    def _reap(self, now):
        processing_jobs = SlamJob.objects.select_related("scan").filter(status="processing")
        reaped = 0
        for job in processing_jobs:
            scan = job.scan
            jobs_dir = Path(settings.UPLOADS_ROOT) / "slam" / str(scan.id) / "jobs"
            done_file = jobs_dir / f"{job.pipeline_step}.done"
            error_file = jobs_dir / f"{job.pipeline_step}.error"
            lock_file = jobs_dir / f"{job.pipeline_step}.lock"

            if done_file.is_file():
                reaped += self._handle_done(job, done_file)
                continue

            if error_file.is_file():
                reaped += self._handle_error(job, error_file)
                continue

            # Neither done nor error -- check for stall
            if self._is_stalled(lock_file, now):
                reaped += self._handle_stall(job, lock_file, now)
                continue

        if reaped:
            self.stdout.write(f"Reaped {reaped} jobs")
        else:
            self.stdout.write("No jobs to reap")

    def _handle_done(self, job, done_file):
        try:
            result = json.loads(done_file.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError) as exc:
            self.stderr.write(f"Job {job.id}: bad .done file ({exc}), treating as error")
            job.status = "error"
            job.error_message = f"Bad .done file: {exc}"
            job.finished_at = timezone.now()
            job.save(update_fields=["status", "error_message", "finished_at"])
            return 1

        with transaction.atomic():
            job.status = "done"
            job.finished_at = timezone.now()
            job.save(update_fields=["status", "finished_at"])

            scan = job.scan

            # Insert processed assets from result
            for asset in result.get("assets", []):
                SlamProcessedAsset.objects.create(
                    scan=scan,
                    asset_type=asset.get("type", "intermediate_laz"),
                    step=job.pipeline_step,
                    file_path=asset["path"],
                    file_size=asset.get("size", 0),
                )

            # Insert scan inputs from result
            for inp in result.get("inputs", []):
                SlamScanInput.objects.create(
                    scan=scan,
                    kind=inp["kind"],
                    file_path=inp["path"],
                    file_size=inp.get("size", 0),
                )

            # Update scan metadata from result
            if result.get("num_points"):
                scan.num_points = result["num_points"]
            if result.get("source_format"):
                scan.source_format = result["source_format"]
            if result.get("crs_proj4"):
                scan.crs_proj4 = result["crs_proj4"]
            if result.get("bbox"):
                bbox = result["bbox"]
                if bbox.get("min_lon") is not None:
                    scan.bbox_min_lon = bbox["min_lon"]
                if bbox.get("min_lat") is not None:
                    scan.bbox_min_lat = bbox["min_lat"]
                if bbox.get("max_lon") is not None:
                    scan.bbox_max_lon = bbox["max_lon"]
                if bbox.get("max_lat") is not None:
                    scan.bbox_max_lat = bbox["max_lat"]
            scan.save(update_fields=["num_points", "source_format", "crs_proj4",
                                      "bbox_min_lon", "bbox_min_lat", "bbox_max_lon", "bbox_max_lat"])

            # Create the next pipeline step job
            next_step = slam_next_step(job.pipeline_step)
            if next_step:
                SlamJob.objects.create(scan=scan, pipeline_step=next_step, status="pending")

            # Final step: link tour
            if job.pipeline_step == "build_octree":
                slam_link_tour(scan.id)
                scan.status = "completed"
                scan.save(update_fields=["status"])

        # Clean up sidecars
        done_file.unlink(missing_ok=True)
        lock_file.unlink(missing_ok=True)

        self.stdout.write(f"Job {job.id} ({job.pipeline_step}) done")
        return 1

    def _handle_error(self, job, error_file):
        try:
            error_text = error_file.read_text(encoding="utf-8", errors="replace")
        except OSError:
            error_text = "Unknown error (could not read .error file)"

        with transaction.atomic():
            job.status = "error"
            job.error_message = error_text[:2000]
            job.finished_at = timezone.now()
            job.save(update_fields=["status", "error_message", "finished_at"])

            # Mark scan as failed on first error (no auto-retry of the whole scan)
            job.scan.status = "failed"
            job.scan.error_message = error_text[:500]
            job.scan.save(update_fields=["status", "error_message"])

        error_file.unlink(missing_ok=True)
        lock_file = Path(settings.UPLOADS_ROOT) / "slam" / str(job.scan.id) / "jobs" / f"{job.pipeline_step}.lock"
        lock_file.unlink(missing_ok=True)

        self.stderr.write(f"Job {job.id} ({job.pipeline_step}) error: {error_text[:200]}")
        return 1

    def _is_stalled(self, lock_file, now):
        if not lock_file.is_file():
            return False
        lock_age = now - timezone.make_aware(timezone.datetime.fromtimestamp(lock_file.stat().st_mtime))
        lock_age_min = lock_age.total_seconds() / 60
        return lock_age_min > STALL_MINUTES

    def _handle_stall(self, job, lock_file, now):
        job.stall_retries += 1
        if job.stall_retries >= MAX_STALL_RETRIES:
            job.status = "error"
            job.error_message = f"Job stalled {job.stall_retries} times -- giving up"
            job.scan.status = "failed"
            job.scan.error_message = f"Pipeline stalled on step {job.pipeline_step}"
            job.scan.save(update_fields=["status", "error_message"])
        else:
            job.status = "pending"
            job.started_at = None
            job.finished_at = None
            self.stdout.write(f"Job {job.id} ({job.pipeline_step}) stalled, resetting to pending (retry {job.stall_retries}/{MAX_STALL_RETRIES})")
        job.save(update_fields=["status", "stall_retries", "started_at", "finished_at", "error_message"])
        lock_file.unlink(missing_ok=True)
        return 1

    # ------------------------------------------------------------------
    # Pass 2: Spawn one worker
    # ------------------------------------------------------------------
    def _spawn(self, now):
        with transaction.atomic():
            job = (
                SlamJob.objects.select_for_update(skip_locked=True)
                .filter(status="pending")
                .order_by("id")
                .first()
            )
        if job is None:
            self.stdout.write("No pending jobs to spawn")
            return

        scan = job.scan
        scan_dir = Path(settings.UPLOADS_ROOT) / "slam" / str(scan.id)
        jobs_dir = scan_dir / "jobs"
        jobs_dir.mkdir(parents=True, exist_ok=True)

        context = self._build_context(job)
        context_path = jobs_dir / f"{job.pipeline_step}.context.json"
        done_file = jobs_dir / f"{job.pipeline_step}.done"
        error_file = jobs_dir / f"{job.pipeline_step}.error"
        lock_file = jobs_dir / f"{job.pipeline_step}.lock"

        # Clean up any stale sidecars from a previous attempt
        done_file.unlink(missing_ok=True)
        error_file.unlink(missing_ok=True)
        lock_file.unlink(missing_ok=True)

        context_path.write_text(json.dumps(context, indent=2), encoding="utf-8")

        with transaction.atomic():
            job.status = "processing"
            job.started_at = timezone.now()
            job.updated_at = timezone.now()
            job.save(update_fields=["status", "started_at", "updated_at"])
            scan.status = "processing"
            scan.save(update_fields=["status"])

        log_file = Path(settings.UPLOADS_ROOT) / "slam_logs" / f"{scan.id}_{job.pipeline_step}.log"
        log_file.parent.mkdir(parents=True, exist_ok=True)

        cmd = [
            sys.executable,
            str(Path(settings.BASE_DIR) / "manage.py"),
            "slam_step_worker",
            "--step", job.pipeline_step,
            "--context-file", str(context_path),
            "--done-file", str(done_file),
            "--error-file", str(error_file),
            "--lock-file", str(lock_file),
        ]

        with open(log_file, "a") as log_fh:
            subprocess.Popen(
                cmd,
                stdin=subprocess.DEVNULL,
                stdout=log_fh,
                stderr=subprocess.STDOUT,
                start_new_session=True,
            )

        self.stdout.write(f"Spawned step {job.pipeline_step} for scan {scan.id} (job {job.id})")

    def _build_context(self, job):
        scan = job.scan
        scan_dir = Path(settings.UPLOADS_ROOT) / "slam" / str(scan.id)

        # Gather existing inputs from previous steps
        inputs = []
        for inp in scan.inputs.all().order_by("id"):
            inputs.append({
                "kind": inp.kind,
                "path": inp.file_path,
                "size": inp.file_size,
            })

        # Gather intermediate file paths for all steps up to and including
        # the current one
        intermediate = {}
        for step in PIPELINE_ORDER:
            if step == job.pipeline_step or step in PIPELINE_ORDER[:PIPELINE_ORDER.index(job.pipeline_step)]:
                intermediate[step] = str(scan_dir / "intermediate" / f"{step}.las")

        project = scan.project
        return {
            "scan_id": scan.id,
            "scan_dir": str(scan_dir),
            "raw_file_path": str(Path(settings.UPLOADS_ROOT) / scan.raw_file_path) if scan.raw_file_path else None,
            "bag_lidar_enabled": bool(scan.bag_lidar_enabled),
            "skip_georeference": bool(scan.skip_georeference),
            "target_crs_epsg": project.target_crs_epsg if project else None,
            "target_crs_wkt": project.target_crs_wkt if project else None,
            "crs_proj4": scan.crs_proj4,
            "inputs": inputs,
            "intermediate": intermediate,
        }


