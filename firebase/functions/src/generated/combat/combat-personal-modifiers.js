// Conditional training stays on the person, never on a transferable item.
export function personalWeaponAttribute(profile, weapon) {
  const trained = (profile.abilities || []).some(a => a.active !== false && a.activationType === 'passive'
    && a.mechanics?.dexterityWeaponTypes?.includes(weapon.weaponType));
  return trained ? 'dexterity' : weapon.attackAttribute;
}
export function conditionalWeaponModifier(profile, weapon, key) {
  return (profile.abilities || []).filter(a => a.active !== false && a.activationType === 'passive')
    .flatMap(a => a.mechanics?.weaponModifiers || [])
    .filter(m => m.weaponTypes.includes(weapon.weaponType))
    .reduce((sum, m) => sum + Number(m[key] || 0), 0);
}
export function conditionalSkillModifier(profile, skill) {
  return (profile.abilities || []).filter(a => a.active !== false && a.activationType === 'passive')
    .flatMap(a => a.mechanics?.skillModifiers || [])
    .filter(m => m.name.toLocaleLowerCase('de') === String(skill.name).toLocaleLowerCase('de'))
    .reduce((sum, m) => sum + m.bonus, 0);
}
export function conditionalSaveModifier(profile, context = {}) {
  const effects = context.effects || [];
  const names = [context.name, context.failureCondition?.name, ...effects.map(e => e.condition?.name)].join(' ').toLowerCase();
  const kinds = new Set(context.saveTags || []);
  if (/furcht|angst|furchtsam|verängstigt/.test(names)) kinds.add('fear');
  if (/gift|vergift/.test(names) || effects.some(e => /gift|poison/i.test(e.damageType || ''))) kinds.add('poison');
  if (/niederwerf|liegend|zu boden/.test(names)) kinds.add('prone');
  if (effects.some(e => e.type === 'move' && ['push', 'pull'].includes(e.movementKind))) kinds.add('forced-movement');
  const sources = [...(profile.abilities || []).filter(a => a.active !== false && a.activationType === 'passive'),
    ...(profile.armorItems || []).filter(a => a.equipped)];
  // One effect can both push and knock prone; the same passive applies once.
  return sources.reduce((total, source) => total + Math.max(0, ...(source.mechanics?.saveModifiers || [])
    .filter(m => kinds.has(m.kind)).map(m => Number(m.bonus) || 0)), 0);
}
