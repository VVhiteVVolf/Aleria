// This reader reuses Aleria's account/session code and the existing SDK version.
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import * as sdk from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js';
import { firebasePublicConfig } from '../../../modules/auth/firebase-public-config.js';
import { createFirebaseAuthSession } from '../../../modules/auth/firebase-auth-session.js';
import { createFirebaseAccountActions } from '../../../modules/auth/firebase-account-actions.js';
import { mountAccountUi } from '../../../modules/auth/account-ui.js';

export async function connectDocumentNotes(context, root) {
  const app = getApps().find(app => app.name === '[DEFAULT]') || initializeApp(firebasePublicConfig);
  const auth = sdk.getAuth(app);
  const session = createFirebaseAuthSession({ auth, onIdTokenChanged: sdk.onIdTokenChanged, signInAnonymously: sdk.signInAnonymously });
  const account = { ...createFirebaseAccountActions({ auth, session, ...sdk }), getAccess: session.getAccess };
  const accountRoot = root.querySelector('[data-role="almanach-account"]');
  if (accountRoot) mountAccountUi(accountRoot, () => account);
  const invoke = httpsCallable(getFunctions(app, 'europe-west1'), 'documentItemNotes', { timeout: 20000 });
  const request = async data => { await session.requireUser(); return (await invoke({ ...context, ...data })).data.notes; };
  return { mode: 'Am Inventarbuch gespeichert.', load: () => request({ action: 'load' }), save: data => request({ action: 'save', ...data }) };
}
