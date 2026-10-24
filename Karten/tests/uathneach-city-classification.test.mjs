import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { structure } from '../../Stammbäume/assets/js/data/uathneach-territorial-catalog.js';
import { markers, cityClassifications } from '../Uathneach/places.mjs';
import { classifyCity } from '../Uathneach/city-classification.mjs';
import { pages } from '../../Kontinente/modules/uathneach/page-source.mjs';

const stored = JSON.parse(fs.readFileSync(new URL('../Uathneach/data.json', import.meta.url), 'utf8'));

test('the Uathneach overview classifies cities by the highest resident clan rank', () => {
  const expected = {
    Hauptstadt: ['dunnean'],
    'Große Stadt': ['moineal', 'cathair', 'orglen', 'rinnmara', 'temair', 'kharanor'],
    'Normal große Stadt': ['bronnan', 'treabhair', 'caorthann', 'mhorcha', 'rioghain'],
    Burgstadt: ['reithe', 'mhor', 'cuan'],
    'Stadt · Größe offen': ['fethlinn', 'dathuil', 'ceithirn'],
  };
  for (const [type, ids] of Object.entries(expected)) {
    assert.deepEqual([...cityClassifications].filter(([,city]) => city.type === type).map(([id]) => id).sort(), ids.sort());
  }
  assert.equal(cityClassifications.get('temair').role, 'Regionshauptstadt');
  assert.equal(cityClassifications.get('rioghain').size, 'Normal groß');
  assert.equal(cityClassifications.get('reithe').size, 'Klein');
});

test('local Lairds cannot downgrade a greater clan seat, and unknown ranks stay open', () => {
  const place = { id: 'shared-city' };
  const clans = [{ seat: place.id, rankId: 'laird' }, { seat: place.id, rankId: 'mor-tiarna' }];
  assert.equal(classifyCity(place, clans).type, 'Große Stadt');
  assert.equal(classifyCity(place, [{ seat: place.id, rankId: 'laird' }]).type, 'Kleine Stadt');
  for (const id of ['fiodhran', 'creagan', 'einsiedlerkrebs']) assert.equal(structure.clans.find(c => c.id === id).rankId, 'unknown');
  assert.equal(classifyCity(place, [{ seat: place.id, rankId: 'unknown' }]).pending, true);
});

test('map filters, marker tables and territory registers retain the same urban classification', () => {
  assert.equal(stored.revision, 5);
  assert.equal(stored.state.cats.length, 5);
  const categories = new Map(stored.state.cats.map(category => [category.id, category.label]));
  const markersById = new Map(markers.map(marker => [marker.id, marker]));
  for (const pin of stored.state.pins) {
    const marker = markersById.get(pin.id);
    assert.equal(categories.get(pin.cat), marker.category);
    assert.equal(pin.table.find(row => row.k === 'Typ').v, marker.category);
    assert.ok(!/leuchtturm|dorf|burgsiedlung|hafen|wald/i.test(marker.category));
    if (marker.category === 'Stadt · Größe offen') assert.match(pin.table.find(row => row.k === 'Größenklasse').v, /Offen/);
  }
  let places = 0;
  for (const page of pages) for (const domain of page.domains) for (const section of domain.sections) {
    for (const id of section.placeIds) {
      assert.equal(section.title, markersById.get(id).category);
      places++;
    }
  }
  assert.equal(places, 18);
});

test('the shared category upgrade preserves the reviewed city-only overview filters', () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(new URL('../assets/js/pins/category-catalog.js', import.meta.url), 'utf8'), context);
  const result = JSON.parse(JSON.stringify(context.KartoCategoryCatalog.upgrade(stored.state)));
  assert.deepEqual(result.cats, stored.state.cats);
  assert.equal(result.categoryCatalogVersion, stored.state.categoryCatalogVersion);
  for (const category of stored.state.cats) {
    assert.match(context.KartoCategoryCatalog.placeholder(category), /settlement-(?:hauptstadt|stadt|burgsiedlung)\.webp$/);
  }
});
