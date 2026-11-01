import test from 'node:test';
import assert from 'node:assert/strict';
import { database } from './fixtures/combat-transaction-database.js';
import { commitGroupInventoryOperation } from '../src/groups/commit-group-inventory.js';
import { commitItemDefinitionOperation } from '../src/items/commit-item-definition.js';

const gm = { uid: 'gm', token: { aleriaRole: 'moderator' } };
const weapon = (id, equipped = false) => ({ id, name: 'Klinge', quantity: '1', category: 'weapon', equipped, image: 'inventory-image',
  combatDefinition: { kind: 'weapon', damageFormula: '1d8', weaponType: 'sword', damageType: 'Hieb', attackAttribute: 'strength' } });
const armor = id => ({ id, name: 'Panzer', quantity: '1', category: 'armor', equipped: false, image: 'inventory-armor-image',
  combatDefinition: { kind: 'armor', armorKind: 'armor', baseArmorClass: 15, dexterityMode: 'none' } });
const originalProfile = () => ({ revision: 7, hitPoints: { current: 9 }, resources: [{ id: 'mana', current: 3 }],
  weapons: [{ id: 'old-weapon', inventoryItemId: 'old-weapon', name: 'Persönlicher Name', equipped: true, image: 'kept-image', damageFormula: '1d6' }],
  armorItems: [{ id: 'old-armor', inventoryItemId: 'old-armor', name: 'Eigener Panzer', equipped: true, image: 'kept-armor-image', baseArmorClass: 16 }] });
function seed() {
  const entry = { id: 'crew', title: 'Gruppe', pages: [{ landingPage: true, landing: { group: { guests: [
    { id: 'one', kind: 'character', characterId: 'one', name: 'Alice' }, { id: 'horse', kind: 'creature', creatureId: 'horse', name: 'Pferd' }
  ] } } }] };
  return database({ 'module_store_entries/crew': { entryJson: JSON.stringify(entry) },
    'group_quest_accounts/crew': { id: 'crew', revision: 1, inventory: { revision: 1, moneyState: { totalCopper: 30 }, items: [{ id: 'ration', name: 'Ration', quantity: '3', category: 'consumable' }] } },
    'characters/one': { id: 'one', name: 'Alice', ownerUid: 'gm', inventory: { revision: 1, items: [weapon('old-weapon', true), armor('old-armor')] }, combatProfile: originalProfile() },
    'creatures/horse': { id: 'horse', name: 'Pferd', ownerUid: 'gm', inventory: { revision: 1, items: [] }, combatProfile: { revision: 2, hitPoints: { current: 18 }, weapons: [{ id: 'hoof', damageFormula: '1d6', equipped: true }] } } });
}
function request(db, { action = 'withdraw', kind = 'character', recordId = 'one', operationId = 'transfer', object } = {}) {
  const record = db.data.get(`${kind === 'creature' ? 'creatures' : 'characters'}/${recordId}`);
  return { operationId, groupId: 'crew', action, member: { kind, recordId }, object,
    expectedGroupRevision: db.data.get('group_quest_accounts/crew').revision, expectedMemberRevision: record.inventory.revision };
}

test('money and consumable group handoffs preserve complete character and creature combat profiles including revision and absent fields', async () => {
  const db = seed(), character = structuredClone(db.data.get('characters/one').combatProfile), creature = structuredClone(db.data.get('creatures/horse').combatProfile);
  await commitGroupInventoryOperation(db, gm, request(db, { object: { kind: 'money', currency: 'copper', quantity: 3 } }));
  assert.deepEqual(db.data.get('characters/one').combatProfile, character);
  const received = await commitGroupInventoryOperation(db, gm, request(db, { operationId: 'ration-in', object: { kind: 'item', itemId: 'ration', quantity: 1 } }));
  assert.deepEqual(db.data.get('characters/one').combatProfile, character);
  const item = received.memberInventory.items.find(row => row.name === 'Ration');
  await commitGroupInventoryOperation(db, gm, request(db, { action: 'deposit', operationId: 'ration-out', object: { kind: 'item', itemId: item.id, quantity: 1 } }));
  assert.deepEqual(db.data.get('characters/one').combatProfile, character);
  await commitGroupInventoryOperation(db, gm, request(db, { kind: 'creature', recordId: 'horse', operationId: 'ration-horse', object: { kind: 'item', itemId: 'ration', quantity: 1 } }));
  assert.deepEqual(db.data.get('creatures/horse').combatProfile, creature);
  delete db.data.get('characters/one').combatProfile;
  await commitGroupInventoryOperation(db, gm, request(db, { operationId: 'without-profile', object: { kind: 'money', currency: 'pfennig', quantity: 1 } }));
  assert.equal(Object.hasOwn(db.data.get('characters/one'), 'combatProfile'), false);
});

test('transferred weapons and armor register and detach only their own combat entries, preserving unrelated equipment and resources', async () => {
  for (const item of [weapon('new-weapon'), armor('new-armor')]) {
    const db = seed(), before = structuredClone(db.data.get('characters/one').combatProfile);
    db.data.get('group_quest_accounts/crew').inventory.items.push(item);
    const given = await commitGroupInventoryOperation(db, gm, request(db, { object: { kind: 'item', itemId: item.id, quantity: 1 } }));
    const after = db.data.get('characters/one').combatProfile, collection = item.combatDefinition.kind === 'weapon' ? 'weapons' : 'armorItems';
    const added = after[collection].find(row => row.inventoryItemId === item.id);
    assert.ok(added); assert.equal(added.equipped, false);
    if (collection === 'weapons') assert.equal(added.damageFormula, '1d8'); else assert.equal(added.baseArmorClass, 15);
    assert.ok(after.revision > before.revision);
    for (const key of ['weapons', 'armorItems']) assert.deepEqual(after[key].filter(row => row.inventoryItemId !== item.id), before[key]);
    assert.deepEqual(after.hitPoints, before.hitPoints); assert.deepEqual(after.resources, before.resources);
    const received = given.memberInventory.items.find(row => row.id === item.id);
    assert.ok(received.equipmentLink);
    await commitGroupInventoryOperation(db, gm, request(db, { action: 'deposit', operationId: 'return', object: { kind: 'item', itemId: received.id, quantity: 1 } }));
    const returned = db.data.get('characters/one').combatProfile;
    assert.deepEqual({ ...returned, revision: before.revision }, before);
  }
});

test('saved equipped loadouts cannot be silently normalized away to permit a group equipment deposit', async () => {
  const db = seed();
  const definition = (await commitItemDefinitionOperation(db, gm, { action: 'save', operationId: 'define', definition: { id: 'shared:profile-trigger', title: 'Ration', kind: 'shared', category: 'consumable' } })).definition;
  const person = db.data.get('characters/one');
  person.inventory.items.push({ id: 'defined-ration', name: 'Ration', quantity: '1', definitionRef: { id: definition.id, revision: definition.revision } });
  // The saved combat loadout is equipped even though an old inventory flag
  // disagrees. Hydrating the entire loadout used to clear it before validation.
  person.inventory.items.find(row => row.id === 'old-weapon').equipped = false;
  const before = structuredClone([...db.data]);
  await assert.rejects(commitGroupInventoryOperation(db, gm, request(db, { action: 'deposit', object: { kind: 'item', itemId: 'old-weapon', quantity: 1 } })), /ablegen/);
  assert.deepEqual([...db.data], before);
});
