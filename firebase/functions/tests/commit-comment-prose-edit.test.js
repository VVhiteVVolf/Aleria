import assert from 'node:assert/strict';
import test from 'node:test';
import { commitCommentProseEditOperation } from '../src/comments/commit-comment-prose-edit.js';

function fixture(comment, { edit = { index: 0, beforeText: 'Original', text: 'Korrigiert' } } = {}) {
  const writes = [];
  const ref = {};
  const database = {
    collection(name) {
      assert.equal(name, 'comments');
      return { doc: id => { assert.equal(id, 'example'); return ref; } };
    },
    runTransaction(apply) {
      return apply({
        get(record) {
          assert.equal(record, ref);
          return { exists: true, data: () => comment };
        },
        update(record, updates) {
          assert.equal(record, ref);
          writes.push(updates);
        }
      });
    }
  };
  const request = {
    auth: { uid: 'patrick', token: { aleriaRole: 'player' } },
    data: { commentId: 'example', entryId: 'scene', edits: [edit] }
  };
  return { writes, request, run: () => commitCommentProseEditOperation(request, { database, now: 100 }) };
}

test('Patrick can edit another creator’s prose while receipts and authorship are preserved', async () => {
  const source = { text: 'Original', durationSeconds: 5, combatResolution: { resolutionId: 'roll', damage: 7 } };
  const second = { text: 'Weitere Handlung', durationSeconds: 35, characterId: 'original' };
  const { run, writes } = fixture({
    entryId: 'scene', createdBy: 'different-user', characterId: 'original',
    serverValidatedMechanics: true, commentMode: 'character',
    text: 'Original\n\nWeitere Handlung', commentSegments: [source, second]
  });
  assert.deepEqual(await run(), { id: 'example', edited: true });
  assert.deepEqual(writes[0].commentSegments, [{ ...source, text: 'Korrigiert' }, second]);
  assert.equal(writes[0].text, 'Korrigiert\n\nWeitere Handlung');
  assert.equal(writes[0].activityAtClient, 100);
  assert.deepEqual(Object.keys(writes[0]).sort(), ['activityAt', 'activityAtClient', 'commentSegments', 'text', 'updatedAt', 'updatedAtClient']);
});

test('legacy nonsegmented comments support text corrections without a creator field', async () => {
  const { run, writes } = fixture({ entryId: 'scene', text: 'Original' });
  await run();
  assert.equal(writes[0].text, 'Korrigiert');
  assert.equal(Object.hasOwn(writes[0], 'commentSegments'), false);
});

test('adjusting a twin split keeps both speakers, modes, and the section duration', async () => {
  const twinDialogue = { version: 1, leftLength: 'Links'.length, left: { characterId: 'first', kind: 'thought' },
    right: { characterId: 'second', kind: 'speech' } };
  const source = { text: 'Links\n\nRechts', durationSeconds: 20, twinDialogue };
  const { run, writes } = fixture({ entryId: 'scene', commentMode: 'character', commentSegments: [source] }, {
    edit: { index: 0, beforeText: source.text, beforeLeftLength: 5, text: 'Rechts', leftLength: 0 }
  });
  await run();
  assert.deepEqual(writes[0].commentSegments[0], { ...source, text: 'Rechts', twinDialogue: { ...twinDialogue, leftLength: 0 } });
});

test('a concurrent rewrite, a missing login, or a mismatched scene causes no write', async () => {
  const { run, request, writes } = fixture({ entryId: 'scene', text: 'Inzwischen geändert' });
  await assert.rejects(run, { code: 'aborted' });
  request.auth = null;
  await assert.rejects(run, { code: 'unauthenticated' });
  request.auth = { uid: 'patrick' };
  request.data.entryId = 'wrong-scene';
  await assert.rejects(run, { code: 'failed-precondition' });
  assert.deepEqual(writes, []);
});

test('system receipts cannot be edited as prose', async () => {
  const { run, writes } = fixture({ entryId: 'scene', commentMode: 'scene-dice', text: 'Original', sceneDiceRoll: {} });
  await assert.rejects(run, { code: 'failed-precondition' });
  assert.deepEqual(writes, []);
});
