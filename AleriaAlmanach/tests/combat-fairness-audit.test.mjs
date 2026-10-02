import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuditFighter, simulatePost } from '../tools/combat-audit/post-simulation.mjs';
import { offensiveCandidates, chooseOffensivePlan } from '../tools/combat-audit/post-planner.mjs';
import { getBalanceCatalog } from './support/technique-balance-catalog.mjs';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { deriveCombatStateFromComments } from '../modules/combat/combat-state-model.js';
import { normalizeCombatEffect } from '../modules/combat/combat-effect-model.js';
import { refreshRuntimeCondition } from '../modules/combat/combat-condition-lifecycle.js';
import { SeededCombatDice } from './support/combat-seeded-dice.mjs';

const record=id=>({id,name:id,combatProfile:{hitPoints:{current:100,maximumOverride:100},armorClass:{override:10},
 weapons:[{id:'sword',name:'Sword',damageFormula:'1d8',equipped:true}],
 abilities:[{id:'auto',name:'Guaranteed damage',active:true,combatUsable:true,activationType:'reaction',resolutionType:'automatic',effects:[{type:'damage',target:'target',amount:3,on:'always'}]},
 {id:'limited',name:'Limited damage',active:true,combatUsable:true,activationType:'bonus-action',resolutionType:'automatic',usesMaximum:1,usesCurrent:1,effects:[{type:'damage',target:'target',amount:20,on:'always'}]}]}});

test('audit includes automatic damage and distinguishes repeatable from limited-use offense',async()=>{
 const attacker=createAuditFighter(record('a')),target=createAuditFighter(record('b'));
 const regular=offensiveCandidates(attacker,target.profile());
 assert.ok(regular.candidates.some(c=>c.id==='ability:auto'));
 assert.equal(regular.candidates.some(c=>c.id==='ability:limited'),false);
 const burst=offensiveCandidates(attacker,target.profile(),{burst:true});
 const selected=chooseOffensivePlan(burst.candidates,burst.budget);
 assert.equal(selected.plan.filter(c=>c.id==='ability:limited').length,1);
 const source=JSON.stringify(attacker.character);
 const first=await simulatePost({attacker,defender:target,plan:selected.plan,seed:243});
 const second=await simulatePost({attacker,defender:target,plan:selected.plan,seed:243});
 assert.equal(first.damage,second.damage);
 assert.equal(JSON.stringify(attacker.character),source,'audit must never mutate source records');
});

test('all martial catalog conditions round-trip, refresh without stacking and expire by complete owner posts',async()=>{
 const base=createAuditFighter(record('a')).profile(),other=createAuditFighter(record('b')).profile();
 let count=0;
 for(const technique of getBalanceCatalog()) {
  for(const raw of (technique.effects||[]).filter(e=>e.condition)) {
   const effect=normalizeCombatEffect(raw);
   const actor={...base,resourceCosts:[],actionResolutionMode:'automatic',selectedAction:{name:technique.name,effects:[{...effect,on:'always'}]}};
   const result=await new CombatResolutionService(new SeededCombatDice(1)).resolveAttack({actor,target:other});
   const recipient=effect.target==='self'?'a':'b';
   const comments=[{commentSegments:[{combatResolution:result}]}];
   const first=deriveCombatStateFromComments(comments).get(recipient).temporaryConditions;
   assert.equal(first.length,1,technique.name);
   assert.deepEqual(first[0].mechanics,effect.condition.mechanics,technique.name);
   assert.equal(refreshRuntimeCondition(first,{...first[0],id:'recast'}).length,1,technique.name);
   const duration=first[0].durationModel;
   if(duration.kind==='actor-comments') {
    for(let i=0;i<duration.remainingActorComments;i++)comments.push({characterId:recipient,commentSegments:[{characterId:recipient},{characterId:recipient},{characterId:recipient}]});
    assert.equal(deriveCombatStateFromComments(comments).get(recipient).temporaryConditions.length,0,technique.name);
   }
   count++;
  }
 }
 assert.ok(count>100,`checked ${count} authored conditions`);
 console.log(`Audited ${count} martial condition payloads and clocks.`);
});
