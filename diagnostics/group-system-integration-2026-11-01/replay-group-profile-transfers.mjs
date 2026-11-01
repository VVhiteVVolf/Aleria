// Replay the five actual browser operations in memory from the captured public
// pre-transfer state. This file never connects to Firestore or reseeds actors.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { database } from '../../firebase/functions/tests/fixtures/combat-transaction-database.js';
import { commitGroupInventoryOperation } from '../../firebase/functions/src/groups/commit-group-inventory.js';
import { moneyTotal } from '../../AleriaAlmanach/modules/item-register/item-register-money.js';
const read = async name => JSON.parse(await readFile(new URL(name, import.meta.url), 'utf8'));
const before = await read('browser-before-state.json'), observed = await read('browser-after-state.json');
const { entry } = await read('../../AleriaAlmanach/modules/gawain-duncan/source/reviewed-module.json');
const groupId = before.groupId, auth = { uid: 'local-profile-replay', token: { aleriaRole: 'moderator' } };
const db = database({ [`module_store_entries/${groupId}`]: { entryJson: JSON.stringify(entry) }, [`group_quest_accounts/${groupId}`]: before.account,
  ...Object.fromEntries(['characters', 'creatures'].flatMap(kind => before[kind].map(record => [`${kind}/${record.id}`, record]))) });
const people = state => [...state.characters, ...state.creatures];
const gawain = before.characters.find(row => row.name === 'Gawain Draig'), duncan = before.characters.find(row => row.name === 'Duncan Gafyr');
async function transfer(kind, recordId, action, object, operationId) {
  const record = db.data.get(`${kind === 'creature' ? 'creatures' : 'characters'}/${recordId}`), account = db.data.get(`group_quest_accounts/${groupId}`);
  return commitGroupInventoryOperation(db, auth, { operationId, groupId, action, member: { kind, recordId }, object,
    expectedGroupRevision: account.revision, expectedMemberRevision: record.inventory?.revision || 0 });
}
const ration = before.account.inventory.items.find(item => item.definitionRef?.id === 'standard:gemischtwarenhandler:rationen');
const potion = before.account.inventory.items.find(item => item.definitionRef?.id === 'standard:alchemist:heiltrank');
const given = await transfer('character', gawain.id, 'withdraw', { kind: 'item', itemId: ration.id, quantity: 1 }, 'ration-in');
await transfer('character', duncan.id, 'withdraw', { kind: 'money', currency: 'copper', quantity: 3 }, 'money-duncan');
const receivedId = db.data.get(`group_inventory_transactions/${given.receiptId}`).object.receiverItemId;
await transfer('character', gawain.id, 'deposit', { kind: 'item', itemId: receivedId, quantity: 1 }, 'ration-out');
await transfer('creature', 'companion-tanor', 'withdraw', { kind: 'item', itemId: potion.id, quantity: 1 }, 'potion-tanor');
const sword = observed.account.inventory.items.find(item => item.originItemDbKey === 'standard:waffen-rustungen:ritterschwert');
await commitGroupInventoryOperation(db, auth, { operationId: 'register-greatsword', groupId, action: 'grant', product: { definitionRef: sword.definitionRef },
  quantity: 1, expectedGroupRevision: db.data.get(`group_quest_accounts/${groupId}`).revision });
const after = { account: db.data.get(`group_quest_accounts/${groupId}`), ...Object.fromEntries(['characters', 'creatures'].map(kind =>
  [kind, before[kind].map(row => db.data.get(`${kind}/${row.id}`))])) };
const money = state => [state.account, ...people(state)].reduce((sum, row) => sum + Math.round(moneyTotal(row.inventory?.moneyState || row.inventory?.money || {}) * 100), 0);
const quantity = (state, definitionId) => [state.account, ...people(state)].flatMap(row => row.inventory?.items || []).filter(item => item.definitionRef?.id === definitionId)
  .reduce((sum, item) => sum + Number(item.quantity ?? 1), 0);
const profileHash = profile => createHash('sha256').update(JSON.stringify(profile)).digest('hex');
const profiles = people(before).map(original => {
  const current = people(after).find(row => row.id === original.id);
  assert.deepEqual(current.combatProfile, original.combatProfile, original.name);
  return { id: original.id, name: original.name, profileUnchanged: true, beforeHash: profileHash(original.combatProfile), afterHash: profileHash(current.combatProfile) };
});
assert.equal(money(after), money(before));
assert.equal(after.account.inventory.moneyState.totalCopper, 47);
assert.equal(after.characters.find(row => row.id === duncan.id).inventory.moneyState.totalCopper - duncan.inventory.moneyState.totalCopper, 3);
for (const item of [ration, potion]) assert.equal(quantity(after, item.definitionRef.id), quantity(before, item.definitionRef.id));
assert.equal(quantity(after, sword.definitionRef.id), quantity(before, sword.definitionRef.id) + 1);
assert.equal(after.account.revision - before.account.revision, 5);
assert.equal([...db.data.keys()].filter(path => path.startsWith('group_inventory_transactions/')).length, 5);
const report = { source: 'browser-before-state.json', backend: 'commitGroupInventoryOperation', storage: 'isolated-in-memory', operations: 5,
  allSixProfilesExactlyUnchanged: true, profiles, moneyConserved: true, groupCopperBefore: 50, groupCopperAfter: 47,
  duncanReceivedCopper: 3, rationAndPotionQuantitiesConserved: true, greatswordGranted: 1, groupRevisions: 5, receipts: 5 };
await writeFile(new URL('browser-profile-replay-fixed.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
