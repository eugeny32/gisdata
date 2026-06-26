import type { PcModule } from '../types';
import { cameraSettings } from '../cameraSettings';
import type { NavCubeGizmo } from '../gizmo';

/**
 * Орбитальная камера — вынесена из tourViewer.ts (PR2, модуль 1) почти
 * без изменения поведения по сравнению с PR0/PR1: drag левой кнопкой
 * вращает вокруг `target`, колесо меняет `distance`. target/distance —
 * не геометрия камеры, а состояние, которое выставляют loadSplatFiles/
 * loadLasFiles при центрировании модели (см. tourViewer.ts).
 */
export class OrbitController {
  target: InstanceType<PcModule['Vec3']>;
  distance = 5;
  yaw = 45;
  pitch = -20;

  // "Домашний" вид — снимок target/distance/yaw/pitch на момент, когда
  // загрузчик модели только закончил центрирование (см. captureHome() и
  // tourViewer.ts). До этого кнопка "Центрировать" просто пересчитывала
  // ТЕКУЩЕЕ состояние (которое уже могло быть смещено панорамированием/
  // зумом пользователя) — то есть фактически ничего не возвращала на
  // место, хотя называлась "центрировать"/Home.
  private homeTarget: InstanceType<PcModule['Vec3']>;
  private homeDistance = 5;
  private homeYaw = 45;
  private homePitch = -20;

  private pc: PcModule;
  private camera: InstanceType<PcModule['Entity']>;
  private gizmo: NavCubeGizmo;
  private canvas: HTMLCanvasElement | null = null;
  /** null — нет активного драга; иначе кнопка, с которой он начался (0 —
   * левая → вращение, 2 — правая → панорамирование). */
  private dragButton: number | null = null;
  private lastX = 0;
  private lastY = 0;
  /** Активные касания (PR8, мобильный проход) — id -> последняя позиция;
   * 2 одновременных касания = pinch-zoom вместо вращения/панорамирования
   * (на тач-экране нет колеса мыши для зума). */
  private touchPoints = new Map<number, { x: number; y: number }>();
  private pinchStartDistance = 0;
  private pinchStartCameraDistance = 0;

  private onPointerDown = (e: PointerEvent) => {
    if (!this.canvas) return;
    if (e.pointerType === 'touch') {
      this.touchPoints.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.touchPoints.size === 2) {
        this.dragButton = null;
        this.pinchStartDistance = this.touchDistance();
        this.pinchStartCameraDistance = this.distance;
        return;
      }
    }
    if (e.button === 0) {
      const hit = this.gizmo.handlePointerDown(e, this.canvas);
      if (hit) {
        this.yaw = hit.yaw;
        this.pitch = hit.pitch;
        this.update();
        return;
      }
    }
    if (e.button !== 0 && e.button !== 2) return;
    this.dragButton = e.button;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  };

  private onPointerUp = (e: PointerEvent) => {
    this.touchPoints.delete(e.pointerId);
    this.dragButton = null;
  };

  private onContextMenu = (e: MouseEvent) => {
    // Без этого после правого drag всплывало контекстное меню браузера —
    // прерывало панорамирование на каждое отпускание кнопки.
    e.preventDefault();
  };

  private touchDistance(): number {
    const points = Array.from(this.touchPoints.values());
    if (points.length < 2) return 0;
    return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
  }

  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch' && this.touchPoints.has(e.pointerId)) {
      this.touchPoints.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.touchPoints.size === 2) {
        const dist = this.touchDistance();
        if (this.pinchStartDistance > 1e-3) {
          this.distance = Math.max(0.05, this.pinchStartCameraDistance * (this.pinchStartDistance / dist));
          this.update();
        }
        return;
      }
    }
    if (this.dragButton === null) return;
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    if (this.dragButton === 2) {
      this.pan(dx, dy);
    } else {
      const k = 0.3 * cameraSettings.orbitSensitivity;
      this.yaw -= dx * k;
      this.pitch = Math.max(-89, Math.min(89, this.pitch - dy * k));
    }
    this.update();
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.distance = Math.max(0.05, this.distance * (1 + e.deltaY * 0.001 * cameraSettings.zoomSpeed));
    this.update();
  };

  /** Панорамирование правой кнопкой — двигает target (а с ним и всю
   * орбиту) в плоскости экрана камеры. Масштаб смещения привязан к
   * distance — иначе на сильном зуме панорамирование было бы либо
   * незаметным, либо слишком резким относительно видимого размера модели. */
  private pan(dxPx: number, dyPx: number): void {
    const k = (this.distance / 500) * cameraSettings.orbitSensitivity;
    const right = this.camera.right.clone().mulScalar(-dxPx * k);
    const up = this.camera.up.clone().mulScalar(dyPx * k);
    this.target.add(right).add(up);
  }

  constructor(pc: PcModule, camera: InstanceType<PcModule['Entity']>, gizmo: NavCubeGizmo) {
    this.pc = pc;
    this.camera = camera;
    this.gizmo = gizmo;
    this.target = new pc.Vec3(0, 0, 0);
    this.homeTarget = new pc.Vec3(0, 0, 0);
  }

  attach(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('wheel', this.onWheel, { passive: false });
    canvas.addEventListener('contextmenu', this.onContextMenu);
  }

  detach(): void {
    this.dragButton = null;
    this.touchPoints.clear();
    if (!this.canvas) return;
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('wheel', this.onWheel);
    this.canvas.removeEventListener('contextmenu', this.onContextMenu);
    this.canvas = null;
  }

  setDistance(d: number): void {
    this.distance = d;
  }

  /** Зовётся загрузчиком модели ОДИН раз сразу после того, как он
   * посчитал target/distance для свежезагруженной модели (см.
   * tourViewer.ts) — это и есть тот самый "начальный вид", к которому
   * должна возвращать кнопка "Центрировать". */
  captureHome(): void {
    this.homeTarget.copy(this.target);
    this.homeDistance = this.distance;
    this.homeYaw = this.yaw;
    this.homePitch = this.pitch;
  }

  /** "Сфера модели" — центр и радиус, под которые подогнана камера при
   * captureHome() (target/distance, теми же коэффициентами, что и framing
   * самой камеры, см. copcLoader.ts/splatLoader.ts/lasLoader.ts). Используется
   * только как ГРУБОЕ приближение поверхности модели для пикинга аннотаций
   * (annotations.ts) — у PlayCanvas нет настоящего picking для облака точек/
   * сплатов, см. комментарий там. */
  getHomeSphere(): { center: InstanceType<PcModule['Vec3']>; radius: number } {
    return { center: this.homeTarget.clone(), radius: this.homeDistance };
  }

  /** Кнопка "Центрировать" (Home) — в отличие от update(), не пересчитывает
   * ТЕКУЩЕЕ состояние, а сначала восстанавливает target/distance/yaw/pitch
   * из снимка captureHome(), и только потом пересчитывает камеру. */
  resetToHome(): void {
    this.target.copy(this.homeTarget);
    this.distance = this.homeDistance;
    this.yaw = this.homeYaw;
    this.pitch = this.homePitch;
    this.update();
  }

  /** Пересчитывает позицию камеры из target/distance/yaw/pitch и двигает
   * штурвал в ту же ориентацию — единая точка входа и для пользовательского
   * драга, и для внешних вызовов (центрирование, завершение загрузки модели). */
  update(): void {
    const pc = this.pc;
    const yawQ = new pc.Quat().setFromEulerAngles(0, this.yaw, 0);
    const pitchQ = new pc.Quat().setFromEulerAngles(this.pitch, 0, 0);
    const rot = yawQ.clone().mul(pitchQ);
    const offset = rot.transformVector(new pc.Vec3(0, 0, this.distance));
    this.camera.setPosition(this.target.x + offset.x, this.target.y + offset.y, this.target.z + offset.z);
    this.camera.lookAt(this.target);
    // См. комментарий в прежней версии (tourViewer.ts, PR1) — orthoHeight
    // привязан к distance, иначе колесо мыши не работает как зум в ortho.
    (this.camera as any).camera.orthoHeight = this.distance * 0.5;
    this.gizmo.updateTransform(this.yaw, this.pitch);
  }
}
