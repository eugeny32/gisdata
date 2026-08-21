/**
 * Постоянный кэш расшифрованных узлов COPC в IndexedDB — переживает
 * закрытие браузера/перезагрузку страницы. По запросу пользователя: при
 * повторном открытии того же тура узлы, которые уже видели раньше, должны
 * подгружаться из кэша устройства, а не заново по сети + распаковка LAZ.
 *
 * Кэшируется РЕЗУЛЬТАТ распаковки (готовые Float32Array/Uint8Array), а не
 * сырые байты файла — так на повторном просмотре экономится не только
 * сеть, но и CPU-время на decode (см. copcWorker.ts, узнаваемо дорогая
 * операция на больших узлах).
 *
 * Ключ записи — [url, nodeKey], где url — абсолютный URL .copc.laz файла
 * (разные туры/файлы не пересекаются в одном хранилище).
 */

const DB_NAME = 'gisdata-copc-cache';
const STORE_NAME = 'nodes';
const DB_VERSION = 1;
/** Простой потолок по количеству узлов (не по точным байтам — дешевле в
 * IndexedDB через store.count()) — при превышении вытесняем самые давно
 * не запрошенные записи (см. lastAccess). Узлы COPC обычно сопоставимого
 * размера (см. -C/--lod-chunk-count у splat-transform — аналогичная идея
 * для другого формата), так что счёт записей — разумная прокси для объёма. */
const MAX_CACHED_NODES = 8000;
const PRUNE_BATCH = 500;

export interface CachedNodeData {
  positions: Float32Array;
  colors: Uint8Array;
  intensityClass: Float32Array;
  pointCount: number;
  hasColor: boolean;
}

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }
    let req: IDBOpenDBRequest;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: ['url', 'key'] });
        store.createIndex('lastAccess', 'lastAccess');
      }
    };
    req.onsuccess = () => resolve(req.result);
    // Приватный режим браузера и т.п. — кэш просто не работает, не критично
    // (copcLoader.ts падает обратно на загрузку по сети при null).
    req.onerror = () => resolve(null);
  });
  return dbPromise;
}

export async function getCachedNode(url: string, key: string): Promise<CachedNodeData | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get([url, key]);
      req.onsuccess = () => {
        const row = req.result;
        if (!row) {
          resolve(null);
          return;
        }
        // Обновляем lastAccess не дожидаясь отдельной транзакции — та же tx.
        store.put({ ...row, lastAccess: Date.now() });
        resolve({
          positions: row.positions,
          colors: row.colors,
          intensityClass: row.intensityClass,
          pointCount: row.pointCount,
          hasColor: row.hasColor,
        });
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

let putCount = 0;

export async function putCachedNode(url: string, key: string, data: CachedNodeData): Promise<void> {
  const db = await openDb();
  if (!db) return;
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ url, key, ...data, lastAccess: Date.now() });
  } catch {
    return;
  }
  // Не на каждую запись — store.count() и чистка не бесплатны, достаточно
  // проверять периодически.
  putCount++;
  if (putCount % 200 === 0) {
    void pruneIfNeeded(db);
  }
}

async function pruneIfNeeded(db: IDBDatabase): Promise<void> {
  try {
    const count = await new Promise<number>((resolve) => {
      const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(0);
    });
    if (count <= MAX_CACHED_NODES) return;
    const toDelete = Math.min(PRUNE_BATCH, count - MAX_CACHED_NODES);
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const index = tx.objectStore(STORE_NAME).index('lastAccess');
    let deleted = 0;
    const cursorReq = index.openCursor();
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (!cursor || deleted >= toDelete) return;
      cursor.delete();
      deleted++;
      cursor.continue();
    };
  } catch {
    /* noop — чистка кэша не критична для работы вьювера */
  }
}
