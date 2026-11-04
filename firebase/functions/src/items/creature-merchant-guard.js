import { HttpsError } from 'firebase-functions/v2/https';

export function isMerchantOwnedCreature(record) {
  return record?.itemOrigin?.disposition === 'sold' || !!record?.itemOrigin?.ownerMerchantId;
}

// Account/editor ownership is historical metadata. A sale changes the gameplay
// possession binding; the former editor does not retain control of that animal.
export function assertCreatureMerchantWrite(before, incoming, canModerate) {
  if (isMerchantOwnedCreature(before) && !canModerate) throw new HttpsError('permission-denied', 'Ein verkauftes Tier wird vom Händler gehalten und kann nur von der Spielleitung bearbeitet werden.');
  if (!isMerchantOwnedCreature(before) && isMerchantOwnedCreature(incoming)) throw new HttpsError('permission-denied', 'Die Händlerbindung eines Tiers wird ausschließlich durch einen Handelsvorgang gesetzt.');
}
