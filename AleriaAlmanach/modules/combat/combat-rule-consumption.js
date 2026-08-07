import { applyCombatResourceCosts } from './combat-state-model.js?v=20260807-freya-v1';

export function consumeCombatRuleResources(applications = [], sources = [], options = {}) {
  const relevant = (Array.isArray(applications) ? applications : [])
    .filter(application => application.activation === 'reaction' && Array.isArray(application.costs) && application.costs.length);
  const stateByActor = new Map();
  const snapshots = [];
  relevant.forEach(application => {
    const source = sources.find(item => String(item.actorId) === String(application.sourceActorId));
    if (!source) throw new Error(`Die Regelquelle ${application.sourceActorName || application.sourceActorId} ist nicht verfügbar.`);
    const actorId = String(source.actorId || '');
    const supplied = options.resourcesByActor instanceof Map ? options.resourcesByActor.get(actorId) : null;
    const initial = stateByActor.get(actorId)
      || supplied
      || (actorId === String(options.actorId || '') && options.actorResourcesAfter)
      || source.profile?.resources
      || [];
    const payment = applyCombatResourceCosts(initial, application.costs);
    if (!payment.sufficient) {
      throw new Error(`${application.sourceActorName || 'Die Regelquelle'} hat nicht genug ${payment.missing?.name || 'Ressourcen'} für ${application.ruleName}.`);
    }
    stateByActor.set(actorId, payment.after);
    snapshots.push({
      sourceActorId: actorId,
      sourceActorName: application.sourceActorName,
      applicationKey: application.applicationKey,
      ruleName: application.ruleName,
      before: payment.before,
      after: payment.after,
      changes: payment.changes
    });
  });
  return snapshots;
}

export function getCombatRuleAbilityUseRequests(applications = []) {
  const seen = new Set();
  return (Array.isArray(applications) ? applications : []).flatMap(application => {
    if (!application?.consumesAbilityUse || application.entryKind !== 'ability') return [];
    const key = `${application.sourceActorId}:${application.entryId}:${application.applicationKey}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{
      sourceActorId: String(application.sourceActorId || ''),
      abilityId: String(application.entryId || ''),
      applicationKey: String(application.applicationKey || ''),
      ruleName: String(application.ruleName || application.entryName || 'Reaktion')
    }];
  });
}
