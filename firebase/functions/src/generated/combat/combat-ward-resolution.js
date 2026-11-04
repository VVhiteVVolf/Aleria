import { normalizeRuntimeCondition } from './combat-condition-duration.js?v=20260906-character-vitality-v1';
import { getCombatWardDeflectionPolicy } from './combat-ward-policy.js';

// Each weapon hit, including a follow-up, checks the remaining ward charges.
// Return fresh conditions so previews never mutate a character's stored state.
export async function resolveCombatWard({ attack, conditions = [], dice, actor, target, container = null, enabled = true }) {
  const remaining = conditions.map(normalizeRuntimeCondition);
  const unchanged = { attack, conditions: remaining, wardResolution: null };
  if (!enabled || !attack.hit) return unchanged;
  const index = remaining.findIndex(condition => condition.active !== false && condition.ward?.enabled && condition.ward.charges > 0);
  if (index < 0) return unchanged;
  const condition = remaining[index];
  const { charges, deflectChance, breaksOnCriticalHit } = condition.ward;
  if (attack.criticalSuccess && breaksOnCriticalHit) {
    remaining.splice(index, 1);
    return { attack, conditions: remaining, wardResolution: {
      conditionId: condition.id, conditionName: condition.name,
      deflected: false, shattered: true, chargesBefore: charges, chargesAfter: 0, roll: null
    } };
  }
  const policy = getCombatWardDeflectionPolicy(deflectChance);
  let deflected = policy.automaticDeflection;
  let roll = null;
  if (policy.requiresRoll && typeof dice.rollWardDeflection === 'function') {
    const threshold = policy.threshold;
    const result = await dice.rollWardDeflection({ threshold, actorName: actor.name, targetName: target.name, container });
    deflected = Number(result.natural) <= threshold;
    roll = { natural: Number(result.natural), threshold, rollId: result.id || '' };
  }
  const chargesAfter = Math.max(0, charges - Number(deflected));
  if (deflected) {
    if (chargesAfter === 0) remaining.splice(index, 1);
    else remaining[index] = { ...condition, ward: { ...condition.ward, charges: chargesAfter } };
  }
  return {
    attack: deflected ? { ...attack, hit: false, criticalSuccess: false } : attack,
    conditions: remaining,
    wardResolution: {
      conditionId: condition.id, conditionName: condition.name,
      deflected, shattered: false, chargesBefore: charges, chargesAfter, roll
    }
  };
}
