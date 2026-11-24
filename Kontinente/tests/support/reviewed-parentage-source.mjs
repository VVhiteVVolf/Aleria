import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import review from './parentage-source-review-20261112.json' with {type:'json'};
import layoutReview from './parentage-source-review-20261124.json' with {type:'json'};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

export function reviewedParentageSourceHash(source,bytes) {
  if(source.path!==review.path)return null;
  const label=source.path+'/reviewed-parentage-source';
  assert.equal(source.sha256,review.predecessorSha256,label+'/historical-hash');
  assert.equal(layoutReview.path,review.path,label+'/successor-path');
  assert.equal(layoutReview.predecessorSha256,review.currentSha256,label+'/successor-chain');
  assert.equal(review.hunks.length,2,label+'/hunks');
  const predecessor=restoreReviewedSource(bytes,layoutReview,label+'/layout');
  restoreReviewedSource(predecessor,review,label);
  return source.sha256;
}

function restoreReviewedSource(bytes,revision,label) {
  assert.equal(hash(bytes),revision.currentSha256,label+'/complete-current');
  let previous=bytes.toString('utf8');
  assert(Buffer.from(previous).equals(bytes),label+'/exact-utf8');
  for(const hunk of revision.hunks) {
    assert.equal(previous.split(hunk.after).length-1,1,label+'/unique-hunk');
    previous=previous.replace(hunk.after,hunk.before);
  }
  const restored=Buffer.from(previous);
  assert.equal(hash(restored),revision.predecessorSha256,label+'/complete-predecessor');
  return restored;
}
