function setText(element, value) {
  if (element) element.textContent = value;
}

export function createFamilySyncStatusUi(documentRef = document) {
  const status = documentRef.getElementById('cloud-sync-status');
  const loginButton = documentRef.querySelector('[data-action="open-cloud-login"]');
  const accountButton = documentRef.querySelector('[data-action="open-cloud-account"]');
  const dialog = documentRef.getElementById('cloud-account-dialog');
  const form = documentRef.getElementById('cloud-login-form');
  const error = documentRef.getElementById('cloud-login-error');
  const signedOut = documentRef.getElementById('cloud-signed-out');
  const signedIn = documentRef.getElementById('cloud-signed-in');
  const accountEmail = documentRef.getElementById('cloud-account-email');
  const conflictActions = documentRef.getElementById('cloud-conflict-actions');

  function render({ phase, user = null, message = '' }) {
    const signedInUser = Boolean(user);
    if (loginButton) loginButton.hidden = signedInUser;
    if (accountButton) accountButton.hidden = !signedInUser;
    if (signedOut) signedOut.hidden = signedInUser;
    if (signedIn) signedIn.hidden = !signedInUser;
    if (accountEmail) accountEmail.textContent = user?.email || user?.displayName || 'Firebase-Konto';
    if (status) {
      status.dataset.phase = phase;
      status.textContent = message || (signedInUser ? 'Cloud verbunden' : 'Nur lokal');
    }
    if (conflictActions) conflictActions.hidden = phase !== 'conflict';
  }

  function open() {
    if (!dialog?.open) dialog?.showModal();
    error.hidden = true;
  }

  function close() {
    if (dialog?.open) dialog.close();
  }

  function readCredentials() {
    const data = new FormData(form);
    return {
      email: String(data.get('email') || ''),
      password: String(data.get('password') || '')
    };
  }

  function showError(message) {
    setText(error, message);
    error.hidden = false;
  }

  return Object.freeze({
    dialog,
    form,
    render,
    open,
    close,
    readCredentials,
    showError,
    clearPassword: () => {
      const password = form?.elements.namedItem('password');
      if (password) password.value = '';
    }
  });
}
