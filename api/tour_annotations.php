<?php
declare(strict_types=1);
require __DIR__ . '/../app/lib/auth.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = db();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Просмотр слоёв/аннотаций доступен любому залогиненному пользователю.
    require_login();
    $tourId = (int)($_GET['tour_id'] ?? 0);

    $layersStmt = $pdo->prepare('SELECT id, name, color, is_visible, sort_order FROM tour_layers WHERE tour_id = :tour_id ORDER BY sort_order, id');
    $layersStmt->execute(['tour_id' => $tourId]);
    $layers = $layersStmt->fetchAll();

    $annoStmt = $pdo->prepare('SELECT id, layer_id, geom_type, coordinates, label FROM tour_annotations WHERE layer_id = :layer_id ORDER BY id');
    foreach ($layers as &$layer) {
        $layer['is_visible'] = (bool)$layer['is_visible'];
        $annoStmt->execute(['layer_id' => $layer['id']]);
        $annotations = $annoStmt->fetchAll();
        foreach ($annotations as &$a) {
            $a['coordinates'] = json_decode($a['coordinates'], true);
        }
        $layer['annotations'] = $annotations;
    }

    echo json_encode(['layers' => $layers], JSON_UNESCAPED_UNICODE);
    exit;
}

// Все изменяющие действия — только администратор (как остальное управление турами).
$admin = require_admin_role('admin');

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$action = (string)($input['action'] ?? '');

try {
    if ($action === 'create_layer') {
        $tourId = (int)($input['tour_id'] ?? 0);
        $name = trim((string)($input['name'] ?? ''));
        $color = (string)($input['color'] ?? '#ff3b30');
        if ($tourId <= 0 || $name === '') {
            throw new InvalidArgumentException('Укажите тур и название слоя');
        }
        $stmt = $pdo->prepare(
            'INSERT INTO tour_layers (tour_id, name, color, sort_order)
             VALUES (:tour_id, :name, :color, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM tour_layers WHERE tour_id = :tour_id2))
             RETURNING id'
        );
        $stmt->execute(['tour_id' => $tourId, 'name' => $name, 'color' => $color, 'tour_id2' => $tourId]);
        echo json_encode(['id' => (int)$stmt->fetchColumn()], JSON_UNESCAPED_UNICODE);
    } elseif ($action === 'toggle_layer') {
        $id = (int)($input['id'] ?? 0);
        $pdo->prepare('UPDATE tour_layers SET is_visible = 1 - is_visible WHERE id = :id')->execute(['id' => $id]);
        echo json_encode(['ok' => true]);
    } elseif ($action === 'delete_layer') {
        $id = (int)($input['id'] ?? 0);
        $pdo->prepare('DELETE FROM tour_layers WHERE id = :id')->execute(['id' => $id]); // аннотации удалятся каскадом
        echo json_encode(['ok' => true]);
    } elseif ($action === 'save_annotation') {
        $layerId = (int)($input['layer_id'] ?? 0);
        $geomType = (string)($input['geom_type'] ?? '');
        $coordinates = $input['coordinates'] ?? null;
        $label = trim((string)($input['label'] ?? ''));
        if ($layerId <= 0 || !in_array($geomType, ['point', 'polyline', 'polygon'], true) || !is_array($coordinates) || !$coordinates) {
            throw new InvalidArgumentException('Некорректные данные аннотации');
        }
        $stmt = $pdo->prepare(
            'INSERT INTO tour_annotations (layer_id, geom_type, coordinates, label)
             VALUES (:layer_id, :geom_type, :coordinates, :label)
             RETURNING id'
        );
        $stmt->execute([
            'layer_id' => $layerId,
            'geom_type' => $geomType,
            'coordinates' => json_encode($coordinates),
            'label' => $label ?: null,
        ]);
        echo json_encode(['id' => (int)$stmt->fetchColumn()], JSON_UNESCAPED_UNICODE);
    } elseif ($action === 'delete_annotation') {
        $id = (int)($input['id'] ?? 0);
        $pdo->prepare('DELETE FROM tour_annotations WHERE id = :id')->execute(['id' => $id]);
        echo json_encode(['ok' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Неизвестное действие']);
    }
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
