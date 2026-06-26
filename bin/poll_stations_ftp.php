<?php
declare(strict_types=1);

/**
 * Резервная проверка статуса станций по наличию свежих файлов в их
 * каталоге на ftp://gnss.host (см. app/lib/gnss_ftp.php) — раз в час,
 * в отличие от NTRIP-опроса (bin/poll_stations.php), который раз в минуту.
 *
 * Зачем отдельно от NTRIP-опроса: часть станций недоступна для прямого
 * NTRIP-опроса по сети с ЭТОГО сервера (например, кастер блокирует порт
 * целиком — подтверждено живым тестом TCP-соединения), но данные от них
 * всё равно реально доходят до gnss.host другим путём. Эта проверка
 * ТОЛЬКО повышает статус offline/unknown → online (если на FTP нашлись
 * свежие файлы) — никогда не понижает: NTRIP-опрос работает каждую минуту
 * и сам поймает реальный обрыв намного быстрее, чем эта часовая проверка
 * успела бы ошибочно объявить рабочую станцию офлайн из-за, например,
 * временной паузы в заливке файлов на FTP.
 *
 * Запускать по расписанию (Планировщик заданий Windows) раз в час:
 *   php C:\path\to\bin\poll_stations_ftp.php
 */

require __DIR__ . '/../app/lib/db.php';
require __DIR__ . '/../app/lib/cli.php';
require __DIR__ . '/../app/lib/gnss_ftp.php';
require_cli_or_token();

function log_line(string $msg): void
{
    cli_out('[' . date('Y-m-d H:i:s') . '] ' . $msg);
}

// Запас сверх часа — сама проверка идёт раз в час, плюс возможная задержка
// заливки последнего файла станцией на FTP; без запаса станция, опрошенная
// сразу после публикации файла, выглядела бы устаревшей уже через минуту.
const GNSS_FTP_FRESH_MINUTES = 90;

$pdo = db();
$stations = $pdo->query("SELECT id, name FROM stations WHERE is_enabled = 1")->fetchAll();

$conn = gnss_ftp_connect();
if ($conn === false) {
    log_line('Не удалось подключиться к FTP gnss.host — проверка пропущена, статусы не менялись');
    exit;
}

// Явно UTC — gnss_parse_file_timestamp() тоже строит метки в UTC (имена
// файлов на FTP — UTC), без этого сравнение "давности" съезжало бы на
// величину смещения часового пояса сервера (date.timezone в php.ini не
// настраивается ни здесь, ни где-либо ещё в проекте).
$now = new DateTimeImmutable('now', new DateTimeZone('UTC'));

$recordCheck = $pdo->prepare(
    "INSERT INTO station_status (station_id, status, ftp_checked_at, ftp_last_data_at)
     VALUES (:id, 'unknown', NOW(), :ftp_last_data_at)
     ON CONFLICT (station_id) DO UPDATE SET
        ftp_checked_at = EXCLUDED.ftp_checked_at,
        ftp_last_data_at = EXCLUDED.ftp_last_data_at"
);
$promoteOnline = $pdo->prepare(
    "UPDATE station_status SET status = 'online', last_data_at = :ftp_last_data_at,
        last_error = 'online по данным FTP (gnss.host), NTRIP-опрос не подтверждает'
     WHERE station_id = :id AND status != 'online'"
);

$checked = 0;
$promoted = 0;
foreach ($stations as $station) {
    $checked++;
    $latest = gnss_station_last_data($conn, $station['name'], $now);
    $latestStr = $latest ? $latest->format('Y-m-d H:i:s') : null;

    $recordCheck->execute(['id' => $station['id'], 'ftp_last_data_at' => $latestStr]);

    if ($latest !== null) {
        $ageMinutes = ($now->getTimestamp() - $latest->getTimestamp()) / 60;
        if ($ageMinutes <= GNSS_FTP_FRESH_MINUTES) {
            $promoteOnline->execute(['id' => $station['id'], 'ftp_last_data_at' => $latestStr]);
            if ($promoteOnline->rowCount() > 0) {
                $promoted++;
            }
        }
    }
}
ftp_close($conn);

log_line(sprintf('Проверено станций по FTP: %d, повышено до online: %d', $checked, $promoted));
