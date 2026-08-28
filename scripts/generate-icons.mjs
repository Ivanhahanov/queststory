import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const src = path.join(root, "public/icons/icon-source.svg");
const srcMaskable = path.join(root, "public/icons/icon-source-maskable.svg");
const outDir = path.join(root, "public/icons");

const targets = [
  { file: "icon-192.png", size: 192, source: src },
  { file: "icon-512.png", size: 512, source: src },
  { file: "icon-maskable-512.png", size: 512, source: srcMaskable },
  { file: "apple-touch-icon.png", size: 180, source: src },
];

await mkdir(outDir, { recursive: true });

for (const { file, size, source } of targets) {
  await sharp(source, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, file));
  console.log("generated", file);
}

// Browser-tab favicon: a PNG-in-ICO container (ICONDIR + ICONDIRENTRY per
// image, followed by raw PNG bytes) — supported by every modern browser and
// far simpler than encoding legacy BMP frames.
const faviconSizes = [16, 32, 48, 64];
const pngBuffers = await Promise.all(
  faviconSizes.map((size) => sharp(src, { density: 384 }).resize(size, size).png().toBuffer()),
);

const headerSize = 6 + faviconSizes.length * 16;
const header = Buffer.alloc(headerSize);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(faviconSizes.length, 4);

let offset = headerSize;
faviconSizes.forEach((size, i) => {
  const entryOffset = 6 + i * 16;
  const png = pngBuffers[i];
  header.writeUInt8(size >= 256 ? 0 : size, entryOffset); // width
  header.writeUInt8(size >= 256 ? 0 : size, entryOffset + 1); // height
  header.writeUInt8(0, entryOffset + 2); // color count
  header.writeUInt8(0, entryOffset + 3); // reserved
  header.writeUInt16LE(1, entryOffset + 4); // planes
  header.writeUInt16LE(32, entryOffset + 6); // bit count
  header.writeUInt32LE(png.length, entryOffset + 8); // bytes in resource
  header.writeUInt32LE(offset, entryOffset + 12); // image offset
  offset += png.length;
});

await writeFile(path.join(root, "src/app/favicon.ico"), Buffer.concat([header, ...pngBuffers]));
console.log("generated favicon.ico");
