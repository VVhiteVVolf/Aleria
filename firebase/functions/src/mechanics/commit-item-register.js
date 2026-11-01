import { createHash, randomUUID } from 'node:crypto';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { STANDARD_ITEMS, STANDARD_VERSION } from '../generated/item-register/item-register-standard.js';
import { normalizeOffer, canManageCharacter } from '../generated/item-register/item-register-model.js';
import { applyRegisterTrade, customizeOwnedItem } from '../generated/item-register/item-register-trade.js';
import { toMinor } from '../generated/item-register/item-register-money.js';
import { moneyTotal, moneyState, formatMoney } from '../generated/item-register/item-register-money.js';
import { withProtectedRecordRevisions } from './protected-record-revisions.js';
import { resolveModuleProduct } from './item-register-module-source.js';
import { productWithItemDefinition, prepareTemplateDefinition, prepareUniqueItemClaims, readItemDefinitionIndex } from '../items/item-definition-repository.js';
import { selectiveItemInventoryUpdate } from '../items/item-inventory-update.js';
import { synchronizeEquipmentFromInventory } from '../generated/character-equipment/character-equipment-sync.js';

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
  for (const key of ['id', 'templateId', 'definitionRef', 'sellerCharacterId', 'title', 'listId', 'listName', 'category', 'type', 'description', 'details', 'image', 'priceRange', 'stock', 'buybackCopper', 'combatDefinition', 'tags', 'archived']) {
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
  const sceneCommentRef = input.entryId ? database.collection('comments').doc() : null;

  return database.runTransaction(async transaction => {
    const prior = await transaction.get(receiptRef);
    if (prior.exists) {
      if (prior.data().fingerprint !== fingerprint) throw new HttpsError('already-exists', 'Diese Vorgangs-ID wurde bereits verwendet.');
      const character = input.characterId ? await transaction.get(database.collection('characters').doc(cleanId(input.characterId))) : null;
      return { ...prior.data().result, ...(character?.exists ? { character: { ...character.data(), id: character.id } } : {}) };
    }
    let result;
    if (action === 'save-offer') {
      if (!['admin', 'moderator', 'editor'].includes(role)) throw new HttpsError('permission-denied', 'Sortimente werden von der Spielleitung und Redaktion verwaltet.');
      const id = cleanId(input.offer?.id);
      if (!id.startsWith('offer:')) throw new Error('Angebote benötigen eine eigene ID.');
      const ref = database.collection('item_register_offers').doc(id);
      const current = await transaction.get(ref);
      assertRevision(current.data()?.revision, input.expectedRevision);
      let offer = { ...safeOffer(input.offer), id, revision: (current.data()?.revision || 0) + 1, updatedAt: now, updatedBy: auth.uid };
      if (!Object.hasOwn(input.offer, 'sellerCharacterId') && current.data()?.sellerCharacterId) offer.sellerCharacterId = current.data().sellerCharacterId;
      if (offer.sellerCharacterId) {
        const seller = await transaction.get(database.collection('characters').doc(cleanId(offer.sellerCharacterId)));
        if (!seller.exists || !canManageCharacter(seller.data(), access)) throw new HttpsError('permission-denied', 'Ein Figurenkonto kann nur vom Besitzer oder der Spielleitung mit einem Sortiment verbunden werden.');
      }
      offer = productWithItemDefinition(offer);
      const prepared = await prepareTemplateDefinition(database, transaction, offer, { actorUid: auth.uid, publishHead: true, now });
      offer = { ...offer, definitionRef: { id: prepared.definition.id, revision: prepared.definition.revision },
        category: prepared.definition.category, stackable: prepared.definition.stackable, combatDefinition: prepared.definition.combatDefinition,
        useDefinition: prepared.definition.useDefinition, inventoryUseMode: prepared.definition.inventoryUseMode };
      prepared.write();
      transaction.set(ref, offer);
      result = { offer, message: 'Sortiment gespeichert.' };
    } else {
      const characterRef = database.collection('characters').doc(cleanId(input.characterId));
      const characterSnapshot = await transaction.get(characterRef);
      if (!characterSnapshot.exists) throw new HttpsError('not-found', 'Die Figur wurde nicht gefunden.');
      const rawCharacter = { ...characterSnapshot.data(), id: characterRef.id };
      const itemDefinitions = await readItemDefinitionIndex(database, transaction, [rawCharacter]);
      const character = rawCharacter;
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
        let product = productId.startsWith('module:')
          ? await resolveModuleProduct({ database, transaction, input, standards: STANDARD_ITEMS, existingItem })
          : offerRef ? offerSnapshot.data() : STANDARD_ITEMS.find(item => item.id === productId || item.aliases?.includes(productId));
        if (!product) throw new HttpsError('not-found', 'Das Angebot wurde nicht gefunden.');
        if (offerRef) assertRevision(product.revision, input.offerRevision);
        const vendorId = String(product.listId || product.moduleId || product.id);
        const vendorRef = database.collection('item_vendor_wallets').doc(createHash('sha256').update(vendorId).digest('hex'));
        const vendorWallet = await transaction.get(vendorRef);
        const sellerRef = product.sellerCharacterId ? database.collection('characters').doc(cleanId(product.sellerCharacterId)) : null;
        const sellerSnapshot = sellerRef ? await transaction.get(sellerRef) : null;
        if (sellerRef) {
          if (!sellerSnapshot.exists || sellerRef.id === character.id) throw new HttpsError('failed-precondition', 'Das Anbieterkonto fehlt oder ist mit dem Käufer identisch.');
          const sellerLock = await transaction.get(database.doc(`combat_profile_locks/characters/records/${sellerRef.id}`));
          if (sellerLock.data()?.activeEncounterKeys?.length) throw new HttpsError('failed-precondition', 'Das Anbieterkonto nimmt gerade an einem Kampf teil.');
        }
        let preparedDefinition = null, claim = () => {};
        if (action === 'buy') {
          product = productWithItemDefinition(product);
          preparedDefinition = await prepareTemplateDefinition(database, transaction, product, { actorUid: auth.uid, publishHead: true, now });
          if (preparedDefinition.definition) {
            const definition = preparedDefinition.definition;
            itemDefinitions.set(`${definition.id}@${definition.revision}`, definition);
            product = { ...product, combatDefinition: definition.combatDefinition, inventoryUseMode: definition.inventoryUseMode,
              useDefinition: definition.useDefinition, definitionKind: definition.kind, category: definition.category, stackable: definition.stackable };
            claim = await prepareUniqueItemClaims(database, transaction, [{ definition, instanceId, quantity: input.quantity, holder: { kind: 'characters', recordId: character.id, itemId: instanceId } }], { now, actorUid: auth.uid });
          }
        }
        const trade = applyRegisterTrade(character, product, { ...input, direction: action }, { instanceId, now,
          ...(preparedDefinition?.definition ? { definition: preparedDefinition.definition } : {}), definitions: itemDefinitions });
        if (action === 'sell' && existingItem?.definitionRef) claim = await prepareUniqueItemClaims(database, transaction, [{
          definition: itemDefinitions.get(`${existingItem.definitionRef.id}@${existingItem.definitionRef.revision}`),
          instanceId: existingItem.instanceId || existingItem.id, quantity: input.quantity,
          holder: { kind: 'vendor', recordId: vendorId, itemId: existingItem.instanceId || existingItem.id },
          previousHolder: { kind: 'characters', recordId: character.id, itemId: existingItem.id }
        }], { actorUid: auth.uid, now });
        updates = selectiveItemInventoryUpdate(character, trade, [trade.receipt.itemId], { preserveExisting: action === 'sell' });
        const delta = toMinor(trade.receipt.totalCopper) * (action === 'buy' ? 1 : -1);
        const netMinor = Number(vendorWallet.data()?.netMinor || 0) + delta;
        if (!Number.isSafeInteger(netMinor)) throw new HttpsError('failed-precondition', 'Das Händlerkonto überschreitet den unterstützten Zahlenbereich.');
        let sellerUpdates = null;
        if (sellerRef) {
          const seller = sellerSnapshot.data(), inventory = structuredClone(seller.inventory || { items: [] });
          const balance = toMinor(moneyTotal(inventory.moneyState || inventory.money)) + delta;
          if (!Number.isSafeInteger(balance) || balance < 0) throw new HttpsError('failed-precondition', 'Der Anbieter kann den Ankaufspreis nicht bezahlen.');
          inventory.moneyState = moneyState(balance / 100); inventory.money = formatMoney(inventory.moneyState);
          sellerUpdates = withProtectedRecordRevisions(seller, { inventory, updatedAt: now }, ['inventory']);
        }
        preparedDefinition?.write();
        claim();
        transaction.set(vendorRef, { vendorId, name: product.listName || 'Warenregister', netMinor, updatedAt: now });
        if (sellerUpdates) transaction.update(sellerRef, sellerUpdates);
        if (offerRef && action === 'buy') transaction.update(offerRef, { stock: trade.stock, revision: product.revision + 1, updatedAt: now });
        if (creatureRef && action === 'sell') transaction.update(creatureRef, { itemOrigin: { ...creatureSnapshot.data().itemOrigin, ownerCharacterId: '', ownerCharacterName: '', disposition: 'sold', soldAt: now }, updatedAt: now });
        result = { receipt: trade.receipt, message: action === 'buy' ? 'Kauf abgeschlossen.' : 'Verkauf abgeschlossen.' };
        if (sceneCommentRef) {
          const text = `${character.name || 'Eine Figur'} ${action === 'buy' ? 'kauft' : 'verkauft'} ${input.quantity} × ${trade.receipt.name} für ${trade.receipt.totalCopper} KT bei ${product.listName || 'einem Händler'}.`;
          transaction.create(sceneCommentRef, { entryId: String(input.entryId).slice(0, 240), text, charName: 'Erzähler', narrator: true,
            characterId: '', avatarKind: 'narrator', commentMode: 'scene-inventory-transfer', commentKind: 'scene-inventory-transfer-event',
            sceneInventoryTransfer: { transferId: operationId, schemaVersion: 3,
              giver: { id: vendorId, name: product.listName || 'Händler' }, receiver: { id: character.id, name: character.name || '' },
              object: { kind: 'register-item', name: trade.receipt.name, quantity: Number(input.quantity), totalCopper: trade.receipt.totalCopper, definitionRef: product.definitionRef || null },
              flavour: String(input.flavour || '').slice(0, 3000), createdAt: now },
            inventoryTransaction: { schemaVersion: 3, validatedBy: 'commitItemRegister', trade: true, operations: 1 },
            serverValidatedMechanics: true, createdBy: auth.uid, createdByRole: role, schemaVersion: 3,
            orderKey: Date.now(), createdAtClient: Date.now(), ts: FieldValue.serverTimestamp(), activityAt: FieldValue.serverTimestamp() });
          result.commentId = sceneCommentRef.id;
        }
      } else if (action === 'customize') {
        const customized = customizeOwnedItem(character, input, now);
        const synced = synchronizeEquipmentFromInventory({ inventory: customized.inventory, combatProfile: character.combatProfile || {},
          definitions: itemDefinitions, preserveLoadout: true });
        updates = selectiveItemInventoryUpdate(character, synced, [customized.item.id]);
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
