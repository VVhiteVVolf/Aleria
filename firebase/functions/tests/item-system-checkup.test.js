import test from 'node:test';
import assert from 'node:assert/strict';
import { database } from './fixtures/combat-transaction-database.js';
import { commitItemDefinitionOperation } from '../src/items/commit-item-definition.js';
import { commitItemRegisterOperation } from '../src/mechanics/commit-item-register.js';
import { commitInventoryTransferOperation } from '../src/mechanics/commit-inventory-transfer.js';
import { commitItemMigrationOperation } from '../src/items/commit-item-migration.js';
import { STANDARD_ITEMS, STANDARD_VERSION } from '../src/generated/item-register/item-register-standard.js';
import { buildModuleOffers } from '../src/generated/item-register/item-register-module-catalog.js';

const gm = { uid: 'owner', token: { aleriaRole: 'moderator' } };
const player = { uid: 'owner', token: {} };
const record = () => ({ name: 'Testfigur', ownerUid: 'owner', inventory: { revision: 1, items: [], moneyState: { totalCopper: 100 } }, combatProfile: { revision: 1 } });

async function toolDefinition(db, extra = {}) {
  return (await commitItemDefinitionOperation(db, gm, { action: 'save', operationId: 'define-tool', definition: {
    id: 'item:tool', title: 'Messinstrument', category: 'werkzeuge', stackable: false, ...extra
  } })).definition;
}

test('module purchase and resale balance the same vendor ledger even after the menu is removed', async () => {
  const entry = { id: 'tavern', title: 'Taverne', pages: [{ tradeCatalogPage: true, tradeCatalog: {
    categories: [{ id: 'speisen', label: 'Speisen' }], items: [{ id: 'soup', title: 'Haussuppe', category: 'speisen', priceMin: '2', currencyCode: 'KT' }]
  } }] };
  const db = database({ 'characters/owner': record(), 'module_store_entries/tavern': { entryJson: JSON.stringify(entry) },
    'char_tabs/config': { moduleStoreManifest: { customSections: [{ tab: 'Kultur', entryIds: ['tavern'] }] } } });
  const offer = buildModuleOffers([entry], STANDARD_ITEMS)[0];
  const input = { action: 'buy', operationId: 'buy', characterId: 'owner', expectedRevision: 1, standardVersion: STANDARD_VERSION,
    productId: offer.id, moduleId: offer.moduleId, sourceRevision: offer.sourceRevision, quantity: 1, unitCopper: 2 };
  const bought = await commitItemRegisterOperation(db, player, input);
  db.data.delete('module_store_entries/tavern');
  await commitItemRegisterOperation(db, player, { ...input, action: 'sell', operationId: 'sell', expectedRevision: bought.character.inventory.revision,
    inventoryItemId: bought.receipt.itemId, unitCopper: 1 });
  const wallets = [...db.data].filter(([key]) => key.startsWith('item_vendor_wallets/')).map(([, value]) => value);
  assert.equal(wallets.length, 1);
  assert.equal(wallets[0].vendorId, offer.listId);
  assert.equal(wallets[0].netMinor, 100);
});

test('purchase and free register allocation respect the authoritative non-stackable definition', async () => {
  const db = database({ 'characters/owner': record(), 'characters/other': record() });
  const definition = await toolDefinition(db);
  const saved = await commitItemRegisterOperation(db, gm, { action: 'save-offer', operationId: 'offer', expectedRevision: 0,
    offer: { id: 'offer:tool', title: definition.title, definitionRef: definition, listId: 'workshop', listName: 'Werkstatt', priceRange: { minCopper: 1, maxCopper: 1 } } });
  const before = structuredClone([...db.data]);
  await assert.rejects(commitItemRegisterOperation(db, player, { action: 'buy', operationId: 'buy-two', characterId: 'owner', expectedRevision: 1,
    standardVersion: STANDARD_VERSION, productId: saved.offer.id, offerRevision: 1, quantity: 2, unitCopper: 1 }), /einzeln|Menge/);
  await assert.rejects(commitInventoryTransferOperation(db, gm, { giverId: 'owner', receiverId: 'other', entryId: 'scene', operationId: 'allocate-two',
    sceneEvent: { transfer: { object: { kind: 'register-item', itemDbKey: definition.id, definitionRef: definition, quantity: 2 } } } }), /einzeln|Menge/);
  assert.deepEqual([...db.data], before);
});

test('explicit legacy adoption rejects a multi-item weapon row without altering the old inventory', async () => {
  const owner = record(); owner.inventory.items.push({ id: 'old', name: 'Alte Schwerter', category: 'weapon', quantity: '3' });
  const db = database({ 'characters/owner': owner });
  const sword = STANDARD_ITEMS.find(item => item.id === 'standard:waffen-rustungen:langschwert');
  const before = structuredClone([...db.data]);
  await assert.rejects(commitItemMigrationOperation(db, gm, { recordId: 'owner', operationId: 'adopt', expectedRevision: 1,
    expectedCombatRevision: 1, itemId: 'old', definitionRef: sword.definitionRef }), /einzeln|Menge/);
  assert.deepEqual([...db.data], before);
});

test('charged objects cannot be granted as one stack with a shared charge state', async () => {
  const db = database({ 'characters/owner': record() });
  const definition = await toolDefinition(db, { stackable: true, useDefinition: { chargesMaximum: 3, chargesPerUse: 1 } });
  const before = structuredClone([...db.data]);
  await assert.rejects(commitItemDefinitionOperation(db, gm, { action: 'grant', operationId: 'charged-stack', recordId: 'owner',
    expectedRevision: 1, definitionRef: definition, quantity: 2 }), /einzeln|Menge/);
  assert.deepEqual([...db.data], before);
});
