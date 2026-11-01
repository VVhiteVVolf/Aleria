import test, { beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { commitItemRegisterOperation } from '../../src/mechanics/commit-item-register.js';
import { commitItemDefinitionOperation } from '../../src/items/commit-item-definition.js';
import { commitItemAwardOperation } from '../../src/items/commit-item-award.js';
import { commitItemRecordOperation } from '../../src/items/commit-item-record.js';
import { commitQuestOperation } from '../../src/quests/commit-quest.js';
import { STANDARD_ITEMS, STANDARD_VERSION } from '../../src/generated/item-register/item-register-standard.js';
if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8187') throw Error('Only the isolated Firestore emulator at 127.0.0.1:8187 is allowed.');
const projectId = 'demo-aleria-item-passive-profile', db = getFirestore(initializeApp({ projectId }, 'item-passive-profile-integration'));
const auth = { uid: 'owner', token: { aleriaRole: 'moderator' } };
const ration = STANDARD_ITEMS.find(item => item.id === 'standard:gemischtwarenhandler:rationen');
const sword = STANDARD_ITEMS.find(item => item.id === 'standard:waffen-rustungen:langschwert');
const shield = STANDARD_ITEMS.find(item => item.combatDefinition?.armorKind === 'shield' && item.definitionRef);
const record = id => ({ id, name: id, ownerUid: 'owner', inventory: { revision: 1, moneyState: { totalCopper: 10000 }, items: [
  { id: 'legacy-sword', name: 'Schwert', quantity: '1', equipped: false, category: 'weapon', combatDefinition: { kind: 'weapon', damageFormula: '1d4' } },
  { id: 'ration', name: 'Ration', quantity: '1', definitionRef: ration.definitionRef }
] }, combatProfile: { revision: 8, hitPoints: { current: 9 }, resources: [{ id: 'mana', current: 3 }],
  weapons: [{ id: 'saved-slot', inventoryItemId: 'legacy-sword', equipped: true, name: 'Eigene Klinge', damageFormula: '1d8', image: 'saved-image' }] } });
const read = async path => (await db.doc(path).get()).data();
beforeEach(async () => {
  const response = await fetch(`http://127.0.0.1:8187/emulator/v1/projects/${projectId}/databases/(default)/documents`, { method: 'DELETE' });
  assert.ok(response.ok);
  await db.doc('characters/owner').set(record('owner'));
  await db.doc('creatures/horse').set(record('horse'));
});
after(() => db.terminate());

test('real food buy, customize and resale leave the entire existing combat profile unchanged', async () => {
  const before = (await read('characters/owner')).combatProfile;
  const bought = await commitItemRegisterOperation(db, auth, { action: 'buy', operationId: 'buy-food', characterId: 'owner', standardVersion: STANDARD_VERSION,
    expectedRevision: 1, productId: ration.id, quantity: 1, unitCopper: ration.priceRange.minCopper });
  assert.deepEqual((await read('characters/owner')).combatProfile, before);
  await commitItemRegisterOperation(db, auth, { action: 'customize', operationId: 'rename-food', characterId: 'owner',
    expectedRevision: bought.character.inventory.revision, inventoryItemId: bought.receipt.itemId, name: 'Reisebrot' });
  assert.deepEqual((await read('characters/owner')).combatProfile, before);
  await commitItemRegisterOperation(db, auth, { action: 'sell', operationId: 'resell-food', characterId: 'owner', standardVersion: STANDARD_VERSION,
    expectedRevision: (await read('characters/owner')).inventory.revision, inventoryItemId: bought.receipt.itemId, productId: ration.id,
    quantity: 1, unitCopper: Math.floor(ration.priceRange.minCopper * 100 / 2) / 100 });
  assert.deepEqual((await read('characters/owner')).combatProfile, before);
  assert.equal((await db.collection('item_register_transactions').get()).size, 3);
});

test('real definition, notice and quest food/money rewards preserve whole character and creature profiles', async () => {
  const original = (await read('characters/owner')).combatProfile, horse = (await read('creatures/horse')).combatProfile;
  await commitItemDefinitionOperation(db, auth, { action: 'grant', operationId: 'grant-food', recordId: 'owner', definitionRef: ration.definitionRef, expectedRevision: 1 });
  await commitItemDefinitionOperation(db, auth, { action: 'grant', operationId: 'grant-horse', recordKind: 'creature', recordId: 'horse', definitionRef: ration.definitionRef, expectedRevision: 1 });
  await commitItemAwardOperation(db, auth, { sourceKey: 'notice:profile-reward', operationId: 'notice-reward', recordId: 'owner',
    expectedRevision: (await read('characters/owner')).inventory.revision, rewards: [{ kind: 'money', currency: 'copper', amount: 7 }, { kind: 'item', itemId: ration.id, quantity: 1 }] });
  const stamp = { date: { year: 1740, month: 3, day: 9 }, time: '08:00' };
  await commitQuestOperation(db, auth, { action: 'start', id: 'profile-run', operationId: 'start', quest: { id: 'profile-quest', title: 'Lieferung' },
    party: [{ kind: 'character', recordId: 'owner' }], stamp });
  await commitQuestOperation(db, auth, { action: 'finish', id: 'profile-run', operationId: 'finish', expectedRevision: 1, stamp,
    rewardPlan: [{ recordId: 'owner', rewards: [{ kind: 'money', currency: 'copper', amount: 4 }, { kind: 'item', itemId: ration.id, quantity: 1 }] }] });
  await commitQuestOperation(db, auth, { action: 'claim', id: 'profile-run', operationId: 'claim', expectedRevision: 2 });
  assert.deepEqual((await read('characters/owner')).combatProfile, original);
  assert.deepEqual((await read('creatures/horse')).combatProfile, horse);
  assert.equal((await read('quest_runs/profile-run')).rewardStatus, 'claimed');
});

test('real inventory-only edits retain saved loadouts while equipment rewards add only their new bindings', async () => {
  const before = await read('characters/owner'), inventory = structuredClone(before.inventory);
  inventory.items[1].name = 'Eigenes Reisebrot';
  await commitItemRecordOperation(db, auth, { id: 'owner', operationId: 'inventory-food-edit', data: { inventory } });
  assert.deepEqual((await read('characters/owner')).combatProfile, before.combatProfile);
  const award = await commitItemAwardOperation(db, auth, { sourceKey: 'notice:gear-reward', operationId: 'gear-reward', recordId: 'owner',
    expectedRevision: (await read('characters/owner')).inventory.revision,
    rewards: [{ kind: 'item', itemId: sword.id, quantity: 1 }, { kind: 'item', itemId: shield.id, quantity: 1 }] });
  const after = await read('characters/owner');
  assert.deepEqual(after.combatProfile.weapons.filter(entry => entry.inventoryItemId === 'legacy-sword'), before.combatProfile.weapons);
  assert.deepEqual(after.combatProfile.hitPoints, before.combatProfile.hitPoints);
  assert.deepEqual(after.combatProfile.resources, before.combatProfile.resources);
  assert.equal(after.combatProfile.weapons.filter(entry => award.items.some(item => item.id === entry.inventoryItemId)).length, 1);
  assert.equal(after.combatProfile.armorItems.filter(entry => award.items.some(item => item.id === entry.inventoryItemId)).length, 1);
});
