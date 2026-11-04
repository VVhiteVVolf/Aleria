import assert from 'node:assert/strict';
import lore from '../../../Stammbäume/assets/data/source-inventories/house-lore-corrections-20261104.json' with { type: 'json' };
import lifeStatus from '../../../Stammbäume/assets/data/source-inventories/house-life-status-corrections-20261104.json' with { type: 'json' };
import sourceAnnotations from './house-lore-source-annotations-review-20261104.json' with { type: 'json' };
import { applyFamilyMetadataReview } from './apply-family-metadata-review.mjs';

/** Reverse only the user's exact approved leaves for the older content proof. */
export function projectReviewedHouseCorrections(record) {
  for (const inventory of [lifeStatus, lore]) {
    const changes = inventory.changes.filter(change => change.familyId === record.id);
    const operations = changes.map(change => {
      const entity = change.collection === 'document' ? record.family.document
        : record.family[change.collection]?.find(entity => entity.id === change.entityId);
      assert(entity, `${record.id}/${change.entityId}/reviewed-house-correction`);
      assert.deepEqual(entity[change.field], change.after,
        `${record.id}/${change.collection}/${change.entityId}/${change.field}/reviewed-house-correction`);
      return { entity, change };
    });
    for (const { entity, change } of operations) entity[change.field] = structuredClone(change.before);
  }
  const annotations = sourceAnnotations.reviews.find(review => review.familyId === record.id);
  if (annotations) applyFamilyMetadataReview(record, annotations);
  return record;
}
