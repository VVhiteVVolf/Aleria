import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { buildOfficePlans } from '../../shared/cenyr-administration/office-plans.mjs';
import { settlementDefinition } from '../../shared/cenyr-administration/settlement-government.mjs';
import { createAssemblyState } from '../Herrschaftsverwaltung/assembly-state.mjs';
import { findOfficeHolders } from '../Herrschaftsverwaltung/person-office-search.mjs';
import { prepareTerritorialHouses } from '../Herrschaftsverwaltung/territorial-navigation.mjs';
import { postTitleKey } from '../Herrschaftsverwaltung/draft-office-titles.mjs';

const read = name => JSON.parse(readFileSync(new URL('../Herrschaftsverwaltung/' + name, import.meta.url)));
const roster = read('roster.generated.json');
const kingdom = read('kingdom.generated.json');
const houses = prepareTerritorialHouses(roster.houses, kingdom).map(house => ({ ...house, plans: buildOfficePlans(house) }));
const people = new Map([...roster.people, ...kingdom.people].map(person => [person.id, person]));
const treeCandidates = new Map(roster.tree.map(person => [person.id, person]));
const makeState = () => createAssemblyState(houses, [...roster.free, ...kingdom.free], {
  people, treeCandidates, makeId: () => 'test-ratssitz',
});
const wyrm = houses.find(house => house.id === 'wyrm');
const districts = ['Militär', 'Glaube', 'Justiz', 'Finanzen', 'Geheimdienst', 'Diplomatie', 'Unterhaltung'];

test('Weltliche Siedlungstypen teilen sieben Amtsbereiche und acht Ratssitze', () => {
  for (const type of ['Handelssiedlung', 'Bauernsiedlung', 'Bergbausiedlung', 'Fischersiedlung', 'hafensiedlung', 'Stadt']) {
    const plan = settlementDefinition({ name: 'Musterort', type });
    assert.equal(plan.kind, 'civic', type);
    assert.equal(plan.head.title, 'Bürgermeister von Musterort', type);
    assert.deepEqual(plan.government.map(area => area.title), districts);
    assert.deepEqual(plan.government.flatMap(area => area.slots.map(post => post.title)), [
      'Hauptmann der Ortswache', 'Diakon', 'Landrichter', 'Rentmeister', 'Zellenführer', 'Ortsschreiber', 'Ortsbarde',
    ]);
    assert.equal(plan.council.seats.length, 8);
  }
});

test('Militärische, kirchliche und gepachtete Siedlungen führen ihre passende Leitung', () => {
  for (const [type, kind, leader] of [
    ['Turm', 'military', 'Hauptmann'], ['Militärische Siedlung', 'military', 'Hauptmann'],
    ['Kirchensiedlung', 'church', 'Diakon'], ['Priorei', 'church', 'Prior'],
    ['Pachtsiedlung', 'guild', 'Leitung der Pachtsiedlung'],
  ]) {
    const plan = settlementDefinition({ name: 'Musterort', type });
    assert.equal(plan.kind, kind, type);
    assert.ok(plan.head.title.startsWith(leader), type);
    assert.ok(plan.council.seats.length < 8, type);
    assert.ok(plan.government.length < districts.length, type);
  }
  assert.equal(settlementDefinition({ name: 'Gwynthor', type: 'Großstadt' }), null);
  assert.equal(settlementDefinition({ name: 'Marktstand', type: 'zunft' }), null);
  assert.equal(settlementDefinition({ name: 'Morddyn', type: 'Hafen' }), null);
  assert.ok(settlementDefinition({ name: 'Musterort', type: 'Großstadt' }, { template: true }));
});

test('Llysfaens Ortsrat übernimmt die belegten Ämter und teilt den Wachposten mit dem Marschall', () => {
  const plan = wyrm.plans['ortsrat-llysfaen'];
  const state = makeState();
  const watch = 'militaer/wacht-llysfaen';
  assert.equal(people.get(plan.head.holder).name, 'Brinthan Argall');
  assert.deepEqual(plan.sections.map(section => section.title), [...districts, 'Stadtrat']);
  assert.deepEqual(plan.sections.at(-1).slots.map(post => post.title), [
    'Sitz des Hauses Glyn', 'Sitz des Hauses Jernigan', 'Sitz des Hauses Blevins',
    'Sitz des Hauses Talfryn', 'Sitz des Hauses Crewe',
  ]);
  const posts = state.positions('wyrm');
  assert.equal(plan.sections[0].slots.find(post => post.key === watch).holder, posts.get(watch).occupant);
  assert.equal(people.get(posts.get(watch).occupant).name, 'Gwydion Rhyddid');
  assert.equal(state.appointments(posts.get(watch).occupant).filter(entry => entry.post.key === watch).length, 1);
  const mayor = state.appointments(plan.head.holder).find(entry => entry.post.key === plan.head.key);
  assert.equal(mayor.department, 'ortsamt-llysfaen--leitung');
  assert.ok(!wyrm.plans['ortsrat-gwynthor']);
  assert.equal(wyrm.plans['ortsrat-mwyncreig'].sections.at(-1).slots.length, 8);
});

test('Zusätzliche Ratssitze erhalten Ortszuordnung, suchen ihre Besetzung und überstehen den Export', () => {
  const state = makeState();
  const area = 'ortsrat-llysfaen';
  const template = wyrm.plans[area].templates.find(role => role.id === 'r-ortsrat');
  const key = state.addPost('wyrm', { area, kind: template.kind, title: template.title, description: '', templateId: template.id });
  const mayor = wyrm.plans[area].head.holder;
  state.assign('wyrm', key, mayor);
  const restored = makeState();
  restored.importDraft(state.serialize());
  const [{ appointments }] = findOfficeHolders('BRINTHAN argall', people, restored);
  assert.equal(appointments.find(entry => entry.post.key === key).department, area);
  assert.equal(restored.positions('wyrm').get(key).settlement, 'Llysfaen');
  assert.equal(restored.positions('wyrm').get(wyrm.plans[area].head.key).occupant, mayor);
  assert.equal(restored.removePost('wyrm', key), true);
});

test('Zuteilungen der Zofen bleiben lokal, lassen sich speichern und laden Entwürfe ohne Zuteilungen', () => {
  const state = makeState();
  const key = 'hof-vogt/zofenstelle-3';
  const post = state.positions('draig').get(key);
  assert.equal(state.serviceRecipient('draig', post).name, 'Rhiannon Draig');
  const [ward] = findOfficeHolders('Rhiannon Draig', people, state);
  assert(ward.retinue.some(entry => entry.post.key === key));
  assert.equal(state.setServiceRecipient('draig', key, 'person--haus-draig--oweta-draig'), true);
  assert.ok(state.hasDraft('draig'));
  const restored = makeState();
  restored.importDraft(state.serialize());
  assert.equal(restored.serviceRecipient('draig', post).name, 'Oweta Draig');
  assert.throws(() => restored.setServiceRecipient('draig', key, 'person--haus-wyrm--rianna-wyrm'), /Mitglied dieses Hauses/u);
  const old = JSON.parse(state.serialize());
  old.version = 10;
  for (const scope of Object.values(old.houses)) delete scope.serviceRecipients;
  restored.importDraft(JSON.stringify(old));
  assert.equal(restored.serviceRecipient('draig', post).name, 'Rhiannon Draig');
});

test('Austausch von Ortsräten übernimmt gemeinsame Ämter und lässt andere Entwürfe bestehen', () => {
  const area = 'ortsrat-llysfaen';
  const selection = { type: 'office', id: wyrm.id, area };
  const postKey = 'militaer/wacht-llysfaen';
  const city = wyrm.plans[area];
  const seat = city.sections.at(-1).slots[0].key;
  const person = city.head.holder;
  const source = makeState();
  source.removePost(wyrm.id, seat);
  source.assign(wyrm.id, postKey, person);
  source.renameTitle(wyrm.id, postTitleKey(postKey), 'Hauptmann von Llysfaen');
  source.assign(wyrm.id, 'finanzen/leitung', person);
  const payload = JSON.parse(source.serialize(selection));
  assert.deepEqual(Object.keys(payload.houses), [wyrm.id]);
  assert.deepEqual(Object.keys(payload.houses.wyrm.assignments), [postKey]);
  const departments = city.slots.flatMap(post => post.department ? [post.department] : []);
  assert.equal(departments.length, 8);
  assert.deepEqual(payload.structure.wyrm.offices.map(office => office.id), [area, ...departments]);
  assert.equal(payload.structure.wyrm.offices.find(office => office.id === 'ortsamt-llysfaen--wache').head, postKey);
  assert(payload.structure.wyrm.offices[0].posts.some(post => post.key === city.head.key));

  const destination = makeState();
  destination.assign('gafyr', 'militaer/leitung', null);
  const before = destination.serialize();
  assert.throws(() => destination.importDraft(JSON.stringify(payload), { type: 'office', id: wyrm.id, area: 'hof' }), /anderen Entwurfsbereich/u);
  assert.equal(destination.serialize(), before);
  destination.importDraft(JSON.stringify(payload));
  assert.equal(destination.positions('gafyr').get('militaer/leitung').occupant, null);
  assert.equal(destination.positions(wyrm.id).get('finanzen/leitung').occupant, wyrm.offices.finanzen.holder);
  assert.equal(destination.positions(wyrm.id).get(postKey).occupant, person);
  assert.equal(destination.positions(wyrm.id).get(postKey).title, 'Hauptmann von Llysfaen');
  assert.equal(destination.positions(wyrm.id).has(seat), false);
  assert.equal(destination.undo(), true);
  assert.equal(destination.serialize(), before);
});

test('Grafschafts- und Hofexporte lassen sich bis zu einem Amt eingrenzen', () => {
  const state = makeState();
  const other = 'militaer/leitung';
  const service = 'hof-vogt/zofenstelle-3';
  state.assign('draig', other, null);
  state.setServiceRecipient('draig', service, 'person--haus-draig--oweta-draig');
  const county = { type: 'county', id: 'celtigerns-wacht' };
  const scope = { type: 'office', id: 'draig', area: 'hof' };
  const exported = JSON.parse(state.serialize(county));
  assert(exported.houses.gafyr);
  assert(!exported.houses.krone);
  const court = JSON.parse(state.serialize(scope));
  assert(court.structure.draig.offices.some(office => office.id === 'hof-vogt'));
  assert.deepEqual(Object.keys(court.houses.draig.assignments), []);
  const destination = makeState();
  destination.importDraft(JSON.stringify(exported), scope);
  assert.equal(destination.positions('draig').get(other).occupant, houses.find(house => house.id === 'draig').offices.militaer.holder);
  assert.equal(destination.serviceRecipient('draig', destination.positions('draig').get(service)).name, 'Oweta Draig');
});
