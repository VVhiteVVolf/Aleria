import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { shouldPublish } from '../build/site-publish.mjs';
import { isAuthoringArchive } from '../build/publication-policy.mjs';

const root = new URL('../../', import.meta.url);

test('Leukonia authoring requests, prompts, receipts and tools remain source archives', async () => {
  for (const file of [
    'Vorschau/Leukonia/sources/user-request-2026-11-03.txt',
    'Vorschau/Leukonia/sources/heraldry-generation-jobs.json',
    'Vorschau/Leukonia/sources/house-warrior-generation-jobs.json',
    'Vorschau/Leukonia/sources/asset-receipts.json',
    'Vorschau/Leukonia/scripts/build-art-catalog.mjs',
    'Vorschau/Leukonia/scripts/prepare-assets.py',
    'Vorschau/Leukonia/assets.source.json',
    ...['warriors', 'castes'].map(category => `Vorschau/Leukonia/assets/${category}/manifest.json`),
  ]) {
    await access(new URL(file, root));
    assert.equal(isAuthoringArchive(file), true, file);
    assert.equal(shouldPublish(file), false, file);
  }
  // Future nested receipts and archived alternatives must inherit the same boundary.
  for (const file of [
    'Vorschau/Leukonia/sources/later-wave/receipt.json',
    'Vorschau/Leukonia/scripts/later-wave/prepare.mjs',
    ...['warriors', 'emblems', 'banners', 'castes'].map(category => `Vorschau/Leukonia/assets/${category}/manifest.json`),
    ...['warriors', 'emblems', 'banners', 'castes'].flatMap(category =>
      ['generated', 'generated-archive', 'alternates'].map(directory =>
        `Vorschau/Leukonia/assets/${category}/${directory}/later-version.png`)),
  ]) assert.equal(shouldPublish(file), false, file);
});

test('Leukonia runtime, prepared artwork and supplied original downloads stay publishable', async () => {
  for (const file of [
    'Vorschau/Leukonia/index.html',
    'Vorschau/Leukonia/proposal-app.mjs',
    'Vorschau/Leukonia/realm-context.mjs',
    'Vorschau/Leukonia/territory-data.mjs',
    'Vorschau/Leukonia/art-data.mjs',
    'Vorschau/Leukonia/house-data.mjs',
    'Vorschau/Leukonia/warrior-data.mjs',
    'Vorschau/Leukonia/assets/maps/leukonia-normal.webp',
    'Vorschau/Leukonia/assets/emblems/production/leukonia-v2.png',
    'Vorschau/Leukonia/assets/emblems/previews/leukonia-v2.webp',
    'Vorschau/Leukonia/assets/emblems/production/pool-32.png',
    'Vorschau/Leukonia/assets/emblems/previews/pool-32.webp',
    'Vorschau/Leukonia/assets/banners/production/apinia.png',
    'Vorschau/Leukonia/assets/banners/previews/apinia.webp',
    'Vorschau/Leukonia/assets/castes/production/mercantrier.png',
    'Vorschau/Leukonia/assets/castes/previews/mercantrier.webp',
    'Vorschau/Leukonia/assets/warriors/production/prototype-03.png',
    'Vorschau/Leukonia/assets/warriors/previews/prototype-03.webp',
    'Vorschau/Leukonia/assets/warriors/production/house-bolar.png',
    'Vorschau/Leukonia/assets/warriors/previews/house-bolar.webp',
    'Vorschau/Leukonia/assets/warriors/production/house-mede-v2.png',
    'Vorschau/Leukonia/assets/warriors/previews/house-mede-v2.webp',
    'Vorschau/Leukonia/assets/originals/bolar.png',
    'Vorschau/Leukonia/assets/originals/previews/bolar.webp',
    'Vorschau/Leukonia/assets/originals/mede.png',
    'Vorschau/Leukonia/assets/originals/previews/mede.webp',
  ]) {
    await access(new URL(file, root));
    assert.equal(isAuthoringArchive(file), false, file);
    assert.equal(shouldPublish(file), true, file);
  }
});

test('Mede V1 stays a source archive while its active V2 and supplied original crest remain public', async () => {
  for (const [directory, extension] of [['production', 'png'], ['previews', 'webp']]) {
    const previous = `Vorschau/Leukonia/assets/warriors/${directory}/house-mede.${extension}`;
    const current = `Vorschau/Leukonia/assets/warriors/${directory}/house-mede-v2.${extension}`;
    await access(new URL(previous, root));
    await access(new URL(current, root));
    assert.equal(isAuthoringArchive(previous), true, previous);
    assert.equal(shouldPublish(previous), false, previous);
    assert.equal(shouldPublish(current), true, current);
  }
  assert.equal(shouldPublish('Vorschau/Leukonia/assets/originals/mede.png'), true);
  assert.equal(shouldPublish('Vorschau/Leukonia/assets/originals/previews/mede.webp'), true);
});

test('only the four explicitly retired Leukonia proposals are excluded from prepared artwork', async () => {
  const { jobs } = JSON.parse(await readFile(new URL('Vorschau/Leukonia/sources/heraldry-generation-jobs.json', root), 'utf8'));
  const retired = jobs.filter(item => item.active === false);
  assert.deepEqual(new Set(retired.map(item => item.id)),
    new Set(['province-leukonia', 'pool-33', 'pool-34', 'banner-bolar']));
  for (const job of retired) {
    assert.match(job.status, /^(?:superseded-visual-proposal|archived-after-island-exclusion)$/);
    for (const [directory, extension] of [['production', 'png'], ['previews', 'webp']]) {
      const file = `Vorschau/Leukonia/assets/${job.category}/${directory}/${job.assetStem}.${extension}`;
      await access(new URL(file, root));
      assert.equal(isAuthoringArchive(file), true, file);
      assert.equal(shouldPublish(file), false, file);
    }
  }
  // The exclusion belongs to proposals, not to a house name or all of Leukonia.
  for (const job of jobs.filter(item => item.active !== false)) {
    for (const [directory, extension] of [['production', 'png'], ['previews', 'webp']]) {
      const file = `Vorschau/Leukonia/assets/${job.category}/${directory}/${job.assetStem}.${extension}`;
      await access(new URL(file, root));
      assert.equal(shouldPublish(file), true, file);
    }
  }
});

test('Leukonia browser modules do not depend on excluded authoring archives', async () => {
  const { readdir } = await import('node:fs/promises');
  for (const file of (await readdir(new URL('Vorschau/Leukonia/', root))).filter(file => file.endsWith('.mjs'))) {
    const source = await readFile(new URL(`Vorschau/Leukonia/${file}`, root), 'utf8');
    assert.doesNotMatch(source, /(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)["'][^"']*\/(?:sources|scripts)\//, file);
    assert.doesNotMatch(source, /fetch\s*\(\s*["'][^"']*\/(?:sources|scripts)\//, file);
  }
});
