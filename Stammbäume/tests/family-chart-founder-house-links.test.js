import test from 'node:test';
import assert from 'node:assert/strict';
import { createFamilyChartHouseLinkAlignmentPlan, applyFamilyChartHouseLinkAlignmentPlan } from '../assets/js/adapters/family-chart-house-link-alignment.js';
import { cardStepForAxis } from '../assets/js/adapters/family-chart-collision-geometry.js';
const family={document:{id:'founder-branch'},persons:[{id:'a'},{id:'b'}],lineage:{founderPartnershipId:'pair'},partnerships:[{id:'pair',participantIds:['a','b']}],cadetBranches:[{id:'cadet',linkType:'cadet-house',parentPartnershipId:'pair'}]};
function tree(orientation){const axis=orientation==='horizontal'?'y':'x';return{data:[{data:{id:'a'},[axis]:-120},{data:{id:'b'},[axis]:120},{data:{id:'__lineage-crest-founder-branch'},[axis]:0},{data:{id:'__cadet-cadet',rels:{parents:['a','b']}},[axis]:0}]};}
for(const orientation of['vertical','horizontal'])test(`founding pair reserves its central lineage crest with a cadet link (${orientation})`,()=>{
 const t=tree(orientation),axis=orientation==='horizontal'?'y':'x';
 const applied=applyFamilyChartHouseLinkAlignmentPlan({tree:t,plan:createFamilyChartHouseLinkAlignmentPlan(family),orientation});
 assert.equal(t.data.find(n=>n.data.id==='__lineage-crest-founder-branch')[axis],0);
 assert.equal(Math.abs(t.data.find(n=>n.data.id==='__cadet-cadet')[axis]),cardStepForAxis(axis));
 assert.equal(applied.alignedPartnershipRoutes.length,1);
 assert.equal(applied.alignedPartnershipRoutes[0].sharedParentTargetCount,2);
});
test('an ordinary pair without a rendered lineage crest keeps its exact direct anchor',()=>{
 const t=tree('vertical');t.data=t.data.filter(n=>n.data.id!=='__lineage-crest-founder-branch');
 const applied=applyFamilyChartHouseLinkAlignmentPlan({tree:t,plan:createFamilyChartHouseLinkAlignmentPlan(family)});
 assert.equal(t.data.find(n=>n.data.id==='__cadet-cadet').x,0);assert.equal(applied.alignedPartnershipRoutes[0].sharedParentTargetCount,1);
});
