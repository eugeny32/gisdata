// Одноразовый генератор PNG-иконок для manifest.json — без внешних
// библиотек (sharp/canvas недоступны в этой среде), только встроенный zlib.
// Рисует простую квадратную иконку: бренд-синий фон + белая "булавка"
// геолокации (форма соответствует теме приложения — карта/станции).
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function crc32(buf) {
  let crc = ~0;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
    }
  }
  return ~crc >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0; // filter: none
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idatData = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idatData),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function drawIcon(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const bg = [0x2f, 0x6f, 0xed]; // var(--brand)
  const cx = size / 2;
  const cy = size * 0.42;
  const pinR = size * 0.22;
  const holeR = size * 0.09;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      let r = bg[0], g = bg[1], b = bg[2], a = 255;

      // Булавка: круг сверху + треугольный "хвост" вниз, белым цветом.
      const dx = x - cx;
      const dy = y - cy;
      const distToCircle = Math.sqrt(dx * dx + dy * dy);
      const inCircle = distToCircle <= pinR;

      const tailTopY = cy + pinR * 0.55;
      const tailBottomY = size * 0.78;
      const tailHalfWidthAtY = (yy) => {
        const t = (yy - tailTopY) / (tailBottomY - tailTopY);
        return Math.max(0, pinR * 0.85 * (1 - t));
      };
      const inTail = y >= tailTopY && y <= tailBottomY && Math.abs(dx) <= tailHalfWidthAtY(y);

      const distToHole = Math.sqrt(dx * dx + dy * dy);
      const inHole = distToHole <= holeR;

      if ((inCircle || inTail) && !inHole) {
        r = 255; g = 255; b = 255;
      }

      rgba[i] = r;
      rgba[i + 1] = g;
      rgba[i + 2] = b;
      rgba[i + 3] = a;
    }
  }
  return rgba;
}

const outDir = path.join(__dirname, '..', 'assets');
for (const size of [192, 512]) {
  const png = encodePng(size, size, drawIcon(size));
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), png);
  console.log(`assets/icon-${size}.png written (${png.length} bytes)`);
}
