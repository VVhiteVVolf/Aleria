import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { classifyCharacterArchiveEntries } from '../modules/character-archive/character-archive-classification.js';
import { normalizeCharacterArchiveEntry as entry, mergeCharacterArchiveEntries as merge, extractCharacterArchiveEntries } from '../modules/character-archive/character-archive-model.js';
import { SKILL_DEFINITIONS } from '../modules/skill-checks/skill-definitions.js';

const project = entries => merge(classifyCharacterArchiveEntries(entries));
const skill = (owner, data = {}, extra = {}) => entry({ id: `skill-copy-${owner}`, kind: 'skill', name: 'Athletik',
  archivedFromProfile: true, sources: [{ kind: 'character', id: owner, name: owner }],
  data: { id: `profile-skill-${owner}`, name: 'Athletik', attributeKey: 'strength', proficiency: 'none', bonus: 0, notes: '', ...data }, ...extra });

test('known skill archive definitions aggregate personal training, bonuses and derived notes without changing profiles', () => {
  const inputs = [skill('a', { proficiency: 'expertise', bonus: 7, notes: 'Persönliche Ausbildung', attributeKey: 'dexterity' }),
    skill('b', { proficiency: 'trained', bonus: 2 }),
    skill('c', { bonus: -1, notes: 'Andere persönliche Ausbildung' }, { iconOverride: '/chosen.webp', iconAssignmentVersion: 1 })];
  const before = structuredClone(inputs);
  const actual = project(inputs);
  assert.equal(actual.length, 1);
  assert.deepEqual(actual[0].sources.map(source => source.id).sort(), ['a', 'b', 'c']);
  assert.equal(actual[0].data.proficiency, 'none');
  assert.equal(actual[0].data.bonus, 0);
  assert.equal(actual[0].data.attributeKey, 'strength');
  assert.equal(actual[0].data.notes, '');
  assert.equal(actual[0].description, '');
  assert.equal(actual[0].icon, '/chosen.webp');
  assert.deepEqual(inputs, before);
});

test('authored skill rules, independent descriptions and unknown mechanics remain separate variants', () => {
  const automatic = skill('a');
  const variants = [
    skill('b', { description: 'Gilt außerdem zum Lenken einer Kutsche.' }),
    skill('c', {}, { description: 'Eigene abweichende Regelbeschreibung.' }),
    skill('d', { unknownCheckRule: { advantage: true } }),
    skill('e', { userAuthored: true, notes: 'Explizite Archivregel.', attributeKey: 'constitution' })
  ];
  const actual = project([automatic, ...variants]);
  assert.equal(actual.length, 5);
  assert.ok(actual.some(value => value.data.unknownCheckRule?.advantage));
  assert.ok(actual.some(value => value.data.attributeKey === 'constitution' && value.data.notes === 'Explizite Archivregel.'));
});

test('known aliases canonicalize while unfamiliar skills keep their own rules', () => {
  const aliases = ['Überreden', 'Überzeugen'].map((name, i) => entry({ kind: 'skill', name,
    archivedFromProfile: true, data: { name, proficiency: i ? 'expertise' : 'none', bonus: i } }));
  const unknown = entry({ kind: 'skill', name: 'Seemannsknoten', data: { bonus: 5, proficiency: 'trained', specialRule: 'Seil' } });
  const actual = project([...aliases, unknown]);
  assert.equal(actual.length, 2);
  assert.equal(actual.find(value => value.data.id === 'persuasion').name, 'Überzeugen');
  assert.deepEqual(actual.find(value => value.name === unknown.name), unknown);
});

test('the current public character snapshot projects exactly the twenty shared skill definitions', async () => {
  const snapshot = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8'));
  const before = structuredClone(snapshot);
  const entries = snapshot.characters.flatMap(record => extractCharacterArchiveEntries(record)).filter(value => value.kind === 'skill');
  assert.ok(entries.length > SKILL_DEFINITIONS.length);
  const actual = project(entries);
  assert.deepEqual(actual.map(value => value.data.id).sort(), SKILL_DEFINITIONS.map(value => value.id).sort());
  assert.ok(actual.every(value => value.data.proficiency === 'none' && value.data.bonus === 0));
  assert.ok(actual.some(value => value.sources.length > 1));
  assert.deepEqual(snapshot, before);
});
