import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { buildNarrativeCommentDocument } from '../comments/commit-narrative-comment.js';
import { deriveCombatRuleFrequencyKeys } from '../generated/combat/combat-trigger-rules.js';
import { getTrustedSceneDay, isTrustedMechanicalComment, sortSceneHistory } from './trusted-scene-history.js';
import { skillSegments, validateSkillCommentSegments } from './skill-comment-validator.js';

const MAX_COMMENT_BYTES = 700_000;

function fail(code, message) {
  throw new HttpsError(code, message);
}

function clean(value, maximum = 250000) {
  return String(value || '').trim().slice(0, maximum);
}

function clonePayload(value) {
  try {
    const serialized = JSON.stringify(value || {});
    if (Buffer.byteLength(serialized, 'utf8') > MAX_COMMENT_BYTES) fail('invalid-argument', 'Der Fertigkeitsbeitrag ist zu gro\u00df.');
    return JSON.parse(serialized);
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    fail('invalid-argument', 'Der Fertigkeitsbeitrag enth\u00e4lt ung\u00fcltige Daten.');
  }
}

export const commitSkillComment = onCall({
  region: 'europe-west1',
  maxInstances: 20,
  concurrency: 30,
  enforceAppCheck: false,
  timeoutSeconds: 30
}, async request => {
  if (!request.auth) fail('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const payload = clonePayload(request.data);
  const entryId = clean(payload.entryId, 240);
  if (!entryId || !clean(payload.text) || !skillSegments(payload.metadata).length) {
    fail('invalid-argument', 'Kommentarbereich, Text und Fertigkeitswurf sind erforderlich.');
  }
  const database = getFirestore();
  const ref = database.collection('comments').doc();
  const now = Date.now();
  let document;
  await database.runTransaction(async transaction => {
    const snapshot = await transaction.get(database.collection('comments').where('entryId', '==', entryId));
    const allHistory = sortSceneHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    const trustedHistory = allHistory.filter(isTrustedMechanicalComment);
    const sceneDay = getTrustedSceneDay(allHistory);
    const rulePeriods = { comment: ref.id, scene: entryId, day: `scene:${entryId}:day-${sceneDay}` };
    const validated = await validateSkillCommentSegments({
      database,
      transaction,
      request,
      metadata: payload.metadata,
      history: trustedHistory,
      rulePeriods,
      usedRuleFrequencyKeys: deriveCombatRuleFrequencyKeys(trustedHistory, rulePeriods)
    });
    const metadata = { ...payload.metadata, commentSegments: validated.commentSegments };
    document = {
      ...buildNarrativeCommentDocument({ ...payload, metadata }, entryId, request, now),
      commentSegments: validated.commentSegments,
      skillTransaction: {
        schemaVersion: 1,
        transactionId: ref.id,
        validatedBy: 'commitSkillComment',
        committedAtClient: now
      },
      serverValidatedMechanics: true,
      mechanicalAudit: true,
      activityAt: FieldValue.serverTimestamp(),
      ts: FieldValue.serverTimestamp()
    };
    transaction.create(ref, document);
  });
  return {
    id: ref.id,
    mechanics: { commentSegments: document.commentSegments }
  };
});
