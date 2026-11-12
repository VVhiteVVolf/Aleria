import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import review from './family-revision-review-20261112.json' with {type:'json'};
import {applyFamilyMetadataReview} from './apply-family-metadata-review.mjs';
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

export function projectReviewedFamilyRevisions(record) {
  const approved=review.reviews.find(row=>row.familyId===record.id);
  if(!approved)return record;
  const label=`${record.id}/approved-metadata/family-revision`;
  assert.equal(hash(record),approved.proof.expectedCurrentSha256,label+'/complete-current');
  const copy=structuredClone(record);
  applyFamilyMetadataReview(copy,approved);
  assert.equal(hash(copy),approved.proof.expectedHistoricalSha256,label+'/complete-predecessor');
  return copy;
}
