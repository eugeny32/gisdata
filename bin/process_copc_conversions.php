<?php
declare(strict_types=1);

/**
 * Фоновая конвертация LAS → COPC (PR4, модуль 2.2). Без отдельной таблицы
 * очереди в БД — статус определяется наличием файлов на диске:
 *   foo.las
 *   foo.las.copc.laz          — результат (готов)
 *   foo.las.copc.lock         — конвертация уже запущена этим/предыдущим
 *                                запуском (см. bin/copc_convert_worker.ps1)
 *   foo.las.copc.error        — последняя попытка упала, не повторяем
 *                                автоматически (нужно разобраться вручную)
 *
 * Параллельность — не больше MAX_CONCURRENT процессов pdal.exe одновременно
 * (см. docs/CURRENT_STATE.md, раздел 10, п.4 — резерв под Apache/БД/NTRIP-
 * поллинг/RINEX-очередь на той же физической машине). Запускается по
 * расписанию (Windows Task Scheduler, как и bin/process_rinex_requests.php);
 * каждый запуск просто доливает работу до лимита и завершается — не ждёт
 * окончания уже запущенных конвертаций.
 */

require __DIR__ . '/../app/lib/db.php';
require __DIR__ . '/../app/lib/cli.php';
require_cli_or_token();

const MAX_CONCURRENT = 10;

$uploadDir = realpath(__DIR__ . '/../uploads/tours') . DIRECTORY_SEPARATOR;
$psScript = __DIR__ . '/copc_convert_worker.ps1';
$logDir = __DIR__ . '/../uploads/copc_logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0777, true);
}

$pdo = db();
$lasFiles = [];
foreach ($pdo->query("SELECT file_path FROM tours WHERE file_format = 'las'") as $row) {
    $lasFiles[] = $row['file_path'];
}
foreach ($pdo->query("SELECT file_path FROM tour_files WHERE file_format = 'las'") as $row) {
    $lasFiles[] = $row['file_path'];
}
$lasFiles = array_unique($lasFiles);

// Подсчитываем уже запущенные конвертации (lock-файл существует) по
// фактическим путям из БД — без glob по дереву каталогов (file_path может
// лежать в подпапке группы, см. комментарий в schema.sql про uploads/tours/
// <group-slug>/...), а не сканированием файловой системы.
$runningCount = 0;
foreach ($lasFiles as $relativePath) {
    if (is_file($uploadDir . $relativePath . '.copc.laz.lock')) {
        $runningCount++;
    }
}
cli_out("LAS-файлов в БД: " . count($lasFiles) . ", уже запущенных конвертаций (lock): $runningCount");

$spawned = 0;
foreach ($lasFiles as $relativePath) {
    if ($runningCount + $spawned >= MAX_CONCURRENT) {
        cli_out("Достигнут лимит параллельных конвертаций (" . MAX_CONCURRENT . ") — остальное в следующий запуск.");
        break;
    }

    $inputLas = $uploadDir . $relativePath;
    if (!is_file($inputLas)) {
        continue;
    }
    $outputCopc = $inputLas . '.copc.laz';
    $lockFile = $outputCopc . '.lock';
    $errorFile = $outputCopc . '.error';

    if (is_file($outputCopc) || is_file($lockFile) || is_file($errorFile)) {
        continue;
    }

    // Lock создаём ЗДЕСЬ (синхронно, до запуска процесса) — иначе при
    // нескольких файлах подряд в одном запуске мы могли бы посчитать их
    // все как "ещё не начатые" и превысить MAX_CONCURRENT до того, как
    // дочерние процессы успеют создать свои локи сами.
    touch($lockFile);

    $logFile = $logDir . '/' . basename($relativePath) . '.log';
    // Команда передаётся МАССИВОМ, а не строкой — со строкой proc_open на
    // Windows запускает через cmd.exe, и многослойное экранирование
    // (PHP escapeshellarg + cmd.exe + сам PowerShell) на путях с обратными
    // слэшами портило аргументы настолько, что скрипт падал ДО входа в
    // свой try/finally — lock-файл оставался висеть навечно. Массив минует
    // cmd.exe целиком (прямой CreateProcess), экранирование не нужно.
    $cmd = [
        'powershell.exe', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $psScript,
        '-InputLas', $inputLas,
        '-OutputCopc', $outputCopc,
        '-LockFile', $lockFile,
        '-ErrorFile', $errorFile,
    ];

    $descriptors = [
        0 => ['pipe', 'r'],
        1 => ['file', $logFile, 'a'],
        2 => ['file', $logFile, 'a'],
    ];
    $process = proc_open($cmd, $descriptors, $pipes);
    if ($process === false) {
        cli_err("Не удалось запустить конвертацию для $relativePath");
        @unlink($lockFile);
        continue;
    }
    // Не ждём (proc_close/блокирующее чтение pipes не вызываем) — процесс
    // продолжает работать после завершения этого скрипта; сам снимет lock
    // (см. copc_convert_worker.ps1, finally).
    fclose($pipes[0]);
    $spawned++;
    cli_out("Запущена конвертация: $relativePath -> {$relativePath}.copc.laz");
}

cli_out("Запущено новых конвертаций: $spawned");
