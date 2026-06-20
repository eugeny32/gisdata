<?php
declare(strict_types=1);
require __DIR__ . '/../app/lib/auth.php';
require_login();

header('Content-Type: application/json; charset=utf-8');

$rows = db()->query(
    'SELECT s.id, s.name, s.host, s.port, s.mountpoint, s.lat, s.lon, s.comment,
            st.status, st.last_check_at, st.last_data_at, st.bytes_received, st.last_error
     FROM stations s
     LEFT JOIN station_status st ON st.station_id = s.id
     WHERE s.is_enabled = 1'
)->fetchAll();

foreach ($rows as &$row) {
    $row['lat'] = (float)$row['lat'];
    $row['lon'] = (float)$row['lon'];
    $row['status'] = $row['status'] ?? 'unknown';
}

echo json_encode(['stations' => $rows], JSON_UNESCAPED_UNICODE);
