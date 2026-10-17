import { getCombatWeaponLoadout } from './combat-weapon-loadout.js';
import { getCombatWeaponAttackValues } from './combat-weapon-attack-values.js';
import { resolveCombatWeaponGrip } from './combat-weapon-grip.js';
import { combineDamageFormulas, parseDamageFormula } from './rules/combat-mvp-rules.js';

// Prepared counters and challenge responses use the same actual held weapon,
// training and full weapon damage, independently of their already paid cost.
export function resolvePreparedWeaponAttackProfile(profile, { weaponId = '', rollMode = 'normal', extraWeaponDice = 0, secondarySave = null } = {}) {
  const held = getCombatWeaponLoadout(profile).right;
  if (!held || (weaponId && held.id !== weaponId)) return null;
  const values = getCombatWeaponAttackValues(profile, held), weapon = values.weapon;
  if ((profile.droppedWeapons || []).some(drop => drop.weaponId === weapon.id || weapon.pairedWeaponIds?.includes(drop.weaponId)
    || weapon.inventoryItemId && drop.item?.id === weapon.inventoryItemId)) return null;
  const baseAction = { id: `weapon:${weapon.id}`, kind: 'weapon', name: weapon.name, weapon,
    attackModifier: values.attackModifier, damageModifier: values.damageModifier,
    baseWeaponFormula: held.damageFormula, versatileWeaponFormula: held.versatileDamageFormula,
    compatible: true, costs: [], auraBypass: { allowed: false }, resolutionMode: 'weapon-attack',
    criticalThreshold: 20, effects: weapon.effects || [], secondarySave };
  const { action: heldAction, weaponGrip } = resolveCombatWeaponGrip(baseAction, profile, profile.weaponGrip);
  const sides = parseDamageFormula(heldAction.weapon.damageFormula).terms?.[0]?.sides || parseDamageFormula(heldAction.weapon.damageFormula).sides;
  const formula = extraWeaponDice ? combineDamageFormulas([heldAction.weapon.damageFormula, `${extraWeaponDice}d${sides}`]) : heldAction.weapon.damageFormula;
  const action = { ...heldAction, weapon: { ...heldAction.weapon, damageFormula: formula } };
  return { ...profile, weapon: action.weapon, weaponGrip, activeWeaponId: weapon.id, selectedAction: action, profileActionId: action.id,
    profileActionKind: 'weapon', actionResolutionMode: 'weapon-attack', resourceCosts: [], actionCosts: [],
    attackModifier: action.attackModifier, damageModifier: action.damageModifier,
    equipmentPreparation: null, weaponUnavailable: false, forcedRollMode: rollMode, paymentMode: 'standard' };
}
