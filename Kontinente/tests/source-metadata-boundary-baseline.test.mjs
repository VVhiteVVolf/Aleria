import test from 'node:test';
import assert from 'node:assert/strict';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import courtReview from './support/gwynthor-court-family-review-20261030.json' with { type: 'json' };
import troetzliReview from './support/gwynthor-troetzli-family-review-20261031.json' with { type: 'json' };
import { protectedAlbicFamilies, reviewHash } from './support/albic-review-baseline.mjs';

const inheritedAreas = {
  'haus-penrudd': ['Document', 'Extension', 'View', 'Lineage'],
  'haus-swyll': ['Document', 'HouseProfile', 'Extension', 'View', 'Lineage']
};
const current = id => structuredClone(FAMILY_REGISTRY.find(record => record.id === id));

test('exact inherited biography ownership preserves both original historical story proofs', () => {
  for (const id of Object.keys(inheritedAreas)) {
    const record = current(id), before = structuredClone(record);
    const review = courtReview.families[id] || troetzliReview.families[id];
    const [projected] = protectedAlbicFamilies([record]);
    assert.equal(reviewHash(projected), reviewHash(review.before), id);
    assert.deepEqual(record, before, `${id}: the source record remains unchanged`);
  }
});

test('the inherited ownership admission rejects extra fields and missing provenance maps', () => {
  for (const [id, areas] of Object.entries(inheritedAreas)) {
    for (const area of areas) {
      const key = `registryManaged${area}FieldRevisions`;
      const changed = current(id);
      changed.family.extensions[key].unapprovedField = 99;
      assert.throws(() => protectedAlbicFamilies([changed]), /approved-metadata/, `${id}/${key}: extra field`);
      const missing = current(id);
      delete missing.family.extensions[key];
      assert.throws(() => protectedAlbicFamilies([missing]), /approved-metadata/, `${id}/${key}: missing map`);
    }
  }
});

test('Swyll focus and generation ownership remain pinned to their structural source revision', () => {
  for (const field of ['focusPersonId', 'limitGenerations']) {
    const record = current('haus-swyll');
    record.family.extensions.registryManagedViewFieldRevisions[field] += 1;
    assert.throws(() => protectedAlbicFamilies([record]), /approved-metadata/, field);
  }
});

test('inherited metadata admission never exempts family content or other families', () => {
  for (const id of Object.keys(inheritedAreas)) {
    for (const mutate of [
      record => { record.family.view.focusPersonId = 'unapproved-person'; },
      record => { record.family.lineage.crestSubtitle += ' unapproved'; },
      record => { record.family.persons[0].name = 'Unapproved'; },
      record => { record.family.parentages.pop(); }
    ]) {
      const record = current(id);
      mutate(record);
      assert.throws(() => protectedAlbicFamilies([record]), /approved-gwynthor-family/, id);
    }
  }
  const unreviewed = current('haus-swyll');
  unreviewed.id = 'unreviewed-source';
  const metadata = structuredClone(unreviewed.family.extensions.registryManagedViewFieldRevisions);
  const [projected] = protectedAlbicFamilies([unreviewed]);
  assert.deepEqual(projected.family.extensions.registryManagedViewFieldRevisions, metadata);
});
