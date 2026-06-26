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

// Статус COPC-конвертации определяется наличием файла на диске (без
// отдельной таблицы — см. bin/process_copc_conversions.php). null, если
// конвертация ещё не запускалась/не завершилась — тогда вьювер использует
// прежний полный LAS-загрузчик (см. docs/CURRENT_STATE.md, PR4).
function tour_copc_url(string $filePath, string $uploadDir): ?string
{
    if (!is_file($uploadDir . $filePath . '.copc.laz')) {
        return null;
    }
    return tour_file_url($filePath . '.copc.laz');
}

$uploadDir = realpath(__DIR__ . '/../uploads/tours') . '/';

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

    $filePaths = [$row['file_path']];
    $extraStmt->execute(['id' => $row['id']]);
    foreach ($extraStmt->fetchAll(PDO::FETCH_COLUMN) as $extraPath) {
        $filePaths[] = $extraPath;
    }

    $row['file_url'] = tour_file_url($filePaths[0]); // обратная совместимость с однофайловыми турами
    $row['file_urls'] = array_map('tour_file_url', $filePaths); // все файлы тура
    // copc_urls — параллельный массив той же длины, что file_urls; элемент
    // null, если для этого файла ещё нет готового COPC (актуально только
    // для model_type === 'pointcloud', для сплатов всегда null).
    $row['copc_urls'] = array_map(
        fn($p) => tour_copc_url($p, $uploadDir),
        $filePaths
    );
    // model_type — чтобы map.php знал, какой рендер-пайплайн использовать
    // ДО начала загрузки: 'las' — облако точек (свой PlayCanvas-пайплайн,
    // см. viewer/), иначе — 3DGS-сплат.
    $row['model_type'] = $row['file_format'] === 'las' ? 'pointcloud' : 'splat';
    unset($row['file_path']);
}

echo json_encode(['tours' => $rows], JSON_UNESCAPED_UNICODE);
