<?php
declare(strict_types=1);
require __DIR__ . '/../app/lib/auth.php';

header('Content-Type: application/json; charset=utf-8');

/**
 * Серверное сохранение сессии FACADE·FOTO (см. sql/schema.sql::
 * facade_foto_sessions) — тот же набор полей, что инструмент раньше только
 * скачивал как facade_session.json (points/k1/k2/mmPerPx/target/source),
 * просто автосохраняется в Postgres как JSONB вместо ручного
 * "Сохранить"/"Открыть" файла. Изображения (чертёж/фото) НЕ сохраняются —
 * инструмент их вообще никуда не отправляет (File API, локально в
 * браузере) — сессия хранит только контрольные точки и параметры, имена
 * файлов нужны исключительно как подсказка при следующем открытии.
 *
 * Доступ: админам всегда; обычным пользователям (users_sync) — только с
 * facade_foto_enabled=1, перепроверяется на каждый запрос.
 * Одна сессия на владельца (MVP, как у facade_cad/topo_cad).
 *
 * GET  -> JSONB как есть, {} если сессии ещё нет.
 * POST -> upsert, payload — целиком новый снимок session_json.
 */
$pdo = db();
$admin = current_admin();
$user = current_user();
if (!$admin && !$user) {
    http_response_code(401);
    echo json_encode(['error' => 'login required']);
    exit;
}
if (!$admin) {
    $chk = $pdo->prepare('SELECT facade_foto_enabled FROM users_sync WHERE id = :id');
    $chk->execute(['id' => $user['id']]);
    if (!(int)$chk->fetchColumn()) {
        http_response_code(403);
        echo json_encode(['error' => 'facade_foto not enabled for this account']);
        exit;
    }
}
$ownerCol = $admin ? 'admin_id' : 'user_id';
$ownerId = $admin ? $admin['id'] : $user['id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("SELECT session_json FROM facade_foto_sessions WHERE $ownerCol = :id");
    $stmt->execute(['id' => $ownerId]);
    $row = $stmt->fetch();
    echo $row ? $row['session_json'] : '{}';
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
json_decode($raw, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid JSON']);
    exit;
}

$onConflictCol = $admin ? 'admin_id' : 'user_id';
$stmt = $pdo->prepare(
    "INSERT INTO facade_foto_sessions (admin_id, user_id, session_json, updated_at)
     VALUES (:admin_id, :user_id, :json, NOW())
     ON CONFLICT ($onConflictCol) WHERE $onConflictCol IS NOT NULL DO UPDATE SET
       session_json = EXCLUDED.session_json,
       updated_at = NOW()"
);
$stmt->execute([
    'admin_id' => $admin ? $ownerId : null,
    'user_id' => $admin ? null : $ownerId,
    'json' => $raw,
]);
echo json_encode(['ok' => true]);
