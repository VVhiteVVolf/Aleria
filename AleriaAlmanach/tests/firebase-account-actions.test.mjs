import assert from 'node:assert/strict';
import test from 'node:test';
import { createFirebaseAccountActions, accountErrorMessage } from '../modules/auth/firebase-account-actions.js';
import { prepareAccountProfile } from '../modules/auth/account-avatar-catalog.js';

function fixture() {
  const browserUser = { uid: 'existing-editor', isAnonymous: true, role: 'editor', getIdToken: async () => 'test-only-token' };
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
    sendEmailVerification: async user => { calls.push(['verify', user.uid]); },
    setPersistence: async (_auth, persistence) => { assert.equal(persistence, 'local'); },
    browserLocalPersistence: 'local',
    updateProfile: async (user, profile) => { calls.push(['profile', profile]); Object.assign(user, profile); },
    reload: async () => {}
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
  await assert.rejects(actions.verifyEmail(), /zuerst/);
  await actions.secureBrowserAccess('editor@example.test', 'test-only');
  await actions.verifyEmail();
  assert.deepEqual(calls, [['reset', 'person@example.test'], ['link', 'existing-editor', 'editor@example.test'], ['verify', 'existing-editor']]);
  assert.equal(accountErrorMessage({ code: 'auth/invalid-credential', message: 'internal detail' }), 'E-Mail oder Passwort stimmen nicht.');
});

test('display name and allowlisted avatar belong to the Auth profile, never to roles or game characters', async () => {
  const { actions, auth, calls } = fixture();
  const before = auth.currentUser;
  await actions.secureBrowserAccess('editor@example.test', 'test-only', { displayName: '  Meine   Gilde  ', avatarId: 'fenrir' });
  assert.equal(auth.currentUser, before);
  assert.equal(auth.currentUser.displayName, 'Meine Gilde');
  assert.match(auth.currentUser.photoURL, /\/account\/fenrir-v1\.webp$/);
  assert.equal(auth.currentUser.role, 'editor');
  assert.equal(calls.some(call => call[0] === 'verify'), false);
  await actions.saveAccountProfile({ displayName: 'Patrick', avatarId: 'freya' });
  assert.equal(auth.currentUser.uid, 'existing-editor');
  assert.equal(auth.currentUser.role, 'editor');
  assert.equal(auth.currentUser.displayName, 'Patrick');
});

test('invalid names and external avatars are rejected before the existing browser identity changes', async () => {
  const { actions, auth, calls } = fixture();
  await assert.rejects(actions.secureBrowserAccess('editor@example.test', 'test-only', { displayName: '<script>', avatarId: 'gawain' }), /Abenteurername/);
  await assert.rejects(actions.secureBrowserAccess('editor@example.test', 'test-only', { displayName: 'Ok', avatarId: 'https://external.test/image' }), /vier/);
  assert.equal(auth.currentUser.isAnonymous, true);
  assert.deepEqual(calls, []);
  assert.equal(prepareAccountProfile({ displayName: '', avatarId: 'gawain' }).displayName, '');
  assert.equal(new URL(prepareAccountProfile({ displayName: 'Lokal', avatarId: 'freya' }, 'null').photoURL).origin, 'https://dieweltvonaleria.netlify.app');
});
