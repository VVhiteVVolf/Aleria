import { randomUUID } from 'node:crypto';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { applySceneInventoryTransfer } from '../generated/scene-inventory/scene-inventory-transfer-model.js';
import { withProtectedRecordRevisions } from './protected-record-revisions.js';
import { canManageCharacter } from '../generated/item-register/item-register-model.js';

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
    fail('invalid-argument', 'Geber, Empfänger und Szene müssen eindeutig sein.');
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
    if (!giverSnapshot.exists || !receiverSnapshot.exists) fail('not-found', 'Geber oder Empfänger wurde nicht gefunden.');
    const giver = { id: giverId, ...(giverSnapshot.data() || {}) };
    const receiver = { id: receiverId, ...(receiverSnapshot.data() || {}) };
    const role = String(request.auth.token?.aleriaRole || 'player');
    if (!canManageCharacter(giver, { uid: request.auth.uid, authenticated: true, canModerate: ['admin', 'moderator'].includes(role) })) fail('permission-denied', 'Nur der Besitzer oder die Spielleitung kann Gegenstände dieser Figur übergeben.');
    if (submittedObject.kind === 'register-item' && !['admin', 'moderator', 'editor'].includes(role)) fail('permission-denied', 'Bitte Waren über das Güterregister kaufen. Freie Zuteilungen erstellt die Spielleitung.');
    const characterLocks = await Promise.all([giverId, receiverId].map(id => transaction.get(database.doc(`combat_profile_locks/characters/records/${id}`))));
    if (characterLocks.some(snap => snap.data()?.activeEncounterKeys?.length)) fail('failed-precondition', 'Eine der Figuren nimmt gerade an einem Kampf teil.');
    const sourceItem = (giver.inventory?.items || []).find(item => item.id === submittedObject.itemId);
    const linkedCreatureRef = sourceItem?.creatureId ? database.collection('creatures').doc(sourceItem.creatureId) : null;
    const linkedCreatureSnapshot = linkedCreatureRef ? await transaction.get(linkedCreatureRef) : null;
    if (linkedCreatureRef && (!linkedCreatureSnapshot.exists || linkedCreatureSnapshot.data().itemOrigin?.ownerCharacterId !== giverId)) fail('failed-precondition', 'Die Begleiterverknüpfung wurde geändert.');
    if (linkedCreatureRef) {
      const lock = await transaction.get(database.doc(`combat_profile_locks/creatures/records/${linkedCreatureRef.id}`));
      if (lock.data()?.activeEncounterKeys?.length) fail('failed-precondition', 'Der Begleiter nimmt gerade an einem Kampf teil.');
    }
    try {
      result = applySceneInventoryTransfer(giver, receiver, submittedObject, {
        allowRegisterItem: true,
        transferItemId: `transfer-${randomUUID()}`,
        transferredAt: now.toISOString()
      });
    } catch (error) {
      fail('failed-precondition', error?.message || 'Die Inventarübergabe ist nicht mehr gültig.');
    }

    if (linkedCreatureRef) transaction.update(linkedCreatureRef, { itemOrigin: { ...linkedCreatureSnapshot.data().itemOrigin,
      ownerCharacterId: receiverId, ownerCharacterName: receiver.name || '', disposition: 'owned' }, updatedAt: now.toISOString() });
    transaction.update(giverRef, withProtectedRecordRevisions(giver, {
      inventory: result.giverInventory,
      combatProfile: result.giverCombatProfile,
      updatedAt: now.toISOString()
    }, ['inventory', 'combatProfile'], now.getTime()));
    transaction.update(receiverRef, withProtectedRecordRevisions(receiver, {
      inventory: result.receiverInventory,
      combatProfile: result.receiverCombatProfile,
      updatedAt: now.toISOString()
    }, ['inventory', 'combatProfile'], now.getTime()));
    const transfer = {
      transferId: randomUUID(),
      giver: { id: giverId, name: clean(giver.name, 160), portrait: clean(giver.portrait, 2000) },
      receiver: { id: receiverId, name: clean(receiver.name, 160), portrait: clean(receiver.portrait, 2000) },
      object: { ...result.object, visualIcon: clean(submittedObject.visualIcon, 2000) },
      flavour: clean(submittedTransfer.flavour, 3000),
      createdAt: now.toISOString(),
      schemaVersion: 2
    };
    const text = `${giver.name || 'Eine Figur'} übergibt ${receiver.name || 'einer Figur'} ${result.object.name || 'einen Gegenstand'}.`;
    transaction.create(commentRef, {
      entryId,
      charName: 'Erzähler',
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
