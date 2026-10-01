import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // External visitor counts must not hold up local navigation checks.
  await page.route(/^https?:\/\/busuanzi\.ibruce\.info\//, route => route.fulfill({
    contentType: 'application/javascript',
    body: ''
  }));
});

test('Indexes, assets and the language switch work without script errors', async ({ page }) => {
  const errors = [];
  const failures = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => {
    if (r.url().startsWith('http://127.0.0.1:4000') && r.status() >= 400) failures.push(r.url());
  });
  await page.goto('/');
  await expect(page.locator('.language-switch')).toBeVisible();
  await expect(page.locator('#recent-posts .recent-post-item')).toHaveCount(10);
  for (const href of await page.locator('#recent-posts a.article-title').evaluateAll(links => links.map(a => a.getAttribute('href')))) {
    expect(href).toMatch(/^\/posts\//);
  }
  await page.locator('.language-switch').click();
  await expect(page).toHaveURL(/\/en\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  for (const href of await page.locator('#recent-posts a.article-title').evaluateAll(links => links.map(a => a.getAttribute('href')))) {
    expect(href).toMatch(/^\/en\/posts\//);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  expect(errors).toEqual([]);
  expect(failures).toEqual([]);
});

test('An article switches to its exact translation and back', async ({ page }) => {
  await page.goto('/posts/c3a7f2/');
  await page.locator('.language-switch').click();
  await expect(page).toHaveURL(/\/en\/posts\/c3a7f2\/$/);
  await expect(page.locator('h1')).toContainText('Agent Memory');
  const cover = page.locator('.article-illustration img');
  await cover.scrollIntoViewIfNeeded();
  await expect(cover).toBeVisible();
  expect(await cover.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.locator('.translation-note a').click();
  await expect(page).toHaveURL(/\/posts\/c3a7f2\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
});

test('Search stays within the current language', async ({ page }) => {
  await page.goto('/en/');
  await page.locator('#search-button').click();
  const input = page.locator('#local-search-input input');
  await expect(input).toBeVisible();
  await input.fill('memory');
  const results = page.locator('#local-search-results .local-search-hit-item > a');
  await expect(results.first()).toBeVisible();
  const urls = await results.evaluateAll(links => links.map(a => a.getAttribute('href')));
  expect(urls.length).toBeGreaterThan(0);
  for (const href of urls) expect(new URL(href).pathname).toMatch(/^\/en\/posts\//);
  await results.first().click();
  await expect(page).toHaveURL(/\/en\/posts\//);
});

test('Categories, gallery and mobile menu are usable', async ({ page, isMobile }) => {
  await page.goto('/en/categories/');
  await expect(page.locator('#page .category-list-item')).toHaveCount(4);
  if (isMobile) {
    await page.locator('#toggle-menu').click();
    await expect(page.locator('#sidebar-menus')).toBeVisible();
    await page.locator('#sidebar-menus a.site-page').filter({ hasText: 'Gallery' }).click();
  } else {
    await page.locator('#menus a.site-page').filter({ hasText: 'Gallery' }).click();
  }
  await expect(page).toHaveURL(/\/en\/gallery\/$/);
  await expect(page.locator('.image-gallery figure')).toHaveCount(13);
});
