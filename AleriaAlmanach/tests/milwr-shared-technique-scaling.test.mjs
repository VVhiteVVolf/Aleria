import test from 'node:test';
import assert from 'node:assert/strict';
import { JUNGDRACHE_SHARED_TECHNIQUES, getJungdracheSharedCounterOrigin } from '../modules/combat-styles/drachentanz/techniques/jungdrache-shared-techniques.js';
import { isSharedJungdracheTrainingTechniqueId } from '../modules/combat-styles/drachentanz/techniques/jungdrache-shared-identity.js';
import { getTechniqueDamageScaling, resolveTechniqueDamageFormula } from '../modules/combat/combat-technique-damage.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';

const shared = slug => JUNGDRACHE_SHARED_TECHNIQUES.find(technique => technique.id.endsWith(`-${slug}`));
const strike = shared('sicherer-drachenhieb');
const profile = (classId, level, purchaseClass = '') => ({ templateSelections: { classId }, progression: { level,
  development: { mode: 'purchase', purchases: purchaseClass ? [{ techniqueId: strike.id, classId: purchaseClass }] : [] } } });
const training = (technique, character, context) => getTechniqueDamageScaling(technique, character, context)?.formula || '';

test('shared direct attacks use the Milwr 6/10/15 ladder without changing the universal source', () => {
  const original = structuredClone(strike);
  assert.deepEqual([1, 5, 6, 9, 10, 14, 15, 17, 20, 30].map(level => training(strike, profile('milwr', level))),
    ['', '', '1d4', '1d4', '1d6', '1d6', '1d8', '1d8', '1d8', '1d8']);
  assert.deepEqual([6, 7, 9, 13, 17, 20, 30].map(level => training(strike, profile('teulu', level))),
    ['', '1d4', '1d6', '1d8', '1d10', '1d10', '1d10']);
  assert.equal(resolveTechniqueDamageFormula(strike, { damageFormula: '1d8' }, profile('milwr', 20)), '2d8');
  assert.deepEqual(strike, original);
});

test('the purchase class wins over the main class; template and identity are safe fallbacks', () => {
  assert.equal(training(strike, profile('teulu', 20, 'milwr')), '1d8');
  assert.equal(training(strike, profile('milwr', 20, 'teulu')), '1d10');
  assert.equal(training(strike, profile('vennyr-milwr', 10)), '1d6');
  assert.equal(training(strike, { identity: { archetype: 'Milwr' }, progression: { level: 6 } }), '1d4');
  const archived = { ...strike, id: 'archived-instance', catalogTechniqueId: strike.id };
  assert.equal(training(archived, profile('teulu', 20, 'milwr')), '1d8');
});

test('personal models, light attacks and expanded areas do not gain an unintended Milwr training override', () => {
  const custom = { ...strike, id: 'personal-attack' };
  assert.equal(training(custom, profile('milwr', 20)), '1d10');
  const authored = { ...strike, damageModel: { ...strike.damageModel, scalingSteps: [{ level: 5, formula: '1d6' }] } };
  assert.equal(training(authored, profile('milwr', 20)), '1d6');
  assert.equal(training(shared('kurze-drachenspur'), profile('milwr', 20)), '');
  assert.equal(training(strike, profile('milwr', 20), { maximumTargets: 4 }), '');
  assert.equal(resolveTechniqueDamageFormula(strike, { damageFormula: '1d8' }, profile('milwr', 20), { maximumTargets: 4 }), '1d8');
  for (const technique of JUNGDRACHE_SHARED_TECHNIQUES) {
    const models = [technique.damageModel, ...technique.effects.map(effect => effect.condition?.counterAttack?.damageModel)].filter(Boolean);
    if (models.some(model => model.scalingSteps?.length)) assert.ok(isSharedJungdracheTrainingTechniqueId(technique.id), technique.id);
  }
  assert.equal(getJungdracheSharedCounterOrigin({ id: 'personal-counter' }), null);
});

test('real prepared counters preserve their canonical purchase class on Milwr and Teulu', async () => {
  const source = shared('brechender-widerhall');
  const original = structuredClone(source);
  for (const [mainClass, purchaseClass, expected] of [
    ['milwr', 'milwr', '3d8'], ['teulu', 'teulu', '2d8+1d10'],
    ['teulu', 'milwr', '3d8'], ['milwr', 'teulu', '2d8+1d10']
  ]) {
    const character = { id: `counter-${mainClass}-${purchaseClass}`, name: 'Wache', combatProfile: {
      ...profile(mainClass, 20), hitPoints: { current: 80, maximumOverride: 80 },
      combat: { mainHandWeaponId: 'counter-sword' },
      weapons: [{ id: 'counter-sword', name: 'Schwert', weaponType: 'sword', damageFormula: '1d8', equipped: true }],
      techniques: [{ ...structuredClone(source), active: true }]
    } };
    character.combatProfile.progression.development.purchases = [{ techniqueId: source.id, classId: purchaseClass, cost: 2, level: 6 }];
    const actor = resolveCombatProfile(character, { actionId: `technique:${source.id}` });
    let attackRolls = 0;
    const formulas = [];
    const dice = {
      async rollAttack({ modifier = 0 }) { const natural = ++attackRolls === 1 ? 1 : 15;
        return { natural, dice: [natural], keptDice: [natural], total: natural + modifier }; },
      async rollDamage({ damageFormula, bonus = 0 }) { formulas.push(damageFormula);
        return { notation: damageFormula, keptDice: [4], total: 4 + bonus, modifier: bonus }; },
      async rollSavingThrow({ modifier = 0 }) { return { natural: 15, dice: [15], keptDice: [15], total: 15 + modifier }; }
    };
    const service = new CombatResolutionService(dice);
    const preparation = await service.resolveAttack({ actor, target: actor });
    assert.equal(attackRolls, 0, 'Preparing the prepaid counter performs no attack');
    const stance = preparation.targetConditionSnapshot.after.find(condition => condition.counterAttack?.enabled);
    assert.equal(getJungdracheSharedCounterOrigin(stance).id, source.id);
    const defender = { ...actor, conditions: [...actor.conditions, stance], temporaryConditions: [stance],
      resources: preparation.actorResourceSnapshot.after };
    const attacker = resolveCombatProfile({ id: 'counter-opponent', name: 'Angreifer', combatProfile: {
      hitPoints: { current: 80, maximumOverride: 80 },
      weapons: [{ id: 'attacker-sword', name: 'Schwert', weaponType: 'sword', damageFormula: '1d8', equipped: true }]
    } });
    const result = await service.resolveAttack({ actor: attacker, target: defender });
    assert.equal(result.attack.hit, false);
    assert.equal(result.counterAttacks.length, 1);
    assert.ok(result.counterAttacks[0].resolution);
    assert.equal(attackRolls, 2, 'One miss triggers exactly one prepaid counter');
    assert.deepEqual(formulas, [expected], `${mainClass} trained through ${purchaseClass}`);
  }
  assert.deepEqual(source, original);
});
