"""
Port of app/lib/rinex_gen/GlonassNav.php. Parses GLONASS ephemerides
('R' records in RINEX 3 NAV) and computes satellite ECEF coordinates at
a given time.

Unlike GPS, the GLONASS navigation message doesn't give Keplerian
orbital elements -- it gives the satellite's position/velocity/luni-solar
acceleration in PZ-90 at moment tb, and the position at any other moment
comes from numerically integrating the equations of motion (4th-order
Runge-Kutta, accounting for the second zonal harmonic J2 and Earth
rotation) -- see the GLONASS ICD, ed. 5.1, equations-of-motion appendix.
The luni-solar acceleration from the ephemeris is treated as constant
over the integration interval (this is the ICD's own approximation, not
a generator simplification -- the GLONASS ephemeris is refreshed every
~30 minutes precisely because of this).
"""

import math

from .constants import RGEN_GLO_AE, RGEN_GLO_J02, RGEN_GLO_MU, RGEN_GLO_OMEGA_E, gmmktime, rgen_read_f

RGEN_GLO_MAX_EXTRAPOLATION_SEC = 1800.0


def rgen_parse_glonass_record(l: list[str]) -> dict:
    sat = l[0][0:3].strip()
    year = int(l[0][4:8])
    month = int(l[0][9:11])
    day = int(l[0][12:14])
    hour = int(l[0][15:17])
    minute = int(l[0][18:20])
    sec = int(l[0][21:23])
    # The raw satellite broadcast gives tb on the UTC+3 (Moscow decree)
    # scale, but the RINEX standard requires the generator to already
    # convert the epoch to UTC when writing -- i.e. this field here is
    # already UTC, no extra +3h shift needed (that would double it).
    tb_unix = gmmktime(hour, minute, sec, month, day, year)

    # Position/velocity in the ephemeris are given in km, km/s, km/s^2 --
    # convert to meters right away when parsing.
    return {
        "sat": sat,
        "tb_unix": tb_unix,
        "tau_n": rgen_read_f(l[0], 23),
        "gamma_n": rgen_read_f(l[0], 42),
        "x": rgen_read_f(l[1], 4) * 1000,
        "vx": rgen_read_f(l[1], 23) * 1000,
        "ax": rgen_read_f(l[1], 42) * 1000,
        "y": rgen_read_f(l[2], 4) * 1000,
        "vy": rgen_read_f(l[2], 23) * 1000,
        "ay": rgen_read_f(l[2], 42) * 1000,
        "z": rgen_read_f(l[3], 4) * 1000,
        "vz": rgen_read_f(l[3], 23) * 1000,
        "az": rgen_read_f(l[3], 42) * 1000,
        # Frequency channel (-7..+6) -- needed for the "GLONASS SLOT / FRQ #"
        # header in the OBS file (GLONASS is FDMA).
        "freq_channel": int(rgen_read_f(l[2], 61)),
    }


def rgen_glonass_deriv(state: list[float], lunisolar: list[float]) -> list[float]:
    """Right-hand side of the GLONASS (PZ-90) equations of motion:
    returns the derivative of the 6-dim state [x,y,z,vx,vy,vz], i.e.
    [vx,vy,vz,ax,ay,az], accounting for central gravity, the J2 zonal
    harmonic, and Earth rotation (Coriolis/centrifugal terms, since the
    equations are written in the rotating PZ-90/ECEF frame). `lunisolar`
    is the constant-over-the-interval luni-solar acceleration [ax,ay,az]
    from the ephemeris."""
    x, y, z, vx, vy, vz = state
    r2 = x * x + y * y + z * z
    r = math.sqrt(r2)
    r3 = r2 * r

    omega2 = RGEN_GLO_OMEGA_E ** 2
    a = 1.5 * RGEN_GLO_J02 * RGEN_GLO_MU * (RGEN_GLO_AE ** 2) / r2 / r3
    b = 5.0 * z * z / r2
    c = -RGEN_GLO_MU / r3 - a * (1.0 - b)

    ax = (c + omega2) * x + 2.0 * RGEN_GLO_OMEGA_E * vy + lunisolar[0]
    ay = (c + omega2) * y - 2.0 * RGEN_GLO_OMEGA_E * vx + lunisolar[1]
    az = (c - 2.0 * a) * z + lunisolar[2]

    return [vx, vy, vz, ax, ay, az]


def rgen_state_add_scaled(a: list[float], b: list[float], scale: float) -> list[float]:
    return [a[i] + b[i] * scale for i in range(6)]


def rgen_glonass_sat_position(eph: dict, unix_utc: float) -> tuple[float, float, float]:
    """Integrates the GLONASS satellite state from tb (ephemeris moment)
    to unix_utc via 4th-order Runge-Kutta with a step of at most 30s
    (finer than the ICD's recommended 60s -- taking a smaller step for
    accuracy over long gaps between ephemeris updates)."""
    dt = unix_utc - eph["tb_unix"]
    lunisolar = [eph["ax"], eph["ay"], eph["az"]]
    state = [eph["x"], eph["y"], eph["z"], eph["vx"], eph["vy"], eph["vz"]]

    max_step = 30.0
    steps = max(1, math.ceil(abs(dt) / max_step))
    h = dt / steps

    for _ in range(steps):
        k1 = rgen_glonass_deriv(state, lunisolar)
        k2 = rgen_glonass_deriv(rgen_state_add_scaled(state, k1, h / 2), lunisolar)
        k3 = rgen_glonass_deriv(rgen_state_add_scaled(state, k2, h / 2), lunisolar)
        k4 = rgen_glonass_deriv(rgen_state_add_scaled(state, k3, h), lunisolar)
        for j in range(6):
            state[j] += (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])

    return (state[0], state[1], state[2])


def rgen_pick_glonass_ephemeris(records: list[dict], unix_utc: float) -> dict | None:
    """
    Picks the ephemeris with tb closest to the requested moment -- but no
    farther than RGEN_GLO_MAX_EXTRAPOLATION_SEC. Unlike GPS, GLONASS
    numerical-integration accuracy (with the constant-luni-solar-
    acceleration assumption) drops noticeably for large |t-tb| -- this is
    an ICD limitation, not a generator one. If no ephemeris record for a
    satellite falls within the allowed window, it's better to drop it
    from this epoch entirely (treat as "not visible") than give a
    noticeably wrong position.
    """
    if not records:
        return None
    best = None
    best_diff = math.inf
    for rec in records:
        diff = abs(rec["tb_unix"] - unix_utc)
        if diff < best_diff:
            best_diff = diff
            best = rec
    return best if best_diff <= RGEN_GLO_MAX_EXTRAPOLATION_SEC else None