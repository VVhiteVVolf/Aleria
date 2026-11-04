import { getCommentActorIds } from '../combat/combat-condition-duration.js';
import { replacesRuntimeCondition } from '../combat/combat-condition-lifecycle.js';

export function criticalConditionIds(states) {
  return new Map([...states].map(([id, state]) => [id, new Set((state.temporaryConditions || []).map(c => c.id))]));
}

function hitPoints(state = {}) {
  return { current: Math.max(0, Number(state.current) || 0), maximum: Math.max(0, Number(state.maximum) || 0),
    temporary: Math.max(0, Number(state.temporary) || 0) };
}

function releaseAuraBaseline(state, expiredIds) {
  const tracker = state.encounterAuraTemporaryHitPoints;
  if (!tracker?.baselineCriticalConditionIds?.some(id => expiredIds.has(id))) return state;
  const retainedIds = tracker.baselineCriticalConditionIds.filter(id => !expiredIds.has(id));
  return { ...state, encounterAuraTemporaryHitPoints: { ...tracker,
    baseline: retainedIds.length ? tracker.baseline : 0, baselineCriticalConditionIds: retainedIds } };
}

// A later authoritative HP snapshot may replace the critical pool via an item,
// aura or encounter entry. Only previous owners are released: a newly recorded
// critical grant must retain its own lifetime and its receipt remains untouched.
export function reconcileCriticalTemporaryOwnership(previous = {}, next = {}) {
  const previousOwners = new Set((previous.temporaryConditions || [])
    .filter(condition => condition.criticalTemporaryOwned).map(condition => condition.id));
  let result = next;
  if (Number(next.temporary) > Number(previous.temporary || 0) && previousOwners.size) {
    result = { ...next, temporaryConditions: (next.temporaryConditions || []).map(condition =>
      condition.criticalTemporaryOwned && previousOwners.has(condition.id)
        ? { ...condition, criticalTemporaryOwned: false } : condition) };
  }
  const activeIds = new Set((result.temporaryConditions || []).filter(condition => condition.active !== false).map(condition => condition.id));
  const removedBaselineIds = new Set((result.encounterAuraTemporaryHitPoints?.baselineCriticalConditionIds || []).filter(id => !activeIds.has(id)));
  return removedBaselineIds.size ? releaseAuraBaseline(result, removedBaselineIds) : result;
}

// The clock belongs to the whole contribution, including speech and items.
export function beginCriticalContribution(states, comment) {
  const events = [];
  if (comment.combatEncounter || comment.combatStatus || comment.combatRulesRelease || comment.sceneRest) return events;
  for (const id of getCommentActorIds(comment)) {
    const state = states.get(id);
    if (!state) continue;
    const effects = (state.temporaryConditions || []).filter(c => c.active !== false && c.criticalPeriodicLoss > 0);
    if (!effects.length) continue;
    const before = hitPoints(state);
    const loss = Math.min(before.current, effects.reduce((sum, c) => sum + c.criticalPeriodicLoss, 0));
    const after = { ...before, current: before.current - loss };
    states.set(id, { ...state, ...after,
      ...(after.current === 0 ? { concentration: null, channeling: null } : {}) });
    events.push({ actorId: id, phase: 'start', names: effects.map(c => c.name), before, after, loss });
  }
  return events;
}

export function expireCriticalTemporaryHitPoints(states, comment, previousIds = criticalConditionIds(states)) {
  const events = [];
  const contributors = comment.combatEncounter || comment.combatStatus || comment.combatRulesRelease || comment.sceneRest
    ? new Set() : getCommentActorIds(comment);
  for (const [id, state] of states) {
    const baselineOwners = new Set(state.encounterAuraTemporaryHitPoints?.baselineCriticalConditionIds || []);
    const expiring = (state.temporaryConditions || []).filter(c => (c.criticalTemporaryOwned === true || baselineOwners.has(c.id))
      && (comment.combatEncounter?.operation === 'end' && c.durationModel?.encounterId === comment.combatEncounter.encounterId
        || contributors.has(id) && previousIds.get(id)?.has(c.id) && c.durationModel?.remainingActorComments === 1));
    if (!expiring.length) continue;
    const before = hitPoints(state), after = { ...before, temporary: expiring.some(c => c.criticalTemporaryOwned) ? 0 : before.temporary };
    states.set(id, releaseAuraBaseline({ ...state, ...after }, new Set(expiring.map(c => c.id))));
    events.push({ actorId: id, phase: 'end', names: expiring.map(c => c.name), before, after, expiredTemporary: before.temporary - after.temporary });
  }
  return events;
}

export function grantCriticalTemporaryHitPoints(state, consequence) {
  const seeded = { ...consequence.hitPointBase, ...state };
  const offered = consequence.condition?.criticalTemporaryHitPoints || 0;
  if (!offered) return { state: seeded, condition: consequence.condition, event: null };
  const before = hitPoints(seeded), after = { ...before, temporary: Math.max(before.temporary, offered) };
  const incoming = consequence.condition;
  const refreshed = (seeded.temporaryConditions || []).filter(condition => replacesRuntimeCondition(condition, incoming));
  const refreshesOwner = refreshed.some(condition => condition.criticalTemporaryOwned);
  let nextState = reconcileCriticalTemporaryOwnership(seeded, { ...seeded, ...after });
  const tracker = nextState.encounterAuraTemporaryHitPoints;
  const replacedIds = new Set(refreshed.map(condition => condition.id));
  if (tracker?.baselineCriticalConditionIds?.some(id => replacedIds.has(id))) {
    nextState = { ...nextState, encounterAuraTemporaryHitPoints: { ...tracker,
      baselineCriticalConditionIds: [...tracker.baselineCriticalConditionIds.filter(id => !replacedIds.has(id)), incoming.id] } };
  }
  return { state: nextState,
    condition: { ...incoming, criticalTemporaryOwned: after.temporary > before.temporary || refreshesOwner },
    event: { actorId: consequence.actorId, phase: 'end', names: [consequence.name], before, after, grantedTemporary: after.temporary - before.temporary } };
}

export function releaseCriticalTemporaryOwnership(conditions, before, after) {
  return after.temporary > before.temporary
    ? conditions.map(c => c.criticalTemporaryOwned ? { ...c, criticalTemporaryOwned: false } : c) : conditions;
}
