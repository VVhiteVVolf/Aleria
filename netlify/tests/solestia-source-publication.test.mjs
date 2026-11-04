import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile,access } from 'node:fs/promises';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { shouldPublish } from '../build/site-publish.mjs';
import { isAuthoringArchive } from '../build/publication-policy.mjs';
import { HOUSES } from '../../Vorschau/Solestia/house-data.mjs';
import { ARTWORKS } from '../../Vorschau/Solestia/art-data.mjs';
import { ESTATES } from '../../Vorschau/Solestia/estate-data.mjs';
import { CLASS_PROTOTYPES,WARRIORS } from '../../Vorschau/Solestia/warrior-data.mjs';
import { MAP_VARIANTS } from '../../Vorschau/Solestia/territory-data.mjs';

const country = 'Vorschau/Solestia/';
const root = new URL('../../',import.meta.url);

test('Solestia source prompts, early choices, technical receipts and both retired house designs stay outside the static package',() => {
  const files = ['source-import.json','assets.source.json','scripts/build-art-catalog.mjs',
    'sources/name-assignments.json','sources/name-candidates.json','sources/house-warrior-revisions.json',
    'sources/house-emblem-revisions.json','sources/additional-emblem-jobs-early-20261104.json',
    'sources/emblem-asset-receipts.json','assets/warriors/manifest.json',
    'sources/estate-facts.json','sources/ESTATES_SOURCE_DECISIONS.md','assets/estates/manifest.json',
    'assets/estates/generated/sobira.png',
    'assets/emblems/generated/early-pool-01.png','assets/emblems/generated/pool-04-v2.png',
    'assets/warriors/generated/house-pool-04-v2.png'];
  for (const stem of ['house-pool-04','house-pool-07']) {
    files.push(`assets/warriors/production/${stem}.png`,`assets/warriors/previews/${stem}.webp`);
  }
  files.push('assets/emblems/production/pool-04.png','assets/emblems/previews/pool-04.webp');
  for (const relative of files) {
    assert.equal(isAuthoringArchive(country + relative),true,relative);
    assert.equal(shouldPublish(country + relative),false,relative);
  }
  assert.equal(shouldPublish('Vorschau/shared/art-catalog-source.mjs'),false);
});

test('all selected Solestia artwork, original downloads and runtime module/style dependencies remain available for publication',async () => {
  const paths = new Set(MAP_VARIANTS.map(map => map.map));
  for (const item of [...HOUSES,...ARTWORKS,...CLASS_PROTOTYPES,...WARRIORS,...ESTATES]) {
    assert.equal(item.ready,true,item.id);
    for (const key of ['crest','image','fullsize','original']) if (item[key]) paths.add(item[key]);
  }
  for (const path of paths) {
    await access(new URL(country + path,root));
    assert.equal(shouldPublish(country + path),true,path);
  }
  const countryUrl = new URL(country,root);
  const pending = ['index.html','proposal-app.mjs','proposal.css'].map(path => new URL(path,countryUrl));
  const seen = new Set();
  while (pending.length) {
    const url = pending.shift(); if (seen.has(url.href)) continue; seen.add(url.href);
    await access(url);
    const publicPath = relative(fileURLToPath(root),fileURLToPath(url)).replaceAll('\\','/');
    assert.equal(shouldPublish(publicPath),true,publicPath);
    const content = await readFile(url,'utf8');
    for (const match of content.matchAll(/(?:from\s+|import\s*|@import\s+(?:url\()?|(?:src|href)=)["']([^"']+)["']/g)) {
      const reference = match[1].split('?')[0];
      if (!/\.(?:css|mjs|js)$/.test(reference)) continue;
      if (!reference.startsWith('.') && url.href !== new URL('index.html',countryUrl).href) continue;
      const target = new URL(reference,url);
      pending.push(target);
    }
  }
  assert(seen.size > 20,'the browser dependency closure must include the shared map and dialog systems');
});
