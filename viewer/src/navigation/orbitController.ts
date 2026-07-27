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

  // Плавная анимация перехода (клик по штурвалу, кнопка "Центрировать") —
  // плавное начало/продолжение/торможение через кубическое ease-in-out, а
  // не мгновенный прыжок камеры (по запросу пользователя, "как в Potree").
  private anim: {
    fromYaw: number;
    fromPitch: number;
    fromDistance: number;
    fromTarget: InstanceType<PcModule['Vec3']>;
    toYaw: number;
    toPitch: number;
    toDistance: number;
    toTarget: InstanceType<PcModule['Vec3']>;
    elapsed: number;
    duration: number;
  } | null = null;

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
        this.animateTo(hit.yaw, hit.pitch, this.distance, this.target, 0.6);
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

  private lastWheelAt = 0;

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.distance = Math.max(0.05, this.distance * (1 + e.deltaY * 0.001 * cameraSettings.zoomSpeed));
    this.lastWheelAt = performance.now();
    this.update();
  };

  /** Камера сейчас в движении (драг/пинч/недавнее колесо/анимация
   * перехода) — читается copcLoader.ts через tourViewer.ts, чтобы на время
   * движения снижать требуемую детализацию COPC-стриминга (см.
   * MOVING_THRESHOLD_MULTIPLIER там). Колесо мыши — мгновенное событие, не
   * "удержание", поэтому считаем "в движении" ещё немного ПОСЛЕ него
   * (иначе одиночный скролл не успел бы попасть в окно сниженной
   * детализации, в которой и есть весь смысл). */
  isInteracting(): boolean {
    return this.dragButton !== null || this.touchPoints.size > 0 || this.anim !== null || performance.now() - this.lastWheelAt < 250;
  }

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
   * ТЕКУЩЕЕ состояние, а плавно анимирует переход к снимку captureHome(). */
  resetToHome(): void {
    this.animateTo(this.homeYaw, this.homePitch, this.homeDistance, this.homeTarget, 0.7);
  }

  /** Запускает плавный переход к новому yaw/pitch/distance/target —
   * see this.anim/tick(). Текущее значение становится точкой отправления,
   * повторный вызов во время уже идущей анимации просто переопределяет
   * цель (не складывает анимации друг на друга). */
  animateTo(
    toYaw: number,
    toPitch: number,
    toDistance: number,
    toTarget: InstanceType<PcModule['Vec3']>,
    durationSec: number
  ): void {
    // Кратчайший путь по yaw (не через 350°, если можно через -10°) —
    // считаем разницу здесь, а не в tick(), чтобы fromYaw оставался
    // "развёрнутым" (может быть не в диапазоне [-180,180]), tick() просто
    // линейно идёт от fromYaw к fromYaw+delta.
    let deltaYaw = toYaw - this.yaw;
    deltaYaw = ((deltaYaw + 180) % 360 + 360) % 360 - 180;
    this.anim = {
      fromYaw: this.yaw,
      fromPitch: this.pitch,
      fromDistance: this.distance,
      fromTarget: this.target.clone(),
      toYaw: this.yaw + deltaYaw,
      toPitch,
      toDistance,
      toTarget: toTarget.clone(),
      elapsed: 0,
      duration: Math.max(durationSec, 1e-3),
    };
  }

  /** Зовётся каждый кадр из tourViewer.ts, пока активен орбитальный режим —
   * без активной анимации (this.anim === null) это no-op. dt — секунды
   * (как у app.on('update', dt), см. FlyController.update). */
  tick(dt: number): void {
    if (!this.anim) return;
    const a = this.anim;
    a.elapsed += dt;
    const t = Math.min(1, a.elapsed / a.duration);
    // Кубическое ease-in-out — плавный старт, плавное продолжение, плавное
    // торможение (по запросу пользователя, "как в Potree"), а не линейная
    // интерполяция (которая ощущается как резкий старт/стоп).
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    this.yaw = a.fromYaw + (a.toYaw - a.fromYaw) * eased;
    this.pitch = a.fromPitch + (a.toPitch - a.fromPitch) * eased;
    this.distance = a.fromDistance + (a.toDistance - a.fromDistance) * eased;
    this.target.lerp(a.fromTarget, a.toTarget, eased);
    this.update();
    if (t >= 1) this.anim = null;
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
