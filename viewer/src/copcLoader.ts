import { Copc, Hierarchy, Key, Step } from 'copc';
import type { PcModule } from './types';
import { AXIS_FIX_ROTATION } from './constants';
import { createPointCloudMaterial } from './pointCloudMaterial';
import type { CopcWorkerRequest, CopcWorkerResponse } from './copcWorker';

/**
 * Потоковая загрузка LAS, заранее сконвертированного в COPC (PR3/PR4) —
 * octree-индекс внутри одного .laz, подгружаем только узлы, видимые в
 * текущем фрустуме камеры, с бюджетом точек. Если для файла нет готового
 * .copc.laz (конвертация ещё не завершилась/не запускалась), вызывающий
 * код (tourViewer.ts) должен использовать старый полный загрузчик
 * lasLoader.ts — это НЕ делает выбор сам, просто другая функция.
 *
 * Картография по которой считаются границы узла, доказана через реальный
 * исходник copc.js (connormanning/copc.js, src/copc/hierarchy.ts): ключ
 * "d-x-y-z" — глубина и координаты вокселя в этой глубине; куб делится
 * на 2^d частей по каждой оси от copc.info.cube.
 */

const POINT_BUDGET = 4_000_000;
const WORKER_POOL_SIZE = 3;
const REFRESH_INTERVAL_MS = 300;
// Доля высоты экрана, ниже которой узел считается "достаточно мелким" и
// дальше не разбивается на детей — чем больше, тем грубее (меньше точек,
// быстрее), чем меньше — тем подробнее (больше точек, медленнее). Подобрано
// эмпирически, не из формального стандарта SSE (упрощённая метрика).
const SCREEN_SIZE_THRESHOLD = 0.2;

type Cube = [number, number, number, number, number, number];

function nodeBounds(key: Key, cube: Cube): Cube {
  const [d, x, y, z] = key;
  const cells = 2 ** d;
  const sx = (cube[3] - cube[0]) / cells;
  const sy = (cube[4] - cube[1]) / cells;
  const sz = (cube[5] - cube[2]) / cells;
  return [
    cube[0] + x * sx,
    cube[1] + y * sy,
    cube[2] + z * sz,
    cube[0] + (x + 1) * sx,
    cube[1] + (y + 1) * sy,
    cube[2] + (z + 1) * sz,
  ];
}

function boundsSphere(b: Cube): { center: [number, number, number]; radius: number } {
  const cx = (b[0] + b[3]) / 2;
  const cy = (b[1] + b[4]) / 2;
  const cz = (b[2] + b[5]) / 2;
  const dx = b[3] - b[0];
  const dy = b[4] - b[1];
  const dz = b[5] - b[2];
  return { center: [cx, cy, cz], radius: Math.sqrt(dx * dx + dy * dy + dz * dz) / 2 };
}

interface LoadedNode {
  entity: InstanceType<PcModule['Entity']>;
  pointCount: number;
}

export interface CopcStreamHandle {
  /** Пересчитать видимые узлы под текущую камеру — звать из app.on('update'),
   * сам бросает лишние вызовы внутри (не чаще REFRESH_INTERVAL_MS). */
  refresh(camera: InstanceType<PcModule['Entity']>): void;
  dispose(): void;
}

export async function loadCopcPointCloud(
  pc: PcModule,
  app: InstanceType<PcModule['Application']>,
  url: string,
  // Не используется — см. комментарий у centeredCube ниже (камера всегда
  // смотрит на мировой (0,0,0), центрируется геометрия, а не target).
  // Параметр оставлен ради одинаковой подписи с loadLasFiles/loadSplatFiles.
  _target: InstanceType<PcModule['Vec3']>,
  setDistance: (d: number) => void,
  updateCameraTransform: () => void,
  isCurrent: () => boolean,
  showProgress: (text: string, pct: number) => void,
  pointSizePx: number,
  outMaterials: InstanceType<PcModule['ShaderMaterial']>[]
): Promise<CopcStreamHandle> {
  // copc.js определяет HTTP- от файлового-Getter по строке "http(s)://" в
  // начале пути (см. src/utils/getter.ts) — относительный URL (как у нас,
  // "/uploads/...") иначе уходит в файловую ветку (fs.promises.access),
  // которой в браузере просто нет.
  const absoluteUrl = new URL(url, window.location.origin).toString();
  showProgress('Загрузка заголовка COPC...', 0);
  const copc = await Copc.create(absoluteUrl);
  if (!isCurrent()) return { refresh: () => {}, dispose: () => {} };

  const cube = copc.info.cube as Cube;
  // ВАЖНО: copc.info.cube — это корень octree, ДОПОЛНЕННЫЙ до правильного
  // куба (иначе нельзя честно делить на 8 одинаковых детей) — на плоских
  // объектах (здание шире, чем выше) одна из осей куба может быть растянута
  // в разы относительно реальных данных (на живом тесте: реальные точки —
  // Z от 135 до 187 (~52м), а куб растянут от 135 до 570 (~434м), чтобы
  // сравняться с шириной по X/Y). Если центрировать по центру ЭТОГО куба,
  // геометрия оказывается далеко от центра, куда направлена камера —
  // именно так проявился "пустой экран при реальных Range-запросах" на
  // большом файле в живом тесте. Центрируем по РЕАЛЬНЫМ данным
  // (copc.header.min/max), куб используется только для математики
  // октодерева (nodeBounds ниже), не для камеры.
  const dataMin = copc.header.min as [number, number, number];
  const dataMax = copc.header.max as [number, number, number];
  const centerOffset: [number, number, number] = [
    (dataMin[0] + dataMax[0]) / 2,
    (dataMin[1] + dataMax[1]) / 2,
    (dataMin[2] + dataMax[2]) / 2,
  ];
  const centeredCube: Cube = [
    cube[0] - centerOffset[0], cube[1] - centerOffset[1], cube[2] - centerOffset[2],
    cube[3] - centerOffset[0], cube[4] - centerOffset[1], cube[5] - centerOffset[2],
  ];
  const halfExtent = Math.max(dataMax[0] - dataMin[0], dataMax[1] - dataMin[1], dataMax[2] - dataMin[2]) / 2;
  // target НЕ переносим в centerOffset (в отличие от loadSplatFiles) — как
  // и в lasLoader.ts, камера ориентируется на мировой (0,0,0), а центрируем
  // саму геометрию (см. centeredCube выше и centerOffset в воркере).
  setDistance(Math.max(halfExtent * 1.8, 0.5));
  updateCameraTransform();

  const root = new pc.Entity('copc-root');
  root.setLocalRotation(...(AXIS_FIX_ROTATION as [number, number, number, number]));
  app.root.addChild(root);

  const material = createPointCloudMaterial(pc, pointSizePx);
  outMaterials.push(material);

  // nodes/pages накапливаются по мере того, как мы спускаемся глубже —
  // изначально только корневая страница (см. README copc.js: rootHierarchyPage).
  let nodes: Hierarchy.Node.Map = {};
  let pages: Hierarchy.Page.Map = {};
  const rootPage = await Copc.loadHierarchyPage(absoluteUrl, copc.info.rootHierarchyPage);
  nodes = { ...nodes, ...rootPage.nodes };
  pages = { ...pages, ...rootPage.pages };
  if (!isCurrent()) return { refresh: () => {}, dispose: () => {} };

  const loaded = new Map<string, LoadedNode>();
  const pendingKeys = new Set<string>();
  let hasColorDecided: boolean | null = null;
  // Реальный диапазон Z данных (не растянутого куба) — иначе HSL-заливка
  // по высоте сжалась бы в узкую полоску одного цвета на тонких объектах.
  const zRange: [number, number] = [dataMin[2] - centerOffset[2], dataMax[2] - centerOffset[2]];

  const workers: Worker[] = [];
  for (let i = 0; i < WORKER_POOL_SIZE; i++) {
    const worker = new Worker(new URL('./copcWorker.ts', import.meta.url), { type: 'module' });
    worker.onerror = (e) => console.error('COPC: ошибка воркера:', e.message || e);
    workers.push(worker);
  }
  let nextWorker = 0;
  let nextRequestId = 1;
  const pendingRequests = new Map<number, { key: string; node: Hierarchy.Node }>();

  function disposeNode(key: string): void {
    const entry = loaded.get(key);
    if (!entry) return;
    entry.entity.destroy();
    loaded.delete(key);
  }

  function buildEntity(key: string, node: Hierarchy.Node, positions: Float32Array, colors: Uint8Array): void {
    if (!isCurrent()) return;
    const mesh = new pc.Mesh(app.graphicsDevice);
    mesh.setPositions(positions);
    mesh.setColors32(colors);
    mesh.update(pc.PRIMITIVE_POINTS, true);
    const meshInstance = new pc.MeshInstance(mesh, material);
    const entity = new pc.Entity('copc-node-' + key);
    entity.addComponent('render', { meshInstances: [meshInstance] });
    root.addChild(entity);
    loaded.set(key, { entity, pointCount: node.pointCount });
  }

  function requestNode(key: string, node: Hierarchy.Node): void {
    if (loaded.has(key) || pendingKeys.has(key)) return;
    pendingKeys.add(key);
    const id = nextRequestId++;
    pendingRequests.set(id, { key, node });
    const request: CopcWorkerRequest = { id, url: absoluteUrl, copc, node, hasColor: hasColorDecided, zRange, centerOffset };
    workers[nextWorker].postMessage(request);
    nextWorker = (nextWorker + 1) % workers.length;
  }

  for (const worker of workers) {
    worker.onmessage = (e: MessageEvent<CopcWorkerResponse>) => {
      const { id, positions, colors, pointCount, hasColor, error } = e.data;
      const pending = pendingRequests.get(id);
      pendingRequests.delete(id);
      if (!pending) return;
      pendingKeys.delete(pending.key);
      if (error || !positions || !colors || pointCount === undefined) {
        console.error('COPC: не удалось загрузить узел', pending.key, error);
        return;
      }
      if (hasColorDecided === null && hasColor !== undefined) hasColorDecided = hasColor;
      buildEntity(pending.key, pending.node, positions, colors);
    };
  }

  let lastRefreshAt = 0;
  let refreshInFlight = false;

  async function doRefresh(camera: InstanceType<PcModule['Entity']>): Promise<void> {
    if (!isCurrent()) return;
    const camComp: any = (camera as any).camera;
    const vp = new pc.Mat4().mul2(camComp.projectionMatrix, camComp.viewMatrix);
    const frustum = new pc.Frustum();
    frustum.setFromMat4(vp);
    const camPos = camera.getPosition();
    const screenHeight = app.graphicsDevice.height || 1;
    const fovRad = (camComp.fov * Math.PI) / 180;

    const selected = new Set<string>();
    let budgetUsed = 0;
    const stack: string[] = ['0-0-0-0'];

    while (stack.length) {
      const keyStr = stack.pop()!;
      const node = nodes[keyStr];
      const page = pages[keyStr];
      if (!node && !page) continue;

      const key = Key.create(keyStr);
      const bounds = nodeBounds(key, centeredCube);
      const sphere = boundsSphere(bounds);
      // Сфера в локальных координатах модели — переводим в мировые так же,
      // как AXIS_FIX_ROTATION разворачивает саму модель.
      const localCenter = new pc.Vec3(...sphere.center);
      const worldCenter = root.getWorldTransform().transformPoint(localCenter);
      const containment = frustum.containsSphere(new pc.BoundingSphere(worldCenter, sphere.radius));
      if (containment === 0) continue;

      const distance = worldCenter.distance(camPos);
      // Доля половины высоты экрана, которую занимает узел — чем
      // дальше/мельче узел, тем меньше смысла спускаться к его детям.
      // screenHeight не входит в формулу напрямую (соотношение угловое),
      // используется отдельно только как защита от деления на 0 в fov=0.
      const angularSize = distance > 1e-6 ? sphere.radius / distance : Infinity;
      const screenSize = screenHeight > 0 ? angularSize / Math.tan(fovRad / 2) : 0;

      if (node) {
        selected.add(keyStr);
        budgetUsed += node.pointCount;
      }

      const wantsDescend = screenSize > SCREEN_SIZE_THRESHOLD && budgetUsed < POINT_BUDGET;
      if (!wantsDescend) continue;

      if (page && !node) {
        // Сюда мы спускаемся первый раз — нужно подгрузить под-страницу,
        // прежде чем у детей этого ключа появятся записи в nodes/pages.
        const subtree = await Copc.loadHierarchyPage(absoluteUrl, page);
        if (!isCurrent()) return;
        nodes = { ...nodes, ...subtree.nodes };
        pages = { ...pages, ...subtree.pages };
        stack.push(keyStr);
        continue;
      }

      for (const step of Step.list()) {
        const childKey = Key.toString(Key.step(key, step));
        if (nodes[childKey] || pages[childKey]) stack.push(childKey);
      }
    }

    // budgetUsed выше — это СУММА по всем найденным во время обхода узлам,
    // не штука для решения "грузить ли вот этот конкретный узел": при
    // богатой сцене общая сумма почти всегда больше POINT_BUDGET, и старая
    // проверка budgetUsed<=POINT_BUDGET на каждой итерации диспетчеризации
    // была одним и тем же числом — либо пропускала ВСЕ узлы, либо все
    // подряд без реального лимита. Считаем отдельно, по факту реальной
    // отправки (уже загруженные узлы продолжают визуально жить, не считая
    // против бюджета новых запросов).
    let dispatchBudget = Array.from(loaded.values()).reduce((sum, n) => sum + n.pointCount, 0);
    for (const key of selected) {
      const node = nodes[key];
      if (!node || loaded.has(key)) continue;
      if (dispatchBudget + node.pointCount > POINT_BUDGET) continue;
      dispatchBudget += node.pointCount;
      requestNode(key, node);
    }
    for (const key of Array.from(loaded.keys())) {
      if (!selected.has(key)) disposeNode(key);
    }
  }

  function refresh(camera: InstanceType<PcModule['Entity']>): void {
    const now = performance.now();
    if (refreshInFlight || now - lastRefreshAt < REFRESH_INTERVAL_MS) return;
    lastRefreshAt = now;
    refreshInFlight = true;
    doRefresh(camera).finally(() => {
      refreshInFlight = false;
    });
  }

  function dispose(): void {
    for (const worker of workers) worker.terminate();
    for (const key of Array.from(loaded.keys())) disposeNode(key);
    root.destroy();
  }

  showProgress('COPC: подгрузка по области видимости...', 100);
  return { refresh, dispose };
}
