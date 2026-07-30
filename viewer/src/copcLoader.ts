import { Copc, Hierarchy, Key, Step } from 'copc';
import type { PcModule } from './types';
import { AXIS_FIX_ROTATION } from './constants';
import { createPointCloudMaterial } from './pointCloudMaterial';
import type { CopcWorkerRequest, CopcWorkerResponse } from './copcWorker';
import { getCachedNode, putCachedNode, type CachedNodeData } from './copcCache';
import { cameraSettings } from './cameraSettings';

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

// Бюджет точек теперь живая настройка (cameraSettings.pointBudget,
// регулировка в духе Potree "Point Budget" — см. map.php), а не константа.
// По умолчанию 10М (см. DEFAULT_CAMERA_SETTINGS) — поднято с 4М по итогам
// живого теста (оборудование держало 19-107 FPS даже на ~4М точках).
// Поднято с 3 — мельче нарезка (см. SCREEN_SIZE_THRESHOLD ниже) даёт
// заметно больше узлов-кандидатов на тик, прежний пул из 3 воркеров не
// успевал их декодировать (см. историю ниже). Раньше это вызывало
// мерцание; теперь, после добавления снижения детализации НА ВРЕМЯ
// движения камеры (effectiveThreshold/effectiveBudget, см. doRefresh) и
// гистерезиса выгрузки, тот же риск заметно ниже — но больше воркеров всё
// равно безопаснее при более мелкой нарезке.
const WORKER_POOL_SIZE = 6;
const REFRESH_INTERVAL_MS = 300;
// Доля высоты экрана, ниже которой узел считается "достаточно мелким" и
// дальше не разбивается на детей — чем больше, тем грубее (меньше точек,
// быстрее), чем меньше — тем подробнее (больше точек, медленнее, но мельче
// "кубы" загрузки). Было понижено до 0.08 — вызвало регрессию (мерцание
// при панорамировании), возвращено на 0.2. Сейчас понижаем до 0.12 (по
// запросу пользователя — мельче кластеры загрузки, то есть больше их
// количество) ВМЕСТЕ с MOVING_THRESHOLD_MULTIPLIER ниже (грубее именно во
// время движения, когда раньше и проявлялось мерцание) и увеличенным
// WORKER_POOL_SIZE — та же причина регрессии теперь устранена с другой
// стороны, а не просто возвращением старого грубого порога.
const SCREEN_SIZE_THRESHOLD = 0.12;
// Узлы такой глубины и младше — "скелет" всего облака: грузятся ОДИН раз
// сразу после открытия файла, ВСЕГДА (независимо от фрустума камеры), и
// никогда не выгружаются. COPC/EPT-октодерево по своей природе уже хранит
// прогрессивный LOD (каждая глубина — статистически равномерная выборка по
// всему экстенту, глубже — гуще) — это и есть "resample", о котором просил
// пользователь, не нужно реализовывать своё прореживание. По запросу
// пользователя: бюджет точек должен ограничивать только детализацию В
// КАДРЕ, а не общую видимость модели — без этого слоя при облёте большого
// файла за пределами фрустума не было вообще ничего.
const COARSE_ALWAYS_DEPTH = 2;
// Во время активного вращения/панорамирования/зума снижаем требования к
// детализации (грубее порог, меньше бюджет) — то же, что в Potree/играх:
// дешевле/быстрее кадр пока камера в движении, подробная картинка
// возвращается, как только пользователь отпустил мышь.
const MOVING_THRESHOLD_MULTIPLIER = 2.5;
const MOVING_BUDGET_DIVISOR = 4;
// Сколько держать "пониженный" режим ПОСЛЕ того, как движение реально
// прекратилось — без этой задержки каждый момент между двумя короткими
// движениями кадра дёргал бы полную детализацию и тут же снова её снижал.
const MOVING_RESTORE_DELAY_MS = 400;
// Простой такой длительности — повод начать фоновую докачку узлов ВНЕ
// фрустума прямо в кэш (см. prefetchNode) — по запросу пользователя:
// "облака полностью прогружаются в кэш при простое камеры".
const IDLE_PREFETCH_DELAY_MS = 600;
// Сколько узлов-кандидатов вне фрустума реально отправляем на
// декодирование за один тик простоя — фоновая докачка не должна забивать
// те же 3 воркера, которые в любой момент могут понадобиться для реальной
// детализации в кадре (если пользователь вдруг снова задвигает камеру).
const IDLE_PREFETCH_BATCH = 2;

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
   * сам бросает лишние вызовы внутри (не чаще REFRESH_INTERVAL_MS).
   * isMoving — активно ли сейчас взаимодействие с камерой (драг/пинч/
   * колесо/анимация перехода) — см. OrbitController.isInteracting()/
   * FlyController.isInteracting() — на время движения и чуть после
   * (MOVING_RESTORE_DELAY_MS) снижается требуемая детализация в кадре. */
  refresh(camera: InstanceType<PcModule['Entity']>, isMoving: boolean): void;
  /** Для индикатора стриминга (PR8) — текущее число загруженных узлов/точек,
   * без дополнительных вычислений (просто читает уже посчитанные суммы). */
  getStats(): { loadedNodes: number; loadedPoints: number };
  /** Точный пикинг по РЕАЛЬНО загруженным точкам (не по грубой сфере
   * кадрирования, см. annotations.ts) — для привязки рисуемой геометрии к
   * поверхности облака. null, если луч не прошёл рядом ни с одной точкой
   * (мимо модели, или в этом месте ничего ещё не подгружено). Возвращает
   * МИРОВУЮ точку — как и остальной picking в annotations.ts. */
  pickNearestPoint(
    camera: InstanceType<PcModule['Entity']>,
    canvas: HTMLCanvasElement,
    clientX: number,
    clientY: number
  ): InstanceType<PcModule['Vec3']> | null;
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
  if (!isCurrent()) {
    return {
      refresh: () => {},
      dispose: () => {},
      getStats: () => ({ loadedNodes: 0, loadedPoints: 0 }),
      pickNearestPoint: () => null,
    };
  }

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

  // Реальный AABB данных (центрированный) — для height-режима (PR6) и
  // box-crop сечений (PR7); та же пара min/max, что и для HSL-заливки без
  // реального RGB в воркере (zRange ниже — только её Z-компонента).
  const bounds = {
    min: [dataMin[0] - centerOffset[0], dataMin[1] - centerOffset[1], dataMin[2] - centerOffset[2]] as [number, number, number],
    max: [dataMax[0] - centerOffset[0], dataMax[1] - centerOffset[1], dataMax[2] - centerOffset[2]] as [number, number, number],
  };
  const heightRange: [number, number] = [bounds.min[2], bounds.max[2]];
  const material = createPointCloudMaterial(pc, pointSizePx, bounds);
  outMaterials.push(material);

  // nodes/pages накапливаются по мере того, как мы спускаемся глубже —
  // изначально только корневая страница (см. README copc.js: rootHierarchyPage).
  let nodes: Hierarchy.Node.Map = {};
  let pages: Hierarchy.Page.Map = {};
  const rootPage = await Copc.loadHierarchyPage(absoluteUrl, copc.info.rootHierarchyPage);
  nodes = { ...nodes, ...rootPage.nodes };
  pages = { ...pages, ...rootPage.pages };
  if (!isCurrent()) {
    return {
      refresh: () => {},
      dispose: () => {},
      getStats: () => ({ loadedNodes: 0, loadedPoints: 0 }),
      pickNearestPoint: () => null,
    };
  }

  const loaded = new Map<string, LoadedNode>();
  const pendingKeys = new Set<string>();
  let hasColorDecided: boolean | null = null;
  // Гистерезис против мерцания (узлы на границе бюджета/фрустума то
  // проходят отбор, то нет на соседних тиках) — выгружаем уже загруженный
  // узел только после нескольких подряд "промахов", не сразу при первом
  // выпадении из выборки. Обнаружено живым тестом: при бюджете, забитом
  // до предела, часть узлов мерцала каждые ~300-600мс.
  const missCounts = new Map<string, number>();
  const MISS_THRESHOLD = 4;
  // Кэш расшифрованных узлов — по запросу пользователя: "не выгружать их
  // из плеера, а кэшировать". disposeNode ниже выгружает только СУЩНОСТЬ
  // (освобождает GPU-память), а не запись здесь — данные узла остаются
  // доступными на весь сеанс, повторное появление в кадре не требует ни
  // сети, ни повторной распаковки LAZ. copcCache.ts — тот же набор данных,
  // но в IndexedDB, переживает закрытие браузера (между открытиями тура).
  const dataCache = new Map<string, CachedNodeData>();
  // Ключи "скелета" (depth <= COARSE_ALWAYS_DEPTH) — заполняется один раз
  // ниже (loadAlwaysCoarseLayer) и больше не меняется; doRefresh читает его,
  // чтобы не подвергать эти узлы ни бюджету, ни гистерезису выгрузки.
  const alwaysKeys = new Set<string>();

  const workers: Worker[] = [];
  for (let i = 0; i < WORKER_POOL_SIZE; i++) {
    const worker = new Worker(new URL('./copcWorker.ts', import.meta.url), { type: 'module' });
    worker.onerror = (e) => console.error('COPC: ошибка воркера:', e.message || e);
    workers.push(worker);
  }
  let nextWorker = 0;
  let nextRequestId = 1;
  // render: false — фоновая докачка (IDLE_PREFETCH_*, см. doRefresh) узла
  // ВНЕ фрустума камеры, нужна только чтобы заполнить кэш (dataCache/
  // IndexedDB) на будущее — без отрисовки (без buildEntity), иначе сцена
  // и GPU-память росли бы неограниченно при облёте огромного файла, что
  // противоречит "бюджет — только на детализацию в кадре": вне кадра у нас
  // уже есть видимый разреженный COARSE_ALWAYS_DEPTH-слой, второй копии
  // того же участка рендерить не нужно.
  const pendingRequests = new Map<number, { key: string; node: Hierarchy.Node; render: boolean }>();

  function disposeNode(key: string): void {
    const entry = loaded.get(key);
    if (!entry) return;
    entry.entity.destroy();
    loaded.delete(key);
  }

  function buildEntity(
    key: string,
    node: Hierarchy.Node,
    positions: Float32Array,
    colors: Uint8Array,
    intensityClass: Float32Array
  ): void {
    if (!isCurrent()) return;
    const mesh = new pc.Mesh(app.graphicsDevice);
    mesh.setPositions(positions);
    mesh.setColors32(colors);
    mesh.setVertexStream(pc.SEMANTIC_TEXCOORD0, intensityClass, 2, node.pointCount);
    mesh.update(pc.PRIMITIVE_POINTS, true);
    const meshInstance = new pc.MeshInstance(mesh, material);
    const entity = new pc.Entity('copc-node-' + key);
    entity.addComponent('render', { meshInstances: [meshInstance] });
    root.addChild(entity);
    loaded.set(key, { entity, pointCount: node.pointCount });
  }

  function dispatchToWorker(key: string, node: Hierarchy.Node, render: boolean): void {
    const id = nextRequestId++;
    pendingRequests.set(id, { key, node, render });
    const request: CopcWorkerRequest = { id, url: absoluteUrl, copc, node, hasColor: hasColorDecided, zRange: heightRange, centerOffset };
    workers[nextWorker].postMessage(request);
    nextWorker = (nextWorker + 1) % workers.length;
  }

  function requestNode(key: string, node: Hierarchy.Node): void {
    if (loaded.has(key) || pendingKeys.has(key)) return;
    pendingKeys.add(key);

    // 1) уже расшифровывали в этом сеансе — мгновенно, без сети/воркера.
    const cachedInMemory = dataCache.get(key);
    if (cachedInMemory) {
      pendingKeys.delete(key);
      if (hasColorDecided === null) hasColorDecided = cachedInMemory.hasColor;
      buildEntity(key, node, cachedInMemory.positions, cachedInMemory.colors, cachedInMemory.intensityClass);
      return;
    }

    // 2) не в памяти — пробуем IndexedDB (мог остаться с прошлого открытия
    // этого же тура). Если и там нет — обычная загрузка через воркер.
    getCachedNode(absoluteUrl, key).then((cached) => {
      if (!isCurrent()) {
        pendingKeys.delete(key);
        return;
      }
      if (cached) {
        dataCache.set(key, cached);
        pendingKeys.delete(key);
        if (hasColorDecided === null) hasColorDecided = cached.hasColor;
        buildEntity(key, node, cached.positions, cached.colors, cached.intensityClass);
        return;
      }
      dispatchToWorker(key, node, true);
    });
  }

  /** Фоновая докачка узла ВНЕ фрустума, только в кэш — см. IDLE_PREFETCH_*
   * в doRefresh. В отличие от requestNode никогда не строит Entity/не
   * трогает `loaded` — сцена не растёт, только dataCache/IndexedDB. */
  function prefetchNode(key: string, node: Hierarchy.Node): void {
    if (loaded.has(key) || pendingKeys.has(key) || dataCache.has(key)) return;
    pendingKeys.add(key);
    getCachedNode(absoluteUrl, key).then((cached) => {
      if (!isCurrent()) {
        pendingKeys.delete(key);
        return;
      }
      if (cached) {
        dataCache.set(key, cached);
        pendingKeys.delete(key);
        return;
      }
      dispatchToWorker(key, node, false);
    });
  }

  for (const worker of workers) {
    worker.onmessage = (e: MessageEvent<CopcWorkerResponse>) => {
      const { id, positions, colors, intensityClass, pointCount, hasColor, error } = e.data;
      const pending = pendingRequests.get(id);
      pendingRequests.delete(id);
      if (!pending) return;
      pendingKeys.delete(pending.key);
      if (error || !positions || !colors || !intensityClass || pointCount === undefined) {
        console.error('COPC: не удалось загрузить узел', pending.key, error);
        return;
      }
      if (hasColorDecided === null && hasColor !== undefined) hasColorDecided = hasColor;
      const resolvedHasColor = hasColor ?? false;
      const cacheEntry: CachedNodeData = { positions, colors, intensityClass, pointCount, hasColor: resolvedHasColor };
      dataCache.set(pending.key, cacheEntry);
      void putCachedNode(absoluteUrl, pending.key, cacheEntry);
      if (pending.render) buildEntity(pending.key, pending.node, positions, colors, intensityClass);
    };
  }

  /** Грузит "скелет" всего облака (depth <= COARSE_ALWAYS_DEPTH) ОДИН раз,
   * независимо от того, куда смотрит камера — см. COARSE_ALWAYS_DEPTH
   * выше. Подгружает недостающие страницы иерархии по пути, как и
   * doRefresh, но без привязки к фрустуму/бюджету: эта часть дерева
   * заведомо небольшая (геометрическая прогрессия 8^depth, при depth=2 —
   * не больше 73 узлов, в реальных данных меньше из-за разреженности). */
  async function loadAlwaysCoarseLayer(): Promise<void> {
    const stack: string[] = ['0-0-0-0'];
    while (stack.length) {
      if (!isCurrent()) return;
      const keyStr = stack.pop()!;
      const key = Key.create(keyStr);
      if (key[0] > COARSE_ALWAYS_DEPTH) continue;
      const node = nodes[keyStr];
      const page = pages[keyStr];
      if (!node && !page) continue;
      if (node) {
        alwaysKeys.add(keyStr);
        requestNode(keyStr, node);
      }
      if (page && !node) {
        const subtree = await Copc.loadHierarchyPage(absoluteUrl, page);
        if (!isCurrent()) return;
        nodes = { ...nodes, ...subtree.nodes };
        pages = { ...pages, ...subtree.pages };
        stack.push(keyStr);
        continue;
      }
      if (key[0] === COARSE_ALWAYS_DEPTH) continue;
      for (const step of Step.list()) {
        const childKey = Key.toString(Key.step(key, step));
        if (nodes[childKey] || pages[childKey]) stack.push(childKey);
      }
    }
  }
  await loadAlwaysCoarseLayer();

  let lastRefreshAt = 0;
  let refreshInFlight = false;
  // Для плавного возврата к полной детализации ПОСЛЕ движения (см.
  // MOVING_RESTORE_DELAY_MS) и для запуска фоновой докачки в кэш при
  // простое (IDLE_PREFETCH_DELAY_MS) — обновляется в refresh() на каждый
  // тик, где isMoving === true.
  let lastMovingAt = 0;

  async function doRefresh(camera: InstanceType<PcModule['Entity']>, isMoving: boolean): Promise<void> {
    if (!isCurrent()) return;
    const camComp: any = (camera as any).camera;
    const vp = new pc.Mat4().mul2(camComp.projectionMatrix, camComp.viewMatrix);
    const frustum = new pc.Frustum();
    frustum.setFromMat4(vp);
    const camPos = camera.getPosition();
    const screenHeight = app.graphicsDevice.height || 1;
    const fovRad = (camComp.fov * Math.PI) / 180;
    // Снимок один раз на тик — пользователь может двигать слайдер бюджета
    // (см. map.php) пока этот тик ещё считается, не хотим половинчатой
    // картины из старого и нового значения в одном проходе.
    const pointBudget = cameraSettings.pointBudget;
    if (isMoving) lastMovingAt = performance.now();
    const effectivelyMoving = performance.now() - lastMovingAt < MOVING_RESTORE_DELAY_MS;
    const isIdle = !effectivelyMoving && performance.now() - lastMovingAt > IDLE_PREFETCH_DELAY_MS;
    // Во время движения — грубее порог и меньше бюджет (см. константы
    // выше), чтобы кадр не "тормозил" под валом новых запросов на
    // декодирование ровно тогда, когда плавность важнее всего.
    const effectiveThreshold = effectivelyMoving ? SCREEN_SIZE_THRESHOLD * MOVING_THRESHOLD_MULTIPLIER : SCREEN_SIZE_THRESHOLD;
    const effectiveBudget = effectivelyMoving ? Math.max(pointBudget / MOVING_BUDGET_DIVISOR, 200_000) : pointBudget;

    // Map, не Set — храним дистанцию до камеры, чтобы при нехватке бюджета
    // приоритет всегда получали БЛИЖНИЕ узлы, стабильно между тиками
    // (раньше порядок диспетчеризации зависел от порядка обхода дерева,
    // который мог чуть отличаться между соседними вызовами — отсюда и
    // мерцание узлов на границе бюджета, видно на живом скриншоте
    // пользователя: 4 042 349 точек при бюджете 4 000 000).
    const selected = new Map<string, number>();
    let budgetUsed = 0;
    // Кандидаты ВНЕ фрустума для фоновой докачки в кэш при простое (см.
    // IDLE_PREFETCH_*) — собираем попутно с обычным обходом, без второго
    // прохода по дереву. Сканируем не больше пары сотен — на гигантских
    // деревьях иначе каждый тик пришлось бы перебирать его целиком.
    const prefetchCandidates: string[] = [];
    const PREFETCH_SCAN_LIMIT = 200;
    const stack: string[] = ['0-0-0-0'];

    while (stack.length) {
      const keyStr = stack.pop()!;
      const node = nodes[keyStr];
      const page = pages[keyStr];
      if (!node && !page) continue;

      const key = Key.create(keyStr);
      // "Скелет" (depth <= COARSE_ALWAYS_DEPTH) уже загружен один раз в
      // loadAlwaysCoarseLayer() и не выгружается — здесь только спускаемся
      // СКВОЗЬ него к более глубоким узлам, без учёта фрустума/бюджета на
      // этом уровне (containment у мелких узлов может быть 0, даже когда
      // их дети уже видны — не хотим из-за этого обрывать спуск).
      const isCoarseAlways = key[0] <= COARSE_ALWAYS_DEPTH;

      const bounds = nodeBounds(key, centeredCube);
      const sphere = boundsSphere(bounds);
      // Сфера в локальных координатах модели — переводим в мировые так же,
      // как AXIS_FIX_ROTATION разворачивает саму модель.
      const localCenter = new pc.Vec3(...sphere.center);
      const worldCenter = root.getWorldTransform().transformPoint(localCenter);
      const containment = frustum.containsSphere(new pc.BoundingSphere(worldCenter, sphere.radius));

      if (isCoarseAlways && node) {
        // "Скелет" остаётся ЗАГРУЖЕННЫМ всегда (не выгружаем, не платим за
        // повторную декомпрессию), но ВИДИМЫМ — только когда сам попадает
        // в фрустум. Без этого, стоя внутри комнаты/дома, сквозь "стены"
        // (у облака точек нет сплошной поверхности, которая могла бы их
        // загородить) была видна разреженная заливка дальних комнат/
        // экстерьера — жалоба пользователя "при просмотре дома и комнат
        // оставался виден объект внутри". Сам узел вне видимости, его
        // дети по-прежнему разрешено достраивать ниже (containment у
        // родителя может быть 0, даже когда внутри него уже есть кусок,
        // попадающий в кадр глубже).
        const entry = loaded.get(keyStr);
        if (entry) entry.entity.enabled = containment !== 0;
      }

      if (containment === 0 && !isCoarseAlways) {
        // Вне фрустума — не растим выборку для рендера, но если простаиваем
        // и это реальный узел (не просто страница-заглушка), он кандидат на
        // фоновую докачку в кэш (без отрисовки, см. prefetchNode).
        if (isIdle && node && !loaded.has(keyStr) && !dataCache.has(keyStr) && prefetchCandidates.length < PREFETCH_SCAN_LIMIT) {
          prefetchCandidates.push(keyStr);
        }
        continue;
      }

      const distance = worldCenter.distance(camPos);
      // Доля половины высоты экрана, которую занимает узел — чем
      // дальше/мельче узел, тем меньше смысла спускаться к его детям.
      // screenHeight не входит в формулу напрямую (соотношение угловое),
      // используется отдельно только как защита от деления на 0 в fov=0.
      const angularSize = distance > 1e-6 ? sphere.radius / distance : Infinity;
      const screenSize = screenHeight > 0 ? angularSize / Math.tan(fovRad / 2) : 0;

      if (node && !isCoarseAlways) {
        selected.set(keyStr, distance);
        budgetUsed += node.pointCount;
      }

      const wantsDescend = isCoarseAlways || (screenSize > effectiveThreshold && budgetUsed < effectiveBudget);
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
    // богатой сцене общая сумма почти всегда больше pointBudget, и старая
    // проверка budgetUsed<=pointBudget на каждой итерации диспетчеризации
    // была одним и тем же числом — либо пропускала ВСЕ узлы, либо все
    // подряд без реального лимита. Считаем отдельно, по факту реальной
    // отправки (уже загруженные узлы продолжают визуально жить, не считая
    // против бюджета новых запросов).
    //
    // Уже загруженные узлы, ПОПАВШИЕ в выборку этого тика, идут первыми
    // (сохраняем их вместо новых — иначе пограничный узел мог бы держаться
    // загруженным, но терять место новым кандидатам и тут же выгружаться
    // ниже). Среди ОСТАЛЬНЫХ (новых, ещё не загруженных) — по запросу
    // пользователя порядок СЛУЧАЙНЫЙ, а не строго по расстоянию: иначе
    // прогрузка всегда шла "волной" от ближнего к дальнему углу кадра,
    // что и выглядело как заливка кубами по очереди, а не равномерно по
    // всему видимому кадру сразу.
    const notLoadedKeys = Array.from(selected.keys()).filter((k) => !loaded.has(k));
    for (let i = notLoadedKeys.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [notLoadedKeys[i], notLoadedKeys[j]] = [notLoadedKeys[j], notLoadedKeys[i]];
    }
    const candidates: [string, number][] = [
      ...Array.from(selected.entries()).filter(([k]) => loaded.has(k)),
      ...notLoadedKeys.map((k) => [k, selected.get(k)!] as [string, number]),
    ];
    let dispatchBudget = 0;
    for (const [key] of candidates) {
      const node = nodes[key];
      if (!node) continue;
      if (loaded.has(key)) {
        dispatchBudget += node.pointCount;
        continue;
      }
      if (dispatchBudget + node.pointCount > effectiveBudget) continue;
      dispatchBudget += node.pointCount;
      requestNode(key, node);
    }

    // Фоновая докачка В КЭШ узлов вне фрустума — только когда камера
    // реально простаивает (см. isIdle выше); маленькими порциями, чтобы не
    // отнимать воркеров у настоящей детализации в кадре, если пользователь
    // вдруг снова задвигает камеру в следующий тик.
    if (isIdle) {
      for (const key of prefetchCandidates.slice(0, IDLE_PREFETCH_BATCH)) {
        const node = nodes[key];
        if (node) prefetchNode(key, node);
      }
    }

    // Гистерезис (см. missCounts выше) — узел выгружается только после
    // нескольких подряд тиков без попадания в выборку, не сразу.
    // alwaysKeys ("скелет") никогда не выгружается — пропускаем целиком.
    for (const key of selected.keys()) {
      missCounts.delete(key);
    }
    for (const key of Array.from(loaded.keys())) {
      if (selected.has(key) || alwaysKeys.has(key)) continue;
      const misses = (missCounts.get(key) ?? 0) + 1;
      if (misses >= MISS_THRESHOLD) {
        missCounts.delete(key);
        disposeNode(key);
      } else {
        missCounts.set(key, misses);
      }
    }
  }

  function refresh(camera: InstanceType<PcModule['Entity']>, isMoving: boolean): void {
    const now = performance.now();
    if (refreshInFlight || now - lastRefreshAt < REFRESH_INTERVAL_MS) return;
    lastRefreshAt = now;
    refreshInFlight = true;
    doRefresh(camera, isMoving).finally(() => {
      refreshInFlight = false;
    });
  }

  function dispose(): void {
    for (const worker of workers) worker.terminate();
    for (const key of Array.from(loaded.keys())) disposeNode(key);
    root.destroy();
  }

  function getStats(): { loadedNodes: number; loadedPoints: number } {
    let loadedPoints = 0;
    for (const entry of loaded.values()) loadedPoints += entry.pointCount;
    return { loadedNodes: loaded.size, loadedPoints };
  }

  // Тот же поворот, что и у root (см. root.setLocalRotation ниже) — берём
  // его напрямую из константы, а не через root.getRotation()/getEulerAngles
  // (не хотим зависеть от точного имени геттера PlayCanvas; конструктор
  // Entity гарантированно принимает именно этот кватернион, вот и обратный
  // строим из него же).
  const axisFixInv = new pc.Quat(...(AXIS_FIX_ROTATION as [number, number, number, number])).clone().invert();

  function pickNearestPoint(
    camera: InstanceType<PcModule['Entity']>,
    canvas: HTMLCanvasElement,
    clientX: number,
    clientY: number
  ): InstanceType<PcModule['Vec3']> | null {
    const rect = canvas.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * canvas.clientWidth;
    const py = ((clientY - rect.top) / rect.height) * canvas.clientHeight;
    const camComp: any = (camera as any).camera;
    const nearWorld = camComp.screenToWorld(px, py, camComp.nearClip);
    const farWorld = camComp.screenToWorld(px, py, camComp.farClip);

    // Луч -> локальное пространство узлов (то же самое пространство, в
    // котором лежат сырые positions из воркера, ДО поворота root) — root
    // это чистый поворот без translate/scale, так что вектора достаточно
    // повернуть, не умножая КАЖДУЮ точку на полную матрицу в горячем цикле.
    const rayOrigin = axisFixInv.transformVector(nearWorld.clone());
    const rayDir = axisFixInv.transformVector(farWorld.clone().sub(nearWorld)).normalize();

    // Порог "достаточно близко к лучу" считается в пикселях экрана и
    // переводится в мировые единицы ОТДЕЛЬНО для каждой точки через её t
    // (расстояние вдоль луча) — иначе один фиксированный мировой допуск был
    // бы то слишком узким (далёкие точки), то слишком широким (близкие),
    // в зависимости от того, насколько камера приближена к модели.
    const fovRad = (camComp.fov * Math.PI) / 180;
    const screenHeight = app.graphicsDevice.height || 1;
    const worldPerPixelAtT = (t: number) => (2 * t * Math.tan(fovRad / 2)) / screenHeight;
    const PICK_RADIUS_PX = 10;

    let bestT = Infinity;
    let bestLocal: [number, number, number] | null = null;

    for (const [key, entry] of loaded) {
      // "Скелет" вне фрустума скрыт (entity.enabled = false, см. doRefresh)
      // — невидимые точки не должны ловить клики.
      if (!entry.entity.enabled) continue;
      const cached = dataCache.get(key);
      if (!cached) continue;
      const pos = cached.positions;
      const n = pos.length / 3;
      for (let i = 0; i < n; i++) {
        const qx = pos[i * 3] - rayOrigin.x;
        const qy = pos[i * 3 + 1] - rayOrigin.y;
        const qz = pos[i * 3 + 2] - rayOrigin.z;
        const t = qx * rayDir.x + qy * rayDir.y + qz * rayDir.z;
        if (t < 0 || t >= bestT) continue; // за камерой, или заведомо не ближе уже найденного
        const perpX = qx - rayDir.x * t;
        const perpY = qy - rayDir.y * t;
        const perpZ = qz - rayDir.z * t;
        const perpSq = perpX * perpX + perpY * perpY + perpZ * perpZ;
        const maxPerp = worldPerPixelAtT(t) * PICK_RADIUS_PX;
        if (perpSq <= maxPerp * maxPerp) {
          bestT = t;
          bestLocal = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]];
        }
      }
    }

    if (!bestLocal) return null;
    return root.getWorldTransform().transformPoint(new pc.Vec3(bestLocal[0], bestLocal[1], bestLocal[2]));
  }

  showProgress('COPC: подгрузка по области видимости...', 100);
  return { refresh, dispose, getStats, pickNearestPoint };
}
