<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
$user = require_login();
$isAdmin = (current_admin()['role'] ?? null) === 'admin';

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

  <div class="modal fade" id="tourViewerModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered tour-viewer-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="tourViewerTitle">Тур</h5>
          <div class="d-flex align-items-center gap-2 ms-auto">
            <button type="button" class="btn btn-sm btn-outline-secondary" id="tourLayersBtn" title="Слои">
              <i class="bi bi-layers"></i> Слои
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary" id="tourHelpBtn" title="Управление мышью">
              <i class="bi bi-question-circle"></i>
            </button>
            <button type="button" class="btn-close ms-0" data-bs-dismiss="modal"></button>
          </div>
        </div>
        <div class="modal-body p-0 position-relative">
          <div id="tourMouseHelp" class="position-absolute bottom-0 start-0 m-3 p-3 rounded d-none" style="z-index: 1100; background: rgba(0,0,0,.75); color: #fff; max-width: 280px; font-size: 14px;">
            <div class="d-flex align-items-center gap-2 mb-2"><i class="bi bi-mouse2"></i><b>Левая кнопка</b> + перетаскивание — вращение камеры</div>
            <div class="d-flex align-items-center gap-2 mb-2"><i class="bi bi-mouse2"></i><b>Правая кнопка</b> + перетаскивание — панорамирование</div>
            <div class="d-flex align-items-center gap-2"><i class="bi bi-mouse"></i><b>Колесо мыши</b> — масштаб (приближение/отдаление)</div>
          </div>

          <div id="tourLayersPanel" class="position-absolute top-0 end-0 m-3 p-3 rounded d-none" style="z-index: 1100; background: rgba(20,20,20,.92); color: #fff; width: 300px; max-height: 70vh; overflow-y: auto; font-size: 14px;">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <b>Слои</b>
              <a href="#" id="tourExportLink" class="text-white small" target="_blank"><i class="bi bi-download"></i> Экспорт DXF</a>
            </div>
            <div id="tourLayersList"></div>
            <?php if ($isAdmin): ?>
            <form id="tourNewLayerForm" class="d-flex gap-1 mt-2">
              <input type="text" id="tourNewLayerName" class="form-control form-control-sm" placeholder="Новый слой">
              <input type="color" id="tourNewLayerColor" class="form-control form-control-sm" value="#ff3b30" style="max-width: 44px">
              <button type="submit" class="btn btn-sm btn-primary"><i class="bi bi-plus"></i></button>
            </form>
            <?php endif; ?>
          </div>

          <?php if ($isAdmin): ?>
          <div id="tourDrawToolbar" class="position-absolute top-0 start-0 m-3 btn-group d-none" style="z-index: 1100">
            <button type="button" class="btn btn-sm btn-outline-light" data-tool="point" title="Точка"><i class="bi bi-geo-alt"></i></button>
            <button type="button" class="btn btn-sm btn-outline-light" data-tool="polyline" title="Линия"><i class="bi bi-bezier2"></i></button>
            <button type="button" class="btn btn-sm btn-outline-light" data-tool="polygon" title="Полигон"><i class="bi bi-pentagon"></i></button>
            <button type="button" class="btn btn-sm btn-success" id="tourDrawFinishBtn" title="Готово"><i class="bi bi-check-lg"></i></button>
            <button type="button" class="btn btn-sm btn-outline-danger" id="tourDrawCancelBtn" title="Отмена/выключить инструмент"><i class="bi bi-x-lg"></i></button>
          </div>
          <?php endif; ?>

          <button type="button" class="btn btn-sm btn-outline-secondary position-absolute bottom-0 end-0 m-3" id="tourRotateBtn" style="z-index: 1100">
            <i class="bi bi-arrow-clockwise"></i> Повернуть
          </button>
          <div id="tourViewerContainer" style="width: 100%; height: 100%;"></div>
        </div>
      </div>
    </div>
  </div>
<?php
$extraScripts = '<script>const isAdminJs = ' . ($isAdmin ? 'true' : 'false') . ';</script>' . <<<'HTML'
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/",
    "@mkkellogg/gaussian-splats-3d": "https://cdn.jsdelivr.net/npm/@mkkellogg/gaussian-splats-3d@0.4.6/build/gaussian-splats-3d.module.js",
    "@loaders.gl/core": "https://cdn.jsdelivr.net/npm/@loaders.gl/core@4.3.0/+esm",
    "@loaders.gl/las": "https://cdn.jsdelivr.net/npm/@loaders.gl/las@4.3.0/+esm"
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

const tourDataById = {}; // {id: {urls: [...], modelType: 'splat'|'pointcloud'}}

async function loadTours() {
  let data;
  try {
    const res = await fetch('/api/tours.php');
    data = await res.json();
  } catch (e) {
    return;
  }
  for (const t of data.tours) {
    tourDataById[t.id] = {
      urls: t.file_urls && t.file_urls.length ? t.file_urls : [t.file_url],
      modelType: t.model_type || 'splat',
    };
    const typeBadge = t.model_type === 'pointcloud'
      ? '<span class="badge text-bg-info">Point Cloud</span>'
      : '<span class="badge text-bg-primary">3DGS Splat</span>';
    const popup = `<b>${escapeHtml(t.name)}</b> ${typeBadge}` +
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
let pendingModelType = 'splat';
let currentTourUrls = null;
let currentTourId = null;
let GaussianSplats3DModule = null;
let tourLoadGeneration = 0;
let pendingViewerDispose = null; // Promise текущей фоновой очистки старого вьювера (см. ниже)

// --- Просмотрщик LAS-облаков точек (@loaders.gl/las) — отдельный рендер-пайплайн,
// GaussianSplats3D.Viewer облака точек не рисует. Использует тот же
// tourLoadGeneration, что и сплаты, чтобы гонка между двумя типами туров при
// быстром закрытии/открытии модалки гасилась тем же механизмом.
let pointCloudViewer = null; // {renderer, scene, camera, controls, frameId}
let pointCloudLoaderModules = null;

async function getLoadersGl() {
  if (!pointCloudLoaderModules) {
    const core = await import('@loaders.gl/core');
    const las = await import('@loaders.gl/las');
    pointCloudLoaderModules = { load: core.load, LASLoader: las.LASLoader };
  }
  return pointCloudLoaderModules;
}

function disposePointCloudViewer() {
  if (!pointCloudViewer) return;
  const v = pointCloudViewer;
  pointCloudViewer = null;
  cancelAnimationFrame(v.frameId);
  v.controls.dispose();
  v.renderer.dispose();
}

async function loadPointCloudScene(urls) {
  hideViewerError();
  tourLoadGeneration++;
  const myGeneration = tourLoadGeneration;
  if (pendingViewerDispose) {
    await pendingViewerDispose;
  }
  if (myGeneration !== tourLoadGeneration) return;

  disposePointCloudViewer();
  if (tourViewer) {
    const oldViewer = tourViewer;
    tourViewer = null;
    await oldViewer.dispose().catch(() => { /* noop */ });
  }

  const container = document.getElementById('tourViewerContainer');
  container.innerHTML = '';
  const canvasHost = document.createElement('div');
  canvasHost.style.width = '100%';
  canvasHost.style.height = '100%';
  container.appendChild(canvasHost);

  const overlay = document.createElement('div');
  overlay.className = 'position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-secondary';
  overlay.style.zIndex = '1050';
  overlay.style.background = 'var(--bs-body-bg)';
  overlay.textContent = 'Загрузка облака точек...';
  container.appendChild(overlay);

  try {
    const THREE = await getThree();
    const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
    const { load, LASLoader } = await getLoadersGl();
    if (myGeneration !== tourLoadGeneration) { overlay.remove(); return; }

    const scene = new THREE.Scene();
    const width = canvasHost.clientWidth || 1;
    const height = canvasHost.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    canvasHost.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Центр и масштаб считаем по bounding box первого файла — реальные LAS
    // координаты обычно абсолютные геодезические метры (могут быть в
    // миллионах от нуля), без вычитания центра получим артефакты точности
    // float32 и камеру "внутри" облака без ориентиров.
    let centerOffset = null;
    let maxExtent = 1;

    for (const url of urls) {
      if (myGeneration !== tourLoadGeneration) break;
      const data = await load(url, LASLoader);
      const posAttr = data.attributes && data.attributes.POSITION;
      if (!posAttr) continue;
      const pos = posAttr.value;
      const count = pos.length / 3;

      if (!centerOffset) {
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        for (let i = 0; i < count; i++) {
          const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
          if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
        }
        centerOffset = { x: (minX + maxX) / 2, y: (minY + maxY) / 2, z: (minZ + maxZ) / 2 };
        maxExtent = Math.max((maxX - minX) / 2, (maxY - minY) / 2, (maxZ - minZ) / 2, 1);
      }

      const positions = new Float32Array(count * 3);
      // LAS обычно Z-up, наша сцена (как и у GaussianSplats3D) — Y-up:
      // (x,y,z) -> (x, z, -y), координаты центрируем по bbox первого файла.
      for (let i = 0; i < count; i++) {
        const x = pos[i * 3] - centerOffset.x;
        const y = pos[i * 3 + 1] - centerOffset.y;
        const z = pos[i * 3 + 2] - centerOffset.z;
        positions[i * 3] = x;
        positions[i * 3 + 1] = z;
        positions[i * 3 + 2] = -y;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // COLOR_0 у LASLoader — RGBA по 16 бит/канал (см. документацию
      // @loaders.gl/las); если в установленной версии формат иной, цвет
      // выйдет некорректным, но геометрия всё равно отрисуется.
      const colorAttr = data.attributes.COLOR_0 && data.attributes.COLOR_0.value;
      let material;
      if (colorAttr) {
        const size = data.attributes.COLOR_0.size || 4;
        const colors = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          colors[i * 3] = colorAttr[i * size] / 65535;
          colors[i * 3 + 1] = colorAttr[i * size + 1] / 65535;
          colors[i * 3 + 2] = colorAttr[i * size + 2] / 65535;
        }
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        material = new THREE.PointsMaterial({ size: Math.max(maxExtent / 500, 0.005), vertexColors: true });
      } else {
        material = new THREE.PointsMaterial({ size: Math.max(maxExtent / 500, 0.005), color: 0xcccccc });
      }

      scene.add(new THREE.Points(geometry, material));
    }

    if (myGeneration !== tourLoadGeneration) {
      overlay.remove();
      renderer.dispose();
      controls.dispose();
      return;
    }

    camera.far = maxExtent * 20;
    camera.updateProjectionMatrix();
    camera.position.set(0, maxExtent, maxExtent * 2);
    controls.target.set(0, 0, 0);
    controls.update();

    function animate() {
      if (!pointCloudViewer) return;
      pointCloudViewer.frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    pointCloudViewer = { renderer, scene, camera, controls, frameId: 0 };
    overlay.remove();
    animate();
  } catch (e) {
    overlay.remove();
    showViewerError('Не удалось загрузить облако точек: ' + String(e));
  }
}

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
  const data = tourDataById[tourId] || { urls: [], modelType: 'splat' };
  pendingTourUrls = data.urls;
  pendingModelType = data.modelType;
  currentTourId = tourId;
  document.getElementById('tourExportLink').href = '/tour_export.php?tour_id=' + tourId;
  tourModal.show();
}

// addSplatScene() с progressiveLoad:true иногда резолвит свой промис раньше,
// чем сам Viewer внутри сбрасывает флаг "идёт загрузка/выгрузка" (файл
// докачивается в фоне) — следующий addSplatScene() в цикле по нескольким
// файлам тура тогда падает с "Cannot add splat scene while another load or
// unload is already in progress", хотя по факту нужно просто чуть подождать.
// Библиотека не отдаёт публичного способа спросить "уже можно?", поэтому
// просто повторяем попытку с паузой, пока флаг не снимется сам.
async function addSplatSceneWithRetry(viewer, url, options, isStillCurrent) {
  const maxAttempts = 50;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (!isStillCurrent()) return;
    try {
      await viewer.addSplatScene(url, options);
      return;
    } catch (e) {
      const isBusy = /already in progress/i.test(String(e && e.message ? e.message : e));
      if (!isBusy || attempt === maxAttempts - 1) {
        throw e;
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
}

// Ошибка загрузки рисуется отдельным оверлеем поверх всего модал-боди
// (а не внутри tourViewerContainer.innerHTML), чтобы её было видно независимо
// от того, в каком состоянии остался канвас вьювера/point cloud-сцены —
// раньше сообщение могло потеряться за уже отрендеренной моделью.
function showViewerError(message) {
  hideViewerError();
  const body = document.querySelector('#tourViewerModal .modal-body');
  const overlay = document.createElement('div');
  overlay.id = 'tourViewerError';
  overlay.className = 'position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3';
  overlay.style.zIndex = '2000';
  overlay.style.background = 'rgba(0,0,0,.6)';
  overlay.innerHTML = '<div class="alert alert-danger mb-0" style="max-width: 600px;">' + escapeHtml(message) + '</div>';
  body.appendChild(overlay);
}

function hideViewerError() {
  const existing = document.getElementById('tourViewerError');
  if (existing) existing.remove();
}

async function loadTourScene(urls, rotation) {
  hideViewerError();
  // Счётчик поколений — если loadTourScene вызовут повторно (например,
  // два клика по "Повернуть" подряд) до того, как предыдущий вызов
  // закончил свой цикл addSplatScene(), старый цикл должен прерваться,
  // а не продолжать дёргать viewer, который уже заменён новым вызовом.
  const myGeneration = ++tourLoadGeneration;
  const container = document.getElementById('tourViewerContainer');

  // Если модалку только что закрыли (hidden.bs.modal), там уже мог запуститься
  // фоновый dispose() старого вьювера, а tourViewer уже обнулён — без этого
  // ожидания мы создали бы новый вьювер ДО того, как библиотека внутри сняла
  // у себя флаг "идёт загрузка/выгрузка", и addSplatScene() упал бы с
  // "Cannot add splat scene while another load or unload is already in progress".
  if (pendingViewerDispose) {
    try { await pendingViewerDispose; } catch (e) { /* noop */ }
  }

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
    const viewer = new GaussianSplats3DModule.Viewer({
      rootElement: canvasHost,
      cameraUp: [0, 1, 0],
      // На обычном shared-хостинге страница не отдаётся с заголовками
      // Cross-Origin-Opener-Policy/Cross-Origin-Embedder-Policy (это сломало
      // бы загрузку тайлов карты и CDN-скриптов), поэтому SharedArrayBuffer
      // недоступен — отключаем его использование в воркере сортировки.
      sharedMemoryForWorkers: false,
      // Наши модели — это десятки/сотни миллионов сплатов из реальных
      // фотограмметрических сканов (файлы по несколько ГБ), не демо-сцены.
      // Без этих настроек на слабом/среднем GPU камера дёргается при
      // вращении — пересортировка такого объёма точек каждый кадр слишком
      // дорогая. Жертвуем качеством цвета/АА ради стабильного FPS.
      dynamicScene: false,            // сцена статична — не пересчитывать то, что не меняется
      sphericalHarmonicsDegree: 0,    // меньше данных на сплат (без view-dependent цвета)
      // halfPrecisionCovariancesOnGPU: true — убрано: на реальных сканах
      // (не демо-данных) часть сплатов даёт ковариацию вне диапазона half
      // float, отсюда спам "Value out of range" в консоли и потеря точности
      // у части точек. Эффект на FPS был не критичен по сравнению с
      // dynamicScene/sphericalHarmonicsDegree, жертвовать точностью не стоит.
      freeIntermediateSplatData: true,
      antialiased: false,
      ignoreDevicePixelRatio: true,   // не рендерить в полное разрешение Retina/HiDPI
    });
    tourViewer = viewer;
    // Запускаем рендер-цикл сразу и сразу убираем оверлей — дальше сплаты
    // будут проявляться по мере загрузки файлов.
    viewer.start();
    overlay.remove();
    // Слои/аннотации уже могли быть подгружены параллельно (fetchLayers() в
    // shown.bs.modal) — отрисовываем их в сцену сразу, не дожидаясь полной
    // загрузки самой модели.
    renderAllLayerObjects();
    // ВАЖНО: progressiveLoad официально поддерживается только у addSplatScene()
    // (одиночная загрузка), но не у addSplatScenes() (пакетная) — при пакетной
    // загрузке рендер не начинался бы, пока не докачаются ВСЕ файлы. Поэтому
    // несколько файлов одного тура грузим по очереди через addSplatScene().
    // Используем локальную переменную viewer (не глобальный tourViewer) и
    // проверку поколения — если за время await тур переоткрыли/повернули
    // снова, этот цикл должен молча прекратиться, а не лезть в новый viewer.
    //
    // progressiveLoad включаем ТОЛЬКО когда файл один: при нескольких файлах
    // внутренний флаг "идёт загрузка" у Viewer на практике не снимается даже
    // после ретраев (addSplatSceneWithRetry не спасает — ошибка вылетает и
    // через 5+ секунд), т.е. это не гонка, а реальная несовместимость
    // progressiveLoad с последовательной пакетной загрузкой нескольких файлов
    // в этой версии библиотеки. Без progressiveLoad каждый addSplatScene()
    // надёжно дожидается полной загрузки файла перед тем, как резолвить промис.
    const useProgressive = urls.length === 1;
    for (const u of urls) {
      if (myGeneration !== tourLoadGeneration) return;
      await addSplatSceneWithRetry(viewer, u, { rotation: rotation, progressiveLoad: useProgressive }, () => myGeneration === tourLoadGeneration);
    }
  } catch (e) {
    overlay.remove();
    showViewerError('Не удалось загрузить просмотрщик: ' + String(e));
  }
}

// --- Слои и рисование на 3D-модели тура (точки/линии/полигоны + экспорт DXF) ---
let THREEModule = null;
let tourLayersData = [];
const layerGroups = {}; // layerId -> THREE.Group, добавленные в tourViewer.threeScene
let drawingTool = null; // null | 'point' | 'polyline' | 'polygon'
let drawingPoints = [];
let drawingPreviewLine = null;

async function getThree() {
  if (!THREEModule) {
    THREEModule = await import('three');
  }
  return THREEModule;
}

function buildAnnotationObject(THREE, anno, color) {
  const pts = anno.coordinates;
  if (!pts || !pts.length) return null;
  if (anno.geom_type === 'point') {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 12, 12),
      new THREE.MeshBasicMaterial({ color: color })
    );
    mesh.position.set(pts[0][0], pts[0][1], pts[0][2]);
    return mesh;
  }
  const vertices = pts.map(p => new THREE.Vector3(p[0], p[1], p[2]));
  if (anno.geom_type === 'polygon' && vertices.length) {
    vertices.push(vertices[0].clone());
  }
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(vertices),
    new THREE.LineBasicMaterial({ color: color })
  );
}

// Рендерит уже загруженные tourLayersData как THREE-объекты в сцене вьювера.
// Вызывается из loadTourScene() сразу после создания viewer — до этого
// момента tourViewer.threeScene ещё не существует.
async function renderAllLayerObjects() {
  if (!tourViewer || !tourViewer.threeScene) return;
  const THREE = await getThree();
  for (const id in layerGroups) {
    try { tourViewer.threeScene.remove(layerGroups[id]); } catch (e) { /* noop */ }
    delete layerGroups[id];
  }
  for (const layer of tourLayersData) {
    const group = new THREE.Group();
    group.visible = layer.is_visible;
    for (const anno of layer.annotations) {
      const obj = buildAnnotationObject(THREE, anno, layer.color);
      if (obj) group.add(obj);
    }
    tourViewer.threeScene.add(group);
    layerGroups[layer.id] = group;
  }
}

function renderLayersList() {
  const list = document.getElementById('tourLayersList');
  list.innerHTML = '';
  for (const layer of tourLayersData) {
    const row = document.createElement('div');
    row.className = 'd-flex align-items-center gap-2 mb-1';
    row.innerHTML =
      `<input type="checkbox" class="form-check-input layer-visibility" data-layer-id="${layer.id}" ${layer.is_visible ? 'checked' : ''}>` +
      `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${escapeAttr(layer.color)}"></span>` +
      `<span class="flex-grow-1">${escapeHtml(layer.name)}</span>` +
      `<span class="text-secondary small">${layer.annotations.length}</span>` +
      (isAdminJs ? `<button type="button" class="btn btn-sm btn-outline-danger layer-delete" data-layer-id="${layer.id}"><i class="bi bi-trash"></i></button>` : '');
    list.appendChild(row);
  }
  if (!tourLayersData.length) {
    list.innerHTML = '<div class="text-secondary small">Слоёв пока нет</div>';
  }
  list.querySelectorAll('.layer-visibility').forEach((cb) => {
    cb.addEventListener('change', async () => {
      const id = cb.dataset.layerId;
      await fetch('/api/tour_annotations.php', { method: 'POST', body: JSON.stringify({ action: 'toggle_layer', id: id }) });
      const layer = tourLayersData.find((l) => String(l.id) === id);
      if (layer) layer.is_visible = cb.checked;
      if (layerGroups[id]) layerGroups[id].visible = cb.checked;
    });
  });
  list.querySelectorAll('.layer-delete').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Удалить слой со всеми объектами?')) return;
      await fetch('/api/tour_annotations.php', { method: 'POST', body: JSON.stringify({ action: 'delete_layer', id: btn.dataset.layerId }) });
      await fetchLayers();
    });
  });
}

async function fetchLayers() {
  if (!currentTourId) return;
  try {
    const res = await fetch('/api/tour_annotations.php?tour_id=' + currentTourId);
    const data = await res.json();
    tourLayersData = data.layers || [];
  } catch (e) {
    tourLayersData = [];
  }
  renderLayersList();
  await renderAllLayerObjects();
}

// Рейкастинг на сплаты — см. план в serene-wishing-hickey.md: API не
// документирован официально, основан на чтении исходников Viewer.js текущей
// версии библиотеки. Если имена свойств в установленной версии другие —
// упадёт в catch, и рисование просто не будет находить точку под курсором
// (об этом будет видно сообщение в консоли браузера).
async function pickPointOnModel(clientX, clientY) {
  // GaussianSplats3D.Raycaster существует только как внутренний класс
  // библиотеки — в публичных экспортах CDN-сборки (build/*.module.js) его
  // нет (проверено по исходникам пакета на GitHub), поэтому
  // `new GaussianSplats3DModule.Raycaster()` падает с "is not a constructor".
  // Но сам Viewer создаёт такой инстанс при инициализации и хранит его в
  // публичном свойстве `viewer.raycaster` — берём готовый, без своего импорта.
  if (!tourViewer || !tourViewer.camera || !tourViewer.splatMesh || !tourViewer.raycaster) return null;
  const THREE = await getThree();
  const container = document.getElementById('tourViewerContainer');
  const rect = container.getBoundingClientRect();
  const screenPos = new THREE.Vector2(clientX - rect.left, clientY - rect.top);
  const dims = { x: rect.width, y: rect.height };
  try {
    tourViewer.raycaster.setFromCameraAndScreenPosition(tourViewer.camera, screenPos, dims);
    const hits = [];
    tourViewer.raycaster.intersectSplatMesh(tourViewer.splatMesh, hits);
    if (hits.length > 0 && hits[0].origin) {
      return [hits[0].origin.x, hits[0].origin.y, hits[0].origin.z];
    }
  } catch (e) {
    console.error('Рейкастинг по сплатам не сработал:', e);
  }
  return null;
}

function setDrawingTool(tool) {
  drawingTool = tool;
  drawingPoints = [];
  removeDrawingPreview();
  document.querySelectorAll('#tourDrawToolbar [data-tool]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tool === tool);
  });
}

function removeDrawingPreview() {
  if (drawingPreviewLine && tourViewer && tourViewer.threeScene) {
    try { tourViewer.threeScene.remove(drawingPreviewLine); } catch (e) { /* noop */ }
  }
  drawingPreviewLine = null;
}

async function updateDrawingPreview() {
  if (drawingPoints.length < 2 || !tourViewer || !tourViewer.threeScene) return;
  const THREE = await getThree();
  removeDrawingPreview();
  const vertices = drawingPoints.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  drawingPreviewLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(vertices),
    new THREE.LineBasicMaterial({ color: 0xffff00 })
  );
  tourViewer.threeScene.add(drawingPreviewLine);
}

async function saveAnnotation(geomType, coordinates) {
  // MVP: рисуем всегда в первый слой тура — выбор конкретного слоя для
  // рисования можно добавить позже, если понадобится несколько активных слоёв.
  const layer = tourLayersData[0];
  if (!layer) {
    alert('Сначала создайте слой (кнопка «Слои» → поле снизу панели)');
    return;
  }
  await fetch('/api/tour_annotations.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'save_annotation', layer_id: layer.id, geom_type: geomType, coordinates: coordinates }),
  });
  await fetchLayers();
}

async function finishDrawing() {
  if (!drawingTool || drawingPoints.length < 2) return;
  await saveAnnotation(drawingTool, drawingPoints);
  drawingPoints = [];
  removeDrawingPreview();
}

async function onViewerContainerClick(e) {
  if (!drawingTool || !isAdminJs) return;
  const point = await pickPointOnModel(e.clientX, e.clientY);
  if (!point) return;
  if (drawingTool === 'point') {
    await saveAnnotation('point', [point]);
  } else {
    drawingPoints.push(point);
    await updateDrawingPreview();
  }
}

document.getElementById('tourViewerContainer').addEventListener('click', onViewerContainerClick);

document.getElementById('tourLayersBtn').addEventListener('click', () => {
  document.getElementById('tourLayersPanel').classList.toggle('d-none');
});

document.getElementById('tourNewLayerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('tourNewLayerName').value.trim();
  const color = document.getElementById('tourNewLayerColor').value;
  if (!name || !currentTourId) return;
  await fetch('/api/tour_annotations.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'create_layer', tour_id: currentTourId, name: name, color: color }),
  });
  document.getElementById('tourNewLayerName').value = '';
  await fetchLayers();
});

document.querySelectorAll('#tourDrawToolbar [data-tool]').forEach((btn) => {
  btn.addEventListener('click', () => setDrawingTool(btn.dataset.tool));
});
document.getElementById('tourDrawFinishBtn')?.addEventListener('click', finishDrawing);
document.getElementById('tourDrawCancelBtn')?.addEventListener('click', () => setDrawingTool(null));

document.getElementById('tourHelpBtn').addEventListener('click', () => {
  document.getElementById('tourMouseHelp').classList.toggle('d-none');
});

tourModalEl.addEventListener('shown.bs.modal', () => {
  // Подсказку по управлению показываем сразу при открытии тура, чтобы
  // пользователь увидел её без лишнего клика — скрыть можно той же кнопкой.
  document.getElementById('tourMouseHelp').classList.remove('d-none');
  document.getElementById('tourLayersPanel').classList.add('d-none');
  setDrawingTool(null);
  const toolbar = document.getElementById('tourDrawToolbar');
  const rotateBtn = document.getElementById('tourRotateBtn');
  const isPointCloud = pendingModelType === 'pointcloud';
  // Рисование/слои поверх модели и пресеты поворота сделаны под рейкастинг
  // GaussianSplats3D — для point cloud своего рейкастинга/поворота нет
  // (свободное вращение камеры уже даёт OrbitControls), поэтому прячем.
  if (toolbar) toolbar.classList.toggle('d-none', isPointCloud);
  rotateBtn.classList.toggle('d-none', isPointCloud);
  fetchLayers();
  if (!pendingTourUrls) return;
  currentTourUrls = pendingTourUrls;
  pendingTourUrls = null;
  if (isPointCloud) {
    loadPointCloudScene(currentTourUrls);
  } else {
    loadTourScene(currentTourUrls, rotationPresets[rotationIndex]);
  }
});

document.getElementById('tourRotateBtn').addEventListener('click', () => {
  if (!currentTourUrls || pendingModelType === 'pointcloud') return;
  rotationIndex = (rotationIndex + 1) % rotationPresets.length;
  loadTourScene(currentTourUrls, rotationPresets[rotationIndex]);
});

tourModalEl.addEventListener('hidden.bs.modal', () => {
  hideViewerError();
  currentTourUrls = null;
  currentTourId = null;
  tourLayersData = [];
  for (const id in layerGroups) {
    delete layerGroups[id];
  }
  drawingTool = null;
  drawingPoints = [];
  drawingPreviewLine = null;
  if (pointCloudViewer) {
    disposePointCloudViewer();
    document.getElementById('tourViewerContainer').innerHTML = '';
  }
  if (tourViewer) {
    const oldViewer = tourViewer;
    tourViewer = null;
    // Не await здесь — закрытие модалки не должно блокироваться, но и
    // следующий loadTourScene() не должен стартовать раньше времени, поэтому
    // публикуем промис в pendingViewerDispose (см. loadTourScene выше).
    pendingViewerDispose = oldViewer.dispose()
      .catch(() => { /* noop */ })
      .finally(() => {
        pendingViewerDispose = null;
        document.getElementById('tourViewerContainer').innerHTML = '';
      });
  } else {
    document.getElementById('tourViewerContainer').innerHTML = '';
  }
});
</script>
HTML;
require __DIR__ . '/app/views/_foot.php';
