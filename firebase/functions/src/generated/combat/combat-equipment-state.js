import { withCombatSupportEquipment } from './combat-support-equipment.js';

export const DEFAULT_MELEE_WEAPON = Object.freeze({
  id: 'default-unarmed-melee',
  name: 'Nahkampf',
  weaponType: 'unarmed',
  training: 'simple',
  damageFormula: '1d4',
  damageType: 'Wucht',
  attackAttribute: 'strength',
  proficient: true,
  range: 'Nahkampf',
  properties: 'Schlicht · simpel · immer verfügbar',
  notes: 'Grundlegender waffenloser Nahkampfangriff.',
  equipped: true
});

function text(value) {
  return String(value || '').trim();
}

export function getActiveCombatWeapon(weapons = []) {
  const available = Array.isArray(weapons) ? weapons : [];
  return available.find(weapon => weapon?.equipped) || available[0] || null;
}

export function withEquippedCombatWeapon(character = {}, weaponId = '', offHandWeaponId, supportEquipment) {
  if (supportEquipment) character = withCombatSupportEquipment(character, supportEquipment);
  const requestedId = text(weaponId);
  if (!requestedId) return character;
  const storedWeapons = character.combatProfile?.weapons;
  let weapons = Array.isArray(storedWeapons) ? storedWeapons : [];
  if (!weapons.some(weapon => text(weapon?.id) === requestedId)) {
    if (requestedId !== DEFAULT_MELEE_WEAPON.id) return character;
    weapons = [...weapons, { ...DEFAULT_MELEE_WEAPON, equipped: false }];
  }
  const activeWeapon = getActiveCombatWeapon(weapons);
  if (text(activeWeapon?.id) === requestedId && activeWeapon?.equipped
      && (offHandWeaponId === undefined || character.combatProfile.combat?.offHandWeaponId === offHandWeaponId)) return character;
  return {
    ...character,
    combatProfile: {
      ...character.combatProfile,
      ...(offHandWeaponId !== undefined ? { combat: { ...character.combatProfile?.combat, offHandWeaponId: text(offHandWeaponId) } } : {}),
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
