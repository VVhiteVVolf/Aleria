import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {shouldPublish} from '../build/site-publish.mjs';
import {HOUSES} from '../../Vorschau/Phalantia/house-data.mjs';
import {ARTWORKS} from '../../Vorschau/Phalantia/art-data.mjs';
import {ESTATES} from '../../Vorschau/Phalantia/estate-data.mjs';
import {CLASS_PROTOTYPES,HOUSE_WARRIORS} from '../../Vorschau/Phalantia/warrior-data.mjs';
import {REGION_SHIELDS} from '../../Vorschau/Phalantia/region-shield-data.mjs';
import {MAP_VARIANTS} from '../../Vorschau/Phalantia/territory-data.mjs';

const root = new URL('../../',import.meta.url),country = 'Vorschau/Phalantia/';
test('Phalantia authoring prompts, generated originals and receipts remain outside the static package',() => {
  for (const path of ['source-import.json','assets.source.json','sources/house-plan.json',
    'sources/warrior-art-direction.json','sources/estate-generation-receipts.json',
    'scripts/build-house-catalog.mjs','scripts/prepare-sources.py',
    'assets/warriors/manifest.json','assets/estates/manifest.json',
    'assets/warriors/originals/prototype-01.png','assets/estates/originals/basileis.png',
    'assets/emblems/generated/house-oresthiden.png']) assert.equal(shouldPublish(country+path),false,path);
});

test('selected images, supplied originals and all browser dependencies remain publishable',async () => {
  assert.equal(ESTATES.length,6);
  assert.equal(CLASS_PROTOTYPES.length,8);
  assert.equal(HOUSE_WARRIORS.length,9,'one commissioned house warrior per house');
  assert.equal(REGION_SHIELDS.length,8,'one commissioned Hoplon per seat region');
  const assets = new Set(['assets/originals/phalantia-map.png',...MAP_VARIANTS.map(map => map.map)]);
  for (const item of [...HOUSES,...ARTWORKS,...ESTATES,...CLASS_PROTOTYPES,...HOUSE_WARRIORS,...REGION_SHIELDS]) {
    assert.equal(item.ready,true,item.id);
    for (const key of ['crest','image','fullsize','original']) if (item[key]) assets.add(item[key]);
  }
  for (const path of assets) { await access(new URL(country+path,root)); assert.equal(shouldPublish(country+path),true,path); }
  const countryRoot = new URL(country,root),pending = ['index.html','proposal-app.mjs','proposal.css'].map(path => new URL(path,countryRoot));
  const seen = new Set();
  while (pending.length) {
    const url = pending.shift();
    if (seen.has(url.href)) continue;
    seen.add(url.href);
    await access(url);
    assert.equal(shouldPublish(relative(fileURLToPath(root),fileURLToPath(url)).replaceAll('\\','/')),true,url.href);
    for (const match of (await readFile(url,'utf8')).matchAll(/(?:from\s+|import\s*|@import\s+(?:url\()?|(?:src|href)=)["']([^"']+)["']/g)) {
      const reference = match[1].split('?')[0];
      if (!/\.(?:css|mjs|js)$/.test(reference)) continue;
      if (!reference.startsWith('.') && url.href !== new URL('index.html',countryRoot).href) continue;
      pending.push(new URL(reference,url));
    }
  }
  assert(seen.size > 20);
});
