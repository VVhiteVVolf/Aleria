// Firebase/module-store sync status badge.
const FIREBASE_SYNC_LABELS = {
  idle: 'Speicherstatus: bereit',
  local: 'Lokal gespeichert',
  syncing: 'Synchronisiere...',
  synced: 'Online synchronisiert',
  error: 'Sync-Fehler',
  offline: 'Offline'
};
const FIREBASE_SYNC_MINIMIZED_KEY = 'aleria-firebase-sync-minimized-v1';
let _firebaseSyncState = 'idle';

function escapeSyncStatusText(value) {
  if (typeof escapeHtml === 'function') return escapeHtml(value);
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function hasModuleStoreSyncConflict() {
  return typeof _moduleStoreSyncConflict !== 'undefined' && !!_moduleStoreSyncConflict;
}

function updateFirebaseSyncStatus(state = 'idle', detail = '') {
  _firebaseSyncState = state;
  const status = document.getElementById('firebase-sync-status');
  if (!status) return;
  status.dataset.state = state;
  status.dataset.conflict = state === 'error' && hasModuleStoreSyncConflict() ? 'true' : 'false';
  const minimized = isFirebaseSyncStatusMinimized();
  status.dataset.minimized = minimized ? 'true' : 'false';
  status.setAttribute('title', minimized ? 'Speicherstatus anzeigen' : 'Speicherstatus minimieren');
  status.setAttribute('aria-label', minimized ? 'Speicherstatus anzeigen' : 'Speicherstatus minimieren');
  const label = FIREBASE_SYNC_LABELS[state] || FIREBASE_SYNC_LABELS.idle;
  status.innerHTML = `
    <span class="firebase-sync-dot" aria-hidden="true"></span>
    <span class="firebase-sync-label">${escapeSyncStatusText(label)}</span>
    ${detail ? `<span class="firebase-sync-detail">${escapeSyncStatusText(detail)}</span>` : ''}
    ${status.dataset.conflict === 'true' ? '<button class="firebase-sync-action" type="button" data-action="resolve-firebase-sync-conflict">Konflikt lösen</button>' : ''}
  `;
}

window.updateFirebaseSyncStatus = updateFirebaseSyncStatus;

function isFirebaseSyncStatusMinimized() {
  try {
    return localStorage.getItem(FIREBASE_SYNC_MINIMIZED_KEY) === '1';
  } catch {
    return false;
  }
}

function setFirebaseSyncStatusMinimized(minimized) {
  try {
    localStorage.setItem(FIREBASE_SYNC_MINIMIZED_KEY, minimized ? '1' : '0');
  } catch {
    // Visual state still updates for this render.
  }
  const status = document.getElementById('firebase-sync-status');
  if (!status) return;
  status.dataset.minimized = minimized ? 'true' : 'false';
  status.setAttribute('title', minimized ? 'Speicherstatus anzeigen' : 'Speicherstatus minimieren');
  status.setAttribute('aria-label', minimized ? 'Speicherstatus anzeigen' : 'Speicherstatus minimieren');
}

function toggleFirebaseSyncStatusMinimized() {
  setFirebaseSyncStatusMinimized(!isFirebaseSyncStatusMinimized());
}

document.addEventListener('click', event => {
  const action = event.target.closest?.('[data-action="resolve-firebase-sync-conflict"]');
  if (action) {
    event.preventDefault();
    if (typeof showStoredModuleStoreConflict === 'function') showStoredModuleStoreConflict();
    return;
  }

  const status = event.target.closest?.('#firebase-sync-status');
  if (!status) return;
  toggleFirebaseSyncStatusMinimized();
});

window.addEventListener('offline', () => {
  updateFirebaseSyncStatus('offline', 'Offline - Änderungen bleiben lokal.');
  if (typeof showAppStatus === 'function') {
    showAppStatus('Du bist offline. Laden und Speichern kann fehlschlagen.', 'error', { timeout: 0 });
  }
});

window.addEventListener('online', () => {
  updateFirebaseSyncStatus('syncing', 'Verbindung wieder da - prüfe Online-Speicher...');
  if (typeof showAppStatus === 'function') showAppStatus('Verbindung wiederhergestellt.', 'success');
});
