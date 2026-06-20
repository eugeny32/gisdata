<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
$admin = require_admin_role('admin');

$pdo = db();
$error = null;
$createdLink = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string)($_POST['action'] ?? '');

    if ($action === 'create') {
        $role = ($_POST['role'] ?? '') === 'admin' ? 'admin' : 'viewer';
        $email = trim((string)($_POST['email'] ?? ''));
        $fullName = trim((string)($_POST['full_name'] ?? ''));
        $token = bin2hex(random_bytes(24));

        $pdo->prepare(
            'INSERT INTO admin_invites (token, role, email, full_name, created_by, expires_at)
             VALUES (:token, :role, :email, :full_name, :created_by, DATE_ADD(NOW(), INTERVAL 7 DAY))'
        )->execute([
            'token' => $token,
            'role' => $role,
            'email' => $email ?: null,
            'full_name' => $fullName ?: null,
            'created_by' => $admin['id'],
        ]);

        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $createdLink = $scheme . '://' . $_SERVER['HTTP_HOST'] . '/invite_accept.php?token=' . $token;
    } elseif ($action === 'revoke') {
        $id = (int)($_POST['id'] ?? 0);
        $pdo->prepare('UPDATE admin_invites SET expires_at = NOW() WHERE id = :id AND used_at IS NULL')->execute(['id' => $id]);
    }
}

$invites = $pdo->query(
    'SELECT i.id, i.role, i.email, i.full_name, i.created_at, i.expires_at, i.used_at, a.login AS created_by_login
     FROM admin_invites i
     LEFT JOIN admins a ON a.id = i.created_by
     ORDER BY i.created_at DESC'
)->fetchAll();

$pageTitle = 'Приглашения сотрудников';
$pageIcon = 'bi-envelope-paper';
require __DIR__ . '/app/views/_head.php';
?>
  <?php if ($createdLink): ?>
    <div class="alert alert-success">
      Приглашение создано. Отправьте эту ссылку сотруднику (действует 7 дней):<br>
      <div class="input-group mt-2" style="max-width: 560px">
        <input type="text" class="form-control" id="inviteLink" value="<?= htmlspecialchars($createdLink, ENT_QUOTES, 'UTF-8') ?>" readonly>
        <button class="btn btn-outline-secondary" type="button" onclick="navigator.clipboard.writeText(document.getElementById('inviteLink').value)">Копировать</button>
      </div>
    </div>
  <?php endif; ?>

  <div class="card surface-card mb-4">
    <div class="card-body">
      <h2 class="h6 mb-3">Создать приглашение</h2>
      <form method="post" action="/employee_invites.php" class="row g-3">
        <input type="hidden" name="action" value="create">
        <div class="col-md-3">
          <label class="form-label small">Роль</label>
          <select name="role" class="form-select">
            <option value="viewer">Просмотр</option>
            <option value="admin">Администратор</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label small">Email (опционально)</label>
          <input type="email" name="email" class="form-control">
        </div>
        <div class="col-md-4">
          <label class="form-label small">Имя (опционально)</label>
          <input type="text" name="full_name" class="form-control">
        </div>
        <div class="col-md-1 d-flex align-items-end">
          <button type="submit" class="btn btn-primary w-100">Создать</button>
        </div>
      </form>
    </div>
  </div>

  <div class="card surface-card">
    <div class="card-body">
      <h2 class="h6 mb-3">Приглашения</h2>
      <div class="table-responsive">
        <table class="table table-clean align-middle">
          <thead><tr><th>Роль</th><th>Email / имя</th><th>Создано</th><th>Действует до</th><th>Статус</th><th></th></tr></thead>
          <tbody>
          <?php foreach ($invites as $i): ?>
            <?php
            $isUsed = $i['used_at'] !== null;
            $isExpired = !$isUsed && strtotime($i['expires_at']) < time();
            ?>
            <tr>
              <td><?= $i['role'] === 'admin' ? 'Администратор' : 'Просмотр' ?></td>
              <td><?= htmlspecialchars(($i['full_name'] ?: '') . ($i['email'] ? ' <' . $i['email'] . '>' : ''), ENT_QUOTES, 'UTF-8') ?: '—' ?></td>
              <td><?= htmlspecialchars($i['created_at'], ENT_QUOTES, 'UTF-8') ?></td>
              <td><?= htmlspecialchars($i['expires_at'], ENT_QUOTES, 'UTF-8') ?></td>
              <td>
                <?php if ($isUsed): ?>
                  <span class="badge text-bg-success">Использовано</span>
                <?php elseif ($isExpired): ?>
                  <span class="badge text-bg-secondary">Просрочено</span>
                <?php else: ?>
                  <span class="badge text-bg-warning">Ожидает</span>
                <?php endif; ?>
              </td>
              <td class="text-end">
                <?php if (!$isUsed && !$isExpired): ?>
                <form method="post" action="/employee_invites.php" class="d-inline" onsubmit="return confirm('Отозвать приглашение?');">
                  <input type="hidden" name="action" value="revoke">
                  <input type="hidden" name="id" value="<?= (int)$i['id'] ?>">
                  <button type="submit" class="btn btn-sm btn-outline-danger">Отозвать</button>
                </form>
                <?php endif; ?>
              </td>
            </tr>
          <?php endforeach; ?>
          <?php if (!$invites): ?>
            <tr><td colspan="6" class="text-muted">Нет приглашений</td></tr>
          <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>
<?php require __DIR__ . '/app/views/_foot.php'; ?>
