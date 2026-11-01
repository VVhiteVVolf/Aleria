// Project only actual inventory links. Unbound animal placeholders are not actors.
export function appendGroupCompanions(members, characters = [], creatures = []) {
  const result = [...members];
  const known = new Set(result.filter(member => member.kind === 'creature').map(member => member.creatureId));
  for (const owner of members.filter(member => member.kind !== 'creature' && member.characterId)) {
    const character = characters.find(record => record.id === owner.characterId);
    const links = [...(character?.inventory?.items || []), ...(character?.inventory?.companions || [])];
    for (const link of links) {
      if (!link.creatureId || known.has(link.creatureId)) continue;
      const creature = creatures.find(record => record.id === link.creatureId);
      if (!creature || !Number.isFinite(Number(link.quantity ?? 1)) || Number(link.quantity ?? 1) <= 0) continue;
      if (creature?.itemOrigin?.ownerCharacterId && creature.itemOrigin.ownerCharacterId !== owner.characterId) continue;
      if (creature?.itemOrigin?.disposition && creature.itemOrigin.disposition !== 'owned') continue;
      const itemId = link.inventoryItemId || link.id;
      const possession = (character.inventory?.items || []).find(item => item.id === itemId) || link;
      if (!Number.isFinite(Number(possession.quantity ?? 1)) || Number(possession.quantity ?? 1) <= 0) continue;
      if (creature.itemOrigin?.inventoryItemId && creature.itemOrigin.inventoryItemId !== itemId) continue;
      if (creature.itemOrigin?.instanceId && creature.itemOrigin.instanceId !== (possession.instanceId || possession.id)) continue;
      result.push({ id: `companion:${link.creatureId}`, kind: 'creature', creatureId: link.creatureId, characterId: '',
        name: creature?.name || link.name || 'Tierbegleiter', portrait: creature?.portrait || link.image || '',
        role: creature?.species || link.species || 'Tierbegleiter', source: 'companion', treeLabel: 'Tierbegleiter',
        ownerCharacterId: owner.characterId, ownerName: owner.name, assignment: owner.assignment,
        status: 'auto', note: `Begleitet ${owner.name}`, badgeIcon: '' });
      known.add(link.creatureId);
    }
  }
  return result;
}
