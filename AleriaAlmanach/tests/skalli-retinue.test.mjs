import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import { buildSkalliRetinue } from '../modules/skalli-retinue/retinue-module.mjs';
import { RETINUE_PEOPLE, RETINUE_PATH } from '../modules/skalli-retinue/retinue-people.mjs';
import { planRetinueCharacters } from '../modules/skalli-retinue/retinue-characters.mjs';
import { collectGroupRoster } from '../modules/landing/group-landing-roster.js';
import { normalizeLandingData } from '../modules/landing/landing-model.js';
const source = JSON.parse(readFileSync(new URL('../modules/skalli-retinue/skalli-biography-source.json', import.meta.url), 'utf8'));
const entry = buildSkalliRetinue(source);
const hierarchy = entry.pages.find(page => page.hierarchyPage).hierarchy;

test('the roster contains the selected people once, including the explicit Hyrmgarthr exception', () => {
  const roster = collectGroupRoster(entry);
  assert.equal(roster.length, 19);
  assert.deepEqual(new Set(roster.map(person => person.name)), new Set(RETINUE_PEOPLE.map(person => person.name)));
  assert(roster.some(person => person.name === 'Hati Varulv'));
  assert(roster.some(person => person.name === 'Aradin Hyrmgarthr'));
  assert(!roster.some(person => /Kampfgeboren|Schwarzdorn|Blutdorn|Bogenhand|Dornacker/.test(person.name)));
  assert.deepEqual(RETINUE_PATH, ['Aldrimar', 'Roriksheim', 'Haus Varulv']);
});

test('age cutoff, personal training, four-person rows and empty animal slots survive shared sanitation', () => {
  const context = vm.createContext({ window: {}, deepClone: structuredClone });
  vm.runInContext(readFileSync(new URL('../modules/module-editor/module-editor-data.js', import.meta.url), 'utf8'), context);
  context.input = hierarchy;
  const clean = JSON.parse(JSON.stringify(vm.runInContext('sanitizeHierarchyData(input)', context)));
  assert.deepEqual(clean.trees, hierarchy.trees);
  assert.deepEqual(clean.trees.map(tree => tree.label), ['Führung & Verwaltung', 'Schar', 'Nachwüchsler', 'Tiere']);
  const youth = clean.trees.find(tree => tree.id === 'nachwuchs').levels.flatMap(level => level.nodes).filter(node => node.subtitle);
  assert.equal(youth.length, 5);
  for (const person of RETINUE_PEOPLE) assert.equal(youth.some(node => node.subtitle === person.name), person.age < 18);
  assert(youth.find(node => node.subtitle === 'Gundel Varulv').title.includes('Maer'));
  assert(youth.find(node => node.subtitle === 'Kjell Rotstahl').title.includes('Drengr'));
  assert(clean.trees.find(tree => tree.id === 'schar').levels.every(level => level.nodes.length === 4));
  const animals = clean.trees.find(tree => tree.id === 'tiere').levels.flatMap(level => level.nodes);
  assert.equal(animals.length, 4);
  assert(animals.every(node => !node.subtitle && !node.portrait));
});

test('overview follows hierarchy, carries all members and leaves existing scene clocks unassigned', () => {
  assert.equal(entry.pages.length, 5);
  assert(entry.pages[2].hierarchyPage);
  assert(entry.pages[3].landingPage);
  const landing = normalizeLandingData(entry.pages[3].landing);
  assert.equal(landing.group.members.length, 19);
  assert(landing.group.members.every(member => member.assignment === 'active'));
  assert.deepEqual(entry.pages[4].sessionDateAleria, { year: null, month: null, day: null });
  assert.equal(new Set(entry.pages.map(page => page.commentThreadKey)).size, 5);
});

test('family import retains existing IDs, biography, equipment and live resources', () => {
  const person = RETINUE_PEOPLE.find(person => person.key === 'fenrir-varulv');
  const existing = { id: 'online-fenrir', name: person.name, identity: { worldPersonId: person.worldPersonId },
    genealogy: { sources: [] }, biography: { custom: 'keep' }, inventory: { coins: 27 }, combatProfile: { hitPoints: { current: 7 }, resources: { action: 0 } } };
  const before = structuredClone(existing);
  const plan = planRetinueCharacters([existing], { tabs: ['Existing'], map: { Existing: ['unrelated'] } }, '2026-10-18T00:00:00Z');
  const result = plan.entries.find(item => item.key === person.key);
  assert.equal(result.id, 'online-fenrir');
  assert.equal(result.create, false);
  assert.deepEqual(Object.keys(result.patch).sort(), ['genealogy', 'updatedAt']);
  assert.deepEqual(existing, before);
  assert.deepEqual(plan.config.map.Existing, ['unrelated']);
});

test('registration is idempotent and preserves editorial changes; all linked portraits exist', () => {
  const context = vm.createContext({ SECTIONS: [] });
  const generated = readFileSync(new URL('../modules/skalli-retinue/retinue-data.js', import.meta.url), 'utf8');
  vm.runInContext(generated, context);
  context.SECTIONS[0].entries[0].title = 'Edited';
  vm.runInContext(generated, context);
  assert.equal(context.SECTIONS.length, 1);
  assert.equal(context.SECTIONS[0].entries.length, 1);
  assert.equal(context.SECTIONS[0].entries[0].title, 'Edited');
  for (const person of RETINUE_PEOPLE) assert(existsSync(new URL(person.portrait, new URL('../AleriaAlmanach.html', import.meta.url))), person.portrait);
});

test('Fenrir retains his established online ID even before a genealogy link exists', () => {
  const previous = { id: 'FKiXsSWVoV74rTgmpPip', name: 'Fenrir Varulv', identity: { worldPersonId: '' }, genealogy: { worldPersonId: '', sources: [] }, combatProfile: { hitPoints: { current: 3 } } };
  const result = planRetinueCharacters([previous], {}).entries.find(item => item.key === 'fenrir-varulv');
  assert.equal(result.id, previous.id);
  assert.equal(result.create, false);
  assert.equal(previous.identity.worldPersonId, '');
  assert.equal(previous.combatProfile.hitPoints.current, 3);
});

test('leadership keeps weapons and quartermaster posts vacant and appoints Hvitserk as first skald', () => {
  const staff = hierarchy.trees[0].levels[2].nodes;
  assert.equal(staff.find(node => node.title === 'Erster Skalde').subtitle, 'Hvitserk Skald');
  for (const title of ['Waffenmeister', 'Quartiermeister']) {
    const position = staff.find(node => node.title === title);
    assert.equal(position.subtitle, '');
    assert.equal(position.portrait, '');
  }
  assert(!staff.some(node => ['Fenrir Varulv', 'Freya Skald', 'Ivar Skald'].includes(node.subtitle)));
});
