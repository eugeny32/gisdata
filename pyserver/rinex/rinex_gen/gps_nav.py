"""
Port of app/lib/rinex_gen/GpsNav.php. Parses GPS ephemerides ('G' records
in RINEX 3 NAV) and computes satellite ECEF coordinates at a given time
via the standard ICD-GPS-200 algorithm (Keplerian orbital elements +
harmonic corrections).

The ephemeris does NOT account for relativistic correction or group
delay (TGD) in the pseudorange calculation -- the generator builds a
purely geometric receiver-satellite range, without clock/atmospheric
errors (see obs_writer.py) -- a deliberate simplification for synthetic
data.
"""

import math

from .constants import RGEN_GPS_MU, RGEN_GPS_OMEGA_E, RGEN_C, gmmktime, rgen_read_f, rgen_utc_to_gps_week_sow


def rgen_parse_gps_record(l: list[str]) -> dict:
    sat = l[0][0:3].strip()
    year = int(l[0][4:8])
    month = int(l[0][9:11])
    day = int(l[0][12:14])
    hour = int(l[0][15:17])
    minute = int(l[0][18:20])
    sec = int(l[0][21:23])
    toc_unix = gmmktime(hour, minute, sec, month, day, year)
    toc_week, toc_sow = rgen_utc_to_gps_week_sow(toc_unix)

    return {
        "sat": sat,
        "toc_unix": toc_unix,
        "toc_week": toc_week,
        "toc_sow": toc_sow,
        "af0": rgen_read_f(l[0], 23),
        "af1": rgen_read_f(l[0], 42),
        "af2": rgen_read_f(l[0], 61),
        "iode": rgen_read_f(l[1], 4),
        "crs": rgen_read_f(l[1], 23),
        "delta_n": rgen_read_f(l[1], 42),
        "m0": rgen_read_f(l[1], 61),
        "cuc": rgen_read_f(l[2], 4),
        "e": rgen_read_f(l[2], 23),
        "cus": rgen_read_f(l[2], 42),
        "sqrt_a": rgen_read_f(l[2], 61),
        "toe": rgen_read_f(l[3], 4),
        "cic": rgen_read_f(l[3], 23),
        "omega0": rgen_read_f(l[3], 42),
        "cis": rgen_read_f(l[3], 61),
        "i0": rgen_read_f(l[4], 4),
        "crc": rgen_read_f(l[4], 23),
        "omega": rgen_read_f(l[4], 42),
        "omega_dot": rgen_read_f(l[4], 61),
        "idot": rgen_read_f(l[5], 4),
        "gps_week": rgen_read_f(l[5], 42),
    }


def rgen_gps_sat_position(eph: dict, unix_utc: float) -> tuple[float, float, float, float]:
    """
    ECEF coordinates (meters) of a GPS satellite at unix_utc, from
    ephemeris `eph` (one record from rgen_parse_gps_record). Algorithm:
    ICD-GPS-200, table 20-IV.

    Returns (x, y, z, Ek) -- eccentric anomaly (Ek, last element) is
    included for the satellite clock relativistic correction (see
    rgen_gps_relativistic_correction_sec in obs_writer.py) without
    re-solving Kepler's equation in the caller.
    """
    week, sow = rgen_utc_to_gps_week_sow(int(math.floor(unix_utc)))
    sow += unix_utc - math.floor(unix_utc)

    a = eph["sqrt_a"] ** 2
    n0 = math.sqrt(RGEN_GPS_MU / (a ** 3))
    tk = sow - eph["toe"] + (week - eph["toc_week"]) * 604800
    if tk > 302400:
        tk -= 604800
    elif tk < -302400:
        tk += 604800

    n = n0 + eph["delta_n"]
    mk = eph["m0"] + n * tk

    ek = mk
    for _ in range(12):
        ek = mk + eph["e"] * math.sin(ek)

    vk = math.atan2(math.sqrt(1 - eph["e"] ** 2) * math.sin(ek), math.cos(ek) - eph["e"])
    phik = vk + eph["omega"]

    duk = eph["cus"] * math.sin(2 * phik) + eph["cuc"] * math.cos(2 * phik)
    drk = eph["crs"] * math.sin(2 * phik) + eph["crc"] * math.cos(2 * phik)
    dik = eph["cis"] * math.sin(2 * phik) + eph["cic"] * math.cos(2 * phik)

    uk = phik + duk
    rk = a * (1 - eph["e"] * math.cos(ek)) + drk
    ik = eph["i0"] + dik + eph["idot"] * tk

    xk1 = rk * math.cos(uk)
    yk1 = rk * math.sin(uk)

    omegak = eph["omega0"] + (eph["omega_dot"] - RGEN_GPS_OMEGA_E) * tk - RGEN_GPS_OMEGA_E * eph["toe"]

    x = xk1 * math.cos(omegak) - yk1 * math.cos(ik) * math.sin(omegak)
    y = xk1 * math.sin(omegak) + yk1 * math.cos(ik) * math.cos(omegak)
    z = yk1 * math.sin(ik)

    return (x, y, z, ek)


def rgen_gps_relativistic_correction_sec(eph: dict, ek: float) -> float:
    """
    Relativistic correction to GPS satellite clock (seconds) -- the
    periodic term from orbital eccentricity (ICD-GPS-200 Sec.20.3.3.3.3.1)
    which is NOT included in the broadcast af0/af1/af2 and must be added
    separately. F = -2*sqrt(mu)/c^2 -- cross-checked against the
    reference SiGOGbcst generator (constant fmay=-4.442807633e-10 there,
    matches to 6 significant digits).
    """
    f = -2.0 * math.sqrt(RGEN_GPS_MU) / (RGEN_C ** 2)
    return f * eph["e"] * eph["sqrt_a"] * math.sin(ek)


def rgen_pick_gps_ephemeris(records: list[dict], unix_utc: float) -> dict | None:
    """Picks the ephemeris with Toc closest to the requested moment."""
    if not records:
        return None
    best = None
    best_diff = math.inf
    for rec in records:
        diff = abs(rec["toc_unix"] - unix_utc)
        if diff < best_diff:
            best_diff = diff
            best = rec
    return best