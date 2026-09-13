import { getCombatWeaponLoadout, hasEquippedCombatShield } from './combat-weapon-loadout.js';

// Grip belongs to the declared attack. It neither equips/unequips a shield nor
// changes the character's persistent loadout or the source technique catalog.
export function resolveCombatWeaponGrip(action, profile = {}, requestedGrip = '') {
  const loadout = getCombatWeaponLoadout(profile);
  const supportsVersatileGrip = ['weapon', 'technique'].includes(action?.kind)
    && !loadout.dualWield && Boolean(action?.weapon?.versatileDamageFormula?.trim());
  const weaponGripBlockedReason = supportsVersatileGrip && hasEquippedCombatShield(profile)
    ? 'Zweihändige Führung benötigt eine freie zweite Hand. Lege zuerst den Schild ab.' : '';
  const weaponGrip = supportsVersatileGrip && String(requestedGrip).trim().toLowerCase() === 'two-handed'
    ? 'two-handed' : 'one-handed';
  if (!action) return { action, weaponGrip, supportsVersatileGrip, weaponGripBlockedReason };

  const weapon = { ...action.weapon, damageFormula: weaponGrip === 'two-handed'
    ? action.weapon.versatileDamageFormula : action.weapon?.damageFormula };
  return {
    weaponGrip, supportsVersatileGrip, weaponGripBlockedReason,
    action: {
      ...action,
      baseDamageFormula: action.weapon?.damageFormula || action.formula,
      weapon,
      formula: weapon.damageFormula || action.formula,
      attackModifier: Number(action.attackModifier || 0) - (weaponGrip === 'two-handed' ? 1 : 0),
      ...(weaponGrip === 'two-handed' && weaponGripBlockedReason
        ? { compatible: false, disabledReason: weaponGripBlockedReason } : {})
    }
  };
}
