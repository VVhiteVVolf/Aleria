import assert from 'node:assert/strict';
import test from 'node:test';
import { database } from './fixtures/combat-transaction-database.js';
import { commitCombatCommentOperation } from '../src/mechanics/commit-combat-comment.js';
import { undoMechanicalCommentOperation } from '../src/mechanics/commit-undo-mechanical-comment.js';
import { commitItemDefinitionOperation } from '../src/items/commit-item-definition.js';
import { commitInventoryTransferOperation } from '../src/mechanics/commit-inventory-transfer.js';

const auth = { uid: 'tester', token: { aleriaRole: 'admin' } };
const fixture = () => database({ 'characters/actor': { id: 'actor', name: 'Actor', ownerUid: auth.uid,
  inventory: { revision: 1, items: [{ id: 'ration', name: 'Ration', category: 'food', quantity: '2' }], moneyState: { totalCopper: 100 } },
  combatProfile: { hitPoints: { current: 4, maximumOverride: 20 }, weapons: [] } } });
const consume = (db, order) => commitCombatCommentOperation({ auth, data: { entryId: 'scene', text: 'Eine Ration wird verzehrt.',
  metadata: { characterId: 'actor', operationId: `consume-${order}`, commentSegments: [{ kind: 'consume', characterId: 'actor',
    inventoryUse: { actorId: 'actor', actorPersistence: { kind: 'character', recordId: 'actor' }, item: { id: 'ration' }, mode: 'consume' } }] } } },
{ database: db, nowClient: order });
const undo = (db, commentId, force = false, user = auth) => undoMechanicalCommentOperation({ auth: user, data: { entryId: 'scene', commentId, force } }, { database: db });

for (const legacy of ['fingerprint', 'segments', 'resolution']) test(`undo preserves an item granted after consumption (${legacy})`, async () => {
  const db = fixture(), used = await consume(db, 100);
  const comment = db.data.get(`comments/${used.id}`);
  if (legacy !== 'fingerprint') delete comment.mechanicalUndo['character:actor'].afterInventoryFingerprint;
  if (legacy === 'resolution') {
    const use = comment.commentSegments[0].inventoryUse;
    comment.combatResolution = { actorId: use.actorId, actorPersistence: use.actorPersistence, actorInventorySnapshot: use.inventorySnapshot };
    comment.commentSegments = null;
  }
  const defined = await commitItemDefinitionOperation(db, auth, { action: 'save', operationId: 'define-book',
    definition: { id: 'item:undo-book', title: 'Späteres Geschenk', category: 'sonstiges' } });
  await commitItemDefinitionOperation(db, auth, { action: 'grant', operationId: 'grant-book', recordId: 'actor',
    expectedRevision: db.data.get('characters/actor').inventory.revision, definitionRef: defined.template.definitionRef });
  const before = structuredClone([...db.data]);
  await assert.rejects(undo(db, used.id), /Inventar wurde danach verändert/);
  assert.deepEqual([...db.data], before, 'Rejected undo must leave the newer item, wallet, claims and history untouched.');
  const forced = await undo(db, used.id, true);
  assert.equal(forced.skippedReversal.length, 1);
  assert.deepEqual(db.data.get('characters/actor'), before.find(([path]) => path === 'characters/actor')[1]);
});

test('undo cannot duplicate a possession transferred to another character in a different scene', async () => {
  const db = fixture(), used = await consume(db, 100);
  db.data.set('characters/receiver', { id: 'receiver', name: 'Receiver', ownerUid: auth.uid, inventory: { items: [] }, combatProfile: {} });
  await commitInventoryTransferOperation(db, auth, { giverId: 'actor', receiverId: 'receiver', entryId: 'other-scene',
    sceneEvent: { transfer: { transferId: 'later-transfer', object: { kind: 'item', itemId: 'ration', quantity: 1 } } } });
  const before = structuredClone([...db.data]);
  await assert.rejects(undo(db, used.id), /Inventar wurde danach verändert/);
  assert.deepEqual([...db.data], before);
});

test('sequential inventory undos remain valid after each undo increments the revision', async () => {
  const db = fixture(), first = await consume(db, 100), second = await consume(db, 200);
  assert.equal(db.data.get('characters/actor').inventory.items.length, 0);
  await undo(db, second.id);
  assert.equal(db.data.get('characters/actor').inventory.items[0].quantity, '1');
  db.data.get('characters/actor').inventory = Object.fromEntries(Object.entries(db.data.get('characters/actor').inventory).reverse());
  await undo(db, first.id);
  assert.equal(db.data.get('characters/actor').inventory.items[0].quantity, '2');
});

test('only existing game master roles may request forced undo; normal player undo remains available', async () => {
  for (const role of ['player', 'editor']) {
    const db = fixture(), used = await consume(db, 100), before = structuredClone([...db.data]);
    await assert.rejects(undo(db, used.id, true, { uid: 'tester', token: { aleriaRole: role } }), error => error.code === 'permission-denied');
    assert.deepEqual([...db.data], before);
    await undo(db, used.id, false, { uid: 'tester', token: { aleriaRole: role } });
  }
  for (const role of ['admin', 'moderator']) {
    const db = fixture(), used = await consume(db, 100);
    assert.equal((await undo(db, used.id, true, { uid: 'tester', token: { aleriaRole: role } })).deleted, true);
  }
});
