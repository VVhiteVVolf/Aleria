import assert from 'node:assert/strict';
import { STANDARD_ITEMS } from '../../../AleriaAlmanach/modules/item-register/item-register-standard.js';
import { sanitizeCharacterCombatProfile } from '../../../AleriaAlmanach/modules/combat/combat-profile-model.js';
import { synchronizeEquipmentFromCombat } from '../../../AleriaAlmanach/modules/character-equipment/character-equipment-sync.js';
import { withProtectedRecordRevisions } from '../src/mechanics/protected-record-revisions.js';

export const YLVA_SAEX = Object.freeze({
  characterId: 'bSYZYAEOwiRgy44f6OmO',
  templateId: 'standard:waffen-rustungen:saex',
  inventoryItemId: 'equipment-weapon-ylva-saex',
  weaponId: 'ylva-saex'
});

// One-time grant only. Runtime normalization must never recreate sold equipment.
export function planYlvaSaexGrant(character, { now = new Date().toISOString() } = {}) {
  assert.equal(character.id, YLVA_SAEX.characterId, 'Saex grant is scoped to Ylva');
  const items = character.inventory?.items;
  const weapons = character.combatProfile?.weapons;
  assert.ok(Array.isArray(items) && Array.isArray(weapons), 'Existing inventory and combat profile required');
  const existingItem = items.find(item => item.id === YLVA_SAEX.inventoryItemId);
  const existingWeapon = weapons.find(weapon => weapon.id === YLVA_SAEX.weaponId);
  if (existingItem || existingWeapon) {
    assert.equal(existingItem?.equipmentLink?.combatEntryId, YLVA_SAEX.weaponId, 'Incomplete Saex link');
    assert.equal(existingWeapon?.inventoryItemId, YLVA_SAEX.inventoryItemId, 'Incomplete Saex link');
    return null;
  }
  const template = STANDARD_ITEMS.find(item => item.id === YLVA_SAEX.templateId);
  assert.ok(template?.combatDefinition, 'Saex market definition missing');
  const weapon = sanitizeCharacterCombatProfile({ weapons: [{
    ...template.combatDefinition, id: YLVA_SAEX.weaponId, inventoryItemId: YLVA_SAEX.inventoryItemId,
    name: 'Wolfshorn-Saex', image: template.image, equipped: false
  }] }).weapons.find(weapon => weapon.id === YLVA_SAEX.weaponId);
  // Reuse the shared link builder on the new entry alone, preserving every
  // existing inventory item, weapon, resource and current loadout verbatim.
  const linked = synchronizeEquipmentFromCombat({ combatProfile: { weapons: [weapon] },
    characterId: character.id, characterName: character.name, now });
  const item = { ...linked.inventory.items[0],
    instanceId: YLVA_SAEX.inventoryItemId, templateId: template.id, originItemDbKey: template.id,
    templateName: template.title, registerCategory: template.category,
    type: template.type, weight: '0,8 kg', valuation: structuredClone(template.priceRange),
    description: 'Ylvas einschneidiges Langmesser mit dunklem, geschnitztem Holzgriff, goldenen Ranken entlang des Klingenrückens und einem kleinen Wolfsmotiv am Griffabschluss.' };
  return withProtectedRecordRevisions(character, {
    'inventory.items': [...structuredClone(items), item],
    'combatProfile.weapons': [...structuredClone(weapons), weapon]
  }, ['inventory', 'combatProfile'], Date.parse(now));
}
