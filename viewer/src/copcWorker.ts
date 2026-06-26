import { Copc, type Hierarchy } from 'copc';
// copc.js по умолчанию инициализирует laz-perf через пакетный browser-вход
// (lib/web/index.js), который рассчитан на DOM-контекст (document/window) —
// внутри Web Worker у него нет ни синхронной, ни асинхронной загрузки .wasm
// ("both async and sync fetching of the wasm failed", обнаружено живым
// тестом). У laz-perf есть отдельная сборка специально под Worker —
// используем её явно и передаём готовый инстанс в Copc.loadPointDataView,
// а не полагаемся на автоинициализацию внутри copc.js.
import { createLazPerf } from 'laz-perf/lib/worker/index.js';
// ?url — Vite копирует .wasm в итоговую папку ассетов и отдаёт его реальный
// URL (с учётом base из vite.config.ts); без этого Emscripten-загрузчик
// фетчит относительный "laz-perf.wasm" от scriptDirectory, которого у нас
// просто нет на сервере — там вместо wasm прилетал HTML 404-страницы
// (несовпадение magic word, обнаружено живым тестом).
import lazPerfWasmUrl from 'laz-perf/lib/worker/laz-perf.wasm?url';

let lazPerfPromise: ReturnType<typeof createLazPerf> | undefined;
function getLazPerf(): ReturnType<typeof createLazPerf> {
  if (!lazPerfPromise) lazPerfPromise = createLazPerf({ locateFile: () => lazPerfWasmUrl });
  return lazPerfPromise;
}

/**
 * Декомпрессия LAZ-чанка (laz-perf, WASM) — заметная CPU-нагрузка на узел
 * октодерева; вынесена в воркер, чтобы не подвешивать рендер-цикл при
 * частой подгрузке узлов во время навигации (см. copcLoader.ts).
 */
export interface CopcWorkerRequest {
  id: number;
  url: string;
  copc: Copc;
  node: Hierarchy.Node;
  /** Известно ли заранее, что в файле есть реальный RGB (решается один раз
   * по корневому узлу в copcLoader.ts) — true/false/null («ещё не решено»,
   * тогда воркер сам определяет и возвращает поле hasColor в ответе). */
  hasColor: boolean | null;
  /** Диапазон Z всего облака (copc.info.cube), уже в координатах,
   * центрированных на centerOffset — см. copcLoader.ts. Для HSL-заливки по
   * высоте, когда реального цвета нет; должен быть одинаков для всех узлов. */
  zRange: [number, number];
  /** Вычитается из X/Y/Z каждой точки до возврата — иначе абсолютные
   * LAS-координаты (порядка 10^5) после поворота AXIS_FIX_ROTATION на
   * сущности разлетались бы в случайные мировые позиции (см. подробный
   * комментарий в copcLoader.ts, обнаружено живым тестом на сервере). */
  centerOffset: [number, number, number];
}

export interface CopcWorkerResponse {
  id: number;
  positions?: Float32Array;
  colors?: Uint8Array;
  pointCount?: number;
  hasColor?: boolean;
  error?: string;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + h * 12) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

self.onmessage = async (e: MessageEvent<CopcWorkerRequest>) => {
  const { id, url, copc, node, hasColor: hasColorHint, zRange, centerOffset } = e.data;
  try {
    const lazPerf = await getLazPerf();
    const view = await Copc.loadPointDataView(url, copc, node, { lazPerf });
    const count = view.pointCount;
    const getX = view.getter('X');
    const getY = view.getter('Y');
    const getZ = view.getter('Z');

    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = getX(i) - centerOffset[0];
      positions[i * 3 + 1] = getY(i) - centerOffset[1];
      positions[i * 3 + 2] = getZ(i) - centerOffset[2];
    }

    const colors = new Uint8Array(count * 4);
    let hasColor = hasColorHint;
    if (hasColor === null) {
      // Решаем один раз по корневому узлу: реальный цвет есть, если хотя бы
      // у одной точки Red/Green/Blue не нулевые (сканеры без камеры дают
      // R=G=B=0 везде, хотя измерение COPC формата это поддерживает).
      hasColor = false;
      if (view.dimensions.Red) {
        const getR = view.getter('Red');
        const getG = view.getter('Green');
        const getB = view.getter('Blue');
        for (let i = 0; i < count; i++) {
          if (getR(i) || getG(i) || getB(i)) {
            hasColor = true;
            break;
          }
        }
      }
    }

    if (hasColor && view.dimensions.Red) {
      const getR = view.getter('Red');
      const getG = view.getter('Green');
      const getB = view.getter('Blue');
      // LAS-спека хранит Red/Green/Blue как 16-бит (0-65535) независимо от
      // исходной битовой глубины — нормализуем в 0-255 сдвигом, а не делением,
      // это и есть стандартный способ для этого диапазона.
      for (let i = 0; i < count; i++) {
        colors[i * 4] = getR(i) >> 8;
        colors[i * 4 + 1] = getG(i) >> 8;
        colors[i * 4 + 2] = getB(i) >> 8;
        colors[i * 4 + 3] = 255;
      }
    } else {
      const [zMin, zMax] = zRange;
      const extent = Math.max(zMax - zMin, 1e-6);
      for (let i = 0; i < count; i++) {
        const t = Math.max(0, Math.min(1, (positions[i * 3 + 2] - zMin) / extent));
        const [r, g, b] = hslToRgb((1 - t) * 0.66, 0.8, 0.5);
        colors[i * 4] = Math.round(r * 255);
        colors[i * 4 + 1] = Math.round(g * 255);
        colors[i * 4 + 2] = Math.round(b * 255);
        colors[i * 4 + 3] = 255;
      }
    }

    const response: CopcWorkerResponse = { id, positions, colors, pointCount: count, hasColor };
    (self as unknown as Worker).postMessage(response, [positions.buffer, colors.buffer]);
  } catch (err) {
    const response: CopcWorkerResponse = { id, error: String(err) };
    (self as unknown as Worker).postMessage(response);
  }
};
