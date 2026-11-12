import test from 'node:test';
import assert from 'node:assert/strict';
import { familyAtPlace, familyBelongsToScope, territoryFamilyScope, reconcileHouseGroups } from '../house-placement.mjs';

const place = { id: 'town', name: 'Town', hierarchy: [{ name: 'Realm' }, { name: 'County' }] };
function family(id, profile = {}, extra = {}) {
  const residence = { kingdom: 'Realm', county: 'County', barony: 'Barony', seat: 'Town', rankId: 'commoner', ...profile };
  return { id, name: `Familie ${id}`, profile: residence, placements: [{ profile: residence, folderPath: ['Realm', 'County', 'Barony', residence.seat] }],
    rank: 'Bürgerliches Haus', emblem: '/crest.png', href: `/house.html?haus=${id}`, ...extra };
}

test('only geographic residence assigns a house; same names abroad and service do not', () => {
  assert.ok(familyAtPlace(family('a'), place));
  assert.equal(familyAtPlace(family('b', { kingdom: 'Elsewhere' }), place), null);
  assert.equal(familyAtPlace(family('c', { seat: 'Other', liegeHouseName: 'Town' }), place), null);
  assert.equal(familyAtPlace(family('d', { kingdom: '' }, { placements: [{ profile: { seat: 'Town' }, folderPath: [] }] }), place), null);
});
test('explicit settlement folder keeps a manor in its town without replacing its precise address', () => {
  const f = family('a', { seat: 'Manor' });
  f.placements[0].folderPath[3] = 'Town';
  assert.equal(familyAtPlace(f, place).profile.seat, 'Manor');
});
test('secondary seats and reviewed exile placements keep their own local profile', () => {
  assert.equal(familyAtPlace(family('a', { seat: 'Other', secondarySeats: ['Town'] }), place).profile.seat, 'Town (weiterer Sitz)');
  const f = family('b', { kingdom: 'Old realm', seat: 'Origin' });
  f.placements.push({ profile: { kingdom: 'Realm', county: 'County', seat: 'Town', liegeHouseName: '' }, folderPath: ['Realm','County','Town'], rank: 'Bürgerliches Haus' });
  const resident = familyAtPlace(f, place);
  assert.equal(resident.profile.seat, 'Town');
  assert.equal(resident.profile.liegeHouseName, '');
  assert.equal(f.profile.seat, 'Origin');
  f.placements[1].rank = '';
  assert.equal(familyAtPlace(f, place).rank, '', 'An explicitly unknown local rank cannot inherit the origin rank');
});
test('explicit local scope adds no neighboring barony families to the county', () => {
  const scope = { kingdom: 'Realm', county: 'County', barony: 'Barony' };
  assert.equal(familyBelongsToScope(family('a'), scope), true);
  assert.equal(familyBelongsToScope(family('b', { barony: 'Other' }), scope), false);
});
test('geographic leaf scopes do not flatten countries or counties and require a known country', () => {
  const hierarchy = [{type:'Königreich',name:'Realm'},{type:'Grafschaft',name:'County'}];
  assert.equal(territoryFamilyScope({hierarchy}), null);
  assert.deepEqual(territoryFamilyScope({hierarchy:[...hierarchy,{type:'Baronie',name:'Barony'}]}), {kingdom:'Realm',county:'County',barony:'Barony'});
  assert.equal(territoryFamilyScope({hierarchy:[{type:'Herrschaft',name:'Barony'}]}),null);
});
test('existing groups retain their facts, missing residents appear once with direct links', () => {
  const residents = [family('a'),family('b')];
  const before = [{ title: 'Bürgerliche Häuser', items: [{ familyId: 'a', name: 'A', seat: 'Town · Inn', rank: 'Bürgerliches Haus' }] }];
  const output = reconcileHouseGroups(before, residents, { knownFamilies: residents });
  assert.deepEqual(output[0].items.map(c => c.familyId), ['a','b']);
  assert.equal(output[0].items[0].seat, 'Town · Inn');
  assert.equal(output[0].items[0].href, '/house.html?haus=a');
  assert.equal(before[0].items[0].href, undefined);
});
test('missing liege labels use the explicitly known local profile, while existing facts remain', () => {
  const resident = family('a',{liegeHouseName:'Known lord'});
  const result = reconcileHouseGroups([{title:'Häuser',items:[{familyId:'a',liege:'…'}]}],[resident],{knownFamilies:[resident]});
  assert.equal(result[0].items[0].liege,'Known lord');
  const retained = reconcileHouseGroups([{title:'Häuser',items:[{familyId:'a',liege:'Authored lord'}]}],[resident],{knownFamilies:[resident]});
  assert.equal(retained[0].items[0].liege,'Authored lord');
});
test('idless names bind only to one independently confirmed resident; unknown and ambiguous names remain open', () => {
  const a = family('a', {}, { name: 'Haus Example' });
  const groups = [{ title: 'Bürgerliche Häuser', items: [{ name: 'Familie Example' }, { name: 'Unknown' }] }];
  const output = reconcileHouseGroups(groups, [a], { knownFamilies: [a] });
  assert.deepEqual(output[0].items.map(c => c.familyId), ['a','']);
  const ambiguous = reconcileHouseGroups(groups, [a, { ...a, id: 'b' }]);
  assert.equal(ambiguous[0].items[0].familyId, '');
});
test('explicit ID aliases deduplicate existing cards without merging equal names', () => {
  const a = family('a', {}, { aliases: ['old-a'] });
  const b = family('b', {}, { name: a.name });
  const result = reconcileHouseGroups([{ title: 'Häuser', cards: [{ id: 'old-a' }, { id: 'a' }, { id: 'b' }] }], [a,b], { kind: 'territories', knownFamilies: [a,b] });
  assert.deepEqual(result[0].cards.map(c => c.id), ['a','b']);
});
test('a house proven to live in another place is removed while an unknown placeholder is retained', () => {
  const output = reconcileHouseGroups([{ title: 'Häuser', items: [{ familyId: 'away' }, { name: 'Unknown' }] }], [], { misplacedIds: new Set(['away']) });
  assert.equal(output[0].items.length, 1);
  assert.equal(output[0].items[0].name, 'Unknown');
});
test('an unknown rank does not turn a family into a noble house', () => {
  const result = reconcileHouseGroups([], [family('open', {rankId:'unknown'}, {rank:''})]);
  assert.equal(result[0].title,'Weitere Häuser');
  assert.equal(result[0].items[0].rank,'');
});
