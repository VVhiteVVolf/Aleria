import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, onIdTokenChanged, signInAnonymously, EmailAuthProvider, linkWithCredential, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { createFirebaseAuthSession } from '../../AleriaAlmanach/modules/auth/firebase-auth-session.js';
import { createFirebaseAccountActions } from '../../AleriaAlmanach/modules/auth/firebase-account-actions.js';

test('real Auth emulator: link keeps UID/claims, logout permits comments and login restores the same editor', async () => {
  const address = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  assert.match(address || '', /^(127\.0\.0\.1|localhost):\d+$/);
  const requireFunctions = createRequire(new URL('../functions/package.json', import.meta.url));
  const adminApp = requireFunctions('firebase-admin/app').initializeApp({ projectId: 'demo-aleria-account-check' }, 'account-check');
  const adminAuth = requireFunctions('firebase-admin/auth').getAuth(adminApp);
  const app = initializeApp({ projectId: 'demo-aleria-account-check', apiKey: 'emulator-only' }, 'account-check');
  const auth = getAuth(app);
  connectAuthEmulator(auth, `http://${address}`, { disableWarnings: true });
  const session = createFirebaseAuthSession({ auth, onIdTokenChanged, signInAnonymously });
  const actions = createFirebaseAccountActions({ auth, session, EmailAuthProvider, linkWithCredential, signInWithEmailAndPassword, signOut, signInAnonymously, sendPasswordResetEmail, sendEmailVerification });
  try {
    const original = await session.requireUser();
    await adminAuth.setCustomUserClaims(original.uid, { aleriaRole: 'editor' });
    await original.getIdToken(true); await session.refresh();
    assert.equal(session.getAccess().canEditSharedContent, true);
    const secured = await actions.secureBrowserAccess('editor@example.test', 'emulator-only-password');
    assert.equal(secured.uid, original.uid);
    assert.equal(secured.anonymous, false);
    assert.equal(secured.role, 'editor');
    const guest = await actions.logout();
    assert.equal(guest.anonymous, true);
    assert.equal(guest.authenticated, true);
    assert.equal(guest.role, 'player');
    await assert.rejects(actions.secureBrowserAccess('editor@example.test', 'emulator-only-password'), error => error.code === 'auth/email-already-in-use' || error.code === 'auth/credential-already-in-use');
    assert.equal(session.getAccess().uid, guest.uid);
    const restored = await actions.login('editor@example.test', 'emulator-only-password');
    assert.equal(restored.uid, original.uid);
    assert.equal(restored.role, 'editor');
  } finally { await deleteApp(app); await adminApp.delete(); }
});
