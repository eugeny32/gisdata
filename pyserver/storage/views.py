"""
File-manager ("проводник") page + JSON API. Every endpoint resolves the
caller via core.auth (admin XOR plain user, see that module's dual-identity
model), then confines all filesystem access to that owner's root through
storage.services.safe_join() -- or, for someone else's files, only within
the exact SharedAccess grant (see resolve_shared_grant()).
"""

from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404, HttpResponse, JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_POST

from core import auth
from core.models import Admin
from users.models import UserSync

from .models import SharedAccess
from .services import (
    list_dir, owner_root, resolve_shared_grant, safe_join,
    search_platform_accounts, total_storage_usage_bytes,
)


def _actor(request):
    return auth.current_admin(request), auth.current_user(request)


def _target_root(request, admin, user):
    """Resolves whose storage root a request is browsing: the caller's own
    (default), or -- given ?shared_by_admin=/?shared_by_user= -- someone
    else's, gated by a SharedAccess grant that covers the requested path."""
    shared_by_admin_id = request.GET.get("shared_by_admin") or request.POST.get("shared_by_admin")
    shared_by_user_id = request.GET.get("shared_by_user") or request.POST.get("shared_by_user")
    relpath = request.GET.get("path") or request.POST.get("path") or ""

    if not shared_by_admin_id and not shared_by_user_id:
        return owner_root(admin, user), True  # (root, can_write -- always true for your own files)

    grant = resolve_shared_grant(
        shared_by_admin_id or None, shared_by_user_id or None, admin, user, relpath,
    )
    if not grant:
        return None, False

    owner_admin = {"id": grant.shared_by_admin_id} if grant.shared_by_admin_id else None
    owner_user = {"id": grant.shared_by_user_id} if grant.shared_by_user_id else None
    return owner_root(owner_admin, owner_user), grant.can_write


@auth.require_login
def explorer_view(request):
    admin, user = auth.current_admin(request), auth.current_user(request)
    storage_used = total_storage_usage_bytes(admin, user)
    storage_quota = None
    if user and not admin:
        storage_quota = UserSync.objects.filter(id=user["id"]).values_list(
            "storage_quota_bytes", flat=True
        ).first()
    shared_with_me = []
    grants = SharedAccess.objects.filter(
        shared_with_admin_id=admin["id"] if admin else None,
        shared_with_user_id=user["id"] if (user and not admin) else None,
    ).select_related("shared_by_admin", "shared_by_user").order_by("-created_at")
    for g in grants:
        shared_with_me.append({
            "shared_by_admin": g.shared_by_admin_id,
            "shared_by_user": g.shared_by_user_id,
            "shared_by_admin_label": (g.shared_by_admin.full_name or g.shared_by_admin.login) if g.shared_by_admin else None,
            "shared_by_user_label": (g.shared_by_user.gl_name or g.shared_by_user.user_name) if g.shared_by_user else None,
            "path": g.path,
        })
    return render(request, "storage/explorer.html", {
        "storage_used": storage_used, "storage_quota": storage_quota,
        "shared_with_me": shared_with_me,
    })


@auth.require_login
def api_list_view(request):
    admin, user = _actor(request)
    root, _ = _target_root(request, admin, user)
    if root is None:
        return JsonResponse({"error": "Нет доступа"}, status=403)
    relpath = request.GET.get("path", "")
    try:
        safe_join(root, relpath)  # validates the path even for an empty listing
    except ValueError:
        return JsonResponse({"error": "Недопустимый путь"}, status=400)
    return JsonResponse({"entries": list_dir(root, relpath)})


@auth.require_login
@require_POST
def api_mkdir_view(request):
    admin, user = _actor(request)
    root, can_write = _target_root(request, admin, user)
    if root is None or not can_write:
        return JsonResponse({"error": "Нет доступа"}, status=403)
    name = (request.POST.get("name") or "").strip()
    if not name or "/" in name or name in (".", ".."):
        return JsonResponse({"error": "Недопустимое имя папки"}, status=400)
    try:
        target = safe_join(root, request.POST.get("path", ""))
        (target / name).mkdir(parents=False, exist_ok=False)
    except ValueError:
        return JsonResponse({"error": "Недопустимый путь"}, status=400)
    except FileExistsError:
        return JsonResponse({"error": "Папка с таким именем уже существует"}, status=400)
    return JsonResponse({"ok": True})


@auth.require_login
@require_POST
def api_upload_view(request):
    admin, user = _actor(request)
    if request.POST.get("shared_by_admin") or request.POST.get("shared_by_user"):
        return JsonResponse({"error": "Загрузка в чужое хранилище недоступна"}, status=403)

    uploaded = request.FILES.getlist("files")
    if not uploaded:
        return JsonResponse({"error": "Файлы не выбраны"}, status=400)

    if user and not admin:
        quota = UserSync.objects.filter(id=user["id"]).values_list("storage_quota_bytes", flat=True).first()
        if quota is not None:
            used = total_storage_usage_bytes(admin, user)
            incoming = sum(f.size for f in uploaded)
            if used + incoming > quota:
                free = max(quota - used, 0)
                return JsonResponse({
                    "error": (
                        f"Недостаточно места в хранилище: доступно {free / (1024**3):.2f} ГБ из "
                        f"{quota / (1024**3):.2f} ГБ (использовано {used / (1024**3):.2f} ГБ)"
                    )
                }, status=400)

    root = owner_root(admin, user)
    try:
        target_dir = safe_join(root, request.POST.get("path", ""))
    except ValueError:
        return JsonResponse({"error": "Недопустимый путь"}, status=400)
    if not target_dir.is_dir():
        return JsonResponse({"error": "Целевая папка не найдена"}, status=400)

    saved = []
    for f in uploaded:
        name = Path(f.name).name  # strip any client-supplied directory components
        dest = target_dir / name
        with open(dest, "wb") as out:
            for chunk in f.chunks():
                out.write(chunk)
        saved.append(name)
    return JsonResponse({"ok": True, "saved": saved})


@auth.require_login
@require_POST
def api_rename_view(request):
    """Also doubles as "move": new_path may point into a different
    subfolder, not just a new name in the same one."""
    admin, user = _actor(request)
    root = owner_root(admin, user)
    old_path = request.POST.get("path", "")
    new_path = request.POST.get("new_path", "")
    if not old_path or not new_path:
        return JsonResponse({"error": "Не указан путь"}, status=400)
    try:
        src = safe_join(root, old_path)
        dst = safe_join(root, new_path)
    except ValueError:
        return JsonResponse({"error": "Недопустимый путь"}, status=400)
    if not src.exists():
        return JsonResponse({"error": "Файл или папка не найдены"}, status=404)
    if dst.exists():
        return JsonResponse({"error": "Файл или папка с таким именем уже существуют"}, status=400)
    dst.parent.mkdir(parents=True, exist_ok=True)
    src.rename(dst)

    # Keep sharing grants pointing at the moved file/folder -- otherwise a
    # grant silently orphans on the old path, and would re-attach to
    # whatever unrelated file/folder later gets created at that same old
    # name (a real access-control leak, not just a cosmetic dangling ref).
    old_relpath = old_path.strip("/")
    new_relpath = new_path.strip("/")
    owner_filter = {
        "shared_by_admin_id": admin["id"] if admin else None,
        "shared_by_user_id": user["id"] if (user and not admin) else None,
    }
    for grant in SharedAccess.objects.filter(**owner_filter):
        if grant.path == old_relpath:
            grant.path = new_relpath
            grant.save(update_fields=["path"])
        elif grant.path.startswith(old_relpath + "/"):
            grant.path = new_relpath + grant.path[len(old_relpath):]
            grant.save(update_fields=["path"])

    return JsonResponse({"ok": True})


@auth.require_login
@require_POST
def api_delete_view(request):
    admin, user = _actor(request)
    root = owner_root(admin, user)
    relpath = request.POST.get("path", "")
    if not relpath:
        return JsonResponse({"error": "Не указан путь"}, status=400)
    try:
        target = safe_join(root, relpath)
    except ValueError:
        return JsonResponse({"error": "Недопустимый путь"}, status=400)
    if target == root.resolve():
        return JsonResponse({"error": "Нельзя удалить корневую папку"}, status=400)
    if target.is_dir():
        import shutil
        shutil.rmtree(target, ignore_errors=True)
    elif target.is_file():
        target.unlink()
    else:
        return JsonResponse({"error": "Файл или папка не найдены"}, status=404)
    deleted_relpath = relpath.strip("/")
    owner_filter = {
        "shared_by_admin_id": admin["id"] if admin else None,
        "shared_by_user_id": user["id"] if (user and not admin) else None,
    }
    for grant in SharedAccess.objects.filter(**owner_filter):
        if grant.path == deleted_relpath or grant.path.startswith(deleted_relpath + "/"):
            grant.delete()
    return JsonResponse({"ok": True})


@auth.require_login
def api_download_view(request):
    admin, user = _actor(request)
    root, _ = _target_root(request, admin, user)
    if root is None:
        return HttpResponse("403 Forbidden", status=403)
    relpath = request.GET.get("path", "")
    try:
        target = safe_join(root, relpath)
    except ValueError:
        return HttpResponse("400 Bad Request", status=400)
    if not target.is_file():
        raise Http404("Файл не найден")

    internal_prefix = getattr(settings, "STORAGE_INTERNAL_ALIAS", None)
    if internal_prefix:
        # Efficient path: nginx streams the file itself (see the
        # /protected_storage/ internal location added alongside this
        # feature) -- gunicorn only issues the redirect, doesn't hold a
        # worker open for potentially multi-GB point-cloud files.
        rel_to_storage_root = target.relative_to(Path(settings.UPLOADS_ROOT) / "user_storage")
        response = HttpResponse()
        response["X-Accel-Redirect"] = f"{internal_prefix}/{rel_to_storage_root.as_posix()}"
        response["Content-Disposition"] = f'attachment; filename="{target.name}"'
        return response

    return FileResponse(open(target, "rb"), as_attachment=True, filename=target.name)


@auth.require_login
@require_POST
def api_share_view(request):
    admin, user = _actor(request)
    relpath = (request.POST.get("path") or "").strip("/")
    kind = request.POST.get("kind")  # "admin" or "user"
    target_id = request.POST.get("id")
    can_write = request.POST.get("can_write") == "1"
    if not relpath or kind not in ("admin", "user") or not target_id:
        return JsonResponse({"error": "Не указан файл или получатель"}, status=400)

    root = owner_root(admin, user)
    try:
        if not safe_join(root, relpath).exists():
            return JsonResponse({"error": "Файл или папка не найдены"}, status=404)
    except ValueError:
        return JsonResponse({"error": "Недопустимый путь"}, status=400)

    if kind == "admin" and not Admin.objects.filter(id=target_id, is_active=1).exists():
        return JsonResponse({"error": "Получатель не найден"}, status=404)
    if kind == "user" and not UserSync.objects.filter(id=target_id, is_active=1).exists():
        return JsonResponse({"error": "Получатель не найден"}, status=404)

    SharedAccess.objects.update_or_create(
        shared_by_admin_id=admin["id"] if admin else None,
        shared_by_user_id=user["id"] if (user and not admin) else None,
        shared_with_admin_id=target_id if kind == "admin" else None,
        shared_with_user_id=target_id if kind == "user" else None,
        path=relpath,
        defaults={"can_write": can_write},
    )
    return JsonResponse({"ok": True})


@auth.require_login
@require_POST
def api_unshare_view(request):
    grant_id = request.POST.get("id")
    admin, user = _actor(request)
    deleted, _ = SharedAccess.objects.filter(
        id=grant_id,
        shared_by_admin_id=admin["id"] if admin else None,
        shared_by_user_id=user["id"] if (user and not admin) else None,
    ).delete()
    if not deleted:
        return JsonResponse({"error": "Не найдено"}, status=404)
    return JsonResponse({"ok": True})


@auth.require_login
def api_search_accounts_view(request):
    admin, user = _actor(request)
    query = request.GET.get("q", "")
    results = search_platform_accounts(query, exclude_admin=admin, exclude_user=user)
    return JsonResponse({"results": results})
