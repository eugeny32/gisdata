<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
$admin = require_admin_role('admin');

$pdo = db();
$error = null;
$edit = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string)($_POST['action'] ?? '');

    if ($action === 'save') {
        $id         = (int)($_POST['id'] ?? 0);
        $name       = trim((string)($_POST['name'] ?? ''));
        $host       = trim((string)($_POST['host'] ?? ''));
        $port       = (int)($_POST['port'] ?? 2101);
        $mount      = trim((string)($_POST['mountpoint'] ?? ''));
        $ntripUser  = trim((string)($_POST['ntrip_user'] ?? ''));
        $ntripPass  = (string)($_POST['ntrip_password'] ?? '');
        $lat        = (float)($_POST['lat'] ?? 0);
        $lon        = (float)($_POST['lon'] ?? 0);
        $rinexPath  = trim((string)($_POST['rinex_path'] ?? ''));
        $comment    = trim((string)($_POST['comment'] ?? ''));
        $isEnabled  = isset($_POST['is_enabled']) ? 1 : 0;

        if ($name === '' || $host === '' || $mount === '' || $port <= 0) {
            $error = 'Заполните обязательные поля: название, хост, порт, точка подключения (mountpoint)';
        } else {
            if ($id > 0) {
                $stmt = $pdo->prepare(
                    'UPDATE stations SET name=:name, host=:host, port=:port, mountpoint=:mountpoint,
                        ntrip_user=:ntrip_user, ntrip_password=:ntrip_password, lat=:lat, lon=:lon,
                        rinex_path=:rinex_path, comment=:comment, is_enabled=:is_enabled
                     WHERE id=:id'
                );
                $stmt->execute([
                    'id' => $id, 'name' => $name, 'host' => $host, 'port' => $port, 'mountpoint' => $mount,
                    'ntrip_user' => $ntripUser ?: null, 'ntrip_password' => $ntripPass ?: null,
                    'lat' => $lat, 'lon' => $lon, 'rinex_path' => $rinexPath ?: null,
                    'comment' => $comment ?: null, 'is_enabled' => $isEnabled,
                ]);
            } else {
                $stmt = $pdo->prepare(
                    'INSERT INTO stations (name, host, port, mountpoint, ntrip_user, ntrip_password, lat, lon, rinex_path, comment, is_enabled)
                     VALUES (:name, :host, :port, :mountpoint, :ntrip_user, :ntrip_password, :lat, :lon, :rinex_path, :comment, :is_enabled)'
                );
                $stmt->execute([
                    'name' => $name, 'host' => $host, 'port' => $port, 'mountpoint' => $mount,
                    'ntrip_user' => $ntripUser ?: null, 'ntrip_password' => $ntripPass ?: null,
                    'lat' => $lat, 'lon' => $lon, 'rinex_path' => $rinexPath ?: null,
                    'comment' => $comment ?: null, 'is_enabled' => $isEnabled,
                ]);
                $newId = (int)$pdo->lastInsertId();
                $pdo->prepare('INSERT INTO station_status (station_id, status) VALUES (:id, "unknown")')
                    ->execute(['id' => $newId]);
            }
            header('Location: /stations.php');
            exit;
        }
    } elseif ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        $pdo->prepare('DELETE FROM stations WHERE id = :id')->execute(['id' => $id]);
        header('Location: /stations.php');
        exit;
    }
}

if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare('SELECT * FROM stations WHERE id = :id');
    $stmt->execute(['id' => (int)$_GET['edit']]);
    $edit = $stmt->fetch() ?: null;
}

$stations = $pdo->query(
    'SELECT s.*, st.status, st.last_check_at, st.last_data_at
     FROM stations s LEFT JOIN station_status st ON st.station_id = s.id
     ORDER BY s.name'
)->fetchAll();

$pageTitle = 'Базовые станции';
$pageIcon = 'bi-hdd-network';
require __DIR__ . '/app/views/_head.php';
?>
  <?php if ($error): ?>
    <div class="alert alert-danger"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
  <?php endif; ?>

  <div class="card surface-card mb-4">
    <div class="card-body">
      <h2 class="h6 mb-3"><?= $edit ? 'Изменить станцию' : 'Добавить станцию' ?></h2>
      <form method="post" action="/stations.php" class="row g-3">
        <input type="hidden" name="action" value="save">
        <input type="hidden" name="id" value="<?= (int)($edit['id'] ?? 0) ?>">

        <div class="col-md-6">
          <label class="form-label small">Название*</label>
          <input type="text" name="name" class="form-control" required value="<?= htmlspecialchars($edit['name'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="col-md-6">
          <label class="form-label small">Хост (IP/домен)*</label>
          <input type="text" name="host" class="form-control" required value="<?= htmlspecialchars($edit['host'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="col-md-3">
          <label class="form-label small">Порт*</label>
          <input type="number" name="port" class="form-control" required value="<?= htmlspecialchars((string)($edit['port'] ?? 2101), ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="col-md-3">
          <label class="form-label small">Mountpoint*</label>
          <input type="text" name="mountpoint" class="form-control" required value="<?= htmlspecialchars($edit['mountpoint'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="col-md-3">
          <label class="form-label small">NTRIP логин</label>
          <input type="text" name="ntrip_user" class="form-control" value="<?= htmlspecialchars($edit['ntrip_user'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="col-md-3">
          <label class="form-label small">NTRIP пароль</label>
          <input type="password" name="ntrip_password" class="form-control" value="<?= htmlspecialchars($edit['ntrip_password'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="col-md-3">
          <label class="form-label small">Широта (lat)*</label>
          <input type="text" name="lat" class="form-control" required value="<?= htmlspecialchars((string)($edit['lat'] ?? ''), ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="col-md-3">
          <label class="form-label small">Долгота (lon)*</label>
          <input type="text" name="lon" class="form-control" required value="<?= htmlspecialchars((string)($edit['lon'] ?? ''), ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="col-md-6">
          <label class="form-label small">Подпапка RINEX (внутри E:\Ftp\RINEX\RINEX\2026)</label>
          <input type="text" name="rinex_path" class="form-control" value="<?= htmlspecialchars($edit['rinex_path'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="col-md-6">
          <label class="form-label small">Комментарий</label>
          <input type="text" name="comment" class="form-control" value="<?= htmlspecialchars($edit['comment'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="col-12 form-check">
          <input type="checkbox" name="is_enabled" class="form-check-input" id="isEnabled" <?= empty($edit) || !empty($edit['is_enabled']) ? 'checked' : '' ?>>
          <label class="form-check-label" for="isEnabled">Включена (опрашивать статус)</label>
        </div>
        <div class="col-12 d-flex gap-2">
          <button type="submit" class="btn btn-primary"><?= $edit ? 'Сохранить' : 'Добавить' ?></button>
          <?php if ($edit): ?><a href="/stations.php" class="btn btn-outline-secondary">Отмена</a><?php endif; ?>
        </div>
      </form>
    </div>
  </div>

  <div class="card surface-card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="h6 mb-0">Список станций</h2>
        <input type="text" id="stationsSearch" class="form-control form-control-sm" style="max-width: 260px" placeholder="Поиск по названию/хосту...">
      </div>
      <div class="table-responsive">
        <table class="table table-clean align-middle" id="stationsTable">
          <thead>
            <tr><th>Название</th><th>Хост:порт</th><th>Mount</th><th>Статус</th><th>Последняя проверка</th><th></th></tr>
          </thead>
          <tbody>
          <?php foreach ($stations as $s): ?>
            <tr>
              <td><?= htmlspecialchars($s['name'], ENT_QUOTES, 'UTF-8') ?></td>
              <td><?= htmlspecialchars($s['host'] . ':' . $s['port'], ENT_QUOTES, 'UTF-8') ?></td>
              <td><?= htmlspecialchars($s['mountpoint'], ENT_QUOTES, 'UTF-8') ?></td>
              <td><span class="status-pill status-<?= htmlspecialchars($s['status'] ?? 'unknown', ENT_QUOTES, 'UTF-8') ?>"><?= htmlspecialchars($s['status'] ?? 'unknown', ENT_QUOTES, 'UTF-8') ?></span></td>
              <td><?= htmlspecialchars($s['last_check_at'] ?? '—', ENT_QUOTES, 'UTF-8') ?></td>
              <td class="text-end">
                <a href="/stations.php?edit=<?= (int)$s['id'] ?>" class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></a>
                <form method="post" action="/stations.php" class="d-inline" onsubmit="return confirm('Удалить станцию?');">
                  <input type="hidden" name="action" value="delete">
                  <input type="hidden" name="id" value="<?= (int)$s['id'] ?>">
                  <button type="submit" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                </form>
              </td>
            </tr>
          <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>
<?php
$extraScripts = <<<'HTML'
<script>
document.getElementById('stationsSearch').addEventListener('input', function () {
  const q = this.value.trim().toLowerCase();
  for (const row of document.querySelectorAll('#stationsTable tbody tr')) {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  }
});
</script>
HTML;
require __DIR__ . '/app/views/_foot.php';
