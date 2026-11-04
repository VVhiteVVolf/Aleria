import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import { parseSceneThread } from '../backup/scene-backup-format.js';

export async function prepareGroupInventoryScene(database, transaction, account, threadId, details) {
  if (!threadId) return { write() {} };
  const location = parseSceneThread(threadId);
  const linked = [account.group.threadId, ...(account.group.sceneThreads || [])].includes(threadId);
  if (!location || (!linked && location.moduleId !== account.record.id)) throw new HttpsError('invalid-argument', 'Der Szenenthread ist nicht mit dieser Gruppe verknüpft.');
  let entry = account.entry;
  if (location.moduleId !== account.record.id) {
    const stored = (await transaction.get(database.doc(`module_store_entries/${encodeURIComponent(location.moduleId).replace(/\./g, '%2E')}`))).data();
    entry = stored?.entryJson ? JSON.parse(stored.entryJson) : stored?.entry;
  }
  const page = entry?.pages?.find((page, index) => page.sessionPage && String(page.commentThreadKey || index) === location.pageKey);
  const turn = await transaction.get(database.doc(`comment_turns/${threadId}`));
  if (entry?.id !== location.moduleId || entry.hidden || entry.archived || entry.isTemplate || !page || page.sessionStatus === 'ended' || turn.data()?.current === 'ended') {
    throw new HttpsError('failed-precondition', 'Die verknüpfte Szene fehlt oder ist bereits abgeschlossen.');
  }
  const reference = database.collection('comments').doc();
  return { commentId: reference.id, write() {
    transaction.create(reference, { entryId: threadId, text: details.text, charName: 'Erzähler', narrator: true,
      characterId: '', avatarKind: 'narrator', commentMode: 'scene-inventory-transfer', commentKind: 'scene-inventory-transfer-event',
      sceneInventoryTransfer: { ...details.transfer, presentation: 'compact' }, inventoryTransaction: { schemaVersion: 3, validatedBy: 'commitGroupInventory', group: true, operations: 1 },
      serverValidatedMechanics: true, serverCommitted: true, createdBy: details.actorUid, createdByRole: details.role,
      schemaVersion: 3, orderKey: details.orderKey, createdAtClient: details.orderKey,
      ts: FieldValue.serverTimestamp(), activityAt: FieldValue.serverTimestamp() });
  } };
}
