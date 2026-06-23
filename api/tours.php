<?php
declare(strict_types=1);
require __DIR__ . '/../app/lib/auth.php';
require_login();

header('Content-Type: application/json; charset=utf-8');

function tour_file_url(string $filePath): string
{
    $encoded = implode('/', array_map('rawurlencode', explode('/', $filePath)));
    return '/uploads/tours/' . $encoded;
}

$pdo = db();
$rows = $pdo->query(
    'SELECT id, name, description, lat, lon, file_path, file_format
     FROM tours
     WHERE is_enabled = 1'
)->fetchAll();

$extraStmt = $pdo->prepare('SELECT file_path FROM tour_files WHERE tour_id = :id ORDER BY sort_order');

foreach ($rows as &$row) {
    $row['lat'] = (float)$row['lat'];
    $row['lon'] = (float)$row['lon'];

    $fileUrls = [tour_file_url($row['file_path'])];
    $extraStmt->execute(['id' => $row['id']]);
    foreach ($extraStmt->fetchAll(PDO::FETCH_COLUMN) as $extraPath) {
        $fileUrls[] = tour_file_url($extraPath);
    }

    $row['file_url'] = $fileUrls[0]; // обратная совместимость с однофайловыми турами
    $row['file_urls'] = $fileUrls;   // все файлы тура (для addSplatScenes в map.php)
    // model_type — чтобы map.php знал, какой рендер-пайплайн использовать
    // ДО начала загрузки: 'las' — облако точек (просмотр пока не реализован),
    // иначе — 3DGS-сплат (GaussianSplats3D).
    $row['model_type'] = $row['file_format'] === 'las' ? 'pointcloud' : 'splat';
    unset($row['file_path']);
}

echo json_encode(['tours' => $rows], JSON_UNESCAPED_UNICODE);
