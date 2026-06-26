import type { ModelType, PcModule } from './types';
import { createNavCubeGizmo } from './gizmo';
import { loadSplatFiles } from './splatLoader';
import { loadLasFiles } from './lasLoader';
import { cameraSettings, onCameraSettingsChange, type CameraSettings } from './cameraSettings';
import { OrbitController } from './navigation/orbitController';
import { FlyController } from './navigation/flyController';

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

export async function loadTourScene(urls: string[], modelType: ModelType): Promise<void> {
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
        material.update();
      }
      setNavigationModeInternal(settings.navigationMode);
      if (activeMode === 'orbit') orbit.update();
    }

    // Модуль 1 ("Навигация") — штурвал переиспользуется обоими режимами
    // (принимает простые числа yaw/pitch, не завязан на конкретный
    // контроллер — это и есть его "переиспользуемость", см. gizmo.ts).
    const gizmo = createNavCubeGizmo(pc, app);
    const orbit = new OrbitController(pc, camera, gizmo);
    const fly = new FlyController(pc, camera, gizmo);

    // 'walk' зарезервирован под PR5 (коллизии через -K-коллайдер из
    // splat-transform) — пока молча работает как 'fly' (см. cameraSettings.ts).
    let activeMode: 'orbit' | 'fly' = cameraSettings.navigationMode === 'orbit' ? 'orbit' : 'fly';

    function syncFlyFromOrbit(): void {
      fly.syncFrom(camera.getPosition(), orbit.yaw, orbit.pitch);
    }

    function setNavigationModeInternal(mode: 'orbit' | 'fly' | 'walk'): void {
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

    /** "Центрировать" — независимо от текущего режима возвращает камеру к
     * виду по умолчанию (target/distance/yaw/pitch орбиты для этой модели);
     * если активен полёт — синхронизирует его состояние с этим видом, чтобы
     * WASD продолжил движение от свежей позиции, а не от старой. */
    function recenter(): void {
      orbit.update();
      if (activeMode === 'fly') syncFlyFromOrbit();
    }

    app.on('update', (dt: number) => {
      if (activeMode === 'fly') fly.update(dt);
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
    };

    if (modelType === 'pointcloud') {
      await loadLasFiles(
        pc,
        app,
        urls,
        orbit.target,
        (d) => orbit.setDistance(d),
        () => orbit.update(),
        isCurrent,
        showProgress,
        cameraSettings.pointSizePx,
        lasMaterials
      );
    } else {
      await loadSplatFiles(
        pc,
        app,
        urls,
        orbit.target,
        (d) => orbit.setDistance(d),
        () => orbit.update(),
        isCurrent,
        showProgress
      );
    }
    if (isCurrent()) {
      recenter();
    }
    hideProgress();
  } catch (e) {
    hideProgress();
    showViewerError('Не удалось загрузить просмотрщик: ' + String(e));
  }
}

export { showViewerError, hideViewerError };
