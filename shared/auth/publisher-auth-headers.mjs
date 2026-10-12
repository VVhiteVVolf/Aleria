let authPromise = null;

async function existingBrowserAuth() {
  if (!authPromise) authPromise = (async () => {
    const [appSdk, authSdk] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js')
    ]);
    const app = appSdk.getApps().find(app => app.name === '[DEFAULT]') || appSdk.initializeApp({ apiKey: 'AIzaSyCgSej0WkSlkfAlySKZAdCyu4JjTNZEnYg', authDomain: 'aleriaprojekt.firebaseapp.com', projectId: 'aleriaprojekt' });
    const auth = authSdk.getAuth(app);
    await new Promise(resolve => {
      const timeout = setTimeout(() => { unsubscribe(); resolve(); }, 1500);
      const finish = () => { clearTimeout(timeout); unsubscribe(); resolve(); };
      const unsubscribe = authSdk.onAuthStateChanged(auth, finish, finish);
    });
    return auth;
  })().catch(error => { authPromise = null; throw error; });
  return authPromise;
}

// Publishing can observe a session created on the Almanach page on this same
// origin. This module never signs in anonymously or changes an existing user.
export async function publisherAuthHeaders() {
  if (typeof window === 'undefined') return {};
  try {
    if (window._fbAuth?.getAccess()?.authenticated) return { Authorization: `Bearer ${await window._fbAuth.getIdToken()}` };
    const user = (await existingBrowserAuth()).currentUser;
    return user ? { Authorization: `Bearer ${await user.getIdToken()}` } : {};
  } catch { return {}; }
}
