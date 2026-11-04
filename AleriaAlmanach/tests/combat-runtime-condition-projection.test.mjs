import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { createCombatProfileReadModel, sanitizeCharacterCombatProfile, getEffectiveCombatAttribute,
  getSkillTotal, getNaturalRollPolicy, getSavingThrowTotal } from '../modules/combat/combat-profile-model.js';
import { SkillResolutionService } from '../modules/skill-checks/skill-resolution-service.js';

const conditions = Array.from({ length: 60 }, (_, index) => ({ id: `stored-${index}`, name: `Gespeicherter Zustand ${index}`, active: true }));
const base = () => resolveCombatProfile({ id: 'actor', name: 'Testfigur', combatProfile: {
  attributes: [{ key: 'intelligence', score: 10 }], conditions, hitPoints: { current: 7, maximumOverride: 30 }
} });
const runtime = () => ({ id: 'scene-owned', name: 'Szenenwirkung', active: true,
  sourceActorId: 'caster', sourceConditionId: 'buff', durationModel: { kind: 'actor-comments', remainingActorComments: 2 },
  mechanics: { skill: 7, attributeModifiers: [{ attributeKey: 'intelligence', bonus: 4 }], naturalOneReroll: true,
    saveAttributeModifiers: [{ attributeKey: 'constitution', bonus: -1 }] } });

test('a valid temporary effect still reaches every getter after sixty stored conditions', async () => {
  const source = base(), before = structuredClone(source), effect = runtime();
  const current = overlayCombatHitPointState(source, { current: 7, maximum: 30, temporaryConditions: [effect] });
  const skill = current.skills.find(entry => entry.name === 'Nachforschungen');
  assert.equal(current.conditions.length, 61);
  assert.equal(getEffectiveCombatAttribute(current, 'intelligence').score, 14);
  assert.equal(getSkillTotal(current, skill), 9);
  assert.equal(getNaturalRollPolicy(current).naturalOneReroll, true);
  assert.equal(getSavingThrowTotal(current, 'constitution'), -1);
  assert.equal(current.aiSnapshot.skills.find(entry => entry.name === 'Nachforschungen').total, 9);
  assert.equal(current.aiSnapshot.attributes.find(entry => entry.key === 'intelligence').score, 14);
  const result = await new SkillResolutionService({ rollSkill: async ({ modifier }) => ({ natural: 10, dice: [10], total: 10 + modifier }) })
    .resolve({ actor: current, settings: { skillId: 'investigation', difficulty: 15 } }, { actorProfile: current });
  assert.equal(result.total, 19);
  assert.equal(result.outcome, 'success');
  assert.deepEqual(source, before);
});

test('runtime projection is detached and never duplicates its effects when read repeatedly', () => {
  const profile = base(), effect = runtime();
  const snapshot = createCombatProfileReadModel({ ...profile, conditions: [...profile.conditions, effect], temporaryConditions: [effect] });
  const skill = snapshot.skills.find(entry => entry.name === 'Nachforschungen');
  assert.equal(snapshot.conditions.length, 61);
  assert.equal(getSkillTotal(snapshot, skill), 9);
  assert.equal(createCombatProfileReadModel(snapshot), snapshot);
  effect.mechanics.skill = 99;
  assert.equal(getSkillTotal(snapshot, skill), 9);
  assert.ok(Object.isFrozen(snapshot.temporaryConditions[0]));
});

test('storage limits stay unchanged and removal restores the original values', () => {
  assert.equal(sanitizeCharacterCombatProfile({ conditions: [...conditions, runtime()] }).conditions.length, 60);
  assert.equal(Object.hasOwn(sanitizeCharacterCombatProfile({ conditions, temporaryConditions: [runtime()] }), 'temporaryConditions'), false);
  const profile = base(), current = overlayCombatHitPointState(profile, { temporaryConditions: [runtime()] });
  const removed = overlayCombatHitPointState(current, { current: 7, maximum: 30, temporaryConditions: [] });
  assert.equal(getEffectiveCombatAttribute(removed, 'intelligence').score, 10);
  assert.equal(getSkillTotal(removed, removed.skills.find(entry => entry.name === 'Nachforschungen')), 0);
  assert.equal(removed.conditions.length, 60);
});

test('replacing or removing a runtime layer cannot accumulate initiative, movement or AI conditions', () => {
  const source = base();
  const effect = { ...runtime(), mechanics: { initiative: 2, movement: 3, armorClass: 1 } };
  const once = overlayCombatHitPointState(source, { temporaryConditions: [effect] });
  const repeated = overlayCombatHitPointState(once, { temporaryConditions: [effect] });
  for (const key of ['initiative', 'movement', 'totalDefense']) assert.equal(repeated[key], once[key], key);
  assert.equal(repeated.aiSnapshot.conditionsAndEffects.filter(condition => condition.id === effect.id).length, 1);
  const removed = overlayCombatHitPointState(repeated, { temporaryConditions: [] });
  for (const key of ['initiative', 'movement', 'totalDefense']) assert.equal(removed[key], source[key], key);
  assert.equal(removed.aiSnapshot.conditionsAndEffects.some(condition => condition.id === effect.id), false);
});
