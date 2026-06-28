<?php

declare(strict_types=1);

require_once __DIR__ . '/Constants.php';
require_once __DIR__ . '/GpsNav.php';
require_once __DIR__ . '/GlonassNav.php';

/**
 * Сборка искусственного RINEX 2.11 / 3.04 OBS-файла для одной станции
 * (заданные ECEF-координаты, фиксированные на весь период — приёмник
 * неподвижен) по эфемеридам GPS+ГЛОНАСС. Обработка предполагается
 * исключительно в Trimble Business Center — приёмник/антенна в заголовке
 * всегда подставляются как "CHC i50".
 *
 * ИСТОРИЯ ПОДХОДА: первая версия писала чисто геометрическую дальность без
 * вообще каких-либо поправок — байт-в-байт сверенную со сторонним рабочим
 * генератором (SiGOGbcst). Несмотря на полное совпадение формата/структуры,
 * обработка базовой линии в TBC пользователя стабильно не проходила
 * ("insufficient code measurements"), и сторонний RINEX-конвертер тоже не
 * помог — то есть дело не в форматировании файла. Поэтому в этой версии
 * модель псевдодальности сделана физически полнее (но не "шум ради шума"):
 *
 *  - ЧАСЫ СПУТНИКА: af0/af1/af2 (GPS) и tau_n/gamma_n (ГЛОНАСС) — это
 *    реальные поля эфемериды, которые мы и раньше парсили, но не
 *    применяли. У каждого спутника часы уходят на свою величину — без этого
 *    псевдодальности всех спутников идеально консистентны кроме как через
 *    геометрию, чего не бывает с реальным/любым другим приёмником;
 *  - ТРОПОСФЕРНАЯ ЗАДЕРЖКА: простая модель (зенитная задержка ~2.3 м,
 *    масштабируется как 1/sin(угол места)) — реальный эффект, который есть
 *    в АБСОЛЮТНО любых данных любого приёмника, его полное отсутствие само
 *    по себе нефизично;
 *  - ИОНОСФЕРА: после первого раунда правок независимая проверка в двух
 *    разных программах (включая TBC) дала одинаковый результат — Float
 *    ~99%, Fix 0%. Геометрия/код/фаза в порядке (раз float почти всегда
 *    сходится), но целочисленная неоднозначность фазы не разрешается НИГДЕ.
 *    Причина — в файле не было ионосферы (P1=P2=C1 буквально, без
 *    расхождения код/фаза по частотам), а это и есть классическая "подпись"
 *    реальных GNSS-данных, по которой работают алгоритмы разрешения
 *    неоднозначности (ratio-тест и аналоги). Теперь код запаздывает на
 *    ionoL1/ionoL2 (по частоте), фаза на ту же величину спешит — P1≠P2;
 *  - смещение часов ПРИЁМНИКА — случайное на сессию (умеренное, единицы
 *    км эквивалента), с медленным дрейфом;
 *  - небольшой шум измерений (код — дециметры, фаза — мм).
 *
 * ГЛАВНАЯ НАХОДКА (после долгой диагностики "Insufficient code measurements",
 * не зависевшей ни от одной физической правки выше): пользователь предоставил
 * настоящий RINEX-файл с приёмника CHC (тот же производитель, что "CHC i50")
 * — и набор типов наблюдений у него СОВСЕМ не такой, как мы писали. У нас
 * было 5 типов (C1/P1/P2/L1/L2). У настоящего CHC — 17: C1,L1,D1,S1 (L1),
 * P2,L2,D2,S2 (L2/G2, без отдельного C2 для GPS/ГЛОНАСС — он всегда 0.000),
 * плюс C5/L5/D5/S5/C7/L7/D7/S7 (L5/L7 — тоже 0.000 у GPS/ГЛОНАСС, реальные
 * значения там только у Galileo/BeiDou, которых у нас нет). Если TBC сверяет
 * заявленную модель приёмника с фактическим набором наблюдений — урезанный
 * 5-типовый файл могло отбраковывать именно поэтому, всегда и независимо от
 * качества самих данных. См. RGEN_RINEX2_OBS_TYPES.
 */

// Раньше было 5° — но на малых углах места (5-10°) тропосферная/
// ионосферная задержка очень велика (десятки метров), а наша простая
// модель 1/sin(угол) там наименее точна. Teqbox во всех тестах сам
// использовал маску 10° при обработке ("Mask: 10 deg" в его логах) — то
// есть он просто отбрасывал эти наименее точные спутники, поэтому у него
// всё сходилось; TBC, возможно, реально их использует. Поднимаем маску
// генерации до 10°, чтобы такие данные вообще не попадали в файл.
const RGEN_ELEVATION_MASK_DEG = 10.0;

// Диагностический тест с известным TBC приёмником/антенной (Trimble NETR9 /
// TRM57971.00) дал ту же ошибку "Insufficient code measurements" — значит,
// распознавание антенны тут ни при чём. Возвращаем "CHC i50" — реальные
// станции пользователя именно с этим приёмником.
const RGEN_RECEIVER_TYPE = 'CHC i50';
const RGEN_ANTENNA_TYPE = 'CHC i50';

function rgen_merge_ephemerides(array $dayFiles): array
{
    $gps = [];
    $glonass = [];
    foreach ($dayFiles as $parsed) {
        foreach ($parsed['gps'] as $sat => $recs) {
            $gps[$sat] = array_merge($gps[$sat] ?? [], $recs);
        }
        foreach ($parsed['glonass'] as $sat => $recs) {
            $glonass[$sat] = array_merge($glonass[$sat] ?? [], $recs);
        }
    }
    return ['gps' => $gps, 'glonass' => $glonass];
}

/** Угол места спутника над горизонтом приёмника, градусы (приближение по сферической нормали). */
function rgen_elevation_deg(array $recvEcef, array $satEcef): float
{
    $up = rgen_normalize($recvEcef);
    $los = [
        $satEcef[0] - $recvEcef[0],
        $satEcef[1] - $recvEcef[1],
        $satEcef[2] - $recvEcef[2],
    ];
    $losUnit = rgen_normalize($los);
    $sinEl = $up[0] * $losUnit[0] + $up[1] * $losUnit[1] + $up[2] * $losUnit[2];
    $sinEl = max(-1.0, min(1.0, $sinEl));
    return rad2deg(asin($sinEl));
}

function rgen_normalize(array $v): array
{
    $len = sqrt($v[0] ** 2 + $v[1] ** 2 + $v[2] ** 2);
    if ($len <= 0.0) {
        return [0.0, 0.0, 0.0];
    }
    return [$v[0] / $len, $v[1] / $len, $v[2] / $len];
}

function rgen_range(array $a, array $b): float
{
    return sqrt(($a[0] - $b[0]) ** 2 + ($a[1] - $b[1]) ** 2 + ($a[2] - $b[2]) ** 2);
}

/**
 * Поворот ECEF-координат спутника на угол вращения Земли за время полёта
 * сигнала (эффект Саньяка) — переводит позицию, посчитанную в системе
 * координат момента ИЗЛУЧЕНИЯ, в систему координат момента ПРИЁМА (та же,
 * в которой заданы координаты приёмника). Сверено с эталонным генератором
 * SiGOGbcst (`xpr = x*cos(WE*tau) + y*sin(WE*tau)`, `ypr = -x*sin(WE*tau) + y*cos(WE*tau)`).
 */
function rgen_sagnac_rotate(array $pos, float $tau, float $omegaE): array
{
    $theta = $omegaE * $tau;
    $cosT = cos($theta);
    $sinT = sin($theta);
    return [
        $pos[0] * $cosT + $pos[1] * $sinT,
        -$pos[0] * $sinT + $pos[1] * $cosT,
        $pos[2],
    ];
}

/**
 * Координаты спутника (метры, ECEF момента ПРИЁМА) с учётом времени
 * прохождения сигнала (light-time) — до этой правки генератор считал
 * позицию спутника прямо в момент эпохи наблюдения $tRecv, как если бы
 * сигнал долетал до приёмника мгновенно. Реально приёмник в момент
 * $tRecv видит спутник там, где он был ~70-90мс РАНЬШЕ (на момент
 * излучения $tRecv-$tau), а сами координаты дополнительно нужно повернуть
 * на угол вращения Земли за это время (см. rgen_sagnac_rotate) — без этой
 * пары поправок геометрическая дальность систематически смещена на
 * порядка скорость_спутника*tau (для GPS ~3.9км/с * 0.075с ≈ 270м).
 * Сверено с эталонным генератором SiGOGbcst (SUBROUTINE INTORB, итерация
 * по tau с порогом сходимости в этой же логике).
 *
 * @param callable $satPosFn (array $eph, float $unixUtc): array{0:float,1:float,2:float,...}
 *   возвращает координаты спутника на заданный момент (доп. элементы
 *   массива после индекса 2, например Ek у GPS, передаются через как есть).
 * @return array{0:float,1:float,2:float} скорректированные ECEF-координаты момента приёма
 */
function rgen_sat_position_at_reception(callable $satPosFn, array $eph, float $tRecv, array $recvEcef, float $omegaE, ?array &$rawPos = null): array
{
    $tau = 0.075; // начальное приближение — типичная задержка GPS/ГЛОНАСС
    $rawPos = $satPosFn($eph, $tRecv - $tau);
    $corrected = rgen_sagnac_rotate($rawPos, $tau, $omegaE);
    for ($i = 0; $i < 10; $i++) {
        $newTau = rgen_range($recvEcef, $corrected) / RGEN_C;
        if (abs($newTau - $tau) < 1.0e-9) {
            $tau = $newTau;
            break;
        }
        $tau = $newTau;
        $rawPos = $satPosFn($eph, $tRecv - $tau);
        $corrected = rgen_sagnac_rotate($rawPos, $tau, $omegaE);
    }
    return $corrected;
}

/**
 * Целочисленная неоднозначность фазы (циклы) — случайная, но ПОСТОЯННАЯ на
 * весь сеанс для каждого спутника, отдельно L1/L2 (у настоящего приёмника
 * она именно такая — устанавливается в момент захвата сигнала и держится,
 * пока нет потери захвата; у нас "захват" происходит один раз в начале
 * сеанса на все спутники, повторный захват/слипы не моделируются). Раньше
 * неоднозначность была буквально нулевой у всех спутников одновременно —
 * непохоже на реальные данные ни в одном приёмнике.
 */
function rgen_generate_ambiguities(array $eph): array
{
    $ambiguities = [];
    foreach (array_keys($eph['gps']) as $sat) {
        $ambiguities[$sat] = [mt_rand(-500000, 500000), mt_rand(-500000, 500000)];
    }
    foreach (array_keys($eph['glonass']) as $sat) {
        $ambiguities[$sat] = [mt_rand(-500000, 500000), mt_rand(-500000, 500000)];
    }
    return $ambiguities;
}

/** Часы спутника GPS (сек) на момент $t — af0 + af1*dt + af2*dt^2 относительно Toc. */
function rgen_gps_clock_bias_sec(array $eph, float $t): float
{
    $dt = $t - $eph['toc_unix'];
    return $eph['af0'] + $eph['af1'] * $dt + $eph['af2'] * $dt * $dt;
}

/**
 * Часы спутника ГЛОНАСС (сек) на момент $t. ИСТОРИЯ ПРАВКИ — этот знак уже
 * меняли один раз (на "-eph['tau_n'] + gamma_n*dt", в предположении, что
 * это совпадает с конвенцией RTKLIB), но живой тест с rnx2rtkp (RTKLIB)
 * сейчас доказал, что именно ТА версия даёт систематическую ошибку высоты
 * в десятки километров, дрейфующую по времени — притом что та же пара
 * light-time/Sagnac-поправок и геометрия (проверено отдельно — радиус
 * орбиты ГЛОНАСС стабилен и физически верен) у GPS с аналогичной по
 * структуре формулой (af0+af1*dt+af2*dt^2, БЕЗ дополнительной смены знака)
 * сошлась до ~1м по горизонтали и ~11м по высоте. Возвращаем знак к
 * "+eph['tau_n']" (без инверсии) — это и есть та версия, с которой
 * rnx2rtkp сходится к истинным координатам станции стабильно на всём
 * 30-минутном интервале (проверено отдельно с GLONASS-only набором
 * спутников, чтобы исключить влияние GPS).
 */
function rgen_glonass_clock_bias_sec(array $eph, float $t): float
{
    $dt = $t - $eph['tb_unix'];
    return $eph['tau_n'] - $eph['gamma_n'] * $dt;
}

/**
 * Тропосферная задержка (метры) — модифицированная модель Hopfield (Seeber,
 * 1993), перенесённая из эталонного генератора SiGOGbcst (FUNCTION SEEBER2)
 * вместо прежней плоской "2.3/sin(угол)". Раздельные сухая/влажная
 * составляющие, с учётом высоты приёмника над землёй (сферическое
 * приближение радиусом 6371км, как и в SiGOG — не строгая геодезическая
 * высота) и отдельной функцией отображения для каждой составляющей.
 * Давление/температура/влажность — те же стандартные значения, что и в
 * SiGOG (1013.25 мбар, 20°C, 50% — не запрашиваются у пользователя).
 */
function rgen_tropo_delay_m(float $elevationDeg, array $ecef): float
{
    $elDeg = max($elevationDeg, 5.0);
    $pressureMb = 1013.25;
    $tempC = 20.0;
    $humidityPct = 50.0;
    $tempK = $tempC + 273.15;

    $earthR = 6371.0e3;
    $r = sqrt($ecef[0] ** 2 + $ecef[1] ** 2 + $ecef[2] ** 2);
    $h = $r - $earthR;

    $pv = $humidityPct / 100.0 * exp(-37.2465 + 0.213166 * $tempK - 0.256908e-3 * $tempK ** 2);
    // Та же защитная проверка единиц, что и в оригинале SiGOG (SEEBER2) —
    // переносим как есть, не пытаясь "улучшить" проверенную формулу.
    if ($pv > 1.0) {
        $pv /= 100.0;
    }

    $hd = 40136.0 + 148.72 * $tempC;
    $hw = 11.0e3;

    $nd0 = 155.2e-7 * $hd * $pressureMb / $tempK;
    $nw0 = 1.0e-6 * $hw / 5.0 * (-12.96 * $tempK + 3.718e5) * $pv / ($tempK ** 2);

    $nd0 *= (($hd - $h) / $hd) ** 5;
    $nw0 *= (($hw - $h) / $hw) ** 5;
    if ($h > $hd) {
        $nd0 = 0.0;
    }
    if ($h > $hw) {
        $nw0 = 0.0;
    }

    $facd = 1.0 / sin(deg2rad(sqrt($elDeg ** 2 + 6.25)));
    $facw = 1.0 / sin(deg2rad(sqrt($elDeg ** 2 + 2.25)));

    return $nd0 * $facd + $nw0 * $facw;
}

// Зенитная ионосферная задержка L1 (метры) — фиксированная (НЕ случайная на
// каждую станцию!), т.к. соседние станции в реальности видят практически
// одну и ту же ионосферу: если бы каждый вызов генератора (= каждая
// станция) брал свою случайную величину, разница ионосферы между базой и
// ровером была бы фиктивной и НЕ сокращалась бы при разностной обработке —
// получилось бы хуже, чем без ионосферы вообще. Эта же причина — почему
// раньше "P1=P2=C1, ионосфера не моделируется": расхождение код/фаза от
// ионосферы (код запаздывает, фаза спешит на ту же величину, в разные
// частоты — по-разному) — классическая "подпись" реальных GNSS-данных, по
// которой во многом работают алгоритмы разрешения целочисленной
// неоднозначности фазы (ratio-тест и аналоги); без неё, видимо, и был
// Fix=0% при float ~99% (подтверждено в двух разных программах) — у кода и
// фазы математически отсутствовала ожидаемая связь.
const RGEN_IONO_ZENITH_L1_M = 3.0;

/** Наклонный множитель ионосферной задержки (модель тонкого слоя, высота ~350 км). */
function rgen_iono_mapping(float $elevationDeg): float
{
    $earthR = 6378137.0;
    $ionoHeight = 350000.0;
    $x = ($earthR / ($earthR + $ionoHeight)) * cos(deg2rad(max($elevationDeg, 5.0)));
    return 1.0 / sqrt(max(1e-6, 1.0 - $x * $x));
}

/**
 * Отношение сигнал/шум (С/Ш, дБ-Гц) для S1/S2 — раньше не писали вообще.
 * Контроль качества кодовых измерений у многих процессоров (возможно, и у
 * TBC) завязан именно на SNR/CN0: без этого поля программа может по
 * умолчанию считать измерение "недостаточного качества", даже если сам код
 * физически присутствует и корректен — а "Insufficient code measurements"
 * у нас была одинаковой и неизменной за весь процесс, что наводит на мысль
 * о структурной причине именно такого рода. Простая, но реалистичная
 * зависимость от угла места (выше над горизонтом — чище сигнал).
 */
function rgen_snr_db(float $elevationDeg): float
{
    return min(55.0, 25.0 + $elevationDeg * 0.4) + mt_rand(-10, 10) / 10.0;
}

/**
 * Геометрическая дальность + часы спутника + тропосфера для всех видимых
 * (выше маски возвышения) спутников на момент $t. Часы ПРИЁМНИКА и
 * ионосфера (она зависит от частоты, а здесь дальность одна на оба
 * диапазона) сюда не входят — добавляются отдельно в писателях OBS.
 *
 * @return array<string, array{range: float, elevDeg: float}> satId ("G01"/"R05") => [дальность с часами+тропо, угол места]
 */
function rgen_compute_visible_ranges(array $eph, array $ecef, float $t): array
{
    $ranges = [];
    foreach ($eph['gps'] as $sat => $records) {
        $best = rgen_pick_gps_ephemeris($records, $t);
        if ($best === null) {
            continue;
        }
        // Light-time + Саньяк (см. rgen_sat_position_at_reception) — позиция
        // спутника на момент ИЗЛУЧЕНИЯ, повёрнутая в ECEF момента ПРИЁМА
        // (которая и сравнивается с координатами приёмника). $rawPos —
        // позиция БЕЗ поворота Саньяка, нужна только чтобы достать Ek (4-й
        // элемент) для релятивистской поправки ниже.
        $rawPos = null;
        $pos = rgen_sat_position_at_reception('rgen_gps_sat_position', $best, $t, $ecef, RGEN_GPS_OMEGA_E, $rawPos);
        $elevDeg = rgen_elevation_deg($ecef, $pos);
        if ($elevDeg < RGEN_ELEVATION_MASK_DEG) {
            continue;
        }
        $satClockM = RGEN_C * (rgen_gps_clock_bias_sec($best, $t) + rgen_gps_relativistic_correction_sec($best, $rawPos[3]));
        $ranges[$sat] = ['range' => rgen_range($ecef, $pos) - $satClockM + rgen_tropo_delay_m($elevDeg, $ecef), 'elevDeg' => $elevDeg];
    }
    foreach ($eph['glonass'] as $sat => $records) {
        $best = rgen_pick_glonass_ephemeris($records, $t);
        if ($best === null) {
            continue;
        }
        // ГЛОНАСС: та же пара поправок (light-time/Саньяк), но БЕЗ отдельной
        // релятивистской поправки часов — в отличие от GPS, у ГЛОНАСС нет
        // эталонной (SiGOG и т.п.) проверенной формулы под рукой, добавлять
        // непроверенную численно лучше не рисковать.
        $pos = rgen_sat_position_at_reception('rgen_glonass_sat_position', $best, $t, $ecef, RGEN_GLO_OMEGA_E);
        $elevDeg = rgen_elevation_deg($ecef, $pos);
        if ($elevDeg < RGEN_ELEVATION_MASK_DEG) {
            continue;
        }
        $satClockM = RGEN_C * rgen_glonass_clock_bias_sec($best, $t);
        $ranges[$sat] = [
            'range' => rgen_range($ecef, $pos) - $satClockM + rgen_tropo_delay_m($elevDeg, $ecef),
            'elevDeg' => $elevDeg,
            // FDMA-литера нужна вызывающему коду для расчёта ИМЕННО ЭТОГО
            // спутника длины волны L1/L2 (см. RGEN_GLO_F1_STEP в
            // Constants.php) — без неё фаза для разных литер ГЛОНАСС
            // считается с слегка неверным масштабом.
            'freqChannel' => (int)($best['freq_channel'] ?? 0),
        ];
    }
    return $ranges;
}

function rgen_header_line(string $data, string $label): string
{
    // RINEX традиционно пишется с CRLF (DOS/Windows-конвенция).
    return str_pad(substr($data, 0, 60), 60) . str_pad($label, 20) . "\r\n";
}

/**
 * Реальный набор типов наблюдений приёмника CHC (сверено байт-в-байт с
 * настоящим файлом с приёмника CHC I73, тот же производитель/линейка, что
 * "CHC i50" из заголовка) — 17 типов, а не 5, как было раньше! У нас были
 * только C1/P1/P2/L1/L2 — если TBC сверяет ожидаемый набор наблюдений для
 * заявленной модели приёмника, урезанный набор мог быть и причиной
 * "Insufficient code measurements" всё это время. C2/C5/L5/D5/S5/C7/L7/D7/S7
 * у настоящего CHC для GPS/ГЛОНАСС спутников всегда 0.000 (приёмник физически
 * не трекает эти диапазоны для них — ненулевые они только у Galileo/BeiDou,
 * которых у нас в генераторе нет) — это НЕ "нет данных" (пусто), а явный
 * 0.000, как в реальном файле.
 */
const RGEN_RINEX2_OBS_TYPES = ['C1', 'L1', 'D1', 'S1', 'P2', 'L2', 'D2', 'S2', 'C2', 'C5', 'L5', 'D5', 'S5', 'C7', 'L7', 'D7', 'S7'];

/** "# / TYPES OF OBSERV" — переносится на несколько строк, максимум 9 типов на строку (число — только на первой). */
function rgen_build_obs_types_header_lines(array $types): string
{
    $out = '';
    foreach (array_chunk($types, 9) as $i => $chunk) {
        $prefix = $i === 0 ? sprintf('%6d', count($types)) : str_repeat(' ', 6);
        $line = $prefix;
        foreach ($chunk as $t) {
            $line .= sprintf('%6s', $t);
        }
        $out .= rgen_header_line($line, '# / TYPES OF OBSERV');
    }
    return $out;
}

function rgen_build_rinex2_header(string $stationName, array $ecef, int $startUnix, float $intervalSec, bool $gpsOnly = false): string
{
    $sysLabel = $gpsOnly ? 'G (GPS)' : 'M (MIXED)';
    $out = '';
    // Версия 2.11 — как в реальном файле с приёмника CHC (не 2.10, как у
    // более старого синтетического эталона SiGOGbcst).
    $out .= rgen_header_line(sprintf('%9.2f%11s%-20s%-20s', 2.11, '', 'OBSERVATION DATA', $sysLabel), 'RINEX VERSION / TYPE');
    $out .= rgen_header_line(sprintf('%-20s%-20s%-20s', 'gisdata-rinex-synth', 'gisdata', gmdate('Ymd His', time()) . ' UTC'), 'PGM / RUN BY / DATE');
    $out .= rgen_header_line(substr($stationName, 0, 60), 'MARKER NAME');
    $out .= rgen_header_line(substr($stationName, 0, 60), 'MARKER NUMBER');
    $out .= rgen_header_line(sprintf('%-20s%-40s', 'SYNTH', 'gisdata'), 'OBSERVER / AGENCY');
    $out .= rgen_header_line(sprintf('%-20s%-20s%-20s', '1', RGEN_RECEIVER_TYPE, '1.0'), 'REC # / TYPE / VERS');
    $out .= rgen_header_line(sprintf('%-20s%-20s', '1', RGEN_ANTENNA_TYPE), 'ANT # / TYPE');
    $out .= rgen_header_line(sprintf('%14.4f%14.4f%14.4f', $ecef[0], $ecef[1], $ecef[2]), 'APPROX POSITION XYZ');
    $out .= rgen_header_line(sprintf('%14.4f%14.4f%14.4f', 0.0, 0.0, 0.0), 'ANTENNA: DELTA H/E/N');
    $out .= rgen_header_line(sprintf('%6d%6d', 1, 1), 'WAVELENGTH FACT L1/2');
    $out .= rgen_build_obs_types_header_lines(RGEN_RINEX2_OBS_TYPES);
    $out .= rgen_header_line(sprintf('%10.3f', $intervalSec), 'INTERVAL');
    // ИСТОРИЯ ЭТОЙ СТРОКИ (см. подробный комментарий у rgen_gpst_unix в
    // Constants.php): сдвиг меток на GPST включали, откатывали и включили
    // обратно. Откат БЕЗ сдвига был проверен повторно живым тестом RTKLIB
    // (rnx2rtkp single-point) — высота решения снова уходит на десятки км
    // и плывёт по времени, то есть без сдвига геометрия объективно
    // неверна для любого строгого по времени обработчика. Реальный прогон
    // через TBC ПОСЛЕ отката (без сдвига) тоже не заработал — другая
    // формулировка той же ошибки ("координаты базовой станции
    // недостаточно близки к истинным"), то есть откат не помог TBC, а
    // только сломал то, что было физически верно. Возвращаем сдвиг —
    // GPST-метки нужны для самосогласованности данных в принципе, а
    // проблема TBC, судя по всему, отдельная и не связана с этим конкретным
    // числом (она фигурирует в комментариях этого файла ещё с прошлых
    // сессий, до сегодняшних правок).
    $firstObsGpst = rgen_gpst_unix($startUnix);
    $out .= rgen_header_line(
        sprintf('%6d%6d%6d%6d%6d%13.7f%5sGPS', (int)gmdate('Y', $firstObsGpst), (int)gmdate('n', $firstObsGpst), (int)gmdate('j', $firstObsGpst), (int)gmdate('G', $firstObsGpst), (int)gmdate('i', $firstObsGpst), (float)gmdate('s', $firstObsGpst), ''),
        'TIME OF FIRST OBS'
    );
    $out .= rgen_header_line('', 'END OF HEADER');
    return $out;
}

/** Строка(и) со списком спутников эпохи — до 12 трёхсимвольных ID на строку, без разделителей между ними. */
function rgen_format_sat_list_lines(string $epochPrefix, array $satIds): string
{
    $chunks = array_chunk($satIds, 12);
    $out = '';
    foreach ($chunks as $i => $chunk) {
        $prefix = $i === 0 ? $epochPrefix : str_repeat(' ', strlen($epochPrefix));
        $out .= $prefix . implode('', $chunk) . "\r\n";
    }
    return $out;
}

function rgen_format_obs_line(array $values): string
{
    // LLI и SSI — ОБА пустые (сверено байт-в-байт с реальными рабочими
    // файлами: между значениями ровно 4 пробела — 2 пустых флага текущего
    // значения + 2 ведущих пробела следующего F14.3, а не 3, как было при
    // LLI='0'). 17 типов наблюдений (см. RGEN_RINEX2_OBS_TYPES) — максимум
    // 5 значений на строку данных (RINEX 2.11), остаток переносится на
    // следующую строку БЕЗ какого-либо префикса — именно так устроен
    // настоящий файл с приёмника CHC (4 строки на спутник: 5+5+5+2).
    $out = '';
    foreach (array_chunk($values, 5) as $chunk) {
        $line = '';
        foreach ($chunk as $v) {
            $line .= $v === null ? str_repeat(' ', 16) : sprintf('%14.3f', $v) . '  ';
        }
        $out .= $line . "\r\n";
    }
    return $out;
}

/**
 * Строит полный текст RINEX 2.11 OBS-файла для одной станции.
 *
 * @param array{gps: array, glonass: array} $eph объединённые эфемериды (см. rgen_merge_ephemerides)
 */
function rgen_build_rinex2_obs(string $stationName, array $ecef, int $startUnix, int $endUnix, array $eph, bool $gpsOnly = false): string
{
    if ($gpsOnly) {
        $eph['glonass'] = [];
    }
    $intervalSec = 5.0;
    // ГЛОНАСС-длины волн считаются ПЕР-СПУТНИКОВО внутри цикла ниже (FDMA,
    // см. RGEN_GLO_F1_STEP в Constants.php) — здесь только GPS, общая для
    // всех спутников системы (CDMA, одна несущая на все PRN).
    $lambdaGps1 = RGEN_C / RGEN_GPS_F1;
    $lambdaGps2 = RGEN_C / RGEN_GPS_F2;
    $ambiguities = rgen_generate_ambiguities($eph);

    // Смещение часов приёмника — раньше было до ±2000 м (~6.7 мкс), теперь
    // ±200 м (~0.67 мкс): реальные приёмники обычно подстраивают часы и
    // держат смещение гораздо ближе к нулю, чем мы делали изначально —
    // ±2000 м могло быть нереалистично грубым значением для какой-то
    // первичной/грубой проверки качества кода в TBC (это не точно
    // подтверждено, но дёшево проверить вместе с остальными правками).
    $clockBiasM = mt_rand(-200, 200) / 1.0;
    $clockDriftMPerSec = mt_rand(-3, 3) / 1000.0;

    $out = rgen_build_rinex2_header($stationName, $ecef, $startUnix, $intervalSec, $gpsOnly);

    for ($t = $startUnix; $t <= $endUnix; $t += (int)$intervalSec) {
        $ranges = rgen_compute_visible_ranges($eph, $ecef, (float)$t);
        if (!$ranges) {
            continue;
        }
        // Допплер (D1/D2) — численная производная дальности (доп. вызов на
        // t+1с), раньше этих полей не было вообще. Знак — стандартное
        // соглашение GPS: дальность растёт (спутник удаляется) => допплер
        // отрицательный.
        $rangesNext = rgen_compute_visible_ranges($eph, $ecef, (float)($t + 1));
        $clockOffsetM = $clockBiasM + $clockDriftMPerSec * ($t - $startUnix);

        $epochRows = []; // satId => [C1, L1, D1, S1, P2, L2, D2, S2, C2, C5, L5, D5, S5, C7, L7, D7, S7]
        foreach ($ranges as $sat => $info) {
            $range = $info['range'];
            $isGlo = $sat[0] === 'R';
            // ГЛОНАСС — FDMA, своя несущая на КАЖДЫЙ спутник (литера
            // freqChannel, -7..+6, см. RGEN_GLO_F1_STEP в Constants.php),
            // а не одна номинальная частота на все спутники сразу.
            if ($isGlo) {
                $k = $info['freqChannel'] ?? 0;
                $f1 = RGEN_GLO_F1 + $k * RGEN_GLO_F1_STEP;
                $f2 = RGEN_GLO_F2 + $k * RGEN_GLO_F2_STEP;
            } else {
                [$f1, $f2] = [RGEN_GPS_F1, RGEN_GPS_F2];
            }
            $lambda1 = RGEN_C / $f1;
            $lambda2 = RGEN_C / $f2;

            // Ионосфера: код запаздывает (+iono), фаза спешит (-iono), по
            // частоте L2 задержка больше, чем на L1 (~в (f1/f2)^2 раз) —
            // см. примечание у RGEN_IONO_ZENITH_L1_M выше.
            $ionoL1 = RGEN_IONO_ZENITH_L1_M * rgen_iono_mapping($info['elevDeg']);
            $ionoL2 = $ionoL1 * ($f1 / $f2) ** 2;

            [$ambN1, $ambN2] = $ambiguities[$sat];
            $c1 = $range + $ionoL1 + $clockOffsetM + mt_rand(-300, 300) / 1000.0;
            $p2 = $range + $ionoL2 + $clockOffsetM + mt_rand(-300, 300) / 1000.0;
            $l1 = ($range - $ionoL1 + $clockOffsetM) / $lambda1 + $ambN1 + mt_rand(-5, 5) / 1000.0;
            $l2 = ($range - $ionoL2 + $clockOffsetM) / $lambda2 + $ambN2 + mt_rand(-5, 5) / 1000.0;
            $s1 = rgen_snr_db($info['elevDeg']);
            $s2 = rgen_snr_db($info['elevDeg']);
            $rangeRate = isset($rangesNext[$sat]) ? $rangesNext[$sat]['range'] - $range : 0.0;
            $d1 = -$rangeRate / $lambda1;
            $d2 = -$rangeRate / $lambda2;
            // C1 (без P1 вовсе — настоящий CHC его не выдаёт); C2/C5/L5/D5/
            // S5/C7/L7/D7/S7 — реальные нули (приёмник физически не трекает
            // эти диапазоны для GPS/ГЛОНАСС, см. примечание у
            // RGEN_RINEX2_OBS_TYPES).
            $epochRows[$sat] = [$c1, $l1, $d1, $s1, $p2, $l2, $d2, $s2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
        }

        ksort($epochRows);
        $frac = $t - floor($t);
        // Пробовали поменять год на %2d (строго по спецификации RINEX 2.11,
        // I2 вместо "лишнего" пробела) — но именно после этого TBC перестал
        // ОТКРЫВАТЬ RINEX2-файлы вообще ("Cannot open file"), независимо от
        // режима GPS-only/смешанный. До этой правки файл хотя бы успешно
        // импортировался (доходило до "insufficient code measurements" —
        // то есть импорт проходил). Значит TBC ожидает именно эту раскладку
        // колонок (с лишним пробелом перед годом), а не строго
        // спецификационную — возвращаем %3d.
        // GPST, не сырой UTC — см. подробную историю у TIME OF FIRST OBS в
        // rgen_build_rinex2_header выше и у rgen_gpst_unix в Constants.php.
        $tGpst = rgen_gpst_unix((int)$t);
        $epochPrefix = sprintf(
            '%3d%3d%3d%3d%3d%11.7f%3d%3d',
            (int)gmdate('y', $tGpst), (int)gmdate('n', $tGpst), (int)gmdate('j', $tGpst),
            (int)gmdate('G', $tGpst), (int)gmdate('i', $tGpst), (float)gmdate('s', $tGpst) + $frac,
            0, count($epochRows)
        );
        // В однородном GPS-файле (gpsOnly) спутники пишутся просто
        // цифрами, без буквы "G" — для смешанного GPS+ГЛОНАСС буква нужна
        // всегда, иначе системы не различить.
        $satIdsForList = $gpsOnly
            ? array_map(fn($s) => sprintf('%3d', (int)substr($s, 1)), array_keys($epochRows))
            : array_keys($epochRows);
        $out .= rgen_format_sat_list_lines($epochPrefix, $satIdsForList);
        foreach ($epochRows as $vals) {
            $out .= rgen_format_obs_line($vals);
        }
    }

    return $out;
}

/** Строки "GLONASS SLOT / FRQ #" — до 8 пар (слот, частотный канал) на строку. */
function rgen_build_glonass_slot_freq_lines(array $glonassEph): string
{
    $bySlot = [];
    foreach ($glonassEph as $sat => $records) {
        $slot = (int)substr($sat, 1);
        $freq = $records[0]['freq_channel'] ?? 0;
        $bySlot[$slot] = sprintf('R%02d%3d', $slot, $freq);
    }
    if (!$bySlot) {
        return '';
    }
    ksort($bySlot);
    $pairs = array_values($bySlot);
    $out = '';
    foreach (array_chunk($pairs, 8) as $i => $chunk) {
        $prefix = $i === 0 ? sprintf('%3d ', count($pairs)) : '    ';
        $out .= rgen_header_line($prefix . implode(' ', $chunk), 'GLONASS SLOT / FRQ #');
    }
    return $out;
}

function rgen_build_rinex3_header(string $stationName, array $ecef, int $startUnix, float $intervalSec, array $eph, bool $gpsOnly = false): string
{
    $sysLabel = $gpsOnly ? 'G (GPS)' : 'M (MIXED)';
    $out = '';
    $out .= rgen_header_line(sprintf('%9.2f%11s%-20s%-20s', 3.04, '', 'OBSERVATION DATA', $sysLabel), 'RINEX VERSION / TYPE');
    $out .= rgen_header_line(sprintf('%-20s%-20s%-20s', 'gisdata-rinex-synth', 'gisdata', gmdate('Ymd His', time()) . ' UTC'), 'PGM / RUN BY / DATE');
    $out .= rgen_header_line('Synthetic RINEX (artificial test data, not real observations)', 'COMMENT');
    $out .= rgen_header_line(substr($stationName, 0, 60), 'MARKER NAME');
    $out .= rgen_header_line(sprintf('%-20s%-40s', 'SYNTH', 'gisdata'), 'OBSERVER / AGENCY');
    $out .= rgen_header_line(sprintf('%-20s%-20s%-20s', '1', RGEN_RECEIVER_TYPE, '1.0'), 'REC # / TYPE / VERS');
    $out .= rgen_header_line(sprintf('%-20s%-20s', '1', RGEN_ANTENNA_TYPE), 'ANT # / TYPE');
    $out .= rgen_header_line(sprintf('%14.4f%14.4f%14.4f', $ecef[0], $ecef[1], $ecef[2]), 'APPROX POSITION XYZ');
    $out .= rgen_header_line(sprintf('%14.4f%14.4f%14.4f', 0.0, 0.0, 0.0), 'ANTENNA: DELTA H/E/N');
    $out .= rgen_header_line('G    6 C1C L1C C2P L2P S1C S2P', 'SYS / # / OBS TYPES');
    if (!$gpsOnly) {
        $out .= rgen_header_line('R    6 C1C L1C C2P L2P S1C S2P', 'SYS / # / OBS TYPES');
        $out .= rgen_build_glonass_slot_freq_lines($eph['glonass']);
    }
    $out .= rgen_header_line(sprintf('%10.3f', $intervalSec), 'INTERVAL');
    // См. подробную историю про метку времени в rgen_build_rinex2_header
    // выше — "GPS" (не "UTC"), числа — в GPST (rgen_gpst_unix).
    $firstObsGpst = rgen_gpst_unix($startUnix);
    $out .= rgen_header_line(
        sprintf('%6d%6d%6d%6d%6d%14.7f%5sGPS', (int)gmdate('Y', $firstObsGpst), (int)gmdate('n', $firstObsGpst), (int)gmdate('j', $firstObsGpst), (int)gmdate('G', $firstObsGpst), (int)gmdate('i', $firstObsGpst), (float)gmdate('s', $firstObsGpst), ''),
        'TIME OF FIRST OBS'
    );
    $out .= rgen_header_line('', 'END OF HEADER');
    return $out;
}

function rgen_format_obs_line_rinex3(string $satId, array $values): string
{
    // LLI/SSI пустые — см. примечание в rgen_format_obs_line (сверено с
    // реальным рабочим RINEX2-файлом; для RINEX3 эталона нет, но логика
    // поля та же).
    $line = $satId;
    foreach ($values as $v) {
        $line .= $v === null ? str_repeat(' ', 16) : sprintf('%14.3f', $v) . '  ';
    }
    return $line . "\r\n";
}

/**
 * Строит полный текст RINEX 3.04 OBS-файла для одной станции.
 *
 * @param array{gps: array, glonass: array} $eph объединённые эфемериды (см. rgen_merge_ephemerides)
 */
function rgen_build_rinex3_obs(string $stationName, array $ecef, int $startUnix, int $endUnix, array $eph, bool $gpsOnly = false): string
{
    if ($gpsOnly) {
        $eph['glonass'] = [];
    }
    $intervalSec = 5.0;
    // ГЛОНАСС-длины волн считаются ПЕР-СПУТНИКОВО внутри цикла ниже (FDMA,
    // см. RGEN_GLO_F1_STEP в Constants.php).
    $lambdaGps1 = RGEN_C / RGEN_GPS_F1;
    $lambdaGps2 = RGEN_C / RGEN_GPS_F2;
    $ambiguities = rgen_generate_ambiguities($eph);

    $clockBiasM = mt_rand(-200, 200) / 1.0;
    $clockDriftMPerSec = mt_rand(-3, 3) / 1000.0;

    $out = rgen_build_rinex3_header($stationName, $ecef, $startUnix, $intervalSec, $eph, $gpsOnly);

    for ($t = $startUnix; $t <= $endUnix; $t += (int)$intervalSec) {
        $ranges = rgen_compute_visible_ranges($eph, $ecef, (float)$t);
        if (!$ranges) {
            continue;
        }
        $clockOffsetM = $clockBiasM + $clockDriftMPerSec * ($t - $startUnix);

        $epochRows = []; // satId => [C1C, L1C, C2P, L2P, S1C, S2P]
        foreach ($ranges as $sat => $info) {
            $range = $info['range'];
            $isGlo = $sat[0] === 'R';
            if ($isGlo) {
                $k = $info['freqChannel'] ?? 0;
                $f1 = RGEN_GLO_F1 + $k * RGEN_GLO_F1_STEP;
                $f2 = RGEN_GLO_F2 + $k * RGEN_GLO_F2_STEP;
            } else {
                [$f1, $f2] = [RGEN_GPS_F1, RGEN_GPS_F2];
            }
            $lambda1 = RGEN_C / $f1;
            $lambda2 = RGEN_C / $f2;

            $ionoL1 = RGEN_IONO_ZENITH_L1_M * rgen_iono_mapping($info['elevDeg']);
            $ionoL2 = $ionoL1 * ($f1 / $f2) ** 2;

            [$ambN1, $ambN2] = $ambiguities[$sat];
            $c1 = $range + $ionoL1 + $clockOffsetM + mt_rand(-300, 300) / 1000.0;
            $c2 = $range + $ionoL2 + $clockOffsetM + mt_rand(-300, 300) / 1000.0;
            $l1 = ($range - $ionoL1 + $clockOffsetM) / $lambda1 + $ambN1 + mt_rand(-5, 5) / 1000.0;
            $l2 = ($range - $ionoL2 + $clockOffsetM) / $lambda2 + $ambN2 + mt_rand(-5, 5) / 1000.0;
            $s1 = rgen_snr_db($info['elevDeg']);
            $s2 = rgen_snr_db($info['elevDeg']);
            $epochRows[$sat] = [$c1, $l1, $c2, $l2, $s1, $s2];
        }

        ksort($epochRows);
        $frac = $t - floor($t);
        // GPST — см. подробную историю выше.
        $tGpst = rgen_gpst_unix((int)$t);
        $out .= sprintf(
            "> %4d %02d %02d %02d %02d%11.7f  0%3d\r\n",
            (int)gmdate('Y', $tGpst), (int)gmdate('n', $tGpst), (int)gmdate('j', $tGpst),
            (int)gmdate('G', $tGpst), (int)gmdate('i', $tGpst), (float)gmdate('s', $tGpst) + $frac,
            count($epochRows)
        );
        foreach ($epochRows as $sat => $vals) {
            $out .= rgen_format_obs_line_rinex3($sat, $vals);
        }
    }

    return $out;
}

/**
 * Набор типов наблюдений для "SiGOG"-режима — ровно тот, что в примере
 * самого SiGOGbcst (input.txt: "rp1  C1P1P2L1L2"), а не 17 типов CHC из
 * RGEN_RINEX2_OBS_TYPES (тот набор — под другую, нашу основную задачу
 * имитации конкретного приёмника, здесь не нужен).
 */
const RGEN_SIGOG_OBS_TYPES = ['C1', 'P1', 'P2', 'L1', 'L2'];

function rgen_build_sigog_header(string $stationName, array $ecef, int $startUnix, float $intervalSec): string
{
    $out = '';
    // RINEX 2.11, система GPS — сам SiGOGbcst пишет 2.10 и только GPS;
    // версию RINEX берём 2.11 (как и наш основной CHC-режим), систему —
    // строго GPS, т.к. SiGOGbcst ГЛОНАСС не считает вовсе.
    $out .= rgen_header_line(sprintf('%9.2f%11s%-20s%-20s', 2.11, '', 'OBSERVATION DATA', 'G (GPS)'), 'RINEX VERSION / TYPE');
    $out .= rgen_header_line(sprintf('%-20s%-20s%-20s', 'gisdata-rinex-sigog', 'gisdata', gmdate('Ymd His', time()) . ' UTC'), 'PGM / RUN BY / DATE');
    $out .= rgen_header_line('SiGOG-compatible synthetic RINEX: no iono, no noise, no ambiguity', 'COMMENT');
    $out .= rgen_header_line(substr($stationName, 0, 60), 'MARKER NAME');
    $out .= rgen_header_line(substr($stationName, 0, 60), 'MARKER NUMBER');
    $out .= rgen_header_line(sprintf('%-20s%-40s', 'SYNTH', 'gisdata'), 'OBSERVER / AGENCY');
    $out .= rgen_header_line(sprintf('%-20s%-20s%-20s', '1', 'SIGOG', '1.0'), 'REC # / TYPE / VERS');
    $out .= rgen_header_line(sprintf('%-20s%-20s', '1', 'SIGOG'), 'ANT # / TYPE');
    $out .= rgen_header_line(sprintf('%14.4f%14.4f%14.4f', $ecef[0], $ecef[1], $ecef[2]), 'APPROX POSITION XYZ');
    $out .= rgen_header_line(sprintf('%14.4f%14.4f%14.4f', 0.0, 0.0, 0.0), 'ANTENNA: DELTA H/E/N');
    $out .= rgen_header_line(sprintf('%6d%6d', 1, 1), 'WAVELENGTH FACT L1/2');
    $out .= rgen_build_obs_types_header_lines(RGEN_SIGOG_OBS_TYPES);
    $out .= rgen_header_line(sprintf('%10.3f', $intervalSec), 'INTERVAL');
    $firstObsGpst = rgen_gpst_unix($startUnix);
    $out .= rgen_header_line(
        sprintf('%6d%6d%6d%6d%6d%13.7f%5sGPS', (int)gmdate('Y', $firstObsGpst), (int)gmdate('n', $firstObsGpst), (int)gmdate('j', $firstObsGpst), (int)gmdate('G', $firstObsGpst), (int)gmdate('i', $firstObsGpst), (float)gmdate('s', $firstObsGpst), ''),
        'TIME OF FIRST OBS'
    );
    $out .= rgen_header_line('', 'END OF HEADER');
    return $out;
}

/**
 * Строит RINEX 2.11 OBS строго по логике/математике эталонного SiGOGbcst —
 * отдельный, самостоятельный режим генератора (выбирается на форме), не
 * заменяющий и не меняющий основной (rgen_build_rinex2_obs/rinex3): только
 * GPS (SiGOGbcst ГЛОНАСС не поддерживает), геометрическая дальность с
 * light-time/Sagnac, релятивистской поправкой и тропосферой Hopfield/
 * Seeber (то же, что считает rgen_compute_visible_ranges — это были
 * методы, перенесённые из SiGOG в основной генератор) — БЕЗ ионосферы, БЕЗ
 * шума измерений и БЕЗ целочисленной неоднозначности фазы: код и фаза
 * берутся из ОДНОЙ и той же скорректированной дальности (см. SiGOGbcst,
 * SUBROUTINE rinex: vto(cto)=dist(i)*alp(cto), alp=1 для кода, alp=f/c для
 * фазы — никакого отдельного слагаемого неоднозначности или шума там нет).
 * Координаты станции — ECEF в метрах, как и во всех остальных режимах
 * генератора (внутренние величины везде в метрах; SiGOGbcst исторически
 * принимал координаты в км только в своём собственном входном файле —
 * здесь in/out уже в метрах, доп. перевода не требуется).
 *
 * @param array{gps: array, glonass: array} $eph объединённые эфемериды (см. rgen_merge_ephemerides)
 */
function rgen_build_sigog_obs(string $stationName, array $ecef, int $startUnix, int $endUnix, array $eph): string
{
    $eph['glonass'] = [];
    $intervalSec = 5.0;
    $lambda1 = RGEN_C / RGEN_GPS_F1;
    $lambda2 = RGEN_C / RGEN_GPS_F2;

    $out = rgen_build_sigog_header($stationName, $ecef, $startUnix, $intervalSec);

    for ($t = $startUnix; $t <= $endUnix; $t += (int)$intervalSec) {
        $ranges = rgen_compute_visible_ranges($eph, $ecef, (float)$t);
        if (!$ranges) {
            continue;
        }
        $epochRows = []; // satId => [C1, P1, P2, L1, L2]
        foreach ($ranges as $sat => $info) {
            // $range уже включает геометрию + часы спутника + тропосферу
            // (см. rgen_compute_visible_ranges) — без иono, без шума, без
            // неоднозначности: ровно SiGOG-логика.
            $range = $info['range'];
            $epochRows[$sat] = [$range, $range, $range, $range / $lambda1, $range / $lambda2];
        }
        ksort($epochRows);
        $frac = $t - floor($t);
        $tGpst = rgen_gpst_unix((int)$t);
        $epochPrefix = sprintf(
            '%3d%3d%3d%3d%3d%11.7f%3d%3d',
            (int)gmdate('y', $tGpst), (int)gmdate('n', $tGpst), (int)gmdate('j', $tGpst),
            (int)gmdate('G', $tGpst), (int)gmdate('i', $tGpst), (float)gmdate('s', $tGpst) + $frac,
            0, count($epochRows)
        );
        $out .= rgen_format_sat_list_lines($epochPrefix, array_keys($epochRows));
        foreach ($epochRows as $vals) {
            $out .= rgen_format_obs_line($vals);
        }
    }

    return $out;
}
