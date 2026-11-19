import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { buildCommentProsePatch } from '../generated/comments/comment-prose-edit-model.mjs';

export async function commitCommentProseEditOperation(request, { database, now = Date.now() } = {}) {
  if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const { commentId, entryId, edits } = request.data || {};
  if (typeof commentId !== 'string' || !commentId || commentId.includes('/')
      || typeof entryId !== 'string' || !entryId) {
    throw new HttpsError('invalid-argument', 'Beitrag und Szene sind erforderlich.');
  }

  database ??= getFirestore();
  const ref = database.collection('comments').doc(commentId);
  return database.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) throw new HttpsError('not-found', 'Der Beitrag wurde nicht gefunden.');
    const comment = snapshot.data();
    if (comment.entryId !== entryId) throw new HttpsError('failed-precondition', 'Der Beitrag gehört zu einer anderen Szene.');
    let patch;
    try {
      patch = buildCommentProsePatch(comment, edits);
    } catch (error) {
      if (!error.code) throw error;
      throw new HttpsError(error.code, error.message);
    }
    if (patch) transaction.update(ref, {
      ...patch,
      updatedAtClient: now,
      activityAtClient: now,
      updatedAt: FieldValue.serverTimestamp(),
      activityAt: FieldValue.serverTimestamp()
    });
    return { id: commentId, edited: !!patch };
  });
}

export const commitCommentProseEdit = onCall({
  region: 'europe-west1', maxInstances: 10, concurrency: 20, timeoutSeconds: 20
}, request => commitCommentProseEditOperation(request));
