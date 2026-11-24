import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getSceneElementContributors } from '../generated/scene-elements/scene-element-conditions.js';
import { evaluateSceneElements } from './scene-element-evaluation.js';
import { assertFutureScenePhase, sceneElementSignal } from './scene-element-authoring.js';
import { recordSceneElementInteraction } from './scene-element-interactions.js';

const identifier = (value, label) => {
  if (typeof value !== 'string' || !value.trim() || value.length > 240 || value.includes('/')) throw new HttpsError('invalid-argument', `${label} ist ungültig.`);
  return value;
};

export async function commitSceneElementOperation(request, { database = getFirestore(), now = Date.now(), rollDie, selectIndex } = {}) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const payload = request.data || {};
  const entryId = identifier(payload.entryId, 'Die Szene');
  if (payload.action === 'interact') {
    const interaction = { sourceId: identifier(payload.sourceId, 'Die Interaktionsquelle'), actorId: identifier(payload.actorId, 'Die Figur') };
    const id = await recordSceneElementInteraction(database, entryId, interaction, payload.operationId, request.auth, now);
    return { id, elements: await evaluateSceneElements(database, entryId, { interaction: { ...interaction, receiptId: id }, validatedInteraction: true, now, rollDie, selectIndex }) };
  }
  if (payload.action === 'evaluate') return { elements: await evaluateSceneElements(database, entryId, { now, rollDie, selectIndex }) };
  if (payload.action === 'list') return database.runTransaction(async transaction => {
    const snapshot = await transaction.get(database.collection('scene_elements').where('entryId', '==', entryId));
    return { elements: snapshot.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, title: data.event.title, elementType: data.event.elementType, state: data.state, revision: data.revision,
        ...(data.event.activation.phase ? { phase: data.event.activation.phase } : {}),
        challengeId: data.challengeId || '' };
    }) };
  });
  const id = identifier(payload.id, 'Das Element');
  const result = await database.runTransaction(async transaction => {
    const ref = database.collection('scene_elements').doc(id);
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists || snapshot.data().entryId !== entryId) throw new HttpsError('not-found', 'Dieses vorbereitete Element ist nicht mehr vorhanden.');
    const definition = snapshot.data();
    // Explicit authoring access is shared by signed-in coauthors. The public
    // scene and direct Firestore clients never receive the private definition.
    if (payload.action === 'read') return { id, event: definition.event, revision: definition.revision, state: definition.state };
    if (!['disable', 'arm'].includes(payload.action)) throw new HttpsError('invalid-argument', 'Unbekannter Elementauftrag.');
    if (!['armed', 'disabled'].includes(definition.state)) throw new HttpsError('failed-precondition', 'Ein ausgelöstes Element kann nicht erneut scharfgeschaltet werden.');
    if (!Number.isInteger(payload.expectedRevision) || payload.expectedRevision !== definition.revision) throw new HttpsError('aborted', 'Das Element wurde inzwischen geändert. Bitte die Verwaltung neu öffnen.');
    const state = payload.action === 'disable' ? 'disabled' : 'armed';
    if (definition.state === state) return { id, state, revision: definition.revision };
    const patch = { state, revision: definition.revision + 1, updatedAt: now };
    if (state === 'armed') {
      const history = await transaction.get(database.collection('comments').where('entryId', '==', entryId));
      if (definition.event.activation.phase) assertFutureScenePhase(history, definition.event.activation.phase);
      patch.baselineCommentIds = history.docs.map(doc => doc.id);
      patch.interactions = [];
      patch.armedAt = now;
    }
    transaction.update(ref, patch);
    transaction.update(database.collection('comments').doc('signal-' + id), {
      sceneElementSignal: sceneElementSignal(id, definition.event, state, patch.revision) });
    return { id, state, revision: patch.revision };
  });
  if (payload.action === 'arm' && result.state === 'armed') {
    const elements = await evaluateSceneElements(database, entryId, { now, rollDie, selectIndex });
    const latest = elements.find(element => element.id === id);
    return { ...result, ...(latest || {}), elements };
  }
  return result;
}

export async function evaluateCreatedSceneComment(event, options = {}) {
  const comment = event.data?.data?.();
  if (comment?.sceneElementInteraction && comment.serverValidatedMechanics === true) return evaluateSceneElements(options.database || getFirestore(), comment.entryId,
    { ...options, validatedInteraction: true, interaction: { sourceId: comment.sceneElementInteraction.sourceId,
      actorId: comment.sceneElementInteraction.actorId, receiptId: comment.sceneElementInteraction.receiptId || event.data?.id || '' } });
  if (!comment?.entryId || !getSceneElementContributors(comment).length) return;
  return evaluateSceneElements(options.database || getFirestore(), comment.entryId, options);
}

export const commitSceneElement = onCall({ region: 'europe-west1', maxInstances: 10, concurrency: 20,
  enforceAppCheck: false, timeoutSeconds: 60 }, request => commitSceneElementOperation(request));
export const evaluateSceneElementComment = onDocumentCreated({ document: 'comments/{commentId}', region: 'europe-west1',
  maxInstances: 10, concurrency: 20, retry: true, timeoutSeconds: 60 }, event => evaluateCreatedSceneComment(event));
