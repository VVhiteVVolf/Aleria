// Stored conditions and scene-owned effects have separate lifetimes and limits.
// A combined display list must not make runtime effects consume storage slots.
export function getCombatStoredConditions(profile = {}) {
  const runtime = Array.isArray(profile.temporaryConditions) ? profile.temporaryConditions : [];
  const references = new Set(runtime);
  const ids = new Set(runtime.map(condition => condition?.id).filter(Boolean));
  return (Array.isArray(profile.conditions) ? profile.conditions : [])
    .filter(condition => !references.has(condition) && !(condition?.id && ids.has(condition.id)));
}

export function projectCombatRuntimeConditions(profile, normalizeStored, normalizeCondition) {
  if (!Array.isArray(profile.temporaryConditions)) return normalizeStored(profile);
  const normalized = normalizeStored({ ...profile, conditions: getCombatStoredConditions(profile) });
  const temporaryConditions = profile.temporaryConditions
    .filter(condition => condition && typeof condition === 'object' && !Array.isArray(condition))
    .map((condition, index) => ({ ...condition, ...normalizeCondition(condition, index) }));
  return { ...normalized, conditions: [...normalized.conditions, ...temporaryConditions], temporaryConditions };
}
