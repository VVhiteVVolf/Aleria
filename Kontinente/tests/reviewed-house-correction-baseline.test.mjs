import test from 'node:test';
import assert from 'node:assert/strict';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import lore from '../../Stammbäume/assets/data/source-inventories/house-lore-corrections-20261104.json' with { type: 'json' };
import lifeStatus from '../../Stammbäume/assets/data/source-inventories/house-life-status-corrections-20261104.json' with { type: 'json' };
import annotations from './support/house-lore-source-annotations-review-20261104.json' with { type: 'json' };
import argall from './support/gwynthor-argall-family-review-20261105.json' with { type: 'json' };
import { projectReviewedHouseCorrections } from './support/reviewed-house-correction-projection.mjs';
import { protectedAlbicFamilies, reviewHash } from './support/albic-review-baseline.mjs';
import { applyFamilyMetadataReview } from './support/apply-family-metadata-review.mjs';
import { assertReviewedArgallSourceFile } from './support/reviewed-registry-upgrade-source.mjs';
import fs from 'node:fs';

const current = id => structuredClone(FAMILY_REGISTRY.find(record => record.id === id));
const entityFor = (record, change) => change.collection === 'document' ? record.family.document
  : record.family[change.collection].find(entity => entity.id === change.entityId);

test('all approved lore and life-status leaves validate without mutating source records', () => {
  const ids = new Set([...lore.changes, ...lifeStatus.changes].map(change => change.familyId));
  for (const id of ids) {
    const record = current(id);
    assert(record, id);
    const before = structuredClone(record), projected = projectReviewedHouseCorrections(structuredClone(record));
    assert.deepEqual(record, before, id);
    for (const change of lore.changes.filter(change => change.familyId === id)) {
      assert.deepEqual(entityFor(projected, change)[change.field], change.before, `${id}/${change.entityId}/${change.field}`);
    }
  }
});

test('each approved scalar correction rejects a changed value or missing entity', () => {
  for (const inventory of [lifeStatus, lore]) {
    for (const change of inventory.changes) {
      const record = current(change.familyId);
      assert(record, change.familyId);
      entityFor(record, change)[change.field] = 'Unapproved changed leaf';
      assert.throws(() => projectReviewedHouseCorrections(record), /reviewed-house-correction/,
        `${change.familyId}/${change.entityId}/${change.field}`);
    }
  }
  const record = current('haus-gallchobhair');
  record.family.persons = record.family.persons.filter(person => person.id !== 'aonghus-gallchobhair');
  assert.throws(() => projectReviewedHouseCorrections(record), /reviewed-house-correction/);
});

test('the five approved source annotations accept no additional prose or list entry', () => {
  for (const review of annotations.reviews) {
    for (const field of review.fields) {
      const record = current(review.familyId), key = field.path.at(-1);
      if (Array.isArray(record.family.extensions[key])) record.family.extensions[key].push('Unapproved annotation');
      else record.family.extensions[key] += ' Unapproved annotation';
      assert.throws(() => projectReviewedHouseCorrections(record), /approved-metadata/, `${review.familyId}/${key}`);
    }
  }
});

test('amendment projection keeps unrelated identities, ranks and relationship changes in the content hash', () => {
  const original = current('haus-gallchobhair');
  const expected = reviewHash(protectedAlbicFamilies([original]));
  for (const mutate of [
    record => { record.family.persons[0].worldPersonId = 'unapproved-world-identity'; },
    record => { record.family.document.houseProfile.rankId = 'unapproved-rank'; },
    record => { record.family.parentages.pop(); },
    record => { record.family.extensions.unapprovedSourceAnnotation = 'unapproved'; }
  ]) {
    const record = structuredClone(original);
    mutate(record);
    let projected;
    try { projected = protectedAlbicFamilies([record]); }
    catch (error) { assert(error instanceof assert.AssertionError); continue; }
    assert.notEqual(reviewHash(projected), expected);
  }
});

test('the four approved Argall additions restore the exact historical record without rebasing its hash', () => {
  const record = current('haus-argall'), copy = structuredClone(record);
  assert.deepEqual(protectedAlbicFamilies([record])[0], argall.families['haus-argall'].before);
  assert.deepEqual(record, copy, 'Historical projection never edits the active family');
  for (const [collection, additions] of [['persons', 4], ['partnerships', 2], ['parentages', 2]]) {
    assert.equal(record.family[collection].length, argall.families['haus-argall'].before.family[collection].length + additions);
  }
});

test('Argall approval rejects changed old relatives, new identities, parentage, partnerships and source text', () => {
  for (const mutate of [
    record => { record.family.persons[0].birth = 'unapproved'; },
    record => { record.family.persons.find(person => person.id === 'perwyn-argall').worldPersonId = 'unapproved'; },
    record => { record.family.parentages.find(row => row.id === 'parentage-perwyn-argall').childId = 'unapproved'; },
    record => { record.family.partnerships.find(row => row.id === 'union-gwenella-maelor-ffionydd').type = 'marriage'; },
    record => { record.family.extensions.sourceNote += ' Unapproved claim'; }
  ]) {
    const record = current('haus-argall'); mutate(record);
    assert.throws(() => protectedAlbicFamilies([record]), /approved-gwynthor-family/);
  }
});

test('Argall revision6 validates every exact metadata leaf before restoring its unchanged revision4 content proof', () => {
  const review = argall.metadataRevisionCorrection;
  assert.equal(review.fields.length, 15);
  assert.equal(review.proof.nonMetadataDifferences, 0);
  assert.equal(review.proof.previousProjectedSha256, argall.families['haus-argall'].afterSha256);
  assert.equal(review.proof.previousSourceCommit, '83522f25bc6a80f235f60f0824489e4348c9b390');
  assert.equal(review.authoredSourceRevision, 6);
  assert.equal(current('haus-argall').family.extensions.registryManagedEntitySourceRevision, 3);
  for (const field of review.fields) {
    const record = current('haus-argall');
    applyFamilyMetadataReview(record, argall.layoutRevisionCorrection);
    let parent = record;
    for (const segment of field.path.slice(0, -1)) parent = segment.startsWith('@')
      ? parent.find(row => row.id === segment.slice(1)) : parent[segment];
    parent[field.path.at(-1)] = 'Unapproved metadata';
    assert.throws(() => applyFamilyMetadataReview(record, review), /approved-metadata/, field.path.join('/'));
  }
});

test('Argall source7 restores the exact source6 predecessor and rejects every unreviewed portrait/view/metadata leaf', () => {
  const review = argall.layoutRevisionCorrection;
  assert.equal(review.proof.changedPaths, 36);
  assert.equal(review.proof.changedContentPaths, 9);
  assert.equal(review.proof.otherContentDifferences, 0);
  assert.equal(review.proof.previousProjectedSha256, argall.metadataRevisionCorrection.proof.currentProjectedSha256);
  assert.equal(review.proof.originalProjectedSha256, argall.families['haus-argall'].afterSha256);
  assert.equal(review.proof.sourceFiles.length, 9);
  for (const source of review.proof.sourceFiles) {
    const bytes = fs.readFileSync(new URL('../../' + source.path, import.meta.url));
    assertReviewedArgallSourceFile(source, bytes);
  }
  for (const field of review.fields) {
    const record = current('haus-argall');
    let parent = record;
    for (const segment of field.path.slice(0, -1)) parent = segment.startsWith('@')
      ? parent.find(row => row.id === segment.slice(1)) : parent[segment];
    parent[field.path.at(-1)] = 'Unapproved source7 edit';
    assert.throws(() => protectedAlbicFamilies([record]), /approved-metadata/, field.path.join('/'));
  }
});
