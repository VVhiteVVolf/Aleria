import { createOwnedItem } from './item-register-model.js';
import { moneyState, moneyTotal, toMinor } from './item-register-money.js';
import { synchronizeEquipmentFromInventory } from '../character-equipment/character-equipment-sync.js';

import { attachInventoryEquipment } from '../character-equipment/character-equipment-registration.js';

const copy = value => JSON.parse(JSON.stringify(value));
const requireQuantity = value => {
  const quantity = Number(value);
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 9999) throw new Error('Die Menge muss zwischen 1 und 9.999 liegen.');
  return quantity;
};

export function resalePrice(item, product = null) {
  if (product?.section === 'offer' && product.buybackCopper != null) return toMinor(product.buybackCopper) / 100;
  if (item?.purchase?.unitCopper == null) return null;
  return Math.floor(toMinor(item.purchase.unitCopper) / 2) / 100;
}

function setWallet(inventory, minor) {
  inventory.moneyState = moneyState(minor / 100);
  const money = inventory.moneyState;
  inventory.money = `${money.gold} Gold, ${money.silver} Silber, ${money.copper} Kupfer`;
}
/** Pure, shared validation. The caller must supply authoritative server records. */
export function applyRegisterTrade(character, product, input, { instanceId, now } = {}) {
  const inventory = copy(character.inventory || {});
  inventory.items = inventory.items || [];
  const combatProfile = copy(character.combatProfile || {});
  const quantity = requireQuantity(input.quantity);
  const unitMinor = toMinor(input.unitCopper);
  const totalMinor = unitMinor * quantity;
  if (!Number.isSafeInteger(totalMinor)) throw new Error('Der Gesamtpreis ist zu groß.');
  const wallet = toMinor(moneyTotal(inventory.moneyState || inventory.money));
  let stock = product.stock ?? null;
  let item;
  if (product.archived) throw new Error('Dieses Angebot ist nicht mehr verfügbar.');

  if (input.direction === 'buy') {
    if (!product.priceRange) throw new Error('Für diese Ware ist noch kein verbindlicher Preis festgelegt.');
    if (unitMinor < toMinor(product.priceRange.minCopper) || unitMinor > toMinor(product.priceRange.maxCopper)) {
      throw new Error('Der Preis liegt außerhalb der aktuellen Preisspanne. Bitte das Angebot neu öffnen.');
    }
    if (wallet < totalMinor) throw new Error('Die Figur besitzt nicht genug Geld.');
    if (stock != null && stock < quantity) throw new Error('Der verfügbare Bestand reicht nicht aus.');
    const individual = ['pferde', 'vieh', 'waffen', 'ruestungen'].includes(product.category);
    if (individual && quantity !== 1) throw new Error('Tiere und Ausrüstung werden als einzelne Besitztümer gekauft.');
    if (inventory.items.length >= 80) throw new Error('Das Inventar hat bereits 80 Einträge. Bitte zuerst Platz schaffen.');
    item = createOwnedItem(product, { id: instanceId, characterId: character.id, characterName: character.name, quantity, unitCopper: unitMinor / 100, now });
    inventory.items.push(item);
    attachInventoryEquipment(combatProfile, item);
    setWallet(inventory, wallet - totalMinor);
    if (stock != null) stock -= quantity;
  } else if (input.direction === 'sell') {
    const index = inventory.items.findIndex(entry => entry.id === input.inventoryItemId);
    if (index < 0) throw new Error('Dieser Gegenstand ist nicht mehr im Inventar.');
    item = inventory.items[index];
    const templateId = item.templateId || item.originItemDbKey || item.itemDbKey;
    if (item.offerId !== product.id && product.id !== templateId && (!product.templateId || product.templateId !== templateId)) {
      throw new Error('Der Gegenstand gehört nicht zu diesem Angebot.');
    }
    const resale = resalePrice(item, product);
    if (resale == null) throw new Error('Für diesen Gegenstand ist kein Kaufpreis gespeichert. Bitte einen Ankaufspreis beim Anbieter festlegen.');
    if (unitMinor !== toMinor(resale)) throw new Error('Der Ankaufspreis hat sich geändert. Bitte das Angebot neu öffnen.');
    const equipped = item.equipped || ['weapons', 'armorItems'].some(key => (combatProfile[key] || []).some(entry => entry.inventoryItemId === item.id && entry.equipped));
    if (equipped) throw new Error('Bitte den Gegenstand zuerst im Charakterbogen ablegen.');
    const available = Number(item.quantity ?? 1);
    if (!Number.isSafeInteger(available) || quantity > available) throw new Error('Diese Menge ist nicht im Inventar vorhanden.');
    if (quantity === available) inventory.items.splice(index, 1);
    else item.quantity = String(available - quantity);
    setWallet(inventory, wallet + totalMinor);
    // A sold, possibly customized instance remains in the receipt. It must not
    // silently become another generic copy in an unrelated provider's stock.
  } else throw new Error('Unbekannter Handelsvorgang.');
  return { ...synchronizeEquipmentFromInventory({ inventory, combatProfile }), stock,
    receipt: { direction: input.direction, itemId: item.id, name: item.name, productId: product.id, quantity, unitCopper: unitMinor / 100, totalCopper: totalMinor / 100, at: now, itemSnapshot: copy(item) } };
}

export function customizeOwnedItem(character, input, now) {
  const inventory = copy(character.inventory || {});
  const item = (inventory.items || []).find(entry => entry.id === input.inventoryItemId);
  if (!item) throw new Error('Der Gegenstand wurde nicht gefunden.');
  if (!String(input.name || '').trim()) throw new Error('Bitte einen Namen eingeben.');
  for (const [key, limit] of Object.entries({ name: 180, description: 12000, image: 4000, type: 180 })) {
    if (Object.hasOwn(input, key)) item[key] = String(input[key] || '').trim().slice(0, limit);
  }
  if (input.combatDefinition != null) {
    if (!['weapon', 'armor'].includes(item.combatDefinition?.kind)) throw new Error('Dieser Gegenstand hat noch keine Kampfdefinition.');
    item.combatDefinition = { ...item.combatDefinition, ...input.combatDefinition, kind: item.combatDefinition.kind };
  }
  item.instanceId ||= item.id;
  item.templateId ||= item.originItemDbKey || item.itemDbKey || '';
  item.originItemDbKey ||= item.itemDbKey || '';
  item.itemDbKey = '';
  item.itemStorageMode = 'character';
  item.individualizedAt = now;
  return { ...synchronizeEquipmentFromInventory({ inventory, combatProfile: character.combatProfile || {} }), item };
}
