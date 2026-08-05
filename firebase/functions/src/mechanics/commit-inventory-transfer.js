import { randomUUID } from 'node:crypto';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { applySceneInventoryTransfer } from '../generated/scene-inventory/scene-inventory-transfer-model.js';

function fail(code, message) {
  throw new HttpsError(code, message);
}

function clean(value, maximum = 250000) {
  return String(value || '').trim().slice(0, maximum);
}

export const commitInventoryTransfer = onCall({
  region: 'europe-west1',
  maxInstances: 10,
  concurrency: 20,
  enforceAppCheck: false,
  timeoutSeconds: 30
}, async request => {
  if (!request.auth) fail('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const input = JSON.parse(JSON.stringify(request.data || {}));
  const giverId = clean(input.giverId, 240);
  const receiverId = clean(input.receiverId, 240);
  const entryId = clean(input.entryId, 240);
  const submittedEvent = input.sceneEvent && typeof input.sceneEvent === 'object' ? input.sceneEvent : {};
  const submittedTransfer = submittedEvent.transfer && typeof submittedEvent.transfer === 'object' ? submittedEvent.transfer : {};
  const submittedObject = submittedTransfer.object && typeof submittedTransfer.object === 'object' ? submittedTransfer.object : {};
  if (!giverId || !receiverId || giverId === receiverId || !entryId) {
    fail('invalid-argument', 'Geber, EmpfÃ¤nger und Szene mÃ¼ssen eindeutig sein.');
  }

  const database = getFirestore();
  const giverRef = database.collection('characters').doc(giverId);
  const receiverRef = database.collection('characters').doc(receiverId);
  const commentRef = database.collection('comments').doc();
  const now = new Date();
  let result;

  await database.runTransaction(async transaction => {
    const [giverSnapshot, receiverSnapshot] = await Promise.all([
      transaction.get(giverRef),
      transaction.get(receiverRef)
    ]);
    if (!giverSnapshot.exists || !receiverSnapshot.exists) fail('not-found', 'Geber oder EmpfÃ¤nger wurde nicht gefunden.');
    const giver = { id: giverId, ...(giverSnapshot.data() || {}) };
    const receiver = { id: receiverId, ...(receiverSnapshot.data() || {}) };
    try {
      result = applySceneInventoryTransfer(giver, receiver, submittedObject, {
        allowRegisterItem: true,
        transferItemId: `transfer-${randomUUID()}`,
        transferredAt: now.toISOString()
      });
    } catch (error) {
      fail('failed-precondition', error?.message || 'Die InventarÃ¼bergabe ist nicht mehr gÃ¼ltig.');
    }

    transaction.update(giverRef, { inventory: result.giverInventory, updatedAt: now.toISOString() });
    transaction.update(receiverRef, { inventory: result.receiverInventory, updatedAt: now.toISOString() });
    const transfer = {
      transferId: randomUUID(),
      giver: { id: giverId, name: clean(giver.name, 160), portrait: clean(giver.portrait, 2000) },
      receiver: { id: receiverId, name: clean(receiver.name, 160), portrait: clean(receiver.portrait, 2000) },
      object: { ...result.object, visualIcon: clean(submittedObject.visualIcon, 2000) },
      flavour: clean(submittedTransfer.flavour, 3000),
      createdAt: now.toISOString(),
      schemaVersion: 2
    };
    const text = `${giver.name || 'Eine Figur'} Ã¼bergibt ${receiver.name || 'einer Figur'} ${result.object.name || 'einen Gegenstand'}.`;
    transaction.create(commentRef, {
      entryId,
      charName: 'ErzÃ¤hler',
      charTitle: '',
      portrait: null,
      text,
      deleteCodeHash: clean(input.deleteCodeHash, 128),
      deleteCodeVersion: 1,
      narrator: true,
      characterId: '',
      avatarKind: 'narrator',
      commentMode: 'scene-inventory-transfer',
      commentKind: 'scene-inventory-transfer-event',
      commentSegments: null,
      sceneInventoryTransfer: transfer,
      inventoryTransaction: {
        schemaVersion: 2,
        transactionId: commentRef.id,
        operations: 1,
        transfer: true,
        validatedBy: 'commitInventoryTransfer'
      },
      serverValidatedMechanics: true,
      orderKey: Number.isFinite(Number(submittedEvent.orderKey)) ? Number(submittedEvent.orderKey) : now.getTime(),
      createdAtClient: now.getTime(),
      activityAtClient: now.getTime(),
      activityAt: FieldValue.serverTimestamp(),
      createdBy: request.auth.uid,
      createdByRole: String(request.auth.token?.aleriaRole || 'player'),
      schemaVersion: 3,
      ts: FieldValue.serverTimestamp()
    });
  });

  return { id: commentRef.id, giverInventory: result.giverInventory, receiverInventory: result.receiverInventory };
});
