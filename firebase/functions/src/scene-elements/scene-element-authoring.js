import { createHash } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import { bindHerausforderungCombatContext } from '../mechanics/herausforderung-combat-effects.js';
import { bindHerausforderungTarget } from '../mechanics/herausforderung-target.js';
import { prepareHerausforderungRewards } from '../mechanics/herausforderung-rewards.js';
import { collectSceneElementParticipants } from '../generated/scene-elements/scene-element-conditions.js';

export function sceneElementSignal(id, event, state, revision, challengeId = '') {
  const publicItem = event.elementType === 'item';
  return { id, elementType: event.elementType, state, revision, challengeId,
    visible: (publicItem || event.activation.showSignal) && state === 'armed', title: publicItem ? event.title : '',
    ...(publicItem ? { publicDescription: event.publicDescription, sceneImage: event.sceneImage } : {}) };
}

export function sceneElementSignalDocument(id, definition, now) {
  return { entryId: definition.entryId, charName: 'Erzähler', narrator: true, text: 'Szenenelement vorbereitet',
    commentKind: 'scene-element-signal', commentMode: 'scene-element', commentSegments: null,
    sceneElementSignal: sceneElementSignal(id, definition.event, definition.state, definition.revision, definition.challengeId || ''),
    serverValidatedMechanics: true, mechanicalAudit: true, createdBy: definition.createdBy,
    orderKey: definition.orderKey, createdAtClient: now, activityAtClient: now, ts: FieldValue.serverTimestamp() };
}

export async function commitArmedSceneElement({ database, request, metadata, event, entryId, fingerprint, now }) {
  const operationId = String(metadata.operationId || '');
  if (!operationId) throw new HttpsError('invalid-argument', 'Zum Scharfschalten ist eine Vorgangskennung erforderlich.');
  const id = metadata.sceneElementId || 'element-' + createHash('sha256').update(request.auth.uid + '\0' + operationId).digest('hex');
  if (typeof id !== 'string' || !/^[a-zA-Z0-9-]{1,160}$/.test(id)) throw new HttpsError('invalid-argument', 'Die Elementkennung ist ungültig.');
  const ref = database.collection('scene_elements').doc(id);
  const signalRef = database.collection('comments').doc('signal-' + id);
  await database.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    const previous = snapshot.exists ? snapshot.data() : null;
    if (previous?.lastOperationId === operationId && previous.fingerprint === fingerprint) return;
    if (metadata.sceneElementId) {
      if (!previous || previous.entryId !== entryId) throw new HttpsError('not-found', 'Dieses vorbereitete Element ist nicht mehr vorhanden.');
      if (!['armed', 'disabled'].includes(previous.state)) throw new HttpsError('failed-precondition', 'Das Element wurde bereits ausgelöst. Bearbeite seine veröffentlichte Karte.');
      if (!Number.isSafeInteger(metadata.expectedRevision) || metadata.expectedRevision !== previous.revision) throw new HttpsError('aborted', 'Die Vorbereitung wurde inzwischen geändert. Bitte erneut öffnen.');
    } else if (previous) throw new HttpsError('failed-precondition', 'Dieser Vorgang wurde bereits mit anderem Inhalt gespeichert.');
    if (!event.activation.enabled) throw new HttpsError('invalid-argument', 'Eine gespeicherte Vorbereitung benötigt weiterhin Auslösebedingungen.');
    const scene = await transaction.get(database.collection('comments').where('entryId', '==', entryId));
    const definitions = await transaction.get(database.collection('scene_elements').where('entryId', '==', entryId));
    if (!previous && definitions.size >= 50) throw new HttpsError('resource-exhausted', 'Diese Szene enthält bereits 50 vorbereitete Elemente.');
    // Validate a fixed future target now; it must additionally participate before activation.
    if (event.activation.target.mode === 'fixed') {
      const actorId = event.activation.target.actorId;
      if (actorId.includes('/')) throw new HttpsError('invalid-argument', 'Die Zielfigur ist ungültig.');
      const participant = collectSceneElementParticipants(scene.docs.map(doc => doc.data())).find(actor => actor.actorId === actorId);
      const recordId = participant?.recordId || actorId;
      const actor = await transaction.get(database.collection('characters').doc(recordId));
      if (!actor.exists && !(await transaction.get(database.collection('creatures').doc(recordId))).exists) throw new HttpsError('not-found', 'Die feste Zielfigur existiert nicht.');
    }
    await bindHerausforderungCombatContext(database, transaction, event, entryId, { encounterId: previous?.event?.combatContext?.encounterId || '' });
    await bindHerausforderungTarget(database, transaction, event);
    await prepareHerausforderungRewards(database, transaction, event);
    const definition = { entryId, event, state: previous?.state || 'armed', revision: (previous?.revision || 0) + 1,
      baselineCommentIds: previous?.baselineCommentIds || scene.docs.map(doc => doc.id),
      interactions: previous?.interactions || [], createdBy: previous?.createdBy || request.auth.uid,
      armedAt: previous?.armedAt ?? now, orderKey: previous?.orderKey ?? now,
      lastOperationId: operationId, fingerprint, updatedAt: now };
    transaction.set(ref, definition);
    transaction.set(signalRef, sceneElementSignalDocument(id, definition, previous?.armedAt ?? now));
  });
  return { id: signalRef.id, sceneElementId: id, prepared: true };
}
