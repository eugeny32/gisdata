"""Direct port of stations.php (admin CRUD + "poll now") and
api/stations_status.php (JSON feed for the map/mini-map)."""

import json

from django.http import JsonResponse
from django.shortcuts import redirect, render

from apps.core import auth

from .models import Station, StationStatus
from .services import poll_stations


@auth.require_admin_role("admin")
def stations_view(request):
    error = None
    poll_result = None

    if request.method == "POST":
        action = request.POST.get("action", "")

        if action == "poll_now":
            to_poll = list(Station.objects.filter(is_enabled=1))
            counts = poll_stations(to_poll)
            poll_result = "РћРїСЂРѕС€РµРЅРѕ СЃС‚Р°РЅС†РёР№: {} (online: {}, offline: {})".format(
                len(to_poll), counts.get("online", 0), counts.get("offline", 0),
            )

        elif action == "save":
            station_id = int(request.POST.get("id") or 0)
            name = request.POST.get("name", "").strip()
            host = request.POST.get("host", "").strip()
            port = int(request.POST.get("port") or 2101)
            mountpoint = request.POST.get("mountpoint", "").strip()
            ntrip_user = request.POST.get("ntrip_user", "").strip()
            ntrip_password = request.POST.get("ntrip_password", "")
            lat = request.POST.get("lat") or 0
            lon = request.POST.get("lon") or 0
            rinex_path = request.POST.get("rinex_path", "").strip()
            comment = request.POST.get("comment", "").strip()
            is_enabled = 1 if request.POST.get("is_enabled") else 0

            if not name or not host or not mountpoint or port <= 0:
                error = "Р—Р°РїРѕР»РЅРёС‚Рµ РѕР±СЏР·Р°С‚РµР»СЊРЅС‹Рµ РїРѕР»СЏ: РЅР°Р·РІР°РЅРёРµ, С…РѕСЃС‚, РїРѕСЂС‚, С‚РѕС‡РєР° РїРѕРґРєР»СЋС‡РµРЅРёСЏ (mountpoint)"
            else:
                fields = dict(
                    name=name, host=host, port=port, mountpoint=mountpoint,
                    ntrip_user=ntrip_user or None, ntrip_password=ntrip_password or None,
                    lat=lat, lon=lon, rinex_path=rinex_path or None,
                    comment=comment or None, is_enabled=is_enabled,
                )
                if station_id > 0:
                    Station.objects.filter(id=station_id).update(**fields)
                else:
                    station = Station.objects.create(**fields)
                    StationStatus.objects.create(station=station, status="unknown")
                return redirect("stations")

        elif action == "delete":
            station_id = int(request.POST.get("id") or 0)
            Station.objects.filter(id=station_id).delete()
            return redirect("stations")

    stations = (
        Station.objects.select_related("status").order_by("name")
    )
    modal_data = {}
    for s in stations:
        try:
            status = s.status
        except StationStatus.DoesNotExist:
            status = None
        modal_data[s.id] = {
            "name": s.name, "host": s.host, "port": s.port, "mountpoint": s.mountpoint,
            "ntripUser": s.ntrip_user or "", "ntripPassword": s.ntrip_password or "",
            "lat": str(s.lat), "lon": str(s.lon), "rinexPath": s.rinex_path or "",
            "comment": s.comment or "", "isEnabled": bool(s.is_enabled),
        }

    return render(request, "stations/list.html", {
        "error": error, "poll_result": poll_result, "stations": stations,
        "modal_data_json": json.dumps(modal_data, ensure_ascii=False),
    })


@auth.require_login
def api_stations_status(request):
    rows = []
    qs = Station.objects.filter(is_enabled=1).select_related("status")
    for s in qs:
        try:
            st = s.status
        except StationStatus.DoesNotExist:
            st = None
        rows.append({
            "id": s.id, "name": s.name, "station_code": s.station_code,
            "host": s.host, "port": s.port, "mountpoint": s.mountpoint,
            "lat": float(s.lat), "lon": float(s.lon), "comment": s.comment,
            "status": (st.status if st else "unknown"),
            "last_check_at": st.last_check_at if st else None,
            "last_data_at": st.last_data_at if st else None,
            "bytes_received": st.bytes_received if st else 0,
            "last_error": st.last_error if st else None,
            "ftp_checked_at": st.ftp_checked_at if st else None,
            "ftp_last_data_at": st.ftp_last_data_at if st else None,
        })
    return JsonResponse({"stations": rows})
