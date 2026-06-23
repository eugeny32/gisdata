<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
require __DIR__ . '/app/lib/ntrip_poll.php';
$admin = require_admin_role('admin');

$pdo = db();
$error = null;
$pollResult = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string)($_POST['action'] ?? '');

    if ($action === 'poll_now') {
        set_time_limit(0);
        $stationsToPoll = $pdo->query('SELECT * FROM stations WHERE is_enabled = 1')->fetchAll();
        $counts = poll_stations($pdo, $stationsToPoll, app_config()['ntrip']);
        $pollResult = sprintf(
            'Опрошено станций: %d (online: %d, offline: %d)',
            count($stationsToPoll), $counts['online'] ?? 0, $counts['offline'] ?? 0
        );
    } elseif ($action === 'save') {
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
                     VALUES (:name, :host, :port, :mountpoint, :ntrip_user, :ntrip_password, :lat, :lon, :rinex_path, :comment, :is_enabled)
                     RETURNING id'
                );
                $stmt->execute([
                    'name' => $name, 'host' => $host, 'port' => $port, 'mountpoint' => $mount,
                    'ntrip_user' => $ntripUser ?: null, 'ntrip_password' => $ntripPass ?: null,
                    'lat' => $lat, 'lon' => $lon, 'rinex_path' => $rinexPath ?: null,
                    'comment' => $comment ?: null, 'is_enabled' => $isEnabled,
                ]);
                $newId = (int)$stmt->fetchColumn();
                $pdo->prepare("INSERT INTO station_status (station_id, status) VALUES (:id, 'unknown')")
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

$stations = $pdo->query(
    'SELECT s.*, st.status, st.last_check_at, st.last_data_at
     FROM stations s LEFT JOIN station_status st ON st.station_id = s.id
     ORDER BY s.name'
)->fetchAll();

// Данные для модалки редактирования — по одному объекту на станцию, дальше
// всё подставляется в JS при клике на строку (без доп. запросов) — как на
// странице подписок.
$modalData = [];
foreach ($stations as $s) {
    $modalData[$s['id']] = [
        'name' => $s['name'],
        'host' => $s['host'],
        'port' => (int)$s['port'],
        'mountpoint' => $s['mountpoint'],
        'ntripUser' => $s['ntrip_user'] ?? '',
        'ntripPassword' => $s['ntrip_password'] ?? '',
        'lat' => $s['lat'],
        'lon' => $s['lon'],
        'rinexPath' => $s['rinex_path'] ?? '',
        'comment' => $s['comment'] ?? '',
        'isEnabled' => (bool)$s['is_enabled'],
    ];
}

$pageTitle = 'Базовые станции';
$pageIcon = 'bi-hdd-network';
require __DIR__ . '/app/views/_head.php';
?>
  <?php if ($error): ?>
    <div class="alert alert-danger"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
  <?php endif; ?>
  <?php if ($pollResult): ?>
    <div class="alert alert-success"><?= htmlspecialchars($pollResult, ENT_QUOTES, 'UTF-8') ?></div>
  <?php endif; ?>

  <div class="card surface-card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="h6 mb-0">Список станций</h2>
        <div class="d-flex gap-2">
          <form method="post" action="/stations.php" class="d-inline">
            <input type="hidden" name="action" value="poll_now">
            <button type="submit" class="btn btn-sm btn-outline-secondary"><i class="bi bi-arrow-repeat"></i> Опросить сейчас</button>
          </form>
          <input type="text" id="stationsSearch" class="form-control form-control-sm" style="max-width: 260px" placeholder="Поиск по названию/хосту...">
          <button type="button" class="btn btn-sm btn-primary" id="addStationBtn"><i class="bi bi-plus-lg"></i> Добавить станцию</button>
        </div>
      </div>
      <div class="text-secondary small mb-2">Кликните по строке, чтобы изменить станцию</div>
      <div class="table-responsive">
        <table class="table table-clean align-middle" id="stationsTable">
          <thead>
            <tr><th>Название</th><th>Хост:порт</th><th>Mount</th><th>Статус</th><th>Последняя проверка</th></tr>
          </thead>
          <tbody>
          <?php foreach ($stations as $s): ?>
            <tr class="stations-row" role="button" data-station-id="<?= (int)$s['id'] ?>" style="cursor: pointer">
              <td><?= htmlspecialchars($s['name'], ENT_QUOTES, 'UTF-8') ?></td>
              <td><?= htmlspecialchars($s['host'] . ':' . $s['port'], ENT_QUOTES, 'UTF-8') ?></td>
              <td><?= htmlspecialchars($s['mountpoint'], ENT_QUOTES, 'UTF-8') ?></td>
              <td><span class="status-pill status-<?= htmlspecialchars($s['status'] ?? 'unknown', ENT_QUOTES, 'UTF-8') ?>"><?= htmlspecialchars($s['status'] ?? 'unknown', ENT_QUOTES, 'UTF-8') ?></span></td>
              <td><?= htmlspecialchars($s['last_check_at'] ?? '—', ENT_QUOTES, 'UTF-8') ?></td>
            </tr>
          <?php endforeach; ?>
          <?php if (!$stations): ?>
            <tr><td colspan="5" class="text-muted">Нет станций</td></tr>
          <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="modal fade" id="stationModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <form method="post" action="/stations.php">
          <input type="hidden" name="action" value="save">
          <input type="hidden" name="id" id="modalStationId" value="0">
          <div class="modal-header">
            <h5 class="modal-title" id="modalStationTitle">Новая станция</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body row g-3">
            <div class="col-md-6">
              <label class="form-label small">Название*</label>
              <input type="text" name="name" id="modalName" class="form-control" required>
            </div>
            <div class="col-md-6">
              <label class="form-label small">Хост (IP/домен)*</label>
              <input type="text" name="host" id="modalHost" class="form-control" required>
            </div>
            <div class="col-md-3">
              <label class="form-label small">Порт*</label>
              <input type="number" name="port" id="modalPort" class="form-control" required value="2101">
            </div>
            <div class="col-md-3">
              <label class="form-label small">Mountpoint*</label>
              <input type="text" name="mountpoint" id="modalMountpoint" class="form-control" required>
            </div>
            <div class="col-md-3">
              <label class="form-label small">NTRIP логин</label>
              <input type="text" name="ntrip_user" id="modalNtripUser" class="form-control">
            </div>
            <div class="col-md-3">
              <label class="form-label small">NTRIP пароль</label>
              <input type="password" name="ntrip_password" id="modalNtripPassword" class="form-control">
            </div>
            <div class="col-md-3">
              <label class="form-label small">Широта (lat)*</label>
              <input type="text" name="lat" id="modalLat" class="form-control" required>
            </div>
            <div class="col-md-3">
              <label class="form-label small">Долгота (lon)*</label>
              <input type="text" name="lon" id="modalLon" class="form-control" required>
            </div>
            <div class="col-md-6">
              <label class="form-label small">Подпапка RINEX (внутри E:\Ftp\RINEX\RINEX\2026)</label>
              <input type="text" name="rinex_path" id="modalRinexPath" class="form-control">
            </div>
            <div class="col-md-6">
              <label class="form-label small">Комментарий</label>
              <input type="text" name="comment" id="modalComment" class="form-control">
            </div>
            <div class="col-12 form-check">
              <input type="checkbox" name="is_enabled" class="form-check-input" id="modalIsEnabled" checked>
              <label class="form-check-label" for="modalIsEnabled">Включена (опрашивать статус)</label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" id="modalDeleteStation" class="btn btn-outline-danger me-auto d-none">Удалить</button>
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Закрыть</button>
            <button type="submit" class="btn btn-primary" id="modalSaveBtn">Добавить</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <form method="post" action="/stations.php" id="deleteStationForm" class="d-none">
    <input type="hidden" name="action" value="delete">
    <input type="hidden" name="id" id="deleteStationId">
  </form>
<?php
$modalDataJson = json_encode($modalData, JSON_UNESCAPED_UNICODE);
$extraScripts = <<<HTML
<script>
const stationsData = {$modalDataJson};
const stationModalEl = document.getElementById('stationModal');
const stationModal = new bootstrap.Modal(stationModalEl);

function fillStationModal(id, data) {
  document.getElementById('modalStationId').value = id;
  document.getElementById('modalName').value = data.name || '';
  document.getElementById('modalHost').value = data.host || '';
  document.getElementById('modalPort').value = data.port || 2101;
  document.getElementById('modalMountpoint').value = data.mountpoint || '';
  document.getElementById('modalNtripUser').value = data.ntripUser || '';
  document.getElementById('modalNtripPassword').value = data.ntripPassword || '';
  document.getElementById('modalLat').value = data.lat || '';
  document.getElementById('modalLon').value = data.lon || '';
  document.getElementById('modalRinexPath').value = data.rinexPath || '';
  document.getElementById('modalComment').value = data.comment || '';
  document.getElementById('modalIsEnabled').checked = data.isEnabled !== false;
}

document.querySelectorAll('.stations-row').forEach(row => {
  row.addEventListener('click', () => {
    const id = row.dataset.stationId;
    const data = stationsData[id];
    if (!data) return;

    document.getElementById('modalStationTitle').textContent = 'Станция: ' + data.name;
    document.getElementById('modalSaveBtn').textContent = 'Сохранить';
    fillStationModal(id, data);

    const deleteBtn = document.getElementById('modalDeleteStation');
    deleteBtn.classList.remove('d-none');
    deleteBtn.onclick = () => {
      if (!confirm('Удалить станцию?')) return;
      document.getElementById('deleteStationId').value = id;
      document.getElementById('deleteStationForm').submit();
    };

    stationModal.show();
  });
});

document.getElementById('addStationBtn').addEventListener('click', () => {
  document.getElementById('modalStationTitle').textContent = 'Новая станция';
  document.getElementById('modalSaveBtn').textContent = 'Добавить';
  fillStationModal(0, { port: 2101, isEnabled: true });
  document.getElementById('modalDeleteStation').classList.add('d-none');
  stationModal.show();
});

document.getElementById('stationsSearch').addEventListener('input', function () {
  const q = this.value.trim().toLowerCase();
  for (const row of document.querySelectorAll('#stationsTable tbody tr')) {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  }
});
</script>
HTML;
require __DIR__ . '/app/views/_foot.php';
