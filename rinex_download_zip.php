<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
require __DIR__ . '/app/lib/gnss_ftp.php';
require_login();

const RINEX_ZIP_MAX_FILES = 3000;

$paths = array_values(array_filter((array)($_POST['files'] ?? [])));
if (!$paths) {
    http_response_code(400);
    exit('Не выбрано ни одного файла');
}
if (count($paths) > RINEX_ZIP_MAX_FILES) {
    http_response_code(400);
    exit('Слишком много файлов за один раз (максимум ' . RINEX_ZIP_MAX_FILES . ')');
}

// Пути приходят от клиента (значения чекбоксов) — без строгой проверки
// формата это была бы дыра вида "достань с FTP что угодно по произвольному
// пути". Формат всегда "{день_года}({ММДД})/{СТАНЦИЯ}/{имя_файла}" —
// см. gnss_day_folder()/gnss_ftp_list_files() — никаких "..", "/" внутри
// компонентов и т.п.
$validPattern = '#^\d{3}\([0-9]{4}\)/[A-Za-z0-9_]+/[A-Za-z0-9_.\-]+$#';
foreach ($paths as $p) {
    if (!preg_match($validPattern, $p)) {
        http_response_code(400);
        exit('Недопустимый путь файла');
    }
}

set_time_limit(0); // скачивание+упаковка десятков-сотен файлов может занять больше стандартных 120с

$conn = gnss_ftp_connect();
if ($conn === false) {
    http_response_code(502);
    exit('Не удалось подключиться к FTP-серверу GNSS-данных');
}

$tmpDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'rinex_zip_' . uniqid('', true);
mkdir($tmpDir, 0700, true);
$zipPath = $tmpDir . DIRECTORY_SEPARATOR . 'rinex.zip';

$zip = new ZipArchive();
$zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);

$failed = [];
foreach ($paths as $i => $remotePath) {
    // Имя внутри архива — плоское "СТАНЦИЯ_имя_файла.rnx", а не повторение
    // вложенной структуры папок дня — пользователю удобнее единый список
    // файлов в архиве, чем дерево из десятков папок по одному файлу.
    $parts = explode('/', $remotePath);
    $station = $parts[1] ?? 'file';
    $fileName = $parts[2] ?? ('file_' . $i);
    $localTmp = $tmpDir . DIRECTORY_SEPARATOR . 'dl_' . $i;
    if (@ftp_get($conn, $localTmp, '/' . $remotePath, FTP_BINARY)) {
        $zip->addFile($localTmp, $station . '_' . $fileName);
    } else {
        $failed[] = $remotePath;
    }
}
ftp_close($conn);
$zip->close();

// Файлы dl_* физически нужны были только до zip->close() (ZipArchive в
// PHP читает их лениво при close(), не сразу при addFile()) — теперь можно
// убрать всё, кроме готового архива.
foreach (glob($tmpDir . DIRECTORY_SEPARATOR . 'dl_*') as $f) {
    @unlink($f);
}

if (!is_file($zipPath) || filesize($zipPath) === 0) {
    @rmdir($tmpDir);
    http_response_code(502);
    exit('Не удалось собрать архив — ни один файл не скачался с FTP');
}

header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="rinex_' . date('Ymd_His') . '.zip"');
header('Content-Length: ' . filesize($zipPath));
readfile($zipPath);

@unlink($zipPath);
@rmdir($tmpDir);
