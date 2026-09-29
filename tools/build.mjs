import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import yaml from 'js-yaml';
import { ROOT, site, images, output, baseUrl, write, readJSON, postsFor, escapeHTML } from './lib.mjs';
import { buildAssets } from './assets.mjs';
import { finishSite } from './finish.mjs';

const temporary = path.join(ROOT, '.cache/build');
const config = yaml.load(await fs.readFile(path.join(ROOT, '_config.yml'), 'utf8'));
const theme = yaml.load(await fs.readFile(path.join(ROOT, '_config.butterfly.yml'), 'utf8'));
const tags = await readJSON(path.join(ROOT, 'config/tags.json'));
const allPosts = (await Promise.all(Object.keys(site.locales).map(postsFor))).flat();
const seen = new Set();
const seenRoutes = new Set();
for (const post of allPosts) {
  const id = post.lang + ':' + post.data.translation_key;
  if (seen.has(id)) throw new Error('Duplicate translation key: ' + id);
  seen.add(id);
  if (seenRoutes.has(post.url)) throw new Error('Duplicate article URL: ' + post.url);
  seenRoutes.add(post.url);
  if (post.data.lang !== post.lang || !/^[a-f0-9]+$/.test(String(post.data.abbrlink))) throw new Error('Invalid locale or abbrlink: ' + post.file);
  if (!Object.values(site.categories).some(c => JSON.stringify(post.data.categories) === JSON.stringify([c[post.lang]]))) {
    throw new Error('Choose one configured category: ' + post.file);
  }
  if (!images.assets.some(a => a.id === post.data.translation_key)) throw new Error('Cover missing from image manifest: ' + post.file);
}
await fs.rm(temporary, { recursive: true, force: true });
await fs.mkdir(temporary, { recursive: true });
const candidate = path.join(temporary, 'public');
await fs.mkdir(candidate, { recursive: true });

for (const [lang, locale] of Object.entries(site.locales)) {
  const isEnglish = lang === 'en';
  const context = path.join(temporary, lang);
  await fs.mkdir(context, { recursive: true });
  await fs.cp(path.join(ROOT, locale.source), path.join(context, 'source'), { recursive: true });
  await fs.copyFile(path.join(ROOT, 'package.json'), path.join(context, 'package.json'));
  await fs.symlink(path.join(ROOT, 'node_modules'), path.join(context, 'node_modules'), 'dir');
  const localeConfig = {
    ...config, ...locale,
    source_dir: 'source', public_dir: 'public',
    url: baseUrl + (isEnglish ? '/en' : ''),
    root: locale.root, language: lang, default_language: lang, author: site.author,
    email: site.emailEnabled ? site.contactEmail : '',
    category_map: Object.fromEntries(Object.entries(site.categories).map(([slug, labels]) => [labels[lang], slug])),
    tag_map: Object.fromEntries(Object.entries(tags).map(([slug, labels]) => [labels[lang], slug]))
  };
  delete localeConfig.source;
  const localizedTheme = structuredClone(theme);
  const labels = isEnglish
    ? ['Home', 'Archives', 'Tags', 'Categories', 'About', 'Gallery', 'Guestbook']
    : ['首页', '归档', '标签', '分类', '关于', '图库', '留言板'];
  const paths = ['/', '/archives/', '/tags/', '/categories/', '/about/', '/gallery/', '/guestbook/'];
  const icons = ['home', 'archive', 'tags', 'folder-open', 'user', 'images', 'comments'];
  localizedTheme.menu = Object.fromEntries(labels.map((label, i) => [label, paths[i] + ' || fas fa-' + icons[i]]));
  // Render links and unregistered account placeholders together in finishSite.
  localizedTheme.social = {};
  localizedTheme.aside.card_author.button = { enable: true, icon: 'fab fa-github', text: 'GitHub', link: site.github };
  localizedTheme.aside.card_announcement.content = isEnglish
    ? 'Notes on global growth, AI and technology. Use the language button to read the corresponding translation.'
    : '记录跨境增长、AI 与技术实践。点击语言按钮可阅读当前文章的对应译文。';
  localizedTheme.aside.card_archives.format = isEnglish ? 'MMMM YYYY' : 'YYYY 年 MM 月';
  localizedTheme.twikoo.option = { lang: isEnglish ? 'en' : 'zh-CN' };
  localizedTheme.error_404.subtitle = isEnglish ? 'This page could not be found.' : '没有找到这个页面。';
  localizedTheme.footer.custom_text = isEnglish
    ? '<a href="/en/about/">About Jayln3</a> · <a href="/en/atom.xml">RSS</a>'
    : '<a href="/about/">关于 Jayln3</a> · <a href="/atom.xml">RSS</a>';
  localizedTheme.inject = {
    head: ['<link rel="stylesheet" href="/assets/site.css">', '<link rel="apple-touch-icon" href="/assets/images/ln3-apple-touch-icon-v1.png">'],
    bottom: []
  };
  await write(path.join(context, '_config.yml'), yaml.dump(localeConfig, { lineWidth: -1 }));
  await write(path.join(context, '_config.butterfly.yml'), yaml.dump(localizedTheme, { lineWidth: -1 }));

  const posts = allPosts.filter(p => p.lang === lang);
  const gallery = posts.map(post => {
    const asset = images.assets.find(a => a.id === post.data.translation_key);
    return '<figure><a href="' + post.url + '"><img src="/assets/images/' + asset.id +
      '-v1-640.webp" width="640" height="360" loading="lazy" alt="' + escapeHTML(asset.alt[lang]) +
      '"></a><figcaption><a href="' + post.url + '">' + escapeHTML(post.data.title) + '</a></figcaption></figure>';
  }).join('\n');
  await write(path.join(context, 'source/gallery/index.md'), '---\ntitle: ' + (isEnglish ? 'Gallery' : '图库') +
    '\ncomments: false\n---\n\n' + (isEnglish ? 'AI-generated conceptual illustrations for this blog.' : '为博客文章制作的 AI 概念插画。') +
    '\n\n<div class="image-gallery">\n' + gallery + '\n</div>\n');
  const brandRows = [
    [isEnglish ? 'Author' : '作者', site.author],
    [site.customDomainEnabled && baseUrl === site.planned.home ? (isEnglish ? 'Home' : '主站') : (isEnglish ? 'Home (planned)' : '主站（筹备中）'), new URL(site.planned.home).hostname],
    [site.customDomainEnabled && baseUrl === site.planned.blog ? (isEnglish ? 'Blog domain' : '博客域名') : (isEnglish ? 'Blog subdomain (planned)' : '博客子域名（筹备中）'), new URL(site.planned.blog).hostname],
    [isEnglish ? 'Projects (planned)' : '项目（筹备中）', new URL(site.planned.projects).hostname],
    [isEnglish ? 'Email' : '邮箱', site.emailEnabled ? '[' + site.contactEmail + '](mailto:' + site.contactEmail + ')' : site.contactEmail + (isEnglish ? ' (not active yet)' : '（尚未启用）')],
    ['GitHub', '[' + site.github.replace('https://', '') + '](' + site.github + ')'],
    ['Facebook', '[Jayln3mall](' + site.social.facebook + ')']
  ];
  let about = await fs.readFile(path.join(context, 'source/about/index.md'), 'utf8');
  about += '\n\n| ' + (isEnglish ? 'Profile | Address' : '个人品牌 | 地址') + ' |\n| --- | --- |\n' +
    brandRows.map(row => '| ' + row.join(' | ') + ' |').join('\n') + '\n';
  await write(path.join(context, 'source/about/index.md'), about);
  const child = spawnSync(process.execPath, [path.join(ROOT, 'tools/render-locale.mjs'), context], { cwd: ROOT, stdio: 'inherit' });
  if (child.status !== 0) throw new Error('Failed to build ' + lang + ' (status ' + child.status + ')');
  await fs.cp(path.join(context, 'public'), path.join(candidate, isEnglish ? 'en' : ''), { recursive: true });
}
await buildAssets(candidate);
await finishSite(candidate, allPosts);
const result = spawnSync(process.execPath, [path.join(ROOT, 'tools/check.mjs'), candidate], { cwd: ROOT, stdio: 'inherit' });
if (result.status !== 0) throw new Error('Generated site validation failed. Existing public/ was preserved.');
await fs.rm(output, { recursive: true, force: true });
await fs.rename(candidate, output);
console.log('Built and validated both locales at ' + output);
