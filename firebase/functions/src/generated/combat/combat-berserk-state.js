// Mutable state belongs to the condition instance, never the permanent sheet.
export function hasActiveBerserk(conditions = []) {
  return conditions.some(condition => condition.active !== false && condition.berserk);
}

export function markBerserkActivity(conditions = []) {
  return conditions.map(condition => condition.active !== false && condition.berserk
    ? { ...condition, berserk: { ...condition.berserk, activity: true } } : condition);
}

export function applyBerserkSurvival(applied, conditions = []) {
  const next = applied.incoming > 0 ? markBerserkActivity(conditions) : [...conditions];
  const index = next.findIndex(condition => condition.active !== false && Number(condition.berserk?.survivalCharges) > 0);
  if (index < 0 || applied.before.current <= 0 || applied.after.current > 0 || applied.incoming <= 0) {
    return { ...applied, conditions: next };
  }
  const condition = next[index];
  next[index] = { ...condition, berserk: { ...condition.berserk, survivalCharges: 0 } };
  return { ...applied, after: { ...applied.after, current: 1 }, defeated: false,
    hitPointDamage: Math.max(0, applied.before.current - 1), conditions: next,
    survival: { conditionId: condition.id, name: 'Ungebrochener Berserker', remaining: 0, hitPoints: 1 } };
}

export function advanceBerserkForComment(condition, isOwnComment) {
  if (!condition.berserk || !isOwnComment) return { condition, expired: false };
  return { condition: { ...condition, berserk: { ...condition.berserk, activity: false } },
    expired: condition.berserk.activity !== true, reason: 'inactive-actor-comment' };
}
