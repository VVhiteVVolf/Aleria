import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { planNuddDuelRelease } from '../../firebase/functions/scripts/nudd-duel-release-model.mjs';
import { applyCharacterFieldPatch } from '../../firebase/functions/scripts/wolfshorn-recovery-release-model.mjs';
import { createNuddPersonalTechniques } from '../modules/classes/cenyr/nudd-personal-training.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { resolveCombatProfile as resolveServerProfile } from '../../firebase/functions/src/generated/combat/combat-profile-resolver.js';
import { simulatePost, createAuditFighter } from '../tools/combat-audit/post-simulation.mjs';

const original = JSON.parse(await readFile(new URL('../../Charakter%20Archiv%20Exporte/nudd-saethwyr-defense-balance-2026-10-03.json', import.meta.url))).character;
const nudd = applyCharacterFieldPatch(original, planNuddDuelRelease(original));

test('release preserves identity, wounds, resources, uses, ownership and unrelated fields; repeat is a no-op', () => {
  const source = structuredClone(original);
  source.combatProfile.hitPoints.current = 17;
  source.combatProfile.resources.forEach(resource => { resource.current = 0; });
  source.combatProfile.abilities[0].usesCurrent = 0;
  const patch = planNuddDuelRelease(source);
  const after = applyCharacterFieldPatch(source, patch);
  assert.deepEqual(after.combatProfile.hitPoints, source.combatProfile.hitPoints);
  assert.deepEqual(after.combatProfile.resources, source.combatProfile.resources);
  assert.deepEqual(after.combatProfile.abilities, source.combatProfile.abilities);
  assert.deepEqual(after.combatProfile.classTraining, source.combatProfile.classTraining);
  const previousIds = new Set(source.inventory.items.map(item => item.id));
  assert.deepEqual(after.inventory.items.filter(item => previousIds.has(item.id)).map(item => [item.id, item.ownerCharacterId, item.quantity]), source.inventory.items.map(item => [item.id, item.ownerCharacterId, item.quantity]));
  const added = after.inventory.items.filter(item => !previousIds.has(item.id));
  assert.equal(added.length, 1); assert.equal(added[0].ownerCharacterId, source.id);
  assert.equal(planNuddDuelRelease(after), null);
  assert.equal(planNuddDuelRelease({ ...source, id: 'someone-else' }), null);
  assert.deepEqual(Object.keys(patch).sort(), ['combatProfile.armorItems', 'combatProfile.techniques', 'combatProfile.weapons', 'inventory']);
});

test('three sourced preforms and two personal techniques survive class autofill without opening an expert path', () => {
  const profile = resolveCombatProfile(nudd, { includeAiSnapshot: false });
  const personal = createNuddPersonalTechniques();
  assert.equal(personal.length, 5);
  assert.equal(personal.filter(entry => entry.trainingForm.includes('Vorformen')).length, 3);
  for (const technique of personal) {
    const resolved = resolveCombatProfile(nudd, { actionId: `technique:${technique.id}`, includeAiSnapshot: false });
    assert.equal(resolved.selectedAction.compatible, true, technique.name);
    assert.ok(resolved.weapon.damageFormula.startsWith('1d10'), technique.name);
  }
  assert.equal(profile.progression.level, 6);
  assert.equal(nudd.combatProfile.classTraining.selections.some(selection => selection.kind === 'path'), false);
  assert.equal(profile.techniques.filter(entry => entry.id.startsWith('nudd-')).length, 5);
  const baseline = resolveCombatProfile(original, { includeAiSnapshot: false });
  for (const old of baseline.actions.filter(action => action.kind === 'technique' && action.compatible)) {
    assert.equal(profile.actions.find(action => action.id === old.id)?.compatible, true, old.name);
  }
  assert.equal(profile.maximumHitPoints, baseline.maximumHitPoints);
});

test('trident uses 1W10 in profile and owned item, with stable equipment IDs', () => {
  const weapon = nudd.combatProfile.weapons.find(entry => entry.id === 'starter-cantref-spear');
  const item = nudd.inventory.items.find(entry => entry.id === weapon.inventoryItemId);
  assert.equal(weapon.weaponProfileId, 'trident');
  assert.equal(weapon.damageFormula, '1d10');
  assert.equal(item.combatDefinition.damageFormula, '1d10');
  assert.equal(item.name, weapon.name);
  assert.equal(item.equipmentLink.combatEntryId, weapon.id);
});

test('personal techniques have matching power budgets; browser and current server resolve all five identically', () => {
  const first = resolveCombatProfile(nudd, { actionId: 'technique:nudd-pflicht-vor-ruhm', includeAiSnapshot: false });
  const second = resolveCombatProfile(nudd, { actionId: 'technique:nudd-unbeirrbare-wacht', includeAiSnapshot: false });
  assert.equal(first.weapon.damageFormula, '1d10+1d6');
  assert.equal(second.weapon.damageFormula, first.weapon.damageFormula);
  for (const technique of createNuddPersonalTechniques()) {
    const options = { actionId: `technique:${technique.id}`, includeAiSnapshot: false };
    const browser = resolveCombatProfile(nudd, options), server = resolveServerProfile(nudd, options);
    for (const key of ['attackModifier','damageModifier','resourceCosts','selectedAction','weapon']) assert.deepEqual(server[key],browser[key],`${technique.name}: ${key}`);
  }
});

test('two attacks share one legal contribution; personal guard and resource costs replay normally', async () => {
  const fighter = createAuditFighter(nudd);
  const enemyRecord = structuredClone(nudd); enemyRecord.id = 'test-enemy'; enemyRecord.name = 'Testgegner';
  const defender = createAuditFighter(enemyRecord);
  const result = await simulatePost({ attacker: fighter, defender, seed: 178,
    plan: [{ id: 'weapon:starter-cantref-spear' }, { id: 'technique:nudd-unbeirrbare-wacht' }] });
  const state = result.states.get(nudd.id);
  assert.equal(result.attacks, 2);
  for (const id of ['action', 'reaction']) assert.equal(state.resources.find(resource => resource.id === id).current, 0);
  assert.equal(state.resources.find(resource => resource.id === 'bonus-action').current, 1);
  assert.equal(state.resources.find(resource => resource.id === 'special-action').current, 1);
  assert.ok(state.temporaryConditions.some(condition => condition.damageGuard?.reduction === 3));
  const first = result.comment.commentSegments[0].combatResolution;
  assert.equal(first.weapon.damageFormula, '1d10');
});
