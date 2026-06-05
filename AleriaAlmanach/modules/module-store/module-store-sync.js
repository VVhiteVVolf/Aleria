function normalizeModuleStorePayload(payload) {
  if (typeof payload?.data === 'string') {
    try {
      return normalizeModuleStorePayload(JSON.parse(payload.data || '{}'));
    } catch (error) {
      console.error('module store data parse failed:', error);
    }
  }

  const entryOverrides = {};
  Object.entries(payload?.entryOverrides || {}).forEach(([entryId, entry]) => {
    const id = String(entryId || entry?.id || '').trim();
    if (!id) return;
    entryOverrides[id] = sanitizeModuleEntry({ ...entry, id });
  });

  return {
    version: Number(payload?.version) || MODULE_STORE_SCHEMA_VERSION,
    updatedAtClient: Number(payload?.updatedAtClient) || 0,
    customSections: Array.isArray(payload?.customSections)
      ? payload.customSections.map(cleanCustomSection).filter(section => section.entries.length)
      : [],
    entryOverrides
  };
}

function getModuleStorePayload(updatedAtClient = Date.now()) {
  return normalizeModuleStorePayload({
    version: MODULE_STORE_SCHEMA_VERSION,
    updatedAtClient,
    customSections: _customSections.map(cleanCustomSection),
    entryOverrides: Object.fromEntries(
      Object.entries(_entryOverrides).map(([entryId, entry]) => [entryId, sanitizeModuleEntry({ ...entry, id: entryId })])
    )
  });
}

function getUtf8ByteLength(value) {
  const text = String(value ?? '');
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text).length;
  return unescape(encodeURIComponent(text)).length;
}

function getModuleStoreSerializedBytes(payload = getModuleStorePayload(Date.now())) {
  return getUtf8ByteLength(JSON.stringify(normalizeModuleStorePayload(payload)));
}

function formatStorageBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(2)} MB`;
  if (value >= 1024) return `${Math.round(value / 1024)} KB`;
  return `${value} B`;
}

function getModuleStoreSizeState(bytes) {
  if (bytes >= MODULE_STORE_DANGER_BYTES) return 'danger';
  if (bytes >= MODULE_STORE_WARN_BYTES) return 'warn';
  return 'ok';
}

function updateModuleStoreSizePanel(payload = getModuleStorePayload(Date.now())) {
  const panel = document.getElementById('me-module-store-size-panel');
  if (!panel) return;
  let bytes = 0;
  try {
    bytes = getModuleStoreSerializedBytes(payload);
  } catch (error) {
    console.warn('module store size calculation failed:', error);
  }
  const state = getModuleStoreSizeState(bytes);
  const percent = Math.min(100, Math.round((bytes / MODULE_STORE_FIREBASE_LIMIT_BYTES) * 100));
  const text = document.getElementById('me-module-store-size-text');
  const bar = document.getElementById('me-module-store-size-bar');
  const note = document.getElementById('me-module-store-size-note');

  panel.classList.toggle('warn', state === 'warn');
  panel.classList.toggle('danger', state === 'danger');
  if (text) text.textContent = `${formatStorageBytes(bytes)} / ca. ${formatStorageBytes(MODULE_STORE_FIREBASE_LIMIT_BYTES)}`;
  if (bar) bar.style.width = `${percent}%`;
  if (note) {
    note.textContent = state === 'danger'
      ? 'Kritisch nah am Firestore-Dokumentlimit. Vor weiteren grossen Importen unbedingt Vollbackup herunterladen.'
      : state === 'warn'
        ? 'Der Modul-Speicher wird gross. Vollbackup regelmaessig herunterladen und Masterimporte vorsichtig testen.'
        : 'Zeigt die aktuelle Groesse des Modul-Speichers fuer Firebase an.';
  }
}

function warnIfModuleStoreSizeIsHigh(payload = getModuleStorePayload(Date.now())) {
  const bytes = getModuleStoreSerializedBytes(payload);
  const state = getModuleStoreSizeState(bytes);
  updateModuleStoreSizePanel(payload);
  if (state === 'danger') {
    showAppStatus(`Modul-Speicher ist sehr gross (${formatStorageBytes(bytes)}). Bitte ein Vollbackup herunterladen.`, 'error', { timeout: 0 });
    if (typeof setModuleEditorStatus === 'function') {
      setModuleEditorStatus(`Warnung: Modul-Speicher ist sehr gross (${formatStorageBytes(bytes)}). Vor weiteren Importen Vollbackup herunterladen.`, true);
    }
  } else if (state === 'warn' && document.getElementById('module-editor-overlay')?.classList.contains('active')) {
    setModuleEditorStatus(`Hinweis: Modul-Speicher ist bereits ${formatStorageBytes(bytes)} gross. Vollbackups regelmaessig herunterladen.`);
  }
  return { bytes, state };
}

function confirmBackupBeforeDestructiveImport(label, details = '') {
  const extra = details ? `\n\n${details}` : '';
  return confirm(`${label} fortsetzen?${extra}\n\nVor diesem Import solltest du zuerst "Vollbackup herunterladen" nutzen. Der Import schreibt Daten nach Firebase und ueberschreibt gleiche IDs.`);
}

function getModuleStoreContentSignature(payload) {
  const normalized = normalizeModuleStorePayload(payload);
  return JSON.stringify({
    customSections: normalized.customSections,
    entryOverrides: normalized.entryOverrides
  });
}

function readModuleStoreSyncMeta() {
  try {
    const raw = localStorage.getItem(MODULE_STORE_SYNC_META_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('module sync meta read failed:', error);
    return null;
  }
}

function writeModuleStoreSyncMeta(payload) {
  try {
    const normalized = normalizeModuleStorePayload(payload);
    localStorage.setItem(MODULE_STORE_SYNC_META_KEY, JSON.stringify({
      signature: getModuleStoreContentSignature(normalized),
      updatedAtClient: getModuleStoreUpdatedAt(normalized),
      syncedAt: Date.now()
    }));
  } catch (error) {
    console.warn('module sync meta write failed:', error);
  }
}

function isLocalModuleStoreSynced(payload) {
  const meta = readModuleStoreSyncMeta();
  if (!meta?.signature) return false;
  return meta.signature === getModuleStoreContentSignature(payload);
}

function hasModuleStoreContent(payload) {
  const normalized = normalizeModuleStorePayload(payload);
  return normalized.customSections.length || Object.keys(normalized.entryOverrides).length;
}

function getModuleStoreSummary(payload) {
  const normalized = normalizeModuleStorePayload(payload);
  const customModuleCount = normalized.customSections.reduce((sum, section) => sum + (section.entries?.length || 0), 0);
  const overrideCount = Object.keys(normalized.entryOverrides).length;
  return `${normalized.customSections.length} Bereiche, ${customModuleCount} eigene Module, ${overrideCount} Überschreibungen`;
}

function renderModuleStoreConflictPrompt(localPayload, remotePayload) {
  const localDate = getModuleStoreUpdatedAt(localPayload)
    ? new Date(getModuleStoreUpdatedAt(localPayload)).toLocaleString('de-DE')
    : 'unbekannt';
  const remoteDate = getModuleStoreUpdatedAt(remotePayload)
    ? new Date(getModuleStoreUpdatedAt(remotePayload)).toLocaleString('de-DE')
    : 'unbekannt';

  showAppStatusHtml(`
    <button class="app-status-close" type="button" data-action="dismiss-app-status" aria-label="Meldung schließen">×</button>
    <div class="sync-conflict-panel">
      <div class="sync-conflict-kicker">Sync-Konflikt</div>
      <div class="sync-conflict-title">Lokaler Stand und Online-Stand unterscheiden sich.</div>
      <div class="sync-conflict-grid">
        <div>
          <strong>Lokal</strong>
          <span>${escapeHtml(localDate)}</span>
          <small>${escapeHtml(getModuleStoreSummary(localPayload))}</small>
        </div>
        <div>
          <strong>Online</strong>
          <span>${escapeHtml(remoteDate)}</span>
          <small>${escapeHtml(getModuleStoreSummary(remotePayload))}</small>
        </div>
      </div>
      <div class="sync-conflict-actions">
        <button type="button" data-action="resolve-module-sync-conflict" data-choice="remote">Online laden</button>
        <button type="button" data-action="resolve-module-sync-conflict" data-choice="local">Lokal behalten</button>
        <button type="button" data-action="export-full-almanach-backup">Backup</button>
      </div>
      <div class="sync-conflict-note">Vor dem Überschreiben ist ein Backup sinnvoll. Schließen blendet nur diese Meldung aus.</div>
    </div>
  `, 'error', { timeout: 0 });
}

function showModuleStoreSyncConflict(localPayload, remotePayload) {
  _moduleStoreSyncConflict = {
    localPayload: deepClone(normalizeModuleStorePayload(localPayload)),
    remotePayload: deepClone(normalizeModuleStorePayload(remotePayload))
  };
  updateFirebaseSyncStatus('error', 'Sync-Konflikt: lokaler und Online-Stand unterscheiden sich.');
  renderModuleStoreConflictPrompt(_moduleStoreSyncConflict.localPayload, _moduleStoreSyncConflict.remotePayload);
  if (document.getElementById('module-editor-overlay')?.classList.contains('active')) {
    setModuleEditorStatus('Sync-Konflikt: Wähle unten rechts, ob Online geladen oder Lokal behalten werden soll. Backup vorher empfohlen.', true);
  }
}

function showStoredModuleStoreConflict() {
  if (!_moduleStoreSyncConflict) {
    showAppStatus('Kein aktiver Modul-Sync-Konflikt vorhanden.', 'info');
    return;
  }
  renderModuleStoreConflictPrompt(_moduleStoreSyncConflict.localPayload, _moduleStoreSyncConflict.remotePayload);
}

async function resolveModuleStoreSyncConflict(choice) {
  if (!_moduleStoreSyncConflict) {
    showAppStatus('Kein aktiver Modul-Sync-Konflikt vorhanden.', 'info');
    return;
  }
  const localPayload = normalizeModuleStorePayload(_moduleStoreSyncConflict.localPayload);
  const remotePayload = normalizeModuleStorePayload(_moduleStoreSyncConflict.remotePayload);

  try {
    if (choice === 'remote') {
      if (!confirm('Online-Stand laden?\n\nDein lokaler Modulstand wird durch den Online-Stand ersetzt. Vorher Backup empfohlen.')) return;
      applyModuleStorePayload(remotePayload);
      writeLocalModuleStorePayload(remotePayload);
      writeModuleStoreSyncMeta(remotePayload);
      updateModuleStoreSizePanel(remotePayload);
      renderAll();
      updateFirebaseSyncStatus('synced', 'Online-Stand manuell übernommen.');
      showAppStatus('Online-Stand wurde geladen.', 'success');
    } else if (choice === 'local') {
      if (!confirm('Lokalen Stand behalten?\n\nDer lokale Modulstand wird nach Firebase geschrieben und überschreibt den Online-Modulstand. Vorher Backup empfohlen.')) return;
      updateFirebaseSyncStatus('syncing', 'Lokaler Stand wird online gespeichert...');
      await pushModuleStoreToFirebase(localPayload);
      writeModuleStoreSyncMeta(localPayload);
      updateModuleStoreSizePanel(localPayload);
      updateFirebaseSyncStatus('synced', 'Lokaler Stand wurde online gespeichert.');
      showAppStatus('Lokaler Stand wurde online gespeichert.', 'success');
    }
    _moduleStoreSyncConflict = null;
    updateFirebaseSyncStatus('synced', choice === 'remote' ? 'Online-Stand manuell übernommen.' : 'Lokaler Stand wurde online gespeichert.');
  } catch (error) {
    console.error('module sync conflict resolution failed:', error);
    updateFirebaseSyncStatus('error', 'Konflikt konnte nicht aufgelöst werden.');
    showFriendlyAppError(error, 'Sync-Konflikt konnte nicht aufgelöst werden.', { timeout: 0 });
  }
}

window.resolveModuleStoreSyncConflict = resolveModuleStoreSyncConflict;
window.showStoredModuleStoreConflict = showStoredModuleStoreConflict;

function getModuleStoreUpdatedAt(payload) {
  return Number(payload?.updatedAtClient) || 0;
}

function readLocalModuleStorePayload() {
  const raw = localStorage.getItem(MODULE_STORE_KEY);
  return raw ? normalizeModuleStorePayload(JSON.parse(raw)) : normalizeModuleStorePayload(null);
}

function writeLocalModuleStorePayload(payload) {
  localStorage.setItem(MODULE_STORE_KEY, JSON.stringify(normalizeModuleStorePayload(payload)));
}

function cleanupSyncedModuleStoreCache(options = {}) {
  try {
    const localPayload = readLocalModuleStorePayload();
    if (!hasModuleStoreContent(localPayload)) return false;
    const meta = readModuleStoreSyncMeta();
    if (!meta?.syncedAt || !isLocalModuleStoreSynced(localPayload)) return false;
    if (!options.force && Date.now() - Number(meta.syncedAt) < MODULE_STORE_SYNCED_CACHE_MAX_AGE_MS) return false;
    localStorage.removeItem(MODULE_STORE_KEY);
    return true;
  } catch (error) {
    console.warn('synced module cache cleanup failed:', error);
    return false;
  }
}

function applyModuleStorePayload(payload) {
  const normalized = normalizeModuleStorePayload(payload);
  _customSections = normalized.customSections;
  _entryOverrides = {};
  Object.entries(normalized.entryOverrides).forEach(([entryId, entry]) => {
    _entryOverrides[entryId] = sanitizeModuleEntry({ ...entry, id: entryId });
  });
  _builtinLibraryCharactersCache = null;
  invalidateArchiveSearchCache();
  return normalized;
}

function loadModuleStore() {
  try {
    applyModuleStorePayload(readLocalModuleStorePayload());
    const localPayload = readLocalModuleStorePayload();
    updateModuleStoreSizePanel(localPayload);
    if (hasModuleStoreContent(localPayload)) {
      updateFirebaseSyncStatus(
        isLocalModuleStoreSynced(localPayload) ? 'synced' : 'local',
        isLocalModuleStoreSynced(localPayload) ? 'Lokaler Cache entspricht dem letzten Online-Stand.' : 'Warte auf Online-Abgleich.'
      );
    } else {
      updateFirebaseSyncStatus('idle', 'Noch keine lokalen Moduländerungen.');
    }
  } catch (error) {
    console.error('module store load failed:', error);
    showAppStatus('Lokale Moduländerungen konnten nicht gelesen werden. Der gespeicherte Stand wurde ignoriert.', 'error');
    updateFirebaseSyncStatus('error', 'Lokale Moduländerungen konnten nicht gelesen werden.');
    _customSections = [];
    _entryOverrides = {};
    updateModuleStoreSizePanel();
  }
}

function cleanupLocalAlmanachStorage() {
  const removedDrafts = typeof window.cleanupOldCommentDrafts === 'function'
    ? window.cleanupOldCommentDrafts(30)
    : 0;
  const removedModuleCache = cleanupSyncedModuleStoreCache();
  if (removedDrafts || removedModuleCache) {
    const parts = [];
    if (removedDrafts) parts.push(`${removedDrafts} alte Entwuerfe`);
    if (removedModuleCache) parts.push('synchronisierten Modul-Cache');
    showAppStatus(`Lokaler Speicher bereinigt: ${parts.join(', ')}.`, 'success');
  }
}

async function waitForFirebaseReady(timeoutMs = FIREBASE_READY_TIMEOUT_MS) {
  if (_fbReady && window._fb) return true;
  await Promise.race([
    new Promise(resolve => window.addEventListener('fb-ready', resolve, { once: true })),
    new Promise(resolve => window.setTimeout(resolve, timeoutMs))
  ]);
  return !!window._fb;
}

async function pushModuleStoreToFirebase(payload) {
  const ready = await waitForFirebaseReady();
  if (!ready || !window._fb?.saveModuleStore) {
    throw new Error('Firebase ist nicht erreichbar. Moduländerungen bleiben lokal gespeichert.');
  }
  await window._fb.saveModuleStore(normalizeModuleStorePayload(payload));
  return true;
}

function scheduleRemoteModuleStoreSave(payload) {
  clearTimeout(_moduleStoreRemoteSaveTimer);
  updateFirebaseSyncStatus('syncing', 'Moduländerungen werden online gespeichert...');
  _moduleStoreRemoteSaveTimer = window.setTimeout(async () => {
    _moduleStoreRemoteSaveTimer = null;
    try {
      await pushModuleStoreToFirebase(payload);
      writeModuleStoreSyncMeta(payload);
      updateFirebaseSyncStatus('synced', 'Letzte Moduländerung ist online.');
    } catch (error) {
      console.error('remote module store save failed:', error);
      updateFirebaseSyncStatus('error', 'Nur lokal gespeichert.');
      showFriendlyAppError(error, 'Modul wurde lokal gespeichert, aber noch nicht online synchronisiert.');
    }
  }, MODULE_STORE_REMOTE_SAVE_DELAY);
}

function saveModuleStore(options = {}) {
  try {
    const payload = getModuleStorePayload(options.updatedAtClient || Date.now());
    writeLocalModuleStorePayload(payload);
    _builtinLibraryCharactersCache = null;
    warnIfModuleStoreSizeIsHigh(payload);
    updateFirebaseSyncStatus('local', 'Moduländerung im Browser gesichert.');
    if (options.remote !== false) scheduleRemoteModuleStoreSave(payload);
    return true;
  } catch (error) {
    console.error('saveModuleStore failed:', error);
    updateFirebaseSyncStatus('error', 'Lokaler Speicher nicht verfügbar.');
    showAppStatus('Lokaler Speicher ist voll oder nicht verfügbar. Exportiere deine Änderungen als JSON.', 'error', { timeout: 0 });
    if (typeof setModuleEditorStatus === 'function') {
      setModuleEditorStatus('Lokaler Speicher ist voll oder nicht verfügbar. Exportiere deine Änderungen als JSON, bevor du weiterarbeitest.', true);
    }
    return false;
  }
}

function applyRemoteModuleStore(payload) {
  if (!hasModuleStoreContent(payload)) return;
  if (_inlineModuleEdit?.active) return;

  try {
    const remotePayload = normalizeModuleStorePayload(payload);
    const localPayload = readLocalModuleStorePayload();
    const remoteUpdated = getModuleStoreUpdatedAt(remotePayload);
    const localUpdated = getModuleStoreUpdatedAt(localPayload);
    const sameContent = getModuleStoreContentSignature(remotePayload) === getModuleStoreContentSignature(localPayload);

    if (sameContent) return;
    if (hasModuleStoreContent(localPayload) && !isLocalModuleStoreSynced(localPayload)) {
      showModuleStoreSyncConflict(localPayload, remotePayload);
      return;
    }
    if (localUpdated && remoteUpdated && remoteUpdated < localUpdated) return;

    applyModuleStorePayload(remotePayload);
    writeLocalModuleStorePayload(remotePayload);
    writeModuleStoreSyncMeta(remotePayload);
    updateModuleStoreSizePanel(remotePayload);
    renderAll();
    updateFirebaseSyncStatus('synced', 'Online-Stand übernommen.');
    showAppStatus('Almanach-Module wurden synchronisiert.', 'success');
  } catch (error) {
    console.error('remote module store apply failed:', error);
    updateFirebaseSyncStatus('error', 'Online gespeicherte Module konnten nicht übernommen werden.');
    showAppStatus('Online gespeicherte Module konnten nicht übernommen werden.', 'error');
  }
}

async function setupModuleStoreRemoteSync() {
  if (_moduleStoreRemoteSyncStarted) return;
  _moduleStoreRemoteSyncStarted = true;

  try {
    const ready = await waitForFirebaseReady();
    if (!ready || !window._fb?.loadModuleStore) {
      updateFirebaseSyncStatus('offline', 'Online-Speicher nicht erreichbar. Änderungen bleiben lokal.');
      return;
    }
    updateFirebaseSyncStatus('syncing', 'Online-Speicher wird geprüft...');

    const localPayload = readLocalModuleStorePayload();
    const remotePayload = normalizeModuleStorePayload(await window._fb.loadModuleStore());
    const localHasContent = hasModuleStoreContent(localPayload);
    const remoteHasContent = hasModuleStoreContent(remotePayload);
    const localUpdated = getModuleStoreUpdatedAt(localPayload);
    const remoteUpdated = getModuleStoreUpdatedAt(remotePayload);
    const sameContent = getModuleStoreContentSignature(remotePayload) === getModuleStoreContentSignature(localPayload);

    if (localHasContent && remoteHasContent && !sameContent && !isLocalModuleStoreSynced(localPayload)) {
      showModuleStoreSyncConflict(localPayload, remotePayload);
      return;
    }

    if (remoteHasContent && (!localHasContent || !localUpdated || remoteUpdated >= localUpdated)) {
      applyModuleStorePayload(remotePayload);
      writeLocalModuleStorePayload(remotePayload);
      writeModuleStoreSyncMeta(remotePayload);
      updateModuleStoreSizePanel(remotePayload);
      if (!sameContent) {
        renderAll();
        showAppStatus('Almanach-Module wurden vom Online-Speicher geladen.', 'success');
      }
      updateFirebaseSyncStatus('synced', 'Online-Stand geladen.');
    } else if (localHasContent && (!remoteHasContent || !remoteUpdated || localUpdated > remoteUpdated)) {
      const publishPayload = localUpdated ? localPayload : { ...localPayload, updatedAtClient: Date.now() };
      writeLocalModuleStorePayload(publishPayload);
      await pushModuleStoreToFirebase(publishPayload);
      writeModuleStoreSyncMeta(publishPayload);
      updateModuleStoreSizePanel(publishPayload);
      updateFirebaseSyncStatus('synced', 'Lokaler Stand wurde online gespeichert.');
      if (!remoteHasContent) showAppStatus('Lokale Almanach-Module wurden online gespeichert.', 'success');
    } else {
      updateFirebaseSyncStatus('synced', remoteHasContent ? 'Online-Stand aktuell.' : 'Kein Modul-Backup nötig.');
    }

    if (window._fb?.subscribeModuleStore && !_moduleStoreRemoteUnsubscribe) {
      _moduleStoreRemoteUnsubscribe = window._fb.subscribeModuleStore(applyRemoteModuleStore);
    }
  } catch (error) {
    console.error('module store remote sync failed:', error);
    updateFirebaseSyncStatus('error', 'Online-Synchronisation fehlgeschlagen.');
    showFriendlyAppError(error, 'Almanach-Module konnten nicht online synchronisiert werden.');
  }
}
