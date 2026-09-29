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
  await sharp(logo).resize(256, 256).webp({ quality: 86 }).toFile(path.join(target, 'images/avatar.webp'));
  await sharp(logo).resize(48, 48).png().toFile(path.join(target, 'images/favicon.png'));
  await sharp(logo).resize(180, 180).png().toFile(path.join(target, 'images/apple-touch-icon.png'));
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
