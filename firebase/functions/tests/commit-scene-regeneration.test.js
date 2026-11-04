import assert from 'node:assert/strict';
import test from 'node:test';
import { database } from './fixtures/combat-transaction-database.js';
import { commitSceneRegenerationOperation } from '../src/mechanics/commit-scene-regeneration.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../src/generated/combat/combat-state-model.js';
import { resolveCombatProfile } from '../src/generated/combat/combat-profile-resolver.js';
import { undoMechanicalCommentOperation } from '../src/mechanics/commit-undo-mechanical-comment.js';

const auth = { uid: 'player', token: { aleriaRole: 'player' } };
const selected = { actorId: 'actor', kind: 'character', recordId: 'actor' };

function actor(name = 'Figur') {
  return {
    name,
    inventory: { revision: 2, items: [{ id: 'focus', quantity: '1', itemState: { chargesCurrent: 0 } }], moneyState: { totalCopper: 37 } },
    combatProfile: {
      hitPoints: { current: 4, maximumOverride: 20, temporary: 3 },
      resources: [{ id: 'test-mana', name: 'Testmana', current: 1, maximum: 9, recovery: 'manual', scope: 'persistent' }],
      abilities: [{ id: 'test-ability', name: 'Testfähigkeit', usesCurrent: 0, usesMaximum: 2, recovery: 'none' }],
      conditions: [{ id: 'permanent-illness', name: 'Dauerhaftes Leiden', active: true }],
      progression: { experience: 123 },
      weapons: []
    }
  };
}

function beforeComment(actorId = 'actor') {
  return {
    entryId: 'scene', orderKey: 100, createdAtClient: 100,
    serverValidatedMechanics: true, mechanicalAudit: true,
    commentKind: 'combat-status-event',
    combatStatus: { actorId, operation: 'add', after: {
      current: 1, maximum: 20, temporary: 5,
      temporaryConditions: [{ id: 'practice-wound', name: 'Übungswunde', active: true, durationModel: { kind: 'permanent' } }],
      concentration: { sourceId: 'spell' }, channeling: { sourceId: 'channel' }
    } }
  };
}

function request(participants = [selected], expectedLastCommentId = 'before') {
  return { auth, data: { entryId: 'scene', expectedLastCommentId, participants } };
}

function setup() {
  return database({ 'characters/actor': actor(), 'characters/other': actor('Andere Figur'), 'comments/before': beforeComment() });
}

test('regeneration atomically restores only selected figures without scene activity, inventory changes or rewritten history', async () => {
  const db = setup();
  const original = structuredClone(db.data.get('characters/actor'));
  const other = structuredClone(db.data.get('characters/other'));
  const historical = structuredClone(db.data.get('comments/before'));
  const result = await commitSceneRegenerationOperation(request(), { database: db, nowClient: 200 });
  const record = db.data.get('characters/actor');
  assert.equal(record.combatProfile.hitPoints.current, 20);
  assert.equal(record.combatProfile.hitPoints.temporary, 0);
  assert.ok(record.combatProfile.resources.every(resource => resource.current === resource.maximum));
  assert.ok(record.combatProfile.abilities.every(ability => ability.usesCurrent === ability.usesMaximum));
  assert.deepEqual(record.inventory, original.inventory);
  assert.deepEqual(record.combatProfile.conditions, original.combatProfile.conditions);
  assert.deepEqual(record.combatProfile.progression, original.combatProfile.progression);
  assert.deepEqual(db.data.get('characters/other'), other);
  assert.deepEqual(db.data.get('comments/before'), historical);
  assert.equal(record.combatProfile.lastMechanicalCommentId, result.id);
  assert.ok(record.combatProfile.revision > original.inventory.revision);
  assert.equal(result.profileUpdates.length, 1);

  const receipt = db.data.get(`comments/${result.id}`);
  assert.equal(receipt.commentKind, 'scene-regeneration-event');
  assert.equal(receipt.serverValidatedMechanics, true);
  assert.ok(receipt.orderKey > historical.orderKey);
  for (const field of ['activityAt', 'activityAtClient', 'text', 'sceneTimeEvent', 'mechanicalUndo']) assert.equal(Object.hasOwn(receipt, field), false);
  const after = receipt.sceneRegeneration.participants[0].after;
  assert.deepEqual(after.temporaryConditions, []);
  assert.equal(after.concentration, null);
  assert.equal(after.channeling, null);
  const history = [...db.data].filter(([path]) => path.startsWith('comments/')).map(([path, comment]) => ({ id: path.slice('comments/'.length), ...comment }));
  const replay = deriveCombatStateFromComments(history).get('actor');
  assert.equal(replay.current, 20);
  assert.deepEqual(replay.temporaryConditions, []);
  const live = overlayCombatHitPointState(resolveCombatProfile({ ...record, id: 'actor' }), replay);
  assert.equal(live.currentHitPoints, 20);
  assert.deepEqual(live.temporaryConditions, []);
});

test('regeneration is available to a player during the current scene combat and can be repeated', async () => {
  const db = setup();
  db.data.set('combat_profile_locks/characters/records/actor', { activeEncounterKeys: ['scene:practice-combat'] });
  const first = await commitSceneRegenerationOperation(request([selected, selected]), { database: db, nowClient: 200 });
  assert.equal(first.sceneRegeneration.participants.length, 1, 'Duplicate selection must not duplicate writes.');
  const second = await commitSceneRegenerationOperation(request([selected], first.id), { database: db, nowClient: 201 });
  assert.notEqual(first.id, second.id);
  assert.equal(db.data.get('characters/actor').combatProfile.hitPoints.current, 20);
  assert.deepEqual(db.data.get('combat_profile_locks/characters/records/actor').activeEncounterKeys, ['scene:practice-combat']);
});

test('another-scene combat lock rejects the entire selection without partially healing other figures', async () => {
  const db = setup();
  db.data.set('combat_profile_locks/characters/records/actor', { activeEncounterKeys: ['other-scene:fight'] });
  const before = structuredClone([...db.data]);
  await assert.rejects(commitSceneRegenerationOperation(request([{ actorId: 'other', kind: 'character', recordId: 'other' }, selected]), { database: db, nowClient: 200 }), /anderen Szene/);
  assert.deepEqual([...db.data], before);
});

test('scene creature regeneration affects its instance and preserves the source creature record', async () => {
  const db = database({
    'creatures/wolf': actor('Wolf'),
    'comments/appearance': { entryId: 'scene', orderKey: 99, serverCommitted: true, sceneActorId: 'wolf:1', sceneActorSourceId: 'wolf' },
    'comments/before': beforeComment('wolf:1')
  });
  const source = structuredClone(db.data.get('creatures/wolf'));
  const result = await commitSceneRegenerationOperation(request([{ actorId: 'wolf:1', kind: 'creature', recordId: 'wolf' }]), { database: db, nowClient: 200 });
  assert.deepEqual(result.profileUpdates, []);
  assert.deepEqual(db.data.get('creatures/wolf'), source);
  const participant = result.sceneRegeneration.participants[0];
  assert.equal(participant.actorId, 'wolf:1');
  assert.equal(participant.after.current, 20);
  assert.deepEqual(participant.persistence, { kind: 'scene-creature', sourceCreatureId: 'wolf' });
  await assert.rejects(undoMechanicalCommentOperation({
    auth: { uid: 'master', token: { aleriaRole: 'admin' } },
    data: { entryId: 'scene', commentId: 'before', force: true }
  }, { database: db }), /verbindlich fortgeschrieben/);
});

test('stale scene head and unknown creature sources are rejected without writes', async () => {
  const db = setup();
  const before = structuredClone([...db.data]);
  await assert.rejects(commitSceneRegenerationOperation(request([selected], ''), { database: db }), /Szene hat sich verändert/);
  await assert.rejects(commitSceneRegenerationOperation(request([{ actorId: 'invented', kind: 'creature', recordId: 'actor' }]), { database: db }), /noch nicht bekannt/);
  assert.deepEqual([...db.data], before);
});

test('authentication, source IDs, selection size and missing profiles are validated', async () => {
  const db = setup();
  await assert.rejects(commitSceneRegenerationOperation({ ...request(), auth: null }, { database: db }), { code: 'unauthenticated' });
  for (const participants of [[], Array(101).fill(selected), [{ ...selected, recordId: 'bad/path' }], [{ ...selected, actorId: 'bad/path' }], [{ ...selected, kind: 'admin' }], [selected, { ...selected, recordId: 'other' }]]) {
    await assert.rejects(commitSceneRegenerationOperation(request(participants), { database: db }), { code: 'invalid-argument' });
  }
  await assert.rejects(commitSceneRegenerationOperation(request([{ ...selected, actorId: 'missing', recordId: 'missing' }]), { database: db }), { code: 'not-found' });
  assert.equal([...db.data.keys()].filter(path => path.startsWith('comments/')).length, 1);
});

test('current sheet maxima win over the stale maxima in earlier receipts', async () => {
  const db = setup();
  const before = db.data.get('comments/before');
  before.combatStatus.after.resources = [{ id: 'test-mana', current: 1, maximum: 2 }];
  const result = await commitSceneRegenerationOperation(request(), { database: db, nowClient: 200 });
  const mana = result.sceneRegeneration.participants[0].after.resources.find(resource => resource.id === 'test-mana');
  assert.equal(mana.maximum, 9);
  assert.equal(mana.current, 9);
});

test('recovery receipts and older affected mechanics stay immutable even for forced game-master undo', async () => {
  const db = setup();
  const result = await commitSceneRegenerationOperation(request(), { database: db, nowClient: 200 });
  const preserved = structuredClone([...db.data]);
  for (const force of [false, true]) {
    for (const commentId of [result.id, 'before']) {
      await assert.rejects(undoMechanicalCommentOperation({ auth: { uid: 'master', token: { aleriaRole: 'admin' } }, data: {
        entryId: 'scene', commentId, force
      } }, { database: db }), { code: 'failed-precondition' });
      assert.deepEqual([...db.data], preserved);
    }
  }
});
