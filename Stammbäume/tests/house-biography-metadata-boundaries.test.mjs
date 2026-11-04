import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { normalizeFamily } from '../assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { withHouseBiographyDefault } from '../assets/js/modules/house-biography/house-biography-registry-default.js';
import { houseBiographyDefaultFingerprint } from '../assets/js/modules/house-biography/house-biography-fingerprint.js';

const before = JSON.parse(readFileSync(new URL(
  '../../diagnostics/house-content-lore-fixes-20261104/before.json', import.meta.url
), 'utf8'));
const ids = ['haus-varulv', 'haus-feuerherz'];
const registeredById = new Map(FAMILY_REGISTRY.map(record => [record.id, record.family]));
const beforeById = new Map(before.records.map(record => [record.id, record]));
const ownershipKeys = ['Document', 'HouseProfile', 'Extension', 'View', 'Lineage'].flatMap(area => [
  `registryManaged${area}Fields`, `registryManaged${area}FieldRevisions`
]);

function savedBeforeBiographyUpdate(id) {
  const local = normalizeFamily(registeredById.get(id));
  const receipt = beforeById.get(id);
  for (const key of ownershipKeys) delete local.extensions[key];
  Object.assign(local.extensions, structuredClone(receipt.metadataOwnership));
  local.extensions.sourceRevision = receipt.sourceRevision;
  local.extensions.registryManagedEntitySourceRevision = receipt.sourceRevision;
  local.extensions.houseBiographyModule = structuredClone(receipt.biography);
  return local;
}

function withPersonalEdits(local) {
  local.document.houseProfile.seat = 'Mein lokaler Hofentwurf';
  local.document.emblem = 'mein-lokales-wappen.png';
  local.view.orientation = 'horizontal';
  local.view.focusPersonId = local.persons.at(-1).id;
  local.view.limitGenerations = !local.view.limitGenerations;
  local.lineage.crestSubtitle = 'Meine eigene Linienbeschriftung';
  local.lineage.originHouse.name = 'Meine lokale Ursprungsnotiz';
  local.lineage.originHouse.notes = 'Mein Entwurf zur Darstellung der Herkunft';
  local.extensions.inheritance = { local: 'Meine eigene Erbfolgenotiz' };
  local.extensions.localResearch = 'Meine persönliche Recherche';
  local.persons[0].notes = 'Meine individuelle Personennotiz';
  local.persons[0].birth = 'um 1601';
  local.persons[0].death = 'nach 1677';
  return local;
}

function assertPersonalEditsPreserved(result, local, id) {
  assert.equal(result.document.houseProfile.seat, local.document.houseProfile.seat, `${id}: seat`);
  assert.equal(result.document.emblem, local.document.emblem, `${id}: emblem`);
  assert.deepEqual(result.view, local.view, `${id}: view`);
  assert.deepEqual(result.lineage, local.lineage, `${id}: lineage`);
  assert.deepEqual(result.extensions.inheritance, local.extensions.inheritance, `${id}: inheritance`);
  assert.equal(result.extensions.localResearch, local.extensions.localResearch, `${id}: research`);
  const person = result.persons.find(row => row.id === local.persons[0].id);
  for (const field of ['notes', 'birth', 'death']) {
    assert.equal(person[field], local.persons[0][field], `${id}: personal ${field}`);
  }
}

test('a recognized old biography updates without reopening local metadata or person fields', () => {
  for (const id of ids) {
    const registered = registeredById.get(id);
    const receipt = beforeById.get(id);
    const local = withPersonalEdits(savedBeforeBiographyUpdate(id));
    assert.equal(houseBiographyDefaultFingerprint(local.extensions.houseBiographyModule),
      receipt.biographyDefaultFingerprint, `${id}: exact captured old default`);
    assert.ok(registered.extensions.sourceRevision > receipt.sourceRevision, `${id}: later biography release`);
    assert.notEqual(houseBiographyDefaultFingerprint(registered.extensions.houseBiographyModule),
      receipt.biographyDefaultFingerprint, `${id}: biography actually changes`);
    const snapshot = structuredClone(local);
    const result = resolveRegisteredFamilyUpgrade(registered, local);
    assert.deepEqual(result.extensions.houseBiographyModule, registered.extensions.houseBiographyModule,
      `${id}: recognized biography replaced`);
    assertPersonalEditsPreserved(result, snapshot, id);
    assert.deepEqual(local, snapshot, `${id}: saved input not mutated`);
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered, result), result, `${id}: repeated upgrade`);
  }
});

test('authored and explicitly removed biographies survive the same source revision', () => {
  for (const id of ids) {
    const registered = registeredById.get(id);
    for (const removed of [false, true]) {
      const local = withPersonalEdits(savedBeforeBiographyUpdate(id));
      if (removed) local.extensions.houseBiographyModule = null;
      else local.extensions.houseBiographyModule.house.biographyText = 'Meine selbst verfasste Hausgeschichte';
      const expectedBiography = structuredClone(local.extensions.houseBiographyModule);
      const snapshot = structuredClone(local);
      const result = resolveRegisteredFamilyUpgrade(registered, local);
      assert.deepEqual(result.extensions.houseBiographyModule, expectedBiography,
        `${id}: ${removed ? 'removed' : 'authored'} biography retained`);
      assertPersonalEditsPreserved(result, snapshot, id);
      assert.deepEqual(local, snapshot, `${id}: saved input not mutated`);
    }
  }
});

test('a biography-only release retains earlier individual metadata revisions and is idempotent', () => {
  const id = 'haus-varulv';
  const source = savedBeforeBiographyUpdate(id);
  const previousRevision = source.extensions.sourceRevision;
  Object.assign(source.extensions, {
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedDocumentFieldRevisions: { emblem: 2 },
    registryManagedHouseProfileFields: ['seat'],
    registryManagedHouseProfileFieldRevisions: { seat: 3 },
    registryManagedViewFields: ['focusPersonId'],
    registryManagedViewFieldRevisions: { focusPersonId: 1 },
    registryManagedLineageFields: ['originHouse'],
    registryManagedLineageFieldRevisions: { originHouse: 4 },
    registryManagedExtensionFields: ['inheritance', 'houseBiographyModule'],
    registryManagedExtensionFieldRevisions: { inheritance: 2 }
  });
  source.extensions.inheritance = { canonical: 'Bestehende Erbfolge' };
  const snapshot = structuredClone(source);
  const defaults = { [id]: {
    sourceRevision: previousRevision + 1,
    biography: registeredById.get(id).extensions.houseBiographyModule,
    replacedDefaultFingerprints: [houseBiographyDefaultFingerprint(source.extensions.houseBiographyModule)]
  } };
  const registered = withHouseBiographyDefault(source, defaults);
  assert.equal(registered.extensions.registryManagedDocumentFieldRevisions.emblem, 2);
  assert.equal(registered.extensions.registryManagedDocumentFieldRevisions.description, previousRevision,
    'an unversioned old description belongs to the previous release');
  assert.equal(registered.extensions.registryManagedHouseProfileFieldRevisions.seat, 3);
  assert.equal(registered.extensions.registryManagedViewFieldRevisions.focusPersonId, 1);
  assert.equal(registered.extensions.registryManagedLineageFieldRevisions.originHouse, 4);
  assert.equal(registered.extensions.registryManagedExtensionFieldRevisions.inheritance, 2);
  assert.ok(!registered.extensions.registryManagedExtensionFields.includes('houseBiographyModule'),
    'biography replacement remains owned by its fingerprint policy');
  assert.deepEqual(source, snapshot, 'registering the new default does not mutate the prior source');
  assert.equal(withHouseBiographyDefault(registered, defaults), registered,
    'the same release is an identity-preserving no-op');
  const local = withPersonalEdits(normalizeFamily(source));
  const result = resolveRegisteredFamilyUpgrade(registered, local);
  assertPersonalEditsPreserved(result, local, id);
});
