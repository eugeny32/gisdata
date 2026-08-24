"""
users_sync management — port of users.php's business logic, plus the
Linux side of the mdb sync bridge (see the migration plan's §4: the ODBC
export half runs on a Windows box with the Access driver via
bin/export_mdb_users.py, producing a JSON file; this module only
consumes that file — no ODBC exists on Linux).
"""

import json
from pathlib import Path

from django.conf import settings
from django.db import transaction

from .models import UserSync

NEXT_MANUAL_ID_FLOOR = 1_000_000


def next_manual_id() -> int:
    """IDs >= 1_000_000 so manually-created accounts never collide with
    real mdb row IDs — same scheme as users.php."""
    max_manual = (
        UserSync.objects.filter(id__gte=NEXT_MANUAL_ID_FLOOR).order_by("-id").values_list("id", flat=True).first()
    )
    return max(((max_manual or (NEXT_MANUAL_ID_FLOOR - 1)) + 1), NEXT_MANUAL_ID_FLOOR)


def add_manual_user(*, user_name, password, gl_name=None, email=None, telephone=None,
                     contact_person=None, is_active=True) -> UserSync:
    """No ODBC on Linux — unlike users.php (which tries the live mdb write
    first), every account created through this server is manual. This
    matches the PHP original's own fallback path when mdb is unreachable."""
    return UserSync.objects.create(
        id=next_manual_id(), user_name=user_name, gl_name=gl_name,
        user_password=password, user_time=1 if is_active else 0, puser_time=0,
        is_active=1 if is_active else 0, is_manual=1,
        email=email, telephone=telephone, contact_person=contact_person,
    )


def mdb_sync_dump_path() -> Path:
    return Path(getattr(settings, "MDB_SYNC_DUMP_PATH", "/srv/gisdata/mdb_sync/users_sync.json"))


@transaction.atomic
def sync_from_mdb_dump() -> int:
    """
    Upserts users_sync from the JSON file produced by
    bin/export_mdb_users.py (run on a Windows box with the Access ODBC
    driver — see that script's docstring for the export side of this
    bridge). Same is_manual protection as the PHP original's
    `ON CONFLICT (id) DO UPDATE ... WHERE users_sync.is_manual = 0` —
    manually-created accounts are never overwritten by a sync.
    """
    path = mdb_sync_dump_path()
    if not path.exists():
        raise FileNotFoundError(
            f"Дамп mdb не найден: {path}. Запустите bin/export_mdb_users.py на "
            "Windows-машине с драйвером Access и скопируйте результат сюда."
        )
    rows = json.loads(path.read_text(encoding="utf-8"))

    count = 0
    for row in rows:
        user_time = int(row.get("user_time") or 0)
        updated = UserSync.objects.filter(id=row["id"], is_manual=0).update(
            user_name=row["user_name"], gl_name=row.get("gl_name"),
            user_password=row["user_password"], user_time=user_time,
            puser_time=int(row.get("puser_time") or 0),
            scope_name=row.get("scope_name"), mount_name=row.get("mount_name"),
            device_type=row.get("device_type"), sn=row.get("sn"),
            email=row.get("email"), contact_person=row.get("contact_person"),
            telephone=row.get("telephone"), is_active=1 if user_time > 0 else 0,
        )
        if not updated and not UserSync.objects.filter(id=row["id"]).exists():
            UserSync.objects.create(
                id=row["id"], user_name=row["user_name"], gl_name=row.get("gl_name"),
                user_password=row["user_password"], user_time=user_time,
                puser_time=int(row.get("puser_time") or 0),
                scope_name=row.get("scope_name"), mount_name=row.get("mount_name"),
                device_type=row.get("device_type"), sn=row.get("sn"),
                email=row.get("email"), contact_person=row.get("contact_person"),
                telephone=row.get("telephone"), is_active=1 if user_time > 0 else 0,
                is_manual=0,
            )
        count += 1
    return count