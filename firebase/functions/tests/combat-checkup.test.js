import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveCombatProfile } from '../src/generated/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../src/generated/combat/combat-resolution-service.js';
import { CombatResolutionService as BrowserCombatService } from '../../../AleriaAlmanach/modules/combat/combat-resolution-service.js';
import { compactCombatResolution } from '../../../AleriaAlmanach/modules/combat/combat-resolution-storage.js';
import { ProvidedDiceAdapter } from '../src/mechanics/provided-dice-adapter.js';
import { SeededCombatDice } from '../../../AleriaAlmanach/tests/support/combat-seeded-dice.mjs';

const profile = id => resolveCombatProfile({ id, name: id, combatProfile: {
  attributes: [{ key: 'intelligence', score: 16 }], hitPoints: { current: 40, maximumOverride: 100 },
  armorClass: { override: 5 }, weapons: [{ id: 'blade', name: 'Klinge', damageFormula: '1d6', equipped: true }]
} });

for (const [name, effects, expectedDamage] of [
  ['fester Erstschaden vor einem Würfeleffekt', [{ type: 'damage', amount: 8, bonusAttribute: 'intelligence' }, { type: 'damage', formula: '1d6' }], 17],
  ['fester Erstschaden vor gewürfelter Heilung', [{ type: 'damage', amount: 8 }, { type: 'healing', formula: '1d8' }], 8],
  ['gemischte Schadenswürfel und Attributsmodifikator', [{ type: 'damage', formula: '1d6', bonusAttribute: 'intelligence' }, { type: 'damage', formula: '1d8' }], 17]
]) {
  test(`Serverbelege: ${name}`, async () => {
    const actor = { ...profile('actor'), actionResolutionMode: 'automatic', resourceCosts: [],
      selectedAction: { name: 'Prüfhandlung', effects: effects.map(effect => ({ ...effect, on: 'always' })) } };
    const target = profile('target');
    const original = await new BrowserCombatService(new SeededCombatDice(1, 15)).resolveAttack({ actor, target });
    const receipt = compactCombatResolution(original);
    receipt.damage.total = 9999;
    const result = await new CombatResolutionService(new ProvidedDiceAdapter(receipt)).resolveAttack({ actor, target });
    assert.equal(result.damage.total, expectedDamage);
    assert.equal(result.targetSnapshot.hitPointsAfter, original.targetSnapshot.hitPointsAfter);
    assert.deepEqual(result.effectResults.map(entry => entry.amount), original.effectResults.map(entry => entry.amount));
  });
}

test('Server bewahrt die Würfelreihenfolge bei Heilung und erst danach ausgelöstem Schaden', async () => {
  const actor = { ...profile('actor'), actionResolutionMode: 'automatic', resourceCosts: [],
    selectedAction: { effects: [{ type: 'healing', formula: '1d8', on: 'always' }] } };
  const target = { ...profile('target'), abilities: [{ id: 'side-effect', name: 'Nebenwirkung', active: true,
    triggerRules: [{ id: 'after-heal', phase: 'on-heal', recipient: 'target', sourceRelation: 'self', activation: 'passive',
      resultEffects: [{ type: 'damage', formula: '1d4', on: 'always' }] }] }] };
  const original = await new BrowserCombatService(new SeededCombatDice(1, 15)).resolveAttack({ actor, target });
  const result = await new CombatResolutionService(new ProvidedDiceAdapter(compactCombatResolution(original))).resolveAttack({ actor, target });
  assert.equal(result.targetSnapshot.hitPointsAfter, 44);
  assert.equal(result.damage.total, 4);
});

test('Server berechnet die Konzentrationsprüfung für Eigenschaden aus den Einzelwürfeln neu', async () => {
  const actor = { ...profile('actor'), concentration: { instanceId: 'own' }, actionResolutionMode: 'automatic', resourceCosts: [],
    selectedAction: { effects: [{ type: 'damage', amount: 4, target: 'self', on: 'always' }] } };
  const target = { ...profile('target'), concentration: { instanceId: 'other' } };
  const original = await new BrowserCombatService(new SeededCombatDice(1, 1)).resolveAttack({ actor, target });
  const receipt = compactCombatResolution(original);
  receipt.secondarySaves[0].total = 999;
  receipt.secondarySaves[0].succeeded = true;
  const result = await new CombatResolutionService(new ProvidedDiceAdapter(receipt)).resolveAttack({ actor, target });
  assert.equal(result.actorConcentrationSnapshot.after, null);
  assert.equal(result.targetConcentrationSnapshot, null);
  assert.equal(result.secondarySaves[0].succeeded, false);
});
