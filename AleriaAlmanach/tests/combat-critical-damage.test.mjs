import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDamageRollPlan } from '../modules/combat/rules/combat-mvp-rules.js';
import { CombatDiceAdapter } from '../modules/combat/combat-dice-adapter.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { describeRecordedDamageRoll } from '../modules/combat/ui/combat-damage-presentation.js';
import { renderEvaluationStats } from '../modules/combat/ui/combat-evaluation-stats.js';
import { SeededCombatDice } from './support/combat-seeded-dice.mjs';

test('ein W8-Krit kann selbst bei einer gewürfelten Eins nicht unter 8 + 1 + 3 fallen', async () => {
  const requested = [];
  const adapter = new CombatDiceAdapter({ async roll(notation, _container, context) {
    requested.push({ notation, context });
    return { id: 'crit-min', notation, keptDice: [1], modifier: 11, total: 12 };
  } });
  const result = await adapter.rollDamage({ damageFormula: '1W8', bonus: 3, critical: true });
  assert.equal(result.total, 12);
  assert.equal(requested[0].notation, '1d8+11');
  assert.equal(result.criticalDamage.maximum, 8);
  assert.equal(result.criticalDamage.fixedBonus, 3);
  assert.equal(describeRecordedDamageRoll(result), '8 gesetzt + 1W8 [1] + 3');
  assert.equal(describeRecordedDamageRoll(null, '5'), '5');
  assert.match(requested[0].context.purpose, /8 gesetzt/);
});

test('mehrwürfelige und gemischte Formeln maximieren einen ganzen Grundpool, feste Boni bleiben einfach', () => {
  for (const [formula, bonus, maximum, modifier, notation] of [
    ['2d6', 4, 12, 16, '2d6+16'], ['1d10+1d4+2', 3, 14, 19, '1d10+1d4+19'],
    ['1d8-2', -3, 8, 3, '1d8+3'], ['2d12+1d6', 0, 30, 30, '2d12+1d6+30']
  ]) {
    const plan = buildDamageRollPlan(formula, bonus, true);
    assert.equal(plan.criticalDamage.maximum, maximum);
    assert.equal(plan.modifier, modifier); assert.equal(plan.notation, notation);
  }
  assert.equal(buildDamageRollPlan('1d8+2', 3).notation, '1d8+5');
  assert.equal(buildDamageRollPlan('1d8', 3).criticalDamage, undefined);
});

function actor() {
  const profile = resolveCombatProfile({ id: 'actor', name: 'Gawain', combatProfile: {
    attributes: { strength: 10 }, hitPoints: { current: 200, maximumOverride: 200 },
    weapons: [{ id: 'blade', name: 'Schwert', equipped: true, weaponType: 'sword', damageFormula: '1d8' }]
  } });
  return { ...profile, attackModifier: 0, damageModifier: 3, resourceCosts: [] };
}
const target = () => ({ ...actor(), characterId: 'target', name: 'Ziel', totalDefense: 1 });

test('jede Instanz einer Folge kritisch separat; Resistenz und alter Beleg bleiben korrekt', async () => {
  const source = actor(), dice = new SeededCombatDice(1, 1);
  source.selectedAction = { name: 'Doppelschlag', effects: [{ type: 'damage', target: 'target', on: 'hit' }],
    followUpAttack: { enabled: true, afterMiss: true, damageFormula: '1d6' } };
  let index = 0;
  dice.rollAttack = async () => { const natural = index++ ? 19 : 20; return { natural, dice: [natural], keptDice: [natural], total: natural }; };
  const result = await new CombatResolutionService(dice).resolveAttack({ actor: source, target: target() });
  assert.equal(result.damage.criticalDamage.maximum, 8);
  assert.equal(result.damage.primaryTotal, 12);
  assert.equal(result.followUpAttacks[0].damage.criticalDamage, undefined);
  assert.equal(result.followUpAttacks[0].damage.total, 4);
  assert.match(renderEvaluationStats(result), /8 gesetzt/);
  assert.match(renderEvaluationStats({ ...result, effectResults: [] }), /8 gesetzt/);
  const historical = { notation: '2d8+3', diceResults: [1, 1], modifier: 3, total: 5 };
  const before = structuredClone(historical);
  assert.equal(describeRecordedDamageRoll(historical), '2d8+3 · Würfel [1, 1]');
  assert.deepEqual(historical, before);
});

test('ein Zauber mit eigenem Trefferwurf verwendet dieselbe Kritregel', async () => {
  const source = { ...actor(), actionResolutionMode: 'spell-attack', profileActionKind: 'spell',
    selectedAction: { kind: 'spell', name: 'Windklinge', effects: [{ type: 'damage', target: 'target', formula: '1d8', on: 'hit' }] } };
  const dice = new SeededCombatDice(1, 1);
  dice.rollAttack = async () => ({ natural: 20, total: 20, dice: [20], keptDice: [20] });
  const result = await new CombatResolutionService(dice).resolveAttack({ actor: source, target: target() });
  assert.equal(result.damage.criticalDamage.maximum, 8);
  assert.equal(result.damage.total, 12);
});

test('Rettungswürfe und automatische Wirkungen bekommen keinen kritischen Zusatz', async () => {
  for (const mode of ['saving-throw', 'automatic']) {
    const source = { ...actor(), actionResolutionMode: mode, actionSpellSaveDc: 30,
      selectedAction: { name: 'Wirkung', effects: [{ type: 'damage', target: 'target', formula: '1d6', on: 'hit' }] } };
    const dice = new SeededCombatDice(1, 1);
    const result = await new CombatResolutionService(dice).resolveAttack({ actor: source, target: target() });
    assert.equal(result.damage.criticalDamage, undefined);
  }
});
