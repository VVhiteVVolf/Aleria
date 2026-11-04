import { formatCopper } from '../item-register/item-register-money.js';

const linesOf = receipt => Array.isArray(receipt?.lines) ? receipt.lines : [];
const total = lines => lines.reduce((sum, line) => sum + (Number.isSafeInteger(line.totalMinor) ? line.totalMinor : 0), 0);

export function sceneTradeGoodsSummary(lines = []) {
  const names = lines.slice(0, 2).map(line => {
    const name = String(line.name || 'Gegenstand');
    const shortName = name.length > 65 ? `${name.slice(0, 62)}…` : name;
    return `${Number(line.quantity) > 1 ? `${line.quantity} × ` : ''}${shortName}`;
  });
  if (lines.length > 2) names.push(`${lines.length - 2} weitere Waren`);
  return names.join(', ') || 'Waren';
}

export function sceneTradeAccountName(receipt, key) {
  const participants = Array.isArray(receipt?.participants) ? receipt.participants : [];
  return participants.find(person => person.key === key)?.name || (String(key || '').startsWith('group:') ? 'Gruppenkasse' : 'Figur');
}

export function describeSceneTrade(receipt = {}) {
  const lines = linesOf(receipt);
  const buys = lines.filter(line => line.direction === 'buy');
  const sells = lines.filter(line => line.direction === 'sell');
  const actor = String(receipt.actor?.name || 'Eine Figur');
  const merchant = String(receipt.merchant?.name || 'dem Händler');
  const recipients = [...new Set(buys.map(line => line.recipientKey).filter(Boolean))];
  const beneficiary = recipients.length > 1 || recipients.some(key => key.startsWith('group:'))
    ? ' für die Gruppe' : recipients.length === 1 && recipients[0] !== `character:${receipt.actor?.id}`
      ? ` für ${sceneTradeAccountName(receipt, recipients[0])}` : '';
  if (buys.length && sells.length) {
    return `${actor} handelt bei ${merchant}: Einkauf ${formatCopper(total(buys) / 100)}, Verkauf ${formatCopper(total(sells) / 100)}.`;
  }
  if (sells.length) return `${actor} verkauft ${sceneTradeGoodsSummary(sells)} an ${merchant} für ${formatCopper(total(sells) / 100)}.`;
  return `${actor} kauft${beneficiary} ${sceneTradeGoodsSummary(buys)} bei ${merchant} für ${formatCopper(total(buys) / 100)}.`;
}
