const DIALOG_CONFIGS = {
  'modal-overlay': { label: 'Almanach-Eintrag', initialFocus: '.modal-close, button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])' },
  'comment-form-overlay': { label: 'Kommentar schreiben', initialFocus: '#cf-editor, #cf-text, button, input, textarea, select' },
  'showcase-form-overlay': { label: 'Objekt vorstellen', initialFocus: '#sf-title, button, input, textarea, select' },
  'attachment-form-overlay': { label: 'Anhang pr\u00e4sentieren', initialFocus: '#af-title, button, input, textarea' },
  'showcase-profile-overlay': { label: 'Vorstellung', initialFocus: '.showcase-profile-close, button' },
  'edit-comment-overlay': { label: 'Kommentar bearbeiten', initialFocus: '#ec-code, #ec-editor, button, input, textarea, select' },
  'delete-confirm-overlay': { label: 'Kommentar l\u00f6schen', initialFocus: '#dc-code, button, input' },
  'char-profile-overlay': { label: 'Charakterprofil', initialFocus: '#cp-name, button, input, textarea, select' },
  'module-editor-overlay': { label: 'Modul-Editor', initialFocus: '#me-code, #me-title, button, input, textarea, select' },
};

const DIALOG_FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

let _dialogFocusStack = [];

function getDialogFocusableElements(dialog) {
  if (!dialog) return [];
  return Array.from(dialog.querySelectorAll(DIALOG_FOCUSABLE_SELECTOR))
    .filter(el => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.hidden || el.getAttribute('aria-hidden') === 'true') return false;
      const style = window.getComputedStyle(el);
      return style.visibility !== 'hidden' && style.display !== 'none';
    });
}

function getTopActiveDialog() {
  for (let i = _dialogFocusStack.length - 1; i >= 0; i--) {
    const dialog = document.getElementById(_dialogFocusStack[i].id);
    if (dialog?.classList.contains('active')) return dialog;
  }
  return Object.keys(DIALOG_CONFIGS)
    .map(id => document.getElementById(id))
    .filter(dialog => dialog?.classList.contains('active'))
    .pop() || null;
}

function focusDialogInitialElement(dialog, selector) {
  if (!dialog) return;
  const target = selector ? dialog.querySelector(selector) : null;
  const fallback = getDialogFocusableElements(dialog)[0] || dialog;
  const focusTarget = target instanceof HTMLElement && !target.disabled ? target : fallback;
  if (focusTarget instanceof HTMLElement) focusTarget.focus({ preventScroll: true });
}

function activateDialog(overlayId, options = {}) {
  const dialog = document.getElementById(overlayId);
  if (!dialog) return;
  const config = DIALOG_CONFIGS[overlayId] || {};
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  dialog.classList.add('active');
  dialog.setAttribute('role', dialog.getAttribute('role') || 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-hidden', 'false');
  dialog.setAttribute('tabindex', dialog.getAttribute('tabindex') || '-1');
  if (!dialog.hasAttribute('aria-label') && config.label) dialog.setAttribute('aria-label', config.label);

  _dialogFocusStack = _dialogFocusStack.filter(item => item.id !== overlayId);
  _dialogFocusStack.push({ id: overlayId, previousFocus });

  const delay = Number.isFinite(options.delay) ? options.delay : 20;
  window.setTimeout(() => {
    if (!dialog.classList.contains('active')) return;
    focusDialogInitialElement(dialog, options.initialFocus || config.initialFocus);
  }, delay);
}

function deactivateDialog(overlayId, options = {}) {
  const dialog = document.getElementById(overlayId);
  if (dialog) {
    dialog.classList.remove('active');
    dialog.setAttribute('aria-hidden', 'true');
  }

  const index = _dialogFocusStack.map(item => item.id).lastIndexOf(overlayId);
  const state = index >= 0 ? _dialogFocusStack.splice(index, 1)[0] : null;
  const topDialog = getTopActiveDialog();
  const previousFocus = state?.previousFocus;

  if (topDialog) {
    if (previousFocus?.isConnected && topDialog.contains(previousFocus)) {
      previousFocus.focus({ preventScroll: true });
    } else {
      focusDialogInitialElement(topDialog, DIALOG_CONFIGS[topDialog.id]?.initialFocus);
    }
    return;
  }

  if (options.restoreFocus === false) return;
  if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
}

document.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const dialog = getTopActiveDialog();
  if (!dialog) return;
  const focusable = getDialogFocusableElements(dialog);
  if (!focusable.length) {
    event.preventDefault();
    dialog.focus({ preventScroll: true });
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (!dialog.contains(active) || active === first)) {
    event.preventDefault();
    last.focus({ preventScroll: true });
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus({ preventScroll: true });
  }
}, true);
