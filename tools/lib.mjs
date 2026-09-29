import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const readJSON = async file => JSON.parse(await fs.readFile(file, 'utf8'));
export const site = await readJSON(path.join(ROOT, 'config/site.json'));
export const images = await readJSON(path.join(ROOT, 'config/images.json'));
export const output = path.join(ROOT, 'public');
export const baseUrl = (process.env.BLOG_URL || site.activeBlogUrl).replace(/\/$/, '');
const parsedUrl = new URL(baseUrl);
if (!['https:', 'http:'].includes(parsedUrl.protocol) || parsedUrl.pathname !== '/' || parsedUrl.search || parsedUrl.hash) {
  throw new Error('BLOG_URL must be an origin, for example https://blog.jayln3.com');
}
export async function write(file, content) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
}
export async function files(dir) {
  const result = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await files(file));
    else result.push(file);
  }
  return result.sort();
}
export function parsePost(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error('Missing YAML front matter');
  return { data: yaml.load(match[1]), body: text.slice(match[0].length) };
}
export function serializePost(data, body) {
  return '---\n' + yaml.dump(data, { lineWidth: -1, noRefs: true, quotingType: '"' }) + '---\n\n' + body.trim() + '\n';
}
export function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
export function publicPath(file) {
  return '/' + path.relative(output, file).split(path.sep).join('/').replace(/index\.html$/, '');
}
export async function postsFor(lang) {
  const dir = path.join(ROOT, site.locales[lang].source, '_posts');
  const list = [];
  for (const file of await files(dir)) {
    if (!file.endsWith('.md')) continue;
    const post = parsePost(await fs.readFile(file, 'utf8'));
    if (post.data.published === false) continue;
    if (new Date(post.data.date).getTime() > Date.now()) continue;
    list.push({ ...post, file, lang, url: site.locales[lang].root + 'posts/' + post.data.abbrlink + '/' });
  }
  return list;
}
