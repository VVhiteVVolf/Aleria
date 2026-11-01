import { FieldPath, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
export const QUEST_BACKUP_COLLECTIONS = Object.freeze(['quests', 'quest_runs', 'quest_events', 'quest_reward_claims', 'quest_transactions', 'group_quest_accounts', 'group_inventory_transactions']);
export async function restoreQuestBackup(database, name, records) {
  if (!QUEST_BACKUP_COLLECTIONS.includes(name) || !Array.isArray(records) || records.length > 100 || JSON.stringify(records).length > 6000000) throw new HttpsError('invalid-argument', 'Ungültiger Quest-Backupabschnitt.');
  return database.runTransaction(async transaction => {
    const missing = [];
    for (const row of records) {
      if (!/^[\w:.-]{1,300}$/.test(row.id || '') || !row.data || typeof row.data !== 'object') throw new HttpsError('invalid-argument', 'Ungültiger Quest-Backupeintrag.');
      const ref = database.collection(name).doc(row.id), before = await transaction.get(ref);
      // Never rewind a party or reopen an already paid reward.
      if (!before.exists) missing.push({ ref, data: row.data });
    }
    for (const row of missing) transaction.create(row.ref, row.data);
    return { restored: missing.length, retained: records.length - missing.length };
  });
}
export const questBackup = onCall({ region: 'europe-west1', timeoutSeconds: 60, maxInstances: 3 }, async request => {
  if (!request.auth || !['admin','moderator'].includes(request.auth.token?.aleriaRole)) throw new HttpsError('permission-denied', 'Quest-Backups verwaltet die Spielleitung.');
  const input = request.data || {}, database = getFirestore();
  if (input.action === 'collections') return { collections: QUEST_BACKUP_COLLECTIONS };
  if (!QUEST_BACKUP_COLLECTIONS.includes(input.collection)) throw new HttpsError('invalid-argument', 'Unbekannte Quest-Backupart.');
  if (input.action === 'restore') return restoreQuestBackup(database, input.collection, input.records);
  if (input.action !== 'export') throw new HttpsError('invalid-argument', 'Unbekannter Quest-Backupauftrag.');
  let query = database.collection(input.collection).orderBy(FieldPath.documentId()).limit(100);
  if (input.cursor) query = query.startAfter(String(input.cursor));
  const snapshot = await query.get();
  return { records: snapshot.docs.map(row => ({ id: row.id, data: row.data() })), cursor: snapshot.size === 100 ? snapshot.docs.at(-1).id : null };
});
