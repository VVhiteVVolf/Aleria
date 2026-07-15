import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js';

function publicUser(user) {
  if (!user) return null;
  return Object.freeze({
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    emailVerified: user.emailVerified === true
  });
}

export function describeAuthError(error) {
  const messages = {
    'auth/invalid-credential': 'E-Mail-Adresse oder Passwort ist falsch.',
    'auth/invalid-email': 'Die E-Mail-Adresse ist ungültig.',
    'auth/missing-password': 'Bitte ein Passwort eingeben.',
    'auth/too-many-requests': 'Zu viele Anmeldeversuche. Bitte später erneut versuchen.',
    'auth/network-request-failed': 'Firebase ist derzeit nicht erreichbar.'
  };
  return messages[error?.code] || 'Die Anmeldung bei Firebase ist fehlgeschlagen.';
}

export function createFirebaseAuthService(firebaseClient) {
  let currentUser = null;
  let unsubscribe = null;

  async function observe(listener) {
    const services = await firebaseClient.initialize();
    if (!services) {
      listener(null);
      return () => {};
    }
    unsubscribe?.();
    unsubscribe = onAuthStateChanged(services.auth, user => {
      currentUser = publicUser(user);
      listener(currentUser);
    });
    return () => {
      unsubscribe?.();
      unsubscribe = null;
    };
  }

  async function login(email, password) {
    const services = await firebaseClient.initialize();
    if (!services) throw new Error('Firebase ist für diese Umgebung deaktiviert.');
    try {
      const result = await signInWithEmailAndPassword(services.auth, email.trim(), password);
      currentUser = publicUser(result.user);
      return currentUser;
    } catch (error) {
      throw new Error(describeAuthError(error), { cause: error });
    }
  }

  async function logout() {
    const services = await firebaseClient.initialize();
    if (!services) return;
    await signOut(services.auth);
    currentUser = null;
  }

  return Object.freeze({
    observe,
    login,
    logout,
    getCurrentUser: () => currentUser
  });
}
