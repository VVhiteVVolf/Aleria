import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createFamilyCandidates } from '../modules/character-genealogy/genealogy-mapping.js';
import { ARGALL_CAPTAIN_PEOPLE } from '../modules/fleischsammler-argall/household.mjs';
import { ARGALL_CAPTAIN_FEATURE, buildArgallHouseholdExports } from '../modules/fleischsammler-argall/character-content.mjs';
import { buildAuthoredCharacterImport } from '../../CharakterDatenbank/lib/authored-character-import.mjs';

const root = new URL('../../', import.meta.url);
const family = FAMILY_REGISTRY.find(record => record.id === 'haus-argall');
const exports = buildArgallHouseholdExports(family);
const people = ARGALL_CAPTAIN_PEOPLE;

test('the seventeen-year-old squire retains both divorced parents in his character record', () => {
  const son = exports.find(entry => entry.character.id === people.squire.worldPersonId).character;
  assert.equal(son.age, 17);
  assert.deepEqual(son.genealogy.relationships.parents.map(parent => parent.worldPersonId).sort(), [people.captain.worldPersonId, people.mother.worldPersonId].sort());
  assert.ok(son.genealogy.relationships.parents.every(parent => parent.type === 'biological'));
  assert.match(son.title, /Knappe seines Vaters/);
  assert.equal(son.portrait, people.squire.portrait);
  assert.equal(exports.find(entry => entry.character.id === people.bard.worldPersonId).character.genealogy.relationships.children.length, 0);
});

test('the former marriage and present affair remain distinct, with Aberon as the couples actual location', () => {
  const mother = exports.find(entry => entry.character.id === people.mother.worldPersonId);
  const captain = exports.find(entry => entry.character.id === people.captain.worldPersonId);
  assert.equal(captain.assignedTab, 'Gwynthor');
  assert.equal(mother.assignedTab, 'Aberon');
  assert.equal(mother.character.currentLocation, 'Aberon');
  assert.match(mother.character.bio, /Durchgebrannt nach Aberon/);
  assert.deepEqual(mother.character.genealogy.relationships.partners.map(partner => [partner.worldPersonId, partner.type, partner.status]), [
    [people.captain.worldPersonId, 'marriage', 'divorced'], [people.bard.worldPersonId, 'affair', 'active']
  ]);
});

test('the bounded family-linked import preserves unrelated inventory, resources and database records', () => {
  const prior = {
    registry: { records: [{ recordId: 'old', path: 'keep', primary: { kind: 'group' }, familyStatus: 'pending' }], sourceOverlays: [], sourceExportedAt: '2026-01-01' },
    snapshot: { characters: [{ id: 'old', inventory: { items: [{ id: 'live-item' }] }, combatProfile: { hitPoints: { current: 2 } } }], charTabs: { tabs: ['Alle'], map: {} } },
    report: { summary: { sourceDocuments: 1, total: 1 }, pending: [] }
  };
  const candidates = createFamilyCandidates(family);
  const result = buildAuthoredCharacterImport(prior, exports, ARGALL_CAPTAIN_FEATURE, candidates);
  assert.deepEqual(result.snapshot.characters.find(person => person.id === 'old'), prior.snapshot.characters[0]);
  assert.deepEqual(result.registry.records.find(record => record.recordId === 'old'), prior.registry.records[0]);
  assert.equal(result.records.length, 4);
  for (const item of result.records) {
    assert.equal(item.record.classification.familyStatus, 'linked');
    assert.equal(item.record.local.authoredFeature, ARGALL_CAPTAIN_FEATURE);
  }
  const repeated = buildAuthoredCharacterImport(result, exports, ARGALL_CAPTAIN_FEATURE, candidates);
  for (const projection of ['registry', 'snapshot', 'report']) assert.deepEqual(repeated[projection], result[projection]);
});

test('all four individual portraits and canonical character records exist', async () => {
  const snapshot = JSON.parse(await readFile(new URL('CharakterDatenbank/generated/characters.snapshot.json', root), 'utf8'));
  for (const spec of Object.values(people)) {
    const matches = snapshot.characters.filter(person => person.id === spec.worldPersonId);
    assert.equal(matches.length, 1, spec.name);
    assert.equal(matches[0].portrait, spec.portrait);
    assert.ok((await stat(new URL(spec.portrait.slice(1), root))).size > 1000, spec.name);
  }
});
