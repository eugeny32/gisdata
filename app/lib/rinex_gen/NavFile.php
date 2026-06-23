<?php

declare(strict_types=1);

require_once __DIR__ . '/GpsNav.php';
require_once __DIR__ . '/GlonassNav.php';

/**
 * Загрузка/кэширование и разбор объединённого многосистемного навигационного
 * файла (broadcast ephemeris, RINEX 3, формат "BRDM"/"BRDC") за одни сутки
 * UTC. Из него используются только записи GPS ('G') и ГЛОНАСС ('R') —
 * остальные системы (Galileo 'E', BeiDou 'C', QZSS 'J', IRNSS 'I', SBAS 'S')
 * присутствуют в файле и корректно пропускаются по числу строк на запись,
 * чтобы не сбить разбор остальных, но не разбираются (вне выбранной
 * пользователем области: GPS + ГЛОНАСС).
 *
 * Про автозагрузку: основной источник — CDDIS (NASA), требует бесплатный
 * аккаунт Earthdata (urs.earthdata.nasa.gov), логин/пароль — в .env
 * (CDDIS_EARTHDATA_USER/CDDIS_EARTHDATA_PASSWORD), читаются в
 * app/config.php -> 'rinex_synth'. Авторизация и реальная загрузка
 * проверены живым тестом (HTTP Basic Auth + переход по 302-редиректу на
 * urs.earthdata.nasa.gov с тем же логином/паролем + cookie-сессия, см.
 * rgen_http_get()). Запасной URL (BKG, без логина) в конфиге НЕ проверен
 * живьём — недоступен из среды разработки (может быть ограничение именно
 * песочницы, не реального сервера приложения). Если ни один источник не
 * сработает — в форме генератора есть резервный путь: загрузить
 * .rnx/.rnx.gz с эфемеридами вручную.
 */

/** Сутки → нужны UTC-дата(ы), которые покрывает период генерации. */
function rgen_dates_in_range(int $startUnix, int $endUnix): array
{
    $dates = [];
    $dayStart = (int)(floor($startUnix / 86400) * 86400);
    while ($dayStart <= $endUnix) {
        $dates[] = $dayStart;
        $dayStart += 86400;
    }
    return $dates;
}

function rgen_nav_cache_dir(): string
{
    $dir = __DIR__ . '/../../../uploads/rinex_synth_cache';
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
    return $dir;
}

/**
 * Earthdata-логин шлём только на cddis.nasa.gov — на другие хосты пароль
 * не отправляем, незачем им его знать.
 */
function rgen_credentials_for_url(string $url, array $cfg): array
{
    $host = parse_url($url, PHP_URL_HOST) ?: '';
    if (str_contains($host, 'cddis.nasa.gov') && !empty($cfg['earthdata_user'])) {
        return [$cfg['earthdata_user'], $cfg['earthdata_password'] ?? ''];
    }
    return [null, null];
}

/**
 * Скачивает (с кэшированием на диске) объединённый nav-файл за сутки
 * $dayStartUnix (00:00 UTC) и возвращает локальный путь к
 * распакованному .rnx, либо null, если скачать не удалось ни с одного
 * зеркала из конфига.
 */
function rgen_download_nav_for_day(int $dayStartUnix): ?string
{
    $doy = (int)gmdate('z', $dayStartUnix) + 1;
    $year = (int)gmdate('Y', $dayStartUnix);
    $cacheFile = rgen_nav_cache_dir() . '/brdm_' . $year . '_' . str_pad((string)$doy, 3, '0', STR_PAD_LEFT) . '.rnx';

    if (is_file($cacheFile) && filesize($cacheFile) > 0) {
        return $cacheFile;
    }

    $cfg = app_config()['rinex_synth'] ?? [];
    $templates = $cfg['nav_url_templates'] ?? [];
    foreach ($templates as $template) {
        $url = strtr($template, [
            '{year}' => (string)$year,
            '{doy3}' => str_pad((string)$doy, 3, '0', STR_PAD_LEFT),
            '{yy}' => substr((string)$year, -2),
        ]);

        [$user, $pass] = rgen_credentials_for_url($url, $cfg);
        $gz = rgen_http_get($url, $user, $pass);
        if ($gz === null) {
            continue;
        }
        $rnx = @gzdecode($gz);
        if ($rnx === false || $rnx === null) {
            // Некоторые зеркала отдают уже распакованный .rnx без gzip.
            $rnx = $gz;
        }
        if (strpos($rnx, 'RINEX VERSION') === false) {
            continue;
        }
        file_put_contents($cacheFile, $rnx);
        return $cacheFile;
    }

    return null;
}

/**
 * GET с опциональной HTTP Basic-авторизацией, которая переживает редирект
 * на другой хост (нужно для CDDIS: запрос на cddis.nasa.gov 302-редиректит
 * на urs.earthdata.nasa.gov/oauth/..., который проверяет тот же логин/пароль
 * и редиректит обратно на cddis.nasa.gov/proxyauth, где выставляется
 * cookie-сессия и только потом отдаётся сам файл — проверено живым тестом).
 * CURLOPT_FOLLOWLOCATION по умолчанию НЕ передаёт Authorization на другой
 * хост — для этого явно включён CURLOPT_UNRESTRICTED_AUTH; cookie-engine
 * включён через CURLOPT_COOKIEFILE с пустым значением (хранение только в
 * памяти этого запроса, на диск ничего не пишется).
 */
function rgen_http_get(string $url, ?string $user = null, ?string $pass = null): ?string
{
    $ch = curl_init($url);
    $opts = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 60,
        CURLOPT_USERAGENT => 'GISData RinexSynth/1.0',
        CURLOPT_COOKIEFILE => '',
    ];
    if ($user !== null) {
        $opts[CURLOPT_USERPWD] = $user . ':' . $pass;
        $opts[CURLOPT_UNRESTRICTED_AUTH] = true;
    }
    curl_setopt_array($ch, $opts);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($body === false || $code < 200 || $code >= 300) {
        return null;
    }
    return $body;
}

/**
 * Разбирает содержимое RINEX 3 NAV-файла (объединённого или
 * однострочного — неважно) и возвращает эфемериды GPS/ГЛОНАСС.
 *
 * @return array{gps: array<string, array>, glonass: array<string, array>}
 */
function rgen_parse_nav_file(string $content): array
{
    $lines = preg_split('/\r\n|\r|\n/', $content);
    $n = count($lines);

    $pos = 0;
    while ($pos < $n && strpos($lines[$pos], 'END OF HEADER') === false) {
        $pos++;
    }
    $pos++; // строка после END OF HEADER

    $gps = [];
    $glonass = [];

    while ($pos < $n) {
        $line = $lines[$pos];
        if (trim($line) === '') {
            $pos++;
            continue;
        }
        $sys = $line[0];
        if ($sys === 'G' || $sys === 'E' || $sys === 'C' || $sys === 'J' || $sys === 'I') {
            // 8-строчные записи (кеплеровы элементы) — разбираем только GPS,
            // остальные системы той же длины записи просто пропускаем.
            if ($pos + 7 >= $n) {
                break;
            }
            if ($sys === 'G') {
                $rec = rgen_parse_gps_record(array_slice($lines, $pos, 8));
                $gps[$rec['sat']][] = $rec;
            }
            $pos += 8;
        } elseif ($sys === 'R' || $sys === 'S') {
            // 4-строчные записи (координаты/скорость/ускорение) —
            // разбираем только ГЛОНАСС, SBAS пропускаем.
            if ($pos + 3 >= $n) {
                break;
            }
            if ($sys === 'R') {
                $rec = rgen_parse_glonass_record(array_slice($lines, $pos, 4));
                $glonass[$rec['sat']][] = $rec;
            }
            $pos += 4;
        } else {
            // Неизвестная/нераспознанная строка — не должно встречаться в
            // валидном файле, но не зацикливаемся.
            $pos++;
        }
    }

    return ['gps' => $gps, 'glonass' => $glonass];
}
