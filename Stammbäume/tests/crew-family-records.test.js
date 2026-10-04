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
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { resolveFamilyChartEntryMainId } from '../assets/js/adapters/family-chart-viewport-policy.js';

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

test('Lynnes zwölf Angehörige sind mit Eiras freigegebener Abstammung eindeutig in den Klaueninseln auffindbar', async () => {
  const index = createRegistryBrowserIndex(FAMILY_REGISTRY);
  const county = index.nodes.get(registryPathKey(['Cenyr', 'Klaueninsel']));
  const talgarthPath = ['Cenyr', 'Klaueninsel', 'Sturmklaue', 'Talgarth'];
  const talgarth = index.nodes.get(registryPathKey(talgarthPath));
  for (const slug of ['penry', 'bevan', 'hirschhorn', 'arian', 'parry', 'bowen']) {
    const record = FAMILY_REGISTRY.find(record => record.id === `haus-${slug}`);
    assert.deepEqual(record.folderPath, talgarthPath);
    assert.ok(talgarth.familyIds.has(record.id));
  }
  assert.equal(LYNNE_CREW_HOUSE_FAMILIES.length, 10);
  for (const member of LYNNE_CREW_MEMBERS) {
    const familyId = `haus-${member.surname.toLowerCase()}`;
    const records = FAMILY_REGISTRY.filter(record => record.id === familyId);
    assert.equal(records.length, 1, familyId);
    assert.ok(county.familyIds.has(familyId));
    const family = assertValidFamily(records[0].family).family;
    const person = family.persons.find(person => person.id === member.id);
    assert.equal(person.name, member.name);
    const isEira = person.id === 'eirlys-beryn';
    assert.equal(person.birth, isEira ? '1726' : '');
    assert.equal(family.parentages.some(edge => edge.childId === person.id || edge.parentIds.includes(person.id)), isEira);
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
  assert.equal(beryn.persons.find(person => person.id === 'eirlys-beryn').name, 'Eira Beryn');
  assert.equal(beryn.persons.find(person => person.id === 'eirlys-beryn').extensions.formerName, undefined);
});

test('Eira gehört als Owains und Mareds Tochter zur sichtbaren Beryn-Hauptlinie und bleibt dieselbe Weltperson', () => {
  const family = FAMILY_REGISTRY.find(record => record.id === 'haus-beryn').family;
  const eira = family.persons.find(person => person.id === 'eirlys-beryn');
  assert.equal(eira.worldPersonId, 'person--haus-beryn--eirlys-beryn');
  assert.equal(eira.name, 'Eira Beryn');
  assert.equal(eira.birth, '1726');
  const parentage = family.parentages.find(edge => edge.childId === eira.id);
  assert.deepEqual(parentage.parentIds, ['owain-beryn', 'mared-owain-spouse']);
  assert.equal(parentage.partnershipId, 'marriage-owain-mared-beryn');
  assert.equal(parentage.legitimacy, 'legitimate');
  for (const parentId of parentage.parentIds) {
    assert.ok(Number(eira.birth) - Number(family.persons.find(person => person.id === parentId).birth) >= 18);
  }
  const { data } = toFamilyChartData(family);
  assert.equal(resolveFamilyChartEntryMainId(data, family.view.focusPersonId, eira.id), family.view.focusPersonId);
  assert.deepEqual(data.find(person => person.id === eira.id).rels.parents.sort(), [...parentage.parentIds].sort());
  const olderEira = family.persons.find(person => person.id === 'eira-cadell-spouse');
  assert.equal(olderEira.name, 'Eira');
  assert.equal(olderEira.birth, '1688');
});

test('Eine alte isolierte Eirlys-Akte erhält Name und Eltern genau einmal, ohne doppelte Person', () => {
  const registered = FAMILY_REGISTRY.find(record => record.id === 'haus-beryn').family;
  const local = structuredClone(assertValidFamily(registered).family);
  local.extensions.sourceRevision = 4;
  local.parentages = local.parentages.filter(edge => edge.childId !== 'eirlys-beryn');
  const oldEira = local.persons.find(person => person.id === 'eirlys-beryn');
  oldEira.name = 'Eirlys Beryn';
  oldEira.birth = '';
  oldEira.notes = 'Eltern und Einordnung bleiben offen.';
  oldEira.extensions = { formerName: 'Eira Beryn' };
  const upgraded = resolveRegisteredFamilyUpgrade(registered, local);
  const eira = upgraded.persons.find(person => person.id === oldEira.id);
  assert.equal(eira.name, 'Eira Beryn');
  assert.equal(eira.worldPersonId, oldEira.worldPersonId);
  assert.equal(eira.portrait, oldEira.portrait);
  assert.equal(eira.extensions.formerName, undefined);
  assert.match(eira.notes, /Tochter von Owain Beryn und Mared/);
  assert.equal(upgraded.persons.length, local.persons.length);
  assert.equal(upgraded.parentages.filter(edge => edge.childId === eira.id).length, 1);
  assert.deepEqual(upgraded.parentages.filter(edge => edge.childId !== eira.id), local.parentages);
  assert.deepEqual(upgraded.partnerships, local.partnerships);
  assert.deepEqual(resolveRegisteredFamilyUpgrade(registered, upgraded), upgraded);
});

test('Lynnes Bild- und Sitzkorrekturen erreichen vorhandene Akten und bewahren Identitäten und eigene Notizen', () => {
  for (const member of LYNNE_CREW_MEMBERS.filter(member => member.sourceRevision === 2)) {
    const registered = FAMILY_REGISTRY.find(record => record.id === `haus-${member.surname.toLowerCase()}`).family;
    const local = structuredClone(registered);
    local.extensions.sourceRevision = 1;
    local.persons[0].notes = 'Eigene Notiz zur letzten Fahrt';
    if (member.portrait) local.persons[0].portrait = 'vorheriges-portrait.png';
    if (member.emblem) {
      local.document.emblem = 'vorheriges-wappen.png';
      local.houses[0].emblem = 'vorheriges-wappen.png';
    }
    if (member.seat) {
      local.document.houseProfile.seat = '';
      local.document.houseProfile.barony = '';
    }
    const upgraded = resolveRegisteredFamilyUpgrade(registered, local);
    assert.equal(upgraded.persons[0].worldPersonId, local.persons[0].worldPersonId);
    assert.equal(upgraded.persons[0].notes, local.persons[0].notes);
    assert.equal(upgraded.persons[0].portrait, registered.persons[0].portrait);
    assert.equal(upgraded.document.emblem, registered.document.emblem);
    assert.equal(upgraded.houses[0].emblem, registered.houses[0].emblem);
    assert.deepEqual(upgraded.document.houseProfile, registered.document.houseProfile);
    assert.deepEqual(upgraded.parentages, local.parentages);
    assert.deepEqual(upgraded.partnerships, local.partnerships);
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered, upgraded), upgraded);
  }
});
