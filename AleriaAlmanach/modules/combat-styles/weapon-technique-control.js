// Canonical martial control: weapon training sets difficulty, the target's
// authored attribute still determines its saving throw. No attack/item bonuses.
export function createWeaponTechniqueSave(failureCondition, { attributeKey = 'strength', strong = false } = {}) {
  return { enabled: true, attributeKey, dcBase: strong ? 11 : 10,
    useWeaponAttribute: true, addProficiency: true, failureCondition };
}

export function reviseWeaponTechniqueSave(save, strong = false) {
  if (!save?.enabled || save.fixedDc != null) return save;
  return { ...save, dcBase: strong ? 11 : 10, useWeaponAttribute: true, addProficiency: true };
}

export function describeWeaponTechniqueSave(save) {
  if (!save?.enabled) return '—';
  const attributes = { strength: 'KRF', dexterity: 'GES', constitution: 'KON', intelligence: 'INT', wisdom: 'WEI', charisma: 'CHA' };
  const targetAttribute = attributes[save.attributeKey] || save.attributeKey;
  if (save.fixedDc != null) return `${targetAttribute} SG ${save.fixedDc}`;
  return `${targetAttribute} SG ${save.dcBase ?? 8} + ${save.useWeaponAttribute ? 'Waffenattribut' : attributes[save.dcAttributeKey || 'strength']}${save.addProficiency !== false ? ' + Kompetenz' : ''}`;
}
