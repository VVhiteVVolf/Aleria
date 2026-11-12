import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import review from './parentage-source-review-20261112.json' with {type:'json'};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

export function reviewedParentageSourceHash(source,bytes) {
  if(source.path!==review.path)return null;
  const label=source.path+'/reviewed-parentage-source';
  assert.equal(source.sha256,review.predecessorSha256,label+'/historical-hash');
  assert.equal(hash(bytes),review.currentSha256,label+'/complete-current');
  assert.equal(review.hunks.length,2,label+'/hunks');
  let previous=bytes.toString('utf8');
  assert(Buffer.from(previous).equals(bytes),label+'/exact-utf8');
  for(const hunk of review.hunks) {
    assert.equal(previous.split(hunk.after).length-1,1,label+'/unique-hunk');
    previous=previous.replace(hunk.after,hunk.before);
  }
  assert.equal(hash(Buffer.from(previous)),source.sha256,label+'/complete-predecessor');
  return source.sha256;
}
