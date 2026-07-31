export function createGitHubPublisherAuthService(repository) {
  let currentUser = null;
  const listeners = new Set();

  function emit() {
    listeners.forEach(listener => listener(currentUser));
  }

  async function observe(listener) {
    listeners.add(listener);
    listener(currentUser);
    return () => listeners.delete(listener);
  }

  async function login(_email, publicationKey) {
    const session = await repository.authenticate(publicationKey);
    currentUser = Object.freeze({
      uid: 'github-publisher',
      email: '',
      displayName: session.repository || 'GitHub-Registry'
    });
    emit();
    return currentUser;
  }

  async function logout() {
    repository.clearSession();
    currentUser = null;
    emit();
  }

  return Object.freeze({ observe, login, logout, getCurrentUser: () => currentUser });
}
