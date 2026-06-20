<?php
declare(strict_types=1);
require __DIR__ . '/../app/lib/auth.php';
require_login();

header('Content-Type: application/json; charset=utf-8');

$rows = db()->query(
    'SELECT id, name, description, lat, lon, file_path, file_format
     FROM tours
     WHERE is_enabled = 1'
)->fetchAll();

foreach ($rows as &$row) {
    $row['lat'] = (float)$row['lat'];
    $row['lon'] = (float)$row['lon'];
    $encodedPath = implode('/', array_map('rawurlencode', explode('/', $row['file_path'])));
    $row['file_url'] = '/uploads/tours/' . $encodedPath;
    unset($row['file_path']);
}

echo json_encode(['tours' => $rows], JSON_UNESCAPED_UNICODE);
