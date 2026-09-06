import test from 'node:test';
import assert from 'node:assert/strict';
import { getBuiltinCreatureTemplates } from '../modules/creatures/creature-catalog.js';
import { sanitizeCreature, createCreatureDuplicate } from '../modules/creatures/creature-model.js';
import { resolveCombatProfile, validateCombatActorProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { applyTypedCombatDamage } from '../modules/combat/combat-effect-model.js';
import { resetCommentScopedResources } from '../modules/combat/combat-action-economy.js';
import { getArmorClass } from '../modules/combat/combat-profile-model.js';
import { SeededCombatDice } from './support/combat-seeded-dice.mjs';
import { prepareCombatEquipment } from '../modules/combat/combat-equipment-preparation.js';
import { createManualCombatCondition } from '../modules/combat-status/combat-status-model.js';

const template = getBuiltinCreatureTemplates().find(creature => creature.id === 'catalog-troll');
const base = resolveCombatProfile(template);
const service = () => new CombatResolutionService(new SeededCombatDice(1, 6));
const wait = () => resolveCombatProfile(template, { actionId: 'combat:wait' });
const wound = profile => ({ ...profile, currentHitPoints: 80 });

test('Creature level precedes derived resources; template and duplicate retain passive rules', () => {
  assert.equal(base.progression.level, 12);
  assert.equal(base.resources.find(r => r.id === 'action').maximum, 2);
  assert.equal(base.resources.find(r => r.id === 'special-action').maximum, 4);
  assert.deepEqual(sanitizeCreature(template), template);
  assert.deepEqual(createCreatureDuplicate(template).combatProfile.abilities, template.combatProfile.abilities);
});

test('Creature attacks ignore stale character hand slots; characters retain loadout validation', () => {
  const requested = { rightWeaponId: 'old-character-sword', leftWeaponId: '' };
  assert.equal(prepareCombatEquipment(template, requested).preparation, null);
  assert.match(prepareCombatEquipment({ ...template, entityType: 'character' }, requested).preparation.error, /rechte Waffe/);
  const boulder = resolveCombatProfile(template, { actionId: 'weapon:troll-boulder' });
  assert.equal(boulder.selectedAction.compatible, true);
  assert.equal(boulder.attackModifier, 6);
  assert.equal(boulder.damageModifier, 2);
  assert(!boulder.actions.some(action => action.kind === 'equipment-switch'));
});

test('Manual stun preset blocks attacks, while arbitrary condition names alone do not invent rules', () => {
  const condition = createManualCombatCondition({ presetId: 'stunned', durationKind: 'actor-comments', durationAmount: 1 }, { id: 'manual-stun' });
  assert.equal(validateCombatActorProfile(overlayCombatHitPointState(base, { temporaryConditions: [condition] })).ready, false);
  assert.equal(validateCombatActorProfile(overlayCombatHitPointState(base, { temporaryConditions: [{ name: 'Frei beschriebene Wirkung' }] })).ready, true);
});

test('Trollblut heals hit die + twice CON, once per whole post, and replays without rerolling', async () => {
  const actor = wound(wait());
  const first = await service().resolveAttack({ actor, target: actor });
  assert.equal(first.turnStart.restored, 16);
  const comments = [{ id: 'post', characterId: actor.characterId, commentSegments: [{ combatResolution: first }] }];
  const states = deriveCombatStateFromComments(comments, { commentId: 'post', segmentIndex: 1 });
  const next = overlayCombatHitPointState(wait(), states.get(actor.characterId));
  assert.equal(next.currentHitPoints, 96);
  const second = await service().resolveAttack({ actor: next, target: next });
  assert.equal(second.turnStart, undefined);
  next.resources = resetCommentScopedResources(next.resources);
  assert.equal((await service().resolveAttack({ actor: next, target: next })).turnStart.restored, 16);
  assert.equal(base.currentHitPoints, template.combatProfile.hitPoints.current);
});

test('Regeneration clamps at maximum, cannot revive, and skips second targets', async () => {
  const actor = { ...wait(), currentHitPoints: base.maximumHitPoints - 2 };
  const result = await service().resolveAttack({ actor, target: actor });
  assert.equal(result.turnStart.restored, 2);
  assert.equal(result.actorHitPointSnapshot.after.current, base.maximumHitPoints);
  const dead = { ...actor, currentHitPoints: 0 };
  await assert.rejects(() => service().resolveAttack({ actor: dead, target: actor }), /0 Trefferpunkten/);
  assert.equal((await service().resolveAttack({ actor, target: actor }, { skipResourceCosts: true })).turnStart, undefined);
});

test('Positive fire damage applies one refreshing burn; immunity/misses do not, and RK penalty does not stack', async () => {
  const hit = applyTypedCombatDamage({ current: 80, maximum: 180, temporary: 0 }, 3, base, { damageType: 'Feuer' });
  const again = applyTypedCombatDamage(hit.after, 3, base, { damageType: 'Feuer', conditions: hit.conditions });
  assert.equal(again.conditions.length, 1);
  const burning = overlayCombatHitPointState(wait(), { ...again.after, temporaryConditions: again.conditions });
  assert.equal(burning.totalDefense, base.totalDefense - 2);
  assert.equal(getArmorClass(burning), base.totalDefense - 2);
  const result = await service().resolveAttack({ actor: burning, target: burning });
  assert.equal(result.turnStart.suppressed, true);
  assert.equal(result.turnStart.restored, 0);
  assert.equal(result.turnStart.roll, null);
  assert.deepEqual(applyTypedCombatDamage(hit.after, 0, base, { damageType: 'Feuer' }).conditions, []);
  assert.deepEqual(applyTypedCombatDamage(hit.after, 4, { ...base, damageAffinities: [{ damageType: 'feuer', response: 'immune' }] }, { damageType: 'Feuer' }).conditions, []);
});

test('Club hit resolves CON save and stun blocks actions while allowing a skipped turn', async () => {
  const actor = resolveCombatProfile(template, { actionId: 'technique:troll-sweeping-club' });
  const target = { ...base, characterId: 'victim', totalDefense: 5, attributes: base.attributes.map(a => a.key === 'constitution' ? { ...a, score: 2 } : a), savingThrows: [] };
  const result = await service().resolveAttack({ actor, target });
  assert.equal(result.secondarySaves[0].attributeKey, 'constitution');
  assert.equal(result.secondarySaves[0].succeeded, false);
  const stunned = overlayCombatHitPointState(target, { temporaryConditions: result.targetConditionSnapshot.after });
  assert.equal(validateCombatActorProfile(stunned).ready, false);
  await assert.rejects(() => service().resolveAttack({ actor: stunned, target: base }), /betäubt/);
  const skipped = overlayCombatHitPointState({ ...wait(), characterId: 'victim' }, { temporaryConditions: result.targetConditionSnapshot.after });
  assert.equal(validateCombatActorProfile(skipped).ready, true);
});
