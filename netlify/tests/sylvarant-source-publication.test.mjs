import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldPublish } from '../build/site-publish.mjs';
import { isAuthoringArchive } from '../build/publication-policy.mjs';

test('Sylvarant keeps source imports, prompts, receipts and retired artwork outside the public package', () => {
  for (const relative of ['source-import.json', 'assets.source.json', 'sources/prototypes-root-jobs.json',
    'sources/emblem-asset-receipts.json', 'scripts/build-art-catalog.mjs', 'assets/warriors/manifest.json',
    'assets/warriors/generated/house-pullo.png', 'assets/emblems/generated/province-sylvarant-v2.png',
    'assets/emblems/production/province-sylvarant.png', 'assets/emblems/previews/province-sylvarant.webp']) {
    const file = 'Vorschau/Sylvarant/' + relative;
    assert.equal(isAuthoringArchive(file), true, file);
    assert.equal(shouldPublish(file), false, file);
  }
  assert.equal(shouldPublish('Vorschau/shared/heraldic-artifacts/pipeline.py'), false);
  for (const id of ['house-cerunia', 'house-maborel', 'house-rinia', 'house-stalitia',
    'house-pool-07', 'house-pool-10', 'house-pool-11', 'prototype-03']) {
    for (const [directory, extension] of [['production', 'png'], ['previews', 'webp']]) {
      assert.equal(shouldPublish(`Vorschau/Sylvarant/assets/warriors/${directory}/${id}.${extension}`), false);
      assert.equal(shouldPublish(`Vorschau/Sylvarant/assets/warriors/${directory}/${id}-v2.${extension}`), true);
    }
  }
});

test('Sylvarant runtime modules, original downloads and selected images remain public', () => {
  for (const relative of ['index.html', 'house-data.mjs', 'warrior-data.mjs', 'art-data.mjs',
    'assets/originals/mede.png', 'assets/originals/previews/mede.webp',
    'assets/emblems/production/province-sylvarant-v2.png', 'assets/emblems/previews/province-sylvarant-v2.webp',
    'assets/warriors/production/house-pullo.png', 'assets/warriors/previews/house-pullo.webp']) {
    assert.equal(shouldPublish('Vorschau/Sylvarant/' + relative), true, relative);
  }
  assert.equal(shouldPublish('Vorschau/shared/country-workbench/art-dialog-session.mjs'), true);
});
