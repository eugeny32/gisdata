<?php

declare(strict_types=1);

require_once __DIR__ . '/Constants.php';

/**
 * Парсинг GPS-эфемерид (записи 'G' в RINEX 3 NAV) и расчёт ECEF-координат
 * спутника на заданный момент времени по стандартному алгоритму
 * ICD-GPS-200 (кеплеровы элементы орбиты + гармонические поправки).
 *
 * Эфемериды НЕ учитывают релятивистскую поправку и групповую задержку
 * (TGD) при расчёте псевдодальности — генератор строит чисто геометрическую
 * дальность "приёмник-спутник", без часовых/атмосферных ошибок (см.
 * RinexObsWriter.php) — это сознательное упрощение для искусственных данных.
 */

function rgen_parse_gps_record(array $l): array
{
    $sat = trim(substr($l[0], 0, 3));
    $year = (int)substr($l[0], 4, 4);
    $month = (int)substr($l[0], 9, 2);
    $day = (int)substr($l[0], 12, 2);
    $hour = (int)substr($l[0], 15, 2);
    $min = (int)substr($l[0], 18, 2);
    $sec = (int)substr($l[0], 21, 2);
    $tocUnix = gmmktime($hour, $min, $sec, $month, $day, $year);
    [$tocWeek, $tocSow] = rgen_utc_to_gps_week_sow($tocUnix);

    return [
        'sat' => $sat,
        'toc_unix' => $tocUnix,
        'toc_week' => $tocWeek,
        'toc_sow' => $tocSow,
        'af0' => rgen_read_f($l[0], 23),
        'af1' => rgen_read_f($l[0], 42),
        'af2' => rgen_read_f($l[0], 61),
        'iode' => rgen_read_f($l[1], 4),
        'crs' => rgen_read_f($l[1], 23),
        'delta_n' => rgen_read_f($l[1], 42),
        'm0' => rgen_read_f($l[1], 61),
        'cuc' => rgen_read_f($l[2], 4),
        'e' => rgen_read_f($l[2], 23),
        'cus' => rgen_read_f($l[2], 42),
        'sqrt_a' => rgen_read_f($l[2], 61),
        'toe' => rgen_read_f($l[3], 4),
        'cic' => rgen_read_f($l[3], 23),
        'omega0' => rgen_read_f($l[3], 42),
        'cis' => rgen_read_f($l[3], 61),
        'i0' => rgen_read_f($l[4], 4),
        'crc' => rgen_read_f($l[4], 23),
        'omega' => rgen_read_f($l[4], 42),
        'omega_dot' => rgen_read_f($l[4], 61),
        'idot' => rgen_read_f($l[5], 4),
        'gps_week' => rgen_read_f($l[5], 42),
    ];
}

/**
 * ECEF-координаты (метры) GPS-спутника в момент unixUtc по эфемериде $eph
 * (одна запись из rgen_parse_gps_nav). Алгоритм — ICD-GPS-200, таблица 20-IV.
 */
function rgen_gps_sat_position(array $eph, float $unixUtc): array
{
    [$week, $sow] = rgen_utc_to_gps_week_sow((int)floor($unixUtc));
    $sow += $unixUtc - floor($unixUtc);

    $a = $eph['sqrt_a'] ** 2;
    $n0 = sqrt(RGEN_GPS_MU / ($a ** 3));
    $tk = $sow - $eph['toe'] + ($week - $eph['toc_week']) * 604800;
    if ($tk > 302400) {
        $tk -= 604800;
    } elseif ($tk < -302400) {
        $tk += 604800;
    }

    $n = $n0 + $eph['delta_n'];
    $mk = $eph['m0'] + $n * $tk;

    $ek = $mk;
    for ($i = 0; $i < 12; $i++) {
        $ek = $mk + $eph['e'] * sin($ek);
    }

    $vk = atan2(sqrt(1 - $eph['e'] ** 2) * sin($ek), cos($ek) - $eph['e']);
    $phik = $vk + $eph['omega'];

    $duk = $eph['cus'] * sin(2 * $phik) + $eph['cuc'] * cos(2 * $phik);
    $drk = $eph['crs'] * sin(2 * $phik) + $eph['crc'] * cos(2 * $phik);
    $dik = $eph['cis'] * sin(2 * $phik) + $eph['cic'] * cos(2 * $phik);

    $uk = $phik + $duk;
    $rk = $a * (1 - $eph['e'] * cos($ek)) + $drk;
    $ik = $eph['i0'] + $dik + $eph['idot'] * $tk;

    $xk1 = $rk * cos($uk);
    $yk1 = $rk * sin($uk);

    $omegak = $eph['omega0'] + ($eph['omega_dot'] - RGEN_GPS_OMEGA_E) * $tk - RGEN_GPS_OMEGA_E * $eph['toe'];

    $x = $xk1 * cos($omegak) - $yk1 * cos($ik) * sin($omegak);
    $y = $xk1 * sin($omegak) + $yk1 * cos($ik) * cos($omegak);
    $z = $yk1 * sin($ik);

    return [$x, $y, $z];
}

/** Выбирает эфемериду с Toe, ближайшим к запрошенному моменту. */
function rgen_pick_gps_ephemeris(array $records, float $unixUtc): ?array
{
    if (!$records) {
        return null;
    }
    $best = null;
    $bestDiff = INF;
    foreach ($records as $rec) {
        $diff = abs($rec['toc_unix'] - $unixUtc);
        if ($diff < $bestDiff) {
            $bestDiff = $diff;
            $best = $rec;
        }
    }
    return $best;
}
