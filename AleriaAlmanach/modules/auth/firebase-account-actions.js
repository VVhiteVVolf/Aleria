// Account changes use the existing Firebase session. Linking an anonymous
// account preserves its UID and server-managed role; login never grants roles.
export function createFirebaseAccountActions({ auth, session, EmailAuthProvider, linkWithCredential, signInWithEmailAndPassword, signOut, signInAnonymously, sendPasswordResetEmail, sendEmailVerification }) {
  let pending = false;
  async function change(operation) {
    if (pending) throw new Error('Bitte warte, bis der aktuelle Vorgang abgeschlossen ist.');
    pending = true;
    try { return await operation(); } finally { pending = false; }
  }
  return Object.freeze({
    secureBrowserAccess: (email, password) => change(async () => {
      const user = await session.requireUser();
      if (!user.isAnonymous) throw new Error('Dieser Zugang ist bereits mit einem Konto verbunden.');
      const result = await linkWithCredential(user, EmailAuthProvider.credential(email.trim(), password));
      if (result.user.uid !== user.uid) throw new Error('Die bestehende Nutzer-ID wurde nicht erhalten.');
      await session.refresh();
      return session.getAccess();
    }),
    login: (email, password) => change(async () => {
      await session.start();
      await signInWithEmailAndPassword(auth, email.trim(), password);
      await session.refresh();
      return session.getAccess();
    }),
    logout: () => change(async () => {
      const user = await session.requireUser();
      if (user.isAnonymous) throw new Error('Sichere deinen Browserzugang zuerst mit E-Mail und Passwort.');
      await signOut(auth);
      await signInAnonymously(auth);
      await session.refresh();
      return session.getAccess();
    }),
    resetPassword: email => change(() => sendPasswordResetEmail(auth, email.trim())),
    verifyEmail: () => change(async () => sendEmailVerification(await session.requireUser()))
  });
}

export function accountErrorMessage(error) {
  const messages = {
    'auth/email-already-in-use': 'Diese E-Mail gehört bereits zu einem Konto. Melde dich damit an. Dein bisheriger Browserzugang wird dabei nicht mit diesem Konto zusammengeführt.',
    'auth/credential-already-in-use': 'Dieser Zugang gehört bereits zu einem Konto. Bitte melde dich damit an.',
    'auth/invalid-email': 'Bitte gib eine gültige E-Mail-Adresse ein.',
    'auth/weak-password': 'Bitte verwende ein stärkeres Passwort mit mindestens sechs Zeichen.',
    'auth/invalid-credential': 'E-Mail oder Passwort stimmen nicht.',
    'auth/wrong-password': 'E-Mail oder Passwort stimmen nicht.',
    'auth/user-not-found': 'E-Mail oder Passwort stimmen nicht.',
    'auth/too-many-requests': 'Zu viele Versuche. Bitte versuche es später erneut.',
    'auth/network-request-failed': 'Die Anmeldung ist gerade nicht erreichbar. Bitte versuche es erneut.',
    'auth/operation-not-allowed': 'Die E-Mail-Anmeldung ist noch nicht freigeschaltet.',
    'auth/requires-recent-login': 'Bitte melde dich für diese Änderung erneut an.'
  };
  return messages[error?.code] || (error?.code ? 'Der Kontovorgang konnte nicht abgeschlossen werden.' : String(error?.message || 'Der Kontovorgang konnte nicht abgeschlossen werden.'));
}
