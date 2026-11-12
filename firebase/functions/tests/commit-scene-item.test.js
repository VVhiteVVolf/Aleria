import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { placeSceneItem } from '../src/mechanics/commit-scene-item.js';
import { database } from './fixtures/combat-transaction-database.js';

const auth = { uid: 'editor', token: { aleriaRole: 'editor' } };
const sceneDate = { year: 1740, month: 3, day: 9 };
const inputFor = (sceneStartDateAleria = sceneDate) => ({ entryId: 'scene', operationId: 'scene-date-item-001', sceneStartDateAleria,
  commentSegments: [{ kind: 'sceneitem', sceneItemDraft: {
    name: 'Heiltrank', description: 'Eine kleine Flasche liegt im Gras.', category: 'potions'
  } }]
});

test('scene-item transactions retain a validated scene start date and identical retries preserve the receipt', async () => {
  const db = database({});
  const input = inputFor();
  const result = await placeSceneItem({ database: db, auth, input, now: 100 });
  const saved = db.data.get(`comments/${result.id}`);
  assert.deepEqual(saved.sceneStartDateAleria, sceneDate);
  assert.equal(saved.commentSegments[0].sceneItemEvent.operation, 'place');
  const before = structuredClone([...db.data]);
  const retry = await placeSceneItem({ database: db, auth, input: structuredClone(input), now: 200 });
  assert.equal(retry.id, result.id);
  assert.deepEqual([...db.data], before);
  const changedDateRetry = await placeSceneItem({ database: db, auth, input: inputFor({ ...sceneDate, day: 10 }) });
  assert.equal(changedDateRetry.id, result.id);
  assert.deepEqual(db.data.get(`comments/${result.id}`).sceneStartDateAleria, sceneDate);
  assert.deepEqual([...db.data], before);
});

test('missing and malformed optional scene-item dates are stored as null', async () => {
  for (const date of [null, { year: 1740, month: 3, day: 37 }]) {
    const db = database({});
    const input = inputFor(date);
    if (date === null) delete input.sceneStartDateAleria;
    const saved = await placeSceneItem({ database: db, auth, input, now: 100 });
    assert.equal(db.data.get(`comments/${saved.id}`).sceneStartDateAleria, null);
  }
});

test('unversioned scene-item receipts retain their original replay contract without historical rewrites', async () => {
  const db = database({});
  const input = inputFor();
  delete input.sceneStartDateAleria;
  const result = await placeSceneItem({ database: db, auth, input, now: 100 });
  const saved = db.data.get(`comments/${result.id}`);
  delete saved.sceneStartDateAleria;
  saved.sceneItemFingerprint = createHash('sha256').update(JSON.stringify({ entryId: input.entryId, segments: input.commentSegments })).digest('hex');
  const before = structuredClone([...db.data]);
  const retry = await placeSceneItem({ database: db, auth, input: { ...input, sceneStartDateAleria: sceneDate }, now: 200 });
  assert.equal(retry.id, result.id);
  assert.deepEqual([...db.data], before);
  await assert.rejects(placeSceneItem({ database: db, auth, input: { ...input,
    commentSegments: [{ kind: 'sceneitem', sceneItemDraft: { ...input.commentSegments[0].sceneItemDraft, name: 'Anderer Trank' } }]
  } }), /anderem Inhalt/);
});

test('the legacy single-item API keeps calendar metadata out of operation identity', async () => {
  const db = database({});
  const input = { entryId: 'scene', operationId: 'legacy-scene-item-001',
    name: 'Heiltrank', description: 'Eine kleine Flasche liegt im Gras.', category: 'potions',
    sceneStartDateAleria: sceneDate
  };
  const result = await placeSceneItem({ database: db, auth, input, now: 100 });
  const before = structuredClone([...db.data]);
  const retry = await placeSceneItem({ database: db, auth, input: { ...input, sceneStartDateAleria: { ...sceneDate, day: 10 } }, now: 200 });
  assert.equal(retry.id, result.id);
  assert.deepEqual([...db.data], before);
  assert.deepEqual(db.data.get(`comments/${result.id}`).sceneStartDateAleria, sceneDate);
});
