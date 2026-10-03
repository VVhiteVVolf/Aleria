import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { createCombatParty } from './combat-party-context.mjs';
import { database, history, commitAction, undo } from './combat-test-context.mjs';
import { receipts } from '../../../../AleriaAlmanach/tests/fixtures/jungdrache-fixtures.mjs';
after(()=>database.terminate());
const record=id=>({id,name:id,combatProfile:{hitPoints:{current:100,maximumOverride:100},armorClass:{override:10},
 weapons:[{id:'blade',name:'Klinge',equipped:true,weaponType:'sword',damageFormula:'1d8'}],
 techniques:[{id:'quick',name:'Kurzangriff',active:true,damageFormula:'1d4',activationType:'bonus-action'},
 {id:'response',name:'Reaktionsangriff',active:true,damageFormula:'1d8',activationType:'reaction'}]}});
test('three critical hits keep their damage but store only one target consequence, restored cleanly on undo',async()=>{
 const party=await createCombatParty([{key:'a',team:'a',actor:record('a')},{key:'b',team:'b',actor:record('b')}]);
 const segments=[];let prepared;
 for(const actionId of ['weapon:blade','technique:quick','technique:response']) {
  prepared=await party.prepare({actor:'a',targets:['b'],actionId,priorSegments:segments,dice:receipts([20])});
  segments.push(prepared.segment);
 }
 const saved=await commitAction(prepared.payload,undefined,{criticalRoll:1});
 const resolutions=saved.mechanics.commentSegments.map(s=>s.combatResolution);
 assert.ok(resolutions.every(r=>r.attack.criticalSuccess&&r.damage.total>0));
 assert.equal(resolutions.filter(r=>r.criticalConsequence).length,1);
 assert.ok(resolutions[1].mechanicNotes.some(t=>t.includes('Limit')));
 assert.equal((await party.assertConsistent()).profiles.get('b').temporaryConditions.length,1);
 await undo(saved.id);
 const state=await party.assertConsistent();assert.equal(state.profiles.get('b').currentHitPoints,100);
 assert.equal(state.profiles.get('b').temporaryConditions.length,0);
});
test('persisted main-action lock expires into one own contribution of immunity and cannot be chained',async()=>{
 const a=record('a'),b=record('b');
 a.combatProfile.abilities=[{id:'lock',name:'Bindung',active:true,combatUsable:true,activationType:'action',resolutionType:'automatic',
  effects:[{type:'debuff',target:'target',on:'always',condition:{id:'lock',name:'Benommen',active:true,blockedResource:'action',
   durationModel:{kind:'actor-comments',remainingActorComments:1}}}]}];
 const party=await createCombatParty([{key:'a',team:'a',actor:a},{key:'b',team:'b',actor:b}]);
 const cast=()=>party.prepare({actor:'a',targets:['b'],actionId:'ability:lock'});
 await party.commit(await cast());
 const repeat=await party.commit(await cast());
 assert.ok(repeat.mechanics.commentSegments[0].combatResolution.effectResults.some(r=>r.prevented));
 await party.commit(await party.prepare({actor:'b',targets:['a'],actionId:'technique:quick',dice:receipts([2])}));
 let state=await party.snapshot();assert.equal(state.profiles.get('b').temporaryConditions[0].actionLockRecovery,true);
 const immune=await party.commit(await cast());
 assert.ok(immune.mechanics.commentSegments[0].combatResolution.effectResults.some(r=>r.prevented?.includes('Handlungssicherheit')));
 await party.commit(await party.prepare({actor:'b',targets:['a'],actionId:'weapon:blade',dice:receipts([2])}));
 state=await party.assertConsistent();assert.equal(state.profiles.get('b').temporaryConditions.length,0);
 assert.ok((await history()).length>=6);
});
