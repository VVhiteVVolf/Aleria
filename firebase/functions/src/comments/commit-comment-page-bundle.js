import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { createHash } from 'node:crypto';
import { applyBundleMutation, normalizeBundleMetadata, normalizeBundleMutation, validateBundleThreadId, CommentPageBundleError } from '../generated/comments/comment-page-bundles-model.mjs';

export async function commitCommentPageBundleOperation(request, { db = getFirestore(), timestamp = () => FieldValue.serverTimestamp() } = {}) {
  if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Bitte melde dich an, um gemeinsame Seiten zu speichern.');
  const data = request.data || {};
  try {
    const threadId = validateBundleThreadId(data.threadId);
    if (!Number.isSafeInteger(data.expectedRevision) || data.expectedRevision < 0) throw new CommentPageBundleError('invalid-argument', 'Die Seiteneinteilung muss zuerst geladen werden.');
    if (typeof data.mutationId !== 'string' || !/^[a-zA-Z0-9_-]{8,120}$/.test(data.mutationId)) throw new CommentPageBundleError('invalid-argument', 'Ungültige Auftragskennung.');
    const operation = normalizeBundleMutation(data.operation);
    // Bind replay to this account and request without storing/exporting its UID.
    const mutationHash = createHash('sha256').update(JSON.stringify([request.auth.uid, data.mutationId, operation])).digest('hex');
    const reference = db.collection('comment_turns').doc(threadId);
    let result;
    await db.runTransaction(async transaction => {
      const snapshot = await transaction.get(reference);
      const current = normalizeBundleMetadata(snapshot.exists ? snapshot.data().commentPageBundles : null);
      if (current.lastMutationId === data.mutationId) {
        if (current.lastMutationHash !== mutationHash) throw new HttpsError('already-exists', 'Dieser Auftrag wurde bereits mit anderem Inhalt gespeichert. Aktualisiere die Seiteneinteilung.');
        result = current; return;
      }
      if (current.revision !== data.expectedRevision) throw new HttpsError('aborted', 'Die Seiteneinteilung wurde inzwischen geändert. Aktualisiere die Vorschau und versuche es erneut.');
      result = { ...applyBundleMutation(current, operation, data.mutationId), lastMutationHash: mutationHash };
      // Deliberately merge only this field. Current turn, backups, timestamps,
      // comments and every mechanical record retain their original values.
      transaction.set(reference, { ...(snapshot.exists ? {} : { threadId }), commentPageBundles: { ...result, updatedAt: timestamp() } }, { merge: true });
    });
    return { metadata: result };
  } catch (error) {
    if (error instanceof CommentPageBundleError) throw new HttpsError(error.code, error.message);
    throw error;
  }
}

export const commitCommentPageBundle = onCall({ region: 'europe-west1', maxInstances: 3, concurrency: 20, enforceAppCheck: false, timeoutSeconds: 30 }, request => commitCommentPageBundleOperation(request));
