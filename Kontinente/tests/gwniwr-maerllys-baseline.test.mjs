import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {FAMILY_REGISTRY,getRegisteredSourceMetadataProvenance} from '../../Stammbäume/assets/js/data/families.registry.js';
import review from './support/gwniwr-maerllys-family-review-20261108.json' with {type:'json'};
import {applyFamilyMetadataReview} from './support/apply-family-metadata-review.mjs';
import {projectReviewedTailoringSource} from './support/tailoring-family-baseline-projection.mjs';
import {protectedAlbicFamilies,reviewHash} from './support/albic-review-baseline.mjs';
import {projectReviewedFamilyRevisions} from './support/reviewed-family-revisions.mjs';
const current=id=>structuredClone(FAMILY_REGISTRY.find(record=>record.id===id));
const afterDynamic=id=>{const record=current(id),provenance=getRegisteredSourceMetadataProvenance(id);if(provenance.fields.length)applyFamilyMetadataReview(record,{familyId:id,...provenance});return record;};
const at=(object,segments)=>segments.reduce((value,key)=>key.startsWith('@')?value.find(row=>row.id===key.slice(1)):value[key],object);

test('four later family revisions preserve exact predecessors and reject unrelated prose, edges and migration metadata',()=>{
 for(const id of ['craigddu','haus-coeddu','haus-bronnor','haus-loer']) {
  const record=afterDynamic(id),before=structuredClone(record);
  assert.equal(projectReviewedFamilyRevisions(record).id,id);
  assert.deepEqual(record,before);
  for(const mutate of [
   value=>{value.family.persons[0].name+=' unreviewed';},
   value=>{value.family.parentages.pop();},
   value=>{value.family.extensions.sourceRevision++;},
   value=>{value.family.persons[0].portrait='unreviewed.png';}
  ]) {
   const changed=structuredClone(record);mutate(changed);
   assert.throws(()=>projectReviewedFamilyRevisions(changed),/approved-metadata\/family-revision/);
  }
 }
});

test('six exact tailoring amendments restore their unchanged c0 historical predecessors',()=>{
 assert.equal(review.baselineCommit,'c0ce3bc0a402f8f9149c03784c3b57b52f389958');
 assert.deepEqual(review.reviews.map(r=>r.familyId),['haus-maerllys','haus-swyll','haus-tonnarth','haus-ysgrif','haus-falchdyn','craigddu']);
 for(const approved of review.reviews){const record=afterDynamic(approved.familyId),before=structuredClone(record);assert.equal(reviewHash(projectReviewedFamilyRevisions(record)),approved.proof.expectedCurrentSha256);const projected=projectReviewedTailoringSource(record);assert.equal(reviewHash(projected),approved.proof.expectedHistoricalSha256);assert.deepEqual(record,before);assert(!approved.fields.some(field=>['family/houses','family/persons','family/parentages','family/partnerships'].includes(field.path.join('/'))));}
});

test('each reviewed field and each exact house addition rejects modified or missing source values without mutating input',()=>{
 for(const approved of review.reviews){
  for(const field of approved.fields){for(const mode of['wrong','missing']){const record=afterDynamic(approved.familyId),parent=at(record,field.path.slice(0,-1));if(mode==='missing')delete parent[field.path.at(-1)];else parent[field.path.at(-1)]='Unapproved source value';const before=structuredClone(record);assert.throws(()=>projectReviewedTailoringSource(record),/approved-metadata|approved-gwynthor-family/,approved.familyId+'/'+field.path.join('/'));assert.deepEqual(record,before);}}
  for(const addition of approved.houseAdditions){for(const mutate of[houses=>{houses[addition.index].emblem='unapproved.png';},houses=>{houses.push({...addition.house,id:'unapproved-house'});},houses=>{houses.reverse();},houses=>{houses.splice(addition.index,1);}]){const record=afterDynamic(approved.familyId);mutate(record.family.houses);const before=structuredClone(record);assert.throws(()=>projectReviewedTailoringSource(record),/approved-metadata/);assert.deepEqual(record,before);}}
 }
});

test('unrelated identities, life dates, portraits, metadata and family edges remain strictly protected',()=>{
 for(const approved of review.reviews)for(const mutate of[
  record=>{record.family.persons[0].name+=' unapproved';},
  record=>{record.family.persons[0].birth='1200';},
  record=>{record.family.persons[0].worldPersonId='unapproved-world-id';},
  record=>{record.family.persons[0].portrait='unapproved.png';},
  record=>{record.family.extensions.unapprovedSourceOwner=true;},
  record=>{record.family.parentages.pop();},
  record=>{record.family.partnerships[0].participantIds.reverse();}
 ]){const record=afterDynamic(approved.familyId);mutate(record);const before=structuredClone(record);assert.throws(()=>projectReviewedTailoringSource(record),/approved-metadata|approved-gwynthor-family/,approved.familyId);assert.deepEqual(record,before);}
});

test('new Gwniwr and all unrelated families receive no historical exemption',()=>{
 for(const id of['gwniwr','haus-penrudd','haus-argall']){const record=current(id);assert.equal(projectReviewedTailoringSource(record),record);}
});

test('the complete territorial pipeline retains the original historical family fingerprints',()=>{
 for(const approved of review.reviews){const record=current(approved.familyId),before=structuredClone(record);protectedAlbicFamilies([record]);assert.deepEqual(record,before);}
});
