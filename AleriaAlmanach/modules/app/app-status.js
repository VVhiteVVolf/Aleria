// Application toast/status messages.
let _appStatusTimer = null;

function escapeAppStatusText(value) {
  if (typeof escapeHtml === 'function') return escapeHtml(value);
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clearAppStatus() {
  const toast = document.getElementById('app-status-toast');
  clearTimeout(_appStatusTimer);
  _appStatusTimer = null;
  if (!toast) return;
  toast.classList.remove('visible');
  toast.hidden = true;
  toast.innerHTML = '';
}

function dismissAppStatus() {
  clearAppStatus();
}

function showAppStatusHtml(html, type = 'info', options = {}) {
  const toast = document.getElementById('app-status-toast');
  if (!toast || !html) return;
  clearTimeout(_appStatusTimer);
  _appStatusTimer = null;
  toast.innerHTML = html;
  toast.dataset.type = type;
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add('visible'));
  if (options.timeout !== 0) {
    _appStatusTimer = window.setTimeout(clearAppStatus, options.timeout || 4800);
  }
}

function showAppStatus(message, type = 'info', options = {}) {
  if (!message) return;
  showAppStatusHtml(`
    <div class="app-status-content">${escapeAppStatusText(message)}</div>
    <button class="app-status-close" type="button" data-action="dismiss-app-status" aria-label="Meldung schließen">×</button>
  `, type, options);
}

function showFriendlyAppError(error, fallback, options = {}) {
  const message = typeof getFriendlyErrorMessage === 'function'
    ? getFriendlyErrorMessage(error, fallback)
    : (fallback || 'Ein Fehler ist aufgetreten.');
  showAppStatus(message, 'error', options);
}

function handleAppStatusActionClick(event) {
  const trigger = event.target?.closest?.('[data-action]');
  if (!trigger) return;

  if (trigger.dataset.action === 'dismiss-app-status') {
    event.preventDefault();
    dismissAppStatus();
    return;
  }
  if (trigger.dataset.action === 'resolve-module-sync-conflict') {
    event.preventDefault();
    if (typeof resolveModuleStoreSyncConflict === 'function') {
      resolveModuleStoreSyncConflict(trigger.dataset.choice || '');
    }
    return;
  }
  if (trigger.dataset.action === 'export-full-almanach-backup') {
    event.preventDefault();
    if (typeof exportFullAlmanachBackup === 'function') exportFullAlmanachBackup();
  }
}

document.addEventListener('click', handleAppStatusActionClick);

window.showAppStatus = showAppStatus;
window.showAppStatusHtml = showAppStatusHtml;
window.showFriendlyAppError = showFriendlyAppError;
window.dismissAppStatus = dismissAppStatus;
