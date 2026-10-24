import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { variants } from '../Uathneach/variants.mjs';
import { clans } from '../Uathneach/clans.mjs';
import { previewAsset } from '../Uathneach/preview-assets.mjs';

const root = new URL('../Uathneach/', import.meta.url);

test('the shared preview resolves all local module, stylesheet and image references', async () => {
  const files = (await readdir(root)).filter(name => /\.(?:mjs|css|html)$/.test(name));
  let imageCount = 0;
  for (const name of files) {
    const source = await readFile(new URL(name, root), 'utf8');
    for (const match of source.matchAll(/(?:from\s+['"]|(?:src|href)="|url\(['"]?)(\.\.?\/[^'"\s)]+|assets\/[^'"\s)]+|[\w-]+\.(?:mjs|css))/g)) {
      const target = previewAsset(match[1]);
      assert.ok((await stat(new URL(target, root))).isFile(), `${name}: ${target}`);
    }
    for (const match of source.matchAll(/['"](assets\/[^'"]+)['"]/g)) {
      const target = previewAsset(match[1]);
      assert.ok((await stat(new URL(target, root))).isFile(), `${name}: ${target}`);
      imageCount++;
    }
    assert.ok(!source.includes('file:///') && !source.includes('127.0.0.1'), name);
  }
  assert.ok(imageCount >= 7, 'map and regional artwork references are actually checked');
  for (const clan of clans) {
    assert.ok((await stat(new URL(previewAsset('assets/' + clan.crest), root))).isFile(), clan.name);
  }
  assert.equal(clans.length, 26);
  const html = await readFile(new URL('index.html', root), 'utf8');
  assert.match(html, /noindex,nofollow/);
  assert.match(html, /Temporärer Entwurf/);
});

test('all three variants retain their clan assignments and distinct editable drafts', () => {
  assert.equal(variants.length, 3);
  assert.deepEqual(variants.map(variant => variant.regions.length), [7, 7, 6]);
  assert.equal(new Set(variants.map(variant => variant.id)).size, 3);
  const copy = structuredClone(variants[0]);
  copy.regions[0].name = 'Entwurf';
  assert.notEqual(variants[0].regions[0].name, copy.regions[0].name);
});
