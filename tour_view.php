<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
require __DIR__ . '/app/lib/tours.php';

$tourId = (int)($_GET['tour'] ?? $_GET['id'] ?? 0);
// Опубликованные туры (is_public, см. tours.php) открываются без входа —
// "мы же расшариваем проект"; остальные — как раньше, только по логину.
// Публичным посетителям (current_admin() всегда null) toolbar рисования
// ниже не показывается — только просмотр, никогда редактирование.
if (!tour_is_public($tourId)) {
    require_login();
}
$isAdmin = (current_admin()['role'] ?? null) === 'admin';
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Тур — просмотр</title>
  <link rel="icon" href="/assets/icon-192.png">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
  <style>
    /* Полноэкранная страница только с вьювером — без сайдбара/навигации
       обычного кабинета (app/views/_head.php), по запросу пользователя:
       "по ссылке должна открываться только модель, без остального
       интерфейса сервиса". */
    html, body { height: 100%; margin: 0; overflow: hidden; background: #10131a; }
    #tourViewTitle { color: #fff; }
  </style>
</head>
<body data-bs-theme="dark">
<div id="tourViewPage" style="width: 100%; height: 100%; position: relative;">
  <div class="position-absolute top-0 start-0 m-3 d-flex align-items-center gap-2" style="z-index: 1100;">
    <span id="tourViewTitle" class="fw-semibold text-truncate" style="max-width: 40vw;"></span>
  </div>
  <div class="position-absolute top-0 end-0 m-3 d-flex align-items-center gap-2" style="z-index: 1100;">
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
  </div>

  <div id="tourMouseHelp" class="position-absolute bottom-0 start-0 m-3 p-3 rounded d-none" style="z-index: 1100; background: rgba(0,0,0,.75); color: #fff; max-width: 280px; font-size: 14px;">
    <div class="d-flex align-items-center gap-2 mb-2"><i class="bi bi-mouse2"></i><b>Левая кнопка</b> + перетаскивание — вращение камеры</div>
    <div class="d-flex align-items-center gap-2 mb-2"><i class="bi bi-mouse2"></i><b>Правая кнопка</b> + перетаскивание — панорамирование</div>
    <div class="d-flex align-items-center gap-2"><i class="bi bi-mouse"></i><b>Колесо мыши</b> — масштаб (приближение/отдаление)</div>
  </div>

  <div id="tourLayersPanel" class="position-absolute top-0 end-0 m-3 p-3 rounded d-none" style="z-index: 1100; background: rgba(20,20,20,.92); color: #fff; width: 300px; max-height: 70vh; overflow-y: auto; font-size: 14px; margin-top: 3.5rem !important;">
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

  <div id="tourSettingsPanel" class="position-absolute top-0 end-0 m-3 p-3 rounded d-none" style="z-index: 1100; background: rgba(20,20,20,.92); color: #fff; width: min(320px, 92vw); max-height: 80vh; overflow-y: auto; font-size: 14px; margin-top: 3.5rem !important;">
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
            <div class="mb-2">
              <label class="form-label small mb-0">Экспозиция (яркость/свечение): <span id="tourSettingExposureValue"></span></label>
              <input type="range" class="form-range" id="tourSettingExposure" min="0.1" max="3" step="0.05">
              <div class="small text-secondary">Ниже 1 — приглушает пересвеченные/светящиеся сплаты. Действует на всю сцену.</div>
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
  <div id="tourDrawToolbar" class="position-absolute top-0 start-0 m-3 d-none" style="z-index: 1100; margin-top: 3.5rem !important;">
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

  <div id="tourViewNotFound" class="d-none position-absolute top-50 start-50 translate-middle text-center" style="z-index: 1200;">
    <div class="alert alert-danger">Тур не найден или недоступен.</div>
  </div>

  <!-- ВАЖНО: пустой div-СОСЕД (не родитель!) всех панелей выше — сам
       viewer/src/tourViewer.ts делает container.innerHTML = '' и монтирует
       canvas ВНУТРЬ этого элемента при каждой загрузке; если бы панели были
       его детьми, они стирались бы вместе со старым содержимым. -->
  <div id="tourViewerContainer" style="width: 100%; height: 100%;"></div>
</div>

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
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
const isAdminJs = <?= $isAdmin ? 'true' : 'false' ?>;
const tourId = <?= (int)$tourId ?>;

// --- Слои и рисование на 3D-модели тура (точки/линии/полигоны + экспорт
// DXF) — перенесено из map.php (модалка #tourViewerModal) без изменения
// поведения: та же логика, тот же viewer/src/tourViewer.ts бандл, просто
// без карты/сайдбара/навигации вокруг (по запросу пользователя — ссылка
// должна открывать ТОЛЬКО модель с инструментами вьювера и оцифровки).
let tourLayersData = [];
let drawingTool = null; // null | 'point' | 'polyline' | 'polygon' | 'edit'
let drawingPoints = [];
let activeLayerId = null;
let selectedAnno = null;
let draggingVertex = null;
let currentTourId = tourId || null;

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
  if (!sel) return;
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
  if (!panel) return;
  if (!selectedAnno) {
    panel.classList.add('d-none');
    return;
  }
  panel.classList.remove('d-none');
  const sel = document.getElementById('tourSelectedAnnoLayerSelect');
  sel.innerHTML = tourLayersData.map((l) => `<option value="${l.id}">${escapeHtml(l.name)}</option>`).join('');
  sel.value = String(selectedAnno.layerId);
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s ?? '';
  return div.innerHTML;
}

function renderLayersList() {
  const list = document.getElementById('tourLayersList');
  list.innerHTML = '';
  for (const layer of tourLayersData) {
    const row = document.createElement('div');
    row.className = 'd-flex align-items-center gap-2 mb-1';
    row.innerHTML =
      `<input type="checkbox" class="form-check-input layer-visibility" data-layer-id="${layer.id}" ${layer.is_visible ? 'checked' : ''}>` +
      `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${escapeHtml(layer.color)}"></span>` +
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

let sectionPickArmed = false;
let sectionPickPoints = [];

function applySectionFromPoints(a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
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

function syncSettingsPanelFromViewer() {
  const s = window.TourViewer.getSettings();
  document.getElementById('tourSettingFov').value = s.fov;
  document.getElementById('tourSettingFovValue').textContent = s.fov;
  document.getElementById('tourSettingExposure').value = s.exposure;
  document.getElementById('tourSettingExposureValue').textContent = s.exposure;
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
document.getElementById('tourSettingExposure').addEventListener('input', (e) => {
  document.getElementById('tourSettingExposureValue').textContent = e.target.value;
  window.TourViewer.setSettings({ exposure: Number(e.target.value) });
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

document.getElementById('tourCenterBtn').addEventListener('click', () => {
  window.TourViewer.recenter();
});

// --- Загрузка тура по id из URL (без карты/списка туров — только этот
// один тур, см. api/tours.php ?id=).
async function init() {
  if (!tourId) {
    document.getElementById('tourViewNotFound').classList.remove('d-none');
    return;
  }
  let tour;
  try {
    const res = await fetch('/api/tours.php?id=' + tourId);
    const data = await res.json();
    tour = (data.tours || [])[0];
  } catch (e) {
    tour = null;
  }
  if (!tour) {
    document.getElementById('tourViewNotFound').classList.remove('d-none');
    return;
  }
  document.getElementById('tourViewTitle').textContent = tour.name;
  document.title = tour.name + ' — просмотр';
  document.getElementById('tourExportLink').href = '/tour_export.php?tour_id=' + tourId;

  document.getElementById('tourMouseHelp').classList.remove('d-none');
  const toolbar = document.getElementById('tourDrawToolbar');
  if (toolbar) toolbar.classList.remove('d-none');
  document.getElementById('tourCenterBtn').classList.remove('d-none');
  document.getElementById('tourSettingsBtn').classList.remove('d-none');
  fetchLayers();

  const urls = tour.file_urls && tour.file_urls.length ? tour.file_urls : [tour.file_url];
  const modelType = tour.model_type || 'splat';
  const copcUrls = tour.copc_urls || [];
  const sogUrls = tour.sog_urls || [];
  const collisionUrl = (tour.collision_urls && tour.collision_urls[0]) || null;
  // rAF даёт браузеру один кадр, чтобы вычислить layout контейнера
  // (clientHeight = 0 если layout не готов -> WebGL framebuffer 0x0).
  requestAnimationFrame(() => {
    window.TourViewer.load(urls, modelType, copcUrls, sogUrls, collisionUrl);
  });
}
init();
</script>
<?php
$viewerBundle = __DIR__ . '/assets/viewer/tour-viewer.js';
$viewerVer = @filemtime($viewerBundle) ?: time();
echo '<script type="module" src="/assets/viewer/tour-viewer.js?v=' . $viewerVer . '"></script>';
?>
</body>
</html>
