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

// Данные для модалки редактирования — по одному объекту на пользователя,
// дальше всё подставляется в JS при клике на строку (без доп. запросов).
$modalData = [];
foreach ($users as $u) {
    $info = subscription_status($subsByUser[$u['id']] ?? []);
    $sub = $info['sub'];
    $modalData[$u['id']] = [
        'userName' => $u['user_name'],
        'status' => $info['status'],
        'activeSubId' => $info['status'] === 'active' ? (int)$sub['id'] : null,
        'planName' => $sub['plan_name'] ?? '',
        'endsAt' => $sub ? substr($sub['ends_at'], 0, 10) : '',
        'history' => array_map(fn($h) => [
            'planName' => $h['plan_name'] ?? '—',
            'startsAt' => substr($h['starts_at'], 0, 10),
            'endsAt' => substr($h['ends_at'], 0, 10),
            'status' => $h['is_cancelled'] ? 'отозвана' : (strtotime($h['ends_at']) > time() ? 'активна' : 'истекла'),
            'note' => $h['note'] ?? '',
        ], $subsByUser[$u['id']] ?? []),
    ];
}

$pageTitle = 'Подписки клиентов';
$pageIcon = 'bi-credit-card';
require __DIR__ . '/app/views/_head.php';
?>
  <?php if ($error): ?>
    <div class="alert alert-danger"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
  <?php endif; ?>

  <div class="card surface-card mb-3">
    <div class="card-body py-2 d-flex justify-content-between align-items-center">
      <input type="text" id="subsSearch" class="form-control form-control-sm" style="max-width: 280px" placeholder="Поиск по логину...">
      <div class="text-secondary small">Кликните по строке, чтобы изменить подписку</div>
    </div>
  </div>

  <div class="card surface-card">
    <div class="table-responsive">
      <table class="table table-clean align-middle mb-0" id="subsTable">
        <thead>
          <tr><th>Пользователь</th><th>Email</th><th>mdb-доступ</th><th>Подписка</th><th>Тариф</th><th>До</th></tr>
        </thead>
        <tbody>
        <?php foreach ($users as $u): ?>
          <?php $info = $modalData[$u['id']]; ?>
          <tr class="subs-row" role="button" data-user-id="<?= (int)$u['id'] ?>" style="cursor: pointer">
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
            <td><?= htmlspecialchars($info['planName'] ?: '—', ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= htmlspecialchars($info['endsAt'] ?: '—', ENT_QUOTES, 'UTF-8') ?></td>
          </tr>
        <?php endforeach; ?>
        <?php if (!$users): ?>
          <tr><td colspan="6" class="text-muted">Нет пользователей</td></tr>
        <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>

  <div class="modal fade" id="subModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <form method="post" action="/subscriptions.php">
          <input type="hidden" name="action" value="create">
          <input type="hidden" name="user_id" id="modalUserId">
          <div class="modal-header">
            <h5 class="modal-title">Подписка: <span id="modalUserName"></span></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label small">Тариф</label>
              <input type="text" name="plan_name" id="modalPlanName" class="form-control" placeholder="Базовый / RTK Pro...">
            </div>
            <div class="mb-3">
              <label class="form-label small">Действует до*</label>
              <input type="date" name="ends_at" id="modalEndsAt" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label small">Комментарий</label>
              <input type="text" name="note" id="modalNote" class="form-control">
            </div>
            <div id="modalHistoryWrap" class="d-none">
              <h6 class="h6 small text-secondary mb-2">История подписок</h6>
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead><tr><th>Тариф</th><th>С</th><th>До</th><th>Статус</th><th>Коммент.</th></tr></thead>
                  <tbody id="modalHistoryBody"></tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" id="modalCancelSub" class="btn btn-outline-danger me-auto d-none">Отозвать текущую</button>
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Закрыть</button>
            <button type="submit" class="btn btn-primary">Сохранить / продлить</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <form method="post" action="/subscriptions.php" id="cancelForm" class="d-none">
    <input type="hidden" name="action" value="cancel">
    <input type="hidden" name="id" id="cancelSubId">
  </form>
<?php
$modalDataJson = json_encode($modalData, JSON_UNESCAPED_UNICODE);
$extraScripts = <<<HTML
<script>
const subsData = {$modalDataJson};
const subModalEl = document.getElementById('subModal');
const subModal = new bootstrap.Modal(subModalEl);

document.querySelectorAll('.subs-row').forEach(row => {
  row.addEventListener('click', () => {
    const data = subsData[row.dataset.userId];
    if (!data) return;

    document.getElementById('modalUserId').value = row.dataset.userId;
    document.getElementById('modalUserName').textContent = data.userName;
    document.getElementById('modalPlanName').value = data.planName || '';
    document.getElementById('modalEndsAt').value = data.endsAt || '';
    document.getElementById('modalNote').value = '';

    const cancelBtn = document.getElementById('modalCancelSub');
    if (data.activeSubId) {
      cancelBtn.classList.remove('d-none');
      cancelBtn.onclick = () => {
        if (!confirm('Отозвать текущую подписку?')) return;
        document.getElementById('cancelSubId').value = data.activeSubId;
        document.getElementById('cancelForm').submit();
      };
    } else {
      cancelBtn.classList.add('d-none');
    }

    const historyWrap = document.getElementById('modalHistoryWrap');
    const historyBody = document.getElementById('modalHistoryBody');
    historyBody.innerHTML = '';
    if (data.history && data.history.length) {
      historyWrap.classList.remove('d-none');
      for (const h of data.history) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>\${h.planName}</td><td>\${h.startsAt}</td><td>\${h.endsAt}</td><td>\${h.status}</td><td>\${h.note}</td>`;
        historyBody.appendChild(tr);
      }
    } else {
      historyWrap.classList.add('d-none');
    }

    subModal.show();
  });
});

document.getElementById('subsSearch').addEventListener('input', function () {
  const q = this.value.trim().toLowerCase();
  for (const row of document.querySelectorAll('#subsTable tbody tr')) {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  }
});
</script>
HTML;
require __DIR__ . '/app/views/_foot.php';
