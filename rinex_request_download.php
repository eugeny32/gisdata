<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
require_login();

$admin = current_admin();
$id = (int)($_GET['id'] ?? 0);

$stmt = db()->prepare('SELECT result_path FROM rinex_requests WHERE id = :id AND created_by = :uid AND status = \'done\'');
$stmt->execute(['id' => $id, 'uid' => $admin['id'] ?? 0]);
$relPath = $stmt->fetchColumn();

if (!$relPath) {
    http_response_code(404);
    exit('Запрос не найден или ещё не готов');
}

$fullPath = __DIR__ . '/uploads/rinex_results/' . $relPath;
if (!is_file($fullPath)) {
    http_response_code(404);
    exit('Файл результата не найден на сервере');
}

header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="rinex_request_' . $id . '.zip"');
header('Content-Length: ' . filesize($fullPath));
readfile($fullPath);
