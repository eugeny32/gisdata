/**
 * cloud.worker — point-cloud reading and parsing off the main thread.
 * Receives the File object itself (structured-clonable): reading happens
 * here via File.slice, so LAS and COPC never allocate one giant buffer.
 * In:  { name, file }.
 * Out: { type:'ready' } | { type:'progress', p, phase? } |
 *      { type:'done', positions, colors, count } (transferred) |
 *      { type:'error', message }.
 */
import { buildDemoCloud, parseAsciiCloud, shuffleCloud } from './PointCloudFactory';
import { isCopc, parseCopc, parseE57, parseLasFile, parseLaz, RawCloud } from './CloudImport';

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

// Handshake: module workers evaluate asynchronously — jobs posted before
// this script finishes can be dropped. The Engine waits for 'ready'.
ctx.postMessage({ type: 'ready' });

ctx.onmessage = async (e: MessageEvent) => {
  const { name, file, demo } = e.data as { name: string; file: File; demo?: boolean };
  const progress = (p: number) => ctx.postMessage({ type: 'progress', p, phase: `Обработка точек… ${Math.round(p * 100)}%` });
  try {
    // Demo scan: generated here too, so the first frames on the main thread
    // stay smooth and an import never pays for a cloud it discards.
    if (demo) {
      const d = buildDemoCloud();
      const colors = d.geometry.getAttribute('aColor').array as Float32Array;
      shuffleCloud(d.positions, colors, d.count);
      ctx.postMessage({ type: 'done', positions: d.positions, colors, count: d.count, origin: null }, [d.positions.buffer, colors.buffer]);
      return;
    }
    const ext = (name.toLowerCase().split('.').pop() ?? '').trim();
    let r: RawCloud | null;
    if (ext === 'las') {
      r = await parseLasFile(file, progress); // streamed windows, any size
    } else if (ext === 'laz') {
      if (isCopc(await file.slice(0, 512).arrayBuffer())) {
        ctx.postMessage({ type: 'progress', p: 0, phase: 'COPC: чтение октодерева…' });
        r = await parseCopc(file, progress); // only coarse levels are fetched
      } else if (file.size > MAX_WHOLE_FILE) {
        throw new Error('LAZ слишком большой для распаковки целиком — конвертируйте в COPC или LAS');
      } else {
        r = await parseLaz(await readAll(file, 'Чтение файла…'), progress);
      }
    } else if (ext === 'e57') {
      if (file.size > MAX_WHOLE_FILE) throw new Error('E57 слишком большой — конвертируйте в LAS');
      const buf = await readAll(file, 'Чтение файла…');
      ctx.postMessage({ type: 'progress', p: 0, phase: 'Конвертация E57…' });
      r = await parseE57(buf);
    } else {
      const buf = await readAll(file, 'Чтение файла…');
      r = parseAsciiCloud(new TextDecoder().decode(buf), progress);
    }
    if (!r) throw new Error('не удалось прочитать файл (LAS/LAZ/E57 или ASCII x y z [r g b])');
    ctx.postMessage({ type: 'progress', p: 1, phase: 'Подготовка отображения…' });
    shuffleCloud(r.positions, r.colors, r.count); // per-viewport density via drawRange
    ctx.postMessage({ type: 'done', positions: r.positions, colors: r.colors, count: r.count, origin: r.origin ?? null }, [r.positions.buffer, r.colors.buffer]);
  } catch (err) {
    ctx.postMessage({ type: 'error', message: (err as Error).message });
  }
};
