import { createHash } from 'node:crypto';
import { getFirestore } from 'firebase-admin/firestore';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { buildCommentThreadActivity } from '../generated/comments/comment-activity-preview.js';

export const COMMENT_ACTIVITY_FIELDS = ['entryId', 'charName', 'name', 'portrait', 'narrator', 'text', 'commentSegments', 'activityAtClient', 'activityAt', 'updatedAtClient', 'updatedAt', 'editedAt', 'createdAtClient', 'createdAtMs', 'createdAt', 'ts', 'orderKey'];
export const activityDocumentId = threadId => createHash('sha256').update(threadId).digest('hex');

export function compareActivityReadTimes(left, right) {
  return Number(left?.seconds || 0) - Number(right?.seconds || 0) || Number(left?.nanoseconds || 0) - Number(right?.nanoseconds || 0);
}

export async function refreshCommentThreadActivity(threadId, database = getFirestore()) {
  if (!threadId) return;
  // A projected query is a consistent snapshot and never locks/writes live
  // comments. Only the small derived activity document is written below.
  const snapshot = await database.collection('comments').where('entryId', '==', threadId).select(...COMMENT_ACTIVITY_FIELDS).get();
  const value = buildCommentThreadActivity(threadId, snapshot.docs.map(document => ({ ...document.data(), id: document.id })));
  const ref = database.collection('comment_activity').doc(activityDocumentId(threadId));
  return database.runTransaction(async transaction => {
    const current = (await transaction.get(ref)).data();
    if (current?.capturedAt && compareActivityReadTimes(current.capturedAt, snapshot.readTime) >= 0) return;
    transaction.set(ref, { ...value, capturedAt: snapshot.readTime });
  });
}

export const indexCommentActivity = onDocumentWritten({ document: 'comments/{commentId}', region: 'europe-west1', maxInstances: 2, concurrency: 4, timeoutSeconds: 60, retry: true }, async event => {
  const threads = new Set([event.data?.before.data()?.entryId, event.data?.after.data()?.entryId].filter(Boolean));
  for (const threadId of threads) await refreshCommentThreadActivity(threadId);
});
