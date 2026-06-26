<?php
declare(strict_types=1);

/**
 * Фоновая конвертация .ply туров в SOG + коллизионный .glb (PR5, модули
 * 1.1/2.3). Статус — по наличию файлов на диске, без отдельной таблицы
 * (тот же подход, что bin/process_copc_conversions.php, PR4):
 *   foo.ply
 *   foo.ply.sog                — готовый streamed-LOD/SOG (для gsplat)
 *   foo.ply.collision.glb      — готовый коллайдер (для Walk-режима)
 *   foo.ply.sog.lock           — конвертация уже запущена (один lock на
 *                                 оба выхода — см. splat_transform_worker.ps1)
 *   foo.ply.sog.error          — последняя попытка упала, не повторяем
 *                                 автоматически
 *
 * Параллельность — тот же лимит и то же обоснование, что в PR3/PR4 (см.
 * docs/CURRENT_STATE.md, раздел 10, п.4). Запускается по расписанию
 * (Windows Task Scheduler).
 */

require __DIR__ . '/../app/lib/db.php';
require __DIR__ . '/../app/lib/cli.php';
require_cli_or_token();

const MAX_CONCURRENT = 10;

$uploadDir = realpath(__DIR__ . '/../uploads/tours') . DIRECTORY_SEPARATOR;
$psScript = __DIR__ . '/splat_transform_worker.ps1';
$logDir = __DIR__ . '/../uploads/splat_transform_logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0777, true);
}

$pdo = db();
$plyFiles = [];
foreach ($pdo->query("SELECT file_path FROM tours WHERE file_format = 'ply'") as $row) {
    $plyFiles[] = $row['file_path'];
}
foreach ($pdo->query("SELECT file_path FROM tour_files WHERE file_format = 'ply'") as $row) {
    $plyFiles[] = $row['file_path'];
}
$plyFiles = array_unique($plyFiles);

$runningCount = 0;
foreach ($plyFiles as $relativePath) {
    if (is_file($uploadDir . $relativePath . '.sog.lock')) {
        $runningCount++;
    }
}
cli_out("PLY-файлов в БД: " . count($plyFiles) . ", уже запущенных конвертаций (lock): $runningCount");

$spawned = 0;
foreach ($plyFiles as $relativePath) {
    if ($runningCount + $spawned >= MAX_CONCURRENT) {
        cli_out("Достигнут лимит параллельных конвертаций (" . MAX_CONCURRENT . ") — остальное в следующий запуск.");
        break;
    }

    $inputPly = $uploadDir . $relativePath;
    if (!is_file($inputPly)) {
        continue;
    }
    $outputSog = $inputPly . '.sog';
    $outputCollision = $inputPly . '.collision.glb';
    $lockFile = $outputSog . '.lock';
    $errorFile = $outputSog . '.error';

    if (is_file($outputSog) || is_file($lockFile) || is_file($errorFile)) {
        continue;
    }

    touch($lockFile);

    $logFile = $logDir . '/' . basename($relativePath) . '.log';
    $cmd = [
        'powershell.exe', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $psScript,
        '-InputPly', $inputPly,
        '-OutputSog', $outputSog,
        '-OutputCollision', $outputCollision,
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
    fclose($pipes[0]);
    $spawned++;
    cli_out("Запущена конвертация: $relativePath -> {$relativePath}.sog + .collision.glb");
}

cli_out("Запущено новых конвертаций: $spawned");
