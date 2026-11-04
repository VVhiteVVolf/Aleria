import { HttpsError } from 'firebase-functions/v2/https';
import { productWithItemDefinition, prepareTemplateDefinition } from '../items/item-definition-repository.js';
import { itemDefinitionKey } from '../generated/item-definitions/item-definition-model.js';

export async function prepareTradeProducts(database, transaction, lines, merchant, records, definitions, identity, options) {
  const byKey = new Map(records.map(record => [record.key, record]));
  const prepared = new Map(), resolved = [], creatures = [];
  for (const [index, line] of lines.entries()) {
    if (!['buy', 'sell'].includes(line.direction)) throw new HttpsError('invalid-argument', 'Eine Bestellzeile muss Kauf oder Verkauf sein.');
    const instanceId = `${identity}:${index}`;
    let product, definition;
    if (line.direction === 'buy') {
      product = merchant.products.find(product => product.id === line.productId);
      if (!product || product.archived) throw new HttpsError('not-found', 'Die Ware ist nicht mehr im ausgewählten Sortiment.');
      if (product.moduleId && (product.moduleId !== line.moduleId || product.sourceRevision !== line.sourceRevision)) throw new HttpsError('aborted', 'Das Sortiment wurde inzwischen geändert. Bitte neu öffnen.');
      if (!product.moduleId && (!Number.isSafeInteger(line.offerRevision) || line.offerRevision !== Number(product.revision || 0))) throw new HttpsError('aborted', 'Das Angebot wurde inzwischen geändert. Bitte neu öffnen.');
      product = productWithItemDefinition(product);
      const definitionKey = itemDefinitionKey(product.definitionRef);
      let saved = prepared.get(definitionKey);
      if (!saved) {
        saved = await prepareTemplateDefinition(database, transaction, product, options);
        prepared.set(definitionKey, saved);
      }
      definition = saved.definition;
      if (product.definitionKind === 'unique' && definition?.kind !== 'unique') throw new HttpsError('failed-precondition', 'Die Unikatmarkierung stimmt nicht mit der verbindlichen Itemversion überein.');
      if (definition) definitions.set(itemDefinitionKey(definition), definition);
    } else {
      const record = byKey.get(line.sellerKey), item = record?.inventory?.items?.find(item => item.id === line.itemId);
      if (!item) throw new HttpsError('failed-precondition', 'Der verkaufte Gegenstand fehlt im angegebenen Besitz.');
      definition = definitions.get(itemDefinitionKey(item.definitionRef));
      if (item.definitionRef && !definition) throw new HttpsError('failed-precondition', 'Die verbindliche Itemversion des verkauften Gegenstands fehlt.');
      const ownOffer = merchant.products.find(product => product.id === item.offerId && (!line.productId || product.id === line.productId));
      product = ownOffer || { id: item.offerId || item.templateId || item.id, title: item.name, category: item.registerCategory || definition?.category || 'sonstiges', priceRange: item.valuation || null };
      if (item.creatureId) {
        if (Number(line.quantity) !== 1 || Number(item.quantity ?? 1) !== 1) throw new HttpsError('failed-precondition', 'Ein verknüpftes Tier kann nur einzeln verkauft werden.');
        const reference = database.doc(`creatures/${item.creatureId}`), snapshot = await transaction.get(reference);
        const origin = snapshot.data()?.itemOrigin;
        if (!snapshot.exists || origin?.inventoryItemId !== item.id || origin?.instanceId !== (item.instanceId || item.id)
          || (record.kind === 'group' ? origin.ownerGroupId !== record.id || !!origin.ownerCharacterId : origin.ownerCharacterId !== record.id || !!origin.ownerGroupId)) {
          throw new HttpsError('failed-precondition', 'Die Begleiterverknüpfung wurde geändert.');
        }
        const lock = await transaction.get(database.doc(`combat_profile_locks/creatures/records/${item.creatureId}`));
        if (lock.data()?.activeEncounterKeys?.length) throw new HttpsError('failed-precondition', 'Der verknüpfte Begleiter nimmt gerade an einem Kampf teil.');
        creatures.push({ lineId: line.id, reference, origin });
      }
    }
    resolved.push({ ...line, product, ...(definition ? { definition } : {}), instanceId });
  }
  return { lines: resolved, creatures, write() { prepared.forEach(definition => definition.write()); } };
}
