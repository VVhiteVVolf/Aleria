import { getCombatPhaseBoundary } from '../generated/combat-phase-counter/combat-phase-model.js';
import { advanceTemporaryConditionsForComment } from '../generated/combat/combat-condition-duration.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../generated/combat/combat-state-model.js';
import { resolveCombatTargetProfile } from '../generated/combat/combat-profile-resolver.js';
import { applyCombatStatusCommentToStateMap, buildCombatStatusChange, createManualCombatCondition } from '../generated/combat-status/combat-status-model.js';
import { prepareCriticalCommentLifecycle } from '../mechanics/critical-comment-lifecycle.js';
import { prepareCreaturePhaseEnds } from './combat-phase-creature-effects.js';

async function applyPreparedConditions({ database, transaction, states, phase, step, participants, encounter, commentId }) {
  const applications = [], skipped = [], records = new Map();
  for (const [index, prepared] of (step?.conditions || []).entries()) {
    const participant = participants.get(prepared.actorId);
    if (!participant || !phase.actorIds.includes(prepared.actorId)) {
      skipped.push({ actorId: prepared.actorId, actorName: participant?.name || prepared.actorId, reason: 'Nicht mehr am Kampf beteiligt.' });
      continue;
    }
    const p = participant.persistence;
    const sceneCreature = p.kind === 'scene-creature';
    const kind = sceneCreature ? 'creature' : p.kind;
    const recordId = sceneCreature ? p.sourceCreatureId : p.recordId;
    if (!['character', 'creature'].includes(kind) || !recordId || recordId.includes('/')) {
      skipped.push({ actorId: prepared.actorId, actorName: participant.name, reason: 'Die Profilquelle fehlt.' });
      continue;
    }
    const key = `${kind}:${recordId}`;
    if (!records.has(key)) {
      const record = await transaction.get(database.collection(kind === 'creature' ? 'creatures' : 'characters').doc(recordId));
      records.set(key, record.data() || null);
    }
    const record = records.get(key);
    if (!record) {
      skipped.push({ actorId: prepared.actorId, actorName: participant.name, reason: 'Profil ist nicht mehr vorhanden.' });
      continue;
    }
    const actorId = prepared.actorId;
    const actorName = record.name || participant.name;
    const state = states.get(actorId);
    const profile = overlayCombatHitPointState(resolveCombatTargetProfile({ ...record, id: actorId, entityType: kind,
      ...(sceneCreature ? { sourceCreatureId: recordId } : {}) }), state);
    const encounterActor = encounter?.participants.get(actorId);
    if (prepared.durationKind === 'combat' && !['active', 'defeated'].includes(encounterActor?.status)) {
      skipped.push({ actorId, actorName, reason: 'Dieser Zustand benötigt eine Figur im laufenden Kampf.' });
      continue;
    }
    const condition = createManualCombatCondition({ ...prepared, source: 'Phasenzähler' },
      { id: `${commentId}-${index + 1}`, encounterId: encounter?.encounterId || '', actorId });
    try {
      const after = buildCombatStatusChange({ operation: 'add', profile, state: state || {}, condition });
      const combatStatus = { operation: 'add', actorId, actorName, condition, after, persistence: p };
      applyCombatStatusCommentToStateMap(states, { serverValidatedMechanics: true, combatStatus });
      applications.push(combatStatus);
    } catch (error) {
      skipped.push({ actorId, actorName, conditionName: condition.name, reason: error.message });
    }
  }
  return { applications, skipped };
}

export async function prepareCombatPhaseEffects({ database, transaction, history, phase, step, participants, encounter, commentId, draws, rollDie }) {
  const updates = new Map(), boundary = getCombatPhaseBoundary(phase);
  if (!boundary) return { updates, criticalLifecycle: [], applications: [], skipped: [], creatureResolutions: [] };
  const { clock, contribution, actorIds } = boundary;
  const states = new Map([...deriveCombatStateFromComments(history)].filter(([actorId]) => actorIds.has(actorId)));
  const persistenceByActor = new Map([...participants].map(([id, participant]) => [id, participant.persistence]));
  const lifecycle = await prepareCriticalCommentLifecycle({ database, transaction, states, metadata: contribution, updates, clock, persistenceByActor });
  const creatureResolutions = await prepareCreaturePhaseEnds({ database, transaction, states, participants, updates, clock, draws, rollDie });
  const criticalLifecycle = lifecycle.finish(contribution);
  advanceTemporaryConditionsForComment(states, contribution, { ...clock, eligibleActorIds: actorIds });
  const { applications, skipped } = await applyPreparedConditions({ database, transaction, states, phase, step, participants, encounter, commentId });
  return { updates, criticalLifecycle, applications, skipped, creatureResolutions };
}
