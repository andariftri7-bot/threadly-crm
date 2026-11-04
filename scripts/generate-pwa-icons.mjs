import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const outputDir = path.resolve(process.cwd(), 'public/icons');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate valid PNG with RGBA buffer
function createPng(width, height, r, g, b) {
  // A simple RGBA image generator with rounded rect and 'T' logo
  const rowSize = width * 4;
  const rawData = Buffer.alloc(height * (1 + rowSize));

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + rowSize);
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Distance from center
      const cx = width / 2;
      const cy = height / 2;
      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);
      const radius = width * 0.42;

      // Background gradient: from #5B4BDB (91, 75, 219) to #0F172A (15, 23, 42)
      const grad = (x + y) / (width + height);
      let pr = Math.round(91 * (1 - grad) + 15 * grad);
      let pg = Math.round(75 * (1 - grad) + 23 * grad);
      let pb = Math.round(219 * (1 - grad) + 42 * grad);
      let pa = 255;

      // Shape: rounded square (squircle)
      const cornerR = width * 0.22;
      const inBoxX = Math.max(0, dx - (cx - cornerR));
      const inBoxY = Math.max(0, dy - (cy - cornerR));
      if (Math.hypot(inBoxX, inBoxY) > cornerR) {
        pa = 0; // Transparent outside squircle
      }

      // Draw Letter 'T'
      // Horizontal bar
      const barTop = height * 0.28;
      const barBottom = height * 0.38;
      const barLeft = width * 0.25;
      const barRight = width * 0.75;

      // Stem
      const stemLeft = width * 0.44;
      const stemRight = width * 0.56;
      const stemBottom = height * 0.72;

      const isTopBar = (y >= barTop && y <= barBottom && x >= barLeft && x <= barRight);
      const isStem = (y >= barTop && y <= stemBottom && x >= stemLeft && x <= stemRight);

      if ((isTopBar || isStem) && pa > 0) {
        // Crisp White letter T with soft gold-champagne tint
        pr = 255;
        pg = 255;
        pb = 255;
        pa = 255;
      }

      rawData[pxOffset] = pr;
      rawData[pxOffset + 1] = pg;
      rawData[pxOffset + 2] = pb;
      rawData[pxOffset + 3] = pa;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA (6)
  ihdr[10] = 0; // Compression method: Deflate
  ihdr[11] = 0; // Filter method: Standard
  ihdr[12] = 0; // Interlace: None
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT Chunk
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND Chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  typeBuf.copy(chunk, 4);
  data.copy(chunk, 8);

  const crc = crc32(Buffer.concat([typeBuf, data]));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// Simple CRC32
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (c ^ buf[i]) >>> 0;
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Generate sizes
const sizes = [
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'icon-maskable-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

for (const s of sizes) {
  const png = createPng(s.size, s.size);
  fs.writeFileSync(path.join(outputDir, s.name), png);
  console.log(`Generated: ${s.name} (${s.size}x${s.size})`);
}

// Also write SVG icon
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5B4BDB" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#brandGrad)" />
  <path d="M128 144 H384 V196 H282 V368 H230 V196 H128 Z" fill="#FFFFFF" />
</svg>`;
fs.writeFileSync(path.join(outputDir, 'icon.svg'), svg, 'utf-8');
console.log('Generated: icon.svg');
