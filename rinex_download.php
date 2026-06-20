<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
require_login();

$basePath = rtrim(app_config()['rinex']['base_path'], '\\/');
$basePathReal = realpath($basePath);

$rel = (string)($_GET['path'] ?? '');
$rel = str_replace('\\', '/', trim($rel, '/'));

if ($basePathReal === false || $rel === '') {
    http_response_code(404);
    exit('Файл не найден');
}

$targetPath = $basePathReal . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $rel);
$targetReal = realpath($targetPath);

if ($targetReal === false
    || strncmp($targetReal, $basePathReal, strlen($basePathReal)) !== 0
    || !is_file($targetReal)
) {
    http_response_code(404);
    exit('Файл не найден');
}

header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . basename($targetReal) . '"');
header('Content-Length: ' . filesize($targetReal));
readfile($targetReal);
