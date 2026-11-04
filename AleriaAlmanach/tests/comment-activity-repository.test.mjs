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
  assert.equal(reads, 1);
  clock = 31000; await repository.load(); assert.equal(reads, 2);
});

test('an uninitialized index and oversized recent requests retain the full-history fallback', async () => {
  let reads = 0;
  const repository = createCommentActivityRepository({ readState: async () => null, readThreads: async () => { reads++; return []; } });
  assert.equal(await repository.load(), null);
  assert.equal(await repository.recent(31), null);
  assert.equal(reads, 0);
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
