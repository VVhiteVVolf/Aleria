import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import review from './gwniwr-maerllys-family-review-20261108.json' with {type:'json'};
import {applyFamilyMetadataReview} from './apply-family-metadata-review.mjs';
import {projectReviewedFamilyRevisions} from './reviewed-family-revisions.mjs';
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** Exact additive source amendment; all earlier territorial receipts stay intact. */
export function projectReviewedTailoringSource(record){
 record=projectReviewedFamilyRevisions(record);
 const approved=review.reviews.find(item=>item.familyId===record.id);
 if(!approved)return record;
 const copy=structuredClone(record),currentHash=hash(copy);
 assert.equal(copy.family.document.id,approved.familyId,`${record.id}/approved-metadata identity`);
 for(const addition of approved.houseAdditions){
  assert.deepEqual(addition.collectionPath,['family','houses']);
  const houses=copy.family.houses,label=`${record.id}/approved-metadata/house-addition`;
  assert.equal(houses.length,addition.afterCount,label);
  assert.equal(new Set(houses.map(house=>house.id)).size,houses.length,label);
  assert.deepEqual(houses[addition.index],addition.house,label);
  houses.splice(addition.index,1);assert.equal(houses.length,addition.beforeCount,label);
 }
 applyFamilyMetadataReview(copy,approved);
 const label=`${record.id}/approved-gwynthor-family: unreviewed content outside approved-metadata`;
 assert.equal(currentHash,approved.proof.expectedCurrentSha256,label);
 assert.equal(hash(copy),approved.proof.expectedHistoricalSha256,label);
 return copy;
}
