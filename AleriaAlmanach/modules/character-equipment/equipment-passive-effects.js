// Passive item rules are projected from immutable definitions, never from prose.
const text = value => String(value || '').trim().slice(0, 180);
export function normalizeEquipmentPassiveEffects(values) {
  return (Array.isArray(values) ? values : []).slice(0, 20).flatMap(value => {
    if (value?.type !== 'damage-reduction' || value.magicScope !== 'magical') return [];
    const amount = Math.max(0, Math.min(99, Math.trunc(Number(value.amount) || 0)));
    if (!amount) return [];
    return [{ type: 'damage-reduction', magicScope: 'magical', amount,
      activation: value.activation === 'equipped' ? 'equipped' : 'carried',
      name: text(value.name || 'Gegenstandsschutz') }];
  });
}

export function projectEquipmentPassiveEffects(items = []) {
  return items.flatMap(item => {
    if (!(Number(item.quantity ?? 1) > 0)) return [];
    return normalizeEquipmentPassiveEffects(item.passiveEffects)
      .filter(effect => effect.activation !== 'equipped' || item.equipped === true)
      .map(effect => ({ ...effect, itemId: text(item.id), itemName: text(item.name || item.definitionTitle) }));
  });
}

export function sanitizeProjectedEquipmentPassiveEffects(values = []) {
  return (Array.isArray(values) ? values : []).slice(0, 100).flatMap(value =>
    normalizeEquipmentPassiveEffects([value]).map(effect => ({ ...effect,
      itemId: text(value.itemId), itemName: text(value.itemName) })));
}

export function getEquipmentPassiveDamageProtection(profile = {}, { magical = false } = {}) {
  if (magical !== true) return [];
  return sanitizeProjectedEquipmentPassiveEffects(profile.equipmentPassiveEffects)
    .map(effect => ({ amount: effect.amount, name: effect.name, itemId: effect.itemId, itemName: effect.itemName }));
}
