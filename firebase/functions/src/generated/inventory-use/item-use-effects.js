import { resolveItemDefinition } from '../item-definitions/item-definition-resolver.js';
import { applyCombatResourceCosts } from '../combat/combat-state-model.js';

// Only published definition rules drive automatic item effects. A submitted
// comment can never supply healing, resource values or a new rule block.
export function applyDefinedItemEffects(profile, usage, resources, definitions) {
  const definition = resolveItemDefinition(usage.item, definitions);
  const hitPoints = { current: Number(profile.currentHitPoints ?? profile.hitPoints?.current ?? 0),
    maximum: Number(profile.maximumHitPoints ?? profile.hitPoints?.maximumOverride ?? profile.hitPoints?.maximum ?? 0),
    temporary: Number(profile.temporaryHitPoints ?? profile.hitPoints?.temporary ?? 0) };
  const before = { ...hitPoints }, effects = [];
  const costs = usage.operation === 'pickup' ? [] : definition?.useDefinition?.costs || [];
  const payment = applyCombatResourceCosts(resources, costs);
  if (!payment.sufficient) throw Error('Die Verwendungskosten dieses Gegenstands können nicht bezahlt werden.');
  if (costs.length) {
    resources.splice(0, resources.length, ...payment.after);
    effects.push(...payment.changes.map(change => ({ type: 'resource-cost', resourceId: change.resourceId || change.id, before: change.before, after: change.after })));
  }
  if (usage.operation !== 'pickup') for (const effect of definition?.useDefinition?.effects || []) {
    if (effect.type === 'healing') hitPoints.current = Math.min(hitPoints.maximum, hitPoints.current + effect.amount);
    if (effect.type === 'temporary-hit-points') hitPoints.temporary = Math.max(hitPoints.temporary, effect.amount);
    if (effect.type === 'restore-resource') {
      const resource = resources.find(value => value.id === effect.resourceId);
      if (!resource) continue;
      const current = Number(resource.current || 0);
      resource.current = Math.min(Number(resource.maximum || 0), current + effect.amount);
      if (current !== resource.current) effects.push({ type: effect.type, resourceId: effect.resourceId, before: current, after: resource.current });
    }
  }
  const hitPointsChanged = before.current !== hitPoints.current || before.temporary !== hitPoints.temporary;
  return { hitPoints, hitPointsChanged, effects, ...(hitPointsChanged ? { hitPointSnapshot: { before, after: hitPoints } } : {}) };
}
