<?php

declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
require_admin_role('admin');

/**
 * Унифицированная тестовая страница плеера на движке PlayCanvas — для ОБОИХ
 * типов моделей тура (3DGS-сплаты .ply/.splat/.ksplat И LAS-облака точек),
 * один движок/камера/штурвал/прогресс на двоих. После подтверждения здесь
 * переносится в модальное окно тура (map.php).
 *
 * Почему PlayCanvas для сплатов: его GSplat-пайплайн выделяет под центры/
 * цвета текстуру близкую к квадрату (ceil(sqrt(N)), см. engine/src/platform/
 * graphics/texture-utils.js TextureUtils.calcTextureSize), а не фиксированной
 * ширины 4096px, как наша текущая @mkkellogg/gaussian-splats-3d — поэтому не
 * упирается в gl.MAX_TEXTURE_SIZE на огромных сканах ("Image in DataTexture
 * is too big", было подтверждено на реальном файле).
 *
 * Почему LAS тоже здесь: у PlayCanvas нет готового LAS-формата, но мы и
 * раньше парсили LAS сами через @loaders.gl/las (см. las_test.php) — здесь
 * результат парсинга (позиции+цвета) просто кормится в pc.Mesh с типом
 * PRIMITIVE_POINTS и собственным мини-шейдером (gl_PointSize не выставляется
 * стандартным материалом PlayCanvas, нужен свой vertex/fragment GLSL).
 *
 * Коррекция осей: у сплатов рабочий поворот (как в map.php,
 * rotationPresets[0]) — кватернион -90° по X. Те же -90° по X переводят
 * LAS-данные (геодезические X=север, Y=восток, Z=вверх) в Y-up мир, в
 * котором живёт камера/орбита этой страницы — поэтому ОБА типа моделей
 * используют один и тот же корректирующий поворот.
 *
 * Центрирование/панорамирование — по "плотности", не по геометрическому
 * центру bounding box: для сплатов это встроенный в движок
 * gsplatData.calcFocalPoint() (взвешивает по обратному размеру сплата —
 * мелкие/плотные весят больше крупных фоновых/выбросов), для LAS — среднее
 * (mean) позиций, которое по той же причине устойчивее, чем центр min/max
 * bbox (см. историю в map.php/las_test.php — bbox по min/max был
 * катастрофически чувствителен к единичным выбросам парсера).
 *
 * Штурвал-кубик — свой, на примитивах PlayCanvas (six-plane cube + вторая
 * камера в углу со своим Layer), аналог three.js ViewHelper из основного
 * вьювера, но не сам ViewHelper — это addon three.js, тут не применим.
 *
 * НЕ перенесено (отдельная задача после проверки этой части): слои и
 * рисование аннотаций (point/polyline/polygon) — в map.php это работает
 * через GaussianSplats3D.Raycaster.intersectSplatMesh, для PlayCanvas
 * нужен другой способ "попадания" в облако сплатов/точек (готового
 * публичного picking API под gsplat в движке нет).
 */

$pdo = db();
$tours = $pdo->query(
    "SELECT id, name, file_path, file_format FROM tours WHERE file_format IN ('ply','splat','ksplat','las') AND is_enabled = 1 ORDER BY name"
)->fetchAll();

$selectedUrl = '';
$selectedFormat = '';
if (isset($_GET['tour_id'])) {
    $stmt = $pdo->prepare("SELECT file_path, file_format FROM tours WHERE id = :id AND file_format IN ('ply','splat','ksplat','las')");
    $stmt->execute(['id' => (int)$_GET['tour_id']]);
    $row = $stmt->fetch();
    if ($row) {
        $selectedUrl = '/uploads/tours/' . implode('/', array_map('rawurlencode', explode('/', $row['file_path'])));
        $selectedFormat = $row['file_format'];
    }
}
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>PlayCanvas — унифицированный тест плеера</title>
  <style>
    body { margin: 0; background: #1a1d23; color: #ccc; font-family: sans-serif; }
    #ui { position: absolute; top: 0; left: 0; z-index: 10; padding: 10px; background: rgba(0,0,0,.6); }
    #ui a { color: #4ea1ff; margin-right: 12px; }
    #ui .fmt { color: #888; font-size: 11px; }
    #canvasHost { width: 100vw; height: 100vh; }
    #canvasHost canvas { width: 100%; height: 100%; display: block; }
    #status { position: absolute; bottom: 0; left: 0; z-index: 10; padding: 10px; background: rgba(0,0,0,.6); white-space: pre; font-size: 12px; max-height: 35vh; overflow-y: auto; }
    #progressWrap { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 20; width: 320px; text-align: center; background: rgba(0,0,0,.7); padding: 16px 20px; border-radius: 8px; }
    #progressBarOuter { width: 100%; height: 10px; background: rgba(255,255,255,.15); border-radius: 5px; overflow: hidden; margin-top: 8px; }
    #progressBarInner { width: 0%; height: 100%; background: #4ea1ff; transition: width .15s linear; }
  </style>
  <script type="importmap">
  {
    "imports": {
      "playcanvas": "https://cdn.jsdelivr.net/npm/playcanvas@2.20.0/build/playcanvas/src/index.js",
      "@loaders.gl/core": "https://cdn.jsdelivr.net/npm/@loaders.gl/core@4.3.0/+esm",
      "@loaders.gl/las": "https://cdn.jsdelivr.net/npm/@loaders.gl/las@4.3.0/+esm"
    }
  }
  </script>
</head>
<body>
  <div id="ui">
    <?php foreach ($tours as $t): ?>
      <a href="?tour_id=<?= (int)$t['id'] ?>"><?= htmlspecialchars($t['name'], ENT_QUOTES, 'UTF-8') ?></a><span class="fmt">[<?= htmlspecialchars($t['file_format'], ENT_QUOTES, 'UTF-8') ?>]</span>
    <?php endforeach; ?>
    <?php if (!$tours): ?>Нет туров в базе.<?php endif; ?>
  </div>
  <div id="canvasHost"></div>
  <div id="progressWrap" style="display:none;">
    <div id="progressLabel">Загрузка модели...</div>
    <div id="progressBarOuter"><div id="progressBarInner"></div></div>
  </div>
  <div id="status">Выберите тур выше.</div>
  <script type="module">
    const statusEl = document.getElementById('status');
    function log(...args) {
      console.log('[PC-TEST]', ...args);
      statusEl.textContent += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
      statusEl.scrollTop = statusEl.scrollHeight;
    }

    const progressWrap = document.getElementById('progressWrap');
    const progressLabel = document.getElementById('progressLabel');
    const progressBarInner = document.getElementById('progressBarInner');
    function showProgress(text, pct) {
      progressWrap.style.display = '';
      progressLabel.textContent = text;
      progressBarInner.style.width = Math.max(0, Math.min(100, pct)) + '%';
    }
    function hideProgress() {
      progressWrap.style.display = 'none';
    }

    const url = <?= json_encode($selectedUrl, JSON_UNESCAPED_SLASHES) ?>;
    const format = <?= json_encode($selectedFormat) ?>;
    const isLas = format === 'las';
    const canvasHost = document.getElementById('canvasHost');
    const canvas = document.createElement('canvas');
    canvasHost.appendChild(canvas);

    const pc = await import('playcanvas');
    log('PlayCanvas версия:', pc.version, pc.revision);

    const app = new pc.Application(canvas, {
      graphicsDeviceOptions: { antialias: true },
    });
    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    window.addEventListener('resize', () => app.resizeCanvas());

    const gl = app.graphicsDevice.gl;
    if (gl) {
      log('gl.MAX_TEXTURE_SIZE устройства:', gl.getParameter(gl.MAX_TEXTURE_SIZE));
    }

    // Отдельный слой для штурвала-кубика — рисуется только его собственной
    // камерой (второй CameraComponent с маленьким rect-вьюпортом в углу
    // того же канваса), в основную сцену не попадает.
    const gizmoLayer = new pc.Layer({ name: 'GizmoLayer' });
    app.scene.layers.push(gizmoLayer);
    const worldLayer = app.scene.layers.getLayerByName('World');

    const camera = new pc.Entity('camera');
    camera.addComponent('camera', {
      clearColor: new pc.Color(0.11, 0.12, 0.15),
      layers: [worldLayer.id, app.scene.layers.getLayerByName('Skybox').id, app.scene.layers.getLayerByName('Immediate').id, app.scene.layers.getLayerByName('UI').id],
      priority: 0,
    });
    app.root.addChild(camera);

    // Orbit камерой: drag левой кнопкой — поворот вокруг target, колесо —
    // зум. target — точка "плотности" модели (см. ниже после загрузки),
    // не геометрический центр bounding box.
    const target = new pc.Vec3(0, 0, 0);
    let distance = 5;
    let yaw = 45, pitch = -20;
    function updateCameraTransform() {
      const yawQ = new pc.Quat().setFromEulerAngles(0, yaw, 0);
      const pitchQ = new pc.Quat().setFromEulerAngles(pitch, 0, 0);
      const rot = yawQ.clone().mul(pitchQ);
      const offset = rot.transformVector(new pc.Vec3(0, 0, distance));
      camera.setPosition(target.x + offset.x, target.y + offset.y, target.z + offset.z);
      camera.lookAt(target);
      updateGizmoTransform();
    }
    // Первый вызов — НИЖЕ, после настройки штурвала (updateCameraTransform
    // вызывает updateGizmoTransform, который читает gizmoCamera — если
    // вызвать здесь, до объявления gizmoCamera ниже по файлу, это
    // ReferenceError "Cannot access 'gizmoCamera' before initialization",
    // пойманный живым скриншот-тестом, а не предположением).

    let dragging = false, lastX = 0, lastY = 0;
    canvas.addEventListener('pointerdown', (e) => {
      if (handleGizmoPointerDown(e)) return;
      dragging = true; lastX = e.clientX; lastY = e.clientY;
    });
    window.addEventListener('pointerup', () => { dragging = false; });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      yaw -= (e.clientX - lastX) * 0.3;
      pitch = Math.max(-89, Math.min(89, pitch - (e.clientY - lastY) * 0.3));
      lastX = e.clientX; lastY = e.clientY;
      updateCameraTransform();
    });
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      distance = Math.max(0.05, distance * (1 + e.deltaY * 0.001));
      updateCameraTransform();
    }, { passive: false });

    // --- Штурвал-кубик (аналог ViewHelper из основного вьювера) ---
    // X — красный, Y — зелёный, Z — синий, тёмный оттенок — отрицательное
    // направление. Кубик статичен в координатах своей мини-сцены, а
    // "вращается" за счёт того, что его собственная камера орбитит вокруг
    // него с теми же yaw/pitch, что и основная камера.
    const gizmoRoot = new pc.Entity('gizmoRoot');
    app.root.addChild(gizmoRoot);

    const faceDefs = [
      { axis: 'x', sign: 1, color: new pc.Color(0.85, 0.25, 0.25), pos: [0.5, 0, 0], rot: [0, 90, 0] },
      { axis: 'x', sign: -1, color: new pc.Color(0.45, 0.12, 0.12), pos: [-0.5, 0, 0], rot: [0, -90, 0] },
      { axis: 'y', sign: 1, color: new pc.Color(0.25, 0.75, 0.25), pos: [0, 0.5, 0], rot: [-90, 0, 0] },
      { axis: 'y', sign: -1, color: new pc.Color(0.12, 0.4, 0.12), pos: [0, -0.5, 0], rot: [90, 0, 0] },
      { axis: 'z', sign: 1, color: new pc.Color(0.3, 0.45, 0.85), pos: [0, 0, 0.5], rot: [0, 0, 0] },
      { axis: 'z', sign: -1, color: new pc.Color(0.15, 0.22, 0.45), pos: [0, 0, -0.5], rot: [0, 180, 0] },
    ];
    for (const f of faceDefs) {
      const plane = new pc.Entity('gizmoFace_' + f.axis + f.sign);
      plane.addComponent('render', { type: 'plane' });
      const mat = new pc.StandardMaterial();
      mat.diffuse = f.color;
      mat.emissive = f.color;
      mat.useLighting = false;
      mat.update();
      plane.render.material = mat;
      plane.render.layers = [gizmoLayer.id];
      plane.setLocalPosition(f.pos[0] * 0.9, f.pos[1] * 0.9, f.pos[2] * 0.9);
      plane.setLocalEulerAngles(f.rot[0], f.rot[1], f.rot[2]);
      plane.setLocalScale(0.9, 1, 0.9);
      gizmoRoot.addChild(plane);
    }

    const gizmoCamera = new pc.Entity('gizmoCamera');
    gizmoCamera.addComponent('camera', {
      clearColor: new pc.Color(0, 0, 0, 0),
      clearColorBuffer: true,
      layers: [gizmoLayer.id],
      priority: 1, // рисуется после основной камеры — поверх неё
      rect: new pc.Vec4(0.84, 0.03, 0.14, 0.14),
    });
    app.root.addChild(gizmoCamera);

    function updateGizmoTransform() {
      const yawQ = new pc.Quat().setFromEulerAngles(0, yaw, 0);
      const pitchQ = new pc.Quat().setFromEulerAngles(pitch, 0, 0);
      const rot = yawQ.clone().mul(pitchQ);
      const offset = rot.transformVector(new pc.Vec3(0, 0, 3));
      gizmoCamera.setPosition(offset.x, offset.y, offset.z);
      gizmoCamera.lookAt(0, 0, 0);
    }
    updateGizmoTransform();

    const gizmoPresets = {
      'x1': { yaw: 90, pitch: 0 }, 'x-1': { yaw: -90, pitch: 0 },
      'y1': { yaw: 0, pitch: -89.9 }, 'y-1': { yaw: 0, pitch: 89.9 },
      'z1': { yaw: 0, pitch: 0 }, 'z-1': { yaw: 180, pitch: 0 },
    };
    function handleGizmoPointerDown(e) {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const cw = canvas.clientWidth, ch = canvas.clientHeight;
      const r = gizmoCamera.camera.rect;
      const vx = r.x * cw, vw = r.z * cw;
      const vyTop = (1 - r.y - r.w) * ch, vh = r.w * ch;
      if (px < vx || px > vx + vw || py < vyTop || py > vyTop + vh) return false;

      const near = gizmoCamera.camera.screenToWorld(px, py, gizmoCamera.camera.nearClip, cw, ch);
      const far = gizmoCamera.camera.screenToWorld(px, py, gizmoCamera.camera.farClip, cw, ch);
      const dir = far.clone().sub(near).normalize();
      let tMin = -Infinity, tMax = Infinity, hitAxis = null, hitSign = 0;
      for (const axis of ['x', 'y', 'z']) {
        const o = near[axis], d = dir[axis];
        if (Math.abs(d) < 1e-9) {
          if (o < -0.5 || o > 0.5) return false;
          continue;
        }
        let t1 = (-0.5 - o) / d, t2 = (0.5 - o) / d, sign = -1;
        if (t1 > t2) { [t1, t2] = [t2, t1]; sign = 1; }
        if (t1 > tMin) { tMin = t1; hitAxis = axis; hitSign = sign; }
        tMax = Math.min(tMax, t2);
        if (tMin > tMax) return false;
      }
      if (!hitAxis) return false;
      const preset = gizmoPresets[hitAxis + hitSign];
      if (preset) {
        yaw = preset.yaw; pitch = preset.pitch;
        updateCameraTransform();
      }
      return true;
    }
    updateCameraTransform();

    // Корректирующий поворот -90° по X — общий для сплатов (рабочий
    // вариант из map.php, rotationPresets[0]) и для LAS (геодезический
    // Z-вверх -> Y-up мир этой сцены): см. комментарий в начале файла,
    // почему это один и тот же кватернион для обоих случаев.
    const AXIS_FIX_ROTATION = [-0.7071, 0, 0, 0.7071];

    app.start();
    log('Рендер-цикл запущен (pc.Application.start()).');

    if (!url) {
      log('URL файла не задан — выберите тур выше.');
    } else if (isLas) {
      await loadLasPointCloud(url);
    } else {
      await loadGsplat(url);
    }

    async function loadGsplat(url) {
      log('Загрузка сплат-файла:', url);
      showProgress('Загрузка модели...', 0);
      const loadStart = performance.now();
      const asset = new pc.Asset('splat-test', 'gsplat', { url, filename: url.split('/').pop() });
      app.assets.add(asset);

      asset.on('progress', (received, total) => {
        const pct = total ? (received / total) * 100 : 0;
        showProgress(`Загрузка модели... ${Math.round(pct)}%`, pct);
      });

      asset.on('error', (err) => {
        hideProgress();
        log('ОШИБКА загрузки/разбора:', String(err));
      });

      asset.on('load', () => {
        hideProgress();
        log('asset load() занял', Math.round(performance.now() - loadStart), 'мс');
        const resource = asset.resource;
        log('Число сплатов в файле:', resource && resource.numSplats);

        const entity = new pc.Entity('splat');
        entity.setLocalRotation(...AXIS_FIX_ROTATION);
        entity.addComponent('gsplat', { asset });
        app.root.addChild(entity);

        // Центрирование/панорамирование — по точке "наибольшей плотности"
        // (calcFocalPoint встроен в движок, взвешивает каждый сплат по
        // обратной величине его размера), а не по геометрическому центру
        // bounding box.
        const aabb = resource && resource.aabb;
        if (resource && resource.gsplatData && typeof resource.gsplatData.calcFocalPoint === 'function') {
          const focal = new pc.Vec3();
          resource.gsplatData.calcFocalPoint(focal);
          entity.getWorldTransform().transformPoint(focal, focal);
          target.copy(focal);
          log('Фокус по плотности (мир. координаты):', focal.toString());
        } else if (aabb) {
          target.copy(aabb.center);
        }
        if (aabb) {
          distance = Math.max(aabb.halfExtents.length() * 1.3, 0.5);
          log('AABB center:', aabb.center.toString(), 'halfExtents:', aabb.halfExtents.toString());
        }
        updateCameraTransform();

        if (resource && resource.textureDimensions) {
          log('Размер текстуры центров/цветов:', resource.textureDimensions.x, 'x', resource.textureDimensions.y);
        }
        log('Готово.');
      });

      app.assets.load(asset);
    }

    // Скачивание с реальным прогрессом по байтам (Content-Length) — старая
    // версия (las_test.php) использовала loaders.gl/core load(url, ...), у
    // которой top-level onProgress не поддерживается этой версией
    // библиотеки ("option not recognized"). Качаем сами через fetch +
    // ReadableStream, затем отдаём готовый ArrayBuffer в parse() — один
    // фетч, не два (раньше двойная закачка той же урлы вызывала
    // нестабильность).
    async function fetchWithProgress(url, onProgress) {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const total = Number(resp.headers.get('content-length')) || 0;
      const reader = resp.body.getReader();
      const chunks = [];
      let received = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (onProgress) onProgress(received, total);
      }
      const buf = new Uint8Array(received);
      let offset = 0;
      for (const c of chunks) { buf.set(c, offset); offset += c.length; }
      return buf.buffer;
    }

    // Точечное облако (LAS) рисуется собственным шейдером — стандартный
    // материал PlayCanvas не выставляет gl_PointSize для PRIMITIVE_POINTS.
    // matrix_model/matrix_viewProjection — встроенные имена uniform'ов
    // движка (см. engine/src/scene/renderer/renderer.js,
    // scope.resolve('matrix_model')), не наша придумка.
    function createPointCloudMaterial(pointSizePx) {
      const material = new pc.ShaderMaterial({
        uniqueName: 'LasPointCloudShader',
        attributes: { aPosition: pc.SEMANTIC_POSITION, aColor: pc.SEMANTIC_COLOR },
        vertexGLSL: `
          attribute vec3 aPosition;
          attribute vec4 aColor;
          uniform mat4 matrix_model;
          uniform mat4 matrix_viewProjection;
          uniform float uPointSize;
          varying vec4 vColor;
          void main(void) {
            vColor = aColor;
            vec4 worldPos = matrix_model * vec4(aPosition, 1.0);
            gl_Position = matrix_viewProjection * worldPos;
            gl_PointSize = uPointSize;
          }
        `,
        fragmentGLSL: `
          precision mediump float;
          varying vec4 vColor;
          void main(void) {
            gl_FragColor = vColor;
          }
        `,
      });
      material.setParameter('uPointSize', pointSizePx);
      material.update();
      return material;
    }

    async function loadLasPointCloud(url) {
      log('Загрузка LAS:', url);
      showProgress('Загрузка LAS...', 0);
      const loadStart = performance.now();

      let buffer;
      try {
        buffer = await fetchWithProgress(url, (received, total) => {
          const pct = total ? (received / total) * 100 : 0;
          showProgress(`Загрузка LAS... ${Math.round(pct)}%`, pct);
        });
      } catch (e) {
        hideProgress();
        log('ОШИБКА скачивания:', String(e));
        return;
      }
      log('Скачано', buffer.byteLength, 'байт за', Math.round(performance.now() - loadStart), 'мс. Разбор...');
      showProgress('Разбор LAS...', 100);

      const { parse } = await import('@loaders.gl/core');
      const { LASLoader } = await import('@loaders.gl/las');
      const parseStart = performance.now();
      let data;
      try {
        // worker:true (по умолчанию) — синхронный разбор (worker:false)
        // блокирует requestAnimationFrame на десятки секунд на больших
        // файлах (см. историю в map.php).
        data = await parse(buffer, LASLoader);
      } catch (e) {
        hideProgress();
        log('ОШИБКА разбора:', String(e));
        return;
      }
      hideProgress();
      log('parse() занял', Math.round(performance.now() - parseStart), 'мс');

      const posAttr = data.attributes && data.attributes.POSITION;
      if (!posAttr) {
        log('ОШИБКА: нет атрибута POSITION в распарсенных данных.');
        return;
      }
      const pos = posAttr.value;
      const count = pos.length / 3;
      log('Точек:', count);

      // Среднее, а НЕ min/max — устойчиво к единичным выбросам парсера
      // (см. историю в map.php: один и тот же файл давал extent 14.8 vs
      // 970271 vs 1177336 между открытиями при расчёте по min/max).
      let sumX = 0, sumY = 0, sumZ = 0;
      for (let i = 0; i < count; i++) { sumX += pos[i * 3]; sumY += pos[i * 3 + 1]; sumZ += pos[i * 3 + 2]; }
      const cx = sumX / count, cy = sumY / count, cz = sumZ / count;
      let varX = 0, varY = 0, varZ = 0;
      for (let i = 0; i < count; i++) {
        varX += (pos[i * 3] - cx) ** 2; varY += (pos[i * 3 + 1] - cy) ** 2; varZ += (pos[i * 3 + 2] - cz) ** 2;
      }
      const stdX = Math.sqrt(varX / count), stdY = Math.sqrt(varY / count), stdZ = Math.sqrt(varZ / count);
      const extent = Math.max(stdX, stdY, stdZ, 1) * 3;
      log('center (mean):', [cx, cy, cz], 'std:', [stdX, stdY, stdZ], 'extent (3σ):', extent);

      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = pos[i * 3] - cx;
        positions[i * 3 + 1] = pos[i * 3 + 1] - cy;
        positions[i * 3 + 2] = pos[i * 3 + 2] - cz;
      }

      const colorAttr = data.attributes.COLOR_0 && data.attributes.COLOR_0.value;
      const colors = new Uint8Array(count * 4);
      let hasRealColor = false;
      if (colorAttr) {
        const size = data.attributes.COLOR_0.size || 4;
        let maxRGB = 0;
        for (let i = 0; i < count; i++) {
          const r = colorAttr[i * size], g = colorAttr[i * size + 1], b = colorAttr[i * size + 2];
          if (r > maxRGB) maxRGB = r;
          if (g > maxRGB) maxRGB = g;
          if (b > maxRGB) maxRGB = b;
        }
        hasRealColor = maxRGB > 0;
      }
      if (hasRealColor) {
        const size = data.attributes.COLOR_0.size || 4;
        for (let i = 0; i < count; i++) {
          colors[i * 4] = colorAttr[i * size];
          colors[i * 4 + 1] = colorAttr[i * size + 1];
          colors[i * 4 + 2] = colorAttr[i * size + 2];
          colors[i * 4 + 3] = 255;
        }
      } else {
        log('Реального RGB нет — окраска по высоте (Z).');
        // pc.Color не умеет HSL — конвертируем сами (стандартная формула).
        const hslToRgb = (h, s, l) => {
          const k = (n) => (n + h * 12) % 12;
          const a = s * Math.min(l, 1 - l);
          const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
          return [f(0), f(8), f(4)];
        };
        for (let i = 0; i < count; i++) {
          const t = Math.max(0, Math.min(1, (positions[i * 3 + 2] + extent) / (2 * extent)));
          const [r, g, b] = hslToRgb((1 - t) * 0.66, 0.8, 0.5);
          colors[i * 4] = Math.round(r * 255);
          colors[i * 4 + 1] = Math.round(g * 255);
          colors[i * 4 + 2] = Math.round(b * 255);
          colors[i * 4 + 3] = 255;
        }
      }

      const mesh = new pc.Mesh(app.graphicsDevice);
      mesh.setPositions(positions);
      mesh.setColors32(colors);
      mesh.update(pc.PRIMITIVE_POINTS, true);

      const material = createPointCloudMaterial(2);
      const meshInstance = new pc.MeshInstance(mesh, material);

      const entity = new pc.Entity('las-points');
      entity.setLocalRotation(...AXIS_FIX_ROTATION);
      entity.addComponent('render', { meshInstances: [meshInstance] });
      app.root.addChild(entity);

      const focal = new pc.Vec3(0, 0, 0); // центр уже вычтен из позиций выше
      entity.getWorldTransform().transformPoint(focal, focal);
      target.copy(focal);
      distance = Math.max(extent * 1.8, 0.5);
      updateCameraTransform();
      log('Готово.');
    }
  </script>
</body>
</html>
