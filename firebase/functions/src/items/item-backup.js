import { FieldPath, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { normalizeItemDefinition, itemDefinitionKey, itemDefinitionContent } from '../generated/item-definitions/item-definition-model.js';
import { readItemDefinition } from './item-definition-repository.js';

export const ITEM_BACKUP_COLLECTIONS = Object.freeze(['item_definition_versions', 'item_definitions', 'item_unique_claims',
  'item_register_offers', 'item_vendor_wallets', 'item_award_claims', 'item_definition_transactions', 'item_record_transactions',
  'item_migration_transactions', 'item_register_transactions', 'inventory_transfer_transactions', 'loot_claim_transactions',
  'herausforderung_claims', 'herausforderung_effect_claims', 'mechanical_comment_transactions']);
export async function restoreItemBackupRecords(database, collectionName, records) {
  if (!ITEM_BACKUP_COLLECTIONS.includes(collectionName) || !Array.isArray(records) || records.length > 100 || JSON.stringify(records).length > 6000000) throw new HttpsError('invalid-argument', 'Der Item-Backupabschnitt ist ungültig.');
  return database.runTransaction(async transaction => {
    const pending = [];
    for (const record of records) {
      const { id, data } = record;
      if (!id || String(id).includes('/') || String(id).length > 1000 || !data || typeof data !== 'object') throw new HttpsError('invalid-argument', 'Ein Backupdatensatz besitzt keine gültige Kennung.');
      const ref = database.collection(collectionName).doc(id), before = await transaction.get(ref);
      if (['item_definition_versions', 'item_definitions'].includes(collectionName)) {
        const definition = normalizeItemDefinition(data);
        if ((collectionName === 'item_definition_versions' ? itemDefinitionKey(definition) : definition.id) !== id) throw new HttpsError('invalid-argument', 'Die Itemversion stimmt nicht mit ihrer Backupkennung überein.');
        if (collectionName === 'item_definition_versions' && before.exists && itemDefinitionContent(before.data()) !== itemDefinitionContent(data)) throw new HttpsError('failed-precondition', 'Ein Backup darf eine vorhandene Itemversion nicht überschreiben.');
        if (collectionName === 'item_definitions') await readItemDefinition(database, transaction, definition);
      }
      if (collectionName === 'item_unique_claims') {
        if (data.definitionId !== id || !data.instanceId) throw new HttpsError('invalid-argument', 'Eine Unikatbindung ist ungültig.');
        if (before.exists && before.data().instanceId !== data.instanceId) throw new HttpsError('already-exists', 'Das Backup enthält eine abweichende Unikatbindung.');
      }
      // Existing stock, wallets, claims and receipts remain authoritative. A
      // restore fills missing data; it never rewinds a later transaction.
      if (!before.exists) pending.push({ ref, data });
    }
    for (const write of pending) transaction.create(write.ref, write.data);
    return { restored: pending.length, retained: records.length - pending.length };
  });
}
export const itemBackup = onCall({ region: 'europe-west1', timeoutSeconds: 60, maxInstances: 3 }, async request => {
  if (!request.auth || !['admin', 'moderator'].includes(request.auth.token?.aleriaRole)) throw new HttpsError('permission-denied', 'Vollständige Item-Backups verwaltet die Spielleitung.');
  const input = request.data || {}, database = getFirestore();
  if (input.action === 'collections') return { collections: ITEM_BACKUP_COLLECTIONS };
  if (!ITEM_BACKUP_COLLECTIONS.includes(input.collection)) throw new HttpsError('invalid-argument', 'Unbekannte Item-Backupart.');
  if (input.action === 'restore') return restoreItemBackupRecords(database, input.collection, input.records);
  if (input.action !== 'export') throw new HttpsError('invalid-argument', 'Unbekannter Backupauftrag.');
  let query = database.collection(input.collection).orderBy(FieldPath.documentId()).limit(100);
  if (input.cursor) query = query.startAfter(String(input.cursor));
  const result = await query.get();
  return { records: result.docs.map(snapshot => ({ id: snapshot.id, data: snapshot.data() })), cursor: result.size === 100 ? result.docs.at(-1).id : null };
});
