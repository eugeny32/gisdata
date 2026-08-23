"""
Port of app/lib/rinex_gen/NavFile.php. Downloads/caches and parses the
combined multi-system broadcast ephemeris file (RINEX 3, "BRDM"/"BRDC"
format) for one UTC day. Only GPS ('G') and GLONASS ('R') records are
used -- other systems (Galileo 'E', BeiDou 'C', QZSS 'J', IRNSS 'I',
SBAS 'S') are present in the file and correctly skipped by record line
count so they don't throw off parsing of the rest, but are not
themselves parsed (outside the user-selected scope: GPS + GLONASS).

Primary source is CDDIS (NASA), which requires a free Earthdata account
(urs.earthdata.nasa.gov) -- credentials in .env
(CDDIS_EARTHDATA_USER/CDDIS_EARTHDATA_PASSWORD), read via Django settings.
The fallback URL (BKG, no login) in settings is untested live. If neither
source works, the generator form has a manual fallback: upload a
.rnx/.rnx.gz ephemeris file.
"""

import gzip
import io
import time
from pathlib import Path
from urllib.parse import urlsplit

import requests
from django.conf import settings

from .glonass_nav import rgen_parse_glonass_record
from .gps_nav import rgen_parse_gps_record


def rgen_dates_in_range(start_unix: int, end_unix: int) -> list[int]:
    """Days -> the UTC date(s) covered by the generation period."""
    dates = []
    day_start = int(start_unix // 86400) * 86400
    while day_start <= end_unix:
        dates.append(day_start)
        day_start += 86400
    return dates


def rgen_nav_cache_dir() -> Path:
    d = Path(settings.UPLOADS_ROOT) / "rinex_synth_cache"
    d.mkdir(parents=True, exist_ok=True)
    return d


def rgen_credentials_for_url(url: str) -> tuple[str | None, str | None]:
    """Earthdata login is only ever sent to cddis.nasa.gov -- other hosts
    have no business knowing the password."""
    host = urlsplit(url).hostname or ""
    if "cddis.nasa.gov" in host and settings.CDDIS_EARTHDATA_USER:
        return settings.CDDIS_EARTHDATA_USER, settings.CDDIS_EARTHDATA_PASSWORD
    return None, None


def rgen_download_nav_for_day(day_start_unix: int) -> str | None:
    """Downloads (with on-disk caching) the combined nav file for the UTC
    day starting at day_start_unix (00:00 UTC) and returns the local path
    to the decompressed .rnx, or None if no mirror in settings worked."""
    t = time.gmtime(day_start_unix)
    doy = t.tm_yday
    year = t.tm_year
    cache_file = rgen_nav_cache_dir() / f"brdm_{year}_{doy:03d}.rnx"

    if cache_file.is_file() and cache_file.stat().st_size > 0:
        return str(cache_file)

    templates = settings.RINEX_SYNTH_NAV_URL_TEMPLATES
    for template in templates:
        url = template.format(year=year, doy3=f"{doy:03d}", yy=str(year)[-2:])

        user, password = rgen_credentials_for_url(url)
        gz = rgen_http_get(url, user, password)
        if gz is None:
            continue
        try:
            rnx = gzip.decompress(gz)
        except OSError:
            # Some mirrors already serve an unpacked .rnx without gzip.
            rnx = gz
        text = rnx.decode("latin-1")
        if "RINEX VERSION" not in text:
            continue
        cache_file.write_bytes(rnx)
        return str(cache_file)

    return None


def rgen_http_get(url: str, user: str | None = None, password: str | None = None) -> bytes | None:
    """
    GET with optional HTTP Basic auth that survives a redirect to a
    different host (needed for CDDIS: a request to cddis.nasa.gov
    302-redirects to urs.earthdata.nasa.gov/oauth/..., which checks the
    same login/password and redirects back to cddis.nasa.gov/proxyauth,
    where a cookie session is set and only then is the file itself
    served -- confirmed by a live test). `requests`' default redirect
    handling strips Authorization on cross-host redirects (a safety
    feature) -- mirrored here as an explicit choice (matching the PHP
    original's CURLOPT_UNRESTRICTED_AUTH) by re-attaching auth on every
    hop ourselves instead of relying on the library default.
    """
    auth = (user, password) if user is not None else None
    headers = {"User-Agent": "GISData RinexSynth/1.0"}
    session = requests.Session()
    try:
        next_url = url
        for _ in range(10):
            resp = session.get(
                next_url, headers=headers, auth=auth, timeout=(10, 60),
                allow_redirects=False, stream=True,
            )
            if resp.is_redirect or resp.is_permanent_redirect:
                next_url = resp.headers["Location"]
                resp.close()
                continue
            if not (200 <= resp.status_code < 300):
                resp.close()
                return None
            return resp.content
        return None
    except requests.RequestException:
        return None
    finally:
        session.close()


def rgen_parse_nav_file(content: str) -> dict:
    """
    Parses a RINEX 3 NAV file's content (combined or single-system,
    doesn't matter) and returns GPS/GLONASS ephemerides.

    Returns {"gps": {sat: [records]}, "glonass": {sat: [records]}}.
    """
    lines = content.splitlines()
    n = len(lines)

    pos = 0
    while pos < n and "END OF HEADER" not in lines[pos]:
        pos += 1
    pos += 1  # line after END OF HEADER

    gps: dict[str, list[dict]] = {}
    glonass: dict[str, list[dict]] = {}

    while pos < n:
        line = lines[pos]
        if line.strip() == "":
            pos += 1
            continue
        sys = line[0]
        if sys in ("G", "E", "C", "J", "I"):
            # 8-line records (Keplerian elements) -- only GPS is parsed,
            # other systems of the same record length are just skipped.
            if pos + 7 >= n:
                break
            if sys == "G":
                rec = rgen_parse_gps_record(lines[pos:pos + 8])
                gps.setdefault(rec["sat"], []).append(rec)
            pos += 8
        elif sys in ("R", "S"):
            # 4-line records (position/velocity/acceleration) -- only
            # GLONASS is parsed, SBAS is skipped.
            if pos + 3 >= n:
                break
            if sys == "R":
                rec = rgen_parse_glonass_record(lines[pos:pos + 4])
                glonass.setdefault(rec["sat"], []).append(rec)
            pos += 4
        else:
            # Unrecognized line -- shouldn't happen in a valid file, but
            # don't loop forever.
            pos += 1

    return {"gps": gps, "glonass": glonass}


def rgen_filter_nav_to_gps_glonass(content: str) -> str:
    """
    Returns the NAV file TEXT (for packing into the user's archive),
    keeping only GPS ('G') and GLONASS ('R') records -- exactly the
    systems we actually write observations for. See the PHP original's
    docstring for why: a third-party processor's imperfect support for
    other systems in a MIXED file could misparse a record and throw off
    every subsequent one ("wrong record length" class of bug).
    """
    lines = content.splitlines()
    n = len(lines)

    pos = 0
    while pos < n and "END OF HEADER" not in lines[pos]:
        pos += 1
    pos += 1

    kept = list(lines[:pos])

    while pos < n:
        line = lines[pos]
        if line.strip() == "":
            pos += 1
            continue
        sys = line[0]
        if sys in ("G", "E", "C", "J", "I"):
            if pos + 7 >= n:
                break
            if sys == "G":
                kept.extend(lines[pos:pos + 8])
            pos += 8
        elif sys in ("R", "S"):
            if pos + 3 >= n:
                break
            if sys == "R":
                kept.extend(lines[pos:pos + 4])
            pos += 4
        else:
            pos += 1

    if kept and kept[-1].strip() == "":
        kept.pop()
    return "\r\n".join(kept) + "\r\n"


def rgen_filter_nav_to_rinex4(content: str) -> str:
    """
    Converts a NAV file to RINEX 4.00 format (filtered to GPS+GLONASS
    like rgen_filter_nav_to_gps_glonass) -- "4.00" in the header
    (RINEX VERSION / TYPE) and, crucially, a new RINEX 4 record-header
    line "> EPH <SAT> <message type>" (LNAV for GPS legacy navigation,
    FDMA for GLONASS) is inserted before EACH ephemeris record -- this is
    exactly what real, successfully-processed TBC NAV files look like
    (byte-for-byte matched against a real South GNSS receiver file).
    """
    lines = content.splitlines()
    n = len(lines)

    pos = 0
    while pos < n and "END OF HEADER" not in lines[pos]:
        pos += 1
    header_lines = lines[:pos]
    pos += 1

    kept = []
    for line in header_lines:
        if "RINEX VERSION" in line:
            body = f"{4.00:9.2f}{'':11s}{'N: GNSS NAV DATA':<20s}{'M: MIXED':<20s}"
            kept.append(f"{body:<60}{'RINEX VERSION / TYPE':<20}")
        else:
            kept.append(line)
    kept.append(f"{'':<60}{'END OF HEADER':<20}")

    while pos < n:
        line = lines[pos]
        if line.strip() == "":
            pos += 1
            continue
        sys = line[0]
        if sys in ("G", "E", "C", "J", "I"):
            if pos + 7 >= n:
                break
            if sys == "G":
                sat = line[0:3]
                kept.append(f"> EPH {sat} LNAV")
                kept.extend(lines[pos:pos + 8])
            pos += 8
        elif sys in ("R", "S"):
            if pos + 3 >= n:
                break
            if sys == "R":
                sat = line[0:3]
                kept.append(f"> EPH {sat} FDMA")
                kept.extend(lines[pos:pos + 4])
            pos += 4
        else:
            pos += 1

    if kept and kept[-1].strip() == "":
        kept.pop()
    return "\r\n".join(kept) + "\r\n"
