/**
 * Постоянный кэш файлов 3DGS-сплатов (.ply/.sog/.splat/.ksplat) на
 * устройстве — тот же принцип, что и у copcCache.ts для LAS/COPC (см.
 * memory "unify-viewer-ux": фичи вьювера переносятся на оба типа моделей),
 * но другой механизм хранения: сплат грузится ОДНИМ файлом целиком (нет
 * октодерева/узлов, как у COPC), поэтому здесь достаточно браузерного
 * Cache Storage API (целиком Response на ключ-URL), а не IndexedDB с
 * частичными записями.
 */

const CACHE_NAME = 'gisdata-splat-cache-v1';

/**
 * Отдаёт URL, который можно передать в pc.Asset: либо blob:-URL уже
 * закэшированного файла (мгновенно, без сети), либо результат обычной
 * загрузки по сети — с прогрессом через onProgress и попутной записью в
 * кэш на будущее. При любой ошибке (приватный режим браузера, нет Cache
 * API и т.п.) — просто возвращает исходный url, чтобы pc.Asset загрузил
 * его как раньше, без кэша.
 */
export async function resolveSplatUrl(
  url: string,
  onProgress: (received: number, total: number) => void
): Promise<string> {
  if (typeof caches === 'undefined' || typeof fetch === 'undefined') return url;
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(url);
    if (cached) {
      const blob = await cached.blob();
      onProgress(blob.size, blob.size);
      return URL.createObjectURL(blob);
    }

    const response = await fetch(url);
    if (!response.ok || !response.body) return url;
    const total = Number(response.headers.get('content-length')) || 0;
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      onProgress(received, total || received);
    }
    const blob = new Blob(chunks as BlobPart[]);
    // Кэш пишем тем же содержимым, что уже скачали — отдельный повторный
    // fetch ради cache.put не нужен.
    await cache.put(url, new Response(blob)).catch(() => {});
    return URL.createObjectURL(blob);
  } catch {
    return url;
  }
}
