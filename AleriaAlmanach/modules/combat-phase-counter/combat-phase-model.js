export const COMBAT_PHASE_EVENT_KIND = 'combat-phase-event';
export const MAX_COMBAT_PHASE = 99;
export const DEFAULT_PHASE_SETTINGS = Object.freeze({ firstPhase: 1, lastPhase: 10, renewActions: false, phaseConditions: false });
export const PHASE_CONDITION_DURATIONS = Object.freeze({
  'actor-comments': 'Eigene Beiträge bzw. Phasen',
  combat: 'Bis Kampfende',
  permanent: 'Bis zum Entfernen'
});

export function getCombatPhaseEvent(comment) {
  if (comment?.serverValidatedMechanics !== true || comment.importedHistoricalMechanics) return null;
  return getDisplayCombatPhaseEvent(comment);
}

export function getDisplayCombatPhaseEvent(comment) {
  if ((!comment?.serverValidatedMechanics && comment?.importedHistoricalMechanics !== true)
    || comment?.commentKind !== COMBAT_PHASE_EVENT_KIND) return null;
  const event = comment.combatPhase;
  const valid = event?.counterId && Number.isInteger(event.phase) && event.phase >= 1
    && Number.isInteger(event.lastPhase) && event.lastPhase >= event.phase && event.lastPhase <= MAX_COMBAT_PHASE
    && ['start', 'advance', 'configure', 'stop'].includes(event.operation);
  return valid ? event : null;
}

export function getLatestCombatPhase(comments = []) {
  for (let i = comments.length - 1; i >= 0; i--) {
    const event = getCombatPhaseEvent(comments[i]);
    if (event) return event;
  }
  return null;
}

export function getCombatPhaseClock(counter) {
  if (!counter || counter.operation === 'stop') return {};
  return {
    deferActionRecovery: counter.renewActions,
    deferConditionTime: counter.phaseConditions
  };
}

export function getCombatPhaseBoundary(event) {
  if (!['start', 'advance'].includes(event.operation)) return null;
  const actorIds = new Set(event.actorIds || []);
  return {
    actorIds,
    contribution: { commentSegments: [...actorIds].map(actorId => ({ actorId })) },
    clock: {
      deferActionRecovery: !event.renewActions,
      deferConditionTime: event.operation !== 'advance' || !event.phaseConditions
    }
  };
}
