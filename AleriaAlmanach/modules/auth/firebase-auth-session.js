const ALERIA_ROLES = new Set(['player', 'editor', 'moderator', 'admin']);

export function normalizeAleriaRole(claims = {}) {
  const role = String(claims?.aleriaRole || '').trim().toLowerCase();
  return ALERIA_ROLES.has(role) ? role : 'player';
}

export function createFirebaseAuthSession({ auth, onIdTokenChanged, signInAnonymously }) {
  let state = Object.freeze({ ready: false, user: null, uid: '', role: 'player', claims: {} });
  let startPromise = null;
  let inspection = 0;

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
    const currentInspection = ++inspection;
    if (!user) return publish(null);
    const tokenResult = typeof user.getIdTokenResult === 'function' ? await user.getIdTokenResult() : null;
    if (currentInspection !== inspection) return state;
    return publish(user, tokenResult);
  }

  function start() {
    if (startPromise) return startPromise;
    startPromise = new Promise((resolve, reject) => {
      let settled = false;
      let anonymousSignIn = null;
      const finish = value => {
        if (!settled && value.user) {
          settled = true;
          resolve(value);
        }
      };
      onIdTokenChanged(auth, user => {
        if (user) {
          inspect(user).then(finish).catch(reject);
        } else if (!settled) {
          // The first observer event follows restoration of the persisted
          // session. A null event is not a completed anonymous sign-in.
          anonymousSignIn ||= Promise.resolve().then(() => signInAnonymously(auth))
            .then(result => {
              const currentUser = result?.user || auth.currentUser;
              if (!currentUser) throw new Error('Firebase konnte keine Anmeldung herstellen.');
              return inspect(currentUser);
            })
            .then(finish)
            .catch(reject);
        } else {
          inspect(null);
        }
      }, reject);
    });
    return startPromise;
  }

  async function requireUser() {
    await start();
    if (!state.user) throw new Error('Für diese Änderung ist eine Firebase-Anmeldung erforderlich.');
    return state.user;
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
      anonymous: !!state.user?.isAnonymous,
      email: String(state.user?.email || ''),
      emailVerified: !!state.user?.emailVerified,
      displayName: String(state.user?.displayName || ''),
      photoURL: String(state.user?.photoURL || ''),
      canEditSharedContent: ['editor', 'moderator', 'admin'].includes(state.role),
      canModerate: ['moderator', 'admin'].includes(state.role)
    });
  }

  async function refresh() {
    await start();
    return inspect(auth.currentUser);
  }

  return Object.freeze({ start, requireUser, getIdToken, getAccess, refresh });
}
