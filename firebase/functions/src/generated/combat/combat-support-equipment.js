// Shared inventory-backed choices; never turn an arbitrary companion into a mount.
export function getCombatMounts(character = {}) {
  const inventory = character.inventory || {};
  const items = inventory.items || [];
  const candidates = [...(inventory.companions || []), ...items];
  const seen = new Set();
  return candidates.flatMap(entry => {
    const item = items.find(item => item.id === entry.inventoryItemId) || entry;
    const id = String(item.id || entry.id || '');
    const reference = String(entry.creatureId || item.creatureId || id);
    const mount = ['horse', 'mount'].includes(item.category) || item.registerCategory === 'pferde'
      || /reittier|reitpferd|kriegspferd|streitross|\bross\b|\bhest\b/i.test(`${entry.role || ''} ${entry.species || ''} ${item.type || ''}`);
    if (!id || !mount || seen.has(reference) || Number(item.quantity ?? 1) <= 0
      || /tot|verstorben|bewusstlos|nicht verfügbar/i.test(entry.status || item.status || '')) return [];
    seen.add(reference);
    return [{ id, name: entry.name || item.name || 'Reittier', image: entry.image || item.image || '',
      creatureId: entry.creatureId || item.creatureId || '' }];
  });
}

export function canCarryCombatShield(weapon = {}) {
  return !['bow', 'crossbow', 'firearm', 'polearm'].includes(weapon.weaponType)
    && !(!weapon.versatileDamageFormula && /zweihändig|zweihänder|großaxt|lange.*streitaxt/i.test(`${weapon.name || ''} ${weapon.properties || ''}`));
}

export function getCombatSupportEquipment(profile = {}) {
  const right = (profile.weapons || []).find(weapon => weapon.equipped) || profile.weapons?.[0];
  const shield = profile.combat?.offHandWeaponId || !canCarryCombatShield(right) ? null
    : (profile.armorItems || []).find(item => item.kind === 'shield'
      && (profile.combat?.shieldId != null ? item.id === profile.combat.shieldId : item.equipped));
  return { shieldId: shield?.id || '', mountId: profile.combat?.mounted ? String(profile.combat?.mountId || '') : '' };
}

export function getDismountSnapshot(profile) {
  if (!profile.combat?.mounted) return null;
  const before = getCombatSupportEquipment(profile);
  return { before, after: { ...before, mountId: '' } };
}

export function withCombatSupportEquipment(character, selection = {}) {
  const profile = character.combatProfile || {};
  const combat = { ...profile.combat };
  if (selection.shieldId != null) combat.shieldId = String(selection.shieldId);
  if (selection.mountId != null) {
    combat.mountId = String(selection.mountId);
    combat.mounted = !!combat.mountId && getCombatMounts(character).some(mount => mount.id === combat.mountId);
  }
  return { ...character, combatProfile: { ...profile, combat,
    armorItems: (profile.armorItems || []).map(item => item.kind === 'shield' && selection.shieldId != null
      ? { ...item, equipped: item.id === selection.shieldId } : item) } };
}

// Voluntary changes and forced dismounts use the scene's loadout. The
// inventory continues to own the animal and the sheet keeps its starting kit.
export function applyDismountSnapshots(states, resolution, actorsWithPosts) {
  for (const role of ['target', 'actor']) {
    const after = resolution[`${role}SupportEquipmentSnapshot`]?.after;
    if (after?.mountId !== '') continue;
    const id = String(resolution[`${role}Id`]);
    if (states) states.set(id, { ...states.get(id), supportEquipment: { ...after } });
    actorsWithPosts?.add(id);
  }
}
