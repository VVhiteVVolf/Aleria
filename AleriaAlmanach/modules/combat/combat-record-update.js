export function applyCombatRecordUpdate(record, update) {
  const profile = record.combatProfile || {};
  const revision = Number(update.combatProfileRevision) || 0;
  const hasProfileUpdate = revision || update.hitPoints || update.equipment || update.progression
    || Array.isArray(update.resources) || Array.isArray(update.abilities);
  const useProfile = hasProfileUpdate && (!revision || revision >= (Number(profile.revision) || 0));
  const inventoryRevision = Number(update.inventory?.revision) || 0;
  const useInventory = update.inventory && (!inventoryRevision || inventoryRevision >= (Number(record.inventory?.revision) || 0));
  if (!useProfile && !useInventory) return record;

  return {
    ...record,
    ...(useInventory ? { inventory: update.inventory } : {}),
    ...(useProfile ? { combatProfile: {
      ...profile,
      ...(revision ? { revision } : {}),
      ...(update.progression ? { progression: update.progression } : {}),
      ...(update.equipment ? { weapons: update.equipment.weapons, armorItems: update.equipment.armorItems } : {}),
      ...(update.hitPoints ? { hitPoints: {
        ...profile.hitPoints,
        current: Math.max(0, Number(update.hitPoints.current) || 0),
        temporary: Math.max(0, Number(update.hitPoints.temporary) || 0)
      } } : {}),
      ...(Array.isArray(update.resources) ? { resources: update.resources } : {}),
      ...(Array.isArray(update.abilities) ? { abilities: update.abilities } : {})
    } } : {})
  };
}
