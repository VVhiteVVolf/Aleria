import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { shouldPublish } from '../build/site-publish.mjs';
import { HOUSES } from '../../Vorschau/Klythesia/house-data.mjs';
import { ARTWORKS } from '../../Vorschau/Klythesia/art-data.mjs';
import { ESTATES } from '../../Vorschau/Klythesia/estate-data.mjs';
import { CLASS_PROTOTYPES } from '../../Vorschau/Klythesia/warrior-data.mjs';
import { HOUSE_WARRIORS } from '../../Vorschau/Klythesia/house-warrior-data.mjs';
import { REALM_WARRIOR } from '../../Vorschau/Klythesia/realm-warrior-data.mjs';
import { MAP } from '../../Vorschau/Klythesia/map-data.mjs';

const root = new URL('../../', import.meta.url), country = 'Vorschau/Klythesia/';

test('Klythesia authoring sources, bounded manifests and generator originals are not static assets', () => {
  for (const file of ['source-import.json', 'assets.source.json', 'sources/house-plan.json',
    'sources/evidence-data-before-public-20261105.mjs', 'sources/public-source-revision-20261105.json',
    'sources/warrior-art-direction.json', 'scripts/build-catalogues.mjs',
    'scripts/klythesia.test.mjs', 'scripts/klythesia-expansion.test.mjs',
    'assets/warriors/manifest.json', 'assets/warriors/house-manifest.json',
    'assets/warriors/realm-manifest.json', 'assets/estates/manifest.json',
    'assets/warriors/originals/xiphone-v1.png', 'assets/estates/originals/theios.png',
    'assets/warriors/generated/house-klyrath.png', 'assets/emblems/generated/house-elyssar.png']) {
    assert.equal(shouldPublish(country + file), false, file);
  }
});

test('all active Klythesia artwork, supplied original downloads and browser imports remain available', async () => {
  assert.equal(HOUSES.length, 7); assert.equal(ESTATES.length, 8);
  assert.equal(CLASS_PROTOTYPES.length, 7); assert.equal(HOUSE_WARRIORS.length, 7);
  assert.equal(REALM_WARRIOR.id, 'realm-klythesia');
  const assets = new Set([MAP.map, MAP.original]);
  for (const item of [...HOUSES, ...ARTWORKS, ...ESTATES, ...CLASS_PROTOTYPES, ...HOUSE_WARRIORS, REALM_WARRIOR]) {
    for (const key of ['crest', 'image', 'fullsize', 'original']) if (item[key]) assets.add(item[key]);
  }
  for (const file of assets) {
    await access(new URL(country + file, root));
    assert.equal(shouldPublish(country + file), true, file);
  }
  const countryRoot = new URL(country, root);
  const pending = ['index.html', 'proposal-app.mjs', 'proposal.css'].map(file => new URL(file, countryRoot));
  const seen = new Set();
  while (pending.length) {
    const url = pending.shift();
    if (seen.has(url.href)) continue;
    seen.add(url.href); await access(url);
    assert.equal(shouldPublish(relative(fileURLToPath(root), fileURLToPath(url)).replaceAll('\\', '/')), true, url.href);
    for (const match of (await readFile(url, 'utf8')).matchAll(/(?:from\s+|import\s*|@import\s+(?:url\()?|(?:src|href)=)["']([^"']+)["']/g)) {
      const ref = match[1].split('?')[0];
      if (!/\.(?:css|mjs|js)$/.test(ref)) continue;
      if (!ref.startsWith('.') && url.href !== new URL('index.html', countryRoot).href) continue;
      pending.push(new URL(ref, url));
    }
  }
  assert(seen.size > 20, 'The complete country browser dependency graph must remain publishable.');
});
