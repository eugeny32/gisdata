"""Direct port of users.php (NTRIP customer accounts CRUD + per-account
feature-flag toggles + mdb sync)."""

from django.db.models import Q
from django.shortcuts import redirect, render
from django.urls import reverse

from core import auth

from .models import UserSync
from .services import add_manual_user, sync_from_mdb_dump


@auth.require_admin_role("admin")
def users_view(request):
    error = None
    success = None

    if request.method == "POST":
        action = request.POST.get("action", "")
        qs_suffix = ("?" + request.GET.urlencode()) if request.GET else ""

        if action == "add":
            user_name = request.POST.get("user_name", "").strip()
            password = request.POST.get("user_password", "").strip()
            gl_name = request.POST.get("gl_name", "").strip() or None
            email = request.POST.get("email", "").strip() or None
            telephone = request.POST.get("telephone", "").strip() or None
            contact_person = request.POST.get("contact_person", "").strip() or None
            is_active = bool(request.POST.get("is_active"))

            if not user_name or not password:
                error = "Имя пользователя и пароль обязательны"
            elif UserSync.objects.filter(user_name=user_name).exists():
                error = f"Пользователь «{user_name}» уже существует"
            else:
                user = add_manual_user(
                    user_name=user_name, password=password, gl_name=gl_name,
                    email=email, telephone=telephone, contact_person=contact_person,
                    is_active=is_active,
                )
                success = (
                    f"Пользователь «{user_name}» создан (ID {user.id}) — только в "
                    "платформе (на Linux-сервере запись в mdb недоступна)"
                )

        elif action == "set_password":
            user_id = int(request.POST.get("id") or 0)
            password = request.POST.get("user_password", "").strip()
            if not password:
                error = "Пароль не может быть пустым"
            else:
                user = UserSync.objects.filter(id=user_id).first()
                if not user or not user.is_manual:
                    error = "Смена пароля доступна только для пользователей, добавленных вручную"
                else:
                    user.user_password = password
                    user.save(update_fields=["user_password"])
                    success = "Пароль обновлён"

        elif action == "toggle":
            user_id = int(request.POST.get("id") or 0)
            user = UserSync.objects.filter(id=user_id).first()
            if user:
                new_active = 0 if user.is_active else 1
                user.is_active = new_active
                if user.is_manual:
                    user.user_time = 1 if new_active else 0
                user.save(update_fields=["is_active", "user_time"])
            return redirect(reverse('users') + qs_suffix)

        elif action in ("toggle_facade_cad", "toggle_topo_cad", "toggle_facade_foto"):
            field = {"toggle_facade_cad": "facade_cad_enabled",
                     "toggle_topo_cad": "topo_cad_enabled",
                     "toggle_facade_foto": "facade_foto_enabled"}[action]
            user_id = int(request.POST.get("id") or 0)
            user = UserSync.objects.filter(id=user_id).first()
            if user:
                setattr(user, field, 0 if getattr(user, field) else 1)
                user.save(update_fields=[field])
            return redirect(reverse('users') + qs_suffix)

        elif action == "delete":
            user_id = int(request.POST.get("id") or 0)
            user = UserSync.objects.filter(id=user_id).first()
            if not user or not user.is_manual:
                error = "Удалять можно только пользователей, добавленных вручную. MDB-пользователи управляются в источнике."
            else:
                user.delete()
                return redirect("users")

        elif action == "sync":
            try:
                count = sync_from_mdb_dump()
                success = f"Синхронизация завершена — обновлено из mdb-дампа: {count} пользователей"
            except Exception as exc:
                error = f"Ошибка синхронизации из mdb: {exc}"

    search = request.GET.get("q", "").strip()
    filter_status = request.GET.get("s", "")

    qs = UserSync.objects.all()
    if search:
        qs = qs.filter(
            Q(user_name__icontains=search) | Q(gl_name__icontains=search) | Q(email__icontains=search)
        )
    if filter_status == "1":
        qs = qs.filter(is_active=1)
    elif filter_status == "0":
        qs = qs.filter(is_active=0)
    users = qs.order_by("user_name")

    return render(request, "users/list.html", {
        "error": error, "success": success, "users": users,
        "search": search, "filter_status": filter_status,
        "total_all": UserSync.objects.count(),
        "total_active": UserSync.objects.filter(is_active=1).count(),
        "total_manual": UserSync.objects.filter(is_manual=1).count(),
        "total_inactive": UserSync.objects.filter(is_active=0).count(),
    })