const ALERIA_ROLES = new Set(['player', 'editor', 'moderator', 'admin']);

export function normalizeAleriaRole(claims = {}) {
  const role = String(claims?.aleriaRole || '').trim().toLowerCase();
  return ALERIA_ROLES.has(role) ? role : 'player';
}

export function createFirebaseAuthSession({ auth, onIdTokenChanged, signInAnonymously }) {
  let state = Object.freeze({ ready: false, user: null, uid: '', role: 'player', claims: {} });
  let startPromise = null;

  function publish(user, tokenResult = null) {
    const claims = tokenResult?.claims && typeof tokenResult.claims === 'object' ? tokenResult.claims : {};
    state = Object.freeze({
      ready: true,
      user: user || null,
      uid: String(user?.uid || ''),
      role: normalizeAleriaRole(claims),
      claims
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aleria:auth-state-changed', { detail: getAccess() }));
    }
    return state;
  }

  async function inspect(user) {
    if (!user) return publish(null);
    const tokenResult = typeof user.getIdTokenResult === 'function' ? await user.getIdTokenResult() : null;
    return publish(user, tokenResult);
  }

  function start() {
    if (startPromise) return startPromise;
    startPromise = new Promise((resolve, reject) => {
      let settled = false;
      const finish = value => {
        if (!settled) {
          settled = true;
          resolve(value);
        }
      };
      onIdTokenChanged(auth, user => {
        inspect(user).then(finish).catch(reject);
      }, reject);
      Promise.resolve(auth.currentUser ? { user: auth.currentUser } : signInAnonymously(auth))
        .then(result => inspect(result?.user || auth.currentUser))
        .then(finish)
        .catch(reject);
    });
    return startPromise;
  }

  async function requireUser() {
    const current = await start();
    if (!current?.user) throw new Error('Für diese Änderung ist eine Firebase-Anmeldung erforderlich.');
    return current.user;
  }

  async function getIdToken(forceRefresh = false) {
    const user = await requireUser();
    if (typeof user.getIdToken !== 'function') throw new Error('Firebase kann kein Anmeldetoken bereitstellen.');
    return user.getIdToken(forceRefresh === true);
  }

  function getAccess() {
    return Object.freeze({
      ready: state.ready,
      uid: state.uid,
      role: state.role,
      authenticated: !!state.user,
      canEditSharedContent: ['editor', 'moderator', 'admin'].includes(state.role),
      canModerate: ['moderator', 'admin'].includes(state.role)
    });
  }

  return Object.freeze({ start, requireUser, getIdToken, getAccess });
}
