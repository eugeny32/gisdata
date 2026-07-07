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
        <div class="col-6 col-md-4">
          <input type="text" id="stationSearch" class="form-control form-control-sm" placeholder="Поиск по названию...">
        </div>
        <div class="col-6 col-md-3">
          <select id="stationCodeFilter" class="form-select form-select-sm">
            <option value="">Все коды станций</option>
          </select>
        </div>
        <div class="col-12 col-md-5 text-md-end small text-secondary">
          Станций: <span id="countTotal">0</span>,
          онлайн: <span id="countOnline" class="text-success">0</span>,
          офлайн/unknown: <span id="countOffline" class="text-danger">0</span>
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

  <div id="mapContextMenu" class="d-none" style="position:fixed; z-index:1200; background:#1f232b; color:#fff; border-radius:6px; box-shadow:0 4px 16px rgba(0,0,0,.4); min-width:180px; max-width:240px; overflow:hidden;">
    <button type="button" id="mapContextView" class="btn btn-sm w-100 text-start text-white d-none" style="border-radius:0;">
      <i class="bi bi-eye"></i> Просмотр
    </button>
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
            <?php if ($isAdmin): ?>
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
            <?php endif; ?>
            <div class="mb-2">
              <label class="form-label small">Файл(ы) модели (.ply / .splat / .ksplat / .las)</label>
              <input type="file" name="model_files[]" class="form-control" accept=".ply,.splat,.ksplat,.las" multiple>
              <div class="form-text">
                .ply автоматически прогоняется через фильтр шума при сохранении.
                <?php if (!$isAdmin): ?>Суммарный размер файлов — не больше 2 ГБ.<?php endif; ?>
              </div>
            </div>
            <?php if ($isAdmin): ?>
            <div class="mb-2">
              <label class="form-label small">Или файл(ы) уже на сервере — по одному имени на строку</label>
              <textarea name="existing_file" class="form-control" rows="2"></textarea>
            </div>
            <?php endif; ?>
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

          <div id="tourSettingsPanel" class="position-absolute top-0 end-0 m-3 p-3 rounded d-none" style="z-index: 1100; background: rgba(20,20,20,.92); color: #fff; width: min(320px, 92vw); max-height: 80vh; overflow-y: auto; font-size: 14px;">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <b>Настройки</b>
              <div class="form-check form-switch mb-0" title="Индикатор FPS/памяти/стриминга">
                <input class="form-check-input" type="checkbox" id="tourSettingShowStats">
                <label class="form-check-label small" for="tourSettingShowStats">статистика</label>
              </div>
            </div>
            <div class="accordion accordion-flush" id="tourSettingsAccordion">

              <div class="accordion-item" style="background: transparent;">
                <h2 class="accordion-header">
                  <button class="accordion-button btn-sm p-2 text-white" style="background: rgba(255,255,255,.08); box-shadow: none;" type="button" data-bs-toggle="collapse" data-bs-target="#tourSettingsCamera">Камера</button>
                </h2>
                <div id="tourSettingsCamera" class="accordion-collapse collapse show">
                  <div class="accordion-body px-1 py-2">
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
                    <div class="mb-0">
                      <label class="form-label small mb-0">Проекция</label>
                      <select class="form-select form-select-sm" id="tourSettingProjection">
                        <option value="perspective">Перспективная</option>
                        <option value="orthographic">Ортографическая</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div class="accordion-item" style="background: transparent;">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed btn-sm p-2 text-white" style="background: rgba(255,255,255,.08); box-shadow: none;" type="button" data-bs-toggle="collapse" data-bs-target="#tourSettingsNav">Навигация</button>
                </h2>
                <div id="tourSettingsNav" class="accordion-collapse collapse">
                  <div class="accordion-body px-1 py-2">
                    <div class="mb-2">
                      <label class="form-label small mb-0">Режим навигации</label>
                      <select class="form-select form-select-sm" id="tourSettingNavMode">
                        <option value="orbit">Орбита (вокруг модели)</option>
                        <option value="fly">Полёт (свободная камера, WASD)</option>
                        <option value="walk">Прогулка (со столкновениями)</option>
                      </select>
                      <div class="small text-secondary">Полёт/прогулка: левая кнопка — поворот, правая кнопка — сдвиг в стороны (как мышью, так и WASD), Space/Shift — вверх/вниз. На сенсорном экране — одним пальцем вращение, двумя пальцами — масштаб. Прогулка останавливается перед препятствием — доступна только для сплат-туров с готовым коллайдером, иначе работает как обычный полёт.</div>
                    </div>
                    <div class="mb-2">
                      <label class="form-label small mb-0">Чувствительность мыши: <span id="tourSettingSensitivityValue"></span></label>
                      <input type="range" class="form-range" id="tourSettingSensitivity" min="0.2" max="3" step="0.1">
                    </div>
                    <div class="mb-2">
                      <label class="form-label small mb-0">Скорость зума: <span id="tourSettingZoomSpeedValue"></span></label>
                      <input type="range" class="form-range" id="tourSettingZoomSpeed" min="0.2" max="3" step="0.1">
                    </div>
                    <div class="mb-0">
                      <label class="form-label small mb-0">Скорость полёта: <span id="tourSettingMoveSpeedValue"></span></label>
                      <input type="range" class="form-range" id="tourSettingMoveSpeed" min="0.5" max="20" step="0.5">
                    </div>
                  </div>
                </div>
              </div>

              <div class="accordion-item" style="background: transparent;">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed btn-sm p-2 text-white" style="background: rgba(255,255,255,.08); box-shadow: none;" type="button" data-bs-toggle="collapse" data-bs-target="#tourSettingsPoints">Точки (LAS/COPC)</button>
                </h2>
                <div id="tourSettingsPoints" class="accordion-collapse collapse">
                  <div class="accordion-body px-1 py-2">
                    <div class="mb-2">
                      <label class="form-label small mb-0">Размер точки: <span id="tourSettingPointSizeValue"></span>px</label>
                      <input type="range" class="form-range" id="tourSettingPointSize" min="1" max="10" step="1">
                    </div>
                    <div class="mb-2">
                      <label class="form-label small mb-0">Раскраска</label>
                      <select class="form-select form-select-sm" id="tourSettingColorMode">
                        <option value="rgb">Реальный цвет (RGB)</option>
                        <option value="height">По высоте</option>
                        <option value="intensity">Интенсивность</option>
                        <option value="classification">Классификация</option>
                      </select>
                      <div class="small text-secondary">Переключается без перезагрузки файла. Для 3DGS-сплатов не действует.</div>
                    </div>
                    <div class="mb-2">
                      <label class="form-label small mb-0">Бюджет точек (как в Potree): <span id="tourSettingPointBudgetValue"></span></label>
                      <input type="range" class="form-range" id="tourSettingPointBudget" min="1000000" max="100000000" step="1000000">
                      <div class="small text-secondary">Сколько точек COPC держать в сцене одновременно. Больше — подробнее картинка, выше нагрузка на GPU/память.</div>
                    </div>
                    <hr class="my-2" style="border-color: rgba(255,255,255,.15)">
                    <div class="form-check form-switch mb-1">
                      <input class="form-check-input" type="checkbox" id="tourSettingClipEnabled">
                      <label class="form-check-label small" for="tourSettingClipEnabled">Сечение (обрезка по осям)</label>
                    </div>
                    <div class="small text-secondary mb-2">Доли от размера КАЖДОГО облака точек (0 — начало, 1 — конец).</div>
                    <?php foreach (['X', 'Y', 'Z'] as $axisLabel): ?>
                    <div class="mb-2">
                      <label class="form-label small mb-0">
                        <?= $axisLabel ?>: <span id="tourSettingClip<?= $axisLabel ?>MinValue"></span> – <span id="tourSettingClip<?= $axisLabel ?>MaxValue"></span>
                      </label>
                      <div class="d-flex gap-2">
                        <input type="range" class="form-range" id="tourSettingClip<?= $axisLabel ?>Min" min="0" max="1" step="0.01">
                        <input type="range" class="form-range" id="tourSettingClip<?= $axisLabel ?>Max" min="0" max="1" step="0.01">
                      </div>
                    </div>
                    <?php endforeach; ?>
                    <hr class="my-2" style="border-color: rgba(255,255,255,.15)">
                    <div class="form-check form-switch mb-1">
                      <input class="form-check-input" type="checkbox" id="tourSettingSectionEnabled">
                      <label class="form-check-label small" for="tourSettingSectionEnabled">Сечение по линии (2 клика на модели)</label>
                    </div>
                    <div class="small text-secondary mb-2">Режет под любым углом через 2 точки, в отличие от осевой обрезки выше.</div>
                    <div class="d-flex gap-2">
                      <button type="button" class="btn btn-sm btn-outline-light flex-grow-1" id="tourSectionPickBtn">Указать линию</button>
                      <button type="button" class="btn btn-sm btn-outline-light" id="tourSectionFlipBtn" title="Сменить сторону"><i class="bi bi-arrow-left-right"></i></button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="accordion-item" style="background: transparent;">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed btn-sm p-2 text-white" style="background: rgba(255,255,255,.08); box-shadow: none;" type="button" data-bs-toggle="collapse" data-bs-target="#tourSettingsMisc">Прочее</button>
                </h2>
                <div id="tourSettingsMisc" class="accordion-collapse collapse">
                  <div class="accordion-body px-1 py-2">
                    <div class="form-check form-switch mb-1">
                      <input class="form-check-input" type="checkbox" id="tourSettingEdl">
                      <label class="form-check-label small" for="tourSettingEdl">Eye-Dome Lighting (EDL)</label>
                    </div>
                    <div class="small text-secondary">EDL пока без визуального эффекта — флаг сохраняется, сам шейдер появится позже.</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <?php if ($isAdmin): ?>
          <div id="tourDrawToolbar" class="position-absolute top-0 start-0 m-3 d-none" style="z-index: 1100">
            <div class="btn-group mb-2">
              <button type="button" class="btn btn-sm btn-outline-light" data-tool="point" title="Точка"><i class="bi bi-geo-alt"></i></button>
              <button type="button" class="btn btn-sm btn-outline-light" data-tool="polyline" title="Линия"><i class="bi bi-bezier2"></i></button>
              <button type="button" class="btn btn-sm btn-outline-light" data-tool="polygon" title="Полигон"><i class="bi bi-pentagon"></i></button>
              <button type="button" class="btn btn-sm btn-outline-light" data-tool="edit" title="Выбор/редактирование — клик по объекту, перетаскивание точки"><i class="bi bi-cursor"></i></button>
              <button type="button" class="btn btn-sm btn-success" id="tourDrawFinishBtn" title="Готово"><i class="bi bi-check-lg"></i></button>
              <button type="button" class="btn btn-sm btn-outline-danger" id="tourDrawCancelBtn" title="Отмена/выключить инструмент"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="d-flex align-items-center gap-2 p-1 rounded" style="background: rgba(20,20,20,.85);">
              <label class="text-white small mb-0 ms-1">Активный слой:</label>
              <select id="tourActiveLayerSelect" class="form-select form-select-sm" style="width: auto;"></select>
            </div>
            <div id="tourSelectedAnnoPanel" class="d-flex align-items-center gap-2 p-2 mt-2 rounded d-none" style="background: rgba(20,20,20,.92);">
              <label class="text-white small mb-0">Слой объекта:</label>
              <select id="tourSelectedAnnoLayerSelect" class="form-select form-select-sm" style="width: auto;"></select>
              <button type="button" class="btn btn-sm btn-outline-danger" id="tourSelectedAnnoDeleteBtn" title="Удалить объект"><i class="bi bi-trash"></i></button>
            </div>
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
      copcUrls: t.copc_urls || [],
      sogUrls: t.sog_urls || [],
      // Коллайдер — только у первого файла тура (как и центрирование).
      collisionUrl: (t.collision_urls && t.collision_urls[0]) || null,
    };
    const typeBadge = t.model_type === 'pointcloud'
      ? '<span class="badge text-bg-info">Point Cloud</span>'
      : '<span class="badge text-bg-primary">3DGS Splat</span>';
    const popup = `<b>${escapeHtml(t.name)}</b> ${typeBadge}` +
      (t.description ? `<br>${escapeHtml(t.description)}` : '') +
      `<br><button type="button" class="btn btn-sm btn-outline-primary mt-2" ` +
      `onclick="openTour(${t.id}, '${escapeAttr(t.name)}')">` +
      `<i class="bi bi-camera-reels"></i> Открыть тур</button>`;
    const marker = L.marker([t.lat, t.lon], { icon: tourMarkerIcon() }).addTo(map).bindPopup(popup);
    // Правый клик прямо по маркеру тура — отдельная цель для контекстного
    // меню (пункт "Просмотр"), отличная от правого клика по пустой карте
    // (там — только "Добавить объект", у админов). stopPropagation — чтобы
    // у map не сработал её собственный contextmenu-обработчик ниже (иначе
    // сработали бы оба, и цель тура сразу же сбросилась бы в null).
    marker.on('contextmenu', (e) => {
      L.DomEvent.stopPropagation(e);
      contextLatLng = e.latlng; // нужно для "Добавить объект" из меню маркера
      showMapContextMenu(e.originalEvent, { id: t.id, name: t.name });
    });
    tourMarkers.push(marker);
  }
}
loadTours();

// --- Контекстное меню карты (правый клик). Доступно всем вошедшим:
// "Просмотр" (открыть плеер модели тура, под курсором) — всем; "Добавить
// объект" (быстрое создание тура прямо в точке клика, без перехода на
// отдельную страницу tours.php) — только админам.
const contextMenu = document.getElementById('mapContextMenu');
const contextViewBtn = document.getElementById('mapContextView');
let contextLatLng = null;
let contextTourTarget = null; // {id, name} тура под курсором, иначе null

function hideContextMenu() {
  contextMenu.classList.add('d-none');
}

// position:fixed + клиентские координаты (не относительно .map-card) —
// раньше меню позиционировалось относительно карточки карты и обрезалось
// по её границе при правом клике у правого края (выглядело как "прилипло
// и растягивается": видна была только обрезанная часть). После показа
// меню (когда браузер уже посчитал его реальную ширину/высоту) — подвинуть
// влево/вверх, если оно не влезает в окно по правому/нижнему краю.
function showMapContextMenu(domEvent, tourTarget) {
  domEvent.preventDefault();
  contextTourTarget = tourTarget;
  contextViewBtn.classList.toggle('d-none', !tourTarget);
  contextMenu.style.left = domEvent.clientX + 'px';
  contextMenu.style.top = domEvent.clientY + 'px';
  contextMenu.classList.remove('d-none');
  const rect = contextMenu.getBoundingClientRect();
  if (rect.right > window.innerWidth) {
    contextMenu.style.left = Math.max(0, window.innerWidth - rect.width - 8) + 'px';
  }
  if (rect.bottom > window.innerHeight) {
    contextMenu.style.top = Math.max(0, window.innerHeight - rect.height - 8) + 'px';
  }
}

map.on('contextmenu', (e) => {
  contextLatLng = e.latlng;
  showMapContextMenu(e.originalEvent, null);
});
map.on('click movestart zoomstart', hideContextMenu);
document.addEventListener('click', (e) => {
  if (!contextMenu.contains(e.target)) hideContextMenu();
});

contextViewBtn.addEventListener('click', () => {
  hideContextMenu();
  if (contextTourTarget) openTour(contextTourTarget.id, contextTourTarget.name);
});

// "Добавить объект" — доступно всем вошедшим (не только админам): админы
// добавляют через полноценный /tours.php (группы, файлы уже на сервере,
// без ограничения размера, кроме лимитов хостинга), обычные пользователи —
// через упрощённый /tour_user_upload.php (без групп, с лимитом 2 ГБ
// суммарно на файлы тура — оба ограничения только что добавлены).
{
  const quickAddModalEl = document.getElementById('quickAddTourModal');
  const quickAddModal = new bootstrap.Modal(quickAddModalEl);
  const quickAddForm = document.getElementById('quickAddTourForm');
  const quickAddGroupSelect = document.getElementById('quickAddGroupSelect');
  const quickAddNewGroupWrap = document.getElementById('quickAddNewGroupWrap');

  // Группы — только в форме админа (см. <?php if ($isAdmin): ?> вокруг
  // quickAddGroupSelect выше), у обычных пользователей этих элементов нет.
  if (isAdminJs) {
    quickAddGroupSelect.addEventListener('change', () => {
      quickAddNewGroupWrap.classList.toggle('d-none', quickAddGroupSelect.value !== 'new');
    });
  }

  document.getElementById('mapContextAddTour').addEventListener('click', () => {
    hideContextMenu();
    if (!contextLatLng) return;
    quickAddForm.reset();
    if (quickAddNewGroupWrap) quickAddNewGroupWrap.classList.add('d-none');
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
    xhr.open('POST', isAdminJs ? '/tours.php' : '/tour_user_upload.php');
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
      // tour_user_upload.php (не-админы) использует тот же контракт —
      // .alert-danger при ошибке, иначе пустой/успешный ответ.
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
// PR0) — здесь только глобальные переменные тура и обращения к
// window.TourViewer (публичный API бандла, см. viewer/README.md).
let pendingTourUrls = null;
let pendingModelType = 'splat';
let pendingCopcUrls = [];
let pendingSogUrls = [];
let pendingCollisionUrl = null;
let currentTourUrls = null;
let currentTourId = null;

const tourModalEl = document.getElementById('tourViewerModal');
const tourModal = new bootstrap.Modal(tourModalEl);

function openTour(tourId, name) {
  document.getElementById('tourViewerTitle').textContent = name;
  const data = tourDataById[tourId] || { urls: [], modelType: 'splat', copcUrls: [] };
  pendingTourUrls = data.urls;
  pendingModelType = data.modelType;
  pendingCopcUrls = data.copcUrls || [];
  pendingSogUrls = data.sogUrls || [];
  pendingCollisionUrl = data.collisionUrl || null;
  currentTourId = tourId;
  document.getElementById('tourExportLink').href = '/tour_export.php?tour_id=' + tourId;
  tourModal.show();
}

// --- Слои и рисование на 3D-модели тура (точки/линии/полигоны + экспорт DXF) ---
// Picking — через window.TourViewer.pickPoint/pickAnnotationVertex
// (viewer/src/annotations.ts): луч из камеры пересекается с одной сферой,
// охватывающей всю модель (точное попадание в поверхность сплатов/точек
// у PlayCanvas нет публичного API) — одинаково для облака точек и сплатов.
let tourLayersData = [];
let drawingTool = null; // null | 'point' | 'polyline' | 'polygon' | 'edit'
let drawingPoints = [];
let activeLayerId = null; // слой, в который рисуют новые объекты
let selectedAnno = null; // { layerId, annotationId } — выбран инструментом "edit"
let draggingVertex = null; // { layerId, annotationId, pointIndex } во время перетаскивания

function findAnnotation(layerId, annotationId) {
  const layer = tourLayersData.find((l) => l.id === layerId);
  const anno = layer ? layer.annotations.find((a) => a.id === annotationId) : null;
  return { layer, anno };
}

function syncAnnotationsToViewer() {
  if (!window.TourViewer) return;
  window.TourViewer.setAnnotationLayers(tourLayersData.map((l) => ({
    id: l.id,
    color: l.color,
    visible: l.is_visible,
    annotations: l.annotations.map((a) => ({ id: a.id, geomType: a.geom_type, coordinates: a.coordinates })),
  })));
}

function renderActiveLayerSelect() {
  const sel = document.getElementById('tourActiveLayerSelect');
  if (!sel) return; // не-админы: tourDrawToolbar (рисование) не рендерится вовсе
  const prev = activeLayerId;
  sel.innerHTML = tourLayersData.map((l) => `<option value="${l.id}">${escapeHtml(l.name)}</option>`).join('');
  if (prev && tourLayersData.some((l) => l.id === prev)) {
    activeLayerId = prev;
  } else {
    activeLayerId = tourLayersData.length ? tourLayersData[0].id : null;
  }
  sel.value = activeLayerId != null ? String(activeLayerId) : '';
}

function renderSelectedAnnoPanel() {
  const panel = document.getElementById('tourSelectedAnnoPanel');
  if (!panel) return; // не-админы: tourDrawToolbar (рисование) не рендерится вовсе
  if (!selectedAnno) {
    panel.classList.add('d-none');
    return;
  }
  panel.classList.remove('d-none');
  const sel = document.getElementById('tourSelectedAnnoLayerSelect');
  sel.innerHTML = tourLayersData.map((l) => `<option value="${l.id}">${escapeHtml(l.name)}</option>`).join('');
  sel.value = String(selectedAnno.layerId);
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
      const id = Number(cb.dataset.layerId);
      await fetch('/api/tour_annotations.php', { method: 'POST', body: JSON.stringify({ action: 'toggle_layer', id: id }) });
      const layer = tourLayersData.find((l) => l.id === id);
      if (layer) layer.is_visible = cb.checked;
      syncAnnotationsToViewer();
    });
  });
  list.querySelectorAll('.layer-delete').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Удалить слой со всеми объектами?')) return;
      await fetch('/api/tour_annotations.php', { method: 'POST', body: JSON.stringify({ action: 'delete_layer', id: Number(btn.dataset.layerId) }) });
      if (selectedAnno && selectedAnno.layerId === Number(btn.dataset.layerId)) selectedAnno = null;
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
  renderActiveLayerSelect();
  renderSelectedAnnoPanel();
  syncAnnotationsToViewer();
}

function setDrawingTool(tool) {
  drawingTool = tool;
  drawingPoints = [];
  selectedAnno = null;
  renderSelectedAnnoPanel();
  window.TourViewer?.setDrawingPreview(null, '#ffff00');
  document.querySelectorAll('#tourDrawToolbar [data-tool]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tool === tool);
  });
}

async function saveAnnotation(geomType, coordinates) {
  if (!activeLayerId) {
    alert('Сначала создайте слой и выберите его как активный (панель «Слои»)');
    return;
  }
  await fetch('/api/tour_annotations.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'save_annotation', layer_id: activeLayerId, geom_type: geomType, coordinates: coordinates }),
  });
  await fetchLayers();
}

async function finishDrawing() {
  if (!drawingTool || drawingTool === 'edit' || drawingPoints.length < 2) return;
  await saveAnnotation(drawingTool, drawingPoints);
  drawingPoints = [];
  window.TourViewer?.setDrawingPreview(null, '#ffff00');
}

function onViewerVertexPointerDown(e) {
  if (drawingTool !== 'edit' || !isAdminJs || !window.TourViewer) return;
  const hit = window.TourViewer.pickAnnotationVertex(e.clientX, e.clientY);
  if (!hit) {
    selectedAnno = null;
    renderSelectedAnnoPanel();
    return;
  }
  selectedAnno = { layerId: hit.layerId, annotationId: hit.annotationId };
  renderSelectedAnnoPanel();
  draggingVertex = hit;
  window.addEventListener('pointermove', onViewerVertexPointerMove);
  window.addEventListener('pointerup', onViewerVertexPointerUp);
}

function onViewerVertexPointerMove(e) {
  if (!draggingVertex || !window.TourViewer) return;
  const point = window.TourViewer.pickPoint(e.clientX, e.clientY);
  if (!point) return;
  const { anno } = findAnnotation(draggingVertex.layerId, draggingVertex.annotationId);
  if (!anno) return;
  anno.coordinates[draggingVertex.pointIndex] = point;
  syncAnnotationsToViewer();
}

async function onViewerVertexPointerUp() {
  window.removeEventListener('pointermove', onViewerVertexPointerMove);
  window.removeEventListener('pointerup', onViewerVertexPointerUp);
  if (!draggingVertex) return;
  const { anno } = findAnnotation(draggingVertex.layerId, draggingVertex.annotationId);
  draggingVertex = null;
  if (!anno) return;
  await fetch('/api/tour_annotations.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'update_annotation', id: anno.id, coordinates: anno.coordinates }),
  });
}

// Сечение по линии — 2 клика на модели (см. tourSectionPickBtn ниже).
// Доступно ЛЮБОМУ залогиненному пользователю (это инструмент просмотра,
// не редактирования, в отличие от drawingTool/isAdminJs ниже).
let sectionPickArmed = false;
let sectionPickPoints = [];

function applySectionFromPoints(a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  // Вертикальная плоскость через линию A-B — нормаль горизонтальна
  // (Z=0, см. uSectionNormal в pointCloudMaterial.ts), перпендикулярна
  // направлению линии.
  const normal = [-dy / len, dx / len, 0];
  const d = normal[0] * a[0] + normal[1] * a[1] + normal[2] * a[2];
  window.TourViewer.setSettings({ sectionEnabled: true, sectionNormal: normal, sectionD: d });
  document.getElementById('tourSettingSectionEnabled').checked = true;
}

document.getElementById('tourSectionPickBtn').addEventListener('click', (e) => {
  sectionPickArmed = !sectionPickArmed;
  sectionPickPoints = [];
  e.target.textContent = sectionPickArmed ? 'Кликните 2 точки на модели…' : 'Указать линию';
});

document.getElementById('tourSectionFlipBtn').addEventListener('click', () => {
  const s = window.TourViewer.getSettings();
  window.TourViewer.setSettings({
    sectionNormal: s.sectionNormal.map((v) => -v),
    sectionD: -s.sectionD,
  });
});

async function onViewerContainerClick(e) {
  if (sectionPickArmed && window.TourViewer) {
    const point = window.TourViewer.pickGroundPoint(e.clientX, e.clientY);
    if (!point) return;
    sectionPickPoints.push(point);
    if (sectionPickPoints.length === 2) {
      applySectionFromPoints(sectionPickPoints[0], sectionPickPoints[1]);
      sectionPickArmed = false;
      sectionPickPoints = [];
      document.getElementById('tourSectionPickBtn').textContent = 'Указать линию';
    }
    return;
  }
  if (!drawingTool || drawingTool === 'edit' || !isAdminJs || !window.TourViewer) return;
  const point = window.TourViewer.pickPoint(e.clientX, e.clientY);
  if (!point) return;
  if (drawingTool === 'point') {
    await saveAnnotation('point', [point]);
  } else {
    drawingPoints.push(point);
    window.TourViewer.setDrawingPreview(drawingPoints, '#ffff00');
  }
}

document.getElementById('tourViewerContainer').addEventListener('click', onViewerContainerClick);
document.getElementById('tourViewerContainer').addEventListener('pointerdown', onViewerVertexPointerDown);

// ?. — tourActiveLayerSelect/tourSelectedAnnoLayerSelect/tourSelectedAnnoDeleteBtn
// существуют в DOM только внутри tourDrawToolbar, который рендерится PHP
// только для админов (см. <?php if ($isAdmin): ?> вокруг него выше). Без
// ?. вызов .addEventListener на null здесь бросал необработанную ошибку
// при загрузке страницы для остальных пользователей — а это останавливало
// выполнение ВСЕГО ОСТАЛЬНОГО кода в этом <script>-блоке (в т.ч. привязку
// shown.bs.modal ниже, которая запускает window.TourViewer.load(...)) —
// именно поэтому туры не открывались в плеере у не-админов: окно плеера
// открывалось, но модель никогда не подгружалась.
document.getElementById('tourActiveLayerSelect')?.addEventListener('change', (e) => {
  activeLayerId = Number(e.target.value);
});

document.getElementById('tourSelectedAnnoLayerSelect')?.addEventListener('change', async (e) => {
  if (!selectedAnno) return;
  const newLayerId = Number(e.target.value);
  await fetch('/api/tour_annotations.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'update_annotation', id: selectedAnno.annotationId, layer_id: newLayerId }),
  });
  selectedAnno = { ...selectedAnno, layerId: newLayerId };
  await fetchLayers();
});

document.getElementById('tourSelectedAnnoDeleteBtn')?.addEventListener('click', async () => {
  if (!selectedAnno || !confirm('Удалить объект?')) return;
  await fetch('/api/tour_annotations.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'delete_annotation', id: selectedAnno.annotationId }),
  });
  selectedAnno = null;
  await fetchLayers();
});

document.getElementById('tourLayersBtn').addEventListener('click', () => {
  document.getElementById('tourSettingsPanel').classList.add('d-none');
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
  document.getElementById('tourSettingNavMode').value = s.navigationMode;
  document.getElementById('tourSettingSensitivity').value = s.orbitSensitivity;
  document.getElementById('tourSettingSensitivityValue').textContent = s.orbitSensitivity;
  document.getElementById('tourSettingZoomSpeed').value = s.zoomSpeed;
  document.getElementById('tourSettingZoomSpeedValue').textContent = s.zoomSpeed;
  document.getElementById('tourSettingMoveSpeed').value = s.moveSpeed;
  document.getElementById('tourSettingMoveSpeedValue').textContent = s.moveSpeed;
  document.getElementById('tourSettingPointSize').value = s.pointSizePx;
  document.getElementById('tourSettingPointSizeValue').textContent = s.pointSizePx;
  document.getElementById('tourSettingColorMode').value = s.colorMode;
  document.getElementById('tourSettingPointBudget').value = s.pointBudget;
  document.getElementById('tourSettingPointBudgetValue').textContent = (s.pointBudget / 1e6).toLocaleString('ru-RU', { maximumFractionDigits: 1 }) + ' млн';
  document.getElementById('tourSettingEdl').checked = s.edlEnabled;
  document.getElementById('tourSettingShowStats').checked = s.showStats;
  document.getElementById('tourSettingClipEnabled').checked = s.clipEnabled;
  document.getElementById('tourSettingSectionEnabled').checked = s.sectionEnabled;
  const axisKeys = ['X', 'Y', 'Z'];
  for (let i = 0; i < 3; i++) {
    const a = axisKeys[i];
    document.getElementById('tourSettingClip' + a + 'Min').value = s.clipMin[i];
    document.getElementById('tourSettingClip' + a + 'MinValue').textContent = s.clipMin[i];
    document.getElementById('tourSettingClip' + a + 'Max').value = s.clipMax[i];
    document.getElementById('tourSettingClip' + a + 'MaxValue').textContent = s.clipMax[i];
  }
}

document.getElementById('tourSettingsBtn').addEventListener('click', () => {
  document.getElementById('tourLayersPanel').classList.add('d-none');
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
document.getElementById('tourSettingColorMode').addEventListener('change', (e) => {
  window.TourViewer.setSettings({ colorMode: e.target.value });
});
document.getElementById('tourSettingPointBudget').addEventListener('input', (e) => {
  const v = Number(e.target.value);
  document.getElementById('tourSettingPointBudgetValue').textContent = (v / 1e6).toLocaleString('ru-RU', { maximumFractionDigits: 1 }) + ' млн';
  window.TourViewer.setSettings({ pointBudget: v });
});
document.getElementById('tourSettingEdl').addEventListener('change', (e) => {
  window.TourViewer.setSettings({ edlEnabled: e.target.checked });
});
document.getElementById('tourSettingShowStats').addEventListener('change', (e) => {
  window.TourViewer.setSettings({ showStats: e.target.checked });
});

document.getElementById('tourSettingClipEnabled').addEventListener('change', (e) => {
  window.TourViewer.setSettings({ clipEnabled: e.target.checked });
});
document.getElementById('tourSettingSectionEnabled').addEventListener('change', (e) => {
  window.TourViewer.setSettings({ sectionEnabled: e.target.checked });
});
['X', 'Y', 'Z'].forEach((a, i) => {
  document.getElementById('tourSettingClip' + a + 'Min').addEventListener('input', (e) => {
    const v = Number(e.target.value);
    document.getElementById('tourSettingClip' + a + 'MinValue').textContent = v;
    const clipMin = window.TourViewer.getSettings().clipMin.slice();
    clipMin[i] = Math.min(v, window.TourViewer.getSettings().clipMax[i]);
    window.TourViewer.setSettings({ clipMin });
  });
  document.getElementById('tourSettingClip' + a + 'Max').addEventListener('input', (e) => {
    const v = Number(e.target.value);
    document.getElementById('tourSettingClip' + a + 'MaxValue').textContent = v;
    const clipMax = window.TourViewer.getSettings().clipMax.slice();
    clipMax[i] = Math.max(v, window.TourViewer.getSettings().clipMin[i]);
    window.TourViewer.setSettings({ clipMax });
  });
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
  // Тулбар рисования — picking приближённый (через сферу модели, см.
  // viewer/src/annotations.ts), но одинаково доступен для обоих типов
  // моделей (точки/сплаты), элемент и так есть в DOM только для админов.
  const toolbar = document.getElementById('tourDrawToolbar');
  if (toolbar) toolbar.classList.remove('d-none');
  document.getElementById('tourCenterBtn').classList.remove('d-none');
  document.getElementById('tourSettingsBtn').classList.remove('d-none');
  fetchLayers();
  if (!pendingTourUrls) return;
  currentTourUrls = pendingTourUrls;
  const modelType = pendingModelType;
  const copcUrls = pendingCopcUrls;
  const sogUrls = pendingSogUrls;
  const collisionUrl = pendingCollisionUrl;
  pendingTourUrls = null;
  // rAF даёт браузеру один кадр, чтобы вычислить layout контейнера
  // (clientHeight = 0 если layout не готов → WebGL framebuffer 0×0)
  requestAnimationFrame(() => {
    window.TourViewer.load(currentTourUrls, modelType, copcUrls, sogUrls, collisionUrl);
  });
});

document.getElementById('tourCenterBtn').addEventListener('click', () => {
  window.TourViewer.recenter();
});

tourModalEl.addEventListener('hidden.bs.modal', () => {
  window.TourViewer.hideError();
  currentTourUrls = null;
  currentTourId = null;
  tourLayersData = [];
  drawingTool = null;
  drawingPoints = [];
  activeLayerId = null;
  selectedAnno = null;
  draggingVertex = null;
  window.TourViewer.dispose();
  document.getElementById('tourViewerContainer').innerHTML = '';
});
</script>
<script type="module" src="/assets/viewer/tour-viewer.js"></script>
HTML;
require __DIR__ . '/app/views/_foot.php';
