import { HttpsError } from 'firebase-functions/v2/https';
import { isTrustedSceneContributionComment } from '../mechanics/trusted-scene-history.js';

// Evidence is a reference to the existing receipt, never a copy of combat stats.
export async function readQuestEvidence(database, transaction, run, id) {
  const snapshot = await transaction.get(database.doc(`comments/${id}`));
  const comment = snapshot.data();
  if (!snapshot.exists || !run.links.scenes.includes(comment.entryId) || !isTrustedSceneContributionComment(comment) || comment.mechanicalUndone === true || comment.undoneAt) {
    throw new HttpsError('failed-precondition', 'Der Beleg gehört nicht zu einer verknüpften Szene oder wurde zurückgenommen.');
  }
  return { commentId: id, entryId: comment.entryId };
}
