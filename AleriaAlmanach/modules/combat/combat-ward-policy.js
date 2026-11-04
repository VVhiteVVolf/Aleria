// Wards use a W20 rather than a percentile die. Keep the configured percentage
// separate from its effective threshold, including guaranteed rolls at 98/99 %.
export function getCombatWardDeflectionPolicy(value = 100) {
  const parsed = Number(value);
  const configuredChance = Number.isFinite(parsed) ? Math.max(0, Math.min(100, Math.trunc(parsed))) : 100;
  const threshold = configuredChance > 0 ? Math.max(1, Math.min(20, Math.round(configuredChance / 5))) : 0;
  return {
    configuredChance,
    threshold,
    effectiveChance: threshold * 5,
    requiresRoll: configuredChance > 0 && configuredChance < 100,
    automaticDeflection: configuredChance === 100
  };
}
