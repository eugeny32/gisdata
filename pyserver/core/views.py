"""
Фаза 2 vertical slice: auth pages + home dashboard — direct ports of
login.php/admin_login.php/logout.php/home.php/index.php.
"""

import secrets
from datetime import timedelta

from django.db.models import Count
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse
from django.utils import timezone

from stations.models import Station, StationLog, StationStatus

from .models import Admin, AdminInvite

from . import auth


def index_view(request):
    if auth.current_user(request) or auth.current_admin(request):
        return redirect("home")
    return redirect("login")


def login_view(request):
    if auth.current_user(request) is not None:
        return redirect("home")

    error = None
    if request.method == "POST":
        user_name = request.POST.get("user_name", "").strip()
        password = request.POST.get("password", "")
        if not user_name or not password:
            error = "Введите имя пользователя и пароль"
        else:
            user = auth.attempt_user_login(user_name, password)
            if user:
                auth.login_user_session(request, user)
                return redirect("home")
            error = "Неверное имя пользователя, пароль или доступ истёк"

    return render(request, "login.html", {"error": error})


def admin_login_view(request):
    if auth.current_admin(request) is not None:
        return redirect("home")

    error = None
    if request.method == "POST":
        login = request.POST.get("login", "").strip()
        password = request.POST.get("password", "")
        if not login or not password:
            error = "Введите логин и пароль"
        else:
            admin = auth.attempt_admin_login(login, password)
            if admin:
                auth.login_admin_session(request, admin)
                return redirect("home")
            error = "Неверный логин или пароль"

    return render(request, "admin_login.html", {"error": error})


def logout_view(request):
    auth.logout_session(request)
    return redirect("login")


@auth.require_login
def home_view(request):
    counts = {"online": 0, "offline": 0, "unknown": 0}
    for row in StationStatus.objects.values("status").annotate(c=Count("status")):
        counts[row["status"]] = row["c"]
    total = Station.objects.filter(is_enabled=1).count()
    recent_log = (
        StationLog.objects.select_related("station").order_by("-checked_at")[:10]
    )
    return render(
        request,
        "home.html",
        {
            "counts": counts,
            "total": total,
            "offline_or_unknown": counts["offline"] + counts["unknown"],
            "recent_log": recent_log,
        },
    )


def healthcheck(request):
    return JsonResponse({"ok": True, "phase": "2"})

@auth.require_admin_role("admin")
def employees_view(request):
    error = None
    admin = auth.current_admin(request)

    if request.method == "POST" and request.POST.get("action") == "toggle":
        emp_id = int(request.POST.get("id") or 0)
        if emp_id == admin["id"]:
            error = "Нельзя деактивировать собственную учётную запись"
        else:
            emp = Admin.objects.filter(id=emp_id).first()
            if emp:
                emp.is_active = 0 if emp.is_active else 1
                emp.save(update_fields=["is_active"])
            return redirect("employees")

    employees = Admin.objects.order_by("login")
    return render(request, "employees.html", {"error": error, "employees": employees})


@auth.require_admin_role("admin")
def employee_invites_view(request):
    admin = auth.current_admin(request)
    created_link = None

    if request.method == "POST":
        action = request.POST.get("action", "")
        if action == "create":
            role = "admin" if request.POST.get("role") == "admin" else "viewer"
            email = request.POST.get("email", "").strip() or None
            full_name = request.POST.get("full_name", "").strip() or None
            token = secrets.token_hex(24)
            AdminInvite.objects.create(
                token=token, role=role, email=email, full_name=full_name,
                created_by_id=admin["id"], expires_at=timezone.now() + timedelta(days=7),
            )
            scheme = "https" if request.is_secure() else "http"
            created_link = f"{scheme}://{request.get_host()}{reverse('invite_accept')}?token={token}"
        elif action == "revoke":
            invite_id = int(request.POST.get("id") or 0)
            AdminInvite.objects.filter(id=invite_id, used_at__isnull=True).update(expires_at=timezone.now())

    now = timezone.now()
    invites = []
    for i in AdminInvite.objects.select_related("created_by").order_by("-created_at"):
        is_used = i.used_at is not None
        is_expired = not is_used and i.expires_at < now
        invites.append({
            "obj": i, "is_used": is_used, "is_expired": is_expired,
            "is_revocable": not is_used and not is_expired,
        })
    return render(request, "employee_invites.html", {"created_link": created_link, "invites": invites})


def invite_accept_view(request):
    token = request.GET.get("token") or request.POST.get("token") or ""
    error = None
    invite = AdminInvite.objects.filter(
        token=token, used_at__isnull=True, expires_at__gt=timezone.now()
    ).first()

    if not invite:
        error = "Приглашение не найдено, уже использовано или истёк срок действия"

    if invite and request.method == "POST":
        login = request.POST.get("login", "").strip()
        password = request.POST.get("password", "")
        password_confirm = request.POST.get("password_confirm", "")

        if not login or not password:
            error = "Заполните логин и пароль"
        elif password != password_confirm:
            error = "Пароли не совпадают"
        elif len(password) < 6:
            error = "Пароль должен быть не короче 6 символов"
        elif Admin.objects.filter(login=login).exists():
            error = "Такой логин уже занят"
        else:
            new_admin = Admin.objects.create(
                login=login, full_name=invite.full_name, role=invite.role,
                email=invite.email, is_active=1,
            )
            auth.set_admin_password(new_admin, password)
            new_admin.save(update_fields=["password_hash"])
            invite.used_at = timezone.now()
            invite.save(update_fields=["used_at"])
            auth.login_admin_session(request, new_admin)
            return redirect("home")

    return render(request, "invite_accept.html", {"error": error, "invite": invite, "token": token})

@auth.require_admin_role("admin")
def tile_layout_view(request):
    return render(request, "tile_layout.html", {})
