import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { shouldPublish } from '../build/site-publish.mjs';
import { isAuthoringArchive } from '../build/publication-policy.mjs';

test('raw public review snapshots, scene backups and currency prompts stay repository sources',async()=>{
  for(const path of [
    'AleriaAlmanach/modules/gawain-duncan/source/gawain-public-profile-2026-11-01.json',
    'AleriaAlmanach/modules/gawain-duncan/source/reviewed-module.json',
    'AleriaAlmanach/modules/group-adventures/source/idwals-schiffsmannschaft-2026-11-01.json',
    'AleriaAlmanach/assets/currency/image-prompts.json'
  ]) {
    await access(new URL(`../../${path}`,import.meta.url));
    assert.equal(isAuthoringArchive(path),true,path);assert.equal(shouldPublish(path),false,path);
  }
  for(const path of ['AleriaAlmanach/backups/scenes/scene/snapshot/comments.json',
    'AleriaAlmanach/backups/scenes/scene/snapshot/module.json',
    'AleriaAlmanach/backups/scenes/scene/snapshot/history.md'])assert.equal(shouldPublish(path),false,path);
});

test('live projections and original coin artwork retain their public paths',async()=>{
  for(const path of [
    'AleriaAlmanach/modules/gawain-duncan/gawain-public-biography.mjs',
    'AleriaAlmanach/modules/group-adventures/group-adventures.global.js',
    'AleriaAlmanach/modules/quests/quest-catalog.json',
    'AleriaAlmanach/modules/currency/currency-art.js',
    'AleriaAlmanach/modules/currency/currency-art.global.js',
    'AleriaAlmanach/assets/currency/aleria-goldtaler-v1.png',
    'AleriaAlmanach/assets/currency/aleria-goldtaler-v1.webp',
    'AleriaAlmanach/assets/currency/aleria-silbertaler-v1.png',
    'AleriaAlmanach/assets/currency/aleria-silbertaler-v1.webp',
    'AleriaAlmanach/assets/gwynthor-troetzli/items/copper-coin-v1.png',
    'AleriaAlmanach/public/assets/inventory/coins/eisenpfennig.png'
  ]) {
    await access(new URL(`../../${path}`,import.meta.url));assert.equal(shouldPublish(path),true,path);
  }
  assert.equal(shouldPublish('AleriaAlmanach/modules/gawain-duncan/source-reader.mjs'),true,'the source directory boundary must remain narrow');
  assert.equal(shouldPublish('AleriaAlmanach/modules/backup/quest-backup-client.js'),true,'the backup feature itself stays available');
});

test('the reviewed live group projection has no dependency on the excluded JSON source archives',async()=>{
  const roots = [
    'AleriaAlmanach/modules/group-adventures/group-adventures-classic-api.mjs',
    'AleriaAlmanach/modules/group-adventures/group-adventure-content.mjs',
    'AleriaAlmanach/modules/gawain-duncan/gawain-duncan-module.mjs',
    'AleriaAlmanach/modules/gawain-duncan/gawain-public-biography.mjs'
  ];
  for(const path of roots) {
    const source=await readFile(new URL(`../../${path}`,import.meta.url),'utf8');
    assert.doesNotMatch(source,/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)["'][^"']*\/source\//,path);
    assert.doesNotMatch(source,/fetch\s*\(\s*["'][^"']*(?:backups\/scenes|\/source\/)/,path);
  }
});
