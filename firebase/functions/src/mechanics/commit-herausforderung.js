import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { createHash } from 'node:crypto';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { getHerausforderungValidationIssues, normalizeHerausforderungEvent } from '../generated/herausforderung/herausforderung-model.js';
import { bindHerausforderungCombatContext } from './herausforderung-combat-effects.js';
import { assertHerausforderungRewardAuthority, prepareHerausforderungRewards } from './herausforderung-rewards.js';

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
    if (Buffer.byteLength(serialized, 'utf8') > MAX_COMMENT_BYTES) fail('invalid-argument', 'Die Herausforderung ist zu groß.');
    return JSON.parse(serialized);
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    fail('invalid-argument', 'Die Herausforderung enthält ungültige Daten.');
  }
}

export function validateHerausforderungEvent(event = {}) {
  return getHerausforderungValidationIssues(event)[0]?.message || null;
}

export async function commitHerausforderungOperation(request, { database = getFirestore(), now = Date.now() } = {}) {
  if (!request.auth) fail('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const payload = clonePayload(request.data);
  const entryId = clean(payload.entryId, 240);
  const text = clean(payload.text);
  const metadata = clonePayload(payload.metadata);
  const validationError = validateHerausforderungEvent(metadata.herausforderung);
  const event = normalizeHerausforderungEvent(metadata.herausforderung);
  if (!entryId || !text) fail('invalid-argument', 'Kommentarbereich und Text sind erforderlich.');
  if (validationError) fail('invalid-argument', validationError);
  assertHerausforderungRewardAuthority(event, request.auth);

  const operationId = clean(metadata.operationId, 80);
  if (operationId && !/^[a-zA-Z0-9-]{8,80}$/.test(operationId)) fail('invalid-argument', 'Die Vorgangskennung ist ungültig.');
  const fingerprint = createHash('sha256').update(JSON.stringify({ entryId, event: metadata.herausforderung })).digest('hex');
  const operationKey = operationId ? 'challenge-' + createHash('sha256').update(request.auth.uid + '\u0000' + operationId).digest('hex') : '';
  const ref = operationKey ? database.collection('comments').doc(operationKey) : database.collection('comments').doc();
  await database.runTransaction(async transaction => {
    if (operationKey) {
      const existing = await transaction.get(ref);
      if (existing.exists) {
        if (existing.data().herausforderungFingerprint !== fingerprint) fail('failed-precondition', 'Dieser Vorgang wurde bereits mit anderem Inhalt gespeichert.');
        return;
      }
    }
    await bindHerausforderungCombatContext(database, transaction, event, entryId);
    await prepareHerausforderungRewards(database, transaction, event);
    transaction.create(ref, {
      entryId,
      charName: 'Erzähler',
      charTitle: '',
      portrait: null,
      text,
      deleteCodeHash: clean(payload.deleteCodeHash, 128),
      deleteCodeVersion: 1,
      narrator: true,
      characterId: '',
      avatarKind: 'narrator',
      commentMode: 'herausforderung',
      commentKind: 'herausforderung-event',
      commentSegments: null,
      herausforderung: event,
      herausforderungFingerprint: fingerprint,
      herausforderungTransaction: {
        schemaVersion: 1,
        transactionId: ref.id,
        validatedBy: 'commitHerausforderung'
      },
      serverValidatedMechanics: true,
      mechanicalAudit: true,
      createdBy: request.auth.uid,
      createdByRole: String(request.auth.token?.aleriaRole || 'player'),
      orderKey: Number.isFinite(Number(metadata.orderKey)) ? Number(metadata.orderKey) : now,
      createdAtClient: now,
      activityAtClient: now,
      activityAt: FieldValue.serverTimestamp(),
      schemaVersion: 3,
      ts: FieldValue.serverTimestamp()
    });
  });
  return { id: ref.id };
}

export const commitHerausforderung = onCall({
  region: 'europe-west1', maxInstances: 10, concurrency: 20, enforceAppCheck: false, timeoutSeconds: 20
}, request => commitHerausforderungOperation(request));
