import { createHash, randomUUID } from 'node:crypto';
import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { STANDARD_ITEMS, STANDARD_VERSION } from '../generated/item-register/item-register-standard.js';
import { normalizeOffer, canManageCharacter } from '../generated/item-register/item-register-model.js';
import { applyRegisterTrade, customizeOwnedItem } from '../generated/item-register/item-register-trade.js';
import { toMinor } from '../generated/item-register/item-register-money.js';
import { withProtectedRecordRevisions } from './protected-record-revisions.js';

const cleanId = value => {
  const id = String(value || '');
  if (!/^[\w:.-]{1,220}$/.test(id)) throw new HttpsError('invalid-argument', 'Ungültige Datensatz-ID.');
  return id;
};
const assertRevision = (current, expected) => {
  if (Number(current || 0) !== Number(expected || 0)) throw new HttpsError('aborted', 'Der Datensatz wurde zwischenzeitlich geändert. Bitte neu öffnen.');
};
function safeOffer(data) {
  const output = {};
  for (const key of ['id', 'templateId', 'title', 'listId', 'listName', 'category', 'type', 'description', 'details', 'image', 'priceRange', 'stock', 'buybackCopper', 'combatDefinition', 'tags', 'archived']) {
    if (data[key] !== undefined) output[key] = data[key];
  }
  if (JSON.stringify(output).length > 60000) throw new Error('Das Angebot ist zu groß.');
  const offer = normalizeOffer(output, STANDARD_ITEMS);
  if (offer.priceRange) {
    const min = toMinor(offer.priceRange.minCopper), max = toMinor(offer.priceRange.maxCopper);
    if (min > max) throw new Error('Die Preisspanne ist ungültig.');
  }
  if (offer.buybackCopper != null) toMinor(offer.buybackCopper);
  if (offer.combatDefinition?.damageFormula && !/^\d{1,2}[dw]\d{1,3}(?:\s*[+-]\s*\d{1,3})?$/i.test(offer.combatDefinition.damageFormula)) throw new Error('Die Schadensformel ist ungültig.');
  return offer;
}

export async function commitItemRegisterOperation(database, auth, input) {
  if (!auth) throw new HttpsError('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const role = String(auth.token?.aleriaRole || 'player');
  const access = { uid: auth.uid, authenticated: true, canModerate: ['admin', 'moderator'].includes(role) };
  const action = String(input.action || '');
  const operationId = cleanId(input.operationId);
  const receiptRef = database.collection('item_register_transactions').doc(`${auth.uid}-${operationId}`);
  const fingerprint = createHash('sha256').update(JSON.stringify(input)).digest('hex');
  const now = new Date().toISOString();
  const instanceId = `possession-${randomUUID()}`;
  const newCreatureRef = database.collection('creatures').doc();

  return database.runTransaction(async transaction => {
    const prior = await transaction.get(receiptRef);
    if (prior.exists) {
      if (prior.data().fingerprint !== fingerprint) throw new HttpsError('already-exists', 'Diese Vorgangs-ID wurde bereits verwendet.');
      return prior.data().result;
    }
    let result;
    if (action === 'save-offer') {
      if (!['admin', 'moderator', 'editor'].includes(role)) throw new HttpsError('permission-denied', 'Sortimente werden von der Spielleitung und Redaktion verwaltet.');
      const id = cleanId(input.offer?.id);
      if (!id.startsWith('offer:')) throw new Error('Angebote benötigen eine eigene ID.');
      const ref = database.collection('item_register_offers').doc(id);
      const current = await transaction.get(ref);
      assertRevision(current.data()?.revision, input.expectedRevision);
      const offer = { ...safeOffer(input.offer), id, revision: (current.data()?.revision || 0) + 1, updatedAt: now, updatedBy: auth.uid };
      transaction.set(ref, offer);
      result = { offer, message: 'Sortiment gespeichert.' };
    } else {
      const characterRef = database.collection('characters').doc(cleanId(input.characterId));
      const characterSnapshot = await transaction.get(characterRef);
      if (!characterSnapshot.exists) throw new HttpsError('not-found', 'Die Figur wurde nicht gefunden.');
      const character = { ...characterSnapshot.data(), id: characterRef.id };
      if (!canManageCharacter(character, access)) throw new HttpsError('permission-denied', 'Nur der Besitzer der Figur oder die Spielleitung kann diesen Vorgang ausführen.');
      const lock = await transaction.get(database.doc(`combat_profile_locks/characters/records/${character.id}`));
      if (lock.data()?.activeEncounterKeys?.length) throw new HttpsError('failed-precondition', 'Während eines aktiven Kampfes ist das Inventar gesperrt.');
      assertRevision(character.inventory?.revision, input.expectedRevision);
      const existingItem = (character.inventory?.items || []).find(item => item.id === input.inventoryItemId);
      const creatureRef = existingItem?.creatureId ? database.collection('creatures').doc(cleanId(existingItem.creatureId)) : null;
      const creatureSnapshot = creatureRef ? await transaction.get(creatureRef) : null;
      if (creatureRef) {
        const creatureLock = await transaction.get(database.doc(`combat_profile_locks/creatures/records/${creatureRef.id}`));
        if (creatureLock.data()?.activeEncounterKeys?.length) throw new Error('Der Begleiter nimmt gerade an einem Kampf teil.');
        if (!creatureSnapshot.exists || creatureSnapshot.data().itemOrigin?.instanceId !== (existingItem.instanceId || existingItem.id)
          || creatureSnapshot.data().itemOrigin?.ownerCharacterId !== character.id) throw new Error('Die Begleiterverknüpfung muss zuerst geprüft werden.');
      }
      let updates;
      if (action === 'buy' || action === 'sell') {
        if (input.standardVersion !== STANDARD_VERSION) throw new Error('Die Standardgüter wurden aktualisiert. Bitte die Seite neu laden.');
        const productId = cleanId(input.productId);
        const offerRef = productId.startsWith('offer:') ? database.collection('item_register_offers').doc(productId) : null;
        const offerSnapshot = offerRef ? await transaction.get(offerRef) : null;
        const product = offerRef ? offerSnapshot.data() : STANDARD_ITEMS.find(item => item.id === productId);
        if (!product) throw new HttpsError('not-found', 'Das Angebot wurde nicht gefunden.');
        if (offerRef) assertRevision(product.revision, input.offerRevision);
        const trade = applyRegisterTrade(character, product, { ...input, direction: action }, { instanceId, now });
        updates = { inventory: trade.inventory, combatProfile: trade.combatProfile };
        if (offerRef && action === 'buy') transaction.update(offerRef, { stock: trade.stock, revision: product.revision + 1, updatedAt: now });
        if (creatureRef && action === 'sell') transaction.update(creatureRef, { itemOrigin: { ...creatureSnapshot.data().itemOrigin, ownerCharacterId: '', ownerCharacterName: '', disposition: 'sold', soldAt: now }, updatedAt: now });
        result = { receipt: trade.receipt, message: action === 'buy' ? 'Kauf abgeschlossen.' : 'Verkauf abgeschlossen.' };
      } else if (action === 'customize') {
        const customized = customizeOwnedItem(character, input, now);
        updates = { inventory: customized.inventory, combatProfile: customized.combatProfile };
        if (creatureRef) transaction.update(creatureRef, { name: customized.item.name, portrait: customized.item.image || '', notes: customized.item.description || '', updatedAt: now });
        result = { message: 'Besitz aktualisiert.' };
      } else if (action === 'link-creature') {
        if (!existingItem || !['pferde', 'vieh'].includes(existingItem.registerCategory)) throw new Error('Nur ein Tier im Inventar kann als Begleiter angelegt werden.');
        if (existingItem.creatureId) throw new Error('Dieser Besitz ist bereits mit einer Kreatur verbunden.');
        if (Number(existingItem.quantity) !== 1) throw new Error('Bitte ein einzelnes Tier auswählen.');
        const inventory = JSON.parse(JSON.stringify(character.inventory));
        const item = inventory.items.find(entry => entry.id === input.inventoryItemId);
        item.instanceId ||= item.id;
        item.creatureId = newCreatureRef.id;
        const creature = { name: item.name, type: 'Tier', species: item.templateName || item.type || '',
          notes: item.description || '', portrait: item.image || '', ownerUid: character.ownerUid || auth.uid,
          createdBy: auth.uid, createdAt: now, updatedAt: now, schemaVersion: 3, needsStatReview: true,
          itemOrigin: { instanceId: item.instanceId, inventoryItemId: item.id, templateId: item.templateId || '',
            ownerCharacterId: character.id, ownerCharacterName: character.name, disposition: 'owned' } };
        transaction.create(newCreatureRef, creature);
        updates = { inventory };
        result = { creature: { id: newCreatureRef.id, ...creature }, message: 'Begleiter angelegt. Die Spielwerte können im Bestiarium ergänzt werden.' };
      } else throw new HttpsError('invalid-argument', 'Unbekannter Registervorgang.');
      const changed = ['inventory', ...(updates.combatProfile ? ['combatProfile'] : [])];
      updates = withProtectedRecordRevisions(character, { ...updates, updatedAt: now }, changed);
      transaction.update(characterRef, updates);
      result.character = { ...character, ...updates };
    }
    // Do not copy whole character sheets into the permanent purchase ledger.
    const receiptResult = { ...result };
    delete receiptResult.character;
    transaction.create(receiptRef, { actorUid: auth.uid, operationId, fingerprint, action,
      characterId: input.characterId || '', at: now, result: receiptResult });
    return result;
  });
}

export const commitItemRegister = onCall({ region: 'europe-west1', maxInstances: 10, concurrency: 20, timeoutSeconds: 30 }, async request => {
  try { return await commitItemRegisterOperation(getFirestore(), request.auth, request.data || {}); }
  catch (error) {
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('failed-precondition', error.message || 'Der Registervorgang konnte nicht abgeschlossen werden.');
  }
});
