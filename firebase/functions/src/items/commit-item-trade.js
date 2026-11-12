// Register purchases use the same transaction whether started in the register
// or during dialogue. Price, stock, item, vendor account and scene receipt are
// committed together by the existing register service.
import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { commitItemRegisterOperation } from '../mechanics/commit-item-register.js';
import { commitSceneTradeOperation, readMerchantSoldOperation } from '../scene-trade/commit-scene-trade.js';
import { readMerchantAvailabilityOperation } from '../scene-trade/scene-trade-availability.js';
export const commitItemTrade = onCall({ region: 'europe-west1', timeoutSeconds: 30, maxInstances: 10 }, async request => {
  try {
    if (request.data?.action === 'availability') return await readMerchantAvailabilityOperation(getFirestore(), request.auth, request.data);
    if (request.data?.action === 'sold') return await readMerchantSoldOperation(getFirestore(), request.auth, request.data);
    if (['checkout', 'catalog-checkout'].includes(request.data?.action)) return await commitSceneTradeOperation(getFirestore(), request.auth, request.data);
    if (!request.data?.entryId || !['buy', 'sell'].includes(request.data?.action)) throw new HttpsError('invalid-argument', 'Ein Szenenhandel benötigt eine Szene und einen Kauf oder Verkauf.');
    return await commitItemRegisterOperation(getFirestore(), request.auth, request.data);
  }
  catch (error) { if (error instanceof HttpsError) throw error; throw new HttpsError('failed-precondition', error.message); }
});
