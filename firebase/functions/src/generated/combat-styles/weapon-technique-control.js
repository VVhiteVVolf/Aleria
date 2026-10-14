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
