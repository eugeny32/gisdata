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
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body p-0 position-relative">
          <button type="button" class="btn btn-sm btn-outline-secondary position-absolute bottom-0 end-0 m-3" id="tourRotateBtn" style="z-index: 1100">
            <i class="bi bi-arrow-clockwise"></i> Повернуть
          </button>
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

const tourUrlsById = {};

async function loadTours() {
  let data;
  try {
    const res = await fetch('/api/tours.php');
    data = await res.json();
  } catch (e) {
    return;
  }
  for (const t of data.tours) {
    tourUrlsById[t.id] = t.file_urls && t.file_urls.length ? t.file_urls : [t.file_url];
    const popup = `<b>${escapeHtml(t.name)}</b>` +
      (t.description ? `<br>${escapeHtml(t.description)}` : '') +
      `<br><button type="button" class="btn btn-sm btn-outline-primary mt-2" ` +
      `onclick="openTour(${t.id}, '${escapeAttr(t.name)}')">` +
      `<i class="bi bi-camera-reels"></i> Открыть тур</button>`;
    L.marker([t.lat, t.lon], { icon: tourMarkerIcon() }).addTo(map).bindPopup(popup);
  }
}
loadTours();

// --- Просмотрщик 3DGS (mkkellogg/GaussianSplats3D, библиотеки грузятся лениво по клику) ---
let tourViewer = null;
let pendingTourUrls = null;
let currentTourUrls = null;
let GaussianSplats3DModule = null;

// Кватернионы [x,y,z,w] — перебираем поворотами по 90°/180° вокруг разных
// осей, пока модель не встанет правильно (кнопка «Повернуть» в шапке модалки).
const rotationPresets = [
  [-0.7071, 0, 0, 0.7071],      // -90° X — подобрано опытным путём, подходит для текущих моделей
  [0, 0, 0, 1],                 // без поворота
  [1, 0, 0, 0],                 // 180° X
  [0, 0, 1, 0],                 // 180° Z
  [0, 1, 0, 0],                 // 180° Y
  [0.7071, 0, 0, 0.7071],       // 90° X
  [0, 0, 0.7071, 0.7071],       // 90° Z
  [0, 0, -0.7071, 0.7071],      // -90° Z
];
let rotationIndex = 0; // дефолт — рабочий вариант, кнопка «Повернуть» — если у конкретной модели потребуется другой

const tourModalEl = document.getElementById('tourViewerModal');
const tourModal = new bootstrap.Modal(tourModalEl);

function openTour(tourId, name) {
  document.getElementById('tourViewerTitle').textContent = name;
  pendingTourUrls = tourUrlsById[tourId] || [];
  tourModal.show();
}

async function loadTourScene(urls, rotation) {
  const container = document.getElementById('tourViewerContainer');

  if (tourViewer) {
    const oldViewer = tourViewer;
    tourViewer = null;
    try {
      // dispose() асинхронный и сам чистит DOM внутри container — нужно
      // дождаться его завершения, иначе наш innerHTML ниже подменит узлы
      // раньше, и внутренняя очистка вьювера упадёт на removeChild.
      await oldViewer.dispose();
    } catch (e) { /* noop — гонка при очистке не критична */ }
  }
  container.innerHTML = '';
  container.style.position = 'relative';

  // Канвас вьювера и оверлей "Загрузка..." — отдельные слои. Оверлей нужен
  // только на момент инициализации вьювера/импорта библиотек, дальше сплаты
  // проявляются прямо в канвасе по мере загрузки файла (progressiveLoad).
  const canvasHost = document.createElement('div');
  canvasHost.style.width = '100%';
  canvasHost.style.height = '100%';
  container.appendChild(canvasHost);

  const overlay = document.createElement('div');
  overlay.className = 'position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-secondary';
  overlay.style.zIndex = '1050';
  overlay.style.background = 'var(--bs-body-bg)';
  overlay.textContent = 'Загрузка модели...';
  container.appendChild(overlay);

  try {
    if (!GaussianSplats3DModule) {
      GaussianSplats3DModule = await import('@mkkellogg/gaussian-splats-3d');
    }
    tourViewer = new GaussianSplats3DModule.Viewer({
      rootElement: canvasHost,
      cameraUp: [0, 1, 0],
      // На обычном shared-хостинге страница не отдаётся с заголовками
      // Cross-Origin-Opener-Policy/Cross-Origin-Embedder-Policy (это сломало
      // бы загрузку тайлов карты и CDN-скриптов), поэтому SharedArrayBuffer
      // недоступен — отключаем его использование в воркере сортировки.
      sharedMemoryForWorkers: false,
    });
    // Запускаем рендер-цикл сразу и сразу убираем оверлей — дальше сплаты
    // будут проявляться по мере загрузки файлов (progressiveLoad: true).
    tourViewer.start();
    overlay.remove();
    // Несколько файлов одного тура (общая система координат, без ручного
    // совмещения) — грузим все сразу через addSplatScenes(), один и тот же
    // поворот применяется к каждому, т.к. он компенсирует общую ориентацию
    // исходных данных, а не взаимное расположение кусков.
    await tourViewer.addSplatScenes(
      urls.map((u) => ({ path: u, rotation: rotation, progressiveLoad: true }))
    );
  } catch (e) {
    overlay.remove();
    container.innerHTML = '<div class="alert alert-danger m-3">Не удалось загрузить просмотрщик: ' + escapeHtml(String(e)) + '</div>';
  }
}

tourModalEl.addEventListener('shown.bs.modal', () => {
  if (!pendingTourUrls) return;
  currentTourUrls = pendingTourUrls;
  pendingTourUrls = null;
  loadTourScene(currentTourUrls, rotationPresets[rotationIndex]);
});

document.getElementById('tourRotateBtn').addEventListener('click', () => {
  if (!currentTourUrls) return;
  rotationIndex = (rotationIndex + 1) % rotationPresets.length;
  loadTourScene(currentTourUrls, rotationPresets[rotationIndex]);
});

tourModalEl.addEventListener('hidden.bs.modal', async () => {
  currentTourUrls = null;
  if (tourViewer) {
    const oldViewer = tourViewer;
    tourViewer = null;
    try { await oldViewer.dispose(); } catch (e) { /* noop */ }
  }
  document.getElementById('tourViewerContainer').innerHTML = '';
});
</script>
HTML;
require __DIR__ . '/app/views/_foot.php';
