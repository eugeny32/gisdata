<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
$user = require_login();
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Карта базовых станций</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
<?php include __DIR__ . '/app/views/_nav.php'; ?>
<main class="container map-page">
  <h1>Карта базовых станций</h1>
  <div id="map"></div>
  <div class="legend">
    <span class="status-pill status-online">online</span>
    <span class="status-pill status-offline">offline</span>
    <span class="status-pill status-unknown">unknown</span>
    <span class="legend-note" id="lastUpdate"></span>
  </div>
</main>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
const map = L.map('map').setView([55.75, 37.6], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

const markers = new Map();
const colors = { online: '#2ecc71', offline: '#e74c3c', unknown: '#95a5a6' };

function markerIcon(status) {
  return L.divIcon({
    className: 'station-marker',
    html: `<span style="background:${colors[status] || colors.unknown}"></span>`,
    iconSize: [16, 16],
  });
}

async function refresh() {
  let data;
  try {
    const res = await fetch('/api/stations_status.php');
    data = await res.json();
  } catch (e) {
    document.getElementById('lastUpdate').textContent = 'Ошибка загрузки статуса: ' + e;
    return;
  }

  const seen = new Set();
  for (const s of data.stations) {
    seen.add(s.id);
    const popup = `<b>${s.name}</b><br>${s.host}:${s.port} / ${s.mountpoint}<br>` +
      `Статус: <b>${s.status}</b><br>Последняя проверка: ${s.last_check_at ?? '—'}<br>` +
      `Последние данные: ${s.last_data_at ?? '—'}` +
      (s.comment ? `<br>${s.comment}` : '');

    if (markers.has(s.id)) {
      const m = markers.get(s.id);
      m.setLatLng([s.lat, s.lon]);
      m.setIcon(markerIcon(s.status));
      m.setPopupContent(popup);
    } else {
      const m = L.marker([s.lat, s.lon], { icon: markerIcon(s.status) }).addTo(map).bindPopup(popup);
      markers.set(s.id, m);
    }
  }

  for (const [id, m] of markers) {
    if (!seen.has(id)) {
      map.removeLayer(m);
      markers.delete(id);
    }
  }

  document.getElementById('lastUpdate').textContent = 'Обновлено: ' + new Date().toLocaleTimeString();
}

refresh();
setInterval(refresh, 15000);
</script>
</body>
</html>
