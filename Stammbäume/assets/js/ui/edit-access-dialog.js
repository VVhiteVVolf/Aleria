export function createEditAccessDialog(documentRef = document) {
  const dialog = documentRef.getElementById('edit-access-dialog');
  const form = documentRef.getElementById('edit-access-form');
  const passwordInput = form.elements.namedItem('password');
  const errorElement = documentRef.getElementById('edit-access-error');

  function open() {
    form.reset();
    errorElement.hidden = true;
    if (!dialog.open) dialog.showModal();
    passwordInput.focus();
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  function readPassword() {
    return passwordInput.value;
  }

  function showError() {
    errorElement.hidden = false;
    passwordInput.select();
  }

  return Object.freeze({ dialog, form, open, close, readPassword, showError });
}
