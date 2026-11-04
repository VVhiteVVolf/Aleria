import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { HOUSE_PERLLAN_FAMILY as family } from '../assets/js/data/house-perllan-family.js';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { assertValidFamily } from '../assets/js/domain/family-schema.js';
import { auditFamilyChartLayoutPolicy } from '../assets/js/adapters/family-chart-layout-policy.js';

const archive = new URL('../assets/data/source-inventories/perllan-20261104/', import.meta.url);
const original = JSON.parse(await readFile(new URL('family.json', archive), 'utf8'));
const inventory = JSON.parse(await readFile(new URL('inventory.json', archive), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

test('the existing web-published perllan identity and all 44 source persons are continued without a duplicate family', async () => {
  const bytes = await readFile(new URL('../assets/data/published-families/backups/perllan/r00000001-20261104T151812361Z.json', import.meta.url));
  assert.equal(hash(bytes), '6c242c936835fe2d8baadbcaeda80cb3952db288a02636c138696e6ff1a59ee2');
  const remote = JSON.parse(bytes);
  assert.equal(remote.familyId, 'perllan');
  assert.equal(remote.revision, 1);
  assert.equal(remote.family.document.id, original.document.id);
  assert.deepEqual(remote.family.persons, original.persons);
  for (const key of ['partnerships', 'parentages', 'cadetBranches', 'timeJumps', 'lineage', 'presentation', 'view']) {
    assert.deepEqual(remote.family[key], original[key], `existing remote ${key}`);
    assert.deepEqual(family[key], remote.family[key], `continued ${key}`);
  }
  assert.equal(family.document.id, remote.family.document.id);
  assert.equal(FAMILY_REGISTRY.filter(record => record.id === 'perllan').length, 1);
  assert.equal(FAMILY_REGISTRY.filter(record => record.id === 'haus-perllan').length, 0);
});

test('the published Perllan snapshot uses the transparent crest in every active reference without changing identities', async () => {
  const publishedRoot = new URL('../assets/data/published-families/', import.meta.url);
  const snapshot = JSON.parse(await readFile(new URL('perllan.json', publishedRoot), 'utf8'));
  const registry = JSON.parse(await readFile(new URL('registry.json', publishedRoot), 'utf8'));
  assert.equal(snapshot.family.document.emblem, family.document.emblem);
  assert.match(snapshot.family.document.emblem, /\/perllan-emblem\.png$/);
  assert.equal(snapshot.family.houses.find(house => house.id === 'house-perllan').emblem, family.document.emblem);
  assert(!/\/(?:document-emblem|house-house-perllan)\.jpg/.test(JSON.stringify(snapshot.family)));
  assert.equal(snapshot.family.persons.length, original.persons.length);
  for (const person of original.persons) {
    const current = snapshot.family.persons.find(row => row.id === person.id);
    for (const field of ['id', 'worldPersonId', 'name', 'birth', 'death', 'status', 'sex', 'houseId']) {
      assert.equal(current[field], person[field], `${person.id}/${field}`);
    }
  }
  for (const key of ['partnerships', 'parentages', 'cadetBranches', 'timeJumps', 'lineage', 'presentation', 'view']) {
    assert.deepEqual(snapshot.family[key], original[key], key);
  }
  const entry = registry.families.find(row => row.id === 'perllan');
  assert.equal(entry.revision, snapshot.revision);
  assert.equal(entry.emblem, family.document.emblem);
  assert(snapshot.revision >= 2);
});

test('Perllan imports the complete valid graph and supplied identities', () => {
  assert.deepEqual(assertValidFamily(family).diagnostics, []);
  assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues, []);
  assert.equal(family.persons.length, 44);
  assert.equal(family.partnerships.length, 16);
  assert.equal(family.parentages.length, 27);
  for (const key of ['partnerships', 'parentages', 'cadetBranches', 'timeJumps', 'lineage', 'presentation', 'view']) {
    assert.deepEqual(family[key], original[key], key);
  }
  for (const source of original.persons) {
    const imported = family.persons.find(person => person.id === source.id);
    assert.ok(imported, source.id);
    const { biographyModule, ...sourceExtensions } = imported.extensions;
    assert.deepEqual({ ...imported, portrait: source.portrait, extensions: sourceExtensions }, source, source.id);
    if (source.portrait) assert.ok(biographyModule, `${source.name} has the shared character biography`);
    else assert.equal(biographyModule, undefined);
  }
  assert.deepEqual(family.extensions.generatorProfile, original.extensions.generatorProfile);
  assert.equal(family.extensions.sourceDocumentId, 'perllan');
  assert.equal(family.houses[0].id, 'house-perllan');
});

test('Perllan has one commoner entry at Gwynthor and no assumed house liege', () => {
  const entries = FAMILY_REGISTRY.filter(record => record.id === 'perllan');
  assert.equal(entries.length, 1);
  assert.equal(family.document.id, original.document.id);
  assert.equal(family.document.id, 'perllan');
  assert.equal(FAMILY_REGISTRY.filter(record => record.id === 'haus-perllan').length, 0);
  assert.equal(entries[0].type, 'commoner');
  assert.deepEqual(entries[0].folderPath, ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']);
  assert.equal(family.document.houseProfile.rankId, 'commoner');
  assert.equal(family.document.houseProfile.liegeHouseId, '');
  assert.equal(family.document.houseProfile.liegeHouseName, '');
  assert.deepEqual(family.document.houseProfile.secondarySeats, []);
  const worldIds = new Set(family.persons.map(person => person.worldPersonId));
  for (const entry of FAMILY_REGISTRY.filter(record => record.id !== 'perllan')) {
    for (const person of entry.family.persons) {
      assert.ok(!worldIds.has(person.worldPersonId), `${entry.id}/${person.id}`);
    }
  }
});

test('source files and all active portraits and emblems retain their original bytes', async () => {
  assert.equal(inventory.files.length, 32);
  assert.equal(inventory.files.filter(file => file.activePath).length, 29);
  for (const file of inventory.files) {
    const retained = await readFile(new URL(file.path, archive));
    assert.equal(retained.length, file.bytes, file.path);
    assert.equal(hash(retained), file.sha256, file.path);
    if (file.activePath) {
      const active = await readFile(new URL(`../${file.activePath}`, import.meta.url));
      assert.equal(hash(active), file.sha256, file.activePath);
    }
  }
  assert.equal((await readFile(new URL('Perllan.html', archive))).length, 0);
  assert.equal(family.persons.filter(person => person.portrait).length, 27);
  assert.ok(family.persons.filter(person => person.portrait).every(person => !/^https?:/.test(person.portrait)));
});

test('unknown names, deaths and shared pictures do not merge separate persons', () => {
  const people = new Map(family.persons.map(person => [person.id, person]));
  assert.equal(people.get('perllan-gruender').status, 'alive');
  assert.equal(people.get('perllan-gruenderin').status, 'alive');
  assert.equal(family.persons.filter(person => person.name.startsWith('?')).length, 15);
  assert.equal(people.get('person-0866e981').status, 'dead');
  assert.equal(people.get('person-0866e981').death, '1727');
  assert.equal(people.get('person-813d2bd0').status, 'dead');
  assert.equal(people.get('person-813d2bd0').death, '????');
  assert.equal(people.get('person-e802f95d').name, 'Gwern');
  assert.equal(people.get('person-44498061').name, 'Draenen');
  assert.notEqual(people.get('person-e802f95d').worldPersonId, people.get('person-44498061').worldPersonId);
  assert.equal(people.get('person-b57f28f9').title, 'Knappe');
  assert.equal(people.get('person-02e7bc53').title, 'Page');
});

test('four pictured animals retain their evidence and exact owner identities', () => {
  assert.deepEqual(inventory.picturedAnimals.map(entry => [entry.ownerPersonId, entry.animals]), [
    ['person-b758cea4', ['Eichhörnchen', 'Rotkehlchen']],
    ['person-f3cccc1a', ['Kaninchen', 'Blaumeise']]
  ]);
  for (const entry of inventory.picturedAnimals) {
    assert.ok(family.persons.some(person => person.id === entry.ownerPersonId));
    assert.match(entry.evidence, /Bildbeleg/);
  }
});
