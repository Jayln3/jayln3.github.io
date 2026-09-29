import { test } from 'node:test';
import assert from 'node:assert/strict';
import { postsFor, images, site } from '../tools/lib.mjs';

test('Published translations preserve the original article IDs', async () => {
  const zh = await postsFor('zh-CN');
  const en = await postsFor('en');
  assert(zh.length >= 13);
  assert(en.length >= 13);
  const keys = new Set();
  for (const post of zh) {
    assert(!keys.has(post.data.translation_key));
    keys.add(post.data.translation_key);
    const translation = en.find(p => p.data.translation_key === post.data.translation_key);
    if (!translation) continue; // Later articles may be published before their translation.
    assert.equal(translation.data.abbrlink, post.data.abbrlink);
    assert.equal(images.assets.find(a => a.id === post.data.translation_key).abbrlink, post.data.abbrlink);
    assert.equal(new Date(translation.data.date).getTime(), new Date(post.data.date).getTime());
  }
});

test('Each language uses four independent top-level categories', async () => {
  for (const lang of ['zh-CN', 'en']) {
    const posts = await postsFor(lang);
    const counts = new Map();
    for (const post of posts) {
      assert.equal(post.data.categories.length, 1);
      const category = post.data.categories[0];
      assert(Object.values(site.categories).some(c => c[lang] === category));
      counts.set(category, (counts.get(category) || 0) + 1);
    }
    assert.equal(counts.size, 4);
  }
});
