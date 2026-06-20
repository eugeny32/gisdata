<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';

start_session();
if (current_user() !== null) {
    header('Location: /map.php');
    exit;
}

$error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userName = trim((string)($_POST['user_name'] ?? ''));
    $password = (string)($_POST['password'] ?? '');
    if ($userName === '' || $password === '') {
        $error = 'Введите имя пользователя и пароль';
    } elseif (attempt_login($userName, $password)) {
        header('Location: /map.php');
        exit;
    } else {
        $error = 'Неверное имя пользователя, пароль или доступ истёк';
    }
}
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Вход — Мониторинг базовых станций</title>
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body class="login-page">
  <form class="login-box" method="post" action="/login.php">
    <h1>Мониторинг базовых станций</h1>
    <?php if ($error): ?>
      <div class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
    <?php endif; ?>
    <label>Имя пользователя
      <input type="text" name="user_name" autocomplete="username" required autofocus>
    </label>
    <label>Пароль
      <input type="password" name="password" autocomplete="current-password" required>
    </label>
    <button type="submit">Войти</button>
  </form>
</body>
</html>
