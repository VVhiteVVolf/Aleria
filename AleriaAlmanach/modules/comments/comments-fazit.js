// Fazit ("Session-Fazit") form: mehrere Zeilen aus Icon+Beschriftung-Bausteinen
// (Personen aus dem Charakterarchiv oder frei gewaehlte Symbole).
let _fazitLines = [];
let _fazitLineCounter = 0;
let _fazitTokenCounter = 0;
let _fazitListItemCounter = 0;
let _fazitIconPickerTarget = null;
let _fazitPersonPickerTarget = null;
let _fazitPersonSearch = '';
let _editingFazitCommentId = null;
let _fazitTitle = 'Fazit';
let _fazitActiveLineId = '';
let _fazitDraftStatus = 'idle';
let _fazitDraftSaveTimer = null;
const _fazitHistory = createFazitHistory();

function fazitAvailableCharacters() {
  try {
    return (typeof getAvailableCommentCharacters === 'function' ? getAvailableCommentCharacters() : [])
      .filter(character => character?.id && character.entityType !== 'creature');
  } catch {
    return [];
  }
}

function newFazitLine(kind = 'tokens') {
  _fazitLineCounter += 1;
  const id = `line-${_fazitLineCounter}`;
  if (kind === 'text') return { id, kind: 'text', text: '', tone: 'plain', tokens: [], items: [] };
  if (kind === 'heading') return { id, kind: 'heading', text: '', level: 'section', tokens: [], items: [] };
  if (kind === 'list') return { id, kind: 'list', style: 'bullet', bulletIcon: '', items: [newFazitListItem()], text: '', tokens: [] };
  return { id, kind: 'tokens', tokens: [], text: '', items: [], align: 'center' };
}

function newFazitToken(kind) {
  _fazitTokenCounter += 1;
  return {
    id: `token-${_fazitTokenCounter}`,
    kind: kind === 'person' ? 'person' : 'symbol',
    icon: '',
    label: '',
    characterId: '',
    flip: false,
    size: 'medium',
    variant: kind === 'person' ? 'portrait' : 'plain'
  };
}

function newFazitListItem(text = '') {
  _fazitListItemCounter += 1;
  return { id: `item-${_fazitListItemCounter}`, text: String(text || '') };
}

function findFazitLine(lineId) {
  return _fazitLines.find(line => line.id === String(lineId));
}

function findFazitToken(lineId, tokenId) {
  const line = findFazitLine(lineId);
  return line?.tokens.find(token => token.id === String(tokenId)) || null;
}

function fazitPersonOptionsMarkup(characters) {
  if (!characters.length) return '<p class="fazit-person-picker-empty">Keine Treffer.</p>';
  return characters.map(character => {
    const safeName = escapeHtml(character.name || 'Unbenannt');
    const portraitSrc = sanitizeImageSrc(character.portrait || '');
    return `<div class="cf-char-option" data-action="select-fazit-token-person" data-character-id="${escapeHtml(character.id)}">
      ${portraitSrc
        ? `<img src="${portraitSrc}" alt="${safeName}" loading="lazy" decoding="async">`
        : `<div class="cf-char-option-placeholder">${escapeHtml(getInitialChar(character.name))}</div>`}
      <div class="cf-char-option-name">${safeName}</div>
    </div>`;
  }).join('');
}

function filterFazitPersonCharacters(needle) {
  const characters = fazitAvailableCharacters();
  const search = normalizeSearchText(needle || '');
  if (!search) return characters;
  return characters.filter(character => normalizeSearchText(character.name || '').includes(search));
}

function renderFazitPersonPicker(line) {
  if (!_fazitPersonPickerTarget || _fazitPersonPickerTarget.lineId !== line.id) return '';
  const characters = filterFazitPersonCharacters(_fazitPersonSearch);
  return `<div class="fazit-person-picker">
    <div class="fazit-person-picker-head">
      <input type="text" class="fazit-person-search" value="${escapeHtml(_fazitPersonSearch)}" placeholder="Figur suchen …" autocomplete="off" data-action="filter-fazit-person-picker">
      <button type="button" class="fazit-person-picker-close" data-action="close-fazit-person-picker" title="Schließen" aria-label="Schließen">×</button>
    </div>
    <div class="cf-char-picker fazit-person-picker-list" data-fazit-person-list>${fazitPersonOptionsMarkup(characters)}</div>
  </div>`;
}

function renderFazitLineEditor(line, index) {
  const editorLine = { ...line, active: String(line.id) === String(_fazitActiveLineId) };
  if (line.kind === 'heading') return renderFazitHeadingLineEditor(editorLine, index, _fazitLines.length);
  if (line.kind === 'list') return renderFazitListLineEditor(editorLine, index, _fazitLines.length);
  if (line.kind === 'text') return renderFazitTextLineEditor(editorLine, index, _fazitLines.length);
  return renderFazitTokenLineEditor(editorLine, index, _fazitLines.length, renderFazitPersonPicker(line));
}

function renderFazitLinesEditor() {
  const host = document.getElementById('fz-lines');
  if (!host) return;
  if (!_fazitLines.some(line => line.id === _fazitActiveLineId)) _fazitActiveLineId = _fazitLines[0]?.id || '';
  renderFazitEditorChrome();
  host.innerHTML = _fazitLines.length
    ? _fazitLines.map((line, index) => `${renderFazitLineEditor(line, index)}${renderFazitBlockToolbar({
      afterLineId: line.id,
      lineCount: _fazitLines.length,
      position: index + 1,
      variant: 'inline'
    })}`).join('')
    : '<p class="fazit-lines-empty">Noch keine Zeile angelegt.</p>';
}

function collectFazitFormPayload() {
  return normalizeCommentFazitItem({
    title: _fazitTitle,
    lines: _fazitLines
  });
}

function updateFazitPreview() {
  const preview = document.getElementById('fz-preview');
  if (!preview) return;
  const item = collectFazitFormPayload() || { title: _fazitTitle.trim() || 'Fazit', lines: [] };
  preview.innerHTML = item.lines.length
    ? renderCommentFazitCard(item)
    : '<p class="fazit-preview-empty">Noch nichts zum Anzeigen — füge Zeilen und Bausteine hinzu.</p>';
}

function updateFazitTitle(value) {
  const nextTitle = String(value || '').slice(0, 120);
  if (nextTitle === _fazitTitle) return;
  captureFazitHistory('fazit-title');
  _fazitTitle = nextTitle;
  finishFazitContentMutation();
}

function addFazitLine(kind = 'tokens', afterLineId = '') {
  if (_fazitLines.length >= FAZIT_CONTENT_LIMITS.maxLines) return;
  captureFazitHistory();
  const line = newFazitLine(kind);
  const afterIndex = _fazitLines.findIndex(entry => entry.id === String(afterLineId));
  const insertionIndex = afterIndex >= 0 ? afterIndex + 1 : _fazitLines.length;
  _fazitLines.splice(insertionIndex, 0, line);
  _fazitActiveLineId = line.id;
  finishFazitContentMutation({ renderLines: true });
  const field = document.querySelector(`[data-line-id="${CSS.escape(line.id)}"] input, [data-line-id="${CSS.escape(line.id)}"] textarea`);
  field?.focus({ preventScroll: true });
}

function updateFazitLineText(lineId, value) {
  const line = findFazitLine(lineId);
  if (!line || !['text', 'heading'].includes(line.kind)) return;
  const nextText = String(value || '').slice(0, line.kind === 'heading' ? 160 : 600);
  if (nextText === line.text) return;
  captureFazitHistory(`line-text:${line.id}`);
  line.text = nextText;
  finishFazitContentMutation();
}

function updateFazitLineTone(lineId, tone) {
  const line = findFazitLine(lineId);
  if (!line || line.kind !== 'text') return;
  const nextTone = ['plain', 'note', 'quote'].includes(tone) ? tone : 'plain';
  if (nextTone === line.tone) return;
  captureFazitHistory();
  line.tone = nextTone;
  finishFazitContentMutation();
}

function updateFazitHeadingLevel(lineId, level) {
  const line = findFazitLine(lineId);
  if (!line || line.kind !== 'heading') return;
  const nextLevel = level === 'subsection' ? 'subsection' : 'section';
  if (nextLevel === line.level) return;
  captureFazitHistory();
  line.level = nextLevel;
  finishFazitContentMutation();
}

function updateFazitLineAlign(lineId, align) {
  const line = findFazitLine(lineId);
  if (!line || line.kind !== 'tokens') return;
  const nextAlign = ['left', 'center', 'right'].includes(align) ? align : 'center';
  if (nextAlign === line.align) return;
  captureFazitHistory();
  line.align = nextAlign;
  finishFazitContentMutation();
}

function moveFazitLine(lineId, direction) {
  const index = _fazitLines.findIndex(line => line.id === String(lineId));
  const targetIndex = index + (direction === 'down' ? 1 : -1);
  if (index < 0 || targetIndex < 0 || targetIndex >= _fazitLines.length) return;
  captureFazitHistory();
  [_fazitLines[index], _fazitLines[targetIndex]] = [_fazitLines[targetIndex], _fazitLines[index]];
  _fazitActiveLineId = String(lineId);
  finishFazitContentMutation({ renderLines: true });
}

function duplicateFazitLine(lineId) {
  if (_fazitLines.length >= FAZIT_CONTENT_LIMITS.maxLines) return;
  const index = _fazitLines.findIndex(line => line.id === String(lineId));
  if (index < 0) return;
  captureFazitHistory();
  const source = _fazitLines[index];
  const duplicate = newFazitLine(source.kind);
  duplicate.text = source.text || '';
  duplicate.tone = source.tone;
  duplicate.level = source.level;
  duplicate.style = source.style;
  duplicate.bulletIcon = source.bulletIcon || '';
  duplicate.align = source.align;
  duplicate.tokens = (source.tokens || []).map(token => ({ ...token, id: newFazitToken(token.kind).id }));
  duplicate.items = (source.items || []).map(item => newFazitListItem(item.text));
  _fazitLines.splice(index + 1, 0, duplicate);
  _fazitActiveLineId = duplicate.id;
  finishFazitContentMutation({ renderLines: true });
}

function addFazitConnectorToken(lineId, presetKey) {
  const line = findFazitLine(lineId);
  const preset = FAZIT_CONNECTOR_PRESETS[presetKey];
  if (!line || line.kind !== 'tokens' || !preset || line.tokens.length >= FAZIT_CONTENT_LIMITS.maxTokensPerLine) return;
  captureFazitHistory();
  const token = newFazitToken('symbol');
  token.icon = preset.icon;
  token.label = preset.label;
  token.flip = preset.flip === true;
  line.tokens.push(token);
  finishFazitContentMutation({ renderLines: true });
}

function addFazitSymbolPresetToken(lineId, presetKey) {
  const line = findFazitLine(lineId);
  const preset = FAZIT_SYMBOL_PRESETS.find(entry => entry.key === presetKey);
  if (!line || line.kind !== 'tokens' || !preset || line.tokens.length >= FAZIT_CONTENT_LIMITS.maxTokensPerLine) return;
  captureFazitHistory();
  const token = newFazitToken('symbol');
  token.icon = preset.icon;
  token.label = preset.label;
  token.variant = 'plain';
  line.tokens.push(token);
  finishFazitContentMutation({ renderLines: true });
}

function removeFazitLine(lineId) {
  if (!_fazitLines.some(line => line.id === String(lineId))) return;
  captureFazitHistory();
  _fazitLines = _fazitLines.filter(line => line.id !== String(lineId));
  finishFazitContentMutation({ renderLines: true });
}

function addFazitListItem(lineId, afterItemId = '') {
  const line = findFazitLine(lineId);
  if (!line || line.kind !== 'list' || line.items.length >= FAZIT_CONTENT_LIMITS.maxListItemsPerLine) return;
  captureFazitHistory();
  const item = newFazitListItem();
  const afterIndex = line.items.findIndex(entry => entry.id === String(afterItemId));
  const insertionIndex = afterIndex >= 0 ? afterIndex + 1 : line.items.length;
  line.items.splice(insertionIndex, 0, item);
  finishFazitContentMutation({ renderLines: true });
  document.querySelector(`[data-item-id="${CSS.escape(item.id)}"] textarea`)?.focus({ preventScroll: true });
}

function updateFazitListItem(lineId, itemId, value) {
  const line = findFazitLine(lineId);
  const item = line?.kind === 'list' ? line.items.find(entry => entry.id === String(itemId)) : null;
  if (!item) return;
  const nextText = String(value || '').slice(0, 300);
  if (nextText === item.text) return;
  captureFazitHistory(`list-item:${item.id}`);
  item.text = nextText;
  finishFazitContentMutation();
}

function removeFazitListItem(lineId, itemId) {
  const line = findFazitLine(lineId);
  if (!line || line.kind !== 'list') return;
  if (!line.items.some(item => item.id === String(itemId))) return;
  captureFazitHistory();
  line.items = line.items.filter(item => item.id !== String(itemId));
  finishFazitContentMutation({ renderLines: true });
}

function moveFazitListItem(lineId, itemId, direction) {
  const line = findFazitLine(lineId);
  if (!line || line.kind !== 'list') return;
  const index = line.items.findIndex(item => item.id === String(itemId));
  const targetIndex = index + (direction === 'down' ? 1 : -1);
  if (index < 0 || targetIndex < 0 || targetIndex >= line.items.length) return;
  captureFazitHistory();
  [line.items[index], line.items[targetIndex]] = [line.items[targetIndex], line.items[index]];
  finishFazitContentMutation({ renderLines: true });
}

function updateFazitListStyle(lineId, style) {
  const line = findFazitLine(lineId);
  if (!line || line.kind !== 'list') return;
  const nextStyle = ['bullet', 'numbered', 'check'].includes(style) ? style : 'bullet';
  if (nextStyle === line.style) return;
  captureFazitHistory();
  line.style = nextStyle;
  finishFazitContentMutation({ renderLines: true });
}

function openFazitListBulletIconPicker(lineId) {
  const line = findFazitLine(lineId);
  if (!line || line.kind !== 'list' || line.style !== 'bullet') return;
  _fazitIconPickerTarget = { kind: 'list-bullet', lineId: String(lineId) };
  if (typeof openIconDirectory === 'function') openIconDirectory();
  else _fazitIconPickerTarget = null;
}

function clearFazitListBulletIcon(lineId) {
  const line = findFazitLine(lineId);
  if (!line || line.kind !== 'list' || !line.bulletIcon) return;
  captureFazitHistory();
  line.bulletIcon = '';
  finishFazitContentMutation({ renderLines: true });
}

function addFazitToken(lineId, kind) {
  const line = findFazitLine(lineId);
  if (!line || line.kind !== 'tokens' || line.tokens.length >= FAZIT_CONTENT_LIMITS.maxTokensPerLine) return;
  captureFazitHistory();
  const token = newFazitToken(kind);
  line.tokens.push(token);
  if (kind === 'person') {
    openFazitTokenPersonPicker(lineId, token.id);
  } else {
    renderFazitLinesEditor();
  }
  updateFazitPreview();
  scheduleFazitDraftSave();
}

function removeFazitToken(lineId, tokenId) {
  const line = findFazitLine(lineId);
  if (!line || !line.tokens.some(token => token.id === String(tokenId))) return;
  captureFazitHistory();
  line.tokens = line.tokens.filter(token => token.id !== String(tokenId));
  finishFazitContentMutation({ renderLines: true });
}

function duplicateFazitToken(lineId, tokenId) {
  const line = findFazitLine(lineId);
  if (!line || line.kind !== 'tokens' || line.tokens.length >= FAZIT_CONTENT_LIMITS.maxTokensPerLine) return;
  const index = line.tokens.findIndex(token => token.id === String(tokenId));
  if (index < 0) return;
  captureFazitHistory();
  const source = line.tokens[index];
  const duplicate = { ...source, id: newFazitToken(source.kind).id };
  line.tokens.splice(index + 1, 0, duplicate);
  finishFazitContentMutation({ renderLines: true });
}

function moveFazitToken(lineId, tokenId, direction) {
  const line = findFazitLine(lineId);
  if (!line) return;
  const index = line.tokens.findIndex(token => token.id === String(tokenId));
  const targetIndex = index + (direction === 'right' ? 1 : -1);
  if (index < 0 || targetIndex < 0 || targetIndex >= line.tokens.length) return;
  captureFazitHistory();
  [line.tokens[index], line.tokens[targetIndex]] = [line.tokens[targetIndex], line.tokens[index]];
  finishFazitContentMutation({ renderLines: true });
}

function updateFazitTokenIcon(lineId, tokenId, value) {
  const token = findFazitToken(lineId, tokenId);
  if (!token) return;
  const nextIcon = String(value || '').trim();
  if (nextIcon === token.icon) return;
  captureFazitHistory(`token-icon:${token.id}`);
  token.icon = nextIcon;
  finishFazitContentMutation();
}

function updateFazitTokenLabel(lineId, tokenId, value) {
  const token = findFazitToken(lineId, tokenId);
  if (!token) return;
  const nextLabel = String(value || '').slice(0, 80);
  if (nextLabel === token.label) return;
  captureFazitHistory(`token-label:${token.id}`);
  token.label = nextLabel;
  finishFazitContentMutation();
}

function updateFazitTokenSize(lineId, tokenId, size) {
  const token = findFazitToken(lineId, tokenId);
  if (!token) return;
  const nextSize = ['small', 'medium', 'large'].includes(size) ? size : 'medium';
  if (nextSize === token.size) return;
  captureFazitHistory();
  token.size = nextSize;
  finishFazitContentMutation();
}

function updateFazitTokenVariant(lineId, tokenId, variant) {
  const token = findFazitToken(lineId, tokenId);
  if (!token || token.kind !== 'symbol') return;
  const nextVariant = ['plain', 'tile', 'seal'].includes(variant) ? variant : 'plain';
  if (nextVariant === token.variant) return;
  captureFazitHistory();
  token.variant = nextVariant;
  finishFazitContentMutation();
}

function toggleFazitTokenFlip(lineId, tokenId) {
  const token = findFazitToken(lineId, tokenId);
  if (!token || token.kind !== 'symbol') return;
  captureFazitHistory();
  token.flip = !token.flip;
  finishFazitContentMutation({ renderLines: true });
}

function openFazitTokenIconPicker(lineId, tokenId) {
  const input = document.querySelector(`.fazit-token-icon-input[data-line-id="${CSS.escape(String(lineId))}"][data-token-id="${CSS.escape(String(tokenId))}"]`);
  if (!input) return;
  _fazitIconPickerTarget = { kind: 'token', lineId: String(lineId), tokenId: String(tokenId) };
  if (typeof openIconDirectory === 'function') openIconDirectory();
  else _fazitIconPickerTarget = null;
}

function handleFazitIconSelected(event) {
  const target = _fazitIconPickerTarget;
  const src = String(event?.detail?.src || '').trim();
  _fazitIconPickerTarget = null;
  if (!target || !src) return;
  if (target.kind === 'list-bullet') {
    const line = findFazitLine(target.lineId);
    if (!line || line.kind !== 'list') return;
    captureFazitHistory();
    line.bulletIcon = src;
    finishFazitContentMutation({ renderLines: true });
    if (typeof closeIconDirectory === 'function') closeIconDirectory();
    return;
  }
  const token = findFazitToken(target.lineId, target.tokenId);
  if (!token) return;
  captureFazitHistory();
  token.icon = src;
  finishFazitContentMutation({ renderLines: true });
  if (typeof closeIconDirectory === 'function') closeIconDirectory();
}

document.addEventListener('almanach-icon-selected', handleFazitIconSelected);

function openFazitTokenPersonPicker(lineId, tokenId) {
  const token = findFazitToken(lineId, tokenId);
  if (!token) return;
  if (_fazitPersonPickerTarget?.lineId === String(lineId) && _fazitPersonPickerTarget?.tokenId === String(tokenId)) {
    _fazitPersonPickerTarget = null;
    renderFazitLinesEditor();
    return;
  }
  _fazitPersonPickerTarget = { lineId: String(lineId), tokenId: String(tokenId) };
  _fazitPersonSearch = '';
  renderFazitLinesEditor();
  const search = document.querySelector('.fazit-person-search');
  search?.focus({ preventScroll: true });
}

function closeFazitPersonPicker() {
  _fazitPersonPickerTarget = null;
  renderFazitLinesEditor();
}

function filterFazitPersonPicker(value) {
  _fazitPersonSearch = String(value || '');
  const list = document.querySelector('[data-fazit-person-list]');
  if (!list) return;
  list.innerHTML = fazitPersonOptionsMarkup(filterFazitPersonCharacters(_fazitPersonSearch));
}

function selectFazitTokenPerson(characterId) {
  const target = _fazitPersonPickerTarget;
  if (!target) return;
  const token = findFazitToken(target.lineId, target.tokenId);
  const character = fazitAvailableCharacters().find(c => String(c.id) === String(characterId));
  if (!token || !character) return;
  captureFazitHistory();
  token.icon = String(character.portrait || '');
  token.label = String(character.name || '');
  token.characterId = String(character.id || '');
  _fazitPersonPickerTarget = null;
  finishFazitContentMutation({ renderLines: true });
}

function resetFazitForm() {
  clearTimeout(_fazitDraftSaveTimer);
  _fazitDraftSaveTimer = null;
  _fazitLines = [];
  _fazitLineCounter = 0;
  _fazitTokenCounter = 0;
  _fazitListItemCounter = 0;
  _fazitIconPickerTarget = null;
  _fazitPersonPickerTarget = null;
  _fazitPersonSearch = '';
  _editingFazitCommentId = null;
  _fazitTitle = 'Fazit';
  _fazitActiveLineId = '';
  _fazitDraftStatus = 'idle';
  _fazitHistory.reset();
  if (typeof resetFazitHintPanel === 'function') resetFazitHintPanel();
  const title = document.getElementById('fz-title');
  if (title) title.value = _fazitTitle;
  renderFazitLinesEditor();
  updateFazitPreview();
  const error = document.getElementById('fz-error');
  if (error) {
    error.textContent = '';
    error.style.display = 'none';
  }
  const submit = document.getElementById('fz-submit');
  if (submit) {
    submit.disabled = false;
    submit.textContent = 'Eintragen';
  }
}

function openFazitForm() {
  resetFazitForm();
  cleanupOldFazitDrafts();
  const restored = restoreCurrentFazitDraft();
  if (!restored) {
    const line = newFazitLine();
    _fazitLines = [line];
    _fazitActiveLineId = line.id;
  }
  _fazitHistory.reset();
  renderFazitLinesEditor();
  updateFazitPreview();
  activateDialog('fazit-form-overlay', { initialFocus: '#fz-title' });
  applyFazitPreviewWidth(_fazitPreviewWidth);
}

function closeFazitForm() {
  if (_fazitDraftSaveTimer) {
    clearTimeout(_fazitDraftSaveTimer);
    saveCurrentFazitDraft();
  }
  deactivateDialog('fazit-form-overlay');
  _editingFazitCommentId = null;
}

function openEditFazitForm(commentId) {
  const comment = findCachedCommentById(commentId);
  const item = comment && getCommentFazitItem(comment);
  if (!item) {
    alert('Fazit konnte nicht geladen werden.');
    return;
  }
  resetFazitForm();
  _editingFazitCommentId = String(commentId || '');
  restoreFazitEditorSnapshot({ title: item.title, lines: item.lines });
  restoreCurrentFazitDraft();
  _fazitHistory.reset();
  renderFazitLinesEditor();
  updateFazitPreview();
  const submit = document.getElementById('fz-submit');
  if (submit) submit.textContent = 'Änderungen speichern';
  activateDialog('fazit-form-overlay', { initialFocus: '#fz-title' });
  applyFazitPreviewWidth(_fazitPreviewWidth);
}

const FAZIT_PREVIEW_WIDTH_MIN = 280;
const FAZIT_PREVIEW_WIDTH_MAX_RATIO = 0.6;
const FAZIT_PREVIEW_WIDTH_STEP = 24;
let _fazitPreviewWidth = 420;
let _fazitSplitterDragState = null;

function applyFazitPreviewWidth(width) {
  const pane = document.getElementById('fz-preview-pane');
  const grid = document.getElementById('fz-grid');
  if (!pane || !grid) return;
  const maxWidth = Math.max(FAZIT_PREVIEW_WIDTH_MIN, grid.clientWidth * FAZIT_PREVIEW_WIDTH_MAX_RATIO);
  _fazitPreviewWidth = Math.round(Math.max(FAZIT_PREVIEW_WIDTH_MIN, Math.min(maxWidth, width)));
  pane.style.flexBasis = `${_fazitPreviewWidth}px`;
}

function handleFazitSplitterDrag(event) {
  if (!_fazitSplitterDragState) return;
  const delta = _fazitSplitterDragState.startX - event.clientX;
  applyFazitPreviewWidth(_fazitSplitterDragState.startWidth + delta);
}

function endFazitSplitterDrag() {
  _fazitSplitterDragState = null;
  document.body.classList.remove('fazit-splitter-dragging');
  window.removeEventListener('pointermove', handleFazitSplitterDrag);
}

function startFazitSplitterDrag(event) {
  const pane = document.getElementById('fz-preview-pane');
  if (!pane) return;
  event.preventDefault();
  _fazitSplitterDragState = { startX: event.clientX, startWidth: pane.getBoundingClientRect().width };
  document.body.classList.add('fazit-splitter-dragging');
  window.addEventListener('pointermove', handleFazitSplitterDrag);
  window.addEventListener('pointerup', endFazitSplitterDrag, { once: true });
}

document.addEventListener('pointerdown', event => {
  if (event.target?.closest?.('[data-action="fazit-splitter-handle"]')) startFazitSplitterDrag(event);
});

document.addEventListener('keydown', event => {
  const handle = event.target?.closest?.('[data-action="fazit-splitter-handle"]');
  if (!handle) return;
  if (event.key === 'ArrowLeft') { event.preventDefault(); applyFazitPreviewWidth(_fazitPreviewWidth + FAZIT_PREVIEW_WIDTH_STEP); }
  if (event.key === 'ArrowRight') { event.preventDefault(); applyFazitPreviewWidth(_fazitPreviewWidth - FAZIT_PREVIEW_WIDTH_STEP); }
});

window.addEventListener('resize', () => {
  if (document.getElementById('fazit-form-overlay')?.classList.contains('active')) applyFazitPreviewWidth(_fazitPreviewWidth);
});
