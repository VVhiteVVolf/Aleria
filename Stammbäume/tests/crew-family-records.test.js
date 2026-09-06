import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { HOUSE_DYGER_FAMILY } from '../assets/js/data/house-dyger-family.js';
import { HOUSE_SCHWARZSTOLZ_FAMILY } from '../assets/js/data/house-schwarzstolz-family.js';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { createFamilyCandidates } from '../../AleriaAlmanach/modules/character-genealogy/genealogy-mapping.js';

test('Dyger ist ein niederes Ritterhaus in Talgarth und direkter Arth-Vasall', () => {
  const { family } = assertValidFamily(HOUSE_DYGER_FAMILY);
  const entry = FAMILY_REGISTRY.find(record => record.id === 'haus-dyger');
  assert.equal(entry.type, 'lower-nobility');
  assert.deepEqual(entry.folderPath, ['Cenyr', 'Klaueninsel', 'Sturmklaue', 'Talgarth']);
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-arth');
  assert.equal(family.lineage.crestFrame, 'silver');
  assert.match(family.document.description, /keine Barddwyr/);
});

test('Tudur ist Rhys Vater, ohne erfundene Mutter, Ehe oder Hausoberhaupt', () => {
  const family = assertValidFamily(HOUSE_DYGER_FAMILY).family;
  assert.deepEqual(family.persons.map(person => person.name), ['Tudur Dyger', 'Rhy Dyger']);
  assert.equal(family.partnerships.length, 0);
  assert.equal(family.parentages.length, 1);
  assert.equal(family.parentages[0].childId, 'rhy-dyger');
  assert.deepEqual(family.parentages[0].parentIds, ['tudur-dyger']);
  assert.equal(family.parentages[0].legitimacy, 'unknown');
  assert.ok(family.persons.every(person => person.lineageRole !== 'head'));
  assert.ok(family.extensions.pendingFamilySituation.openQuestions.length);
});

test('Schwarzstolz führt Sindre in Eldvik als Bastard und bewahrt die offenen Familienfragen', () => {
  const { family } = assertValidFamily(HOUSE_SCHWARZSTOLZ_FAMILY);
  const entry = FAMILY_REGISTRY.find(record => record.id === 'haus-schwarzstolz');
  assert.deepEqual(entry.folderPath, ['Aldrimar', 'Krähenmoor', 'Hesirentum von Schwarzfjord', 'Eldvik']);
  assert.equal(family.persons.length, 1);
  assert.equal(family.persons[0].name, 'Sindre Brandstolz');
  assert.equal(family.persons[0].familyRole, 'bastard');
  assert.equal(family.persons[0].houseId, 'house-schwarzstolz');
  assert.equal(family.parentages.length, 0);
  assert.equal(family.partnerships.length, 0);
  assert.match(family.extensions.pendingFamilySituation.halfBrother, /Herdglut/);
  assert.match(family.extensions.pendingFamilySituation.mother, /Verbleib ist nicht festgelegt/);
  assert.equal(family.document.houseProfile.rankId, 'unknown');
});

test('Beide Mannschaftsmitglieder besitzen eindeutige Stammbaumidentitäten und vorhandene Bilder', async () => {
  for (const [familyId, name, worldId] of [
    ['haus-dyger', 'Rhy Dyger', 'person--haus-dyger--rhy-dyger'],
    ['haus-schwarzstolz', 'Sindre Brandstolz', 'person--haus-schwarzstolz--sindre-brandstolz']
  ]) {
    const record = FAMILY_REGISTRY.find(entry => entry.id === familyId);
    const candidates = FAMILY_REGISTRY.flatMap(createFamilyCandidates).filter(candidate => candidate.displayName === name);
    assert.equal(candidates.length, 1);
    assert.equal(candidates[0].worldPersonId, worldId);
    await access(new URL('../' + record.family.document.emblem, import.meta.url));
    const person = record.family.persons.find(person => person.name === name);
    await access(new URL('../' + person.portrait, import.meta.url));
  }
});
