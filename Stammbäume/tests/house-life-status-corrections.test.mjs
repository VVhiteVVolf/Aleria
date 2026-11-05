import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { normalizeFamily } from '../assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { withHouseLifeStatusCorrections } from '../assets/js/modules/house-lore-corrections/house-life-status-corrections.js';
import { biographyBeforeReviewedContentCorrection } from '../../Familien Häuser und Clans/tests/house-lore-reviewed-expectations.mjs';
import { familyBeforeReviewedArgallViewAmendment } from './argall-portrait-affair-amendment.mjs';

const root = new URL('../../', import.meta.url);
const readJson = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const before = readJson('diagnostics/house-life-status-20261104/before.json');
const fixture = readJson('Familien Häuser und Clans/tests/fixtures/house-life-status-corrections-20261104.json');
const metadataContainers = readJson('diagnostics/house-life-status-20261104/metadata-containers.json').families;
const records = new Map(FAMILY_REGISTRY.map(record => [record.id, record]));
const snapshots = new Map(before.records.map(record => [record.id, record]));
const familyIds = Object.keys(fixture.families);
const person = (familyId, personId) => records.get(familyId).family.persons.find(row => row.id === personId);
const entity = (family, row) => family[row.collection].find(value => value.id === row.entityId);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

function protectedValue(family) {
  const copy = structuredClone(family);
  const id = copy.document.id;
  copy.extensions.houseBiographyModule = biographyBeforeReviewedContentCorrection(id, copy.extensions.houseBiographyModule);
  for (const row of copy.persons) {
    if (!before.targets[`${id}/${row.id}`]) continue;
    delete row.status;
    delete row.death;
  }
  for (const row of copy.partnerships) {
    if (!before.partnerships[`${id}/${row.id}`]) continue;
    delete row.status;
    delete row.end;
  }
  const stripRevisionMetadata = value => {
    if (Array.isArray(value)) return value.map(stripRevisionMetadata);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.entries(value)
      .filter(([key]) => !key.startsWith('registryManaged')
        && !['sourceRevision', 'houseLifeStatusCorrectionInventory'].includes(key))
      .map(([key, child]) => [key, stripRevisionMetadata(child)]));
  };
  const protectedCopy = stripRevisionMetadata(copy);
  for (const path of metadataContainers[id] || []) {
    const parent = path.slice(0, -1).reduce((value, key) => value[key], protectedCopy);
    const key = path.at(-1);
    if (JSON.stringify(parent[key]) === '{}') delete parent[key];
  }
  return familyBeforeReviewedArgallViewAmendment(protectedCopy);
}

function staleFamily(id) {
  const local = normalizeFamily(records.get(id).family);
  const snapshot = snapshots.get(id);
  local.extensions.sourceRevision = snapshot.sourceRevision;
  delete local.extensions.houseLifeStatusCorrectionInventory;
  for (const target of snapshot.targets) {
    const current = local.persons.find(row => row.id === target.id);
    current.status = target.status;
    current.death = target.death;
  }
  for (const target of snapshot.partnerships) {
    const current = local.partnerships.find(row => row.id === target.id);
    current.status = target.status;
    current.end = target.end;
  }
  return local;
}

test('fifteen reviewed people have thirty consistent counterparts: thirteen alive and two clearly deceased', () => {
  assert.equal(before.cases.length, 15);
  assert.equal(before.cases.filter(row => row.decision === 'alive').length, 13);
  assert.equal(before.cases.filter(row => row.decision === 'dead').length, 2);
  assert.equal(Object.keys(before.targets).length, 30);
  assert.deepEqual(before.cases.filter(row => row.decision === 'dead').map(row => [row.worldPersonId, row.death]), [
    ['person--haus-varangr--hadvar-varangr', '1713'],
    ['person--haus-arth--afanen-1660-arth', '1710']
  ]);
  for (const row of before.cases) {
    assert.equal(row.entries.length, 2, row.worldPersonId);
    for (const entry of row.entries) {
      const current = person(entry.familyId, entry.personId);
      assert.equal(current.worldPersonId, row.worldPersonId);
      assert.equal(current.status, row.decision, `${entry.familyId}/${entry.personId}`);
      assert.equal(current.death, row.death, `${entry.familyId}/${entry.personId}`);
    }
  }
});

test('only the reviewed life fields and two death-related marriages change across the public baseline', () => {
  assert.equal(before.records.length, 424);
  assert.equal(Object.keys(before.partnerships).length, 2);
  for (const snapshot of before.records) {
    assert.equal(hash(protectedValue(records.get(snapshot.id).family)), snapshot.protectedHash, snapshot.id);
  }
  for (const [key, expected] of Object.entries(before.partnerships)) {
    const [familyId, partnershipId] = key.split('/');
    const current = records.get(familyId).family.partnerships.find(row => row.id === partnershipId);
    assert.equal(current.status, expected.status, key);
    assert.equal(current.end, expected.end, key);
  }
  for (const row of fixture.changes) {
    assert.ok(row.collection === 'persons' ? ['status', 'death'].includes(row.field)
      : row.collection === 'partnerships' && ['status', 'end'].includes(row.field));
    const family = records.get(row.familyId).family;
    assert.equal(entity(family, row)[row.field], row.after);
    assert.equal(entity(family, row).extensions.registryManagedFieldRevisions[row.field],
      fixture.families[row.familyId].revision);
  }
});

test('the reviewed Argall view amendment restores the exact old protection and rejects unrelated changes', () => {
  const family = records.get('haus-argall').family;
  const original = structuredClone(family);
  const previous = snapshots.get('haus-argall');
  assert.equal(hash(protectedValue(family)), previous.protectedHash);
  const changed = structuredClone(family);
  changed.persons.find(person => person.id === 'gwenella-spouse-rhydric-argall').notes += ' Unreviewed edit';
  assert.throws(() => protectedValue(changed), /Unexpected protected-family amendment/);
  const changedView = structuredClone(family);
  changedView.persons.find(person => person.id === 'gwenella-spouse-rhydric-argall').extensions.chartRepeatForPartnershipIds.push('unreviewed-partnership');
  assert.throws(() => protectedValue(changedView), /Unexpected protected-family amendment/);
  assert.deepEqual(family, original);
});

test('the five unresolved year and sex conflicts remain exactly as reviewed', () => {
  assert.equal(fixture.preservedCounterpartConflicts.length, 5);
  assert.equal(fixture.preservedCounterpartConflicts.filter(row => row.fields.includes('sex')).length, 2);
  for (const row of fixture.preservedCounterpartConflicts) {
    for (const entry of row.entries) {
      const current = person(entry.familyId, entry.personId);
      assert.equal(current.worldPersonId, row.worldPersonId);
      for (const [field, value] of Object.entries(entry.values)) {
        assert.equal(current[field], value, `${entry.familyId}/${entry.personId}/${field}`);
      }
    }
  }
});

test('a saved source revision receives life corrections while identities, research and local metadata survive', () => {
  for (const id of familyIds) {
    const registered = records.get(id).family;
    const local = staleFamily(id);
    const snapshot = snapshots.get(id);
    const targetIds = new Set(snapshot.targets.map(row => row.id));
    for (const target of local.persons.filter(row => targetIds.has(row.id))) {
      target.birth = '1601';
      target.sex = target.sex === 'male' ? 'female' : 'male';
      target.notes = 'Meine persönliche Recherche zu dieser Person';
      target.portrait = 'mein-lokales-portrait.png';
    }
    const neighbor = local.persons.find(row => !targetIds.has(row.id));
    assert.ok(neighbor, `${id}: an unaffected neighbor exists`);
    neighbor.birth = '1701';
    neighbor.notes = 'Meine eigene Recherche zur Nachbarperson';
    neighbor.portrait = 'mein-nachbarportrait.png';
    local.document.houseProfile.seat = 'Mein lokaler Hofentwurf';
    local.document.emblem = 'mein-lokales-wappen.png';
    local.view.orientation = 'horizontal';
    local.extensions.inheritance = { local: 'Meine eigene Erbfolgenotiz' };
    local.extensions.localResearch = 'Unveröffentlichter eigener Entwurf';
    const identities = local.persons.map(row => [row.id, row.worldPersonId]);
    const expectedPeople = structuredClone(local.persons);
    const expectedPartnerships = structuredClone(local.partnerships);
    const result = resolveRegisteredFamilyUpgrade(registered, local);

    for (const target of snapshot.targets) {
      const expected = before.targets[`${id}/${target.id}`];
      const current = result.persons.find(row => row.id === target.id);
      assert.equal(current.status, expected.status, `${id}/${target.id}`);
      assert.equal(current.death, expected.death, `${id}/${target.id}`);
    }
    for (const expected of expectedPeople) {
      const current = result.persons.find(row => row.id === expected.id);
      const protectedFields = targetIds.has(expected.id)
        ? ['id', 'worldPersonId', 'birth', 'sex', 'notes', 'portrait']
        : Object.keys(expected).filter(field => field !== 'extensions');
      for (const field of protectedFields) {
        assert.deepEqual(current[field], expected[field], `${id}/${expected.id}/${field}`);
      }
    }
    assert.deepEqual(result.persons.map(row => [row.id, row.worldPersonId]), identities, id);
    for (const expected of expectedPartnerships) {
      const current = result.partnerships.find(row => row.id === expected.id);
      for (const field of Object.keys(expected).filter(field => field !== 'extensions')) {
        const correction = before.partnerships[`${id}/${expected.id}`];
        assert.deepEqual(current[field], correction && Object.hasOwn(correction, field)
          ? correction[field] : expected[field], `${id}/${expected.id}/${field}`);
      }
    }
    for (const collection of ['parentages', 'houses', 'cadetBranches', 'timeJumps']) {
      assert.deepEqual(result[collection], local[collection], `${id}/${collection}`);
    }
    assert.equal(result.document.houseProfile.seat, local.document.houseProfile.seat, id);
    assert.equal(result.document.emblem, local.document.emblem, id);
    assert.equal(result.view.orientation, local.view.orientation, id);
    assert.deepEqual(result.extensions.inheritance, local.extensions.inheritance, id);
    assert.equal(result.extensions.localResearch, local.extensions.localResearch, id);
    assert.equal(result.extensions.sourceRevision, registered.extensions.sourceRevision, id);
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered, result), result, `${id}: repeated saved upgrade`);
  }
});

test('edited and explicitly removed house biographies survive the life-status revision', () => {
  for (const id of familyIds) {
    for (const removed of [false, true]) {
      const local = staleFamily(id);
      local.extensions.houseBiographyModule = removed ? null
        : structuredClone(records.get(id).family.extensions.houseBiographyModule);
      if (!removed) local.extensions.houseBiographyModule.house.biographyText = 'Meine eigene Hausgeschichte';
      const expected = structuredClone(local.extensions.houseBiographyModule);
      const result = resolveRegisteredFamilyUpgrade(records.get(id).family, local);
      assert.deepEqual(result.extensions.houseBiographyModule, expected, `${id}: ${removed ? 'removed' : 'edited'} bio`);
    }
  }
});

test('the unresolved Bylga-Hogrand marriage and clearly deceased historical people stay unchanged', () => {
  const marriageId = 'marriage-bylga-hogrand-wargh';
  const wargh = records.get('haus-wargh').family.partnerships.find(row => row.id === marriageId);
  const kummerherz = records.get('haus-kummerherz').family.partnerships.find(row => row.id === marriageId);
  assert.equal(wargh.status, 'ended');
  assert.equal(wargh.end, '');
  assert.equal(kummerherz.status, 'active');
  assert.equal(kummerherz.end, '');
  for (const [familyId, id, death] of [
    ['haus-nachtjaeger', 'ingunn-1614-feuerherz', '1651'],
    ['haus-feuerherz', 'ingunn-1614-feuerherz', '1651'],
    ['haus-tiwna', 'morwen-pawen', '1659'],
    ['haus-wargh', 'gunnar-grendel', '1631']
  ]) {
    assert.equal(person(familyId, id).status, 'dead', id);
    assert.equal(person(familyId, id).death, death, id);
  }
});

test('confirming an already corrected family is idempotent and unrelated families are untouched', () => {
  for (const id of familyIds) {
    const family = records.get(id).family;
    assert.equal(withHouseLifeStatusCorrections(family), family, id);
  }
  for (const id of ['haus-draig', 'haus-nachtjaeger', 'haus-tiwna']) {
    const family = records.get(id).family;
    assert.equal(withHouseLifeStatusCorrections(family), family, id);
  }
});
