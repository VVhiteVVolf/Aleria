import test from 'node:test';
import assert from 'node:assert/strict';
import { assertSnapshotPersonIdentity } from '../tools/publish-family-snapshots.mjs';

const prior = { id: 'daughter', worldPersonId: 'person--family--daughter', birth: '1732', death: '', houseId: 'house-family' };
const correction = { familyId: 'family', personId: prior.id, worldPersonId: prior.worldPersonId,
  field: 'birth', from: '1732', to: '1730', reason: 'Explicit age correction by the author.' };

test('snapshot publication allows only an exact reviewed life-date correction and remains idempotent', () => {
  const updated = { ...prior, birth: '1730' };
  assert.throws(() => assertSnapshotPersonIdentity('family', prior, updated));
  assert.deepEqual(assertSnapshotPersonIdentity('family', prior, updated, [correction]), [correction]);
  assert.deepEqual(assertSnapshotPersonIdentity('family', updated, updated, [correction]), []);
  for (const patch of [{ familyId: 'other' }, { worldPersonId: 'another-person' }, { from: '1731' }, { to: '1729' }, { reason: '' }]) {
    assert.throws(() => assertSnapshotPersonIdentity('family', prior, updated, [{ ...correction, ...patch }]));
  }
});

test('life-date authorization cannot replace person IDs, world identities or house membership', () => {
  for (const field of ['id', 'worldPersonId', 'houseId']) {
    assert.throws(() => assertSnapshotPersonIdentity('family', prior, { ...prior, [field]: 'replacement' },
      [{ ...correction, field, from: prior[field], to: 'replacement' }]));
  }
});
