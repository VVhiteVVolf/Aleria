// RK from martial stances uses the strongest active stance. Other modifiers add normally.
export function isArmorStance(condition = {}) {
  return condition.armorStance === true || condition.stanceGroup === 'jungdrache-guard'
    || /Geschlossene Schuppe|Geschuppte Deckung/.test(condition.name || '')
    || /Drachentanz|Huskarl|Wyrmtanz/.test(condition.tags || '');
}
export function getArmorStanceExcess(conditions = []) {
  const bonuses = conditions.filter(c => c.active !== false && isArmorStance(c))
    .map(c => Math.max(0, Number(c.mechanics?.armorClass) || 0));
  return bonuses.reduce((a, b) => a + b, 0) - Math.max(0, ...bonuses);
}
export function getConditionArmorBonus(conditions = []) {
  return conditions.filter(c => c.active !== false).reduce((sum, c) => sum + Number(c.mechanics?.armorClass || 0), 0)
    - getArmorStanceExcess(conditions);
}
