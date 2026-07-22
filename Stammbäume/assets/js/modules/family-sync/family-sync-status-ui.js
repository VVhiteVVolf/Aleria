function setText(element, value) {
  if (element) element.textContent = value;
}

export function createFamilySyncStatusUi(documentRef = document) {
  const status = documentRef.getElementById('cloud-sync-status');
  const saveButton = documentRef.querySelector('[data-action="cloud-save"]');
  const resetButton = documentRef.querySelector('[data-action="cloud-reset-origin"]');
  const accountButton = documentRef.querySelector('[data-action="open-cloud-account"]');
  const publishButton = documentRef.querySelector('[data-action="cloud-publish"]');
  const dialog = documentRef.getElementById('cloud-account-dialog');
  const form = documentRef.getElementById('cloud-login-form');
  const error = documentRef.getElementById('cloud-login-error');
  const accountError = documentRef.getElementById('cloud-account-error');
  const signedOut = documentRef.getElementById('cloud-signed-out');
  const signedIn = documentRef.getElementById('cloud-signed-in');
  const accountEmail = documentRef.getElementById('cloud-account-email');
  let currentUser = null;

  function render({ phase, user = null, message = '', dirty = false, canReset = false }) {
    currentUser = user;
    const signedInUser = Boolean(user);
    if (accountButton) accountButton.hidden = !signedInUser;
    if (saveButton) {
      saveButton.disabled = ['loading', 'saving', 'publishing'].includes(phase);
      saveButton.textContent = phase === 'saving' ? 'Speichert online …' : 'Online speichern';
      saveButton.dataset.dirty = dirty ? 'true' : 'false';
    }
    if (resetButton) {
      resetButton.hidden = !canReset;
      resetButton.disabled = ['loading', 'saving', 'publishing'].includes(phase);
    }
    if (publishButton) publishButton.disabled = ['loading', 'saving', 'publishing'].includes(phase);
    if (signedOut) signedOut.hidden = signedInUser;
    if (signedIn) signedIn.hidden = !signedInUser;
    if (accountEmail) accountEmail.textContent = user?.email || user?.displayName || 'Firebase-Konto';
    if (status) {
      status.dataset.phase = phase;
      status.textContent = message || (signedInUser ? 'Cloud verbunden' : 'Nur lokal');
    }
  }

  function open() {
    if (!dialog?.open) dialog?.showModal();
    if (error) error.hidden = true;
    if (accountError) accountError.hidden = true;
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
    const target = currentUser ? accountError : error;
    setText(target, message);
    if (target) target.hidden = false;
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
