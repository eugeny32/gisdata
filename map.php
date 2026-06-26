<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
$user = require_login();
$isAdmin = (current_admin()['role'] ?? null) === 'admin';
$tourGroupsForMap = $isAdmin ? db()->query('SELECT id, name FROM tour_groups ORDER BY name')->fetchAll() : [];

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

  <?php if ($isAdmin): ?>
  <div id="mapContextMenu" class="d-none" style="position:absolute; z-index:1200; background:#1f232b; color:#fff; border-radius:6px; box-shadow:0 4px 16px rgba(0,0,0,.4); min-width:180px; overflow:hidden;">
    <button type="button" id="mapContextAddTour" class="btn btn-sm w-100 text-start text-white" style="border-radius:0;">
      <i class="bi bi-plus-circle"></i> Добавить объект
    </button>
  </div>

  <div class="modal fade" id="quickAddTourModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Новый объект</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <form id="quickAddTourForm" enctype="multipart/form-data">
          <div class="modal-body">
            <input type="hidden" name="action" value="save">
            <input type="hidden" name="id" value="0">
            <input type="hidden" name="lat" id="quickAddLat">
            <input type="hidden" name="lon" id="quickAddLon">
            <input type="hidden" name="is_enabled" value="1">
            <div class="mb-2 small text-secondary">Координаты: <span id="quickAddCoordsLabel"></span></div>
            <div class="mb-2">
              <label class="form-label small">Название*</label>
              <input type="text" name="name" class="form-control" required>
            </div>
            <div class="mb-2">
              <label class="form-label small">Описание</label>
              <input type="text" name="description" class="form-control">
            </div>
            <div class="mb-2">
              <label class="form-label small">Группа</label>
              <select name="group_id" id="quickAddGroupSelect" class="form-select">
                <option value="">Без группы</option>
                <?php foreach ($tourGroupsForMap as $g): ?>
                  <option value="<?= (int)$g['id'] ?>"><?= htmlspecialchars($g['name'], ENT_QUOTES, 'UTF-8') ?></option>
                <?php endforeach; ?>
                <option value="new">+ Новая группа...</option>
              </select>
            </div>
            <div class="mb-2 d-none" id="quickAddNewGroupWrap">
              <label class="form-label small">Название новой группы</label>
              <input type="text" name="new_group_name" id="quickAddNewGroupName" class="form-control">
            </div>
            <div class="mb-2">
              <label class="form-label small">Файл(ы) модели (.ply / .splat / .ksplat / .las)</label>
              <input type="file" name="model_files[]" class="form-control" accept=".ply,.splat,.ksplat,.las" multiple>
              <div class="form-text">.ply автоматически прогоняется через фильтр шума при сохранении.</div>
            </div>
            <div class="mb-2">
              <label class="form-label small">Или файл(ы) уже на сервере — по одному имени на строку</label>
              <textarea name="existing_file" class="form-control" rows="2"></textarea>
            </div>
            <div class="d-none" id="quickAddProgressWrap">
              <div class="progress" style="height: 18px">
                <div class="progress-bar" id="quickAddProgressBar" style="width: 0%">0%</div>
              </div>
            </div>
            <div id="quickAddError" class="alert alert-danger d-none mb-0 mt-2"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Отмена</button>
            <button type="submit" class="btn btn-primary" id="quickAddSubmitBtn">Добавить</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <?php endif; ?>

  <div class="modal fade" id="tourViewerModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered tour-viewer-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="tourViewerTitle">Тур</h5>
          <div class="d-flex align-items-center gap-2 ms-auto">
            <button type="button" class="btn btn-sm btn-outline-secondary" id="tourLayersBtn" title="Слои">
              <i class="bi bi-layers"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary d-none" id="tourSettingsBtn" title="Настройки">
              <i class="bi bi-gear"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary d-none" id="tourCenterBtn" title="Центрировать">
              <i class="bi bi-crosshair"></i>
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

          <div id="tourSettingsPanel" class="position-absolute top-0 end-0 m-3 p-3 rounded d-none" style="z-index: 1100; background: rgba(20,20,20,.92); color: #fff; width: 300px; max-height: 70vh; overflow-y: auto; font-size: 14px;">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <b>Настройки</b>
            </div>
            <div class="mb-2">
              <label class="form-label small mb-0">Угол обзора (FOV): <span id="tourSettingFovValue"></span>°</label>
              <input type="range" class="form-range" id="tourSettingFov" min="20" max="100" step="1">
            </div>
            <div class="row g-2 mb-2">
              <div class="col-6">
                <label class="form-label small mb-0">Near</label>
                <input type="number" class="form-control form-control-sm" id="tourSettingNear" min="0.001" step="0.01">
              </div>
              <div class="col-6">
                <label class="form-label small mb-0">Far</label>
                <input type="number" class="form-control form-control-sm" id="tourSettingFar" min="1" step="1">
              </div>
            </div>
            <div class="mb-2">
              <label class="form-label small mb-0">Проекция</label>
              <select class="form-select form-select-sm" id="tourSettingProjection">
                <option value="perspective">Перспективная</option>
                <option value="orthographic">Ортографическая</option>
              </select>
            </div>
            <div class="mb-2">
              <label class="form-label small mb-0">Режим навигации</label>
              <select class="form-select form-select-sm" id="tourSettingNavMode">
                <option value="orbit">Орбита (вокруг модели)</option>
                <option value="fly">Полёт (свободная камера, WASD)</option>
              </select>
              <div class="small text-secondary">Полёт: левая кнопка — поворот, правая кнопка — сдвиг в стороны (как мышью, так и WASD), Space/Shift — вверх/вниз.</div>
            </div>
            <div class="mb-2">
              <label class="form-label small mb-0">Чувствительность мыши: <span id="tourSettingSensitivityValue"></span></label>
              <input type="range" class="form-range" id="tourSettingSensitivity" min="0.2" max="3" step="0.1">
            </div>
            <div class="mb-2">
              <label class="form-label small mb-0">Скорость зума: <span id="tourSettingZoomSpeedValue"></span></label>
              <input type="range" class="form-range" id="tourSettingZoomSpeed" min="0.2" max="3" step="0.1">
            </div>
            <div class="mb-2">
              <label class="form-label small mb-0">Скорость полёта: <span id="tourSettingMoveSpeedValue"></span></label>
              <input type="range" class="form-range" id="tourSettingMoveSpeed" min="0.5" max="20" step="0.5">
            </div>
            <div class="mb-2">
              <label class="form-label small mb-0">Размер точки (LAS): <span id="tourSettingPointSizeValue"></span>px</label>
              <input type="range" class="form-range" id="tourSettingPointSize" min="1" max="10" step="1">
            </div>
            <div class="form-check form-switch mb-1">
              <input class="form-check-input" type="checkbox" id="tourSettingEdl">
              <label class="form-check-label small" for="tourSettingEdl">Eye-Dome Lighting (EDL)</label>
            </div>
            <div class="small text-secondary">EDL пока без визуального эффекта — флаг сохраняется, сам шейдер появится позже.</div>
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
    "playcanvas": "https://cdn.jsdelivr.net/npm/playcanvas@2.20.0/build/playcanvas/src/index.js",
    "@loaders.gl/core": "https://cdn.jsdelivr.net/npm/@loaders.gl/core@4.3.0/+esm",
    "@loaders.gl/las": "https://cdn.jsdelivr.net/npm/@loaders.gl/las@4.3.0/+esm"
  }
}
</script>
<script>
const map = L.map('map').setView([55.75, 37.6], 5);
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);
// Esri World Imagery — бесплатный спутниковый слой без API-ключа (в отличие
// от Google/Bing, у которых аккаунт и платный лимит обязательны).
const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 19,
  attribution: 'Esri, Maxar, Earthstar Geographics',
});
L.control.layers({ 'Схема': osmLayer, 'Спутник': satelliteLayer }).addTo(map);

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
      (s.comment ? `<br>${s.comment}` : '') +
      `<br><a href="/rinex.php?station=${encodeURIComponent(s.name)}" class="btn btn-sm btn-outline-primary mt-2" target="_blank">` +
      `<i class="bi bi-folder2-open"></i> Запросить RINEX</a>`;

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

let tourMarkers = [];
async function loadTours() {
  let data;
  try {
    const res = await fetch('/api/tours.php');
    data = await res.json();
  } catch (e) {
    return;
  }
  // Снимаем старые маркеры перед перерисовкой — нужно, потому что теперь
  // loadTours() может вызываться повторно (после добавления нового объекта
  // через контекстное меню карты), не только один раз при загрузке страницы.
  for (const m of tourMarkers) {
    map.removeLayer(m);
  }
  tourMarkers = [];
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
    tourMarkers.push(L.marker([t.lat, t.lon], { icon: tourMarkerIcon() }).addTo(map).bindPopup(popup));
  }
}
loadTours();

// --- Контекстное меню карты (правый клик) — быстрое добавление объекта
// (тура) прямо в точке клика, без перехода на отдельную страницу tours.php.
if (isAdminJs) {
  const contextMenu = document.getElementById('mapContextMenu');
  let contextLatLng = null;

  function hideContextMenu() {
    contextMenu.classList.add('d-none');
  }

  map.on('contextmenu', (e) => {
    e.originalEvent.preventDefault();
    contextLatLng = e.latlng;
    const mapContainer = document.getElementById('map');
    const rect = mapContainer.getBoundingClientRect();
    const pageRect = mapContainer.closest('.map-card').getBoundingClientRect();
    contextMenu.style.left = (e.originalEvent.clientX - pageRect.left) + 'px';
    contextMenu.style.top = (e.originalEvent.clientY - pageRect.top) + 'px';
    contextMenu.classList.remove('d-none');
  });
  map.on('click movestart zoomstart', hideContextMenu);
  document.addEventListener('click', (e) => {
    if (!contextMenu.contains(e.target)) hideContextMenu();
  });

  const quickAddModalEl = document.getElementById('quickAddTourModal');
  const quickAddModal = new bootstrap.Modal(quickAddModalEl);
  const quickAddForm = document.getElementById('quickAddTourForm');
  const quickAddGroupSelect = document.getElementById('quickAddGroupSelect');
  const quickAddNewGroupWrap = document.getElementById('quickAddNewGroupWrap');

  quickAddGroupSelect.addEventListener('change', () => {
    quickAddNewGroupWrap.classList.toggle('d-none', quickAddGroupSelect.value !== 'new');
  });

  document.getElementById('mapContextAddTour').addEventListener('click', () => {
    hideContextMenu();
    if (!contextLatLng) return;
    quickAddForm.reset();
    quickAddNewGroupWrap.classList.add('d-none');
    document.getElementById('quickAddError').classList.add('d-none');
    document.getElementById('quickAddLat').value = contextLatLng.lat.toFixed(7);
    document.getElementById('quickAddLon').value = contextLatLng.lng.toFixed(7);
    document.getElementById('quickAddCoordsLabel').textContent =
      contextLatLng.lat.toFixed(6) + ', ' + contextLatLng.lng.toFixed(6);
    quickAddModal.show();
  });

  quickAddForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('quickAddSubmitBtn');
    const progressWrap = document.getElementById('quickAddProgressWrap');
    const progressBar = document.getElementById('quickAddProgressBar');
    const errorBox = document.getElementById('quickAddError');
    errorBox.classList.add('d-none');
    submitBtn.disabled = true;
    progressWrap.classList.remove('d-none');
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';

    // Пустое <input type="file"> всё равно попадает в FormData как пустая
    // часть multipart-тела — на некоторых хостингах это даёт 404 на весь
    // запрос (та же причина, что уже была учтена в форме tours.php).
    const rawData = new FormData(quickAddForm);
    const data = new FormData();
    for (const [key, value] of rawData.entries()) {
      if (value instanceof File && value.name === '' && value.size === 0) continue;
      data.append(key, value);
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/tours.php');
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const pct = Math.round((evt.loaded / evt.total) * 100);
        progressBar.style.width = pct + '%';
        progressBar.textContent = pct + '%';
      }
    };
    xhr.onload = async () => {
      submitBtn.disabled = false;
      progressWrap.classList.add('d-none');
      // tours.php при успехе делает редирект на /tours.php (302) — fetch/XHR
      // сам следует за редиректом и вернёт 200 с HTML списка туров, а не
      // ошибку; xhr.status здесь будет 200 и при успехе, и при ошибке
      // валидации (та же страница с отрендеренным .alert-danger), поэтому
      // отличаем по наличию .alert-danger в ответе, а не по статусу.
      const match = xhr.responseText.match(/<div class="alert alert-danger">([\s\S]*?)<\/div>/);
      if (match) {
        errorBox.textContent = match[1].replace(/<[^>]+>/g, '').trim();
        errorBox.classList.remove('d-none');
        return;
      }
      quickAddModal.hide();
      await loadTours();
    };
    xhr.onerror = () => {
      submitBtn.disabled = false;
      progressWrap.classList.add('d-none');
      errorBox.textContent = 'Ошибка сети при отправке';
      errorBox.classList.remove('d-none');
    };
    xhr.send(data);
  });
}

// --- Унифицированный плеер тура на движке PlayCanvas — заменяет прежний
// пайплайн THREE.js + @mkkellogg/gaussian-splats-3d (3DGS) и THREE.js +
// @loaders.gl/las (точечные облака). Сам движок/камера/штурвал/загрузчики
// теперь живут в собранном TS-бандле viewer/ (см. docs/CURRENT_STATE.md,
// PR0) — здесь только глобальные переменные, которые ещё нужны секции
// "Слои и рисование" ниже, и обращения к window.TourViewer (публичный API
// бандла, см. viewer/README.md) вместо прежних прямых функций.
//
// НЕ перенесено: инструменты рисования аннотаций (точки/линии/полигоны) —
// ниже, в разделе "Слои и рисование", код продолжает проверять
// `tourViewer` (оставлен здесь объявленным, но никогда не присваивается),
// поэтому весь этот функционал просто тихо не работает, пока для него не
// будет сделан свой способ "попадания" в облако сплатов/точек под
// PlayCanvas (готового публичного picking API под gsplat в движке нет).
let pendingTourUrls = null;
let pendingModelType = 'splat';
let currentTourUrls = null;
let currentTourId = null;
let tourViewer = null; // см. комментарий выше — умышленно всегда null

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
// tourViewer всегда null (см. комментарий выше движка) — пока инструмент
// рисования не перенесён на PlayCanvas, это тихий no-op.
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

// Рейкастинг на сплаты — см. план в serene-wishing-hickey.md. Написан под
// GaussianSplats3D.Raycaster; tourViewer теперь всегда null (движок —
// PlayCanvas), поэтому функция всегда возвращает null без ошибок —
// инструменты рисования тихо не работают до отдельного переноса picking'а
// на PlayCanvas.
async function pickPointOnModel(clientX, clientY) {
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

// --- Панель настроек камеры (модуль 4/6) — управляет общим объектом
// window.TourViewer.{get,set}Settings(), который читает сама сцена
// (viewer/src/tourViewer.ts) и применяет на лету, без перезагрузки тура.
function syncSettingsPanelFromViewer() {
  const s = window.TourViewer.getSettings();
  document.getElementById('tourSettingFov').value = s.fov;
  document.getElementById('tourSettingFovValue').textContent = s.fov;
  document.getElementById('tourSettingNear').value = s.nearClip;
  document.getElementById('tourSettingFar').value = s.farClip;
  document.getElementById('tourSettingProjection').value = s.projection;
  // 'walk' пока не предлагается в UI (PR5) — отображаем как 'fly'.
  document.getElementById('tourSettingNavMode').value = s.navigationMode === 'orbit' ? 'orbit' : 'fly';
  document.getElementById('tourSettingSensitivity').value = s.orbitSensitivity;
  document.getElementById('tourSettingSensitivityValue').textContent = s.orbitSensitivity;
  document.getElementById('tourSettingZoomSpeed').value = s.zoomSpeed;
  document.getElementById('tourSettingZoomSpeedValue').textContent = s.zoomSpeed;
  document.getElementById('tourSettingMoveSpeed').value = s.moveSpeed;
  document.getElementById('tourSettingMoveSpeedValue').textContent = s.moveSpeed;
  document.getElementById('tourSettingPointSize').value = s.pointSizePx;
  document.getElementById('tourSettingPointSizeValue').textContent = s.pointSizePx;
  document.getElementById('tourSettingEdl').checked = s.edlEnabled;
}

document.getElementById('tourSettingsBtn').addEventListener('click', () => {
  syncSettingsPanelFromViewer();
  document.getElementById('tourSettingsPanel').classList.toggle('d-none');
});

document.getElementById('tourSettingFov').addEventListener('input', (e) => {
  document.getElementById('tourSettingFovValue').textContent = e.target.value;
  window.TourViewer.setSettings({ fov: Number(e.target.value) });
});
document.getElementById('tourSettingNear').addEventListener('change', (e) => {
  window.TourViewer.setSettings({ nearClip: Number(e.target.value) });
});
document.getElementById('tourSettingFar').addEventListener('change', (e) => {
  window.TourViewer.setSettings({ farClip: Number(e.target.value) });
});
document.getElementById('tourSettingProjection').addEventListener('change', (e) => {
  window.TourViewer.setSettings({ projection: e.target.value });
});
document.getElementById('tourSettingNavMode').addEventListener('change', (e) => {
  window.TourViewer.setSettings({ navigationMode: e.target.value });
  // Иначе фокус остаётся на <select>, и нажатия W/A/S/D в режиме полёта
  // воспринимаются браузером как переход по опциям списка (стандартное
  // поведение <select> для буквенных клавиш), а не как движение камеры.
  e.target.blur();
});
document.getElementById('tourSettingMoveSpeed').addEventListener('input', (e) => {
  document.getElementById('tourSettingMoveSpeedValue').textContent = e.target.value;
  window.TourViewer.setSettings({ moveSpeed: Number(e.target.value) });
});
document.getElementById('tourSettingSensitivity').addEventListener('input', (e) => {
  document.getElementById('tourSettingSensitivityValue').textContent = e.target.value;
  window.TourViewer.setSettings({ orbitSensitivity: Number(e.target.value) });
});
document.getElementById('tourSettingZoomSpeed').addEventListener('input', (e) => {
  document.getElementById('tourSettingZoomSpeedValue').textContent = e.target.value;
  window.TourViewer.setSettings({ zoomSpeed: Number(e.target.value) });
});
document.getElementById('tourSettingPointSize').addEventListener('input', (e) => {
  document.getElementById('tourSettingPointSizeValue').textContent = e.target.value;
  window.TourViewer.setSettings({ pointSizePx: Number(e.target.value) });
});
document.getElementById('tourSettingEdl').addEventListener('change', (e) => {
  window.TourViewer.setSettings({ edlEnabled: e.target.checked });
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
  document.getElementById('tourSettingsPanel').classList.add('d-none');
  setDrawingTool(null);
  // Рисование/слои поверх модели сделаны под рейкастинг GaussianSplats3D,
  // которого в PlayCanvas нет (см. комментарий у движка выше) — прячем
  // тулбар для ОБОИХ типов моделей, пока не перенесён picking. Кнопка
  // центрирования и настроек, наоборот, теперь полезны для обоих типов.
  const toolbar = document.getElementById('tourDrawToolbar');
  if (toolbar) toolbar.classList.add('d-none');
  document.getElementById('tourCenterBtn').classList.remove('d-none');
  document.getElementById('tourSettingsBtn').classList.remove('d-none');
  fetchLayers();
  if (!pendingTourUrls) return;
  currentTourUrls = pendingTourUrls;
  const modelType = pendingModelType;
  pendingTourUrls = null;
  window.TourViewer.load(currentTourUrls, modelType);
});

document.getElementById('tourCenterBtn').addEventListener('click', () => {
  window.TourViewer.recenter();
});

tourModalEl.addEventListener('hidden.bs.modal', () => {
  window.TourViewer.hideError();
  currentTourUrls = null;
  currentTourId = null;
  tourLayersData = [];
  for (const id in layerGroups) {
    delete layerGroups[id];
  }
  drawingTool = null;
  drawingPoints = [];
  drawingPreviewLine = null;
  window.TourViewer.dispose();
  document.getElementById('tourViewerContainer').innerHTML = '';
});
</script>
<script type="module" src="/assets/viewer/tour-viewer.js"></script>
HTML;
require __DIR__ . '/app/views/_foot.php';
