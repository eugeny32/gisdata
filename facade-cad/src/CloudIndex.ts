/**
 * CloudIndex — пространственный индекс облака: kd-разбиение на ЛИСТЬЯ.
 *
 * Зачем. Один буфер на всё облако упирается в вершинный конвейер: каждый
 * кадр оплачивает все точки во всех трёх окнах, и выше ~4 млн точек это
 * не живёт. Дерево переворачивает счёт: в кадр идут только листья, чьи
 * коробки видны камере, и от каждого — префикс по его экранному размеру.
 * Дальняя стена рисуется тысячами точек, ближняя — миллионами, а платит
 * кадр только за то, что реально попало на экран.
 *
 * Почему именно листья без иерархических подвыборок (в отличие от Potree):
 * буфер приходит сюда УЖЕ перемешанным, а разбиение устойчиво к порядку —
 * внутри листа порядок остаётся случайным, и «грубая версия листа» — это
 * просто префикс его диапазона. Уровни детализации даром, без дублирования
 * точек и без обхода дерева: массив листьев с AABB — вся структура.
 *
 * Работает в воркере: на десятках миллионов точек разбиение — секунды.
 */

/** Числа на один лист в плоском массиве LEAF_STRIDE × Float64:
 *  start, count, minX, minY, minZ, maxX, maxY, maxZ.
 *  Float64 — потому что start на 100-миллионном облаке не влезает в
 *  точные целые Float32 (2^24). */
export const LEAF_STRIDE = 8;

/** Целевой размер листа. Мельче — лучше отсечение, но больше draw calls:
 *  512k даёт ~125 листьев на 64 млн точек — сотни вызовов на кадр в худшем
 *  случае, ещё дёшево для WebGL. Стена (компакт) режется мельче — у её
 *  окон-резов интервалы узкие, и точность отсечения там дороже. */
const TARGET_LEAF = 512_000;
const MAX_DEPTH = 18;

export function buildLeafIndex(
  pos: Float32Array,
  col: Uint8Array,
  count: number,
  onProgress?: (frac: number) => void,
  targetLeaf: number = TARGET_LEAF,
  // Сколько байт спутника едет с каждой точкой. Обычно это цвет (3), но
  // лассо-воркер переставляет вместе с позициями массив ИНДЕКСОВ стены —
  // Uint32 поверх тех же байтов, шаг 4.
  companionStride = 3,
): Float64Array {
  if (!count) return new Float64Array(0);

  // Корневой AABB.
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < count * 3; i += 3) {
    const x = pos[i], y = pos[i + 1], z = pos[i + 2];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }

  interface Task { start: number; end: number; depth: number; box: number[] }
  const leaves: Task[] = [];
  const stack: Task[] = [{ start: 0, end: count, depth: 0, box: [minX, minY, minZ, maxX, maxY, maxZ] }];
  let done = 0;

  const swap = (a: number, b: number): void => {
    for (let k = 0; k < 3; k++) {
      const ai = a * 3 + k;
      const bi = b * 3 + k;
      const tp = pos[ai];
      pos[ai] = pos[bi];
      pos[bi] = tp;
    }
    for (let k = 0; k < companionStride; k++) {
      const ai = a * companionStride + k;
      const bi = b * companionStride + k;
      const tc = col[ai];
      col[ai] = col[bi];
      col[bi] = tc;
    }
  };

  while (stack.length) {
    const t = stack.pop()!;
    const n = t.end - t.start;
    if (n <= targetLeaf || t.depth >= MAX_DEPTH) {
      leaves.push(t);
      done += n;
      if (onProgress) onProgress(done / count);
      continue;
    }
    const b = t.box;
    const sx = b[3] - b[0];
    const sy = b[4] - b[1];
    const sz = b[5] - b[2];
    // Длиннейшая ось; 0=X 1=Y 2=Z.
    const axis = sx >= sy && sx >= sz ? 0 : sy >= sz ? 1 : 2;
    const mid = (b[axis] + b[axis + 3]) / 2;

    // Партиция Хоара по mid. Свапы переносят и цвет: массивы едины.
    let i = t.start;
    let j = t.end - 1;
    while (i <= j) {
      while (i <= j && pos[i * 3 + axis] < mid) i++;
      while (i <= j && pos[j * 3 + axis] >= mid) j--;
      if (i < j) {
        swap(i, j);
        i++;
        j--;
      }
    }
    // Все точки по одну сторону (совпадающие координаты) — делим по числу:
    // AABB у половин совпадёт, но глубина ограничена и стек не зациклится.
    if (i === t.start || i === t.end) i = t.start + (n >> 1);

    const lb = b.slice();
    const rb = b.slice();
    lb[axis + 3] = mid;
    rb[axis] = mid;
    stack.push({ start: t.start, end: i, depth: t.depth + 1, box: lb });
    stack.push({ start: i, end: t.end, depth: t.depth + 1, box: rb });
  }

  // Порядок листьев — ПО start, не по порядку обхода стека: бинарный поиск
  // «какому листу принадлежит точка i» (Engine.leafOf) обязан работать по
  // монотонным диапазонам. Несортированный индекс уже стоил бага: часть
  // точек деквантовалась параметрами чужого листа, и стена на виде сбоку
  // рассыпалась на куски.
  leaves.sort((a, b) => a.start - b.start);

  // Точные AABB листьев: midpoint-коробки рыхлые (точки не доходят до
  // граней), а качество отсечения — это и есть качество всего индекса.
  const out = new Float64Array(leaves.length * LEAF_STRIDE);
  for (let li = 0; li < leaves.length; li++) {
    const t = leaves[li];
    let x0 = Infinity, y0 = Infinity, z0 = Infinity;
    let x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
    for (let i = t.start * 3; i < t.end * 3; i += 3) {
      const x = pos[i], y = pos[i + 1], z = pos[i + 2];
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
      if (z < z0) z0 = z;
      if (z > z1) z1 = z;
    }
    const o = li * LEAF_STRIDE;
    out[o] = t.start;
    out[o + 1] = t.end - t.start;
    out[o + 2] = x0;
    out[o + 3] = y0;
    out[o + 4] = z0;
    out[o + 5] = x1;
    out[o + 6] = y1;
    out[o + 7] = z1;
  }
  return out;
}

/**
 * Квантование позиций в uint16 ОТНОСИТЕЛЬНО КОРОБКИ ЛИСТА (точные AABB уже
 * лежат в leafData). Float32-массив после этого не нужен вовсе: и куча, и
 * GPU держат 6 байт на точку вместо 12 — на 64 млн это минус ~380 МБ там
 * и там. Обратный ход — min + q × scale — восстанавливает координату с
 * шагом (размер листа)/65535: доли миллиметра, глубже шума сканера.
 */
export function quantizeByLeaves(pos: Float32Array, leafData: Float64Array): Uint16Array {
  let total = 0;
  for (let o = 0; o + LEAF_STRIDE <= leafData.length; o += LEAF_STRIDE) total += leafData[o + 1];
  const q = new Uint16Array(total * 3);
  for (let o = 0; o + LEAF_STRIDE <= leafData.length; o += LEAF_STRIDE) {
    const start = leafData[o];
    const count = leafData[o + 1];
    const mx = leafData[o + 2], my = leafData[o + 3], mz = leafData[o + 4];
    // Пустой размер (плоский лист) — защитная единица: q останется нулём,
    // а деквант вернёт ровно min.
    const ix = 65535 / Math.max(1e-9, leafData[o + 5] - mx);
    const iy = 65535 / Math.max(1e-9, leafData[o + 6] - my);
    const iz = 65535 / Math.max(1e-9, leafData[o + 7] - mz);
    // Кламп обязателен: Uint16Array заворачивает 65536 в ноль, и точка на
    // самой грани коробки улетала бы на противоположную сторону листа.
    for (let i = start * 3, e = (start + count) * 3; i < e; i += 3) {
      q[i] = Math.min(65535, (pos[i] - mx) * ix + 0.5);
      q[i + 1] = Math.min(65535, (pos[i + 1] - my) * iy + 0.5);
      q[i + 2] = Math.min(65535, (pos[i + 2] - mz) * iz + 0.5);
    }
  }
  return q;
}
