<?php
declare(strict_types=1);

/**
 * Создание (или смена пароля) суперпользователя приложения — отдельная
 * учётная запись для управления станциями, не связанная с пользователями
 * из mdb. Пароль хранится как bcrypt-хэш (password_hash), не как открытый
 * текст, в отличие от users_sync (там пароль — как в legacy mdb).
 *
 * Запуск:
 *   php bin\create_admin.php <login> <password> ["Полное имя"]
 *
 * Если логин уже существует — пароль (и имя, если передано) будут обновлены.
 */

require __DIR__ . '/../app/lib/db.php';

$login = $argv[1] ?? null;
$password = $argv[2] ?? null;
$fullName = $argv[3] ?? null;

if (!$login || !$password) {
    fwrite(STDERR, "Использование: php bin\\create_admin.php <login> <password> [\"Полное имя\"]\n");
    exit(1);
}
if (strlen($password) < 8) {
    fwrite(STDERR, "Пароль должен быть не короче 8 символов\n");
    exit(1);
}

$hash = password_hash($password, PASSWORD_BCRYPT);

$pdo = db();
$stmt = $pdo->prepare(
    'INSERT INTO admins (login, password_hash, full_name, is_active)
     VALUES (:login, :hash, :full_name, 1)
     ON DUPLICATE KEY UPDATE
        password_hash = VALUES(password_hash),
        full_name = COALESCE(VALUES(full_name), full_name),
        is_active = 1'
);
$stmt->execute([
    'login' => $login,
    'hash' => $hash,
    'full_name' => $fullName,
]);

fwrite(STDOUT, "Суперпользователь '$login' создан/обновлён.\n");
