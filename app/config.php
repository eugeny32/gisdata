<?php
// Конфигурация приложения. Настройки базы данных и пути к mdb берутся из
// .env (см. .env.example) — скопируйте .env.example в .env и заполните под
// сервер. Остальные параметры (RINEX, NTRIP, сессия) можно менять прямо тут
// либо переопределять через config.local.php.

require_once __DIR__ . '/lib/env.php';
load_env();

return [
    'pgsql' => [
        'host'     => env('PGSQL_HOST', '127.0.0.1'),
        'port'     => (int)env('PGSQL_PORT', 5432),
        'dbname'   => env('PGSQL_DATABASE', 'gisdata'),
        'user'     => env('PGSQL_USER', 'postgres'),
        'password' => env('PGSQL_PASSWORD', '914999'),
    ],

    // Путь не меняем — путь к исходной базе South Net Reference Station
    'mdb' => [
        'path'   => env('MDB_PATH', 'C:\\Program Files (x86)\\South Net Reference Station\\SBR\\E_SERVER64_230822\\E_Ser190905.mdb'),
        // ODBC-драйвер должен совпадать по разрядности с PHP (см. README в /app)
        'driver' => env('MDB_DRIVER', 'Microsoft Access Driver (*.mdb, *.accdb)'),
    ],

    // Путь не меняем — каталог RINEX-файлов на сервере
    'rinex' => [
        'base_path' => 'E:\\Ftp\\RINEX\\RINEX\\2026',
    ],

    // Параметры опроса NTRIP-потоков базовых станций
    'ntrip' => [
        'connect_timeout_sec' => 5,
        'read_timeout_sec'    => 8,
        'min_bytes_online'    => 256, // сколько байт потока считать признаком "станция жива"
        'user_agent'          => 'NTRIP GISDataMonitor/1.0',
    ],

    'session' => [
        'name'     => 'gisdata_sid',
        'lifetime' => 8 * 3600,
    ],
];
