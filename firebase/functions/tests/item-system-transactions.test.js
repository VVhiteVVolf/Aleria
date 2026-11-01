import test from 'node:test';
import assert from 'node:assert/strict';
import { database } from './fixtures/combat-transaction-database.js';
import { commitItemDefinitionOperation } from '../src/items/commit-item-definition.js';
import { commitItemRecordOperation } from '../src/items/commit-item-record.js';
import { commitItemAwardOperation } from '../src/items/commit-item-award.js';
import { commitItemMigrationOperation } from '../src/items/commit-item-migration.js';
import { commitInventoryTransferOperation } from '../src/mechanics/commit-inventory-transfer.js';
import { readItemDefinitionIndex } from '../src/items/item-definition-repository.js';
import { commitItemRegisterOperation } from '../src/mechanics/commit-item-register.js';
import { restoreItemBackupRecords } from '../src/items/item-backup.js';
import { STANDARD_ITEMS, STANDARD_VERSION } from '../src/generated/item-register/item-register-standard.js';
const gm = { uid: 'owner', token: { aleriaRole: 'moderator' } }, player = { uid: 'owner', token: {} };
const record = () => ({ name: 'Owner', ownerUid: 'owner', inventory: { items: [], revision: 1, moneyState: { totalCopper: 10000 } }, combatProfile: { revision: 1, hitPoints: { current: 4, maximumOverride: 20 }, resources: [{ id: 'mana', current: 2, maximum: 12 }] } });
const sword = STANDARD_ITEMS.find(item => item.id === 'standard:waffen-rustungen:langschwert');
test('canonical saves ignore copied rule edits, preserve resources and reject an extra player possession', async () => {
  const db = database({ 'characters/owner': record() });
  await commitItemDefinitionOperation(db, gm, { action: 'grant', operationId: 'grant', recordId: 'owner', definitionRef: sword.definitionRef, expectedRevision: 1 });
  const before = structuredClone(db.data.get('characters/owner'));
  const edited = structuredClone(before); edited.combatProfile.weapons[0].damageFormula = '99d100'; edited.inventory.items[0].name = 'Persönliche Beschriftung';
  await commitItemRecordOperation(db, player, { id: 'owner', operationId: 'save', data: { inventory: edited.inventory, combatProfile: edited.combatProfile } });
  const saved = db.data.get('characters/owner');
  assert.equal(saved.combatProfile.weapons[0].damageFormula, '1d8');
  assert.equal(saved.combatProfile.hitPoints.current, 4); assert.equal(saved.combatProfile.resources[0].current, 2);
  const clone = structuredClone(saved.inventory); clone.items.push({ ...clone.items[0], id: 'copy', instanceId: 'copy' });
  await assert.rejects(commitItemRecordOperation(db, player, { id: 'owner', operationId: 'clone', data: { inventory: clone } }), /Neue Gegenstände/);
  db.data.set('combat_profile_locks/characters/records/owner', { activeEncounterKeys: ['scene:fight'] });
  await commitItemRecordOperation(db, player, { id: 'owner', operationId: 'bio', data: { title: 'Neu' } });
  assert.equal(db.data.get('characters/owner').title, 'Neu');
  assert.deepEqual(db.data.get('characters/owner').inventory, saved.inventory);
});
test('scene purchase changes item, buyer wallet, vendor ledger and comment once; failures are atomic', async () => {
  const db = database({ 'characters/owner': record() });
  const input = { action: 'buy', operationId: 'buy', characterId: 'owner', entryId: 'scene', expectedRevision: 1, standardVersion: STANDARD_VERSION,
    productId: sword.id, quantity: 1, unitCopper: sword.priceRange.minCopper };
  await commitItemRegisterOperation(db, player, input);
  await commitItemRegisterOperation(db, player, input);
  assert.equal(db.data.get('characters/owner').inventory.items.length, 1);
  assert.equal(db.data.get('characters/owner').inventory.moneyState.totalCopper, 10000 - input.unitCopper);
  assert.equal([...db.data.keys()].filter(key => key.startsWith('comments/')).length, 1);
  const vendor = [...db.data].find(([key]) => key.startsWith('item_vendor_wallets/'))[1];
  assert.equal(vendor.netMinor, Math.round(input.unitCopper * 100));
  const before = structuredClone([...db.data]);
  await assert.rejects(commitItemRegisterOperation(db, player, { ...input, operationId: 'bad', expectedRevision: db.data.get('characters/owner').inventory.revision, unitCopper: -1 }));
  assert.deepEqual([...db.data], before);
});
test('notice payout cannot repeat with another operation or recipient, and requires GM authority', async () => {
  const db = database({ 'characters/owner': record(), 'characters/other': record() });
  const input = { sourceKey: 'notice:board:quest', operationId: 'award', recordId: 'owner', expectedRevision: 1,
    rewards: [{ kind: 'money', currency: 'pfennig', amount: 1 }, { kind: 'item', itemId: sword.id, quantity: 1 }], entryId: 'scene' };
  await assert.rejects(commitItemAwardOperation(db, player, input), /Spielleitung/);
  await commitItemAwardOperation(db, gm, input); await commitItemAwardOperation(db, gm, input);
  assert.equal(db.data.get('characters/owner').inventory.moneyState.totalCopper, 10000.01);
  assert.equal(db.data.get('characters/owner').inventory.items.length, 1);
  const before = structuredClone([...db.data]);
  await assert.rejects(commitItemAwardOperation(db, gm, { ...input, operationId: 'again', recordId: 'other' }), /bereits vergeben/);
  assert.deepEqual([...db.data], before);
});
test('migration adopts only explicit matching references and keeps personal rules and old comments', async () => {
  const owner = record(); owner.inventory.items = [{ id: 'safe', name: 'Schwert', templateId: sword.id }, { id: 'personal', name: 'Drachenzahn', templateId: sword.id, combatDefinition: { ...sword.combatDefinition, damageBonus: 1 } }];
  const db = database({ 'characters/owner': owner, 'comments/old': { text: 'Historischer Wurf', combatResolution: { damage: 23 } } });
  const input = { recordId: 'owner', operationId: 'migration', expectedRevision: 1, itemIds: ['safe'] };
  const preview = await commitItemMigrationOperation(db, gm, { ...input, preview: true });
  assert.equal(preview.safe.length, 1); assert.equal(preview.review.length, 1);
  await commitItemMigrationOperation(db, gm, input); await commitItemMigrationOperation(db, gm, input);
  const saved = db.data.get('characters/owner');
  assert.deepEqual(saved.inventory.items[0].definitionRef, sword.definitionRef);
  assert.equal(saved.inventory.items[1].combatDefinition.damageBonus, 1);
  assert.equal(saved.combatProfile.hitPoints.current, 4); assert.equal(saved.inventory.moneyState.totalCopper, 10000);
  assert.deepEqual(db.data.get('comments/old'), { text: 'Historischer Wurf', combatResolution: { damage: 23 } });
});
test('item backup retains later claims, wallets and immutable versions', async () => {
  const db = database({ 'item_vendor_wallets/vendor': { netMinor: 99 }, 'item_award_claims/quest': { operationId: 'new' } });
  await restoreItemBackupRecords(db, 'item_vendor_wallets', [{ id: 'vendor', data: { netMinor: 1 } }]);
  await restoreItemBackupRecords(db, 'item_award_claims', [{ id: 'quest', data: { operationId: 'old' } }]);
  assert.equal(db.data.get('item_vendor_wallets/vendor').netMinor, 99); assert.equal(db.data.get('item_award_claims/quest').operationId, 'new');
});
test('explicit sheet-only adoption creates one linked possession without replacing the equipment ID or live values', async () => {
  const owner = record(); owner.combatProfile.weapons = [{ id: 'old-sheet-weapon', name: 'Persönliche Klinge', damageFormula: '1d8', damageBonus: 0, equipped: true }];
  const db = database({ 'characters/owner': owner });
  const input = { recordId: 'owner', operationId: 'sheet-adoption', expectedRevision: 1, expectedCombatRevision: 1,
    equipmentId: 'old-sheet-weapon', collection: 'weapons', definitionRef: sword.definitionRef };
  await commitItemMigrationOperation(db, gm, input); await commitItemMigrationOperation(db, gm, input);
  const saved = db.data.get('characters/owner');
  assert.equal(saved.inventory.items.length, 1); assert.equal(saved.combatProfile.weapons.length, 1);
  assert.equal(saved.combatProfile.weapons[0].id, 'old-sheet-weapon');
  assert.equal(saved.combatProfile.weapons[0].inventoryItemId, saved.inventory.items[0].id);
  assert.equal(saved.combatProfile.weapons[0].equipped, true); assert.equal(saved.combatProfile.hitPoints.current, 4);
  assert.deepEqual(saved.inventory.items[0].definitionRef, sword.definitionRef);
});
test('a unique possession cannot be copied under the same instance ID into another record; a real transfer updates its holder', async () => {
  const db = database({ 'characters/owner': record(), 'characters/other': record() });
  const definition = await commitItemDefinitionOperation(db, gm, { action: 'save', operationId: 'define-unique', definition: { id: 'unique:holder-test', kind: 'unique', title: 'Unikat', category: 'waffen' } });
  await commitItemDefinitionOperation(db, gm, { action: 'grant', operationId: 'grant-unique', recordId: 'owner', expectedRevision: 1, definitionRef: definition.definition });
  const original = structuredClone(db.data.get('characters/owner').inventory.items[0]);
  await assert.rejects(commitItemRecordOperation(db, gm, { id: 'other', operationId: 'copied-instance', data: { inventory: { revision: 1, items: [original] } } }), /anderen Besitzplatz/);
  const forged = { ...db.data.get('characters/other'), id: 'other', inventory: { items: [original] } };
  await assert.rejects(db.runTransaction(transaction => readItemDefinitionIndex(db, transaction, [forged])), /nicht als Unikat zugeordnet/);
  await commitInventoryTransferOperation(db, gm, { giverId: 'owner', receiverId: 'other', entryId: 'scene', sceneEvent: { transfer: { transferId: 'move-unique', object: { kind: 'item', itemId: original.id, quantity: 1 } } } });
  const claim = db.data.get('item_unique_claims/unique:holder-test');
  assert.equal(claim.holder.recordId, 'other'); assert.equal(claim.instanceId, original.instanceId);
  assert.equal(db.data.get('characters/owner').inventory.items.length, 0);
  assert.equal(db.data.get('characters/other').inventory.items.length, 1);
});
test('a configured merchant sheet receives purchase money and pays resale money in the same transaction', async () => {
  const db = database({ 'characters/owner': record(), 'characters/other': record() });
  const saved = await commitItemRegisterOperation(db, gm, { action: 'save-offer', operationId: 'offer', expectedRevision: 0,
    offer: { id: 'offer:merchant', title: 'Schwert', listId: 'shop', listName: 'Arkanist', sellerCharacterId: 'other', definitionRef: sword.definitionRef,
      category: 'waffen', priceRange: { minCopper: 100, maxCopper: 100 }, stock: 2, buybackCopper: 50 } });
  const bought = await commitItemRegisterOperation(db, player, { action: 'buy', operationId: 'purchase-merchant', characterId: 'owner', productId: saved.offer.id,
    standardVersion: STANDARD_VERSION, expectedRevision: 1, offerRevision: 1, quantity: 1, unitCopper: 100 });
  assert.equal(db.data.get('characters/other').inventory.moneyState.totalCopper, 10100);
  assert.equal(bought.character.inventory.moneyState.totalCopper, 9900);
  await commitItemRegisterOperation(db, player, { action: 'sell', operationId: 'sell-merchant', characterId: 'owner', productId: saved.offer.id,
    standardVersion: STANDARD_VERSION, expectedRevision: bought.character.inventory.revision, offerRevision: 2, inventoryItemId: bought.character.inventory.items[0].id, quantity: 1, unitCopper: 50 });
  assert.equal(db.data.get('characters/other').inventory.moneyState.totalCopper, 10050);
  assert.equal(db.data.get('characters/owner').inventory.moneyState.totalCopper, 9950);
});
