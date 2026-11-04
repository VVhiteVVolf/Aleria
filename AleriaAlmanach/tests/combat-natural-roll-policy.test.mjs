import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { getNaturalRollPolicy, sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { rollProfileD20, getNaturalRollDistribution } from '../modules/combat/combat-natural-roll-policy.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { SkillResolutionService } from '../modules/skill-checks/skill-resolution-service.js';
import { estimateCombatHitChance } from '../modules/combat/combat-action-estimates.js';
import { resolveTechniqueSecondarySave } from '../modules/combat/combat-technique-secondary-save.js';
import { resolveCombatConcentration } from '../modules/combat/combat-concentration-resolution.js';
import { ProvidedDiceAdapter } from '../../firebase/functions/src/mechanics/provided-dice-adapter.js';
import { evaluateAttackRoll } from '../modules/combat/rules/combat-mvp-rules.js';

const lucky = { naturalOneReroll: true, savingThrow: 1 };
const unlucky = { criticalFailureMaximum: 3, savingThrow: -1 };
function profile(id, mechanics = {}, additions = {}) {
  return resolveCombatProfile({ id, name: id, combatProfile: {
    hitPoints: { current: 40, maximumOverride: 40 }, armorClass: { override: 2 },
    weapons: [{ id: 'blade', name: 'Klinge', equipped: true, damageFormula: '1d6', attackBonus: 20 }],
    quirks: [{ id: 'policy', name: 'Würfelprägung', active: true, mechanics }], ...additions
  } });
}
class QueueDice {
  constructor(faces) { this.faces = faces.slice(); this.calls = 0; }
  async d20({ modifier = 0, rollMode = 'normal' }) {
    this.calls++;
    const dice = Array.from({ length: rollMode === 'normal' ? 1 : 2 }, () => this.faces.shift());
    assert.ok(dice.every(face => Number.isInteger(face)), 'Unexpected extra roll');
    const natural = rollMode === 'advantage' ? Math.max(...dice) : rollMode === 'disadvantage' ? Math.min(...dice) : dice[0];
    return { id: `roll-${this.calls}`, natural, dice, keptDice: [natural], total: natural + modifier };
  }
  async rollAttack(options) { return this.d20(options); }
  async rollSkill(options) { return this.d20(options); }
  async rollSavingThrow(options) { return this.d20(options); }
  async rollDamage() { return { id: `damage-${this.calls}`, notation: '1d6', keptDice: [3], total: 3, modifier: 0 }; }
}

test('dice policy survives storage, ignores inactive sources and does not stack rerolls', () => {
  const stored = sanitizeCharacterCombatProfile({ quirks: [
    { id: 'a', name: 'A', active: true, mechanics: lucky },
    { id: 'b', name: 'B', active: true, mechanics: lucky },
    { id: 'c', name: 'C', active: false, mechanics: unlucky }
  ] });
  assert.deepEqual(getNaturalRollPolicy(stored), { naturalOneReroll: true, criticalFailureMaximum: 1 });
  stored.quirks[2].active = true;
  assert.deepEqual(getNaturalRollPolicy(stored), { naturalOneReroll: true, criticalFailureMaximum: 3 });
});

for (const mode of ['normal', 'advantage', 'disadvantage']) test(`luck replaces each original 1 once, then keeps ${mode} correctly`, async () => {
  const dice = new QueueDice(mode === 'normal' ? [1, 1] : [1, 1, 20, 1]);
  const result = await rollProfileD20(dice, 'rollAttack', { modifier: 4, rollMode: mode }, profile('lucky', lucky));
  assert.equal(dice.calls, mode === 'normal' ? 2 : 3);
  assert.equal(result.natural, mode === 'advantage' ? 20 : 1);
  assert.equal(result.total, result.natural + 4);
  assert.equal(result.rerolls.length, mode === 'normal' ? 1 : 2);
  assert.equal(dice.faces.length, 0);
});

for (const mode of ['advantage', 'disadvantage']) test(`two lucky replacement receipts replay correctly with ${mode}`, async () => {
  const actor = profile('lucky', lucky);
  const request = { modifier: 4, rollMode: mode };
  const rolled = await rollProfileD20(new QueueDice([1, 1, 20, 1]), 'rollAttack', request, actor);
  const submitted = { attack: { naturalRoll: rolled.natural, diceResults: rolled.dice, rerolls: rolled.rerolls } };
  const replay = await rollProfileD20(new ProvidedDiceAdapter(submitted), 'rollAttack', request, actor);
  assert.equal(replay.natural, rolled.natural);
  assert.equal(replay.total, rolled.total);
  assert.deepEqual(replay.rerolls, rolled.rerolls);
  assert.deepEqual(replay.dice, [20, 1]);
});

test('main and follow-up attacks preserve luck receipts and replay with authoritative server policy', async () => {
  const actor = { ...profile('lucky', lucky), selectedAction: { kind: 'technique', name: 'Folge',
    followUpAttack: { enabled: true, inheritWeapon: true, repeatCount: 1 } } };
  const target = profile('target');
  const result = await new CombatResolutionService(new QueueDice([1, 10, 1, 12])).resolveAttack({ actor, target });
  assert.equal(result.attack.naturalRoll, 10);
  assert.equal(result.followUpAttacks[0].attack.naturalRoll, 12);
  assert.equal(result.followUpAttacks[0].attack.rerolls[0].original, 1);
  const replay = await new CombatResolutionService(new ProvidedDiceAdapter(result)).resolveAttack({ actor, target });
  assert.equal(replay.attack.total, result.attack.total);
  assert.equal(replay.followUpAttacks[0].attack.total, result.followUpAttacks[0].attack.total);
  assert.equal(replay.targetSnapshot.hitPointsAfter, result.targetSnapshot.hitPointsAfter);
});

test('bad luck fails attacks on 2 and 3 despite a sufficient modified total', async () => {
  for (const face of [1, 2, 3]) {
    const result = await new CombatResolutionService(new QueueDice([face])).resolveAttack({ actor: profile('unlucky', unlucky), target: profile('target') });
    assert.equal(result.attack.criticalFailure, true);
    assert.equal(result.attack.hit, false);
  }
});

test('bad luck failure range takes precedence over an unusually low critical threshold', () => {
  for (const natural of [2, 3]) {
    const result = evaluateAttackRoll({ natural, total: 99 }, 10, 2, 3);
    assert.equal(result.hit, false);
    assert.equal(result.criticalFailure, true);
    assert.equal(result.criticalSuccess, false);
  }
});

for (const skillId of ['investigation', 'attribute:strength', 'save:strength']) test(`luck and bad luck apply to ${skillId} with a replayable receipt`, async () => {
  const actor = profile('lucky', lucky);
  const settings = { skillId, difficulty: 1 };
  const result = await new SkillResolutionService(new QueueDice([1, 8])).resolve({ actor, settings }, { actorProfile: actor });
  assert.equal(result.natural, 8);
  const replay = await new SkillResolutionService(new ProvidedDiceAdapter(result)).resolve({ actor, settings }, { actorProfile: actor });
  assert.equal(replay.natural, 8);
  assert.equal(replay.total, result.total);
  const failed = await new SkillResolutionService(new QueueDice([3])).resolve({ actor: profile('unlucky', unlucky), settings });
  assert.equal(failed.outcome, 'critical-failure');
});

test('spell saving throw belongs to the target and never turns into critical spell damage', async () => {
  const caster = { ...profile('caster', unlucky), actionResolutionMode: 'saving-throw', actionSaveAttribute: 'strength', actionSpellSaveDc: 1 };
  const result = await new CombatResolutionService(new QueueDice([1, 12])).resolveAttack({ actor: caster, target: profile('lucky-target', lucky) });
  assert.equal(result.attack.naturalRoll, 12);
  assert.equal(result.attack.saveSucceeded, true);
  const failed = await new CombatResolutionService(new QueueDice([2])).resolveAttack({ actor: caster, target: profile('unlucky-target', unlucky) });
  assert.equal(failed.attack.saveSucceeded, false);
  assert.equal(failed.attack.criticalSuccess, false);
});

test('secondary and concentration saves use the recipient luck and retain its evidence', async () => {
  const actor = { ...profile('actor'), selectedAction: { name: 'Kontrolle', secondarySave: { enabled: true, dc: 1, attributeKey: 'strength' } } };
  const target = { ...profile('target', lucky), concentration: { id: 'spell', name: 'Zauber' } };
  const context = { actionKind: 'technique', ruleSources: [], ruleProfileState: {}, rulePeriods: {}, usedRuleFrequencyKeys: new Set() };
  const secondary = await resolveTechniqueSecondarySave({ dice: new QueueDice([1, 9]), actor, target, attack: { hit: true }, timing: 'after-hit', options: {}, ...context });
  assert.equal(secondary.save.naturalRoll, 9);
  assert.equal(secondary.save.rerolls.length, 1);
  const concentration = await resolveCombatConcentration({ profile: target, counterpart: actor, hitPoints: { current: 30 }, conditions: [],
    damage: 4, dice: new QueueDice([1, 15]), context: { ...context, actorId: 'actor', attack: {} } });
  assert.equal(concentration.saves[0].naturalRoll, 15);
  assert.equal(concentration.saves[0].rerolls.length, 1);
  const unluckyTarget = { ...profile('target', unlucky), concentration: target.concentration };
  const failed = await resolveTechniqueSecondarySave({ dice: new QueueDice([3]), actor, target: unluckyTarget, attack: { hit: true }, timing: 'after-hit', options: {}, ...context });
  assert.equal(failed.save.succeeded, false);
});

test('probability preview uses the complete lucky distribution for all roll modes', () => {
  const target = profile('target');
  for (const mode of ['normal', 'advantage', 'disadvantage']) {
    const distribution = getNaturalRollDistribution(profile('lucky', lucky), mode);
    assert.ok(Math.abs(distribution.reduce((total, entry) => total + entry.weight, 0) - 1) < 1e-12);
    const chance = estimateCombatHitChance({ ...profile('lucky', lucky), forcedRollMode: mode }, target);
    const failure = mode === 'advantage' ? (1 / 400) ** 2 : mode === 'disadvantage' ? 1 - (399 / 400) ** 2 : 1 / 400;
    assert.ok(Math.abs(chance.probability - (1 - failure)) < 1e-12, `${mode}: ${chance.probability}`);
  }
  assert.ok(Math.abs(estimateCombatHitChance(profile('unlucky', unlucky), target).probability - 0.85) < 1e-12);
});

test('server rejects invented, duplicate, missing or inconsistent luck replacements', async () => {
  const actor = profile('lucky', lucky);
  for (const rerolls of [
    [{ dieIndex: 0, original: 2, replacement: 12 }],
    [{ dieIndex: 0, original: 1, replacement: 11 }],
    [{ dieIndex: 0, original: 1, replacement: 12 }, { dieIndex: 0, original: 1, replacement: 12 }]
  ]) await assert.rejects(rollProfileD20(new ProvidedDiceAdapter({ attack: { diceResults: [12], naturalRoll: 12, rerolls } }), 'rollAttack', {}, actor));
  await assert.rejects(rollProfileD20(new ProvidedDiceAdapter({ attack: { diceResults: [1], naturalRoll: 1 } }), 'rollAttack', {}, actor));
  await assert.rejects(rollProfileD20(new ProvidedDiceAdapter({ attack: { diceResults: [12], naturalRoll: 12, rerolls: [{ dieIndex: 0, original: 1, replacement: 12 }] } }), 'rollAttack', {}, profile('ordinary')));
});
