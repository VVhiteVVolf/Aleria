import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { HOUSES } from '../Leukonia/house-data.mjs';
import { ARTWORKS } from '../Leukonia/art-data.mjs';
import { SOCIAL_CASTES } from '../Leukonia/culture-data.mjs';
import { REALM_CONTEXT } from '../Leukonia/realm-context.mjs';
import { CLASS_PROTOTYPES, WARRIORS } from '../Leukonia/warrior-data.mjs';
import { ARCHONATES, SETTLEMENTS, MAP_VARIANTS } from '../Leukonia/territory-data.mjs';
import { createHousePlacementState } from '../Leukonia/placement-state.mjs';
import { createMapProposal } from '../Leukonia/map-data.mjs';

const country = new URL('../Leukonia/', import.meta.url);
const createState = () => createHousePlacementState({ houses: HOUSES, settlements: SETTLEMENTS });

test('Leukonia verwendet ausschließlich fünf Festlandarchonate und 26 Orte; Bolar behält Rang und offenen Sitz', () => {
  assert.equal(ARCHONATES.length, 5);
  assert.equal(SETTLEMENTS.length, 26);
  assert.equal(HOUSES.length, 39);
  assert.equal(HOUSES.filter(house => house.status === 'supplied').length, 7);
  assert.equal(HOUSES.filter(house => house.rank === 'Archon').length, 6);
  assert.equal(HOUSES.find(house => house.id === 'house-bolar').sourceSeat, null);
  assert.equal(HOUSES.find(house => house.id === 'house-bolar').rank, 'Archon');
  assert.equal(HOUSES.find(house => house.id === 'house-mede').sourceSeat, 'zaphias');
  assert.ok(!ARCHONATES.some(item => item.id === 'archonat-insel'));
  assert.ok(!SETTLEMENTS.some(item => ['ort-23', 'ort-24'].includes(item.id)));
  const cityIds = new Set(SETTLEMENTS.map(city => city.id));
  const covered = ARCHONATES.flatMap(archonate => archonate.cityIds);
  assert.equal(new Set(covered).size, SETTLEMENTS.length);
  assert.equal(covered.length, SETTLEMENTS.length);
  assert.ok(covered.every(id => cityIds.has(id)));
  assert.ok(ARCHONATES.every(item => item.capitalId === null));
  assert.equal(SETTLEMENTS.find(city => city.id === 'zaphias').imperialDomain, true);
  assert.equal(Object.values(createState().current()).filter(Boolean).length, 6);
  assert.equal(Object.values(createState().current()).filter(seat => seat === null).length, 33);
});

test('Sitzwechsel bleiben frei und verändern Rang, Hausdaten und kaiserlichen Gebietsstatus nicht', () => {
  const before = structuredClone(HOUSES), state = createState(), initial = state.current();
  assert.ok(state.canMove('house-bolar'));
  assert.ok(state.move('house-bolar', 'zaphias'));
  assert.ok(state.move('pool-01', 'zaphias'));
  assert.equal(state.current()['house-mede'], 'zaphias');
  assert.equal(state.current()['house-bolar'], 'zaphias');
  assert.equal(state.current()['pool-01'], 'zaphias');
  assert.ok(state.undo());
  assert.equal(state.current()['pool-01'], null);
  assert.ok(state.reset());
  assert.deepEqual(state.current(), initial);
  assert.deepEqual(HOUSES, before);
  assert.equal(SETTLEMENTS.find(city => city.id === 'zaphias').imperialDomain, true);
});

test('Fremde, unvollständige und ausgeschlossene Ortsdaten werden atomar vor Zustand und Historie abgewiesen', () => {
  const state = createState();
  state.move('house-lex', 'allantaic');
  const current = state.current(), canUndo = state.canUndo();
  const invalid = [
    { schemaVersion: 1, realm: 'other-test-realm', placements: current },
    { schemaVersion: 1, realm: 'leukonia', placements: { ...current, 'house-bolar': 'ort-23' } },
    { schemaVersion: 1, realm: 'leukonia', placements: { ...current, unknownHouse: null } },
    { schemaVersion: 1, realm: 'leukonia', placements: Object.fromEntries(Object.entries(current).slice(1)) },
  ];
  for (const draft of invalid) {
    assert.throws(() => state.restore(draft));
    assert.deepEqual(state.current(), current);
    assert.equal(state.canUndo(), canUndo);
  }
  assert.ok(state.undo());
  assert.equal(state.current()['house-lex'], 'alvanista');
});

test('Kartenvarianten teilen Quellanker; veröffentlichte fertige Bilder und der Equo-Verweis existieren', async () => {
  assert.equal(MAP_VARIANTS.length, 2);
  const initial = createState().current();
  const variants = MAP_VARIANTS.map(variant => createMapProposal({ houses: HOUSES, placements: initial, variant }));
  assert.deepEqual(variants[0].settlements.map(city => city.point), variants[1].settlements.map(city => city.point));
  assert.ok(variants.every(variant => variant.clans.find(house => house.id === 'house-bolar').seat === null));
  assert.equal(SOCIAL_CASTES.length, 6);
  assert.equal(REALM_CONTEXT.nobility.length, 1);
  assert.equal(REALM_CONTEXT.offices.length, 13);
  assert.equal(REALM_CONTEXT.institutions.length, 10);
  assert.equal(CLASS_PROTOTYPES.length, 7);
  const equo = CLASS_PROTOTYPES.find(item => item.id === 'prototype-03').mount;
  assert.equal(equo.name, 'Equo');
  assert.equal(equo.href, '../../Bestiarium/tiere/pferde/equo/index.html');
  await access(new URL(equo.href, country));
  const activeArts = ARTWORKS.filter(art => art.kind !== 'archonate'
    || ARCHONATES.some(archonate => archonate.bannerId === art.id || archonate.id === art.archonateId));
  const readyImages = [
    ...MAP_VARIANTS.map(variant => variant.map),
    ...HOUSES.filter(house => house.ready).flatMap(house => [house.crest, house.fullsize]),
    ...activeArts.filter(art => art.ready).flatMap(art => [art.image, art.fullsize]),
    ...CLASS_PROTOTYPES.filter(item => item.ready).flatMap(item => [item.image, item.fullsize]),
    ...WARRIORS.filter(item => item.ready !== false).flatMap(item => [item.image, item.fullsize]),
  ];
  for (const file of new Set(readyImages)) {
    assert.ok(typeof file === 'string' && file.length > 0);
    assert.ok(!file.includes('/generated/'));
    await access(new URL(file, country));
  }
});
