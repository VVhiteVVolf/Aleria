import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { continents, ATLAS_VERSION } from '../modules/continent-overview/page-shell.mjs';
import keys from '../modules/continent-overview/estryll-image-keys.source.json' with { type: 'json' };

const root = new URL('../../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const pages = ['Kontinente/index.html', ...continents.filter(c => c.href).map(c => c.href.slice(1))];

test('the register and all three continent overviews share one versioned shell and active navigation', () => {
  assert.equal(pages.length, 4);
  for (const file of pages) {
    const html = read(file);
    assert.ok(html.includes(`kontinente-overview.css?v=${ATLAS_VERSION}`));
    assert.equal((html.match(/aria-current="page"/g) || []).length, 1, file);
    assert.equal((html.match(/class="atlas-continent-nav"/g) || []).length, 1, file);
    assert.equal((html.match(/class="atlas-footer"/g) || []).length, 1, file);
    for (const continent of continents.filter(c => c.href)) assert.ok(html.includes(`href="${continent.href}"`), file);
    assert.doesNotMatch(html, /on(?:click|input|change)=|world-codex\.css|koenigreich\.css|herrschaft\.css/);
  }
});

test('Estryll keeps every stable image key, chapter, linked realm and image order', () => {
  const html = read('Kontinente/Estryll/Estryll.html');
  assert.deepEqual([...html.matchAll(/data-orte-image-key="([^"]+)"/g)].map(m => m[1]), keys.imageKeys);
  for (const id of ['reiche', 'albisch', 'nordisch', 'dunkelhain', 'ausgestorben', 'antike']) {
    assert.ok(html.includes(`id="estryll-${id}"`));
    assert.ok(html.includes(`href="#estryll-${id}"`));
  }
  assert.ok(html.includes('continent-links.mjs'));
});

test('the atlas register retains eight original banners and only links existing continent pages', () => {
  const html = read('Kontinente/index.html');
  assert.equal((html.match(/class="continent-card"/g) || []).length, 8);
  for (const continent of continents) {
    assert.ok(html.includes(`data-orte-image-key="${continent.imageKey}"`));
    if (!continent.href) assert.ok(!html.includes(`/Kontinente/${continent.name}/${continent.name}.html`));
  }
});

test('overview links, chapter anchors, heraldry and modular CSS imports resolve locally', () => {
  for (const file of pages) {
    const html = read(file), base = new URL(file, root);
    for (const [, link] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const url = new URL(link.startsWith('/') ? link.slice(1) : link, link.startsWith('/') ? root : base);
      if (link.startsWith('#')) assert.ok(html.includes(`id="${link.slice(1)}"`), `${file}/${link}`);
      url.search = ''; url.hash = '';
      assert.ok(fs.existsSync(url), `${file}/${link}`);
    }
  }
  const entry = read('Kontinente/assets/css/kontinente-overview.css');
  for (const [, href] of entry.matchAll(/url\("([^"]+)"\)/g)) assert.ok(fs.existsSync(new URL(href, new URL('Kontinente/assets/css/kontinente-overview.css', root))));
});
