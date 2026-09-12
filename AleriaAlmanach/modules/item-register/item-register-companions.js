// Field mapping shared by the transactional character and creature adapters.
export function companionIdentityFromItem(item) {
  return { name: item.name, portrait: item.image || '', notes: item.description || '' };
}
export function inventoryWithCreatureIdentity(character, creature) {
  const inventory = JSON.parse(JSON.stringify(character.inventory || {}));
  const origin = creature.itemOrigin;
  const item = (inventory.items || []).find(entry => entry.id === origin?.inventoryItemId && (entry.instanceId || entry.id) === origin.instanceId);
  if (!item || item.creatureId !== creature.id) throw new Error('Der Begleiter ist nicht mehr mit diesem Inventar verbunden.');
  Object.assign(item, { name: creature.name, image: creature.portrait || '', description: creature.notes || '',
    itemDbKey: '', itemStorageMode: 'character', individualizedAt: new Date().toISOString() });
  return inventory;
}
