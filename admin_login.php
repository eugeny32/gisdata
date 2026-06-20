<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';

start_session();
if (current_admin() !== null) {
    header('Location: /stations.php');
    exit;
}

$error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $login = trim((string)($_POST['login'] ?? ''));
    $password = (string)($_POST['password'] ?? '');
    if ($login === '' || $password === '') {
        $error = 'Введите логин и пароль';
    } elseif (attempt_admin_login($login, $password)) {
        header('Location: /stations.php');
        exit;
    } else {
        $error = 'Неверный логин или пароль';
    }
}
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Вход суперпользователя</title>
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body class="login-page">
  <form class="login-box" method="post" action="/admin_login.php">
    <h1>Вход суперпользователя</h1>
    <?php if ($error): ?>
      <div class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
    <?php endif; ?>
    <label>Логин
      <input type="text" name="login" autocomplete="username" required autofocus>
    </label>
    <label>Пароль
      <input type="password" name="password" autocomplete="current-password" required>
    </label>
    <button type="submit">Войти</button>
  </form>
</body>
</html>
