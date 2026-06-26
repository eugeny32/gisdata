import type { PcModule } from '../types';
import { cameraSettings } from '../cameraSettings';
import type { NavCubeGizmo } from '../gizmo';

const MOVE_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ShiftLeft', 'ShiftRight']);

/**
 * Свободный полёт (модуль 1.1, без коллизий) — left-drag вращает саму
 * камеру (не орбиту вокруг target), WASD двигает вдоль её локальных осей,
 * Space/Shift — вверх/вниз. Коллизии (`-K`-коллайдер из splat-transform)
 * — отдельная задача PR5, здесь камера свободно проходит сквозь геометрию.
 */
export class FlyController {
  yaw = 0;
  pitch = 0;

  private camera: InstanceType<PcModule['Entity']>;
  private gizmo: NavCubeGizmo;
  private canvas: HTMLCanvasElement | null = null;
  /** null — нет активного драга; иначе кнопка (0 — левая → поворот взгляда,
   * 2 — правая → панорамирование/страйф мышью, в дополнение к WASD). */
  private dragButton: number | null = null;
  private lastX = 0;
  private lastY = 0;
  private pressedKeys = new Set<string>();

  private onPointerDown = (e: PointerEvent) => {
    if (!this.canvas) return;
    if (e.button === 0) {
      const hit = this.gizmo.handlePointerDown(e, this.canvas);
      if (hit) {
        this.yaw = hit.yaw;
        this.pitch = hit.pitch;
        this.applyRotation();
        return;
      }
    }
    if (e.button !== 0 && e.button !== 2) return;
    this.dragButton = e.button;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  };

  private onPointerUp = () => {
    this.dragButton = null;
  };

  private onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  private onPointerMove = (e: PointerEvent) => {
    if (this.dragButton === null) return;
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    if (this.dragButton === 2) {
      const k = 0.01 * cameraSettings.orbitSensitivity;
      const pos = this.camera.getPosition().clone();
      pos.add(this.camera.right.clone().mulScalar(-dx * k));
      pos.add(this.camera.up.clone().mulScalar(dy * k));
      this.camera.setPosition(pos);
      return;
    }
    const k = 0.3 * cameraSettings.orbitSensitivity;
    this.yaw -= dx * k;
    this.pitch = Math.max(-89, Math.min(89, this.pitch - dy * k));
    this.applyRotation();
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (MOVE_KEYS.has(e.code)) this.pressedKeys.add(e.code);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.pressedKeys.delete(e.code);
  };

  // pc принимается, но не используется напрямую (camera.forward/right/up и
  // setEulerAngles — обычные методы Entity, без отдельных pc.* вызовов) —
  // параметр оставлен ради одной сигнатуры конструктора с OrbitController.
  constructor(_pc: PcModule, camera: InstanceType<PcModule['Entity']>, gizmo: NavCubeGizmo) {
    this.camera = camera;
    this.gizmo = gizmo;
  }

  attach(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    canvas.addEventListener('contextmenu', this.onContextMenu);
  }

  detach(): void {
    this.pressedKeys.clear();
    this.dragButton = null;
    if (!this.canvas) return;
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('contextmenu', this.onContextMenu);
    this.canvas = null;
  }

  /** Перенять текущее положение/ориентацию (например, от OrbitController
   * при переключении режима или после центрирования модели) — без этого
   * полёт продолжил бы двигаться от своих старых, уже неактуальных yaw/pitch. */
  syncFrom(position: InstanceType<PcModule['Vec3']>, yaw: number, pitch: number): void {
    this.camera.setPosition(position.x, position.y, position.z);
    this.yaw = yaw;
    this.pitch = pitch;
    this.applyRotation();
  }

  private applyRotation(): void {
    this.camera.setEulerAngles(this.pitch, this.yaw, 0);
    this.gizmo.updateTransform(this.yaw, this.pitch);
  }

  /** Вызывается каждый кадр (app.on('update', dt)), только когда режим
   * полёта активен — см. tourViewer.ts. */
  update(dt: number): void {
    if (this.pressedKeys.size === 0) return;
    const speed = cameraSettings.moveSpeed * dt;
    const pos = this.camera.getPosition().clone();
    if (this.pressedKeys.has('KeyW')) pos.add(this.camera.forward.clone().mulScalar(speed));
    if (this.pressedKeys.has('KeyS')) pos.add(this.camera.forward.clone().mulScalar(-speed));
    if (this.pressedKeys.has('KeyD')) pos.add(this.camera.right.clone().mulScalar(speed));
    if (this.pressedKeys.has('KeyA')) pos.add(this.camera.right.clone().mulScalar(-speed));
    if (this.pressedKeys.has('Space')) pos.add(this.camera.up.clone().mulScalar(speed));
    if (this.pressedKeys.has('ShiftLeft') || this.pressedKeys.has('ShiftRight')) pos.add(this.camera.up.clone().mulScalar(-speed));
    this.camera.setPosition(pos);
  }
}
