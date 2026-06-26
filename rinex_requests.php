<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
require_login();

$pdo = db();
$admin = current_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string)($_POST['action'] ?? '');
    if ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        $stmt = $pdo->prepare('SELECT result_path FROM rinex_requests WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $path = $stmt->fetchColumn();
        if ($path) {
            $full = __DIR__ . '/uploads/rinex_results/' . $path;
            if (is_file($full)) {
                unlink($full);
            }
        }
        $pdo->prepare('DELETE FROM rinex_requests WHERE id = :id')->execute(['id' => $id]);
        header('Location: /rinex_requests.php');
        exit;
    }
}

// Сотрудники видят только свои запросы — это личная "очередь" для каждого,
// не общий список всей организации (как и tours.php created_by, но там
// видимость не ограничена; здесь специально ограничена, чтобы у каждого
// был свой обзор без чужих результатов вперемешку).
$requests = $pdo->prepare('SELECT * FROM rinex_requests WHERE created_by = :id ORDER BY created_at DESC LIMIT 200');
$requests->execute(['id' => $admin['id'] ?? 0]);
$requests = $requests->fetchAll();

function rinex_status_badge(string $status): string
{
    return match ($status) {
        'pending' => '<span class="badge text-bg-secondary">в очереди</span>',
        'processing' => '<span class="badge text-bg-warning">собирается...</span>',
        'done' => '<span class="badge text-bg-success">готово</span>',
        'error' => '<span class="badge text-bg-danger">ошибка</span>',
        default => '<span class="badge text-bg-secondary">' . htmlspecialchars($status, ENT_QUOTES, 'UTF-8') . '</span>',
    };
}

$pageTitle = 'Готовые данные RINEX';
$pageIcon = 'bi-clock-history';
require __DIR__ . '/app/views/_head.php';
?>
  <div class="card surface-card">
    <div class="card-body">
      <h2 class="h6 mb-3">Мои запросы RINEX</h2>
      <div class="table-responsive">
        <table class="table table-clean align-middle">
          <thead>
            <tr><th>Создан</th><th>Станции</th><th>Период (UTC)</th><th>Типы</th><th>Статус</th><th>Файлов</th><th></th></tr>
          </thead>
          <tbody>
          <?php foreach ($requests as $r): ?>
            <tr>
              <td><?= htmlspecialchars(substr($r['created_at'], 0, 16), ENT_QUOTES, 'UTF-8') ?></td>
              <td><?= htmlspecialchars($r['stations'], ENT_QUOTES, 'UTF-8') ?></td>
              <td class="small">
                <?= htmlspecialchars(substr($r['date_from_utc'], 0, 16), ENT_QUOTES, 'UTF-8') ?>
                &mdash;
                <?= htmlspecialchars(substr($r['date_to_utc'], 0, 16), ENT_QUOTES, 'UTF-8') ?>
                <?php if ($r['merge_by_day']): ?><span class="text-secondary">(объединение по суткам)</span><?php endif; ?>
              </td>
              <td class="small">
                <?= $r['want_obs'] ? 'MO ' : '' ?><?= $r['want_nav'] ? 'MN' : '' ?>
              </td>
              <td>
                <?= rinex_status_badge($r['status']) ?>
                <?php if ($r['status'] === 'error' && $r['error_message']): ?>
                  <div class="text-danger small mt-1"><?= htmlspecialchars($r['error_message'], ENT_QUOTES, 'UTF-8') ?></div>
                <?php endif; ?>
              </td>
              <td><?= $r['file_count'] !== null ? (int)$r['file_count'] : '—' ?></td>
              <td class="text-end">
                <div class="d-flex gap-1 justify-content-end align-items-center flex-nowrap">
                  <?php if ($r['status'] === 'done' && $r['result_path']): ?>
                    <a href="/rinex_request_download.php?id=<?= (int)$r['id'] ?>" class="btn btn-sm btn-outline-primary" title="Скачать .zip"><i class="bi bi-download"></i></a>
                  <?php endif; ?>
                  <form method="post" action="/rinex_requests.php" onsubmit="return confirm('Удалить этот запрос?');">
                    <input type="hidden" name="action" value="delete">
                    <input type="hidden" name="id" value="<?= (int)$r['id'] ?>">
                    <button type="submit" class="btn btn-sm btn-outline-danger" title="Удалить"><i class="bi bi-trash"></i></button>
                  </form>
                </div>
              </td>
            </tr>
          <?php endforeach; ?>
          <?php if (!$requests): ?>
            <tr><td colspan="7" class="text-muted">Запросов пока нет — создайте на странице <a href="/rinex.php">RINEX</a></td></tr>
          <?php endif; ?>
          </tbody>
        </table>
      </div>
      <div class="text-secondary small mt-2">Страница не обновляется автоматически — обновите её (F5), чтобы увидеть готовый результат.</div>
    </div>
  </div>
<?php require __DIR__ . '/app/views/_foot.php'; ?>
