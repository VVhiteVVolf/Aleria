import { firebasePublicConfig } from './firebase-public-config.js';
let connecting;
// One browser app/auth context for feature pages. Reuses the Almanach session.
export function getFirebaseClientContext() {
  return connecting ||= (async () => {
    const [appSdk, authSdk, sdk, functionSdk] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'),
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js')
    ]);
    const app = appSdk.getApps().find(entry => entry.name === '[DEFAULT]') || appSdk.initializeApp(firebasePublicConfig);
    const auth = authSdk.getAuth(app), db = sdk.getFirestore(app), functions = functionSdk.getFunctions(app, 'europe-west1');
    await new Promise(resolve => { const stop = authSdk.onAuthStateChanged(auth, () => { stop(); resolve(); }); });
    const requireUser = async () => {
      if (!auth.currentUser) throw Error('Bitte zuerst im Almanach mit deinem Firebase-Konto anmelden.');
      return auth.currentUser;
    };
    return { db, sdk, functions, ...functionSdk, requireUser, auth, authSdk };
  })().catch(error => { connecting = null; throw error; });
}
