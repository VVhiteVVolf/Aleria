// Classify the effective attack, not the owner's other held weapons. Authored
// throwing techniques may override a normally melee weapon explicitly.
export function getCombatAttackRange(profile = {}) {
  const weapon = profile.weapon || {};
  if (['melee', 'ranged'].includes(weapon.attackRange)) return weapon.attackRange;
  const range = String(weapon.range || '').trim();
  if (/^(?:fernkampf|wurf|ranged|thrown)\b/i.test(range)) return 'ranged';
  // Legacy bows may carry the general editor default "Nahkampf". Their weapon
  // type still describes a shot; an authored melee technique can override it.
  if (['bow', 'crossbow', 'firearm'].includes(weapon.weaponType)) return 'ranged';
  if (/^(?:nahkampf|berührung|melee)\b/i.test(range)) return 'melee';
  return 'melee';
}
