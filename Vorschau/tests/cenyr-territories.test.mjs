import assert from 'node:assert/strict';
import test from 'node:test';
import { access } from 'node:fs/promises';
import directory from '../Herrschaftsverwaltung/kingdom.generated.json' with { type: 'json' };
import roster from '../Herrschaftsverwaltung/roster.generated.json' with { type: 'json' };
import { buildOfficePlans } from '../../shared/cenyr-administration/office-plans.mjs';
import { ABERLLAN_COUNTY_POST, ABERLLAN_LEAD } from '../../shared/cenyr-administration/camruisge-plan.mjs';
import { createAssemblyState } from '../Herrschaftsverwaltung/assembly-state.mjs';
import { postTitleKey } from '../Herrschaftsverwaltung/draft-office-titles.mjs';
import { officeDestination, prepareTerritorialHouses, territorialGroups } from '../Herrschaftsverwaltung/territorial-navigation.mjs';

const people = new Map([...roster.people, ...directory.people].map(person => [person.id, person]));
const treeCandidates = new Map(roster.tree.map(entry => [entry.id, entry]));
const houses = prepareTerritorialHouses(roster.houses, directory).map(house => ({ ...house, plans: buildOfficePlans(house) }));
const scopes = new Map(houses.map(house => [house.id, house]));
const makeState = () => createAssemblyState(houses, [...roster.free, ...directory.free], { people, treeCandidates });

test('all canonically registered counties lead to distinct preparations with stable figures and artwork', async () => {
  assert.equal(directory.counties.length, 9);
  const ids = territorialGroups(directory).flatMap(group => group.scopes.map(scope => scope.id));
  assert.equal(ids.length, 73);
  assert.equal(new Set(ids).size, houses.length);
  assert(houses.every(house => house.countyId && ids.includes(house.id)));
  for (const group of territorialGroups(directory)) {
    await access(new URL(`../..${group.crest}`, import.meta.url));
    for (const scope of group.scopes) {
      await access(new URL(`../..${scope.href}`, import.meta.url));
      await access(new URL(`../..${scope.crest}`, import.meta.url));
      const house = scopes.get(scope.id);
      assert(house.candidates.every(candidate => people.has(candidate.id)));
      for (const plan of Object.values(house.plans)) {
        assert.equal(plan.slots.length, new Set(plan.slots.map(slot => slot.key)).size, scope.id);
        assert(plan.slots.every(slot => !slot.holder || people.has(slot.holder)), scope.id);
      }
    }
  }
});

test('the royal council and household are separate from the county offices of Vortigerns Ruh', () => {
  const royal = scopes.get('krone');
  const county = scopes.get('grafschaft-vortigerns-ruh');
  assert.equal(people.get(royal.plans.militaer.head.holder).name, 'Galahad Draig');
  assert.equal(people.get(royal.plans.regentschaft.head.holder).name, 'Pelleas Pendrag');
  assert(royal.plans.ratskanzlei);
  assert(royal.plans.hof);
  assert(!royal.plans.lehenswarte);
  assert.equal(county.plans.militaer.head.holder, null);
  assert(!county.plans.hof);
  assert.equal(county.courtScope, royal.id);
  assert(county.plans.lehenswarte.slots.some(slot => slot.place === 'Mathragon'));
});

test('Aberllan and Oilean have independent leadership and the former county URL opens the same Aberllan post', () => {
  const island = scopes.get('camruisge');
  assert.deepEqual(Object.keys(island.plans), ['aberllan', 'oilean', 'inselabstimmung']);
  assert.equal(people.get(island.plans.aberllan.head.holder).name, 'Lyonnel Garrael');
  assert.equal(island.plans.oilean.head.holder, null);
  assert.equal(island.plans.inselabstimmung.head, null);
  assert.equal(island.plans.inselabstimmung.slots.length, 7);
  assert(island.plans.aberllan.templates.some(role => role.title === 'Stadtwache'));
  assert(island.plans.aberllan.templates.some(role => role.title === 'Waffenknecht der Hausmacht'));
  assert(island.candidates.every(candidate => candidate.branch === 'aberllan'));
  assert(scopes.get('draig').plans.lehenswarte.slots.every(slot => slot.key !== ABERLLAN_COUNTY_POST));
  const url = new URLSearchParams({ haus: 'draig', amt: 'lehenswarte', posten: ABERLLAN_COUNTY_POST });
  assert.deepEqual(officeDestination(url), { id: 'camruisge', area: 'aberllan', post: ABERLLAN_LEAD });
});

test('version 9 keeps saved Aberllan assignments, renamed posts and existing drafts in other counties', () => {
  const state = makeState();
  const regional = state.addPost('grafschaft-weidebucht', { area: 'finanzen', kind: 'other', title: 'Kassenprüfer', description: '' });
  const current = JSON.parse(state.serialize());
  const legacy = { ...current, version: 9, houses: Object.fromEntries(roster.houses.map(house => [house.id, current.houses[house.id]])) };
  const person = roster.houses.find(house => house.id === 'draig').candidates
    .find(candidate => treeCandidates.has(candidate.id) && !scopes.get('camruisge').candidates.some(member => member.id === candidate.id));
  const from = legacy.houses.draig;
  from.assignments = { [ABERLLAN_COUNTY_POST]: person.id, 'lehenswarte/extra-bote': person.id };
  from.titles = { [postTitleKey(ABERLLAN_COUNTY_POST)]: 'Stadtvogt von Aberllan', 'posten/lehenswarte/extra-bote': 'Bote Aberllans' };
  from.posts = [{ area: 'lehenswarte', id: 'bote', site: ABERLLAN_COUNTY_POST, title: 'Bote', kind: 'other', description: '' }];
  state.importDraft(JSON.stringify(legacy));
  const posts = state.positions('camruisge');
  assert.equal(posts.get(ABERLLAN_LEAD).occupant, person.id);
  assert.equal(posts.get(ABERLLAN_LEAD).title, 'Stadtvogt von Aberllan');
  assert.equal(posts.get('aberllan/extra-bote').title, 'Bote Aberllans');
  assert.equal(posts.get('aberllan/extra-bote').occupant, person.id);
  assert(!posts.get(ABERLLAN_LEAD).needsReplacement);
  assert.equal(state.positions('grafschaft-weidebucht').get(regional).title, 'Kassenprüfer');
  const restored = makeState();
  restored.importDraft(state.serialize());
  assert.equal(restored.positions('camruisge').get(ABERLLAN_LEAD).occupant, person.id);
  assert.equal(restored.positions('grafschaft-weidebucht').get(regional).title, 'Kassenprüfer');
});
