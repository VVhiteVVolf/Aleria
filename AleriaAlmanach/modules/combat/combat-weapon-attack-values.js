import { getWeaponAttackModifier, getWeaponDamageModifier } from './combat-profile-model.js';
import { getCenyrClassActionModifiers } from '../classes/cenyr/cenyr-class-combat-rules.js';
import { getPairedAttackWeapon } from './combat-paired-weapons.js';

// Ordinary attacks and prepaid counters share the same current weapon/training.
// Technique-specific bonuses deliberately belong to the technique resolver.
export function getCombatWeaponAttackValues(profile, weapon) {
  const modifiers = getCenyrClassActionModifiers(profile, { weapon });
  return {
    weapon: getPairedAttackWeapon(weapon, profile),
    attackModifier: getWeaponAttackModifier(profile, weapon) + modifiers.attackBonus,
    damageModifier: getWeaponDamageModifier(profile, weapon) + modifiers.damageBonus
  };
}
