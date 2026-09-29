import fs from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import { site, images, baseUrl, ROOT, readJSON, files, write, escapeHTML } from './lib.mjs';

export async function finishSite(directory, allPosts) {
  const htmlFiles = (await files(directory)).filter(f => f.endsWith('.html'));
  const route = file => '/' + path.relative(directory, file).split(path.sep).join('/').replace(/index\.html$/, '');
  const routes = new Set(htmlFiles.map(route));
  const byUrl = new Map(allPosts.map(p => [p.url, p]));
  const translations = new Map();
  for (const post of allPosts) {
    if (!translations.has(post.data.translation_key)) translations.set(post.data.translation_key, {});
    translations.get(post.data.translation_key)[post.lang] = post.url;
  }
  for (const file of htmlFiles) {
    const current = route(file);
    const isEnglish = current.startsWith('/en/');
    const lang = isEnglish ? 'en' : 'zh-CN';
    const otherLang = isEnglish ? 'zh-CN' : 'en';
    const post = byUrl.get(current);
    const proposed = post ? translations.get(post.data.translation_key)[otherLang]
      : isEnglish ? current.replace(/^\/en\//, '/') : '/en' + current;
    const paired = proposed && routes.has(proposed);
    const counterpart = paired ? proposed : isEnglish ? '/' : '/en/';
    const $ = load(await fs.readFile(file, 'utf8'));
    $('html').attr('lang', lang);
    if (current.endsWith('/404.html')) {
      $('h1').slice(1).each((_, el) => { el.tagName = 'h2'; });
    }
    $('link[rel="canonical"]').attr('href', baseUrl + current);
    if (paired) {
      const zh = isEnglish ? counterpart : current;
      const en = isEnglish ? current : counterpart;
      for (const [locale, target] of [['zh-CN', zh], ['en', en], ['x-default', zh]]) {
        $('head').append('<link rel="alternate" hreflang="' + locale + '" href="' + baseUrl + target + '">');
      }
    }
    const label = paired ? (isEnglish ? '中文' : 'English') : (isEnglish ? '中文首页' : 'English home');
    const switcher = '<a class="language-switch" href="' + counterpart + '" hreflang="' + otherLang + '" lang="' + otherLang +
      '" aria-label="' + (isEnglish ? 'Read in Chinese' : 'Read in English') + '">' + label + '</a>';
    $('#menus').before(switcher);
    if (post) {
      const asset = images.assets.find(a => a.id === post.data.translation_key);
      const src = '/assets/images/' + asset.id + '-v1-1280.webp';
      $('#article-container').prepend('<figure class="article-illustration"><img src="' + src +
        '" width="1280" height="720" alt="' + escapeHTML(asset.alt[lang]) + '" decoding="async" loading="eager"><figcaption>' +
        (isEnglish ? 'AI-generated conceptual illustration.' : 'AI 生成的概念插画。') + '</figcaption></figure>');
      if (paired) $('#article-container').prepend('<aside class="translation-note">' +
        (isEnglish ? 'English edition, translated and edited from the Chinese article. Figures and product details refer to the original publication date. ' : '本文提供英文译编版。') +
        '<a href="' + counterpart + '" hreflang="' + otherLang + '">' + (isEnglish ? '中文原文' : 'Read in English') + '</a></aside>');
      $('meta[property="og:image"]').remove();
      $('meta[name="twitter:image"]').remove();
      $('head').append('<meta property="og:image" content="' + baseUrl + src + '"><meta name="twitter:image" content="' + baseUrl + src + '">');
    }
    $('img').each((_, el) => {
      const img = $(el);
      const src = img.attr('src') || '';
      const match = src.match(/\/assets\/images\/(.+)-v1-1280\.webp$/);
      if (match) {
        img.attr('srcset', '/assets/images/' + match[1] + '-v1-640.webp 640w, /assets/images/' + match[1] + '-v1-1280.webp 1280w');
        img.attr('sizes', img.closest('.article-illustration').length ? '(max-width: 900px) 94vw, 850px' : '(max-width: 768px) 90vw, 480px');
        img.attr('width', '1280').attr('height', '720');
      }
      if (!img.attr('alt')) img.attr('alt', src.includes('avatar') ? 'Jayln3' : '');
      if (!img.attr('loading')) img.attr('loading', 'lazy');
    });
    let html = $.html().replaceAll('/en/assets/', '/assets/');
    await fs.writeFile(file, html);
  }
  const redirects = await readJSON(path.join(ROOT, 'config/redirects.json'));
  for (const [from, to] of Object.entries(redirects)) {
    if (routes.has(from) || !routes.has(to)) throw new Error('Invalid redirect: ' + from + ' → ' + to);
    const encoded = encodeURI(to);
    await write(path.join(directory, from.slice(1), 'index.html'),
      '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow">' +
      '<meta http-equiv="refresh" content="0;url=' + escapeHTML(encoded) + '"><link rel="canonical" href="' + baseUrl + encoded +
      '"><title>Jayln3 · 页面已迁移</title></head><body><a href="' + escapeHTML(encoded) + '">页面已迁移 · Continue</a></body></html>');
  }
  const sitemap = [];
  for (const lang of ['zh-CN', 'en']) {
    const prefix = lang === 'en' ? 'en/' : '';
    const file = path.join(directory, prefix, 'sitemap.xml');
    const source = (await fs.readFile(file, 'utf8'))
      .replaceAll('<loc>' + baseUrl + '</loc>', '<loc>' + baseUrl + '/</loc>')
      .replaceAll('<loc>' + baseUrl + '/en</loc>', '<loc>' + baseUrl + '/en/</loc>');
    // Keep one sitemap per language, referenced by the root sitemap index.
    await fs.writeFile(path.join(directory, prefix, 'sitemap-' + lang + '.xml'), source);
    sitemap.push(baseUrl + '/' + prefix + 'sitemap-' + lang + '.xml');
    if (lang === 'en') await fs.rm(file);
  }
  await write(path.join(directory, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    sitemap.map(url => '<sitemap><loc>' + escapeHTML(url) + '</loc></sitemap>').join('') + '</sitemapindex>\n');
  await write(path.join(directory, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: ' + baseUrl + '/sitemap.xml\n');
  const llms = '# Jayln3\n\n' + site.locales['zh-CN'].description + '\n\n' + site.locales.en.description +
    '\n\n## 中文文章\n\n' + allPosts.filter(p => p.lang === 'zh-CN').map(p => '- [' + p.data.title + '](' + baseUrl + p.url + ')').join('\n') +
    '\n\n## English articles\n\n' + allPosts.filter(p => p.lang === 'en').map(p => '- [' + p.data.title + '](' + baseUrl + p.url + ')').join('\n') + '\n';
  await write(path.join(directory, 'llms.txt'), llms);
  await write(path.join(directory, 'translations.json'), JSON.stringify(Object.fromEntries(translations), null, 2) + '\n');
  await write(path.join(directory, '.nojekyll'), '');
  if (site.customDomainEnabled && baseUrl === site.planned.blog) {
    await write(path.join(directory, 'CNAME'), new URL(baseUrl).hostname + '\n');
  }
}
