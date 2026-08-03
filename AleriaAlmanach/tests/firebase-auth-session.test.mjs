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
    onIdTokenChanged(_auth, next) { listener = next; },
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
