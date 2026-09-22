import test from 'node:test';
import assert from 'node:assert/strict';
import { getBuiltinCreatureTemplates } from '../modules/creatures/creature-catalog.js';
import { makeCreatureSceneActor } from '../modules/creatures/creature-model.js';
import { resolveCombatProfile, resolveCombatTargetProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { getArmorClass, getMaximumHitPoints } from '../modules/combat/combat-profile-model.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { advanceTemporaryConditionsForComment } from '../modules/combat/combat-condition-duration.js';

const freki = getBuiltinCreatureTemplates().find(creature => creature.id === 'companion-ylva-freki');
const actor = id => resolveCombatProfile(makeCreatureSceneActor(freki),{actionId:id,includeAiSnapshot:false});
const target = resolveCombatTargetProfile({id:'training-target',name:'Übungsgegner',combatProfile:{hitPoints:{current:100,maximumOverride:100},armorClass:{override:10}}});
class Dice {
  constructor(save = 1) { this.save = save; this.attacks = 0; }
  async rollAttack(request) { this.attacks++; return {natural:15,total:15 + request.modifier,keptDice:[15]}; }
  async rollDamage(request) { return {total:4 + (request.bonus || 0),notation:request.damageFormula,keptDice:[4],modifier:request.bonus || 0}; }
  async rollSavingThrow(request) { return {natural:this.save,total:this.save + request.modifier,keptDice:[this.save]}; }
}
function replay(result) {
  return deriveCombatStateFromComments([{id:'wolf-action',characterId:freki.id,commentSegments:[{combatResolution:result}]}]);
}

test('Freki has exactly six new actions, two special-action costs, and a single rounded 15% HP increase', () => {
  assert.equal(getMaximumHitPoints(freki.combatProfile),Math.ceil(33 * 1.15));
  assert.equal(freki.combatProfile.hitPoints.current,38);
  assert.equal(getArmorClass(freki.combatProfile),13);
  const actions = actor('weapon:freki-biss').actions.filter(action => /^(technique|ability):freki-/.test(action.id));
  assert.equal(actions.length,6);
  assert.equal(actions.filter(action => action.costs.some(cost => cost.resourceId === 'special-action')).length,2);
  assert.equal(new Set(actions.map(action => action.costs.map(cost => cost.resourceId).sort().join(','))).size,6);
  for (const action of actions) assert.equal(action.auraBypass.allowed,false);
});

test('all three attacks consume their exact resource packages and special stock', async () => {
  for (const [id,expected] of [
    ['freki-schnappen',{'bonus-action':0,action:1,reaction:1,'special-action':2}],
    ['freki-fesselbiss',{'bonus-action':1,action:0,reaction:0,'special-action':2}],
    ['freki-jagdsprung',{'bonus-action':1,action:0,reaction:1,'special-action':1}]
  ]) {
    const result = await new CombatResolutionService(new Dice()).resolveAttack({actor:actor(`technique:${id}`),target});
    assert.equal(result.attack.hit,true);
    assert.ok(result.damage.total > 0);
    for (const [resourceId,value] of Object.entries(expected)) {
      assert.equal(result.actorResourceSnapshot.after.find(resource => resource.id === resourceId).current,value,`${id}: ${resourceId}`);
    }
  }
});

test('Fesselbiss respects the saving throw and expires after one target contribution', async () => {
  const attack = actor('technique:freki-fesselbiss');
  assert.equal(attack.selectedAction.secondarySave.dc,12);
  const failed = await new CombatResolutionService(new Dice(1)).resolveAttack({actor:attack,target});
  const condition = failed.targetConditionSnapshot.after.find(condition => condition.mechanics.movement === -2);
  assert.ok(condition);
  assert.equal(condition.durationModel.kind,'actor-comments');
  assert.equal(condition.durationModel.remainingActorComments,1);
  const succeeded = await new CombatResolutionService(new Dice(20)).resolveAttack({actor:attack,target});
  assert.equal(succeeded.targetConditionSnapshot,null);
  const states = replay(failed);
  advanceTemporaryConditionsForComment(states,{characterId:target.characterId},{actingCharacterIds:[target.characterId]});
  assert.equal(states.get(target.characterId).temporaryConditions.length,0);
});

test('both temporary self-buffs affect the runtime profile without an attack roll', async () => {
  for (const [id,mechanic,value] of [['freki-ducken','armorClass',2],['freki-flankenlauf','movement',3]]) {
    const dice = new Dice();
    const active = actor(`ability:${id}`);
    const result = await new CombatResolutionService(dice).resolveAttack({actor:active,target:active});
    assert.equal(dice.attacks,0);
    const states = replay(result);
    const state = states.get(freki.id);
    assert.equal(state.temporaryConditions[0].mechanics[mechanic],value);
    const profile = overlayCombatHitPointState(active,state);
    if (mechanic === 'armorClass') assert.equal(profile.totalDefense,15);
    advanceTemporaryConditionsForComment(states,{characterId:freki.id},{actingCharacterIds:[freki.id]});
    assert.equal(states.get(freki.id).temporaryConditions.length,0);
  }
});

test('Zäher Nordwolf grants CON-adjusted temporary HP without healing or stacking and checks special costs', async () => {
  const base = actor('ability:freki-durchhalten');
  const injured = {...base,currentHitPoints:12};
  const result = await new CombatResolutionService(new Dice()).resolveAttack({actor:injured,target:injured});
  assert.equal(replay(result).get(freki.id).current,12);
  assert.equal(replay(result).get(freki.id).temporary,6);
  assert.equal(result.actorResourceSnapshot.after.find(resource => resource.id === 'special-action').current,1);
  const shielded = {...injured,temporaryHitPoints:10};
  const repeated = await new CombatResolutionService(new Dice()).resolveAttack({actor:shielded,target:shielded});
  assert.equal(replay(repeated).get(freki.id).temporary,10);
  const depleted = structuredClone(base);
  depleted.resources.find(resource => resource.id === 'special-action').current = 0;
  await assert.rejects(() => new CombatResolutionService(new Dice()).resolveAttack({actor:depleted,target:depleted}), /Besondere|Ressource|Kosten|verfügbar/i);
});
