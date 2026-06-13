// Import/export for a single comment thread, e.g. one interactive scene page.

const COMMENT_THREAD_EXPORT_SCHEMA_VERSION = 1;
let _moduleCommentThreadSourceCandidates = [];
let _moduleCommentThreadSourceModuleId = '';

function getCommentIoStatusTarget() {
  return document.getElementById('module-editor-overlay')?.classList.contains('active')
    ? 'editor'
    : 'app';
}

function setCommentIoStatus(message, isError = false) {
  if (getCommentIoStatusTarget() === 'editor' && typeof setModuleEditorStatus === 'function') {
    setModuleEditorStatus(message, isError);
    return;
  }
  if (typeof showAppStatus === 'function') {
    showAppStatus(message, isError ? 'error' : 'success');
  }
}

function getCommentThreadIoDescriptors(entry) {
  if (!entry?.id || typeof getModuleCommentThreadDescriptors !== 'function') return [];
  return getModuleCommentThreadDescriptors(entry);
}

function getCommentThreadIoLabel(descriptor) {
  const kind = String(descriptor?.kind || '');
  if (kind === 'entry-comments') return 'Modulkommentare';
  const page = Number.isInteger(descriptor?.pageIndex) ? `Seite ${descriptor.pageIndex + 1}` : 'Seite';
  const title = String(descriptor?.pageTitle || '').trim();
  const suffix = kind === 'session' ? 'Interaktive Szene' : 'Seitenkommentare';
  return `${page}${title ? ` - ${title}` : ''} (${suffix})`;
}

function getCommentThreadSourceOptionLabel(candidate) {
  const count = Number(candidate?.commentCount) || 0;
  const turnCount = Number(candidate?.turnCount) || 0;
  const state = candidate?.isCurrentTarget ? 'aktuell' : 'alte Quelle';
  return `${getCommentThreadIoLabel(candidate)} - ${count} Kommentare${turnCount ? ', Redestab' : ''} - ${state}`;
}

function getCommentThreadFileSlug(descriptor, context = {}) {
  const modulePart = slugify(context.moduleTitle || context.moduleId || 'aleria-kommentare');
  const threadPart = slugify(getCommentThreadIoLabel(descriptor) || descriptor?.threadId || 'thread');
  return `${modulePart}-${threadPart}`;
}

function renderModuleCommentThreadSourceOptions(candidates = [], message = '') {
  const select = document.getElementById('me-comment-thread-source-select');
  if (!select) return;
  if (!candidates.length) {
    select.innerHTML = `<option value="">${escapeHtml(message || 'Keine Firebase-Quelle gefunden')}</option>`;
    document.getElementById('me-comment-thread-rescue-btn')?.toggleAttribute('disabled', true);
    return;
  }
  select.innerHTML = candidates.map(candidate => `
    <option value="${escapeHtml(candidate.threadId)}">${escapeHtml(getCommentThreadSourceOptionLabel(candidate))}</option>
  `).join('');
  document.getElementById('me-comment-thread-rescue-btn')?.toggleAttribute('disabled', false);
}

function getLatestCommentExportSeconds(comments = []) {
  return (Array.isArray(comments) ? comments : []).reduce((latest, comment) => {
    return Math.max(latest, getCommentTimestampSeconds(comment?.ts || comment?.createdAt));
  }, 0);
}

async function findFirebaseCommentThreadSourceCandidates(moduleId, targetEntry = null) {
  const safeModuleId = String(moduleId || '').trim();
  if (!safeModuleId) throw new Error('Es fehlt eine Modul-ID fuer die Firebase-Suche.');
  const backend = await getCommentIoBackend();
  if (!backend.loadAllComments) {
    throw new Error('Firebase-Quellensuche ist nicht verfuegbar.');
  }

  const [allComments, allTurns] = await Promise.all([
    backend.loadAllComments(),
    backend.loadAllCommentTurns ? backend.loadAllCommentTurns() : Promise.resolve([])
  ]);
  const currentDescriptors = targetEntry ? getCommentThreadIoDescriptors(targetEntry) : [];
  const currentById = new Map(currentDescriptors.map(thread => [thread.threadId, thread]));
  const groupedComments = new Map();
  (Array.isArray(allComments) ? allComments : []).forEach(comment => {
    const threadId = String(comment?.entryId || '').trim();
    if (!threadId) return;
    const location = parseCommentThreadLocation(threadId);
    if (location.baseEntryId !== safeModuleId) return;
    if (!groupedComments.has(threadId)) groupedComments.set(threadId, []);
    groupedComments.get(threadId).push(comment);
  });

  const turnsById = new Map();
  (Array.isArray(allTurns) ? allTurns : []).forEach(turn => {
    const threadId = String(turn?.threadId || turn?.id || '').trim();
    if (!threadId) return;
    const location = parseCommentThreadLocation(threadId);
    if (location.baseEntryId !== safeModuleId) return;
    turnsById.set(threadId, turn);
    if (!groupedComments.has(threadId)) groupedComments.set(threadId, []);
  });

  return Array.from(groupedComments.entries()).map(([threadId, comments]) => {
    const location = parseCommentThreadLocation(threadId);
    const current = currentById.get(threadId);
    const turn = turnsById.get(threadId) || null;
    return {
      threadId,
      kind: current?.kind || location.kind,
      pageIndex: Number.isInteger(current?.pageIndex) ? current.pageIndex : location.pageIndex,
      pageTitle: current?.pageTitle || '',
      commentCount: comments.length,
      turnCount: turn ? 1 : 0,
      latestSeconds: getLatestCommentExportSeconds(comments),
      isCurrentTarget: currentById.has(threadId),
      comments,
      turn
    };
  }).filter(candidate => candidate.commentCount || candidate.turnCount)
    .sort((a, b) => {
      if (a.isCurrentTarget !== b.isCurrentTarget) return a.isCurrentTarget ? 1 : -1;
      if (b.latestSeconds !== a.latestSeconds) return b.latestSeconds - a.latestSeconds;
      return String(a.threadId).localeCompare(String(b.threadId));
    });
}

function chooseFirebaseCommentThreadSource(candidates) {
  if (!Array.isArray(candidates) || !candidates.length) {
    throw new Error('Keine Firebase-Kommentarquelle gefunden.');
  }
  if (candidates.length === 1) return candidates[0];
  const lines = candidates.map((candidate, index) => `${index + 1}: ${getCommentThreadSourceOptionLabel(candidate)}`);
  const choice = prompt(`Welche Firebase-Kommentarquelle soll gerettet werden?\n\n${lines.join('\n')}`, '1');
  if (choice === null) return null;
  const index = Math.max(0, Math.min(candidates.length - 1, (Number(choice) || 1) - 1));
  return candidates[index];
}

function buildCommentThreadExportFromCandidate(candidate, context = {}) {
  const threadId = String(candidate?.threadId || '').trim();
  const comments = sortCommentsForExport(candidate?.comments || []).map((comment, index) => ({
    exportOrder: index + 1,
    ...cloneForBackup(comment)
  }));
  const turn = candidate?.turn ? { id: threadId, threadId, ...cloneForBackup(candidate.turn) } : null;
  const thread = {
    threadId,
    kind: candidate.kind || parseCommentThreadLocation(threadId).kind,
    pageIndex: Number.isInteger(candidate.pageIndex) ? candidate.pageIndex : null,
    pageTitle: candidate.pageTitle || '',
    commentCount: comments.length,
    turn,
    comments: comments.map((comment, index) => ({
      threadOrder: index + 1,
      ...comment
    }))
  };
  return {
    type: 'aleria-comment-thread-export',
    version: COMMENT_THREAD_EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    source: {
      moduleId: context.moduleId || parseCommentThreadLocation(threadId).baseEntryId,
      moduleTitle: context.moduleTitle || '',
      threadId,
      threadKind: thread.kind,
      pageIndex: thread.pageIndex,
      pageTitle: thread.pageTitle
    },
    summary: {
      threadCount: 1,
      commentCount: comments.length,
      turnCount: turn ? 1 : 0
    },
    threads: [thread],
    comments,
    commentTurns: turn ? [turn] : []
  };
}

async function getCommentIoBackend() {
  const backend = typeof getCommentBackend === 'function'
    ? await getCommentBackend({ timeoutMs: 1200 })
    : window._fb;
  if (!backend?.loadComments || !backend?.saveBackupComment) {
    throw new Error('Kommentar-Import/Export ist nicht verfuegbar.');
  }
  return backend;
}

async function buildCommentThreadExportPayload(descriptor, context = {}) {
  const threadId = String(descriptor?.threadId || '').trim();
  if (!threadId) throw new Error('Kein Kommentarbereich ausgewaehlt.');

  const backend = await getCommentIoBackend();
  const [loadedComments, turn] = await Promise.all([
    backend.loadComments(threadId),
    backend.loadCommentTurn ? backend.loadCommentTurn(threadId) : Promise.resolve(null)
  ]);
  const comments = sortCommentsForExport(loadedComments || []).map((comment, index) => ({
    exportOrder: index + 1,
    ...cloneForBackup(comment)
  }));
  const commentTurns = turn ? [{ id: threadId, threadId, ...cloneForBackup(turn) }] : [];
  const thread = {
    threadId,
    kind: descriptor.kind || parseCommentThreadLocation(threadId).kind,
    pageIndex: Number.isInteger(descriptor.pageIndex) ? descriptor.pageIndex : null,
    pageTitle: descriptor.pageTitle || '',
    commentCount: comments.length,
    turn: commentTurns[0] || null,
    comments: comments.map((comment, index) => ({
      threadOrder: index + 1,
      ...comment
    }))
  };

  return {
    type: 'aleria-comment-thread-export',
    version: COMMENT_THREAD_EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    source: {
      moduleId: context.moduleId || parseCommentThreadLocation(threadId).baseEntryId,
      moduleTitle: context.moduleTitle || '',
      threadId,
      threadKind: thread.kind,
      pageIndex: thread.pageIndex,
      pageTitle: thread.pageTitle
    },
    summary: {
      threadCount: 1,
      commentCount: comments.length,
      turnCount: commentTurns.length
    },
    threads: [thread],
    comments,
    commentTurns
  };
}

async function exportCommentThread(descriptor, context = {}) {
  const payload = await buildCommentThreadExportPayload(descriptor, context);
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  downloadJsonFile(payload, `${getCommentThreadFileSlug(descriptor, context)}-${stamp}.json`);
  return payload;
}

function normalizeThreadExportSource(parsed) {
  if (!parsed || typeof parsed !== 'object') throw new Error('Kommentar-Datei ist ungueltig.');
  if (parsed.type === 'aleria-comment-thread-export') return parsed;
  if (parsed.type === 'aleria-module-comments-export') return parsed;
  if (parsed.type === 'aleria-module-package') return parsed.commentsExport || parsed.commentsBundle || parsed;
  throw new Error('Diese Datei ist kein Kommentar-Export.');
}

function getImportableThreadsFromPayload(payload) {
  const threads = Array.isArray(payload.threads) ? cloneForBackup(payload.threads) : [];
  const comments = Array.isArray(payload.comments) ? cloneForBackup(payload.comments) : [];
  const turns = Array.isArray(payload.commentTurns) ? cloneForBackup(payload.commentTurns) : [];
  if (threads.length) {
    return threads.map(thread => {
      const threadId = String(thread?.threadId || '').trim();
      const threadComments = Array.isArray(thread?.comments) && thread.comments.length
        ? cloneForBackup(thread.comments)
        : comments.filter(comment => String(comment?.entryId || '') === threadId);
      const turn = thread?.turn || turns.find(item => String(item?.threadId || item?.id || '') === threadId) || null;
      return {
        ...thread,
        threadId,
        comments: threadComments,
        turn
      };
    }).filter(thread => thread.threadId);
  }

  const grouped = new Map();
  comments.forEach(comment => {
    const threadId = String(comment?.entryId || '').trim();
    if (!threadId) return;
    if (!grouped.has(threadId)) grouped.set(threadId, []);
    grouped.get(threadId).push(comment);
  });
  return Array.from(grouped.entries()).map(([threadId, threadComments]) => ({
    threadId,
    kind: parseCommentThreadLocation(threadId).kind,
    pageIndex: parseCommentThreadLocation(threadId).pageIndex,
    pageTitle: '',
    comments: threadComments,
    turn: turns.find(item => String(item?.threadId || item?.id || '') === threadId) || null
  }));
}

function chooseImportThread(threads) {
  if (!threads.length) throw new Error('Der Export enthaelt keine Kommentar-Session.');
  if (threads.length === 1) return threads[0];
  const lines = threads.map((thread, index) => {
    const label = getCommentThreadIoLabel(thread);
    const count = Array.isArray(thread.comments) ? thread.comments.length : 0;
    return `${index + 1}: ${label} - ${count} Kommentare`;
  });
  const choice = prompt(`Welche Kommentar-Session soll importiert werden?\n\n${lines.join('\n')}`, '1');
  if (choice === null) return null;
  const index = Math.max(0, Math.min(threads.length - 1, (Number(choice) || 1) - 1));
  return threads[index];
}

function makeImportedThreadCommentId(originalId, sourceThreadId, targetThreadId, fallbackIndex = 0) {
  const base = String(originalId || '').trim() || `import-${Date.now()}-${fallbackIndex}`;
  if (String(sourceThreadId || '') === String(targetThreadId || '')) return base;
  return `${base}__${slugify(targetThreadId || 'thread')}`;
}

async function importCommentThreadPayload(parsed, targetDescriptor, options = {}) {
  const targetThreadId = String(targetDescriptor?.threadId || '').trim();
  if (!targetThreadId) throw new Error('Kein Ziel-Kommentarbereich ausgewaehlt.');
  const payload = normalizeThreadExportSource(parsed);
  const sourceThread = chooseImportThread(getImportableThreadsFromPayload(payload));
  if (!sourceThread) return { commentCount: 0, turnCount: 0, cancelled: true };
  const sourceThreadId = String(sourceThread.threadId || '').trim();
  const comments = sortCommentsForExport(sourceThread.comments || []);
  const turn = sourceThread.turn || null;
  if (!comments.length && !turn) throw new Error('Diese Kommentar-Session ist leer.');

  if (!options.skipConfirm) {
    const sourceLabel = getCommentThreadIoLabel(sourceThread);
    const targetLabel = getCommentThreadIoLabel(targetDescriptor);
    const duplicateNote = sourceThreadId === targetThreadId
      ? 'Gleiche Kommentar-IDs werden im Ziel ueberschrieben.'
      : 'Kommentare werden mit neuen IDs in den Zielbereich kopiert.';
    if (!confirm(`Kommentar-Session importieren?\n\nQuelle: ${sourceLabel}\nZiel: ${targetLabel}\nKommentare: ${comments.length}\nRedestab-Staende: ${turn ? 1 : 0}\n\n${duplicateNote}`)) {
      return { commentCount: 0, turnCount: 0, cancelled: true };
    }
  }

  const backend = await getCommentIoBackend();
  let commentCount = 0;
  for (const [index, comment] of comments.entries()) {
    const oldId = String(comment?.id || '').trim();
    const newId = makeImportedThreadCommentId(oldId, sourceThreadId, targetThreadId, index + 1);
    const data = cloneForBackup(comment);
    data.entryId = targetThreadId;
    delete data.id;
    delete data.exportOrder;
    delete data.threadOrder;
    await backend.saveBackupComment(newId, data);
    commentCount += 1;
  }

  let turnCount = 0;
  if (turn && backend.saveBackupCommentTurn) {
    const data = cloneForBackup(turn);
    delete data.id;
    data.threadId = targetThreadId;
    await backend.saveBackupCommentTurn(targetThreadId, data);
    turnCount = 1;
  }

  if (typeof loadCommentsIntoPage === 'function') {
    await loadCommentsIntoPage(targetThreadId, true);
  }
  if (typeof loadSidebarFeed === 'function') loadSidebarFeed();
  return { commentCount, turnCount, cancelled: false };
}

function readCommentThreadImportFile(input, targetDescriptor, options = {}) {
  const file = input?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener('load', async () => {
    try {
      validateModuleJsonSize(String(reader.result || ''));
      const parsed = JSON.parse(String(reader.result || ''));
      const result = await importCommentThreadPayload(parsed, targetDescriptor, options);
      if (!result.cancelled) {
        setCommentIoStatus(`Kommentar-Session importiert: ${result.commentCount} Kommentare, ${result.turnCount} Redestab-Staende.`);
      }
    } catch (error) {
      console.error('comment thread import failed:', error);
      setCommentIoStatus(error.message || 'Kommentar-Session konnte nicht importiert werden.', true);
    } finally {
      input.value = '';
    }
  });
  reader.addEventListener('error', () => {
    setCommentIoStatus('Kommentar-Datei konnte nicht gelesen werden.', true);
    input.value = '';
  });
  reader.readAsText(file, 'utf-8');
}

async function exportCurrentCommentThreadFromModal() {
  try {
    const thread = typeof getCurrentCommentThread === 'function' ? getCurrentCommentThread() : null;
    if (!thread?.threadId) throw new Error('Diese Seite hat keinen Kommentarbereich.');
    const payload = await exportCommentThread(thread, {
      moduleId: thread.entry?.id || currentEntry?.id || '',
      moduleTitle: thread.entry?.title || currentEntry?.title || ''
    });
    setCommentIoStatus(`Kommentar-Session exportiert: ${payload.summary.commentCount} Kommentare.`);
  } catch (error) {
    console.error('current comment thread export failed:', error);
    setCommentIoStatus(error.message || 'Kommentar-Session konnte nicht exportiert werden.', true);
  }
}

function importCurrentCommentThreadFromModal() {
  const thread = typeof getCurrentCommentThread === 'function' ? getCurrentCommentThread() : null;
  if (!thread?.threadId) {
    setCommentIoStatus('Diese Seite hat keinen Kommentarbereich.', true);
    return;
  }
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.addEventListener('change', () => readCommentThreadImportFile(input, thread));
  input.click();
}

function refreshModuleCommentThreadIoOptions(payload = null) {
  const select = document.getElementById('me-comment-thread-select');
  if (!select) return;
  const previous = select.value;
  let descriptors = [];
  let moduleId = '';
  try {
    const source = payload || collectModuleEditorPayload();
    moduleId = String(source.entry?.id || '').trim();
    descriptors = getCommentThreadIoDescriptors(source.entry);
  } catch {
    descriptors = [];
  }
  select.innerHTML = descriptors.length
    ? descriptors.map(thread => `<option value="${escapeHtml(thread.threadId)}">${escapeHtml(getCommentThreadIoLabel(thread))}</option>`).join('')
    : '<option value="">Kein Kommentarbereich im aktuellen Modul</option>';
  if (previous && descriptors.some(thread => thread.threadId === previous)) select.value = previous;
  const disabled = descriptors.length === 0;
  document.getElementById('me-comment-thread-export-btn')?.toggleAttribute('disabled', disabled);
  document.getElementById('me-comment-thread-import-btn')?.toggleAttribute('disabled', disabled);
  if (_moduleCommentThreadSourceModuleId && moduleId && _moduleCommentThreadSourceModuleId !== moduleId) {
    _moduleCommentThreadSourceCandidates = [];
    _moduleCommentThreadSourceModuleId = '';
    renderModuleCommentThreadSourceOptions([], 'Quellen noch nicht geladen');
  }
}

function getSelectedModuleEditorCommentThreadDescriptor() {
  const payload = collectModuleEditorPayload();
  const selected = String(document.getElementById('me-comment-thread-select')?.value || '').trim();
  const descriptors = getCommentThreadIoDescriptors(payload.entry);
  const descriptor = descriptors.find(thread => thread.threadId === selected) || descriptors[0];
  if (!descriptor) throw new Error('Kein Kommentarbereich ausgewaehlt.');
  return {
    descriptor,
    context: {
      moduleId: payload.entry.id,
      moduleTitle: payload.entry.title
    }
  };
}

async function exportSelectedModuleEditorCommentThread() {
  try {
    setModuleEditorStatus('Kommentar-Session wird exportiert...');
    const { descriptor, context } = getSelectedModuleEditorCommentThreadDescriptor();
    const payload = await exportCommentThread(descriptor, context);
    setModuleEditorStatus(`Kommentar-Session exportiert: ${payload.summary.commentCount} Kommentare.`);
  } catch (error) {
    console.error('selected comment thread export failed:', error);
    setModuleEditorStatus(error.message || 'Kommentar-Session konnte nicht exportiert werden.', true);
  }
}

function openSelectedModuleEditorCommentThreadImport() {
  try {
    getSelectedModuleEditorCommentThreadDescriptor();
    document.getElementById('me-comment-thread-import-file')?.click();
  } catch (error) {
    setModuleEditorStatus(error.message || 'Kein Kommentarbereich ausgewaehlt.', true);
  }
}

function handleSelectedModuleEditorCommentThreadImport(input) {
  try {
    const { descriptor } = getSelectedModuleEditorCommentThreadDescriptor();
    readCommentThreadImportFile(input, descriptor);
  } catch (error) {
    setModuleEditorStatus(error.message || 'Kein Kommentarbereich ausgewaehlt.', true);
    if (input) input.value = '';
  }
}

async function loadCurrentModuleCommentThreadSources() {
  try {
    setModuleEditorStatus('Firebase-Kommentarquellen werden gelesen...');
    const payload = collectModuleEditorPayload();
    const moduleId = String(
      document.getElementById('me-comment-thread-source-module-id')?.value || payload.entry?.id || ''
    ).trim();
    if (!moduleId) throw new Error('Das Modul braucht eine ID, bevor Quellen gesucht werden koennen.');

    _moduleCommentThreadSourceModuleId = moduleId;
    _moduleCommentThreadSourceCandidates = await findFirebaseCommentThreadSourceCandidates(moduleId, payload.entry);

    renderModuleCommentThreadSourceOptions(_moduleCommentThreadSourceCandidates);
    setModuleEditorStatus(_moduleCommentThreadSourceCandidates.length
      ? `Firebase-Quellen geladen: ${_moduleCommentThreadSourceCandidates.length} Kommentarbereiche gefunden.`
      : 'Keine alten Firebase-Kommentarbereiche fuer dieses Modul gefunden.');
  } catch (error) {
    console.error('load comment thread sources failed:', error);
    renderModuleCommentThreadSourceOptions([], 'Quellen konnten nicht geladen werden');
    setModuleEditorStatus(error.message || 'Firebase-Quellen konnten nicht geladen werden.', true);
  }
}

async function rescueSelectedModuleEditorCommentThreadFromFirebase() {
  try {
    const sourceThreadId = String(document.getElementById('me-comment-thread-source-select')?.value || '').trim();
    if (!sourceThreadId) throw new Error('Bitte zuerst eine Firebase-Quelle laden und auswaehlen.');
    const source = _moduleCommentThreadSourceCandidates.find(candidate => candidate.threadId === sourceThreadId);
    if (!source) throw new Error('Die gewaehlte Firebase-Quelle ist nicht mehr verfuegbar.');
    const { descriptor: target, context } = getSelectedModuleEditorCommentThreadDescriptor();
    const sourceLabel = getCommentThreadSourceOptionLabel(source);
    const targetLabel = getCommentThreadIoLabel(target);
    if (!confirm(`Alte Kommentare retten?\n\nQuelle: ${sourceLabel}\nZiel: ${targetLabel}\n\nDie Kommentare werden in die Ziel-Seite kopiert. Bestehende Kommentare dort bleiben erhalten.`)) {
      return;
    }

    setModuleEditorStatus('Alte Kommentar-Session wird in die Auswahl kopiert...');
    const sourcePayload = buildCommentThreadExportFromCandidate(source, context);
    const result = await importCommentThreadPayload(sourcePayload, target, { skipConfirm: true });
    if (result.cancelled) return;
    setModuleEditorStatus(`Kommentar-Session gerettet: ${result.commentCount} Kommentare, ${result.turnCount} Redestab-Staende.`);
    if (typeof updateFirebaseSyncStatus === 'function') updateFirebaseSyncStatus('synced', 'Kommentar-Session gerettet.');
  } catch (error) {
    console.error('comment thread rescue failed:', error);
    setModuleEditorStatus(error.message || 'Kommentar-Session konnte nicht gerettet werden.', true);
    if (typeof updateFirebaseSyncStatus === 'function') updateFirebaseSyncStatus('error', 'Kommentar-Rettung fehlgeschlagen.');
  }
}

async function rescueCurrentCommentThreadFromFirebaseModal() {
  try {
    const target = typeof getCurrentCommentThread === 'function' ? getCurrentCommentThread() : null;
    if (!target?.threadId) throw new Error('Diese Seite hat keinen Kommentarbereich als Ziel.');
    const entry = target.entry || (typeof getRenderableEntry === 'function' ? getRenderableEntry(currentEntry) : currentEntry);
    const defaultModuleId = parseCommentThreadLocation(target.threadId).baseEntryId || entry?.id || '';
    const sourceModuleId = prompt('Alte Modul-ID fuer die Firebase-Suche:', defaultModuleId);
    if (sourceModuleId === null) return;
    const safeModuleId = String(sourceModuleId || '').trim();
    if (!safeModuleId) throw new Error('Ohne Modul-ID kann keine Firebase-Quelle gesucht werden.');

    setCommentIoStatus('Firebase-Kommentarquellen werden gelesen...');
    const candidates = await findFirebaseCommentThreadSourceCandidates(safeModuleId, entry);
    const source = chooseFirebaseCommentThreadSource(candidates);
    if (!source) return;
    const sourceLabel = getCommentThreadSourceOptionLabel(source);
    const targetLabel = getCommentThreadIoLabel(target);
    if (!confirm(`Alte Kommentare retten?\n\nQuelle: ${sourceLabel}\nZiel: ${targetLabel}\n\nDie Kommentare werden in die aktuell geoeffnete Seite kopiert. Bestehende Kommentare dort bleiben erhalten.`)) {
      return;
    }

    const sourcePayload = buildCommentThreadExportFromCandidate(source, {
      moduleId: safeModuleId,
      moduleTitle: entry?.title || ''
    });
    const result = await importCommentThreadPayload(sourcePayload, target, { skipConfirm: true });
    if (result.cancelled) return;
    setCommentIoStatus(`Kommentar-Session gerettet: ${result.commentCount} Kommentare, ${result.turnCount} Redestab-Staende.`);
    if (typeof updateFirebaseSyncStatus === 'function') updateFirebaseSyncStatus('synced', 'Kommentar-Session gerettet.');
  } catch (error) {
    console.error('current comment thread rescue failed:', error);
    setCommentIoStatus(error.message || 'Kommentar-Session konnte nicht gerettet werden.', true);
    if (typeof updateFirebaseSyncStatus === 'function') updateFirebaseSyncStatus('error', 'Kommentar-Rettung fehlgeschlagen.');
  }
}
