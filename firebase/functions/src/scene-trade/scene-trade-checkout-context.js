import { HttpsError } from 'firebase-functions/v2/https';
import { readTradeMerchant, readTradeScene } from './scene-trade-context.js';

// Checkout context is a server policy, never a client-supplied permission flag.
// The catalog entry point deliberately exposes only the module goods register's
// one-product purchase. Scene carts retain their existing trading behavior.
export function tradeCheckoutPolicy(input) {
  if (input.action === 'checkout') return { kind: 'scene', createsComment: true };
  if (input.action !== 'catalog-checkout') throw new HttpsError('invalid-argument', 'Der Handelskontext ist ungültig.');
  const line = input.lines?.[0];
  if (!input.merchantId?.startsWith('module:') || input.merchantId.length <= 7
    || input.entryId !== input.merchantId.slice(7) || input.lines?.length !== 1 || line?.direction !== 'buy'
    || line.priceMode !== 'standard' || !line.recipientKey?.startsWith('character:')) {
    throw new HttpsError('invalid-argument', 'Ein Direktkauf benötigt genau eine Modulware zum Standardpreis und eine Empfängerfigur.');
  }
  return { kind: 'catalog', createsComment: false };
}

export async function readTradeCheckoutContext(database, transaction, input, manifest, policy) {
  const scene = policy.kind === 'scene' ? await readTradeScene(database, transaction, input.entryId, manifest) : null;
  const merchant = await readTradeMerchant(database, transaction, input.merchantId, manifest);
  return { kind: policy.kind, scene, merchant };
}

export function assertTradeGroupContext(account, groupId, input, context) {
  if (context.kind === 'catalog') return;
  const linked = [account.group.threadId, ...(account.group.sceneThreads || [])].includes(input.entryId);
  if (!linked && context.scene.location.moduleId !== groupId) {
    throw new HttpsError('permission-denied', 'Diese Gruppe ist nicht mit der Szene verknüpft.');
  }
}
