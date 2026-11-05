import { createHash } from 'node:crypto';
import { HttpsError } from 'firebase-functions/v2/https';
import { applySceneMoneyTransfer } from '../generated/scene-inventory/scene-inventory-money.js';
import { withProtectedRecordRevisions } from './protected-record-revisions.js';

const fail = (code, message) => { throw new HttpsError(code, message); };
const text = value => String(value || '').trim();
function characterId(value) {
  const id = text(value);
  if (!id || id.length > 240 || /[\/\x00-\x1f\x7f]/.test(id)) fail('invalid-argument', 'Die gewählte Figur benötigt eine gültige Kennung.');
  return id;
}
function assertExpectedRevision(input, id, record) {
  if (!Object.hasOwn(input, 'expectedRevisions')) return; // Legacy requests remain compatible.
  const revisions = input.expectedRevisions;
  if (!revisions || typeof revisions !== 'object' || Array.isArray(revisions)) fail('invalid-argument', 'Die Geldbuchung benötigt gültige Bestandsrevisionen.');
  const expected = revisions[`character:${id}`];
  if (!Number.isSafeInteger(expected) || expected < 0) fail('invalid-argument', 'Die Geldbuchung benötigt die angezeigte Bestandsrevision jeder Figur.');
  if (expected !== Number(record.inventory?.revision || 0)) fail('aborted', 'Ein beteiligter Geldbeutel wurde inzwischen geändert. Bitte neu laden.');
}
function walletUpdates(record, inventory, now) {
  return withProtectedRecordRevisions(record, {
    'inventory.moneyState': inventory.moneyState,
    'inventory.money': inventory.money,
    updatedAt: now.toISOString()
  }, ['inventory'], now.getTime());
}
const currentInventory = (record, inventory, updates) => ({ ...(record.inventory || {}),
  moneyState: inventory.moneyState, money: inventory.money, revision: updates['inventory.revision'] });

/** Money never enters the item-transfer or scene-comment write paths. */
export async function commitSceneMoneyTransferOperation(database, auth, input, submittedTransfer) {
  if (!auth?.uid) fail('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const object = submittedTransfer.object;
  const targetKind = object.targetKind ?? 'character';
  if (!['character', 'sink'].includes(targetKind)) fail('invalid-argument', 'Das Geldziel ist ungültig.');
  const giverId = characterId(input.giverId);
  const receiverId = targetKind === 'character' ? characterId(input.receiverId) : '';
  if (targetKind === 'sink' && text(input.receiverId)) fail('invalid-argument', 'Eine Geldausgabe benötigt keine empfangende Figur.');
  if (giverId === receiverId) fail('invalid-argument', 'Geber und Empfänger müssen verschieden sein.');
  const entryId = text(input.entryId).slice(0, 240);
  const operationId = String(input.operationId || submittedTransfer.transferId || '');
  if (!/^[\w:.-]{1,180}$/.test(operationId)) fail('invalid-argument', 'Die Geldbuchung benötigt eine gültige Vorgangs-ID.');
  // Preserve the historical fingerprint for old money-transfer requests.
  const identity = { giverId, receiverId, entryId, transfer: submittedTransfer };
  if (Object.hasOwn(input, 'expectedRevisions')) identity.expectedRevisions = input.expectedRevisions;
  const fingerprint = createHash('sha256').update(JSON.stringify(identity)).digest('hex');
  const receiptRef = database.collection('inventory_transfer_transactions').doc(`${auth.uid}-${operationId}`);
  const giverRef = database.collection('characters').doc(giverId);
  const receiverRef = receiverId ? database.collection('characters').doc(receiverId) : null;
  const now = new Date();
  return database.runTransaction(async transaction => {
    const prior = await transaction.get(receiptRef);
    if (prior.exists && prior.data().fingerprint !== fingerprint) fail('already-exists', 'Diese Vorgangs-ID wurde bereits für eine andere Übergabe verwendet.');
    const giverSnapshot = await transaction.get(giverRef);
    const receiverSnapshot = receiverRef ? await transaction.get(receiverRef) : null;
    if (!giverSnapshot.exists || receiverRef && !receiverSnapshot.exists) fail('not-found', 'Eine beteiligte Figur wurde nicht gefunden.');
    const giver = { ...giverSnapshot.data(), id: giverId };
    const receiver = receiverSnapshot ? { ...receiverSnapshot.data(), id: receiverId } : null;
    if (prior.exists) return { id: null, silent: true, giverInventory: giver.inventory || {}, receiverInventory: receiver?.inventory || null };
    assertExpectedRevision(input, giverId, giver);
    if (receiver) assertExpectedRevision(input, receiverId, receiver);
    for (const id of [giverId, receiverId].filter(Boolean)) {
      const lock = await transaction.get(database.doc(`combat_profile_locks/characters/records/${id}`));
      if (lock.data()?.activeEncounterKeys?.length) fail('failed-precondition', 'Eine beteiligte Figur nimmt gerade an einem Kampf teil.');
    }
    let result;
    try { result = applySceneMoneyTransfer(giver, receiver, { ...object, targetKind }); }
    catch (error) { fail('failed-precondition', error?.message || 'Die Geldbuchung ist nicht mehr gültig.'); }
    const giverUpdates = walletUpdates(giver, result.giverInventory, now);
    const receiverUpdates = receiver ? walletUpdates(receiver, result.receiverInventory, now) : null;
    transaction.update(giverRef, giverUpdates);
    if (receiverRef) transaction.update(receiverRef, receiverUpdates);
    transaction.create(receiptRef, { actorUid: auth.uid, operationId, fingerprint, kind: 'money', targetKind,
      giverId, receiverId, currency: result.object.currency, quantity: result.object.quantity,
      amountMinor: result.object.amountMinor, totalCopper: result.object.totalCopper, at: now.toISOString() });
    return { id: null, silent: true, giverInventory: currentInventory(giver, result.giverInventory, giverUpdates),
      receiverInventory: receiver ? currentInventory(receiver, result.receiverInventory, receiverUpdates) : null };
  });
}
