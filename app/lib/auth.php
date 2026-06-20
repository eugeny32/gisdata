<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

function start_session(): void
{
    $cfg = app_config()['session'];
    if (session_status() === PHP_SESSION_NONE) {
        session_name($cfg['name']);
        session_set_cookie_params([
            'lifetime' => $cfg['lifetime'],
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }
}

/**
 * Проверка логина/пароля против синхронизированной таблицы users_sync.
 * Доступ запрещён, если пользователь не найден, неактивен (USERTIME <= 0)
 * или пароль не совпадает.
 */
function attempt_login(string $userName, string $password): bool
{
    $stmt = db()->prepare('SELECT * FROM users_sync WHERE user_name = :u LIMIT 1');
    $stmt->execute(['u' => $userName]);
    $user = $stmt->fetch();

    if (!$user || !$user['is_active']) {
        return false;
    }
    if (!hash_equals((string)$user['user_password'], $password)) {
        return false;
    }

    start_session();
    session_regenerate_id(true);
    $_SESSION['user_id']   = (int)$user['id'];
    $_SESSION['user_name'] = $user['user_name'];
    return true;
}

function current_user(): ?array
{
    start_session();
    if (empty($_SESSION['user_id'])) {
        return null;
    }
    return [
        'id'   => $_SESSION['user_id'],
        'name' => $_SESSION['user_name'],
    ];
}

/** Подключать на каждой защищённой странице первой строкой после require. */
function require_login(): array
{
    $user = current_user();
    if ($user === null) {
        header('Location: /login.php');
        exit;
    }
    return $user;
}

function logout(): void
{
    start_session();
    $_SESSION = [];
    session_destroy();
}
