import assert from 'node:assert/strict';
import test from 'node:test';
import { database } from './fixtures/combat-transaction-database.js';
import { commitSceneRestOperation } from '../src/mechanics/commit-scene-rest.js';
import { undoMechanicalCommentOperation } from '../src/mechanics/commit-undo-mechanical-comment.js';
import { commitCombatCommentOperation } from '../src/mechanics/commit-combat-comment.js';
import { commitItemDefinitionOperation } from '../src/items/commit-item-definition.js';

const auth = { uid: 'tester', token: { aleriaRole: 'admin' } };

async function usedFocus() {
  const db = database({ 'characters/actor': { id: 'actor', name: 'Actor', ownerUid: auth.uid,
    inventory: { revision: 1, items: [], moneyState: { totalCopper: 100 } },
    combatProfile: { hitPoints: { current: 4, maximumOverride: 20 }, weapons: [] } } });
  const defined = await commitItemDefinitionOperation(db, auth, { action: 'save', operationId: 'define-rest-focus',
    definition: { id: 'item:checkup-rest-focus', title: 'Rastfokus', category: 'arkanes',
      useDefinition: { mode: 'use', chargesMaximum: 2, chargesPerUse: 1, recovery: 'short-rest' } } });
  await commitItemDefinitionOperation(db, auth, { action: 'grant', operationId: 'grant-rest-focus', recordId: 'actor',
    expectedRevision: 1, definitionRef: defined.template.definitionRef });
  const item = db.data.get('characters/actor').inventory.items[0];
  const used = await commitCombatCommentOperation({ auth, data: { entryId: 'scene', text: 'Der Fokus wird verwendet.',
    metadata: { characterId: 'actor', operationId: 'use-rest-focus', commentSegments: [{ kind: 'interact', characterId: 'actor',
      inventoryUse: { actorId: 'actor', actorPersistence: { kind: 'character', recordId: 'actor' }, item: { id: item.id }, mode: 'use' } }] } } },
  { database: db, nowClient: 100 });
  return { db, item, used };
}

test('rest recovers current possessions without restoring a historical wallet or transferred item, and undo preserves the newer inventory', async () => {
  const { db, item, used } = await usedFocus();
  const historical = structuredClone(db.data.get(`comments/${used.id}`));
  const current = db.data.get('characters/actor');
  // A subsequent purchase/transfer changes the authoritative record after the stored usage receipt.
  current.inventory.moneyState.totalCopper = 37;
  current.inventory.items.push({ id: 'later-purchase', name: 'Neuer Besitz', quantity: '1' });
  const beforeRest = structuredClone(current.inventory);
  const rested = await commitSceneRestOperation({ auth, data: { entryId: 'scene', text: 'Eine Stunde Rast.', metadata: {
    orderKey: 1,
    sceneRest: { type: 'short', durationSeconds: 3600, participants: [{ actorId: 'actor', persistence: { kind: 'character', recordId: 'actor' } }] },
    sceneTimeEvent: { anchorDay: 1, anchorSeconds: 3600 } } } }, { database: db, nowClient: 200 });
  const afterRest = db.data.get('characters/actor').inventory;
  assert.ok(db.data.get(`comments/${rested.id}`).orderKey > historical.orderKey, 'Rest must follow the mechanics it recovers.');
  assert.equal(afterRest.moneyState.totalCopper, 37);
  assert.ok(afterRest.items.some(entry => entry.id === 'later-purchase'));
  assert.equal(afterRest.items.find(entry => entry.id === item.id).itemState.chargesCurrent, 2);
  assert.deepEqual(db.data.get(`comments/${used.id}`), historical);
  await undoMechanicalCommentOperation({ auth, data: { entryId: 'scene', commentId: rested.id } }, { database: db });
  assert.equal(db.data.get('characters/actor').inventory.moneyState.totalCopper, beforeRest.moneyState.totalCopper);
  assert.deepEqual(db.data.get('characters/actor').inventory.items, beforeRest.items);
  assert.deepEqual(db.data.get(`comments/${used.id}`), historical);
});

test('an active combat lock preserves HP and charges; after combat ends the same rest succeeds', async () => {
  const { db, item } = await usedFocus();
  const lockPath = 'combat_profile_locks/characters/records/actor';
  db.data.set(lockPath, { activeEncounterKeys: ['another-scene:active-battle'] });
  const request = { auth, data: { entryId: 'rest-scene', text: 'Eine Stunde Rast.', metadata: {
    sceneRest: { type: 'short', durationSeconds: 3600, participants: [{ actorId: 'actor', persistence: { kind: 'character', recordId: 'actor' } }] },
    sceneTimeEvent: { anchorDay: 1, anchorSeconds: 3600 } } } };
  const before = structuredClone([...db.data]);
  await assert.rejects(commitSceneRestOperation(request, { database: db, nowClient: 200 }), /aktiven Kampf/);
  assert.deepEqual([...db.data], before);
  db.data.set(lockPath, { activeEncounterKeys: [] });
  await commitSceneRestOperation(request, { database: db, nowClient: 300 });
  assert.equal(db.data.get('characters/actor').combatProfile.hitPoints.current, 20);
  assert.equal(db.data.get('characters/actor').inventory.items.find(entry => entry.id === item.id).itemState.chargesCurrent, 2);
});
