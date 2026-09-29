import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import sharp from 'sharp';
import { ROOT, site, images, output, baseUrl, files, readJSON, postsFor } from './lib.mjs';

export async function checkSite(directory = output) {
  const entries = await files(directory);
  const paths = new Set(entries.map(file => '/' + path.relative(directory, file).split(path.sep).join('/')));
  const exists = value => {
    const pathname = decodeURIComponent(new URL(value, baseUrl).pathname);
    return paths.has(pathname) || paths.has(pathname.replace(/\/?$/, '/') + 'index.html');
  };
  const posts = (await Promise.all(Object.keys(site.locales).map(postsFor))).flat();
  const pairs = await readJSON(path.join(directory, 'translations.json'));
  const redirects = await readJSON(path.join(ROOT, 'config/redirects.json'));
  let pageCount = 0;
  for (const file of entries.filter(f => f.endsWith('.html'))) {
    const current = '/' + path.relative(directory, file).split(path.sep).join('/').replace(/index\.html$/, '');
    const text = await fs.readFile(file, 'utf8');
    assert(!/jayli[nm]|jaylon/i.test(text), 'Retired personal branding: ' + current);
    assert(!text.includes('\uFFFD'), 'Invalid replacement character: ' + current);
    const $ = load(text);
    const en = current.startsWith('/en/');
    const lang = en ? 'en' : 'zh-CN';
    assert.equal($('link[rel="canonical"]').length, 1, 'One canonical per page: ' + current);
    if (!redirects[current]) {
      assert.equal($('html').attr('lang'), lang, 'HTML language: ' + current);
      assert.equal($('link[rel="canonical"]').attr('href'), baseUrl + current, 'Canonical URL: ' + current);
      assert.equal($('.language-switch').length, 1, 'Visible language link: ' + current);
      assert.equal($('h1').length, 1, 'One H1: ' + current);
    }
    $('a[href], link[href], img[src], script[src]').each((_, el) => {
      const raw = $(el).attr('href') || $(el).attr('src');
      if (!raw || /^(?:#|mailto:|tel:|javascript:|data:)/i.test(raw)) return;
      const url = new URL(raw, baseUrl + current);
      if (url.origin === new URL(baseUrl).origin) assert(exists(url.href), 'Missing local target ' + raw + ' on ' + current);
    });
    $('[style]').each((_, el) => {
      const style = $(el).attr('style');
      for (const match of style.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)) {
        const url = new URL(match[1], baseUrl + current);
        if (url.origin === new URL(baseUrl).origin) assert(exists(url.href), 'Missing background image: ' + url.href);
      }
    });
    const article = posts.find(p => p.url === current);
    if (article) {
      assert.equal($('.article-illustration img').length, 1, 'Article illustration: ' + current);
      assert($('.article-illustration img').attr('alt')?.length > 5, 'Descriptive illustration alt: ' + current);
      assert.equal($('meta[name="author"]').attr('content').split(',')[0], 'Jayln3');
      const other = pairs[article.data.translation_key][en ? 'zh-CN' : 'en'];
      if (other) {
        assert.equal($('.language-switch').attr('href'), other, 'Exact translation: ' + current);
        assert.equal($('link[hreflang="' + (en ? 'zh-CN' : 'en') + '"]').attr('href'), baseUrl + other);
      }
      $('#pagination a[href], .relatedPosts a[href]').each((_, el) => {
        const href = new URL($(el).attr('href'), baseUrl).pathname;
        assert.equal(href.startsWith('/en/'), en, 'Mixed-language recommendations: ' + current);
      });
    }
    pageCount++;
  }
  for (const [lang, locale] of Object.entries(site.locales)) {
    const dir = path.join(directory, lang === 'en' ? 'en' : '');
    const search = load(await fs.readFile(path.join(dir, 'search.xml'), 'utf8'), { xmlMode: true });
    assert.equal(search('entry').length, posts.filter(p => p.lang === lang).length, 'Complete search index: ' + lang);
    search('entry > url').each((_, el) => {
      const pathname = new URL(search(el).text(), baseUrl).pathname;
      assert.equal(pathname.startsWith('/en/'), lang === 'en', 'Search language isolation: ' + pathname);
      assert(exists(pathname), 'Search result exists: ' + pathname);
    });
    const cat = load(await fs.readFile(path.join(dir, 'categories/index.html'), 'utf8'));
    assert.equal(cat('#page .category-list-item').length, Object.keys(site.categories).length, 'Exactly four categories: ' + lang);
    const feed = load(await fs.readFile(path.join(dir, 'atom.xml'), 'utf8'), { xmlMode: true });
    assert.equal(feed('entry').length, posts.filter(p => p.lang === lang).length, 'Complete feed: ' + lang);
    const sm = load(await fs.readFile(path.join(dir, 'sitemap-' + lang + '.xml'), 'utf8'), { xmlMode: true });
    sm('url > loc').each((_, el) => {
      const url = sm(el).text();
      assert(url.startsWith(baseUrl + locale.root), 'Sitemap origin: ' + url);
      assert(exists(url), 'Sitemap target: ' + url);
    });
  }
  for (const asset of images.assets) {
    const file = path.join(directory, 'assets/images', asset.id + '-v1-1280.webp');
    const meta = await sharp(file).metadata();
    assert.equal(meta.format, 'webp');
    assert.equal(meta.width, 1280);
    assert((await fs.stat(file)).size < 350_000, 'Cover exceeds 350 KB budget: ' + file);
  }
  const xmlFiles = entries.filter(f => /\.(xml|txt|json)$/.test(f) && !f.includes('/vendor/'));
  for (const file of xmlFiles) assert(!/jayli[nm]|jaylon/i.test(await fs.readFile(file, 'utf8')), 'Retired name in metadata: ' + file);
  const cname = paths.has('/CNAME');
  assert.equal(cname, site.customDomainEnabled && baseUrl === site.planned.blog, 'Domain must be explicitly enabled');
  console.log('Validated ' + pageCount + ' HTML pages, ' + posts.length + ' articles, locale search/feeds, redirects and ' + images.assets.length + ' optimized covers.');
  return { pages: pageCount, posts: posts.length };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  await checkSite(process.argv[2] ? path.resolve(process.argv[2]) : output);
}
