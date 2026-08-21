/**
 * CloudImport — binary point-cloud readers.
 *  - LAS: native DataView parser (formats 0–8, RGB when present);
 *  - LAZ: laz-perf WASM decompressor + the same record parser;
 *  - E57: web-e57 WASM converter → ASCII XYZ → shared text parser.
 * All paths convert surveying Z-up → Y-up, re-center near the origin and
 * subsample to MAX_POINTS to protect the 60 FPS budget.
 */
import { createLazPerf } from 'laz-perf';
import lazWasmUrl from 'laz-perf/lib/laz-perf.wasm?url';
import { centerCloud, parseAsciiCloud } from './PointCloudFactory';

export interface RawCloud {
  positions: Float32Array;
  colors: Float32Array;
  count: number;
  /** Everything subtracted on the way in, expressed in the SOURCE (survey)
   *  axes. Add it to a world point to recover the scan's own coordinates —
   *  this is what makes exporting back into МСК possible. */
  origin?: { x: number; y: number; z: number };
}

const MAX_POINTS = 4_000_000;

interface LasHeader {
  offset: number;
  min: [number, number, number];
  format: number;
  recLen: number;
  count: number;
  scale: [number, number, number];
  off: [number, number, number];
  rgbAt: number;
}

function readLasHeader(buf: ArrayBuffer): LasHeader {
  const v = new DataView(buf);
  const sig = String.fromCharCode(v.getUint8(0), v.getUint8(1), v.getUint8(2), v.getUint8(3));
  if (sig !== 'LASF') throw new Error('это не LAS/LAZ файл');
  const offset = v.getUint32(96, true);
  const format = v.getUint8(104) & 0x3f; // bit 7 marks LAZ compression
  const recLen = v.getUint16(105, true);
  let count = v.getUint32(107, true);
  if (!count && v.getUint8(25) >= 4) count = Number(v.getBigUint64(247, true)); // LAS 1.4
  const scale: [number, number, number] = [v.getFloat64(131, true), v.getFloat64(139, true), v.getFloat64(147, true)];
  // Header min: used as the double origin so float32 never sees 7.4e6.
  const min: [number, number, number] = [v.getFloat64(187, true), v.getFloat64(203, true), v.getFloat64(219, true)];
  const off: [number, number, number] = [v.getFloat64(155, true), v.getFloat64(163, true), v.getFloat64(171, true)];
  const rgbAt = format === 2 ? 20 : format === 3 || format === 5 ? 28 : format === 7 || format === 8 ? 30 : -1;
  return { offset, format, recLen, count, scale, off, rgbAt, min };
}

/** Decode one LAS point record at `base` into slot `w` (Z-up → Y-up). */
function recordToPoint(v: DataView, base: number, h: LasHeader, pos: Float32Array, col: Float32Array, w: number): void {
  // Origin removed in double BEFORE the float32 store — see LasHeader.min.
  const x = v.getInt32(base, true) * h.scale[0] + h.off[0] - h.min[0];
  const y = v.getInt32(base + 4, true) * h.scale[1] + h.off[1] - h.min[1];
  const z = v.getInt32(base + 8, true) * h.scale[2] + h.off[2] - h.min[2];
  pos[w * 3] = x;
  pos[w * 3 + 1] = z;
  pos[w * 3 + 2] = -y;
  if (h.rgbAt >= 0) {
    let r = v.getUint16(base + h.rgbAt, true);
    let g = v.getUint16(base + h.rgbAt + 2, true);
    let b = v.getUint16(base + h.rgbAt + 4, true);
    const s = r > 255 || g > 255 || b > 255 ? 65535 : 255;
    col[w * 3] = r / s;
    col[w * 3 + 1] = g / s;
    col[w * 3 + 2] = b / s;
  } else {
    col[w * 3] = 0.7;
    col[w * 3 + 1] = 0.68;
    col[w * 3 + 2] = 0.65;
  }
}

export type ProgressCb = (frac: number) => void;

export function parseLas(buf: ArrayBuffer, onProgress?: ProgressCb): RawCloud {
  const h = readLasHeader(buf);
  if (!h.count) throw new Error('пустой LAS');
  const stride = Math.max(1, Math.ceil(h.count / MAX_POINTS));
  const n = Math.ceil(h.count / stride);
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const v = new DataView(buf);
  let w = 0;
  for (let i = 0; i < h.count && w < n; i += stride) {
    recordToPoint(v, h.offset + i * h.recLen, h, pos, col, w);
    if ((w & 0xffff) === 0 && onProgress) onProgress(i / h.count);
    w++;
  }
  const positions = pos.subarray(0, w * 3);
  const shift = centerCloud(positions);
  // Origin in THREE axes. Import did (X−minX, Z−minZ, −(Y−minY)) and then
  // centred, so the z term carries the sign flip.
  return { positions, colors: col.subarray(0, w * 3), count: w, origin: { x: h.min[0] + shift.cx, y: h.min[2] + shift.cy, z: shift.cz - h.min[1] } };
}

export async function parseLaz(buf: ArrayBuffer, onProgress?: ProgressCb): Promise<RawCloud> {
  const h = readLasHeader(buf);
  const lp = await createLazPerf({ locateFile: () => lazWasmUrl });
  const laszip = new lp.LASZip();
  const filePtr = lp._malloc(buf.byteLength);
  lp.HEAPU8.set(new Uint8Array(buf), filePtr);
  try {
    laszip.open(filePtr, buf.byteLength);
    const count = laszip.getCount();
    const recLen = laszip.getPointLength();
    h.recLen = recLen;
    const stride = Math.max(1, Math.ceil(count / MAX_POINTS));
    const n = Math.ceil(count / stride);
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const ptPtr = lp._malloc(recLen);
    // Stable view into WASM memory (no allocations in the loop).
    const rec = new Uint8Array(lp.HEAPU8.buffer, ptPtr, recLen);
    const dv = new DataView(lp.HEAPU8.buffer, ptPtr, recLen);
    void rec;
    let w = 0;
    for (let i = 0; i < count; i++) {
      laszip.getPoint(ptPtr); // must decode sequentially
      if ((i & 0x3ffff) === 0 && onProgress) onProgress(i / count);
      if (i % stride !== 0 || w >= n) continue;
      recordToPoint(dv, 0, h, pos, col, w);
      w++;
    }
    lp._free(ptPtr);
    const positions = pos.subarray(0, w * 3);
    const shift = centerCloud(positions);
    return { positions, colors: col.subarray(0, w * 3), count: w, origin: { x: h.min[0] + shift.cx, y: h.min[2] + shift.cy, z: shift.cz - h.min[1] } };
  } finally {
    laszip.delete();
    lp._free(filePtr);
  }
}

/** Streamed LAS: reads the file in 32 MB windows via File.slice, so even
 *  multi-GB files never materialize as one ArrayBuffer. */
export async function parseLasFile(file: File, onProgress?: ProgressCb): Promise<RawCloud> {
  const h = readLasHeader(await file.slice(0, 512).arrayBuffer());
  if (!h.count) throw new Error('пустой LAS');
  const stride = Math.max(1, Math.ceil(h.count / MAX_POINTS));
  const n = Math.ceil(h.count / stride);
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const WINDOW = Math.max(1, Math.floor((32 << 20) / h.recLen)); // records per window
  let w = 0;
  let k = 0; // absolute record index (keeps the stride phase across windows)
  while (k < h.count && w < n) {
    const k0 = k;
    const last = Math.min(h.count - 1, k0 + WINDOW - 1);
    const dv = new DataView(await file.slice(h.offset + k0 * h.recLen, h.offset + (last + 1) * h.recLen).arrayBuffer());
    while (k <= last && w < n) {
      recordToPoint(dv, (k - k0) * h.recLen, h, pos, col, w);
      w++;
      k += stride;
    }
    if (onProgress) onProgress(Math.min(1, k / h.count));
  }
  const positions = pos.subarray(0, w * 3);
  const shift = centerCloud(positions);
  // Origin in THREE axes. Import did (X−minX, Z−minZ, −(Y−minY)) and then
  // centred, so the z term carries the sign flip.
  return { positions, colors: col.subarray(0, w * 3), count: w, origin: { x: h.min[0] + shift.cx, y: h.min[2] + shift.cy, z: shift.cz - h.min[1] } };
}

/** COPC probe: LAZ whose first VLR (required at byte 375) is `copc` info. */
export function isCopc(head: ArrayBuffer): boolean {
  if (head.byteLength < 375 + 54) return false;
  const v = new DataView(head);
  if (String.fromCharCode(v.getUint8(0), v.getUint8(1), v.getUint8(2), v.getUint8(3)) !== 'LASF') return false;
  let user = '';
  for (let i = 0; i < 16; i++) {
    const c = v.getUint8(375 + 2 + i);
    if (c) user += String.fromCharCode(c);
  }
  return user === 'copc' && v.getUint16(375 + 18, true) === 1;
}

/**
 * COPC: read ONLY the coarse octree levels up to the point budget — a 3 GB
 * cloud opens in seconds because deep chunks are never fetched or decoded.
 */
export async function parseCopc(file: File, onProgress?: ProgressCb): Promise<RawCloud> {
  const headBuf = await file.slice(0, 375 + 54 + 160).arrayBuffer();
  const h = readLasHeader(headBuf);
  const v = new DataView(headBuf);
  const info = 375 + 54; // copc info VLR payload
  const rootOff = Number(v.getBigUint64(info + 40, true));
  const rootSize = Number(v.getBigUint64(info + 48, true));

  interface Node {
    level: number;
    offset: number;
    size: number;
    count: number;
  }
  const nodes: Node[] = [];
  const readPage = async (off: number, size: number): Promise<void> => {
    const dv = new DataView(await file.slice(off, off + size).arrayBuffer());
    for (let p = 0; p + 32 <= size; p += 32) {
      const level = dv.getInt32(p, true);
      const offset = Number(dv.getBigUint64(p + 16, true));
      const byteSize = dv.getInt32(p + 24, true);
      const count = dv.getInt32(p + 28, true);
      if (count === -1) await readPage(offset, byteSize); // child hierarchy page
      else if (count > 0) nodes.push({ level, offset, size: byteSize, count });
    }
  };
  await readPage(rootOff, rootSize);
  nodes.sort((a, b) => a.level - b.level);

  const chosen: Node[] = [];
  let budget = 0;
  for (const nd of nodes) {
    if (budget >= MAX_POINTS) break;
    chosen.push(nd);
    budget += nd.count;
  }
  const total = budget;
  const pos = new Float32Array(total * 3);
  const col = new Float32Array(total * 3);

  const lp = await createLazPerf({ locateFile: () => lazWasmUrl });
  const ptPtr = lp._malloc(h.recLen);
  let w = 0;
  let done = 0;
  for (const nd of chosen) {
    const chunk = new Uint8Array(await file.slice(nd.offset, nd.offset + nd.size).arrayBuffer());
    const cPtr = lp._malloc(chunk.byteLength);
    lp.HEAPU8.set(chunk, cPtr);
    const dec = new lp.ChunkDecoder();
    try {
      dec.open(h.format, h.recLen, cPtr);
      // WASM heap may grow on open — refresh the record view afterwards.
      const dv = new DataView(lp.HEAPU8.buffer, ptPtr, h.recLen);
      for (let i = 0; i < nd.count; i++) {
        dec.getPoint(ptPtr);
        recordToPoint(dv, 0, h, pos, col, w);
        w++;
      }
    } finally {
      dec.delete();
      lp._free(cPtr);
    }
    done += nd.count;
    if (onProgress) onProgress(done / total);
  }
  lp._free(ptPtr);

  const positions = pos.subarray(0, w * 3);
  const shift = centerCloud(positions);
  // Origin in THREE axes. Import did (X−minX, Z−minZ, −(Y−minY)) and then
  // centred, so the z term carries the sign flip.
  return { positions, colors: col.subarray(0, w * 3), count: w, origin: { x: h.min[0] + shift.cx, y: h.min[2] + shift.cy, z: shift.cz - h.min[1] } };
}

export async function parseE57(buf: ArrayBuffer): Promise<RawCloud | null> {
  const { convertE57 } = await import('web-e57');
  const xyz = convertE57(new Uint8Array(buf), 'xyz');
  return parseAsciiCloud(xyz);
}
