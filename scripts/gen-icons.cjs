// Generates PWA icons as PNG files into public/ (pure Node, no deps).
// Design matches the favicon: dark rounded square + accent circles.
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function png(size, pixels) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter none
    for (let x = 0; x < size; x++) {
      const i = y * (size * 4 + 1) + 1 + x * 4;
      const px = pixels(x, y);
      raw[i] = px[0];
      raw[i + 1] = px[1];
      raw[i + 2] = px[2];
      raw[i + 3] = px[3];
    }
  }
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function roundedRectPixels(size) {
  const bg = [17, 16, 25, 255]; // #111019
  const accent = [139, 123, 255, 255]; // #8b7bff
  const radius = size * 0.22;
  const cx = (x) => x - size / 2;
  const inRound = (x, y, rx, ry, r) => {
    const dx = Math.max(Math.abs(cx(x)) - (rx - r), 0);
    const dy = Math.max(Math.abs(cx(y)) - (ry - r), 0);
    return dx * dx + dy * dy <= r * r;
  };
  const dot = (x, y, px, py, r) => (x - px) * (x - px) + (y - py) * (y - py) <= r * r;
  return (x, y) => {
    const rr = size * 0.22;
    const rx = size / 2;
    if (!inRound(x, y, rx, rx, rr)) return [0, 0, 0, 0];
    const r1 = size * 0.14;
    const r2 = size * 0.09;
    if (dot(x, y, size * 0.32, size * 0.32, r1)) return accent;
    if (dot(x, y, size * 0.68, size * 0.68, r1)) return [accent[0], accent[1], accent[2], 190];
    if (dot(x, y, size * 0.68, size * 0.32, r2)) return [accent[0], accent[1], accent[2], 128];
    if (dot(x, y, size * 0.32, size * 0.68, r2)) return [accent[0], accent[1], accent[2], 128];
    return bg;
  };
}

const outDir = path.join(__dirname, "..", "public");
fs.mkdirSync(outDir, { recursive: true });
for (const size of [192, 512, 180]) {
  const file = size === 180 ? path.join(outDir, "apple-touch-icon.png") : path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(file, png(size, roundedRectPixels(size)));
  console.log("wrote", file);
}
console.log("done");
