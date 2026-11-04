import { HttpsError } from 'firebase-functions/v2/https';
import { productWithItemDefinition, readItemDefinition } from '../items/item-definition-repository.js';
import { itemDefinitionFromTemplate, itemDefinitionKey } from '../generated/item-definitions/item-definition-model.js';
import { readTradeMerchant } from './scene-trade-context.js';

export async function readMerchantAvailabilityOperation(database, auth, input = {}) {
  if (!auth) throw new HttpsError('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  return database.runTransaction(async transaction => {
    const manifest = (await transaction.get(database.doc('char_tabs/config'))).data()?.moduleStoreManifest;
    const merchant = await readTradeMerchant(database, transaction, input.merchantId, manifest);
    const definitions = new Map(), claims = new Map();
    const products = [];
    for (const source of merchant.products) {
      const product = productWithItemDefinition(source), key = itemDefinitionKey(product.definitionRef);
      if (!definitions.has(key)) definitions.set(key, await readItemDefinition(database, transaction, product.definitionRef, { required: false }) || itemDefinitionFromTemplate(product));
      const definition = definitions.get(key), unique = definition?.kind === 'unique' || product.definitionKind === 'unique';
      if (unique && definition?.kind !== 'unique') throw new HttpsError('failed-precondition', 'Die Unikatmarkierung stimmt nicht mit der verbindlichen Itemversion überein.');
      let status = product.available === false ? 'unavailable' : 'available';
      if (unique) {
        if (!claims.has(definition.id)) claims.set(definition.id, await transaction.get(database.doc(`item_unique_claims/${definition.id}`)));
        const claim = claims.get(definition.id);
        if (claim.exists) status = claim.data()?.holder?.kind === 'vendor' ? 'sold' : 'owned';
      }
      products.push({ productId: product.id, unique, available: status === 'available', status });
    }
    return { products };
  });
}
