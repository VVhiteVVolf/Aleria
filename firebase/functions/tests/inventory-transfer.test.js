import test from 'node:test';
import assert from 'node:assert/strict';
import { commitInventoryTransferOperation } from '../src/mechanics/commit-inventory-transfer.js';
import { STANDARD_ITEMS } from '../src/generated/item-register/item-register-standard.js';
import { database } from './fixtures/combat-transaction-database.js';

const auth = { uid: 'owner', token: { aleriaRole: 'player' } };
const character = id => ({ id, name: id, ownerUid: 'owner', inventory: { revision: 1, items: [], moneyState: { totalCopper: 2 } },
  combatProfile: { hitPoints: { current: 7 }, resources: [{ id: 'mana', current: 2, maximum: 10 }] } });
const store = () => database({ 'characters/giver': character('giver'), 'characters/receiver': character('receiver') });
const input = object => ({ giverId: 'giver', receiverId: 'receiver', entryId: 'scene',
  sceneEvent: { transfer: { transferId: 'transfer-one', object: object || { kind: 'money', currency: 'pfennig', quantity: 29 } } } });
const rows = (db, collection) => [...db.data].filter(([key]) => key.startsWith(`${collection}/`));

function linkedSword(record, itemId, { held = true } = {}) {
  const template = STANDARD_ITEMS.find(item => item.id === 'standard:waffen-rustungen:stahlschwert');
  record.inventory.items.push({ id: itemId, name: itemId, category: 'weapon', definitionRef: template.definitionRef, quantity: '1', equipped: false });
  record.combatProfile.weapons = [{ id: `${itemId}-entry`, inventoryItemId: itemId, name: 'Bewusst geführte Altwaffe',
    weaponType: 'sword', damageFormula: '1d8', equipped: held, notes: 'Unabhängiger gespeicherter Profilstand' }];
}

test('a money transfer preserves both exact saved profiles and held loadouts without combat revision writes', async () => {
  const db = store();
  linkedSword(db.data.get('characters/giver'), 'giver-held');
  linkedSword(db.data.get('characters/receiver'), 'receiver-held');
  const before = ['giver', 'receiver'].map(id => structuredClone(db.data.get(`characters/${id}`).combatProfile));
  await commitInventoryTransferOperation(db, auth, input());
  for (const [index, id] of ['giver', 'receiver'].entries()) assert.deepEqual(db.data.get(`characters/${id}`).combatProfile, before[index]);
});

test('a held profile weapon cannot be transferred by reconciling its older unequipped inventory flag first', async () => {
  const db = store();
  linkedSword(db.data.get('characters/giver'), 'giver-held');
  const before = structuredClone([...db.data]);
  await assert.rejects(commitInventoryTransferOperation(db, auth, input({ kind: 'item', itemId: 'giver-held', quantity: 1 })), /ablegen/);
  assert.deepEqual([...db.data], before);
});

test('a consumable handoff preserves unrelated gear and does not invent a receiver combat profile', async () => {
  const db = store();
  linkedSword(db.data.get('characters/giver'), 'giver-held');
  const food = STANDARD_ITEMS.find(item => item.id === 'standard:gemischtwarenhandler:rationen');
  db.data.get('characters/giver').inventory.items.push({ id: 'food', name: 'Rationen', category: 'food', quantity: '2', definitionRef: food.definitionRef });
  delete db.data.get('characters/receiver').combatProfile;
  const before = structuredClone(db.data.get('characters/giver').combatProfile);
  await commitInventoryTransferOperation(db, auth, input({ kind: 'item', itemId: 'food', quantity: 1 }));
  assert.deepEqual(db.data.get('characters/giver').combatProfile, before);
  assert.equal(Object.hasOwn(db.data.get('characters/receiver'), 'combatProfile'), false);
});

test('merging an identical legacy weapon into an existing stack preserves its held personal entry and profile revision', async () => {
  const db = store();
  for (const [id, held] of [['giver', false], ['receiver', true]]) {
    const record = db.data.get(`characters/${id}`);
    record.inventory.items.push({ id: `${id}-item`, name: 'Legacy sword', itemDbKey: 'legacy:sword', category: 'weapon', image: '', quantity: '1', equipped: false });
    record.combatProfile.weapons = [{ id: `${id}-entry`, inventoryItemId: `${id}-item`, name: 'Personal sword', weaponType: 'sword', damageFormula: '1d8', equipped: held }];
  }
  const before = structuredClone(db.data.get('characters/receiver').combatProfile);
  await commitInventoryTransferOperation(db, auth, input({ kind: 'item', itemId: 'giver-item', quantity: 1 }));
  assert.equal(db.data.get('characters/receiver').inventory.items[0].quantity, '2');
  assert.deepEqual(db.data.get('characters/receiver').combatProfile, before);
});

test('a real unequipped gear handoff changes only the moved item bindings on either saved profile', async () => {
  const db = store();
  linkedSword(db.data.get('characters/giver'), 'moved', { held: false });
  linkedSword(db.data.get('characters/receiver'), 'receiver-held');
  const receiverBefore = structuredClone(db.data.get('characters/receiver').combatProfile);
  const result = await commitInventoryTransferOperation(db, auth, input({ kind: 'item', itemId: 'moved', quantity: 1 }));
  const after = db.data.get('characters/receiver').combatProfile;
  assert.deepEqual(after.weapons.find(entry => entry.inventoryItemId === 'receiver-held'), receiverBefore.weapons[0]);
  assert.deepEqual(after.hitPoints, receiverBefore.hitPoints);
  assert.deepEqual(after.resources, receiverBefore.resources);
  assert.equal(after.weapons.filter(entry => entry.inventoryItemId === result.receiverInventory.items.find(item => item.id === 'moved').id).length, 1);
  assert.equal(db.data.get('characters/giver').combatProfile.weapons.length, 0);
});

test('repeated and simultaneous transfers book wallets and their scene event exactly once', async () => {
  const db = store();
  const [first, second] = await Promise.all([commitInventoryTransferOperation(db, auth, input()), commitInventoryTransferOperation(db, auth, input())]);
  assert.equal(first.id, second.id);
  assert.equal(first.giverInventory.revision, db.data.get('characters/giver').inventory.revision);
  assert.equal(first.receiverInventory.revision, db.data.get('characters/receiver').inventory.revision);
  assert.equal(db.data.get('characters/giver').inventory.moneyState.totalCopper, 1.71);
  assert.equal(db.data.get('characters/receiver').inventory.moneyState.totalCopper, 2.29);
  assert.equal(rows(db, 'comments').length, 1);
  assert.equal(rows(db, 'inventory_transfer_transactions').length, 1);
  assert.equal(db.data.get('characters/giver').combatProfile.hitPoints.current, 7);
  assert.equal(db.data.get('characters/giver').combatProfile.resources[0].current, 2);
  const before = structuredClone([...db.data]);
  await assert.rejects(commitInventoryTransferOperation(db, auth, input({ kind: 'money', currency: 'gold', quantity: 1 })), /Vorgangs-ID/);
  assert.deepEqual([...db.data], before);
});

test('a replay returns current inventories instead of restoring an old receipt snapshot', async () => {
  const db = store();
  await commitInventoryTransferOperation(db, auth, input());
  db.data.get('characters/receiver').inventory.items.push({ id: 'later', name: 'Later' });
  const replay = await commitInventoryTransferOperation(db, auth, input());
  assert.equal(replay.receiverInventory.items[0].id, 'later');
  assert.equal(replay.receiverInventory.moneyState.totalCopper, 2.29);
});

test('failed authorization, invalid quantities and insufficient funds leave all records untouched', async () => {
  const db = store(), before = structuredClone([...db.data]);
  await assert.rejects(commitInventoryTransferOperation(db, null, input()), /Anmeldung/);
  await assert.rejects(commitInventoryTransferOperation(db, { uid: 'other', token: {} }, input()), /Besitzer/);
  for (const quantity of [0, -1, 1.5, Number.MAX_SAFE_INTEGER]) {
    await assert.rejects(commitInventoryTransferOperation(db, auth, input({ kind: 'money', currency: 'gold', quantity })));
  }
  assert.deepEqual([...db.data], before);
});

test('free register grants use server mechanics and identity, without inventing a paid purchase', async () => {
  const db = store();
  const template = STANDARD_ITEMS.find(item => item.id === 'standard:waffen-rustungen:langschwert');
  const forged = input({ kind: 'register-item', itemDbKey: template.id, quantity: 1, name: 'Forged',
    combatDefinition: { kind: 'weapon', damageFormula: '99d100' } });
  await assert.rejects(commitInventoryTransferOperation(db, auth, forged), /Spielleitung/);
  const result = await commitInventoryTransferOperation(db, { ...auth, token: { aleriaRole: 'moderator' } }, forged);
  const item = result.receiverInventory.items[0];
  assert.equal(item.name, template.title);
  assert.equal(item.templateId, template.id);
  assert.equal(item.combatDefinition, undefined);
  assert.deepEqual(item.definitionRef, template.definitionRef);
  assert.equal(db.data.get('characters/receiver').combatProfile.weapons[0].damageFormula, '1d8');
  assert.equal(item.purchase, undefined);
  assert.equal(db.data.get('characters/receiver').combatProfile.weapons[0].inventoryItemId, item.id);
  assert.equal(result.receiverInventory.moneyState.totalCopper, 2);
});

test('unresolvable free grants cannot write a partial comment or possession', async () => {
  const db = store(), before = structuredClone([...db.data]);
  await assert.rejects(commitInventoryTransferOperation(db, { ...auth, token: { aleriaRole: 'moderator' } },
    input({ kind: 'register-item', itemDbKey: 'standard:invented', quantity: 1 })), /Registervorlage/);
  assert.deepEqual([...db.data], before);
});
