// Scene ownership and pickup events determine availability; an equipped flag
// in the character sheet alone does not put a disarmed weapon back in hand.
export function getDroppedCombatWeapon(profile = {}, weapon = {}) {
  return (profile.droppedWeapons || []).find(drop => drop.weaponId === weapon.id
    || weapon.pairedWeaponIds?.includes(drop.weaponId)
    || (weapon.inventoryItemId && drop.item?.id === weapon.inventoryItemId)) || null;
}

export function withCombatActionWeaponAvailability(profile = {}, action = {}) {
  const weapon = action.kind === 'equipment-switch'
    ? (profile.weapons || []).find(weapon => weapon.id === action.equipmentSwitchTargetId)
    : ['weapon', 'technique'].includes(action.kind) ? action.weapon || profile.weapon : null;
  return weapon && getDroppedCombatWeapon(profile, weapon)
    ? { ...action, compatible: false, disabledReason: 'Entwaffnet · liegt am Boden. Zuerst über Interagieren aufheben.' }
    : action;
}
