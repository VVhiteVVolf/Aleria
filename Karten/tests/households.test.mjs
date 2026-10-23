import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHouseholdIndex, createHouseholdCatalog, householdGroups, residentsForPin } from '../modules/households/household-model.mjs';
import { layoutHouseholds } from '../modules/households/household-layout.mjs';
import { createCatalogLoader } from '../modules/households/household-catalog.mjs';
import { attachHouseholdRegions } from '../modules/households/household-regions.mjs';

const catalog = JSON.parse(readFileSync(new URL('../modules/households/households.generated.json', import.meta.url)));
const index = createHouseholdIndex(catalog);
const county = { id: 'cenyr-celtigerns-wacht', hierarchy: [{ level: 'kingdom', title: 'Cenyr' }, { level: 'county', title: 'Celtigerns Wacht' }] };
const local = { ...county, id: 'cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis' };
const readMap = path => JSON.parse(readFileSync(new URL('../' + path + '/data.json', import.meta.url))).state;

test('all generated crests resolve to existing project images and the ruling house leads Gwynthors group', () => {
  for (const family of catalog.families) {
    assert.ok(existsSync(new URL('../../' + family.crest.slice(1), import.meta.url)), family.id + ': ' + family.crest);
  }
  assert.equal(residentsForPin({ title: 'Gwynthor' }, county, index)[0].id, 'haus-draig');
});

test('county view gathers the existing families at Gwynthor without changing any records', () => {
  const state = readMap('Cenyr/celtigerns-wacht');
  const before = JSON.stringify(state);
  const group = householdGroups(state.pins, county, index).find(group => group.pin.title === 'Gwynthor');
  assert.ok(group.families.some(family => family.id === 'haus-tlawd'));
  assert.ok(group.families.some(family => family.id === 'haus-draig'));
  assert.equal(new Set(group.families.map(family => family.id)).size, group.families.length);
  assert.equal(JSON.stringify(state), before);
  assert.equal(residentsForPin(group.pin, { ...county, hierarchy: [{ level: 'kingdom', title: 'Aldrimar' }] }, index).length, 0);
});

test('local map resolves the reviewed Tlawd seat and Penrudd farm without spreading town residents to other markers', () => {
  const state = readMap('Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis');
  const tlawd = state.pins.find(pin => pin.title === 'Castell Tlawd');
  assert.deepEqual(residentsForPin(tlawd, local, index).map(family => family.id), ['haus-tlawd']);
  const farm = state.pins.find(pin => pin.title === 'Penrudd-Hof');
  assert.deepEqual(residentsForPin(farm, local, index).map(family => family.id), ['haus-penrudd']);
  const territorialOnly = { ...tlawd, id: 'another-farm', title: 'Unbenannter Hof' };
  assert.deepEqual(residentsForPin(territorialOnly, local, index), []);
  assert.deepEqual(residentsForPin({ ...tlawd, house: '', crestLink: '' }, local, index), []);
});

test('Rhonwens Tränen resolves Castell Bryn through its proven dominion seat, without inheriting a ruler at unrelated places', () => {
  const state = readMap('Cenyr/celtigerns-wacht');
  const groups = householdGroups(state.pins, county, index, { dominions: state.dominions });
  const castellbryn = groups.find(group => group.pin.title === 'Castell Bryn');
  assert.ok(castellbryn.families.some(family => family.id === 'haus-arwydd'));
  assert.ok(castellbryn.families.some(family => family.id === 'haus-gwared'));
  assert.ok(!castellbryn.families.some(family => family.id === 'haus-illysywen'));
  const unrelated = { ...castellbryn.pin, id: 'farm', title: 'Anderer Hof' };
  assert.deepEqual(householdGroups([unrelated], county, index, { dominions: state.dominions }), []);
  const detail = readMap('Cenyr/celtigerns-wacht/rhonwens-traenen/castellbryn-bannkreis');
  assert.deepEqual(householdGroups(detail.pins, { ...local, id: 'castellbryn' }, index), []);
});

test('Rhonwens regional directory contains all nine houses with clear current, unresolved and former places', () => {
  const state = readMap('Cenyr/celtigerns-wacht');
  const groups = attachHouseholdRegions(householdGroups(state.pins, county, index, { dominions: state.dominions }), county, index, state.dominions);
  const castle = groups.find(group => group.pin.title === 'Castell Bryn');
  assert.deepEqual(castle.families.map(family => family.id), ['haus-arwydd', 'haus-gwared']);
  const section = title => castle.region.sections.find(section => section.title === title).families;
  assert.deepEqual(section('Weitere örtliche Zuordnungen').map(family => family.id), ['haus-merek']);
  assert.deepEqual(section('Ortszuordnung noch offen').map(family => family.id).sort(), ['haus-madryn', 'haus-rhenna', 'haus-talinvyr']);
  assert.deepEqual(section('Ehemalige und entmachtete Häuser').map(family => family.id).sort(), ['haus-illysywen', 'haus-morveth', 'haus-skellor']);
  assert.equal(castle.region.count, 7);
  assert.equal(castle.region.total, 9);
  const merek = groups.find(group => group.pin.title === 'Caer Creigfryn');
  assert.deepEqual(merek.families.map(family => family.id), ['haus-merek']);
  assert.equal(merek.families[0].role, 'Neu zugesprochenes Lehen');
  assert.equal(index.byId.get('haus-skellor').status, 'dispossessed');
  assert.equal(index.byId.get('haus-morveth').status, 'extinct');
});

test('explicit resident IDs are authoritative, support several families and can suppress automatic seats', () => {
  const pin = { title: 'Gwynthor', residentFamilyIds: ['haus-tlawd', 'haus-penrudd', 'haus-tlawd', 'missing'] };
  assert.deepEqual(residentsForPin(pin, county, index).map(family => family.id), ['haus-tlawd', 'haus-penrudd']);
  assert.deepEqual(residentsForPin({ ...pin, residentFamilyIds: [] }, county, index), []);
  assert.deepEqual(residentsForPin({ ...pin, kind: 'text' }, county, index), []);
});

test('secret places, active category filters, duplicate names and invalid positions stay protected', () => {
  const pin = { id: 'one', title: 'Gwynthor', cat: 'town', x: .4, y: .5 };
  assert.equal(householdGroups([{ ...pin, secret: true }], county, index).length, 0);
  assert.equal(householdGroups([{ ...pin, secret: true }], county, index, { editMode: true }).length, 1);
  assert.equal(householdGroups([pin], county, index, { filter: 'farm' }).length, 0);
  assert.equal(householdGroups([pin, { ...pin, id: 'two' }], county, index).length, 0);
  assert.equal(householdGroups([{ ...pin, x: NaN }], county, index).length, 0);
});

test('secondary seats and later placements work, while extinct domains and origin-only placements are excluded', () => {
  const record = { id: 'family', title: 'Clan Test', status: 'active', link: 'Stammbaum.html?family=family', family: { document: { emblem: 'crest.png' } },
    houseProfile: { seat: 'Altburg', barony: 'Ausgestorbene Clans', kingdom: 'Cenyr' },
    additionalPlacements: [{ role: 'origin', houseProfile: { seat: 'Ursprung', kingdom: 'Cenyr' } }, { houseProfile: { seat: 'Neuburg', secondarySeats: ['Zweitburg'], kingdom: 'Cenyr' } }] };
  const prepared = createHouseholdCatalog([record]);
  assert.deepEqual(prepared.families[0].residences.map(residence => residence.seat), ['Neuburg', 'Zweitburg']);
  assert.equal(residentsForPin({ title: 'Zweitburg' }, { hierarchy: [{ level: 'kingdom', title: 'Cenyr' }] }, createHouseholdIndex(prepared))[0].role, 'Nebensitz');
});

test('layout keeps crests readable within the viewport and culls offscreen anchors at every zoom', () => {
  const groups = [{ pin: { id: 'one', x: .5, y: .5 }, families: index.families.slice(0, 40) }, { pin: { id: 'two', x: .51, y: .5 }, families: index.families.slice(0, 2) }];
  const options = { image: { width: 4000, height: 3000 }, transform: { x: -1700, y: -1250, z: 1 }, viewport: { width: 375, height: 600 } };
  const result = layoutHouseholds(groups, options);
  assert.equal(result.length, 2);
  for (const box of result) {
    assert.ok(box.x >= 0 && box.x + box.width <= 375);
    assert.ok(box.y >= 0 && box.y + box.height <= 600);
  }
  assert.notDeepEqual([result[0].x, result[0].y], [result[1].x, result[1].y]);
  assert.equal(layoutHouseholds(groups, { ...options, transform: { x: 4000, y: 0, z: 2 } }).length, 0);
});

test('catalog loading is shared and retries after a failed request', async () => {
  let calls = 0;
  const load = createCatalogLoader(async () => { calls++; return { ok: calls > 1, json: async () => catalog }; });
  await assert.rejects(load(), /geladen/);
  const [first, second] = await Promise.all([load(), load()]);
  assert.equal(first, second); assert.equal(calls, 2);
});
