import assert from 'node:assert/strict';
import test from 'node:test';
import { regenerateSceneParticipants } from '../modules/scene-regeneration/scene-regeneration-service.js';

const candidate = (actorId, persistence) => ({ actorId, name: actorId, profile: { persistence } });

async function withGlobals(values, run) {
  const originals = new Map(Object.keys(values).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  try {
    for (const [key, value] of Object.entries(values)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    return await run();
  } finally {
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

test('regeneration sends only the selected persistent actors and distinguishes creature instances', async () => {
  const requests = [];
  const actors = [
    candidate('gawain', { kind: 'character', recordId: 'gawain' }),
    candidate('freki', { kind: 'creature', recordId: 'freki' }),
    candidate('wolf-instance-2', { kind: 'scene-creature', actorId: 'wolf-instance-2', sourceCreatureId: 'wolf-template' })
  ];
  const comments = [{ id: 'gildas-post', characterId: 'gildas' }, { id: 'latest-silent-receipt', sceneRegeneration: {} }];
  const originalActors = structuredClone(actors);
  const originalComments = structuredClone(comments);
  await withGlobals({
    getCommentBackend: async options => {
      assert.deepEqual(options, { timeoutMs: 1200 });
      return { regenerateSceneParticipants: async request => { requests.push(request); return { id: 'receipt' }; } };
    }
  }, async () => {
    await regenerateSceneParticipants('session:training', actors, comments);
  });
  assert.deepEqual(requests, [{ entryId: 'session:training', expectedLastCommentId: 'latest-silent-receipt', participants: [
    { actorId: 'gawain', kind: 'character', recordId: 'gawain' },
    { actorId: 'freki', kind: 'creature', recordId: 'freki' },
    { actorId: 'wolf-instance-2', kind: 'creature', recordId: 'wolf-template' }
  ] }]);
  assert.ok(!requests[0].participants.some(participant => participant.actorId === 'gildas'));
  assert.deepEqual(actors, originalActors);
  assert.deepEqual(comments, originalComments);
});

test('successful recovery dispatches profile updates without publishing, scrolling or notifying', async () => {
  const dispatched = [];
  const forbiddenCalls = [];
  const result = { id: 'quiet-receipt', profileUpdates: [{ kind: 'character', recordId: 'gawain', hitPoints: { current: 39 } }] };
  const never = name => () => forbiddenCalls.push(name);
  await withGlobals({
    document: { dispatchEvent: event => { dispatched.push(event); } },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    getCommentBackend: async () => ({
      regenerateSceneParticipants: async () => result,
      addComment: never('comment'), addSceneRest: never('rest')
    }),
    showAppStatus: never('toast'), loadSidebarFeed: never('feed'),
    requestCommentAutoScroll: never('scroll'), loadCommentsIntoPage: never('comments')
  }, async () => {
    assert.equal(await regenerateSceneParticipants('session:training', [candidate('gawain', { kind: 'character', recordId: 'gawain' })]), result);
  });
  assert.deepEqual(dispatched.map(event => ({ type: event.type, detail: event.detail })), [{
    type: 'aleria:combat-profile-committed', detail: { updates: result.profileUpdates }
  }]);
  assert.deepEqual(forbiddenCalls, []);
});

test('empty selections and unsupported profile sources fail before accessing the backend', async () => {
  let backendCalls = 0;
  await withGlobals({ getCommentBackend: async () => { backendCalls++; } }, async () => {
    await assert.rejects(regenerateSceneParticipants('session:training', []), /mindestens eine Figur/);
    for (const persistence of [{}, { kind: 'draft', recordId: 'gawain' }, { kind: 'scene-creature', recordId: 'wolf' }]) {
      await assert.rejects(regenerateSceneParticipants('session:training', [candidate('gawain', persistence)]), /Profilquelle/);
    }
  });
  assert.equal(backendCalls, 0);
});

test('offline backends cannot regenerate and rejected commits do not dispatch profile changes', async () => {
  const dispatched = [];
  const selected = [candidate('gawain', { kind: 'character', recordId: 'gawain' })];
  for (const backend of [undefined, { _localFallback: true, addSceneRest() { throw Error('must not run'); } }]) {
    await withGlobals({ getCommentBackend: async () => backend }, async () => {
      await assert.rejects(regenerateSceneParticipants('session:training', selected), /Online-Verbindung/);
    });
  }
  await withGlobals({
    document: { dispatchEvent: event => dispatched.push(event) },
    getCommentBackend: async () => ({ regenerateSceneParticipants: async request => {
      assert.equal(request.expectedLastCommentId, '');
      throw Error('Die Szene hat sich verändert.');
    } })
  }, async () => {
    await assert.rejects(regenerateSceneParticipants('session:training', selected), /Szene hat sich verändert/);
  });
  assert.deepEqual(dispatched, []);
});
