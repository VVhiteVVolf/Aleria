// Modul-Import, Modul-Export und Masterpakete liegen in module-import-export.js.

function downloadJsonFile(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function cloneForBackup(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function getCommentTimestampSeconds(value) {
  if (!value) return 0;
  if (Number.isFinite(value.seconds)) return Number(value.seconds);
  if (typeof value.toDate === 'function') {
    const date = value.toDate();
    return Number.isFinite(date?.getTime()) ? Math.floor(date.getTime() / 1000) : 0;
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? Math.floor(parsed / 1000) : 0;
  }
  return 0;
}

function sortCommentsForExport(comments) {
  return (Array.isArray(comments) ? comments : []).slice().sort((a, b) => {
    const ta = getCommentTimestampSeconds(a?.ts || a?.createdAt);
    const tb = getCommentTimestampSeconds(b?.ts || b?.createdAt);
    if (ta !== tb) return ta - tb;
    return String(a?.id || '').localeCompare(String(b?.id || ''));
  });
}

function getModuleCommentThreadDescriptors(entry) {
  const descriptors = [];
  const seen = new Set();
  const pushThread = (threadId, kind, pageIndex = null, pageTitle = '') => {
    const id = String(threadId || '').trim();
    if (!id || seen.has(id)) return;
    seen.add(id);
    descriptors.push({
      threadId: id,
      kind,
      pageIndex,
      pageTitle: pageTitle || ''
    });
  };

  if (!entry?.id) return descriptors;
  pushThread(entry.id, 'entry-comments', null, 'Modulkommentare');

  const pages = Array.isArray(entry.pages) ? entry.pages : [];
  pages.forEach((page, pageIndex) => {
    if (page?.sessionPage) {
      pushThread(getSessionThreadId(entry.id, pageIndex), 'session', pageIndex, page.pageTitle || '');
    }
    if (entry.enablePageComments || page?.enableComments) {
      pushThread(getPageCommentThreadId(entry.id, pageIndex), 'page', pageIndex, page.pageTitle || '');
    }
  });

  return descriptors;
}

async function buildModuleCommentExportPayload(payload) {
  const source = assertValidModulePayload(payload, { skipIdConflict: true });
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

  return buildModuleCommentExportPayloadFromLoaded(source, allComments, allTurns);
}

function buildModuleCommentExportPayloadFromLoaded(payload, allComments = [], allTurns = []) {
  const source = assertValidModulePayload(payload, { skipIdConflict: true });
  const entry = source.entry;
  const section = source.section;
  const threads = getModuleCommentThreadDescriptors(entry);
  const threadIds = new Set(threads.map(thread => thread.threadId));
  const comments = sortCommentsForExport((allComments || []).filter(comment => threadIds.has(String(comment?.entryId || ''))))
    .map((comment, index) => ({
      exportOrder: index + 1,
      ...cloneForBackup(comment)
    }));
  const turns = (Array.isArray(allTurns) ? allTurns : [])
    .filter(turn => threadIds.has(String(turn?.threadId || turn?.id || '')))
    .map(turn => cloneForBackup(turn));
  const groupedThreads = threads.map(thread => {
    const threadComments = comments.filter(comment => String(comment.entryId || '') === thread.threadId);
    const turn = turns.find(item => String(item.threadId || item.id || '') === thread.threadId) || null;
    return {
      ...thread,
      commentCount: threadComments.length,
      turn,
      comments: threadComments.map((comment, index) => ({
        threadOrder: index + 1,
        ...comment
      }))
    };
  });

  return {
    type: 'aleria-module-comments-export',
    version: MODULE_COMMENT_EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    source: {
      moduleId: entry.id,
      moduleTitle: entry.title || '',
      sectionKey: section?.key || '',
      sectionTab: section?.tab || section?.key || ''
    },
    summary: {
      threadCount: groupedThreads.length,
      commentCount: comments.length,
      turnCount: turns.length
    },
    threads: groupedThreads,
    comments,
    commentTurns: turns
  };
}

async function exportModuleCommentsFromEditor() {
  try {
    setModuleEditorStatus('Kommentar-Backup wird erstellt...');
    const payload = await buildModuleCommentExportPayload(collectModuleEditorPayload());
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const moduleSlug = slugify(payload.source.moduleTitle || payload.source.moduleId || 'aleria-modul');
    downloadJsonFile(payload, `${moduleSlug}-kommentare-${stamp}.json`);
    setModuleEditorStatus(`Kommentar-Backup erstellt: ${payload.summary.commentCount} Kommentare in ${payload.summary.threadCount} Threads.`);
  } catch (error) {
    console.error('module comment export failed:', error);
    setModuleEditorStatus(getFriendlyErrorMessage(error, 'Kommentar-Backup konnte nicht erstellt werden.'), true);
  }
}

async function buildFullAlmanachBackupPayload() {
  await waitForFirebaseReady();
  const commentBackend = typeof getCommentBackend === 'function'
    ? await getCommentBackend({ timeoutMs: 800 })
    : window._fb;
  const [characters, charTabs, comments, commentTurns] = await Promise.all([
    window._fb?.loadCharacters ? window._fb.loadCharacters() : Promise.resolve(_characters || []),
    window._fb?.loadCharTabs ? window._fb.loadCharTabs() : Promise.resolve({
      tabs: _charTabs,
      map: _charTabMap,
      subtabs: _charSubtabs,
      subtabMap: _charSubtabMap,
      hiddenBuiltins: Array.from(_hiddenBuiltinCharacterIds)
    }),
    commentBackend?.loadAllComments ? commentBackend.loadAllComments() : Promise.resolve([]),
    commentBackend?.loadAllCommentTurns ? commentBackend.loadAllCommentTurns() : Promise.resolve([])
  ]);
  return {
    type: 'aleria-almanach-backup',
    version: ALMANACH_BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    moduleStore: cloneForBackup(getModuleStorePayload(Date.now())),
    characters: cloneForBackup(characters || []),
    charTabs: cloneForBackup(charTabs || {
      tabs: _charTabs,
      map: _charTabMap,
      subtabs: _charSubtabs,
      subtabMap: _charSubtabMap,
      hiddenBuiltins: Array.from(_hiddenBuiltinCharacterIds)
    }),
    comments: cloneForBackup(comments || []),
    commentTurns: cloneForBackup(commentTurns || [])
  };
}

async function exportFullAlmanachBackup() {
  try {
    setModuleEditorStatus('Vollbackup wird erstellt...');
    updateFirebaseSyncStatus('syncing', 'Backup-Daten werden aus Firebase gelesen...');
    const payload = await buildFullAlmanachBackupPayload();
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    downloadJsonFile(payload, `aleria-almanach-backup-${stamp}.json`);
    setModuleEditorStatus(`Vollbackup erstellt: ${payload.characters.length} Charaktere, ${payload.comments.length} Kommentare, ${payload.commentTurns.length} Redestab-Stände.`);
    updateFirebaseSyncStatus(_firebaseSyncState === 'error' ? 'error' : 'synced', 'Backup exportiert.');
  } catch (error) {
    console.error('full backup export failed:', error);
    setModuleEditorStatus(getFriendlyErrorMessage(error, 'Vollbackup konnte nicht erstellt werden.'), true);
    updateFirebaseSyncStatus('error', 'Backup-Export fehlgeschlagen.');
  }
}

function normalizeFullBackupPayload(parsed) {
  if (!parsed || typeof parsed !== 'object') throw new Error('Backup-Datei ist ungültig.');
  if (parsed.type !== 'aleria-almanach-backup') throw new Error('Das ist kein vollständiges Almanach-Backup.');
  return {
    moduleStore: normalizeModuleStorePayload(parsed.moduleStore),
    characters: Array.isArray(parsed.characters) ? parsed.characters : [],
    charTabs: parsed.charTabs && typeof parsed.charTabs === 'object' ? parsed.charTabs : null,
    comments: Array.isArray(parsed.comments) ? parsed.comments : [],
    commentTurns: Array.isArray(parsed.commentTurns) ? parsed.commentTurns : []
  };
}

async function applyFullAlmanachBackup(payload) {
  const backup = normalizeFullBackupPayload(payload);
  if (!confirmDiscardModuleEditorChanges('Backup importieren')) return;
  if (!confirmBackupBeforeDestructiveImport('Vollbackup importieren', 'Nicht enthaltene Daten bleiben bestehen, gleiche IDs werden ueberschrieben.')) return;
  if (!confirm(`Backup importieren?\n\nModule: ${backup.moduleStore.customSections.length} Bereiche / ${Object.keys(backup.moduleStore.entryOverrides).length} Überschreibungen\nCharaktere: ${backup.characters.length}\nKommentare: ${backup.comments.length}\nRedestab-Stände: ${backup.commentTurns.length}\n\nDer Import überschreibt gleiche IDs und lässt nicht enthaltene Daten bestehen.`)) {
    return;
  }

  setModuleEditorStatus('Backup wird importiert...');
  updateFirebaseSyncStatus('syncing', 'Backup wird online eingespielt...');

  applyModuleStorePayload(backup.moduleStore);
  writeLocalModuleStorePayload(backup.moduleStore);
  await pushModuleStoreToFirebase(backup.moduleStore);
  writeModuleStoreSyncMeta(backup.moduleStore);
  updateModuleStoreSizePanel(backup.moduleStore);

  if (backup.charTabs) {
    _charTabs = Array.isArray(backup.charTabs.tabs) && backup.charTabs.tabs.length
      ? backup.charTabs.tabs.filter(tab => tab !== CHARACTER_ARCHIVE_TAB)
      : ['Alle'];
    _charTabMap = backup.charTabs.map || {};
    _charSubtabs = backup.charTabs.subtabs && typeof backup.charTabs.subtabs === 'object' ? backup.charTabs.subtabs : {};
    _charSubtabMap = backup.charTabs.subtabMap && typeof backup.charTabs.subtabMap === 'object' ? backup.charTabs.subtabMap : {};
    delete _charTabMap[CHARACTER_ARCHIVE_TAB];
    delete _charSubtabs[CHARACTER_ARCHIVE_TAB];
    delete _charSubtabMap[CHARACTER_ARCHIVE_TAB];
    _hiddenBuiltinCharacterIds = new Set(Array.isArray(backup.charTabs.hiddenBuiltins) ? backup.charTabs.hiddenBuiltins : []);
    normalizeCharTabState();
    await saveCharTabs();
    _charTabsLoaded = true;
  }

  if (window._fb?.saveCharacter) {
    for (const char of backup.characters) {
      const id = String(char?.id || '').trim();
      if (!id) continue;
      const data = { ...char };
      delete data.id;
      await window._fb.saveCharacter(id, data);
    }
    _characters = await window._fb.loadCharacters();
    _charactersLoaded = true;
  }

  if (window._fb?.saveBackupComment) {
    for (const comment of backup.comments) {
      const id = String(comment?.id || '').trim();
      if (!id) continue;
      const data = { ...comment };
      delete data.id;
      await window._fb.saveBackupComment(id, data);
    }
  }

  if (window._fb?.saveBackupCommentTurn) {
    for (const turn of backup.commentTurns) {
      const id = String(turn?.id || turn?.threadId || '').trim();
      if (!id) continue;
      const data = { ...turn };
      delete data.id;
      await window._fb.saveBackupCommentTurn(id, data);
    }
  }

  renderAll();
  renderCharSubtabs();
  renderCharGrid();
  renderCharPickerInForm();
  refreshAllModuleCastPickers();
  loadSidebarFeed();
  setModuleEditorStatus(`Backup importiert: ${backup.characters.length} Charaktere, ${backup.comments.length} Kommentare, ${backup.commentTurns.length} Redestab-Stände.`);
  warnIfModuleStoreSizeIsHigh(backup.moduleStore);
  updateFirebaseSyncStatus('synced', 'Backup online importiert.');
  showAppStatus('Almanach-Backup wurde importiert und synchronisiert.', 'success');
}

function handleFullBackupImportFile(input) {
  const file = input?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener('load', async () => {
    try {
      const parsed = JSON.parse(String(reader.result || ''));
      await applyFullAlmanachBackup(parsed);
    } catch (error) {
      console.error('full backup import failed:', error);
      setModuleEditorStatus(error.message || 'Backup konnte nicht importiert werden.', true);
      updateFirebaseSyncStatus('error', 'Backup-Import fehlgeschlagen.');
    } finally {
      input.value = '';
    }
  });
  reader.addEventListener('error', () => {
    setModuleEditorStatus('Backup-Datei konnte nicht gelesen werden.', true);
    input.value = '';
  });
  reader.readAsText(file, 'utf-8');
}

function runManualLocalStorageCleanup() {
  const removedDrafts = typeof window.cleanupOldCommentDrafts === 'function'
    ? window.cleanupOldCommentDrafts(30)
    : 0;
  const removedModuleCache = cleanupSyncedModuleStoreCache({ force: true });
  setModuleEditorStatus(
    removedDrafts || removedModuleCache
      ? `Bereinigt: ${removedDrafts} alte Entwuerfe${removedModuleCache ? ', synchronisierter Modul-Cache' : ''}.`
      : 'Nichts zu bereinigen. Unsynchronisierte Daten bleiben erhalten.'
  );
}
