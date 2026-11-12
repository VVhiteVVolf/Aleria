function normalizeModuleStorePayload(payload) {
  if (typeof payload?.data === 'string') {
    try {
      return normalizeModuleStorePayload(JSON.parse(payload.data || '{}'));
    } catch (error) {
      console.error('module store data parse failed:', error);
    }
  }

  const sectionPolicy = globalThis.AleriaModuleSectionPolicy;
  const customSections = Array.isArray(payload?.customSections)
    ? payload.customSections.map(cleanCustomSection)
    : [];
  const treeState = typeof normalizeModuleTreeState === 'function'
    ? normalizeModuleTreeState(payload || {})
    : { nodes: [], assignments: {} };
  const removedEntryIds = new Set(
    customSections
      .filter(section => sectionPolicy?.isRemoved?.(section))
      .flatMap(section => section.entries || [])
      .map(entry => String(entry?.id || '').trim())
      .filter(Boolean)
  );
  const removedNodeIds = new Set(
    treeState.nodes
      .filter(node => sectionPolicy?.isRemoved?.(node))
      .map(node => String(node?.id || '').trim())
      .filter(Boolean)
  );
  Object.entries(treeState.assignments || {}).forEach(([entryId, nodeId]) => {
    if (removedNodeIds.has(String(nodeId || ''))) removedEntryIds.add(String(entryId || '').trim());
  });
  const moduleSectionMoves = Object.fromEntries(
    Object.entries(payload?.moduleSectionMoves || {})
      .map(([entryId, section]) => [String(entryId || '').trim(), cleanModuleSectionMove(section)])
      .filter(([entryId, section]) => {
        if (!entryId) return false;
        if (!sectionPolicy?.isRemoved?.(section)) return true;
        removedEntryIds.add(entryId);
        return false;
      })
  );
  const moduleSectionNodes = treeState.nodes.filter(node => !sectionPolicy?.isRemoved?.(node));
  const retainedNodeIds = new Set(moduleSectionNodes.map(node => String(node.id || '')).filter(Boolean));
  const moduleNodeAssignments = Object.fromEntries(
    Object.entries(treeState.assignments || {})
      .filter(([entryId, nodeId]) => !removedEntryIds.has(String(entryId || '').trim()) && retainedNodeIds.has(String(nodeId || '')))
  );
  const entryOverrides = {};
  Object.entries(payload?.entryOverrides || {}).forEach(([entryId, entry]) => {
    const id = String(entryId || entry?.id || '').trim();
    if (!id || removedEntryIds.has(id)) return;
    entryOverrides[id] = sanitizeModuleEntry({ ...entry, id });
  });
  const hiddenModuleIds = {};
  Object.entries(payload?.hiddenModuleIds || {}).forEach(([entryId, hidden]) => {
    const id = String(entryId || '').trim();
    if (id && hidden && !removedEntryIds.has(id)) hiddenModuleIds[id] = true;
  });

  return {
    version: Number(payload?.version) || MODULE_STORE_SCHEMA_VERSION,
    updatedAtClient: Number(payload?.updatedAtClient) || 0,
    customSections: customSections.filter(section => !sectionPolicy?.isRemoved?.(section)),
    moduleSectionNodes,
    moduleNodeAssignments,
    moduleSectionMoves,
    hiddenModuleIds,
    archiveDashboardInsights: normalizeArchiveDashboardInsights(payload?.archiveDashboardInsights),
    entryOverrides
  };
}

function makeArchiveDashboardInsightId(item = {}) {
  const input = [
    item.sourceRef,
    item.moduleId,
    item.text
  ].map(value => String(value || '').trim()).join('|');
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `insight-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function normalizeArchiveDashboardInsights(items) {
  return (Array.isArray(items) ? items : [])
    .map(item => ({
      id: String(item?.id || '').trim() || makeArchiveDashboardInsightId(item),
      text: String(item?.text || '').trim().slice(0, 420),
      sourceLabel: String(item?.sourceLabel || '').trim().slice(0, 180),
      sourceRef: String(item?.sourceRef || '').trim().slice(0, 240),
      moduleId: String(item?.moduleId || '').trim().slice(0, 120),
      moduleTitle: String(item?.moduleTitle || '').trim().slice(0, 180),
      pageTitle: String(item?.pageTitle || '').trim().slice(0, 180),
      speakerName: String(item?.speakerName || '').trim().slice(0, 120),
      avatar: sanitizeImageSrc(item?.avatar || ''),
      generatedAt: String(item?.generatedAt || '').trim().slice(0, 40),
      sourceHash: String(item?.sourceHash || '').trim().slice(0, 80)
    }))
    .filter(item => item.text && (item.moduleId || item.sourceRef || item.sourceLabel))
    .slice(0, 5);
}

function getModuleStorePayload(updatedAtClient = Date.now()) {
  if (typeof ensureKnownModuleSectionNodes === 'function') ensureKnownModuleSectionNodes();
  return normalizeModuleStorePayload({
    version: MODULE_STORE_SCHEMA_VERSION,
    updatedAtClient,
    customSections: _customSections.map(cleanCustomSection),
    moduleSectionNodes: _moduleSectionNodes.map(cleanModuleSectionNode),
    moduleNodeAssignments: Object.fromEntries(
      Object.entries(_moduleNodeAssignments || {})
        .map(([entryId, nodeId]) => [String(entryId || '').trim(), String(nodeId || '').trim()])
        .filter(([entryId, nodeId]) => entryId && nodeId)
    ),
    moduleSectionMoves: Object.fromEntries(
      Object.entries(_moduleSectionMoves || {})
        .map(([entryId, section]) => [String(entryId || '').trim(), cleanModuleSectionMove(section)])
        .filter(([entryId]) => entryId)
    ),
    hiddenModuleIds: Object.fromEntries(
      Object.entries(_hiddenModuleIds || {})
        .map(([entryId, hidden]) => [String(entryId || '').trim(), !!hidden])
        .filter(([entryId, hidden]) => entryId && hidden)
    ),
    archiveDashboardInsights: _archiveDashboardInsights,
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

function getModuleStoreStorageSizes(payload) {
  const normalized = normalizeModuleStorePayload(payload);
  const entries = [...normalized.customSections.flatMap(section => section.entries || []),
    ...Object.values(normalized.entryOverrides)];
  const manifest = { ...normalized,
    customSections: normalized.customSections.map(({ entries, ...section }) => ({
      ...section, entryIds: (entries || []).map(entry => entry.id)
    })), entryOverrides: Object.keys(normalized.entryOverrides) };
  return {
    bytes: getUtf8ByteLength(JSON.stringify(normalized)),
    largestDocumentBytes: entries.reduce((largest, entry) => Math.max(largest,
      getUtf8ByteLength(JSON.stringify(entry))), getUtf8ByteLength(JSON.stringify(manifest)))
  };
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
  let largestDocumentBytes = 0;
  try {
    ({ bytes, largestDocumentBytes } = getModuleStoreStorageSizes(payload));
  } catch (error) {
    console.warn('module store size calculation failed:', error);
  }
  const state = getModuleStoreSizeState(largestDocumentBytes);
  const percent = Math.min(100, Math.round((largestDocumentBytes / MODULE_STORE_FIREBASE_LIMIT_BYTES) * 100));
  const text = document.getElementById('me-module-store-size-text');
  const bar = document.getElementById('me-module-store-size-bar');
  const note = document.getElementById('me-module-store-size-note');

  panel.classList.toggle('warn', state === 'warn');
  panel.classList.toggle('danger', state === 'danger');
  if (text) text.textContent = `Gesamt: ${formatStorageBytes(bytes)} · größter Eintrag: ${formatStorageBytes(largestDocumentBytes)} / ca. ${formatStorageBytes(MODULE_STORE_FIREBASE_LIMIT_BYTES)}`;
  if (bar) bar.style.width = `${percent}%`;
  if (note) {
    note.textContent = state === 'danger'
      ? 'Ein einzelner Eintrag liegt nahe am Online-Limit. Große Module aufteilen und vorher ein Vollbackup herunterladen.'
      : state === 'warn'
        ? 'Ein einzelner Eintrag wird groß. Vollbackups regelmäßig herunterladen.'
        : 'Module werden einzeln online gespeichert. Das Online-Limit gilt je Eintrag, nicht für den Gesamtbestand.';
  }
}

function warnIfModuleStoreSizeIsHigh(payload = getModuleStorePayload(Date.now())) {
  const { bytes, largestDocumentBytes } = getModuleStoreStorageSizes(payload);
  const state = getModuleStoreSizeState(largestDocumentBytes);
  updateModuleStoreSizePanel(payload);
  if (state === 'danger') {
    showAppStatus(`Ein Moduleintrag ist sehr groß (${formatStorageBytes(largestDocumentBytes)}). Bitte aufteilen und ein Vollbackup herunterladen.`, 'error', { timeout: 0 });
    if (typeof setModuleEditorStatus === 'function') {
      setModuleEditorStatus(`Warnung: Ein Moduleintrag ist sehr groß (${formatStorageBytes(largestDocumentBytes)}). Vor weiteren Importen Vollbackup herunterladen.`, true);
    }
  } else if (state === 'warn' && document.getElementById('module-editor-overlay')?.classList.contains('active')) {
    setModuleEditorStatus(`Hinweis: Der größte Moduleintrag umfasst ${formatStorageBytes(largestDocumentBytes)}. Vollbackups regelmäßig herunterladen.`);
  }
  return { bytes, state };
}

function confirmBackupBeforeDestructiveImport(label, details = '') {
  const extra = details ? `\n\n${details}` : '';
  return confirm(`${label} fortsetzen?${extra}\n\nVor diesem Import solltest du zuerst "Vollbackup herunterladen" nutzen. Der Import schreibt Daten nach Firebase und ueberschreibt gleiche IDs.`);
}

function getCanonicalModuleStoreJson(value) {
  // Firestore sorts map keys. Object insertion order must not turn an
  // unchanged round trip into a conflict; array order remains meaningful.
  const canonicalize = value => Array.isArray(value)
    ? value.map(canonicalize)
    : value && typeof value === 'object'
      ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalize(value[key])]))
      : value;
  return JSON.stringify(canonicalize(value));
}

function getModuleStoreContentSignature(payload) {
  const normalized = normalizeModuleStorePayload(payload);
  return getCanonicalModuleStoreJson({
    customSections: normalized.customSections,
    moduleSectionNodes: normalized.moduleSectionNodes,
    moduleNodeAssignments: normalized.moduleNodeAssignments,
    moduleSectionMoves: normalized.moduleSectionMoves,
    hiddenModuleIds: normalized.hiddenModuleIds,
    archiveDashboardInsights: normalized.archiveDashboardInsights,
    entryOverrides: normalized.entryOverrides
  });
}

// Tabs share cache records, but sync timestamps and Firestore map ordering are
// not edits. Only known content may relax the persistence layer's strict CAS.
function areModuleStoreLocalRecordsEquivalent(key, left, right) {
  if (left === right) return true;
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  try {
    const first = JSON.parse(left);
    const second = JSON.parse(right);
    const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
    const hasSupportedSchema = value => isRecord(value)
      && (!Object.hasOwn(value, 'version') || value.version === MODULE_STORE_SCHEMA_VERSION);
    if (!isRecord(first) || !isRecord(second)) return false;
    if (key === MODULE_STORE_KEY) {
      const content = value => {
        const record = { version: MODULE_STORE_SCHEMA_VERSION, ...value };
        delete record.updatedAtClient;
        return getCanonicalModuleStoreJson(record);
      };
      // Compare the raw schema fields, including unfamiliar ones. Normalizing
      // here could discard an edit before deciding whether it is safe to write.
      return hasSupportedSchema(first) && hasSupportedSchema(second)
        && content(first) === content(second);
    }
    if (key === MODULE_STORE_SYNC_META_KEY && first.signature === second.signature) {
      const signature = first.signature;
      if (typeof signature !== 'string') return false;
      if (/^sha256:[a-f0-9]{64}$/.test(signature)) return true;
      // Legacy receipts embed their original content instead of a digest.
      return hasSupportedSchema(JSON.parse(signature));
    }
  } catch { /* Unreadable records retain byte-for-byte conflict protection. */ }
  return false;
}

function readModuleStoreSyncMeta() {
  try {
    const raw = moduleStoreLocalPersistence.read(MODULE_STORE_SYNC_META_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('module sync meta read failed:', error);
    return null;
  }
}

async function getModuleStoreSyncSignature(payload) {
  const bytes = new TextEncoder().encode(getModuleStoreContentSignature(payload));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return `sha256:${Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')}`;
}

async function writeModuleStoreSyncMeta(payload, previousMeta = null) {
  const normalized = normalizeModuleStorePayload(payload);
  await moduleStoreLocalPersistence.write(MODULE_STORE_SYNC_META_KEY, JSON.stringify({
    signature: await getModuleStoreSyncSignature(normalized),
    updatedAtClient: previousMeta?.updatedAtClient ?? getModuleStoreUpdatedAt(normalized),
    syncedAt: previousMeta?.syncedAt ?? Date.now()
  }));
}

async function isLocalModuleStoreSynced(payload) {
  const meta = readModuleStoreSyncMeta();
  if (!meta?.signature) return false;
  if (meta.signature.startsWith('sha256:')) return meta.signature === await getModuleStoreSyncSignature(payload);
  try {
    // Also recognize sync receipts written before canonical signatures.
    return getModuleStoreContentSignature(JSON.parse(meta.signature)) === getModuleStoreContentSignature(payload);
  } catch {
    return false;
  }
}

async function getCurrentModuleStoreSyncState(remotePayload) {
  // Hashing is asynchronous. Recheck the snapshot so an edit made during a
  // digest cannot be replaced by the incoming online snapshot.
  while (true) {
    const localPayload = readLocalModuleStorePayload();
    const signature = getModuleStoreContentSignature(localPayload);
    const receipt = moduleStoreLocalPersistence.read(MODULE_STORE_SYNC_META_KEY);
    const [localIsSynced, remoteIsSynced] = await Promise.all([
      isLocalModuleStoreSynced(localPayload), isLocalModuleStoreSynced(remotePayload)
    ]);
    if (signature !== getModuleStoreContentSignature(readLocalModuleStorePayload())
      || receipt !== moduleStoreLocalPersistence.read(MODULE_STORE_SYNC_META_KEY)) continue;
    return { localPayload, localIsSynced, remoteIsSynced,
      sameContent: signature === getModuleStoreContentSignature(remotePayload) };
  }
}

function hasModuleStoreContent(payload) {
  const normalized = normalizeModuleStorePayload(payload);
  return normalized.customSections.length
    || normalized.moduleSectionNodes.length
    || Object.keys(normalized.moduleNodeAssignments).length
    || Object.keys(normalized.moduleSectionMoves).length
    || Object.keys(normalized.hiddenModuleIds).length
    || normalized.archiveDashboardInsights.length
    || Object.keys(normalized.entryOverrides).length;
}

function getModuleStoreSummary(payload) {
  const normalized = normalizeModuleStorePayload(payload);
  const customModuleCount = normalized.customSections.reduce((sum, section) => sum + (section.entries?.length || 0), 0);
  const overrideCount = Object.keys(normalized.entryOverrides).length;
  const sectionCount = normalized.moduleSectionNodes.length || normalized.customSections.length;
  return `${sectionCount} Bereiche, ${customModuleCount} eigene Module, ${overrideCount} Ueberschreibungen, ${normalized.archiveDashboardInsights.length} Archivfunken`;
}

// Compatibility for old delegated actions: online is the only selectable source.
// The status badge owns its details; no conflict dialog opens automatically.
function showStoredModuleStoreConflict() {
  if (typeof setFirebaseSyncStatusMinimized === 'function') setFirebaseSyncStatusMinimized(false);
}

async function resolveModuleStoreSyncConflict() {
  showStoredModuleStoreConflict();
}

window.resolveModuleStoreSyncConflict = resolveModuleStoreSyncConflict;
window.showStoredModuleStoreConflict = showStoredModuleStoreConflict;

function getModuleStoreUpdatedAt(payload) {
  return Number(payload?.updatedAtClient) || 0;
}

function readLocalModuleStorePayload() {
  const raw = moduleStoreLocalPersistence.read(MODULE_STORE_KEY);
  return raw ? normalizeModuleStorePayload(JSON.parse(raw)) : normalizeModuleStorePayload(null);
}

function writeLocalModuleStorePayload(payload) {
  return moduleStoreLocalPersistence.write(MODULE_STORE_KEY, JSON.stringify(normalizeModuleStorePayload(payload)));
}

async function cleanupSyncedModuleStoreCache(options = {}) {
  try {
    const localPayload = readLocalModuleStorePayload();
    if (!hasModuleStoreContent(localPayload)) return false;
    const meta = readModuleStoreSyncMeta();
    if (!meta?.syncedAt || !await isLocalModuleStoreSynced(localPayload)) return false;
    if (!options.force && Date.now() - Number(meta.syncedAt) < MODULE_STORE_SYNCED_CACHE_MAX_AGE_MS) return false;
    await moduleStoreLocalPersistence.write(MODULE_STORE_KEY, null);
    return true;
  } catch (error) {
    console.warn('synced module cache cleanup failed:', error);
    return false;
  }
}

function applyModuleStorePayload(payload) {
  let normalized = normalizeModuleStorePayload(payload);
  if (typeof migrateWindreiterModuleSections === 'function') {
    normalized = migrateWindreiterModuleSections(normalized);
  }
  if (globalThis.AleriaGroupSectionMigration?.migrateCenyrGroupSections) {
    normalized = globalThis.AleriaGroupSectionMigration.migrateCenyrGroupSections(normalized);
  }
  if (globalThis.AleriaGwynthorGeography?.migrateGwynthorModuleStore) {
    normalized = globalThis.AleriaGwynthorGeography.migrateGwynthorModuleStore(normalized, SECTIONS);
  }
  _moduleSectionNodes = normalized.moduleSectionNodes || [];
  _moduleNodeAssignments = normalized.moduleNodeAssignments || {};
  _customSections = normalized.customSections;
  _moduleSectionMoves = normalized.moduleSectionMoves || {};
  _hiddenModuleIds = normalized.hiddenModuleIds || {};
  _archiveDashboardInsights = normalized.archiveDashboardInsights || [];
  _entryOverrides = {};
  Object.entries(normalized.entryOverrides).forEach(([entryId, entry]) => {
    _entryOverrides[entryId] = sanitizeModuleEntry({ ...entry, id: entryId });
  });
  _builtinLibraryCharactersCache = null;
  invalidateArchiveSearchCache();
  window.dispatchEvent(new CustomEvent('almanach:modules-changed'));
  return normalized;
}

async function loadModuleStore() {
  try {
    await moduleStoreLocalPersistence.ready();
    applyModuleStorePayload(readLocalModuleStorePayload());
    const localPayload = readLocalModuleStorePayload();
    const synced = await isLocalModuleStoreSynced(localPayload);
    const meta = readModuleStoreSyncMeta();
    if (meta?.signature && !meta.signature.startsWith('sha256:')) {
      let baseline;
      try { baseline = JSON.parse(meta.signature); }
      catch { console.warn('Unreadable legacy sync receipt; keeping the module cache.'); }
      if (baseline) await writeModuleStoreSyncMeta(baseline, meta);
    }
    updateModuleStoreSizePanel(localPayload);
    if (hasModuleStoreContent(localPayload)) {
      updateFirebaseSyncStatus(
        synced ? 'synced' : 'local',
        synced ? 'Lokaler Cache entspricht dem letzten Online-Stand.' : 'Warte auf Online-Abgleich.'
      );
    } else {
      updateFirebaseSyncStatus('idle', 'Noch keine lokalen Moduländerungen.');
    }
  } catch (error) {
    console.error('module store load failed:', error);
    showAppStatus('Lokale Moduländerungen konnten nicht gelesen werden. Bitte erneut laden; der gespeicherte Stand bleibt erhalten.', 'error', { timeout: 0 });
    updateFirebaseSyncStatus('error', 'Lokale Moduländerungen konnten nicht gelesen werden.');
    // Do not turn an unreadable cache into an empty store that could be
    // published over the user's existing data.
    throw error;
  }
}

async function cleanupLocalAlmanachStorage() {
  const removedDrafts = typeof window.cleanupOldCommentDrafts === 'function'
    ? window.cleanupOldCommentDrafts(30)
    : 0;
  const removedModuleCache = await cleanupSyncedModuleStoreCache();
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

async function pushModuleStoreToFirebase(payload, shouldSave = () => true) {
  await moduleStoreLocalPersistence.flush();
  const ready = await waitForFirebaseReady();
  if (!ready || !window._fb?.saveModuleStore) {
    throw new Error('Firebase ist nicht erreichbar. Moduländerungen bleiben lokal gespeichert.');
  }
  if (!shouldSave()) return false;
  await window._fb.saveModuleStore(normalizeModuleStorePayload(payload));
  return true;
}

function scheduleRemoteModuleStoreSave(payload) {
  clearTimeout(_moduleStoreRemoteSaveTimer);
  _moduleStoreRemoteSaveTimer = null;
  if (moduleStoreSyncActivity.initialReadPending || moduleStoreSyncActivity.deferredRemote) return;
  const generation = moduleStoreSyncActivity.generation;
  updateFirebaseSyncStatus('syncing', 'Moduländerungen werden online gespeichert...');
  _moduleStoreRemoteSaveTimer = window.setTimeout(async () => {
    _moduleStoreRemoteSaveTimer = null;
    try {
      const current = () => generation === moduleStoreSyncActivity.generation
        && !moduleStoreSyncActivity.initialReadPending
        && getModuleStoreContentSignature(payload) === getModuleStoreContentSignature(readLocalModuleStorePayload());
      if (!current()) return;
      if (!await pushModuleStoreToFirebase(payload, current)) return;
      await writeModuleStoreSyncMeta(payload);
      if (current()) updateFirebaseSyncStatus('synced', 'Letzte Moduländerung ist online.');
    } catch (error) {
      console.error('remote module store save failed:', error);
      updateFirebaseSyncStatus('error', 'Noch nicht online gespeichert. Deine Änderung bleibt gesichert.');
      showFriendlyAppError(error, 'Modul wurde gesichert, aber noch nicht online synchronisiert.');
    }
  }, MODULE_STORE_REMOTE_SAVE_DELAY);
}

function saveModuleStore(options = {}) {
  try {
    const payload = getModuleStorePayload(options.updatedAtClient || Date.now());
    clearTimeout(_moduleStoreRemoteSaveTimer);
    _moduleStoreRemoteSaveTimer = null;
    const commit = writeLocalModuleStorePayload(payload);
    _builtinLibraryCharactersCache = null;
    window.dispatchEvent(new CustomEvent('almanach:modules-changed'));
    warnIfModuleStoreSizeIsHigh(payload);
    updateFirebaseSyncStatus('syncing', 'Moduländerung wird im Browser gesichert...');
    commit.then(() => {
      if (getModuleStoreContentSignature(payload) !== getModuleStoreContentSignature(readLocalModuleStorePayload())) return;
      updateFirebaseSyncStatus('local', 'Moduländerung im Browser gesichert.');
      if (options.remote !== false) scheduleRemoteModuleStoreSave(payload);
    }).catch(reportModuleStoreLocalSaveError);
    return true;
  } catch (error) {
    reportModuleStoreLocalSaveError(error);
    return false;
  }
}

function reportModuleStoreLocalSaveError(error) {
  console.error('saveModuleStore failed:', error);
  updateFirebaseSyncStatus('error', 'Lokaler Speicher nicht verfügbar.');
  const message = error?.code === 'module-store-concurrent-write' ? error.message
    : 'Lokaler Speicher ist voll oder nicht verfügbar. Exportiere deine Änderungen als JSON.';
  showAppStatus(message, 'error', { timeout: 0 });
  if (typeof setModuleEditorStatus === 'function') {
    setModuleEditorStatus(message, true);
  }
}

const moduleStoreSyncActivity = { generation: 0, initialReadPending: false, deferredRemote: null };
let moduleStoreRemoteApplyQueue = Promise.resolve();

function cancelPendingModuleStoreUpload() {
  moduleStoreSyncActivity.generation += 1;
  clearTimeout(_moduleStoreRemoteSaveTimer);
  _moduleStoreRemoteSaveTimer = null;
}

function applyRemoteModuleStore(payload) {
  // Invalidate pending writes immediately, before a queued snapshot is hashed.
  cancelPendingModuleStoreUpload();
  const generation = moduleStoreSyncActivity.generation;
  const apply = moduleStoreRemoteApplyQueue.catch(() => {}).then(() => processRemoteModuleStore(payload, generation));
  moduleStoreRemoteApplyQueue = apply;
  return apply;
}

async function preserveUnsyncedModuleStore(localPayload) {
  const signature = await getModuleStoreSyncSignature(localPayload);
  await moduleStoreLocalPersistence.preserveRecovery(signature, JSON.stringify({
    schema: 'aleria.module-store-recovery', schemaVersion: 1,
    reason: 'online-preferred', savedAt: new Date().toISOString(),
    moduleStore: normalizeModuleStorePayload(localPayload)
  }));
}

function deferOnlineModuleStoreDuringEdit(payload) {
  if (!_inlineModuleEdit?.active) return false;
  moduleStoreSyncActivity.deferredRemote = { payload };
  updateFirebaseSyncStatus('syncing', 'Online-Änderung empfangen. Sie wird nach der Bearbeitung geladen.');
  return true;
}

async function adoptOnlineModuleStore(remotePayload, generation) {
  let recovered = false;
  while (true) {
    const state = await getCurrentModuleStoreSyncState(remotePayload);
    if (generation !== moduleStoreSyncActivity.generation || deferOnlineModuleStoreDuringEdit(remotePayload)) return { applied: false, recovered };
    if (!state.sameContent && hasModuleStoreContent(state.localPayload) && !state.localIsSynced) {
      await preserveUnsyncedModuleStore(state.localPayload);
      recovered = true;
    }
    // Edits made while the recovery transaction committed must also be retained.
    if (getModuleStoreContentSignature(state.localPayload)
      !== getModuleStoreContentSignature(readLocalModuleStorePayload())) continue;
    if (generation !== moduleStoreSyncActivity.generation || deferOnlineModuleStoreDuringEdit(remotePayload)) return { applied: false, recovered };
    applyModuleStorePayload(remotePayload);
    if (!state.sameContent) {
      await writeLocalModuleStorePayload(remotePayload);
      updateModuleStoreSizePanel(remotePayload);
      renderAll();
    }
    await writeModuleStoreSyncMeta(remotePayload);
    _moduleStoreSyncConflict = null;
    const stillCurrent = getModuleStoreContentSignature(remotePayload)
      === getModuleStoreContentSignature(readLocalModuleStorePayload());
    if (stillCurrent) updateFirebaseSyncStatus('synced', recovered
      ? 'Online-Stand geladen. Eine abweichende Browserfassung ist im Vollbackup erhalten.'
      : 'Online-Stand aktuell.');
    return { applied: stillCurrent, recovered };
  }
}

async function processRemoteModuleStore(payload, generation) {
  if (generation !== moduleStoreSyncActivity.generation || deferOnlineModuleStoreDuringEdit(payload)) return;
  try {
    const remotePayload = normalizeModuleStorePayload(payload);
    const result = await adoptOnlineModuleStore(remotePayload, generation);
    if (result.applied && globalThis.AleriaModuleSectionPolicy?.hasRemovedContent?.(payload)) {
      scheduleRemoteModuleStoreSave({ ...remotePayload, updatedAtClient: Date.now() });
    }
  } catch (error) {
    console.error('remote module store apply failed:', error);
    updateFirebaseSyncStatus('error', 'Online gespeicherte Module konnten nicht übernommen werden.');
    showAppStatus('Online gespeicherte Module konnten nicht übernommen werden. Deine Browserfassung bleibt erhalten.', 'error');
  }
}

async function setupModuleStoreRemoteSync() {
  if (_moduleStoreRemoteSyncStarted) return;
  _moduleStoreRemoteSyncStarted = true;
  moduleStoreSyncActivity.initialReadPending = true;
  cancelPendingModuleStoreUpload();
  let startupOffline = false;

  try {
    await moduleStoreLocalPersistence.ready();
    const ready = await waitForFirebaseReady();
    if (!ready || !window._fb?.loadModuleStore) {
      _moduleStoreRemoteSyncStarted = false;
      startupOffline = true;
      updateFirebaseSyncStatus('offline', 'Online-Speicher nicht erreichbar. Änderungen bleiben gesichert.');
      return;
    }
    updateFirebaseSyncStatus('syncing', 'Online-Stand wird geladen...');
    const remoteSource = await window._fb.loadModuleStore();
    await applyRemoteModuleStore(remoteSource);
    subscribeToModuleStoreUpdates();
  } catch (error) {
    if (error?.code === 'module-store-awaiting-server') {
      updateFirebaseSyncStatus('syncing', 'Warte auf den bestätigten Online-Stand...');
      subscribeToModuleStoreUpdates();
      return;
    }
    _moduleStoreRemoteSyncStarted = false;
    startupOffline = true;
    console.error('module store remote sync failed:', error);
    updateFirebaseSyncStatus('error', 'Online-Synchronisation fehlgeschlagen.');
    showFriendlyAppError(error, 'Almanach-Module konnten nicht online synchronisiert werden.');
  } finally {
    moduleStoreSyncActivity.initialReadPending = false;
    window.dispatchEvent(new CustomEvent('almanach:initial-modules-settled', {
      detail: { offline: startupOffline }
    }));
  }
}

function subscribeToModuleStoreUpdates() {
  if (!window._fb?.subscribeModuleStore || _moduleStoreRemoteUnsubscribe) return;
  _moduleStoreRemoteUnsubscribe = window._fb.subscribeModuleStore(applyRemoteModuleStore, error => {
    updateFirebaseSyncStatus('error', 'Live-Synchronisation unterbrochen.');
    showFriendlyAppError(error, 'Online-Änderungen konnten nicht geladen werden. Lokale Änderungen bleiben erhalten.');
  });
}

window.addEventListener('almanach:inline-module-edit-ended', () => {
  const deferred = moduleStoreSyncActivity.deferredRemote;
  if (!deferred || _inlineModuleEdit?.active) return;
  moduleStoreSyncActivity.deferredRemote = null;
  applyRemoteModuleStore(deferred.payload);
});

window.addEventListener('fb-ready', () => {
  if (typeof _appInitialized !== 'undefined' && _appInitialized) setupModuleStoreRemoteSync();
});
window.addEventListener('online', () => {
  if (typeof _appInitialized !== 'undefined' && _appInitialized) setupModuleStoreRemoteSync();
});
