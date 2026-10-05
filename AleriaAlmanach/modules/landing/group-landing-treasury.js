import { toMinor, parsePrice, formatMoney } from '../item-register/item-register-money.js';

export function normalizeGroupTreasury(source = {}) {
  source = source && typeof source === 'object' ? source : {};
  const opening = source.openingCopper == null ? null : Number(source.openingCopper);
  const openingCopper = Number.isFinite(opening) && opening >= 0 && Number.isSafeInteger(Math.round(opening * 100)) ? toMinor(opening) / 100 : null;
  const seen = new Set();
  const entries = (Array.isArray(source.entries) ? source.entries : []).filter(entry => {
    if (!entry?.id || seen.has(String(entry.id))) return false;
    seen.add(String(entry.id)); return true;
  }).map(entry => ({
    id: String(entry.id), direction: entry.direction === 'expense' ? 'expense' : 'income',
    copper: Number(entry.copper), label: String(entry.label || '').trim(), date: String(entry.date || '').trim()
  })).filter(entry => entry.copper > 0 && Number.isSafeInteger(Math.round(entry.copper * 100)));
  return { openingCopper, entries };
}

export function groupTreasuryBalance(source) {
  const treasury = normalizeGroupTreasury(source);
  if (treasury.openingCopper == null) return null;
  return treasury.entries.reduce((minor, entry) => minor + (entry.direction === 'expense' ? -1 : 1) * toMinor(entry.copper), toMinor(treasury.openingCopper)) / 100;
}

export function formatGroupTreasury(source) {
  const balance = groupTreasuryBalance(source);
  return balance == null ? 'Kasse noch offen' : balance < 0 ? `Schulden: ${formatMoney({ totalCopper: -balance })}` : formatMoney({ totalCopper: balance });
}

export function bookGroupTreasury(source, { id, direction, amount, currency = 'KT', label, date = '' }) {
  const treasury = normalizeGroupTreasury(source);
  if (treasury.openingCopper == null) throw new Error('Bitte zuerst den Anfangsbestand der Gruppenkasse festlegen.');
  const price = parsePrice(amount, currency);
  if (!price || price.minCopper !== price.maxCopper || price.minCopper <= 0) throw new Error('Bitte einen gültigen, positiven Geldbetrag eingeben.');
  if (!String(label || '').trim()) throw new Error('Bitte einen Verwendungszweck eintragen.');
  if (!id || treasury.entries.some(entry => entry.id === id)) throw new Error('Diese Buchung ist bereits vorhanden.');
  const next = { ...treasury, entries: [...treasury.entries, { id, direction: direction === 'expense' ? 'expense' : 'income', copper: price.minCopper, label: String(label).trim(), date }] };
  const balance = groupTreasuryBalance(next);
  if (!Number.isSafeInteger(Math.round(balance * 100))) throw new Error('Der Kassenbestand ist zu groß.');
  if (balance < 0) throw new Error('Die Gruppenkasse reicht für diese Ausgabe nicht aus.');
  return next;
}
