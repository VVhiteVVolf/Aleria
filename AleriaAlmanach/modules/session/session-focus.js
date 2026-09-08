// Session reading focus mode state and shell synchronization.
const SESSION_FOCUS_MODE_KEY = 'aleria-session-focus-mode-v1';

function isSessionFocusModeEnabled() {
  try {
    return localStorage.getItem(SESSION_FOCUS_MODE_KEY) === 'true';
  } catch {
    return false;
  }
}

function setSessionFocusModeEnabled(enabled) {
  try {
    localStorage.setItem(SESSION_FOCUS_MODE_KEY, enabled ? 'true' : 'false');
  } catch {
    // The visual toggle still works when localStorage is unavailable.
  }
}

function syncSessionFocusShell(enabled) {
  document.querySelector('.modal-card')?.classList.toggle('session-focus-expanded', !!enabled);
  document.getElementById('modal-overlay')?.classList.toggle('session-focus-overlay', !!enabled);
}

function toggleSessionFocusMode(button) {
  const card = document.querySelector('.modal-card');
  const enabled = !card?.classList.contains('session-focus-expanded');
  const page = button?.closest?.('.session-page') || document.querySelector('#modal-body .session-page');
  page?.classList.toggle('session-focus-mode', enabled);
  setSessionFocusModeEnabled(enabled);
  syncSessionFocusShell(enabled);
  const label = enabled ? 'Lesemodus verlassen' : 'Lesebereich maximieren';
  document.querySelectorAll('#modal-overlay [data-modal-action="toggle-focus-mode"], #modal-overlay [data-action="toggle-session-focus-mode"]').forEach(control => {
    control.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    control.setAttribute('aria-label', label);
    control.setAttribute('title', label);
    const icon = control.querySelector('[data-focus-icon]');
    const text = control.querySelector('[data-focus-label]');
    if (icon && text) {
      icon.textContent = enabled ? '↙' : '⛶';
      text.textContent = label;
    } else {
      control.textContent = enabled ? '↙' : '⛶';
    }
  });
}
