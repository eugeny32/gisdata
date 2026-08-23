"""
Port of facade_cad.php/topo_cad.php/facade_foto.php (gate pages, iframe
onto the pre-built vendored SPA bundles under assets/) and ctfadmin.php
(admin-only gate onto the CtFВ·ADMIN Node oversight service), plus the
three session-persistence JSON APIs (api/facade_cad_session.php/
api/topo_cad_session.php/api/facade_foto_session.php) -- see
cad/services.py for the shared EntityJSON<->PostGIS conversion.
"""

import json

from django.conf import settings
from django.db import transaction
from django.http import (
    HttpResponse,
    HttpResponseBadRequest,
    HttpResponseNotAllowed,
    JsonResponse,
)
from django.shortcuts import render

from apps.core import auth
from apps.users.models import UserSync

from .models import (
    FacadeCadEntity,
    FacadeCadSession,
    FacadeFotoSession,
    TopoCadEntity,
    TopoCadSession,
)
from .services import entity_row_to_json, entity_to_geom


def _service_enabled(user, field: str) -> bool:
    return bool(
        UserSync.objects.filter(id=user["id"]).values_list(field, flat=True).first()
    )


@auth.require_login
def facade_cad_view(request):
    admin = auth.current_admin(request)
    user = auth.current_user(request)
    if not admin and not _service_enabled(user, "facade_cad_enabled"):
        return HttpResponse(
            "403 Forbidden: СѓСЃР»СѓРіР° FACADEВ·CAD РЅРµ РїРѕРґРєР»СЋС‡РµРЅР° РґР»СЏ РІР°С€РµРіРѕ Р°РєРєР°СѓРЅС‚Р° вЂ” РѕР±СЂР°С‚РёС‚РµСЃСЊ Рє Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂСѓ.",
            status=403,
        )
    return render(request, "cad_sessions/iframe_tool.html", {
        "frame_id": "facadeCadFrame", "frame_src": "/assets/facade-cad/index.html",
        "frame_title": "FACADEВ·CAD", "frame_icon": "bi-rulers",
    })


@auth.require_login
def topo_cad_view(request):
    admin = auth.current_admin(request)
    user = auth.current_user(request)
    if not admin and not _service_enabled(user, "topo_cad_enabled"):
        return HttpResponse(
            "403 Forbidden: СѓСЃР»СѓРіР° TOPOВ·CAD РЅРµ РїРѕРґРєР»СЋС‡РµРЅР° РґР»СЏ РІР°С€РµРіРѕ Р°РєРєР°СѓРЅС‚Р° вЂ” РѕР±СЂР°С‚РёС‚РµСЃСЊ Рє Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂСѓ.",
            status=403,
        )
    return render(request, "cad_sessions/iframe_tool.html", {
        "frame_id": "topoCadFrame", "frame_src": "/assets/topo-cad/index.html",
        "frame_title": "TOPOВ·CAD", "frame_icon": "bi-signpost-2",
    })


@auth.require_login
def facade_foto_view(request):
    admin = auth.current_admin(request)
    user = auth.current_user(request)
    if not admin and not _service_enabled(user, "facade_foto_enabled"):
        return HttpResponse(
            "403 Forbidden: СѓСЃР»СѓРіР° FACADEВ·FOTO РЅРµ РїРѕРґРєР»СЋС‡РµРЅР° РґР»СЏ РІР°С€РµРіРѕ Р°РєРєР°СѓРЅС‚Р° вЂ” РѕР±СЂР°С‚РёС‚РµСЃСЊ Рє Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂСѓ.",
            status=403,
        )
    return render(request, "cad_sessions/iframe_tool.html", {
        "frame_id": "facadeFotoFrame", "frame_src": "/assets/facade-foto/index.html",
        "frame_title": "FACADEВ·FOTO", "frame_icon": "bi-image",
    })


@auth.require_admin_role("admin")
def ctfadmin_view(request):
    ctf_pass = settings.CTFADMIN_ADMIN_PASS
    if not ctf_pass:
        return HttpResponse("500: CTFADMIN_ADMIN_PASS РЅРµ Р·Р°РґР°РЅ РІ .env", status=500)
    return render(request, "cad_sessions/ctfadmin.html", {"ctf_pass": ctf_pass})


def _session_owner(request):
    """(admin_dict_or_None, user_dict_or_None) -- caller decides the 401/403
    gate and which FK column to use, mirroring the PHP originals' shared
    $admin/$user/$ownerCol pattern."""
    admin = auth.current_admin(request)
    user = auth.current_user(request)
    return admin, user


def api_facade_cad_session_view(request):
    admin, user = _session_owner(request)
    if not admin and not user:
        return JsonResponse({"error": "login required"}, status=401)
    if not admin and not _service_enabled(user, "facade_cad_enabled"):
        return JsonResponse({"error": "facade_cad not enabled for this account"}, status=403)

    owner_kwargs = {"admin_id": admin["id"]} if admin else {"user_id": user["id"]}

    if request.method == "GET":
        session = FacadeCadSession.objects.filter(**owner_kwargs).first()
        if not session:
            return JsonResponse({})
        entities = []
        for row in session.entities.order_by("id"):
            e = entity_row_to_json(row.kind, row.layer, row.geom, row.extra)
            if e:
                entities.append(e)
        return JsonResponse({
            "cloud_name": session.cloud_name, "layers": session.layers_json,
            "entities": entities, "ucs": session.ucs_json,
        }, json_dumps_params={"ensure_ascii": False})

    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    return _save_cad_session(request, admin, user, owner_kwargs, FacadeCadSession, FacadeCadEntity)


def api_topo_cad_session_view(request):
    admin, user = _session_owner(request)
    if not admin and not user:
        return JsonResponse({"error": "login required"}, status=401)
    if not admin and not _service_enabled(user, "topo_cad_enabled"):
        return JsonResponse({"error": "topo_cad not enabled for this account"}, status=403)

    owner_kwargs = {"admin_id": admin["id"]} if admin else {"user_id": user["id"]}

    if request.method == "GET":
        session = TopoCadSession.objects.filter(**owner_kwargs).first()
        if not session:
            return JsonResponse({})
        entities = []
        for row in session.entities.order_by("id"):
            e = entity_row_to_json(row.kind, row.layer, row.geom, row.extra)
            if e:
                entities.append(e)
        return JsonResponse({
            "cloud_name": session.cloud_name, "layers": session.layers_json,
            "entities": entities, "ucs": session.ucs_json,
        }, json_dumps_params={"ensure_ascii": False})

    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    return _save_cad_session(request, admin, user, owner_kwargs, TopoCadSession, TopoCadEntity)


def _valid_json_or_default(v, default: str) -> str:
    if not isinstance(v, str) or v == "":
        return default
    try:
        json.loads(v)
    except (ValueError, TypeError):
        return default
    return v


def _save_cad_session(request, admin, user, owner_kwargs, session_model, entity_model):
    """Shared upsert body for the facade_cad/topo_cad POST handlers --
    payload is always a FULL snapshot (client never sends patches):
    entities are wholesale replaced (DELETE + INSERT), simpler and more
    robust than diffing at the volumes a CAD session actually reaches
    (tens-hundreds of objects, not thousands)."""
    try:
        input_data = json.loads(request.body or b"{}")
    except (ValueError, TypeError):
        input_data = {}
    if not isinstance(input_data, dict):
        input_data = {}

    layers_json = _valid_json_or_default(input_data.get("layers"), "{}")
    ucs_json = _valid_json_or_default(input_data.get("ucs"), "{}")
    cloud_name = str(input_data.get("cloud_name") or "").strip() or None
    entities = input_data.get("entities")
    entities = entities if isinstance(entities, list) else []

    try:
        with transaction.atomic():
            # cloud_name uses COALESCE(new, existing) semantics from the PHP
            # original -- only overwrite it if the client actually sent one.
            existing = session_model.objects.filter(**owner_kwargs).first()
            resolved_cloud_name = cloud_name if cloud_name is not None else (existing.cloud_name if existing else None)
            if existing:
                existing.cloud_name = resolved_cloud_name
                existing.layers_json = layers_json
                existing.ucs_json = ucs_json
                existing.save(update_fields=["cloud_name", "layers_json", "ucs_json", "updated_at"])
                session = existing
            else:
                session = session_model.objects.create(
                    **owner_kwargs, cloud_name=resolved_cloud_name,
                    layers_json=layers_json, ucs_json=ucs_json,
                )
            session.entities.all().delete()

            saved = 0
            for e in entities:
                if not isinstance(e, dict):
                    continue
                result = entity_to_geom(e)
                if not result:
                    continue
                geom, extra = result
                entity_model.objects.create(
                    session=session, kind=e["k"], layer=str(e.get("l", "0")),
                    geom=geom, extra=extra,
                )
                saved += 1

        return JsonResponse({"ok": True, "entities": saved})
    except Exception as exc:
        return JsonResponse({"error": str(exc)}, status=400, json_dumps_params={"ensure_ascii": False})


def api_facade_foto_session_view(request):
    admin, user = _session_owner(request)
    if not admin and not user:
        return JsonResponse({"error": "login required"}, status=401)
    if not admin and not _service_enabled(user, "facade_foto_enabled"):
        return JsonResponse({"error": "facade_foto not enabled for this account"}, status=403)

    owner_kwargs = {"admin_id": admin["id"]} if admin else {"user_id": user["id"]}

    if request.method == "GET":
        session = FacadeFotoSession.objects.filter(**owner_kwargs).first()
        return JsonResponse(session.session_json if session else {})

    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        payload = json.loads(request.body or b"{}")
    except (ValueError, TypeError):
        return JsonResponse({"error": "invalid JSON"}, status=400)

    FacadeFotoSession.objects.update_or_create(**owner_kwargs, defaults={"session_json": payload})
    return JsonResponse({"ok": True})



