import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { ROOT, images, readJSON, write } from './lib.mjs';

const hash = buffer => createHash('sha256').update(buffer).digest('hex');
const cache = path.join(ROOT, '.cache/assets', images.commit);

async function original(relativePath, expectedHash) {
  // Prefer an identical local original. Never publish an uncommitted inbox file.
  for (const file of [
    path.resolve(ROOT, '../blog-images', relativePath),
    path.join(cache, relativePath)
  ]) {
    try {
      const data = await fs.readFile(file);
      if (!expectedHash || hash(data) === expectedHash) return data;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  const url = 'https://raw.githubusercontent.com/Jayln3/blog-images/' + images.commit + '/' + relativePath;
  let failure;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
      if (!response.ok) throw new Error(url + ': HTTP ' + response.status);
      const data = Buffer.from(await response.arrayBuffer());
      if (expectedHash && hash(data) !== expectedHash) throw new Error('Image SHA256 mismatch: ' + relativePath);
      await write(path.join(cache, relativePath), data);
      return data;
    } catch (error) { failure = error; }
  }
  throw failure;
}

export async function buildAssets(destination) {
  const target = path.join(destination, 'assets');
  await fs.mkdir(path.join(target, 'images'), { recursive: true });
  const result = [];
  for (const asset of images.assets) {
    const data = await original(asset.file, asset.sha256);
    for (const width of [640, 1280]) {
      const name = asset.id + '-v1-' + width + '.webp';
      const buffer = await sharp(data).resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toBuffer();
      await write(path.join(target, 'images', name), buffer);
      result.push({ file: '/assets/images/' + name, bytes: buffer.length, sha256: hash(buffer) });
    }
  }
  const brandAssets = await readJSON(path.join(ROOT, 'config/brand-images.json'));
  const logo = await original(brandAssets.logo.file, brandAssets.logo.sha256);
  await sharp(logo).resize(256, 256, { fit: 'contain', background: '#fff' }).webp({ quality: 90 }).toFile(path.join(target, 'images/ln3-logo-v1.webp'));
  await sharp(logo).resize(180, 180, { fit: 'contain', background: '#fff' }).png().toFile(path.join(target, 'images/ln3-apple-touch-icon-v1.png'));
  const favicon = await sharp(await original(brandAssets.favicon.file, brandAssets.favicon.sha256)).trim({ threshold: 10 }).png().toBuffer();
  const iconSizes = [16, 32, 48];
  const iconPngs = [];
  for (const size of iconSizes) {
    const icon = await sharp(favicon).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    iconPngs.push(icon);
    await write(path.join(target, 'images', 'ln3-favicon-v1-' + size + '.png'), icon);
    await sharp(icon).negate({ alpha: false }).png().toFile(path.join(target, 'images', 'ln3-favicon-v1-' + size + '-dark.png'));
  }
  // ICO stores all three sizes so browsers can choose the native pixel size.
  const iconHeader = Buffer.alloc(6 + iconPngs.length * 16);
  iconHeader.writeUInt16LE(1, 2);
  iconHeader.writeUInt16LE(iconPngs.length, 4);
  let iconOffset = iconHeader.length;
  iconPngs.forEach((png, i) => {
    const offset = 6 + i * 16;
    iconHeader[offset] = iconHeader[offset + 1] = iconSizes[i];
    iconHeader.writeUInt16LE(1, offset + 4);
    iconHeader.writeUInt16LE(32, offset + 6);
    iconHeader.writeUInt32LE(png.length, offset + 8);
    iconHeader.writeUInt32LE(iconOffset, offset + 12);
    iconOffset += png.length;
  });
  await write(path.join(destination, 'favicon.ico'), Buffer.concat([iconHeader, ...iconPngs]));
  const hero = await original(brandAssets.hero.file, brandAssets.hero.sha256);
  await sharp(hero).resize({ width: 1600 }).webp({ quality: 80 }).toFile(path.join(target, 'images/home.webp'));

  for (const [name, file] of [
    ['medium-zoom', 'dist/medium-zoom.min.js'],
    ['twikoo', 'dist/twikoo.all.min.js']
  ]) {
    await fs.mkdir(path.join(target, 'vendor', name), { recursive: true });
    await fs.copyFile(path.join(ROOT, 'node_modules', name, file), path.join(target, 'vendor', name, path.basename(file)));
    const pkg = await readJSON(path.join(ROOT, 'node_modules', name, 'package.json'));
    await write(path.join(target, 'vendor', name, 'package.json'), JSON.stringify({ name, version: pkg.version, license: pkg.license }));
    for (const license of ['LICENSE', 'LICENSE.md', 'LICENSE.txt']) {
      try { await fs.copyFile(path.join(ROOT, 'node_modules', name, license), path.join(target, 'vendor', name, license)); } catch (e) { if (e.code !== 'ENOENT') throw e; }
    }
  }
  const fa = path.join(ROOT, 'node_modules/@fortawesome/fontawesome-free');
  await fs.mkdir(path.join(target, 'vendor/fontawesome/css'), { recursive: true });
  await fs.copyFile(path.join(fa, 'css/all.min.css'), path.join(target, 'vendor/fontawesome/css/all.min.css'));
  await fs.cp(path.join(fa, 'webfonts'), path.join(target, 'vendor/fontawesome/webfonts'), { recursive: true });
  await fs.copyFile(path.join(fa, 'LICENSE.txt'), path.join(target, 'vendor/fontawesome/LICENSE.txt'));
  await fs.cp(path.join(ROOT, 'static'), target, { recursive: true });
  await write(path.join(destination, 'asset-manifest.json'), JSON.stringify({ imageCommit: images.commit, assets: result }, null, 2) + '\n');
  console.log('Prepared ' + images.assets.length + ' covers: ' + Math.round(result.reduce((n, a) => n + a.bytes, 0) / 1024) + ' KiB including thumbnails.');
}
