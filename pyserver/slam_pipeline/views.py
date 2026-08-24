"""Port of slam_projects.php + slam_scans.php (admin-only CRUD + upload UI)."""

from pathlib import Path

from django.conf import settings
from django.db.models import Count
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse

from core import auth
from tours.models import Tour

from .models import PIPELINE_ORDER, SlamJob, SlamProject, SlamScan
from .services import slam_step_label


@auth.require_admin_role("admin")
def slam_projects_view(request):
    admin = auth.current_admin(request)
    error = None

    if request.method == "POST":
        action = request.POST.get("action", "")
        if action == "save":
            project_id = int(request.POST.get("id") or 0)
            name = request.POST.get("name", "").strip()
            target_crs_epsg_raw = request.POST.get("target_crs_epsg", "").strip()
            target_crs_wkt = request.POST.get("target_crs_wkt", "").strip()
            target_crs_epsg = int(target_crs_epsg_raw) if target_crs_epsg_raw else None

            if not name:
                error = "Укажите название проекта"
            else:
                if project_id > 0:
                    SlamProject.objects.filter(id=project_id).update(
                        name=name, target_crs_epsg=target_crs_epsg, target_crs_wkt=target_crs_wkt or None,
                    )
                else:
                    SlamProject.objects.create(
                        name=name, target_crs_epsg=target_crs_epsg, target_crs_wkt=target_crs_wkt or None,
                        created_by_id=admin["id"],
                    )
                return redirect("slam_projects")
        elif action == "delete":
            SlamProject.objects.filter(id=int(request.POST.get("id") or 0)).delete()
            return redirect("slam_projects")

    projects = SlamProject.objects.annotate(scan_count=Count("scans")).order_by("-created_at")
    modal_data = {
        p.id: {"name": p.name, "targetCrsEpsg": p.target_crs_epsg or "", "targetCrsWkt": p.target_crs_wkt or ""}
        for p in projects
    }

    return render(request, "slam_pipeline/projects.html", {
        "error": error, "projects": projects, "modal_data": modal_data,
    })


@auth.require_admin_role("admin")
def slam_scans_view(request):
    admin = auth.current_admin(request)
    error = None
    upload_dir = Path(settings.UPLOADS_ROOT) / "slam"
    upload_dir.mkdir(parents=True, exist_ok=True)

    project_id = int(request.GET.get("project_id") or request.POST.get("project_id") or 0)
    project = SlamProject.objects.filter(id=project_id).first()
    if not project:
        return redirect("slam_projects")

    if request.method == "POST":
        action = request.POST.get("action", "")

        if action == "upload":
            name = request.POST.get("name", "").strip()
            existing_file_name = request.POST.get("existing_file", "").strip()
            uploaded = request.FILES.get("scan_zip")
            if not name:
                error = "Укажите название скана"
            elif not uploaded and not existing_file_name:
                error = "Загрузите ZIP-архив (bag + calibration.yaml) или укажите имя уже загруженного файла"
            else:
                scan = SlamScan.objects.create(project=project, name=name, status="uploaded", created_by_id=admin["id"])
                scan_dir = Path(settings.UPLOADS_ROOT) / "slam" / str(scan.id)
                raw_dir = scan_dir / "raw"
                raw_dir.mkdir(parents=True, exist_ok=True)

                raw_rel_path = None
                if uploaded:
                    stored_path = raw_dir / "scan.zip"
                    with open(stored_path, "wb") as fh:
                        for chunk in uploaded.chunks():
                            fh.write(chunk)
                    raw_rel_path = f"{scan.id}/raw/scan.zip"
                else:
                    incoming_path = upload_dir / "_incoming" / existing_file_name
                    if not incoming_path.is_file():
                        error = f'Файл "{existing_file_name}" не найден в uploads/slam/_incoming/ на сервере'
                    else:
                        incoming_path.rename(raw_dir / "scan.zip")
                        raw_rel_path = f"{scan.id}/raw/scan.zip"

                if error is not None or raw_rel_path is None:
                    scan.delete()
                    try:
                        raw_dir.rmdir()
                        scan_dir.rmdir()
                    except OSError:
                        pass
                else:
                    scan.raw_file_path = raw_rel_path
                    scan.save(update_fields=["raw_file_path"])
                    SlamJob.objects.create(scan=scan, pipeline_step="compute_slam", status="pending")
                    return redirect(f"{reverse('slam_scans')}?project_id={project_id}")

        elif action == "delete":
            SlamScan.objects.filter(id=int(request.POST.get("id") or 0), project_id=project_id).delete()
            return redirect(f"{reverse('slam_scans')}?project_id={project_id}")

        elif action == "toggle_skip_georeference":
            # Toggle the GEOREFERENCE bypass and immediately recompute
            # georeference+build_octree with the new setting -- when
            # enabling the bypass also clear crs_proj4/bbox: they'd
            # otherwise still hold the old (RTK-based) alignment, and
            # build_octree would wrongly tag the local SLAM coordinates
            # as UTM with them.
            scan = SlamScan.objects.filter(id=int(request.POST.get("id") or 0), project_id=project_id).first()
            if scan:
                if not scan.skip_georeference:
                    scan.skip_georeference = 1
                    scan.crs_proj4 = None
                    scan.crs_epsg = None
                    scan.bbox_min_lon = scan.bbox_min_lat = scan.bbox_max_lon = scan.bbox_max_lat = None
                    scan.save(update_fields=[
                        "skip_georeference", "crs_proj4", "crs_epsg",
                        "bbox_min_lon", "bbox_min_lat", "bbox_max_lon", "bbox_max_lat",
                    ])
                else:
                    scan.skip_georeference = 0
                    scan.save(update_fields=["skip_georeference"])
                SlamJob.objects.filter(
                    scan_id=scan.id, pipeline_step__in=["georeference", "build_octree"],
                ).update(status="pending", error_message=None, stall_retries=0)
            return redirect(f"{reverse('slam_scans')}?project_id={project_id}")

        elif action == "retry":
            scan_id = int(request.POST.get("id") or 0)
            SlamJob.objects.filter(scan_id=scan_id, status="error").update(
                status="pending", error_message=None, stall_retries=0,
            )
            SlamScan.objects.filter(id=scan_id).update(status="processing", error_message=None)
            return redirect(f"{reverse('slam_scans')}?project_id={project_id}")

    scan_rows = list(SlamScan.objects.filter(project_id=project_id).order_by("-created_at"))
    scan_ids = [s.id for s in scan_rows]

    jobs_by_scan = {}
    for job in SlamJob.objects.filter(scan_id__in=scan_ids).order_by("id"):
        jobs_by_scan.setdefault(job.scan_id, {})[job.pipeline_step] = job

    tours_by_scan = dict(Tour.objects.filter(slam_scan_id__in=scan_ids).values_list("slam_scan_id", "id"))

    scans = []
    for scan in scan_rows:
        job_by_step = jobs_by_scan.get(scan.id, {})
        steps = []
        for step in PIPELINE_ORDER:
            job = job_by_step.get(step)
            steps.append({
                "step": step, "label": slam_step_label(step),
                "status": job.status if job else None,
                "error_message": job.error_message if job else None,
            })
        scans.append({
            "scan": scan, "steps": steps, "tour_id": tours_by_scan.get(scan.id),
        })

    return render(request, "slam_pipeline/scans.html", {
        "error": error, "project": project, "project_id": project_id, "scans": scans,
    })
