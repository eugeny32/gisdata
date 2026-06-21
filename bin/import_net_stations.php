<?php
declare(strict_types=1);

/**
 * Импорт справочника базовых станций из E_Net20220422.mdb (таблица
 * NRS_NET_StationInfo_220402) в таблицу MySQL stations.
 *
 * В этой mdb (в отличие от E_Ser190905.mdb) реально хранится конфигурация
 * сети базовых станций: NTRIP-подключение (ClientIp/ClientPort/ClientMount/
 * ClientName/ClientPassword) и координаты в ECEF (X, Y, Z, метры). Несколько
 * станций могут отдаваться через один и тот же relay-mount (например, KOUR
 * раздаёт поток также для BSRT, PLSK, TOUR и др.) — это нормально для сети
 * с ретрансляцией, поэтому host+port+mountpoint НЕ делаем уникальным ключом,
 * вместо этого сопоставляем станции по external_id = mdb.ID.
 *
 * Запуск (разово или по расписанию, если конфигурация сети меняется редко):
 *   php bin\import_net_stations.php "C:\path\to\E_Net20220422.mdb"
 */

require __DIR__ . '/../app/lib/db.php';
require __DIR__ . '/../app/lib/cli.php';
require_cli_or_token();

function log_line(string $msg): void
{
    cli_out('[' . date('Y-m-d H:i:s') . '] ' . $msg);
}

/**
 * ECEF (X,Y,Z в метрах, WGS84) -> геодезические широта/долгота (градусы).
 * Итеративный метод Bowring, высота не используется в этом приложении.
 */
function ecef_to_lat_lon(float $x, float $y, float $z): array
{
    $a = 6378137.0;
    $f = 1 / 298.257223563;
    $e2 = $f * (2 - $f);

    $lon = atan2($y, $x);
    $p = sqrt($x * $x + $y * $y);
    $lat = atan2($z, $p * (1 - $e2));

    for ($i = 0; $i < 5; $i++) {
        $sinLat = sin($lat);
        $n = $a / sqrt(1 - $e2 * $sinLat * $sinLat);
        $lat = atan2($z + $e2 * $n * $sinLat, $p);
    }

    return [rad2deg($lat), rad2deg($lon)];
}

$mdbPath = cli_arg(1, 'mdb_path');
if (!$mdbPath) {
    cli_err('Использование: php bin\\import_net_stations.php "C:\\path\\to\\E_Net20220422.mdb" (или ?mdb_path=... через браузер)');
    exit(1);
}

$cfg = app_config();
$cfg['mdb']['path'] = $mdbPath; // импорт может идти из файла, отличного от config.php
if (!extension_loaded('pdo_odbc')) {
    cli_err('Расширение PHP pdo_odbc не подключено (php.ini: extension=pdo_odbc)');
    exit(1);
}
$dsn = sprintf('odbc:Driver={%s};Dbq=%s;Uid=Admin;Pwd=;', $cfg['mdb']['driver'], $mdbPath);
$source = new PDO($dsn, '', '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

$stmt = $source->query(
    'SELECT ID, StationName, StationID, StationComment, ClientIp, ClientPort, ClientName,
            ClientMount, ClientPassword, X, Y, Z, EStatus
     FROM NRS_NET_StationInfo_220402'
);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$pdo = db();
$upsert = $pdo->prepare(
    'INSERT INTO stations
        (external_id, station_code, name, host, port, mountpoint, ntrip_user, ntrip_password,
         lat, lon, ecef_x, ecef_y, ecef_z, comment, is_enabled)
     VALUES
        (:external_id, :station_code, :name, :host, :port, :mountpoint, :ntrip_user, :ntrip_password,
         :lat, :lon, :ecef_x, :ecef_y, :ecef_z, :comment, :is_enabled)
     ON CONFLICT (external_id) DO UPDATE SET
        station_code = EXCLUDED.station_code,
        name = EXCLUDED.name,
        host = EXCLUDED.host,
        port = EXCLUDED.port,
        mountpoint = EXCLUDED.mountpoint,
        ntrip_user = EXCLUDED.ntrip_user,
        ntrip_password = EXCLUDED.ntrip_password,
        lat = EXCLUDED.lat,
        lon = EXCLUDED.lon,
        ecef_x = EXCLUDED.ecef_x,
        ecef_y = EXCLUDED.ecef_y,
        ecef_z = EXCLUDED.ecef_z,
        comment = EXCLUDED.comment,
        is_enabled = EXCLUDED.is_enabled'
);

$pdo->beginTransaction();
$count = 0;
$skipped = 0;
foreach ($rows as $row) {
    $x = (float)$row['X'];
    $y = (float)$row['Y'];
    $z = (float)$row['Z'];

    if ($x === 0.0 && $y === 0.0 && $z === 0.0) {
        log_line('Пропущена станция без координат: ' . $row['StationName']);
        $skipped++;
        continue;
    }
    if (trim((string)$row['ClientIp']) === '') {
        log_line('Пропущена станция без NTRIP-подключения: ' . $row['StationName']);
        $skipped++;
        continue;
    }

    [$lat, $lon] = ecef_to_lat_lon($x, $y, $z);

    $upsert->execute([
        'external_id'    => (int)$row['ID'],
        'station_code'   => $row['StationID'] ?: null,
        'name'           => $row['StationName'],
        'host'           => $row['ClientIp'],
        'port'           => (int)$row['ClientPort'],
        'mountpoint'     => $row['ClientMount'],
        'ntrip_user'     => $row['ClientName'] ?: null,
        'ntrip_password' => $row['ClientPassword'] ?: null,
        'lat'            => round($lat, 7),
        'lon'            => round($lon, 7),
        'ecef_x'         => $x,
        'ecef_y'         => $y,
        'ecef_z'         => $z,
        'comment'        => $row['StationComment'] ?: null,
        'is_enabled'     => ((int)$row['EStatus']) === 1 ? 1 : 0,
    ]);
    $count++;
}
$pdo->commit();

// Гарантируем строку статуса для каждой новой станции
$pdo->exec(
    "INSERT INTO station_status (station_id, status)
     SELECT s.id, 'unknown' FROM stations s
     LEFT JOIN station_status st ON st.station_id = s.id
     WHERE st.station_id IS NULL"
);

log_line("Импортировано станций: $count, пропущено: $skipped");
