"""
Port of tours.php's helper functions + app/lib/db.php::pg() (arbitrary
external PostgreSQL/PostGIS connections, see pg_connections app).
"""

from pathlib import Path
from urllib.parse import quote

import psycopg
from django.conf import settings


def tour_is_public(tour_id: int) -> bool:
    """
    Port of app/lib/tours.php::tour_is_public(). A tour is reachable
    without login by direct link (tour_view.php + the read actions of
    api/tours.php, api/tour_annotations.php, tour_export.php) once an
    admin explicitly marked it "published" (is_public). Also requires
    is_enabled=1 -- disabling a tour on the map always revokes public
    link access too, even if is_public stayed on: "disable the tour"
    should mean "disable everywhere", not just on the map.
    """
    if tour_id <= 0:
        return False
    from .models import Tour  # local import -- avoids a services/models import cycle
    return Tour.objects.filter(id=tour_id, is_enabled=1).values_list("is_public", flat=True).first() == 1

# Postgres large-object mode flags (see Postgres docs, fe-lo interface) --
# called here via the SQL-level lo_* wrapper functions (not libpq's
# binary LO protocol) so this works identically against ANY Postgres
# server, local or remote, exactly like PHP's PDO_PGSQL pgsqlLOBOpen()
# does under the hood.
INV_WRITE = 0x00020000


def external_pg_connect(profile) -> psycopg.Connection:
    """profile: a tours.models.PgConnection instance."""
    conninfo = (
        f"host={profile.host} port={profile.port} dbname={profile.dbname} "
        f"user={profile.username} password={profile.password} sslmode={profile.sslmode}"
    )
    return psycopg.connect(conninfo)


def pg_upload_large_object(conn: psycopg.Connection, local_file: str) -> int:
    """
    Uploads a file into a PostgreSQL Large Object in 4MB chunks -- unlike
    bytea (hard 1GB-per-value limit in Postgres) or binding a bytea
    parameter (which buffers the whole file in memory before sending),
    Large Objects have no size limit and don't require holding the file
    in memory whole. Must be called inside an active transaction (a
    Postgres requirement for the large object API). Returns the new
    object's oid.
    """
    with conn.cursor() as cur:
        cur.execute("SELECT lo_creat(-1)")
        oid = cur.fetchone()[0]
        cur.execute("SELECT lo_open(%s, %s)", (oid, INV_WRITE))
        fd = cur.fetchone()[0]
        with open(local_file, "rb") as f:
            while True:
                chunk = f.read(4 * 1024 * 1024)
                if not chunk:
                    break
                cur.execute("SELECT lowrite(%s, %s)", (fd, chunk))
        cur.execute("SELECT lo_close(%s)", (fd,))
    return oid


def tour_file_url(file_path: str) -> str:
    encoded = "/".join(quote(part) for part in file_path.split("/"))
    return f"/uploads/tours/{encoded}"


def _sidecar_url(file_path: str, suffix: str) -> str | None:
    upload_dir = Path(settings.UPLOADS_ROOT) / "tours"
    if not (upload_dir / (file_path + suffix)).is_file():
        return None
    return tour_file_url(file_path + suffix)


def tour_copc_url(file_path: str) -> str | None:
    """COPC conversion status is determined by file existence on disk (no
    separate table) -- see the slam_pipeline-adjacent process_copc_conversions
    management command."""
    return _sidecar_url(file_path, ".copc.laz")


def tour_sog_url(file_path: str) -> str | None:
    return _sidecar_url(file_path, ".sog")


def tour_collision_url(file_path: str) -> str | None:
    return _sidecar_url(file_path, ".collision.glb")


def user_storage_usage_bytes(user_id: int) -> int:
    """Sums the on-disk size of every file belonging to tours owned by this
    users_sync account (self-service uploads only -- see storage_quota_bytes
    on UserSync). Sizes aren't cached in the DB, so this stats each file;
    fine at self-service scale (a handful of tours per user)."""
    from .models import Tour, TourFile  # local import -- avoids a services/models import cycle

    upload_dir = Path(settings.UPLOADS_ROOT) / "tours"
    tours = list(Tour.objects.filter(created_by_user_id=user_id).values_list("id", "file_path"))
    file_paths = [file_path for _, file_path in tours]
    file_paths += TourFile.objects.filter(
        tour_id__in=[tour_id for tour_id, _ in tours]
    ).values_list("file_path", flat=True)

    total = 0
    for file_path in file_paths:
        try:
            total += (upload_dir / file_path).stat().st_size
        except OSError:
            pass
    return total


def group_folder_for(group_id: int | None, group_name: str | None) -> str:
    """Storage subfolder by group -- uploads/tours/g{id}-{slug}/... Applies
    only to NEW files uploaded through the form."""
    if not group_id or not group_name:
        return ""
    import re
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", group_name).strip("-").lower()
    return f"g{group_id}-{slug}/" if slug else f"g{group_id}/"