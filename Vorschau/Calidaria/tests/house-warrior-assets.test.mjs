import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { HOUSES } from '../house-data.mjs';
import { CLASS_PROTOTYPES, WARRIORS } from '../warrior-data.mjs';
import { WARRIORS as LEUKONIA_WARRIORS } from '../../Leukonia/warrior-data.mjs';

const country = new URL('../', import.meta.url);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

test('Jedes Calidaria-Haus besitzt eine eigene fertige Darstellung; neue Figuren ersetzen keine Prototypen', async () => {
  assert.equal(HOUSES.length, 29);
  assert.equal(WARRIORS.length, 29);
  assert.deepEqual(new Set(WARRIORS.map(item => item.houseId)), new Set(HOUSES.map(item => item.id)));
  assert.equal(new Set(WARRIORS.map(item => item.image)).size, 29);
  assert.equal(new Set(WARRIORS.map(item => item.fullsize)).size, 29);
  const manifest = JSON.parse(await readFile(new URL('assets/warriors/manifest.json', country), 'utf8'));
  const newFigures = WARRIORS.filter(item => item.status === 'proposal');
  assert.equal(newFigures.length, 28);
  const originals = new Set();
  for (const figure of newFigures) {
    assert.equal(figure.ready, true, figure.houseId);
    const receipt = manifest.entries.find(item => item.production === figure.fullsize && item.preview === figure.image);
    assert.ok(receipt, figure.houseId);
    for (const [file, expected] of [
      [receipt.source, receipt.sourceSha256], [receipt.production, receipt.productionSha256], [receipt.preview, receipt.previewSha256],
    ]) assert.equal(digest(await readFile(new URL(file, country))), expected, figure.houseId + ': ' + file);
    assert.equal(receipt.proof.originalUnchanged, true, figure.houseId);
    assert.equal(receipt.proof.rgbUnchanged, true, figure.houseId);
    assert.equal(receipt.proof.originalTransparentGapsFilled, false, figure.houseId);
    assert.equal(receipt.proof.sourceTransparentPixelsExposed, 0, figure.houseId);
    assert.equal(receipt.alpha.touchesCanvas, false, figure.houseId);
    const house = HOUSES.find(item => item.id === figure.houseId);
    if (house.culture === 'tlapanui') assert.ok(CLASS_PROTOTYPES.some(item => item.id === figure.prototypeId), figure.houseId);
    if (figure.mount) await access(new URL(figure.mount.href, country));
    originals.add(receipt.sourceSha256);
  }
  assert.equal(originals.size, 28, 'Die neuen Hausbilder müssen eigenständige Originale sein.');
  for (const prototype of CLASS_PROTOTYPES) {
    const receipt = manifest.entries.find(item => item.production === prototype.fullsize);
    assert.ok(receipt, prototype.id);
    assert.equal(originals.has(receipt.sourceSha256), false, prototype.id);
  }
});

test('Mede verwendet seine vorhandene Darstellung und bleibt der Hauptstadt zugeordnet', async () => {
  const source = LEUKONIA_WARRIORS.find(item => item.houseId === 'house-mede');
  const figure = WARRIORS.find(item => item.houseId === 'house-mede');
  const house = HOUSES.find(item => item.id === 'house-mede');
  assert.equal(figure.status, 'supplied');
  assert.equal(figure.fullsize, '../Leukonia/' + source.fullsize);
  assert.equal(figure.image, '../Leukonia/' + source.image);
  assert.equal(house.sourceSeat, 'ort-06');
  await access(new URL(figure.fullsize, country));
});
