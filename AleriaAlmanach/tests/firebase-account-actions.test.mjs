import assert from 'node:assert/strict';
import test from 'node:test';
import { createFirebaseAccountActions, accountErrorMessage } from '../modules/auth/firebase-account-actions.js';

function fixture() {
  const browserUser = { uid: 'existing-editor', isAnonymous: true, role: 'editor' };
  const auth = { currentUser: browserUser };
  const session = { start: async () => {}, requireUser: async () => auth.currentUser, refresh: async () => {}, getAccess: () => ({ uid: auth.currentUser.uid, role: auth.currentUser.role }) };
  const calls = [];
  const actions = createFirebaseAccountActions({ auth, session,
    EmailAuthProvider: { credential: (email, password) => ({ email, password }) },
    linkWithCredential: async (user, credential) => { calls.push(['link', user.uid, credential.email]); user.isAnonymous = false; return { user }; },
    signInWithEmailAndPassword: async () => { auth.currentUser = { uid: 'other-account', isAnonymous: false, role: 'player' }; },
    signOut: async () => { auth.currentUser = null; },
    signInAnonymously: async () => { auth.currentUser = { uid: 'new-browser', isAnonymous: true, role: 'player' }; },
    sendPasswordResetEmail: async (_auth, email) => { calls.push(['reset', email]); },
    sendEmailVerification: async user => { calls.push(['verify', user.uid]); }
  });
  return { actions, calls, auth };
}

test('account linking preserves the existing UID and editor role; no password is retained', async () => {
  const { actions, calls } = fixture();
  assert.deepEqual(await actions.secureBrowserAccess(' editor@example.test ', 'test-only'), { uid: 'existing-editor', role: 'editor' });
  assert.deepEqual(calls, [['link', 'existing-editor', 'editor@example.test']]);
  await assert.rejects(actions.secureBrowserAccess('other@example.test', 'test-only'), /bereits/);
});
test('login uses the existing account rights and logout restores anonymous commenting', async () => {
  const { actions } = fixture();
  assert.deepEqual(await actions.login('player@example.test', 'test-only'), { uid: 'other-account', role: 'player' });
  assert.deepEqual(await actions.logout(), { uid: 'new-browser', role: 'player' });
  await assert.rejects(actions.logout(), /zuerst/);
});
test('only explicit account operations request email; credential errors do not expose server messages', async () => {
  const { actions, calls } = fixture();
  assert.deepEqual(calls, []);
  await actions.resetPassword(' person@example.test ');
  await actions.verifyEmail();
  assert.deepEqual(calls, [['reset', 'person@example.test'], ['verify', 'existing-editor']]);
  assert.equal(accountErrorMessage({ code: 'auth/invalid-credential', message: 'internal detail' }), 'E-Mail oder Passwort stimmen nicht.');
});
