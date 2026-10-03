import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getArmorClass, getMaximumHitPoints } from '../modules/combat/combat-profile-model.js';
import { applyArmorBalance } from '../modules/character-equipment/equipment-armor-rules.js';
import { resolveEquipmentDamageProtection } from '../modules/character-equipment/equipment-damage-protection.js';
import { refreshRuntimeCondition } from '../modules/combat/combat-condition-lifecycle.js';
import { advanceTemporaryConditionsForComment } from '../modules/combat/combat-condition-duration.js';
import { getActionLockPrevention } from '../modules/combat/combat-action-lock-recovery.js';
import { createPositionCondition, reviseMartialPositionEntry } from '../modules/combat-styles/martial-position-effects.js';
import { createCriticalConsequence } from '../modules/combat-critical/combat-critical-model.js';
import { createAuditFighter, simulatePost } from '../tools/combat-audit/post-simulation.mjs';
import { planDefenseBalanceRelease } from '../../firebase/functions/scripts/defense-balance-release-model.mjs';
import { applyCharacterFieldPatch } from '../../firebase/functions/scripts/wolfshorn-recovery-release-model.mjs';

const profile = (category, level=7) => ({identity:{archetype:'milwr'},progression:{level},attributes:[{key:'dexterity',score:22}],
 armorItems:[{id:'armor',kind:'armor',name:'Prüfrüstung',armorCategory:category,baseArmorClass:category==='light'?12:category==='medium'?14:15,equipped:true}]});
for (const [level,expected] of [[1,16],[9,16],[10,18],[15,18],[16,20],[20,20]]) test(`medium armor level ${level} respects its Dexterity cap`,()=>{
 assert.equal(getArmorClass(profile('medium',level)),expected);
});
test('light armor gets full Dexterity immediately; junior plate has no Dexterity and does not stack protection',()=>{
 assert.equal(getArmorClass(profile('light',1)),18);assert.equal(getArmorClass(profile('heavy',20)),15);
 const standard=applyArmorBalance({kind:'armor',name:'Jungritter-Plattenrüstung',baseArmorClass:16,equipped:true});
 assert.equal(standard.baseArmorClass,15);
 assert.equal(resolveEquipmentDamageProtection({armorItems:[standard]},'Wucht',5).reduction,1);
 const special=applyArmorBalance({...standard,damageProtection:{amount:2,excludedDamageTypes:['stich']}});
 assert.equal(resolveEquipmentDamageProtection({armorItems:[special]},'Stich',5).reduction,0);
 assert.equal(resolveEquipmentDamageProtection({armorItems:[special]},'Hieb',5).reduction,2);
 assert.deepEqual(applyArmorBalance(special),special);
});
test('only strongest positive armor stance counts; penalties and ordinary bonuses still apply',()=>{
 const p=profile('heavy');p.conditions=[{id:'a',active:true,armorStance:true,mechanics:{armorClass:1}},
 {id:'b',active:true,armorStance:true,mechanics:{armorClass:2}},{id:'c',active:true,mechanics:{armorClass:1}},
 {id:'d',active:true,mechanics:{armorClass:-1}}];
 assert.equal(getArmorClass(p),17);
});
test('new main-action lock cannot be prolonged and grants one full own post of recovery protection',()=>{
 const lock={id:'lock',active:true,blockedResource:'action',durationModel:{kind:'actor-comments',remainingActorComments:1}};
 const first=refreshRuntimeCondition([],lock);
 assert.equal(refreshRuntimeCondition(first,{...lock,id:'another'}),first);
 const states=new Map([['a',{temporaryConditions:first}]]);
 advanceTemporaryConditionsForComment(states,{characterId:'b'});
 assert.equal(states.get('a').temporaryConditions[0].blockedResource,'action');
 advanceTemporaryConditionsForComment(states,{characterId:'a'});
 assert.equal(states.get('a').temporaryConditions[0].actionLockRecovery,true);
 assert.ok(getActionLockPrevention(states.get('a').temporaryConditions,lock));
 advanceTemporaryConditionsForComment(states,{characterId:'a'});
 assert.equal(states.get('a').temporaryConditions.length,0);
 const legacy=new Map([['a',{temporaryConditions:[lock]}]]);
 advanceTemporaryConditionsForComment(legacy,{characterId:'a'});
 assert.equal(legacy.get('a').temporaryConditions.length,0,'do not inject new effects into historical receipts');
});
const record=id=>({id,name:id,combatProfile:{hitPoints:{current:100,maximumOverride:100},armorClass:{override:10},
 weapons:[{id:'blade',name:'Klinge',damageFormula:'1d8',equipped:true}],
 techniques:[{id:'quick',name:'Schneller Hieb',activationType:'bonus-action',damageFormula:'1d4',active:true}]}});
for(const guard of [true,false]) test(`position ${guard?'guard':'penalty'} affects exactly the next attack, including a miss`,async()=>{
 const attacker=createAuditFighter(record('a')),defender=createAuditFighter(record('b'));
 const condition=createPositionCondition(guard);
 condition.sourceConditionId=condition.id;
 const state={temporaryConditions:[condition]};
 const result=await simulatePost({attacker,defender,plan:[{id:'weapon:blade'},{id:'technique:quick'}],seed:7,
  ...(guard?{targetState:state}:{actorState:state})});
 assert.equal(result.comment.commentSegments[0].combatResolution.attack.modifier,attacker.profile('weapon:blade').attackModifier-1);
 assert.equal(result.comment.commentSegments[1].combatResolution.attack.modifier,attacker.profile('technique:quick').attackModifier);
 assert.equal(result.states.get(guard?'b':'a').temporaryConditions.length,0);
});
test('movement revisions are idempotent and do not change attack costs or dice',()=>{
 const input={id:'move',damageFormula:'1d8',costs:[{resourceId:'action',amount:1}],effects:[{type:'move',target:'self',movementKind:'move',movementMeters:2}]};
 const revised=reviseMartialPositionEntry(input);
 assert.equal(revised.effects[0].type,'buff');assert.deepEqual(revised.costs,input.costs);assert.equal(revised.damageFormula,'1d8');
 assert.deepEqual(reviseMartialPositionEntry(revised),revised);
});

test('a one-use position penalty applies only to the first roll of a personal attack sequence', async()=>{
 const source=record('a');
 source.combatProfile.techniques=[{id:'chain',name:'Testfolge',activationType:'action',damageFormula:'1d8',active:true,
  followUpAttack:{enabled:true,afterMiss:true,inheritWeapon:true,repeatCount:3}}];
 const attacker=createAuditFighter(source),defender=createAuditFighter(record('b'));
 const condition=createPositionCondition(false);condition.sourceConditionId=condition.id;
 const result=await simulatePost({attacker,defender,plan:[{id:'technique:chain'}],seed:7,actorState:{temporaryConditions:[condition]}});
 const resolution=result.comment.commentSegments[0].combatResolution;
 assert.equal(resolution.followUpAttacks.length,3);
 assert.equal(resolution.attack.modifier,attacker.profile('technique:chain').attackModifier-1);
 for(const follow of resolution.followUpAttacks) assert.equal(follow.attack.modifier,attacker.profile('technique:chain').attackModifier);
});
test('critical hit and fumble limits are independent and span an entire contribution',()=>{
 const usedConsequenceKeys=new Set(),actor={characterId:'a',name:'A'},target={characterId:'b',name:'B'};
 const resolution={actorId:'a',targetId:'b',actionType:'attack',resolutionMode:'weapon-attack',profileActionKind:'weapon',attack:{hit:true,criticalSuccess:true}};
 const options={encounter:{criticalEffectsVersion:1,encounterId:'test'},roll:1,id:'one',actor,target,usedConsequenceKeys};
 assert.ok(createCriticalConsequence(resolution,options));assert.equal(createCriticalConsequence(resolution,options),null);
 assert.ok(createCriticalConsequence({...resolution,targetId:'c'}, {...options,target:{characterId:'c',name:'C'}}));
 const miss={...resolution,attack:{hit:false,criticalFailure:true}};
 assert.ok(createCriticalConsequence(miss,options));assert.equal(createCriticalConsequence(miss,options),null);
});
test('release raises only Rhiannon maximum HP, preserves live state and possessions, and is idempotent',()=>{
 const before={...record('y7MBxDiAaesbWHBtmw5Q'),name:'Rhiannon Draig',inventory:{items:[]}};
 before.combatProfile.hitPoints={current:7,maximumOverride:25,temporary:3};
 const patch=planDefenseBalanceRelease(before),after=applyCharacterFieldPatch(before,patch);
 assert.equal(getMaximumHitPoints(after.combatProfile),35);assert.equal(after.combatProfile.hitPoints.current,7);
 assert.equal(after.combatProfile.hitPoints.temporary,3);assert.deepEqual(after.inventory,before.inventory);
 assert.equal(planDefenseBalanceRelease(after),null);
});

test('existing class sheets stay reconciled after JSON persistence, without undefined condition fields', async()=>{
 for (const slug of ['ylva-wolfshorn','asgeir-wolfshorn','gawain-draig']) {
  const before=JSON.parse(await readFile(new URL(`../../Charakter%20Archiv%20Exporte/${slug}-weapon-economy-2026-09-30.json`,import.meta.url),'utf8')).character;
  const after=applyCharacterFieldPatch(before,planDefenseBalanceRelease(before));
  assert.equal(planDefenseBalanceRelease(JSON.parse(JSON.stringify(after))),null,slug);
 }
});
