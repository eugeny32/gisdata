<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
require_login();

$pdo = db();

$counts = ['online' => 0, 'offline' => 0, 'unknown' => 0];
foreach ($pdo->query('SELECT status, COUNT(*) AS c FROM station_status GROUP BY status') as $row) {
    $counts[$row['status']] = (int)$row['c'];
}
$total = (int)$pdo->query('SELECT COUNT(*) FROM stations WHERE is_enabled = 1')->fetchColumn();

$recentLog = $pdo->query(
    'SELECT s.name, l.status, l.checked_at, l.error_message
     FROM station_log l
     JOIN stations s ON s.id = l.station_id
     ORDER BY l.checked_at DESC
     LIMIT 10'
)->fetchAll();

$pageTitle = 'Главная';
$pageIcon = 'bi-house';
require __DIR__ . '/app/views/_head.php';
?>
  <div class="row g-3 mb-3">
    <div class="col-md-4">
      <div class="card surface-card h-100">
        <div class="card-body">
          <div class="text-secondary small">Станций всего</div>
          <div class="fs-2 fw-semibold"><?= $total ?></div>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card surface-card h-100">
        <div class="card-body">
          <div class="text-secondary small">Онлайн</div>
          <div class="fs-2 fw-semibold text-success"><?= $counts['online'] ?></div>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card surface-card h-100">
        <div class="card-body">
          <div class="text-secondary small">Офлайн / неизвестно</div>
          <div class="fs-2 fw-semibold text-danger"><?= $counts['offline'] + $counts['unknown'] ?></div>
        </div>
      </div>
    </div>
  </div>

  <div class="row g-3">
    <div class="col-lg-6">
      <div class="card surface-card h-100">
        <div class="card-body">
          <h2 class="h6 mb-3">Последние события</h2>
          <div class="table-responsive">
            <table class="table table-clean table-sm mb-0">
              <thead><tr><th>Станция</th><th>Статус</th><th>Время</th></tr></thead>
              <tbody>
              <?php foreach ($recentLog as $l): ?>
                <tr>
                  <td><?= htmlspecialchars($l['name'], ENT_QUOTES, 'UTF-8') ?></td>
                  <td><span class="status-pill status-<?= htmlspecialchars($l['status'], ENT_QUOTES, 'UTF-8') ?>"><?= htmlspecialchars($l['status'], ENT_QUOTES, 'UTF-8') ?></span></td>
                  <td><?= htmlspecialchars($l['checked_at'], ENT_QUOTES, 'UTF-8') ?></td>
                </tr>
              <?php endforeach; ?>
              <?php if (!$recentLog): ?>
                <tr><td colspan="3" class="text-muted">Нет данных</td></tr>
              <?php endif; ?>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="col-lg-6">
      <div class="card map-card map-card-sm">
        <div id="miniMap"></div>
      </div>
    </div>
  </div>
<?php
$extraScripts = <<<'HTML'
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
const miniMap = L.map('miniMap', { zoomControl: false }).setView([55.75, 37.6], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(miniMap);
const miniColors = { online: '#2ecc71', offline: '#e74c3c', unknown: '#95a5a6' };
fetch('/api/stations_status.php').then(r => r.json()).then(data => {
  for (const s of data.stations) {
    L.circleMarker([s.lat, s.lon], { radius: 5, color: miniColors[s.status] || miniColors.unknown, fillOpacity: .8 })
      .addTo(miniMap)
      .bindPopup(`<b>${s.name}</b><br>${s.status}`);
  }
}).catch(() => {});
</script>
HTML;
require __DIR__ . '/app/views/_foot.php';
