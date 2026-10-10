import assert from 'node:assert/strict';
import test from 'node:test';
import { createFirebaseAuthSession, normalizeAleriaRole } from '../modules/auth/firebase-auth-session.js';

test('unbekannte Claims erhalten nur Spielerrechte', () => {
  assert.equal(normalizeAleriaRole({}), 'player');
  assert.equal(normalizeAleriaRole({ aleriaRole: 'root' }), 'player');
  assert.equal(normalizeAleriaRole({ aleriaRole: 'Moderator' }), 'moderator');
});

test('anonyme Sitzungen werden aufgebaut, ohne Zugangsdaten offenzulegen', async () => {
  const user = {
    uid: 'anonymous-1',
    async getIdTokenResult() { return { claims: {} }; },
    async getIdToken(forceRefresh) { return forceRefresh ? 'fresh-token' : 'cached-token'; }
  };
  let listener;
  const session = createFirebaseAuthSession({
    auth: { currentUser: null },
    onIdTokenChanged(_auth, next) { listener = next; queueMicrotask(() => next(null)); },
    async signInAnonymously() {
      queueMicrotask(() => listener(user));
      return { user };
    }
  });
  assert.equal((await session.requireUser()).uid, 'anonymous-1');
  assert.deepEqual(session.getAccess(), {
    ready: true,
    uid: 'anonymous-1',
    role: 'player',
    authenticated: true,
    canEditSharedContent: false,
    canModerate: false
  });
  assert.equal(await session.getIdToken(), 'cached-token');
  assert.equal(await session.getIdToken(true), 'fresh-token');
});

test('initial null waits for anonymous authentication before permitting writes', async () => {
  let listener, completeSignIn;
  const user = { uid: 'anonymous-after-restore', getIdTokenResult: async () => ({ claims: {} }) };
  const session = createFirebaseAuthSession({
    auth: { currentUser: null },
    onIdTokenChanged(_auth, next) { listener = next; queueMicrotask(() => next(null)); },
    signInAnonymously: () => new Promise(resolve => { completeSignIn = resolve; })
  });
  let ready = false;
  const pending = session.requireUser().then(value => { ready = true; return value; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(ready, false);
  assert.equal(session.getAccess().ready, false);
  listener(null);
  completeSignIn({ user });
  assert.equal(await pending, user);
  assert.equal(await session.requireUser(), user);
});

test('restored persisted users keep their identity and role without anonymous sign-in', async () => {
  let listener;
  const restored = { uid: 'persisted-editor', getIdTokenResult: async () => ({ claims: { aleriaRole: 'editor' } }) };
  const replacement = { uid: 'replacement', getIdTokenResult: async () => ({ claims: {} }) };
  const session = createFirebaseAuthSession({
    auth: { currentUser: null },
    onIdTokenChanged(_auth, next) { listener = next; queueMicrotask(() => next(restored)); },
    signInAnonymously() { throw new Error('Must not replace a restored session'); }
  });
  assert.equal(await session.requireUser(), restored);
  assert.equal(session.getAccess().role, 'editor');
  listener(replacement);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(await session.requireUser(), replacement);
  listener(null);
  await assert.rejects(session.requireUser(), /Anmeldung erforderlich/);
});

test('authentication failures reject readiness and writes', async () => {
  const session = createFirebaseAuthSession({
    auth: {},
    onIdTokenChanged(_auth, next) { queueMicrotask(() => next(null)); },
    signInAnonymously: async () => { throw new Error('auth/network-request-failed'); }
  });
  await assert.rejects(session.requireUser(), /network-request-failed/);
  assert.equal(session.getAccess().authenticated, false);
});
