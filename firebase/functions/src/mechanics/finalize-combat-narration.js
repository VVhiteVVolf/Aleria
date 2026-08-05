import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { validateCombatNarration } from './combat-narration-integrity.js';

function fail(code, message) {
  throw new HttpsError(code, message);
}

function normalizeNarration(value = {}) {
  return {
    source: ['aleria-gpt', 'deterministic'].includes(value.source) ? value.source : 'deterministic',
    text: String(value.text || '').trim().slice(0, 4000),
    generatedAt: String(value.generatedAt || new Date().toISOString()).slice(0, 80)
  };
}

export const finalizeCombatNarration = onCall({
  region: 'europe-west1',
  maxInstances: 20,
  concurrency: 30,
  enforceAppCheck: false,
  timeoutSeconds: 15
}, async request => {
  if (!request.auth) fail('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const commentId = String(request.data?.commentId || '').trim();
  const submitted = Array.isArray(request.data?.narrations) ? request.data.narrations.slice(0, 30) : [];
  if (!commentId || !submitted.length) fail('invalid-argument', 'Kommentar und Erzählungen sind erforderlich.');
  const byResolutionId = new Map(submitted.map(entry => [
    String(entry?.resolutionId || ''),
    normalizeNarration(entry?.narration || {})
  ]).filter(([resolutionId, narration]) => resolutionId && narration.text));
  if (!byResolutionId.size) fail('invalid-argument', 'Es wurde keine gültige Kampferzählung übermittelt.');

  const database = getFirestore();
  const ref = database.collection('comments').doc(commentId);
  await database.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) fail('not-found', 'Der Kampfbeitrag wurde nicht gefunden.');
    const comment = snapshot.data() || {};
    if (comment.serverValidatedMechanics !== true || (!comment.combatTransaction && !comment.skillTransaction)) {
      fail('failed-precondition', 'Nur servergeprüfte Mechanikbeiträge können abgeschlossen werden.');
    }
    const segments = (Array.isArray(comment.commentSegments) ? comment.commentSegments : []).map(segment => {
      const originalCombatResolutions = Array.isArray(segment?.combatResolutions)
        ? segment.combatResolutions
        : (segment?.combatResolution ? [segment.combatResolution] : []);
      const combatResolutions = originalCombatResolutions.map(combatResolution => {
        const submittedCombatNarration = byResolutionId.get(String(combatResolution?.resolutionId || ''));
        const combatNarration = submittedCombatNarration
          ? validateCombatNarration(combatResolution, submittedCombatNarration)
          : null;
        return combatNarration && !combatResolution.narration?.text
          ? { ...combatResolution, narration: combatNarration }
          : combatResolution;
      });
      const combatResolution = combatResolutions[0] || null;
      const skillResolution = segment?.skillResolution;
      const skillNarration = byResolutionId.get(String(skillResolution?.resolutionId || ''));
      return {
        ...segment,
        ...(combatResolution ? { combatResolution } : {}),
        ...(combatResolutions.length > 1 ? { combatResolutions } : {}),
        ...(skillResolution && skillNarration && !skillResolution.narration?.text
          ? { skillResolution: { ...skillResolution, narration: skillNarration } }
          : {})
      };
    });
    const resolutions = segments.flatMap(segment => Array.isArray(segment?.combatResolutions)
      ? segment.combatResolutions
      : [segment?.combatResolution]).filter(Boolean);
    transaction.update(ref, {
      commentSegments: segments,
      combatResolution: resolutions.length === 1 ? resolutions[0] : null,
      narrationFinalizedAt: FieldValue.serverTimestamp(),
      activityAt: FieldValue.serverTimestamp()
    });
  });
  return { commentId, finalized: byResolutionId.size };
});
