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

  private pc: PcModule;
  private camera: InstanceType<PcModule['Entity']>;
  private gizmo: NavCubeGizmo;
  private canvas: HTMLCanvasElement | null = null;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;

  private onPointerDown = (e: PointerEvent) => {
    if (!this.canvas) return;
    const hit = this.gizmo.handlePointerDown(e, this.canvas);
    if (hit) {
      this.yaw = hit.yaw;
      this.pitch = hit.pitch;
      this.update();
      return;
    }
    this.dragging = true;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  };

  private onPointerUp = () => {
    this.dragging = false;
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.dragging) return;
    const k = 0.3 * cameraSettings.orbitSensitivity;
    this.yaw -= (e.clientX - this.lastX) * k;
    this.pitch = Math.max(-89, Math.min(89, this.pitch - (e.clientY - this.lastY) * k));
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.update();
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.distance = Math.max(0.05, this.distance * (1 + e.deltaY * 0.001 * cameraSettings.zoomSpeed));
    this.update();
  };

  constructor(pc: PcModule, camera: InstanceType<PcModule['Entity']>, gizmo: NavCubeGizmo) {
    this.pc = pc;
    this.camera = camera;
    this.gizmo = gizmo;
    this.target = new pc.Vec3(0, 0, 0);
  }

  attach(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('wheel', this.onWheel, { passive: false });
  }

  detach(): void {
    if (!this.canvas) return;
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('wheel', this.onWheel);
    this.canvas = null;
  }

  setDistance(d: number): void {
    this.distance = d;
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
