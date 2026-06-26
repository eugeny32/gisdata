<?php

declare(strict_types=1);

/**
 * Удалённый FTP с почасовыми RINEX-файлами станций (см. rinex.php).
 * Структура каталогов на сервере (определена вручную, через прямой обзор
 * ftp://gnss.host): один год без подпапки года,
 *   /{день_года 3 цифры}({ММДД})/{КОД_СТАНЦИИ}/{имя}_MO.rnx   — наблюдения
 *   /{день_года 3 цифры}({ММДД})/{КОД_СТАНЦИИ}/{имя}_MN.rnx   — навигация
 * Например: /060(0301)/REFT/REFT06070_R_20260600700_01H_10S_MO.rnx
 */

/**
 * Открывает соединение с FTP, логинится, переключает в пассивный режим
 * (нужен почти всегда — иначе LIST/RETR не работают через NAT/файрвол на
 * стороне клиента). Возвращает false при любой ошибке подключения/логина
 * вместо исключения — вызывающий код сам решает, как сообщить пользователю
 * ("FTP временно недоступен" — это ожидаемая, не катастрофическая ситуация).
 */
// Без типа возврата: \FTP\Connection появился только в PHP 8.1, а на
// сервере PHP 8.0 (ftp_connect() там отдаёт обычный resource).
function gnss_ftp_connect()
{
    $cfg = app_config()['gnss_ftp'];
    $conn = @ftp_connect($cfg['host'], 21, (int)$cfg['timeout_sec']);
    if ($conn === false) {
        return false;
    }
    if (!@ftp_login($conn, $cfg['user'], $cfg['password'])) {
        ftp_close($conn);
        return false;
    }
    ftp_pasv($conn, true);
    return $conn;
}

/**
 * Имя папки дня на FTP — день года (3 цифры) + (ММДД) в скобках, без
 * подпапки года. Год самого $date не используется в имени папки (сервер
 * хранит только один год за раз) — но используется при сопоставлении
 * результатов с реальной датой при выводе пользователю.
 */
function gnss_day_folder(\DateTimeImmutable $date): string
{
    $doy = (int)$date->format('z') + 1; // format('z') — 0-based
    return sprintf('%03d(%s)', $doy, $date->format('md'));
}

/**
 * Разбирает строку из ftp_rawlist() в стиле "ls -l" — нам нужны только
 * признак каталога, размер и имя (остальное — права/владелец/дата —
 * не нужны, дата файла нас не интересует, она и так известна из имени
 * родительской папки дня).
 */
function gnss_parse_rawlist_line(string $line): ?array
{
    // Пример: "-rw-r--r-- 1 ftp ftp     7940 Mar 01  2026 REFT...MO.rnx"
    // Имя — всё после 8-го пробельно-разделённого поля (имена файлов сами
    // могут содержать пробелы не бывает в этой системе, но на всякий случай
    // не разбиваем регуляркой на жёстко фиксированные группы целиком).
    if (!preg_match('/^([\-d])\S+\s+\d+\s+\S+\s+\S+\s+(\d+)\s+\S+\s+\S+\s+\S+\s+(.+)$/', $line, $m)) {
        return null;
    }
    return [
        'is_dir' => $m[1] === 'd',
        'size' => (int)$m[2],
        'name' => $m[3],
    ];
}

/**
 * Список станций (имена подпапок) внутри папки конкретного дня. Не каждая
 * станция пишет данные каждый день (станция могла быть офлайн/не
 * существовать в эту дату) — пустой результат для конкретного дня — это
 * нормально, не ошибка.
 */
function gnss_ftp_list_stations($conn, string $dayFolder): array
{
    $lines = @ftp_rawlist($conn, '/' . $dayFolder);
    if ($lines === false) {
        return [];
    }
    $names = [];
    foreach ($lines as $line) {
        $parsed = gnss_parse_rawlist_line($line);
        if ($parsed && $parsed['is_dir']) {
            $names[] = $parsed['name'];
        }
    }
    return $names;
}

/**
 * Список файлов конкретной станции за конкретный день — каждый элемент
 * содержит относительный путь (для последующего скачивания) и размер.
 */
function gnss_ftp_list_files($conn, string $dayFolder, string $station): array
{
    $lines = @ftp_rawlist($conn, '/' . $dayFolder . '/' . $station);
    if ($lines === false) {
        return [];
    }
    $files = [];
    foreach ($lines as $line) {
        $parsed = gnss_parse_rawlist_line($line);
        if ($parsed && !$parsed['is_dir']) {
            $files[] = [
                'path' => $dayFolder . '/' . $station . '/' . $parsed['name'],
                'name' => $parsed['name'],
                'size' => $parsed['size'],
                'day_folder' => $dayFolder,
                'station' => $station,
            ];
        }
    }
    return $files;
}

/**
 * Имя файла содержит точную метку времени самих данных — например
 * "REFT0606E_R_20260600628_01H_10S_MO.rnx" → "20260600628" разбивается на
 * YYYY(2026) + DDD-день года(060) + HHmm(0628). Это надёжнее, чем дата
 * "Mar 01" из ftp_rawlist() — там только день, без часа/минуты, а нам для
 * проверки "давности" данных (см. gnss_station_last_data) нужна точность
 * до минуты. Метка в имени файла — UTC (стандарт для GNSS/RINEX), поэтому
 * ЯВНО прикрепляем UTC, а не полагаемся на date.timezone из php.ini (нигде
 * в проекте не вызывается date_default_timezone_set(), дефолт зависит от
 * хостинга) — иначе сравнение с границами запроса (которые тоже UTC, см.
 * rinex.php) съезжало бы на час сдвига часового пояса сервера.
 */
function gnss_parse_file_timestamp(string $fileName): ?\DateTimeImmutable
{
    if (!preg_match('/_R_(\d{4})(\d{3})(\d{2})(\d{2})_/', $fileName, $m)) {
        return null;
    }
    [, $year, $doy, $hour, $minute] = $m;
    try {
        return (new \DateTimeImmutable($year . '-01-01', new \DateTimeZone('UTC')))
            ->modify('+' . ((int)$doy - 1) . ' days')
            ->setTime((int)$hour, (int)$minute);
    } catch (\Exception $e) {
        return null;
    }
}

/**
 * Номинальная длительность файла из имени — токен периода (4-й, считая от
 * нуля, после разбиения по "_") вида "01H"/"15M"/"01D". Нужна, чтобы при
 * склейке файлов за сутки (см. rinex_merge.php) отличать "файлы идут
 * подряд без разрыва" от "между файлами дырка в несколько минут (станция
 * не присылала данные/был обрыв сессии)" — во втором случае склейка должна
 * начинать новый файл, а не сшивать через дырку как ни в чём не бывало.
 */
function gnss_parse_file_period_minutes(string $fileName): ?int
{
    $parts = explode('_', $fileName);
    if (!isset($parts[3]) || !preg_match('/^(\d+)([A-Za-z])$/', $parts[3], $m)) {
        return null;
    }
    $value = (int)$m[1];
    return match (strtoupper($m[2])) {
        'H' => $value * 60,
        'D' => $value * 1440,
        'M' => $value,
        'S' => 0, // секундный токен здесь не встречается (это для длительности файла, не интервала выборки), но не паникуем
        default => null,
    };
}

/**
 * Самая свежая метка времени данных станции — смотрим папку "сегодня" И
 * "вчера" (после полуночи новый день ещё может не появиться на FTP, либо
 * последний файл предыдущего дня может быть свежее любого из текущего,
 * если станция давно не присылала данных). Возвращает null, если файлов с
 * распознаваемой меткой не нашлось вообще ни за один из двух дней —
 * это нормально (станция реально молчит), а не ошибка функции.
 */
function gnss_station_last_data($conn, string $stationCode, \DateTimeImmutable $now): ?\DateTimeImmutable
{
    $latest = null;
    foreach ([$now, $now->modify('-1 day')] as $day) {
        $files = gnss_ftp_list_files($conn, gnss_day_folder($day), $stationCode);
        foreach ($files as $f) {
            $ts = gnss_parse_file_timestamp($f['name']);
            if ($ts !== null && ($latest === null || $ts > $latest)) {
                $latest = $ts;
            }
        }
    }
    return $latest;
}
