import { buildModuleOffers, isShopModule } from '../generated/item-register/item-register-module-catalog.js';

/** Read source and manifest inside the purchase transaction. Client rows and
 * prices are never authoritative, and hidden/template modules cannot be sold. */
export async function resolveModuleProduct({ database, transaction, input, standards, existingItem }) {
  if (input.action === 'sell' && existingItem?.offerId === input.productId) {
    // Paid, individualized goods can still be sold after a menu is revised.
    return { id: input.productId, section: 'offer', templateId: existingItem.templateId || '',
      title: existingItem.name, category: existingItem.registerCategory, stock: null };
  }
  const moduleId = String(input.moduleId || '');
  if (!moduleId || moduleId.length > 200 || /[\x00-\x1f]/.test(moduleId)) throw new Error('Die Herkunft des Angebots fehlt.');
  const docId = encodeURIComponent(moduleId).replace(/\./g, '%2E');
  const config = (await transaction.get(database.doc('char_tabs/config'))).data();
  const manifest = config?.moduleStoreManifest;
  const section = manifest?.customSections?.find(section => section.entryIds?.includes(moduleId));
  const moved = manifest?.moduleSectionMoves?.[moduleId];
  const assigned = manifest?.moduleSectionNodes?.find(node => node.id === manifest?.moduleNodeAssignments?.[moduleId]);
  const effectiveSection = assigned || moved || section;
  const hiddenSection = ['Test', 'Familien'].includes(effectiveSection?.tab || effectiveSection?.key);
  if (!manifest || manifest.hiddenModuleIds?.[moduleId] || hiddenSection || (!section && !manifest.entryOverrideIds?.includes(moduleId))) {
    throw new Error('Dieses Modul ist nicht mehr als Anbieter verfügbar.');
  }
  const document = (await transaction.get(database.collection('module_store_entries').doc(docId))).data();
  const entry = document?.entryJson ? JSON.parse(document.entryJson) : document?.entry;
  if (entry?.id !== moduleId || !isShopModule(entry)) throw new Error('Das Anbietermodul wurde nicht gefunden.');
  const product = buildModuleOffers([entry], standards).find(offer => offer.id === input.productId);
  if (!product) throw new Error('Die Ware ist nicht mehr im Sortiment. Bitte das Register neu öffnen.');
  if (product.sourceRevision !== input.sourceRevision) throw new Error('Das Warenregister wurde zwischenzeitlich geändert. Bitte das Angebot neu öffnen.');
  return product;
}
