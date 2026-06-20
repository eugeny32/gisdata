<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
$admin = require_admin_role('admin');

$pdo = db();
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string)($_POST['action'] ?? '');

    if ($action === 'create') {
        $userId = (int)($_POST['user_id'] ?? 0);
        $planName = trim((string)($_POST['plan_name'] ?? ''));
        $endsAt = trim((string)($_POST['ends_at'] ?? ''));
        $note = trim((string)($_POST['note'] ?? ''));

        if ($userId <= 0 || $endsAt === '') {
            $error = 'Выберите пользователя и укажите дату окончания подписки';
        } else {
            $pdo->prepare(
                'INSERT INTO subscriptions (user_id, plan_name, ends_at, note, created_by)
                 VALUES (:user_id, :plan_name, :ends_at, :note, :created_by)'
            )->execute([
                'user_id' => $userId,
                'plan_name' => $planName ?: null,
                'ends_at' => $endsAt,
                'note' => $note ?: null,
                'created_by' => $admin['id'],
            ]);
            header('Location: /subscriptions.php');
            exit;
        }
    } elseif ($action === 'cancel') {
        $id = (int)($_POST['id'] ?? 0);
        $pdo->prepare('UPDATE subscriptions SET is_cancelled = 1 WHERE id = :id')->execute(['id' => $id]);
        header('Location: /subscriptions.php');
        exit;
    }
}

$users = $pdo->query('SELECT id, user_name, gl_name, email, is_active FROM users_sync ORDER BY user_name')->fetchAll();

$allSubs = $pdo->query(
    'SELECT id, user_id, plan_name, starts_at, ends_at, is_cancelled, note
     FROM subscriptions
     ORDER BY ends_at DESC'
)->fetchAll();

$subsByUser = [];
foreach ($allSubs as $s) {
    $subsByUser[$s['user_id']][] = $s;
}

function subscription_status(array $subs): array
{
    foreach ($subs as $s) {
        if (!$s['is_cancelled'] && strtotime($s['ends_at']) > time()) {
            return ['status' => 'active', 'sub' => $s];
        }
    }
    return ['status' => $subs ? 'expired' : 'none', 'sub' => $subs[0] ?? null];
}

$pageTitle = 'Подписки клиентов';
$pageIcon = 'bi-credit-card';
require __DIR__ . '/app/views/_head.php';
?>
  <?php if ($error): ?>
    <div class="alert alert-danger"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
  <?php endif; ?>

  <div class="card surface-card mb-4">
    <div class="card-body">
      <h2 class="h6 mb-3">Выдать / продлить подписку</h2>
      <form method="post" action="/subscriptions.php" class="row g-3">
        <input type="hidden" name="action" value="create">
        <div class="col-md-4">
          <label class="form-label small">Пользователь*</label>
          <select name="user_id" class="form-select" required>
            <option value="">— выберите —</option>
            <?php foreach ($users as $u): ?>
              <option value="<?= (int)$u['id'] ?>"><?= htmlspecialchars($u['user_name'], ENT_QUOTES, 'UTF-8') ?></option>
            <?php endforeach; ?>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label small">Тариф (опционально)</label>
          <input type="text" name="plan_name" class="form-control" placeholder="Базовый / RTK Pro...">
        </div>
        <div class="col-md-3">
          <label class="form-label small">Действует до*</label>
          <input type="date" name="ends_at" class="form-control" required>
        </div>
        <div class="col-md-2 d-flex align-items-end">
          <button type="submit" class="btn btn-primary w-100">Сохранить</button>
        </div>
        <div class="col-md-8">
          <label class="form-label small">Комментарий (опционально)</label>
          <input type="text" name="note" class="form-control">
        </div>
      </form>
    </div>
  </div>

  <div class="card surface-card mb-3">
    <div class="card-body py-2">
      <input type="text" id="subsSearch" class="form-control form-control-sm" style="max-width: 280px" placeholder="Поиск по логину...">
    </div>
  </div>

  <div class="card surface-card">
    <div class="table-responsive">
      <table class="table table-clean align-middle mb-0" id="subsTable">
        <thead>
          <tr><th>Пользователь</th><th>Email</th><th>mdb-доступ</th><th>Подписка</th><th>Тариф</th><th>До</th><th></th></tr>
        </thead>
        <tbody>
        <?php foreach ($users as $u): ?>
          <?php
          $info = subscription_status($subsByUser[$u['id']] ?? []);
          $sub = $info['sub'];
          $history = $subsByUser[$u['id']] ?? [];
          ?>
          <tr>
            <td><?= htmlspecialchars($u['user_name'], ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= htmlspecialchars($u['email'] ?: '—', ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= $u['is_active'] ? '<span class="badge text-bg-success">активен</span>' : '<span class="badge text-bg-secondary">неактивен</span>' ?></td>
            <td>
              <?php if ($info['status'] === 'active'): ?>
                <span class="status-pill status-online">активна</span>
              <?php elseif ($info['status'] === 'expired'): ?>
                <span class="status-pill status-offline">истекла</span>
              <?php else: ?>
                <span class="status-pill status-unknown">нет</span>
              <?php endif; ?>
            </td>
            <td><?= htmlspecialchars($sub['plan_name'] ?? '—', ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= $sub ? htmlspecialchars(substr($sub['ends_at'], 0, 10), ENT_QUOTES, 'UTF-8') : '—' ?></td>
            <td class="text-end">
              <?php if ($info['status'] === 'active'): ?>
              <form method="post" action="/subscriptions.php" class="d-inline" onsubmit="return confirm('Отозвать подписку?');">
                <input type="hidden" name="action" value="cancel">
                <input type="hidden" name="id" value="<?= (int)$sub['id'] ?>">
                <button type="submit" class="btn btn-sm btn-outline-danger">Отозвать</button>
              </form>
              <?php endif; ?>
              <?php if (count($history) > 1): ?>
              <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="collapse" data-bs-target="#hist<?= (int)$u['id'] ?>">
                История
              </button>
              <?php endif; ?>
            </td>
          </tr>
          <?php if (count($history) > 1): ?>
          <tr class="collapse" id="hist<?= (int)$u['id'] ?>">
            <td colspan="7" class="bg-body-tertiary">
              <table class="table table-sm mb-0">
                <thead><tr><th>Тариф</th><th>С</th><th>До</th><th>Статус</th><th>Комментарий</th></tr></thead>
                <tbody>
                <?php foreach ($history as $h): ?>
                  <tr>
                    <td><?= htmlspecialchars($h['plan_name'] ?? '—', ENT_QUOTES, 'UTF-8') ?></td>
                    <td><?= htmlspecialchars(substr($h['starts_at'], 0, 10), ENT_QUOTES, 'UTF-8') ?></td>
                    <td><?= htmlspecialchars(substr($h['ends_at'], 0, 10), ENT_QUOTES, 'UTF-8') ?></td>
                    <td><?= $h['is_cancelled'] ? 'отозвана' : (strtotime($h['ends_at']) > time() ? 'активна' : 'истекла') ?></td>
                    <td><?= htmlspecialchars($h['note'] ?? '', ENT_QUOTES, 'UTF-8') ?></td>
                  </tr>
                <?php endforeach; ?>
                </tbody>
              </table>
            </td>
          </tr>
          <?php endif; ?>
        <?php endforeach; ?>
        <?php if (!$users): ?>
          <tr><td colspan="7" class="text-muted">Нет пользователей</td></tr>
        <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>
<?php
$extraScripts = <<<'HTML'
<script>
document.getElementById('subsSearch').addEventListener('input', function () {
  const q = this.value.trim().toLowerCase();
  for (const row of document.querySelectorAll('#subsTable > tbody > tr:not(.collapse)')) {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  }
});
</script>
HTML;
require __DIR__ . '/app/views/_foot.php';
