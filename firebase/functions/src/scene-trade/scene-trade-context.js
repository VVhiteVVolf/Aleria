import { HttpsError } from 'firebase-functions/v2/https';
import { parseSceneThread } from '../backup/scene-backup-format.js';
import { buildModuleOffers, isShopModule } from '../generated/item-register/item-register-module-catalog.js';
import { STANDARD_ITEMS } from '../generated/item-register/item-register-standard.js';

export const tradeId = value => {
  if (typeof value !== 'string' || !/^[\w:.-]{1,220}$/.test(value)) throw new HttpsError('invalid-argument', 'Eine Handelskennung ist ungültig.');
  return value;
};
export const tradeMerchantId = value => {
  if (typeof value !== 'string' || !value.trim() || value.length > 220 || /[\/\x00-\x1f\x7f]/.test(value)) throw new HttpsError('invalid-argument', 'Die Händlerkennung ist ungültig.');
  return value;
};
const moduleRef = (database, id) => database.doc(`module_store_entries/${encodeURIComponent(id).replace(/\./g, '%2E')}`);
const storedEntry = snapshot => {
  const data = snapshot.data();
  return data?.entryJson ? JSON.parse(data.entryJson) : data?.entry;
};
function assertPublic(entry, manifest) {
  const id = entry?.id;
  const section = manifest?.customSections?.find(section => section.entryIds?.includes(id));
  const assigned = manifest?.moduleSectionNodes?.find(node => node.id === manifest?.moduleNodeAssignments?.[id]);
  const effective = assigned || manifest?.moduleSectionMoves?.[id] || section;
  if (!isShopModule(entry) || !manifest || manifest.hiddenModuleIds?.[id]
    || ['Test', 'Familien'].includes(effective?.tab || effective?.key)
    || (!section && !manifest.entryOverrideIds?.includes(id))) {
    throw new HttpsError('failed-precondition', 'Dieses öffentliche Modul ist nicht mehr verfügbar.');
  }
}

export async function readTradeScene(database, transaction, entryId, manifest) {
  const location = parseSceneThread(entryId);
  if (!location) throw new HttpsError('invalid-argument', 'Eine gültige interaktive Szene ist erforderlich.');
  const entry = storedEntry(await transaction.get(moduleRef(database, location.moduleId)));
  assertPublic(entry, manifest);
  const page = entry.pages?.find((page, index) => page.sessionPage && String(page.commentThreadKey || index) === location.pageKey);
  const turn = await transaction.get(database.doc(`comment_turns/${entryId}`));
  if (entry.id !== location.moduleId || !page || page.sessionStatus === 'ended' || turn.data()?.current === 'ended') {
    throw new HttpsError('failed-precondition', 'Die interaktive Szene fehlt oder ist bereits abgeschlossen.');
  }
  return { entry, location, page };
}

export async function readTradeMerchant(database, transaction, merchantId, manifest) {
  tradeMerchantId(merchantId);
  if (merchantId.startsWith('module:')) {
    const id = merchantId.slice(7);
    const entry = storedEntry(await transaction.get(moduleRef(database, id)));
    assertPublic(entry, manifest);
    if (entry.id !== id) throw new HttpsError('failed-precondition', 'Der Händler wurde nicht gefunden.');
    const products = buildModuleOffers([entry], STANDARD_ITEMS);
    if (!products.length) throw new HttpsError('failed-precondition', 'Dieser Anbieter besitzt kein öffentliches Sortiment.');
    const portrait = [entry.portrait, entry.image, entry.symbol, entry.pages?.[0]?.image].find(value => typeof value === 'string' && value.trim()) || '';
    return { id: merchantId, name: entry.title || id, portrait, products };
  }
  const snapshot = await transaction.get(database.collection('item_register_offers').where('listId', '==', merchantId).limit(1001));
  if (snapshot.size > 1000) throw new HttpsError('failed-precondition', 'Das Sortiment ist für einen Szenenhandel zu groß.');
  const products = snapshot.docs.map(row => ({ ...row.data(), id: row.id })).filter(product => !product.archived);
  if (!products.length) throw new HttpsError('not-found', 'Der öffentliche Händler wurde nicht gefunden.');
  return { id: merchantId, name: products[0].listName || 'Händler', products };
}
