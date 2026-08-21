"""
Dual-identity session auth — a direct port of app/lib/auth.php, not
django.contrib.auth. One Django session holds EITHER a `users_sync`
customer (request.session['user_id']) OR an `admins` staffer
(request.session['admin_id']), never both; logging in as one clears the
other, exactly like the PHP original.

Password handling: `admins.password_hash` was unsalted SHA-256 hex under
PHP (`hash('sha256', $password)` — see admins table comment in
sql/schema.sql). New/rewritten logins use Django's real hashers
(PBKDF2/Argon2 via django.contrib.auth.hashers) instead; existing SHA-256
hashes still verify via the legacy path below and get transparently
upgraded to a real hasher on next successful login (see
verify_admin_password). `users_sync.user_password` is a live mirror of an
external Access DB (see users app) and is intentionally left as-is — it's
not a credential store we control, changing its format would break the
mdb sync itself.
"""

import hashlib
import secrets
from functools import wraps

from django.contrib.auth.hashers import check_password, is_password_usable, make_password
from django.http import HttpResponseForbidden
from django.shortcuts import redirect

from users.models import UserSync
from .models import Admin

_LEGACY_SHA256_LEN = 64  # hex digest length; Django hasher strings always contain "$"


def _legacy_sha256_hex(raw_password: str) -> str:
    return hashlib.sha256(raw_password.encode("utf-8")).hexdigest()


def verify_admin_password(admin: Admin, raw_password: str) -> bool:
    """Checks against Django's hasher first, falls back to legacy SHA-256,
    and lazily upgrades the stored hash to a real hasher on legacy match."""
    stored = admin.password_hash
    if "$" in stored and is_password_usable(stored):
        return check_password(raw_password, stored)
    if len(stored) == _LEGACY_SHA256_LEN and secrets.compare_digest(
        stored.lower(), _legacy_sha256_hex(raw_password)
    ):
        admin.password_hash = make_password(raw_password)
        admin.save(update_fields=["password_hash"])
        return True
    return False


def set_admin_password(admin: Admin, raw_password: str) -> None:
    admin.password_hash = make_password(raw_password)


# --- Session identity -------------------------------------------------

def current_user(request):
    user_id = request.session.get("user_id")
    if not user_id:
        return None
    return {"id": user_id, "user_name": request.session.get("user_name")}


def current_admin(request):
    admin_id = request.session.get("admin_id")
    if not admin_id:
        return None
    return {
        "id": admin_id,
        "login": request.session.get("admin_login"),
        "role": request.session.get("admin_role"),
    }


def login_user_session(request, user: UserSync) -> None:
    request.session.flush()
    request.session["user_id"] = user.id
    request.session["user_name"] = user.user_name
    request.session.cycle_key()


def login_admin_session(request, admin: Admin) -> None:
    request.session.flush()
    request.session["admin_id"] = admin.id
    request.session["admin_login"] = admin.login
    request.session["admin_role"] = admin.role
    request.session.cycle_key()


def logout_session(request) -> None:
    request.session.flush()


def attempt_user_login(user_name: str, raw_password: str) -> UserSync | None:
    try:
        user = UserSync.objects.get(user_name=user_name)
    except UserSync.DoesNotExist:
        return None
    if not user.is_active:
        return None
    # users_sync.user_password is plaintext-as-synced-from-mdb by design
    # (see users/models.py) — compare_digest avoids a timing side-channel
    # even though the stored value itself isn't hashed.
    if not secrets.compare_digest(user.user_password, raw_password):
        return None
    return user


def attempt_admin_login(login: str, raw_password: str) -> Admin | None:
    try:
        admin = Admin.objects.get(login=login)
    except Admin.DoesNotExist:
        return None
    if not admin.is_active:
        return None
    if not verify_admin_password(admin, raw_password):
        return None
    return admin


# --- View guards --------------------------------------------------------

def require_login(view_func):
    @wraps(view_func)
    def wrapped(request, *args, **kwargs):
        if current_user(request) or current_admin(request):
            return view_func(request, *args, **kwargs)
        return redirect("login")
    return wrapped


def require_admin(view_func):
    @wraps(view_func)
    def wrapped(request, *args, **kwargs):
        if current_admin(request):
            return view_func(request, *args, **kwargs)
        return redirect("admin_login")
    return wrapped


def require_admin_role(role: str):
    def decorator(view_func):
        @wraps(view_func)
        def wrapped(request, *args, **kwargs):
            admin = current_admin(request)
            if not admin:
                return redirect("admin_login")
            if admin["role"] != role:
                return HttpResponseForbidden("Forbidden")
            return view_func(request, *args, **kwargs)
        return wrapped
    return decorator