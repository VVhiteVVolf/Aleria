import test from 'node:test';
import assert from 'node:assert/strict';
import { database } from './fixtures/combat-transaction-database.js';
import { commitItemRegisterOperation } from '../src/mechanics/commit-item-register.js';
import { commitItemDefinitionOperation } from '../src/items/commit-item-definition.js';
import { commitItemAwardOperation } from '../src/items/commit-item-award.js';
import { commitItemRecordOperation } from '../src/items/commit-item-record.js';
import { commitQuestOperation } from '../src/quests/commit-quest.js';
import { STANDARD_ITEMS, STANDARD_VERSION } from '../src/generated/item-register/item-register-standard.js';
const auth = { uid: 'owner', token: { aleriaRole: 'moderator' } };
const ration = STANDARD_ITEMS.find(item => item.id === 'standard:gemischtwarenhandler:rationen');
const sword = STANDARD_ITEMS.find(item => item.id === 'standard:waffen-rustungen:langschwert');
const shield = STANDARD_ITEMS.find(item => item.combatDefinition?.armorKind === 'shield' && item.definitionRef);
const record = () => ({ id: 'owner', name: 'Owner', ownerUid: 'owner', inventory: { revision: 1, moneyState: { totalCopper: 10000 }, items: [
  { id: 'old-weapon', name: 'Persönliche Klinge', quantity: '1', category: 'weapon', equipped: false, image: 'inventory-image', combatDefinition: { kind: 'weapon', damageFormula: '1d4', weaponType: 'sword' } },
  { id: 'old-ration', name: 'Ration', quantity: '1', definitionRef: ration.definitionRef }
] }, combatProfile: { revision: 8, hitPoints: { current: 9 }, resources: [{ id: 'mana', current: 3 }],
  weapons: [{ id: 'old-slot', inventoryItemId: 'old-weapon', name: 'Eigene Klinge', equipped: true, image: 'saved-image', damageFormula: '1d8' }] } });
const seed = () => database({ 'characters/owner': record(), 'creatures/horse': { ...record(), id: 'horse', name: 'Horse' } });
const buy = (db, product = ration, action = 'buy', extra = {}) => ({ action, operationId: `${action}-item`, characterId: 'owner',
  standardVersion: STANDARD_VERSION, expectedRevision: db.data.get('characters/owner').inventory.revision,
  productId: product.id, quantity: 1, unitCopper: product.priceRange?.minCopper, ...extra });

test('buying, customizing and reselling food preserves the complete saved loadout, resources and profile revision', async () => {
  const db = seed(), original = structuredClone(db.data.get('characters/owner').combatProfile);
  const bought = await commitItemRegisterOperation(db, auth, buy(db));
  assert.deepEqual(bought.character.combatProfile, original);
  const item = bought.character.inventory.items.find(row => row.id !== 'old-ration' && row.definitionRef?.id === ration.definitionRef.id);
  await commitItemRegisterOperation(db, auth, { action: 'customize', operationId: 'rename-food', characterId: 'owner',
    expectedRevision: db.data.get('characters/owner').inventory.revision, inventoryItemId: item.id, name: 'Eigenes Reisebrot' });
  assert.deepEqual(db.data.get('characters/owner').combatProfile, original);
  await commitItemRegisterOperation(db, auth, buy(db, ration, 'sell', { inventoryItemId: item.id, unitCopper: Math.floor(ration.priceRange.minCopper * 100 / 2) / 100 }));
  assert.deepEqual(db.data.get('characters/owner').combatProfile, original);
});

test('definition grants preserve complete unrelated character and creature profiles and do not create absent profiles', async () => {
  for (const [recordKind, path] of [['character', 'characters/owner'], ['creature', 'creatures/horse']]) {
    const db = seed(), original = structuredClone(db.data.get(path).combatProfile);
    await commitItemDefinitionOperation(db, auth, { action: 'grant', operationId: 'grant-food', recordKind,
      recordId: db.data.get(path).id, definitionRef: ration.definitionRef, expectedRevision: 1, quantity: 1 });
    assert.deepEqual(db.data.get(path).combatProfile, original);
  }
  const db = seed(); delete db.data.get('characters/owner').combatProfile;
  await commitItemDefinitionOperation(db, auth, { action: 'grant', operationId: 'grant-without-profile', recordId: 'owner', definitionRef: ration.definitionRef, expectedRevision: 1 });
  assert.equal(Object.hasOwn(db.data.get('characters/owner'), 'combatProfile'), false);
});

test('money-only and food notice awards leave complete combat profiles untouched', async () => {
  for (const rewards of [[{ kind: 'money', currency: 'copper', amount: 7 }], [{ kind: 'item', itemId: ration.id, quantity: 2 }]]) {
    const db = seed(), original = structuredClone(db.data.get('characters/owner').combatProfile);
    const input = { sourceKey: 'notice:passive-profile', operationId: 'award', recordId: 'owner', expectedRevision: 1, rewards };
    await commitItemAwardOperation(db, auth, input);
    assert.deepEqual(db.data.get('characters/owner').combatProfile, original);
    const after = structuredClone([...db.data]); await commitItemAwardOperation(db, auth, input);
    assert.deepEqual([...db.data], after);
  }
});

test('quest money and food payout preserve complete profiles and their previous loadout choices', async () => {
  const db = seed(), original = structuredClone(db.data.get('characters/owner').combatProfile);
  const stamp = { date: { year: 1740, month: 3, day: 9 }, time: '08:00' };
  await commitQuestOperation(db, auth, { action: 'start', id: 'profile-run', operationId: 'start', quest: { id: 'profile-quest', title: 'Lieferung' },
    party: [{ kind: 'character', recordId: 'owner' }], stamp });
  await commitQuestOperation(db, auth, { action: 'finish', id: 'profile-run', operationId: 'finish', expectedRevision: 1, stamp,
    rewardPlan: [{ recordId: 'owner', rewards: [{ kind: 'money', currency: 'copper', amount: 7 }, { kind: 'item', itemId: ration.id, quantity: 1 }] }] });
  await commitQuestOperation(db, auth, { action: 'claim', id: 'profile-run', operationId: 'claim', expectedRevision: 2 });
  assert.deepEqual(db.data.get('characters/owner').combatProfile, original);
});

test('several real equipment awards register only their new bindings and preserve all original gear', async () => {
  assert.ok(shield);
  const db = seed(), original = structuredClone(db.data.get('characters/owner').combatProfile);
  const given = await commitItemAwardOperation(db, auth, { sourceKey: 'notice:gear-profile', operationId: 'award-gear', recordId: 'owner', expectedRevision: 1,
    rewards: [{ kind: 'item', itemId: sword.id, quantity: 1 }, { kind: 'item', itemId: shield.id, quantity: 1 }] });
  const after = db.data.get('characters/owner').combatProfile;
  assert.deepEqual(after.weapons.filter(entry => entry.inventoryItemId === 'old-weapon'), original.weapons);
  assert.equal(after.weapons.filter(entry => given.items.some(item => item.id === entry.inventoryItemId)).length, 1);
  assert.equal(after.armorItems.filter(entry => given.items.some(item => item.id === entry.inventoryItemId)).length, 1);
  assert.deepEqual(after.hitPoints, original.hitPoints); assert.deepEqual(after.resources, original.resources);
  assert.ok(after.revision > original.revision);
});

test('a saved equipped weapon cannot be sold by reconciling away a contradictory legacy inventory flag', async () => {
  const db = seed(), person = db.data.get('characters/owner');
  Object.assign(person.inventory.items[0], { templateId: sword.id, originItemDbKey: sword.id, purchase: { unitCopper: 100, sourceId: sword.id } });
  const before = structuredClone([...db.data]);
  await assert.rejects(commitItemRegisterOperation(db, auth, buy(db, sword, 'sell', { inventoryItemId: 'old-weapon', unitCopper: 50 })), /ablegen/);
  assert.deepEqual([...db.data], before);
});

test('an inventory-only food edit preserves the complete profile and its revision', async () => {
  const db = seed(), original = structuredClone(db.data.get('characters/owner').combatProfile);
  const inventory = structuredClone(db.data.get('characters/owner').inventory);
  inventory.items.find(item => item.id === 'old-ration').name = 'Eigenes Reisebrot';
  await commitItemRecordOperation(db, auth, { id: 'owner', operationId: 'inventory-only-food', data: { inventory } });
  assert.equal(db.data.get('characters/owner').inventory.items.find(item => item.id === 'old-ration').name, 'Eigenes Reisebrot');
  assert.deepEqual(db.data.get('characters/owner').combatProfile, original);
});

test('a partial legacy equipment sale preserves a remaining bound slot exactly', async () => {
  const db = seed(), person = db.data.get('characters/owner');
  person.inventory.items[0].quantity = '2';
  Object.assign(person.inventory.items[0], { templateId: sword.id, originItemDbKey: sword.id, purchase: { unitCopper: 100, sourceId: sword.id } });
  person.combatProfile.weapons[0].equipped = false;
  const original = structuredClone(person.combatProfile);
  await commitItemRegisterOperation(db, auth, buy(db, sword, 'sell', { inventoryItemId: 'old-weapon', unitCopper: 50 }));
  assert.equal(db.data.get('characters/owner').inventory.items[0].quantity, '1');
  assert.deepEqual(db.data.get('characters/owner').combatProfile, original);
});

test('explicit gear customization replaces name and rules without treating an unchanged stale flag as unequip', async () => {
  const db = seed(), before = structuredClone(db.data.get('characters/owner').combatProfile);
  await commitItemRegisterOperation(db, auth, { action: 'customize', operationId: 'customize-gear', characterId: 'owner', expectedRevision: 1,
    inventoryItemId: 'old-weapon', name: 'Erprobte Klinge', combatDefinition: { damageFormula: '2d6' } });
  const after = db.data.get('characters/owner').combatProfile;
  assert.equal(after.weapons[0].name, 'Erprobte Klinge');
  assert.equal(after.weapons[0].damageFormula, '2d6');
  assert.equal(after.weapons[0].equipped, true);
  assert.deepEqual(after.hitPoints, before.hitPoints); assert.deepEqual(after.resources, before.resources);
});

test('inventory-only gear rename preserves a saved loadout while explicit inventory equip transitions remain effective', async () => {
  for (const mode of ['rename', 'equip', 'unequip']) {
    const db = seed(), person = db.data.get('characters/owner');
    if (mode === 'equip') person.combatProfile.weapons[0].equipped = false;
    if (mode === 'unequip') person.inventory.items[0].equipped = true;
    const inventory = structuredClone(person.inventory);
    inventory.items[0].name = 'Neu benannte Klinge';
    if (mode === 'equip') inventory.items[0].equipped = true;
    if (mode === 'unequip') inventory.items[0].equipped = false;
    await commitItemRecordOperation(db, auth, { id: 'owner', operationId: `inventory-gear-${mode}`, data: { inventory } });
    const after = db.data.get('characters/owner').combatProfile;
    assert.equal(after.weapons[0].name, 'Neu benannte Klinge');
    assert.equal(after.weapons[0].equipped, mode !== 'unequip', mode);
  }
});
