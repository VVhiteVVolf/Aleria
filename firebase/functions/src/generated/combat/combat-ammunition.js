function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function quantity(item = {}) {
  const parsed = Number.parseInt(String(item.quantity ?? '1'), 10);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 1;
}

export function consumeCombatAmmunition(inventory = {}, ammunition = null) {
  const before = clone(inventory && typeof inventory === 'object' ? inventory : {});
  const required = ammunition?.required === true;
  const itemId = String(ammunition?.inventoryItemId || '');
  const amount = Math.max(1, Math.trunc(Number(ammunition?.amountPerUse) || 1));
  if (!required) return { changed: false, before, after: before, use: null };
  if (!itemId) throw new Error('Für diese Waffe wurde keine Munition aus dem Inventar verknüpft.');
  const after = clone(before);
  after.items = Array.isArray(after.items) ? after.items : [];
  const index = after.items.findIndex(item => String(item?.id || '') === itemId);
  if (index < 0) throw new Error('Die verknüpfte Munition ist nicht mehr im Inventar vorhanden.');
  const item = after.items[index];
  const beforeQuantity = quantity(item);
  if (beforeQuantity < amount) throw new Error(`Von ${item.name || 'der Munition'} sind nur noch ${beforeQuantity} vorhanden.`);
  const afterQuantity = beforeQuantity - amount;
  if (afterQuantity === 0) after.items.splice(index, 1);
  else after.items[index] = { ...item, quantity: String(afterQuantity) };
  return {
    changed: true,
    before,
    after,
    use: {
      inventoryItemId: itemId,
      name: String(item.name || 'Munition'),
      amount,
      before: beforeQuantity,
      after: afterQuantity,
      reloadAfter: Math.max(0, Math.trunc(Number(ammunition?.reloadAfter) || 0))
    }
  };
}

export const combatAmmunitionInternals = Object.freeze({ quantity });
