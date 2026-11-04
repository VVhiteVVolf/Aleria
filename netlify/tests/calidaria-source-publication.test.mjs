import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { shouldPublish } from '../build/site-publish.mjs';
import { isAuthoringArchive } from '../build/publication-policy.mjs';
import { HOUSES } from '../../Vorschau/Calidaria/house-data.mjs';
import { CLASS_PROTOTYPES, WARRIORS } from '../../Vorschau/Calidaria/warrior-data.mjs';
import { ARTWORKS } from '../../Vorschau/Calidaria/art-data.mjs';

const root = new URL('../../', import.meta.url);
const country = new URL('Vorschau/Calidaria/', root);

test('Calidaria authoring sources, technical receipts and replaced artwork stay archived', () => {
  const archives = [
    'sources/heraldry-colony-jobs.json', 'sources/prototype-03-v2-job.json',
    'sources/later-wave/receipt.json', 'scripts/build-art-catalog.mjs',
    'assets.source.json', 'assets/warriors/manifest.json', 'assets/emblems/manifest.json',
    'assets/warriors/generated/prototype-03-v2.png', 'assets/emblems/generated/province-calidaria.png',
    'assets/warriors/production/prototype-03.png', 'assets/warriors/previews/prototype-03.webp',
    'assets/warriors/production/house-tlapanui-11.png', 'assets/warriors/previews/house-tlapanui-11.webp',
    'assets/emblems/production/tlapanui-11.png', 'assets/emblems/previews/tlapanui-11.webp',
    'assets/emblems/production/province-calidaria.png', 'assets/emblems/previews/province-calidaria.webp',
    'assets/emblems/production/ancient-tlapatlan.png', 'assets/emblems/previews/ancient-tlapatlan.webp',
  ];
  for (const relative of archives) {
    const file = 'Vorschau/Calidaria/' + relative;
    assert.equal(isAuthoringArchive(file), true, file);
    assert.equal(shouldPublish(file), false, file);
  }
});

test('All active Calidaria artwork and its browser modules remain publishable without authoring dependencies', async () => {
  assert.equal(HOUSES.length, 29);
  assert.equal(ARTWORKS.length, 2);
  assert.equal(CLASS_PROTOTYPES.length, 5);
  const active = [...HOUSES.map(house => ({ ...house, image: house.crest })), ...ARTWORKS, ...CLASS_PROTOTYPES, ...WARRIORS];
  for (const item of active) {
    assert.equal(item.ready, true, item.id);
    for (const relative of [item.image, item.fullsize]) {
      assert.ok(relative, item.id);
      const url = new URL(relative, country);
      await access(url);
      const file = path.relative(fileURLToPath(root), fileURLToPath(url)).split(path.sep).join('/');
      assert.equal(shouldPublish(file), true, file);
    }
  }
  for (const filename of (await readdir(country)).filter(name => name.endsWith('.mjs'))) {
    const file = 'Vorschau/Calidaria/' + filename;
    assert.equal(shouldPublish(file), true, file);
    const source = await readFile(new URL(filename, country), 'utf8');
    assert.doesNotMatch(source, /(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)["'][^"']*\/(?:sources|scripts)\//, file);
    assert.doesNotMatch(source, /fetch\s*\(\s*["'][^"']*\/(?:sources|scripts)\//, file);
  }
});
