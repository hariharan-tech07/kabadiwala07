import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width: number, height: number, bgColor: [number, number, number], fgColor: [number, number, number], isMaskable = false) {
  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 2; // Color type: 2 (RGB TrueColor)
  ihdr[10] = 0; // Compression method
  ihdr[11] = 0; // Filter method
  ihdr[12] = 0; // Interlace method

  function crc32(buf: Buffer): number {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type: string, data: Buffer): Buffer {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const combined = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(combined), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw uncompressed scanlines: each row has 1 filter byte (0 = None) + width * 3 bytes (RGB)
  const rowLength = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowLength);

  const cx = width / 2;
  const cy = height / 2;
  const outerR = isMaskable ? width * 0.38 : width * 0.44;
  const innerR = outerR * 0.65;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter: 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Draw background circle or emblem
      if (dist <= outerR && dist >= innerR) {
        // Outer ring (recycled emblem)
        rawData[pxOffset] = fgColor[0];
        rawData[pxOffset + 1] = fgColor[1];
        rawData[pxOffset + 2] = fgColor[2];
      } else if (dist < innerR * 0.4) {
        // Inner core
        rawData[pxOffset] = fgColor[0];
        rawData[pxOffset + 1] = fgColor[1];
        rawData[pxOffset + 2] = fgColor[2];
      } else if (dist <= outerR) {
        // Middle filler
        rawData[pxOffset] = Math.round((bgColor[0] * 2 + fgColor[0]) / 3);
        rawData[pxOffset + 1] = Math.round((bgColor[1] * 2 + fgColor[1]) / 3);
        rawData[pxOffset + 2] = Math.round((bgColor[2] * 2 + fgColor[2]) / 3);
      } else {
        // Background
        rawData[pxOffset] = bgColor[0];
        rawData[pxOffset + 1] = bgColor[1];
        rawData[pxOffset + 2] = bgColor[2];
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Brand theme: Dark Emerald Green #065F46 (6, 95, 70) and Vibrant Lime/Mint #10B981 (16, 185, 129)
const emeraldDark: [number, number, number] = [6, 95, 70];
const mintGreen: [number, number, number] = [52, 211, 153];
const white: [number, number, number] = [255, 255, 255];

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, emeraldDark, white, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, emeraldDark, white, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, emeraldDark, mintGreen, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, emeraldDark, white, false));

console.log('✅ Generated PWA icons in /public: 192x192, 512x512, maskable, and apple-touch-icon');
