"""
Filesystem-backed self-service storage ("проводник") -- port style matches
tours/services.py::user_storage_usage_bytes (no per-file DB rows; the
filesystem itself is the source of truth). Each platform account (Admin XOR
UserSync) gets its own root folder under UPLOADS_ROOT/user_storage/;
SharedAccess (see models.py) grants read (or read+write) access into
someone else's root at a specific relative path.
"""

from pathlib import Path

from django.conf import settings
from django.db.models import Q

from .models import SharedAccess

STORAGE_ROOT = lambda: Path(settings.UPLOADS_ROOT) / "user_storage"  # noqa: E731


def owner_key(admin, user) -> str:
    """admin/user: dicts from core.auth.current_admin()/current_user() (or
    None). Exactly one must be truthy -- same XOR invariant as the
    cad_sessions polymorphic-owner models."""
    if admin:
        return f"admin_{admin['id']}"
    return f"user_{user['id']}"


def owner_root(admin, user) -> Path:
    root = STORAGE_ROOT() / owner_key(admin, user)
    root.mkdir(parents=True, exist_ok=True)
    return root


def safe_join(root: Path, relpath: str) -> Path:
    """Resolves relpath under root, raising ValueError if it would escape
    root (path traversal via '..', absolute paths, symlinks). Every
    storage endpoint MUST go through this before touching the filesystem --
    this is the one function standing between "share a file" and "read any
    file on the server the app's OS user can access"."""
    relpath = (relpath or "").strip().lstrip("/")
    candidate = (root / relpath).resolve()
    root_resolved = root.resolve()
    if candidate != root_resolved and root_resolved not in candidate.parents:
        raise ValueError("Недопустимый путь")
    return candidate


def list_dir(root: Path, relpath: str) -> list[dict]:
    target = safe_join(root, relpath)
    if not target.is_dir():
        return []
    entries = []
    for child in sorted(target.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower())):
        try:
            stat = child.stat()
        except OSError:
            continue
        entries.append({
            "name": child.name,
            "is_dir": child.is_dir(),
            "size": stat.st_size if child.is_file() else None,
            "mtime": stat.st_mtime,
        })
    return entries


def dir_size_bytes(path: Path) -> int:
    total = 0
    if not path.is_dir():
        return 0
    for child in path.rglob("*"):
        if child.is_file():
            try:
                total += child.stat().st_size
            except OSError:
                pass
    return total


def total_storage_usage_bytes(admin, user) -> int:
    """Unified 6GB-quota usage: this app's storage root PLUS (for plain
    users only) their self-service tour uploads -- see
    tours/services.py::user_storage_usage_bytes. Admins have no quota
    today (UserSync.storage_quota_bytes has no Admin equivalent), so their
    tour usage isn't folded in here -- nothing currently caps it."""
    total = dir_size_bytes(owner_root(admin, user))
    if user and not admin:
        from tours.services import user_storage_usage_bytes  # local import -- avoids an app import cycle
        total += user_storage_usage_bytes(user["id"])
    return total


def shared_access_covers(shared_path: str, requested_path: str) -> bool:
    """A grant on a folder covers everything under it; a grant on a file
    only covers that exact path."""
    shared_path = shared_path.strip("/")
    requested_path = requested_path.strip("/")
    return requested_path == shared_path or requested_path.startswith(shared_path + "/")


def resolve_shared_grant(shared_by_admin_id, shared_by_user_id, viewer_admin, viewer_user, relpath: str):
    """Returns the covering SharedAccess row for (owner, viewer, relpath), or
    None if nothing was ever shared with the viewer that covers this path."""
    qs = SharedAccess.objects.filter(
        shared_by_admin_id=shared_by_admin_id, shared_by_user_id=shared_by_user_id,
    )
    qs = qs.filter(shared_with_admin_id=viewer_admin["id"]) if viewer_admin else qs.filter(
        shared_with_user_id=viewer_user["id"] if viewer_user else None
    )
    for grant in qs:
        if shared_access_covers(grant.path, relpath):
            return grant
    return None


def search_platform_accounts(query: str, exclude_admin=None, exclude_user=None, limit: int = 10) -> list[dict]:
    """Lightweight account picker for the share dialog -- searches both
    identity tables (see core/auth.py's dual-identity model) by
    login/name. Returns plain dicts, not model instances, matching the
    shape core.auth.current_admin()/current_user() already use elsewhere."""
    from core.models import Admin
    from users.models import UserSync

    query = (query or "").strip()
    if not query:
        return []

    results = []
    for a in Admin.objects.filter(is_active=1).filter(Q(login__icontains=query) | Q(full_name__icontains=query))[:limit]:
        if exclude_admin and a.id == exclude_admin["id"]:
            continue
        results.append({"kind": "admin", "id": a.id, "label": a.full_name or a.login})

    for u in UserSync.objects.filter(is_active=1).filter(Q(user_name__icontains=query) | Q(gl_name__icontains=query))[:limit]:
        if exclude_user and u.id == exclude_user["id"]:
            continue
        results.append({"kind": "user", "id": u.id, "label": u.gl_name or u.user_name})

    return results[:limit]
