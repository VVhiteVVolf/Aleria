import { HttpsError } from 'firebase-functions/v2/https';

// Persistent actors own their record ID. Scene-only creatures instead need a
// trusted existing instance/source pair and must never write their template.
export function assertMechanicalActorProfileSource(history, { actorId, recordId, kind, persistent = actorId === recordId }) {
  if (!actorId || !recordId || /\//.test(recordId) || !['character', 'creature'].includes(kind)
    || (persistent && actorId !== recordId) || (!persistent && actorId === recordId)) {
    throw new HttpsError('invalid-argument', 'Figurenkennung und Profilquelle stimmen nicht überein.');
  }
  if (persistent) return;
  if (kind !== 'creature') {
    throw new HttpsError('invalid-argument', 'Figurenkennung und Profilquelle stimmen nicht überein.');
  }
  const known = history.some(comment => (comment.combatEncounter?.participants || []).some(participant =>
    participant.actorId === actorId && participant.persistence?.kind === 'scene-creature' && participant.persistence.sourceCreatureId === recordId)
    || [comment, ...(comment.commentSegments || [])].some(segment =>
      segment.sceneActorId === actorId && (segment.sceneActorSourceId || segment.creatureId) === recordId));
  if (!known) throw new HttpsError('failed-precondition', 'Diese Kreatureninstanz ist in der Szene noch nicht bekannt.');
}
