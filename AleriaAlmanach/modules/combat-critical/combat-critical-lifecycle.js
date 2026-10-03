import { getCommentActorIds } from '../combat/combat-condition-duration.js';

export function criticalConditionIds(states) {
  return new Map([...states].map(([id, state]) => [id, new Set((state.temporaryConditions || []).map(c => c.id))]));
}

function hitPoints(state = {}) {
  return { current: Math.max(0, Number(state.current) || 0), maximum: Math.max(0, Number(state.maximum) || 0),
    temporary: Math.max(0, Number(state.temporary) || 0) };
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
  const contributors = getCommentActorIds(comment);
  for (const [id, state] of states) {
    const expiring = (state.temporaryConditions || []).filter(c => c.criticalTemporaryOwned === true
      && (comment.combatEncounter?.operation === 'end' && c.durationModel?.encounterId === comment.combatEncounter.encounterId
        || contributors.has(id) && previousIds.get(id)?.has(c.id) && c.durationModel?.remainingActorComments === 1));
    if (!expiring.length) continue;
    const before = hitPoints(state), after = { ...before, temporary: 0 };
    states.set(id, { ...state, ...after });
    events.push({ actorId: id, phase: 'end', names: expiring.map(c => c.name), before, after, expiredTemporary: before.temporary });
  }
  return events;
}

export function grantCriticalTemporaryHitPoints(state, consequence) {
  const seeded = { ...consequence.hitPointBase, ...state };
  const offered = consequence.condition?.criticalTemporaryHitPoints || 0;
  if (!offered) return { state: seeded, condition: consequence.condition, event: null };
  const before = hitPoints(seeded), after = { ...before, temporary: Math.max(before.temporary, offered) };
  return { state: { ...seeded, ...after }, condition: { ...consequence.condition, criticalTemporaryOwned: after.temporary > before.temporary },
    event: { actorId: consequence.actorId, phase: 'end', names: [consequence.name], before, after, grantedTemporary: after.temporary - before.temporary } };
}

export function releaseCriticalTemporaryOwnership(conditions, before, after) {
  return after.temporary > before.temporary
    ? conditions.map(c => c.criticalTemporaryOwned ? { ...c, criticalTemporaryOwned: false } : c) : conditions;
}
