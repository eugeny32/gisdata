<?php
declare(strict_types=1);

require_once __DIR__ . '/env.php';
load_env();

function app_config(): array
{
    static $config = null;
    if ($config === null) {
        $base = require __DIR__ . '/../config.php';
        $localFile = __DIR__ . '/../config.local.php';
        if (is_file($localFile)) {
            $local = require $localFile;
            $config = array_replace_recursive($base, $local);
        } else {
            $config = $base;
        }
    }
    return $config;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $cfg = app_config()['mysql'];
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            $cfg['host'],
            $cfg['port'],
            $cfg['dbname'],
            $cfg['charset']
        );
        $pdo = new PDO($dsn, $cfg['user'], $cfg['password'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

/**
 * Подключение к исходной Access-базе (E_Ser190905.mdb) через PDO_ODBC.
 * Требует расширение pdo_odbc и установленный Microsoft Access Database Engine
 * той же разрядности (x86/x64), что и сам PHP. Используется только в CLI-скрипте
 * синхронизации (bin/sync_mdb_users.php) — веб-страницы mdb напрямую не трогают.
 */
function mdb(): PDO
{
    $cfg = app_config()['mdb'];
    if (!extension_loaded('pdo_odbc')) {
        throw new RuntimeException('Расширение PHP pdo_odbc не подключено (php.ini: extension=pdo_odbc)');
    }
    $dsn = sprintf(
        'odbc:Driver={%s};Dbq=%s;Uid=Admin;Pwd=;',
        $cfg['driver'],
        $cfg['path']
    );
    return new PDO($dsn, '', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
}
