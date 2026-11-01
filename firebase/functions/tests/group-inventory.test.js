import test from 'node:test';
import assert from 'node:assert/strict';
import { database } from './fixtures/combat-transaction-database.js';
import { commitGroupInventoryOperation } from '../src/groups/commit-group-inventory.js';
import { commitItemDefinitionOperation } from '../src/items/commit-item-definition.js';
import { QUEST_BACKUP_COLLECTIONS } from '../src/quests/quest-backup.js';
const gm = { uid: 'gm', token: { aleriaRole: 'moderator' } }, owner = { uid: 'owner', token: {} };
const person = (id, name = 'Alice') => ({ id, name, ownerUid: 'owner', inventory: { items: [], revision: 1, moneyState: { totalCopper: 10 } },
  combatProfile: { revision: 1, hitPoints: { current: 7 }, resources: [{ id: 'mana', current: 2, maximum: 10 }] } });
const module = () => ({ id: 'crew', title: 'Testgruppe', pages: [
  { hierarchyPage: true, hierarchy: { trees: [{ label: 'Aktive', levels: [{ nodes: [{ title: 'Ritter', subtitle: 'Alice' }] }] }] } },
  { landingPage: true, landing: { group: { members: [{ id: 'hierarchy:alice', characterId: 'one' }], guests: [], treasury: { openingCopper: 777, entries: [] } } } },
  { sessionPage: true, commentThreadKey: 'camp', pageTitle: 'Lager' }
] });
const seed = () => database({ 'module_store_entries/crew': { entryJson: JSON.stringify(module()) },
  'group_quest_accounts/crew': { id: 'crew', name: 'Testgruppe', managerUids: ['manager'], revision: 1, inventory: { revision: 1, items: [], moneyState: { totalCopper: 30 } } },
  'characters/one': person('one'), 'characters/other': person('other', 'Outsider') });
const request = (extra = {}) => ({ operationId: 'transfer', groupId: 'crew', action: 'withdraw', member: { kind: 'character', recordId: 'one' },
  object: { kind: 'money', currency: 'pfennig', quantity: 29 }, expectedGroupRevision: 1, expectedMemberRevision: 1, ...extra });

test('group money transfers are atomic, revisioned and idempotent while editorial ledgers and live values stay unchanged', async () => {
  const db = seed(), originalModule = structuredClone(db.data.get('module_store_entries/crew'));
  const beforeProfile = structuredClone(db.data.get('characters/one').combatProfile);
  const [first, retry] = await Promise.all([commitGroupInventoryOperation(db, gm, request()), commitGroupInventoryOperation(db, gm, request())]);
  assert.equal(first.receiptId, retry.receiptId);
  assert.equal(first.groupInventory.moneyState.totalCopper, 29.71);
  assert.equal(first.memberInventory.moneyState.totalCopper, 10.29);
  assert.equal(first.groupRevision, 2);
  assert.ok(first.memberRevision > 1);
  const profile = db.data.get('characters/one').combatProfile;
  assert.deepEqual(profile, beforeProfile);
  assert.deepEqual(db.data.get('module_store_entries/crew'), originalModule);
  assert.equal([...db.data.keys()].filter(key => key.startsWith('group_inventory_transactions/')).length, 1);
  db.data.get('characters/one').inventory.items.push({ id: 'later', name: 'Späterer Fund' });
  assert.equal((await commitGroupInventoryOperation(db, gm, request())).memberInventory.items[0].id, 'later');
});

test('withdrawals require editorial authority or a protected manager; deposits require the giving owner', async () => {
  const db = seed(), before = structuredClone([...db.data]);
  await assert.rejects(commitGroupInventoryOperation(db, owner, request()), /Anmeldung/);
  await assert.rejects(commitGroupInventoryOperation(db, { uid: 'stranger', token: {} }, request({ action: 'deposit' })), /Anmeldung/);
  assert.deepEqual([...db.data], before);
  await commitGroupInventoryOperation(db, { uid: 'manager', token: {} }, request());
  const account = db.data.get('group_quest_accounts/crew'), character = db.data.get('characters/one');
  await commitGroupInventoryOperation(db, owner, request({ action: 'deposit', operationId: 'deposit', expectedGroupRevision: account.revision, expectedMemberRevision: character.inventory.revision }));
  assert.equal(db.data.get('group_quest_accounts/crew').inventory.moneyState.totalCopper, 30);
  assert.equal(db.data.get('characters/one').inventory.moneyState.totalCopper, 10);
  const forgedManager = seed(), entry = module(); entry.pages[1].landing.group.managerUids = ['owner'];
  forgedManager.data.set('module_store_entries/crew', { entryJson: JSON.stringify(entry) });
  await assert.rejects(commitGroupInventoryOperation(forgedManager, owner, request()), /Anmeldung/);
  await commitGroupInventoryOperation(seed(), { uid: 'editor', token: { aleriaRole: 'editor' } }, request());
});

test('stale revisions, outsider recipients, active locks and exhausted wallets reject the entire operation', async () => {
  for (const [edit, input] of [
    [() => {}, request({ expectedGroupRevision: 0 })], [() => {}, request({ expectedMemberRevision: 0 })],
    [() => {}, request({ member: { kind: 'character', recordId: 'other' } })],
    [db => db.data.set('combat_profile_locks/characters/records/one', { activeEncounterKeys: ['fight'] }), request()],
    [() => {}, request({ object: { kind: 'money', currency: 'gold', quantity: 1 } })]
  ]) {
    const db = seed(); edit(db); const before = structuredClone([...db.data]);
    await assert.rejects(commitGroupInventoryOperation(db, gm, input));
    assert.deepEqual([...db.data], before);
  }
});

test('legacy name membership resolves the complete authoritative set and rejects ambiguous aliases', async () => {
  const db = seed(), entry = module(); entry.pages[1].landing.group.members = [];
  db.data.set('module_store_entries/crew', { entryJson: JSON.stringify(entry) });
  await commitGroupInventoryOperation(db, gm, request());
  const duplicate = seed(); duplicate.data.set('module_store_entries/crew', { entryJson: JSON.stringify(entry) });
  duplicate.data.set('characters/other', person('other'));
  const before = structuredClone([...duplicate.data]);
  await assert.rejects(commitGroupInventoryOperation(duplicate, gm, request()), /Gruppenhierarchie/);
  assert.deepEqual([...duplicate.data], before);
});

test('an owned companion joins only through an exact persisted owner inventory link', async () => {
  for (const valid of [true, false]) {
    const db = seed(), character = db.data.get('characters/one');
    character.inventory.items.push({ id: 'pet', instanceId: 'pet-instance', creatureId: valid ? 'wolf' : 'other-wolf', quantity: '1' });
    db.data.set('creatures/wolf', { ...person('wolf', 'Wolf'), itemOrigin: { ownerCharacterId: 'one', inventoryItemId: 'pet', instanceId: 'pet-instance', disposition: 'owned' } });
    const input = request({ member: { kind: 'creature', recordId: 'wolf' } });
    if (valid) assert.equal((await commitGroupInventoryOperation(db, gm, input)).memberInventory.moneyState.totalCopper, 10.29);
    else await assert.rejects(commitGroupInventoryOperation(db, gm, input), /Gruppenhierarchie/);
  }
});

test('empty or invalid owner possessions never establish a companion group membership', async () => {
  for (const quantity of ['0', 0, -1, 'unbekannt']) {
    const db = seed();
    db.data.get('characters/one').inventory.items.push({ id: 'pet', instanceId: 'pet-instance', creatureId: 'wolf', quantity });
    db.data.set('creatures/wolf', { ...person('wolf', 'Wolf'), itemOrigin: { ownerCharacterId: 'one', inventoryItemId: 'pet', instanceId: 'pet-instance', disposition: 'owned' } });
    const before = structuredClone([...db.data]);
    await assert.rejects(commitGroupInventoryOperation(db, gm, request({ member: { kind: 'creature', recordId: 'wolf' } })), /Gruppenhierarchie/);
    assert.deepEqual([...db.data], before);
  }
});

test('register grants and unique withdrawal/deposit preserve one definition, instance and holder', async () => {
  const db = seed();
  const definition = (await commitItemDefinitionOperation(db, gm, { action: 'save', operationId: 'define', definition: { id: 'unique:group', title: 'Einmaliges Siegel', kind: 'unique' } })).definition;
  const grant = { operationId: 'grant', groupId: 'crew', action: 'grant', expectedGroupRevision: 1, product: { definitionRef: definition }, quantity: 1 };
  await assert.rejects(commitGroupInventoryOperation(db, owner, grant), /Spielleitung/);
  const given = await commitGroupInventoryOperation(db, gm, grant);
  assert.equal(given.memberInventory, null);
  const item = given.groupInventory.items[0];
  assert.equal(db.data.get('item_unique_claims/unique:group').holder.kind, 'groups');
  const taken = await commitGroupInventoryOperation(db, gm, request({ expectedGroupRevision: 2, object: { kind: 'item', itemId: item.id, quantity: 1 } }));
  assert.equal(db.data.get('item_unique_claims/unique:group').holder.recordId, 'one');
  const returned = await commitGroupInventoryOperation(db, owner, request({ action: 'deposit', operationId: 'return', expectedGroupRevision: taken.groupRevision,
    expectedMemberRevision: taken.memberRevision, object: { kind: 'item', itemId: taken.memberInventory.items[0].id, quantity: 1 } }));
  assert.equal(returned.groupInventory.items[0].instanceId, item.instanceId);
  assert.equal(db.data.get('item_unique_claims/unique:group').holder.kind, 'groups');
  assert.equal(db.data.get('characters/one').inventory.items.length, 0);
});

test('linked animal ownership follows group deposit and withdrawal without touching the animal profile', async () => {
  const db = seed(), character = db.data.get('characters/one');
  character.inventory.items.push({ id: 'horse', instanceId: 'horse-instance', creatureId: 'horse-record', quantity: '1', name: 'Pferd' });
  const animal = { ...person('horse-record', 'Pferd'), itemOrigin: { ownerCharacterId: 'one', ownerCharacterName: 'Alice', inventoryItemId: 'horse', instanceId: 'horse-instance' } };
  db.data.set('creatures/horse-record', animal);
  const deposited = await commitGroupInventoryOperation(db, owner, request({ action: 'deposit', object: { kind: 'item', itemId: 'horse', quantity: 1 } }));
  assert.equal(db.data.get('creatures/horse-record').itemOrigin.ownerGroupId, 'crew');
  const item = deposited.groupInventory.items[0];
  await commitGroupInventoryOperation(db, gm, request({ operationId: 'withdraw-horse', expectedGroupRevision: deposited.groupRevision, expectedMemberRevision: deposited.memberRevision,
    object: { kind: 'item', itemId: item.id, quantity: 1 } }));
  const after = db.data.get('creatures/horse-record');
  assert.equal(after.itemOrigin.ownerCharacterId, 'one'); assert.equal(after.itemOrigin.ownerGroupId, '');
  assert.deepEqual(after.combatProfile, animal.combatProfile);
});

test('optional scene receipts require a real linked open scene and never create combat state overlays', async () => {
  const db = seed();
  const result = await commitGroupInventoryOperation(db, gm, request({ entryId: 'crew::session:camp' }));
  const comment = db.data.get(`comments/${result.commentId}`);
  assert.equal(comment.entryId, 'crew::session:camp'); assert.equal(comment.serverValidatedMechanics, true);
  assert.equal(comment.combatTransaction, undefined); assert.equal(comment.combatState, undefined);
  for (const closed of [false, true]) {
    const denied = seed(); if (closed) denied.data.set('comment_turns/crew::session:camp', { current: 'ended' });
    const before = structuredClone([...denied.data]);
    await assert.rejects(commitGroupInventoryOperation(denied, gm, request({ entryId: closed ? 'crew::session:camp' : 'other::session:camp' })));
    assert.deepEqual([...denied.data], before);
  }
});

test('receipt fingerprints reject changed payloads and competing revisions cannot spend a group twice', async () => {
  const db = seed();
  const attempts = await Promise.allSettled([commitGroupInventoryOperation(db, gm, request()), commitGroupInventoryOperation(db, gm, request({ operationId: 'competing' }))]);
  assert.equal(attempts.filter(result => result.status === 'fulfilled').length, 1);
  await assert.rejects(commitGroupInventoryOperation(db, gm, request({ object: { kind: 'money', currency: 'copper', quantity: 1 } })), /Vorgangskennung/);
  assert.ok(QUEST_BACKUP_COLLECTIONS.includes('group_inventory_transactions'));
});
