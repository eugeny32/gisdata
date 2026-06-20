<?php
declare(strict_types=1);

/**
 * Создание (или смена пароля) суперпользователя приложения — отдельная
 * учётная запись для управления станциями, не связанная с пользователями
 * из mdb. Пароль хранится как SHA2-256 (см. app/lib/auth.php) — тот же
 * формат, что и при создании записи прямо через SQL без PHP CLI.
 *
 * Запуск из CLI:
 *   php bin\create_admin.php <login> <password> ["Полное имя"] [role]
 *
 * role — 'admin' (по умолчанию, полный доступ) или 'viewer' (только просмотр).
 *
 * Запуск через браузер (если на хостинге нет CLI-доступа), один раз:
 *   https://ваш-домен/bin/create_admin.php?token=<SETUP_TOKEN из .env>&login=admin&password=...
 * После использования рекомендуется удалить этот файл с сервера или сменить
 * SETUP_TOKEN, так как сам файл лежит в публичной директории.
 *
 * Если логин уже существует — пароль (и имя, если передано) будут обновлены.
 */

require __DIR__ . '/../app/lib/db.php';
require __DIR__ . '/../app/lib/cli.php';

if (php_sapi_name() !== 'cli') {
    $expected = env('SETUP_TOKEN', '');
    $given = $_GET['token'] ?? $_POST['token'] ?? '';
    if ($expected === '' || !hash_equals($expected, (string)$given)) {
        http_response_code(403);
        exit('403 Forbidden: укажите ?token=<SETUP_TOKEN из .env>');
    }
}

$login = cli_arg(1, 'login');
$password = cli_arg(2, 'password');
$fullName = cli_arg(3, 'full_name');
$role = cli_arg(4, 'role') === 'viewer' ? 'viewer' : 'admin';

if (!$login || !$password) {
    cli_err('Использование: php bin\\create_admin.php <login> <password> ["Полное имя"] [role] (или ?login=&password=&full_name=&role= через браузер)');
    exit(1);
}
if (strlen($password) < 8) {
    cli_err('Пароль должен быть не короче 8 символов');
    exit(1);
}

$hash = hash('sha256', $password);

$pdo = db();
$stmt = $pdo->prepare(
    'INSERT INTO admins (login, password_hash, full_name, role, is_active)
     VALUES (:login, :hash, :full_name, :role, 1)
     ON DUPLICATE KEY UPDATE
        password_hash = VALUES(password_hash),
        full_name = COALESCE(VALUES(full_name), full_name),
        role = VALUES(role),
        is_active = 1'
);
$stmt->execute([
    'login' => $login,
    'hash' => $hash,
    'full_name' => $fullName,
    'role' => $role,
]);

cli_out("Суперпользователь '$login' создан/обновлён.");
