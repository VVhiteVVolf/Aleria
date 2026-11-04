import test from 'node:test';
import assert from 'node:assert/strict';
import { HOUSE_SKELLOR_FAMILY } from '../assets/js/data/house-skellor-family.js';
import { normalizeFamily } from '../assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
import { withHouseBiographyDefault } from '../assets/js/modules/house-biography/house-biography-registry-default.js';

function sourceFamily() {
  const source = normalizeFamily(HOUSE_SKELLOR_FAMILY);
  delete source.extensions.houseBiographyModule;
  assert.equal(source.extensions.sourceRevision,5);
  assert.equal(source.extensions.registryManagedEntitySourceRevision,3);
  return source;
}

function withBiographyRelease(source) {
  return withHouseBiographyDefault(source,{ [source.document.id]: {
    sourceRevision:6,biography:{ house:{ biographyText:'Neuer redaktioneller Hausbiografie-Standard.' } }
  } });
}

function graph(family) {
  return { personIds:family.persons.map(person => person.id),
    partnerships:family.partnerships.map(partnership => [partnership.id,partnership.participantIds]),
    parentages:family.parentages.map(parentage => [parentage.id,parentage.parentIds,parentage.childId,parentage.partnershipId]) };
}

test('a biography-only snapshot retains the older structural ownership of unversioned view and lineage fields',() => {
  // dd63fe1 explicitly preserved Arvel's personal focus during the v3 -> v5 layout upgrade.
  const source = sourceFamily(),before = structuredClone(source);
  const registered = withBiographyRelease(source);
  assert.equal(registered.extensions.registryManagedViewFieldRevisions.focusPersonId,3);
  assert.equal(registered.extensions.registryManagedLineageFieldRevisions.crestSubtitle,3);
  assert.equal(registered.extensions.registryManagedDocumentFieldRevisions.description,5);
  const local = structuredClone(source);
  local.extensions.sourceRevision = 3;
  local.view.focusPersonId = 'arvel-skellor';local.view.ancestorDepth = 8;
  local.lineage.crestSubtitle = 'Meine lokale Linienbeschriftung';
  const result = resolveRegisteredFamilyUpgrade(registered,local);
  assert.equal(result.view.focusPersonId,local.view.focusPersonId);
  assert.equal(result.view.ancestorDepth,8);
  assert.equal(result.lineage.crestSubtitle,local.lineage.crestSubtitle);
  assert.deepEqual(graph(result),graph(local));
  assert.deepEqual(source,before,'registering a biography cannot mutate its source graph');
});

test('a separately versioned source focus and lineage correction retain their authoritative revision',() => {
  const source = sourceFamily();
  source.extensions.registryManagedViewFieldRevisions = {focusPersonId:5};
  source.extensions.registryManagedLineageFieldRevisions = {crestSubtitle:5};
  const registered = withBiographyRelease(source);
  const local = structuredClone(source);local.extensions.sourceRevision = 3;
  local.view.focusPersonId = 'arvel-skellor';local.lineage.crestSubtitle = 'Ältere lokale Beschriftung';
  const result = resolveRegisteredFamilyUpgrade(registered,local);
  assert.equal(registered.extensions.registryManagedViewFieldRevisions.focusPersonId,5);
  assert.equal(result.view.focusPersonId,source.view.focusPersonId);
  assert.equal(result.lineage.crestSubtitle,source.lineage.crestSubtitle);
  assert.deepEqual(graph(result),graph(local));
});

test('a genuine structural upgrade still restores the canonical focus for missing or unknown old focus values',() => {
  const source = sourceFamily(),registered = withBiographyRelease(source);
  for (const focus of [undefined,'','unknown-person']) {
    const local = structuredClone(source);local.extensions.sourceRevision = 2;
    if (focus === undefined) delete local.view.focusPersonId;
    else local.view.focusPersonId = focus;
    const result = resolveRegisteredFamilyUpgrade(registered,local);
    assert.equal(result.view.focusPersonId,source.view.focusPersonId);
    assert.deepEqual(graph(result),graph(local));
  }
});
