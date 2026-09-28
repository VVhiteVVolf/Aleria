import { EQUIPMENT_ARTWORK } from './equipment-artwork-catalog.js?v=20260928-equipment-art-v3';

// A read projection only: no changes to ownership, equipment rules or snapshots.
// Historical generic images are replaced; deliberate custom images take precedence.
const byCharacter = new Map();
// Only our versioned illustrations are globally identifiable. Generic external
// placeholders stay character-scoped because several owners used the same URL.
const publishedRevisions = new Map();
for (const artwork of EQUIPMENT_ARTWORK) {
  for (const image of artwork.legacyImages) {
    if (image.startsWith('/AleriaAlmanach/public/assets/character-equipment/')) {
      publishedRevisions.set(image, artwork.image);
    }
  }
  for (const binding of artwork.bindings) {
    if (!byCharacter.has(binding.characterId)) byCharacter.set(binding.characterId, new Map());
    const index = byCharacter.get(binding.characterId);
    for (const id of [...binding.itemIds, ...binding.combatEntryIds]) index.set(id, artwork);
  }
}

export function resolveEquipmentImage(item = {}, { characterId = '', combatEntryId = '', fallback = '' } = {}) {
  const candidates = [item.image, item.icon, fallback].map(value => String(value || '').trim())
    .filter(value => /^(?:https?:\/\/|data:image\/|\/(?!\/)|\.\.?\/|[\w-]+\/)/i.test(value) && !/[<>"']/.test(value))
    .map(value => publishedRevisions.get(value) || value);
  const current = candidates[0] || '';
  const index = byCharacter.get(characterId || item.ownerCharacterId);
  if (!index) return current;
  const ids = [item.id, item.inventoryItemId, item.equipmentLink?.combatEntryId, combatEntryId];
  const artwork = ids.map(id => index.get(id)).find(Boolean);
  if (!artwork) return current;
  return candidates.find(value => value !== artwork.image && !artwork.legacyImages.includes(value)) || artwork.image;
}

export function projectEquipmentArtwork(character = {}) {
  const context = { characterId: character.id };
  const project = item => ({ ...item, image: resolveEquipmentImage(item, context) });
  const inventoryItems = character.inventory?.items || [];
  const inventoryById = new Map(inventoryItems.map(item => [item.id, item]));
  const projectEntry = entry => {
    const item = inventoryById.get(entry.inventoryItemId)
      || inventoryItems.find(item => item.equipmentLink?.combatEntryId === entry.id);
    return { ...entry, image: resolveEquipmentImage(entry, {
      ...context, fallback: item?.image || item?.icon
    }) };
  };
  return {
    ...character,
    ...(character.inventory ? { inventory: { ...character.inventory, items: (character.inventory.items || []).map(project) } } : {}),
    ...(character.combatProfile ? { combatProfile: {
      ...character.combatProfile,
      weapons: (character.combatProfile.weapons || []).map(projectEntry),
      armorItems: (character.combatProfile.armorItems || []).map(projectEntry)
    } } : {})
  };
}
