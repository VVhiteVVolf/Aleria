import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { planWolfshornRecoveryRelease, applyCharacterFieldPatch } from '../../firebase/functions/scripts/wolfshorn-recovery-release-model.mjs';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { applyCombatAbilityUse } from '../modules/combat/combat-ability-uses.js';
import { recoverSceneRestAbilities } from '../modules/scene-rest/scene-rest-model.js';
import { overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { getSavingThrowTotal, getSkillTotal } from '../modules/combat/combat-profile-model.js';
import { reconcileMartialRecovery, MARTIAL_CLASS_IDS } from '../modules/classes/martial-recovery.js';
import { applyCombatEncounterCommentToStateMap } from '../modules/combat/combat-encounter-model.js';
const load = async name => {
  const c = JSON.parse(await readFile(new URL(`../../Charakter%20Archiv%20Exporte/${name}-wolfshorn.json`, import.meta.url), 'utf8')).character;
  return applyCharacterFieldPatch(c, planWolfshornRecoveryRelease(c));
};
const ylva = await load('ylva'), asgeir = await load('asgeir');
function equipped(character, right, left = '') {
  const c = structuredClone(character);
  c.combatProfile.weapons.forEach(w => { w.equipped = w.id === right; });
  c.combatProfile.combat.offHandWeaponId = left;
  return c;
}
function dice(rolls = [15, 15, 15, 15], save = 1) {
  const calls = [];
  return { calls,
    rollAttack: async options => { calls.push(['attack', options]); const natural = rolls.shift(); return { natural, total: natural + options.modifier, dice: [natural], keptDice: [natural] }; },
    rollSavingThrow: async options => { calls.push(['save', options]); return { natural: save, total: save + options.modifier, dice: [save] }; },
    rollDamage: async options => { calls.push(['damage', options]); return { notation: options.damageFormula, modifier: options.bonus || 0, keptDice: [3], total: 3 + Number(options.bonus || 0) }; }
  };
}
const target = () => ({ ...resolveCombatProfile(asgeir, { includeAiSnapshot: false }), characterId: 'enemy', name: 'Gegner', totalDefense: 10, currentHitPoints: 500, maximumHitPoints: 500 });

test('release is idempotent, personal HP and item bonuses resolve together', () => {
  assert.equal(planWolfshornRecoveryRelease(ylva), null);
  assert.equal(planWolfshornRecoveryRelease(asgeir), null);
  const y = resolveCombatProfile(equipped(ylva, 'ylva-speer'));
  const a = resolveCombatProfile(equipped(asgeir, 'asgeir-axt-rechts', 'asgeir-axt-links'));
  assert.equal(y.maximumHitPoints, 95); assert.equal(a.maximumHitPoints, 108);
  assert.equal(y.weapon.damageFormula, '1d8'); assert.equal(y.damageModifier, 5);
  assert.equal(a.damageModifier, 6);
  const untrained = structuredClone(ylva);
  untrained.combatProfile.abilities = untrained.combatProfile.abilities.filter(a => a.id !== 'wolfshorn-ylva-border-veteran');
  assert.equal(resolveCombatProfile(equipped(untrained, 'ylva-speer')).damageModifier, 2);
  assert.equal(getSavingThrowTotal(y, 'wisdom', { saveTags: ['fear'] }) - getSavingThrowTotal(y, 'wisdom'), 3);
  assert.equal(getSavingThrowTotal(y, 'constitution', { saveTags: ['poison'] }) - getSavingThrowTotal(y, 'constitution'), 2);
  const perception = y.skills.find(s => s.name === 'Wahrnehmung');
  assert.equal(getSkillTotal(y, perception) - getSkillTotal({ ...y, abilities: [] }, perception), 3);
});

for (const classId of MARTIAL_CLASS_IDS) test(`${classId}: previous reserve becomes healing, all generic maneuvers disappear`, () => {
  const profile = reconcileMartialRecovery({ templateSelections: { classId }, abilities: [{ id: `class-special-${classId}-reserve` }],
    techniques: [{ id: `class-special-${classId}-strike` }, { id: 'personal' }] });
  assert.equal(profile.abilities[0].name, 'Durchschnaufen');
  assert.deepEqual(profile.techniques, [{ id: 'personal' }]);
  assert.deepEqual(reconcileMartialRecovery(profile), profile);
});

test('Durchschnaufen rolls own hit die plus rounded max HP, only long rest restores usage', async () => {
  const actor = { ...resolveCombatProfile(ylva, { actionId: 'ability:martial-durchschnaufen' }), currentHitPoints: 40 };
  const d = dice(); const result = await new CombatResolutionService(d).resolveAttack({ actor, target: actor });
  assert.equal(d.calls[0][1].damageFormula, '1d10+10');
  assert.equal(result.actorResourceSnapshot.after.find(r => r.id === 'bonus-action').current, 0);
  assert.equal(result.actorResourceSnapshot.after.find(r => r.id === 'special-action').current, 2);
  const spent = applyCombatAbilityUse(actor.abilities, actor.profileActionId).abilities;
  assert.equal(applyCombatAbilityUse(spent, actor.profileActionId, 'another-day').sufficient, false);
  assert.equal(recoverSceneRestAbilities(spent, 'short').find(a => a.id === 'martial-durchschnaufen').usesCurrent, 0);
  assert.equal(recoverSceneRestAbilities(spent, 'long').find(a => a.id === 'martial-durchschnaufen').usesCurrent, 1);
});

for (const [label, rolls, save, mode, damage] of [
  ['failed save', [15, 15], 1, 'advantage', '2d8'], ['passed save', [15, 15], 20, 'normal', '1d8'],
  ['first misses', [1, 15], 1, 'normal', '1d8']
]) test(`Ylva sequence: ${label}`, async () => {
  const actor = resolveCombatProfile(equipped(ylva, 'ylva-speer'), { actionId: 'technique:ylva-fallender-dorn' });
  const d = dice(rolls.slice(), save);
  const result = await new CombatResolutionService(d).resolveAttack({ actor, target: target() });
  assert.equal(d.calls.filter(c => c[0] === 'attack').length, 2);
  assert.equal(result.followUpAttacks[0].attack.rollMode, mode);
  assert.equal(d.calls.filter(c => c[0] === 'damage').at(-1)[1].damageFormula, damage);
  if (rolls[0] !== 1) assert.equal(result.secondarySaves[0].dc, 15);
  assert.equal(result.actorResourceSnapshot.after.find(r => r.id === 'special-action').current, 1);
});

for (const rolls of [[15, 15, 15, 15], [1, 15, 15, 15]]) test(`Asgeir four rolls, first roll ${rolls[0]}`, async () => {
  const actor = resolveCombatProfile(equipped(asgeir, 'asgeir-axt-rechts', 'asgeir-axt-links'), { actionId: 'technique:asgeir-vier-faenge' });
  assert.equal(actor.selectedAction.compatible, true);
  const d = dice(rolls.slice()); const result = await new CombatResolutionService(d).resolveAttack({ actor, target: target() });
  assert.equal(d.calls.filter(c => c[0] === 'attack').length, 4);
  assert.deepEqual(result.followUpAttacks.map(a => a.weaponId), ['asgeir-axt-links', 'asgeir-axt-rechts', 'asgeir-axt-links']);
  assert.equal(result.actorResourceSnapshot.after.find(r => r.id === 'asgeir-four-fangs-use').current, 0);
  assert.equal(result.actorResourceSnapshot.after.find(r => r.id === 'special-action').current, 2);
  const conditions = result.targetConditionSnapshot?.after || [];
  assert.equal(conditions.some(c => c.blockedResource === 'action'), rolls[0] !== 1);
  if (conditions.length) {
    const affected = overlayCombatHitPointState(target(), { temporaryConditions: conditions });
    assert.equal(affected.resources.find(r => r.id === 'action').current, 0);
    assert.equal(affected.resources.find(r => r.id === 'bonus-action').current, 1);
  }
});

test('combat use resets only on new encounter, not on rejoining', () => {
  const resource = { id: 'asgeir-four-fangs-use', current: 0, maximum: 1, recovery: 'combat' };
  const states = new Map();
  const event = operation => ({ combatEncounter: { encounterId: 'new-fight', operation, participants: [{ actorId: 'a', entrySnapshot: { resources: [resource] } }] } });
  applyCombatEncounterCommentToStateMap(states, event('start'));
  assert.equal(states.get('a').resources[0].current, 1);
  states.get('a').resources[0].current = 0;
  applyCombatEncounterCommentToStateMap(states, event('add'));
  assert.equal(states.get('a').resources[0].current, 0);
  const next = event('add'); next.combatEncounter.encounterId = 'different-fight';
  applyCombatEncounterCommentToStateMap(states, next);
  assert.equal(states.get('a').resources[0].current, 1);
});

test('all remaining regular actions are paid, no special actions; partial pools still require one each', async () => {
  const profile = resolveCombatProfile(equipped(asgeir, 'asgeir-axt-rechts', 'asgeir-axt-links'), { actionId: 'technique:asgeir-vier-faenge' });
  const resources = profile.resources.map(r => ['action', 'bonus-action', 'reaction'].includes(r.id) ? { ...r, maximum: 3, current: 3 } : r);
  const actor = overlayCombatHitPointState({ ...profile, resources }, { resources });
  const result = await new CombatResolutionService(dice()).resolveAttack({ actor, target: target() });
  for (const id of ['action', 'bonus-action', 'reaction']) {
    assert.equal(result.resourceCosts.find(c => c.resourceId === id).amount, 3);
    assert.equal(result.actorResourceSnapshot.after.find(r => r.id === id).current, 0);
  }
  const spent = overlayCombatHitPointState(profile, { resources: result.actorResourceSnapshot.after });
  await assert.rejects(new CombatResolutionService(dice()).resolveAttack({ actor: spent, target: target() }));
});

test('weapon critical effects and armor protection apply only to equipped items', async () => {
  const actor = resolveCombatProfile(equipped(asgeir, 'asgeir-grossaxt'));
  const critical = await new CombatResolutionService(dice([20])).resolveAttack({ actor, target: target() });
  const normal = await new CombatResolutionService(dice([15])).resolveAttack({ actor, target: target() });
  assert.equal(critical.damage.modifier - normal.damage.modifier, 2);
  const archer = resolveCombatProfile(ylva);
  const pin = await new CombatResolutionService(dice([20])).resolveAttack({ actor: archer, target: target() });
  assert.ok(pin.targetConditionSnapshot.after.some(c => c.name === 'Festnagelnder Schuss' && c.stanceGroup === 'martial-position-penalty'));
  const shieldBearer = equipped(asgeir, 'asgeir-axt-rechts');
  shieldBearer.combatProfile.armorItems.find(a => a.kind === 'shield').equipped = true;
  const defended = { ...resolveCombatProfile(shieldBearer), characterId: 'enemy' };
  const attacker = resolveCombatProfile(equipped(ylva, 'ylva-speer'), { actionId: 'technique:ylva-fallender-dorn' });
  const result = await new CombatResolutionService(dice([15,15], 20)).resolveAttack({ actor: attacker, target: defended }, { rulePeriods: { comment: 'one-post' } });
  assert.equal(result.ruleApplications.filter(r => r.ruleId === 'wolfshorn-shield-catch').length, 1);
});
