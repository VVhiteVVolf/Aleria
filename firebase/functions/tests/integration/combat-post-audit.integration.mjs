import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { createCombatParty } from './combat-party-context.mjs';
import { database, history, request, threadId, undo } from './combat-test-context.mjs';
import { commitCombatStatus } from '../../src/mechanics/commit-combat-status.js';
import { deriveCombatRuleFrequencyKeys } from '../../../../AleriaAlmanach/modules/combat/combat-trigger-rules.js';

after(()=>database.terminate());
const record=id=>({id,name:id,combatProfile:{hitPoints:{current:100,maximumOverride:100},armorClass:{override:10},
 weapons:[{id:'blade',name:'Testklinge',weaponType:'sword',equipped:true,damageFormula:'1d8'}],
 techniques:[{id:'quick',name:'Schneller Angriff',active:true,damageFormula:'1d4',activationType:'bonus-action'},
 {id:'response',name:'Reaktionsangriff',active:true,damageFormula:'1d8',activationType:'reaction'}]}});
const group=()=>createCombatParty([{key:'a',team:'a',actor:record('post-a')},{key:'b',team:'b',actor:record('post-b')}]);

test('three paid attacks persist as one post, tick one condition once, reject forged fourth, and undo all damage',async()=>{
 const party=await group();
 await commitCombatStatus.run(request({entryId:threadId,actorId:'post-a',recordId:'post-a',kind:'character',operation:'add',
  expectedLastCommentId:(await history()).at(-1).id,condition:{name:'Prüfmut',durationKind:'actor-comments',durationAmount:2,mechanics:{attack:2}}}));
 let prepared;const segments=[];
 for(const actionId of ['weapon:blade','technique:quick','technique:response']) {
  prepared=await party.prepare({actor:'a',targets:['b'],actionId,priorSegments:segments});
  segments.push(prepared.segment);
 }
 const before=await party.snapshot();
 const forged=structuredClone(prepared.payload);
 forged.metadata.commentSegments.push(structuredClone(segments[0]));
 const {commitAction}=await import('./combat-test-context.mjs');
 await assert.rejects(commitAction(forged),/nicht genug|Ressourcen|bereits|ungültig/i);
 assert.equal((await history()).length,before.comments.length);
 const saved=await party.commit(prepared);
 assert.equal(saved.mechanics.commentSegments.length,3);
 const after=await party.snapshot();
 assert.equal(after.profiles.get('a').temporaryConditions[0].durationModel.remainingActorComments,1);
 assert.ok(after.profiles.get('b').currentHitPoints<100);
 const pending=await party.prepare({actor:'a',targets:['b'],actionId:'weapon:blade'});
 assert.ok(pending.segment.combatResolution,'a new contribution has a fresh ordinary budget');
 await undo(saved.id);
 const restored=await party.assertConsistent();
 assert.equal(restored.profiles.get('b').currentHitPoints,100);
 assert.equal(restored.profiles.get('a').temporaryConditions[0].durationModel.remainingActorComments,2);
});

test('a counter spends a daily weapon effect permanently across subsequent stored posts and restores it on undo',async()=>{
 const a=record('post-a'),b=record('post-b');
 b.combatProfile.weapons[0].triggerRules=[{id:'daily-counter',name:'Tagesklinge',enabled:true,phase:'pre-damage',recipient:'actor',sourceRelation:'self',
  activation:'passive',frequency:'day',condition:'hit',effects:{damageModifier:3}}];
 b.combatProfile.abilities=[{id:'stance',name:'Testkonter',active:true,combatUsable:true,activationType:'bonus-action',resolutionType:'automatic',
  effects:[{type:'buff',target:'self',on:'always',condition:{id:'test-counter',name:'Testkonter',active:true,
    durationModel:{kind:'actor-comments',remainingActorComments:1},counterAttack:{enabled:true}}}]}];
 const party=await createCombatParty([{key:'a',team:'a',actor:a},{key:'b',team:'b',actor:b}]);
 await party.commit(await party.prepare({actor:'b',targets:['b'],actionId:'ability:stance'}));
 const {receipts}=await import('../../../../AleriaAlmanach/tests/fixtures/jungdrache-fixtures.mjs');
 const saved=await party.commit(await party.prepare({actor:'a',targets:['b'],actionId:'weapon:blade',dice:receipts([2,19])}));
 const counter=saved.mechanics.commentSegments[0].combatResolution.counterAttacks[0].resolution;
 const key=counter.ruleApplications.find(r=>r.ruleId==='daily-counter').usedKey;
 assert.ok(deriveCombatRuleFrequencyKeys(await history()).has(key));
 const next=await party.prepare({actor:'b',targets:['a'],actionId:'weapon:blade'});
 assert.equal(next.segment.combatResolution.ruleApplications.some(r=>r.ruleId==='daily-counter'),false);
 await undo(saved.id);
 assert.equal(deriveCombatRuleFrequencyKeys(await history()).has(key),false);
 await party.assertConsistent();
});
