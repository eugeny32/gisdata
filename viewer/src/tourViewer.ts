import type { ModelType, PcModule } from './types';
import { createNavCubeGizmo } from './gizmo';
import { loadSplatFiles } from './splatLoader';
import { loadLasFiles } from './lasLoader';
import { cameraSettings, onCameraSettingsChange, type CameraSettings } from './cameraSettings';

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
}

let currentApp: PcAppWithGisdata | null = null;
let generation = 0;

export function disposeTourViewer(): void {
  if (!currentApp) return;
  const entry = currentApp;
  currentApp = null;
  try {
    entry.unsubscribeSettings();
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
      updateCameraTransform();
    }

    // Orbit камерой: drag левой кнопкой — поворот вокруг target, колесо —
    // зум. target — точка "плотности" модели (см. loadSplatFiles/loadLasFiles),
    // не геометрический центр bounding box.
    const target = new pc.Vec3(0, 0, 0);
    let distance = 5;
    let yaw = 45;
    let pitch = -20;

    const gizmo = createNavCubeGizmo(pc, app);

    function updateCameraTransform(): void {
      const yawQ = new pc.Quat().setFromEulerAngles(0, yaw, 0);
      const pitchQ = new pc.Quat().setFromEulerAngles(pitch, 0, 0);
      const rot = yawQ.clone().mul(pitchQ);
      const offset = rot.transformVector(new pc.Vec3(0, 0, distance));
      camera.setPosition(target.x + offset.x, target.y + offset.y, target.z + offset.z);
      camera.lookAt(target);
      // В ортографической проекции "зум" колесом не двигает камеру ближе
      // (расстояние не влияет на видимый размер), поэтому привязываем
      // orthoHeight к той же distance — иначе колесо мыши перестаёт
      // визуально работать как зум в ortho-режиме.
      (camera as any).camera.orthoHeight = distance * 0.5;
      gizmo.updateTransform(yaw, pitch);
    }

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    canvas.addEventListener('pointerdown', (e) => {
      const hit = gizmo.handlePointerDown(e, canvas);
      if (hit) {
        yaw = hit.yaw;
        pitch = hit.pitch;
        updateCameraTransform();
        return;
      }
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });
    window.addEventListener('pointerup', () => {
      dragging = false;
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const k = 0.3 * cameraSettings.orbitSensitivity;
      yaw -= (e.clientX - lastX) * k;
      pitch = Math.max(-89, Math.min(89, pitch - (e.clientY - lastY) * k));
      lastX = e.clientX;
      lastY = e.clientY;
      updateCameraTransform();
    });
    canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        distance = Math.max(0.05, distance * (1 + e.deltaY * 0.001 * cameraSettings.zoomSpeed));
        updateCameraTransform();
      },
      { passive: false }
    );

    applyCameraSettings(cameraSettings);
    const unsubscribeSettings = onCameraSettingsChange(applyCameraSettings);

    app.start();

    currentApp = { app, resizeObserver, recenter: updateCameraTransform, unsubscribeSettings };

    if (modelType === 'pointcloud') {
      await loadLasFiles(
        pc,
        app,
        urls,
        target,
        (d) => {
          distance = d;
        },
        updateCameraTransform,
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
        target,
        (d) => {
          distance = d;
        },
        updateCameraTransform,
        isCurrent,
        showProgress
      );
    }
    if (isCurrent()) {
      updateCameraTransform();
    }
    hideProgress();
  } catch (e) {
    hideProgress();
    showViewerError('Не удалось загрузить просмотрщик: ' + String(e));
  }
}

export { showViewerError, hideViewerError };
