<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
require_login();

$pdo = db();
$tourId = (int)($_GET['tour_id'] ?? 0);

$tourStmt = $pdo->prepare('SELECT name FROM tours WHERE id = :id');
$tourStmt->execute(['id' => $tourId]);
$tour = $tourStmt->fetch();
if (!$tour) {
    http_response_code(404);
    exit('Тур не найден');
}

$layersStmt = $pdo->prepare('SELECT id, name, color FROM tour_layers WHERE tour_id = :tour_id ORDER BY sort_order, id');
$layersStmt->execute(['tour_id' => $tourId]);
$layers = $layersStmt->fetchAll();

$annoStmt = $pdo->prepare('SELECT geom_type, coordinates, label FROM tour_annotations WHERE layer_id = :layer_id ORDER BY id');

/** HEX-цвет → 24-битный true color для DXF (группа 420). */
function dxf_true_color(string $hex): int
{
    $hex = ltrim($hex, '#');
    if (strlen($hex) !== 6) {
        return 0xFFFFFF;
    }
    return (int)hexdec($hex);
}

$dxf = [];
$dxf[] = '0';
$dxf[] = 'SECTION';
$dxf[] = '2';
$dxf[] = 'TABLES';
$dxf[] = '0';
$dxf[] = 'TABLE';
$dxf[] = '2';
$dxf[] = 'LAYER';
foreach ($layers as $layer) {
    $dxf[] = '0';
    $dxf[] = 'LAYER';
    $dxf[] = '2';
    $dxf[] = $layer['name'] !== '' ? $layer['name'] : ('Layer' . $layer['id']);
    $dxf[] = '62';
    $dxf[] = '7'; // ACI-цвет (белый) — для viewer'ов без поддержки true color
    $dxf[] = '420';
    $dxf[] = (string)dxf_true_color($layer['color']);
    $dxf[] = '70';
    $dxf[] = '0';
}
$dxf[] = '0';
$dxf[] = 'ENDTAB';
$dxf[] = '0';
$dxf[] = 'ENDSEC';

$dxf[] = '0';
$dxf[] = 'SECTION';
$dxf[] = '2';
$dxf[] = 'ENTITIES';

foreach ($layers as $layer) {
    $layerName = $layer['name'] !== '' ? $layer['name'] : ('Layer' . $layer['id']);
    $trueColor = dxf_true_color($layer['color']);

    $annoStmt->execute(['layer_id' => $layer['id']]);
    foreach ($annoStmt->fetchAll() as $anno) {
        $points = json_decode($anno['coordinates'], true);
        if (!is_array($points) || !$points) {
            continue;
        }

        if ($anno['geom_type'] === 'point') {
            $p = $points[0];
            $dxf[] = '0';
            $dxf[] = 'POINT';
            $dxf[] = '8';
            $dxf[] = $layerName;
            $dxf[] = '420';
            $dxf[] = (string)$trueColor;
            $dxf[] = '10';
            $dxf[] = (string)$p[0];
            $dxf[] = '20';
            $dxf[] = (string)$p[1];
            $dxf[] = '30';
            $dxf[] = (string)($p[2] ?? 0);
        } else {
            // polyline/polygon — POLYLINE (3D) с вершинами VERTEX, замыкаем для polygon.
            $dxf[] = '0';
            $dxf[] = 'POLYLINE';
            $dxf[] = '8';
            $dxf[] = $layerName;
            $dxf[] = '420';
            $dxf[] = (string)$trueColor;
            $dxf[] = '66';
            $dxf[] = '1'; // флаг "есть вершины следом"
            $dxf[] = '70';
            $dxf[] = $anno['geom_type'] === 'polygon' ? '9' : '8'; // 8=3D polyline, +1 (closed) для полигона

            foreach ($points as $p) {
                $dxf[] = '0';
                $dxf[] = 'VERTEX';
                $dxf[] = '8';
                $dxf[] = $layerName;
                $dxf[] = '10';
                $dxf[] = (string)$p[0];
                $dxf[] = '20';
                $dxf[] = (string)$p[1];
                $dxf[] = '30';
                $dxf[] = (string)($p[2] ?? 0);
            }
            $dxf[] = '0';
            $dxf[] = 'SEQEND';
        }
    }
}

$dxf[] = '0';
$dxf[] = 'ENDSEC';
$dxf[] = '0';
$dxf[] = 'EOF';

$fileName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $tour['name']) . '.dxf';

header('Content-Type: application/dxf');
header('Content-Disposition: attachment; filename="' . $fileName . '"');
echo implode("\n", $dxf) . "\n";
