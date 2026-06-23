<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';

start_session();
if (current_user() !== null) {
    header('Location: /home.php');
    exit;
}

$error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userName = trim((string)($_POST['user_name'] ?? ''));
    $password = (string)($_POST['password'] ?? '');
    if ($userName === '' || $password === '') {
        $error = 'Введите имя пользователя и пароль';
    } elseif (attempt_login($userName, $password)) {
        header('Location: /home.php');
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
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Вход — Мониторинг базовых станций</title>
  <link rel="icon" href="/assets/icon-192.png">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body class="login-page" data-bs-theme="dark">
  <div class="card login-card">
    <div class="card-body">
      <div class="login-icon"><i class="bi bi-broadcast-pin"></i></div>
      <h1 class="h5 text-center mb-4">Мониторинг базовых станций</h1>
      <?php if ($error): ?>
        <div class="alert alert-danger py-2"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
      <?php endif; ?>
      <form method="post" action="/login.php" class="d-flex flex-column gap-3">
        <div>
          <label class="form-label small">Имя пользователя</label>
          <input type="text" name="user_name" class="form-control" autocomplete="username" required autofocus>
        </div>
        <div>
          <label class="form-label small">Пароль</label>
          <input type="password" name="password" class="form-control" autocomplete="current-password" required>
        </div>
        <button type="submit" class="btn btn-primary mt-1">Войти</button>
      </form>
    </div>
  </div>
</body>
</html>
