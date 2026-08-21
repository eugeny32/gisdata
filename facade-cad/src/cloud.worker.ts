/**
 * cloud.worker — point-cloud reading and parsing off the main thread.
 * Receives the File objects themselves (structured-clonable): reading
 * happens here via File.slice, so LAS and COPC never allocate one giant
 * buffer.
 * In:  { files: File[] } | { demo: true }.
 * Out: { type:'ready' } | { type:'progress', p, phase? } |
 *      { type:'done', qpos, colors, count, origin, leaves } (transferred) |
 *      { type:'error', message }.
 *
 * Съёмка приходит КУСКАМИ — по файлу на стоянку сканера или крыло здания.
 * Несколько файлов склеиваются здесь в одно облако: каждый кусок парсится
 * своим форматом, а сшивает их общий survey-origin — куски встают друг к
 * другу так, как лежали в геодезической системе.
 */
import { buildDemoCloud, centerCloud, parseAsciiCloud, shuffleCloud } from './PointCloudFactory';
import { isCopc, MAX_POINTS, parseCopc, parseE57, parseLasFile, parseLaz, RawCloud } from './CloudImport';
import { buildLeafIndex, LEAF_STRIDE, quantizeByLeaves } from './CloudIndex';
import { pointInPolyFlat } from './ShaderFactory';
import { cacheKey, readCache, writeCache } from './CloudCache';

/**
 * Копия облака ДЛЯ МАТЕМАТИКИ ЛАССО: изоляция стены на десятках миллионов
 * точек — секунды CPU, и в главном потоке это был фриз после обводки.
 * Кванты позиций + коробки листьев (9 байт на точку с цветом уже у
 * главного; здесь 6+координаты листьев) — цена, за которую обводка
 * перестаёт замораживать интерфейс вовсе.
 */
let stateQ: Uint16Array | null = null;
let stateLeaves: Float64Array | null = null;
let stateCount = 0;

/** Кап компакта — держать в согласии с Engine.COMPACT_CAP. */
const COMPACT_CAP = 4_000_000;

const ctx = self as unknown as { postMessage(msg: unknown, transfer?: Transferable[]): void; onmessage: ((e: MessageEvent) => void) | null };

const MAX_WHOLE_FILE = 1.8e9; // sequential-decode formats need the full buffer

/** Chunked read with throttled percentage messages. */
async function readAll(file: File, phase: string): Promise<ArrayBuffer> {
  const out = new Uint8Array(file.size);
  const reader = file.stream().getReader();
  let got = 0;
  let lastPct = -1;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    out.set(value, got);
    got += value.length;
    const pct = Math.floor((got / file.size) * 100);
    if (pct !== lastPct) {
      lastPct = pct;
      ctx.postMessage({ type: 'progress', p: got / file.size, phase: `${phase} ${pct}%` });
    }
  }
  return out.buffer;
}

/** Один файл — по расширению. `tag` подписывает прогресс («файл 2/3»). */
async function parseOne(file: File, tag: string): Promise<RawCloud | null> {
  const progress = (p: number) =>
    ctx.postMessage({ type: 'progress', p, phase: `${tag}Обработка точек… ${Math.round(p * 100)}%` });
  const ext = (file.name.toLowerCase().split('.').pop() ?? '').trim();
  if (ext === 'las') return parseLasFile(file, progress); // streamed windows, any size
  if (ext === 'laz') {
    if (isCopc(await file.slice(0, 512).arrayBuffer())) {
      ctx.postMessage({ type: 'progress', p: 0, phase: `${tag}COPC: чтение октодерева…` });
      return parseCopc(file, progress); // only coarse levels are fetched
    }
    if (file.size > MAX_WHOLE_FILE) throw new Error('LAZ слишком большой для распаковки целиком — конвертируйте в COPC или LAS');
    return parseLaz(await readAll(file, `${tag}Чтение файла…`), progress);
  }
  if (ext === 'e57') {
    if (file.size > MAX_WHOLE_FILE) throw new Error('E57 слишком большой — конвертируйте в LAS');
    const buf = await readAll(file, `${tag}Чтение файла…`);
    ctx.postMessage({ type: 'progress', p: 0, phase: `${tag}Конвертация E57…` });
    return parseE57(buf);
  }
  const buf = await readAll(file, `${tag}Чтение файла…`);
  return parseAsciiCloud(new TextDecoder().decode(buf), (p) =>
    ctx.postMessage({ type: 'progress', p, phase: `${tag}Разбор текста… ${Math.round(p * 100)}%` }),
  );
}

/**
 * Склейка кусков в одну систему. Каждый кусок центрирован по-своему, но
 * его origin помнит, что было вычтено, — куски сшиваются переносом в
 * систему ПЕРВОГО, затем общее пере-центрирование (и origin пересчитан,
 * так что экспорт в МСК остаётся точным). Суммарный размер прореживается
 * к MAX_POINTS ещё при копировании — без пикового двойного буфера.
 */
function mergeParts(parts: RawCloud[]): RawCloud {
  const o0 = parts[0].origin ?? { x: 0, y: 0, z: 0 };
  let total = 0;
  for (const p of parts) total += p.count;
  const stride = Math.max(1, Math.ceil(total / MAX_POINTS));
  const n = Math.ceil(total / stride);
  const pos = new Float32Array(n * 3);
  const col = new Uint8Array(n * 3);
  let w = 0;
  let phase = 0; // держит шаг прореживания сквозь границы кусков
  for (const p of parts) {
    const o = p.origin ?? { x: 0, y: 0, z: 0 };
    const dx = o.x - o0.x;
    const dy = o.y - o0.y;
    const dz = o.z - o0.z;
    for (let k = phase; k < p.count && w < n; k += stride) {
      pos[w * 3] = p.positions[k * 3] + dx;
      pos[w * 3 + 1] = p.positions[k * 3 + 1] + dy;
      pos[w * 3 + 2] = p.positions[k * 3 + 2] + dz;
      col[w * 3] = p.colors[k * 3];
      col[w * 3 + 1] = p.colors[k * 3 + 1];
      col[w * 3 + 2] = p.colors[k * 3 + 2];
      w++;
    }
    phase = (phase - p.count) % stride;
    if (phase < 0) phase += stride;
  }
  const positions = pos.subarray(0, w * 3);
  const shift = centerCloud(positions);
  return {
    positions,
    colors: col.subarray(0, w * 3),
    count: w,
    origin: { x: o0.x + shift.cx, y: o0.y + shift.cy, z: o0.z + shift.cz },
  };
}

/**
 * Изоляция стены целиком в воркере: точки в контуре, кап, шаффл, деквант
 * мировых позиций, kd-нарезка стены и локальные координаты для снапа.
 * Главному потоку остаётся собрать THREE-объекты из готовых массивов.
 */
function runLasso(msg: { px: Float32Array; pz: Float32Array; n: number; seq: number; ucsInverse: number[] | null }): void {
  if (!stateQ || !stateLeaves) {
    ctx.postMessage({ type: 'lasso', seq: msg.seq, kept: 0 });
    return;
  }
  const { px, pz, n } = msg;
  const q = stateQ;
  const L = stateLeaves;
  let bx0 = Infinity, bx1 = -Infinity, bz0 = Infinity, bz1 = -Infinity;
  for (let i = 0; i < n; i++) {
    if (px[i] < bx0) bx0 = px[i];
    if (px[i] > bx1) bx1 = px[i];
    if (pz[i] < bz0) bz0 = pz[i];
    if (pz[i] > bz1) bz1 = pz[i];
  }

  // Точки в контуре + габариты стены — по листьям, с претестом коробок.
  const hit = new Uint8Array(stateCount);
  let kept = 0;
  let wx0 = Infinity, wy0 = Infinity, wz0 = Infinity;
  let wx1 = -Infinity, wy1 = -Infinity, wz1 = -Infinity;
  for (let o = 0; o + LEAF_STRIDE <= L.length; o += LEAF_STRIDE) {
    if (L[o + 5] < bx0 || L[o + 2] > bx1 || L[o + 7] < bz0 || L[o + 4] > bz1) continue;
    const start = L[o];
    const end = start + L[o + 1];
    const mx = L[o + 2], my = L[o + 3], mz = L[o + 4];
    const sx = Math.max(1e-9, L[o + 5] - mx) / 65535;
    const sy = Math.max(1e-9, L[o + 6] - my) / 65535;
    const sz = Math.max(1e-9, L[o + 7] - mz) / 65535;
    for (let i = start; i < end; i++) {
      const x = mx + q[i * 3] * sx;
      const z = mz + q[i * 3 + 2] * sz;
      if (x < bx0 || x > bx1 || z < bz0 || z > bz1) continue;
      if (pointInPolyFlat(x, z, px, pz, n)) {
        hit[i] = 1;
        kept++;
        const y = my + q[i * 3 + 1] * sy;
        if (x < wx0) wx0 = x;
        if (x > wx1) wx1 = x;
        if (y < wy0) wy0 = y;
        if (y > wy1) wy1 = y;
        if (z < wz0) wz0 = z;
        if (z > wz1) wz1 = z;
      }
    }
  }
  if (!kept) {
    ctx.postMessage({ type: 'lasso', seq: msg.seq, kept: 0 });
    return;
  }

  let idx = new Uint32Array(kept);
  for (let i = 0, k = 0; i < stateCount; i++) if (hit[i]) idx[k++] = i;
  // Кап до шаффла (шаг по листовому порядку — пространственно равномерно),
  // шаффл — чтобы любой префикс стены был равномерной подвыборкой.
  if (kept > COMPACT_CAP) {
    const capped = new Uint32Array(COMPACT_CAP);
    const step = kept / COMPACT_CAP;
    for (let i = 0; i < COMPACT_CAP; i++) capped[i] = idx[(i * step) | 0];
    idx = capped;
  }
  for (let i = idx.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const t = idx[i];
    idx[i] = idx[j];
    idx[j] = t;
  }

  // Мировые позиции стены (деквант) — и kd-нарезка, переставляющая srcP
  // ВМЕСТЕ с индексами (companion = те же байты idx, шаг 4): главный
  // соберёт цвета листьев обычным gather по переставленному idx.
  const wallN = idx.length;
  const srcP = new Float32Array(wallN * 3);
  for (let k = 0; k < wallN; k++) {
    const i = idx[k];
    // Бинпоиск листа: диапазоны отсортированы по start (см. CloudIndex).
    let lo = 0;
    let hi = L.length / LEAF_STRIDE - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (L[mid * LEAF_STRIDE] <= i) lo = mid;
      else hi = mid - 1;
    }
    const o = lo * LEAF_STRIDE;
    srcP[k * 3] = L[o + 2] + q[i * 3] * (Math.max(1e-9, L[o + 5] - L[o + 2]) / 65535);
    srcP[k * 3 + 1] = L[o + 3] + q[i * 3 + 1] * (Math.max(1e-9, L[o + 6] - L[o + 3]) / 65535);
    srcP[k * 3 + 2] = L[o + 4] + q[i * 3 + 2] * (Math.max(1e-9, L[o + 7] - L[o + 4]) / 65535);
  }
  const wallLeaves = buildLeafIndex(srcP, new Uint8Array(idx.buffer, idx.byteOffset, wallN * 4), wallN, undefined, 64_000, 4);

  // Локальные оси для снап-грида — если ПСК уже есть.
  let localAll: Float32Array | null = null;
  if (msg.ucsInverse) {
    const e = msg.ucsInverse;
    localAll = new Float32Array(wallN * 3);
    for (let k = 0; k < wallN; k++) {
      const wx = srcP[k * 3];
      const wy = srcP[k * 3 + 1];
      const wz = srcP[k * 3 + 2];
      localAll[k * 3] = e[0] * wx + e[4] * wy + e[8] * wz + e[12];
      localAll[k * 3 + 1] = e[1] * wx + e[5] * wy + e[9] * wz + e[13];
      localAll[k * 3 + 2] = e[2] * wx + e[6] * wy + e[10] * wz + e[14];
    }
  }

  const transfer: Transferable[] = [srcP.buffer, wallLeaves.buffer, idx.buffer];
  if (localAll) transfer.push(localAll.buffer);
  ctx.postMessage(
    { type: 'lasso', seq: msg.seq, kept, srcP, wallLeaves, idx, localAll, bounds: [wx0, wy0, wz0, wx1, wy1, wz1] },
    transfer,
  );
}

// Handshake: module workers evaluate asynchronously — jobs posted before
// this script finishes can be dropped. The Engine waits for 'ready'.
ctx.postMessage({ type: 'ready' });

ctx.onmessage = async (e: MessageEvent) => {
  const { files, demo, lasso } = e.data as {
    files?: File[];
    demo?: boolean;
    lasso?: { px: Float32Array; pz: Float32Array; n: number; seq: number; ucsInverse: number[] | null };
  };
  if (lasso) {
    try {
      runLasso(lasso);
    } catch (err) {
      ctx.postMessage({ type: 'error', message: (err as Error).message });
    }
    return;
  }
  try {
    // Demo scan: generated here too, so the first frames on the main thread
    // stay smooth and an import never pays for a cloud it discards.
    if (demo) {
      const d = buildDemoCloud();
      const colors = d.geometry.getAttribute('aColor').array as Uint8Array;
      shuffleCloud(d.positions, colors, d.count);
      const leaves = buildLeafIndex(d.positions, colors, d.count);
      const qpos = quantizeByLeaves(d.positions, leaves);
      // Копия для лассо-математики — ДО transfer, он опустошает буферы.
      stateQ = qpos.slice();
      stateLeaves = leaves.slice();
      stateCount = d.count;
      ctx.postMessage({ type: 'done', qpos, colors, count: d.count, origin: null, leaves }, [qpos.buffer, colors.buffer, leaves.buffer]);
      return;
    }
    if (!files || !files.length) throw new Error('нет файлов для импорта');

    // Кэш готового облака (OPFS, см. CloudCache): второе открытие ТОГО ЖЕ
    // скана (по имени+размеру+времени правки — без чтения содержимого)
    // пропускает разбор, перемешивание, kd-индекс и квантование целиком.
    const key = cacheKey(files);
    const cached = await readCache(key);
    if (cached) {
      ctx.postMessage({ type: 'progress', p: 0.5, phase: 'Кэш скана найден — секунды вместо разбора…' });
      stateQ = cached.qpos.slice();
      stateLeaves = cached.leaves.slice();
      stateCount = cached.count;
      ctx.postMessage(
        { type: 'done', qpos: cached.qpos, colors: cached.colors, count: cached.count, origin: cached.origin, leaves: cached.leaves },
        [cached.qpos.buffer, cached.colors.buffer, cached.leaves.buffer],
      );
      return;
    }

    const parts: RawCloud[] = [];
    for (let i = 0; i < files.length; i++) {
      const tag = files.length > 1 ? `Файл ${i + 1}/${files.length} · ` : '';
      const part = await parseOne(files[i], tag);
      if (!part) throw new Error(`${files[i].name}: не удалось прочитать (LAS/LAZ/E57 или ASCII x y z [r g b])`);
      parts.push(part);
    }
    const r = parts.length === 1 ? parts[0] : mergeParts(parts);

    ctx.postMessage({ type: 'progress', p: 1, phase: 'Подготовка отображения…' });
    // Порядок важен: сперва перемешивание (префикс листа = равномерная
    // подвыборка), потом kd-индекс — он не сортирует внутри листа и
    // случайность порядка сохраняет.
    shuffleCloud(r.positions, r.colors, r.count);
    const leaves = buildLeafIndex(r.positions, r.colors, r.count, (p) =>
      ctx.postMessage({ type: 'progress', p, phase: `Индексация… ${Math.round(p * 100)}%` }),
    );
    // Квант — последний шаг: Float32-позиции дальше не едут вовсе, главному
    // потоку хватает uint16 + коробок листьев (см. quantizeByLeaves).
    const qpos = quantizeByLeaves(r.positions, leaves);
    // Копии ДО transfer (он опустошает буферы): одна для лассо-математики
    // (stateQ/stateLeaves живут всё время сеанса), вторая — на диск в кэш.
    const qposCache = qpos.slice();
    const leavesCache = leaves.slice();
    const colorsCache = r.colors.slice();
    stateQ = qpos.slice();
    stateLeaves = leaves.slice();
    stateCount = r.count;
    ctx.postMessage(
      { type: 'done', qpos, colors: r.colors, count: r.count, origin: r.origin ?? null, leaves },
      [qpos.buffer, r.colors.buffer, leaves.buffer],
    );
    // Запись в кэш — уже ПОСЛЕ показа, пользователь её не ждёт.
    void writeCache(key, { qpos: qposCache, colors: colorsCache, leaves: leavesCache, count: r.count, origin: r.origin ?? null });
  } catch (err) {
    ctx.postMessage({ type: 'error', message: (err as Error).message });
  }
};
