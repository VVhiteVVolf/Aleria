import test from 'node:test';
import assert from 'node:assert/strict';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import lore from '../../Stammbäume/assets/data/source-inventories/house-lore-corrections-20261104.json' with { type: 'json' };
import lifeStatus from '../../Stammbäume/assets/data/source-inventories/house-life-status-corrections-20261104.json' with { type: 'json' };
import annotations from './support/house-lore-source-annotations-review-20261104.json' with { type: 'json' };
import { projectReviewedHouseCorrections } from './support/reviewed-house-correction-projection.mjs';
import { protectedAlbicFamilies, reviewHash } from './support/albic-review-baseline.mjs';

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
