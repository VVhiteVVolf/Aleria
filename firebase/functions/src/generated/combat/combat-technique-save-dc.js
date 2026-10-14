import { getAttributeModifier, getEffectiveCombatAttribute, getProficiencyBonus } from './combat-profile-model.js';

// Authored fixed difficulties keep their meaning, including historical counters.
export function resolveTechniqueSaveDc(save, profile, weapon = {}) {
  if (!save?.enabled) return null;
  if (save.fixedDc != null) return Number(save.fixedDc);
  const key = save.useWeaponAttribute ? weapon.attackAttribute || 'strength' : save.dcAttributeKey || 'strength';
  return Number(save.dcBase ?? 8) + getAttributeModifier(getEffectiveCombatAttribute(profile, key))
    + (save.addProficiency !== false ? getProficiencyBonus(profile) : 0);
}
