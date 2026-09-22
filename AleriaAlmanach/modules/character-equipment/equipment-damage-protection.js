// Flat armor protection belongs to each typed damage component, after affinities.
// This also handles spell/save damage and follow-up hits without attack-kind exceptions.
const text = (value, max = 160) => String(value ?? '').trim().slice(0, max);
export function equipmentDamageType(value) {
  const type = text(value).toLocaleLowerCase('de');
  return ({ slashing: 'hieb', piercing: 'stich', bludgeoning: 'wucht' })[type] || type;
}
export function normalizeEquipmentDamageProtection(value) {
  if (!value || typeof value !== 'object') return null;
  const amount = Math.max(0, Math.min(99, Math.trunc(Number(value.amount) || 0)));
  if (!amount) return null;
  const list = values => [...new Set((Array.isArray(values) ? values : []).map(equipmentDamageType).filter(Boolean))].slice(0, 20);
  return { amount, name: text(value.name || 'Rüstungsschutz'), damageTypes: list(value.damageTypes),
    excludedDamageTypes: list(value.excludedDamageTypes) };
}
export function describeEquipmentDamageProtection(value) {
  const protection = normalizeEquipmentDamageProtection(value);
  if (!protection) return '';
  const label = type => type.charAt(0).toLocaleUpperCase('de') + type.slice(1);
  const types = protection.damageTypes.length ? protection.damageTypes.map(label).join(' und ') : 'alle Schadensarten';
  const exceptions = protection.excludedDamageTypes.length ? ` außer ${protection.excludedDamageTypes.map(label).join(' und ')}` : '';
  return `${protection.amount} Schaden weniger gegen ${types}${exceptions}, je Schadensinstanz (mindestens 0). Wirkt nur bei angelegter Rüstung; kein RK-Bonus.`;
}
export function resolveEquipmentDamageProtection(profile = {}, damageType, amount = 0) {
  const type = equipmentDamageType(damageType || 'physisch');
  const sources = (profile.armorItems || []).filter(armor => armor.equipped === true).flatMap(armor => {
    const protection = normalizeEquipmentDamageProtection(armor.damageProtection);
    if (!protection || protection.excludedDamageTypes.includes(type)
      || (protection.damageTypes.length && !protection.damageTypes.includes(type))) return [];
    return [{ ...protection, armorId: armor.id, armorName: armor.name }];
  });
  // Multiple equipped pieces do not multiply the same passive armor protection.
  const reduction = Math.min(Math.max(0, Number(amount) || 0), Math.max(0, ...sources.map(source => source.amount)));
  return { reduction, sources: reduction > 0 ? sources.filter(source => source.amount === Math.max(...sources.map(row => row.amount))) : [] };
}
