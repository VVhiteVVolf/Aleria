// Equipment access only. Keep the actual profile for damage, weapon-specific
// critical ranges and class variants; a family match never substitutes that ID.
const compatibleFamilies = Object.freeze({
  club: ['mace'], mace: ['club'], lance: ['rider-spear'], 'rider-spear': ['lance'],
  greatsword: ['sword'], shortsword: ['sword'], quarterstaff: ['staff'], 'magic-staff': ['staff'],
  maul: ['warhammer'], 'light-crossbow': ['crossbow'], 'heavy-crossbow': ['crossbow'], 'hand-crossbow': ['crossbow']
});

export function getCombatWeaponProfileFamilies(profileId = '', fallbackType = '') {
  const actual = String(profileId || fallbackType).trim().toLowerCase();
  return actual ? [actual, ...(compatibleFamilies[actual] || [])] : [];
}

export function isCombatWeaponProfileAllowed(allowedProfiles = [], profileId = '', fallbackType = '') {
  if (!allowedProfiles.length) return true;
  return getCombatWeaponProfileFamilies(profileId, fallbackType).some(id => allowedProfiles.includes(id));
}
