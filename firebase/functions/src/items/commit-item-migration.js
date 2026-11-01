import { createHash } from 'node:crypto';
import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { planItemMigration } from '../generated/item-definitions/item-migration-model.js';
import { storeInventoryItem } from '../generated/item-definitions/item-definition-resolver.js';
import { canManageCharacter } from '../generated/item-register/item-register-model.js';
import { assertItemQuantity, itemDefinitionKey } from '../generated/item-definitions/item-definition-model.js';
import { synchronizeEquipmentFromInventory, characterEquipmentSyncInternals } from '../generated/character-equipment/character-equipment-sync.js';
import { withProtectedRecordRevisions } from '../mechanics/protected-record-revisions.js';
import { readItemDefinitionIndex, hydrateItemRecord, readItemDefinition, prepareUniqueItemClaims } from './item-definition-repository.js';

export async function commitItemMigrationOperation(database, auth, input = {}) {
  const role = auth?.token?.aleriaRole;
  if (!auth || !['admin', 'moderator', 'editor'].includes(role)) throw new HttpsError('permission-denied', 'Die Bestandsübernahme wird durch Redaktion oder Spielleitung geprüft.');
  if (!/^[\w:.-]{1,180}$/.test(input.operationId || '') || !input.recordId || String(input.recordId).includes('/')) throw new HttpsError('invalid-argument', 'Ungültige Übernahmekennung.');
  const kind = input.recordKind === 'creatures' ? 'creatures' : 'characters';
  const ref = database.collection(kind).doc(input.recordId), receipt = database.collection('item_migration_transactions').doc(`${auth.uid}-${input.operationId}`);
  const fingerprint = createHash('sha256').update(JSON.stringify(input)).digest('hex');
  return database.runTransaction(async transaction => {
    const prior = await transaction.get(receipt);
    if (prior.exists) {
      if (prior.data().fingerprint !== fingerprint) throw new HttpsError('already-exists', 'Diese Vorgangskennung wurde bereits verwendet.');
      const current = await transaction.get(ref);
      return { ...prior.data().result, record: current.data() };
    }
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) throw new HttpsError('not-found', 'Der Bestand wurde nicht gefunden.');
    let record = { ...snapshot.data(), id: ref.id };
    if (!canManageCharacter(record, { authenticated: true, uid: auth.uid, canModerate: ['admin', 'moderator'].includes(role) })) throw new HttpsError('permission-denied', 'Dieser Bestand kann von dieser Anmeldung nicht übernommen werden.');
    const plan = planItemMigration(record);
    if (input.preview === true) return plan;
    if (Number(input.expectedRevision || 0) !== plan.revision) throw new HttpsError('aborted', 'Der Bestand wurde inzwischen geändert. Bitte die Vorschau neu laden.');
    const lock = await transaction.get(database.doc(`combat_profile_locks/${kind}/records/${ref.id}`));
    if (lock.data()?.activeEncounterKeys?.length) throw new HttpsError('failed-precondition', 'Die Bestandsübernahme erfolgt nach dem aktiven Kampf.');
    const requested = new Set(input.itemIds || []), allowed = new Map(plan.safe.map(entry => [entry.itemId, entry]));
    if ([...requested].some(id => !allowed.has(id))) throw new HttpsError('failed-precondition', 'Mindestens ein Eintrag benötigt eine Einzelprüfung im Item-Builder.');
    const inventory = structuredClone(record.inventory || { items: [] });
    inventory.items = inventory.items.map(item => requested.has(item.id) ? storeInventoryItem({ ...item, instanceId: item.instanceId || item.id, definitionRef: allowed.get(item.id).definitionRef }) : item);
    let explicit = null;
    if (input.definitionRef) {
      if (Number(input.expectedCombatRevision || 0) !== Number(record.combatProfile?.revision || 0)) throw new HttpsError('aborted', 'Der Kampfbogen wurde inzwischen geändert. Bitte die Bestandsprüfung neu öffnen.');
      const reviewed = plan.review.find(entry => input.itemId ? entry.itemId === input.itemId : entry.equipmentId === input.equipmentId && entry.collection === input.collection);
      if (!reviewed) throw new HttpsError('failed-precondition', 'Dieser Eintrag benötigt keine solche Bestandsübernahme mehr.');
      let item = input.itemId ? inventory.items.find(entry => entry.id === input.itemId) : null;
      if (!item) {
        const entry = record.combatProfile?.[reviewed.collection]?.find(entry => entry.id === reviewed.equipmentId);
        const equipmentKind = reviewed.collection === 'weapons' ? 'weapon' : 'armor';
        if (inventory.items.length >= 80) throw new HttpsError('failed-precondition', 'Das Inventar hat bereits 80 Einträge.');
        item = characterEquipmentSyncInternals.inventoryItemFromCombat(entry, equipmentKind, { characterId: record.id, characterName: record.name, now: new Date().toISOString() }, new Set(inventory.items.map(item => item.id)));
        inventory.items.push(item);
        record.combatProfile = structuredClone(record.combatProfile);
        record.combatProfile[reviewed.collection].find(candidate => candidate.id === entry.id).inventoryItemId = item.id;
      }
      const definition = await readItemDefinition(database, transaction, input.definitionRef);
      const existingKind = item.combatDefinition?.kind;
      if (existingKind && definition.combatDefinition?.kind !== existingKind) throw new HttpsError('invalid-argument', 'Waffe und Rüstung können bei einer Übernahme nicht vertauscht werden.');
      item.definitionRef = { id: definition.id, revision: definition.revision }; item.instanceId ||= item.id;
      item.registerCategory = definition.category;
      explicit = { definition, instanceId: item.instanceId, quantity: item.quantity ?? 1, holder: { kind, recordId: record.id, itemId: item.id } };
    }
    const definitions = await readItemDefinitionIndex(database, transaction, [{ inventory }], { verifyHolders: false });
    for (const item of inventory.items) if (requested.has(item.id) || explicit?.holder.itemId === item.id) {
      assertItemQuantity(definitions.get(itemDefinitionKey(item.definitionRef)), item.quantity ?? 1);
    }
    const claim = await prepareUniqueItemClaims(database, transaction, explicit ? [explicit] : [], { actorUid: auth.uid });
    record = hydrateItemRecord(record, definitions);
    const synced = synchronizeEquipmentFromInventory({ inventory, combatProfile: record.combatProfile || {}, definitions, addMissingEquipment: true });
    const adopted = requested.size + (explicit ? 1 : 0);
    const result = { recordId: ref.id, adopted, review: plan.review, message: `${adopted} geprüfte Verweise übernommen.` };
    const updates = withProtectedRecordRevisions(record, { ...synced, updatedAt: new Date().toISOString() }, ['inventory', 'combatProfile']);
    claim(); transaction.update(ref, updates);
    transaction.create(receipt, { actorUid: auth.uid, fingerprint, operationId: input.operationId, at: new Date().toISOString(), result });
    return { ...result, record: { ...record, ...updates } };
  });
}
export const commitItemMigration = onCall({ region: 'europe-west1', timeoutSeconds: 30, maxInstances: 10 }, async request => {
  try { return await commitItemMigrationOperation(getFirestore(), request.auth, request.data); }
  catch (error) { if (error instanceof HttpsError) throw error; throw new HttpsError('failed-precondition', error.message); }
});
