function setText(element, value) {
  if (element) element.textContent = value;
}

export function createFamilySyncStatusUi(documentRef = document) {
  const status = documentRef.getElementById('cloud-sync-status');
  const saveButton = documentRef.querySelector('[data-action="cloud-save"]');
  const resetButton = documentRef.querySelector('[data-action="cloud-reset-origin"]');
  const publishButton = documentRef.querySelector('[data-action="cloud-publish"]');
  const skipDeployInput = documentRef.querySelector('[data-role="skip-netlify-deploy"]');

  function render({ phase, message = '', dirty = false, canReset = false }) {
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
    if (skipDeployInput) skipDeployInput.disabled = ['loading', 'saving', 'publishing'].includes(phase);
    if (status) {
      status.dataset.phase = phase;
      status.textContent = message || 'Nur auf diesem Gerät';
    }
  }

  function showError(message) {
    if (status) status.dataset.phase = 'error';
    setText(status, message);
  }

  return Object.freeze({
    render,
    showError,
    getSaveOptions: () => Object.freeze({
      skipDeploy: skipDeployInput?.checked !== false
    })
  });
}
