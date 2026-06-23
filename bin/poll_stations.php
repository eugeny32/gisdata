<?php
declare(strict_types=1);

/**
 * Опрос всех включённых базовых станций как NTRIP-клиент (см.
 * app/lib/ntrip_poll.php — там же логика опроса для кнопки "Опросить
 * сейчас" в кабинете на stations.php).
 *
 * Запускать по расписанию (Планировщик заданий Windows), например раз в минуту:
 *   php C:\path\to\bin\poll_stations.php
 *
 * Если "Последняя проверка" в кабинете давно не обновлялась — значит, эта
 * задача в Планировщике перестала запускаться (отключена/удалена/ошибка
 * пути к php.exe) — нужно проверить сам Планировщик заданий на сервере.
 */

require __DIR__ . '/../app/lib/db.php';
require __DIR__ . '/../app/lib/cli.php';
require __DIR__ . '/../app/lib/ntrip_poll.php';
require_cli_or_token();

function log_line(string $msg): void
{
    cli_out('[' . date('Y-m-d H:i:s') . '] ' . $msg);
}

$cfg = app_config();
$pdo = db();

$stations = $pdo->query('SELECT * FROM stations WHERE is_enabled = 1')->fetchAll();
$counts = poll_stations($pdo, $stations, $cfg['ntrip']);

log_line(sprintf('Проверено станций: %d (online: %d, offline: %d)', count($stations), $counts['online'] ?? 0, $counts['offline'] ?? 0));
