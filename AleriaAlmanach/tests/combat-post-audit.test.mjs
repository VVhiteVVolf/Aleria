import test from 'node:test';
import assert from 'node:assert/strict';
import { fighter, receipts } from './fixtures/jungdrache-fixtures.mjs';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { createManualCombatCondition } from '../modules/combat-status/combat-status-model.js';
import { createAuditFighter, simulatePost } from '../tools/combat-audit/post-simulation.mjs';
import { deriveCombatRuleFrequencyKeys } from '../modules/combat/combat-trigger-rules.js';
import { resolveCombatWeaponGrip } from '../modules/combat/combat-weapon-grip.js';

function counterStance() { return { id:'audit-counter', name:'Vorbereiteter Konter', active:true,
  durationModel:{kind:'actor-comments',remainingActorComments:1}, counterAttack:{enabled:true} }; }

for(const name of ['Asgeir Wolfshorn','Guinevere Neidr','Gawain Draig']) test(`${name}: counter uses the same current weapon pool and modifiers as a normal attack`, async()=>{
  const normal=fighter(name);
  const defender=overlayCombatHitPointState(normal,{temporaryConditions:[counterStance()]});
  const result=await new CombatResolutionService(receipts([2,19])).resolveAttack({actor:fighter('Gildas Gafyr'),target:defender});
  const counter=result.counterAttacks[0].resolution;
  assert.equal(counter.weapon.damageFormula,normal.weapon.damageFormula);
  assert.equal(counter.attack.modifier,normal.attackModifier);
  assert.equal(counter.damage.modifier,normal.damageModifier);
});

test('counter cannot use a dropped offhand while claiming a trained joint attack', async()=>{
  const normal=fighter('Asgeir Wolfshorn');
  const defender=overlayCombatHitPointState(normal,{temporaryConditions:[counterStance()],droppedWeapons:[{weaponId:normal.weaponLoadout.leftWeaponId}]});
  const result=await new CombatResolutionService(receipts([2,19])).resolveAttack({actor:fighter('Gildas Gafyr'),target:defender});
  assert.ok(result.counterAttacks[0].skipped);
});

test('limited weapon effects used by a nested counter stay spent after storing and reloading the post',async()=>{
 const base=fighter('Gawain Draig');
 const equipped=base.weapons.find(w=>w.equipped);
 const rule={id:'audit-once',name:'Einmal am Tag',enabled:true,phase:'pre-damage',recipient:'actor',sourceRelation:'self',
  activation:'passive',frequency:'day',condition:'hit',actionKinds:['weapon','technique'],effects:{damageModifier:3}};
 const profile={...base,weapons:base.weapons.map(w=>w.id===equipped.id?{...w,triggerRules:[...(w.triggerRules||[]),rule]}:w)};
 const defender=overlayCombatHitPointState(profile,{temporaryConditions:[counterStance()]});
 const result=await new CombatResolutionService(receipts([2,19])).resolveAttack({actor:fighter('Gildas Gafyr'),target:defender},
  {rulePeriods:{comment:'c1',day:'d1',scene:'s1'}});
 const counter=result.counterAttacks[0].resolution;
 const used=counter.ruleApplications.find(a=>a.ruleId==='audit-once').usedKey;
 assert.ok(used);
 const keys=deriveCombatRuleFrequencyKeys([{commentSegments:[{combatResolution:result}]}]);
 assert.ok(keys.has(used),'counter ledger must survive a replay');
 const next=await new CombatResolutionService(receipts([19])).resolveAttack({actor:profile,target:fighter('Gildas Gafyr')},
  {rulePeriods:{comment:'c2',day:'d1',scene:'s1'},usedRuleFrequencyKeys:keys});
 assert.equal(next.ruleApplications.some(a=>a.ruleId==='audit-once'),false);
});

test('a counter preserves a legally selected two-handed grip on a versatile weapon',async()=>{
 const base=fighter('Gawain Draig');
 const grip=resolveCombatWeaponGrip(base.selectedAction,base,'two-handed');
 assert.equal(grip.weaponGrip,'two-handed');
 const defender=overlayCombatHitPointState({...base,weaponGrip:grip.weaponGrip,weapon:grip.action.weapon},{temporaryConditions:[counterStance()]});
 const result=await new CombatResolutionService(receipts([2,19])).resolveAttack({actor:fighter('Gildas Gafyr'),target:defender});
 assert.equal(result.counterAttacks[0].resolution.weapon.damageFormula,grip.action.weapon.damageFormula);
 assert.equal(result.counterAttacks[0].resolution.attack.modifier,grip.action.attackModifier);
});

const actorRecord={id:'audit-a',name:'Testkämpfer',combatProfile:{hitPoints:{maximumOverride:100,current:100},
  weapons:[{id:'sword',name:'Schwert',equipped:true,damageFormula:'1d8'}],
  techniques:[{id:'reaction',name:'Reaktionsangriff',active:true,damageFormula:'1d8',activationType:'reaction'},
    {id:'bonus',name:'Bonusangriff',active:true,damageFormula:'1d4',activationType:'bonus-action'}]}};
const targetRecord={...structuredClone(actorRecord),id:'audit-b',name:'Gegner'};
const actions=[{id:'weapon:sword'},{id:'technique:bonus'},{id:'technique:reaction'}];

test('three attacks share one contribution budget; a fourth action is rejected',async()=>{
 const attacker=createAuditFighter(actorRecord),defender=createAuditFighter(targetRecord);
 const post=await simulatePost({attacker,defender,plan:actions});
 assert.equal(post.attacks,3);
 const resource=post.states.get('audit-a').resources;
 for(const id of ['action','bonus-action','reaction'])assert.equal(resource.find(r=>r.id===id).current,0);
 await assert.rejects(simulatePost({attacker,defender,plan:[...actions,{id:'weapon:sword'}]}),/nicht genug/);
});

test('a one-post effect survives all three attacks, does not tick for the opponent, then expires once',async()=>{
 const attacker=createAuditFighter(actorRecord),defender=createAuditFighter(targetRecord);
 const condition=createManualCombatCondition({name:'Mut',durationKind:'actor-comments',durationAmount:1,mechanics:{attack:2}},{id:'courage'});
 const status={serverValidatedMechanics:true,combatStatus:{actorId:'audit-a',operation:'add',after:{temporaryConditions:[condition]}}};
 const comments=[status,{characterId:'audit-b',commentSegments:[{characterId:'audit-b'},{characterId:'audit-b'}]}];
 const result=await simulatePost({attacker,defender,plan:actions,comments});
 for(const segment of result.comment.commentSegments)assert.equal(segment.combatResolution.attack.modifier,attacker.profile().attackModifier+2);
 assert.equal(result.states.get('audit-a').temporaryConditions.length,0);
});

for(const [blocked,allowed] of [['bonus-action',['weapon:sword','technique:reaction']],['action',['technique:bonus','technique:reaction']],['reaction',['weapon:sword','technique:bonus']]]) {
 test(`${blocked} lock blocks that resource for the whole post, preserving the other two`,async()=>{
  const condition={id:'lock',name:'Sperre',active:true,blockedResource:blocked,durationModel:{kind:'actor-comments',remainingActorComments:1}};
  const attacker=createAuditFighter(actorRecord),defender=createAuditFighter(targetRecord);
  const state={temporaryConditions:[condition]};
  const choice=actions.find(c=>attacker.profile(c.id).resourceCosts.some(cost=>cost.resourceId===blocked));
  await assert.rejects(simulatePost({attacker,defender,plan:[choice],actorState:state}),/nicht genug/);
  const result=await simulatePost({attacker,defender,plan:allowed.map(id=>({id})),actorState:state});
  assert.equal(result.comment.commentSegments.length,2);
  assert.equal(result.states.get('audit-a').temporaryConditions.length,0);
 });
}

test('zero HP cannot use an attack or self-healing to bypass incapacitation',async()=>{
 const actor=fighter('Gawain Draig');
 await assert.rejects(new CombatResolutionService(receipts()).resolveAttack({actor:{...actor,currentHitPoints:0},target:fighter('Gildas Gafyr')}),/handlungsunfähig/);
 const recovery={...fighter('Gawain Draig','ability:martial-durchschnaufen'),currentHitPoints:0};
 assert.equal(recovery.selectedAction.name,'Durchschnaufen');
 await assert.rejects(new CombatResolutionService(receipts()).resolveAttack({actor:recovery,target:recovery}),/handlungsunfähig/);
});
