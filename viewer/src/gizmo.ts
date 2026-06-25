import type { PcModule } from './types';

/**
 * Штурвал-кубик (аналог ViewCube) — X красный, Y зелёный, Z синий, тёмный
 * оттенок — отрицательное направление. Кубик статичен в координатах своей
 * мини-сцены (свой Layer + своя камера с маленьким rect-вьюпортом в углу
 * канваса), а "вращается" за счёт того, что его собственная камера орбитит
 * вокруг него с теми же yaw/pitch, что и основная камера сцены —
 * вызывающий код должен звать updateTransform(yaw, pitch) каждый раз, когда
 * меняется ориентация основной камеры.
 *
 * Перенесено 1:1 из map.php (PR0) — порт без изменения поведения. Разбор
 * на переиспользуемый публичный ViewCube-модуль (с подписями граней,
 * компасом N/S/E/W и т.п.) — отдельная задача, см. docs/CURRENT_STATE.md,
 * раздел 11, PR2.
 */
export interface NavCubeGizmo {
  /** Синхронизирует ориентацию кубика с текущими yaw/pitch основной камеры. */
  updateTransform(yaw: number, pitch: number): void;
  /**
   * Проверяет, попал ли клик в маленький вьюпорт штурвала, и если да — в
   * какую грань. Возвращает новые yaw/pitch для перехода к стандартному
   * виду, либо null, если клик был не по штурвалу (тогда вызывающий код
   * должен обработать его как обычное вращение камеры).
   */
  handlePointerDown(e: PointerEvent, canvas: HTMLCanvasElement): { yaw: number; pitch: number } | null;
}

type FaceDef = {
  axis: 'x' | 'y' | 'z';
  sign: 1 | -1;
  color: [number, number, number];
  pos: [number, number, number];
  rot: [number, number, number];
};

const FACE_DEFS: FaceDef[] = [
  { axis: 'x', sign: 1, color: [0.85, 0.25, 0.25], pos: [0.5, 0, 0], rot: [0, 90, 0] },
  { axis: 'x', sign: -1, color: [0.45, 0.12, 0.12], pos: [-0.5, 0, 0], rot: [0, -90, 0] },
  { axis: 'y', sign: 1, color: [0.25, 0.75, 0.25], pos: [0, 0.5, 0], rot: [-90, 0, 0] },
  { axis: 'y', sign: -1, color: [0.12, 0.4, 0.12], pos: [0, -0.5, 0], rot: [90, 0, 0] },
  { axis: 'z', sign: 1, color: [0.3, 0.45, 0.85], pos: [0, 0, 0.5], rot: [0, 0, 0] },
  { axis: 'z', sign: -1, color: [0.15, 0.22, 0.45], pos: [0, 0, -0.5], rot: [0, 180, 0] },
];

const GIZMO_PRESETS: Record<string, { yaw: number; pitch: number }> = {
  x1: { yaw: 90, pitch: 0 },
  'x-1': { yaw: -90, pitch: 0 },
  y1: { yaw: 0, pitch: -89.9 },
  'y-1': { yaw: 0, pitch: 89.9 },
  z1: { yaw: 0, pitch: 0 },
  'z-1': { yaw: 180, pitch: 0 },
};

export function createNavCubeGizmo(pc: PcModule, app: InstanceType<PcModule['Application']>): NavCubeGizmo {
  const gizmoLayer = new pc.Layer({ name: 'GizmoLayer' });
  app.scene.layers.push(gizmoLayer);

  const gizmoRoot = new pc.Entity('gizmoRoot');
  app.root.addChild(gizmoRoot);

  for (const f of FACE_DEFS) {
    const plane = new pc.Entity('gizmoFace_' + f.axis + f.sign);
    plane.addComponent('render', { type: 'plane' });
    const mat = new pc.StandardMaterial();
    const color = new pc.Color(f.color[0], f.color[1], f.color[2]);
    mat.diffuse = color;
    mat.emissive = color;
    mat.useLighting = false;
    mat.update();
    (plane as any).render.material = mat;
    (plane as any).render.layers = [gizmoLayer.id];
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

  function updateTransform(yaw: number, pitch: number): void {
    const yawQ = new pc.Quat().setFromEulerAngles(0, yaw, 0);
    const pitchQ = new pc.Quat().setFromEulerAngles(pitch, 0, 0);
    const rot = yawQ.clone().mul(pitchQ);
    const offset = rot.transformVector(new pc.Vec3(0, 0, 3));
    gizmoCamera.setPosition(offset.x, offset.y, offset.z);
    gizmoCamera.lookAt(0, 0, 0);
  }

  function handlePointerDown(e: PointerEvent, canvas: HTMLCanvasElement): { yaw: number; pitch: number } | null {
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const r = (gizmoCamera as any).camera.rect;
    const vx = r.x * cw;
    const vw = r.z * cw;
    const vyTop = (1 - r.y - r.w) * ch;
    const vh = r.w * ch;
    if (px < vx || px > vx + vw || py < vyTop || py > vyTop + vh) return null;

    const cam = (gizmoCamera as any).camera;
    const near = cam.screenToWorld(px, py, cam.nearClip, cw, ch);
    const far = cam.screenToWorld(px, py, cam.farClip, cw, ch);
    const dir = far.clone().sub(near).normalize();

    let tMin = -Infinity;
    let tMax = Infinity;
    let hitAxis: string | null = null;
    let hitSign = 0;
    for (const axis of ['x', 'y', 'z'] as const) {
      const o = (near as any)[axis];
      const d = (dir as any)[axis];
      if (Math.abs(d) < 1e-9) {
        if (o < -0.5 || o > 0.5) return null;
        continue;
      }
      let t1 = (-0.5 - o) / d;
      let t2 = (0.5 - o) / d;
      let sign = -1;
      if (t1 > t2) {
        [t1, t2] = [t2, t1];
        sign = 1;
      }
      if (t1 > tMin) {
        tMin = t1;
        hitAxis = axis;
        hitSign = sign;
      }
      tMax = Math.min(tMax, t2);
      if (tMin > tMax) return null;
    }
    if (!hitAxis) return null;
    const preset = GIZMO_PRESETS[hitAxis + hitSign];
    return preset ? { ...preset } : null;
  }

  return { updateTransform, handlePointerDown };
}
