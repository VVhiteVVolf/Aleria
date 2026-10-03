import { beginCriticalContribution, criticalConditionIds, expireCriticalTemporaryHitPoints } from '../generated/combat-critical/combat-critical-lifecycle.js';
import { applyCriticalConsequencesForComment } from '../generated/combat-critical/combat-critical-model.js';
import { getCommentActorIds } from '../generated/combat/combat-condition-duration.js';
import { withProtectedRecordRevisions } from './protected-record-revisions.js';

// One shared lifecycle for combat, skills and narrative posts. All reads finish
// before their caller starts writing; HP changes join its existing transaction.
export async function prepareCriticalCommentLifecycle({ database, transaction, states, metadata,
  records = new Map(), entries = new Map(), updates = new Map() }) {
  const previousIds = criticalConditionIds(states);
  const contributors = getCommentActorIds(metadata);
  const sources = new Map();
  for (const [id, state] of states) {
    if (!contributors.has(id)) continue;
    for (const c of state.temporaryConditions || []) {
      if (!c.criticalPeriodicLoss && !c.criticalTemporaryOwned) continue;
      const p = c.criticalPersistence;
      if (!['character', 'creature'].includes(p?.kind) || p.recordId !== id) continue;
      sources.set(id, { ...p, key: `${p.kind}:${p.recordId}` });
    }
  }
  for (const p of sources.values()) {
    if (records.has(p.key)) continue;
    const entry = { ...p, ref: database.collection(p.kind === 'creature' ? 'creatures' : 'characters').doc(p.recordId) };
    const snapshot = await transaction.get(entry.ref);
    if (!snapshot.exists) continue;
    records.set(p.key, snapshot.data());
    entries.set(p.key, entry);
  }
  const events = beginCriticalContribution(states, metadata);
  function stage() {
    for (const event of events) {
      const p = sources.get(event.actorId) || [...entries.values()].find(e => e.recordId === event.actorId && e.persistent !== false);
      const record = p && records.get(p.key);
      if (!record) continue;
      const state = states.get(event.actorId);
      const update = updates.get(p.key) || { entry: entries.get(p.key), record };
      update.hitPoints = { current: state.current, maximum: state.maximum, temporary: state.temporary || 0 };
      updates.set(p.key, update);
      event.actorName = record.name || event.actorId;
    }
  }
  stage();
  return { events, finish(comment) {
    events.push(...expireCriticalTemporaryHitPoints(states, comment, previousIds), ...applyCriticalConsequencesForComment(states, comment));
    stage();
    return events;
  } };
}

export function persistCriticalHitPointUpdates(transaction, updates, commentId, now, mechanicalUndo = {}) {
  const profileUpdates = [];
  for (const [key, update] of updates) {
    if (!update.hitPoints) continue;
    const { record, entry, hitPoints } = update;
    mechanicalUndo[key] = { kind: entry.kind, recordId: entry.recordId,
      previousMechanicalCommentId: record.combatProfile?.lastMechanicalCommentId || null,
      ...mechanicalUndo[key], before: { ...mechanicalUndo[key]?.before, hitPoints: record.combatProfile?.hitPoints || null } };
    transaction.update(entry.ref, withProtectedRecordRevisions(record, {
      'combatProfile.hitPoints.current': hitPoints.current, 'combatProfile.hitPoints.temporary': hitPoints.temporary,
      'combatProfile.lastMechanicalCommentId': commentId, updatedAt: new Date(now).toISOString()
    }, ['combatProfile'], now));
    profileUpdates.push({ kind: entry.kind, recordId: entry.recordId, hitPoints });
  }
  return profileUpdates;
}
