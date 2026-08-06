import { randomUUID } from 'node:crypto';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { deriveCombatEncounterState } from '../generated/combat/combat-encounter-model.js';
import { collectClaimedLootActorIds, normalizeLootClaimEvent } from '../generated/loot/loot-model.js';
import { isTrustedMechanicalComment, sortSceneHistory } from './trusted-scene-history.js';

function fail(code, message) {
  throw new HttpsError(code, message);
}

function clean(value, maximum = 240) {
  return String(value || '').trim().slice(0, maximum);
}

function clone(value) {
  if (!value || typeof value !== 'object') return {};
  return JSON.parse(JSON.stringify(value));
}

function creatureRecordIdForPersistence(persistence = {}) {
  if (persistence.kind === 'scene-creature' && persistence.sourceCreatureId) return String(persistence.sourceCreatureId);
  if (persistence.kind === 'creature' && persistence.recordId) return String(persistence.recordId);
  return '';
}

function mergeRequestedItemQuantities(items = []) {
  const merged = new Map();
  (Array.isArray(items) ? items : []).forEach(item => {
    const id = clean(item?.id, 120);
    const quantity = Math.max(1, Math.trunc(Number(item?.quantity) || 1));
    if (!id) return;
    merged.set(id, (merged.get(id) || 0) + quantity);
  });
  return merged;
}

function validateRequestedItems(requestedItems, lootTable) {
  const requested = mergeRequestedItemQuantities(requestedItems);
  if (!requested.size) fail('invalid-argument', 'Wähle mindestens einen Gegenstand aus der Beute aus.');
  const table = Array.isArray(lootTable) ? lootTable : [];
  return [...requested.entries()].map(([id, quantity]) => {
    const source = table.find(item => String(item?.id || '') === id);
    if (!source) fail('failed-precondition', 'Ein gewählter Gegenstand gehört nicht (mehr) zur Beute dieser Kreatur.');
    const maximum = Math.max(0, Math.trunc(Number(source.quantity) || 0));
    const clamped = Math.max(1, Math.min(maximum, quantity));
    if (clamped < 1) fail('failed-precondition', `${source.name || 'Der Gegenstand'} ist nicht mehr verfügbar.`);
    return { id, name: clean(source.name, 140) || 'Gegenstand', quantity: clamped, notes: clean(source.notes, 800) };
  });
}

function applyLootToInventory(receiver, items, now) {
  const inventory = clone(receiver.inventory);
  inventory.items = Array.isArray(inventory.items) ? inventory.items : [];
  items.forEach(item => {
    const match = inventory.items.find(existing => !existing.itemDbKey && existing.name === item.name);
    if (match) {
      match.quantity = String((Math.trunc(Number(match.quantity)) || 0) + item.quantity);
      return;
    }
    inventory.items.push({
      id: `loot-${randomUUID()}`,
      name: item.name,
      description: item.notes,
      type: 'Beute',
      quantity: String(item.quantity),
      ownerCharacterId: String(receiver.id || ''),
      ownerCharacterName: clean(receiver.name, 160),
      acquiredAt: now.toISOString()
    });
  });
  return inventory;
}

export const commitLootClaim = onCall({
  region: 'europe-west1',
  maxInstances: 10,
  concurrency: 20,
  enforceAppCheck: false,
  timeoutSeconds: 30
}, async request => {
  if (!request.auth) fail('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const entryId = clean(request.data?.entryId, 240);
  const encounterId = clean(request.data?.encounterId, 180);
  const actorId = clean(request.data?.actorId, 180);
  const receiverId = clean(request.data?.receiverId, 240);
  const requestedItems = Array.isArray(request.data?.items) ? request.data.items : [];
  if (!entryId || !encounterId || !actorId || !receiverId) {
    fail('invalid-argument', 'Szene, Kampf, besiegte Kreatur und Empfänger sind erforderlich.');
  }

  const database = getFirestore();
  const commentRef = database.collection('comments').doc();
  const now = new Date();
  let lootClaim;

  await database.runTransaction(async transaction => {
    const threadSnapshot = await transaction.get(database.collection('comments').where('entryId', '==', entryId));
    const history = sortSceneHistory(threadSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      .filter(isTrustedMechanicalComment);
    const encounter = deriveCombatEncounterState(history).get(encounterId);
    if (!encounter) fail('not-found', 'Dieser Kampf wurde nicht gefunden.');
    const participant = encounter.participants.get(actorId);
    if (!participant) fail('not-found', 'Diese Kreatur war nicht Teil dieses Kampfes.');
    if (participant.status !== 'defeated') fail('failed-precondition', `${participant.name || 'Diese Kreatur'} gilt nicht als besiegt.`);
    if (collectClaimedLootActorIds(history, encounterId).has(actorId)) {
      fail('failed-precondition', `Die Beute von ${participant.name || 'dieser Kreatur'} wurde bereits geholt.`);
    }

    const creatureRecordId = creatureRecordIdForPersistence(participant.persistence || {});
    if (!creatureRecordId) fail('failed-precondition', `${participant.name || 'Diese Figur'} besitzt keine Beute.`);

    const creatureRef = database.collection('creatures').doc(creatureRecordId);
    const receiverRef = database.collection('characters').doc(receiverId);
    const [creatureSnapshot, receiverSnapshot] = await Promise.all([
      transaction.get(creatureRef),
      transaction.get(receiverRef)
    ]);
    if (!creatureSnapshot.exists) fail('not-found', 'Das Kreaturenprofil wurde nicht gefunden.');
    if (!receiverSnapshot.exists) fail('not-found', 'Der Empfänger wurde nicht gefunden.');

    const creature = creatureSnapshot.data() || {};
    const items = validateRequestedItems(requestedItems, creature.loot?.items);
    const receiver = { id: receiverId, ...(receiverSnapshot.data() || {}) };
    const receiverInventory = applyLootToInventory(receiver, items, now);

    transaction.update(receiverRef, { inventory: receiverInventory, updatedAt: now.toISOString() });

    lootClaim = normalizeLootClaimEvent({
      encounterId,
      actorId,
      actorName: clean(participant.name, 180),
      receiverId,
      receiverName: clean(receiver.name, 160),
      items
    });
    const itemSummary = items.map(item => (item.quantity > 1 ? `${item.quantity}× ${item.name}` : item.name)).join(', ');
    const text = `${lootClaim.receiverName || 'Jemand'} durchsucht ${lootClaim.actorName || 'einen besiegten Gegner'} und nimmt: ${itemSummary}.`;
    transaction.create(commentRef, {
      entryId,
      charName: 'Erzähler',
      charTitle: '',
      portrait: null,
      text,
      narrator: true,
      characterId: '',
      avatarKind: 'narrator',
      commentMode: 'loot-claim',
      commentKind: 'loot-claim-event',
      commentSegments: null,
      lootClaim,
      serverValidatedMechanics: true,
      createdBy: request.auth.uid,
      createdByRole: String(request.auth.token?.aleriaRole || 'player'),
      orderKey: Number.isFinite(Number(request.data?.orderKey)) ? Number(request.data.orderKey) : now.getTime(),
      createdAtClient: now.getTime(),
      activityAtClient: now.getTime(),
      activityAt: FieldValue.serverTimestamp(),
      schemaVersion: 3,
      ts: FieldValue.serverTimestamp()
    });
  });

  return { id: commentRef.id, lootClaim };
});

export const lootClaimCommitInternals = Object.freeze({
  creatureRecordIdForPersistence,
  mergeRequestedItemQuantities,
  validateRequestedItems,
  applyLootToInventory
});
