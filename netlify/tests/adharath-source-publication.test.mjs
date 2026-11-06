import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {shouldPublish} from '../build/site-publish.mjs';
import {HOUSES} from '../../Vorschau/Adharath/house-data.mjs';
import {ESTATES} from '../../Vorschau/Adharath/estate-data.mjs';
import {WARRIOR_PROTOTYPES} from '../../Vorschau/Adharath/warrior-data.mjs';
import {REALM_ARTWORK,displayArtwork} from '../../Vorschau/Adharath/artwork-data.mjs';

const root=new URL('../../',import.meta.url),country='Vorschau/Adharath/';
const publicPath=url=>relative(fileURLToPath(root),fileURLToPath(url)).replaceAll('\\','/');

test('Adharath prompts, originals, source inventories and receipts stay outside publication',()=>{
  const privatePaths=['assets.source.json','sources/user-request.md','sources/emblem-art-direction.json',
    'sources/warrior-art-direction.json','sources/caste-art-direction.json','sources/emblem-asset-receipts.json',
    'scripts/prepare-sources.py','scripts/prepare-warriors.py','tests/adharath.test.mjs',
    'tests/adharath-source.test.mjs','assets/originals/HiXNVXp.png','assets/originals/ljuUwu8.png',
    'assets/warriors/manifest.json','assets/castes/manifest.json',
    'assets/emblems/generated/house-addax.png','assets/emblems/generated/versions/realm-duinreach-v1.png',
    'assets/warriors/generated/schwertsaengerin.png','assets/castes/generated/stammesfuerst.png'];
  for(const path of privatePaths)assert.equal(shouldPublish(country+path),false,path);
});

test('every active Adharath artwork and preview remains public without its generator archive',async()=>{
  assert.equal(HOUSES.length,12);assert.equal(ESTATES.length,3);
  assert([4,5].includes(WARRIOR_PROTOTYPES.length));
  const items=[...HOUSES,...ESTATES,...WARRIOR_PROTOTYPES,REALM_ARTWORK];
  assert([20,21].includes(items.length));
  const fullsize=new Set(),previews=new Set();
  for(const item of items){
    const view=displayArtwork(item);
    fullsize.add(view.fullsize);previews.add(view.image);
    for(const file of [view.fullsize,view.image]){
      assert.match(file,/^assets\/(?:emblems|warriors|castes)\/(?:production|previews)\//);
      assert.equal(shouldPublish(country+file),true,file);
      await access(new URL(country+file,root));
    }
  }
  assert.equal(fullsize.size,items.length);assert.equal(previews.size,items.length);
  assert.equal(fullsize.size+previews.size,items.length*2);
});

test('the complete browser module and CSS dependency chain remains publishable',async()=>{
  const countryRoot=new URL(country,root),pending=['index.html','proposal-app.mjs','proposal.css'].map(path=>new URL(path,countryRoot));
  const seen=new Set();
  while(pending.length){
    const url=pending.shift();if(seen.has(url.href))continue;
    seen.add(url.href);
    assert.equal(shouldPublish(publicPath(url)),true,url.href);
    await access(url);
    const source=await readFile(url,'utf8');
    for(const match of source.matchAll(/(?:from\s+|import\s*|@import\s+(?:url\()?|(?:src|href)=)["']([^"']+)["']/g)){
      const reference=match[1].split('?')[0];
      if(!/\.(?:css|mjs|js)$/.test(reference))continue;
      if(!reference.startsWith('.')&&url.href!==new URL('index.html',countryRoot).href)continue;
      pending.push(new URL(reference,url));
    }
  }
  assert(seen.has(new URL('art-dialogs.mjs',countryRoot).href));
  assert(seen.has(new URL('../shared/country-workbench/art-dialog-session.mjs',countryRoot).href));
  assert(seen.has(new URL('../shared/country-workbench/estate-view.mjs',countryRoot).href));
  assert(seen.size>=15);
});
