import assert from 'node:assert/strict';
import test from 'node:test';
import { refreshCommentThreadActivity, activityDocumentId } from '../src/comments/comment-activity-index.js';

test('derived summaries follow edits/deletions and reject a late older snapshot without touching comments', async () => {
  let seconds = 2;
  let comments = [{ id: 'one', entryId: 'scene::session:main', text: 'original', createdAtClient: 1 }];
  const stored = new Map();
  const writes = [];
  const database = {
    collection(name) {
      if (name === 'comments') return { where: (_field, _operator, thread) => ({ select: (...fields) => ({ get: async () => ({ docs: comments.filter(comment => comment.entryId === thread).map(comment => ({ id: comment.id, data: () => Object.fromEntries(fields.filter(field => Object.hasOwn(comment, field)).map(field => [field, comment[field]])) })), readTime: { seconds, nanoseconds: 0 } }) }) }) };
      assert.equal(name, 'comment_activity');
      return { doc: id => id };
    },
    runTransaction: callback => callback({ get: async ref => ({ data: () => stored.get(ref) }), set: (ref, value) => { writes.push(ref); stored.set(ref, value); } })
  };
  const thread = 'scene::session:main';
  await refreshCommentThreadActivity(thread, database);
  const ref = activityDocumentId(thread);
  assert.equal(stored.get(ref).commentCount, 1);
  seconds = 3; comments[0] = { ...comments[0], text: 'edited' };
  await refreshCommentThreadActivity(thread, database);
  assert.equal(stored.get(ref).recentComments[0].text, 'edited');
  seconds = 1; comments[0] = { ...comments[0], text: 'late original' };
  await refreshCommentThreadActivity(thread, database);
  assert.equal(stored.get(ref).recentComments[0].text, 'edited');
  seconds = 4; comments.push({ id: 'quiet-reset', entryId: thread, createdAtClient: 5,
    commentKind: 'scene-regeneration-event', serverValidatedMechanics: true,
    sceneRegeneration: { participants: [{ actorId: 'gawain' }] } });
  await refreshCommentThreadActivity(thread, database);
  assert.equal(stored.get(ref).commentCount, 1);
  assert.deepEqual(stored.get(ref).recentComments.map(comment => comment.id), ['one']);
  seconds = 5; comments = [];
  await refreshCommentThreadActivity(thread, database);
  assert.equal(stored.get(ref).commentCount, 0);
  assert.deepEqual(stored.get(ref).recentComments, []);
  assert.equal(writes.length, 4);
});
