function text(value) {
  return String(value || '').trim();
}

export function getActiveCombatWeapon(weapons = []) {
  const available = Array.isArray(weapons) ? weapons : [];
  return available.find(weapon => weapon?.equipped) || available[0] || null;
}

export function withEquippedCombatWeapon(character = {}, weaponId = '') {
  const requestedId = text(weaponId);
  const weapons = character?.combatProfile?.weapons;
  if (!requestedId || !Array.isArray(weapons) || !weapons.some(weapon => text(weapon?.id) === requestedId)) return character;
  const activeWeapon = getActiveCombatWeapon(weapons);
  if (text(activeWeapon?.id) === requestedId && activeWeapon?.equipped) return character;
  return {
    ...character,
    combatProfile: {
      ...character.combatProfile,
      weapons: weapons.map(weapon => ({
        ...weapon,
        equipped: text(weapon?.id) === requestedId
      }))
    }
  };
}

export function getReservedEquipmentSwitchWeaponId(actor = {}, paymentConfirmed = false) {
  if (!paymentConfirmed || actor?.selectedAction?.kind !== 'equipment-switch') return '';
  const requestedId = text(actor.selectedAction.equipmentSwitchTargetId);
  return requestedId && (Array.isArray(actor.weapons) ? actor.weapons : []).some(weapon => text(weapon?.id) === requestedId)
    ? requestedId
    : '';
}
