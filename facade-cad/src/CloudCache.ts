/**
 * CloudCache — дисковый кэш ГОТОВОГО облака (OPFS), живёт в cloud.worker.
 *
 * Дорогая часть импорта — не чтение файла, а разбор + перемешивание +
 * kd-индексация + квантование. Открыли скан второй раз (тот же файл,
 * тот же размер и время правки) — все четыре шага не нужны: тут же лежит
 * их результат (qpos/colors/leaves), и «Готово» приходит за секунды вместо
 * минут на многомиллионном скане.
 *
 * OPFS выбран потому, что он у же есть даром: `navigator.storage.getDirectory()`
 * и `createSyncAccessHandle()` работают прямо в этом воркере (проверено в
 * headless Edge и в WebView2 — оба Chromium), не требуют правок ни С#-моста
 * десктопа, ни сети. Ключ кэша — отпечаток (имя, размер, mtime) файлов
 * импорта, а не хэш содержимого: читать гигабайты дважды ради проверки
 * смысла нет, и совпадение отпечатка у РАЗНОГО файла практически невозможно.
 *
 * Хранилище держит не больше CACHE_SLOTS облаков — старые вытесняются по
 * времени последнего использования (index.bin), диск не растёт бесконечно.
 */

export interface CachedCloud {
  qpos: Uint16Array;
  colors: Uint8Array;
  leaves: Float64Array;
  count: number;
  origin: { x: number; y: number; z: number } | null;
}

const ROOT_DIR = 'cloud-cache';
const CACHE_SLOTS = 3;
/** Fixed header, Float64Array(8): [count, hasOrigin, ox, oy, oz, leafBytes, qposBytes, colorsBytes]. */
const META_LEN = 8;

/** Отпечаток файлов импорта — имя+размер+mtime, без чтения содержимого. */
export function cacheKey(files: readonly { name: string; size: number; lastModified: number }[]): string {
  return files.map((f) => `${f.name}|${f.size}|${f.lastModified}`).join('~');
}

/** FNV-1a, только для имени папки — коллизия не страшна: readCache
 *  сверяет ПОЛНЫЙ ключ, записанный внутри, и молча промахивается мимо. */
function hashKey(key: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

async function opfsRoot(): Promise<FileSystemDirectoryHandle> {
  const root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle(ROOT_DIR, { create: true });
}

async function readWhole(dir: FileSystemDirectoryHandle, name: string): Promise<Uint8Array | null> {
  let fh: FileSystemFileHandle;
  try {
    fh = await dir.getFileHandle(name);
  } catch {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ah = await (fh as any).createSyncAccessHandle();
  try {
    const out = new Uint8Array(ah.getSize());
    ah.read(out, { at: 0 });
    return out;
  } finally {
    ah.close();
  }
}

async function writeWhole(dir: FileSystemDirectoryHandle, name: string, data: Uint8Array): Promise<void> {
  const fh = await dir.getFileHandle(name, { create: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ah = await (fh as any).createSyncAccessHandle();
  try {
    ah.truncate(0);
    ah.write(data, { at: 0 });
    ah.flush();
  } finally {
    ah.close();
  }
}

/** Список слотов кэша: hash → {key, lastUsed}. Хранится одним JSON-файлом —
 *  это метаданные в байтах, не точки, парсинг стоит микросекунд. */
interface IndexEntry {
  hash: string;
  key: string;
  lastUsed: number;
}

async function readIndex(root: FileSystemDirectoryHandle): Promise<IndexEntry[]> {
  const raw = await readWhole(root, 'index.json');
  if (!raw) return [];
  try {
    return JSON.parse(new TextDecoder().decode(raw)) as IndexEntry[];
  } catch {
    return [];
  }
}

async function writeIndex(root: FileSystemDirectoryHandle, entries: IndexEntry[]): Promise<void> {
  await writeWhole(root, 'index.json', new TextEncoder().encode(JSON.stringify(entries)));
}

/** Прочитать готовое облако из кэша — null, если промах (нет записи, ключ
 *  не совпал бит в бит, или файлы повреждены/отсутствуют). */
export async function readCache(key: string): Promise<CachedCloud | null> {
  try {
    const root = await opfsRoot();
    const hash = hashKey(key);
    const dir = await root.getDirectoryHandle(hash).catch(() => null);
    if (!dir) return null;
    const metaRaw = await readWhole(dir, 'meta.bin');
    if (!metaRaw) return null;
    const meta = new Float64Array(metaRaw.buffer, metaRaw.byteOffset, META_LEN);
    // Ключ хранится отдельным текстовым файлом — сверяем ПОЛНОСТЬЮ, хэш в
    // имени папки только адресует, доверять ему как проверке нельзя.
    const storedKeyRaw = await readWhole(dir, 'key.txt');
    const storedKey = storedKeyRaw ? new TextDecoder().decode(storedKeyRaw) : '';
    if (storedKey !== key) return null;

    const [count, hasOrigin, ox, oy, oz, leafBytes, qposBytes, colorsBytes] = meta;
    const leavesRaw = await readWhole(dir, 'leaves.bin');
    const qposRaw = await readWhole(dir, 'qpos.bin');
    const colorsRaw = await readWhole(dir, 'colors.bin');
    if (!leavesRaw || !qposRaw || !colorsRaw) return null;
    if (leavesRaw.byteLength !== leafBytes || qposRaw.byteLength !== qposBytes || colorsRaw.byteLength !== colorsBytes) return null;

    const leaves = new Float64Array(leavesRaw.buffer, leavesRaw.byteOffset, leafBytes / 8);
    const qpos = new Uint16Array(qposRaw.buffer, qposRaw.byteOffset, qposBytes / 2);
    const colors = colorsRaw; // уже Uint8Array

    // «Пощупали» запись — двигаем её в конец очереди вытеснения.
    const entries = await readIndex(root);
    const e = entries.find((x) => x.hash === hash);
    if (e) {
      e.lastUsed = Date.now();
      await writeIndex(root, entries);
    }
    return { qpos, colors, leaves, count, origin: hasOrigin ? { x: ox, y: oy, z: oz } : null };
  } catch {
    // OPFS недоступен, диск полон, файл повреждён — кэш это ускорение, а не
    // обязанность: любая ошибка тут же откатывается к обычному разбору.
    return null;
  }
}

/** Сохранить готовое облако в кэш — вызывается ПОСЛЕ отправки 'done' и не
 *  должна тормозить показ: пишет уже посчитанные копии массивов. */
export async function writeCache(key: string, data: CachedCloud): Promise<void> {
  try {
    const root = await opfsRoot();
    const hash = hashKey(key);
    const dir = await root.getDirectoryHandle(hash, { create: true });
    const meta = new Float64Array(META_LEN);
    meta[0] = data.count;
    meta[1] = data.origin ? 1 : 0;
    meta[2] = data.origin?.x ?? 0;
    meta[3] = data.origin?.y ?? 0;
    meta[4] = data.origin?.z ?? 0;
    meta[5] = data.leaves.byteLength;
    meta[6] = data.qpos.byteLength;
    meta[7] = data.colors.byteLength;
    await writeWhole(dir, 'meta.bin', new Uint8Array(meta.buffer));
    await writeWhole(dir, 'key.txt', new TextEncoder().encode(key));
    await writeWhole(dir, 'leaves.bin', new Uint8Array(data.leaves.buffer, data.leaves.byteOffset, data.leaves.byteLength));
    await writeWhole(dir, 'qpos.bin', new Uint8Array(data.qpos.buffer, data.qpos.byteOffset, data.qpos.byteLength));
    await writeWhole(dir, 'colors.bin', data.colors);

    const entries = await readIndex(root);
    const kept = entries.filter((e) => e.hash !== hash);
    kept.push({ hash, key, lastUsed: Date.now() });
    kept.sort((a, b) => b.lastUsed - a.lastUsed);
    const evicted = kept.splice(CACHE_SLOTS);
    for (const e of evicted) {
      await root.removeEntry(e.hash, { recursive: true }).catch(() => {});
    }
    await writeIndex(root, kept);
  } catch {
    // Диск полон или OPFS отвалился на записи — не критично, следующий
    // импорт этого файла просто снова пройдёт полный разбор.
  }
}
