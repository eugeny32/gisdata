<?php

declare(strict_types=1);

/**
 * Физические константы и преобразования времени для генератора искусственных
 * RINEX-файлов (GPS + ГЛОНАСС). Используются стандартные значения из
 * ICD-GPS-200 (для GPS) и ICD ГЛОНАСС (для ГЛОНАСС/ПЗ-90.11).
 */

const RGEN_C = 299792458.0; // скорость света, м/с
const RGEN_GPS_F1 = 1575.42e6; // GPS L1, Гц
const RGEN_GPS_F2 = 1227.60e6; // GPS L2, Гц
const RGEN_GLO_F1 = 1602.0e6;  // ГЛОНАСС G1 (номинал, без учёта частотных литер K), Гц
const RGEN_GLO_F2 = 1246.0e6;  // ГЛОНАСС G2 (номинал), Гц

// GPS: гравитационный параметр и угловая скорость Земли (WGS-84 / ICD-GPS-200)
const RGEN_GPS_MU = 3.986005e14;
const RGEN_GPS_OMEGA_E = 7.2921151467e-5;

// ГЛОНАСС: гравитационный параметр и угловая скорость Земли (ПЗ-90.11)
const RGEN_GLO_MU = 3.9860044e14;
const RGEN_GLO_OMEGA_E = 7.292115e-5;
const RGEN_GLO_J02 = 1082625.75e-9; // второй зональный гармонический коэффициент (J2)
const RGEN_GLO_AE = 6378136.0;      // экваториальный радиус Земли, м

// Разница GPS-time и UTC на текущий момент (секунды) — последняя добавленная
// секунда координации была 31.12.2016, новых не было; если МСЭ объявит новую
// високосную секунду, это число нужно поднять на 1.
const RGEN_GPS_UTC_LEAP_SECONDS = 18;

/**
 * UTC Unix-timestamp -> [номер недели GPS, секунды недели GPS].
 * Эпоха GPS: 6 января 1980, 00:00:00 UTC.
 */
function rgen_utc_to_gps_week_sow(int $unixUtc): array
{
    $gpsEpoch = gmmktime(0, 0, 0, 1, 6, 1980);
    $gpsTime = $unixUtc - $gpsEpoch + RGEN_GPS_UTC_LEAP_SECONDS;
    $week = intdiv($gpsTime, 7 * 86400);
    $sow = $gpsTime - $week * 7 * 86400;
    return [$week, $sow];
}

/**
 * Читает числовое поле фиксированной ширины (19 символов) из строки записи
 * RINEX NAV, начиная с $offset, с заменой фортрановской 'D'-экспоненты на
 * 'E' (некоторые генераторы RINEX до сих пор пишут её в D-нотации).
 * Общая для GPS- и ГЛОНАСС-парсеров — поэтому здесь, а не в одном из них.
 */
function rgen_read_f(string $line, int $offset): float
{
    $chunk = substr($line, $offset, 19);
    $chunk = str_replace(['D', 'd'], 'E', trim($chunk));
    return $chunk === '' ? 0.0 : (float)$chunk;
}
