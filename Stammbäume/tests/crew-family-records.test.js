import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { HOUSE_DYGER_FAMILY } from '../assets/js/data/house-dyger-family.js';
import { HOUSE_SCHWARZSTOLZ_FAMILY } from '../assets/js/data/house-schwarzstolz-family.js';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { createFamilyCandidates } from '../../AleriaAlmanach/modules/character-genealogy/genealogy-mapping.js';
import { LYNNE_CREW_MEMBERS } from '../assets/js/data/lynne-crew-family-members.js';
import { LYNNE_CREW_HOUSE_FAMILIES } from '../assets/js/data/lynne-crew-house-families.js';
import { createRegistryBrowserIndex, registryPathKey } from '../assets/js/modules/family-registry/registry-browser-model.js';

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
  assert.deepEqual(family.persons.map(person => person.name), ['Tudur Dyger', 'Rhy Dyger', 'Awen Dyger']);
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

test('Lynnes zwölf Angehörige sind eindeutig in den Klaueninseln auffindbar, ohne erfundene Abstammung', async () => {
  const index = createRegistryBrowserIndex(FAMILY_REGISTRY);
  const county = index.nodes.get(registryPathKey(['Cenyr', 'Klaueninsel']));
  assert.equal(LYNNE_CREW_HOUSE_FAMILIES.length, 10);
  for (const member of LYNNE_CREW_MEMBERS) {
    const familyId = `haus-${member.surname.toLowerCase()}`;
    const records = FAMILY_REGISTRY.filter(record => record.id === familyId);
    assert.equal(records.length, 1, familyId);
    assert.ok(county.familyIds.has(familyId));
    const family = assertValidFamily(records[0].family).family;
    const person = family.persons.find(person => person.id === member.id);
    assert.equal(person.name, member.name);
    assert.equal(person.birth, '');
    assert.equal(family.parentages.some(edge => edge.childId === person.id || edge.parentIds.includes(person.id)), false);
    assert.equal(family.partnerships.some(edge => edge.participantIds.includes(person.id)), false);
    const candidates = FAMILY_REGISTRY.flatMap(createFamilyCandidates).filter(candidate => candidate.displayName === member.name);
    assert.equal(candidates.length, 1, member.name);
    await access(new URL('../' + person.portrait, import.meta.url));
    await access(new URL('../' + family.document.emblem, import.meta.url));
  }
  for (const slug of ['bevan', 'arian', 'hirschhorn', 'parry']) {
    assert.equal(FAMILY_REGISTRY.find(record => record.id === `haus-${slug}`).houseProfile.rankId, 'unknown');
  }
  const beryn = FAMILY_REGISTRY.find(record => record.id === 'haus-beryn').family;
  assert.equal(beryn.persons.find(person => person.id === 'eira-cadell-spouse').name, 'Eira');
  assert.equal(beryn.persons.find(person => person.id === 'eirlys-beryn').extensions.formerName, 'Eira Beryn');
});
