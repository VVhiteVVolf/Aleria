// Compact online status. Details appear only after an explicit click or keypress.
const FIREBASE_SYNC_LABELS = {
  idle: 'Online-Speicher',
  local: 'Wird online gespeichert',
  syncing: 'Online-Abgleich',
  synced: 'Online aktuell',
  error: 'Online-Abgleich pr\u00fcfen',
  offline: 'Keine Online-Verbindung'
};
let _firebaseSyncState = 'idle';
let _firebaseSyncStatusMinimized = true;

function escapeSyncStatusText(value) {
  if (typeof escapeHtml === 'function') return escapeHtml(value);
  return String(value ?? '').replace(/[&<>"']/g, char =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function updateFirebaseSyncStatus(state = 'idle', detail = '') {
  _firebaseSyncState = state;
  const status = document.getElementById('firebase-sync-status');
  if (!status) return;
  status.dataset.state = state;
  status.removeAttribute('title');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-atomic', 'false');
  const label = FIREBASE_SYNC_LABELS[state] || FIREBASE_SYNC_LABELS.idle;
  status.innerHTML = `
    <button class="firebase-sync-toggle" type="button" data-action="toggle-firebase-sync-status"
      aria-expanded="false" aria-controls="firebase-sync-details">
      <span class="firebase-sync-dot" aria-hidden="true"></span>
      <span class="firebase-sync-label">${escapeSyncStatusText(label)}</span>
    </button>
    <div class="firebase-sync-details" id="firebase-sync-details" hidden>
      <p class="firebase-sync-detail">${escapeSyncStatusText(detail || label)}</p>
      <button class="firebase-sync-action" type="button" data-action="export-full-almanach-backup">Vollbackup herunterladen</button>
    </div>
  `;
  setFirebaseSyncStatusMinimized(_firebaseSyncStatusMinimized);
}

function isFirebaseSyncStatusMinimized() {
  return _firebaseSyncStatusMinimized;
}

function setFirebaseSyncStatusMinimized(minimized) {
  _firebaseSyncStatusMinimized = !!minimized;
  const status = document.getElementById('firebase-sync-status');
  if (!status) return;
  status.dataset.minimized = minimized ? 'true' : 'false';
  const toggle = status.querySelector('.firebase-sync-toggle');
  const details = status.querySelector('.firebase-sync-details');
  const label = FIREBASE_SYNC_LABELS[_firebaseSyncState] || FIREBASE_SYNC_LABELS.idle;
  if (toggle) {
    toggle.setAttribute('aria-expanded', minimized ? 'false' : 'true');
    toggle.setAttribute('aria-label', `${label} \u2013 ${minimized ? 'Details anzeigen' : 'Details schlie\u00dfen'}`);
    toggle.title = `${label} \u00b7 ${minimized ? 'Details anzeigen' : 'Details schlie\u00dfen'}`;
  }
  if (details) details.hidden = !!minimized;
}

function toggleFirebaseSyncStatusMinimized() {
  setFirebaseSyncStatusMinimized(!isFirebaseSyncStatusMinimized());
}

window.updateFirebaseSyncStatus = updateFirebaseSyncStatus;
document.addEventListener('click', event => {
  if (!event.target.closest?.('[data-action="toggle-firebase-sync-status"]')) return;
  event.preventDefault();
  toggleFirebaseSyncStatusMinimized();
});
window.addEventListener('offline', () => {
  updateFirebaseSyncStatus('offline', 'Verbindung getrennt. Deine \u00c4nderungen bleiben gesichert.');
});
window.addEventListener('online', () => {
  updateFirebaseSyncStatus('syncing', 'Verbindung wiederhergestellt. Online-Stand wird geladen...');
});
