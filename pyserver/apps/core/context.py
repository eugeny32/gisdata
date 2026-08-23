"""
Sidebar nav visibility вЂ” ported from app/views/_sidebar.php's inline
per-user entitlement lookup (facade_cad_enabled/topo_cad_enabled/
facade_foto_enabled on users_sync). Admins see everything unconditionally;
regular users see only the tools their account has flagged on.
"""

from apps.users.models import UserSync

from .auth import current_admin, current_user


def nav_context(request):
    admin = current_admin(request)
    user = current_user(request)
    flags = {"facade_cad": False, "topo_cad": False, "facade_foto": False}
    if not admin and user:
        row = UserSync.objects.filter(id=user["id"]).values(
            "facade_cad_enabled", "topo_cad_enabled", "facade_foto_enabled"
        ).first()
        if row:
            flags = {
                "facade_cad": bool(row["facade_cad_enabled"]),
                "topo_cad": bool(row["topo_cad_enabled"]),
                "facade_foto": bool(row["facade_foto_enabled"]),
            }
    return {
        "nav_admin": admin,
        "nav_user": user,
        "nav_role": admin["role"] if admin else None,
        "nav_flags": flags,
    }
