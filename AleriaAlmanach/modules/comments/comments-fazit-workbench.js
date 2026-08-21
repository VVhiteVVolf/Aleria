// Workbench coordination for Fazit: snapshots, draft lifecycle, editor chrome,
// structural view commands and history restoration. Content mutations stay in
// comments-fazit.js; low-level stack/storage mechanics stay in their own modules.
function cloneFazitEditorValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function createFazitEditorSnapshot() {
  return {
    title: _fazitTitle,
    lines: cloneFazitEditorValue(_fazitLines)
  };
}

function restoreFazitEditorSnapshot(snapshot) {
  const source = snapshot && typeof snapshot === 'object' ? snapshot : {};
  const sourceLines = Array.isArray(source.lines)
    ? source.lines.slice(0, FAZIT_CONTENT_LIMITS.maxLines)
    : [];
  _fazitLineCounter = 0;
  _fazitTokenCounter = 0;
  _fazitListItemCounter = 0;
  _fazitTitle = String(source.title || 'Fazit').slice(0, 120) || 'Fazit';
  _fazitLines = sourceLines.map(sourceLine => {
    const kind = ['tokens', 'text', 'heading', 'list'].includes(sourceLine?.kind) ? sourceLine.kind : 'tokens';
    const line = newFazitLine(kind);
    line.text = String(sourceLine?.text || '').slice(0, kind === 'heading' ? 160 : 600);
    line.tone = ['plain', 'note', 'quote'].includes(sourceLine?.tone) ? sourceLine.tone : line.tone;
    line.level = sourceLine?.level === 'subsection' ? 'subsection' : line.level;
    line.style = ['bullet', 'numbered', 'check'].includes(sourceLine?.style) ? sourceLine.style : line.style;
    line.bulletIcon = String(sourceLine?.bulletIcon || '').slice(0, 1000);
    line.align = ['left', 'center', 'right'].includes(sourceLine?.align) ? sourceLine.align : line.align;
    line.collapsed = sourceLine?.collapsed === true;
    line.items = (Array.isArray(sourceLine?.items) ? sourceLine.items : [])
      .slice(0, FAZIT_CONTENT_LIMITS.maxListItemsPerLine)
      .map(item => newFazitListItem(String(item?.text || '').slice(0, 300)));
    line.tokens = (Array.isArray(sourceLine?.tokens) ? sourceLine.tokens : [])
      .slice(0, FAZIT_CONTENT_LIMITS.maxTokensPerLine)
      .map(sourceToken => {
        const token = newFazitToken(sourceToken?.kind);
        token.icon = String(sourceToken?.icon || '');
        token.label = String(sourceToken?.label || '').slice(0, 80);
        token.characterId = token.kind === 'person' ? String(sourceToken?.characterId || '') : '';
        token.flip = sourceToken?.flip === true;
        token.size = ['small', 'medium', 'large'].includes(sourceToken?.size) ? sourceToken.size : 'medium';
        token.variant = token.kind === 'person'
          ? 'portrait'
          : ['plain', 'tile', 'seal'].includes(sourceToken?.variant) ? sourceToken.variant : 'plain';
        return token;
      });
    return line;
  });
  _fazitActiveLineId = _fazitLines[0]?.id || '';
  const titleField = document.getElementById('fz-title');
  if (titleField) titleField.value = _fazitTitle;
}

function captureFazitHistory(mergeKey = '') {
  _fazitHistory.capture(createFazitEditorSnapshot(), mergeKey);
}

function getCurrentFazitDraftThreadId() {
  try {
    return typeof getCurrentCommentThreadId === 'function' ? String(getCurrentCommentThreadId() || '') : '';
  } catch {
    return '';
  }
}

function renderFazitEditorChrome() {
  const historyState = _fazitHistory.getState();
  const commandbar = document.getElementById('fz-commandbar');
  if (commandbar) {
    commandbar.innerHTML = renderFazitEditorCommandbar({
      historyState,
      draftStatus: _fazitDraftStatus,
      lineCount: _fazitLines.length,
      collapsedCount: _fazitLines.filter(line => line.collapsed).length
    });
  }
  const outline = document.getElementById('fz-outline');
  if (outline) outline.innerHTML = renderFazitOutline(_fazitLines, _fazitActiveLineId);
  const primaryToolbar = document.getElementById('fz-primary-toolbar');
  if (primaryToolbar) primaryToolbar.innerHTML = renderFazitBlockToolbar({ lineCount: _fazitLines.length });
}

function saveCurrentFazitDraft() {
  _fazitDraftSaveTimer = null;
  const threadId = getCurrentFazitDraftThreadId();
  if (!threadId) return;
  const saved = writeFazitDraft(threadId, _editingFazitCommentId || '', createFazitEditorSnapshot());
  _fazitDraftStatus = saved ? 'saved' : 'unavailable';
  renderFazitEditorChrome();
}

function scheduleFazitDraftSave() {
  const threadId = getCurrentFazitDraftThreadId();
  if (!threadId) return;
  clearTimeout(_fazitDraftSaveTimer);
  _fazitDraftStatus = 'saving';
  renderFazitEditorChrome();
  _fazitDraftSaveTimer = setTimeout(saveCurrentFazitDraft, 240);
}

function restoreCurrentFazitDraft() {
  const threadId = getCurrentFazitDraftThreadId();
  const draft = readFazitDraft(threadId, _editingFazitCommentId || '');
  if (!draft?.snapshot) return false;
  restoreFazitEditorSnapshot(draft.snapshot);
  _fazitDraftStatus = 'restored';
  return true;
}

function clearCurrentFazitDraft() {
  clearTimeout(_fazitDraftSaveTimer);
  _fazitDraftSaveTimer = null;
  const cleared = removeFazitDraft(getCurrentFazitDraftThreadId(), _editingFazitCommentId || '');
  _fazitDraftStatus = cleared ? 'idle' : _fazitDraftStatus;
  renderFazitEditorChrome();
}

function finishFazitContentMutation({ renderLines = false, updatePreview = true } = {}) {
  if (renderLines) renderFazitLinesEditor();
  else renderFazitEditorChrome();
  if (updatePreview) updateFazitPreview();
  scheduleFazitDraftSave();
}

function moveFazitLineRelative(lineId, targetLineId, placement = 'before') {
  const sourceIndex = _fazitLines.findIndex(line => line.id === String(lineId));
  const targetIndex = _fazitLines.findIndex(line => line.id === String(targetLineId));
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;
  const nextLines = [..._fazitLines];
  const [sourceLine] = nextLines.splice(sourceIndex, 1);
  const adjustedTargetIndex = nextLines.findIndex(line => line.id === String(targetLineId));
  const insertionIndex = adjustedTargetIndex + (placement === 'after' ? 1 : 0);
  nextLines.splice(insertionIndex, 0, sourceLine);
  if (nextLines.every((line, index) => line === _fazitLines[index])) return;
  captureFazitHistory();
  _fazitLines = nextLines;
  _fazitActiveLineId = sourceLine.id;
  finishFazitContentMutation({ renderLines: true });
}

function toggleFazitLineCollapse(lineId) {
  const line = findFazitLine(lineId);
  if (!line) return;
  line.collapsed = !line.collapsed;
  _fazitActiveLineId = line.id;
  renderFazitLinesEditor();
  scheduleFazitDraftSave();
}

function setAllFazitLinesCollapsed(collapsed) {
  const nextState = collapsed === true;
  if (!_fazitLines.some(line => line.collapsed !== nextState)) return;
  _fazitLines.forEach(line => { line.collapsed = nextState; });
  renderFazitLinesEditor();
  scheduleFazitDraftSave();
}

function setActiveFazitLine(lineId) {
  if (!findFazitLine(lineId) || _fazitActiveLineId === String(lineId)) return;
  _fazitActiveLineId = String(lineId);
  renderFazitEditorChrome();
  document.querySelectorAll('[data-fazit-line].is-active').forEach(node => node.classList.remove('is-active'));
  document.querySelector(`[data-fazit-line][data-line-id="${CSS.escape(_fazitActiveLineId)}"]`)?.classList.add('is-active');
}

function focusFazitLine(lineId) {
  const line = findFazitLine(lineId);
  if (!line) return;
  line.collapsed = false;
  _fazitActiveLineId = line.id;
  renderFazitLinesEditor();
  const section = document.querySelector(`[data-fazit-line][data-line-id="${CSS.escape(line.id)}"]`);
  section?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  section?.querySelector?.('input, textarea, select, button')?.focus?.({ preventScroll: true });
}

function undoFazitChange() {
  const snapshot = _fazitHistory.undo(createFazitEditorSnapshot());
  if (!snapshot) return;
  restoreFazitEditorSnapshot(snapshot);
  finishFazitContentMutation({ renderLines: true });
}

function redoFazitChange() {
  const snapshot = _fazitHistory.redo(createFazitEditorSnapshot());
  if (!snapshot) return;
  restoreFazitEditorSnapshot(snapshot);
  finishFazitContentMutation({ renderLines: true });
}
