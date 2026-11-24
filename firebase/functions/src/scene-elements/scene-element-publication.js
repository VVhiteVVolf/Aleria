import { FieldValue } from 'firebase-admin/firestore';
import { sceneElementSignal } from './scene-element-authoring.js';

export function stageSceneElementReveal(database, transaction, {
  id, definition, event, orderKey, now, evaluation, interactions, targetActorId = '', detection, phaseReveal
}) {
  const revealRef = database.collection('comments').doc('reveal-' + id);
  const ref = database.collection('scene_elements').doc(id);
  const signalRef = database.collection('comments').doc('signal-' + id);
  const label = { challenge: 'Herausforderung', puzzle: 'Rätsel', item: 'Gegenstand', danger: 'Gefahr' }[event.elementType];
  const revealedEvent = { ...event, activation: { ...event.activation, enabled: false }, sceneElementId: id };
  transaction.create(revealRef, { entryId: definition.entryId, charName: 'Erzähler', narrator: true,
    text: `${label}: ${event.title}`, commentKind: 'herausforderung-event', commentMode: 'herausforderung', commentSegments: null,
    herausforderung: revealedEvent, herausforderungRevision: 0,
    ...(detection ? { sceneElementDetection: detection } : {}),
    ...(phaseReveal ? { combatPhaseReveal: phaseReveal } : {}),
    herausforderungTransaction: { schemaVersion: 1, transactionId: revealRef.id, validatedBy: 'commitSceneElement' },
    serverValidatedMechanics: true, mechanicalAudit: true, createdBy: definition.createdBy,
    orderKey, createdAtClient: now, activityAtClient: now, ts: FieldValue.serverTimestamp() });
  transaction.update(ref, { state: 'revealed', challengeId: revealRef.id, revealedAt: now, interactions,
    triggerReceipt: evaluation, targetActorId });
  transaction.update(signalRef, { sceneElementSignal: sceneElementSignal(id, revealedEvent, 'revealed', definition.revision, revealRef.id) });
  return { id, state: 'revealed', challengeId: revealRef.id };
}
