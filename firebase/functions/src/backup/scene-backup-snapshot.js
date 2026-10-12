import { FieldPath } from 'firebase-admin/firestore';
import { gzipSync, gunzipSync } from 'node:zlib';
import { buildSceneBackupFiles, validateSceneModule } from './scene-backup-format.js';

const MAX_SNAPSHOT_BYTES = 80 * 1024 * 1024;

function sectionMetadata(section) {
  return Object.fromEntries(['key', 'tab', 'desc', 'path', 'nodeId', 'iconUrl'].filter(key => section[key] !== undefined).map(key => [key, section[key]]));
}

function moduleFromStore(config, storedEntry, fallback) {
  const moduleId = fallback.entry.id;
  const manifest = config?.moduleStoreManifest;
  if (manifest?.format === 'split-v1') {
    const section = manifest.customSections?.find(item => item.entryIds?.includes(moduleId));
    const registered = section || manifest.entryOverrideIds?.includes(moduleId);
    if (!registered) return { modulePayload: fallback, moduleSource: 'browser-export' };
    const entry = storedEntry?.entryJson ? JSON.parse(storedEntry.entryJson) : storedEntry?.entry;
    if (!entry) throw new Error('Der gespeicherte Modulstand ist unvollständig.');
    const movedSection = manifest.moduleSectionMoves?.[moduleId];
    return { modulePayload: { ...fallback, entry, section: sectionMetadata(movedSection || section || fallback.section) }, moduleSource: 'firestore-split-v1' };
  }
  const store = config?.moduleStoreData ? JSON.parse(config.moduleStoreData) : config?.moduleStore;
  const section = store?.customSections?.find(item => item.entries?.some(entry => entry.id === moduleId));
  const entry = store?.entryOverrides?.[moduleId] || section?.entries.find(item => item.id === moduleId);
  return entry
    ? { modulePayload: { ...fallback, entry, section: sectionMetadata(store.moduleSectionMoves?.[moduleId] || section || fallback.section) }, moduleSource: 'firestore-legacy' }
    : { modulePayload: fallback, moduleSource: 'browser-export' };
}

export async function captureSceneBackup(database, job) {
  const fallback = JSON.parse(job.moduleJson);
  const moduleId = fallback.entry.id;
  const prefix = `${moduleId}::`;
  const captured = await database.runTransaction(async transaction => {
    const [config, entry, direct, related, directTurn, relatedTurns] = await Promise.all([
      transaction.get(database.doc('char_tabs/config')),
      transaction.get(database.collection('module_store_entries').doc(encodeURIComponent(moduleId).replace(/\./g, '%2E'))),
      transaction.get(database.collection('comments').where('entryId', '==', moduleId)),
      transaction.get(database.collection('comments').where('entryId', '>=', prefix).where('entryId', '<', `${prefix}\uf8ff`)),
      transaction.get(database.collection('comment_turns').doc(moduleId)),
      transaction.get(database.collection('comment_turns').where(FieldPath.documentId(), '>=', prefix).where(FieldPath.documentId(), '<', `${prefix}\uf8ff`))
    ]);
    return {
      ...moduleFromStore(config.data(), entry.data(), fallback),
      comments: [...direct.docs, ...related.docs].map(doc => ({ ...doc.data(), id: doc.id })),
      turns: [...(directTurn.exists ? [directTurn] : []), ...relatedTurns.docs].map(doc => ({ ...doc.data(), id: doc.id, threadId: doc.id })),
      capturedAt: config.readTime.toDate().toISOString()
    };
  }, { readOnly: true });
  validateSceneModule(captured.modulePayload, job.threadId);
  // Preserve this closure even if the scene has already been reopened while the job waited.
  captured.turns = captured.turns.filter(turn => turn.threadId !== job.threadId);
  captured.turns.push({ id: job.threadId, threadId: job.threadId, current: 'ended', updatedAt: job.requestedAt });
  return buildSceneBackupFiles({ ...captured, threadId: job.threadId, backupId: job.id, requestedAt: job.requestedAt });
}

export async function getFrozenSceneBackup({ bucket, database, job }) {
  const file = bucket.file(`scene-backup-staging/${job.id}/snapshot.json.gz`);
  try {
    const [bytes] = await file.download();
    return JSON.parse(gunzipSync(bytes, { maxOutputLength: MAX_SNAPSHOT_BYTES }).toString('utf8'));
  } catch (error) {
    if (Number(error.code) !== 404) throw error;
  }
  const snapshot = await captureSceneBackup(database, job);
  const serialized = JSON.stringify(snapshot);
  if (Buffer.byteLength(serialized) > MAX_SNAPSHOT_BYTES || snapshot.files.some(item => Buffer.byteLength(item.content) > 50 * 1024 * 1024)) {
    const error = new Error('Der Szenenexport überschreitet die Größe einer automatischen GitHub-Sicherung.');
    error.retryable = false;
    throw error;
  }
  try {
    await file.save(gzipSync(serialized), {
      resumable: false, validation: 'crc32c', preconditionOpts: { ifGenerationMatch: 0 },
      metadata: { contentType: 'application/gzip', cacheControl: 'no-store' }
    });
  } catch (error) {
    if (Number(error.code) !== 412) throw error;
    const [bytes] = await file.download();
    return JSON.parse(gunzipSync(bytes, { maxOutputLength: MAX_SNAPSHOT_BYTES }).toString('utf8'));
  }
  return snapshot;
}
