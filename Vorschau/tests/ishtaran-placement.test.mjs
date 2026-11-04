import test from 'node:test';
import assert from 'node:assert/strict';
import { HOUSES } from '../Ishtaran/house-data.mjs';
import { SETTLEMENTS } from '../Ishtaran/territory-data.mjs';
import { createHousePlacementState } from '../Ishtaran/placement-state.mjs';
import { createMapProposal, MAP_VARIANTS } from '../Ishtaran/map-data.mjs';
import { createProposalDraft } from '../Ishtaran/proposal-draft.mjs';
import { PLACEMENT_STORAGE_KEY, prepareStoredPlacements } from '../Ishtaran/placement-storage.mjs';
import { HOUSE_NAME_PROPOSALS } from '../Ishtaran/name-proposals.mjs';

const makeState = () => createHousePlacementState({ houses: HOUSES, settlements: SETTLEMENTS });
const initialSeat = house => house.initialSeatId;
const exampleTarkans = ['pool-13', 'pool-14', 'pool-22', 'pool-26', 'pool-10'].map(id => HOUSES.find(house => house.id === id));

test('Ishtaran startet mit allen 37 Häusern an 20 bewohnten Orten und einer unbelegbaren Ruine', () => {
  const state = makeState(), current = state.current();
  assert.equal(HOUSES.length, 37); assert.equal(SETTLEMENTS.length, 21);
  assert.equal(Object.values(current).filter(value => value !== null).length, 37);
  assert.equal(HOUSES.filter(house => initialSeat(house) === null).length, 0);
  assert.equal(Object.values(current).filter(value => value === 'capital').length, 4);
  assert.equal(SETTLEMENTS.filter(city => city.tier === 'capital').length, 1);
  assert.equal(SETTLEMENTS.filter(city => city.tier === 'pascha').length, 8);
  assert.equal(SETTLEMENTS.filter(city => city.tier === 'tarkan').length, 12);
  assert.equal(HOUSES.find(house => house.id === 'source-07').name, 'Aschina');
  assert.equal(HOUSES.find(house => house.id === 'source-03').name, 'Dahakid');
  assert.ok(!HOUSES.some(house => house.id === 'maghneach'));
  for (const city of SETTLEMENTS) assert.equal(HOUSES.some(house => current[house.id] === city.id), !city.destroyed, city.name);
  assert.equal(SETTLEMENTS.filter(city => city.destroyed).length, 1);
  assert.equal(SETTLEMENTS.find(city => city.id === 'small-10').capacity, 0);
  assert.equal(current['source-05'], 'large-05');
});

test('Rang- und Ortsgrenzen gelten atomar bei jedem Verschieben, ohne feste Sitzsperren', () => {
  const state = makeState(), initial = state.current();
  const sultan = HOUSES.find(house => house.rank === 'Sultan');
  const firstPascha = HOUSES.find(house => initialSeat(house) === 'large-01' && house.rank === 'Pascha');
  for (const [id, seat] of [[sultan.id, 'large-01'], [firstPascha.id, 'small-01'], [firstPascha.id, 'large-02'],
    [exampleTarkans[0].id, 'large-01'], [exampleTarkans[0].id, 'small-01'], ['source-05', 'small-10'], ['maghneach', 'capital'], [exampleTarkans[0].id, 'missing-city']]) {
    assert.throws(() => state.move(id, seat)); assert.deepEqual(state.current(), initial);
    assert.equal(state.canUndo(), false);
  }
  assert.equal(state.move(sultan.id, null), true);
  assert.equal(state.move(sultan.id, 'capital'), true);
  assert.equal(state.move(firstPascha.id, null), true);
  assert.throws(() => state.move(exampleTarkans[0].id, 'large-01'), 'Ein freier Paschaplatz erlaubt keinen dritten Tarkan');
  assert.equal(state.move(firstPascha.id, 'large-01'), true);
  const smallLeader = HOUSES.find(house => initialSeat(house) === 'small-01');
  assert.equal(state.move(smallLeader.id, null), true);
  assert.equal(state.move(exampleTarkans[0].id, 'small-01'), true);
  assert.equal(state.reset(), true); assert.deepEqual(state.current(), initial);
});

test('die Hauptstadt besitzt keine erfundene Obergrenze; Wohnortwechsel verändern Hausdaten und Dienstbindung nicht', () => {
  const before = structuredClone(HOUSES), state = makeState();
  assert.equal(SETTLEMENTS.find(city => city.tier === 'capital').capacity, null);
  for (const house of HOUSES.filter(house => house.rank === 'Tarkan')) state.move(house.id, 'capital');
  assert.equal(Object.values(state.current()).filter(seat => seat === 'capital').length, 29);
  assert.deepEqual(HOUSES, before);
  const restored = makeState(); restored.restore(JSON.parse(state.serialize()));
  assert.deepEqual(restored.current(), state.current());
  restored.move(HOUSES.find(house => house.rank === 'Sultan').id, null);
  assert.equal(restored.current()['source-07'], null);
  assert.equal(restored.reset(), true);
  assert.equal(Object.values(restored.current()).filter(seat => seat === 'capital').length, 4);
});

test('ungültige Importe und falsche Ränge werden vor Änderung von Zustand oder Undo-Historie verworfen', () => {
  const state = makeState(); state.move(exampleTarkans[0].id, 'capital');
  const before = state.current();
  const leader = id => HOUSES.find(house => house.initialSeatId === id && house.rank === 'Pascha').id;
  for (const mutate of [
    value => { value.realm = 'venalys'; }, value => { delete value.placements['source-01']; },
    value => { value.placements['source-07'] = 'small-01'; },
    value => { value.placements[leader('large-02')] = 'large-01'; },
    value => { value.placements[exampleTarkans[1].id] = 'large-01'; },
    value => { value.placements[exampleTarkans[1].id] = 'small-01'; },
    value => { value.placements['source-05'] = 'small-10'; },
    value => { delete value.placements['source-01']; value.placements.maghneach = null; },
  ]) {
    const value = JSON.parse(state.serialize()); mutate(value);
    assert.throws(() => state.restore(value)); assert.deepEqual(state.current(), before);
  }
  assert.equal(state.undo(), true);
  assert.deepEqual(state.current(), makeState().current());
  assert.equal(state.canUndo(), false);
});

test('Kartenvarianten verwenden dieselben Quellanker und veränderlichen Hausmarker; Merkliste bleibt unabhängig', () => {
  const state = makeState();
  const shortlist = createProposalDraft({ cityNames: [], houseNames: [], emblems: HOUSES });
  shortlist.toggle('emblems', exampleTarkans[0].id);
  const favoriteBefore = shortlist.serialize();
  state.move(exampleTarkans[0].id, 'capital');
  for (const variant of MAP_VARIANTS) {
    const map = createMapProposal(state.current(), variant);
    assert.equal(map.bakedNames, false);
    assert.equal(map.clans.length, 37); assert.equal(map.settlements.length, 21);
    assert.equal(map.clans.find(house => house.id === exampleTarkans[0].id).seat, 'capital');
    assert.deepEqual(map.clans.filter(house => house.markerTone === 'muted').map(house => house.id), ['source-05']);
    assert.match(map.clans.find(house => house.id === 'source-05').markerNote, /evakuiert/);
    assert.equal(map.settlements.find(city => city.id === 'small-10').placementDisabled, true);
    for (const city of SETTLEMENTS) {
      assert.deepEqual(map.settlements.find(item => item.id === city.id).point, city.point);
      assert.equal(city.overlayLabel, true);
      for (const coordinate of city.point) assert.ok(coordinate > 0 && coordinate < 100);
    }
  }
  assert.equal(shortlist.serialize(), favoriteBefore);
  const seatsBefore = state.serialize(); shortlist.reset(); assert.equal(state.serialize(), seatsBefore);
  assert.throws(() => shortlist.restore(JSON.parse(state.serialize())));
  assert.throws(() => state.restore(JSON.parse(favoriteBefore)));
  assert.equal(state.serialize(), seatsBefore);
});

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test('nur Kutlugs veralteter gespeicherter Sitz wird sicher migriert; andere Zuordnungen und Merkliste bleiben erhalten', () => {
  const previous = JSON.parse(makeState().serialize());
  previous.placements['source-05'] = 'small-10';
  previous.placements['pool-10'] = null;
  previous.placements[exampleTarkans[0].id] = 'capital';
  const raw = JSON.stringify(previous), favorite = '{"independent":"untouched"}';
  const storage = memoryStorage({ [PLACEMENT_STORAGE_KEY]: raw, 'aleria:proposal:ishtaran:shortlist:v1': favorite });
  const result = prepareStoredPlacements({ storage, createState: makeState, evacuation: HOUSES.find(house => house.id === 'source-05') });
  assert.equal(result.status, 'migrated');
  const migrated = JSON.parse(storage.getItem(PLACEMENT_STORAGE_KEY));
  assert.deepEqual(migrated.placements, { ...previous.placements, 'source-05': 'large-05' });
  assert.equal(storage.getItem(result.backupKey), raw);
  assert.equal(storage.getItem('aleria:proposal:ishtaran:shortlist:v1'), favorite);
  assert.throws(() => makeState().restore(previous));
  assert.doesNotThrow(() => makeState().restore(migrated));
});

test('bestehende gültige Null-Zuordnungen werden bei neuen Ausgangssitzen nicht automatisch aufgefüllt', () => {
  const previous = JSON.parse(makeState().serialize());
  for (const id of ['pool-10', 'pool-13', 'pool-14', 'pool-22', 'pool-26']) previous.placements[id] = null;
  const raw = JSON.stringify(previous), storage = memoryStorage({ [PLACEMENT_STORAGE_KEY]: raw });
  const result = prepareStoredPlacements({ storage, createState: makeState, evacuation: HOUSES.find(house => house.id === 'source-05') });
  assert.equal(result.status, 'valid');
  assert.equal(storage.getItem(PLACEMENT_STORAGE_KEY), raw);
  assert.equal(storage.values.size, 1);
});

test('ein voller Zufluchtsort oder fehlender Sicherungsplatz überschreibt den alten Rohentwurf nicht', () => {
  const previous = JSON.parse(makeState().serialize());
  previous.placements['source-05'] = 'small-10';
  previous.placements[exampleTarkans[0].id] = 'large-05';
  const raw = JSON.stringify(previous), storage = memoryStorage({ [PLACEMENT_STORAGE_KEY]: raw });
  const result = prepareStoredPlacements({ storage, createState: makeState, evacuation: HOUSES.find(house => house.id === 'source-05') });
  assert.equal(result.status, 'recovery');
  assert.equal(storage.getItem(PLACEMENT_STORAGE_KEY), raw);
  assert.equal(storage.getItem(result.backupKey), raw);
  const denied = memoryStorage({ [PLACEMENT_STORAGE_KEY]: raw });
  denied.setItem = () => { throw Error('Quota'); };
  const blocked = prepareStoredPlacements({ storage: denied, createState: makeState, evacuation: HOUSES.find(house => house.id === 'source-05') });
  assert.equal(blocked.persistenceBlocked, true);
  assert.equal(blocked.raw, raw);
  assert.equal(denied.getItem(PLACEMENT_STORAGE_KEY), raw);
});

test('Göktemir behält den ursprünglichen Favoriten- und Wappenbezug', () => {
  const name = HOUSE_NAME_PROPOSALS.find(item => item.name === 'Göktemir');
  assert.equal(name.id, 'house-koektemir');
  assert.equal(HOUSES.find(house => house.id === 'pool-18').name, 'Göktemir');
  const shortlist = createProposalDraft({ cityNames: [], houseNames: HOUSE_NAME_PROPOSALS, emblems: HOUSES });
  shortlist.restore({ schemaVersion: 1, realm: 'ishtaran', kind: 'shortlist', notes: 'Vor der Umbenennung', favorites: { cityNames: [], houseNames: ['house-koektemir'], emblems: ['pool-18'] } });
  assert.deepEqual(shortlist.current().favorites.houseNames, ['house-koektemir']);
  assert.deepEqual(shortlist.current().favorites.emblems, ['pool-18']);
});
