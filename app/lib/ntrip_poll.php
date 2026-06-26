<?php

declare(strict_types=1);

/**
 * stream_socket_client() на Windows отдаёт текст системной ошибки соединения
 * в локальной кодировке ОС (обычно CP1251 на русской Windows), а не в UTF-8 —
 * запись такой строки "как есть" в Postgres (база в UTF8) роняет INSERT с
 * "Character not in repertoire". Поэтому любой текст ошибки, прежде чем
 * попасть в БД, прогоняем через эту функцию.
 */
function ntrip_safe_utf8(?string $s): ?string
{
    if ($s === null || $s === '' || mb_check_encoding($s, 'UTF-8')) {
        return $s;
    }
    $converted = @iconv('CP1251', 'UTF-8//IGNORE', $s);
    return $converted !== false ? $converted : mb_convert_encoding($s, 'UTF-8', 'Windows-1251');
}

/**
 * Опрос одной NTRIP-станции: подключаемся к host:port, отправляем GET
 * /mountpoint (NTRIP v1 handshake), проверяем, что в течение
 * read_timeout_sec реально пришли байты потока. Это надёжнее, чем просто
 * открытый TCP-порт — каста может слушать порт, но не отдавать данные по
 * конкретной точке монтирования.
 *
 * Общая для bin/poll_stations.php (по расписанию) и stations.php (кнопка
 * "Опросить сейчас" в кабинете) — чтобы не дублировать логику опроса.
 */
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
        return ['status' => 'offline', 'bytes' => 0, 'error' => ntrip_safe_utf8("Connect failed: $errstr")];
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
            // Реальный текст ответа кастера куда полезнее общей фразы для
            // диагностики — разные кастеры этим же 401/ERROR сигналят
            // разные проблемы (не только "нужен логин/пароль", встречается
            // и "ERROR - License expires" — истёкшая лицензия NTRIP-сервера
            // на стороне станции, например). WWW-Authenticate, если есть,
            // обычно содержит самую конкретную причину.
            $detail = '';
            foreach (preg_split('/\r\n/', $chunk) as $line) {
                if (stripos($line, 'WWW-Authenticate') === 0) {
                    $detail = trim($line);
                    break;
                }
            }
            if ($detail === '') {
                $detail = trim(strtok($chunk, "\r\n") ?: $chunk);
            }
            return [
                'status' => 'offline',
                'bytes' => $bytes,
                'error' => ntrip_safe_utf8('Mountpoint недоступен или нужна авторизация: ' . substr($detail, 0, 200)),
            ];
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

/**
 * Опрашивает переданный список станций и записывает результат в
 * station_status/station_log. Возвращает счётчики для отображения
 * пользователю ('online' => N, 'offline' => N).
 */
function poll_stations(PDO $pdo, array $stations, array $ntripCfg): array
{
    $updateStatus = $pdo->prepare(
        'INSERT INTO station_status (station_id, status, last_check_at, last_data_at, bytes_received, last_error)
         VALUES (:id, :status, NOW(), :last_data_at, :bytes, :error)
         ON CONFLICT (station_id) DO UPDATE SET
            status = EXCLUDED.status,
            last_check_at = EXCLUDED.last_check_at,
            last_data_at = EXCLUDED.last_data_at,
            bytes_received = EXCLUDED.bytes_received,
            last_error = EXCLUDED.last_error'
    );
    $insertLog = $pdo->prepare(
        'INSERT INTO station_log (station_id, status, bytes_received, error_message) VALUES (:id, :status, :bytes, :error)'
    );

    $counts = ['online' => 0, 'offline' => 0];
    foreach ($stations as $station) {
        $result = check_ntrip_station($station, $ntripCfg);
        // Один повторный опрос при первой неудаче — на практике некоторые
        // кастеры изредка отвечают 401/обрывом на ОДНУ попытку подряд
        // (например конкуренция подключений с тем же логином), хотя
        // станция реально работает — подтверждено вручную на станции ZRCH:
        // ручной повторный запрос с теми же сохранёнными логином/паролем
        // сразу получил 200 OK и поток данных. Полное отключение проверки
        // (offline) только после второй неудачи подряд снижает число
        // ложных срабатываний без риска замаскировать реально лежащую
        // станцию (та не оживёт и при второй попытке).
        if ($result['status'] !== 'online') {
            $result = check_ntrip_station($station, $ntripCfg);
        }
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

        $counts[$result['status']] = ($counts[$result['status']] ?? 0) + 1;
    }

    return $counts;
}
