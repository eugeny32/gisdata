<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
$user = require_login();

$pageTitle = 'Карта базовых станций';
$pageIcon = 'bi-map';
require __DIR__ . '/app/views/_head.php';
?>
  <div class="card surface-card mb-3">
    <div class="card-body py-2">
      <div class="row g-2 align-items-center">
        <div class="col-md-4">
          <input type="text" id="stationSearch" class="form-control form-control-sm" placeholder="Поиск по названию...">
        </div>
        <div class="col-md-3">
          <select id="stationCodeFilter" class="form-select form-select-sm">
            <option value="">Все коды станций</option>
          </select>
        </div>
        <div class="col-md-5 text-md-end small text-secondary">
          Станций: <span id="countTotal">0</span>,
          онлайн: <span id="countOnline" class="text-success">0</span>,
          офлайн: <span id="countOffline" class="text-danger">0</span>
        </div>
      </div>
    </div>
  </div>

  <div class="card map-card">
    <div id="map"></div>
    <div class="legend">
      <span class="status-pill status-online">online</span>
      <span class="status-pill status-offline">offline</span>
      <span class="status-pill status-unknown">unknown</span>
      <span class="legend-note d-inline-flex align-items-center gap-1"><i class="bi bi-camera-reels-fill" style="color:#8e44ad"></i>3D-тур</span>
      <span class="legend-note" id="lastUpdate"></span>
    </div>
  </div>

  <div class="modal fade" id="tourViewerModal" tabindex="-1">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="tourViewerTitle">Тур</h5>
          <button type="button" class="btn btn-sm btn-outline-secondary me-2" id="tourRotateBtn">
            <i class="bi bi-arrow-clockwise"></i> Повернуть
          </button>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body p-0">
          <div id="tourViewerContainer" style="width: 100%; height: 100%;"></div>
        </div>
      </div>
    </div>
  </div>
<?php
$extraScripts = <<<'HTML'
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
    "@mkkellogg/gaussian-splats-3d": "https://cdn.jsdelivr.net/npm/@mkkellogg/gaussian-splats-3d@0.4.6/build/gaussian-splats-3d.module.js"
  }
}
</script>
<script>
const map = L.map('map').setView([55.75, 37.6], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

const markers = new Map();
const colors = { online: '#2ecc71', offline: '#e74c3c', unknown: '#95a5a6' };
let allStations = [];

function markerIcon(status) {
  return L.divIcon({
    className: 'station-marker',
    html: `<span style="background:${colors[status] || colors.unknown}"></span>`,
    iconSize: [16, 16],
  });
}

function populateCodeFilter(stations) {
  const select = document.getElementById('stationCodeFilter');
  const existing = new Set(Array.from(select.options).map(o => o.value));
  for (const s of stations) {
    if (s.station_code && !existing.has(s.station_code)) {
      const opt = document.createElement('option');
      opt.value = s.station_code;
      opt.textContent = s.station_code;
      select.appendChild(opt);
      existing.add(s.station_code);
    }
  }
}

function applyFilter() {
  const q = document.getElementById('stationSearch').value.trim().toLowerCase();
  const code = document.getElementById('stationCodeFilter').value;
  const filtered = allStations.filter(s =>
    (!q || s.name.toLowerCase().includes(q)) &&
    (!code || s.station_code === code)
  );
  renderMarkers(filtered);

  document.getElementById('countTotal').textContent = filtered.length;
  document.getElementById('countOnline').textContent = filtered.filter(s => s.status === 'online').length;
  document.getElementById('countOffline').textContent = filtered.filter(s => s.status !== 'online').length;
}

function renderMarkers(stations) {
  const seen = new Set();
  for (const s of stations) {
    seen.add(s.id);
    const popup = `<b>${s.name}</b><br>${s.host}:${s.port} / ${s.station_code}<br>` +
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

  allStations = data.stations;
  populateCodeFilter(allStations);
  applyFilter();

  document.getElementById('lastUpdate').textContent = 'Обновлено: ' + new Date().toLocaleTimeString();
}

document.getElementById('stationSearch').addEventListener('input', applyFilter);
document.getElementById('stationCodeFilter').addEventListener('change', applyFilter);

refresh();
setInterval(refresh, 15000);

// --- Слой 3DGS-туров (отдельный от станций, метки не меняются в реальном времени) ---
function tourMarkerIcon() {
  return L.divIcon({
    className: 'station-marker',
    html: '<span style="background:#8e44ad"></span>',
    iconSize: [16, 16],
  });
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s ?? '';
  return div.innerHTML;
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, '&#39;');
}

async function loadTours() {
  let data;
  try {
    const res = await fetch('/api/tours.php');
    data = await res.json();
  } catch (e) {
    return;
  }
  for (const t of data.tours) {
    const popup = `<b>${escapeHtml(t.name)}</b>` +
      (t.description ? `<br>${escapeHtml(t.description)}` : '') +
      `<br><button type="button" class="btn btn-sm btn-outline-primary mt-2" ` +
      `onclick="openTour('${escapeAttr(t.name)}', '${escapeAttr(t.file_url)}')">` +
      `<i class="bi bi-camera-reels"></i> Открыть тур</button>`;
    L.marker([t.lat, t.lon], { icon: tourMarkerIcon() }).addTo(map).bindPopup(popup);
  }
}
loadTours();

// --- Просмотрщик 3DGS (mkkellogg/GaussianSplats3D, библиотеки грузятся лениво по клику) ---
let tourViewer = null;
let pendingTourUrl = null;
let currentTourUrl = null;
let GaussianSplats3DModule = null;

// Кватернионы [x,y,z,w] — перебираем поворотами по 90°/180° вокруг разных
// осей, пока модель не встанет правильно (кнопка «Повернуть» в шапке модалки).
const rotationPresets = [
  [0, 0, 0, 1],                 // без поворота
  [1, 0, 0, 0],                 // 180° X
  [0, 0, 1, 0],                 // 180° Z
  [0, 1, 0, 0],                 // 180° Y
  [0.7071, 0, 0, 0.7071],       // 90° X
  [-0.7071, 0, 0, 0.7071],      // -90° X
  [0, 0, 0.7071, 0.7071],       // 90° Z
  [0, 0, -0.7071, 0.7071],      // -90° Z
];
let rotationIndex = 1; // начинаем с 180° X — это чаще всего и нужно

const tourModalEl = document.getElementById('tourViewerModal');
const tourModal = new bootstrap.Modal(tourModalEl);

function openTour(name, url) {
  document.getElementById('tourViewerTitle').textContent = name;
  pendingTourUrl = url;
  tourModal.show();
}

async function loadTourScene(url, rotation) {
  const container = document.getElementById('tourViewerContainer');

  if (tourViewer) {
    try { tourViewer.dispose(); } catch (e) { /* noop */ }
    tourViewer = null;
  }
  container.innerHTML = '<div class="d-flex align-items-center justify-content-center h-100 text-secondary">Загрузка модели...</div>';

  try {
    if (!GaussianSplats3DModule) {
      GaussianSplats3DModule = await import('@mkkellogg/gaussian-splats-3d');
    }
    container.innerHTML = '';
    tourViewer = new GaussianSplats3DModule.Viewer({
      rootElement: container,
      cameraUp: [0, 1, 0],
      // На обычном shared-хостинге страница не отдаётся с заголовками
      // Cross-Origin-Opener-Policy/Cross-Origin-Embedder-Policy (это сломало
      // бы загрузку тайлов карты и CDN-скриптов), поэтому SharedArrayBuffer
      // недоступен — отключаем его использование в воркере сортировки.
      sharedMemoryForWorkers: false,
    });
    await tourViewer.addSplatScene(url, {
      progressiveLoad: true,
      rotation: rotation,
    });
    tourViewer.start();
  } catch (e) {
    container.innerHTML = '<div class="alert alert-danger m-3">Не удалось загрузить просмотрщик: ' + escapeHtml(String(e)) + '</div>';
  }
}

tourModalEl.addEventListener('shown.bs.modal', () => {
  if (!pendingTourUrl) return;
  currentTourUrl = pendingTourUrl;
  pendingTourUrl = null;
  loadTourScene(currentTourUrl, rotationPresets[rotationIndex]);
});

document.getElementById('tourRotateBtn').addEventListener('click', () => {
  if (!currentTourUrl) return;
  rotationIndex = (rotationIndex + 1) % rotationPresets.length;
  loadTourScene(currentTourUrl, rotationPresets[rotationIndex]);
});

tourModalEl.addEventListener('hidden.bs.modal', () => {
  if (tourViewer) {
    try { tourViewer.dispose(); } catch (e) { /* noop */ }
    tourViewer = null;
  }
  currentTourUrl = null;
  document.getElementById('tourViewerContainer').innerHTML = '';
});
</script>
HTML;
require __DIR__ . '/app/views/_foot.php';
