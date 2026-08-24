"""
Port of app/lib/gnss_ftp.php. Remote FTP with hourly RINEX files per
station (see rinex/views.py). Directory layout on the server (mapped by
hand via direct FTP browsing): one year, no year subfolder --
  /{day-of-year 3 digits}({MMDD})/{STATION_CODE}/{name}_MO.rnx  -- observations
  /{day-of-year 3 digits}({MMDD})/{STATION_CODE}/{name}_MN.rnx  -- navigation
e.g. /060(0301)/REFT/REFT06070_R_20260600700_01H_10S_MO.rnx

All timestamps here are NAIVE datetimes representing UTC wall-clock time
(matching rinex_requests.date_from_utc/date_to_utc's plain TIMESTAMP
columns and the project-wide USE_TZ=False choice -- see gisdata/settings.py) --
never attach tzinfo, just treat "naive" as "UTC" by convention throughout.
"""

import re
from datetime import datetime, timedelta, timezone
from ftplib import FTP, error_perm

from django.conf import settings


def utcnow_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def gnss_ftp_connect():
    """Returns an open, logged-in FTP connection in passive mode, or None
    on any connect/login failure -- callers decide how to surface this
    ("FTP temporarily unavailable" is an expected, non-catastrophic case)."""
    try:
        ftp = FTP()
        ftp.connect(settings.GNSS_FTP_HOST, 21, timeout=settings.GNSS_FTP_TIMEOUT_SEC)
        ftp.login(settings.GNSS_FTP_USER, settings.GNSS_FTP_PASSWORD)
        ftp.set_pasv(True)
        return ftp
    except OSError:
        return None


def gnss_day_folder(date: datetime) -> str:
    """Day folder name -- day-of-year (3 digits) + (MMDD) in parens, no
    year subfolder (the server only ever holds one year at a time)."""
    doy = date.timetuple().tm_yday
    return f"{doy:03d}({date.strftime('%m%d')})"


_RAWLIST_RE = re.compile(r'^([\-d])\S+\s+\d+\s+\S+\s+\S+\s+(\d+)\s+\S+\s+\S+\s+\S+\s+(.+)$')


def gnss_parse_rawlist_line(line: str) -> dict | None:
    """Parses one `ls -l`-style LIST line -- only need is-directory, size,
    and name."""
    m = _RAWLIST_RE.match(line)
    if not m:
        return None
    return {"is_dir": m.group(1) == "d", "size": int(m.group(2)), "name": m.group(3)}


def _rawlist(ftp: FTP, path: str) -> list[str]:
    lines: list[str] = []
    try:
        ftp.retrlines(f"LIST {path}", lines.append)
    except error_perm:
        return []
    return lines


def gnss_ftp_list_stations(ftp: FTP, day_folder: str) -> list[str]:
    """Station subfolder names inside one day's folder -- not every
    station writes data every day, an empty result for a given day is
    normal, not an error."""
    names = []
    for line in _rawlist(ftp, f"/{day_folder}"):
        parsed = gnss_parse_rawlist_line(line)
        if parsed and parsed["is_dir"]:
            names.append(parsed["name"])
    return names


def gnss_ftp_list_files(ftp: FTP, day_folder: str, station: str) -> list[dict]:
    files = []
    for line in _rawlist(ftp, f"/{day_folder}/{station}"):
        parsed = gnss_parse_rawlist_line(line)
        if parsed and not parsed["is_dir"]:
            files.append({
                "path": f"{day_folder}/{station}/{parsed['name']}",
                "name": parsed["name"], "size": parsed["size"],
                "day_folder": day_folder, "station": station,
            })
    return files


_FILENAME_TS_RE = re.compile(r'_R_(\d{4})(\d{3})(\d{2})(\d{2})_')


def gnss_parse_file_timestamp(file_name: str) -> datetime | None:
    """The filename itself carries the exact data timestamp -- e.g.
    "REFT0606E_R_20260600628_01H_10S_MO.rnx" -> "20260600628" splits into
    YYYY(2026) + day-of-year(060) + HHmm(0628). More reliable than the
    LIST-line date (day only, no hour/minute)."""
    m = _FILENAME_TS_RE.search(file_name)
    if not m:
        return None
    year, doy, hour, minute = m.groups()
    try:
        base = datetime(int(year), 1, 1) + timedelta(days=int(doy) - 1)
        return base.replace(hour=int(hour), minute=int(minute))
    except ValueError:
        return None


def gnss_parse_file_period_minutes(file_name: str) -> int | None:
    """Nominal file duration from the filename -- the period token (4th
    underscore-separated field) like "01H"/"15M"/"01D". Used to tell
    "files run back-to-back" from "gap of a few minutes between files"
    when merging (see rinex_merge.py)."""
    parts = file_name.split("_")
    if len(parts) < 4:
        return None
    m = re.match(r'^(\d+)([A-Za-z])$', parts[3])
    if not m:
        return None
    value = int(m.group(1))
    return {"H": value * 60, "D": value * 1440, "M": value, "S": 0}.get(m.group(2).upper())


def gnss_station_last_data(ftp: FTP, station_code: str, now: datetime) -> datetime | None:
    """Freshest data timestamp for a station -- checks "today" AND
    "yesterday" (right after midnight the new day's folder may not exist
    yet, or yesterday's last file may be newer if the station has been
    quiet for a while). None means no recognizable-timestamp files on
    either day -- that's a real "station is silent", not a function error."""
    latest = None
    for day in (now, now - timedelta(days=1)):
        for f in gnss_ftp_list_files(ftp, gnss_day_folder(day), station_code):
            ts = gnss_parse_file_timestamp(f["name"])
            if ts is not None and (latest is None or ts > latest):
                latest = ts
    return latest