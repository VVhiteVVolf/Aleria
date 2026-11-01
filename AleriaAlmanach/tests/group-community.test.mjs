import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { collectGroupRoster, resolveGroupRoster, isNamedGroupPerson } from '../modules/landing/group-landing-roster.js';
import { normalizeGroupLandingState } from '../modules/landing/group-landing-model.js';
import { appendGroupCompanions } from '../modules/landing/group-landing-companions.js';
import { groupMemberSnapshots } from '../modules/landing/group-landing-data.js';
import { renderGroupRoster } from '../modules/landing/group-landing-view.js';
import { enrichAnaraut } from '../modules/group-adventures/anaraut-content.mjs';

const source = async name => JSON.parse(await readFile(new URL(`../modules/group-adventures/source/${name}-2026-11-01.json`, import.meta.url), 'utf8')).entry;
const baseProfile = (current = 20, maximum = 20) => ({ currentHitPoints: current, maximumHitPoints: maximum, resources: [], conditions: [], abilities: [], totalDefense: 12 });
function world(t, characters = [], creatures = [], profiles = new Map()) {
  const keys = ['getAvailableCommentCharacters', 'getVisibleCharacterRecords', 'AleriaCreatures', 'AleriaCombat', 'sortCommentsByTimeline'];
  const previous = new Map(keys.map(key => [key, { exists: Object.hasOwn(globalThis, key), value: globalThis[key] }]));
  globalThis.getAvailableCommentCharacters = () => characters;
  globalThis.AleriaCreatures = { getAll: () => creatures };
  globalThis.AleriaCombat = { getProfile: id => profiles.get(id) };
  globalThis.sortCommentsByTimeline = comments => comments.slice().sort((a, b) => (a.orderKey || 0) - (b.orderKey || 0));
  t.after(() => { for (const [key, value] of previous) { if (value.exists) globalThis[key] = value.value; else delete globalThis[key]; } });
}
const person = (id, name = 'Prüfperson') => ({ id, name, combatProfile: { hitPoints: { current: 20, maximumOverride: 20 } } });
const animal = (id, name = 'Prüfwolf', extra = {}) => ({ id, name, entityType: 'creature', species: 'Wolf',
  combatProfile: { hitPoints: { current: 40, maximumOverride: 40 }, armorClass: { override: 12 } }, ...extra });
const ownerMember = { id: 'owner-member', kind: 'character', characterId: 'owner', name: 'Prüfbesitzer', assignment: 'active' };
const snapshot = (actorId, current, extra = {}) => ({ serverValidatedMechanics: true, combatResolution: { actorId, targetId: 'other',
  actorPersistence: { kind: 'character', recordId: actorId }, actorHitPointSnapshot: { after: { current, maximum: 20, temporary: 0 } } }, ...extra });

test('real Anaraut hierarchies preserve one person with multiple offices and no vacant ranks', async () => {
  const entry = enrichAnaraut(structuredClone(await source('modul-1782120382311')));
  assert.equal(entry.pages.filter(page => page.hierarchyPage).length, 2);
  const characters = [{ id: 'arian', name: 'Arian Saethwyr' }, { id: 'anaraut', name: 'Anaraut Draig' }];
  const initial = collectGroupRoster(entry, characters);
  assert.equal(initial.filter(member => member.characterId === 'arian').length, 1);
  const first = entry.pages.find(page => page.hierarchyPage).hierarchy;
  const levels = first.trees?.length ? first.trees[0].levels : first.levels;
  levels.push({ label: 'Zusatzdienst im Test', nodes: [{ title: 'Leutnant', subtitle: 'Lady Arian Saethwyr' }] });
  const before = JSON.stringify(entry), roster = collectGroupRoster(entry, characters);
  const arian = roster.filter(member => member.characterId === 'arian');
  assert.equal(arian.length, 1);
  assert.ok(arian[0].positions.length >= 2);
  assert.match(arian[0].role, /Schiffskapitänin/);
  assert.match(arian[0].role, /Leutnant/);
  assert.equal(roster.length, initial.length);
  assert.equal(JSON.stringify(entry), before);
  assert.equal(roster.some(member => /VAKANT|Erster Maat|Matrose/.test(member.name)), false);
});

test('actual ship-cat hierarchy descriptions never become a fictional human or duplicate an inventory-linked animal', async () => {
  const entry = await source('idwals-schiffsmannschaft');
  const roster = collectGroupRoster(entry);
  assert.ok(roster.some(member => member.name === 'Trevor Gwyvern'));
  assert.equal(roster.some(member => /Cenyric|Schiffskater/.test(member.name)), false);
  assert.equal(roster.some(member => ['Bwmbo', 'Uffel'].includes(member.name) && member.kind === 'character'), false);
});

test('vacant silhouettes and formatted placeholders stay out, while real names and honorifics remain eligible', () => {
  for (const value of ['', '?', 'VAKANT', 'N.N.', 'N. N.', 'NN', 'unbesetzt', 'Offen', 'Noch offen', 'Nicht besetzt', '—', '-', '<p>VAKANT</p>', '<strong>N.N.</strong>']) {
    assert.equal(isNamedGroupPerson(value), false, value);
  }
  for (const value of ['Sir Idwal Draig', 'Lady Arian Saethwyr', 'Anaraut Draig', 'Rangolf Stern', 'Pagebert Dorn']) {
    assert.equal(isNamedGroupPerson(value), true, value);
  }
  const entry = { pages: [{ hierarchyPage: true, hierarchy: { levels: [{ nodes: [
    { title: 'Kapitän', subtitle: '<em>VAKANT</em>' }, { title: 'Kapitän', subtitle: '<strong>Idwal Draig</strong>' }
  ] }] } }] };
  assert.deepEqual(collectGroupRoster(entry).map(member => member.name), ['Idwal Draig']);
});

test('typed character and creature identities survive equal record IDs and explicit animal guests deduplicate inventory links', () => {
  const group = normalizeGroupLandingState({ guests: [
    { id: 'person', characterId: 'same', name: 'Milo', assignment: 'active' },
    { id: 'animal', kind: 'creature', creatureId: 'same', name: 'Milo', assignment: 'reserve' }
  ] });
  const people = [{ id: 'same', name: 'Milo', inventory: { items: [{ id: 'animal-link', creatureId: 'same', quantity: '1' }] } }];
  const creatures = [animal('same', 'Milo', { itemOrigin: { ownerCharacterId: 'same', inventoryItemId: 'animal-link', disposition: 'owned' } })];
  const roster = resolveGroupRoster({ pages: [] }, group, people, creatures);
  assert.deepEqual(roster.map(member => [member.kind, member.characterId || member.creatureId]), [['character', 'same'], ['creature', 'same']]);
  const withCompanions = appendGroupCompanions(roster, people, creatures);
  assert.equal(withCompanions.length, 2);
  assert.equal(withCompanions.find(member => member.kind === 'creature').source, 'guest');
  assert.equal(withCompanions.find(member => member.kind === 'creature').assignment, 'reserve');
});

test('companions require a real live possession link and consistent owner, inventory item and instance identities', () => {
  const people = [{ id: 'owner', inventory: { items: [
    { id: 'proper', instanceId: 'proper-instance', creatureId: 'proper', name: 'Bestätigt', quantity: '1' },
    { id: 'placeholder', name: 'Neuer Begleiter' },
    { id: 'zero', creatureId: 'zero', quantity: '0' },
    { id: 'missing', creatureId: 'missing', name: 'Phantom', quantity: '1' },
    { id: 'other-owner', creatureId: 'other-owner', quantity: '1' },
    { id: 'sold', creatureId: 'sold', quantity: '1' },
    { id: 'stale-item', creatureId: 'stale-item', quantity: '1' },
    { id: 'stale-instance', instanceId: 'new-instance', creatureId: 'stale-instance', quantity: '1' }
  ], companions: [{ id: 'duplicate-link', creatureId: 'proper', name: 'Bestätigt' },
    { id: 'zero-reference', inventoryItemId: 'zero', creatureId: 'zero' }] } }];
  const origin = (id, extra = {}) => animal(id, id, { itemOrigin: { ownerCharacterId: 'owner', inventoryItemId: id, disposition: 'owned', ...extra } });
  const creatures = [origin('proper', { instanceId: 'proper-instance' }), origin('zero'), origin('other-owner', { ownerCharacterId: 'someone-else' }),
    origin('sold', { disposition: 'sold' }), origin('stale-item', { inventoryItemId: 'another-possession' }), origin('stale-instance', { instanceId: 'old-instance' })];
  const before = JSON.stringify({ people, creatures, ownerMember });
  const projected = appendGroupCompanions([ownerMember], people, creatures);
  assert.deepEqual(projected.filter(member => member.kind === 'creature').map(member => member.creatureId), ['proper']);
  assert.equal(projected[1].ownerCharacterId, 'owner');
  assert.equal(projected[1].assignment, 'active');
  assert.equal(JSON.stringify({ people, creatures, ownerMember }), before);
});

test('only trusted stored scene snapshots affect readiness; imported, undone and untrusted evidence cannot override live sheets', t => {
  const character = person('person'), original = baseProfile(), group = normalizeGroupLandingState({ guests: [{ id: 'guest', characterId: 'person', name: 'Prüfperson' }] });
  world(t, [character], [], new Map([['person', original]]));
  const comments = [snapshot('person', 9, { orderKey: 1 }),
    snapshot('person', 0, { orderKey: 2, serverValidatedMechanics: false }),
    snapshot('person', 0, { orderKey: 3, importedHistoricalMechanics: true }),
    snapshot('person', 0, { orderKey: 4, mechanicalUndone: true }),
    snapshot('person', 0, { orderKey: 5, undoneAt: '2026-11-01' }),
    snapshot('person', 0, { orderKey: 6, serverValidatedMechanics: 'true' })];
  const before = JSON.stringify({ comments, character, original });
  const member = groupMemberSnapshots({ pages: [] }, group, comments)[0];
  assert.deepEqual([member.readiness.current, member.readiness.maximum, member.readiness.key], [9, 20, 'injured']);
  assert.equal(JSON.stringify({ comments, character, original }), before);
  assert.equal(groupMemberSnapshots({ pages: [] }, group, comments.slice(1))[0].readiness.current, 20);
});

test('character and creature sheets remain separate when a trusted scene snapshot uses the same collection-local ID', t => {
  const character = person('same', 'Prüfperson'), creature = animal('same', 'Prüfwolf');
  world(t, [character], [creature], new Map([['same', baseProfile()]]));
  const group = normalizeGroupLandingState({ guests: [
    { id: 'person', characterId: 'same', name: character.name }, { id: 'wolf', kind: 'creature', creatureId: 'same', name: creature.name }
  ] });
  const members = groupMemberSnapshots({ pages: [] }, group, [snapshot('same', 5)]);
  assert.equal(members.find(member => member.kind === 'character').readiness.current, 5);
  assert.deepEqual([members.find(member => member.kind === 'creature').readiness.current, members.find(member => member.kind === 'creature').readiness.maximum], [40, 40]);
  const markup = renderGroupRoster(members);
  assert.match(markup, /data-group-action="profile"[^>]*data-character-id="same"/);
  assert.match(markup, /data-group-action="creature-profile"[^>]*data-creature-id="same"/);
});

test('unknown creature sheets remain honestly unknown and including actual inventory companions is optional', t => {
  const character = person('owner'), creature = { id: 'wolf', name: 'Prüfwolf', entityType: 'creature', combatProfile: {} };
  character.inventory = { companions: [{ id: 'wolf-link', creatureId: 'wolf', name: creature.name }] };
  world(t, [character], [creature], new Map([['owner', baseProfile()]]));
  const group = normalizeGroupLandingState({ guests: [{ id: 'owner', characterId: 'owner', name: character.name }] });
  const members = groupMemberSnapshots({ pages: [] }, group);
  assert.equal(members.length, 2);
  assert.equal(members.find(member => member.kind === 'creature').readiness.known, false);
  assert.equal(groupMemberSnapshots({ pages: [] }, { ...group, includeCompanions: false }).length, 1);
});
