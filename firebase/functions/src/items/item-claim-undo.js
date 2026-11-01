import { HttpsError } from 'firebase-functions/v2/https';
const identity = value => JSON.stringify({ instanceId: value?.instanceId, holder: value?.holder || null });
export async function prepareItemClaimUndo(database, transaction, changes = []) {
  const writes = [];
  for (const change of changes) {
    if (!change.definitionId || String(change.definitionId).includes('/')) throw new HttpsError('failed-precondition', 'Die Unikat-Rücknahme besitzt keine gültige Kennung.');
    const ref = database.collection('item_unique_claims').doc(change.definitionId);
    const current = await transaction.get(ref);
    if (!current.exists || identity(current.data()) !== identity(change.after)) throw new HttpsError('failed-precondition', 'Ein späterer Besitzwechsel verhindert die Rücknahme dieses Unikats.');
    writes.push({ ref, before: change.before });
  }
  return () => { for (const write of writes) if (write.before) transaction.set(write.ref, write.before); else transaction.delete(write.ref); };
}
