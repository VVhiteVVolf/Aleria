import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { structure, territories } from '../../Stammbäume/assets/js/data/uathneach-territorial-catalog.js';
import { pages } from '../../Kontinente/modules/uathneach/page-source.mjs';

const root = new URL('../../', import.meta.url);
const data = JSON.parse(fs.readFileSync(new URL('Karten/Uathneach/data.json', root)));
const images = JSON.parse(fs.readFileSync(new URL('Karten/Uathneach/map-images.source.json', root)));
const context = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(new URL('Karten/karten.registry.js', root), 'utf8'), context);
const config = context.window.KartoMapRegistry.byId('uathneach');

test('the final supplied region names agree across pages, map dominions and the shared clan structure', () => {
  assert.deepEqual(structure.regions.map(region => region.name), [
    'Tir na Dála', 'Tir na nGleannta', 'Tir na Gairme', 'Tir na Seolta',
    'Tir na Machairí', 'Tir na Faire', 'Tir na gClog',
  ]);
  for (const region of structure.regions) {
    const territory = territories.find(territory => territory.id === region.id);
    const page = pages.find(page => page.id === region.id);
    assert.equal(page.title, region.name);
    assert.equal(data.state.dominions.find(dominion => dominion.id === region.id).name, region.name);
    assert.ok(page.copy.geography.includes(`${region.name} bedeutet „${region.meaning}“.`));
    assert.ok(territory.href.includes('/' + region.routeName + '/'), 'published routes remain reachable');
    assert.ok(fs.existsSync(new URL('.' + territory.href, root)));
  }
  const reithe = data.state.pins.find(pin => pin.id === 'uathneach-reithe');
  assert.equal(reithe.table.find(row => row.k === 'Kartenregion').v, 'Tir na Seolta');
  assert.equal(reithe.table.find(row => row.k === 'Lehenszugehörigkeit').v, 'Tir na Dála · fürstliches Sonderlehen');
});

test('the normal and regional images are separate verified assets with a visible live marker overlay', () => {
  assert.deepEqual(images.imageSize, [4096, 3365]);
  assert.equal(images.sources.length, 2);
  assert.notEqual(data.state.mapImages.normal, data.state.mapImages.regions);
  assert.equal(data.state.mapImages.pins, '', 'symbols do not require a duplicate raster image');
  for (const source of images.sources) {
    const relative = 'Uathneach/' + source.asset;
    const image = fs.readFileSync(new URL('Karten/' + relative, root));
    assert.equal(createHash('sha256').update(image).digest('hex'), source.sha256);
    assert.equal(config.images[source.layer], relative);
    assert.equal(data.state.mapImages[source.layer], '/Karten/' + relative);
    assert.equal(source.lossless, true);
  }
  assert.deepEqual(data.state.layerNames, { normal: 'Normal', pins: 'Mit Markierungen', regions: 'Regionen' });
  assert.equal(config.markerPresentation, 'symbols');
  assert.equal(data.state.markerPresentation, 'symbols');
  assert.equal(data.state.showMarkers, true);
  assert.equal(data.state.showPinLabels, true);
  assert.equal(data.state.pinVisibilityVersion, 1);
  assert.equal(data.state.pins.length, 18);
  vm.runInContext(fs.readFileSync(new URL('Karten/assets/js/pins/pin-presentation.js', root), 'utf8'), context);
  assert.equal(context.window.KartoPinPresentation.resolve({ showMarkers: false }, config).showMarkers, true);
});
