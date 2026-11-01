import { toMinor } from '../item-register/item-register-money.js';
const factor = { gold: 1000, silver: 100, copper: 1, pfennig: .01 };
// Split integer Pfennig exactly. Indivisible objects stay with their selected recipient.
export function splitQuestMoney(rows, party) {
  const members = party.filter(member => member.kind === 'character');
  if (!members.length) throw Error('Für die Verteilung fehlen Charaktere.');
  const minor = rows.filter(row => row.kind === 'money').reduce((sum, row) => sum + toMinor(row.amount * factor[row.currency]), 0);
  if (!Number.isSafeInteger(minor) || minor < 0) throw Error('Der Geldbetrag ist ungültig.');
  const share = Math.floor(minor / members.length), rest = minor % members.length;
  return [...members.map((member, index) => ({ kind: 'money', currency: 'copper', amount: (share + (index < rest ? 1 : 0)) / 100, recordId: member.recordId, recipientKind: 'character' })).filter(row => row.amount > 0), ...rows.filter(row => row.kind !== 'money').map(row => ({ ...row }))];
}
