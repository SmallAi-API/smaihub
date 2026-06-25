/**
 * 临时图标生成脚本(Windows 可运行)
 *
 * 从单张源 PNG 生成 macOS .icns / Windows .ico / 通用 .png。
 * 仅依赖已安装的 sharp,不引入新依赖。ICNS 与 ICO 容器格式手写封装。
 *
 * 用法:
 *   node scripts/generate-icons.mjs <源图路径>
 *   node scripts/generate-icons.mjs ../../public/logo-1024x1024.png
 *
 * 注意:Assets.car(macOS 26 Liquid Glass)无法在 Windows 生成,需在 Mac 上单独处理。
 */
import { Buffer } from 'node:buffer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.resolve(__dirname, '..', 'build');

const srcArg = process.argv[2];
if (!srcArg) {
  console.error('用法: node scripts/generate-icons.mjs <源图路径>');
  process.exit(1);
}
const srcPath = path.resolve(process.cwd(), srcArg);

/** 缩放源图到指定边长,返回 PNG buffer */
const renderPng = (size) =>
  sharp(srcPath)
    .resize(size, size, { fit: 'contain', background: { alpha: 0, b: 0, g: 0, r: 0 } })
    .png()
    .toBuffer();

/**
 * 封装 .icns
 * 各尺寸用对应的 OSType,统一采用 PNG 编码(icns 自 10.7 起支持 PNG 数据)。
 * @see https://en.wikipedia.org/wiki/Apple_Icon_Image_format
 */
async function buildIcns() {
  // OSType -> 像素尺寸
  const types = [
    ['icp4', 16],
    ['icp5', 32],
    ['ic07', 128],
    ['ic08', 256],
    ['ic09', 512],
    ['ic10', 1024], // 512@2x
    ['ic11', 32], // 16@2x
    ['ic12', 64], // 32@2x
    ['ic13', 256], // 128@2x
    ['ic14', 512], // 256@2x
  ];

  const chunks = [];
  for (const [osType, size] of types) {
    const png = await renderPng(size);
    const header = Buffer.alloc(8);
    header.write(osType, 0, 4, 'ascii');
    header.writeUInt32BE(png.length + 8, 4);
    chunks.push(header, png);
  }

  const body = Buffer.concat(chunks);
  const fileHeader = Buffer.alloc(8);
  fileHeader.write('icns', 0, 4, 'ascii');
  fileHeader.writeUInt32BE(body.length + 8, 4);
  return Buffer.concat([fileHeader, body]);
}

/**
 * 封装 .ico(PNG 压缩条目,Vista+ 支持)
 * @see https://en.wikipedia.org/wiki/ICO_(file_format)
 */
async function buildIco() {
  const sizes = [16, 32, 48, 64, 128, 256];
  const images = await Promise.all(sizes.map((s) => renderPng(s)));

  const count = sizes.length;
  const dir = Buffer.alloc(6 + count * 16);
  dir.writeUInt16LE(0, 0); // reserved
  dir.writeUInt16LE(1, 2); // type: icon
  dir.writeUInt16LE(count, 4);

  let offset = 6 + count * 16;
  const bodies = [];
  sizes.forEach((size, i) => {
    const png = images[i];
    const e = 6 + i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, e + 0); // width (0 = 256)
    dir.writeUInt8(size >= 256 ? 0 : size, e + 1); // height
    dir.writeUInt8(0, e + 2); // palette
    dir.writeUInt8(0, e + 3); // reserved
    dir.writeUInt16LE(1, e + 4); // color planes
    dir.writeUInt16LE(32, e + 6); // bits per pixel
    dir.writeUInt32LE(png.length, e + 8); // size
    dir.writeUInt32LE(offset, e + 12); // offset
    offset += png.length;
    bodies.push(png);
  });

  return Buffer.concat([dir, ...bodies]);
}

async function main() {
  const meta = await sharp(srcPath).metadata();
  console.info(`📐 源图: ${srcPath} (${meta.width}x${meta.height})`);
  if (meta.width < 1024 || meta.height < 1024) {
    console.warn(`⚠️  源图小于 1024px,最大档(1024)会放大,清晰度受影响。`);
  }

  // .icns (stable: Icon.icns)
  const icns = await buildIcns();
  await fs.writeFile(path.join(buildDir, 'Icon.icns'), icns);
  console.info(`✅ build/Icon.icns (${(icns.length / 1024).toFixed(1)} KB)`);

  // .ico (Windows: icon.ico)
  const ico = await buildIco();
  await fs.writeFile(path.join(buildDir, 'icon.ico'), ico);
  console.info(`✅ build/icon.ico (${(ico.length / 1024).toFixed(1)} KB)`);

  // .png (Linux/通用: icon.png — 512)
  const png512 = await renderPng(512);
  await fs.writeFile(path.join(buildDir, 'icon.png'), png512);
  console.info(`✅ build/icon.png (512x512)`);

  console.info('\n🎉 完成。Assets.car(macOS 26 Liquid Glass)请在 Mac 上单独生成。');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
