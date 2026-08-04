import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { MIN_HERAUSFORDERUNG_APPROACHES, normalizeHerausforderungEvent } from '../generated/herausforderung/herausforderung-model.js';

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
  if (!event.publicDescription) return 'Eine öffentliche Beschreibung ist erforderlich.';
  if (event.approaches.length < MIN_HERAUSFORDERUNG_APPROACHES) return 'Mindestens ein Ansatz ist erforderlich.';
  if (event.approaches.some(approach => !approach.preferredSkills.length || !approach.insight)) {
    return 'Jeder Ansatz braucht mindestens eine passende Fertigkeit und eine verdeckte Erkenntnis.';
  }
  return null;
}

export const commitHerausforderung = onCall({
  region: 'europe-west1',
  maxInstances: 10,
  concurrency: 20,
  enforceAppCheck: false,
  timeoutSeconds: 20
}, async request => {
  if (!request.auth) fail('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const payload = clonePayload(request.data);
  const entryId = clean(payload.entryId, 240);
  const text = clean(payload.text);
  const metadata = clonePayload(payload.metadata);
  const event = normalizeHerausforderungEvent(metadata.herausforderung);
  if (!entryId || !text) fail('invalid-argument', 'Kommentarbereich und Text sind erforderlich.');
  const validationError = validateHerausforderungEvent(event);
  if (validationError) fail('invalid-argument', validationError);

  const database = getFirestore();
  const ref = database.collection('comments').doc();
  const now = Date.now();
  await ref.create({
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
  return { id: ref.id };
});
