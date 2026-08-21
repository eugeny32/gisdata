"""
Port of app/lib/rinex_gen/RinexObsWriter.php. Builds a synthetic RINEX
2.11 / 3.04 OBS file for one station (fixed ECEF coordinates for the
whole period -- stationary receiver) from GPS+GLONASS ephemerides.
Processing is assumed to be exclusively in Trimble Business Center --
receiver/antenna in the header is always "CHC i50".

See the PHP original's module docstring for the full diagnostic history
(satellite clocks, troposphere, ionosphere, phase ambiguity, the 17 vs 5
observation-type discovery) -- ported here verbatim, not re-derived; the
physics and magic numbers below are load-bearing, not stylistic choices.
"""

import math
import random
import time

from .constants import (
    RGEN_C, RGEN_GLO_F1, RGEN_GLO_F1_STEP, RGEN_GLO_F2, RGEN_GLO_F2_STEP,
    RGEN_GLO_OMEGA_E, RGEN_GPS_F1, RGEN_GPS_F2, RGEN_GPS_OMEGA_E,
    RGEN_GPS_UTC_LEAP_SECONDS, gmtime_fields, rgen_gpst_unix,
)
from .glonass_nav import rgen_glonass_sat_position, rgen_pick_glonass_ephemeris
from .gps_nav import rgen_gps_relativistic_correction_sec, rgen_gps_sat_position, rgen_pick_gps_ephemeris

# Elevation mask was 5 deg -- raised to 10 (matching what Teqbox's own logs
# reported using, "Mask: 10 deg") since the simple troposphere/ionosphere
# model is least accurate at low elevation.
RGEN_ELEVATION_MASK_DEG = 10.0

RGEN_RECEIVER_TYPE = "CHC i50"
RGEN_ANTENNA_TYPE = "CHC i50"


def rgen_merge_ephemerides(day_files: list[dict]) -> dict:
    gps: dict[str, list[dict]] = {}
    glonass: dict[str, list[dict]] = {}
    for parsed in day_files:
        for sat, recs in parsed["gps"].items():
            gps.setdefault(sat, []).extend(recs)
        for sat, recs in parsed["glonass"].items():
            glonass.setdefault(sat, []).extend(recs)
    return {"gps": gps, "glonass": glonass}


def rgen_normalize(v: tuple[float, float, float]) -> tuple[float, float, float]:
    length = math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2)
    if length <= 0.0:
        return (0.0, 0.0, 0.0)
    return (v[0] / length, v[1] / length, v[2] / length)


def rgen_elevation_deg(recv_ecef, sat_ecef) -> float:
    """Satellite elevation above the receiver's horizon, degrees
    (spherical-normal approximation)."""
    up = rgen_normalize(recv_ecef)
    los = (sat_ecef[0] - recv_ecef[0], sat_ecef[1] - recv_ecef[1], sat_ecef[2] - recv_ecef[2])
    los_unit = rgen_normalize(los)
    sin_el = up[0] * los_unit[0] + up[1] * los_unit[1] + up[2] * los_unit[2]
    sin_el = max(-1.0, min(1.0, sin_el))
    return math.degrees(math.asin(sin_el))


def rgen_range(a, b) -> float:
    return math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2)


def rgen_sagnac_rotate(pos, tau: float, omega_e: float) -> tuple[float, float, float]:
    """Rotates satellite ECEF coordinates by the Earth-rotation angle over
    the signal flight time (Sagnac effect) -- converts a position computed
    in the TRANSMIT-time frame into the RECEIVE-time frame (the same one
    the receiver coordinates are given in)."""
    theta = omega_e * tau
    cos_t = math.cos(theta)
    sin_t = math.sin(theta)
    return (pos[0] * cos_t + pos[1] * sin_t, -pos[0] * sin_t + pos[1] * cos_t, pos[2])


def rgen_sat_position_at_reception(sat_pos_fn, eph, t_recv: float, recv_ecef, omega_e: float):
    """
    Satellite coordinates (meters, ECEF at the RECEPTION moment) with
    signal travel time (light-time) accounted for.

    `sat_pos_fn` returns coordinates at a given moment (extra elements
    after index 2, e.g. Ek for GPS, are passed through as-is).

    Returns (corrected_ecef, raw_pos) -- raw_pos is the un-rotated
    position (needed by the caller to pull out Ek for GPS's relativistic
    correction), mirroring the PHP original's by-reference $rawPos.
    """
    tau = 0.075  # initial guess -- typical GPS/GLONASS signal delay
    raw_pos = sat_pos_fn(eph, t_recv - tau)
    corrected = rgen_sagnac_rotate(raw_pos, tau, omega_e)
    for _ in range(10):
        new_tau = rgen_range(recv_ecef, corrected) / RGEN_C
        if abs(new_tau - tau) < 1.0e-9:
            tau = new_tau
            break
        tau = new_tau
        raw_pos = sat_pos_fn(eph, t_recv - tau)
        corrected = rgen_sagnac_rotate(raw_pos, tau, omega_e)
    return corrected, raw_pos


def rgen_generate_ambiguities(eph: dict) -> dict:
    """Integer phase ambiguity (cycles) -- random but CONSTANT for the
    whole session per satellite, separately for L1/L2."""
    ambiguities = {}
    for sat in eph["gps"]:
        ambiguities[sat] = [random.randint(-500000, 500000), random.randint(-500000, 500000)]
    for sat in eph["glonass"]:
        ambiguities[sat] = [random.randint(-500000, 500000), random.randint(-500000, 500000)]
    return ambiguities


def rgen_gps_clock_bias_sec(eph: dict, t: float) -> float:
    dt = t - eph["toc_unix"]
    return eph["af0"] + eph["af1"] * dt + eph["af2"] * dt * dt


def rgen_glonass_clock_bias_sec(eph: dict, t: float) -> float:
    dt = t - eph["tb_unix"]
    return eph["tau_n"] - eph["gamma_n"] * dt


def rgen_tropo_delay_m(elevation_deg: float, ecef) -> float:
    """Troposphere delay (meters) -- modified Hopfield model (Seeber,
    1993), ported from the reference SiGOGbcst generator (FUNCTION
    SEEBER2). Separate dry/wet components; standard pressure/temperature/
    humidity (1013.25 mbar, 20C, 50%) -- not user-configurable, matching
    SiGOG."""
    el_deg = max(elevation_deg, 5.0)
    pressure_mb = 1013.25
    temp_c = 20.0
    humidity_pct = 50.0
    temp_k = temp_c + 273.15

    earth_r = 6371.0e3
    r = math.sqrt(ecef[0] ** 2 + ecef[1] ** 2 + ecef[2] ** 2)
    h = r - earth_r

    pv = humidity_pct / 100.0 * math.exp(-37.2465 + 0.213166 * temp_k - 0.256908e-3 * temp_k ** 2)
    if pv > 1.0:
        pv /= 100.0

    hd = 40136.0 + 148.72 * temp_c
    hw = 11.0e3

    nd0 = 155.2e-7 * hd * pressure_mb / temp_k
    nw0 = 1.0e-6 * hw / 5.0 * (-12.96 * temp_k + 3.718e5) * pv / (temp_k ** 2)

    nd0 *= ((hd - h) / hd) ** 5
    nw0 *= ((hw - h) / hw) ** 5
    if h > hd:
        nd0 = 0.0
    if h > hw:
        nw0 = 0.0

    facd = 1.0 / math.sin(math.radians(math.sqrt(el_deg ** 2 + 6.25)))
    facw = 1.0 / math.sin(math.radians(math.sqrt(el_deg ** 2 + 2.25)))

    return nd0 * facd + nw0 * facw


# Zenith L1 ionosphere delay (meters) -- FIXED (not randomized per
# station!), see PHP original for the full rationale (shared ionosphere
# between base/rover must actually cancel in differential processing).
RGEN_IONO_ZENITH_L1_M = 3.0


def rgen_iono_mapping(elevation_deg: float) -> float:
    """Ionosphere slant mapping factor (thin-shell model, height ~350km)."""
    earth_r = 6378137.0
    iono_height = 350000.0
    x = (earth_r / (earth_r + iono_height)) * math.cos(math.radians(max(elevation_deg, 5.0)))
    return 1.0 / math.sqrt(max(1e-6, 1.0 - x * x))


def rgen_snr_db(elevation_deg: float) -> float:
    return min(55.0, 25.0 + elevation_deg * 0.4) + random.randint(-10, 10) / 10.0


def rgen_snr_flag(snr_db: float) -> int:
    """Unambiguous signal-strength indicator (1-9) per the RINEX 2/3
    spec."""
    if snr_db < 12.0:
        return 1
    if snr_db < 18.0:
        return 2
    if snr_db < 24.0:
        return 3
    if snr_db < 30.0:
        return 4
    if snr_db < 36.0:
        return 5
    if snr_db < 42.0:
        return 6
    if snr_db < 48.0:
        return 7
    if snr_db < 54.0:
        return 8
    return 9


def rgen_compute_visible_ranges(eph: dict, ecef, t: float) -> dict:
    """
    Geometric range + satellite clock + troposphere for every visible
    (above the elevation mask) satellite at moment t. Receiver clock and
    ionosphere (frequency-dependent, range here is common to both bands)
    are NOT included -- added separately by the OBS writers.

    Returns {satId ("G01"/"R05"): {"range": ..., "elevDeg": ...}}
    """
    ranges = {}
    for sat, records in eph["gps"].items():
        best = rgen_pick_gps_ephemeris(records, t)
        if best is None:
            continue
        pos, raw_pos = rgen_sat_position_at_reception(rgen_gps_sat_position, best, t, ecef, RGEN_GPS_OMEGA_E)
        elev_deg = rgen_elevation_deg(ecef, pos)
        if elev_deg < RGEN_ELEVATION_MASK_DEG:
            continue
        sat_clock_m = RGEN_C * (rgen_gps_clock_bias_sec(best, t) + rgen_gps_relativistic_correction_sec(best, raw_pos[3]))
        ranges[sat] = {"range": rgen_range(ecef, pos) - sat_clock_m + rgen_tropo_delay_m(elev_deg, ecef), "elevDeg": elev_deg}
    for sat, records in eph["glonass"].items():
        best = rgen_pick_glonass_ephemeris(records, t)
        if best is None:
            continue
        pos, _raw_pos = rgen_sat_position_at_reception(rgen_glonass_sat_position, best, t, ecef, RGEN_GLO_OMEGA_E)
        elev_deg = rgen_elevation_deg(ecef, pos)
        if elev_deg < RGEN_ELEVATION_MASK_DEG:
            continue
        sat_clock_m = RGEN_C * rgen_glonass_clock_bias_sec(best, t)
        ranges[sat] = {
            "range": rgen_range(ecef, pos) - sat_clock_m + rgen_tropo_delay_m(elev_deg, ecef),
            "elevDeg": elev_deg,
            "freqChannel": int(best.get("freq_channel") or 0),
        }
    return ranges


def rgen_header_line(data: str, label: str) -> str:
    # RINEX is traditionally written with CRLF (DOS/Windows convention).
    return f"{data[:60]:<60}{label:<20}" + "\r\n"


RGEN_RINEX2_OBS_TYPES = ["C1", "L1", "D1", "S1", "P2", "L2", "D2", "S2", "C2", "C5", "L5", "D5", "S5", "C7", "L7", "D7", "S7"]


def _chunk(seq, size):
    return [seq[i:i + size] for i in range(0, len(seq), size)]


def rgen_build_obs_types_header_lines(types: list[str]) -> str:
    out = ""
    for i, chunk in enumerate(_chunk(types, 9)):
        prefix = f"{len(types):6d}" if i == 0 else " " * 6
        line = prefix + "".join(f"{t:>6s}" for t in chunk)
        out += rgen_header_line(line, "# / TYPES OF OBSERV")
    return out


def _now_utc_ymd_his() -> str:
    return time.strftime("%Y%m%d %H%M%S", time.gmtime())


def rgen_build_rinex2_header(station_name: str, ecef, start_unix: int, interval_sec: float, gps_only: bool = False) -> str:
    sys_label = "G (GPS)" if gps_only else "M (MIXED)"
    out = ""
    out += rgen_header_line(f"{2.11:9.2f}{'':11s}{'OBSERVATION DATA':<20s}{sys_label:<20s}", "RINEX VERSION / TYPE")
    out += rgen_header_line(f"{'gisdata-rinex-synth':<20s}{'gisdata':<20s}{_now_utc_ymd_his() + ' UTC':<20s}", "PGM / RUN BY / DATE")
    out += rgen_header_line(station_name[:60], "MARKER NAME")
    out += rgen_header_line(station_name[:60], "MARKER NUMBER")
    out += rgen_header_line(f"{'SYNTH':<20s}{'gisdata':<40s}", "OBSERVER / AGENCY")
    out += rgen_header_line(f"{'1':<20s}{RGEN_RECEIVER_TYPE:<20s}{'1.0':<20s}", "REC # / TYPE / VERS")
    out += rgen_header_line(f"{'1':<20s}{RGEN_ANTENNA_TYPE:<20s}", "ANT # / TYPE")
    out += rgen_header_line(f"{ecef[0]:14.4f}{ecef[1]:14.4f}{ecef[2]:14.4f}", "APPROX POSITION XYZ")
    out += rgen_header_line(f"{0.0:14.4f}{0.0:14.4f}{0.0:14.4f}", "ANTENNA: DELTA H/E/N")
    out += rgen_header_line(f"{1:6d}{1:6d}", "WAVELENGTH FACT L1/2")
    out += rgen_build_obs_types_header_lines(RGEN_RINEX2_OBS_TYPES)
    out += rgen_header_line(f"{interval_sec:10.3f}", "INTERVAL")
    first_obs_gpst = rgen_gpst_unix(start_unix)
    gt = gmtime_fields(first_obs_gpst)
    out += rgen_header_line(
        f"{gt.tm_year:6d}{gt.tm_mon:6d}{gt.tm_mday:6d}{gt.tm_hour:6d}{gt.tm_min:6d}{float(gt.tm_sec):13.7f}{'':5s}GPS",
        "TIME OF FIRST OBS",
    )
    out += rgen_header_line(f"{RGEN_GPS_UTC_LEAP_SECONDS:6d}", "LEAP SECONDS")
    out += rgen_header_line("", "END OF HEADER")
    return out


def rgen_format_sat_list_lines(epoch_prefix: str, sat_ids: list[str]) -> str:
    """Epoch satellite-list line(s) -- up to 12 three-char IDs per line,
    no separators between them."""
    out = ""
    for i, chunk in enumerate(_chunk(sat_ids, 12)):
        prefix = epoch_prefix if i == 0 else " " * len(epoch_prefix)
        out += prefix + "".join(chunk) + "\r\n"
    return out


def rgen_format_obs_line(values: list[float | None], flags: list[int | None] | None = None) -> str:
    flags = flags or []
    out = ""
    for i, chunk in enumerate(_chunk(values, 5)):
        flag_chunk = flags[i * 5: i * 5 + len(chunk)]
        line = ""
        for j, v in enumerate(chunk):
            if v is None:
                line += " " * 16
                continue
            flag = flag_chunk[j] if j < len(flag_chunk) else None
            line += f"{v:14.3f}" + " " + (str(flag) if flag is not None else " ")
        out += line + "\r\n"
    return out


def rgen_build_rinex2_obs(station_name: str, ecef, start_unix: int, end_unix: int, eph: dict, gps_only: bool = False) -> str:
    """Builds the full text of a RINEX 2.11 OBS file for one station."""
    if gps_only:
        eph = {**eph, "glonass": {}}
    interval_sec = 5.0
    ambiguities = rgen_generate_ambiguities(eph)

    clock_bias_m = float(random.randint(-200, 200))
    clock_drift_m_per_sec = random.randint(-3, 3) / 1000.0

    out = rgen_build_rinex2_header(station_name, ecef, start_unix, interval_sec, gps_only)

    t = start_unix
    while t <= end_unix:
        ranges = rgen_compute_visible_ranges(eph, ecef, float(t))
        if not ranges:
            t += int(interval_sec)
            continue
        ranges_next = rgen_compute_visible_ranges(eph, ecef, float(t + 1))
        clock_offset_m = clock_bias_m + clock_drift_m_per_sec * (t - start_unix)

        epoch_rows: dict[str, list[float]] = {}
        epoch_flags: dict[str, list[int | None]] = {}
        for sat, info in ranges.items():
            rng = info["range"]
            is_glo = sat[0] == "R"
            if is_glo:
                k = info.get("freqChannel", 0)
                f1 = RGEN_GLO_F1 + k * RGEN_GLO_F1_STEP
                f2 = RGEN_GLO_F2 + k * RGEN_GLO_F2_STEP
            else:
                f1, f2 = RGEN_GPS_F1, RGEN_GPS_F2
            lambda1 = RGEN_C / f1
            lambda2 = RGEN_C / f2

            iono_l1 = RGEN_IONO_ZENITH_L1_M * rgen_iono_mapping(info["elevDeg"])
            iono_l2 = iono_l1 * (f1 / f2) ** 2

            amb_n1, amb_n2 = ambiguities[sat]
            c1 = rng + iono_l1 + clock_offset_m + random.randint(-300, 300) / 1000.0
            p2 = rng + iono_l2 + clock_offset_m + random.randint(-300, 300) / 1000.0
            l1 = (rng - iono_l1 + clock_offset_m) / lambda1 + amb_n1 + random.randint(-5, 5) / 1000.0
            l2 = (rng - iono_l2 + clock_offset_m) / lambda2 + amb_n2 + random.randint(-5, 5) / 1000.0
            s1 = rgen_snr_db(info["elevDeg"])
            s2 = rgen_snr_db(info["elevDeg"])
            next_info = ranges_next.get(sat)
            range_rate = (next_info["range"] - rng) if next_info else 0.0
            d1 = -range_rate / lambda1
            d2 = -range_rate / lambda2
            epoch_rows[sat] = [c1, l1, d1, s1, p2, l2, d2, s2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
            flag1 = rgen_snr_flag(s1)
            flag2 = rgen_snr_flag(s2)
            epoch_flags[sat] = [None, flag1, None, None, None, flag2, None, None, None, None, None, None, None, None, None, None, None]

        sats_sorted = sorted(epoch_rows.keys())
        frac = t - math.floor(t)
        t_gpst = rgen_gpst_unix(int(t))
        gt = gmtime_fields(t_gpst)
        epoch_prefix = (
            f"{gt.tm_year % 100:3d}{gt.tm_mon:3d}{gt.tm_mday:3d}{gt.tm_hour:3d}{gt.tm_min:3d}"
            f"{float(gt.tm_sec) + frac:11.7f}{0:3d}{len(epoch_rows):3d}"
        )
        sat_ids_for_list = (
            [f"{int(s[1:]):3d}" for s in sats_sorted] if gps_only else sats_sorted
        )
        out += rgen_format_sat_list_lines(epoch_prefix, sat_ids_for_list)
        for sat in sats_sorted:
            out += rgen_format_obs_line(epoch_rows[sat], epoch_flags[sat])

        t += int(interval_sec)

    return out

def rgen_build_glonass_slot_freq_lines(glonass_eph: dict) -> str:
    """"GLONASS SLOT / FRQ #" line(s) -- up to 8 (slot, freq channel)
    pairs per line."""
    by_slot: dict[int, str] = {}
    for sat, records in glonass_eph.items():
        slot = int(sat[1:])
        freq = records[0].get("freq_channel", 0) if records else 0
        by_slot[slot] = f"R{slot:02d}{freq:3d}"
    if not by_slot:
        return ""
    pairs = [by_slot[k] for k in sorted(by_slot.keys())]
    out = ""
    for i, chunk in enumerate(_chunk(pairs, 8)):
        prefix = f"{len(pairs):3d} " if i == 0 else "    "
        out += rgen_header_line(prefix + " ".join(chunk), "GLONASS SLOT / FRQ #")
    return out


def rgen_build_rinex3_header(station_name: str, ecef, start_unix: int, interval_sec: float, eph: dict, gps_only: bool = False, rinex_version: float = 3.04) -> str:
    sys_label = "G (GPS)" if gps_only else "M (MIXED)"
    out = ""
    out += rgen_header_line(f"{rinex_version:9.2f}{'':11s}{'OBSERVATION DATA':<20s}{sys_label:<20s}", "RINEX VERSION / TYPE")
    out += rgen_header_line(f"{'gisdata-rinex-synth':<20s}{'gisdata':<20s}{_now_utc_ymd_his() + ' UTC':<20s}", "PGM / RUN BY / DATE")
    out += rgen_header_line("Synthetic RINEX (artificial test data, not real observations)", "COMMENT")
    out += rgen_header_line(station_name[:60], "MARKER NAME")
    out += rgen_header_line(f"{'SYNTH':<20s}{'gisdata':<40s}", "OBSERVER / AGENCY")
    out += rgen_header_line(f"{'1':<20s}{RGEN_RECEIVER_TYPE:<20s}{'1.0':<20s}", "REC # / TYPE / VERS")
    out += rgen_header_line(f"{'1':<20s}{RGEN_ANTENNA_TYPE:<20s}", "ANT # / TYPE")
    out += rgen_header_line(f"{ecef[0]:14.4f}{ecef[1]:14.4f}{ecef[2]:14.4f}", "APPROX POSITION XYZ")
    out += rgen_header_line(f"{0.0:14.4f}{0.0:14.4f}{0.0:14.4f}", "ANTENNA: DELTA H/E/N")
    # L2 code: "W" for GPS (Z-tracking -- modern receivers don't track
    # P(Y) directly, see real EKB2/ARTI files: "C2W L2W"), "C" for GLONASS
    # (no equivalent code-protection scheme, so C/A on L2 too).
    out += rgen_header_line("G    6 C1C L1C C2W L2W S1C S2W", "SYS / # / OBS TYPES")
    if not gps_only:
        out += rgen_header_line("R    6 C1C L1C C2C L2C S1C S2C", "SYS / # / OBS TYPES")
        out += rgen_build_glonass_slot_freq_lines(eph["glonass"])
    out += rgen_header_line(f"{interval_sec:10.3f}", "INTERVAL")
    first_obs_gpst = rgen_gpst_unix(start_unix)
    gt = gmtime_fields(first_obs_gpst)
    out += rgen_header_line(
        f"{gt.tm_year:6d}{gt.tm_mon:6d}{gt.tm_mday:6d}{gt.tm_hour:6d}{gt.tm_min:6d}{float(gt.tm_sec):14.7f}{'':5s}GPS",
        "TIME OF FIRST OBS",
    )
    out += rgen_header_line(f"{RGEN_GPS_UTC_LEAP_SECONDS:6d}", "LEAP SECONDS")
    out += rgen_header_line("", "END OF HEADER")
    return out


def rgen_format_obs_line_rinex3(sat_id: str, values: list[float], flags: list[int | None] | None = None) -> str:
    flags = flags or []
    line = sat_id
    for i, v in enumerate(values):
        if v is None:
            line += " " * 16
            continue
        flag = flags[i] if i < len(flags) else None
        line += f"{v:14.3f}" + " " + (str(flag) if flag is not None else " ")
    return line + "\r\n"


def rgen_build_rinex3_obs(station_name: str, ecef, start_unix: int, end_unix: int, eph: dict, gps_only: bool = False, rinex_version: float = 3.04) -> str:
    """
    Builds the full text of a RINEX 3.04/4.00 OBS file -- the epoch/
    observation line structure (3-char codes C1C/L1C/...) for RINEX 4.00
    OBS files is the same as 3.04, only the header version number
    changes -- RINEX 4.00's substantive differences are mostly about NAV
    files (see rgen_filter_nav_to_rinex4 in nav_file.py).
    """
    if gps_only:
        eph = {**eph, "glonass": {}}
    interval_sec = 5.0
    ambiguities = rgen_generate_ambiguities(eph)

    clock_bias_m = float(random.randint(-200, 200))
    clock_drift_m_per_sec = random.randint(-3, 3) / 1000.0

    out = rgen_build_rinex3_header(station_name, ecef, start_unix, interval_sec, eph, gps_only, rinex_version)

    t = start_unix
    while t <= end_unix:
        ranges = rgen_compute_visible_ranges(eph, ecef, float(t))
        if not ranges:
            t += int(interval_sec)
            continue
        clock_offset_m = clock_bias_m + clock_drift_m_per_sec * (t - start_unix)

        epoch_rows: dict[str, list[float]] = {}
        epoch_flags: dict[str, list[int | None]] = {}
        for sat, info in ranges.items():
            rng = info["range"]
            is_glo = sat[0] == "R"
            if is_glo:
                k = info.get("freqChannel", 0)
                f1 = RGEN_GLO_F1 + k * RGEN_GLO_F1_STEP
                f2 = RGEN_GLO_F2 + k * RGEN_GLO_F2_STEP
            else:
                f1, f2 = RGEN_GPS_F1, RGEN_GPS_F2
            lambda1 = RGEN_C / f1
            lambda2 = RGEN_C / f2

            iono_l1 = RGEN_IONO_ZENITH_L1_M * rgen_iono_mapping(info["elevDeg"])
            iono_l2 = iono_l1 * (f1 / f2) ** 2

            amb_n1, amb_n2 = ambiguities[sat]
            c1 = rng + iono_l1 + clock_offset_m + random.randint(-300, 300) / 1000.0
            c2 = rng + iono_l2 + clock_offset_m + random.randint(-300, 300) / 1000.0
            l1 = (rng - iono_l1 + clock_offset_m) / lambda1 + amb_n1 + random.randint(-5, 5) / 1000.0
            l2 = (rng - iono_l2 + clock_offset_m) / lambda2 + amb_n2 + random.randint(-5, 5) / 1000.0
            s1 = rgen_snr_db(info["elevDeg"])
            s2 = rgen_snr_db(info["elevDeg"])
            epoch_rows[sat] = [c1, l1, c2, l2, s1, s2]
            flag1 = rgen_snr_flag(s1)
            flag2 = rgen_snr_flag(s2)
            epoch_flags[sat] = [None, flag1, None, flag2, None, None]

        sats_sorted = sorted(epoch_rows.keys())
        frac = t - math.floor(t)
        t_gpst = rgen_gpst_unix(int(t))
        gt = gmtime_fields(t_gpst)
        out += (
            f"> {gt.tm_year:4d} {gt.tm_mon:02d} {gt.tm_mday:02d} {gt.tm_hour:02d} {gt.tm_min:02d}"
            f"{float(gt.tm_sec) + frac:11.7f}  0{len(epoch_rows):3d}\r\n"
        )
        for sat in sats_sorted:
            out += rgen_format_obs_line_rinex3(sat, epoch_rows[sat], epoch_flags[sat])

        t += int(interval_sec)

    return out


RGEN_GISDATA_OBS_TYPES = ["C1", "P1", "P2", "L1", "L2"]


def rgen_build_gisdata_header(station_name: str, ecef, start_unix: int, interval_sec: float) -> str:
    out = ""
    out += rgen_header_line(f"{2.11:9.2f}{'':11s}{'OBSERVATION DATA':<20s}{'G (GPS)':<20s}", "RINEX VERSION / TYPE")
    out += rgen_header_line(f"{'gisdata-rinex-gisdata':<20s}{'gisdata':<20s}{_now_utc_ymd_his() + ' UTC':<20s}", "PGM / RUN BY / DATE")
    out += rgen_header_line("Gisdata-mode synthetic RINEX: no iono, no noise, no ambiguity", "COMMENT")
    out += rgen_header_line(station_name[:60], "MARKER NAME")
    out += rgen_header_line(station_name[:60], "MARKER NUMBER")
    out += rgen_header_line(f"{'SYNTH':<20s}{'gisdata':<40s}", "OBSERVER / AGENCY")
    out += rgen_header_line(f"{'1':<20s}{'GISDATA':<20s}{'1.0':<20s}", "REC # / TYPE / VERS")
    out += rgen_header_line(f"{'1':<20s}{'GISDATA':<20s}", "ANT # / TYPE")
    out += rgen_header_line(f"{ecef[0]:14.4f}{ecef[1]:14.4f}{ecef[2]:14.4f}", "APPROX POSITION XYZ")
    out += rgen_header_line(f"{0.0:14.4f}{0.0:14.4f}{0.0:14.4f}", "ANTENNA: DELTA H/E/N")
    out += rgen_header_line(f"{1:6d}{1:6d}", "WAVELENGTH FACT L1/2")
    out += rgen_build_obs_types_header_lines(RGEN_GISDATA_OBS_TYPES)
    out += rgen_header_line(f"{interval_sec:10.3f}", "INTERVAL")
    first_obs_gpst = rgen_gpst_unix(start_unix)
    gt = gmtime_fields(first_obs_gpst)
    out += rgen_header_line(
        f"{gt.tm_year:6d}{gt.tm_mon:6d}{gt.tm_mday:6d}{gt.tm_hour:6d}{gt.tm_min:6d}{float(gt.tm_sec):13.7f}{'':5s}GPS",
        "TIME OF FIRST OBS",
    )
    out += rgen_header_line(f"{RGEN_GPS_UTC_LEAP_SECONDS:6d}", "LEAP SECONDS")
    out += rgen_header_line("", "END OF HEADER")
    return out


def rgen_build_gisdata_obs(station_name: str, ecef, start_unix: int, end_unix: int, eph: dict) -> str:
    """
    Builds a RINEX 2.11 OBS strictly by the reference SiGOGbcst's own
    logic/math -- the "Gisdata" mode: GPS only, geometric range with
    light-time/Sagnac, relativistic correction and Hopfield/Seeber
    troposphere (the same rgen_compute_visible_ranges the main generator
    uses) -- WITHOUT ionosphere, WITHOUT measurement noise, and WITHOUT
    integer phase ambiguity: code and phase both come from the SAME
    corrected range.
    """
    eph = {**eph, "glonass": {}}
    interval_sec = 5.0
    lambda1 = RGEN_C / RGEN_GPS_F1
    lambda2 = RGEN_C / RGEN_GPS_F2

    out = rgen_build_gisdata_header(station_name, ecef, start_unix, interval_sec)

    t = start_unix
    while t <= end_unix:
        ranges = rgen_compute_visible_ranges(eph, ecef, float(t))
        if not ranges:
            t += int(interval_sec)
            continue
        epoch_rows: dict[str, list[float]] = {}
        epoch_flags: dict[str, list[int | None]] = {}
        for sat, info in ranges.items():
            rng = info["range"]
            epoch_rows[sat] = [rng, rng, rng, rng / lambda1, rng / lambda2]
            flag1 = rgen_snr_flag(rgen_snr_db(info["elevDeg"]))
            epoch_flags[sat] = [None, None, None, flag1, flag1]

        sats_sorted = sorted(epoch_rows.keys())
        frac = t - math.floor(t)
        t_gpst = rgen_gpst_unix(int(t))
        gt = gmtime_fields(t_gpst)
        epoch_prefix = (
            f"{gt.tm_year % 100:3d}{gt.tm_mon:3d}{gt.tm_mday:3d}{gt.tm_hour:3d}{gt.tm_min:3d}"
            f"{float(gt.tm_sec) + frac:11.7f}{0:3d}{len(epoch_rows):3d}"
        )
        out += rgen_format_sat_list_lines(epoch_prefix, sats_sorted)
        for sat in sats_sorted:
            out += rgen_format_obs_line(epoch_rows[sat], epoch_flags[sat])

        t += int(interval_sec)

    return out
