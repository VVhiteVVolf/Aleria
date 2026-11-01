import { randomUUID, createHash } from 'node:crypto';
import { prepareItemGrant } from '../items/item-grant-service.js';
import { resolveRegisterItemTemplate } from './item-register-template.js';
import { canManageCharacter } from '../generated/item-register/item-register-model.js';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { deriveCombatEncounterState } from '../generated/combat/combat-encounter-model.js';
import { collectClaimedLootActorIds, normalizeLootClaimEvent } from '../generated/loot/loot-model.js';
import { isTrustedMechanicalComment, sortSceneHistory } from './trusted-scene-history.js';
import { withItemInventoryRevisions } from '../items/item-inventory-update.js';

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
    if (maximum < 1) fail('failed-precondition', `${source.name || 'Der Gegenstand'} ist nicht mehr verfügbar.`);
    const clamped = Math.max(1, Math.min(maximum, quantity));
    if (clamped < 1) fail('failed-precondition', `${source.name || 'Der Gegenstand'} ist nicht mehr verfügbar.`);
    return { id, name: clean(source.name, 140) || 'Gegenstand', quantity: clamped, notes: clean(source.notes, 800), ...(source.definitionRef ? { definitionRef: source.definitionRef } : {}) };
  });
}

function applyLootToInventory(receiver, items, now) {
  const inventory = clone(receiver.inventory);
  inventory.items = Array.isArray(inventory.items) ? inventory.items : [];
  items.forEach(item => {
    // Loot names do not establish identity with existing equipment or stacks.
    // Preserve every existing stat block and the provenance of the new find.
    if (inventory.items.length >= 80) fail('failed-precondition', 'Das Inventar hat bereits 80 Einträge. Bitte zuerst Platz schaffen.');
    const instanceId = `loot-${randomUUID()}`;
    inventory.items.push({
      id: instanceId,
      instanceId,
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
  const claimRef = database.collection('loot_claim_transactions').doc(createHash('sha256').update(JSON.stringify([entryId, encounterId, actorId])).digest('hex'));
  const fingerprint = createHash('sha256').update(JSON.stringify([receiverId, requestedItems])).digest('hex');

  return database.runTransaction(async transaction => {
    const prior = await transaction.get(claimRef);
    if (prior.exists) {
      if (prior.data().actorUid !== request.auth.uid || prior.data().fingerprint !== fingerprint) fail('already-exists', 'Diese Beute wurde bereits geborgen.');
      return prior.data().result;
    }
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
    const receiver = { ...(receiverSnapshot.data() || {}), id: receiverId };
    if (!canManageCharacter(receiver, { authenticated: true, uid: request.auth.uid, canModerate: ['admin', 'moderator'].includes(request.auth.token?.aleriaRole) })) fail('permission-denied', 'Die Beute kann nur in ein eigenes oder durch die Spielleitung verwaltetes Inventar übernommen werden.');
    const grants = [];
    for (const item of items) grants.push({ quantity: item.quantity, product: item.definitionRef
      ? await resolveRegisterItemTemplate(database, transaction, { definitionRef: item.definitionRef }, { allowCreatures: true })
      : { id: `loot:${creatureRecordId}:${item.id}`, title: item.name, description: item.notes, category: 'sonstiges', mechanicsStatus: 'provisional' } });
    const granted = await prepareItemGrant(database, transaction, receiver, grants, { identity: `loot:${claimRef.id}`, actorUid: request.auth.uid, now: now.toISOString(),
      acquisition: { kind: 'loot', encounterId, sourceActorId: actorId } });
    const receiverInventory = granted.inventory;

    granted.write();
    transaction.update(receiverRef, withItemInventoryRevisions(receiver, {
      inventory: receiverInventory,
      ...(Object.hasOwn(granted, 'combatProfile') ? { combatProfile: granted.combatProfile } : {})
    }, now.toISOString(), now.getTime()));

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
    const result = { id: commentRef.id, lootClaim };
    transaction.create(claimRef, { actorUid: request.auth.uid, fingerprint, entryId, encounterId, actorId, at: now.toISOString(), result });
    return result;
  });
});

export const lootClaimCommitInternals = Object.freeze({
  creatureRecordIdForPersistence,
  mergeRequestedItemQuantities,
  validateRequestedItems,
  applyLootToInventory
});
