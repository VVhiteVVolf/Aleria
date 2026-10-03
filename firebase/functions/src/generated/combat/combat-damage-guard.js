// A prepared guard absorbs one damaging hit, independently of armor and wards.
export function consumeDamageGuard(conditions = [], incoming = 0, { reductionBypass = 0 } = {}) {
  const guard = conditions.find(condition => condition.active !== false && condition.damageGuard?.charges > 0);
  if (!guard || incoming <= 0) return { conditions, reduction: 0, guard: null };
  const capacity = Math.max(0, Number(guard.damageGuard.reduction) || 0);
  const bypassedReduction = Math.min(capacity, Math.max(0, Number(reductionBypass) || 0));
  const reduction = Math.min(incoming, capacity - bypassedReduction);
  const remaining = conditions.flatMap(condition => condition !== guard ? [condition] : guard.damageGuard.charges > 1
    ? [{ ...guard, damageGuard: { ...guard.damageGuard, charges: guard.damageGuard.charges - 1 } }] : []);
  return { conditions: remaining, reduction, ...(bypassedReduction ? { bypassedReduction } : {}),
    guard: { name: guard.name, conditionId: guard.id, reduction } };
}
