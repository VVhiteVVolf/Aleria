// Persisted, bounded editorial balance ledger. Points never gate a purchase.
export const DEVELOPMENT_VERSION = 1;
const integer = (value, fallback, min, max) => Number.isFinite(Number(value)) && value !== '' && value != null
  ? Math.max(min, Math.min(max, Math.trunc(Number(value)))) : fallback;
export function normalizeDevelopment(value = {}) {
  value=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  return {
    version: DEVELOPMENT_VERSION, mode: 'purchase',
    startingPoints: integer(value.startingPoints, 3, -9999, 9999),
    pointsPerLevel: integer(value.pointsPerLevel, 3, 0, 999),
    ownClassCost: integer(value.ownClassCost, 2, 0, 999),
    foreignMultiplier: integer(value.foreignMultiplier, 2, 1, 20),
    levelSurcharge: integer(value.levelSurcharge, 1, 0, 99),
    adjustment: integer(value.adjustment, 0, -99999, 99999),
    purchases: [...new Map((Array.isArray(value.purchases) ? value.purchases : []).slice(0, 256)
      .filter(p => p?.techniqueId && p?.classId).map(p => [String(p.techniqueId), {
        techniqueId: String(p.techniqueId).slice(0, 180), classId: String(p.classId).slice(0, 100),
        cost: integer(p.cost, 0, 0, 99999), level: integer(p.level, 1, 1, 30)
      }])).values()]
  };
}
export function isPurchaseDevelopment(profile) { return profile?.progression?.development?.mode === 'purchase'; }
export function getDevelopmentBalance(profile) {
  const state = normalizeDevelopment(profile.progression?.development);
  const level = (profile.progression?.level || 1) + (profile.progression?.specialLevels || 0);
  const earned = state.startingPoints + Math.max(0, level - 1) * state.pointsPerLevel + state.adjustment;
  const spent = state.purchases.reduce((sum, p) => sum + p.cost, 0);
  return { earned, spent, remaining: earned - spent };
}
