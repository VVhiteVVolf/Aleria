const MODULE_EDITOR_DRAFT_PREFIX = 'aleria-module-editor-draft-v1:';
const MODULE_EDITOR_DRAFT_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const MODULE_EDITOR_DRAFT_SAVE_DELAY = 600;
let _moduleEditorDraftSaveTimer = null;

function getModuleEditorDraftIdentity(context = _moduleEditorContext) {
  if (!context || context.sourceKind === 'scene-comment-module') return '';
  const sourceId = String(context.sourceEntryId || context.payload?.entry?.id || '').trim();
  if (sourceId) return `entry:${sourceId}`;
  return context.mode === 'new' ? 'new-module' : '';
}

function getModuleEditorDraftStorageKey(context = _moduleEditorContext) {
  const identity = getModuleEditorDraftIdentity(context);
  return identity ? `${MODULE_EDITOR_DRAFT_PREFIX}${identity}` : '';
}

function clearPendingModuleEditorDraftSave() {
  if (_moduleEditorDraftSaveTimer) clearTimeout(_moduleEditorDraftSaveTimer);
  _moduleEditorDraftSaveTimer = null;
}

function clearModuleEditorRecoveryDraft(context = _moduleEditorContext) {
  clearPendingModuleEditorDraftSave();
  const key = getModuleEditorDraftStorageKey(context);
  if (!key) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Lokale Wiederherstellung ist optional; Speichern des eigentlichen Moduls bleibt unbeeinflusst.
  }
}

function saveModuleEditorRecoveryDraft(context = _moduleEditorContext) {
  clearPendingModuleEditorDraftSave();
  if (!hasUnsavedModuleEditorChanges()) return;
  const key = getModuleEditorDraftStorageKey(context);
  if (!key) return;
  try {
    const payload = collectModuleEditorPayload();
    localStorage.setItem(key, JSON.stringify({
      version: 1,
      savedAt: Date.now(),
      payload
    }));
  } catch {
    // Quota-, Datenschutz- oder private Browsermodi duerfen den Editor nicht blockieren.
  }
}

function scheduleModuleEditorRecoveryDraft(context = _moduleEditorContext) {
  clearPendingModuleEditorDraftSave();
  if (!hasUnsavedModuleEditorChanges() || !getModuleEditorDraftIdentity(context)) return;
  _moduleEditorDraftSaveTimer = setTimeout(() => saveModuleEditorRecoveryDraft(context), MODULE_EDITOR_DRAFT_SAVE_DELAY);
}

function readModuleEditorRecoveryDraft(context) {
  const key = getModuleEditorDraftStorageKey(context);
  if (!key) return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || 'null');
    const savedAt = Number(parsed?.savedAt) || 0;
    if (!parsed?.payload?.entry || !savedAt || Date.now() - savedAt > MODULE_EDITOR_DRAFT_MAX_AGE) {
      localStorage.removeItem(key);
      return null;
    }
    return {
      savedAt,
      payload: {
        section: parsed.payload.section || context?.payload?.section || {},
        entry: sanitizeModuleEntry(parsed.payload.entry)
      }
    };
  } catch {
    try { localStorage.removeItem(key); } catch { /* optional */ }
    return null;
  }
}

function resolveModuleEditorRecoveryDraft(payload, context = {}) {
  const safeContext = { ...context, payload };
  const recovery = readModuleEditorRecoveryDraft(safeContext);
  if (!recovery) return { payload, context: safeContext };
  const savedLabel = new Date(recovery.savedAt).toLocaleString('de-DE');
  if (!confirm(`Lokalen Entwurf vom ${savedLabel} wiederherstellen?\n\nDer gespeicherte Modulstand bleibt unveraendert, bis du erneut speicherst.`)) {
    clearModuleEditorRecoveryDraft(safeContext);
    return { payload, context: safeContext };
  }
  return {
    payload: recovery.payload,
    context: { ...safeContext, recoveryBasePayload: payload, restoredRecoveryDraft: true }
  };
}

window.addEventListener('pagehide', () => {
  if (hasUnsavedModuleEditorChanges()) saveModuleEditorRecoveryDraft();
});
