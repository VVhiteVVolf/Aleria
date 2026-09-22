import test from 'node:test';
import assert from 'node:assert/strict';
import { CRITICAL_HIT_EFFECTS, CRITICAL_FAILURE_EFFECTS } from '../modules/combat-critical/combat-critical-catalog.js';
import { createCriticalConsequence } from '../modules/combat-critical/combat-critical-model.js';
import { deriveSceneItems, applySceneItemEvent, PICKUP_RESOURCES } from '../modules/scene-items/scene-items-model.js';
import { applySceneItemInteraction } from '../modules/scene-items/scene-item-interaction.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { resolveCombatProfile, validateCombatActorProfile } from '../modules/combat/combat-profile-resolver.js';
import { deriveCombatEncounterState } from '../modules/combat/combat-encounter-model.js';
import { resetCommentScopedResources } from '../modules/combat/combat-action-economy.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';

const character = id => ({ id, name:id, inventory:{items:[{id:'blade',name:'Schwert',quantity:'1',category:'weapon',combatDefinition:{kind:'weapon',damageFormula:'1d8'}}]},
  combatProfile:{hitPoints:{current:30,maximumOverride:30},armorClass:{override:12},
    weapons:[{id:'sword',name:'Schwert',weaponType:'sword',damageFormula:'1d8',equipped:true,inventoryItemId:'blade'}]}});
const actor=resolveCombatProfile(character('actor')), target=resolveCombatProfile(character('target'));
const encounter={encounterId:'battle',criticalEffectsVersion:1};
const resolution={actionType:'attack',resolutionMode:'weapon-attack',profileActionKind:'weapon',actorId:'actor',targetId:'target',attack:{criticalSuccess:true,hit:true}};
const consequence = (roll,failure=false) => createCriticalConsequence({...resolution,attack:failure?{criticalFailure:true,hit:false}:resolution.attack},
  {encounter,roll,id:`effect-${roll}-${failure}`,actor,target});
const post = effect => ({id:'strike',characterId:'actor',commentSegments:[{combatResolution:{...resolution,criticalConsequence:effect}}]});

test('exactly ten moderate effects per table; legacy combats, spells, abilities and noncritical rolls stay unchanged',()=>{
  assert.equal(CRITICAL_HIT_EFFECTS.length,10);assert.equal(CRITICAL_FAILURE_EFFECTS.length,10);
  for(let roll=1;roll<=10;roll++)for(const failure of [true,false])assert.ok(consequence(roll,failure));
  assert.equal(createCriticalConsequence(resolution,{encounter:{encounterId:'old'},roll:10,actor,target}),null);
  for(const kind of ['spell','song','prayer','ability','skill'])assert.equal(createCriticalConsequence({...resolution,profileActionKind:kind},{encounter,roll:10,actor,target}),null);
  assert.equal(createCriticalConsequence({...resolution,attack:{hit:true}},{encounter,roll:10,actor,target}),null);
  const followUp = createCriticalConsequence({...resolution,attack:{hit:true},followUpAttacks:[{attack:{criticalFailure:true,hit:false}}]},
    {encounter,roll:3,id:'follow-up',actor,target});
  assert.equal(followUp.kind,'failure');assert.equal(followUp.actorId,actor.characterId);
  const history=[{combatEncounter:{operation:'start',encounterId:'old'}},{combatEncounter:{operation:'add',encounterId:'old',criticalEffectsVersion:1}}];
  assert.equal(deriveCombatEncounterState(history).get('old').criticalEffectsVersion,0);
});

test('reaction loss survives resource refresh, lasts through the next own contribution and expires after it',()=>{
  const first=post(consequence(1));
  let states=deriveCombatStateFromComments([first]);
  const profile=overlayCombatHitPointState(target,{...states.get('target'),resources:resetCommentScopedResources(target.resources)});
  assert.equal(profile.resources.find(resource=>resource.id==='reaction').current,0);
  states=deriveCombatStateFromComments([first,{characterId:'other',text:'Wartet'}]);
  assert.equal(states.get('target').temporaryConditions.length,1);
  states=deriveCombatStateFromComments([first,{characterId:'target',text:'Weicht zurück'}]);
  assert.equal(states.get('target').temporaryConditions.length,0);
  const ended=deriveCombatStateFromComments([first,{combatEncounter:{operation:'end',encounterId:'battle'}}]);
  assert.equal(ended.get('target').temporaryConditions.length,0);
});

test('weapon attack and damage penalties actually enter evaluation, while spell rolls are excluded',async()=>{
  for(const [roll,field,amount] of [[3,'attackModifier',-1],[5,'damageModifier',-2]]){
    const state=deriveCombatStateFromComments([post(consequence(roll))]).get('target');
    const affected=overlayCombatHitPointState(target,state);
    let attackRequest,damageRequest;
    await new CombatResolutionService({async rollAttack(request){attackRequest=request;return {natural:19,total:19+request.modifier,keptDice:[19]};},
      async rollDamage(request){damageRequest=request;return {total:Math.max(0,4+request.bonus),keptDice:[4]};}}).resolveAttack({actor:affected,target:actor});
    assert.equal(field==='attackModifier'?attackRequest.modifier:damageRequest.bonus,target[field]+amount);
  }
});

test('disarm creates one authoritative ground item; self pickup restores availability and costs exactly one action point',()=>{
  const dropped=post(consequence(10,true));
  const ground=deriveSceneItems([dropped]), entry=[...ground.values()][0];
  const states=deriveCombatStateFromComments([dropped]);
  const disarmed=overlayCombatHitPointState(actor,states.get('actor'));
  assert.equal(validateCombatActorProfile(disarmed).ready,false);
  for(const resourceId of PICKUP_RESOURCES){
    const resources=actor.resources.map(resource=>({...resource,current:resource.id===resourceId?1:0}));
    const result=applySceneItemInteraction({entry,actor:{...disarmed,resources},operation:'pickup',paymentResource:resourceId,usageId:'pickup'});
    assert.equal(result.resources.find(resource=>resource.id===resourceId).current,0);
    assert.deepEqual(result.inventory,actor.inventory);
    const pickup={characterId:'actor',commentSegments:[{commentKind:'interact',inventoryUse:result.inventoryUse}]};
    const after=deriveCombatStateFromComments([dropped,pickup]);
    assert.equal(overlayCombatHitPointState(actor,after.get('actor')).weaponUnavailable,false);
  }
  assert.throws(()=>applySceneItemInteraction({entry,actor:{...actor,resources:[]},operation:'pickup',usageId:'none'}),/Aktionspunkt/);
});

test('another character can take a dropped weapon without duplicating its source, and a second pickup fails',()=>{
  const ground=deriveSceneItems([post(consequence(10,true))]),entry=[...ground.values()][0];
  const recipient=resolveCombatProfile({...character('receiver'),inventory:{items:[]},combatProfile:{...character('receiver').combatProfile,weapons:[]}});
  const result=applySceneItemInteraction({entry,actor:recipient,sourceActor:character('actor'),operation:'pickup',usageId:'take'});
  assert.equal(result.sourceInventory.items.length,0);
  assert.equal(result.sourceCombatProfile.weapons.length,0);
  assert.equal(result.inventory.items.length,1);
  assert.equal(result.inventory.items[0].name,'Schwert');
  applySceneItemEvent(ground,result.inventoryUse.sceneItemEvent);
  assert.throws(()=>applySceneItemInteraction({entry:ground.get(entry.sceneItemId),actor:recipient,operation:'pickup',usageId:'again'}),/nicht mehr verfügbar/);
});

test('natural weapons cannot fall; a reusable scene object survives use and a consumable disappears on consumption',()=>{
  const natural={...actor,weapon:{id:'fist',name:'Fäuste',weaponType:'unarmed'}};
  const result=createCriticalConsequence({...resolution,attack:{criticalFailure:true}},{encounter,roll:10,id:'natural',actor:natural,target});
  assert.equal(result.sceneItemEvent,null);assert.ok(result.condition);
  const entry={sceneItemId:'potion',operation:'place',available:true,item:{id:'p',name:'Heiltrank',category:'potions',quantity:'1'}};
  const used=applySceneItemInteraction({entry,actor,operation:'consume',usageId:'drink'});
  const items=new Map([[entry.sceneItemId,entry]]);applySceneItemEvent(items,used.inventoryUse.sceneItemEvent);
  assert.equal(items.get('potion').available,false);
  const lever={sceneItemId:'lever',operation:'place',available:true,item:{id:'l',name:'Hebel',category:'equipment'}};
  const touched=applySceneItemInteraction({entry:lever,actor,operation:'use',usageId:'lever'});
  assert.equal(touched.inventoryChanged,false);assert.deepEqual(touched.resources,actor.resources);
  assert.throws(()=>applySceneItemInteraction({entry:lever,actor,operation:'consume',usageId:'eat'}),/kein Verbrauchsgut/);
});
