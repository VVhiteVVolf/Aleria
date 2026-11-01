import test, { after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { commitItemDefinitionOperation } from '../../src/items/commit-item-definition.js';
import { commitItemAwardOperation } from '../../src/items/commit-item-award.js';
import { commitItemRegisterOperation } from '../../src/mechanics/commit-item-register.js';
import { commitCombatCommentOperation } from '../../src/mechanics/commit-combat-comment.js';
import { placeSceneItem } from '../../src/mechanics/commit-scene-item.js';
import { undoMechanicalCommentOperation } from '../../src/mechanics/commit-undo-mechanical-comment.js';
import { commitSceneRest } from '../../src/mechanics/commit-scene-rest.js';
import { STANDARD_ITEMS, STANDARD_VERSION } from '../../src/generated/item-register/item-register-standard.js';
const projectId = 'demo-aleria-item-duels';
if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8182') throw Error('Only the disposable Firestore emulator at 127.0.0.1:8182 is allowed.');
initializeApp({ projectId }); const database = getFirestore();
const auth = { uid: 'local-item-tester', token: { aleriaRole: 'moderator' } };
const character = id => ({ id, name: id, ownerUid: auth.uid, inventory: { revision: 1, items: [], moneyState: { totalCopper: 10000 } },
  combatProfile: { revision: 1, hitPoints: { current: 4, maximumOverride: 20 }, resources: [{ id: 'mana-focus', name: 'Mana', current: 1, maximum: 10, recovery: 'manual', scope: 'persistent' }] } });
const record = async id => (await database.doc(`characters/${id}`).get()).data();
beforeEach(async () => {
  const response = await fetch(`http://127.0.0.1:8182/emulator/v1/projects/${projectId}/databases/(default)/documents`, { method: 'DELETE' }); assert.ok(response.ok);
  for (const id of ['one', 'two']) await database.doc(`characters/${id}`).set(character(id));
});
after(() => database.terminate());
test('concurrent scene purchases book exactly one possession, debit, vendor credit and receipt', async () => {
  const product = STANDARD_ITEMS.find(item => item.id === 'standard:waffen-rustungen:langschwert');
  const input = { action: 'buy', operationId: 'purchase', entryId: 'scene', characterId: 'one', expectedRevision: 1,
    standardVersion: STANDARD_VERSION, productId: product.id, quantity: 1, unitCopper: product.priceRange.minCopper };
  const [first, second] = await Promise.all([commitItemRegisterOperation(database, auth, input), commitItemRegisterOperation(database, auth, input)]);
  assert.equal(first.commentId, second.commentId); assert.equal((await record('one')).inventory.items.length, 1);
  assert.equal((await record('one')).inventory.moneyState.totalCopper, 10000 - input.unitCopper);
  assert.equal((await database.collection('comments').get()).size, 1);
  assert.equal((await database.collection('item_vendor_wallets').get()).docs[0].data().netMinor, input.unitCopper * 100);
});
test('simultaneous grants of one unique definition produce one global instance', async () => {
  const created = await commitItemDefinitionOperation(database, auth, { action: 'save', operationId: 'define', definition: { id: 'unique:test', title: 'Einzige Klinge', kind: 'unique', category: 'waffen' } });
  const attempts = await Promise.allSettled(['one', 'two'].map(id => commitItemDefinitionOperation(database, auth, { action: 'grant', operationId: `grant-${id}`, recordId: id, expectedRevision: 1, definitionRef: created.definition, quantity: 1 })));
  assert.equal(attempts.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal((await record('one')).inventory.items.length + (await record('two')).inventory.items.length, 1);
  assert.equal((await database.collection('item_unique_claims').get()).size, 1);
  assert.equal((await record('one')).combatProfile.hitPoints.current, 4);
});
test('a notice claim remains single across different operation IDs and recipients', async () => {
  const base = { sourceKey: 'notice:board:quest', rewards: [{ kind: 'money', currency: 'copper', amount: 50 }], expectedRevision: 1 };
  const attempts = await Promise.allSettled(['one', 'two'].map(id => commitItemAwardOperation(database, auth, { ...base, operationId: `award-${id}`, recordId: id })));
  assert.equal(attempts.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal((await record('one')).inventory.moneyState.totalCopper + (await record('two')).inventory.moneyState.totalCopper, 20050);
});
test('charged item use is idempotent, resolves the pinned version and cannot spend empty charges', async () => {
  const draft = { id: 'item:focus', title: 'Heilfokus', kind: 'shared', category: 'arkanes',
    useDefinition: { mode: 'use', chargesMaximum: 2, chargesPerUse: 1, effects: [{ type: 'healing', amount: 4 }], costs: [{ resourceId: 'bonus-action', amount: 1 }] } };
  const first = await commitItemDefinitionOperation(database, auth, { action: 'save', operationId: 'define', definition: draft });
  await commitItemDefinitionOperation(database, auth, { action: 'grant', operationId: 'grant', recordId: 'one', expectedRevision: 1, definitionRef: first.definition });
  const item = (await record('one')).inventory.items[0];
  const request = operationId => ({ auth, data: { entryId: 'item-use-scene', text: 'Ich verwende den Fokus.', charName: 'one', metadata: { characterId: 'one', operationId,
    commentSegments: [{ kind: 'interact', characterId: 'one', inventoryUse: { usageId: 'preview', actorId: 'one', actorPersistence: { kind: 'character', recordId: 'one' }, item: { id: item.id }, mode: 'use' } }] } } });
  const [used, retry] = await Promise.all([commitCombatCommentOperation(request('use-one'), { database }), commitCombatCommentOperation(request('use-one'), { database })]);
  assert.equal(used.id, retry.id); assert.equal((await record('one')).combatProfile.hitPoints.current, 8);
  assert.equal((await record('one')).inventory.items[0].itemState.chargesCurrent, 1);
  const oldComment = (await database.doc(`comments/${used.id}`).get()).data();
  await commitItemDefinitionOperation(database, auth, { action: 'save', operationId: 'define-next', expectedRevision: first.definition.revision,
    definition: { ...draft, useDefinition: { ...draft.useDefinition, effects: [{ type: 'healing', amount: 9 }] } } });
  await commitCombatCommentOperation(request('use-two'), { database });
  assert.equal((await record('one')).combatProfile.hitPoints.current, 12);
  const before = await record('one');
  await assert.rejects(commitCombatCommentOperation(request('use-three'), { database }), /Ladungen/);
  assert.deepEqual(await record('one'), before);
  assert.deepEqual((await database.doc(`comments/${used.id}`).get()).data(), oldComment);
  assert.equal((await database.collection('mechanical_comment_transactions').get()).size, 2);
});
test('a unique scene item changes holder on pickup and returns to the scene on undo', async () => {
  const created = await commitItemDefinitionOperation(database, auth, { action: 'save', operationId: 'unique-focus', definition: { id: 'unique:focus', title: 'Einziger Fokus', kind: 'unique', category: 'arkanes' } });
  const placed = await placeSceneItem({ database, auth, input: { entryId: 'unique-scene', operationId: 'place-unique-focus', commentSegments: [{ kind: 'sceneitem', sceneItemDraft: { definitionRef: created.template.definitionRef, template: created.template.id,
    definitionChoice: 'existing', name: 'Einziger Fokus', description: 'Der einzige Fokus dieser Art.' } }] } });
  const entry = placed.sceneItemEvent;
  const request = { auth, data: { entryId: 'unique-scene', text: 'Ich hebe ihn auf.', metadata: { characterId: 'one', operationId: 'pickup-unique', commentSegments: [{ kind: 'interact', characterId: 'one',
    inventoryUse: { actorId: 'one', actorPersistence: { kind: 'character', recordId: 'one' }, item: entry.item, source: 'scene', sceneItemId: entry.sceneItemId, operation: 'pickup', mode: 'use' } }] } } };
  const picked = await commitCombatCommentOperation(request, { database });
  assert.equal((await database.doc('item_unique_claims/unique:focus').get()).data().holder.recordId, 'one');
  await undoMechanicalCommentOperation({ auth, data: { entryId: 'unique-scene', commentId: picked.id } }, { database });
  assert.equal((await record('one')).inventory.items.length, 0);
  assert.equal((await database.doc('item_unique_claims/unique:focus').get()).data().holder.kind, 'scene');
  await assert.rejects(commitCombatCommentOperation(request, { database }), /zurückgenommen/);
  await undoMechanicalCommentOperation({ auth, data: { entryId: 'unique-scene', commentId: placed.id } }, { database });
  assert.equal((await database.doc('item_unique_claims/unique:focus').get()).exists, false);
});
test('stored creatures consume the same defined item and persist its healing', async () => {
  await database.doc('creatures/beast').set(character('beast'));
  const created = await commitItemDefinitionOperation(database, auth, { action: 'save', operationId: 'define-food', definition: { id: 'item:creature-food', title: 'Heilration', category: 'speisen', useDefinition: { mode: 'consume', effects: [{ type: 'healing', amount: 4 }] } } });
  await commitItemDefinitionOperation(database, auth, { action: 'grant', operationId: 'grant-food', recordKind: 'creature', recordId: 'beast', expectedRevision: 1, definitionRef: created.template.definitionRef });
  const item = (await database.doc('creatures/beast').get()).data().inventory.items[0];
  await commitCombatCommentOperation({ auth, data: { entryId: 'creature-scene', text: 'Die Kreatur frisst.', metadata: { characterId: 'beast', operationId: 'creature-eats', commentSegments: [{ kind: 'consume', characterId: 'beast', inventoryUse: {
    actorId: 'beast', actorPersistence: { kind: 'creature', recordId: 'beast' }, item: { id: item.id }, mode: 'consume' } }] } } }, { database });
  const beast = (await database.doc('creatures/beast').get()).data();
  assert.equal(beast.inventory.items.length, 0); assert.equal(beast.combatProfile.hitPoints.current, 8);
});
test('a real scene rest restores only configured item charges and undo restores the spent pool', async () => {
  const defined = await commitItemDefinitionOperation(database, auth, { action: 'save', operationId: 'define-rest-focus', definition: { id: 'item:rest-focus', title: 'Rastfokus', category: 'arkanes',
    useDefinition: { mode: 'use', chargesMaximum: 2, chargesPerUse: 1, recovery: 'short-rest' } } });
  await commitItemDefinitionOperation(database, auth, { action: 'grant', operationId: 'grant-rest-focus', recordId: 'one', expectedRevision: 1, definitionRef: defined.template.definitionRef });
  const item = (await record('one')).inventory.items[0];
  await commitCombatCommentOperation({ auth, data: { entryId: 'rest-scene', text: 'Der Fokus wird verwendet.', metadata: { characterId: 'one', operationId: 'pre-rest-use', commentSegments: [{ kind: 'interact', characterId: 'one',
    inventoryUse: { actorId: 'one', actorPersistence: { kind: 'character', recordId: 'one' }, item: { id: item.id }, mode: 'use' } }] } } }, { database });
  assert.equal((await record('one')).inventory.items[0].itemState.chargesCurrent, 1);
  const rested = await commitSceneRest.run({ auth, data: { entryId: 'rest-scene', text: 'Eine Stunde Rast.', metadata: { sceneRest: { type: 'short', durationSeconds: 3600,
    participants: [{ actorId: 'one', name: 'one', persistence: { kind: 'character', recordId: 'one' } }] }, sceneTimeEvent: { anchorDay: 1, anchorSeconds: 3600 } } } });
  assert.equal((await record('one')).inventory.items[0].itemState.chargesCurrent, 2);
  assert.equal((await record('one')).inventory.moneyState.totalCopper, 10000);
  await undoMechanicalCommentOperation({ auth, data: { entryId: 'rest-scene', commentId: rested.id } }, { database });
  assert.equal((await record('one')).inventory.items[0].itemState.chargesCurrent, 1);
  assert.equal((await record('one')).combatProfile.hitPoints.current, 4);
});
