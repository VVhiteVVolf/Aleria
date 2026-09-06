import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { getEffectiveCombatAttribute, getAttributeModifier, getSavingThrowTotal, getBonusDamageFormulas } from '../modules/combat/combat-profile-model.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { overlayCombatHitPointState, deriveCombatStateFromComments } from '../modules/combat/combat-state-model.js';
import { applyTypedCombatDamage } from '../modules/combat/combat-effect-model.js';
import { advanceTemporaryConditionsForComment } from '../modules/combat/combat-condition-duration.js';
import { applyCombatAbilityUse } from '../modules/combat/combat-ability-uses.js';
import { applyInventoryUseAbilityEffects, applyInventoryUseToInventory, inferInventoryUseMode } from '../modules/inventory-use/inventory-use-model.js';
import { applyZornkappeUse } from '../modules/inventory-use/zornkappe-effects.js';
import { estimateCombatDamage } from '../modules/combat/combat-action-estimates.js';

const fenrir = JSON.parse(await readFile(new URL('../../Charakter%20Archiv%20Exporte/fenrir-varulv.json', import.meta.url), 'utf8')).character;
const base = resolveCombatProfile(fenrir);
function rage(level = 6) {
  const character = structuredClone(fenrir);
  character.combatProfile.progression.level = level;
  return resolveCombatProfile(character, { actionId: 'ability:fenrir-berserkergang' });
}
const mode = () => structuredClone(rage().selectedAction.effects.find(effect => effect.condition).condition);
class Dice {
  constructor(natural = 15) { this.natural = natural; this.requests = []; }
  async rollAttack(request) { return { natural: this.natural, total: this.natural + request.modifier, dice: [this.natural], keptDice: [this.natural] }; }
  async rollDamage(request) { this.requests.push(request); return { total: 6 + Number(request.bonus || 0), notation: request.damageFormula, keptDice: [6], modifier: request.bonus || 0 }; }
}

test('Berserkergang: every tier applies real strength modifiers, bounded dice and decreasing armor penalties', () => {
  for (const [level, strength, armor, damage, uses] of [[6, 2, -4, '1d4', 1], [8, 2, -3, '1d6', 2], [10, 4, -2, '1d6', 2], [15, 4, -1, '1d8', 3], [20, 6, 0, '1d10', 3]]) {
    const activation = rage(level);
    const condition = activation.selectedAction.effects.find(effect => effect.condition).condition;
    const profile = overlayCombatHitPointState(base, { temporaryConditions: [condition] });
    const before = getEffectiveCombatAttribute(base, 'strength');
    assert.equal(getEffectiveCombatAttribute(profile, 'strength').score, before.score + strength);
    assert.equal(profile.attackModifier, base.attackModifier + strength / 2);
    assert.equal(profile.damageModifier, base.damageModifier + strength / 2);
    assert.equal(getSavingThrowTotal(profile, 'strength'), getSavingThrowTotal(base, 'strength') + strength / 2);
    assert.equal(profile.totalDefense, base.totalDefense + armor);
    assert.deepEqual(getBonusDamageFormulas(profile), [damage]);
    assert.deepEqual(getBonusDamageFormulas({ ...profile, profileActionKind: 'song' }), []);
    assert.equal(activation.abilities.find(ability => ability.id === 'fenrir-berserkergang').usesMaximum, uses);
  }
  assert(!rage(5).actions.some(action => action.id === 'ability:fenrir-berserkergang'));
});

test('Activation rolls hit die plus CON once, uses higher temp HP, and refuses an active mode', async () => {
  const actor = rage();
  const dice = new Dice();
  const result = await new CombatResolutionService(dice).resolveAttack({ actor, target: actor });
  assert.equal(dice.requests.length, 1);
  assert.equal(dice.requests[0].damageFormula, '1d12');
  const constitution = getAttributeModifier(getEffectiveCombatAttribute(actor, 'constitution'));
  const state = deriveCombatStateFromComments([{ id: 'activation', characterId: actor.characterId, commentSegments: [{ combatResolution: result }] }]).get(actor.characterId);
  assert.equal(state.temporary, Math.max(actor.temporaryHitPoints, 6 + constitution));
  assert.equal(state.temporaryConditions[0].berserk.survivalCharges, 1);
  const active = overlayCombatHitPointState(actor, state);
  await assert.rejects(() => new CombatResolutionService(dice).resolveAttack({ actor: active, target: active }), /bereits aktiv/);
  const full = { ...actor, temporaryHitPoints: 80 };
  const high = await new CombatResolutionService(new Dice()).resolveAttack({ actor: full, target: full });
  const highState = deriveCombatStateFromComments([{ commentSegments: [{ combatResolution: high }] }]).get(actor.characterId);
  assert.equal(highState.temporary, 80);
});

test('Zero-HP protection survives exactly once, even across separate hits and temp HP', () => {
  const first = applyTypedCombatDamage({ current: 12, maximum: 60, temporary: 3 }, 50, {}, { conditions: [mode()] });
  assert.equal(first.after.current, 1);
  assert.equal(first.after.temporary, 0);
  assert.equal(first.conditions[0].berserk.survivalCharges, 0);
  assert.equal(first.survival.hitPoints, 1);
  const second = applyTypedCombatDamage(first.after, 1, {}, { conditions: first.conditions });
  assert.equal(second.after.current, 0);
  assert.equal(second.defeated, true);
  assert.equal(second.survival, undefined);
  const absorbed = applyTypedCombatDamage({ current: 12, maximum: 60, temporary: 30 }, 2, {}, { conditions: [mode()] });
  assert.equal(absorbed.conditions[0].berserk.activity, true);
  assert.equal(absorbed.conditions[0].berserk.survivalCharges, 1);
});

test('Missed attacks sustain the mode; foreign/admin posts do not end it; a whole quiet own post does', async () => {
  const actor = overlayCombatHitPointState(base, { temporaryConditions: [mode()] });
  const target = resolveCombatProfile({ id: 'dummy', combatProfile: { hitPoints: { current: 100, maximumOverride: 100 }, armorClass: { override: 20 } } });
  const result = await new CombatResolutionService(new Dice(1)).resolveAttack({ actor, target });
  assert.equal(result.attack.hit, false);
  assert.equal(result.actorConditionSnapshot.after[0].berserk.activity, true);
  const states = new Map([[actor.characterId, { temporaryConditions: result.actorConditionSnapshot.after }]]);
  advanceTemporaryConditionsForComment(states, { characterId: 'other' });
  assert.equal(states.get(actor.characterId).temporaryConditions[0].berserk.activity, true);
  advanceTemporaryConditionsForComment(states, { characterId: actor.characterId, commentSegments: [{ actorId: actor.characterId }, { actorId: actor.characterId }] });
  assert.equal(states.get(actor.characterId).temporaryConditions.length, 1);
  assert.equal(states.get(actor.characterId).temporaryConditions[0].berserk.activity, false);
  advanceTemporaryConditionsForComment(states, { characterId: actor.characterId });
  assert.equal(states.get(actor.characterId).temporaryConditions.length, 0);
  assert.equal(overlayCombatHitPointState(base, states.get(actor.characterId)).totalDefense, base.totalDefense);
});

test('Level six has one daily application and Aura does not bypass it', () => {
  const first = applyCombatAbilityUse(rage().abilities, 'ability:fenrir-berserkergang', 'day1');
  assert.equal(first.sufficient, true);
  assert.equal(first.use.after, 0);
  assert.equal(applyCombatAbilityUse(first.abilities, 'ability:fenrir-berserkergang', 'day1').sufficient, false);
  assert.equal(applyCombatAbilityUse(first.abilities, 'ability:fenrir-berserkergang', 'day2').sufficient, true);
});

test('Zornkappe consumes inventory, scales damage/armor, keeps hit chance and persists replay', () => {
  let inventory = { items: [{ id: 'mushroom', name: 'Zornkappe', quantity: '3' }] };
  let conditions = [];
  const segments = [];
  assert.equal(inferInventoryUseMode(inventory.items[0]), 'consume');
  for (const bonus of [2, 4, 8]) {
    const applied = applyInventoryUseToInventory(inventory, { item: inventory.items[0], actorId: base.characterId, mode: 'consume', quantity: 1 });
    inventory = applied.inventory;
    const triggered = applyInventoryUseAbilityEffects({ ...base, temporaryConditions: conditions }, applied.inventoryUse);
    conditions = triggered.conditions;
    const affected = overlayCombatHitPointState(base, { temporaryConditions: conditions });
    assert.equal(affected.attackModifier, base.attackModifier);
    assert.equal(affected.damageModifier, base.damageModifier + bonus);
    assert.equal(affected.totalDefense, base.totalDefense - bonus);
    assert.equal(estimateCombatDamage(affected), estimateCombatDamage(base) + bonus);
    segments.push({ inventoryUse: triggered.inventoryUse });
  }
  assert.equal(inventory.items.length, 0);
  assert.throws(() => applyZornkappeUse(conditions, { mode: 'consume', item: { name: 'Zornkappe' } }), /drei/);
  assert.throws(() => applyInventoryUseToInventory(inventory, { mode: 'consume', item: { id: 'mushroom' } }), /Inventar/);
  const state = deriveCombatStateFromComments([{ commentSegments: segments }]).get(base.characterId);
  assert.equal(state.temporaryConditions.length, 1);
  assert.equal(state.temporaryConditions[0].zornkappeStacks, 3);
  assert.equal(deriveCombatStateFromComments([]).get(base.characterId), undefined, 'removing the post removes its temporary effect');
});

test('Pilzbonus also reaches a weak follow-up, while Berserk dice never repeat on it', async () => {
  const character = structuredClone(fenrir);
  const paired = character.combatProfile.weapons.find(weapon => weapon.name.includes('(Paar)'));
  character.combatProfile.weapons.forEach(weapon => { weapon.equipped = weapon.id === paired.id; });
  const selected = resolveCombatProfile(character, { actionId: 'technique:fenrir-twin-axe-flurry' });
  const mushroom = applyZornkappeUse([], { item: { name: 'Zornkappe' }, actorId: selected.characterId, mode: 'consume' }).condition;
  const actor = overlayCombatHitPointState(selected, { temporaryConditions: [mode(), mushroom] });
  const target = resolveCombatProfile({ id: 'dummy', combatProfile: { hitPoints: { current: 100, maximumOverride: 100 }, armorClass: { override: 1 } } });
  const dice = new Dice();
  const result = await new CombatResolutionService(dice).resolveAttack({ actor, target });
  assert.equal(result.followUpAttacks.length, 1);
  assert.equal(dice.requests[1].damageFormula, '1d4');
  assert.equal(dice.requests[1].bonus, 2);
  assert.equal(result.followUpAttacks[0].damage.total, 8);
});

test('Kraftbonus raises a strength-based technique save DC and the visible damage formula', async () => {
  const character = structuredClone(fenrir);
  character.combatProfile.weapons.forEach(weapon => { weapon.equipped = weapon.id === 'fenrir-roundshield-bash'; });
  const base = resolveCombatProfile(character, { actionId: 'technique:fenrir-shield-bash' });
  const active = overlayCombatHitPointState(base, { temporaryConditions: [mode()] });
  assert.equal(active.selectedAction.secondarySave.dc, base.selectedAction.secondarySave.dc + 1);
  const { getCombatDisplayStats } = await import('../modules/combat/ui/combat-action-card.js');
  assert.match(getCombatDisplayStats(active).damage, /W4/);
});
