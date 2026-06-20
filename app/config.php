<?php
// Конфигурация приложения. Скопируйте в config.local.php и поправьте под сервер,
// либо задайте переменные окружения — config.local.php имеет приоритет.

return [
    'mysql' => [
        'host'     => '127.0.0.1',
        'port'     => 3306,
        'dbname'   => 'gisdata',
        'user'     => 'root',
        'password' => '',
        'charset'  => 'utf8mb4',
    ],

    // Путь не меняем — путь к исходной базе South Net Reference Station
    'mdb' => [
        'path'   => 'C:\\Program Files (x86)\\South Net Reference Station\\SBR\\E_SERVER64_230822\\E_Ser190905.mdb',
        // ODBC-драйвер должен совпадать по разрядности с PHP (см. README в /app)
        'driver' => 'Microsoft Access Driver (*.mdb, *.accdb)',
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
