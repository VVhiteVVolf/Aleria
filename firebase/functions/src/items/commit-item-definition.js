import { createHash, randomUUID } from 'node:crypto';
import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { normalizeItemDefinition, definitionTemplate, itemDefinitionKey, assertItemQuantity } from '../generated/item-definitions/item-definition-model.js';
import { createGrantedItem, canManageCharacter } from '../generated/item-register/item-register-model.js';
import { attachInventoryEquipment } from '../generated/character-equipment/character-equipment-registration.js';
import { synchronizeEquipmentFromInventory } from '../generated/character-equipment/character-equipment-sync.js';
import { selectiveItemInventoryUpdate, withItemInventoryRevisions } from './item-inventory-update.js';
import { definitionRevision, readItemDefinition, prepareDefinitionVersion, prepareUniqueItemClaims, readItemDefinitionIndex } from './item-definition-repository.js';

const safeId = value => {
  const id = String(value || '');
  if (!/^[\w:.-]{1,220}$/.test(id)) throw new HttpsError('invalid-argument', 'Ungültige Item- oder Vorgangskennung.');
  return id;
};

export async function commitItemDefinitionOperation(database, auth, input = {}) {
  if (!auth) throw new HttpsError('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const role = String(auth.token?.aleriaRole || 'player');
  if (!['admin', 'moderator', 'editor'].includes(role)) throw new HttpsError('permission-denied', 'Gemeinsame Itemdefinitionen und freie Zuteilungen verwalten Spielleitung und Redaktion.');
  const action = input.action;
  if (!['save', 'grant'].includes(action)) throw new HttpsError('invalid-argument', 'Unbekannter Itemauftrag.');
  const operationId = safeId(input.operationId);
  const fingerprint = createHash('sha256').update(JSON.stringify(input)).digest('hex');
  const receiptRef = database.collection('item_definition_transactions').doc(`${auth.uid}-${operationId}`);
  const definitionId = input.definition?.id || `${input.definition?.kind === 'unique' ? 'unique' : 'item'}:${randomUUID()}`;
  const instanceId = `possession-${randomUUID()}`;
  const now = new Date().toISOString();
  return database.runTransaction(async transaction => {
    const prior = await transaction.get(receiptRef);
    if (prior.exists) {
      if (prior.data().fingerprint !== fingerprint) throw new HttpsError('already-exists', 'Diese Vorgangs-ID wurde bereits mit anderem Inhalt verwendet.');
      return prior.data().result;
    }
    let result;
    if (action === 'save') {
      if (String(definitionId).startsWith('standard:')) throw new HttpsError('permission-denied', 'Für eine Abweichung von Standardwerten bitte eine eigene Variante anlegen.');
      let definition = normalizeItemDefinition(input.definition, { id: safeId(definitionId), revision: 'draft' });
      if (definition.baseRef) await readItemDefinition(database, transaction, definition.baseRef);
      definition = { ...definition, revision: definitionRevision(definition) };
      const prepared = await prepareDefinitionVersion(database, transaction, definition, { actorUid: auth.uid, publishHead: true, now });
      if (String(input.expectedRevision || '') !== prepared.previousRevision) throw new HttpsError('aborted', 'Die Itemdefinition wurde inzwischen bearbeitet. Bitte neu öffnen.');
      prepared.write();
      result = { definition, template: definitionTemplate(definition), message: 'Itemdefinition gespeichert. Bestehende Exemplare behalten ihre gebundene Regelversion.' };
    } else {
      const definition = await readItemDefinition(database, transaction, input.definitionRef);
      const kind = input.recordKind === 'creature' ? 'creatures' : 'characters';
      const recordRef = database.collection(kind).doc(safeId(input.recordId));
      const snapshot = await transaction.get(recordRef);
      if (!snapshot.exists) throw new HttpsError('not-found', 'Der Empfänger wurde nicht gefunden.');
      const record = { ...snapshot.data(), id: recordRef.id, _itemHolderKind: kind };
      if (!canManageCharacter(record, { authenticated: true, uid: auth.uid, canModerate: ['admin', 'moderator'].includes(role) })) throw new HttpsError('permission-denied', 'Der Empfänger kann von dieser Anmeldung nicht verwaltet werden.');
      const lock = await transaction.get(database.doc(`combat_profile_locks/${kind}/records/${record.id}`));
      if (lock.data()?.activeEncounterKeys?.length) throw new HttpsError('failed-precondition', 'Freie Ausrüstungszuteilungen erfolgen außerhalb eines aktiven Kampfes.');
      if (Number(record.inventory?.revision || 0) !== Number(input.expectedRevision || 0)) throw new HttpsError('aborted', 'Das Inventar wurde inzwischen geändert.');
      const quantity = assertItemQuantity(definition, input.quantity ?? 1);
      const inventory = structuredClone(record.inventory || { items: [] });
      inventory.items ||= [];
      if (inventory.items.length >= 80) throw new HttpsError('failed-precondition', 'Das Inventar hat bereits 80 Einträge.');
      const item = createGrantedItem(definitionTemplate(definition), { id: instanceId, characterId: record.id, characterName: record.name, quantity, now });
      item.acquisition = { kind: 'manual-grant', at: now };
      const claim = await prepareUniqueItemClaims(database, transaction, [{ definition, instanceId, quantity, holder: { kind, recordId: record.id, itemId: instanceId } }], { now, actorUid: auth.uid });
      inventory.items.push(item);
      inventory.definitionSchemaVersion = 1;
      const definitions = await readItemDefinitionIndex(database, transaction, [record]);
      definitions.set(itemDefinitionKey(definition), definition);
      const combatProfile = structuredClone(record.combatProfile || {});
      attachInventoryEquipment(combatProfile, item, { definition });
      const synced = synchronizeEquipmentFromInventory({ inventory, combatProfile, definitions });
      const updates = withItemInventoryRevisions(record, selectiveItemInventoryUpdate(record, synced, [item.id]), now);
      claim();
      transaction.update(recordRef, updates);
      result = { recordId: record.id, recordKind: kind, itemId: item.id, definitionRef: item.definitionRef, message: 'Gegenstand zugeteilt.' };
    }
    transaction.create(receiptRef, { actorUid: auth.uid, action, operationId, fingerprint, at: now, result });
    return result;
  });
}
export const commitItemDefinition = onCall({ region: 'europe-west1', timeoutSeconds: 30, maxInstances: 10 }, async request => {
  try { return await commitItemDefinitionOperation(getFirestore(), request.auth, request.data); }
  catch (error) { if (error instanceof HttpsError) throw error; throw new HttpsError('failed-precondition', error.message); }
});
