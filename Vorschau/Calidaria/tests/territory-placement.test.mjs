import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { MAP_VARIANTS, REGIONS, ARCHONATES, IMPERIAL_DOMAIN, SETTLEMENTS, SOURCE_HOUSE_SEATS } from '../territory-data.mjs';
import { REALM_CONTEXT } from '../realm-context.mjs';
import { REALM_CONTEXT as ARGENTUM } from '../../Leukonia/realm-context.mjs';
import { createHousePlacementState } from '../placement-state.mjs';
import { createMapProposal } from '../map-data.mjs';

const houses = [
  { id: 'colony-01', name: 'Arbeitsnummer 01', culture: 'argentum', sourceSeat: null, rank: null, crest: 'assets/emblems/previews/colony-01.webp' },
  { id: 'tlapanui-01', name: 'Arbeitsnummer 02', culture: 'tlapanui', sourceSeat: null, rank: null, crest: 'assets/emblems/previews/tlapanui-01.webp' },
  { id: 'house-mede', name: 'Haus Mede', culture: 'argentum', sourceSeat: SOURCE_HOUSE_SEATS[0].settlementId, rank: 'Kaiserliche Linie', crest: '../Leukonia/assets/originals/previews/mede.webp' },
];
const createState = () => createHousePlacementState({ houses, settlements: SETTLEMENTS });

test('Die Karte umfasst sieben Archonate und eine getrennte kaiserliche Domäne mit insgesamt 22 Orten', () => {
  assert.equal(ARCHONATES.length, 7);
  assert.equal(REGIONS.length, 8);
  assert.equal(SETTLEMENTS.length, 22);
  assert.equal(new Set(SETTLEMENTS.map(city => city.id)).size, 22);
  assert.equal(SETTLEMENTS.filter(city => city.sourceMarkerShape === 'circle').length, 14);
  assert.equal(SETTLEMENTS.filter(city => city.sourceMarkerShape === 'square').length, 7);
  assert.equal(SETTLEMENTS.filter(city => city.sourceMarkerShape === 'diamond').length, 1);
  const coverage = REGIONS.flatMap(region => region.cityIds);
  assert.equal(coverage.length, 22);
  assert.equal(new Set(coverage).size, 22);
  assert.ok(SETTLEMENTS.every(city => coverage.includes(city.id)));
  assert.ok(ARCHONATES.every(region => region.houseId === null && region.capitalId === null));
  assert.ok(IMPERIAL_DOMAIN.imperialDomain);
  assert.equal(IMPERIAL_DOMAIN.houseId, 'house-mede');
  assert.equal(IMPERIAL_DOMAIN.capitalId, SETTLEMENTS.find(city => city.sourceMarkerShape === 'diamond').id);
  assert.equal(SOURCE_HOUSE_SEATS[0].settlementId, IMPERIAL_DOMAIN.capitalId);
  assert.ok(SETTLEMENTS.filter(city => city.imperialDomain).every(city => city.regionId === IMPERIAL_DOMAIN.id && city.archonateId === null));
});

test('Beide Karten verwenden dieselben gemessenen Quellmarker; alle Prozentanker bleiben innerhalb des Bildes', async () => {
  const source = JSON.parse(await readFile(new URL('../sources/map-sources.json', import.meta.url), 'utf8'));
  for (const variant of MAP_VARIANTS) {
    const entry = source.maps.find(map => map.id === variant.id);
    await access(new URL('../' + variant.map, import.meta.url));
    assert.deepEqual(variant.imageSize, entry.imageSize);
    assert.equal(entry.sourceMarkers.length, 22);
    assert.equal(variant.bakedNames, false);
    for (const [index, city] of SETTLEMENTS.entries()) {
      assert.ok(city.point.every(value => value > 0 && value < 100));
      assert.ok(city.pin.every(value => value > 0 && value < 100));
      assert.ok(city.label.every(value => value > 0 && value < 100));
      const sourcePoint = entry.sourceMarkers[index].centre;
      assert.ok(sourcePoint.every((value, axis) => Math.abs(value - city.sourcePixelCentre[axis]) <= 1));
    }
  }
});

test('Calidaria übernimmt nur die gemeinsame Reichsordnung und erhält ihre eigene Kultur und offenen Namen', () => {
  for (const key of ['government', 'administration', 'nobility', 'offices', 'institutions', 'military', 'religion']) {
    assert.equal(REALM_CONTEXT[key], ARGENTUM[key]);
  }
  assert.equal(REALM_CONTEXT.title, 'Calidaria');
  assert.ok(SETTLEMENTS.every(city => city.nameStatus === 'open'));
  assert.ok(REALM_CONTEXT.history.some(item => item.id === 'tlapatlan'));
  assert.ok(!REALM_CONTEXT.history.some(item => item.id === 'leukonia-silverant'));
});

test('Neue Häuser beginnen ohne Sitz; Mede sitzt in der Raute und ein Wechsel begründet keine neuen Hausdaten', () => {
  const state = createState(), initial = state.current(), before = structuredClone(houses);
  assert.ok(Object.entries(initial).filter(([id]) => id !== 'house-mede').every(([, seat]) => seat === null));
  assert.equal(initial['house-mede'], IMPERIAL_DOMAIN.capitalId);
  const target = IMPERIAL_DOMAIN.cityIds[0];
  assert.ok(state.move('colony-01', target));
  assert.ok(state.move('tlapanui-01', target));
  assert.deepEqual(houses, before);
  assert.equal(JSON.parse(state.serialize()).realm, 'calidaria');
  assert.ok(state.undo());
  assert.equal(state.current()['tlapanui-01'], null);
  assert.ok(state.reset());
  assert.deepEqual(state.current(), initial);
  const variants = MAP_VARIANTS.map(variant => createMapProposal({ houses, placements: initial, variant }));
  assert.deepEqual(variants[0].settlements, variants[1].settlements);
  assert.ok(variants.every(variant => variant.clans.every(house => house.seat === initial[house.id])));
  const mede = variants[0].clans.find(house => house.id === 'house-mede');
  assert.equal(new URL('assets/' + mede.crest, new URL('../', import.meta.url)).href,
    new URL('../../Leukonia/assets/originals/previews/mede.webp', import.meta.url).href);
  const pending = createMapProposal({ houses: [...houses, { id: 'pending', ready: false, crest: null }], placements: { ...initial, pending: target } });
  assert.ok(!pending.clans.some(house => house.id === 'pending'));
});

test('Fremde oder unvollständige Importe verändern weder den Calidaria-Entwurf noch seine Historie', () => {
  const state = createState();
  state.move('colony-01', SETTLEMENTS[0].id);
  const prior = state.current(), canUndo = state.canUndo();
  const invalid = [
    { schemaVersion: 1, realm: 'leukonia', placements: prior },
    { schemaVersion: 1, realm: 'calidaria', placements: { 'colony-01': null } },
    { schemaVersion: 1, realm: 'calidaria', placements: { ...prior, unknown: null } },
    { schemaVersion: 1, realm: 'calidaria', placements: { ...prior, 'tlapanui-01': 'foreign-seat' } },
  ];
  for (const value of invalid) {
    assert.throws(() => state.restore(value));
    assert.deepEqual(state.current(), prior);
    assert.equal(state.canUndo(), canUndo);
  }
});
