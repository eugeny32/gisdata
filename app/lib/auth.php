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
    unset($_SESSION['admin_id'], $_SESSION['admin_login']);
    return true;
}

/**
 * Вход суперпользователя (таблица admins). Отдельная сессия от обычных
 * пользователей mdb — суперпользователь получает доступ к управлению
 * станциями (require_admin()).
 *
 * password_hash хранится как SHA2-256 (hex), а не bcrypt — специально,
 * чтобы запись можно было создать одним SQL-запросом через phpMyAdmin/mysql
 * (MySQL умеет SHA2() из коробки, а bcrypt требует PHP). Это слабее bcrypt
 * (нет соли, нет cost-фактора), но соответствует общему уровню защиты
 * остальной системы (mdb-пароли вообще хранятся в открытом виде).
 */
function attempt_admin_login(string $login, string $password): bool
{
    $stmt = db()->prepare('SELECT * FROM admins WHERE login = :l AND is_active = 1 LIMIT 1');
    $stmt->execute(['l' => $login]);
    $admin = $stmt->fetch();

    if (!$admin || !hash_equals($admin['password_hash'], hash('sha256', $password))) {
        return false;
    }

    start_session();
    session_regenerate_id(true);
    $_SESSION['admin_id']    = (int)$admin['id'];
    $_SESSION['admin_login'] = $admin['login'];
    unset($_SESSION['user_id'], $_SESSION['user_name']);
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

function current_admin(): ?array
{
    start_session();
    if (empty($_SESSION['admin_id'])) {
        return null;
    }
    return [
        'id'    => $_SESSION['admin_id'],
        'login' => $_SESSION['admin_login'],
    ];
}

/** Подключать на каждой защищённой странице первой строкой после require. */
function require_login(): array
{
    $user = current_user() ?? current_admin();
    if ($user === null) {
        header('Location: /login.php');
        exit;
    }
    return $user;
}

/** Подключать на страницах управления станциями — только суперпользователь. */
function require_admin(): array
{
    $admin = current_admin();
    if ($admin === null) {
        header('Location: /admin_login.php');
        exit;
    }
    return $admin;
}

function logout(): void
{
    start_session();
    $_SESSION = [];
    session_destroy();
}
