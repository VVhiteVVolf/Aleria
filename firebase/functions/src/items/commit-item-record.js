import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { prepareCharacterDocumentWrite, detectStaleCharacterFields, shouldBlockCharacterWriteDuringEncounter, stampFreshRevisions } from '../generated/characters/character-save-guard.js';
import { prepareInventoryCompanionWrites } from '../generated/item-register/item-register-companion-firebase.js';
import { inventoryWithCreatureIdentity } from '../generated/item-register/item-register-companions.js';
import { normalizeItemDefinitionRef, itemDefinitionKey, assertItemQuantity } from '../generated/item-definitions/item-definition-model.js';
import { storeDefinitionInventory } from '../generated/item-definitions/item-definition-resolver.js';
import { synchronizeEquipmentFromInventory } from '../generated/character-equipment/character-equipment-sync.js';
import { readItemDefinition, prepareUniqueItemClaims } from './item-definition-repository.js';
import { withProtectedRecordRevisions } from '../mechanics/protected-record-revisions.js';
import { applyExplicitInventoryLoadout, selectiveItemInventoryUpdate, withItemInventoryRevisions } from './item-inventory-update.js';
import { assertCreatureMerchantWrite } from './creature-merchant-guard.js';

const cleanId = value => {
  const id = String(value || '');
  if (!id || id.length > 220 || id.includes('/')) throw new HttpsError('invalid-argument', 'Ungültige Datensatzkennung.');
  return id;
};
function changedInventoryItemIds(before, after) {
  const oldItems = new Map((before?.items || []).map(item => [item.id, item]));
  const newItems = new Map((after?.items || []).map(item => [item.id, item]));
  return [...new Set([...oldItems.keys(), ...newItems.keys()])].filter(id => !isDeepStrictEqual(oldItems.get(id), newItems.get(id)));
}
async function prepareCanonicalInventory(database, transaction, before, after, canGrant, holder, { preserveLoadout = false } = {}) {
  const inventory = structuredClone(after.inventory || before?.inventory || { items: [] });
  if (!Array.isArray(inventory.items) || inventory.items.length > 80) throw new HttpsError('invalid-argument', 'Ein Inventar darf höchstens 80 Einträge enthalten.');
  const definitions = new Map(), claims = [], used = new Set();
  for (const item of inventory.items) {
    if (used.has(item.id)) throw new HttpsError('invalid-argument', 'Ein Inventar enthält eine Gegenstands-ID mehrfach.');
    used.add(item.id);
    if (!item.definitionRef) {
      if (before?.inventory?.items?.some(old => old.id === item.id && old.definitionRef)) throw new HttpsError('invalid-argument', 'Die gemeinsame Regelbindung wird über den Item-Builder geändert.');
      continue;
    }
    if (!normalizeItemDefinitionRef(item.definitionRef)) throw new HttpsError('invalid-argument', 'Eine Itemreferenz ist ungültig.');
    const key = itemDefinitionKey(item.definitionRef);
    if (!definitions.has(key)) definitions.set(key, await readItemDefinition(database, transaction, item.definitionRef));
    const definition = definitions.get(key);
    const old = before?.inventory?.items?.find(entry => entry.id === item.id);
    const sameDefinition = old && itemDefinitionKey(old.definitionRef) === key;
    const quantity = assertItemQuantity(definition, item.quantity ?? 1, { allowEmpty: true });
    if (!canGrant && (!sameDefinition || String(old.instanceId || old.id) !== String(item.instanceId || item.id)
      || quantity > Number(old.quantity ?? 1))) throw new HttpsError('permission-denied', 'Neue Gegenstände und geänderte Definitionen werden über Handel oder eine Zuteilung der Spielleitung vergeben.');
    item.instanceId ||= item.id;
    if (definition.useDefinition.chargesMaximum > 0) {
      const current = item.itemState?.chargesCurrent ?? old?.itemState?.chargesCurrent ?? definition.useDefinition.chargesMaximum;
      if (!Number.isSafeInteger(Number(current)) || current < 0 || current > definition.useDefinition.chargesMaximum) throw new HttpsError('invalid-argument', 'Der Ladungsstand ist ungültig.');
      if (!canGrant && old?.itemState?.chargesCurrent != null && current > old.itemState.chargesCurrent) throw new HttpsError('permission-denied', 'Ladungen erholen sich über die dafür vorgesehene Verwendung oder Rast.');
      item.itemState = { ...item.itemState, chargesCurrent: Number(current) };
    }
    claims.push({ definition, instanceId: item.instanceId, quantity: quantity || 1, holder: { ...holder, itemId: item.id } });
  }
  inventory.definitionSchemaVersion = 1;
  const claim = await prepareUniqueItemClaims(database, transaction, claims);
  const profile = after.combatProfile || before?.combatProfile || {};
  const combatProfile = preserveLoadout ? applyExplicitInventoryLoadout(profile, before?.inventory, inventory) : profile;
  const result = synchronizeEquipmentFromInventory({ inventory, combatProfile, definitions, addMissingEquipment: true, preserveLoadout });
  return { inventory: storeDefinitionInventory(result.inventory), combatProfile: result.combatProfile, claim };
}

export async function commitItemRecordOperation(database, auth, input = {}) {
  if (!auth) throw new HttpsError('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  if (JSON.stringify(input).length > 750000) throw new HttpsError('invalid-argument', 'Der Speicherauftrag ist zu groß.');
  const kind = input.kind === 'creatures' ? 'creatures' : 'characters';
  const id = cleanId(input.id), operationId = cleanId(input.operationId);
  const role = String(auth.token?.aleriaRole || 'player'), canModerate = ['admin', 'moderator'].includes(role);
  const ref = database.collection(kind).doc(id), receipt = database.collection('item_record_transactions').doc(`${auth.uid}-${operationId}`);
  const fingerprint = createHash('sha256').update(JSON.stringify(input)).digest('hex');
  return database.runTransaction(async transaction => {
    const previous = await transaction.get(receipt);
    const current = await transaction.get(ref);
    if (previous.exists) {
      if (previous.data().fingerprint !== fingerprint) throw new HttpsError('already-exists', 'Dieser Speicherauftrag wurde bereits mit anderem Inhalt ausgeführt.');
      return { id, data: current.data(), merge: true };
    }
    const before = current.exists ? current.data() : null;
    if (before && before.ownerUid && before.ownerUid !== auth.uid && !canModerate) throw new HttpsError('permission-denied', 'Nur der Besitzer oder die Spielleitung kann dieses Inventar speichern.');
    const lock = await transaction.get(database.doc(`combat_profile_locks/${kind}/records/${id}`));
    const { ownerUid, createdBy, ...incoming } = input.data || {};
    if (kind === 'creatures') assertCreatureMerchantWrite(before, incoming, canModerate);
    const options = input.options || {};
    if (shouldBlockCharacterWriteDuringEncounter(incoming, lock.data()?.activeEncounterKeys || [])) throw new HttpsError('failed-precondition', 'Das Inventar und der Kampfbogen sind während eines aktiven Kampfes geschützt.');
    const labels = kind === 'creatures' ? { combatProfile: 'Kampfprofil', inventory: 'Inventar', loot: 'Beute', biography: 'Biographie' } : undefined;
    if (!(options.forceOverwrite && canModerate) && detectStaleCharacterFields(before, incoming, labels).length) throw new HttpsError('aborted', 'Der Datensatz wurde inzwischen geändert. Bitte den Bogen neu öffnen.');
    let write;
    if (kind === 'characters') write = prepareCharacterDocumentWrite(before, incoming, { characterId: id, userId: auth.uid,
      replaceExisting: options.replaceExisting === true, replaceImageLibrary: options.replaceImageLibrary === true });
    else {
      const fields = ['combatProfile', 'inventory', 'loot', 'biography'];
      const revision = Math.max(Date.now(), ...fields.map(field => Number(before?.[field]?.revision || 0) + 1));
      write = { data: stampFreshRevisions({ ...incoming, ...(before?.itemOrigin ? { itemOrigin: before.itemOrigin } : {}) }, fields, revision), merge: !!before };
      if (!before) Object.assign(write.data, { ownerUid: auth.uid, createdBy: auth.uid });
    }
    const changesEquipment = !!(incoming.inventory || incoming.combatProfile || options.replaceExisting);
    const inventoryOnly = !!before && Object.hasOwn(incoming, 'inventory') && !Object.hasOwn(incoming, 'combatProfile') && !options.replaceExisting;
    const canonical = changesEquipment ? await prepareCanonicalInventory(database, transaction, before, write.data, ['admin', 'moderator', 'editor'].includes(role), { kind, recordId: id }, { preserveLoadout: inventoryOnly }) : null;
    if (canonical && inventoryOnly) {
      const { combatProfile: _unusedProfile, ...otherChanges } = write.data;
      const projection = selectiveItemInventoryUpdate(before, canonical, changedInventoryItemIds(before.inventory, incoming.inventory));
      write.data = withItemInventoryRevisions(before, { ...otherChanges, ...projection }, new Date().toISOString());
    } else if (canonical) write.data = withProtectedRecordRevisions(before, { ...write.data, inventory: canonical.inventory, combatProfile: canonical.combatProfile }, ['inventory', 'combatProfile']);
    if (shouldBlockCharacterWriteDuringEncounter(write.data, lock.data()?.activeEncounterKeys || [])) throw new HttpsError('failed-precondition', 'Die Ausrüstung kann während eines aktiven Kampfes nicht geändert werden.');
    const companionWrites = kind === 'characters' ? await prepareInventoryCompanionWrites({ transaction, db: database,
      doc: (_db, ...parts) => database.doc(parts.join('/')), characterId: id, before, after: write.data }) : [];
    if (kind === 'creatures' && before?.itemOrigin?.ownerCharacterId) {
      const ownerId = before.itemOrigin.ownerCharacterId;
      const ownerRef = database.collection('characters').doc(ownerId);
      const ownerSnapshot = await transaction.get(ownerRef);
      const ownerLock = await transaction.get(database.doc(`combat_profile_locks/characters/records/${ownerId}`));
      if (ownerLock.data()?.activeEncounterKeys?.length) throw new HttpsError('failed-precondition', 'Die Besitzerfigur des Begleiters nimmt gerade an einem Kampf teil.');
      const ownerRecord = ownerSnapshot.data();
      const next = { ...before, ...write.data, id };
      if (['name', 'portrait', 'notes'].some(field => next[field] !== before[field])) companionWrites.push({ ref: ownerRef,
        data: withProtectedRecordRevisions(ownerRecord, { inventory: inventoryWithCreatureIdentity(ownerRecord, next), updatedAt: new Date().toISOString() }, ['inventory']) });
    }
    canonical?.claim();
    transaction.set(ref, write.data, { merge: write.merge });
    for (const companion of companionWrites) transaction.update(companion.ref, companion.data);
    transaction.create(receipt, { actorUid: auth.uid, kind, recordId: id, fingerprint, operationId, at: new Date().toISOString() });
    return { id, data: write.merge ? { ...before, ...write.data } : write.data, merge: write.merge };
  });
}
export const commitItemRecord = onCall({ region: 'europe-west1', timeoutSeconds: 30, maxInstances: 10 }, async request => {
  try { return await commitItemRecordOperation(getFirestore(), request.auth, request.data); }
  catch (error) { if (error instanceof HttpsError) throw error; throw new HttpsError('failed-precondition', error.message); }
});
