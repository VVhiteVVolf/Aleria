import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

function fail(code, message) {
  throw new HttpsError(code, message);
}

function clean(value, maximum = 240) {
  return String(value || '').trim().slice(0, maximum);
}

const OPERATION_LABELS = { start: 'Kampf beginnt', add: 'Verstärkung', remove: 'Kampfliste geändert', end: 'Kampf beendet' };

export const commitEditCombatEncounterText = onCall({
  region: 'europe-west1',
  maxInstances: 10,
  concurrency: 20,
  enforceAppCheck: false,
  timeoutSeconds: 30
}, async request => {
  if (!request.auth) fail('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const entryId = clean(request.data?.entryId, 240);
  const commentId = clean(request.data?.commentId, 240);
  const title = clean(request.data?.title, 180) || 'Kampfankündigung';
  const body = clean(request.data?.body, 4000);
  if (!entryId || !commentId) fail('invalid-argument', 'Szene und Beitrag sind erforderlich.');

  const database = getFirestore();
  const commentRef = database.collection('comments').doc(commentId);

  await database.runTransaction(async transaction => {
    const snapshot = await transaction.get(commentRef);
    if (!snapshot.exists) fail('not-found', 'Dieser Beitrag existiert nicht mehr.');
    const comment = snapshot.data() || {};
    if (clean(comment.entryId, 240) !== entryId) fail('failed-precondition', 'Der Beitrag gehört nicht zu dieser Szene.');
    if (comment.commentKind !== 'combat-encounter-event') {
      fail('failed-precondition', 'Nur Kampfankündigungen können hier bearbeitet werden.');
    }
    const operation = String(comment.combatEncounter?.operation || 'start');
    transaction.update(commentRef, {
      'combatEncounter.title': title,
      'combatEncounter.body': body,
      text: [OPERATION_LABELS[operation] || 'Kampfankündigung', body].filter(Boolean).join('\n\n'),
      updatedAt: FieldValue.serverTimestamp()
    });
  });

  return { id: commentId, edited: true };
});
