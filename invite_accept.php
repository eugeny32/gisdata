<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';

$pdo = db();
$token = (string)($_GET['token'] ?? $_POST['token'] ?? '');
$error = null;

$stmt = $pdo->prepare(
    'SELECT * FROM admin_invites WHERE token = :token AND used_at IS NULL AND expires_at > NOW() LIMIT 1'
);
$stmt->execute(['token' => $token]);
$invite = $stmt->fetch() ?: null;

if (!$invite) {
    $error = 'Приглашение не найдено, уже использовано или истёк срок действия';
}

if ($invite && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $login = trim((string)($_POST['login'] ?? ''));
    $password = (string)($_POST['password'] ?? '');
    $passwordConfirm = (string)($_POST['password_confirm'] ?? '');

    if ($login === '' || $password === '') {
        $error = 'Заполните логин и пароль';
    } elseif ($password !== $passwordConfirm) {
        $error = 'Пароли не совпадают';
    } elseif (strlen($password) < 6) {
        $error = 'Пароль должен быть не короче 6 символов';
    } else {
        $exists = $pdo->prepare('SELECT id FROM admins WHERE login = :login LIMIT 1');
        $exists->execute(['login' => $login]);
        if ($exists->fetch()) {
            $error = 'Такой логин уже занят';
        } else {
            $pdo->beginTransaction();
            $insertStmt = $pdo->prepare(
                'INSERT INTO admins (login, password_hash, full_name, role, email, is_active)
                 VALUES (:login, :password_hash, :full_name, :role, :email, 1)
                 RETURNING id'
            );
            $insertStmt->execute([
                'login' => $login,
                'password_hash' => hash('sha256', $password),
                'full_name' => $invite['full_name'],
                'role' => $invite['role'],
                'email' => $invite['email'],
            ]);
            $newId = (int)$insertStmt->fetchColumn();
            $pdo->prepare('UPDATE admin_invites SET used_at = NOW() WHERE id = :id')->execute(['id' => $invite['id']]);
            $pdo->commit();

            login_admin_session($newId, $login, $invite['role']);
            header('Location: /home.php');
            exit;
        }
    }
}
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Принять приглашение</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body data-bs-theme="dark" class="login-page">
  <div class="card login-card">
    <div class="card-body">
      <div class="login-icon"><i class="bi bi-envelope-paper"></i></div>
      <h1 class="h5 text-center mb-4">Принять приглашение</h1>
      <?php if ($error): ?>
        <div class="alert alert-danger py-2"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
      <?php endif; ?>
      <?php if ($invite): ?>
      <form method="post" action="/invite_accept.php" class="d-flex flex-column gap-3">
        <input type="hidden" name="token" value="<?= htmlspecialchars($token, ENT_QUOTES, 'UTF-8') ?>">
        <div>
          <label class="form-label small">Логин</label>
          <input type="text" name="login" class="form-control" required autofocus>
        </div>
        <div>
          <label class="form-label small">Пароль</label>
          <input type="password" name="password" class="form-control" required minlength="6">
        </div>
        <div>
          <label class="form-label small">Повторите пароль</label>
          <input type="password" name="password_confirm" class="form-control" required minlength="6">
        </div>
        <button type="submit" class="btn btn-primary mt-1">Создать учётную запись</button>
      </form>
      <?php else: ?>
        <a href="/login.php" class="btn btn-outline-secondary w-100">На страницу входа</a>
      <?php endif; ?>
    </div>
  </div>
</body>
</html>
