"""
Django settings for the gisdata (ntrip.host) Python rewrite.

Adopts the EXISTING PostgreSQL schema (../sql/schema.sql, applied as-is on
the new server) rather than letting Django derive it from scratch — models
across the app packages carry explicit db_table/db_column Meta to match it
byte for byte. See ../.claude/plans (migration plan) for the phased rollout
this settings file is part of.

Auth is intentionally NOT django.contrib.auth: the legacy PHP app has two
disjoint identities in one session (regular `users_sync` customers vs
`admins` staff, never both) that don't map onto django.contrib.auth.User
without distortion — see core/auth.py for the session-based replacement.
django.contrib.sessions is still used (for request.session itself) and
django.contrib.gis for the PostGIS-backed CAD entity tables.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def _env(key, default=None):
    return os.environ.get(key, default)


def _env_bool(key, default=False):
    val = os.environ.get(key)
    if val is None:
        return default
    return val.strip().lower() in ("1", "true", "yes", "on")


def _env_list(key, default=""):
    val = os.environ.get(key, default)
    return [item.strip() for item in val.split(",") if item.strip()]


SECRET_KEY = _env("DJANGO_SECRET_KEY", "dev-insecure-secret-key-change-me")
DEBUG = _env_bool("DJANGO_DEBUG", False)
ALLOWED_HOSTS = _env_list("DJANGO_ALLOWED_HOSTS", "127.0.0.1,localhost")
CSRF_TRUSTED_ORIGINS = _env_list("DJANGO_CSRF_TRUSTED_ORIGINS", "")

INSTALLED_APPS = [
    "daphne",
    "django.contrib.contenttypes",
    "django.contrib.staticfiles",
    "django.contrib.sessions",
    "django.contrib.gis",
    "core",
    "users",
    "stations",
    "billing",
    "tours",
    "rinex",
    "slam_pipeline",
    "cad_sessions",
    "storage",
    "chat",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "gisdata.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "core.context.nav_context",
            ],
        },
    },
]

WSGI_APPLICATION = "gisdata.wsgi.application"
ASGI_APPLICATION = "gisdata.asgi.application"

# chat/consumers.py delivery -- channels-redis (not the in-memory layer)
# so message broadcast works correctly across gunicorn/daphne's multiple
# worker processes, not just within one.
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {"hosts": [_env("REDIS_URL", "redis://127.0.0.1:6379/1")]},
    }
}

DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": _env("PGSQL_DATABASE", "gismap"),
        "USER": _env("PGSQL_USER", "gismap"),
        "PASSWORD": _env("PGSQL_PASSWORD", ""),
        "HOST": _env("PGSQL_HOST", "127.0.0.1"),
        "PORT": _env("PGSQL_PORT", "5432"),
    }
}

# Own auto-incrementing PK convention matches the existing SERIAL/BIGSERIAL
# columns already in schema.sql — nothing to configure here.
DEFAULT_AUTO_FIELD = "django.db.models.AutoField"

# --- Sessions: mirrors app/lib/auth.php's session cookie exactly (name,
# httponly, samesite, 8h lifetime) so both stacks can coexist during the
# phased rollout without surprising session behavior differences. ---
SESSION_COOKIE_NAME = "gisdata_sid"
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_AGE = 8 * 3600
SESSION_SAVE_EVERY_REQUEST = True
SESSION_ENGINE = "django.contrib.sessions.backends.db"
# Shared across ntrip.host and chat.ntrip.host -- logging in on one logs
# you in on the other too (see the chat feature's architecture note: same
# Django process/urlconf, different server_name). Empty by default so
# local/single-host dev setups (no subdomain) aren't forced into this.
SESSION_COOKIE_DOMAIN = _env("SESSION_COOKIE_DOMAIN", None)

CSRF_COOKIE_SAMESITE = "Lax"

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Legacy on-disk trees shared with the PHP app during the parallel-run phase
# (Фаза migration plan) — not Django MEDIA in the FileField sense, most of
# this is written directly by pipeline workers, not through the ORM.
UPLOADS_ROOT = Path(_env("UPLOADS_ROOT", str(BASE_DIR.parent / "uploads")))

# nginx internal-only location alias for X-Accel-Redirect'd storage/*
# downloads (see storage/views.py::api_download_view) -- keeps big-file
# transfers off the gunicorn worker pool (only 3 workers configured) while
# still gating access through Django auth/sharing checks first. Empty by
# default (falls back to a plain Django FileResponse) until the matching
# nginx location is set up.
STORAGE_INTERNAL_ALIAS = _env("STORAGE_INTERNAL_ALIAS", "")
ASSETS_ROOT = Path(_env("ASSETS_ROOT", str(BASE_DIR.parent / "assets")))

# Linux side of the mdb sync bridge — see users/services.py::sync_from_mdb_dump().
MDB_SYNC_DUMP_PATH = _env("MDB_SYNC_DUMP_PATH", str(BASE_DIR.parent / "mdb_sync" / "users_sync.json"))

# RINEX FTP source (gnss.host) -- see rinex/gnss_ftp.py.
GNSS_FTP_HOST = _env("GNSS_FTP_HOST", "gnss.host")
GNSS_FTP_USER = _env("GNSS_FTP_USER", "")
GNSS_FTP_PASSWORD = _env("GNSS_FTP_PASSWORD", "")
GNSS_FTP_TIMEOUT_SEC = 15

# Synthetic RINEX generator (rinex_generate.php) -- broadcast ephemeris
# mirrors + optional CDDIS Earthdata login.
RINEX_SYNTH_NAV_URL_TEMPLATES = [
    "https://cddis.nasa.gov/archive/gnss/data/daily/{year}/brdc/BRDC00IGS_R_{year}{doy3}0000_01D_MN.rnx.gz",
    "https://igs.bkg-ev.de/root_ftp/IGS/BRDC/{year}/{doy3}/BRDM00DLR_S_{year}{doy3}0000_01D_MN.rnx.gz",
]
CDDIS_EARTHDATA_USER = _env("CDDIS_EARTHDATA_USER", "")
CDDIS_EARTHDATA_PASSWORD = _env("CDDIS_EARTHDATA_PASSWORD", "")

# @playcanvas/splat-transform CLI (PLY denoise / SOG+collision conversion) --
# small Node.js runtime kept only for this external-tool call, see the
# migration plan Sec.3/Фаза 5.
SPLAT_TRANSFORM_NODE_EXE = _env("SPLAT_TRANSFORM_NODE_EXE", "node")
SPLAT_TRANSFORM_CLI = _env("SPLAT_TRANSFORM_CLI", "")

# PDAL / untwine (LAS -> COPC conversion) -- conda-forge env, same pattern
# as the old Windows server's miniforge3 'geo' environment.
PDAL_EXE = _env("PDAL_EXE", "pdal")
UNTWINE_EXE = _env("UNTWINE_EXE", "untwine")
PDAL_PROJ_DATA_DIR = _env("PDAL_PROJ_DATA_DIR", "")

# CtF-ADMIN (ctfadmin/server.mjs, Node oversight service for FACADE-CAD/
# TOPO-CAD sessions) -- shared admin-console password, also embedded in
# the ctfadmin.php gate page iframe URL for an already-authenticated admin.
CTFADMIN_ADMIN_PASS = _env("CTFADMIN_ADMIN_PASS", "")

# Voice/video calls (chat/livekit.py) -- mints tokens for the ALREADY-
# RUNNING ~/ntrip_coturn infrastructure (LiveKit SFU + coturn, see the
# chat feature's plan doc) instead of standing up a second WebRTC stack.
# That project is deliberately separate from this git repo -- these are
# read-only-shared secrets (same values as its own token-service.mjs),
# not something this codebase owns or should regenerate.
LIVEKIT_API_KEY = _env("LIVEKIT_API_KEY", "")
LIVEKIT_API_SECRET = _env("LIVEKIT_API_SECRET", "")
# No /rtc suffix -- the livekit-client SDK appends that path itself;
# ".../rtc/rtc" wouldn't connect (matches ntrip_coturn's own token-service.mjs).
LIVEKIT_WS_URL = _env("LIVEKIT_WS_URL", "wss://meet.ntrip.host")
TURN_STATIC_AUTH_SECRET = _env("TURN_STATIC_AUTH_SECRET", "")
TURN_DOMAIN = _env("TURN_DOMAIN", "turn.ntrip.host")
TURN_UDP_PORT = int(_env("TURN_UDP_PORT", "3478"))

# Native Voxel-SLAM binary (slam/native/, built from hku-mars/Voxel-SLAM
# without ROS1/Docker -- see slam_pipeline/pipeline/steps/compute_slam.py)
# and RTKLIB rnx2rtkp (slam_pipeline/pipeline/steps/ppk_correction.py) --
# built separately on the server, not part of the git deploy.
VOXELSLAM_EXE = _env("VOXELSLAM_EXE", "/srv/gisdata/bin/voxelslam_native")
RNX2RTKP_EXE = _env("RNX2RTKP_EXE", "rnx2rtkp")

LANGUAGE_CODE = "ru-ru"
# Schema.sql uses plain TIMESTAMP (no timezone) throughout, matching how
# the PHP original always worked with naive server-local datetimes
# (PHP date(), Postgres NOW() under the session TZ) -- USE_TZ=True would
# make Django expect timezone-aware values and blow up comparing them
# against naive values read back from these columns ("can't compare
# offset-naive and offset-aware datetimes"). Both the OS and the Postgres
# server run Europe/Moscow -- keep Django's naive `now()` on the same
# clock so comparisons/ordering stay consistent with DB-side NOW().
TIME_ZONE = "Europe/Moscow"
USE_I18N = True
USE_TZ = False
