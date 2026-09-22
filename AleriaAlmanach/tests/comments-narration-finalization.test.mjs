import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { finalizeCommittedCommentNarration } from '../modules/comments/comments-narration-finalization.js';

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

// Exercise the actual Firebase facade without loading the browser Firebase SDK.
const firebaseSource = readFileSync(new URL('../firebase.js', import.meta.url), 'utf8');
function createBackend(context) {
  const start = firebaseSource.indexOf('      async addCombatComment(');
  const end = firebaseSource.indexOf('      async addSceneTransition(', start);
  return vm.runInNewContext(`({${firebaseSource.slice(start, end)}})`, {
    requireFirebaseUser: async () => {},
    hashDeleteCode: async () => 'hash',
    cloneSerializableValue: value => value,
    compactMechanicalMetadata: value => value,
    normalizeCommentModuleInsertForFirestore: value => value,
    finalizeCommittedCommentNarration,
    console: { warn() {} },
    notifyAppStatus() {},
    ...context
  });
}

for (const kind of ['Combat', 'Skill']) {
  test(`${kind}: committed post is returned before narration, then finalized once`, async () => {
    const narration = deferred();
    const started = deferred();
    const finished = deferred();
    const committed = { id: 'post-1', mechanics: { commentSegments: [{ confirmed: true }] }, profileUpdates: [] };
    let commits = 0;
    let finalizations = 0;
    const backend = createBackend({
      [`commit${kind}CommentCallable`]: async () => { commits++; return { data: committed }; },
      window: {
        [`Aleria${kind === 'Skill' ? 'SkillChecks' : kind}`]: {
          narrateCommittedMechanics(mechanics) {
            assert.equal(mechanics, committed.mechanics);
            started.resolve();
            return narration.promise;
          }
        }
      },
      finalizeCombatNarrationCallable: async payload => {
        finalizations++;
        assert.equal(payload.commentId, 'post-1');
        assert.deepEqual(payload.narrations, [{ resolutionId: 'confirmed-roll', narration: { text: 'Treffer.' } }]);
        finished.resolve();
      }
    });
    const saved = await backend[`add${kind}Comment`]('thread', 'Actor', '', null, 'Attack', 'code', false);
    assert.equal(saved, committed);
    assert.equal(finalizations, 0);
    await started.promise;
    narration.resolve([{ resolutionId: 'confirmed-roll', narration: { text: 'Treffer.' } }]);
    await finished.promise;
    assert.equal(commits, 1);
    assert.equal(finalizations, 1);
  });
}

test('failed mechanical commit never starts narration', async () => {
  let narrations = 0;
  const backend = createBackend({
    commitCombatCommentCallable: async () => { throw new Error('conflict'); },
    window: { AleriaCombat: { narrateCommittedMechanics() { narrations++; } } }
  });
  await assert.rejects(backend.addCombatComment('thread'), /conflict/);
  assert.equal(narrations, 0);
});

test('failed prose write reports separately and never retries the committed attack', async () => {
  const notified = deferred();
  let commits = 0;
  const backend = createBackend({
    commitCombatCommentCallable: async () => { commits++; return { data: { id: 'post' } }; },
    window: { AleriaCombat: { narrateCommittedMechanics: async () => [{ resolutionId: 'roll' }] } },
    finalizeCombatNarrationCallable: async () => { throw new Error('offline'); },
    notifyAppStatus: message => notified.resolve(message)
  });
  assert.equal((await backend.addCombatComment('thread')).id, 'post');
  assert.match(await notified.promise, /sicher gespeichert/);
  assert.equal(commits, 1);
});

test('no narrations means no additional Firebase write', async () => {
  await finalizeCommittedCommentNarration({
    committed: { id: 'post' },
    narrators: [async () => []],
    finalize: () => assert.fail('Unexpected write')
  });
});
