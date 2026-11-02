// Resolve score effects without changing stored base attributes.
const naturalModifier = score => Math.floor((score - 10) / 2);
export function resolveCombatAttributeEffects(attribute, sources = []) {
  const key = attribute.key;
  const bonus = sources.reduce((total, source) => total + (key === 'strength' ? Number(source.strength) || 0 : 0)
    + (source.attributeModifiers || []).filter(entry => entry.attributeKey === key).reduce((sum, entry) => sum + entry.bonus, 0), 0);
  const caps = sources.flatMap(source => source.attributeCaps || []).filter(entry => entry.attributeKey === key).map(entry => entry.maximum);
  const maximum = caps.length ? Math.min(...caps) : null;
  const score = Math.min(attribute.score + bonus, maximum ?? Infinity);
  let modifierOverride = attribute.modifierOverride == null ? null
    : attribute.modifierOverride + naturalModifier(score) - naturalModifier(attribute.score);
  // A free override cannot bypass an explicit ceiling on this attribute.
  if (maximum != null && modifierOverride != null) modifierOverride = Math.min(modifierOverride, naturalModifier(maximum));
  return { ...attribute, score, modifierOverride, ...(maximum == null ? {} : { effectiveMaximum: maximum }) };
}
export function describeCombatAttributeValue(base, effective) {
  return effective.score !== base.score || effective.effectiveMaximum != null || effective.modifierOverride !== base.modifierOverride
    ? `Wirksam ${effective.score}${effective.effectiveMaximum == null ? '' : ` · Obergrenze ${effective.effectiveMaximum}`}` : '';
}
