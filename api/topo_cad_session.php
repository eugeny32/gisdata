<?php
declare(strict_types=1);
require __DIR__ . '/../app/lib/auth.php';

header('Content-Type: application/json; charset=utf-8');

/**
 * Серверное сохранение рабочего состояния TOPO·CAD — зеркало
 * api/facade_cad_session.php (см. его докстринг), работает с
 * topo_cad_sessions/topo_cad_entities (sql/schema.sql). Тот же EntityJSON-
 * контракт, что у FACADE·CAD (общий движок, facade-cad/topo-cad/), поэтому
 * entity_to_geom_sql/row_to_entity ниже — буквально те же функции, просто
 * не могут переиспользовать оригинал из-за PHP-конфликта имён функций
 * между независимо подключаемыми файлами.
 *
 * Доступ: админам всегда; обычным пользователям — только с
 * users_sync.topo_cad_enabled=1 (отдельный от facade_cad_enabled флаг —
 * разные услуги).
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
    $chk = $pdo->prepare('SELECT topo_cad_enabled FROM users_sync WHERE id = :id');
    $chk->execute(['id' => $user['id']]);
    if (!(int)$chk->fetchColumn()) {
        http_response_code(403);
        echo json_encode(['error' => 'topo_cad not enabled for this account']);
        exit;
    }
}
$ownerCol = $admin ? 'admin_id' : 'user_id';
$ownerId = $admin ? $admin['id'] : $user['id'];

function topo_wkt_num(mixed $v): string
{
    if (!is_numeric($v)) throw new InvalidArgumentException('non-numeric coordinate');
    $f = (float)$v;
    if (!is_finite($f)) throw new InvalidArgumentException('non-finite coordinate');
    return sprintf('%.9F', $f);
}

/** EntityJSON (facade-cad/src/Entities.ts, общий движок с TOPO·CAD) -> [wkt, extra]. */
function topo_entity_to_geom_sql(array $e): ?array
{
    $k = $e['k'] ?? null;
    switch ($k) {
        case 'pl':
            $pts = $e['pts'] ?? [];
            if (count($pts) < 4 || count($pts) % 2 !== 0) return null;
            $parts = [];
            for ($i = 0; $i < count($pts); $i += 2) {
                $parts[] = topo_wkt_num($pts[$i]) . ' ' . topo_wkt_num($pts[$i + 1]);
            }
            return ['LINESTRING(' . implode(',', $parts) . ')', ['closed' => (bool)($e['closed'] ?? false)]];
        case 'ci':
            return ['POINT(' . topo_wkt_num($e['c'][0]) . ' ' . topo_wkt_num($e['c'][1]) . ')', ['r' => $e['r'] ?? 0]];
        case 'ar':
            return ['POINT(' . topo_wkt_num($e['c'][0]) . ' ' . topo_wkt_num($e['c'][1]) . ')', ['r' => $e['r'] ?? 0, 'a0' => $e['a0'] ?? 0, 'sw' => $e['sw'] ?? 0]];
        case 'el':
            return ['POINT(' . topo_wkt_num($e['c'][0]) . ' ' . topo_wkt_num($e['c'][1]) . ')', ['rx' => $e['rx'] ?? 0, 'ry' => $e['ry'] ?? 0, 'rot' => $e['rot'] ?? 0]];
        case 'tx':
            return ['POINT(' . topo_wkt_num($e['a'][0]) . ' ' . topo_wkt_num($e['a'][1]) . ')', ['t' => $e['t'] ?? '', 'h' => $e['h'] ?? 0, 'rot' => $e['rot'] ?? 0]];
        case 'pt':
            return ['POINT(' . topo_wkt_num($e['a'][0]) . ' ' . topo_wkt_num($e['a'][1]) . ')', ['lbl' => $e['lbl'] ?? null, 'dev' => $e['dev'] ?? null]];
        default:
            return null;
    }
}

function topo_row_to_entity(array $row): ?array
{
    $geo = json_decode($row['geojson'], true);
    $extra = json_decode($row['extra'], true) ?: [];
    $coords = $geo['coordinates'] ?? null;
    if ($coords === null) return null;
    $l = $row['layer'];
    switch ($row['kind']) {
        case 'pl':
            $pts = [];
            foreach ($coords as $pt) { $pts[] = $pt[0]; $pts[] = $pt[1]; }
            return ['k' => 'pl', 'pts' => $pts, 'closed' => (bool)($extra['closed'] ?? false), 'l' => $l];
        case 'ci':
            return ['k' => 'ci', 'c' => $coords, 'r' => $extra['r'] ?? 0, 'l' => $l];
        case 'ar':
            return ['k' => 'ar', 'c' => $coords, 'r' => $extra['r'] ?? 0, 'a0' => $extra['a0'] ?? 0, 'sw' => $extra['sw'] ?? 0, 'l' => $l];
        case 'el':
            return ['k' => 'el', 'c' => $coords, 'rx' => $extra['rx'] ?? 0, 'ry' => $extra['ry'] ?? 0, 'rot' => $extra['rot'] ?? 0, 'l' => $l];
        case 'tx':
            return ['k' => 'tx', 'a' => $coords, 't' => $extra['t'] ?? '', 'h' => $extra['h'] ?? 0, 'rot' => $extra['rot'] ?? 0, 'l' => $l];
        case 'pt':
            $out = ['k' => 'pt', 'a' => $coords, 'l' => $l];
            if (isset($extra['lbl'])) $out['lbl'] = $extra['lbl'];
            if (isset($extra['dev'])) $out['dev'] = $extra['dev'];
            return $out;
        default:
            return null;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("SELECT id, cloud_name, layers_json, ucs_json FROM topo_cad_sessions WHERE $ownerCol = :id");
    $stmt->execute(['id' => $ownerId]);
    $session = $stmt->fetch();
    if (!$session) {
        echo json_encode(new stdClass());
        exit;
    }
    $entStmt = $pdo->prepare(
        'SELECT kind, layer, extra, ST_AsGeoJSON(geom) AS geojson
         FROM topo_cad_entities WHERE session_id = :sid ORDER BY id'
    );
    $entStmt->execute(['sid' => $session['id']]);
    $entities = [];
    foreach ($entStmt->fetchAll() as $row) {
        $e = topo_row_to_entity($row);
        if ($e) $entities[] = $e;
    }
    echo json_encode([
        'cloud_name' => $session['cloud_name'],
        'layers' => $session['layers_json'],
        'entities' => $entities,
        'ucs' => $session['ucs_json'],
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];

function topo_valid_json_or_default(mixed $v, string $default): string
{
    if (!is_string($v) || $v === '') {
        return $default;
    }
    json_decode($v);
    return json_last_error() === JSON_ERROR_NONE ? $v : $default;
}

$layersJson = topo_valid_json_or_default($input['layers'] ?? null, '{}');
$ucsJson = topo_valid_json_or_default($input['ucs'] ?? null, '{}');
$cloudName = isset($input['cloud_name']) ? trim((string)$input['cloud_name']) : null;
if ($cloudName === '') {
    $cloudName = null;
}
$entities = is_array($input['entities'] ?? null) ? $input['entities'] : [];

try {
    $pdo->beginTransaction();

    $onConflictCol = $admin ? 'admin_id' : 'user_id';
    $stmt = $pdo->prepare(
        "INSERT INTO topo_cad_sessions (admin_id, user_id, cloud_name, layers_json, ucs_json, updated_at)
         VALUES (:admin_id, :user_id, :cloud_name, :layers, :ucs, NOW())
         ON CONFLICT ($onConflictCol) WHERE $onConflictCol IS NOT NULL DO UPDATE SET
           cloud_name = COALESCE(EXCLUDED.cloud_name, topo_cad_sessions.cloud_name),
           layers_json = EXCLUDED.layers_json,
           ucs_json = EXCLUDED.ucs_json,
           updated_at = NOW()
         RETURNING id"
    );
    $stmt->execute([
        'admin_id' => $admin ? $ownerId : null,
        'user_id' => $admin ? null : $ownerId,
        'cloud_name' => $cloudName,
        'layers' => $layersJson,
        'ucs' => $ucsJson,
    ]);
    $sessionId = (int)$stmt->fetchColumn();

    $pdo->prepare('DELETE FROM topo_cad_entities WHERE session_id = :sid')->execute(['sid' => $sessionId]);

    $insEnt = $pdo->prepare(
        "INSERT INTO topo_cad_entities (session_id, kind, layer, geom, extra)
         VALUES (:sid, :kind, :layer, ST_GeomFromText(:wkt), :extra)"
    );
    foreach ($entities as $e) {
        if (!is_array($e)) continue;
        try {
            $geomSql = topo_entity_to_geom_sql($e);
        } catch (InvalidArgumentException) {
            continue; // one malformed entity shouldn't lose the rest of the drawing
        }
        if (!$geomSql) continue;
        [$wkt, $extra] = $geomSql;
        $insEnt->execute([
            'sid' => $sessionId,
            'kind' => $e['k'],
            'layer' => (string)($e['l'] ?? '0'),
            'wkt' => $wkt,
            'extra' => json_encode($extra, JSON_UNESCAPED_UNICODE),
        ]);
    }

    $pdo->commit();
    echo json_encode(['ok' => true, 'entities' => count($entities)]);
} catch (Throwable $ex) {
    $pdo->rollBack();
    http_response_code(400);
    echo json_encode(['error' => $ex->getMessage()], JSON_UNESCAPED_UNICODE);
}
