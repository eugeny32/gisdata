<?php
declare(strict_types=1);

/**
 * Опрос всех включённых базовых станций как NTRIP-клиент: подключаемся к
 * host:port, отправляем GET /mountpoint (NTRIP v1 handshake), и проверяем,
 * что в течение read_timeout_sec реально пришли байты потока. Это надёжнее,
 * чем просто открытый TCP-порт — каста может слушать порт, но не отдавать
 * данные по конкретной точке монтирования.
 *
 * Запускать по расписанию (Планировщик заданий Windows), например раз в минуту:
 *   php C:\path\to\bin\poll_stations.php
 */

require __DIR__ . '/../app/lib/db.php';
require __DIR__ . '/../app/lib/cli.php';
require_cli_or_token();

function log_line(string $msg): void
{
    cli_out('[' . date('Y-m-d H:i:s') . '] ' . $msg);
}

function check_ntrip_station(array $station, array $ntripCfg): array
{
    $host = $station['host'];
    $port = (int)$station['port'];
    $mount = $station['mountpoint'];

    $errno = 0;
    $errstr = '';
    $sock = @stream_socket_client(
        "tcp://$host:$port",
        $errno,
        $errstr,
        (float)$ntripCfg['connect_timeout_sec']
    );

    if ($sock === false) {
        return ['status' => 'offline', 'bytes' => 0, 'error' => "Connect failed: $errstr"];
    }

    stream_set_timeout($sock, (int)$ntripCfg['read_timeout_sec']);

    $authHeader = '';
    if (!empty($station['ntrip_user'])) {
        $authHeader = 'Authorization: Basic ' . base64_encode($station['ntrip_user'] . ':' . ($station['ntrip_password'] ?? '')) . "\r\n";
    }

    $request = "GET /{$mount} HTTP/1.1\r\n" .
        "Host: {$host}\r\n" .
        "User-Agent: {$ntripCfg['user_agent']}\r\n" .
        "Ntrip-Version: Ntrip/2.0\r\n" .
        $authHeader .
        "Connection: close\r\n\r\n";

    fwrite($sock, $request);

    $bytes = 0;
    $deadline = microtime(true) + (float)$ntripCfg['read_timeout_sec'];
    $headerSeen = false;
    while (!feof($sock) && microtime(true) < $deadline) {
        $chunk = fread($sock, 4096);
        if ($chunk === false || $chunk === '') {
            $meta = stream_get_meta_data($sock);
            if ($meta['timed_out']) {
                break;
            }
            continue;
        }
        $bytes += strlen($chunk);
        if (!$headerSeen && (str_contains($chunk, 'SOURCETABLE') || str_contains($chunk, '401') || str_contains($chunk, 'ERROR'))) {
            fclose($sock);
            return ['status' => 'offline', 'bytes' => $bytes, 'error' => 'Mountpoint недоступен или нужна авторизация'];
        }
        $headerSeen = true;
        if ($bytes >= (int)$ntripCfg['min_bytes_online']) {
            break;
        }
    }

    fclose($sock);

    if ($bytes >= (int)$ntripCfg['min_bytes_online']) {
        return ['status' => 'online', 'bytes' => $bytes, 'error' => null];
    }
    return ['status' => 'offline', 'bytes' => $bytes, 'error' => 'Поток пуст или слишком короткий'];
}

$cfg = app_config();
$pdo = db();

$stations = $pdo->query('SELECT * FROM stations WHERE is_enabled = 1')->fetchAll();

$updateStatus = $pdo->prepare(
    'INSERT INTO station_status (station_id, status, last_check_at, last_data_at, bytes_received, last_error)
     VALUES (:id, :status, NOW(), :last_data_at, :bytes, :error)
     ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        last_check_at = VALUES(last_check_at),
        last_data_at = VALUES(last_data_at),
        bytes_received = VALUES(bytes_received),
        last_error = VALUES(last_error)'
);
$insertLog = $pdo->prepare(
    'INSERT INTO station_log (station_id, status, bytes_received, error_message) VALUES (:id, :status, :bytes, :error)'
);

foreach ($stations as $station) {
    $result = check_ntrip_station($station, $cfg['ntrip']);
    $lastDataAt = $result['status'] === 'online' ? date('Y-m-d H:i:s') : null;

    $updateStatus->execute([
        'id' => $station['id'],
        'status' => $result['status'],
        'last_data_at' => $lastDataAt,
        'bytes' => $result['bytes'],
        'error' => $result['error'],
    ]);
    $insertLog->execute([
        'id' => $station['id'],
        'status' => $result['status'],
        'bytes' => $result['bytes'],
        'error' => $result['error'],
    ]);

    log_line(sprintf('%s: %s (%d байт)%s', $station['name'], $result['status'], $result['bytes'],
        $result['error'] ? ' — ' . $result['error'] : ''));
}

log_line('Проверено станций: ' . count($stations));
