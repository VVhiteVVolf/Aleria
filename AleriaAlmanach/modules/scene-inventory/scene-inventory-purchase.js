import { STANDARD_VERSION } from '../item-register/item-register-standard.js';
import { itemDefinitionStore } from '../item-definitions/item-definition-store.js';
import { connectItemDefinitionClient } from '../item-definitions/item-definition-client.js';

export async function purchaseSceneItem({ input, threadId, flavour, attempt, characters }) {
  if (!attempt.purchaseRequest) {
    const product = input.registerItem;
    if (!product?.priceRange) throw Error('Für diese Ware fehlt ein bestätigter Handelspreis. Bitte ein Angebot aus dem Register wählen.');
    const buyer = characters.find(character => character.id === input.receiverId);
    if (!buyer) throw Error('Bitte einen gespeicherten Käufer wählen.');
    attempt.purchaseRequest = { action: 'buy', operationId: crypto.randomUUID(), entryId: threadId, flavour,
      characterId: buyer.id, expectedRevision: buyer.inventory?.revision || 0, standardVersion: STANDARD_VERSION,
      productId: product.id || product.canonicalKey, quantity: Number(input.quantity), unitCopper: Number(input.unitCopper),
      offerRevision: product.revision || 0,
      ...(product.moduleId ? { moduleId: product.moduleId, sourceRevision: product.sourceRevision || '' } : {}) };
  }
  await connectItemDefinitionClient();
  return itemDefinitionStore.trade(attempt.purchaseRequest);
}
