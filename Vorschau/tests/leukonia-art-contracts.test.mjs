import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { HOUSES } from '../Leukonia/house-data.mjs';
import { ARTWORKS } from '../Leukonia/art-data.mjs';
import { CLASS_PROTOTYPES, WARRIORS } from '../Leukonia/warrior-data.mjs';

const country = new URL('../Leukonia/', import.meta.url);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

test('Alle acht gelieferten Wappenoriginale bleiben bytegleich und über ihre öffentlichen Originalpfade erreichbar', async () => {
  const manifest = JSON.parse(await readFile(new URL('assets.source.json', country), 'utf8'));
  assert.deepEqual(new Set(manifest.suppliedEmblems.map(item => item.id)),
    new Set(['apinia', 'bolar', 'lex', 'orania', 'pelagia', 'tremelia', 'mede', 'argentum']));
  assert.equal(manifest.suppliedEmblems.length, 8);
  for (const original of manifest.suppliedEmblems) {
    const publicItem = original.id === 'argentum'
      ? ARTWORKS.find(item => item.id === 'realm-argentum')
      : HOUSES.find(item => item.id === `house-${original.id}`);
    assert.equal(original.originalUnchanged, true, original.id);
    assert.equal(publicItem.original, original.original, original.id);
    assert.equal(digest(await readFile(new URL(publicItem.original, country))), original.sha256, original.id);
  }
});

test('Jedes der 39 aktiven Häuser besitzt eine eigene fertige Figur mit geprüftem Original, PNG und WebP', async () => {
  assert.equal(HOUSES.length, 39);
  assert.equal(WARRIORS.length, 39);
  assert.deepEqual(new Set(WARRIORS.map(item => item.houseId)), new Set(HOUSES.map(item => item.id)));
  assert.equal(new Set(WARRIORS.map(item => item.id)).size, 39);
  assert.equal(new Set(WARRIORS.map(item => item.image)).size, 39);
  assert.equal(new Set(WARRIORS.map(item => item.fullsize)).size, 39);
  const manifest = JSON.parse(await readFile(new URL('assets/warriors/manifest.json', country), 'utf8'));
  const entries = new Map(manifest.entries.map(item => [item.id, item]));
  const sources = new Set(), productions = new Set();
  for (const figure of WARRIORS) {
    assert.equal(figure.id, figure.houseId);
    assert.equal(figure.ready, true, figure.id);
    assert.equal(figure.status, 'proposal', figure.id);
    assert.ok(CLASS_PROTOTYPES.some(item => item.id === figure.prototypeId), figure.id);
    // A revised illustration retains its house ID and owns a distinct asset stem.
    const matching = manifest.entries.filter(item => item.production === figure.fullsize && item.preview === figure.image);
    assert.equal(matching.length, 1, figure.id);
    const receipt = matching[0];
    assert.equal(receipt.production, figure.fullsize, figure.id);
    assert.equal(receipt.preview, figure.image, figure.id);
    for (const [file, expected] of [
      [receipt.source, receipt.sourceSha256],
      [figure.fullsize, receipt.productionSha256],
      [figure.image, receipt.previewSha256],
    ]) assert.equal(digest(await readFile(new URL(file, country))), expected, `${figure.id}: ${file}`);
    assert.equal(receipt.proof.originalUnchanged, true, figure.id);
    assert.equal(receipt.proof.rgbUnchanged, true, figure.id);
    assert.equal(receipt.proof.sourceTransparentPixelsExposed, 0, figure.id);
    assert.equal(receipt.proof.corePixelsNotOpaque, 0, figure.id);
    assert.equal(receipt.proof.originalTransparentGapsFilled, false, figure.id);
    assert.equal(receipt.alpha.touchesCanvas, false, figure.id);
    assert.ok(receipt.alpha.transparentPixels > 0, figure.id);
    sources.add(receipt.sourceSha256);
    productions.add(receipt.productionSha256);
  }
  assert.equal(sources.size, 39, 'Jedes Haus benötigt ein eigenes Original, keinen wiederverwendeten Prototypen.');
  assert.equal(productions.size, 39, 'Jedes Haus benötigt eine eigene Produktionsdatei.');
  for (const prototype of CLASS_PROTOTYPES) {
    const receipt = entries.get(prototype.id);
    assert.ok(receipt, prototype.id);
    assert.equal(sources.has(receipt.sourceSha256), false, prototype.id);
    assert.equal(productions.has(receipt.productionSha256), false, prototype.id);
  }
});

test('Mede V2 replaces only its selected house illustration and retains the original V1 source and artwork', async () => {
  const readJson = async file => JSON.parse(await readFile(new URL(file, country), 'utf8'));
  const revisions = await readJson('sources/house-warrior-revisions.json');
  const revision = revisions.jobs.find(item => item.houseId === 'house-mede');
  assert.equal(revisions.jobs.filter(item => item.houseId === 'house-mede').length, 1);
  assert.equal(revision.assetStem, 'house-mede-v2');
  assert.equal(revision.supersedesAssetStem, 'house-mede');
  const selectedJobs = (await readJson('sources/house-warrior-generation-jobs.json')).jobs;
  const selected = selectedJobs.filter(item => item.houseId === 'house-mede');
  assert.equal(selectedJobs.length, 39);
  assert.equal(selected.length, 1);
  assert.equal(selected[0].id, revision.id);
  assert.equal(selected[0].assetStem, revision.assetStem);
  const figure = WARRIORS.find(item => item.houseId === 'house-mede');
  assert.equal(figure.id, 'house-mede');
  assert.equal(figure.fullsize, 'assets/warriors/production/house-mede-v2.png');
  assert.equal(figure.image, 'assets/warriors/previews/house-mede-v2.webp');
  const base = (await readJson('sources/house-warriors-original-jobs.json')).jobs.find(item => item.houseId === 'house-mede');
  assert.equal(base.assetStem, 'house-mede');
  assert.notEqual(base.id, revision.id);
  const previous = (await readJson('sources/results-house-warriors-original.json')).records.find(item => item.houseId === 'house-mede');
  for (const [file, expected] of [
    [previous.copiedOriginal, previous.copiedOriginalSha256],
    [previous.production, previous.productionSha256],
    [previous.preview, previous.previewSha256],
  ]) assert.equal(digest(await readFile(new URL(file, country))), expected, file);
  assert.notEqual(digest(await readFile(new URL(figure.fullsize, country))), previous.productionSha256);
});

test('Alle berittenen Figuren verweisen auf den vorhandenen Equo-Eintrag; sonstige Rollen erhalten keine erfundene Pferdezuordnung', async () => {
  const equo = { name: 'Equo', href: '../../Bestiarium/tiere/pferde/equo/index.html' };
  await access(new URL(equo.href, country));
  for (const figure of [...CLASS_PROTOTYPES, ...WARRIORS]) {
    const mounted = (figure.prototypeId || figure.id) === 'prototype-03';
    assert.deepEqual(figure.mount, mounted ? equo : null, figure.id);
  }
});
