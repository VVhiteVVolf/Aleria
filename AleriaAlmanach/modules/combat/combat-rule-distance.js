// The scene can omit a distance. Zero is a measured distance and includes the
// boundary of a radius. Only the supplying participant knows a support distance.
export function normalizeCombatDistance(value) {
  if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) return null;
  const meters = Number(value);
  return Number.isFinite(meters) && meters >= 0 ? Math.min(9999, meters) : null;
}

export function getCombatRuleDistance(source, ruleId, recipient, qualifiedId) {
  if (source.sourceRole === 'support') {
    const selection = (qualifiedId && source.ruleSelections?.find(entry => entry.ruleId === qualifiedId))
      || source.ruleSelections?.find(entry => entry.ruleId === ruleId);
    if (selection) return normalizeCombatDistance(selection.distanceMeters);
  }
  return normalizeCombatDistance(recipient === 'actor' ? source.distanceToActor : source.distanceToTarget);
}
