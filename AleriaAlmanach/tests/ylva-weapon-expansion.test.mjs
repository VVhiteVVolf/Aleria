import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { addYlvaDuelTechniques } from '../modules/characters/personal-techniques/ylva-duel-techniques.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { withEquippedCombatWeapon } from '../modules/combat/combat-equipment-state.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { beginCombatContribution } from '../modules/combat/combat-contribution-start.js';
import { advanceTemporaryConditionsForComment } from '../modules/combat/combat-condition-duration.js';
import { getCombatDamagePreview } from '../modules/combat/combat-action-estimates.js';
import { receipts } from './fixtures/jungdrache-fixtures.mjs';
const { characters } = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url)));
export const ylva = addYlvaDuelTechniques(characters.find(c => c.id === 'bSYZYAEOwiRgy44f6OmO'));
export const gais = characters.find(c => c.name === 'Gais Wyrm');
const profile = (id, weapon = 'ylva-speer', grip = 'one-handed') => resolveCombatProfile(withEquippedCombatWeapon(ylva, weapon, ''), { actionId: `technique:ylva-${id}`, weaponGrip: grip, includeAiSnapshot: false });
const target = () => resolveCombatProfile(gais, { includeAiSnapshot: false });

for (const [id, weapon, formula, bonus] of [
  ['streifender-dorn', 'ylva-speer', '1d4', 2], ['kurzer-jagdstoss', 'ylva-speer', '1d4', 2],
  ['schaftfang-und-stoss', 'ylva-speer', '1d8+1d4', 5], ['brechender-dorn', 'ylva-speer', '2d8+1d4', 5],
  ['niederhaltender-stoss', 'ylva-speer', '1d8+1d4', 5], ['kurzer-schneidenzug', 'ylva-saex', '1d4', 0],
  ['kurzer-schneidenzug', 'ylva-handaxt', '1d4', 0], ['rueckschnitt', 'ylva-saex', '1d8+1d4', 1],
  ['rueckschnitt', 'ylva-handaxt', '1d6+1d4', 1], ['wolfsgriff', 'ylva-saex', '2d8+1d4', 1],
  ['wolfsgriff', 'ylva-handaxt', '2d6+1d4', 1]
]) test(`${id} / ${weapon}: approved damage, preview and weapon gating`, () => {
  const actor = profile(id, weapon);
  assert.equal(actor.selectedAction.compatible, true);
  assert.equal(actor.weapon.damageFormula, formula); assert.equal(actor.damageModifier, bonus);
  assert.equal(getCombatDamagePreview(actor).modifier, bonus);
  assert.equal(profile(id, weapon === 'ylva-speer' ? 'ylva-saex' : 'ylva-speer').selectedAction.compatible, false);
});

for (const rolls of [[15,15,15], [2,2,2], [15,2,15], [2,15,2], [20,20,20]]) for (const save of [1,20]) {
  test(`triple ${rolls}, save ${save}: independent attacks, one final save, exact damage/costs`, async () => {
    const actor = profile('drei-dornen-ein-sturz');
    const dice = receipts([...rolls], save), order = [];
    for (const method of ['rollAttack','rollDamage','rollSavingThrow']) { const original = dice[method]; dice[method] = async o => { order.push([method,o]); return original(o); }; }
    const result = await new CombatResolutionService(dice).resolveAttack({ actor, target: target() });
    assert.equal(result.followUpAttacks.length,2); assert.equal(result.secondarySaves.length,1);
    assert.equal(order.at(-1)[0],'rollSavingThrow'); assert.equal(result.secondarySaves[0].dc,18);
    const attacks = [result,...result.followUpAttacks];
    for (const [i, hit] of attacks.entries()) if (hit.attack.hit && hit.damage) {
      assert.equal(hit.damage.notation,['1d4','1d8','1d6'][i]); assert.equal(hit.damage.modifier,i===2?5:0);
      assert.equal(hit.damage.diceResults.length,rolls[i]===20?2:1);
    }
    assert.deepEqual(result.resourceCosts.map(c=>c.resourceId).sort(),['action','bonus-action','reaction']);
    assert.equal(!!result.targetConditionSnapshot?.applied,save===1);
    if(save===1) { assert.equal(result.targetConditionSnapshot.applied.blockedResource,'reaction');
      assert.equal(result.actorConditionSnapshot.after[0].triggerRules[0].requiredTargetId,gais.id); }
  });
}

test('triple fixed dice survive two-handed grip; ordinary two-strike sequence has no training die', async () => {
  for(const grip of ['one-handed','two-handed']) {
    const actor=profile('drei-dornen-ein-sturz','ylva-speer',grip);
    assert.equal(actor.weapon.damageFormula,'1d4'); assert.equal(actor.damageModifier,0);
    const result=await new CombatResolutionService(receipts()).resolveAttack({actor,target:target()});
    assert.deepEqual(result.followUpAttacks.map(f=>f.damage.notation),['1d8','1d6']);
  }
  const result=await new CombatResolutionService(receipts([2,15])).resolveAttack({actor:profile('zwei-dornen'),target:target()});
  assert.equal(result.attack.hit,false); assert.equal(result.followUpAttacks[0].damage.notation,'1d8');
});

test('sweep is target-specific, survives unrelated posts, expires at each owners next start', async () => {
  const actor=profile('drei-dornen-ein-sturz'), victim=target();
  const result=await new CombatResolutionService(receipts([2,2,2])).resolveAttack({actor,target:victim});
  const states=deriveCombatStateFromComments([{characterId:ylva.id,combatResolution:result}]);
  assert.equal(states.get(ylva.id).temporaryConditions.length,1);
  const buffed=overlayCombatHitPointState(profile('kurzer-jagdstoss'),{temporaryConditions:states.get(ylva.id).temporaryConditions});
  for(const id of [gais.id,'other']) {
    const hit=await new CombatResolutionService(receipts()).resolveAttack({actor:buffed,target:{...victim,characterId:id}});
    assert.equal(hit.attack.rollMode,id===gais.id?'advantage':'normal');
  }
  beginCombatContribution(states,{characterId:'freki'}); advanceTemporaryConditionsForComment(states,{characterId:'freki'});
  assert.equal(states.get(ylva.id).temporaryConditions.length,1);
  beginCombatContribution(states,{characterId:gais.id}); assert.equal(states.get(gais.id).temporaryConditions.length,0);
  assert.equal(states.get(ylva.id).temporaryConditions.length,1);
  beginCombatContribution(states,{characterId:ylva.id}); assert.equal(states.get(ylva.id).temporaryConditions.length,0);
});

test('only contributing actors recover regular resources; administrative and historical boundaries do not recover', () => {
  const spent=[{id:'action',name:'Aktion',scope:'comment',current:0,maximum:1},{id:'special-action',scope:'persistent',current:0,maximum:2}];
  const hit={actorId:'ylva',targetId:'gais',targetSnapshot:{hitPointsAfter:20,maximumHitPoints:30},actorResourceSnapshot:{after:spent},targetResourceSnapshot:{after:spent}};
  const first={id:'first',characterId:'ylva',combatResolution:hit};
  const other={id:'other',characterId:'freki'};
  let states=deriveCombatStateFromComments([first,other]);
  assert.equal(states.get('ylva').resources[0].current,0); assert.equal(states.get('gais').resources[0].current,0);
  states=deriveCombatStateFromComments([first,other,{id:'next',characterId:'ylva'}]);
  assert.equal(states.get('ylva').resources[0].current,1); assert.equal(states.get('ylva').resources[1].current,0);
  assert.equal(states.get('gais').resources[0].current,0);
  states=deriveCombatStateFromComments([first,{id:'next',characterId:'ylva'}],{commentId:'next'});
  assert.equal(states.get('ylva').resources[0].current,0);
});
