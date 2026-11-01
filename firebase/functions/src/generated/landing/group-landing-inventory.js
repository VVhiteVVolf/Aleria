const text = value => String(value ?? '').trim();

export function normalizeGroupInventory(items = []) {
  const seen = new Set();
  return (Array.isArray(items) ? items : []).map(item => ({
    id: text(item?.id), sourceKey: text(item?.sourceKey), name: text(item?.name),
    image: text(item?.image), category: text(item?.category),
    quantity: Math.max(0, Math.min(1000000, Math.floor(Number(item?.quantity) || 0))),
    holderMemberId: text(item?.holderMemberId), location: text(item?.location), note: text(item?.note)
  })).filter(item => {
    if (!item.id || !item.name || seen.has(item.id)) return false;
    seen.add(item.id); return true;
  });
}

// Register references describe the group's stock. They never transfer a
// character's property or change a merchant's stock, prices or combat values.
export function addGroupInventoryItem(items, template, { id, quantity = 1, holderMemberId = '', location = '', note = '' }) {
  if (!template?.id || !template.title || template.section === 'owned' || template.archived) throw new Error('Bitte ein verfügbares Gut aus dem Handelsregister wählen.');
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 1000000) throw new Error('Die Menge muss eine ganze Zahl zwischen 1 und 1.000.000 sein.');
  const current = normalizeGroupInventory(items);
  if (!id || current.some(item => item.id === id)) throw new Error('Der Bestandseintrag braucht eine eindeutige Kennung.');
  return [...current, ...normalizeGroupInventory([{ id, sourceKey: template.id, name: template.title,
    image: template.image, category: template.category, quantity, holderMemberId, location, note }])];
}

export function updateGroupInventoryItem(items, id, patch) {
  const current = normalizeGroupInventory(items);
  if (!current.some(item => item.id === id)) throw new Error('Dieser Bestandseintrag ist nicht mehr vorhanden.');
  if (patch.quantity != null && (!Number.isSafeInteger(patch.quantity) || patch.quantity < 0 || patch.quantity > 1000000)) throw new Error('Bitte eine ganze Menge zwischen 0 und 1.000.000 angeben.');
  return normalizeGroupInventory(current.map(item => item.id === id ? { ...item, ...patch, id, sourceKey: item.sourceKey } : item));
}
