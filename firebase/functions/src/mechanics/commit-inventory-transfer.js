import { createHash, randomUUID } from 'node:crypto';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { applySceneInventoryTransfer } from '../generated/scene-inventory/scene-inventory-transfer-model.js';
import { withProtectedRecordRevisions } from './protected-record-revisions.js';
import { canManageCharacter } from '../generated/item-register/item-register-model.js';
import { resolveRegisterItemTemplate } from './item-register-template.js';
import { productWithItemDefinition, prepareTemplateDefinition, prepareUniqueItemClaims, readItemDefinitionIndex } from '../items/item-definition-repository.js';
import { transferredEquipmentProfile } from '../items/item-transfer-equipment.js';
import { commitSceneMoneyTransferOperation } from './commit-scene-money-transfer.js';

function fail(code, message) {
  throw new HttpsError(code, message);
}

function clean(value, maximum = 250000) {
  return String(value || '').trim().slice(0, maximum);
}

export async function commitInventoryTransferOperation(database, auth, data) {
  if (!auth) fail('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const input = JSON.parse(JSON.stringify(data || {}));
  const giverId = clean(input.giverId, 240);
  const receiverId = clean(input.receiverId, 240);
  const entryId = clean(input.entryId, 240);
  const submittedEvent = input.sceneEvent && typeof input.sceneEvent === 'object' ? input.sceneEvent : {};
  const submittedTransfer = submittedEvent.transfer && typeof submittedEvent.transfer === 'object' ? submittedEvent.transfer : {};
  const submittedObject = submittedTransfer.object && typeof submittedTransfer.object === 'object' ? submittedTransfer.object : {};
  if (submittedObject.kind === 'money') return commitSceneMoneyTransferOperation(database, auth, input, submittedTransfer);
  if (!giverId || !receiverId || giverId === receiverId || !entryId) {
    fail('invalid-argument', 'Geber, Empfänger und Szene müssen eindeutig sein.');
  }
  const operationId = String(input.operationId || submittedTransfer.transferId || '');
  if (!/^[\w:.-]{1,180}$/.test(operationId)) fail('invalid-argument', 'Die Übergabe benötigt eine gültige Vorgangs-ID.');
  const fingerprint = createHash('sha256').update(JSON.stringify({ giverId, receiverId, entryId, transfer: submittedTransfer })).digest('hex');

  const giverRef = database.collection('characters').doc(giverId);
  const receiverRef = database.collection('characters').doc(receiverId);
  const commentRef = database.collection('comments').doc();
  const receiptRef = database.collection('inventory_transfer_transactions').doc(`${auth.uid}-${operationId}`);
  const transferItemId = `transfer-${randomUUID()}`;
  const now = new Date();
  return database.runTransaction(async transaction => {
    const prior = await transaction.get(receiptRef);
    if (prior.exists && prior.data().fingerprint !== fingerprint) fail('already-exists', 'Diese Vorgangs-ID wurde bereits für eine andere Übergabe verwendet.');
    const [giverSnapshot, receiverSnapshot] = await Promise.all([
      transaction.get(giverRef),
      transaction.get(receiverRef)
    ]);
    if (!giverSnapshot.exists || !receiverSnapshot.exists) fail('not-found', 'Geber oder Empfänger wurde nicht gefunden.');
    let giver = { ...(giverSnapshot.data() || {}), id: giverId };
    let receiver = { ...(receiverSnapshot.data() || {}), id: receiverId };
    const role = String(auth.token?.aleriaRole || 'player');
    if (!canManageCharacter(giver, { uid: auth.uid, authenticated: true, canModerate: ['admin', 'moderator'].includes(role) })) fail('permission-denied', 'Nur der Besitzer oder die Spielleitung kann Gegenstände dieser Figur übergeben.');
    if (prior.exists) return { id: prior.data().commentId, giverInventory: giver.inventory, receiverInventory: receiver.inventory };
    if (submittedObject.kind === 'register-item' && !['admin', 'moderator', 'editor'].includes(role)) fail('permission-denied', 'Bitte Waren über das Güterregister kaufen. Freie Zuteilungen erstellt die Spielleitung.');
    let registerTemplate = submittedObject.kind === 'register-item'
      ? await resolveRegisterItemTemplate(database, transaction, { template: submittedObject.itemDbKey,
        moduleId: submittedObject.moduleId, sourceRevision: submittedObject.sourceRevision, definitionRef: submittedObject.definitionRef }, { allowCreatures: true }) : null;
    const definitions = await readItemDefinitionIndex(database, transaction, [giver, receiver]);
    // Validate against the saved loadouts. The shared transfer model resolves
    // the moved definition without making unrelated inventory flags authoritative.
    let preparedDefinition = null, claim = () => {};
    if (registerTemplate) {
      registerTemplate = productWithItemDefinition(registerTemplate);
      preparedDefinition = await prepareTemplateDefinition(database, transaction, registerTemplate, { actorUid: auth.uid, publishHead: true, now: now.toISOString() });
      if (preparedDefinition.definition) {
        definitions.set(`${preparedDefinition.definition.id}@${preparedDefinition.definition.revision}`, preparedDefinition.definition);
        claim = await prepareUniqueItemClaims(database, transaction, [{ definition: preparedDefinition.definition,
          instanceId: transferItemId, quantity: submittedObject.quantity, holder: { kind: 'characters', recordId: receiverId, itemId: transferItemId } }], { actorUid: auth.uid, now: now.toISOString() });
      }
    }
    const characterLocks = await Promise.all([giverId, receiverId].map(id => transaction.get(database.doc(`combat_profile_locks/characters/records/${id}`))));
    if (characterLocks.some(snap => snap.data()?.activeEncounterKeys?.length)) fail('failed-precondition', 'Eine der Figuren nimmt gerade an einem Kampf teil.');
    const sourceItem = (giver.inventory?.items || []).find(item => item.id === submittedObject.itemId);
    const linkedCreatureRef = sourceItem?.creatureId ? database.collection('creatures').doc(sourceItem.creatureId) : null;
    const linkedCreatureSnapshot = linkedCreatureRef ? await transaction.get(linkedCreatureRef) : null;
    if (linkedCreatureRef && (!linkedCreatureSnapshot.exists
      || linkedCreatureSnapshot.data().itemOrigin?.ownerCharacterId !== giverId
      || linkedCreatureSnapshot.data().itemOrigin?.inventoryItemId !== sourceItem.id
      || linkedCreatureSnapshot.data().itemOrigin?.instanceId !== (sourceItem.instanceId || sourceItem.id))) fail('failed-precondition', 'Die Begleiterverknüpfung wurde geändert.');
    if (linkedCreatureRef) {
      const lock = await transaction.get(database.doc(`combat_profile_locks/creatures/records/${linkedCreatureRef.id}`));
      if (lock.data()?.activeEncounterKeys?.length) fail('failed-precondition', 'Der Begleiter nimmt gerade an einem Kampf teil.');
    }
    let result;
    try {
      result = applySceneInventoryTransfer(giver, receiver, submittedObject, {
        allowRegisterItem: true,
        registerTemplate,
        definitions,
        transferItemId,
        transferredAt: now.toISOString()
      });
    } catch (error) {
      fail('failed-precondition', error?.message || 'Die Inventarübergabe ist nicht mehr gültig.');
    }

    if (submittedObject.kind === 'item' && sourceItem?.definitionRef) {
      const definition = definitions.get(`${sourceItem.definitionRef.id}@${sourceItem.definitionRef.revision}`);
      claim = await prepareUniqueItemClaims(database, transaction, [{ definition, instanceId: sourceItem.instanceId || sourceItem.id,
        quantity: submittedObject.quantity, holder: { kind: 'characters', recordId: receiverId, itemId: result.object.receiverItemId },
        previousHolder: { kind: 'characters', recordId: giverId, itemId: sourceItem.id } }], { actorUid: auth.uid, now: now.toISOString() });
    }
    preparedDefinition?.write();
    claim();
    if (linkedCreatureRef) transaction.update(linkedCreatureRef, { itemOrigin: { ...linkedCreatureSnapshot.data().itemOrigin,
      inventoryItemId: result.object.receiverItemId,
      ownerCharacterId: receiverId, ownerCharacterName: receiver.name || '', disposition: 'owned' }, updatedAt: now.toISOString() });
    const giverProfile = transferredEquipmentProfile(giver.combatProfile, result.giverCombatProfile, sourceItem?.id, { preserveExisting: true });
    const receiverProfile = transferredEquipmentProfile(receiver.combatProfile, result.receiverCombatProfile, result.object.receiverItemId, { preserveExisting: true });
    const giverUpdates = withProtectedRecordRevisions(giver, {
      inventory: result.giverInventory,
      ...(giverProfile ? { combatProfile: giverProfile } : {}),
      updatedAt: now.toISOString()
    }, giverProfile ? ['inventory', 'combatProfile'] : ['inventory'], now.getTime());
    const receiverUpdates = withProtectedRecordRevisions(receiver, {
      inventory: result.receiverInventory,
      ...(receiverProfile ? { combatProfile: receiverProfile } : {}),
      updatedAt: now.toISOString()
    }, receiverProfile ? ['inventory', 'combatProfile'] : ['inventory'], now.getTime());
    transaction.update(giverRef, giverUpdates);
    transaction.update(receiverRef, receiverUpdates);
    const transfer = {
      transferId: operationId,
      presentation: 'compact',
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
      createdBy: auth.uid,
      createdByRole: role,
      schemaVersion: 3,
      ts: FieldValue.serverTimestamp()
    });
    transaction.create(receiptRef, { actorUid: auth.uid, operationId, fingerprint, commentId: commentRef.id,
      giverId, receiverId, entryId, at: now.toISOString() });
    return { id: commentRef.id, giverInventory: giverUpdates.inventory, receiverInventory: receiverUpdates.inventory };
  });
}

export const commitInventoryTransfer = onCall({
  region: 'europe-west1', maxInstances: 10, concurrency: 20, enforceAppCheck: false, timeoutSeconds: 30
}, async request => {
  try { return await commitInventoryTransferOperation(getFirestore(), request.auth, request.data); }
  catch (error) {
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('failed-precondition', error.message || 'Die Inventarübergabe konnte nicht abgeschlossen werden.');
  }
});
