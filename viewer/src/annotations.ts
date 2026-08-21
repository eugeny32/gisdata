import type { PcModule } from './types';
import { AXIS_FIX_ROTATION } from './constants';
import type { CopcStreamHandle } from './copcLoader';

/**
 * Рисование векторных аннотаций (точка/линия/полигон) прямо на 3D-модели
 * тура — перенос старой THREE.js+GaussianSplats3D фичи (см. map.php,
 * api/tour_annotations.php, tour_export.php — это всё уже было сделано
 * раньше и продолжает работать как было) на PlayCanvas. У PlayCanvas нет
 * публичного API пикинга по поверхности сплатов/точек, поэтому picking —
 * через пересечение луча с ОДНОЙ сферой, охватывающей всю загруженную
 * модель (тот же центр/радиус, что и у орбиты камеры после центрирования,
 * см. OrbitController.getHomeSphere) — это сознательное упрощение,
 * одинаковое для облака точек и сплатов (см. memory unify-viewer-ux).
 *
 * Рендер аннотаций — без персистентных pc.Entity/материалов: каждый кадр
 * перерисовываем линии через app.drawLine (immediate-mode, есть из коробки
 * у Application) — для точки рисуем маленький крестик, для линии/полигона
 * — отрезки по вершинам. Это нагляднее персистентных мешей и не требует
 * своего пула материалов на каждый цвет слоя.
 */

export type GeomType = 'point' | 'polyline' | 'polygon';

export interface AnnotationData {
  id: number;
  geomType: GeomType;
  /** Координаты в ЛОКАЛЬНОМ пространстве модели (до AXIS_FIX_ROTATION) —
   * тот же формат, что отдаёт/принимает api/tour_annotations.php. */
  coordinates: [number, number, number][];
}

export interface AnnotationLayerData {
  id: number;
  color: string;
  visible: boolean;
  annotations: AnnotationData[];
}

export interface VertexHit {
  layerId: number;
  annotationId: number;
  pointIndex: number;
}

/** Создаёт менеджер аннотаций для одного открытого тура — новый экземпляр
 * на каждый loadTourScene (см. tourViewer.ts), без побочного состояния
 * между турами. */
export function createAnnotationManager(pc: PcModule, app: InstanceType<PcModule['Application']>) {
  const axisFix = new pc.Quat(...(AXIS_FIX_ROTATION as [number, number, number, number]));
  const axisFixInv = axisFix.clone().invert();

  // Корни всех загрузчиков (copcLoader/lasLoader/splatLoader) сидят в
  // мировых координатах БЕЗ смещения, только с этим поворотом — поэтому
  // конвертация локальных координат модели в мировые (и обратно) для ЛЮБОГО
  // загруженного файла — это просто поворот на тот же кватернион, без
  // привязки к конкретной Entity.
  function localToWorld(p: [number, number, number]): InstanceType<PcModule['Vec3']> {
    return axisFix.transformVector(new pc.Vec3(p[0], p[1], p[2]));
  }
  function worldToLocal(v: InstanceType<PcModule['Vec3']>): [number, number, number] {
    const r = axisFixInv.transformVector(v.clone());
    return [r.x, r.y, r.z];
  }

  let layers: AnnotationLayerData[] = [];
  let drawingPreview: { points: [number, number, number][]; color: string } | null = null;
  // "Сфера модели" для пикинга — выставляется снаружи (tourViewer.ts) сразу
  // после того, как загрузчик закончил центрирование (тот же момент, что и
  // orbit.captureHome()). Без неё (модель ещё грузится) picking просто
  // возвращает null.
  let pickSphere: { center: InstanceType<PcModule['Vec3']>; radius: number } | null = null;

  function setPickSphere(center: InstanceType<PcModule['Vec3']>, radius: number): void {
    pickSphere = { center: center.clone(), radius: Math.max(radius, 1e-3) };
  }

  // COPC-облака (точки, не сплаты) — реальный пикинг по загруженным точкам
  // (см. copcLoader.ts/pickNearestPoint), точнее приближающей сферы ниже.
  // Пусто для сплат-туров и для LAS-туров без готового COPC (там остаётся
  // только сфера — см. pickPoint).
  let copcHandles: CopcStreamHandle[] = [];

  function setCopcHandles(handles: CopcStreamHandle[]): void {
    copcHandles = handles;
  }

  function setLayers(next: AnnotationLayerData[]): void {
    layers = next;
  }

  function setDrawingPreview(points: [number, number, number][] | null, color: string): void {
    drawingPreview = points && points.length ? { points, color } : null;
  }

  function colorOf(hex: string): InstanceType<PcModule['Color']> {
    const c = new pc.Color();
    c.fromString(hex);
    return c;
  }

  function drawCross(center: InstanceType<PcModule['Vec3']>, color: InstanceType<PcModule['Color']>, size: number): void {
    const { x, y, z } = center;
    app.drawLine(new pc.Vec3(x - size, y, z), new pc.Vec3(x + size, y, z), color, true);
    app.drawLine(new pc.Vec3(x, y - size, z), new pc.Vec3(x, y + size, z), color, true);
    app.drawLine(new pc.Vec3(x, y, z - size), new pc.Vec3(x, y, z + size), color, true);
  }

  function drawPolyline(points: [number, number, number][], color: InstanceType<PcModule['Color']>, closed: boolean): void {
    if (points.length < 2) return;
    const worldPts = points.map(localToWorld);
    for (let i = 0; i + 1 < worldPts.length; i++) {
      app.drawLine(worldPts[i], worldPts[i + 1], color, true);
    }
    if (closed && worldPts.length > 2) {
      app.drawLine(worldPts[worldPts.length - 1], worldPts[0], color, true);
    }
  }

  function markerSize(): number {
    // Крестик точки — доля радиуса модели, чтобы оставаться заметным на
    // моделях любого масштаба (метры/десятки метров), а не фиксированный
    // размер в мировых единицах.
    return pickSphere ? Math.max(pickSphere.radius * 0.015, 0.01) : 0.05;
  }

  function renderFrame(): void {
    const size = markerSize();
    for (const layer of layers) {
      if (!layer.visible) continue;
      const color = colorOf(layer.color);
      for (const anno of layer.annotations) {
        if (!anno.coordinates.length) continue;
        if (anno.geomType === 'point') {
          drawCross(localToWorld(anno.coordinates[0]), color, size);
        } else {
          drawPolyline(anno.coordinates, color, anno.geomType === 'polygon');
        }
      }
    }
    if (drawingPreview) {
      drawPolyline(drawingPreview.points, colorOf(drawingPreview.color), false);
      for (const p of drawingPreview.points) drawCross(localToWorld(p), colorOf(drawingPreview.color), size * 0.6);
    }
  }
  app.on('update', renderFrame);

  /** Луч из камеры через экранную точку (clientX/clientY canvas-страницы).
   * Для COPC-облаков (copcHandles непусто) — точный пикинг по реально
   * загруженным точкам (см. copcLoader.ts/pickNearestPoint); при нескольких
   * файлах в туре берётся хит, ближайший к камере. Иначе (сплаты, LAS без
   * готового COPC) — приближение через pickSphere, см. комментарий ниже.
   * Возвращает координаты в ЛОКАЛЬНОМ пространстве модели (готовые для
   * сохранения через API), либо null, если ни один способ не дал хита. */
  function pickPoint(
    camera: InstanceType<PcModule['Entity']>,
    canvas: HTMLCanvasElement,
    clientX: number,
    clientY: number
  ): [number, number, number] | null {
    if (copcHandles.length) {
      let best: InstanceType<PcModule['Vec3']> | null = null;
      let bestDistSq = Infinity;
      for (const handle of copcHandles) {
        const hit = handle.pickNearestPoint(camera, canvas, clientX, clientY);
        if (!hit) continue;
        const distSq = hit.clone().sub(camera.getPosition()).lengthSq();
        if (distSq < bestDistSq) {
          bestDistSq = distSq;
          best = hit;
        }
      }
      if (best) return worldToLocal(best);
      // Ни одна загруженная точка не попала под курсор (мимо модели, или в
      // этом месте ещё ничего не подгружено) -- сфера ниже как минимум
      // вернёт null тоже в большинстве таких случаев, но пусть отработает
      // как обычно, а не молча даёт неверный хит.
    }
    if (!pickSphere) return null;
    const rect = canvas.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * canvas.clientWidth;
    const py = ((clientY - rect.top) / rect.height) * canvas.clientHeight;
    const camComp: any = (camera as any).camera;
    const near = camComp.screenToWorld(px, py, camComp.nearClip);
    const far = camComp.screenToWorld(px, py, camComp.farClip);
    const dir = far.clone().sub(near).normalize();

    // Стандартное пересечение луча со сферой (см. любой учебник по
    // компьютерной графике/raytracing) — берём БЛИЖНЮЮ положительную t.
    // ПРИМЕЧАНИЕ: pickSphere.radius — это радиус КАДРИРОВАНИЯ камеры
    // (halfExtent*1.8 у COPC, *1.3 у сплатов, см. getHomeSphere()) — С
    // ЗАПАСОМ, чтобы камера могла орбитить без захода внутрь модели, так
    // что попадание на саму сферу лежит ЗАМЕТНО дальше от реальной
    // поверхности скана (живым тестом подтверждено: разные клики по
    // видимо разным частям дома стабильно ложились на одну и ту же
    // окружность радиуса ~160 = pickSphere.radius). Для грубых маркеров
    // (точки/линии аннотаций) это приемлемо — там просили "сфера, и
    // ладно" (см. memory/историю чата); для точной плоскости сечения
    // нужна не эта функция, а pickGroundPoint ниже.
    const oc = near.clone().sub(pickSphere.center);
    const b = oc.dot(dir);
    const c = oc.dot(oc) - pickSphere.radius * pickSphere.radius;
    const disc = b * b - c;
    if (disc < 0) return null;
    const sqrtDisc = Math.sqrt(disc);
    let t = -b - sqrtDisc;
    if (t < 0) t = -b + sqrtDisc;
    if (t < 0) return null;
    const hit = near.clone().add(dir.clone().mulScalar(t));
    return worldToLocal(hit);
  }

  /** Точное (без угадывания радиуса) пересечение луча с ГОРИЗОНТАЛЬНОЙ
   * плоскостью на высоте центра модели (мировой Y = pickSphere.center.y —
   * AXIS_FIX_ROTATION переводит исходный LAS Z-up в мировой Y-up, см.
   * constants.ts) — для сечения по линии достаточно знать ГОРИЗОНТАЛЬНОЕ
   * положение клика, а не точную глубину поверхности под курсором, и эту
   * плоскость, в отличие от pickSphere, не нужно подгонять эмпирическим
   * коэффициентом — она математически точна для любой геометрии. */
  function pickGroundPoint(
    camera: InstanceType<PcModule['Entity']>,
    canvas: HTMLCanvasElement,
    clientX: number,
    clientY: number
  ): [number, number, number] | null {
    if (!pickSphere) return null;
    const rect = canvas.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * canvas.clientWidth;
    const py = ((clientY - rect.top) / rect.height) * canvas.clientHeight;
    const camComp: any = (camera as any).camera;
    const near = camComp.screenToWorld(px, py, camComp.nearClip);
    const far = camComp.screenToWorld(px, py, camComp.farClip);
    const dir = far.clone().sub(near);
    if (Math.abs(dir.y) < 1e-6) return null; // луч практически горизонтален — пересечения нет/неустойчиво
    const t = (pickSphere.center.y - near.y) / dir.y;
    if (t < 0) return null;
    const hit = near.clone().add(dir.mulScalar(t));
    return worldToLocal(hit);
  }

  /** Подбор существующей вершины аннотации под курсором — по экранному
   * расстоянию (проекция мировой точки на экран), не по 3D-пересечению:
   * надёжнее для тонких объектов (точка/линия), чем пересечение с
   * невидимой геометрией. */
  function pickVertex(camera: InstanceType<PcModule['Entity']>, canvas: HTMLCanvasElement, clientX: number, clientY: number, thresholdPx = 14): VertexHit | null {
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const camComp: any = (camera as any).camera;
    let best: VertexHit | null = null;
    let bestDist = thresholdPx;
    for (const layer of layers) {
      if (!layer.visible) continue;
      for (const anno of layer.annotations) {
        for (let i = 0; i < anno.coordinates.length; i++) {
          const world = localToWorld(anno.coordinates[i]);
          const screen = camComp.worldToScreen(world, new pc.Vec3());
          if (!screen) continue;
          const sx = (screen.x / canvas.clientWidth) * rect.width;
          const sy = (screen.y / canvas.clientHeight) * rect.height;
          const dist = Math.hypot(sx - px, sy - py);
          if (dist < bestDist) {
            bestDist = dist;
            best = { layerId: layer.id, annotationId: anno.id, pointIndex: i };
          }
        }
      }
    }
    return best;
  }

  function dispose(): void {
    app.off('update', renderFrame);
  }

  return { setPickSphere, setCopcHandles, setLayers, setDrawingPreview, pickPoint, pickGroundPoint, pickVertex, dispose };
}

export type AnnotationManager = ReturnType<typeof createAnnotationManager>;
