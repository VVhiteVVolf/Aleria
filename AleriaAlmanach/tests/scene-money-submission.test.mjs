import test from 'node:test';
import assert from 'node:assert/strict';
import { createInventoryTransactionSubmission } from '../modules/inventory-transactions/inventory-transaction-submission.js';
import { buildSceneMoneyRequest, validSceneMoneyRequest } from '../modules/scene-inventory/scene-inventory-money-client.js';

function request(targetKind = 'character') {
  return buildSceneMoneyRequest({ threadId: 'inn::session:one',
    giver: { id: 'giver', inventory: { revision: 3 } }, receiver: { id: 'receiver', inventory: { revision: 5 } },
    transfer: { currency: 'pfennig', quantity: 90, targetKind } });
}

function storageFixture() {
  const entries = new Map();
  return { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value),
    removeItem: key => entries.delete(key), entries };
}

function submission(commit, options = {}) {
  const failure = label => () => Error(label);
  return createInventoryTransactionSubmission(commit, {
    makeId: () => 'stable-money-operation', namespace: 'aleria:scene-money:pending:v1', requirePersistence: true,
    validateRequest: validSceneMoneyRequest, storageError: failure('storage unavailable'), identityError: failure('identity changed'),
    pendingError: failure('request pending'), runningError: failure('request running'), emptyError: failure('no request'), ...options
  });
}

test('money request contains exactly the participant revisions and monetary intent, without scene prose', () => {
  const result = buildSceneMoneyRequest({ threadId: 'inn::session:one',
    giver: { id: 'giver', inventory: { revision: 3 } }, receiver: { id: 'receiver', inventory: { revision: 5 } },
    text: 'discard', flavour: 'discard', icon: 'discard', orderKey: 999,
    transfer: { currency: 'pfennig', quantity: 90, text: 'discard', flavour: 'discard', icon: 'discard', orderKey: 999 } });
  assert.deepEqual(result, { giverId: 'giver', receiverId: 'receiver', entryId: 'inn::session:one',
    expectedRevisions: { 'character:giver': 3, 'character:receiver': 5 },
    sceneEvent: { transfer: { object: { kind: 'money', targetKind: 'character', currency: 'pfennig', quantity: 90 } } } });
  assert.equal(validSceneMoneyRequest(result), true);
  assert.doesNotMatch(JSON.stringify(result), /text|flavour|icon|orderKey|operationId/);
});

test('sink requests have an empty recipient and exactly one expected inventory revision', () => {
  const result = request('sink');
  assert.equal(result.receiverId, '');
  assert.deepEqual(result.expectedRevisions, { 'character:giver': 3 });
  assert.equal(result.sceneEvent.transfer.object.targetKind, 'sink');
  assert.equal(validSceneMoneyRequest(result), true);
  assert.equal(validSceneMoneyRequest({ ...result, receiverId: 'receiver' }), false);
  assert.equal(validSceneMoneyRequest({ ...result, expectedRevisions: { 'character:giver': 3, 'character:receiver': 5 } }), false);
});

test('request validation rejects missing identity, stale-shaped revisions and invalid money before persistence', () => {
  const valid = request();
  for (const mutation of [
    value => { delete value.entryId; }, value => { value.entryId = ''; }, value => { value.giverId = ''; },
    value => { value.receiverId = ''; }, value => { value.receiverId = value.giverId; },
    value => { value.expectedRevisions = {}; }, value => { value.expectedRevisions['character:other'] = 1; },
    value => { delete value.expectedRevisions['character:receiver']; },
    value => { value.expectedRevisions['character:giver'] = -1; },
    value => { value.expectedRevisions['character:giver'] = 1.5; },
    value => { value.expectedRevisions['character:giver'] = Number.MAX_SAFE_INTEGER + 1; },
    value => { value.expectedRevisions['character:giver'] = '3'; },
    value => { value.sceneEvent.transfer.object.targetKind = 'other'; },
    value => { value.sceneEvent.transfer.object.currency = 'unknown'; },
    value => { value.sceneEvent.transfer.object.quantity = 0; },
    value => { value.sceneEvent.transfer.object.quantity = -1; },
    value => { value.sceneEvent.transfer.object.quantity = 0.1; }
  ]) {
    const malformed = structuredClone(valid); mutation(malformed);
    assert.equal(validSceneMoneyRequest(malformed), false, JSON.stringify(malformed));
  }
  assert.throws(() => buildSceneMoneyRequest({ threadId: '', giver: { id: 'giver' }, transfer: { targetKind: 'sink', currency: 'pfennig', quantity: 1 } }));
});

test('a lost money response restores one exact immutable operation after reload and never resubmits automatically', async () => {
  const storage = storageFixture(), input = request(), calls = [];
  const original = submission(async value => { calls.push(structuredClone(value)); throw Error('response lost'); });
  original.bindPersistence({ storage, uid: 'u:one', threadId: input.entryId });
  await assert.rejects(original.submit(input), /response lost/);
  const frozen = original.pending();
  input.sceneEvent.transfer.object.quantity = 999;
  frozen.expectedRevisions['character:giver'] = 999;
  assert.equal(original.pending().sceneEvent.transfer.object.quantity, 90);
  assert.equal(original.pending().expectedRevisions['character:giver'], 3);
  assert.equal(storage.entries.size, 1);
  const restoredCalls = [], restored = submission(async value => { restoredCalls.push(value); return { id: 'receipt' }; });
  restored.bindPersistence({ storage, uid: 'u:one', threadId: 'inn::session:one' });
  assert.equal(restoredCalls.length, 0);
  assert.deepEqual(restored.pending(), calls[0]);
  const result = await restored.retry();
  assert.equal(result.id, 'receipt');
  assert.deepEqual(restoredCalls[0], calls[0]);
  assert.equal(restored.pending(), null);
  assert.equal(storage.entries.size, 0);
});

test('pending money operations are scoped to both the signed-in user and exact scene thread', async () => {
  const storage = storageFixture(), input = request('sink');
  const first = submission(async () => { throw Error('unconfirmed'); });
  first.bindPersistence({ storage, uid: 'u:one', threadId: input.entryId });
  await assert.rejects(first.submit(input), /unconfirmed/);
  for (const identity of [{ uid: 'u:two', threadId: input.entryId }, { uid: 'u:one', threadId: 'inn::session:two' }]) {
    const isolated = submission(async () => { throw Error('must not run'); });
    isolated.bindPersistence({ storage, ...identity });
    assert.equal(isolated.pending(), null);
    assert.throws(() => first.bindPersistence({ storage, ...identity }), /identity changed/);
  }
  assert.equal(storage.entries.size, 1);
});

test('one unresolved money request blocks parallel retries and new bookings until it settles', async () => {
  const storage = storageFixture(), input = request('sink'), calls = [];
  let release;
  const operations = submission(async value => { calls.push(value); await new Promise(resolve => { release = resolve; }); throw Error('unconfirmed'); });
  operations.bindPersistence({ storage, uid: 'user', threadId: input.entryId });
  const first = operations.submit(input);
  assert.equal(operations.running(), true);
  assert.throws(() => operations.submit(request()), /request pending/);
  await assert.rejects(operations.retry(), /request running/);
  assert.equal(calls.length, 1);
  release(); await assert.rejects(first, /unconfirmed/);
  assert.equal(operations.running(), false);
  assert.equal(operations.pending().operationId, 'stable-money-operation');
  assert.throws(() => operations.submit(request()), /request pending/);
});

test('definitive backend errors release the money request and permit a fresh booking', async () => {
  for (const code of ['invalid-argument', 'permission-denied', 'unauthenticated', 'not-found', 'aborted', 'failed-precondition', 'already-exists', 'resource-exhausted']) {
    const storage = storageFixture(), calls = [], input = request('sink');
    const operations = submission(async value => {
      calls.push(value);
      if (calls.length === 1) { const error = Error('definitive rejection'); error.code = `functions/${code}`; throw error; }
      return { id: 'new-receipt' };
    }, { makeId: () => `operation-${calls.length}` });
    operations.bindPersistence({ storage, uid: 'user', threadId: input.entryId });
    await assert.rejects(operations.submit(input), /definitive rejection/);
    assert.equal(operations.pending(), null, code);
    assert.equal(operations.running(), false, code);
    assert.equal(storage.entries.size, 0, code);
    await operations.submit(input);
    assert.equal(calls.length, 2, code);
    assert.notEqual(calls[0].operationId, calls[1].operationId, code);
  }
});

test('unavailable or unverifiable session storage prevents a money commit', () => {
  let calls = 0;
  const input = request('sink'), withoutStorage = submission(async () => { calls++; });
  assert.throws(() => withoutStorage.submit(input), /storage unavailable/);
  assert.equal(withoutStorage.pending(), null);
  for (const storage of [
    { getItem: () => null, setItem() { throw Error('blocked'); }, removeItem() {} },
    { getItem: () => null, setItem() {}, removeItem() {} }
  ]) {
    const operations = submission(async () => { calls++; });
    operations.bindPersistence({ storage, uid: 'user', threadId: input.entryId });
    assert.throws(() => operations.submit(input), /storage unavailable/);
    assert.equal(operations.pending(), null);
  }
  assert.equal(calls, 0);
});

test('malformed or cross-thread saved requests never reach the money commit', () => {
  const input = { ...request('sink'), operationId: 'saved-operation' };
  let calls = 0;
  for (const malformed of [
    '{broken', JSON.stringify({ schemaVersion: 2, request: input }),
    JSON.stringify({ schemaVersion: 1, request: { ...input, entryId: 'inn::session:other' } }),
    JSON.stringify({ schemaVersion: 1, request: { ...input, expectedRevisions: {} } })
  ]) {
    const operations = submission(async () => { calls++; });
    const storage = { getItem: () => malformed, setItem() {}, removeItem() {} };
    assert.throws(() => operations.bindPersistence({ storage, uid: 'user', threadId: input.entryId }), /storage unavailable/);
  }
  assert.equal(calls, 0);
});
