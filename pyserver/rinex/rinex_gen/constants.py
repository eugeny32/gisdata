"""
Port of app/lib/rinex_gen/Constants.php. Physical constants and time
conversions for the synthetic RINEX generator (GPS + GLONASS). Standard
values from ICD-GPS-200 (GPS) and the GLONASS ICD (PZ-90.11).
"""

import calendar
import time

RGEN_C = 299792458.0  # speed of light, m/s
RGEN_GPS_F1 = 1575.42e6  # GPS L1, Hz
RGEN_GPS_F2 = 1227.60e6  # GPS L2, Hz
RGEN_GLO_F1 = 1602.0e6  # GLONASS G1, k=0 (center channel), Hz
RGEN_GLO_F2 = 1246.0e6  # GLONASS G2, k=0, Hz
# GLONASS is FDMA: each satellite has its OWN carrier f_k = f0 + k*df, k
# from -7 to +6 (the "freq_channel" ephemeris field, see glonass_nav.py).
RGEN_GLO_F1_STEP = 0.5625e6  # per-channel step for G1, Hz (GLONASS ICD)
RGEN_GLO_F2_STEP = 0.4375e6  # per-channel step for G2, Hz

# GPS: gravitational parameter and Earth rotation rate (WGS-84 / ICD-GPS-200)
RGEN_GPS_MU = 3.986005e14
RGEN_GPS_OMEGA_E = 7.2921151467e-5

# GLONASS: gravitational parameter and Earth rotation rate (PZ-90.11)
RGEN_GLO_MU = 3.9860044e14
RGEN_GLO_OMEGA_E = 7.292115e-5
RGEN_GLO_J02 = 1082625.75e-9  # second zonal harmonic coefficient (J2)
RGEN_GLO_AE = 6378136.0  # Earth equatorial radius, m

# GPS-time minus UTC as of now (seconds) -- the last leap second was
# 2016-12-31; if a new one is ever announced, bump this by 1.
RGEN_GPS_UTC_LEAP_SECONDS = 18


def gmmktime(hour: int, minute: int, sec: int, month: int, day: int, year: int) -> int:
    """Port of PHP's gmmktime() -- interprets the given wall-clock fields
    as UTC and returns a Unix timestamp."""
    return calendar.timegm((year, month, day, hour, minute, sec, 0, 0, 0))


def gmtime_fields(unix_ts) -> time.struct_time:
    """time.gmtime() equivalent used throughout for PHP's gmdate('Y'/'n'/
    'j'/'G'/'i'/'s'/'z', ...) -- tm_year/tm_mon/tm_mday/tm_hour/tm_min/
    tm_sec/tm_yday map directly onto those format codes (tm_yday is
    already 1-based like PHP's 'z'+1)."""
    return time.gmtime(unix_ts)


def rgen_gpst_unix(unix_utc: int) -> int:
    """
    UTC Unix timestamp -> "civil" representation of the moment ON THE
    GPST SCALE (i.e. the same Unix timestamp, shifted by GPST-UTC = 18s).
    See the PHP original's docstring for the two-round revert/reinstate
    history -- this shift is kept (confirmed twice via live RTKLIB
    testing): without it, single-point height solutions drift by tens of
    km over time; with it, they converge correctly.
    """
    return unix_utc + RGEN_GPS_UTC_LEAP_SECONDS


def rgen_utc_to_gps_week_sow(unix_utc: int) -> tuple[int, int]:
    """UTC Unix timestamp -> [GPS week number, GPS seconds of week].
    GPS epoch: 1980-01-06 00:00:00 UTC."""
    gps_epoch = gmmktime(0, 0, 0, 1, 6, 1980)
    gps_time = unix_utc - gps_epoch + RGEN_GPS_UTC_LEAP_SECONDS
    week, sow = divmod(gps_time, 7 * 86400)
    return week, sow


def rgen_read_f(line: str, offset: int) -> float:
    """Reads a fixed-width (19 char) numeric field from a RINEX NAV
    record line at `offset`, replacing a Fortran 'D' exponent with 'E'
    (some RINEX generators still write it that way). Shared by the GPS
    and GLONASS parsers."""
    chunk = line[offset:offset + 19].strip().replace("D", "E").replace("d", "E")
    return float(chunk) if chunk else 0.0