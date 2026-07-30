import type { ModelType, PcModule } from './types';
import { createNavCubeGizmo } from './gizmo';
import { loadSplatFiles } from './splatLoader';
import { loadLasFiles } from './lasLoader';
import { loadCopcPointCloud, type CopcStreamHandle } from './copcLoader';
import { loadCollisionMesh, type CollisionMesh } from './collisionMesh';
import { setPointCloudColorMode, setPointCloudClip, setPointCloudSection } from './pointCloudMaterial';
import { cameraSettings, onCameraSettingsChange, type CameraSettings } from './cameraSettings';
import { OrbitController } from './navigation/orbitController';
import { FlyController } from './navigation/flyController';
import { createAnnotationManager, type AnnotationLayerData, type VertexHit, type AnnotationManager } from './annotations';

/** Минимальный HTML-escape для сообщения об ошибке — дублирует
 * escapeHtml() из map.php намеренно: модуль не должен тянуться в global
 * scope основной страницы, это единственное место в бандле, где он нужен. */
function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s ?? '';
  return div.innerHTML;
}

function showViewerError(message: string): void {
  hideViewerError();
  const body = document.querySelector('#tourViewerModal .modal-body');
  if (!body) return;
  const overlay = document.createElement('div');
  overlay.id = 'tourViewerError';
  overlay.className = 'position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3';
  overlay.style.zIndex = '2000';
  overlay.style.background = 'rgba(0,0,0,.6)';
  overlay.innerHTML = '<div class="alert alert-danger mb-0" style="max-width: 600px;">' + escapeHtml(message) + '</div>';
  body.appendChild(overlay);
}

function hideViewerError(): void {
  const existing = document.getElementById('tourViewerError');
  if (existing) existing.remove();
}

interface PcAppWithGisdata {
  app: InstanceType<PcModule['Application']>;
  resizeObserver: ResizeObserver;
  recenter: () => void;
  unsubscribeSettings: () => void;
  detachNavigation: () => void;
  copcHandles: CopcStreamHandle[];
  collisionMesh: CollisionMesh | null;
  splatObjectUrls: string[];
  annotations: AnnotationManager;
  camera: InstanceType<PcModule['Entity']>;
  canvas: HTMLCanvasElement;
}

let currentApp: PcAppWithGisdata | null = null;
let generation = 0;

export function disposeTourViewer(): void {
  if (!currentApp) return;
  const entry = currentApp;
  currentApp = null;
  try {
    entry.unsubscribeSettings();
    entry.detachNavigation();
    for (const handle of entry.copcHandles) handle.dispose();
    entry.collisionMesh?.dispose();
    // blob:-URL из splatCache.ts (resolveSplatUrl) — данные уже отдельно
    // лежат в Cache Storage, эти объекты — просто временная ручка
    // браузерной памяти на время жизни ЭТОГО pc.Application.
    for (const url of entry.splatObjectUrls) URL.revokeObjectURL(url);
    entry.annotations.dispose();
    entry.resizeObserver.disconnect();
    entry.app.destroy();
  } catch (e) {
    /* noop */
  }
}

export function recenterTourCamera(): void {
  if (!currentApp) return;
  currentApp.recenter();
}

/** Точка на поверхности модели под курсором (приближённо, см. annotations.ts)
 * — в локальных координатах модели (готово для сохранения через
 * api/tour_annotations.php), либо null (модель не загружена/курсор мимо). */
export function pickTourPoint(clientX: number, clientY: number): [number, number, number] | null {
  if (!currentApp) return null;
  return currentApp.annotations.pickPoint(currentApp.camera, currentApp.canvas, clientX, clientY);
}

/** Точная горизонтальная проекция клика (для сечения по линии, см.
 * annotations.ts/pickGroundPoint) — не зависит от приближения по сфере. */
export function pickTourGroundPoint(clientX: number, clientY: number): [number, number, number] | null {
  if (!currentApp) return null;
  return currentApp.annotations.pickGroundPoint(currentApp.camera, currentApp.canvas, clientX, clientY);
}

/** Существующая вершина аннотации под курсором (для редактирования) —
 * см. annotations.ts. */
export function pickTourAnnotationVertex(clientX: number, clientY: number): VertexHit | null {
  if (!currentApp) return null;
  return currentApp.annotations.pickVertex(currentApp.camera, currentApp.canvas, clientX, clientY);
}

export function setTourAnnotationLayers(layers: AnnotationLayerData[]): void {
  if (!currentApp) return;
  currentApp.annotations.setLayers(layers);
}

export function setTourDrawingPreview(points: [number, number, number][] | null, color: string): void {
  if (!currentApp) return;
  currentApp.annotations.setDrawingPreview(points, color);
}

export async function loadTourScene(
  urls: string[],
  modelType: ModelType,
  /** Параллельный urls массив той же длины — элемент не null, если для
   * этого файла уже готов потоковый .copc.laz (см. api/tours.php, PR4).
   * Файлы без готового COPC грузятся старым полным lasLoader.ts. */
  copcUrls: (string | null)[] = [],
  /** То же самое для .sog (PR5) — параллельно urls, для сплат-туров. */
  sogUrls: (string | null)[] = [],
  /** Коллайдер для Walk-режима (PR5) — берётся только у первого файла
   * тура, как и центрирование/distance (см. loadSplatFiles ниже). */
  collisionUrl: string | null = null
): Promise<void> {
  hideViewerError();
  generation++;
  const myGeneration = generation;
  const isCurrent = () => myGeneration === generation;
  disposeTourViewer();

  const container = document.getElementById('tourViewerContainer');
  if (!container) return;
  container.innerHTML = '';
  container.style.position = 'relative';
  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  // Без этого браузер на тач-устройствах сам обрабатывает свайп/pinch как
  // скролл/масштаб страницы — конкурирует с нашими pointer-обработчиками
  // (PR8, мобильный проход, см. OrbitController.touchPoints).
  canvas.style.touchAction = 'none';
  container.appendChild(canvas);

  const progressWrap = document.createElement('div');
  progressWrap.className = 'position-absolute top-50 start-50 translate-middle p-3 rounded text-center';
  progressWrap.style.zIndex = '1050';
  progressWrap.style.background = 'rgba(0,0,0,.75)';
  progressWrap.style.color = '#fff';
  progressWrap.style.width = '280px';
  progressWrap.innerHTML =
    '<div class="mb-2" id="tourPcProgressLabel">Загрузка...</div>' +
    '<div class="progress" style="height:8px;"><div class="progress-bar" id="tourPcProgressBar" style="width:0%"></div></div>';
  container.appendChild(progressWrap);

  function showProgress(text: string, pct: number): void {
    if (!progressWrap.isConnected) return;
    progressWrap.querySelector('#tourPcProgressLabel')!.textContent = text;
    (progressWrap.querySelector('#tourPcProgressBar') as HTMLElement).style.width = Math.max(0, Math.min(100, pct)) + '%';
  }
  function hideProgress(): void {
    progressWrap.remove();
  }

  // Индикатор FPS/памяти/стриминга (PR8) — создаём элемент сразу, прячем
  // через CSS (cameraSettings.showStats), а не condicional-рендер, чтобы
  // не плодить лишний DOM-код на каждое включение/выключение.
  const statsOverlay = document.createElement('div');
  statsOverlay.className = 'position-absolute bottom-0 end-0 m-2 p-2 rounded';
  statsOverlay.style.zIndex = '1090';
  statsOverlay.style.background = 'rgba(0,0,0,.6)';
  statsOverlay.style.color = '#bbb';
  statsOverlay.style.fontSize = '11px';
  statsOverlay.style.fontFamily = 'monospace';
  statsOverlay.style.lineHeight = '1.4';
  statsOverlay.style.pointerEvents = 'none';
  statsOverlay.style.whiteSpace = 'pre';
  statsOverlay.style.display = cameraSettings.showStats ? 'block' : 'none';
  container.appendChild(statsOverlay);

  try {
    // Динамический import — ленивая загрузка движка, только когда
    // реально открывают тур (не на каждой загрузке map.php).
    const pc: PcModule = await import('playcanvas');
    if (!isCurrent()) {
      hideProgress();
      return;
    }

    const app = new pc.Application(canvas, { graphicsDeviceOptions: { antialias: true } });
    // FILLMODE_NONE — канвас заполняет КОНТЕЙНЕР модалки, а не всё окно
    // браузера.
    app.setCanvasFillMode(pc.FILLMODE_NONE);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    function resizeCanvasToContainer(): void {
      app.resizeCanvas(container!.clientWidth || 300, container!.clientHeight || 300);
    }
    resizeCanvasToContainer();
    const resizeObserver = new ResizeObserver(resizeCanvasToContainer);
    resizeObserver.observe(container);

    const worldLayer = app.scene.layers.getLayerByName('World')!;
    const camera = new pc.Entity('camera');
    camera.addComponent('camera', {
      clearColor: new pc.Color(0.11, 0.12, 0.15),
      layers: [
        worldLayer.id,
        app.scene.layers.getLayerByName('Skybox')!.id,
        app.scene.layers.getLayerByName('Immediate')!.id,
        app.scene.layers.getLayerByName('UI')!.id,
      ],
      priority: 0,
    });
    app.root.addChild(camera);

    const lasMaterials: InstanceType<PcModule['ShaderMaterial']>[] = [];

    // Модуль 4 ("Камера + настройки") — применяем сохранённые/дефолтные
    // настройки сразу при создании камеры, и повторно при каждом их
    // изменении из Settings Panel (см. подписку ниже).
    function applyCameraSettings(settings: CameraSettings): void {
      const camComp: any = (camera as any).camera;
      camComp.fov = settings.fov;
      camComp.nearClip = settings.nearClip;
      camComp.farClip = settings.farClip;
      camComp.projection = settings.projection === 'orthographic' ? pc.PROJECTION_ORTHOGRAPHIC : pc.PROJECTION_PERSPECTIVE;
      for (const material of lasMaterials) {
        material.setParameter('uPointSize', settings.pointSizePx);
        setPointCloudColorMode(material, settings.colorMode);
        setPointCloudClip(material, settings.clipEnabled, { min: settings.clipMin, max: settings.clipMax });
        setPointCloudSection(material, settings.sectionEnabled, settings.sectionNormal, settings.sectionD);
      }
      statsOverlay.style.display = settings.showStats ? 'block' : 'none';
      setNavigationModeInternal(settings.navigationMode);
      if (activeMode === 'orbit') orbit.update();
    }

    // Модуль 1 ("Навигация") — штурвал переиспользуется обоими режимами
    // (принимает простые числа yaw/pitch, не завязан на конкретный
    // контроллер — это и есть его "переиспользуемость", см. gizmo.ts).
    const gizmo = createNavCubeGizmo(pc, app);
    const orbit = new OrbitController(pc, camera, gizmo);
    const fly = new FlyController(pc, camera, gizmo);
    const annotations = createAnnotationManager(pc, app);

    // FlyController обслуживает и 'fly', и 'walk' — различие только в том,
    // выставлен ли fly.collisionMesh (см. updateFlyCollision ниже). 'walk'
    // без загруженного коллайдера (тур без сплатов/без готового .collision.glb)
    // молча работает как обычный полёт без коллизий.
    let activeMode: 'orbit' | 'fly' = cameraSettings.navigationMode === 'orbit' ? 'orbit' : 'fly';
    let requestedMode: 'orbit' | 'fly' | 'walk' = cameraSettings.navigationMode;
    let collisionMesh: CollisionMesh | null = null;

    function updateFlyCollision(): void {
      fly.collisionMesh = requestedMode === 'walk' ? collisionMesh : null;
    }

    function syncFlyFromOrbit(): void {
      fly.syncFrom(camera.getPosition(), orbit.yaw, orbit.pitch);
    }

    function setNavigationModeInternal(mode: 'orbit' | 'fly' | 'walk'): void {
      requestedMode = mode;
      updateFlyCollision();
      const next = mode === 'orbit' ? 'orbit' : 'fly';
      if (next === activeMode) return;
      if (activeMode === 'orbit') orbit.detach();
      else fly.detach();
      activeMode = next;
      if (activeMode === 'orbit') {
        orbit.attach(canvas);
        orbit.update();
      } else {
        syncFlyFromOrbit();
        fly.attach(canvas);
      }
    }

    if (activeMode === 'orbit') orbit.attach(canvas);
    else {
      syncFlyFromOrbit();
      fly.attach(canvas);
    }

    /** "Центрировать" (Home) — независимо от текущего режима возвращает
     * камеру к ИСХОДНОМУ виду модели (см. OrbitController.resetToHome —
     * раньше здесь был orbit.update(), который просто пересчитывал ТЕКУЩЕЕ,
     * уже смещённое панорамированием/зумом состояние, то есть кнопка
     * фактически никуда не "центрировала"). Если активен полёт —
     * синхронизирует его состояние с этим видом, чтобы WASD продолжил
     * движение от свежей позиции, а не от старой. */
    function recenter(): void {
      orbit.resetToHome();
      if (activeMode === 'fly') syncFlyFromOrbit();
    }

    const copcHandles: CopcStreamHandle[] = [];
    const splatObjectUrls: string[] = [];
    let lastStatsAt = 0;
    app.on('update', (dt: number) => {
      if (activeMode === 'fly') fly.update(dt);
      else orbit.tick(dt);
      const isMoving = activeMode === 'fly' ? fly.isInteracting() : orbit.isInteracting();
      for (const handle of copcHandles) handle.refresh(camera, isMoving);

      // Раз в полсекунды — обновление текста индикатора достаточно частое
      // для "живого" ощущения, но не нагружает DOM каждый кадр.
      const now = performance.now();
      if (statsOverlay.style.display !== 'none' && now - lastStatsAt > 500) {
        lastStatsAt = now;
        const fps = Math.round((app as any).stats.frame.fps);
        const vram = (app as any).stats.vram;
        const vramMb = ((vram.vb + vram.ib + vram.tex) / (1024 * 1024)).toFixed(1);
        const lines = [`FPS: ${fps}`, `VRAM: ${vramMb} МБ`];
        for (let i = 0; i < copcHandles.length; i++) {
          const s = copcHandles[i].getStats();
          lines.push(`COPC ${i + 1}: ${s.loadedNodes} узлов, ${s.loadedPoints.toLocaleString('ru-RU')} точек`);
        }
        statsOverlay.textContent = lines.join('\n');
      }
    });

    applyCameraSettings(cameraSettings);
    const unsubscribeSettings = onCameraSettingsChange(applyCameraSettings);

    app.start();

    currentApp = {
      app,
      resizeObserver,
      recenter,
      unsubscribeSettings,
      detachNavigation: () => (activeMode === 'orbit' ? orbit.detach() : fly.detach()),
      copcHandles,
      splatObjectUrls,
      annotations,
      camera,
      canvas,
      get collisionMesh() {
        return collisionMesh;
      },
    };

    // Коллайдер грузится параллельно с моделью (не блокирует появление
    // сплатов на экране) — готов он будет позже, Walk просто без коллизий
    // до этого момента (см. updateFlyCollision).
    if (collisionUrl) {
      loadCollisionMesh(pc, app, collisionUrl)
        .then((mesh) => {
          if (!isCurrent()) {
            mesh?.dispose();
            return;
          }
          collisionMesh = mesh;
          updateFlyCollision();
        })
        .catch((err) => console.error('Walk: не удалось загрузить коллайдер', err));
    }

    if (modelType === 'pointcloud') {
      // Центрирование/distance выставляет только первый файл (как и раньше
      // у LAS/сплатов) — независимо от того, идёт ли он через COPC-стриминг
      // или через старый полный загрузчик.
      let isFirstFile = true;
      const legacyUrls: string[] = [];
      const legacyIsFirst: boolean[] = [];
      for (let i = 0; i < urls.length; i++) {
        const copcUrl = copcUrls[i];
        if (copcUrl) {
          const setDistance = isFirstFile ? (d: number) => orbit.setDistance(d) : () => {};
          const updateTransform = isFirstFile ? () => orbit.update() : () => {};
          const handle = await loadCopcPointCloud(
            pc, app, copcUrl, orbit.target, setDistance, updateTransform,
            isCurrent, showProgress, cameraSettings.pointSizePx, lasMaterials
          );
          copcHandles.push(handle);
        } else {
          legacyUrls.push(urls[i]);
          legacyIsFirst.push(isFirstFile);
        }
        isFirstFile = false;
      }
      // loadLasFiles центрирует только по САМОМУ первому файлу внутри своего
      // цикла (см. lasLoader.ts) — раз так, тут есть смысл вызывать его
      // отдельно на центрирующий файл, только если это первый файл во всём
      // туре (legacyIsFirst[0] === true), иначе всегда передавать no-op.
      if (legacyUrls.length) {
        const centerThisBatch = legacyIsFirst[0] === true;
        await loadLasFiles(
          pc,
          app,
          legacyUrls,
          orbit.target,
          centerThisBatch ? (d) => orbit.setDistance(d) : () => {},
          centerThisBatch ? () => orbit.update() : () => {},
          isCurrent,
          showProgress,
          cameraSettings.pointSizePx,
          lasMaterials
        );
      }
    } else {
      await loadSplatFiles(
        pc,
        app,
        urls,
        orbit.target,
        (d) => orbit.setDistance(d),
        () => orbit.update(),
        isCurrent,
        showProgress,
        sogUrls,
        splatObjectUrls
      );
    }
    if (isCurrent()) {
      // Снимок "домашнего" вида делаем ПОСЛЕ того, как загрузчик
      // отработал и выставил итоговые target/distance — это и есть тот
      // вид, к которому дальше будет возвращать кнопка "Центрировать".
      orbit.captureHome();
      recenter();
      const sphere = orbit.getHomeSphere();
      annotations.setPickSphere(sphere.center, sphere.radius);
      // COPC-туры (реальные точки) — точный пикинг вместо сферы, см.
      // annotations.ts/pickPoint. Пусто для сплатов/legacy LAS без COPC —
      // там остаётся только сфера.
      annotations.setCopcHandles(copcHandles);
    }
    hideProgress();
  } catch (e) {
    hideProgress();
    showViewerError('Не удалось загрузить просмотрщик: ' + String(e));
  }
}

export { showViewerError, hideViewerError };
