import assert from 'node:assert/strict';
import test from 'node:test';
import { database } from './fixtures/combat-transaction-database.js';

for (const operation of ['create', 'set', 'update']) for (const array of [false, true]) {
  test(`transaction fixture rejects nested undefined in ${operation} (${array ? 'array' : 'object'}) before committing`, async () => {
    const db = database({ 'records/existing': { original: true } });
    const before = structuredClone([...db.data]);
    const ref = db.doc(operation === 'create' ? 'records/new' : 'records/existing');
    const value = { payload: array ? [{ missing: undefined }] : { missing: undefined } };
    const path = array ? 'payload[0].missing' : 'payload.missing';
    await assert.rejects(db.runTransaction(transaction => {
      transaction.set(db.doc('records/earlier'), { mustNotCommit: true });
      transaction[operation](ref, value);
    }), error => error instanceof TypeError && error.message.includes(`${ref.path}.${path}`));
    assert.deepEqual([...db.data], before, 'An invalid staged write rolls back the whole transaction.');
  });
}

test('transaction fixture accepts defined nested values and preserves normal create, merge and dot-path update semantics', async () => {
  const db = database({});
  const ref = db.doc('records/valid');
  const payload = { nested: [{ zero: 0, empty: '', disabled: false, absent: null, list: [] }] };
  await db.runTransaction(transaction => transaction.create(ref, { payload }));
  await db.runTransaction(transaction => transaction.set(ref, { retained: true }, { merge: true }));
  await db.runTransaction(transaction => transaction.update(ref, { 'payload.extra': ['ok', null] }));
  assert.deepEqual(db.data.get(ref.path), { payload: { ...payload, extra: ['ok', null] }, retained: true });
});
