import { getAttributeModifier, getEffectiveCombatAttribute } from './combat-profile-model.js?v=20260906-effect-rolls-v1';
import { getRegenerationTrait, isBurning } from './combat-creature-traits.js';

// A comment-scoped charge provides the existing replay/undo machinery with an
// explicit once-per-post clock. Resolving a second target never starts a turn.
export async function prepareCombatTurnStart(actor, dice, options = {}) {
  const trait = getRegenerationTrait(actor);
  const resource = actor.resources?.find(item => item.id === trait?.regeneration.resourceId);
  if (options.skipResourceCosts || !trait || !(resource?.current > 0) || !(actor.currentHitPoints > 0)) {
    return { actor, turnStart: null };
  }
  const before = { current: actor.currentHitPoints, maximum: actor.maximumHitPoints, temporary: actor.temporaryHitPoints || 0 };
  const suppressed = trait.regeneration.blockedByBurning && isBurning(actor.conditions || []);
  const bonus = getAttributeModifier(getEffectiveCombatAttribute(actor, 'constitution')) * trait.regeneration.constitutionMultiplier;
  const roll = !suppressed && before.current < before.maximum
    ? await dice.rollDamage({ damageFormula: `1d${actor.hitPoints?.hitDie || 8}`, bonus, critical: false }) : null;
  const restored = roll ? Math.min(before.maximum - before.current, Math.max(0, Number(roll.total) || 0)) : 0;
  const after = { ...before, current: before.current + restored };
  return {
    actor: { ...actor, currentHitPoints: after.current,
      resources: actor.resources.map(item => item.id === resource.id ? { ...item, current: item.current - 1 } : item) },
    turnStart: { name: trait.name, suppressed, restored, roll, before, after, resourceId: resource.id }
  };
}

export function attachCombatTurnStart(resolution, originalActor, turnStart) {
  if (!turnStart) return resolution;
  const selfTarget = resolution.actorId === resolution.targetId;
  const after = resolution.actorHitPointSnapshot?.after || (selfTarget && resolution.targetSnapshot ? {
    current: resolution.targetSnapshot.hitPointsAfter, maximum: originalActor.maximumHitPoints,
    temporary: resolution.targetSnapshot.temporaryHitPointsAfter || 0
  } : turnStart.after);
  const resourcesAfter = resolution.actorResourceSnapshot?.after || originalActor.resources.map(resource =>
    resource.id === turnStart.resourceId ? { ...resource, current: resource.current - 1 } : resource);
  return { ...resolution, turnStart,
    actorHitPointSnapshot: { before: turnStart.before, after },
    actorResourceSnapshot: { ...resolution.actorResourceSnapshot, before: originalActor.resources, after: resourcesAfter }
  };
}
