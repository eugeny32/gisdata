<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
$admin = require_admin_role('admin');

$pdo = db();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'toggle') {
    $id = (int)($_POST['id'] ?? 0);
    if ($id === (int)$admin['id']) {
        $error = 'Нельзя деактивировать собственную учётную запись';
    } else {
        $pdo->prepare('UPDATE admins SET is_active = 1 - is_active WHERE id = :id')->execute(['id' => $id]);
        header('Location: /employees.php');
        exit;
    }
}

$employees = $pdo->query('SELECT id, login, role, full_name, email, phone, is_active FROM admins ORDER BY login')->fetchAll();

$pageTitle = 'Список сотрудников';
$pageIcon = 'bi-people';
require __DIR__ . '/app/views/_head.php';
?>
  <?php if (!empty($error)): ?>
    <div class="alert alert-danger"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
  <?php endif; ?>

  <div class="d-flex justify-content-between align-items-center mb-3">
    <div class="text-secondary small">Количество сотрудников: <?= count($employees) ?></div>
    <a href="/employee_invites.php" class="btn btn-primary btn-sm"><i class="bi bi-envelope-paper me-1"></i>Пригласить</a>
  </div>

  <div class="card surface-card">
    <div class="table-responsive">
      <table class="table table-clean align-middle mb-0">
        <thead>
          <tr><th>Сотрудник</th><th>Логин</th><th>Роль</th><th>Email</th><th>Телефон</th><th>Статус</th><th></th></tr>
        </thead>
        <tbody>
        <?php foreach ($employees as $e): ?>
          <tr>
            <td><?= htmlspecialchars($e['full_name'] ?: '—', ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= htmlspecialchars($e['login'], ENT_QUOTES, 'UTF-8') ?></td>
            <td><span class="badge text-bg-secondary"><?= $e['role'] === 'admin' ? 'Администратор' : 'Просмотр' ?></span></td>
            <td><?= htmlspecialchars($e['email'] ?: '—', ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= htmlspecialchars($e['phone'] ?: '—', ENT_QUOTES, 'UTF-8') ?></td>
            <td>
              <?php if ($e['is_active']): ?>
                <span class="badge text-bg-success">Активен</span>
              <?php else: ?>
                <span class="badge text-bg-secondary">Неактивен</span>
              <?php endif; ?>
            </td>
            <td class="text-end">
              <?php if ((int)$e['id'] !== (int)$admin['id']): ?>
              <form method="post" action="/employees.php" class="d-inline" onsubmit="return confirm('Изменить статус сотрудника?');">
                <input type="hidden" name="action" value="toggle">
                <input type="hidden" name="id" value="<?= (int)$e['id'] ?>">
                <button type="submit" class="btn btn-sm btn-outline-secondary"><?= $e['is_active'] ? 'Деактивировать' : 'Активировать' ?></button>
              </form>
              <?php endif; ?>
            </td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
<?php require __DIR__ . '/app/views/_foot.php'; ?>
