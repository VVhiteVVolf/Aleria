import { isDeepStrictEqual } from 'node:util';

// A handoff owns only the entries bound to the moved possession. Preserve all
// other saved loadout choices, HP, resources and personal profile fields.
export function transferredEquipmentProfile(original, reconciled, inventoryItemId, { preserveExisting = false } = {}) {
  if (!inventoryItemId) return null;
  const next = { ...(original || {}) };
  let changed = false;
  for (const collection of ['weapons', 'armorItems']) {
    const before = original?.[collection] || [];
    const transferred = (reconciled?.[collection] || []).filter(entry => entry.inventoryItemId === inventoryItemId);
    let index = 0;
    const entries = before.flatMap(entry => {
      if (entry.inventoryItemId !== inventoryItemId) return [entry];
      if (index >= transferred.length) return [];
      const replacement = transferred[index++];
      return [preserveExisting ? entry : replacement];
    });
    entries.push(...transferred.slice(index));
    if (isDeepStrictEqual(before, entries)) continue;
    next[collection] = entries;
    changed = true;
  }
  return changed ? next : null;
}
