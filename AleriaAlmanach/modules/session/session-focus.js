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
  const page = button?.closest?.('.session-page');
  const enabled = !page?.classList.contains('session-focus-mode');
  page?.classList.toggle('session-focus-mode', enabled);
  setSessionFocusModeEnabled(enabled);
  syncSessionFocusShell(enabled);
  if (button) {
    button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    button.setAttribute('aria-label', enabled ? 'Lesemodus verlassen' : 'Lesebereich maximieren');
    button.setAttribute('title', enabled ? 'Lesemodus verlassen' : 'Lesebereich maximieren');
    button.textContent = enabled ? '↙' : '⛶';
  }
}
