<?php

declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
require __DIR__ . '/app/lib/tour_files.php';
require_login();

/**
 * Упрощённая загрузка тура самим пользователем (любая роль — admin/viewer/
 * обычный пользователь mdb) — отдельно от tours.php (там
 * require_admin_role('admin'), полноценное управление: группы, файлы уже
 * залитые по FTP, без ограничения размера кроме лимитов хостинга). Здесь —
 * минимум полей и обязательный лимит суммарного размера файлов (2 ГБ),
 * чтобы рядовые пользователи не могли случайно/намеренно залить через
 * браузер модель той же гигантской величины, что админы заливают по FTP.
 *
 * Контракт ответа — тот же, что у tours.php (см. quickAddForm в map.php):
 * при ошибке — текст, содержащий ровно один <div class="alert
 * alert-danger">...</div>; при успехе — что угодно без этой строки.
 */

const TOUR_USER_UPLOAD_MAX_BYTES = 2 * 1024 * 1024 * 1024; // 2 ГБ

function tour_user_upload_fail(string $message): void
{
    http_response_code(400);
    echo '<div class="alert alert-danger">' . htmlspecialchars($message, ENT_QUOTES, 'UTF-8') . '</div>';
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /map.php');
    exit;
}

$pdo = db();
$uploadDir = __DIR__ . '/uploads/tours/user/';
$allowedExt = ['ply', 'splat', 'ksplat', 'las'];

$name = trim((string)($_POST['name'] ?? ''));
$description = trim((string)($_POST['description'] ?? ''));
$lat = (float)($_POST['lat'] ?? 0);
$lon = (float)($_POST['lon'] ?? 0);

if ($name === '') {
    tour_user_upload_fail('Укажите название');
}
if ($lat === 0.0 && $lon === 0.0) {
    tour_user_upload_fail('Не указаны координаты — кликните правой кнопкой по карте, чтобы выбрать точку');
}

$uploadedNames = $_FILES['model_files']['name'] ?? [];
$hasUpload = is_array($uploadedNames) && array_filter($uploadedNames);
if (!$hasUpload) {
    tour_user_upload_fail('Загрузите хотя бы один файл модели (.ply / .splat / .ksplat / .las)');
}

// Суммарный размер — ПЕРЕД move_uploaded_file, чтобы не писать на диск файлы,
// которые всё равно придётся удалить при превышении лимита.
$totalSize = 0;
foreach ($_FILES['model_files']['size'] as $i => $size) {
    if (($uploadedNames[$i] ?? '') === '') {
        continue;
    }
    $totalSize += (int)$size;
}
if ($totalSize > TOUR_USER_UPLOAD_MAX_BYTES) {
    tour_user_upload_fail(sprintf(
        'Суммарный размер файлов (%.2f ГБ) превышает лимит 2 ГБ для пользовательской загрузки',
        $totalSize / (1024 * 1024 * 1024)
    ));
}

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$newFiles = []; // [['file_path' => ..., 'file_format' => ...], ...]
foreach ($uploadedNames as $i => $origName) {
    if ($origName === '') {
        continue;
    }
    $ext = strtolower(pathinfo((string)$origName, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExt, true)) {
        tour_user_upload_fail('Недопустимый формат файла "' . $origName . '". Разрешено: ' . implode(', ', $allowedExt));
    }
    if ($_FILES['model_files']['error'][$i] !== UPLOAD_ERR_OK) {
        tour_user_upload_fail('Ошибка загрузки файла "' . $origName . '" (код ' . $_FILES['model_files']['error'][$i] . ')');
    }
    $storedName = uniqid('user_', true) . '_' . preg_replace('/[^a-zA-Z0-9_.-]/', '_', (string)$origName);
    if (!move_uploaded_file($_FILES['model_files']['tmp_name'][$i], $uploadDir . $storedName)) {
        tour_user_upload_fail('Не удалось сохранить загруженный файл "' . $origName . '" на сервере');
    }
    $newFiles[] = ['file_path' => 'user/' . $storedName, 'file_format' => $ext];
}

foreach ($newFiles as $f) {
    if ($f['file_format'] === 'ply') {
        denoise_splat_ply_if_possible(__DIR__ . '/uploads/tours/' . $f['file_path']);
        strip_unsupported_ply_header_lines(__DIR__ . '/uploads/tours/' . $f['file_path']);
    }
}

$filePath = $newFiles[0]['file_path'];
$fileFormat = $newFiles[0]['file_format'];
$extraFiles = array_slice($newFiles, 1);

// created_by — только для аккаунтов из таблицы admins (включая viewer);
// у обычных пользователей mdb (current_user(), таблица users_sync) нет
// совместимого id — оставляем NULL (колонка для этого и nullable).
$admin = current_admin();

$stmt = $pdo->prepare(
    'INSERT INTO tours (name, description, lat, lon, file_path, file_format, is_enabled, created_by)
     VALUES (:name, :description, :lat, :lon, :file_path, :file_format, 1, :created_by)
     RETURNING id'
);
$stmt->execute([
    'name' => $name,
    'description' => $description ?: null,
    'lat' => $lat,
    'lon' => $lon,
    'file_path' => $filePath,
    'file_format' => $fileFormat,
    'created_by' => $admin['id'] ?? null,
]);
$tourId = (int)$stmt->fetchColumn();

if ($extraFiles) {
    $insertExtra = $pdo->prepare(
        'INSERT INTO tour_files (tour_id, file_path, file_format, sort_order) VALUES (:tour_id, :file_path, :file_format, :sort_order)'
    );
    foreach ($extraFiles as $i => $f) {
        $insertExtra->execute([
            'tour_id' => $tourId,
            'file_path' => $f['file_path'],
            'file_format' => $f['file_format'],
            'sort_order' => $i,
        ]);
    }
}

echo 'OK';
