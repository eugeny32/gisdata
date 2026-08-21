// Минимальный самодостаточный LAS 1.4 читатель/писатель — НЕ общего
// назначения (в отличие от laspy в Python-версии): поддерживает ТОЛЬКО
// point data record format 6 и 7 (без доп. байт), потому что это
// единственные форматы, которые собственный пайплайн когда-либо
// производит/читает (decodeRaw пишет 6, colorize читает 6 → пишет 7,
// georeference/ppkCorrection читают и переписывают тот же формат, что
// пришёл на входе). Общий LAZ (сжатие) не поддерживается — сжатие всегда
// делается отдельным вызовом pdal.exe (тот же приём, что уже проверен для
// COPC-конвертации в этой сессии).
//
// Формат/офсеты — ASPRS LAS 1.4 spec (заголовок фиксированный 375 байт для
// версии 1.4, без VLR со своей CRS — координатная система, если нужна,
// прикладывается отдельным вызовом `pdal translate --add-dimension`/
// `pdal translate` с указанием `--writers.las.a_srs`, а не собственным VLR
// — проще и надёжнее, чем вручную собирать WKT VLR).

import { openSync, closeSync, readSync, writeSync, fstatSync, ftruncateSync } from "node:fs";

const HEADER_SIZE = 375;
const POINT_SIZE = { 6: 30, 7: 36 };

function writeHeader(fd, opts) {
  const { pointFormat, scale, offset, count, mins, maxs } = opts;
  const buf = Buffer.alloc(HEADER_SIZE);
  buf.write("LASF", 0, "ascii");
  buf.writeUInt16LE(0, 4); // file source ID
  buf.writeUInt16LE(1, 6); // global encoding: bit0 = standard GPS time
  // GUID (16 bytes) left zero
  buf.writeUInt8(1, 24); // version major
  buf.writeUInt8(4, 25); // version minor
  buf.write("OTHER", 26, "ascii");
  buf.write("gisdata-slam", 58, "ascii");
  buf.writeUInt16LE(0, 90); // creation day of year
  buf.writeUInt16LE(0, 92); // creation year
  buf.writeUInt16LE(HEADER_SIZE, 94);
  buf.writeUInt32LE(HEADER_SIZE, 96); // offset to point data (no VLRs)
  buf.writeUInt32LE(0, 100); // number of VLRs
  buf.writeUInt8(pointFormat, 104);
  buf.writeUInt16LE(POINT_SIZE[pointFormat], 105);
  buf.writeUInt32LE(count <= 0xffffffff ? count : 0, 107); // legacy count
  for (let i = 0; i < 5; i++) buf.writeUInt32LE(0, 111 + i * 4); // legacy points by return
  buf.writeDoubleLE(scale[0], 131);
  buf.writeDoubleLE(scale[1], 139);
  buf.writeDoubleLE(scale[2], 147);
  buf.writeDoubleLE(offset[0], 155);
  buf.writeDoubleLE(offset[1], 163);
  buf.writeDoubleLE(offset[2], 171);
  buf.writeDoubleLE(maxs[0], 179);
  buf.writeDoubleLE(mins[0], 187);
  buf.writeDoubleLE(maxs[1], 195);
  buf.writeDoubleLE(mins[1], 203);
  buf.writeDoubleLE(maxs[2], 211);
  buf.writeDoubleLE(mins[2], 219);
  // waveform/extended-VLR pointers (u64) — write as two u32 (Node has no
  // writeBigUInt64LE issues here, but plain 0 is simplest and correct).
  buf.writeBigUInt64LE(0n, 227);
  buf.writeBigUInt64LE(0n, 235);
  buf.writeUInt32LE(0, 243);
  buf.writeBigUInt64LE(BigInt(count), 247);
  for (let i = 0; i < 15; i++) buf.writeBigUInt64LE(0n, 255 + i * 8);
  writeSync(fd, buf, 0, HEADER_SIZE, 0);
}

/**
 * @param {string} path
 * @param {object} opts
 * @param {6|7} opts.pointFormat
 * @param {Float64Array} opts.x
 * @param {Float64Array} opts.y
 * @param {Float64Array} opts.z
 * @param {Float64Array} [opts.gpsTime]
 * @param {Uint16Array|Float64Array} [opts.intensity]
 * @param {Uint8Array} [opts.red] 8-bit per channel (scaled to 16-bit on write)
 * @param {Uint8Array} [opts.green]
 * @param {Uint8Array} [opts.blue]
 * @param {[number,number,number]} [opts.scale]
 */
export function writeLas(path, opts) {
  const { pointFormat, x, y, z } = opts;
  const n = x.length;
  if (![6, 7].includes(pointFormat)) throw new Error(`Unsupported point format ${pointFormat} (only 6/7)`);
  if (pointFormat === 7 && (!opts.red || !opts.green || !opts.blue)) {
    throw new Error("point format 7 requires red/green/blue");
  }

  let xMin = Infinity, yMin = Infinity, zMin = Infinity;
  let xMax = -Infinity, yMax = -Infinity, zMax = -Infinity;
  for (let i = 0; i < n; i++) {
    if (x[i] < xMin) xMin = x[i]; if (x[i] > xMax) xMax = x[i];
    if (y[i] < yMin) yMin = y[i]; if (y[i] > yMax) yMax = y[i];
    if (z[i] < zMin) zMin = z[i]; if (z[i] > zMax) zMax = z[i];
  }
  if (n === 0) { xMin = yMin = zMin = xMax = yMax = zMax = 0; }

  const scale = opts.scale || [0.001, 0.001, 0.001];
  const offset = [xMin, yMin, zMin];
  const pointSize = POINT_SIZE[pointFormat];

  const fd = openSync(path, "w");
  try {
    writeHeader(fd, { pointFormat, scale, offset, count: n, mins: [xMin, yMin, zMin], maxs: [xMax, yMax, zMax] });

    const CHUNK = 500_000;
    const buf = Buffer.alloc(pointSize * Math.min(CHUNK, Math.max(n, 1)));
    let filePos = HEADER_SIZE;
    for (let start = 0; start < n; start += CHUNK) {
      const end = Math.min(start + CHUNK, n);
      const cn = end - start;
      for (let i = 0; i < cn; i++) {
        const gi = start + i;
        const base = i * pointSize;
        buf.writeInt32LE(Math.round((x[gi] - offset[0]) / scale[0]), base);
        buf.writeInt32LE(Math.round((y[gi] - offset[1]) / scale[1]), base + 4);
        buf.writeInt32LE(Math.round((z[gi] - offset[2]) / scale[2]), base + 8);
        const intensity = opts.intensity ? Math.max(0, Math.min(65535, Math.round(opts.intensity[gi]))) : 0;
        buf.writeUInt16LE(intensity, base + 12);
        buf.writeUInt8(1, base + 14); // return number=1, number of returns=1 (packed: (1)|(1<<4))
        buf.writeUInt8(0, base + 15); // classification flags/channel/direction/edge
        buf.writeUInt8(0, base + 16); // classification
        buf.writeUInt8(0, base + 17); // user data
        buf.writeInt16LE(0, base + 18); // scan angle
        buf.writeUInt16LE(0, base + 20); // point source ID
        buf.writeDoubleLE(opts.gpsTime ? opts.gpsTime[gi] : 0, base + 22);
        if (pointFormat === 7) {
          buf.writeUInt16LE(opts.red[gi] * 257, base + 30);
          buf.writeUInt16LE(opts.green[gi] * 257, base + 32);
          buf.writeUInt16LE(opts.blue[gi] * 257, base + 34);
        }
      }
      writeSync(fd, buf, 0, cn * pointSize, filePos);
      filePos += cn * pointSize;
    }
    ftruncateSync(fd, filePos);
  } finally {
    closeSync(fd);
  }
}

/**
 * Reads an entire LAS (format 6/7) into memory as typed arrays. For files
 * produced by this pipeline's own steps only (see module docstring) —
 * arbitrary third-party LAS files with extra bytes/other formats are out of
 * scope.
 */
export function readLas(path) {
  const fd = openSync(path, "r");
  try {
    const header = Buffer.alloc(HEADER_SIZE);
    readSync(fd, header, 0, HEADER_SIZE, 0);
    if (header.toString("ascii", 0, 4) !== "LASF") throw new Error(`Not a LAS file: ${path}`);
    const pointFormat = header.readUInt8(104) & 0x7f; // top bit = "has WKT" flag in 1.4, ignore
    if (![6, 7].includes(pointFormat)) throw new Error(`Unsupported point format ${pointFormat} in ${path}`);
    const pointDataOffset = header.readUInt32LE(96);
    const pointSize = header.readUInt16LE(105);
    const scale = [header.readDoubleLE(131), header.readDoubleLE(139), header.readDoubleLE(147)];
    const offset = [header.readDoubleLE(155), header.readDoubleLE(163), header.readDoubleLE(171)];
    let count = Number(header.readBigUInt64LE(247));
    if (count === 0) count = header.readUInt32LE(107); // fall back to legacy count

    const x = new Float64Array(count);
    const y = new Float64Array(count);
    const z = new Float64Array(count);
    const intensity = new Float64Array(count);
    const gpsTime = new Float64Array(count);
    const red = pointFormat === 7 ? new Uint8Array(count) : null;
    const green = pointFormat === 7 ? new Uint8Array(count) : null;
    const blue = pointFormat === 7 ? new Uint8Array(count) : null;

    const CHUNK = 500_000;
    const buf = Buffer.alloc(pointSize * Math.min(CHUNK, Math.max(count, 1)));
    let filePos = pointDataOffset;
    for (let start = 0; start < count; start += CHUNK) {
      const end = Math.min(start + CHUNK, count);
      const cn = end - start;
      readSync(fd, buf, 0, cn * pointSize, filePos);
      filePos += cn * pointSize;
      for (let i = 0; i < cn; i++) {
        const gi = start + i;
        const base = i * pointSize;
        x[gi] = buf.readInt32LE(base) * scale[0] + offset[0];
        y[gi] = buf.readInt32LE(base + 4) * scale[1] + offset[1];
        z[gi] = buf.readInt32LE(base + 8) * scale[2] + offset[2];
        intensity[gi] = buf.readUInt16LE(base + 12);
        gpsTime[gi] = buf.readDoubleLE(base + 22);
        if (pointFormat === 7) {
          red[gi] = Math.round(buf.readUInt16LE(base + 30) / 257);
          green[gi] = Math.round(buf.readUInt16LE(base + 32) / 257);
          blue[gi] = Math.round(buf.readUInt16LE(base + 34) / 257);
        }
      }
    }
    return { pointFormat, count, scale, offset, x, y, z, intensity, gpsTime, red, green, blue };
  } finally {
    closeSync(fd);
  }
}
