<?php
declare(strict_types=1);

/**
 * Обработка одного "готового" фонового запроса RINEX-данных (см. rinex.php
 * — там пользователь описывает критерии и создаёт запись в rinex_requests
 * со статусом 'pending'; эта запись становится доступна для скачивания на
 * странице "Готовые данные" — rinex_requests.php).
 *
 * За один запуск обрабатывается ОДИН запрос (тот, что ждёт дольше всех) —
 * простая модель без отдельного демона: запускать по расписанию
 * (Планировщик Windows) часто, например раз в 1-2 минуты, как и остальные
 * bin/*.php скрипты в проекте.
 *
 * Запускать: php C:\path\to\bin\process_rinex_requests.php
 */

require __DIR__ . '/../app/lib/db.php';
require __DIR__ . '/../app/lib/cli.php';
require __DIR__ . '/../app/lib/gnss_ftp.php';
require __DIR__ . '/../app/lib/rinex_merge.php';
require_cli_or_token();

function log_line(string $msg): void
{
    cli_out('[' . date('Y-m-d H:i:s') . '] ' . $msg);
}

// Разрыв между концом одного файла и началом следующего, при котором они
// СЧИТАЮТСЯ "идущими подряд" и склеиваются в один — больше этого считается
// дыркой (станция не присылала данные/обрыв сессии), из неё получаются
// два отдельных файла вместо одного с пропуском посередине.
const RINEX_GAP_TOLERANCE_MINUTES = 5;

$resultsDir = __DIR__ . '/../uploads/rinex_results';
if (!is_dir($resultsDir)) {
    mkdir($resultsDir, 0755, true);
}

$pdo = db();

// Атомарный захват одного запроса — SELECT...FOR UPDATE SKIP LOCKED внутри
// транзакции защищает от двух параллельных запусков скрипта (если предыдущий
// запуск ещё не закончился к моменту следующего по расписанию) от обработки
// одного и того же запроса дважды.
$pdo->beginTransaction();
$claim = $pdo->query(
    "SELECT id FROM rinex_requests WHERE status = 'pending' ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED"
)->fetch();
if (!$claim) {
    $pdo->rollBack();
    log_line('Нет ожидающих запросов');
    exit;
}
$pdo->prepare("UPDATE rinex_requests SET status = 'processing', started_at = NOW() WHERE id = :id")
    ->execute(['id' => $claim['id']]);
$pdo->commit();

$requestId = (int)$claim['id'];
$stmt = $pdo->prepare('SELECT * FROM rinex_requests WHERE id = :id');
$stmt->execute(['id' => $requestId]);
$request = $stmt->fetch();

set_time_limit(0); // сборка за широкий диапазон дат/много станций может занять заметно больше 120с по умолчанию

function fail_request(PDO $pdo, int $id, string $message): void
{
    $pdo->prepare("UPDATE rinex_requests SET status = 'error', error_message = :msg, completed_at = NOW() WHERE id = :id")
        ->execute(['id' => $id, 'msg' => substr($message, 0, 500)]);
    log_line("Запрос #$id: ОШИБКА — $message");
}

try {
    $stations = array_values(array_filter(array_map('trim', explode(',', $request['stations']))));
    // Явно UTC — значения в БД уже UTC (см. rinex.php), но PHP без явной
    // зоны интерпретирует строку в date.timezone из php.ini, который в
    // проекте никогда не настраивается явно (зависит от хостинга).
    $dateFrom = new DateTimeImmutable($request['date_from_utc'], new DateTimeZone('UTC'));
    $dateTo = new DateTimeImmutable($request['date_to_utc'], new DateTimeZone('UTC'));
    $wantTypes = [];
    if ((int)$request['want_obs'] === 1) $wantTypes['MO'] = true;
    if ((int)$request['want_nav'] === 1) $wantTypes['MN'] = true;
    $mergeByDay = (int)$request['merge_by_day'] === 1;

    if (!$stations || !$wantTypes) {
        fail_request($pdo, $requestId, 'Не указаны станции или типы файлов');
        exit;
    }

    $conn = gnss_ftp_connect();
    if ($conn === false) {
        fail_request($pdo, $requestId, 'Не удалось подключиться к FTP gnss.host');
        exit;
    }

    $tmpDir = $resultsDir . '/tmp_' . $requestId;
    $finalDir = $resultsDir . '/final_' . $requestId;
    mkdir($tmpDir, 0755, true);
    mkdir($finalDir, 0755, true);

    // Шаг 1 — скачиваем с FTP все файлы, попадающие в [dateFrom, dateTo] по
    // их СОБСТВЕННОЙ метке времени (gnss_parse_file_timestamp), а не по
    // границам папки дня — последняя папка дня содержит часы и до, и после
    // запрошенного окна, фильтруем точно.
    $downloaded = []; // [station][type] => [ ['local_path'=>..., 'timestamp'=>DateTimeImmutable, 'period_minutes'=>?int], ... ]
    $cursorDay = $dateFrom->setTime(0, 0);
    $lastDay = $dateTo->setTime(0, 0);
    $fileIndex = 0;
    while ($cursorDay <= $lastDay) {
        $dayFolder = gnss_day_folder($cursorDay);
        foreach ($stations as $station) {
            $files = gnss_ftp_list_files($conn, $dayFolder, $station);
            foreach ($files as $f) {
                $ts = gnss_parse_file_timestamp($f['name']);
                if ($ts === null || $ts < $dateFrom || $ts > $dateTo) {
                    continue;
                }
                $type = stripos($f['name'], '_MO.') !== false ? 'MO'
                    : (stripos($f['name'], '_MN.') !== false ? 'MN' : null);
                if ($type === null || !isset($wantTypes[$type])) {
                    continue;
                }
                $fileIndex++;
                $localPath = $tmpDir . '/dl_' . $fileIndex;
                if (!@ftp_get($conn, $localPath, '/' . $f['path'], FTP_BINARY)) {
                    continue; // пропускаем недостающий/неудачно скачанный файл, не валим весь запрос
                }
                $downloaded[$station][$type][] = [
                    'local_path' => $localPath,
                    'timestamp' => $ts,
                    'period_minutes' => gnss_parse_file_period_minutes($f['name']),
                ];
            }
        }
        $cursorDay = $cursorDay->modify('+1 day');
    }
    ftp_close($conn);

    if (!$downloaded) {
        fail_request($pdo, $requestId, 'Не найдено файлов по заданным станциям/датам/типам');
        // Чистим пустые временные папки.
        @rmdir($tmpDir);
        @rmdir($finalDir);
        exit;
    }

    // Шаг 2 — группировка/склейка. Без merge_by_day — каждый скачанный файл
    // просто переносится в финальную папку под читаемым именем (без склейки
    // вообще, на случай если пользователь явно не просил объединять часы).
    $fileCount = 0;
    foreach ($downloaded as $station => $byType) {
        foreach ($byType as $type => $files) {
            if (!$mergeByDay) {
                foreach ($files as $f) {
                    $name = $station . '_' . $f['timestamp']->format('Ymd_Hi') . '_' . $type . '.rnx';
                    rename($f['local_path'], $finalDir . '/' . $name);
                    $fileCount++;
                }
                continue;
            }
            $groups = rinex_group_contiguous_files($files, RINEX_GAP_TOLERANCE_MINUTES);
            foreach ($groups as $group) {
                $first = $group[0]['timestamp'];
                $last = end($group)['timestamp'];
                $name = $station . '_' . $type . '_' . $first->format('Ymd') . '_'
                    . $first->format('Hi') . '-' . $last->format('Hi') . '.rnx';
                $localPaths = array_map(fn($g) => $g['local_path'], $group);
                if (count($localPaths) === 1) {
                    rename($localPaths[0], $finalDir . '/' . $name);
                } else {
                    rinex_merge_group($localPaths, $finalDir . '/' . $name);
                }
                $fileCount++;
            }
        }
    }

    // dl_* файлы нужны были только до этого момента (либо переименованы,
    // либо уже прочитаны при склейке) — что осталось (входило в склеенные
    // группы из >1 файла) убираем.
    foreach (glob($tmpDir . '/dl_*') as $leftover) {
        @unlink($leftover);
    }
    @rmdir($tmpDir);

    // Шаг 3 — архивируем финальную папку в один .zip для скачивания.
    $zipRelPath = $requestId . '.zip';
    $zipPath = $resultsDir . '/' . $zipRelPath;
    $zip = new ZipArchive();
    $zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);
    foreach (glob($finalDir . '/*') as $f) {
        $zip->addFile($f, basename($f));
    }
    $zip->close();

    foreach (glob($finalDir . '/*') as $f) {
        @unlink($f);
    }
    @rmdir($finalDir);

    $pdo->prepare(
        "UPDATE rinex_requests SET status = 'done', result_path = :path, file_count = :count, completed_at = NOW() WHERE id = :id"
    )->execute(['path' => $zipRelPath, 'count' => $fileCount, 'id' => $requestId]);

    log_line("Запрос #$requestId: готово, файлов в архиве: $fileCount");
} catch (Throwable $e) {
    fail_request($pdo, $requestId, $e->getMessage());
}
