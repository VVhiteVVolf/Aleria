import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { FAMILY_REGISTRY } from '../../../Stammbäume/assets/js/data/families.registry.js';
import { createGalleryState, validateAssignments } from '../gallery-state.mjs';

const catalog = JSON.parse(readFileSync(new URL('../data/catalog.json', import.meta.url)));
const root = new URL('../../../', import.meta.url);
const memoryStorage = () => {
  const data = new Map();
  return { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) };
};

test('every canonical register house is present exactly once, including houses without artwork', () => {
  assert.equal(new Set(catalog.houses.map(h => h.id)).size, catalog.houses.length);
  assert.deepEqual(catalog.houses.filter(h => h.kind === 'registered').map(h => h.id).sort(), FAMILY_REGISTRY.map(h => h.id).sort());
  assert.ok(catalog.houses.some(h => h.kind === 'mentioned'));
  assert.ok(!catalog.houses.some(h => /Unbekanntes Haus/.test(h.name)));
  for (const house of catalog.houses) for (const id of house.illustrationIds) assert.ok(catalog.illustrations.some(i => i.id === id && i.houseIds.includes(house.id)));
});

test('artwork exists, copies are deduplicated, class icons and civilian motifs are excluded', () => {
  assert.equal(new Set(catalog.illustrations.map(i => i.sha256)).size, catalog.illustrations.length);
  for (const image of catalog.illustrations) {
    assert.ok(existsSync(new URL(image.image, root)), image.image);
    assert.doesNotMatch(image.image, /IconOrdner|Klassenordner|drachentanz-kampfstil-klassen|haus-caerlaen|haus-caerthwyn/i);
    for (const id of image.houseIds) assert.ok(catalog.houses.some(h => h.id === id), id);
  }
  for (const id of ['haus-caerlaen', 'haus-caerthwyn']) assert.equal(catalog.houses.find(h => h.id === id).illustrationIds.length, 0);
});

test('city guards and clergy do not create unsupported house assignments', () => {
  assert.ok(catalog.illustrations.some(i => /Cochllamwyr/.test(i.name)));
  for (const image of catalog.illustrations.filter(i => i.affiliation)) assert.deepEqual(image.houseIds, []);
  assert.ok(catalog.illustrations.some(i => i.houseIds.includes('haus-dubhan-gwynthor')));
  assert.ok(!catalog.illustrations.some(i => i.houseIds.includes('haus-dubhan')));
});

test('assignments persist, change missing coverage, and keep provenance unchanged', () => {
  const storage = memoryStorage();
  const state = createGalleryState(catalog, storage);
  const image = catalog.illustrations.find(i => !i.houseIds.length);
  const house = catalog.houses.find(h => h.kind === 'registered' && !h.illustrationIds.length);
  state.assign(image.id, house.id);
  state.assign(image.id, house.id);
  assert.deepEqual(state.assignments(image), [house.id]);
  assert.ok(!state.selectHouses({ view: 'missing' }).some(h => h.id === house.id));
  assert.deepEqual(image.houseIds, []);
  const reloaded = createGalleryState(catalog, storage);
  assert.deepEqual(reloaded.assignments(image), [house.id]);
  reloaded.restore(image.id);
  assert.deepEqual(reloaded.assignments(image), []);
});

test('removing all source assignments survives reload and restore recovers source membership', () => {
  const storage = memoryStorage();
  const state = createGalleryState(catalog, storage);
  const image = catalog.illustrations.find(i => i.houseIds.length === 1);
  state.remove(image.id, image.houseIds[0]);
  const reloaded = createGalleryState(catalog, storage);
  assert.deepEqual(reloaded.assignments(image), []);
  reloaded.restore(image.id);
  assert.deepEqual(reloaded.assignments(image), image.houseIds);
});

test('invalid imports are atomic and do not overwrite existing work', () => {
  const state = createGalleryState(catalog, memoryStorage());
  const image = catalog.illustrations[0];
  state.assign(image.id, catalog.houses[0].id);
  const before = JSON.stringify(state.serialize());
  assert.throws(() => state.importData({ schema: 'aleria.warrior-gallery.assignments', version: 1, assignments: { [image.id]: ['unknown-house'] } }));
  assert.equal(JSON.stringify(state.serialize()), before);
  assert.throws(() => validateAssignments({ assignments: [] }, catalog));
});

test('accent-insensitive search and register scope retain empty houses', () => {
  const state = createGalleryState(catalog, memoryStorage());
  assert.ok(state.selectHouses({ query: 'sudstahl' }).some(h => h.id === 'haus-suedstahl'));
  assert.equal(state.selectHouses({ view: 'houses', scope: 'registered' }).length, FAMILY_REGISTRY.length);
  assert.ok(state.selectHouses({ view: 'missing', query: 'Caerlaen' }).length);
});

test('unavailable browser storage still permits work and reports the need to export', () => {
  const state = createGalleryState(catalog, { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } });
  assert.ok(state.warning);
  assert.match(state.assign(catalog.illustrations[0].id, catalog.houses[0].id), /exportieren/);
  assert.ok(state.assignments(catalog.illustrations[0]).includes(catalog.houses[0].id));
});

test('the local review accounts for every source and exposes all included variants', () => {
  const review = JSON.parse(readFileSync(new URL('../data/local-source-review.json', import.meta.url)));
  const imports = JSON.parse(readFileSync(new URL('../data/local-images.json', import.meta.url)));
  const reviewed = new Map(review.files.map(file => [file.index, file]));
  const included = review.files.filter(file => file.status === 'included');
  assert.equal(review.files.reduce((total, file) => total + file.copies.length, 0), 711);
  const grouped = review.groups.flatMap(group => group.sourceIndices);
  assert.equal(new Set(grouped).size, included.length);
  assert.deepEqual(grouped.sort((a, b) => a - b), included.map(file => file.index).sort((a, b) => a - b));
  for (const group of review.groups) {
    const image = catalog.illustrations.find(image => image.localGroup === group.key);
    assert.ok(image, group.key);
    const imported = imports.groups.find(imported => imported.key === group.key);
    for (const index of group.sourceIndices) {
      const source = reviewed.get(index);
      const variant = imported.variants.find(variant => variant.sourceSha256 === source.sha256);
      assert.ok(variant, source.file);
      assert.ok(image.variants.some(imageVariant => imageVariant.image === variant.image), variant.image);
      assert.ok(existsSync(new URL(variant.thumbnail, root)), variant.thumbnail);
    }
  }
  for (const file of review.files.filter(file => /\/Icons\/|\/Wappen\//.test(file.file))) assert.equal(file.status, 'excluded');
});
