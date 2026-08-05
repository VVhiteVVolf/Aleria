import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

const COLLECTIONS = Object.freeze({
  characters: 'characters',
  creatures: 'creatures',
  comments: 'comments',
  commentTurns: 'comment_turns'
});
const MAX_RECORDS = 350;
const MAX_PAYLOAD_BYTES = 8_000_000;

function fail(code, message) {
  throw new HttpsError(code, message);
}

function clonePayload(value) {
  try {
    const serialized = JSON.stringify(value || {});
    if (Buffer.byteLength(serialized, 'utf8') > MAX_PAYLOAD_BYTES) {
      fail('invalid-argument', 'Dieser Importabschnitt ist zu groÃŸ.');
    }
    return JSON.parse(serialized);
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    fail('invalid-argument', 'Der Import enthÃ¤lt ungÃ¼ltige Daten.');
  }
}

function cleanId(value) {
  const id = String(value || '').trim();
  if (!id || id.includes('/')) fail('invalid-argument', 'Ein Importdatensatz besitzt keine gÃ¼ltige ID.');
  return id.slice(0, 512);
}

function isMechanicalComment(comment = {}) {
  const segments = Array.isArray(comment.commentSegments) ? comment.commentSegments : [];
  return !!(
    comment.combatResolution
    || comment.combatTransaction
    || comment.inventoryTransaction
    || comment.restTransaction
    || comment.sceneRest
    || comment.sceneInventoryTransfer
    || comment.sceneDiceRoll
    || comment.sceneTimeEvent
    || segments.some(segment => segment?.combatResolution || segment?.skillResolution || segment?.inventoryUse)
  );
}

function normalizeImportedComment(record, request, importedAt) {
  const sourceValidated = record.serverValidatedMechanics === true;
  const mechanical = isMechanicalComment(record);
  return {
    ...record,
    ...(mechanical ? {
      serverValidatedMechanics: false,
      sourceServerValidatedMechanics: sourceValidated,
      importedHistoricalMechanics: true,
      importStateAuthority: 'profile-snapshot'
    } : {}),
    importedAt,
    importedBy: request.auth.uid,
    activityAt: FieldValue.serverTimestamp()
  };
}

function normalizeRecord(kind, input, request, importedAt) {
  const source = input && typeof input === 'object' ? { ...input } : {};
  delete source.id;
  if (kind === 'comments') return normalizeImportedComment(source, request, importedAt);
  if (kind === 'commentTurns') {
    source.threadId = String(source.threadId || input?.id || '').trim();
  }
  return {
    ...source,
    importedAt,
    importedBy: request.auth.uid
  };
}

export const importBackupRecords = onCall({
  region: 'europe-west1',
  maxInstances: 3,
  concurrency: 5,
  enforceAppCheck: false,
  timeoutSeconds: 60
}, async request => {
  if (!request.auth) fail('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const payload = clonePayload(request.data);
  const kind = String(payload.kind || '');
  const collectionName = COLLECTIONS[kind];
  if (!collectionName) fail('invalid-argument', 'Unbekannte Importart.');
  const records = Array.isArray(payload.records) ? payload.records : [];
  if (!records.length || records.length > MAX_RECORDS) {
    fail('invalid-argument', `Ein Importabschnitt muss 1 bis ${MAX_RECORDS} DatensÃ¤tze enthalten.`);
  }

  const database = getFirestore();
  const batch = database.batch();
  const importedAt = new Date().toISOString();
  records.forEach(record => {
    const id = cleanId(record?.id || (kind === 'commentTurns' ? record?.threadId : ''));
    const ref = database.collection(collectionName).doc(id);
    batch.set(ref, normalizeRecord(kind, record, request, importedAt), { merge: false });
  });
  await batch.commit();
  return { kind, imported: records.length, stateAuthority: kind === 'comments' ? 'profile-snapshot' : null };
});

export const backupImportInternals = Object.freeze({ isMechanicalComment, normalizeImportedComment });
