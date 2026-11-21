import { applyCombatResourceCosts } from './combat-state-model.js?v=20260928-equipment-art-v4';
import { applyCombatAbilityUse } from './combat-ability-uses.js?v=20260803-action-economy-v1';

// A selected reaction is optional on each trigger. Reserve its costs before
// it changes a roll, and keep the ordinary resource receipts for replay.
export function createCombatReactionBudget(sources, { actorId, actorResources, actorAbilities, dayKey } = {}) {
  const profiles = new Map(sources.map(source => [String(source.actorId), source.profile]));
  function withBalances(resources, abilities, reservations) {
    return {
      tryReserve(application) {
        if (application.activation !== 'reaction') return true;
        const id = String(application.sourceActorId);
        const profile = profiles.get(id);
        const costs = (reservations.get(id) || []).concat(application.costs || []);
        if (costs.length && !applyCombatResourceCosts(resources.get(id) || profile?.resources, costs).sufficient) return false;
        if (application.consumesAbilityUse) {
          const use = applyCombatAbilityUse(abilities.get(id) || profile?.abilities, `ability:${application.entryId}`, dayKey);
          if (!use.sufficient) return false;
          if (use.changed) abilities.set(id, use.abilities);
        }
        if (costs.length) reservations.set(id, costs);
        return true;
      },
      getReservedAmount(id, resourceId) {
        return (reservations.get(String(id)) || []).reduce((total, cost) =>
          total + (cost.resourceId === resourceId ? cost.amount : 0), 0);
      },
      updateResources(id, current) { resources.set(String(id), current); },
      fork() { return withBalances(new Map(resources), new Map(abilities), new Map(reservations)); }
    };
  }
  return withBalances(new Map([[String(actorId), actorResources]]), new Map([[String(actorId), actorAbilities]]), new Map());
}

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

export function getCombatRuleAbilityUseRequests(applications = [], { perTrigger = false } = {}) {
  const seen = new Set();
  return (Array.isArray(applications) ? applications : []).flatMap(application => {
    if (!application?.consumesAbilityUse || application.entryKind !== 'ability') return [];
    const key = `${application.sourceActorId}:${application.entryId}:${application.applicationKey}`;
    if (!perTrigger && seen.has(key)) return [];
    seen.add(key);
    return [{
      sourceActorId: String(application.sourceActorId || ''),
      sourceActorName: String(application.sourceActorName || ''),
      abilityId: String(application.entryId || ''),
      applicationKey: String(application.applicationKey || ''),
      ruleName: String(application.ruleName || application.entryName || 'Reaktion')
    }];
  });
}

export function consumeCombatRuleAbilityUses(applications, sources, { dayKey = '', states, perTrigger, onError } = {}) {
  const abilitiesByActor = new Map();
  const reject = onError || (message => { throw new Error(message); });
  return getCombatRuleAbilityUseRequests(applications, { perTrigger }).flatMap(request => {
    const source = sources.find(entry => String(entry.actorId) === request.sourceActorId);
    if (!source) return reject('Die Fähigkeitsquelle einer Reaktion fehlt.');
    const abilities = abilitiesByActor.get(request.sourceActorId) ?? states?.get(request.sourceActorId)?.abilities ?? source.profile.abilities;
    const use = applyCombatAbilityUse(abilities, `ability:${request.abilityId}`, dayKey);
    if (!use.sufficient) return reject(`${use.missing?.name || request.ruleName} hat keine Nutzung mehr übrig.`);
    if (!use.changed) return [];
    abilitiesByActor.set(request.sourceActorId, use.abilities);
    return [{ sourceActorId: request.sourceActorId, sourceActorName: request.sourceActorName,
      applicationKey: request.applicationKey, before: use.beforeAbilities, after: use.abilities, change: use.use }];
  });
}
