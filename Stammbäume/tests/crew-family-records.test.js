import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { HOUSE_DYGER_FAMILY } from '../assets/js/data/house-dyger-family.js';
import { HOUSE_SCHWARZSTOLZ_FAMILY } from '../assets/js/data/house-schwarzstolz-family.js';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { createFamilyCandidates } from '../../AleriaAlmanach/modules/character-genealogy/genealogy-mapping.js';
import { LYNNE_CREW_MEMBERS } from '../assets/js/data/lynne-crew-family-members.js';
import { LYNNE_CREW_HOUSE_FAMILIES } from '../assets/js/data/lynne-crew-house-families.js';
import { RHYDIAN_CREW_HOUSE_FAMILIES } from '../assets/js/data/rhydian-crew-house-families.js';
import { createRegistryBrowserIndex, registryPathKey } from '../assets/js/modules/family-registry/registry-browser-model.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import { resolveFamilyChartEntryMainId } from '../assets/js/adapters/family-chart-viewport-policy.js';
import { createFamilyGraph } from '../assets/js/domain/family-graph.js';

test('Cadyn ist Mablis jüngerer Bruder und erreicht vorhandene Morgwynt-Akten genau einmal', async () => {
  const registered = assertValidFamily(FAMILY_REGISTRY.find(record => record.id === 'haus-morgwynt').family).family;
  const old = structuredClone(registered);
  old.persons = old.persons.filter(person => person.id === 'mabli-morgwynt');
  old.parentages = [];
  old.extensions.sourceRevision = 3;
  old.persons[0].notes = 'Eigene Notiz zu Mabli';
  const updated = resolveRegisteredFamilyUpgrade(registered, old);
  const cadyn = updated.persons.find(person => person.id === 'cadyn-morgwynt');
  assert.equal(cadyn.birth, '1726');
  assert.equal(cadyn.worldPersonId, 'person--haus-morgwynt--cadyn-morgwynt');
  assert.equal(updated.persons.find(person => person.id === 'mabli-morgwynt').notes, old.persons[0].notes);
  assert.equal(createFamilyGraph(updated).describeConnection('mabli-morgwynt', cadyn.id), 'Geschwister');
  assert.equal(updated.partnerships.length, registered.partnerships.length);
  assert.equal(updated.persons.filter(person => person.extensions.structuralPlaceholder).length, 0);
  const { data } = toFamilyChartData(updated);
  assert.deepEqual(data.find(person => person.id === cadyn.id).rels.parents, ['cadell-morgwynt', 'gwenllian-cadell-morgwynt-spouse']);
  assert.deepEqual(resolveRegisteredFamilyUpgrade(registered, updated), updated);
  await access(new URL('../' + cadyn.portrait, import.meta.url));
});

test('Rhydians drei neue Familien erscheinen in Talgarth mit validen Akten und erreichbaren Wappen', async () => {
  const index = createRegistryBrowserIndex(FAMILY_REGISTRY);
  const path = ['Cenyr', 'Klaueninsel', 'Sturmklaue', 'Talgarth'];
  const node = index.nodes.get(registryPathKey(path));
  assert.equal(RHYDIAN_CREW_HOUSE_FAMILIES.length, 3);
  assert.equal(new Set(FAMILY_REGISTRY.map(record => record.id)).size, FAMILY_REGISTRY.length);
  for (const source of RHYDIAN_CREW_HOUSE_FAMILIES) {
    const { family } = assertValidFamily(source);
    const record = FAMILY_REGISTRY.find(entry => entry.id === family.document.id);
    assert.deepEqual(record.folderPath, path);
    const rank = family.document.houseProfile.rankId;
    assert.ok(['commoner', 'knight'].includes(rank));
    assert.equal(record.type, rank === 'knight' ? 'lower-nobility' : 'commoner');
    assert.equal(family.lineage.crestFrame, rank === 'knight' ? 'silver' : 'iron');
    assert.ok(node.familyIds.has(record.id));
    // Namen sind noch Kandidaten: keine unbestätigten Gründer oder Genealogie.
    assert.equal(family.persons.length, 0);
    assert.equal(family.parentages.length, 0);
    assert.equal(family.partnerships.length, 0);
    await access(new URL(`../${family.document.emblem}`, import.meta.url));
    const publication = JSON.parse(await readFile(new URL(`../assets/data/published-families/${record.id}.json`, import.meta.url), 'utf8'));
    assert.equal(publication.familyId, record.id);
    assert.equal(publication.family.document.emblem, family.document.emblem);
    assertValidFamily(publication.family);
  }
});

test('Rhydians Kandidatenentwurf enthält pro Familie einen Mann und erhält die Herkunfts- und Altersvorgaben', async () => {
  const draft = JSON.parse(await readFile(new URL('../../AleriaAlmanach/assets/ship-crews/rhydians-schiffsmannschaft/crew-candidates-2026-10-05.json', import.meta.url), 'utf8'));
  const candidates = draft.candidates;
  assert.equal(candidates.length, 19);
  assert.ok(candidates.every(candidate => candidate.sex === 'male'));
  const ids = candidates.map(candidate => candidate.houseId).filter(Boolean);
  assert.equal(new Set(ids).size, ids.length);
  for (const [country, count] of [['Cenyr', 13], ['Aldrimar', 4], ['Vennyr', 2]]) {
    assert.equal(candidates.filter(candidate => candidate.originCountry === country).length, count);
  }
  assert.equal(candidates.filter(candidate => candidate.age > 30).length, 3);
  assert.equal(candidates.filter(candidate => candidate.age > 50).length, 2);
  const hakon = candidates.find(candidate => candidate.displayName === 'Håkon Graufels');
  assert.equal(hakon.age, 56);
  assert.equal(hakon.role, 'Waffenmeister');
  for (const [name, role] of [
    ['Uwchric Mathgraig', 'Steuermann'], ['Neddwyn Bevan', 'Feldscher'],
    ['Maelban Penry', 'Schreiber / Adjutant'], ['Thalan Bowen', 'Schiffszimmermann'],
    ['Ellor Parry', 'Schiffskoch'], ['Gwaeden Beryn', 'Wachmeister']
  ]) assert.equal(candidates.find(candidate => candidate.displayName === name).role, role);
  assert.ok(candidates.every(candidate => candidate.age > 30 || (candidate.age >= 17 && candidate.age <= 27)));
  for (const candidate of candidates.filter(entry => entry.houseId)) {
    const record = FAMILY_REGISTRY.find(entry => entry.id === candidate.houseId);
    assert.ok(record, candidate.houseId);
    assert.equal(record.houseProfile.seat, 'Talgarth');
  }
});

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

test('Caedmon bleibt Rhys Vater mit stabiler Identität und erhält die freigegebene Familienerweiterung', () => {
  const family = assertValidFamily(HOUSE_DYGER_FAMILY).family;
  const father = family.persons.find(person => person.id === 'tudur-dyger');
  assert.equal(father.name, 'Caedmon Dyger');
  assert.equal(father.worldPersonId, 'person--haus-dyger--tudur-dyger');
  assert.equal(father.birth, '1691');
  assert.equal(family.persons.length, 30);
  const parentage = family.parentages.find(edge => edge.childId === 'rhy-dyger');
  assert.deepEqual(parentage.parentIds, ['tudur-dyger', 'rhian-tudur-dyger-spouse']);
  assert.equal(parentage.legitimacy, 'legitimate');
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
  for (const slug of ['penry', 'bevan', 'hirschhorn', 'arian', 'parry', 'bowen', 'mathgraig', 'morgwynt', 'morglan']) {
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
    const expanded = ['Dyger', 'Prys', 'Mathgraig', 'Penry', 'Morgwynt', 'Hirschhorn', 'Morglan'].includes(member.surname);
    if (isEira) assert.equal(person.birth, '1726');
    if (!expanded && !isEira) assert.equal(person.birth, '');
    assert.equal(family.parentages.some(edge => edge.childId === person.id || edge.parentIds.includes(person.id)), expanded || isEira);
    assert.equal(family.partnerships.some(edge => edge.participantIds.includes(person.id)), person.id === 'angharad-morglan');
    const candidates = FAMILY_REGISTRY.flatMap(createFamilyCandidates).filter(candidate => candidate.worldPersonId === person.worldPersonId);
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
  assert.equal(resolveFamilyChartEntryMainId(data, 'caradog-beryn', eira.id), 'caradog-beryn');
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
  for (const member of LYNNE_CREW_MEMBERS.filter(member => member.sourceRevision >= 2)) {
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
