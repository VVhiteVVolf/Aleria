import { moneyState, formatMoney } from '../item-register/item-register-money.js';

export const SCENE_MONEY_UNITS = Object.freeze([
  { id: 'gold', label: 'Gold', minorValue: 100000 },
  { id: 'silver', label: 'Silber', minorValue: 10000 },
  { id: 'copper', label: 'Kupfer', minorValue: 100 },
  { id: 'pfennig', label: 'Eisenpfennig', minorValue: 1 }
].map(Object.freeze));

const maximum = BigInt(Number.MAX_SAFE_INTEGER);
const clone = value => value === undefined ? undefined : structuredClone(value);
const invalidMoney = () => Error('Der Geldbetrag muss aus ganzen Eisenpfennigen bestehen und darf nicht negativ sein.');

function safeMinor(value) {
  if (value < 0n || value > maximum) throw Error('Der Geldbetrag ist zu groß.');
  return Number(value);
}

// Read existing localized balances exactly, without rounding a partial Pfennig.
function decimalMinor(value, factor) {
  let text = String(value ?? '').trim().replace(/\s/g, '');
  if (!text || text.length > 80) throw invalidMoney();
  if (text.includes(',')) text = text.replace(/\./g, '').replace(',', '.');
  else if (typeof value === 'string' && /^[1-9]\d{0,2}(\.\d{3})+$/.test(text)) text = text.replace(/\./g, '');
  if (!/^\d+(?:\.\d+)?$/.test(text)) throw invalidMoney();
  const [whole, fraction = ''] = text.split('.');
  const divisor = 10n ** BigInt(fraction.length);
  const scaled = BigInt(whole + fraction) * BigInt(factor);
  if (scaled % divisor) throw invalidMoney();
  return safeMinor(scaled / divisor);
}

export function sceneMoneyAmountMinor({ currency, quantity } = {}) {
  const unit = SCENE_MONEY_UNITS.find(value => value.id === currency);
  if (!unit) throw Error('Unbekannte Währung.');
  const text = String(quantity ?? '').trim();
  if (!/^\d+$/.test(text) || text.length > 80 || BigInt(text) < 1n) throw Error('Die Menge muss eine positive ganze Zahl sein.');
  return safeMinor(BigInt(text) * BigInt(unit.minorValue));
}

function legacyMoneyMinor(value) {
  const text = value.trim();
  if (!text) return 0;
  const pattern = /(\d[\d.,]*)\s*(Gold(?:taler)?|Silber(?:taler)?|Kupfer(?:taler)?|(?:Eisen)?Pfennig)/gi;
  const parts = [...text.matchAll(pattern)];
  if (!parts.length || !/^(?:\s|[,;+&]|und)*$/i.test(text.replace(pattern, ''))) throw invalidMoney();
  let total = 0n;
  for (const [, amount, label] of parts) {
    const normalizedLabel = label.replace(/taler$/i, '').replace(/^Pfennig$/i, 'Eisenpfennig').toLowerCase();
    const unit = SCENE_MONEY_UNITS.find(value => value.label.toLowerCase() === normalizedLabel);
    total += BigInt(decimalMinor(amount, unit.minorValue));
  }
  return safeMinor(total);
}

/** Existing wallet formats remain readable; totalCopper stays authoritative. */
export function sceneMoneyMinor(value) {
  if (value == null) return 0;
  if (typeof value === 'string') return legacyMoneyMinor(value);
  if (typeof value !== 'object' || Array.isArray(value)) throw invalidMoney();
  if (value.totalCopper != null) return decimalMinor(value.totalCopper, 100);
  let total = 0n;
  for (const unit of SCENE_MONEY_UNITS) if (value[unit.id] != null) total += BigInt(decimalMinor(value[unit.id], unit.minorValue));
  return safeMinor(total);
}

export function sceneMoneyBreakdown(minor) {
  if (!Number.isSafeInteger(minor) || minor < 0) throw invalidMoney();
  const state = moneyState(minor / 100);
  // Existing records store totalCopper as a Number. Reject a balance that this
  // public format could not save and read back to the same Pfennig.
  if (sceneMoneyMinor(state) !== minor) throw Error('Der Geldbetrag ist zu groß.');
  return state;
}

function walletMinor(record) {
  return sceneMoneyMinor(record?.inventory?.moneyState || record?.inventory?.money);
}

export function previewSceneMoneyTransfer(giverRecord, receiverRecord, transfer = {}) {
  const targetKind = transfer.targetKind ?? 'character';
  if (!['character', 'sink'].includes(targetKind)) throw Error('Unbekanntes Ziel der Geldbewegung.');
  if (targetKind === 'character' && !receiverRecord) throw Error('Bitte einen Empfänger wählen.');
  if (targetKind === 'character' && giverRecord?.id && giverRecord.id === receiverRecord.id) throw Error('Geber und Empfänger müssen verschieden sein.');
  const amountMinor = sceneMoneyAmountMinor(transfer), giverBeforeMinor = walletMinor(giverRecord);
  if (giverBeforeMinor < amountMinor) throw Error(`${giverRecord?.name || 'Der Geber'} besitzt nicht genug Geld.`);
  const giverAfterMinor = giverBeforeMinor - amountMinor;
  const receiverBeforeMinor = targetKind === 'character' ? walletMinor(receiverRecord) : null;
  const receiverAfterMinor = targetKind === 'character' ? safeMinor(BigInt(receiverBeforeMinor) + BigInt(amountMinor)) : null;
  sceneMoneyBreakdown(giverAfterMinor);
  if (receiverAfterMinor !== null) sceneMoneyBreakdown(receiverAfterMinor);
  return { targetKind, amountMinor, giverBeforeMinor, giverAfterMinor, receiverBeforeMinor, receiverAfterMinor };
}

function inventoryWithMoney(record, minor) {
  const original = record?.inventory;
  if (original != null && (typeof original !== 'object' || Array.isArray(original))) throw Error('Das gespeicherte Inventar ist ungültig.');
  const inventory = clone(original || {});
  inventory.moneyState = sceneMoneyBreakdown(minor);
  inventory.money = formatMoney(inventory.moneyState);
  return inventory;
}

/** Pure money movement: no item normalization, definitions or equipment sync. */
export function applySceneMoneyTransfer(giverRecord, receiverRecord, transfer = {}) {
  const preview = previewSceneMoneyTransfer(giverRecord, receiverRecord, transfer);
  const unit = SCENE_MONEY_UNITS.find(value => value.id === transfer.currency);
  const quantity = Number(transfer.quantity), name = `${quantity} ${unit.label}`;
  return {
    giverInventory: inventoryWithMoney(giverRecord, preview.giverAfterMinor),
    receiverInventory: preview.targetKind === 'character' ? inventoryWithMoney(receiverRecord, preview.receiverAfterMinor) : null,
    object: { kind: 'money', targetKind: preview.targetKind, currency: unit.id, quantity,
      amountMinor: preview.amountMinor, totalCopper: preview.amountMinor / 100, name, description: name },
    preview
  };
}
