import { getCombatWeaponLoadout } from './combat-weapon-loadout.js';
import { getCombatWeaponAttackValues } from './combat-weapon-attack-values.js';
import { consumeCombatAmmunition } from './combat-ammunition.js';
import { validateCombatActorProfile } from './combat-profile-resolver.js';
import { compactCombatResolution } from './combat-resolution-storage.js';
import { resolveCombatWeaponGrip } from './combat-weapon-grip.js';
import { getConditionArmorBonus } from './combat-armor-stances.js';

function afterProfile(profile, result, role) {
  const conditions = result[`${role}ConditionSnapshot`]?.after || profile.temporaryConditions || [];
  const oldTemporary = new Set((profile.temporaryConditions || []).map(condition => condition.id));
  const combinedConditions = (profile.conditions || []).filter(c => !oldTemporary.has(c.id)).concat(conditions);
  const beforeArmor = getConditionArmorBonus(profile.conditions);
  const afterArmor = getConditionArmorBonus(combinedConditions);
  const hp = role === 'target' ? { current: result.targetSnapshot.hitPointsAfter, temporary: result.targetSnapshot.temporaryHitPointsAfter }
    : result.actorHitPointSnapshot?.after;
  return { ...profile, currentHitPoints: hp?.current ?? profile.currentHitPoints, temporaryHitPoints: hp?.temporary ?? profile.temporaryHitPoints,
    conditions: combinedConditions, temporaryConditions: conditions,
    totalDefense: profile.totalDefense - beforeArmor + afterArmor,
    resources: result[`${role}ResourceSnapshot`]?.after || profile.resources,
    inventory: result[`${role}InventorySnapshot`]?.after || profile.inventory,
    concentration: result[`${role}ConcentrationSnapshot`] ? result[`${role}ConcentrationSnapshot`].after : profile.concentration,
    channeling: result[`${role}ChannelingSnapshot`] ? result[`${role}ChannelingSnapshot`].after : profile.channeling };
}

function counterProfile(defender, stance) {
  const heldWeapon = getCombatWeaponLoadout(defender).right;
  if (!heldWeapon) return null;
  const values = getCombatWeaponAttackValues(defender, heldWeapon);
  const weapon = values.weapon;
  const unavailable = (defender.droppedWeapons || []).some(item => item.weaponId === weapon.id
    || weapon.pairedWeaponIds?.includes(item.weaponId)
    || weapon.inventoryItemId && item.item?.id === weapon.inventoryItemId);
  if (unavailable) return null;
  const baseAction = { id: `weapon:${weapon.id}`, kind: 'weapon', name: weapon.name, weapon,
    attackModifier: values.attackModifier, damageModifier: values.damageModifier,
    baseWeaponFormula: heldWeapon.damageFormula, versatileWeaponFormula: heldWeapon.versatileDamageFormula,
    compatible: true, costs: [], auraBypass: { allowed: false }, resolutionMode: 'weapon-attack',
    criticalThreshold: 20, effects: weapon.effects || [], secondarySave: stance.counterAttack.secondarySave
      ? { ...stance.counterAttack.secondarySave, dc: stance.counterAttack.secondarySave.fixedDc || 13 } : null };
  const { action, weaponGrip } = resolveCombatWeaponGrip(baseAction, defender, defender.weaponGrip);
  return { ...defender, weapon: action.weapon, weaponGrip, activeWeaponId: weapon.id, selectedAction: action, profileActionId: action.id,
    profileActionKind: 'weapon', actionResolutionMode: 'weapon-attack', resourceCosts: [], actionCosts: [],
    attackModifier: action.attackModifier, damageModifier: action.damageModifier,
    equipmentPreparation: null, weaponUnavailable: false, forcedRollMode: 'advantage', paymentMode: 'standard' };
}

function mergeCounterResult(result, counter, originalActor) {
  const hpBefore = result.actorHitPointSnapshot?.before || { current: originalActor.currentHitPoints, maximum: originalActor.maximumHitPoints, temporary: originalActor.temporaryHitPoints || 0 };
  result.actorHitPointSnapshot = { before: hpBefore, after: { current: counter.targetSnapshot.hitPointsAfter,
    maximum: counter.targetSnapshot.maximumHitPoints, temporary: counter.targetSnapshot.temporaryHitPointsAfter } };
  if (counter.actorHitPointSnapshot) {
    result.targetSnapshot.hitPointsAfter = counter.actorHitPointSnapshot.after.current;
    result.targetSnapshot.temporaryHitPointsAfter = counter.actorHitPointSnapshot.after.temporary;
  }
  for (const [outer, inner] of [['actor', 'target'], ['target', 'actor']]) {
    for (const kind of ['Condition', 'Resource', 'Inventory', 'Concentration', 'Channeling']) {
      const snapshot = counter[`${inner}${kind}Snapshot`];
      if (!snapshot) continue;
      const key = `${outer}${kind}Snapshot`;
      result[key] = { ...snapshot, before: result[key]?.before ?? snapshot.before };
    }
  }
  // Counter rules have their own actor/target orientation and remain nested in their receipt.
  result.usedRuleFrequencyKeys = [...new Set([...(result.usedRuleFrequencyKeys || []), ...(counter.usedRuleFrequencyKeys || [])])];
  for (const kind of ['ruleResourceSnapshots', 'ruleAbilitySnapshots']) {
    result[kind] = [...(result[kind] || []), ...(counter[kind] || [])];
  }
  result.sceneItemEvents = [...(result.sceneItemEvents || []), ...(counter.sceneItemEvents || [])];
}

/** One prepaid stance, one response; resolve uses the ordinary combat pipeline without recursion. */
export async function attachPreparedCounter(result, actor, target, options, resolve) {
  if (options.counterAttack || !['weapon', 'technique'].includes(result.profileActionKind)
    || result.resolutionMode !== 'weapon-attack' || actor.characterId === target.characterId) return result;
  const missed = [result.attack, ...(result.followUpAttacks || []).map(entry => entry.attack)].some(attack => attack?.hit === false);
  if (!missed) return result;
  const targetAfter = afterProfile(target, result, 'target');
  const stance = targetAfter.temporaryConditions.find(condition => condition.active !== false && condition.counterAttack?.enabled);
  if (!stance) return result;
  const actorAfter = afterProfile(actor, result, 'actor');
  targetAfter.temporaryConditions = targetAfter.temporaryConditions.filter(condition => condition.id !== stance.id);
  targetAfter.conditions = targetAfter.conditions.filter(condition => condition.id !== stance.id);
  result.targetConditionSnapshot = { before: result.targetConditionSnapshot?.before || target.temporaryConditions || [], after: targetAfter.temporaryConditions };
  const counterActor = counterProfile(targetAfter, stance);
  let unavailable = !counterActor ? 'Keine geführte, verfügbare Waffe.' : '';
  if (counterActor && !validateCombatActorProfile(counterActor).ready) unavailable = 'Die Figur kann nicht mehr gegenangreifen.';
  if (actorAfter.currentHitPoints <= 0) unavailable = 'Das angreifende Ziel ist bereits kampfunfähig.';
  if (!unavailable) {
    try { consumeCombatAmmunition(counterActor.inventory, counterActor.weapon.ammunition); }
    catch (error) { unavailable = error.message; }
  }
  if (unavailable) { result.counterAttacks = [{ stance: stance.name, actorName: target.name, skipped: unavailable }]; return result; }
  const counter = await resolve(counterActor, actorAfter);
  mergeCounterResult(result, counter, actor);
  result.counterAttacks = [{ stance: stance.name, actorName: target.name, targetName: actor.name, resolution: compactCombatResolution(counter) }];
  return result;
}
