import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { shouldPublish } from '../build/site-publish.mjs';
import { isAuthoringArchive } from '../build/publication-policy.mjs';

test('incidental-speaker generation originals stay out of the static package while active portraits remain public', () => {
  assert.equal(shouldPublish('assets/source/comment-foreign-voice/2026-11-12/originals/knight-v1.png'), false);
  assert.equal(shouldPublish('AleriaAlmanach/public/assets/comment-foreign-voice/knight.png'), true);
});

test('the courtyard loader ships three renditions and keeps the generator source in the repository', async () => {
  const manifestPath = 'AleriaAlmanach/public/assets/loading-screen/oweta-courtyard-v8-manifest.json';
  const manifest = JSON.parse(await readFile(new URL(`../../${manifestPath}`, import.meta.url), 'utf8'));
  const sourcePaths = [`AleriaAlmanach/${manifest.source.file}`, 'AleriaAlmanach/assets/loading-screen/oweta-courtyard-v8-prompts.json'];
  for (const path of sourcePaths) {
    await access(new URL(`../../${path}`, import.meta.url));
    assert.equal(shouldPublish(path), false, path);
  }
  const runtimePaths = [manifestPath, 'AleriaAlmanach/modules/loading-screen/loading-screen-courtyard.js',
    ...manifest.assets.map(({ file }) => `AleriaAlmanach/${file}`)];
  for (const path of runtimePaths) {
    await access(new URL(`../../${path}`, import.meta.url));
    assert.equal(shouldPublish(path), true, path);
  }
  const earlierPath = 'AleriaAlmanach/public/assets/loading-screen/oweta-courtyard-v7-manifest.json';
  const earlier = JSON.parse(await readFile(new URL(`../../${earlierPath}`, import.meta.url), 'utf8'));
  for (const path of [earlierPath, ...earlier.assets.map(({ file }) => `AleriaAlmanach/${file}`)]) {
    assert.equal(shouldPublish(path), false, path);
  }
});

test('vignettes publish their encoded illustrations and keep all generator versions as sources', async () => {
  const manifestPath = 'AleriaAlmanach/public/assets/loading-screen/ruhige-szenen-v1-manifest.json';
  const receiptPath = 'AleriaAlmanach/assets/loading-screen/ruhige-szenen-v1-prompts.json';
  const manifest = JSON.parse(await readFile(new URL(`../../${manifestPath}`, import.meta.url), 'utf8'));
  const receipt = JSON.parse(await readFile(new URL(`../../${receiptPath}`, import.meta.url), 'utf8'));
  assert.equal(shouldPublish(receiptPath), false);
  for (const { source } of receipt.images) {
    const path = `AleriaAlmanach/assets/loading-screen/${source}`;
    await access(new URL(`../../${path}`, import.meta.url));
    assert.equal(shouldPublish(path), false, path);
  }
  const runtimePaths = [
    manifestPath,
    'AleriaAlmanach/modules/loading-screen/loading-screen-vignettes.js',
    'AleriaAlmanach/modules/loading-screen/loading-screen-vignettes.css',
    ...Object.values(manifest.scenes).flatMap(({ assets }) => assets.map(({ file }) => `AleriaAlmanach/${file}`))
  ];
  for (const path of runtimePaths) {
    await access(new URL(`../../${path}`, import.meta.url));
    assert.equal(shouldPublish(path), true, path);
  }
});

test('creature and biography illustrations publish through their reviewed runtime paths', async () => {
  const assets = [
    ['AleriaAlmanach/assets/ysabel-bronnor/gwaedor-v4.png', true],
    ['AleriaAlmanach/assets/ysabel-bronnor/neddwyn-v4.png', true],
    ['AleriaAlmanach/docs/art/ysabel-bronnor-20261121/generation-prompts.json', false],
    ['Bestiarium/assets/kreaturenkarten/portraits/rhewddann-warg.webp', true],
    ['AleriaAlmanach/docs/art/creature-card-scenes-20261121/', false]
  ];
  for (const [path, isPublic] of assets) {
    await access(new URL(`../../${path}`, import.meta.url));
    assert.equal(shouldPublish(path), isPublic, path);
  }
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

test('the fitting room publishes its stage and keeps the ImageGen masters in the source tree', async () => {
  const root = 'AleriaAlmanach/';
  const manifestPath = root + 'public/assets/loading-screen/refri-anprobe-v2-manifest.json';
  const promptPath = root + 'assets/loading-screen/refri-anprobe-v2-prompts.json';
  const manifest = JSON.parse(await readFile(new URL(`../../${manifestPath}`, import.meta.url), 'utf8'));
  const prompts = JSON.parse(await readFile(new URL(`../../${promptPath}`, import.meta.url), 'utf8'));
  const paths = [
    promptPath, ...prompts.images.map(({ source }) => root + 'assets/loading-screen/' + source),
    manifestPath, ...['js', 'css'].map(extension => root + 'modules/loading-screen/loading-screen-fitting-room.' + extension),
    ...[...manifest.background.assets, manifest.door.asset, manifest.sound, ...Object.values(manifest.peeks).map(({ asset }) => asset)]
      .map(({ file }) => root + file)
  ];
  for (const path of paths) {
    await access(new URL(`../../${path}`, import.meta.url));
    assert.equal(shouldPublish(path), !path.startsWith(root + 'assets/'), path);
  }
});

test('blanket archery ships the stage, pose atlases and shared battle theme', async () => {
  const root = 'AleriaAlmanach/';
  const base = 'public/assets/loading-screen/';
  const assets = JSON.parse(await readFile(new URL('../../' + root + base + 'carys-schiessuebung-v2-manifest.json',
    import.meta.url), 'utf8'));
  const module = root + 'modules/loading-screen/';
  const paths = [
    root + base + 'carys-schiessuebung-v2-manifest.json',
    root + 'assets/loading-screen/carys-schiessuebung-v2-prompts.json',
    root + 'assets/loading-screen/carys-schiessuebung-v2-ausgaenge-prompts.json',
    ...[assets.teaser.source, ...assets.teaser.assets, assets.room.source, assets.room.asset,
      assets.carys.source, assets.carys.asset, assets.einion.source, assets.einion.asset,
      ...Object.values(assets.arrows).flatMap(({ source, asset }) => [source, asset]),
      ...Object.values(assets.reactions).flatMap(({ source, asset }) => [source, asset])].map(({ file }) => root + file),
    module + 'blanket-archery/archery-game.js', module + 'blanket-archery/archery-game.css',
    module + 'games/loading-combat-music.js', module + 'games/loading-game-audio.js'
  ];
  for (const path of paths) {
    await access(new URL('../../' + path, import.meta.url));
    assert.equal(shouldPublish(path), !path.startsWith(root + 'assets/'), path);
  }
});
