import { getCombatWeaponLoadout } from './combat-weapon-loadout.js';
import { parseDamageFormula, formatDamageFormula } from './rules/combat-mvp-rules.js';

export function requiresPairedCombatWeapons(technique = {}) {
  if (technique.requiresDualWield || technique.cultureTraining?.requiresDualWield
    || technique.cenyrTraining?.requiresDualWield || technique.followUpAttack?.alternateHands) return true;
  const profiles = Object.values(technique.cenyrTraining?.classWeaponProfiles || {}).flat();
  return profiles.length > 0 && profiles.every(id => /^dual-/.test(id));
}

export function hasPairedCombatTraining(profile = {}, right, left = right) {
  if (!right || !left) return false;
  const classId = profile.templateSelections?.classId || '';
  return (profile.techniques || []).some(technique => {
    if (technique.active === false || Number(technique.minimumLevel || 1) > Number(profile.progression?.level || 1)
      || !requiresPairedCombatWeapons(technique)) return false;
    const classes = technique.cultureTraining?.allowedClassIds || technique.cenyrTraining?.allowedClassIds || [];
    if (classes.length && !classes.includes(classId)) return false;
    const types = technique.weaponTypes || [];
    if (types.length && (!types.includes(right.weaponType) || !types.includes(left.weaponType))) return false;
    const ids = technique.compatibleWeaponIds || [];
    return !ids.length || ids.includes(right.id) || ids.includes(left.id);
  });
}

export function getPairedAttackWeapon(weapon = {}, profile = {}, technique = null) {
  if (weapon.pairedAttack) return weapon;
  const loadout = getCombatWeaponLoadout(profile);
  if (!loadout.dualWield || weapon.id !== loadout.rightWeaponId
    || technique?.followUpAttack?.enabled || technique?.requiresTwoHands || technique?.cenyrTraining?.requiresTwoHands
    || technique?.cultureTraining?.requiresTwoHands
    || !hasPairedCombatTraining(profile, loadout.right, loadout.left)) return weapon;
  // Joint attacks use both hands; training, flat damage and the leading
  // weapon's damage type apply once. Explicit attack sequences remain separate.
  const left = parseDamageFormula(loadout.left.damageFormula);
  const right = parseDamageFormula(weapon.damageFormula);
  return { ...weapon, versatileDamageFormula: '', pairedAttack: true,
    primaryDamageFormula: weapon.damageFormula,
    damageFormula: formatDamageFormula([...(right.terms || [right]), ...(left.terms || [left])], right.fixedModifier),
    pairedWeaponIds: [loadout.rightWeaponId, loadout.leftWeaponId] };
}
