"""Direct port of rinex.php, rinex_download_zip.php,
rinex_request_download.php, rinex_requests.php."""

import os
import re
import tempfile
import uuid
import zipfile
from datetime import datetime, timedelta
from pathlib import Path

from django.conf import settings
from django.http import FileResponse, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.shortcuts import redirect, render

from core import auth
from stations.models import Station

from .rinex_gen.nav_file import (
    rgen_dates_in_range, rgen_download_nav_for_day, rgen_filter_nav_to_gps_glonass,
    rgen_filter_nav_to_rinex4, rgen_parse_nav_file,
)
from .rinex_gen.obs_writer import (
    rgen_build_gisdata_obs, rgen_build_rinex2_obs, rgen_build_rinex3_obs, rgen_merge_ephemerides,
)
from .gnss_ftp import gnss_day_folder, gnss_ftp_connect, gnss_ftp_list_files, gnss_parse_file_timestamp, utcnow_naive
from .models import RinexRequest

RINEX_MAX_DAYS = 31
RINEX_MAX_FILES = 3000
RINEX_ZIP_MAX_FILES = 3000

_VALID_ZIP_PATH_RE = re.compile(r'^\d{3}\([0-9]{4}\)/[A-Za-z0-9_]+/[A-Za-z0-9_.\-]+$')


def human_size(num_bytes) -> str:
    if num_bytes is None:
        return ""
    units = ["Б", "КБ", "МБ", "ГБ"]
    i = 0
    size = float(num_bytes)
    while size >= 1024 and i < len(units) - 1:
        size /= 1024
        i += 1
    return f"{round(size, 1)} {units[i]}"


def _validate_form(selected_stations, date_from_str, date_to_str):
    if not selected_stations:
        return None, None, "Выберите хотя бы одну станцию"
    if not date_from_str or not date_to_str:
        return None, None, "Укажите период (UTC)"
    try:
        date_from = datetime.fromisoformat(date_from_str)
        date_to = datetime.fromisoformat(date_to_str)
    except ValueError:
        return None, None, "Некорректная дата/время"
    if date_from > date_to:
        return None, None, "Начало периода позже конца"
    days = (date_to.date() - date_from.date()).days + 1
    if days > RINEX_MAX_DAYS:
        return None, None, f"Слишком широкий диапазон ({days} дней) — максимум {RINEX_MAX_DAYS} дней за один раз, сузьте период"
    return date_from, date_to, None


@auth.require_login
def rinex_view(request):
    admin = auth.current_admin(request)
    all_stations = list(Station.objects.order_by("name").values_list("name", flat=True))

    prefill_station = request.GET.get("station", "")
    now_utc = utcnow_naive()

    intent = request.POST.get("intent", "")
    if request.method == "POST":
        selected_stations = [s for s in request.POST.getlist("stations") if s]
        if not selected_stations and prefill_station:
            selected_stations = [prefill_station]
        date_from_str = request.POST.get("date_from", "")
        date_to_str = request.POST.get("date_to", "")
        selected_types = [t for t in request.POST.getlist("types") if t]
        merge_by_day = bool(request.POST.get("merge_by_day"))
    else:
        selected_stations = [prefill_station] if prefill_station else []
        if prefill_station:
            date_from_str = (now_utc - timedelta(hours=24)).strftime("%Y-%m-%dT%H:00")
            date_to_str = now_utc.strftime("%Y-%m-%dT%H:00")
        else:
            date_from_str = ""
            date_to_str = ""
        selected_types = ["mo", "mn"]
        merge_by_day = True

    error = None
    results: dict[str, dict[str, list]] = {}
    result_count = 0
    truncated = False

    if intent == "create_request":
        date_from, date_to, error = _validate_form(selected_stations, date_from_str, date_to_str)
        if not error and not selected_types:
            error = "Выберите хотя бы один тип файлов"
        if not error:
            RinexRequest.objects.create(
                created_by_id=admin["id"] if admin else None,
                stations=",".join(selected_stations),
                date_from_utc=date_from.replace(second=0, microsecond=0),
                date_to_utc=date_to.replace(second=0, microsecond=0),
                want_obs=1 if "mo" in selected_types else 0,
                want_nav=1 if "mn" in selected_types else 0,
                merge_by_day=1 if merge_by_day else 0,
            )
            return redirect("rinex_requests")

    elif intent == "search":
        date_from, date_to, error = _validate_form(selected_stations, date_from_str, date_to_str)
        if not error:
            ftp = gnss_ftp_connect()
            if ftp is None:
                error = "Не удалось подключиться к FTP-серверу GNSS-данных (gnss.host) — попробуйте позже"
            else:
                try:
                    cursor = date_from.replace(hour=0, minute=0, second=0, microsecond=0)
                    last_day = date_to.replace(hour=0, minute=0, second=0, microsecond=0)
                    stop = False
                    while cursor <= last_day and not stop:
                        day_folder = gnss_day_folder(cursor)
                        for station in selected_stations:
                            for f in gnss_ftp_list_files(ftp, day_folder, station):
                                ts = gnss_parse_file_timestamp(f["name"])
                                if ts is None or ts < date_from or ts > date_to:
                                    continue
                                name_lower = f["name"].lower()
                                is_obs = "_mo." in name_lower
                                is_nav = "_mn." in name_lower
                                if is_obs and "mo" not in selected_types:
                                    continue
                                if is_nav and "mn" not in selected_types:
                                    continue
                                if result_count >= RINEX_MAX_FILES:
                                    truncated = True
                                    stop = True
                                    break
                                f["size_human"] = human_size(f["size"])
                                results.setdefault(day_folder, {}).setdefault(station, []).append(f)
                                result_count += 1
                            if stop:
                                break
                        cursor += timedelta(days=1)
                finally:
                    ftp.close()

    return render(request, "rinex/query.html", {
        "all_stations": all_stations, "selected_stations": selected_stations,
        "date_from": date_from_str, "date_to": date_to_str,
        "selected_types": selected_types, "merge_by_day": merge_by_day,
        "error": error, "intent": intent, "results": results,
        "result_count": result_count, "truncated": truncated,
        "rinex_max_days": RINEX_MAX_DAYS, "rinex_max_files": RINEX_MAX_FILES,
        "human_size": human_size,
    })


@auth.require_login
def rinex_download_zip_view(request):
    paths = [p for p in request.POST.getlist("files") if p]
    if not paths:
        return HttpResponseBadRequest("Не выбрано ни одного файла")
    if len(paths) > RINEX_ZIP_MAX_FILES:
        return HttpResponseBadRequest(f"Слишком много файлов за один раз (максимум {RINEX_ZIP_MAX_FILES})")

    # Paths come from the client (checkbox values) -- without strict format
    # validation this would be an arbitrary-path FTP-fetch hole. Format is
    # always "{day-of-year}({MMDD})/{STATION}/{filename}" -- see
    # gnss_day_folder()/gnss_ftp_list_files() -- no "..", no "/" inside components.
    for p in paths:
        if not _VALID_ZIP_PATH_RE.match(p):
            return HttpResponseBadRequest("Недопустимый путь файла")

    ftp = gnss_ftp_connect()
    if ftp is None:
        return HttpResponse("Не удалось подключиться к FTP-серверу GNSS-данных", status=502)

    tmp_dir = Path(tempfile.gettempdir()) / f"rinex_zip_{uuid.uuid4().hex}"
    tmp_dir.mkdir(mode=0o700, parents=True, exist_ok=True)
    zip_path = tmp_dir / "rinex.zip"

    try:
        with zipfile.ZipFile(zip_path, "w") as zf:
            for i, remote_path in enumerate(paths):
                parts = remote_path.split("/")
                station = parts[1] if len(parts) > 1 else "file"
                file_name = parts[2] if len(parts) > 2 else f"file_{i}"
                local_tmp = tmp_dir / f"dl_{i}"
                try:
                    with open(local_tmp, "wb") as fh:
                        ftp.retrbinary(f"RETR /{remote_path}", fh.write)
                    zf.write(local_tmp, f"{station}_{file_name}")
                except OSError:
                    pass
                finally:
                    local_tmp.unlink(missing_ok=True)
    finally:
        ftp.close()

    if not zip_path.is_file() or zip_path.stat().st_size == 0:
        zip_path.unlink(missing_ok=True)
        tmp_dir.rmdir()
        return HttpResponse("Не удалось собрать архив — ни один файл не скачался с FTP", status=502)

    response = FileResponse(open(zip_path, "rb"), content_type="application/zip")
    response["Content-Disposition"] = f'attachment; filename="rinex_{utcnow_naive().strftime("%Y%m%d_%H%M%S")}.zip"'

    def _cleanup():
        zip_path.unlink(missing_ok=True)
        try:
            tmp_dir.rmdir()
        except OSError:
            pass

    response._resource_closers.append(_cleanup)
    return response


@auth.require_login
def rinex_requests_view(request):
    admin = auth.current_admin(request)
    owner_id = admin["id"] if admin else 0

    if request.method == "POST" and request.POST.get("action") == "delete":
        req_id = int(request.POST.get("id") or 0)
        rr = RinexRequest.objects.filter(id=req_id).first()
        if rr and rr.result_path:
            full = Path(settings.UPLOADS_ROOT) / "rinex_results" / rr.result_path
            full.unlink(missing_ok=True)
        RinexRequest.objects.filter(id=req_id).delete()
        return redirect("rinex_requests")

    requests_qs = RinexRequest.objects.filter(created_by_id=owner_id).order_by("-created_at")[:200]
    return render(request, "rinex/requests.html", {"requests": requests_qs})


@auth.require_login
def rinex_request_download_view(request):
    admin = auth.current_admin(request)
    req_id = int(request.GET.get("id") or 0)
    rr = RinexRequest.objects.filter(
        id=req_id, created_by_id=(admin["id"] if admin else 0), status="done"
    ).first()
    if not rr or not rr.result_path:
        return HttpResponseNotFound("Запрос не найден или ещё не готов")

    full_path = Path(settings.UPLOADS_ROOT) / "rinex_results" / rr.result_path
    if not full_path.is_file():
        return HttpResponseNotFound("Файл результата не найден на сервере")

    response = FileResponse(open(full_path, "rb"), content_type="application/zip")
    response["Content-Disposition"] = f'attachment; filename="rinex_request_{req_id}.zip"'
    return response

# --- Synthetic RINEX generator (rinex_generate.php) -----------------------

import gzip
import re as _re
import tempfile as _tempfile
import time as _time
from datetime import datetime as _datetime, timezone as _timezone


def rgen_parse_stations_input(text: str) -> list[dict]:
    """Parses the "Name, X, Y, Z" textarea, one station per line."""
    stations = []
    for raw_line in _re.split(r"\r\n|\r|\n", text.strip()):
        line = raw_line.strip()
        if not line:
            continue
        parts = [p.strip() for p in line.split(",")]
        if len(parts) < 4:
            raise ValueError(f'Строка "{line}" — нужно 4 поля: Имя, X, Y, Z')
        name, x, y, z = parts[0], parts[1], parts[2], parts[3]
        try:
            xf, yf, zf = float(x), float(y), float(z)
        except ValueError:
            raise ValueError(f'Некорректная строка станции: "{line}"')
        if not name:
            raise ValueError(f'Некорректная строка станции: "{line}"')
        stations.append({"name": name, "ecef": (xf, yf, zf)})
    if not stations:
        raise ValueError("Укажите хотя бы одну станцию")
    return stations


def _parse_utc_naive_local_input(value: str) -> int:
    """datetime-local input ("YYYY-MM-DDTHH:MM") -> Unix timestamp,
    treating the value as UTC wall-clock time (matches the PHP original's
    explicit `strtotime($input . ' UTC')`)."""
    dt = _datetime.fromisoformat(value)
    return int(dt.replace(tzinfo=_timezone.utc).timestamp())


@auth.require_admin_role("admin")
def rinex_generate_view(request):
    error = None
    stations_input = "STA1, 2849854.398, 2169707.184, 5249164.598\n"
    now = _time.time()
    start_input = _datetime.fromtimestamp(now - 3600, tz=_timezone.utc).strftime("%Y-%m-%dT%H:%M")
    end_input = _datetime.fromtimestamp(now, tz=_timezone.utc).strftime("%Y-%m-%dT%H:%M")
    gps_only = False
    rinex_version = "2"
    generator_version = "default"

    if request.method == "POST":
        stations_input = request.POST.get("stations", "")
        start_input = request.POST.get("start", "")
        end_input = request.POST.get("end", "")
        gps_only = bool(request.POST.get("gps_only"))
        rinex_version = request.POST.get("rinex_version", "2")
        if rinex_version not in ("3", "4"):
            rinex_version = "2"
        generator_version = "gisdata" if request.POST.get("generator_version") == "gisdata" else "default"

        try:
            stations = rgen_parse_stations_input(stations_input)

            start_unix = _parse_utc_naive_local_input(start_input)
            end_unix = _parse_utc_naive_local_input(end_input)
            if end_unix <= start_unix:
                raise ValueError("Конец периода должен быть позже начала")
            if end_unix - start_unix > 7 * 86400:
                raise ValueError("Максимальный период генерации — 7 суток (иначе файл будет огромным, а расчёт — слишком долгим)")

            # Ephemerides are needed for every UTC day the period covers.
            day_files = []
            nav_paths: dict[str, str] = {}
            missing_days = []
            for day_start in rgen_dates_in_range(start_unix, end_unix):
                nav_path = rgen_download_nav_for_day(day_start)
                if nav_path is None:
                    missing_days.append(_time.strftime("%Y-%m-%d", _time.gmtime(day_start)))
                    continue
                with open(nav_path, "r", encoding="latin-1") as fh:
                    day_files.append(rgen_parse_nav_file(fh.read()))
                nav_paths[_time.strftime("%Y%m%d", _time.gmtime(day_start))] = nav_path

            # Fallback: if auto-download failed for every day and the user
            # attached their own nav file -- use it (single-day periods only).
            manual_nav_content = None
            uploaded = request.FILES.get("nav_file")
            if missing_days and uploaded:
                manual_bytes = uploaded.read()
                if uploaded.name.lower().endswith(".gz"):
                    try:
                        manual_bytes = gzip.decompress(manual_bytes)
                    except OSError:
                        pass
                manual_text = manual_bytes.decode("latin-1")
                if "RINEX" in manual_text:
                    day_files.append(rgen_parse_nav_file(manual_text))
                    manual_nav_content = manual_text
                    missing_days = []

            if missing_days:
                raise RuntimeError(
                    "Не удалось автоматически загрузить эфемериды за: " + ", ".join(missing_days) + ". "
                    "Проверьте доступ сервера в интернет до источников из настроек "
                    "(RINEX_SYNTH_NAV_URL_TEMPLATES), либо приложите navigation-файл вручную ниже и "
                    "повторите (резерв работает только для периода в пределах одних суток)."
                )

            eph = rgen_merge_ephemerides(day_files)
            if not eph["gps"] and not eph["glonass"]:
                raise RuntimeError("В загруженных эфемеридах не нашлось ни одной записи GPS/ГЛОНАСС — файл не подходит")

            # Classic short RINEX2 name (ssssdddf.yyO).
            gt_start = _time.gmtime(start_unix)
            doy3 = gt_start.tm_yday
            yy = gt_start.tm_year % 100

            use_gisdata_mode = generator_version == "gisdata"
            if use_gisdata_mode:
                rinex_version = "2"
                gps_only = True

            files: dict[str, bytes] = {}
            used_station_codes: set[str] = set()
            for st in stations:
                if use_gisdata_mode:
                    content = rgen_build_gisdata_obs(st["name"], st["ecef"], start_unix, end_unix, eph)
                elif rinex_version == "4":
                    content = rgen_build_rinex3_obs(st["name"], st["ecef"], start_unix, end_unix, eph, gps_only, 4.00)
                elif rinex_version == "3":
                    content = rgen_build_rinex3_obs(st["name"], st["ecef"], start_unix, end_unix, eph, gps_only, 3.04)
                else:
                    content = rgen_build_rinex2_obs(st["name"], st["ecef"], start_unix, end_unix, eph, gps_only)

                if rinex_version in ("3", "4"):
                    safe_name = _re.sub(r"[^A-Za-z0-9_-]", "_", st["name"])
                    files[f"{safe_name}_{_time.strftime('%Y%m%d', gt_start)}.rnx"] = content.encode("utf-8")
                else:
                    alnum = _re.sub(r"[^A-Za-z0-9]", "", st["name"]).upper()
                    station_code = ("XXXX" + alnum)[-4:]
                    if station_code in used_station_codes:
                        for suffix in "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ":
                            candidate = station_code[:3] + suffix
                            if candidate not in used_station_codes:
                                station_code = candidate
                                break
                    used_station_codes.add(station_code)
                    files[f"{station_code}{doy3:03d}0.{yy:02d}O"] = content.encode("utf-8")

            # Broadcast ephemerides packed alongside the observations.
            for date_key, nav_path in nav_paths.items():
                day_unix = calendar_timegm_ymd(date_key)
                gt_day = _time.gmtime(day_unix)
                with open(nav_path, "r", encoding="latin-1") as fh:
                    raw_nav = fh.read()
                if rinex_version == "4":
                    files[f"brdc{gt_day.tm_yday:03d}0_{gt_day.tm_year % 100:02d}.rnx"] = rgen_filter_nav_to_rinex4(raw_nav).encode("utf-8")
                else:
                    files[f"brdc{gt_day.tm_yday:03d}0.{gt_day.tm_year % 100:02d}p"] = rgen_filter_nav_to_gps_glonass(raw_nav).encode("utf-8")

            if manual_nav_content is not None:
                if rinex_version == "4":
                    files[f"brdc{doy3:03d}0_{yy:02d}.rnx"] = rgen_filter_nav_to_rinex4(manual_nav_content).encode("utf-8")
                else:
                    files[f"brdc{doy3:03d}0.{yy:02d}p"] = rgen_filter_nav_to_gps_glonass(manual_nav_content).encode("utf-8")

            tmp = _tempfile.NamedTemporaryFile(suffix=".zip", delete=False)
            tmp.close()
            with zipfile.ZipFile(tmp.name, "w") as zf:
                for fname, content in files.items():
                    zf.writestr(fname, content)

            response = FileResponse(open(tmp.name, "rb"), content_type="application/zip")
            response["Content-Disposition"] = f'attachment; filename="rinex_synth_{_time.strftime("%Y%m%d", gt_start)}.zip"'
            response._resource_closers.append(lambda: os.unlink(tmp.name))
            return response
        except (ValueError, RuntimeError) as exc:
            error = str(exc)

    return render(request, "rinex/generate.html", {
        "error": error, "stations_input": stations_input,
        "start_input": start_input, "end_input": end_input,
        "gps_only": gps_only, "rinex_version": rinex_version,
        "generator_version": generator_version,
    })


def calendar_timegm_ymd(date_key: str) -> int:
    """"YYYYMMDD" -> Unix timestamp at 00:00 UTC that day."""
    import calendar
    year, month, day = int(date_key[0:4]), int(date_key[4:6]), int(date_key[6:8])
    return calendar.timegm((year, month, day, 0, 0, 0, 0, 0, 0))
