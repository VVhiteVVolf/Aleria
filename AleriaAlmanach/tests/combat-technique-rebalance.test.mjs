import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getBalanceCatalog } from './support/technique-balance-catalog.mjs';
import { resolveTechniqueDamageFormula } from '../modules/combat/combat-technique-damage.js';
import { averageDamageFormula, estimateCombatDamage } from '../modules/combat/combat-action-estimates.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { applyManualCharacterLevel } from '../modules/combat/combat-level-up-model.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { empowerAuraAttack } from '../modules/combat/combat-aura-attack.js';
import { getCombatActionEconomy, getAuraFocusMaximum } from '../modules/combat/combat-resource-progression.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { SeededCombatDice } from './support/combat-seeded-dice.mjs';
import { parseDamageFormula } from '../modules/combat/rules/combat-mvp-rules.js';

const catalog = getBalanceCatalog();
const load = async slug => JSON.parse(await readFile(new URL(`../../Charakter%20Archiv%20Exporte/${slug}.json`, import.meta.url), 'utf8')).character;
const average = formula => formula ? averageDamageFormula(formula) : 0;

test('all three catalogues remain affordable at unlock and older training never loses damage', () => {
  assert.equal(catalog.length, 503);
  assert.equal(new Set(catalog.map(technique => technique.id)).size, 503);
  for (const technique of catalog) {
    const economy = { ...getCombatActionEconomy(technique.minimumLevel), 'aura-focus': getAuraFocusMaximum(technique.minimumLevel) };
    for (const cost of technique.costs) assert(cost.amount <= economy[cost.resourceId], technique.id);
    if (technique.costs.some(cost => cost.resourceId === 'special-action')) {
      assert(technique.costs.some(cost => ['action', 'reaction', 'bonus-action'].includes(cost.resourceId)), technique.id);
    }
    for (const damageFormula of ['1d4', '1d6', '1d8', '1d10', '1d12', '2d6']) {
      let last = 0;
      for (let level = technique.minimumLevel; level <= 20; level++) {
        const formula = resolveTechniqueDamageFormula(technique, { damageFormula }, { progression: { level } });
        const damage = average(formula);
        assert(damage >= last, `${technique.id} / ${damageFormula} / ${level}`);
        if (formula) assert(parseDamageFormula(formula).diceCount <= 8, technique.id);
        last = damage;
      }
    }
  }
});

test('existing attacks receive a modest increase and support remains damage-free', async () => {
  const before = new Map(JSON.parse(await readFile(new URL('../docs/combat/technique-balance/before.json', import.meta.url), 'utf8')).map(row => [row.id, row]));
  for (const technique of catalog) {
    const previous = before.get(technique.id);
    if (!previous) continue;
    const damage = resolveTechniqueDamageFormula(technique, { damageFormula: '1d10' }, { progression: { level: technique.minimumLevel } });
    if (!previous.damage) { assert.equal(damage, '', technique.id); continue; }
    const increase = average(damage) - average(previous.damage);
    assert(increase >= 0, technique.id);
    const elite = technique.costs.some(cost => cost.resourceId === 'aura-focus');
    assert(increase <= (elite ? 10 : 6.5), `${technique.id}: +${increase}`);
  }
});

test('Teulu level four has special attacks; ten level-six choices survive migration and downlevelling', async () => {
  const character = await load('gildas-gafyr');
  for (const [level, count] of [[4, 7], [6, 10], [20, 24], [3, 5], [6, 10]]) {
    character.combatProfile = applyManualCharacterLevel(character.combatProfile, level).profile;
    const profile = resolveCombatProfile(character);
    assert.equal(profile.techniques.length, count);
    assert(profile.techniques.every(technique => technique.minimumLevel <= level));
    if (level === 4) assert(profile.techniques.some(technique => technique.costs.some(cost => cost.resourceId === 'special-action')));
    assert.equal(profile.classTraining.techniqueSelections.length, count);
    assert.equal(new Set(profile.techniques.map(technique => technique.id)).size, count);
  }
});

test('new defensive techniques apply automatically without attack or damage rolls', async () => {
  const character = await load('gildas-gafyr');
  const actor = resolveCombatProfile(character, { actionId: 'technique:combat-style-drachentanz-jungdrache-geschlossene-schuppe' });
  const fail = () => { throw Error('A guard must not roll'); };
  assert.equal(actor.actionResolutionMode, 'automatic');
  assert.equal(estimateCombatDamage(actor), null);
  const result = await new CombatResolutionService({ rollAttack: fail, rollDamage: fail }).resolveAttack({ actor, target: actor });
  assert.equal(result.damage, null);
  assert(result.targetConditionSnapshot.after.some(condition => condition.mechanics.armorClass === 2));
  assert.equal(result.actorResourceSnapshot.after.find(resource => resource.id === 'reaction').current, 0);
});

test('aura adds one highest die after grip selection, never a full pool or a permanent edit', async () => {
  const character = await load('gildas-gafyr');
  character.combatProfile = applyManualCharacterLevel(character.combatProfile, 8).profile;
  const original = structuredClone(character);
  const actionId = 'technique:combat-style-drachentanz-jungdrache-06-sechsfacher-lehrhieb';
  for (const weaponGrip of ['one-handed', 'two-handed']) {
    const regular = resolveCombatProfile(character, { actionId, weaponGrip });
    const aura = resolveCombatProfile(character, { actionId, weaponGrip, paymentMode: 'aura' });
    const die = weaponGrip === 'two-handed' ? 10 : 8;
    assert.equal(aura.selectedAction.auraDamageBonus, `1d${die}`);
    assert.equal(estimateCombatDamage(aura) - estimateCombatDamage(regular), (die + 1) / 2);
    assert.deepEqual(aura.resourceCosts.map(cost => [cost.resourceId, cost.amount]), [['aura-focus', 1]]);
    assert.equal(resolveCombatProfile(character, { actionId, weaponGrip }).weapon.damageFormula, regular.weapon.damageFormula);
  }
  assert.deepEqual(character, original);
  assert.deepEqual(sanitizeCharacterCombatProfile(character.combatProfile).techniques.map(t => t.damageModel),
    character.combatProfile.techniques.map(t => t.damageModel));
});

test('aura preserves elite, healing, self damage and secondary effects; ordinary spell attacks can be empowered', () => {
  const profile = { resources: [{ id: 'aura-focus', maximum: 2, current: 2 }] };
  const weapon = { damageFormula: '2d8+1d4+3' };
  const action = { costs: [{ resourceId: 'action', amount: 1 }], effects: [] };
  const result = empowerAuraAttack(action, weapon, 'aura', profile);
  assert.equal(result.weapon.damageFormula, '3d8+1d4+3');
  for (const unchanged of [
    { ...action, costs: [{ resourceId: 'aura-focus', amount: 1 }] },
    { ...action, effects: [{ type: 'heal', formula: '2d8', target: 'target' }] },
    { ...action, effects: [{ type: 'damage', formula: '2d8', target: 'self' }] },
    { ...action, auraBypass: { allowed: false } }
  ]) assert.equal(empowerAuraAttack(unchanged, weapon, 'aura', profile).weapon, weapon);
  const spell = { ...action, effects: [{ type: 'damage', formula: '2d6+1', target: 'target', on: 'hit' }, { type: 'damage', formula: '1d4', target: 'self' }] };
  const empowered = empowerAuraAttack(spell, weapon, 'aura', profile);
  assert.equal(empowered.action.effects[0].formula, '3d6+1');
  assert.equal(empowered.action.effects[1].formula, '1d4');
});

test('aura damage is rolled and consumes only focus; criticals double dice but never flat bonuses', async () => {
  const character = await load('gildas-gafyr');
  character.combatProfile = applyManualCharacterLevel(character.combatProfile, 8).profile;
  const actor = resolveCombatProfile(character, { actionId: 'technique:combat-style-drachentanz-jungdrache-06-sechsfacher-lehrhieb', paymentMode: 'aura' });
  const dice = new SeededCombatDice(7);
  dice.rollAttack = async ({ modifier }) => ({ natural: 20, total: 20 + modifier, keptDice: [20] });
  const result = await new CombatResolutionService(dice).resolveAttack({ actor, target: resolveCombatProfile(await load('gawain-draig')) });
  assert.equal(result.damage.diceResults.length, 8);
  assert.equal(result.damage.modifier, 2 + actor.damageModifier);
  assert.equal(result.actorResourceSnapshot.after.find(resource => resource.id === 'aura-focus').current, 0);
  assert.equal(result.actorResourceSnapshot.after.find(resource => resource.id === 'action').current, 1);
});
