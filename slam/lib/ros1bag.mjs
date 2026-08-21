// Читатель контейнера ROS1 bag (формат открыт и стабилен:
// http://wiki.ros.org/Bags/Format/2.0). Это НЕ порт какого-то конкретного
// куска slamcloude/s20.py — там контейнер читался через python-пакет
// `rosbags`, Node-эквивалента которому нет, поэтому здесь свой ридер по
// спецификации (см. план миграции, Фаза 2 — единственный по-настоящему
// новый код, а не механический перенос).
//
// Каждая запись (record): [header_len u32][header][data_len u32][data].
// header — последовательность полей [field_len u32]["name=value" bytes],
// значение может быть произвольными байтами (не только строкой).
//
// Записи верхнего уровня: BAG_HEADER (0x03, один раз, пропускаем), CHUNK
// (0x05, содержит вложенные CONNECTION+MESSAGE_DATA записи, возможно
// сжатые), CONNECTION (0x07, вне чанка — тоже валидно), MESSAGE_DATA
// (0x02, на практике только внутри чанков), INDEX_DATA (0x04)/CHUNK_INFO
// (0x06) — служебный индекс в конце файла, не нужен для последовательного
// чтения "от начала до конца", пропускаем.

import { openSync, closeSync, readSync, fstatSync } from "node:fs";
import { createRequire } from "node:module";

// seek-bzip is CommonJS; createRequire lets an .mjs module load it
// synchronously (needed since decompressChunk runs inside a plain, non-async
// generator — see readMessages below).
const require = createRequire(import.meta.url);

const OP_BAG_HEADER = 0x03;
const OP_MESSAGE_DATA = 0x02;
const OP_CHUNK = 0x05;
const OP_CONNECTION = 0x07;

const VERSION_LINE_LEN = "#ROSBAG V2.0\n".length; // 13 bytes, fixed by spec

function parseHeaderFields(buf) {
  const fields = new Map();
  let off = 0;
  while (off < buf.length) {
    const flen = buf.readUInt32LE(off);
    off += 4;
    const field = buf.subarray(off, off + flen);
    off += flen;
    const eq = field.indexOf(0x3d); // '='
    if (eq < 0) continue;
    fields.set(field.subarray(0, eq).toString("ascii"), field.subarray(eq + 1));
  }
  return fields;
}

function opOf(header) {
  const raw = header.get("op");
  return raw && raw.length ? raw[0] : -1;
}

function decompressChunk(data, compression, uncompressedSize) {
  if (compression === "none") return data;
  if (compression === "bz2") {
    // seek-bzip: pure-JS bz2 decoder, no native build step (see
    // slam/package.json) — chosen because ROS1 bags most commonly use bz2
    // (rosbag record's default --compression flag), lz4 is much rarer.
    let bz2;
    try {
      bz2 = require("seek-bzip");
    } catch {
      throw new Error(
        "Bag-чанк сжат bz2, но пакет 'seek-bzip' не установлен (npm install в slam/)"
      );
    }
    return Buffer.from(bz2.decode(data));
  }
  throw new Error(
    `Сжатие чанка '${compression}' не поддержано (реализованы только 'none' и 'bz2') — ` +
      "см. slam/lib/ros1bag.mjs"
  );
}

/** Reads one [header_len][header][data_len][data] record from an in-memory buffer at `offset`. */
function readRecordFromBuffer(buf, offset) {
  if (offset >= buf.length) return null;
  const headerLen = buf.readUInt32LE(offset);
  offset += 4;
  const header = parseHeaderFields(buf.subarray(offset, offset + headerLen));
  offset += headerLen;
  const dataLen = buf.readUInt32LE(offset);
  offset += 4;
  const data = buf.subarray(offset, offset + dataLen);
  offset += dataLen;
  return { header, data, nextOffset: offset };
}

/**
 * Streams (topic, connId, timeSec, data) for every MESSAGE_DATA record in
 * the bag whose topic is in `topics` (or all topics if `topics` is null).
 * Reads the top-level file via a file descriptor (bounded memory — only
 * one chunk's bytes are ever materialised at a time), unlike loading the
 * whole (potentially many-GB) bag into a single Buffer.
 */
export function* readMessages(bagPath, topics = null) {
  const wantAll = topics === null;
  const wantSet = wantAll ? null : new Set(topics);

  const fd = openSync(bagPath, "r");
  try {
    const size = fstatSync(fd).size;
    let pos = VERSION_LINE_LEN; // skip "#ROSBAG V2.0\n"
    const connections = new Map(); // connId -> topic

    const u32 = Buffer.alloc(4);
    function readU32() {
      readSync(fd, u32, 0, 4, pos);
      pos += 4;
      return u32.readUInt32LE(0);
    }
    function readBuf(len) {
      const b = Buffer.alloc(len);
      let got = 0;
      while (got < len) {
        got += readSync(fd, b, got, len - got, pos + got);
      }
      pos += len;
      return b;
    }

    while (pos < size) {
      const headerLen = readU32();
      const header = parseHeaderFields(readBuf(headerLen));
      const dataLen = readU32();
      const op = opOf(header);

      if (op === OP_CONNECTION) {
        const data = readBuf(dataLen);
        const connIdBuf = header.get("conn");
        const connId = connIdBuf ? connIdBuf.readUInt32LE(0) : -1;
        const topicBuf = header.get("topic");
        const topic = topicBuf ? topicBuf.toString("utf8") : null;
        void data; // full connection header (type/md5sum) not needed downstream
        if (topic !== null) connections.set(connId, topic);
        continue;
      }

      if (op === OP_CHUNK) {
        const compBuf = header.get("compression");
        const compression = compBuf ? compBuf.toString("ascii") : "none";
        const sizeBuf = header.get("size");
        const uncompressedSize = sizeBuf ? sizeBuf.readUInt32LE(0) : 0;
        const raw = readBuf(dataLen);
        const chunk = decompressChunk(raw, compression, uncompressedSize);

        let off = 0;
        while (off < chunk.length) {
          const rec = readRecordFromBuffer(chunk, off);
          if (rec === null) break;
          off = rec.nextOffset;
          const subOp = opOf(rec.header);
          if (subOp === OP_CONNECTION) {
            const connIdBuf = rec.header.get("conn");
            const connId = connIdBuf ? connIdBuf.readUInt32LE(0) : -1;
            const topicBuf = rec.header.get("topic");
            const topic = topicBuf ? topicBuf.toString("utf8") : null;
            if (topic !== null) connections.set(connId, topic);
          } else if (subOp === OP_MESSAGE_DATA) {
            const connIdBuf = rec.header.get("conn");
            const connId = connIdBuf ? connIdBuf.readUInt32LE(0) : -1;
            const topic = connections.get(connId);
            if (topic === undefined) continue;
            if (!wantAll && !wantSet.has(topic)) continue;
            const timeBuf = rec.header.get("time");
            const sec = timeBuf ? timeBuf.readUInt32LE(0) : 0;
            const nsec = timeBuf ? timeBuf.readUInt32LE(4) : 0;
            yield { topic, connId, timeSec: sec + nsec / 1e9, data: rec.data };
          }
          // INDEX_DATA/CHUNK_INFO/unknown inside a chunk (shouldn't occur, but
          // ignored defensively) fall through here without special handling.
        }
        continue;
      }

      // BAG_HEADER / INDEX_DATA / CHUNK_INFO / unknown — not needed for a
      // sequential scan, just skip past the data section.
      if (dataLen > 0) pos += dataLen;
      if (op === OP_BAG_HEADER) {
        // no-op: index_pos/conn_count/chunk_count aren't needed for a full
        // linear scan.
      }
    }
  } finally {
    closeSync(fd);
  }
}
