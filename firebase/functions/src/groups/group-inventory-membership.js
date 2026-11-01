import { HttpsError } from 'firebase-functions/v2/https';
import { resolveGroupRoster, groupMemberRecordId } from '../generated/landing/group-landing-roster.js';

const isMember = (roster, kind, id) => roster.some(member => member.kind === kind && groupMemberRecordId(member) === id);

async function belongs(database, transaction, account, kind, record) {
  // Explicit, saved links do not require scanning the character catalogue.
  if (isMember(resolveGroupRoster(account.entry, account.group), kind, record.id)) return true;
  if (kind !== 'character') return false;
  // Legacy hierarchies bind names instead of IDs. Resolve against the complete
  // bounded authoritative window so an ambiguous duplicate name grants no access.
  const snapshot = await transaction.get(database.collection('characters').limit(1001));
  if (snapshot.size > 1000) throw new HttpsError('failed-precondition', 'Die Gruppenmitglieder benötigen eindeutige gespeicherte Figurenverweise.');
  const characters = snapshot.docs.map(row => ({ ...row.data(), id: row.id }));
  return isMember(resolveGroupRoster(account.entry, account.group, characters), kind, record.id);
}

export async function assertGroupInventoryMember(database, transaction, account, kind, record) {
  if (await belongs(database, transaction, account, kind, record)) return;
  const origin = kind === 'creature' ? record.itemOrigin : null;
  if (origin?.ownerCharacterId && !origin.ownerGroupId && (!origin.disposition || origin.disposition === 'owned')) {
    const reference = database.doc(`characters/${origin.ownerCharacterId}`);
    const ownerSnapshot = await transaction.get(reference);
    const owner = { ...ownerSnapshot.data(), id: reference.id };
    const possession = owner.inventory?.items?.find(item => item.id === origin.inventoryItemId);
    if (ownerSnapshot.exists && possession?.creatureId === record.id
      && Number.isFinite(Number(possession.quantity ?? 1)) && Number(possession.quantity ?? 1) > 0
      && (possession.instanceId || possession.id) === origin.instanceId
      && await belongs(database, transaction, account, 'character', owner)) {
      const lock = await transaction.get(database.doc(`combat_profile_locks/characters/records/${owner.id}`));
      if (lock.data()?.activeEncounterKeys?.length) throw new HttpsError('failed-precondition', 'Die Besitzerfigur des Begleiters nimmt gerade an einem Kampf teil.');
      return;
    }
  }
  throw new HttpsError('permission-denied', 'Der Empfänger oder Geber gehört nicht zur gespeicherten Gruppenhierarchie oder ihren Gästen.');
}
