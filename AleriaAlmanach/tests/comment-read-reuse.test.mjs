import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

test('saving into a live thread reuses the subscription and errors allow a new subscription', async () => {
  let subscriptions = 0, listener, errorListener;
  const scroll = { dataset: {} };
  const backend = { subscribeComments(_thread, next, error) { subscriptions++; listener = next; errorListener = error; return () => {}; } };
  const context = vm.createContext({ window: {}, document: { dispatchEvent() {} }, console, CustomEvent: class {}, getCommentBackend: async () => backend,
    loadCommentTurnIntoPage() {}, stopCommentTurnUpdates() {}, renderCommentsToScroll() {}, setCommentPageTarget() {}, showCommentFallbackNotice() {}, getLocalCommentBackend: () => ({ loadComments: async () => [] }) });
  vm.runInContext(await readFile(new URL('../modules/comments/comments-thread.js', import.meta.url), 'utf8'), context);
  context.getCommentsScrollForThread = () => scroll;
  context.renderCommentsToScroll = () => {};
  context.announceCommentThreadUpdate = () => {};
  await context.loadCommentsIntoPage('thread');
  listener([{ id: 'one', text: 'original' }]);
  await context.loadCommentsIntoPage('thread', true);
  assert.equal(subscriptions, 1);
  listener([{ id: 'one', text: 'updated' }]);
  assert.equal(vm.runInContext('_commentCache.thread[0].text', context), 'updated');
  await errorListener(new Error('listener stopped'));
  await context.loadCommentsIntoPage('thread', true);
  assert.equal(subscriptions, 2);
});

test('speaker profiles share concurrent reads, retain full history if activity is unchanged and honor forced refresh', async () => {
  let time = 100000, revision = 1, reads = 0;
  const context = vm.createContext({ console, Date: { now: () => time }, getCommentBackend: async () => ({
    loadAllComments: async () => { reads++; return [{ id: 'one', text: 'complete unshortened history' }]; },
    loadCommentActivity: async () => [{ threadId: 'scene', commentCount: 1, capturedAt: { seconds: revision, nanoseconds: 0 } }]
  }) });
  vm.runInContext(await readFile(new URL('../modules/speaker-profile/speaker-profile-stats.js', import.meta.url), 'utf8'), context);
  await Promise.all([context.loadSpeakerProfileComments(), context.loadSpeakerProfileComments()]);
  assert.equal(reads, 1);
  time += 61000;
  assert.equal((await context.loadSpeakerProfileComments())[0].text, 'complete unshortened history');
  assert.equal(reads, 1);
  revision++; time += 61000;
  await context.loadSpeakerProfileComments();
  assert.equal(reads, 2);
  await context.loadSpeakerProfileComments(true);
  assert.equal(reads, 3);
});
