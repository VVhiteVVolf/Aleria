import test from 'node:test';
import assert from 'node:assert/strict';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { parsePrice, moneyState, moneyTotal } from '../modules/item-register/item-register-money.js';
import { buildOwnedItems, queryRegister, normalizeOffer, createOwnedItem } from '../modules/item-register/item-register-model.js';
import { applyRegisterTrade, customizeOwnedItem, resalePrice } from '../modules/item-register/item-register-trade.js';
import { createRegisterStore } from '../modules/item-register/item-register-store.js';
import { inventoryWithCreatureIdentity } from '../modules/item-register/item-register-companions.js';
import { legacyOffers } from '../modules/item-register/item-register-migration.js';
import { imageLayout } from '../modules/item-register/item-register-images.js';
import { applySceneInventoryTransfer } from '../modules/scene-inventory/scene-inventory-transfer-model.js';
import { readFile } from 'node:fs/promises';
import { extractRossmarktEntries } from '../scripts/source-pages/rossmarkt-source.mjs';
import { classifyCharacterArchiveEntries, createArchiveMountEntry, getCharacterArchiveHorseGroups } from '../modules/character-archive/character-archive-classification.js';
import { normalizeCharacterArchiveEntry, mergeCharacterArchiveEntries } from '../modules/character-archive/character-archive-model.js';

const horse = STANDARD_ITEMS.find(item => item.title === 'Afol');
const character = () => ({ id: 'gawain', name: 'Gawain', ownerUid: 'player', inventory: { revision: 1, moneyState: moneyState(3000.6), items: [] }, combatProfile: { weapons: [], armorItems: [] } });
const buy = (record, product = horse, extra = {}) => applyRegisterTrade(record, product, { direction: 'buy', quantity: 1, unitCopper: product.priceRange.minCopper, ...extra }, { instanceId: 'owned-afol', now: '2026-09-12' });

test('all actual Rossmarkt rows retain their existing images, descriptions and currency-correct prices', async () => {
  const mounts = extractRossmarktEntries(await readFile(new URL('../../Markt/Rossmarkt/Rossmarkt.html', import.meta.url), 'utf8'));
  const registered = STANDARD_ITEMS.filter(item => item.mountId);
  assert.equal(registered.length, mounts.length);
  for (const mount of mounts) {
    const item = registered.find(entry => entry.mountId === mount.id);
    assert.equal(item.image, mount.image, mount.name);
    assert.ok(item.image.startsWith('https://'), mount.name);
    assert.equal(item.description, mount.description, mount.name);
    assert.deepEqual(item.priceRange, parsePrice(mount.price, mount.currency), mount.name);
    assert.ok(item.priceRange, mount.name);
    assert.equal(item.category, mount.section === 'uebrige' ? 'vieh' : 'pferde');
  }
  assert.equal(registered.find(item => item.title === 'Equo').priceRange.maxCopper, 10000);
  assert.equal(registered.find(item => item.title === 'Skelmir').id, 'standard:rossmarkt:pferde-skelmir-pony');
  assert.ok(registered.find(item => item.title === 'Skelmir').aliases.includes('pferde:skelmir-pony'));
});

test('archive merges legacy breed projections while retaining customized possessions and provider images', () => {
  const entry = data => normalizeCharacterArchiveEntry({ id: `register--${data.id}`, kind: 'register-pferde', name: data.title, icon: data.image, data, builtin: true });
  const old = createArchiveMountEntry({ id: 'afol', name: 'Afol', section: 'roesser', image: horse.image, uses: [] });
  const offer = { ...horse, id: 'offer:afol', section: 'offer', image: 'https://example.com/variant.png' };
  const owned = { ...horse, id: 'owned:gawain:horse', section: 'owned', image: 'https://example.com/individual.png' };
  const entries = mergeCharacterArchiveEntries(classifyCharacterArchiveEntries([old, entry(horse), entry(offer), entry(owned)]));
  assert.equal(entries.length, 3);
  assert.equal(entries.find(item => item.data.id === owned.id).icon, owned.image);
  assert.equal(entries.find(item => item.data.id === offer.id).icon, offer.image);
  assert.equal(getCharacterArchiveHorseGroups(entries).find(group => group.id === 'horses-roesser').entries.length, 3);
});

test('German prices, ranges, unknown prices and fractional copper use exact minor units', () => {
  assert.deepEqual(parsePrice('400–2.000', 'Taler'), { minCopper: 400, maxCopper: 2000 });
  assert.deepEqual(parsePrice('0.6', 'K'), { minCopper: .6, maxCopper: .6 });
  assert.deepEqual(parsePrice('1,3 G'), { minCopper: 1300, maxCopper: 1300 });
  assert.equal(parsePrice('unbekannt'), null);
  assert.equal(parsePrice('100 - 50 K'), null);
  assert.equal(parsePrice('4 irgendetwas'), null);
  assert.equal(moneyTotal(moneyState(2999.99)), 2999.99);
});
test('standards have unique stable identities and authoritative categories', () => {
  assert.equal(new Set(STANDARD_ITEMS.map(item => item.id)).size, STANDARD_ITEMS.length);
  for (const [name, category] of [['Bardenmahl', 'speisen'], ['Rucksack', 'werkzeuge'], ['Kloster "Spiritus"', 'getraenke'], ['Haushund', 'vieh']]) {
    assert.equal(STANDARD_ITEMS.find(item => item.title === name)?.category, category, name);
  }
  assert.equal(STANDARD_ITEMS.find(item => item.title === 'Skelmir').mountSection, 'ponys');
  assert.equal(horse.id, 'standard:rossmarkt:pferde-afol');
  assert.equal(horse.priceRange.maxCopper, 2000);
  assert.equal(queryRegister(STANDARD_ITEMS).length, 0);
  assert.ok(queryRegister(STANDARD_ITEMS, { search: 'ruestung' }).length > 1);
});
test('buying subtracts money and creates owned identity without altering the template', () => {
  const original = JSON.stringify(horse);
  const record = character();
  const result = buy(record);
  assert.equal(result.inventory.moneyState.totalCopper, 2600.6);
  assert.equal(record.inventory.items.length, 0);
  assert.equal(result.inventory.items[0].templateId, horse.id);
  assert.equal(result.inventory.items[0].instanceId, 'owned-afol');
  assert.equal(result.inventory.items[0].purchase.unitCopper, 400);
  assert.equal(JSON.stringify(horse), original);
  assert.equal(result.inventory.items[0].itemDbKey, '');
});
test('trades reject invalid quantity, stale price, insufficient money and exhausted stock', () => {
  assert.throws(() => buy(character(), horse, { quantity: 0 }), /Menge/);
  assert.throws(() => buy(character(), horse, { unitCopper: 399 }), /Preisspanne/);
  assert.throws(() => buy({ ...character(), inventory: { moneyState: moneyState(1) } }), /genug Geld/);
  assert.throws(() => buy(character(), { ...horse, stock: 0 }), /Bestand/);
  assert.throws(() => buy(character(), horse, { quantity: 2 }), /einzelne/);
});
test('renamed horse keeps purchase price and template, both creature and inventory project the same identity', () => {
  const record = { ...character(), ...buy(character()) };
  const customized = customizeOwnedItem(record, { inventoryItemId: 'owned-afol', name: 'Morgenwind', description: 'Braune Stute' }, '2026-09-12');
  assert.equal(customized.item.templateId, horse.id);
  assert.equal(resalePrice(customized.item), 200);
  customized.item.creatureId = 'horse-creature';
  customized.inventory.items[0].creatureId = 'horse-creature';
  const creature = { id: 'horse-creature', name: 'Silberwind', notes: 'Im Bestiarium verändert', itemOrigin: { ownerCharacterId: 'gawain', inventoryItemId: customized.item.id, instanceId: customized.item.instanceId } };
  const inventory = inventoryWithCreatureIdentity({ ...record, inventory: customized.inventory }, creature);
  assert.equal(inventory.items[0].name, 'Silberwind');
  assert.equal(inventory.items[0].purchase.unitCopper, 400);
  const owned = buildOwnedItems([{ ...record, inventory }], STANDARD_ITEMS, [creature]);
  assert.equal(owned[0].title, 'Silberwind');
  assert.equal(owned[0].templateId, horse.id);
  assert.equal(owned[0].creatureId, 'horse-creature');
});
test('selling returns 50 percent of actual purchase price and preserves a receipt of customization', () => {
  const bought = buy(character(), horse, { unitCopper: 1500 });
  const record = { ...character(), ...bought };
  record.inventory.items[0].name = 'Morgenwind';
  const result = applyRegisterTrade(record, horse, { direction: 'sell', inventoryItemId: 'owned-afol', quantity: 1, unitCopper: 750 }, { now: '2026-09-12' });
  assert.equal(result.inventory.items.length, 0);
  assert.equal(result.inventory.moneyState.totalCopper, 2250.6);
  assert.equal(result.receipt.itemSnapshot.name, 'Morgenwind');
  assert.equal(resalePrice({}), null);
  assert.equal(resalePrice({ purchase: { unitCopper: .01 } }), 0);
});
test('provider variants stay separate and configured buyback overrides the default', () => {
  const first = normalizeOffer({ ...horse, id: 'offer:one', templateId: horse.id, listId: 'one', listName: 'Erster Markt', stock: 3, buybackCopper: 123 }, STANDARD_ITEMS);
  const second = normalizeOffer({ ...first, id: 'offer:two', listId: 'two', listName: 'Zweiter Markt' }, STANDARD_ITEMS);
  const items = queryRegister([horse, first, second], { section: 'offer', search: 'afol' });
  assert.equal(items.length, 2);
  assert.equal(buy(character(), first).stock, 2);
  assert.equal(resalePrice({ purchase: { unitCopper: 500 } }, first), 123);
});
test('weapons with explicit game values enter the sheet and retain edits through inventory sync', () => {
  const weapon = { ...horse, id: 'offer:weapon', section: 'offer', category: 'waffen', combatDefinition: { kind: 'weapon', damageFormula: '1d8', damageType: 'Schnitt' } };
  const purchased = buy(character(), weapon);
  assert.equal(purchased.combatProfile.weapons[0].damageFormula, '1d8');
  const updated = customizeOwnedItem({ ...character(), ...purchased }, { inventoryItemId: 'owned-afol', name: 'Nachtklinge' }, '2026-09-12');
  assert.equal(updated.combatProfile.weapons[0].name, 'Nachtklinge');
  const transferred = applySceneInventoryTransfer({ ...character(), ...updated }, { id: 'recipient', inventory: { items: [] } }, { kind: 'item', itemId: 'owned-afol', quantity: 1 });
  assert.equal(transferred.giverCombatProfile.weapons.length, 0);
  assert.equal(transferred.receiverCombatProfile.weapons[0].name, 'Nachtklinge');
  assert.equal(transferred.receiverCombatProfile.weapons[0].damageFormula, '1d8');
  assert.equal(transferred.receiverCombatProfile.weapons[0].inventoryItemId, 'owned-afol');
  updated.inventory.items[0].equipped = true;
  assert.throws(() => applyRegisterTrade({ ...character(), ...updated }, weapon, { direction: 'sell', inventoryItemId: 'owned-afol', unitCopper: 200, quantity: 1 }), /ablegen/);
});
test('transfers preserve individual identities and never merge two customized copies', () => {
  const giver = { ...character(), ...buy(character()) };
  giver.inventory.items[0].creatureId = 'creature';
  const receiver = { id: 'other', name: 'Andere Figur', inventory: { moneyState: moneyState(.6), items: [{ ...giver.inventory.items[0], id: 'other-horse', instanceId: 'other-horse', creatureId: '' }] } };
  const transfer = applySceneInventoryTransfer(giver, receiver, { kind: 'item', itemId: 'owned-afol', quantity: 1 });
  assert.equal(transfer.receiverInventory.items.length, 2);
  assert.equal(transfer.receiverInventory.items[1].instanceId, 'owned-afol');
  assert.equal(transfer.receiverInventory.items[1].creatureId, 'creature');
  const coins = applySceneInventoryTransfer(giver, receiver, { kind: 'money', currency: 'copper', quantity: 1 });
  assert.equal(coins.receiverInventory.moneyState.totalCopper, 1.6);
});
test('historic standard overrides become separate offers, character copies do not become shop stock', () => {
  const key = horse.aliases[0];
  const payload = { scanCache: [{ ...horse, canonicalKey: key }], overrides: { [key]: { title: 'Besonderes Afol' } }, customItems: [{ title: 'Morgenwind', canonicalKey: 'custom:horse', hiddenMeta: { ownerCharacterId: 'gawain' } }] };
  const offers = legacyOffers(payload, STANDARD_ITEMS);
  assert.equal(offers.length, 1);
  assert.equal(offers[0].title, 'Besonderes Afol');
  assert.equal(offers[0].templateId, horse.id);
  assert.equal(horse.title, 'Afol');
});
test('all readers receive metadata edits and deletes; cached data does not permit transactions', async () => {
  const callbacks = new Map(); let count = 0;
  const backend = { subscribe(kind, next) { callbacks.set(kind, next); return () => callbacks.delete(kind); }, async commit() { count++; return {}; } };
  const store = createRegisterStore(); store.connect(backend);
  await assert.rejects(store.commit({}), /warten/);
  callbacks.get('offers')([]); callbacks.get('characters')([character()]); callbacks.get('creatures')([]);
  assert.equal(store.snapshot().status, 'live');
  await store.commit({}); assert.equal(count, 1);
  const owned = { ...character(), ...buy(character()) };
  callbacks.get('characters')([owned]); assert.equal(store.snapshot().owned.length, 1);
  owned.inventory.items[0].name = 'Neuer Name'; callbacks.get('characters')([owned]);
  assert.equal(store.snapshot().owned[0].title, 'Neuer Name');
  callbacks.get('characters')([], { fromCache: true }); assert.equal(store.snapshot().owned.length, 0);
  await assert.rejects(store.commit({}), /warten/);
  store.stop(); assert.equal(callbacks.size, 0);
});
test('image frames distinguish portrait, landscape and square without cropping extreme formats', () => {
  assert.deepEqual(imageLayout(400, 900), { format: 'portrait', ratio: .55 });
  assert.deepEqual(imageLayout(1500, 500), { format: 'landscape', ratio: 2.2 });
  assert.deepEqual(imageLayout(600, 600), { format: 'square', ratio: 1 });
});
