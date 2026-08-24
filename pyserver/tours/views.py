"""Direct port of tours.php, tour_files.php, map.php, tour_view.php,
tour_user_upload.php, my_tours.php, tour_export.php, pg_connections.php."""

import json
import re
import time
import uuid
from pathlib import Path

from django.conf import settings
from django.http import (
    Http404, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound, JsonResponse,
)
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone

from core import auth
from users.models import UserSync

from .file_processing import denoise_splat_ply_if_possible, strip_unsupported_ply_header_lines
from .models import PgConnection, Tour, TourAnnotation, TourFile, TourGroup, TourLayer
from storage.services import total_storage_usage_bytes

from .services import (
    external_pg_connect, group_folder_for, pg_upload_large_object,
    tour_collision_url, tour_copc_url, tour_file_url, tour_is_public, tour_sog_url,
)

ALLOWED_EXT = {"ply", "splat", "ksplat", "las"}
UPLOAD_DIR = lambda: Path(settings.UPLOADS_ROOT) / "tours"  # noqa: E731


def _safe_stored_name(prefix: str, orig_name: str) -> str:
    safe = re.sub(r"[^a-zA-Z0-9_.-]", "_", orig_name)
    return f"{prefix}_{uuid.uuid4().hex}_{safe}"


def _process_new_files(new_files: list[dict]):
    for f in new_files:
        if f["file_format"] == "ply":
            abs_path = str(UPLOAD_DIR() / f["file_path"])
            denoise_splat_ply_if_possible(abs_path)
            strip_unsupported_ply_header_lines(abs_path)


@auth.require_admin_role("admin")
def tours_view(request):
    error = None
    admin = auth.current_admin(request)

    if request.method == "POST":
        action = request.POST.get("action", "")

        if action == "save":
            tour_id = int(request.POST.get("id") or 0)
            name = request.POST.get("name", "").strip()
            description = request.POST.get("description", "").strip()
            lat = request.POST.get("lat") or 0
            lon = request.POST.get("lon") or 0
            existing_file_name = request.POST.get("existing_file", "").strip()
            is_enabled = 1 if request.POST.get("is_enabled") else 0
            is_public = 1 if request.POST.get("is_public") else 0
            group_id_raw = request.POST.get("group_id", "")
            new_group_name = request.POST.get("new_group_name", "").strip()

            if not name:
                error = "Укажите название тура"
            else:
                group_id = None
                if group_id_raw == "new":
                    if new_group_name:
                        group, _ = TourGroup.objects.get_or_create(name=new_group_name)
                        group_id = group.id
                elif group_id_raw:
                    group_id = int(group_id_raw)

                group_folder = ""
                if group_id:
                    group = TourGroup.objects.filter(id=group_id).first()
                    if group:
                        group_folder = group_folder_for(group_id, group.name)

                new_files = []
                uploaded = request.FILES.getlist("model_files")

                if uploaded:
                    target_dir = UPLOAD_DIR() / group_folder
                    target_dir.mkdir(parents=True, exist_ok=True)
                    for up in uploaded:
                        ext = up.name.rsplit(".", 1)[-1].lower() if "." in up.name else ""
                        if ext not in ALLOWED_EXT:
                            error = f'Недопустимый формат файла "{up.name}". Разрешено: {", ".join(sorted(ALLOWED_EXT))}'
                            break
                        stored_name = _safe_stored_name("tour", up.name)
                        with open(target_dir / stored_name, "wb") as dst:
                            for chunk in up.chunks():
                                dst.write(chunk)
                        new_files.append({"file_path": group_folder + stored_name, "file_format": ext})
                elif existing_file_name:
                    for name1 in re.split(r"[\r\n]+", existing_file_name):
                        name1 = name1.strip()
                        if not name1:
                            continue
                        ext = name1.rsplit(".", 1)[-1].lower() if "." in name1 else ""
                        if ext not in ALLOWED_EXT:
                            error = f'Недопустимый формат файла "{name1}". Разрешено: {", ".join(sorted(ALLOWED_EXT))}'
                            break
                        if not (UPLOAD_DIR() / name1).is_file():
                            error = f'Файл "{name1}" не найден в uploads/tours/ на сервере'
                            break
                        new_files.append({"file_path": name1, "file_format": ext})
                elif tour_id <= 0:
                    error = "Для нового тура нужно загрузить файл(ы) модели или указать имена уже загруженных файлов"

                if not error:
                    _process_new_files(new_files)

                    file_path = new_files[0]["file_path"] if new_files else None
                    file_format = new_files[0]["file_format"] if new_files else None
                    extra_files = new_files[1:] if new_files else []

                    if tour_id > 0:
                        tour = get_object_or_404(Tour, id=tour_id)
                        tour.name = name
                        tour.description = description or None
                        tour.lat = lat
                        tour.lon = lon
                        tour.is_enabled = is_enabled
                        tour.is_public = is_public
                        tour.group_id = group_id
                        if file_path is not None:
                            tour.file_path = file_path
                            tour.file_format = file_format
                            TourFile.objects.filter(tour_id=tour_id).delete()
                        tour.save()
                    else:
                        tour = Tour.objects.create(
                            name=name, description=description or None, lat=lat, lon=lon,
                            file_path=file_path, file_format=file_format, is_enabled=is_enabled,
                            is_public=is_public, created_by_id=admin["id"], group_id=group_id,
                        )
                    tour_id = tour.id

                    for i, f in enumerate(extra_files):
                        TourFile.objects.create(
                            tour_id=tour_id, file_path=f["file_path"],
                            file_format=f["file_format"], sort_order=i,
                        )

                    return redirect("tours")

        elif action == "delete":
            tour_id = int(request.POST.get("id") or 0)
            tour = Tour.objects.filter(id=tour_id).first()
            if tour:
                if tour.file_path and (UPLOAD_DIR() / tour.file_path).is_file():
                    (UPLOAD_DIR() / tour.file_path).unlink()
                for extra in TourFile.objects.filter(tour_id=tour_id):
                    if extra.file_path and (UPLOAD_DIR() / extra.file_path).is_file():
                        (UPLOAD_DIR() / extra.file_path).unlink()
                tour.delete()
            return redirect("tours")

        elif action == "sync_pg":
            tour_id = int(request.POST.get("id") or 0)
            conn_id = int(request.POST.get("connection_id") or 0)
            tour = Tour.objects.filter(id=tour_id).first()
            profile = PgConnection.objects.filter(id=conn_id).first()

            if not tour or not profile:
                error = "Тур или профиль подключения не найден"
            else:
                local_file = UPLOAD_DIR() / tour.file_path
                try:
                    if not local_file.is_file():
                        raise RuntimeError(f"Файл модели не найден на сервере: {tour.file_path}")
                    _sync_tour_to_external_pg(tour, profile, str(local_file))
                    Tour.objects.filter(id=tour_id).update(
                        pg_connection_id=conn_id, pg_synced_at=timezone.now(), pg_sync_error=None,
                    )
                except Exception as exc:
                    Tour.objects.filter(id=tour_id).update(pg_sync_error=str(exc)[:255])
            return redirect("tours")

    edit = None
    edit_extra_count = 0
    if request.GET.get("edit"):
        edit = Tour.objects.filter(id=int(request.GET["edit"])).first()
        if edit:
            edit_extra_count = TourFile.objects.filter(tour_id=edit.id).count()

    # ORDER BY group (ungrouped last), then name within group -- matches
    # the PHP original's `ORDER BY (g.name IS NULL), g.name, t.name`.
    tours = sorted(
        Tour.objects.select_related("pg_connection", "group").all(),
        key=lambda t: (t.group.name is None if t.group else True, t.group.name if t.group else "", t.name),
    )
    pg_connections = PgConnection.objects.order_by("name")
    tour_groups = TourGroup.objects.order_by("name")

    tours_by_group = {}
    for t in tours:
        key = t.group.name if t.group else "__no_group__"
        entry = tours_by_group.setdefault(key, {"name": t.group.name if t.group else "Без группы", "tours": []})
        entry["tours"].append((t, TourFile.objects.filter(tour_id=t.id).count()))

    return render(request, "tours/list.html", {
        "error": error, "tours_by_group": tours_by_group,
        "pg_connections": pg_connections, "tour_groups": tour_groups,
        "edit": edit, "edit_extra_count": edit_extra_count,
    })


def _sync_tour_to_external_pg(tour, profile, local_file):
    conn = external_pg_connect(profile)
    try:
        with conn.cursor() as cur:
            try:
                cur.execute("CREATE EXTENSION IF NOT EXISTS postgis")
                conn.commit()
            except Exception:
                conn.rollback()  # may lack CREATE EXTENSION rights -- fine if already installed

        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS gaussian_tours (
                    id SERIAL PRIMARY KEY,
                    source_tour_id INTEGER UNIQUE,
                    name TEXT NOT NULL,
                    description TEXT,
                    geom geometry(Point, 4326) NOT NULL,
                    file_format TEXT NOT NULL,
                    model_oid OID,
                    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
                )
            """)
            cur.execute("ALTER TABLE gaussian_tours ADD COLUMN IF NOT EXISTS model_oid OID")
        conn.commit()
        try:
            with conn.cursor() as cur:
                cur.execute("ALTER TABLE gaussian_tours ALTER COLUMN model_data DROP NOT NULL")
            conn.commit()
        except Exception:
            conn.rollback()  # fresh tables have no model_data column at all -- expected

        with conn.cursor() as cur:
            cur.execute("SELECT id, model_oid FROM gaussian_tours WHERE source_tour_id = %s", (tour.id,))
            old_row = cur.fetchone()

            main_oid = pg_upload_large_object(conn, local_file)

            cur.execute("""
                INSERT INTO gaussian_tours (source_tour_id, name, description, geom, file_format, model_oid)
                VALUES (%s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326), %s, %s)
                ON CONFLICT (source_tour_id) DO UPDATE SET
                   name = EXCLUDED.name, description = EXCLUDED.description, geom = EXCLUDED.geom,
                   file_format = EXCLUDED.file_format, model_oid = EXCLUDED.model_oid, uploaded_at = now()
                RETURNING id
            """, (tour.id, tour.name, tour.description, float(tour.lon), float(tour.lat), tour.file_format, main_oid))
            gaussian_tour_id = cur.fetchone()[0]

            if old_row and old_row[1] and old_row[1] != main_oid:
                try:
                    cur.execute("SELECT lo_unlink(%s)", (old_row[1],))
                except Exception:
                    pass

            parts = list(TourFile.objects.filter(tour_id=tour.id).order_by("sort_order").values("file_path", "file_format", "sort_order"))
            if parts:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS gaussian_tour_parts (
                        id SERIAL PRIMARY KEY,
                        gaussian_tour_id INTEGER NOT NULL REFERENCES gaussian_tours(id) ON DELETE CASCADE,
                        sort_order INTEGER NOT NULL DEFAULT 0,
                        file_format TEXT NOT NULL,
                        model_oid OID
                    )
                """)
                cur.execute("ALTER TABLE gaussian_tour_parts ADD COLUMN IF NOT EXISTS model_oid OID")
                try:
                    cur.execute("ALTER TABLE gaussian_tour_parts ALTER COLUMN model_data DROP NOT NULL")
                except Exception:
                    pass

                cur.execute("SELECT model_oid FROM gaussian_tour_parts WHERE gaussian_tour_id = %s", (gaussian_tour_id,))
                for (old_oid,) in cur.fetchall():
                    if old_oid:
                        try:
                            cur.execute("SELECT lo_unlink(%s)", (old_oid,))
                        except Exception:
                            pass
                cur.execute("DELETE FROM gaussian_tour_parts WHERE gaussian_tour_id = %s", (gaussian_tour_id,))

                for part in parts:
                    part_file = UPLOAD_DIR() / part["file_path"]
                    if not part_file.is_file():
                        continue
                    part_oid = pg_upload_large_object(conn, str(part_file))
                    cur.execute(
                        "INSERT INTO gaussian_tour_parts (gaussian_tour_id, sort_order, file_format, model_oid) "
                        "VALUES (%s, %s, %s, %s)",
                        (gaussian_tour_id, part["sort_order"], part["file_format"], part_oid),
                    )
            conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


@auth.require_admin_role("admin")
def tour_files_view(request):
    tour_id = int(request.GET.get("tour_id") or request.POST.get("tour_id") or 0)
    tour = Tour.objects.filter(id=tour_id).first()
    if not tour:
        return redirect("tours")

    error = None
    if request.method == "POST":
        action = request.POST.get("action", "")

        if action == "add":
            existing_file_name = request.POST.get("existing_file", "").strip()
            sort_order = int(request.POST.get("sort_order") or 0)
            file_path = None
            file_format = None

            uploaded = request.FILES.get("model_file")
            if uploaded:
                ext = uploaded.name.rsplit(".", 1)[-1].lower() if "." in uploaded.name else ""
                if ext not in ALLOWED_EXT:
                    error = f"Недопустимый формат файла. Разрешено: {', '.join(sorted(ALLOWED_EXT))}"
                else:
                    UPLOAD_DIR().mkdir(parents=True, exist_ok=True)
                    stored_name = _safe_stored_name("part", uploaded.name)
                    with open(UPLOAD_DIR() / stored_name, "wb") as dst:
                        for chunk in uploaded.chunks():
                            dst.write(chunk)
                    file_path = stored_name
                    file_format = ext
            elif existing_file_name:
                ext = existing_file_name.rsplit(".", 1)[-1].lower() if "." in existing_file_name else ""
                if ext not in ALLOWED_EXT:
                    error = f"Недопустимый формат файла. Разрешено: {', '.join(sorted(ALLOWED_EXT))}"
                elif not (UPLOAD_DIR() / existing_file_name).is_file():
                    error = f'Файл "{existing_file_name}" не найден в uploads/tours/ на сервере'
                else:
                    file_path = existing_file_name
                    file_format = ext
            else:
                error = "Загрузите файл или укажите имя уже загруженного файла"

            if not error:
                TourFile.objects.create(
                    tour_id=tour_id, file_path=file_path, file_format=file_format, sort_order=sort_order,
                )
                return redirect(f"{reverse('tour_files')}?tour_id={tour_id}")

        elif action == "delete":
            file_id = int(request.POST.get("id") or 0)
            tf = TourFile.objects.filter(id=file_id, tour_id=tour_id).first()
            if tf and tf.file_path and (UPLOAD_DIR() / tf.file_path).is_file():
                (UPLOAD_DIR() / tf.file_path).unlink()
            TourFile.objects.filter(id=file_id, tour_id=tour_id).delete()
            return redirect(f"{reverse('tour_files')}?tour_id={tour_id}")

        elif action == "move":
            file_id = int(request.POST.get("id") or 0)
            direction = request.POST.get("direction", "")
            file_list = list(TourFile.objects.filter(tour_id=tour_id).order_by("sort_order", "id"))
            index = next((i for i, f in enumerate(file_list) if f.id == file_id), None)
            swap_with = (index - 1) if direction == "up" else (index + 1 if index is not None else None)
            if index is not None and swap_with is not None and 0 <= swap_with < len(file_list):
                a, b = file_list[index], file_list[swap_with]
                a.sort_order, b.sort_order = b.sort_order, a.sort_order
                a.save(update_fields=["sort_order"])
                b.save(update_fields=["sort_order"])
            return redirect(f"{reverse('tour_files')}?tour_id={tour_id}")

    files = list(TourFile.objects.filter(tour_id=tour_id).order_by("sort_order", "id"))
    return render(request, "tours/tour_files.html", {"error": error, "tour": tour, "files": files})


@auth.require_login
def map_view(request):
    admin = auth.current_admin(request)
    is_admin = bool(admin and admin["role"] == "admin")
    tour_groups = TourGroup.objects.order_by("name") if is_admin else []
    return render(request, "map.html", {"is_admin": is_admin, "tour_groups_for_map": tour_groups})


def tour_view_view(request):
    tour_id = int(request.GET.get("tour") or request.GET.get("id") or 0)
    if not tour_is_public(tour_id):
        if not (auth.current_user(request) or auth.current_admin(request)):
            return redirect("login")
    admin = auth.current_admin(request)
    is_admin = bool(admin and admin["role"] == "admin")
    viewer_bundle = Path(settings.ASSETS_ROOT) / "viewer" / "tour-viewer.js"
    viewer_ver = int(viewer_bundle.stat().st_mtime) if viewer_bundle.is_file() else int(time.time())
    return render(request, "tour_view.html", {
        "tour_id": tour_id, "is_admin": is_admin, "viewer_ver": viewer_ver,
    })


@auth.require_login
def tour_user_upload_view(request):
    if request.method != "POST":
        return redirect("map")

    def fail(message):
        return HttpResponseBadRequest(f'<div class="alert alert-danger">{message}</div>')

    max_bytes = 2 * 1024 * 1024 * 1024  # 2GB
    upload_dir = UPLOAD_DIR() / "user"

    name = request.POST.get("name", "").strip()
    description = request.POST.get("description", "").strip()
    lat = float(request.POST.get("lat") or 0)
    lon = float(request.POST.get("lon") or 0)

    if not name:
        return fail("Укажите название")
    if lat == 0.0 and lon == 0.0:
        return fail("Не указаны координаты — кликните правой кнопкой по карте, чтобы выбрать точку")

    uploaded = request.FILES.getlist("model_files")
    if not uploaded:
        return fail("Загрузите хотя бы один файл модели (.ply / .splat / .ksplat / .las)")

    total_size = sum(f.size for f in uploaded)
    if total_size > max_bytes:
        return fail(f"Суммарный размер файлов ({total_size / (1024**3):.2f} ГБ) превышает лимит 2 ГБ для пользовательской загрузки")

    plain_user_for_quota = auth.current_user(request)
    if plain_user_for_quota and not auth.current_admin(request):
        quota = UserSync.objects.filter(id=plain_user_for_quota["id"]).values_list(
            "storage_quota_bytes", flat=True
        ).first()
        if quota is not None:
            used = total_storage_usage_bytes(None, plain_user_for_quota)
            if used + total_size > quota:
                free = max(quota - used, 0)
                return fail(
                    f"Недостаточно места в хранилище: доступно {free / (1024**3):.2f} ГБ из "
                    f"{quota / (1024**3):.2f} ГБ (использовано {used / (1024**3):.2f} ГБ)"
                )

    upload_dir.mkdir(parents=True, exist_ok=True)

    new_files = []
    for up in uploaded:
        ext = up.name.rsplit(".", 1)[-1].lower() if "." in up.name else ""
        if ext not in ALLOWED_EXT:
            return fail(f'Недопустимый формат файла "{up.name}". Разрешено: {", ".join(sorted(ALLOWED_EXT))}')
        stored_name = _safe_stored_name("user", up.name)
        with open(upload_dir / stored_name, "wb") as dst:
            for chunk in up.chunks():
                dst.write(chunk)
        new_files.append({"file_path": "user/" + stored_name, "file_format": ext})

    _process_new_files(new_files)

    file_path = new_files[0]["file_path"]
    file_format = new_files[0]["file_format"]
    extra_files = new_files[1:]

    admin = auth.current_admin(request)
    user = auth.current_user(request)

    tour = Tour.objects.create(
        name=name, description=description or None, lat=lat, lon=lon,
        file_path=file_path, file_format=file_format, is_enabled=1,
        created_by_id=(admin["id"] if admin else None),
        created_by_user_id=(None if admin else (user["id"] if user else None)),
    )

    for i, f in enumerate(extra_files):
        TourFile.objects.create(tour_id=tour.id, file_path=f["file_path"], file_format=f["file_format"], sort_order=i)

    return HttpResponse("OK")


@auth.require_login
def my_tours_view(request):
    admin = auth.current_admin(request)
    plain_user = auth.current_user(request)

    if admin:
        owner_filter = {"created_by_id": admin["id"]}
    else:
        owner_filter = {"created_by_user_id": (plain_user["id"] if plain_user else 0)}

    error = None
    if request.method == "POST":
        action = request.POST.get("action", "")
        tour_id = int(request.POST.get("id") or 0)
        tour = Tour.objects.filter(id=tour_id, **owner_filter).first()

        if not tour:
            error = "Тур не найден или не принадлежит вам"
        elif action == "update":
            name = request.POST.get("name", "").strip()
            description = request.POST.get("description", "").strip()
            if not name:
                error = "Укажите название"
            else:
                tour.name = name
                tour.description = description or None
                tour.save(update_fields=["name", "description"])
                return redirect("my_tours")
        elif action == "delete":
            if tour.file_path and (UPLOAD_DIR() / tour.file_path).is_file():
                (UPLOAD_DIR() / tour.file_path).unlink()
            for extra in TourFile.objects.filter(tour_id=tour_id):
                if extra.file_path and (UPLOAD_DIR() / extra.file_path).is_file():
                    (UPLOAD_DIR() / extra.file_path).unlink()
            tour.delete()
            return redirect("my_tours")

    tours = Tour.objects.filter(**owner_filter).order_by("-created_at")

    storage_quota = None
    storage_used = None
    if not admin and plain_user:
        storage_quota = UserSync.objects.filter(id=plain_user["id"]).values_list(
            "storage_quota_bytes", flat=True
        ).first()
        if storage_quota is not None:
            storage_used = total_storage_usage_bytes(None, plain_user)

    return render(request, "tours/my_tours.html", {
        "error": error, "tours": tours,
        "storage_quota": storage_quota, "storage_used": storage_used,
    })


def tour_export_view(request):
    tour_id = int(request.GET.get("tour_id") or 0)
    if not tour_is_public(tour_id):
        if not (auth.current_user(request) or auth.current_admin(request)):
            return redirect("login")

    tour = Tour.objects.filter(id=tour_id).only("name").first()
    if not tour:
        return HttpResponseNotFound("Тур не найден")

    layers = TourLayer.objects.filter(tour_id=tour_id).order_by("sort_order", "id")

    def dxf_true_color(hex_color: str) -> int:
        hex_color = hex_color.lstrip("#")
        if len(hex_color) != 6:
            return 0xFFFFFF
        try:
            return int(hex_color, 16)
        except ValueError:
            return 0xFFFFFF

    dxf = ["0", "SECTION", "2", "TABLES", "0", "TABLE", "2", "LAYER"]
    for layer in layers:
        dxf += ["0", "LAYER", "2", layer.name or f"Layer{layer.id}", "62", "7",
                "420", str(dxf_true_color(layer.color)), "70", "0"]
    dxf += ["0", "ENDTAB", "0", "ENDSEC"]

    dxf += ["0", "SECTION", "2", "ENTITIES"]
    for layer in layers:
        layer_name = layer.name or f"Layer{layer.id}"
        true_color = dxf_true_color(layer.color)
        for anno in TourAnnotation.objects.filter(layer_id=layer.id).order_by("id"):
            points = json.loads(anno.coordinates)
            if not points:
                continue
            if anno.geom_type == "point":
                p = points[0]
                dxf += ["0", "POINT", "8", layer_name, "420", str(true_color),
                        "10", str(p[0]), "20", str(p[1]), "30", str(p[2] if len(p) > 2 else 0)]
            else:
                dxf += ["0", "POLYLINE", "8", layer_name, "420", str(true_color),
                        "66", "1", "70", "9" if anno.geom_type == "polygon" else "8"]
                for p in points:
                    dxf += ["0", "VERTEX", "8", layer_name, "10", str(p[0]), "20", str(p[1]),
                            "30", str(p[2] if len(p) > 2 else 0)]
                dxf += ["0", "SEQEND"]
    dxf += ["0", "ENDSEC", "0", "EOF"]

    file_name = re.sub(r"[^a-zA-Z0-9_-]", "_", tour.name) + ".dxf"
    response = HttpResponse("\n".join(dxf) + "\n", content_type="application/dxf")
    response["Content-Disposition"] = f'attachment; filename="{file_name}"'
    return response


@auth.require_admin_role("admin")
def pg_connections_view(request):
    error = None
    test_result = None
    admin = auth.current_admin(request)

    if request.method == "POST":
        action = request.POST.get("action", "")

        if action == "save":
            conn_id = int(request.POST.get("id") or 0)
            name = request.POST.get("name", "").strip()
            host = request.POST.get("host", "").strip()
            port = int(request.POST.get("port") or 5432)
            dbname = request.POST.get("dbname", "").strip()
            username = request.POST.get("username", "").strip()
            password = request.POST.get("password", "")
            sslmode = request.POST.get("sslmode", "prefer").strip() or "prefer"
            is_default = 1 if request.POST.get("is_default") else 0

            if not name or not host or not dbname or not username or port <= 0:
                error = "Заполните обязательные поля: название, хост, порт, база, пользователь"
            else:
                if is_default:
                    PgConnection.objects.update(is_default=0)
                if conn_id > 0:
                    conn = get_object_or_404(PgConnection, id=conn_id)
                    conn.name, conn.host, conn.port = name, host, port
                    conn.dbname, conn.username = dbname, username
                    conn.sslmode, conn.is_default = sslmode, is_default
                    if password:
                        conn.password = password
                    conn.save()
                else:
                    if not password:
                        error = "Укажите пароль для нового профиля"
                    else:
                        PgConnection.objects.create(
                            name=name, host=host, port=port, dbname=dbname, username=username,
                            password=password, sslmode=sslmode, is_default=is_default,
                            created_by_id=admin["id"],
                        )
                if not error:
                    return redirect("pg_connections")

        elif action == "delete":
            PgConnection.objects.filter(id=int(request.POST.get("id") or 0)).delete()
            return redirect("pg_connections")

        elif action == "test":
            profile = PgConnection.objects.filter(id=int(request.POST.get("id") or 0)).first()
            if not profile:
                test_result = {"ok": False, "name": "—", "message": "Профиль не найден"}
            else:
                try:
                    conn = external_pg_connect(profile)
                    try:
                        with conn.cursor() as cur:
                            cur.execute("SELECT 1")
                    finally:
                        conn.close()
                    test_result = {"ok": True, "name": profile.name, "message": "Соединение успешно установлено"}
                except Exception as exc:
                    test_result = {"ok": False, "name": profile.name, "message": str(exc)}

    edit = None
    if request.GET.get("edit"):
        edit = PgConnection.objects.filter(id=int(request.GET["edit"])).first()

    connections = PgConnection.objects.order_by("name")
    return render(request, "tours/pg_connections.html", {
        "error": error, "test_result": test_result, "edit": edit, "connections": connections,
        "sslmodes": ["disable", "allow", "prefer", "require", "verify-ca", "verify-full"],
    })


def api_tours_view(request):
    # Full list (no ?id=) is always login-only. A single ?id= works
    # without login if that specific tour is explicitly published
    # (tour_is_public) -- so tour_view.php can pull tour data
    # anonymously via a direct link.
    requested_id = request.GET.get("id")
    requested_id = int(requested_id) if requested_id else None

    if requested_id is None or not tour_is_public(requested_id):
        if not (auth.current_user(request) or auth.current_admin(request)):
            return redirect("login")
    if requested_id is not None:
        qs = Tour.objects.filter(is_enabled=1, id=requested_id)
    else:
        qs = Tour.objects.filter(is_enabled=1)

    rows = []
    for t in qs:
        file_paths = [t.file_path] + list(
            TourFile.objects.filter(tour_id=t.id).order_by("sort_order").values_list("file_path", flat=True)
        )
        copc_urls = [tour_copc_url(p) for p in file_paths]
        sog_urls = [tour_sog_url(p) for p in file_paths]
        collision_urls = [tour_collision_url(p) for p in file_paths]
        rows.append({
            "id": t.id, "name": t.name, "description": t.description,
            "lat": float(t.lat), "lon": float(t.lon),
            "file_url": tour_file_url(file_paths[0]),
            "file_urls": [tour_file_url(p) for p in file_paths],
            "copc_urls": copc_urls, "sog_urls": sog_urls, "collision_urls": collision_urls,
            "model_type": "pointcloud" if t.file_format == "las" else "splat",
        })
    return JsonResponse({"tours": rows})


def api_tour_annotations_view(request):
    if request.method == "GET":
        tour_id = int(request.GET.get("tour_id") or 0)
        # Viewing layers/annotations -- any logged-in user, or anonymous if
        # this specific tour is published via direct link. Mutating actions
        # below (POST) stay admin-only ALWAYS -- a public link only ever
        # grants viewing, never editing.
        if not tour_is_public(tour_id):
            if not (auth.current_user(request) or auth.current_admin(request)):
                return redirect("login")

        layers = []
        for layer in TourLayer.objects.filter(tour_id=tour_id).order_by("sort_order", "id"):
            annotations = []
            for a in TourAnnotation.objects.filter(layer_id=layer.id).order_by("id"):
                annotations.append({
                    "id": a.id, "layer_id": a.layer_id, "geom_type": a.geom_type,
                    "coordinates": json.loads(a.coordinates), "label": a.label,
                })
            layers.append({
                "id": layer.id, "name": layer.name, "color": layer.color,
                "is_visible": bool(layer.is_visible), "sort_order": layer.sort_order,
                "annotations": annotations,
            })
        return JsonResponse({"layers": layers})

    # All mutating actions -- admin only (same as the rest of tour management).
    admin = auth.current_admin(request)
    if not admin or admin["role"] != "admin":
        return JsonResponse({"error": "Forbidden"}, status=403)

    try:
        payload = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        payload = {}
    action = payload.get("action", "")

    try:
        if action == "create_layer":
            tour_id = int(payload.get("tour_id") or 0)
            name = str(payload.get("name", "")).strip()
            color = str(payload.get("color", "#ff3b30"))
            if tour_id <= 0 or not name:
                raise ValueError("Укажите тур и название слоя")
            next_order = (
                TourLayer.objects.filter(tour_id=tour_id).order_by("-sort_order")
                .values_list("sort_order", flat=True).first()
            )
            layer = TourLayer.objects.create(
                tour_id=tour_id, name=name, color=color,
                sort_order=(next_order + 1) if next_order is not None else 0,
            )
            return JsonResponse({"id": layer.id})

        elif action == "toggle_layer":
            layer_id = int(payload.get("id") or 0)
            layer = TourLayer.objects.filter(id=layer_id).first()
            if layer:
                layer.is_visible = 0 if layer.is_visible else 1
                layer.save(update_fields=["is_visible"])
            return JsonResponse({"ok": True})

        elif action == "delete_layer":
            TourLayer.objects.filter(id=int(payload.get("id") or 0)).delete()  # annotations cascade
            return JsonResponse({"ok": True})

        elif action == "save_annotation":
            layer_id = int(payload.get("layer_id") or 0)
            geom_type = str(payload.get("geom_type", ""))
            coordinates = payload.get("coordinates")
            label = str(payload.get("label", "")).strip()
            if layer_id <= 0 or geom_type not in ("point", "polyline", "polygon") or not isinstance(coordinates, list) or not coordinates:
                raise ValueError("Некорректные данные аннотации")
            anno = TourAnnotation.objects.create(
                layer_id=layer_id, geom_type=geom_type,
                coordinates=json.dumps(coordinates), label=label or None,
            )
            return JsonResponse({"id": anno.id})

        elif action == "delete_annotation":
            TourAnnotation.objects.filter(id=int(payload.get("id") or 0)).delete()
            return JsonResponse({"ok": True})

        elif action == "update_annotation":
            anno_id = int(payload.get("id") or 0)
            if anno_id <= 0:
                raise ValueError("Некорректный id аннотации")
            fields = {}
            if "coordinates" in payload:
                if not isinstance(payload["coordinates"], list) or not payload["coordinates"]:
                    raise ValueError("Некорректные координаты")
                fields["coordinates"] = json.dumps(payload["coordinates"])
            if "layer_id" in payload:
                fields["layer_id"] = int(payload["layer_id"])
            if "label" in payload:
                fields["label"] = str(payload["label"]).strip() or None
            if not fields:
                raise ValueError("Нет полей для обновления")
            TourAnnotation.objects.filter(id=anno_id).update(**fields)
            return JsonResponse({"ok": True})

        else:
            return JsonResponse({"error": "Неизвестное действие"}, status=400)
    except Exception as exc:
        return JsonResponse({"error": str(exc)}, status=400)
