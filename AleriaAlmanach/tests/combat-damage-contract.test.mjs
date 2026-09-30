import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { SeededCombatDice } from './support/combat-seeded-dice.mjs';
import { getCombatDamagePreview } from '../modules/combat/combat-action-estimates.js';

function fighter(id) {
  return resolveCombatProfile({ id, name: id, combatProfile: {
    hitPoints: { current: 100, maximumOverride: 100 }, armorClass: { override: 14 },
    weapons: [{ id: 'sword', name: 'Schwert', equipped: true, weaponType: 'sword', damageFormula: '1d8' }]
  } });
}

function action(effects, extra = {}) {
  return { ...fighter('actor'), resourceCosts: [], damageModifier: 0, attackModifier: 0,
    actionResolutionMode: 'weapon-attack',
    selectedAction: { name: 'Prüfangriff', effects }, ...extra };
}

async function resolve(actor, natural = 20) {
  const dice = new SeededCombatDice(1, 4);
  dice.rollAttack = async ({ modifier = 0 }) => ({ natural, dice: [natural], keptDice: [natural], total: natural + modifier });
  return new CombatResolutionService(dice).resolveAttack({ actor, target: fighter('target') });
}

test('ein kritischer Treffer verdoppelt gegnerische Schadenswürfel, niemals eigene Gesundheitskosten', async () => {
  for (const selfFirst of [false, true]) {
    const effects = [{ type: 'damage', target: 'target', formula: '1d8', on: 'hit' },
      { type: 'damage', target: 'self', formula: '1d6', on: 'always' }];
    if (selfFirst) effects.reverse();
    const result = await resolve(action(effects));
    assert.equal(result.effectResults.find(entry => entry.recipient === 'actor').amount, 4);
    assert.equal(result.effectResults.find(entry => entry.recipient === 'target').amount, 8);
    assert.equal(result.actorHitPointSnapshot.after.current, 96);
  }
});

test('ein gegnerischer Rettungswurf halbiert keine eigenen Gesundheitskosten', async () => {
  for (const selfFirst of [false, true]) {
    const effects = [{ type: 'damage', target: 'target', formula: '2d6', on: 'hit' },
      { type: 'damage', target: 'self', formula: '1d6', on: 'always' }];
    if (selfFirst) effects.reverse();
    const result = await resolve(action(effects, { actionResolutionMode: 'saving-throw',
      actionSaveAttribute: 'dexterity', actionSpellSaveDc: 10, actionHalfDamageOnSave: true }));
    assert.equal(result.effectResults.find(entry => entry.recipient === 'actor').amount, 4);
    assert.equal(result.effectResults.find(entry => entry.recipient === 'target').amount, 4);
  }
});

test('halber Schaden würfelt denselben vollständigen Würfelpool einschließlich Zusatzwürfeln', async () => {
  const actor = action([{ type: 'damage', target: 'target', formula: '1d6', on: 'hit' }], {
    actionResolutionMode: 'saving-throw', actionSaveAttribute: 'dexterity', actionSpellSaveDc: 10, actionHalfDamageOnSave: true,
    conditions: [{ id: 'extra', name: 'Zusatzwürfel', active: true, mechanics: { bonusDamageFormula: '1d4' } }]
  });
  const full = await resolve(actor, 1);
  const half = await resolve(actor, 20);
  assert.equal(full.damage.total, 8);
  assert.equal(half.damage.total, 4);
  assert.deepEqual(half.damage.diceResults, [4, 4]);
});

test('nur bei Treffer fälliger Eigenschaden wird durch halben Schaden bei Rettungswurf nicht ausgelöst', async () => {
  const actor = action([
    { type: 'damage', target: 'target', formula: '2d6', on: 'hit' },
    { type: 'damage', target: 'self', formula: '1d6', on: 'hit' }
  ], { actionResolutionMode: 'saving-throw', actionSaveAttribute: 'dexterity', actionSpellSaveDc: 10, actionHalfDamageOnSave: true });
  const result = await resolve(actor, 20);
  assert.equal(result.damage.total, 4);
  assert.equal(result.effectResults.some(entry => entry.recipient === 'actor'), false);
  assert.equal(result.actorHitPointSnapshot, null);
});

test('Verteidigungsmodifikatoren einer Angriffsfolge gelten auch für ihre Folgeangriffe', async () => {
  const actor = action([{ type: 'damage', target: 'target', formula: '1d8', on: 'hit' }]);
  actor.selectedAction.targetDefenseModifier = -2;
  actor.selectedAction.followUpAttack = { enabled: true, damageFormula: '1d8', afterMiss: true };
  const result = await resolve(actor, 12);
  assert.equal(result.attack.targetDefense, 12);
  assert.equal(result.followUpAttacks[0].attack.targetDefense, 12);
  assert.equal(result.attack.hit, true);
  assert.equal(result.followUpAttacks[0].attack.hit, true);
});

test('übernommene Waffen-Schadensarten stimmen in Vorschau, Abwehr und Auswertung überein', async () => {
  for (const damageType of ['Hieb', 'Stich', 'Wucht']) {
    const actor = action([{ type: 'damage', target: 'target', damageType: 'physisch', inheritWeaponDamageType: true, on: 'hit' }]);
    actor.weapon = { ...actor.weapon, damageType };
    const target = { ...fighter('target'), damageAffinities: [{ damageType, response: 'resistant' }] };
    const dice = new SeededCombatDice(1, 20);
    const result = await new CombatResolutionService(dice).resolveAttack({ actor, target });
    assert.equal(result.damage.total, 8, '2W8 Krit, anschließend Resistenz');
    assert.equal(getCombatDamagePreview(actor).damageType, damageType);
    assert.equal(result.damage.damageType, damageType);
    assert.equal(result.effectResults[0].effect.damageType, damageType);
  }
});
