import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCommentThreadActivity } from '../modules/comments/comment-activity-preview.js';
import { createCommentActivityRepository } from '../modules/comments/comment-activity-repository.js';

test('activity previews retain ordering and the latest visible speaker while excluding mechanics and private fields', () => {
  const source = [{ id: 'old', entryId: 'scene', text: 'alt', ts: { seconds: 10 } }, { id: 'new', entryId: 'scene', text: 'neu', ts: { seconds: 5 }, updatedAt: '2026-10-12T00:00:00Z', deleteCode: 'secret', combatResolution: { damage: 10 }, commentSegments: [{ charName: 'A', text: 'eins' }, { charName: 'B', text: 'zwei' }] }];
  const original = structuredClone(source);
  const summary = buildCommentThreadActivity('scene', source);
  assert.equal(summary.commentCount, 2);
  assert.equal(summary.recentComments[0].id, 'new');
  assert.equal(summary.recentComments[0].commentSegments[0].charName, 'B');
  assert(!Object.hasOwn(summary.recentComments[0], 'combatResolution'));
  assert(!Object.hasOwn(summary.recentComments[0], 'deleteCode'));
  assert.deepEqual(source, original);
});

test('dashboard and sidebar share one read, live changes appear immediately and stale overlays expire', async () => {
  let clock = 0, reads = 0;
  const thread = buildCommentThreadActivity('scene', [{ id: 'a', entryId: 'scene', text: 'a', orderKey: 1 }]);
  const repository = createCommentActivityRepository({ now: () => clock, readState: async () => ({ ready: true }), readThreads: async () => { reads++; return [thread]; } });
  await Promise.all([repository.load(), repository.recent(12), repository.load()]);
  assert.equal(reads, 1);
  repository.update('scene', [{ id: 'b', entryId: 'scene', orderKey: 2 }]);
  assert.equal((await repository.recent(12))[0].id, 'b');
  clock = 11000;
  assert.equal((await repository.recent(12))[0].id, 'a');
  assert.equal(reads, 2);
  clock = 31000; await repository.load(); assert.equal(reads, 3);
});

test('an uninitialized index and oversized recent requests retain the full-history fallback', async () => {
  let reads = 0;
  const repository = createCommentActivityRepository({ readState: async () => null, readThreads: async () => { reads++; return []; } });
  assert.equal(await repository.load(), null);
  assert.equal(await repository.recent(31), null);
  assert.equal(reads, 0);
});

test('dashboard and sidebar deduplicate the complete legacy fallback while retaining exact counts and activity ordering', async () => {
  let reads = 0, clock = 100;
  const source = Array.from({ length: 50 }, (_, index) => ({ id: `comment-${index}`, entryId: 'scene', text: `Comment ${index}`,
    createdAtClient: index, combatResolution: { privatePayload: true } }));
  source.push({ id: 'other', entryId: 'second-scene', text: 'Newer', activityAtClient: 200 });
  const original = structuredClone(source);
  const repository = createCommentActivityRepository({ now: () => clock, readState: async () => ({ ready: false }), readThreads: async () => [],
    readAll: async () => { reads++; return structuredClone(source); } });
  const [threads, recent] = await Promise.all([repository.overview(), repository.recent(12), repository.overview()]);
  assert.equal(reads, 1);
  assert.equal(threads.find(thread => thread.threadId === 'scene').commentCount, 50);
  assert.equal(threads.find(thread => thread.threadId === 'scene').recentComments.length, 30);
  assert.equal(recent[0].id, 'other');
  assert.ok(recent.every(comment => !Object.hasOwn(comment, 'combatResolution')));
  assert.deepEqual(source, original);
  await repository.overview(); assert.equal(reads, 1);
  clock += 31000; await repository.overview(); assert.equal(reads, 2);
});

test('failed legacy fallback reads can retry and confirmed thread changes invalidate their cache', async () => {
  let reads = 0, fail = true;
  const repository = createCommentActivityRepository({ readState: async () => { throw Error('Index temporarily unavailable'); }, readThreads: async () => [],
    readAll: async () => { reads++; if (fail) throw Error('Network unavailable'); return [{ id: 'old', entryId: 'scene', text: 'old' }]; } });
  await assert.rejects(repository.overview(), /Network unavailable/);
  fail = false;
  assert.equal((await repository.recent(12))[0].id, 'old');
  assert.equal(reads, 2);
  repository.update('scene', [{ id: 'new', entryId: 'scene', text: 'new', orderKey: 4 }]);
  assert.equal((await repository.recent(12))[0].id, 'new');
  assert.equal(reads, 3);
});

for (const mode of ['compact', 'fallback']) test(`a ${mode} read spanning a confirmed update cannot cache the older thread beyond its live overlay`, async () => {
  let clock = 0, reads = 0, finish;
  const old = { id: 'old', entryId: 'scene', text: 'Vorher', orderKey: 1 };
  const latest = { id: 'latest', entryId: 'scene', text: 'Bestätigte Änderung', orderKey: 2 };
  const encode = rows => mode === 'compact' ? [buildCommentThreadActivity('scene', rows)] : rows;
  const read = () => {
    reads++;
    return reads === 1 ? new Promise(resolve => { finish = () => resolve(encode([old])); }) : Promise.resolve(encode([latest]));
  };
  const repository = createCommentActivityRepository({ now: () => clock, readState: async () => ({ ready: mode === 'compact' }),
    readThreads: mode === 'compact' ? read : async () => { throw Error('Unavailable compact index must not be read.'); },
    ...(mode === 'fallback' ? { readAll: read } : {}) });
  const initial = repository.overview();
  await new Promise(resolve => setImmediate(resolve));
  repository.update('scene', [latest]);
  finish();
  assert.equal((await initial)[0].recentComments[0].id, 'latest');
  assert.equal(reads, 1);
  clock = 11000;
  const afterOverlay = await repository.recent(12);
  assert.equal(afterOverlay[0].id, 'latest');
  assert.equal(reads, 2, 'The invalidated pending result must be revalidated instead of gaining a new cache lifetime.');
  await repository.overview(); assert.equal(reads, 2, 'The subsequent fresh result remains shared.');
});

test('silent regeneration never appears in activity counts, previews or live overlays', async () => {
  const visible = { id: 'speech', entryId: 'scene', text: 'Weiter geht es.', orderKey: 1 };
  const regeneration = { id: 'reset', entryId: 'scene', orderKey: 2,
    commentKind: 'scene-regeneration-event', serverValidatedMechanics: true,
    sceneRegeneration: { participants: [{ actorId: 'gawain' }] } };
  const summary = buildCommentThreadActivity('scene', [visible, regeneration]);
  assert.equal(summary.commentCount, 1);
  assert.deepEqual(summary.recentComments.map(comment => comment.id), ['speech']);
  const repository = createCommentActivityRepository({ readState: async () => ({ ready: true }), readThreads: async () => [summary] });
  repository.update('scene', [visible, regeneration]);
  assert.deepEqual((await repository.recent(12)).map(comment => comment.id), ['speech']);

  const untrusted = { ...regeneration, id: 'untrusted', serverValidatedMechanics: false };
  const imported = { ...regeneration, id: 'imported', importedHistoricalMechanics: true };
  assert.equal(buildCommentThreadActivity('scene', [untrusted, imported]).commentCount, 2);
});
