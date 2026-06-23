<?php

declare(strict_types=1);

require_once __DIR__ . '/Constants.php';

/**
 * Парсинг ГЛОНАСС-эфемерид (записи 'R' в RINEX 3 NAV) и расчёт
 * ECEF-координат спутника на заданный момент.
 *
 * В отличие от GPS, навигационное сообщение ГЛОНАСС не задаёт кеплеровы
 * элементы орбиты — задаёт координаты/скорость/луно-солнечное ускорение
 * спутника в ПЗ-90 на момент tb, а положение на произвольный момент
 * получается численным интегрированием уравнений движения (метод
 * Рунге-Кутты 4-го порядка, с учётом второй зональной гармоники J2 и
 * вращения Земли) — см. ИКД ГЛОНАСС, ред. 5.1, приложение про уравнения
 * движения. Луно-солнечное ускорение из эфемериды считается постоянным на
 * интервале интегрирования (это approximation самого ИКД, не упрощение
 * генератора — эфемерида ГЛОНАСС обновляется каждые ~30 минут именно
 * потому, что точность падает на больших интервалах).
 */

function rgen_parse_glonass_record(array $l): array
{
    $sat = trim(substr($l[0], 0, 3));
    $year = (int)substr($l[0], 4, 4);
    $month = (int)substr($l[0], 9, 2);
    $day = (int)substr($l[0], 12, 2);
    $hour = (int)substr($l[0], 15, 2);
    $min = (int)substr($l[0], 18, 2);
    $sec = (int)substr($l[0], 21, 2);
    // В сырой трансляции спутника tb даётся в шкале UTC+3 (декретное
    // московское), но стандарт RINEX требует от генератора файла уже
    // пересчитать эпоху в UTC при записи — то есть это поле здесь уже UTC,
    // дополнительный пересчёт на +3 часа не нужен (иначе он был бы внесён
    // повторно, "задвоив" сдвиг).
    $tbUnix = gmmktime($hour, $min, $sec, $month, $day, $year);

    // Координаты/скорость в эфемериде ГЛОНАСС даны в км, км/с, км/с^2 —
    // переводим в метры сразу при парсинге.
    return [
        'sat' => $sat,
        'tb_unix' => $tbUnix,
        'tau_n' => rgen_read_f($l[0], 23),
        'gamma_n' => rgen_read_f($l[0], 42),
        'x' => rgen_read_f($l[1], 4) * 1000,
        'vx' => rgen_read_f($l[1], 23) * 1000,
        'ax' => rgen_read_f($l[1], 42) * 1000,
        'y' => rgen_read_f($l[2], 4) * 1000,
        'vy' => rgen_read_f($l[2], 23) * 1000,
        'ay' => rgen_read_f($l[2], 42) * 1000,
        'z' => rgen_read_f($l[3], 4) * 1000,
        'vz' => rgen_read_f($l[3], 23) * 1000,
        'az' => rgen_read_f($l[3], 42) * 1000,
        // Частотный канал (литера, -7..+6) — 4-е поле строки Y/VY/AY/freq.
        // Нужен для заголовка "GLONASS SLOT / FRQ #" в OBS-файле (ГЛОНАСС —
        // FDMA, без этой записи приёмник/постпроцессинг не знает, на какой
        // физической частоте слушать конкретный спутник).
        'freq_channel' => (int)rgen_read_f($l[2], 61),
    ];
}

/**
 * Правая часть уравнений движения ГЛОНАСС (ПЗ-90): возвращает производную
 * 6-мерного состояния [x,y,z,vx,vy,vz] — т.е. [vx,vy,vz,ax,ay,az], с учётом
 * центрального притяжения, второй зональной гармоники J2 и вращения Земли
 * (кориолисовы/центробежные члены, т.к. уравнения записаны во вращающейся
 * системе координат ПЗ-90/ECEF). $lunisolar — постоянное на интервале
 * луно-солнечное ускорение [ax,ay,az] из эфемериды.
 */
function rgen_glonass_deriv(array $state, array $lunisolar): array
{
    [$x, $y, $z, $vx, $vy, $vz] = $state;
    $r2 = $x * $x + $y * $y + $z * $z;
    $r = sqrt($r2);
    $r3 = $r2 * $r;

    $omega2 = RGEN_GLO_OMEGA_E ** 2;
    $a = 1.5 * RGEN_GLO_J02 * RGEN_GLO_MU * (RGEN_GLO_AE ** 2) / $r2 / $r3;
    $b = 5.0 * $z * $z / $r2;
    $c = -RGEN_GLO_MU / $r3 - $a * (1.0 - $b);

    $ax = ($c + $omega2) * $x + 2.0 * RGEN_GLO_OMEGA_E * $vy + $lunisolar[0];
    $ay = ($c + $omega2) * $y - 2.0 * RGEN_GLO_OMEGA_E * $vx + $lunisolar[1];
    $az = ($c - 2.0 * $a) * $z + $lunisolar[2];

    return [$vx, $vy, $vz, $ax, $ay, $az];
}

function rgen_state_add_scaled(array $a, array $b, float $scale): array
{
    $out = [];
    for ($i = 0; $i < 6; $i++) {
        $out[$i] = $a[$i] + $b[$i] * $scale;
    }
    return $out;
}

/**
 * Интегрирует состояние ГЛОНАСС-спутника от tb (момент эфемериды) до
 * unixUtc методом Рунге-Кутты 4-го порядка с шагом не более 30 с (точнее
 * рекомендованных в ИКД 60 с — берём вдвое мельче шаг для точности на
 * длинных интервалах между обновлениями эфемериды).
 */
function rgen_glonass_sat_position(array $eph, float $unixUtc): array
{
    $dt = $unixUtc - $eph['tb_unix'];
    $lunisolar = [$eph['ax'], $eph['ay'], $eph['az']];
    $state = [$eph['x'], $eph['y'], $eph['z'], $eph['vx'], $eph['vy'], $eph['vz']];

    $maxStep = 30.0;
    $steps = max(1, (int)ceil(abs($dt) / $maxStep));
    $h = $dt / $steps;

    for ($i = 0; $i < $steps; $i++) {
        $k1 = rgen_glonass_deriv($state, $lunisolar);
        $k2 = rgen_glonass_deriv(rgen_state_add_scaled($state, $k1, $h / 2), $lunisolar);
        $k3 = rgen_glonass_deriv(rgen_state_add_scaled($state, $k2, $h / 2), $lunisolar);
        $k4 = rgen_glonass_deriv(rgen_state_add_scaled($state, $k3, $h), $lunisolar);
        for ($j = 0; $j < 6; $j++) {
            $state[$j] += ($h / 6) * ($k1[$j] + 2 * $k2[$j] + 2 * $k3[$j] + $k4[$j]);
        }
    }

    return [$state[0], $state[1], $state[2]];
}

/**
 * Выбирает эфемериду с tb, ближайшим к запрошенному моменту — но не
 * дальше RGEN_GLO_MAX_EXTRAPOLATION_SEC. У ГЛОНАСС (в отличие от GPS)
 * точность численного интегрирования (с допущением о ПОСТОЯННОМ
 * луно-солнечном ускорении на интервале) заметно падает при больших |t-tb|
 * — это ограничение самого ИКД, а не генератора (эфемерида ГЛОНАСС
 * обновляется каждые ~30 мин именно поэтому). Если в navigation-файле для
 * спутника нет записи в пределах допустимого окна — лучше вообще исключить
 * его из этой эпохи (как "не видим"), чем дать заметно неточное положение,
 * которое утаскивает автономное решение по кодам от истинных координат.
 */
const RGEN_GLO_MAX_EXTRAPOLATION_SEC = 1800.0;

function rgen_pick_glonass_ephemeris(array $records, float $unixUtc): ?array
{
    if (!$records) {
        return null;
    }
    $best = null;
    $bestDiff = INF;
    foreach ($records as $rec) {
        $diff = abs($rec['tb_unix'] - $unixUtc);
        if ($diff < $bestDiff) {
            $bestDiff = $diff;
            $best = $rec;
        }
    }
    return $bestDiff <= RGEN_GLO_MAX_EXTRAPOLATION_SEC ? $best : null;
}
