// No sign-in and no Firestore writes: only the specific, server-validated
// single-use email action may change the account named by Firebase's code.
export function createEmailActionController({ auth, checkActionCode, applyActionCode, verifyPasswordResetCode, confirmPasswordReset }) {
  async function prepare(mode, code) {
    if (!code || code.length > 2048 || !['verifyEmail', 'resetPassword', 'recoverEmail'].includes(mode)) throw Object.assign(new Error('Ungültiger Bestätigungslink.'), { code: 'auth/invalid-action-code' });
    let email;
    if (mode === 'resetPassword') email = await verifyPasswordResetCode(auth, code);
    else {
      const info = await checkActionCode(auth, code);
      const expected = mode === 'verifyEmail' ? 'VERIFY_EMAIL' : 'RECOVER_EMAIL';
      if (info.operation !== expected) throw Object.assign(new Error('Dieser Link gehört zu einem anderen Vorgang.'), { code: 'auth/invalid-action-code' });
      email = info.data.email;
    }
    let complete = false;
    return Object.freeze({
      mode, email: String(email || ''),
      complete: async password => {
        if (complete) throw new Error('Dieser Zauber wurde schon gewirkt.');
        if (mode === 'resetPassword') await confirmPasswordReset(auth, code, password);
        else await applyActionCode(auth, code);
        complete = true;
      }
    });
  }
  return Object.freeze({ prepare });
}

export function emailActionErrorMessage(error) {
  if (['auth/expired-action-code', 'auth/invalid-action-code', 'auth/user-disabled', 'auth/user-not-found'].includes(error?.code)) return 'Dieser Link ist abgelaufen, bereits benutzt oder ungültig. Öffne deinen Gildenpass und fordere einen neuen Link an.';
  if (error?.code === 'auth/weak-password') return 'Das Passwort ist noch zu schwach. Verwende mindestens sechs Zeichen.';
  if (error?.code === 'auth/network-request-failed') return 'Der Postzauber erreicht Firebase gerade nicht. Versuche es gleich noch einmal.';
  return 'Myrddins Postzauber ist ins Stocken geraten. Bitte versuche es erneut oder fordere im Gildenpass einen neuen Link an.';
}
