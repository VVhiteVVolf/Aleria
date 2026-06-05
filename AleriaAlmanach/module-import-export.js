// Modul-Import, Modul-Export und Masterpakete.
// Aus app.js ausgelagert, damit der Editor-Code uebersichtlicher bleibt.

function exportModulePayload(payload, download = true, context = {}) {
  const validation = assertValidModulePayload(payload, { ...context, skipIdConflict: true });
  const json = validation.json || modulePayloadToJson({ section: validation.section, entry: validation.entry });
  const textarea = document.getElementById('me-json');
  if (textarea) textarea.value = json;
  if (!download) return;
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${slugify(payload.entry?.title || payload.entry?.id || 'aleriamodul')}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

async function buildModulePackageExportPayload(payload, context = {}) {
  const validation = assertValidModulePayload(payload, { ...context, skipIdConflict: true });
  const modulePayload = {
    type: 'aleria-module',
    version: MODULE_EXPORT_SCHEMA_VERSION,
    section: {
      key: validation.section.key,
      tab: validation.section.tab || validation.section.key,
      desc: validation.section.desc || ''
    },
    entry: sanitizeModuleEntry(validation.entry)
  };
  const commentsExport = await buildModuleCommentExportPayload(modulePayload);
  return buildModulePackagePayloadFromCommentExport(modulePayload, commentsExport);
}

function buildModulePackagePayloadFromCommentExport(modulePayload, commentsExport) {
  return {
    type: 'aleria-module-package',
    version: MODULE_PACKAGE_EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    module: modulePayload,
    commentsExport,
    summary: {
      moduleId: modulePayload.entry.id,
      moduleTitle: modulePayload.entry.title || '',
      pageCount: Array.isArray(modulePayload.entry.pages) ? modulePayload.entry.pages.length : 0,
      threadCount: commentsExport.summary?.threadCount || 0,
      commentCount: commentsExport.summary?.commentCount || 0,
      turnCount: commentsExport.summary?.turnCount || 0
    }
  };
}

async function exportModulePackage(payload, context = {}) {
  const packagePayload = await buildModulePackageExportPayload(payload, context);
  const textarea = document.getElementById('me-json');
  if (textarea) textarea.value = JSON.stringify(packagePayload, null, 2);
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const moduleSlug = slugify(packagePayload.summary.moduleTitle || packagePayload.summary.moduleId || 'aleria-modulpaket');
  downloadJsonFile(packagePayload, `${moduleSlug}-modulpaket-${stamp}.json`);
  return packagePayload;
}

async function exportCurrentModule() {
  if (!currentEntry?.id) return;
  const payload = buildModuleExportPayload(currentEntry.id);
  if (!payload) return;
  try {
    const packagePayload = await exportModulePackage(payload, { mode: 'edit', sourceEntryId: currentEntry.id });
    showAppStatus(`Modulpaket exportiert: ${packagePayload.summary.commentCount} Kommentare eingebettet.`, 'success');
  } catch (error) {
    console.error('module package export failed:', error);
    showAppStatus(getFriendlyErrorMessage(error, 'Modulpaket konnte nicht exportiert werden.'), 'error');
  }
}

async function exportModuleFromEditor() {
  try {
    setModuleEditorStatus('Modulpaket wird erstellt...');
    const packagePayload = await exportModulePackage(collectModuleEditorPayload(), _moduleEditorContext || {});
    setModuleEditorStatus(`Modulpaket erstellt: ${packagePayload.summary.commentCount} Kommentare in ${packagePayload.summary.threadCount} Threads eingebettet.`);
  } catch (error) {
    console.error('module package export failed:', error);
    setModuleEditorStatus(getFriendlyErrorMessage(error, 'Export fehlgeschlagen.'), true);
  }
}

function remapModuleCommentThreadId(threadId, sourceEntryId, targetEntryId) {
  const raw = String(threadId || '').trim();
  const sourceId = String(sourceEntryId || '').trim();
  const targetId = String(targetEntryId || '').trim();
  if (!raw || !sourceId || !targetId || sourceId === targetId) return raw;
  const location = parseCommentThreadLocation(raw);
  if (location.baseEntryId !== sourceId) return raw;
  if (location.kind === 'session') return getSessionThreadId(targetId, location.pageIndex);
  if (location.kind === 'page') return getPageCommentThreadId(targetId, location.pageIndex);
  return targetId;
}

function getModuleCommentBundleSourceId(bundle, targetEntryId = '') {
  const direct = String(bundle?.source?.moduleId || '').trim();
  if (direct) return direct;
  const firstCommentThread = String(bundle?.comments?.find(comment => comment?.entryId)?.entryId || '').trim();
  if (firstCommentThread) return parseCommentThreadLocation(firstCommentThread).baseEntryId;
  const firstTurnThread = String(bundle?.commentTurns?.find(turn => turn?.threadId || turn?.id)?.threadId || bundle?.commentTurns?.find(turn => turn?.id)?.id || '').trim();
  if (firstTurnThread) return parseCommentThreadLocation(firstTurnThread).baseEntryId;
  return String(targetEntryId || '').trim();
}

function makeImportedCommentId(originalId, sourceEntryId, targetEntryId, fallbackIndex = 0) {
  const base = String(originalId || '').trim() || `import-${Date.now()}-${fallbackIndex}`;
  if (String(sourceEntryId || '') === String(targetEntryId || '')) return base;
  return `${base}__${slugify(targetEntryId || 'modul')}`;
}

async function importModuleCommentsBundle(bundle, targetEntryId) {
  if (!bundle) return { commentCount: 0, turnCount: 0 };
  const normalized = normalizeModuleCommentImportBundle(bundle, { id: targetEntryId });
  if (!normalized) return { commentCount: 0, turnCount: 0 };
  const commentBackend = typeof getCommentBackend === 'function'
    ? await getCommentBackend({ timeoutMs: 1200 })
    : window._fb;
  if (!commentBackend?.saveBackupComment) {
    throw new Error('Kommentar-Import ist nicht verfügbar.');
  }
  const sourceEntryId = getModuleCommentBundleSourceId(normalized, targetEntryId);
  const targetId = String(targetEntryId || '').trim();
  let commentCount = 0;
  let turnCount = 0;

  for (const [index, comment] of normalized.comments.entries()) {
    const oldId = String(comment?.id || '').trim();
    const newId = makeImportedCommentId(oldId, sourceEntryId, targetId, index + 1);
    const data = cloneForBackup(comment);
    data.entryId = remapModuleCommentThreadId(data.entryId, sourceEntryId, targetId) || targetId;
    delete data.id;
    delete data.exportOrder;
    delete data.threadOrder;
    await commentBackend.saveBackupComment(newId, data);
    commentCount += 1;
  }

  if (commentBackend.saveBackupCommentTurn) {
    for (const turn of normalized.commentTurns) {
      const data = cloneForBackup(turn);
      const oldThreadId = String(data.threadId || data.id || '').trim();
      const newThreadId = remapModuleCommentThreadId(oldThreadId, sourceEntryId, targetId);
      data.threadId = newThreadId;
      delete data.id;
      await commentBackend.saveBackupCommentTurn(newThreadId, data);
      turnCount += 1;
    }
  }

  return { commentCount, turnCount };
}

function collectAllModuleExportPayloads() {
  const modules = [];
  const seen = new Set();
  getValidSections().forEach(section => {
    const sectionPayload = {
      key: section.key,
      tab: section.tab || section.key,
      desc: section.desc || ''
    };
    (section.entries || []).forEach(entry => {
      const cleanEntry = sanitizeModuleEntry(entry);
      if (!cleanEntry.id || seen.has(cleanEntry.id)) return;
      seen.add(cleanEntry.id);
      modules.push({
        type: 'aleria-module',
        version: MODULE_EXPORT_SCHEMA_VERSION,
        section: sectionPayload,
        entry: cleanEntry
      });
    });
  });
  return modules;
}

async function buildAllModulePackagesExportPayload() {
  const modules = collectAllModuleExportPayloads();
  const commentBackend = typeof getCommentBackend === 'function'
    ? await getCommentBackend({ timeoutMs: 1200 })
    : window._fb;
  if (!commentBackend?.loadAllComments) {
    throw new Error('Kommentar-Export ist nicht verfügbar.');
  }
  const [allComments, allTurns] = await Promise.all([
    commentBackend.loadAllComments(),
    commentBackend.loadAllCommentTurns ? commentBackend.loadAllCommentTurns() : Promise.resolve([])
  ]);
  const packages = modules.map(modulePayload => {
    const commentsExport = buildModuleCommentExportPayloadFromLoaded(modulePayload, allComments, allTurns);
    return buildModulePackagePayloadFromCommentExport(modulePayload, commentsExport);
  });
  const summary = packages.reduce((acc, item) => {
    acc.moduleCount += 1;
    acc.pageCount += item.summary.pageCount || 0;
    acc.threadCount += item.summary.threadCount || 0;
    acc.commentCount += item.summary.commentCount || 0;
    acc.turnCount += item.summary.turnCount || 0;
    return acc;
  }, { moduleCount: 0, pageCount: 0, threadCount: 0, commentCount: 0, turnCount: 0 });
  return {
    type: 'aleria-module-master-package',
    version: 1,
    exportedAt: new Date().toISOString(),
    summary,
    modules: packages
  };
}

async function exportAllModulePackages() {
  try {
    setModuleEditorStatus('Masterpaket wird erstellt...');
    updateFirebaseSyncStatus('syncing', 'Alle Module und Kommentare werden gelesen...');
    const payload = await buildAllModulePackagesExportPayload();
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    downloadJsonFile(payload, `aleria-module-masterpaket-${stamp}.json`);
    setModuleEditorStatus(`Masterpaket erstellt: ${payload.summary.moduleCount} Module, ${payload.summary.commentCount} Kommentare.`);
    updateFirebaseSyncStatus(_firebaseSyncState === 'error' ? 'error' : 'synced', 'Masterpaket exportiert.');
  } catch (error) {
    console.error('master module export failed:', error);
    setModuleEditorStatus(getFriendlyErrorMessage(error, 'Masterpaket konnte nicht erstellt werden.'), true);
    updateFirebaseSyncStatus('error', 'Master-Export fehlgeschlagen.');
  }
}

function normalizeMasterModulePackagePayload(parsed) {
  if (!parsed || typeof parsed !== 'object' || parsed.type !== 'aleria-module-master-package') {
    throw new Error('Das ist kein Masterpaket für Module.');
  }
  const items = Array.isArray(parsed.modules) ? parsed.modules : [];
  const modules = items.map(item => normalizeModuleImportPayload(item));
  if (!modules.length) throw new Error('Das Masterpaket enthält keine Module.');
  return {
    version: Number(parsed.version) || 1,
    summary: parsed.summary || {},
    modules
  };
}

async function applyAllModulePackagesPayload(parsed) {
  const master = normalizeMasterModulePackagePayload(parsed);
  if (!confirmDiscardModuleEditorChanges('Masterpaket importieren')) return;
  const summary = master.modules.reduce((acc, item) => {
    const commentSummary = getModuleImportCommentSummary(item.commentBundle);
    acc.commentCount += commentSummary.commentCount;
    acc.threadCount += commentSummary.threadCount;
    acc.turnCount += commentSummary.turnCount;
    return acc;
  }, { commentCount: 0, threadCount: 0, turnCount: 0 });
  if (!confirmBackupBeforeDestructiveImport('Masterpaket importieren', `Module: ${master.modules.length}\nKommentare: ${summary.commentCount} in ${summary.threadCount} Threads\nRedestab-Staende: ${summary.turnCount}`)) {
    return;
  }
  if (!confirm(`Masterpaket importieren?\n\nModule: ${master.modules.length}\nKommentare: ${summary.commentCount} in ${summary.threadCount} Threads\nRedestab-Stände: ${summary.turnCount}\n\nGleiche Modul-IDs und gleiche Kommentar-IDs werden überschrieben.`)) {
    return;
  }

  setModuleEditorStatus('Masterpaket wird importiert...');
  updateFirebaseSyncStatus('syncing', 'Masterpaket wird eingespielt...');

  for (const item of master.modules) {
    const entry = sanitizeModuleEntry(item.entry);
    const section = cleanCustomSection({ ...item.section, entries: [] });
    const builtin = findBuiltinSectionByEntryId(entry.id);
    removeCustomModuleById(entry.id);
    if (builtin) {
      _entryOverrides[entry.id] = entry;
    } else {
      delete _entryOverrides[entry.id];
      upsertCustomModule(section, entry);
    }
  }

  saveModuleStore({ remote: false });
  const storePayload = getModuleStorePayload(Date.now());
  writeLocalModuleStorePayload(storePayload);
  try {
    await pushModuleStoreToFirebase(storePayload);
    writeModuleStoreSyncMeta(storePayload);
  } catch (error) {
    console.warn('master module store remote import failed:', error);
    updateFirebaseSyncStatus('error', 'Module lokal importiert, Online-Sync fehlgeschlagen.');
    showFriendlyAppError(error, 'Module wurden lokal importiert, aber noch nicht online synchronisiert.');
  }

  let importedComments = 0;
  let importedTurns = 0;
  for (const item of master.modules) {
    if (!item.commentBundle) continue;
    const result = await importModuleCommentsBundle(item.commentBundle, item.entry.id);
    importedComments += result.commentCount;
    importedTurns += result.turnCount;
  }

  _moduleEditorPendingCommentImport = null;
  clearModuleEditorUndoSnapshot();
  renderAll();
  loadSidebarFeed();
  setModuleEditorStatus(`Masterpaket importiert: ${master.modules.length} Module, ${importedComments} Kommentare, ${importedTurns} Redestab-Stände.`);
  warnIfModuleStoreSizeIsHigh(storePayload);
  updateFirebaseSyncStatus('synced', 'Masterpaket importiert.');
  showAppStatus('Modul-Masterpaket wurde importiert.', 'success');
}

function applyModuleJsonToEditor() {
  try {
    if (!confirmDiscardModuleEditorChanges('JSON übernehmen')) return;
    const raw = document.getElementById('me-json')?.value || '';
    validateModuleJsonSize(raw);
    const parsed = JSON.parse(raw);
    const imported = normalizeModuleImportPayload(parsed);
    const nextPayload = { section: imported.section, entry: imported.entry };
    if (!confirmModuleImportPayload(nextPayload, 'JSON in den aktuellen Editor übernehmen', imported.commentBundle)) return;
    try {
      setModuleEditorUndoSnapshot(collectModuleEditorPayload(), _moduleEditorContext || {}, 'JSON');
    } catch {}
    _moduleEditorPendingCommentImport = imported.commentBundle;
    populateModuleEditor({
      section: nextPayload.section,
      entry: nextPayload.entry
    }, {
      ...(_moduleEditorContext || { mode: 'new', sourceKind: 'new', sourceEntryId: '' }),
      sectionSignature: imported.sectionSignature
    }, { resetBaseline: false });
    setModuleEditorStatus(imported.commentBundle
      ? 'Modulpaket übernommen. Die eingebetteten Kommentare werden beim Speichern importiert.'
      : 'JSON übernommen.');
  } catch (error) {
    setModuleEditorStatus(error.message || 'JSON konnte nicht gelesen werden.', true);
  }
}

function loadModuleJsonFromTextarea() {
  try {
    if (!confirmDiscardModuleEditorChanges('als neues Modul laden')) return;
    const raw = document.getElementById('me-json')?.value || '';
    validateModuleJsonSize(raw);
    const parsed = JSON.parse(raw);
    const imported = normalizeModuleImportPayload(parsed);
    const nextPayload = { section: imported.section, entry: imported.entry };
    if (!confirmModuleImportPayload(nextPayload, 'JSON als neues Modul laden', imported.commentBundle)) return;
    try {
      setModuleEditorUndoSnapshot(collectModuleEditorPayload(), _moduleEditorContext || {}, 'Import');
    } catch {}
    _moduleEditorPendingCommentImport = imported.commentBundle;
    populateModuleEditor(nextPayload, {
      mode: 'new',
      sourceKind: 'new',
      sourceEntryId: '',
      sectionSignature: imported.sectionSignature
    }, { resetBaseline: false });
    setModuleEditorStatus(imported.commentBundle
      ? 'Modulpaket geladen. Die eingebetteten Kommentare werden beim Speichern importiert.'
      : 'JSON geladen.');
  } catch (error) {
    setModuleEditorStatus(error.message || 'JSON konnte nicht geladen werden.', true);
  }
}

function handleModuleImportFile(input) {
  const file = input?.files?.[0];
  if (!file) return;
  if (file.size > MODULE_JSON_MAX_CHARS) {
    setModuleEditorStatus(`Datei ist zu groß. Limit: ${Math.round(MODULE_JSON_MAX_CHARS / 1000)} KB.`, true);
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const raw = String(reader.result || '');
      validateModuleJsonSize(raw);
      const textarea = document.getElementById('me-json');
      if (textarea) textarea.value = raw;
      const parsed = JSON.parse(raw);
      if (parsed?.type === 'aleria-module-master-package') {
        await applyAllModulePackagesPayload(parsed);
      } else {
        loadModuleJsonFromTextarea();
      }
    } catch (error) {
      setModuleEditorStatus(error.message || 'JSON konnte nicht geladen werden.', true);
    } finally {
      input.value = '';
    }
  };
  reader.onerror = () => {
    setModuleEditorStatus('Datei konnte nicht gelesen werden.', true);
  };
  reader.readAsText(file, 'utf-8');
}


