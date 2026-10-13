import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { addYlvaDuelTechniques, createYlvaDuelTechniques } from '../modules/characters/personal-techniques/ylva-duel-techniques.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { withEquippedCombatWeapon } from '../modules/combat/combat-equipment-state.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { getCombatDamagePreview } from '../modules/combat/combat-action-estimates.js';
import { getCriticalWeaponAttacks } from '../modules/combat-critical/combat-critical-catalog.js';
import { renderPersonalTechniquesSummary } from '../modules/combat-status/combat-personal-techniques-view.js';
import { advanceTemporaryConditionsForComment } from '../modules/combat/combat-condition-duration.js';
import { receipts } from './fixtures/jungdrache-fixtures.mjs';
const { characters } = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8'));
const ylva = characters.find(c => c.name === 'Ylva Wolfshorn'), gais = characters.find(c => c.name === 'Gais Wyrm');
const profile = (id, weapon = 'ylva-speer') => resolveCombatProfile(withEquippedCombatWeapon(addYlvaDuelTechniques(ylva), weapon, ''), { actionId: `technique:${id}`, includeAiSnapshot: false });
const target = () => resolveCombatProfile(withEquippedCombatWeapon(gais, 'starter-uchelwyr-lance', ''), { includeAiSnapshot: false });

test('personal grant is owner-scoped, idempotent and preserves every live pool and other technique', () => {
  const source = { ...ylva, combatProfile: { ...ylva.combatProfile, hitPoints: { current: 7 }, resources: [{ id: 'special-action', current: 0 }], conditions: [{ name: 'Verletzt' }] } };
  const next = addYlvaDuelTechniques(source);
  assert.deepEqual(addYlvaDuelTechniques(next), next); assert.equal(addYlvaDuelTechniques(gais), gais);
  for (const key of Object.keys(source.combatProfile).filter(k => k !== 'techniques')) assert.deepEqual(next.combatProfile[key], source.combatProfile[key]);
  for (const entry of createYlvaDuelTechniques()) { assert.equal(next.combatProfile.techniques.filter(t => t.id === entry.id).length, 1); assert.equal(entry.combatStyleId, undefined); }
});

for (const [roll, save, dropped] of [[15, 1, true], [1, 1, false], [2, 1, false], [15, 20, false], [20, 1, true]]) {
  test(`Schafthebel attack ${roll}, save ${save}: never damages, correct disarm and exact costs`, async () => {
    const actor = profile('ylva-schafthebel'), victim = target();
    assert.equal(actor.selectedAction.formula, ''); assert.equal(getCombatDamagePreview(actor), null);
    const dice = receipts([roll], save); dice.rollDamage = () => { throw Error('Damage roll in non-damaging technique'); };
    const result = await new CombatResolutionService(dice).resolveAttack({ actor, target: victim });
    assert.equal(result.damage, null); assert.equal(!!result.sceneItemEvents?.length, dropped);
    assert.equal(getCriticalWeaponAttacks(result).length, roll === 1 ? 1 : 0);
    assert.deepEqual(result.resourceCosts.map(c => [c.resourceId, c.amount]), [['action', 1], ['reaction', 1]]);
  });
}

test('spear requirement and no damage model survive normalization and mini view shows current affordability', () => {
  const actor = profile('ylva-schafthebel'); assert.equal(actor.selectedAction.compatible, true);
  assert.equal(profile('ylva-schafthebel', 'ylva-saex').selectedAction.compatible, false);
  assert.match(renderPersonalTechniquesSummary(actor), /Schafthebel/);
  const empty = { ...actor, resources: actor.resources.map(r => ({ ...r, current: 0 })) };
  assert.match(renderPersonalTechniquesSummary(empty), /Derzeit nicht verfügbar/);
});

test('evade prepares without attack/damage, affects one incoming attack and expires after an own contribution', async () => {
  const actor = profile('ylva-aus-der-angriffslinie'); assert.equal(actor.actionResolutionMode, 'automatic');
  const setup = await new CombatResolutionService(receipts()).resolveAttack({ actor, target: actor });
  assert.equal(setup.damage, null);
  const protectedActor = overlayCombatHitPointState(profile('ylva-schafthebel'), { temporaryConditions: setup.targetConditionSnapshot.after });
  const dice = receipts([2]);
  const hit = await new CombatResolutionService(dice).resolveAttack({ actor: target(), target: protectedActor });
  assert.equal(dice.calls[0].rollMode, 'disadvantage');
  const after = hit.targetConditionSnapshot?.after || [];
  assert.equal(after.some(c => c.name === 'Aus der Angriffslinie'), false);
  const states = new Map([[actor.characterId, { temporaryConditions: setup.targetConditionSnapshot.after }]]);
  advanceTemporaryConditionsForComment(states, { characterId: actor.characterId });
  assert.equal(states.get(actor.characterId).temporaryConditions.length, 0);
});
