import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { shouldPublish } from '../build/site-publish.mjs';
import { isAuthoringArchive } from '../build/publication-policy.mjs';

test('incidental-speaker generation originals stay out of the static package while active portraits remain public', () => {
  assert.equal(shouldPublish('assets/source/comment-foreign-voice/2026-11-12/originals/knight-v1.png'), false);
  assert.equal(shouldPublish('AleriaAlmanach/public/assets/comment-foreign-voice/knight.png'), true);
});

test('world directory ships its runtime projection and keeps readers, builders and tests as sources',async()=>{
  for(const path of ['shared/world-directory/source-reader.mjs','shared/world-directory/build-house-directories.mjs',
    'shared/world-directory/house-placement.mjs','shared/world-directory/tests/catalog-coverage.test.mjs']) {
    await access(new URL(`../../${path}`,import.meta.url));
    assert.equal(isAuthoringArchive(path),true,path);
    assert.equal(shouldPublish(path),false,path);
  }
  for(const path of ['shared/world-directory/house-projection.mjs','shared/world-directory/house-directories.generated.json']) {
    await access(new URL(`../../${path}`,import.meta.url));
    assert.equal(shouldPublish(path),true,path);
  }
  const runtime=await readFile(new URL('../../shared/world-directory/house-projection.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(runtime,/source-reader|house-placement|build-house-directories|node:/);
});

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

test('the loading screen publishes its active graphics and retains the authoring originals in Git', async () => {
  const promptsPath = 'AleriaAlmanach/assets/loading-screen/journey-v6-prompts.json';
  const manifestPath = 'AleriaAlmanach/public/assets/loading-screen/journey-v6-manifest.json';
  const load = file => readFile(new URL(`../../${file}`, import.meta.url), 'utf8').then(JSON.parse);
  const [prompts, manifest] = await Promise.all([load(promptsPath), load(manifestPath)]);
  const originals = [promptsPath, ...prompts.artwork.map(item => 'AleriaAlmanach/assets/loading-screen/' + item.source)];
  const graphics = Object.values(manifest.groups).flatMap(({ panorama, atlas }) => [...panorama.assets, atlas.asset]);
  graphics.push(...manifest.council.room.assets, manifest.council.atlas.asset);
  for (const file of originals) assert.equal(shouldPublish(file), false, file);
  for (const { file } of graphics) assert.equal(shouldPublish('AleriaAlmanach/' + file), true, file);
  assert.equal(shouldPublish(manifestPath), true);
});

test('the rose chase packages the opt-in game, its compact assets and no authoring sources', async () => {
  const manifestPath = 'AleriaAlmanach/public/assets/loading-screen/rosenflucht-v11-manifest.json';
  const manifest = JSON.parse(await readFile(new URL(`../../${manifestPath}`, import.meta.url), 'utf8'));
  const paths = [manifest.courtyard, manifest.chase.garden, manifest.chase.hedge,
    ...Object.values(manifest.chase.actors)].flatMap(({ source, asset }) => [source, asset]);
  paths.push(...Object.values(manifest.paintings).flatMap(({ source, assets }) => [source, ...assets]));
  for (const { file } of paths) {
    const path = `AleriaAlmanach/${file}`;
    await access(new URL(`../../${path}`, import.meta.url));
    assert.equal(shouldPublish(path), file.startsWith('public/'), path);
  }
  for (const path of ['AleriaAlmanach/modules/loading-screen/loading-screen-tiefenwyrm.js',
    'AleriaAlmanach/modules/loading-screen/rose-chase/chase-game.js',
    'AleriaAlmanach/modules/loading-screen/rose-chase/chase-game.css', manifestPath]) {
    await access(new URL(`../../${path}`, import.meta.url));
    assert.equal(shouldPublish(path), true, path);
  }
});
