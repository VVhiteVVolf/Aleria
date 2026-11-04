import { getCombatStartTemporaryHitPoints } from './combat-profile-model.js';
import { reconcileCriticalTemporaryOwnership } from '../combat-critical/combat-critical-lifecycle.js';

const actorId = value => String(value || '').trim().slice(0, 180);
const temporaryHitPoints = value => Number.isFinite(Number(value)) ? Math.max(0, Math.min(9999, Math.trunc(Number(value)))) : 0;

// These receipts are written only for new encounter events. Historical starts
// have no applications and cannot gain new hit points when their scene reloads.
export function normalizeCombatEncounterStartApplications(value) {
  return (Array.isArray(value) ? value : []).slice(0, 100)
    .filter(entry => entry?.schemaVersion === 1)
    .map(entry => ({ schemaVersion: 1, actorId: actorId(entry.actorId), temporaryHitPoints: temporaryHitPoints(entry.temporaryHitPoints) }))
    .filter(entry => entry.actorId && entry.temporaryHitPoints > 0);
}

export function buildCombatEncounterStartApplications(participants = [], options = {}) {
  const entering = new Set((options.enteringActorIds || []).map(actorId));
  return normalizeCombatEncounterStartApplications(participants
    .filter(participant => participant.status === 'active' && participant.profile && entering.has(actorId(participant.actorId)))
    .map(participant => ({ schemaVersion: 1, actorId: participant.actorId,
      temporaryHitPoints: getCombatStartTemporaryHitPoints(participant.profile) })));
}

export function applyCombatEncounterStartApplicationsToStateMap(states, event = {}) {
  if (!(states instanceof Map) || !['start', 'add'].includes(event.operation) || !event.encounterId) return states;
  const entering = new Set((event.participants || []).filter(participant => participant.status === 'active').map(participant => actorId(participant.actorId)));
  for (const application of normalizeCombatEncounterStartApplications(event.startApplications)) {
    if (!entering.has(application.actorId)) continue;
    const previous = states.get(application.actorId);
    if (!previous || previous.combatStartEffectEncounterIds?.includes(event.encounterId)) continue;
    states.set(application.actorId, reconcileCriticalTemporaryOwnership(previous, { ...previous,
      temporary: Math.max(temporaryHitPoints(previous.temporary), application.temporaryHitPoints),
      combatStartEffectEncounterIds: [...(previous.combatStartEffectEncounterIds || []), event.encounterId]
    }));
  }
  return states;
}
