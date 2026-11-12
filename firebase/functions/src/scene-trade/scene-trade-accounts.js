import { HttpsError } from 'firebase-functions/v2/https';
import { readQuestGroupAccount } from '../quests/quest-group-account.js';
import { assertGroupInventoryMember } from '../groups/group-inventory-membership.js';
import { tradeId } from './scene-trade-context.js';
import { assertTradeGroupContext } from './scene-trade-checkout-context.js';

export function tradeAccountKey(value) {
  const match = typeof value === 'string' && value.match(/^(character|group):([\w:.-]{1,220})$/);
  if (!match) throw new HttpsError('invalid-argument', 'Eine Bestellung benötigt eindeutige Figuren- oder Gruppenkonten.');
  return { key: value, kind: match[1], id: tradeId(match[2]) };
}
export async function readTradeAccounts(database, transaction, input, context) {
  const actorId = tradeId(input.actorCharacterId);
  const actorSnapshot = await transaction.get(database.doc(`characters/${actorId}`));
  if (!actorSnapshot.exists) throw new HttpsError('not-found', 'Die bestellende Figur wurde nicht gefunden.');
  // Scene trade is shared roleplay: a signed-in user may choose any existing
  // figure. Account ownership remains metadata, not a spending permission.
  const keys = new Set(input.lines.flatMap(line => line.direction === 'sell' ? [line.sellerKey] : [line.payerKey, line.recipientKey]));
  const records = [], targets = new Map();
  for (const value of keys) {
    const key = tradeAccountKey(value);
    let record, reference, exists = true, account = null;
    if (key.kind === 'group') {
      account = await readQuestGroupAccount(database, transaction, key.id);
      assertTradeGroupContext(account, key.id, input, context);
      await assertGroupInventoryMember(database, transaction, account, 'character', { ...actorSnapshot.data(), id: actorId });
      record = account.record; reference = account.reference; exists = account.exists;
    } else {
      reference = database.doc(`characters/${key.id}`);
      const snapshot = key.id === actorId ? actorSnapshot : await transaction.get(reference);
      if (!snapshot.exists) throw new HttpsError('not-found', 'Eine beteiligte Figur wurde nicht gefunden.');
      record = { ...snapshot.data(), id: key.id };
    }
    const expected = input.expectedRevisions?.[value], actual = key.kind === 'group' ? record.revision : record.inventory?.revision;
    if (!Number.isSafeInteger(expected) || expected !== Number(actual || 0)) throw new HttpsError('aborted', 'Ein beteiligter Bestand wurde inzwischen geändert. Bitte neu öffnen.');
    const holderKind = key.kind === 'group' ? 'groups' : 'characters';
    const lock = await transaction.get(database.doc(`combat_profile_locks/${holderKind}/records/${key.id}`));
    if (lock.data()?.activeEncounterKeys?.length) throw new HttpsError('failed-precondition', 'Ein beteiligter Bestand ist während eines aktiven Kampfes gesperrt.');
    const projected = { ...record, ...key, _itemHolderKind: holderKind };
    records.push(projected); targets.set(value, { record: projected, reference, exists, account });
  }
  return { records, targets, actor: { ...actorSnapshot.data(), id: actorId } };
}
