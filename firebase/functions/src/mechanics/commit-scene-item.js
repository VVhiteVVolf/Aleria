import { createHash } from 'node:crypto';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { nextMechanicalCommentOrderKey } from './mechanical-comment-order.js';
import { buildSceneItemSegments } from './scene-item-authoring.js';
const clean = (value, max) => String(value || '').trim().slice(0, max);

export async function placeSceneItem({ database, auth, input, now = Date.now() }) {
  if (!auth) throw new HttpsError('unauthenticated', 'Eine Anmeldung ist erforderlich.');
  if (!['admin', 'moderator', 'editor'].includes(auth.token?.aleriaRole)) throw new HttpsError('permission-denied', 'Neutrale Gegenstände werden von Spielleitung oder Redaktion platziert.');
  const entryId = clean(input.entryId, 240), operationId = clean(input.operationId, 80);
  if (!entryId || !/^[a-zA-Z0-9-]{8,80}$/.test(operationId)) throw new HttpsError('invalid-argument', 'Szene und Vorgangskennung fehlen.');
  const legacy = !Array.isArray(input.commentSegments);
  const segments = legacy ? [{ kind: 'sceneitem', sceneItemDraft: input }] : input.commentSegments;
  if (!segments.length || segments.length > 24 || segments.some(segment => !segment || typeof segment !== 'object') || !segments.some(segment => segment.kind === 'sceneitem') || JSON.stringify(segments).length > 150000) {
    throw new HttpsError('invalid-argument', 'Bitte einen gültigen Gegenstandsabschnitt anlegen (maximal 24 Abschnitte).');
  }
  const fingerprint = createHash('sha256').update(JSON.stringify({ entryId, segments })).digest('hex');
  const id = `scene-item-${auth.uid}-${operationId}`;
  const ref = database.collection('comments').doc(id);
  return database.runTransaction(async transaction => {
    const existing = await transaction.get(ref);
    if (existing.exists) {
      const saved = existing.data();
      if (saved.entryId !== entryId || (saved.sceneItemFingerprint && saved.sceneItemFingerprint !== fingerprint)) throw new HttpsError('failed-precondition', 'Dieser Vorgang wurde bereits mit anderem Inhalt gespeichert. Bitte zuerst die Szene neu laden.');
      return { id, sceneItemEvent: saved.sceneItemEvent || saved.commentSegments?.find(segment => segment.sceneItemEvent)?.sceneItemEvent };
    }
    const commentSegments = await buildSceneItemSegments(database, transaction, segments, id);
    const sceneItemEvent = commentSegments.find(segment => segment.sceneItemEvent).sceneItemEvent;
    // Preserve the public identity of the original single-item API.
    if (legacy) { sceneItemEvent.sceneItemId = id; sceneItemEvent.item.id = `item:${id}`; sceneItemEvent.item.instanceId = `item:${id}`; }
    const thread = await transaction.get(database.collection('comments').where('entryId', '==', entryId));
    const history = thread.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    transaction.create(ref, { entryId, text: commentSegments.map(segment => segment.text).join('\n\n'), charName: 'Erzähler', narrator: true, characterId: '', portrait: null,
      commentKind: legacy ? 'scene-item-event' : 'narrator', commentMode: 'narrator',
      ...(legacy ? { sceneItemEvent, commentSegments: null } : { commentSegments }),
      sceneItemFingerprint: fingerprint, serverValidatedMechanics: true, mechanicalAudit: true, createdBy: auth.uid, createdByRole: auth.token.aleriaRole,
      orderKey: nextMechanicalCommentOrderKey(history, null, now), createdAtClient: now, activityAtClient: now,
      activityAt: FieldValue.serverTimestamp(), ts: FieldValue.serverTimestamp(), schemaVersion: 3 });
    return { id, sceneItemEvent };
  });
}
export const commitSceneItem = onCall({ region: 'europe-west1', timeoutSeconds: 30, maxInstances: 10 }, request =>
  placeSceneItem({ database: getFirestore(), auth: request.auth, input: request.data || {} }));
