// Fazit ("Session-Fazit") form: mehrere Zeilen aus Icon+Beschriftung-Bausteinen
// (Personen aus dem Charakterarchiv oder frei gewaehlte Symbole).
let _fazitLines = [];
let _fazitLineCounter = 0;
let _fazitTokenCounter = 0;
let _fazitIconPickerTarget = null;
let _fazitPersonPickerTarget = null;
let _fazitPersonSearch = '';
let _editingFazitCommentId = null;

function fazitAvailableCharacters() {
  try {
    return (typeof getAvailableCommentCharacters === 'function' ? getAvailableCommentCharacters() : [])
      .filter(character => character?.id && character.entityType !== 'creature');
  } catch {
    return [];
  }
}

function newFazitLine() {
  _fazitLineCounter += 1;
  return { id: `line-${_fazitLineCounter}`, tokens: [] };
}

function newFazitToken(kind) {
  _fazitTokenCounter += 1;
  return { id: `token-${_fazitTokenCounter}`, kind: kind === 'person' ? 'person' : 'symbol', icon: '', label: '', characterId: '' };
}

function findFazitLine(lineId) {
  return _fazitLines.find(line => line.id === String(lineId));
}

function findFazitToken(lineId, tokenId) {
  const line = findFazitLine(lineId);
  return line?.tokens.find(token => token.id === String(tokenId)) || null;
}

function renderFazitTokenEditor(line, token) {
  const picker = token.kind === 'person'
    ? `<button type="button" class="fazit-token-portrait-btn" data-action="pick-fazit-token-person" data-line-id="${escapeHtml(line.id)}" data-token-id="${escapeHtml(token.id)}" title="Figur wählen">
        ${token.icon ? `<img src="${escapeHtml(sanitizeImageSrc(token.icon))}" alt="">` : '<span>?</span>'}
      </button>`
    : `<span class="fazit-token-icon-field">
        <input type="text" class="fazit-token-icon-input" value="${escapeHtml(token.icon)}" placeholder="Icon-URL" data-action="update-fazit-token-icon" data-line-id="${escapeHtml(line.id)}" data-token-id="${escapeHtml(token.id)}">
        <button type="button" data-action="pick-fazit-token-icon" data-line-id="${escapeHtml(line.id)}" data-token-id="${escapeHtml(token.id)}" title="Icon-Verzeichnis öffnen">Icon</button>
      </span>`;
  return `<div class="fazit-token-editor" data-token-id="${escapeHtml(token.id)}">
    <button type="button" class="fazit-token-move" data-action="move-fazit-token" data-direction="left" data-line-id="${escapeHtml(line.id)}" data-token-id="${escapeHtml(token.id)}" title="Nach links verschieben" aria-label="Nach links verschieben">◀</button>
    ${picker}
    <input type="text" class="fazit-token-label-input" value="${escapeHtml(token.label)}" maxlength="80" placeholder="${token.kind === 'person' ? 'Name' : 'Beschriftung'}" data-action="update-fazit-token-label" data-line-id="${escapeHtml(line.id)}" data-token-id="${escapeHtml(token.id)}">
    <button type="button" class="fazit-token-move" data-action="move-fazit-token" data-direction="right" data-line-id="${escapeHtml(line.id)}" data-token-id="${escapeHtml(token.id)}" title="Nach rechts verschieben" aria-label="Nach rechts verschieben">▶</button>
    <button type="button" class="fazit-token-remove" data-action="remove-fazit-token" data-line-id="${escapeHtml(line.id)}" data-token-id="${escapeHtml(token.id)}" title="Baustein entfernen" aria-label="Baustein entfernen">×</button>
  </div>`;
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

function renderFazitLineEditor(line) {
  return `<div class="fazit-line-editor" data-line-id="${escapeHtml(line.id)}">
    <div class="fazit-line-tokens">${line.tokens.map(token => renderFazitTokenEditor(line, token)).join('') || '<span class="fazit-line-empty">Noch keine Bausteine — füge Personen oder Symbole hinzu.</span>'}</div>
    <div class="fazit-line-actions">
      <button type="button" class="module-editor-mini-btn" data-action="add-fazit-token" data-token-kind="person" data-line-id="${escapeHtml(line.id)}">+ Person</button>
      <button type="button" class="module-editor-mini-btn" data-action="add-fazit-token" data-token-kind="symbol" data-line-id="${escapeHtml(line.id)}">+ Symbol</button>
      <button type="button" class="fazit-line-remove" data-action="remove-fazit-line" data-line-id="${escapeHtml(line.id)}" title="Zeile entfernen" aria-label="Zeile entfernen">Zeile entfernen</button>
    </div>
    ${renderFazitPersonPicker(line)}
  </div>`;
}

function renderFazitLinesEditor() {
  const host = document.getElementById('fz-lines');
  if (!host) return;
  host.innerHTML = _fazitLines.length
    ? _fazitLines.map(renderFazitLineEditor).join('')
    : '<p class="fazit-lines-empty">Noch keine Zeile angelegt.</p>';
}

function collectFazitFormPayload() {
  return normalizeCommentFazitItem({
    title: document.getElementById('fz-title')?.value || 'Fazit',
    lines: _fazitLines
  });
}

function updateFazitPreview() {
  const preview = document.getElementById('fz-preview');
  if (!preview) return;
  const item = collectFazitFormPayload() || { title: document.getElementById('fz-title')?.value.trim() || 'Fazit', lines: [] };
  preview.innerHTML = item.lines.length
    ? renderCommentFazitCard(item)
    : '<p class="fazit-preview-empty">Noch nichts zum Anzeigen — füge Zeilen und Bausteine hinzu.</p>';
}

function addFazitLine() {
  _fazitLines.push(newFazitLine());
  renderFazitLinesEditor();
  updateFazitPreview();
}

function removeFazitLine(lineId) {
  _fazitLines = _fazitLines.filter(line => line.id !== String(lineId));
  renderFazitLinesEditor();
  updateFazitPreview();
}

function addFazitToken(lineId, kind) {
  const line = findFazitLine(lineId);
  if (!line || line.tokens.length >= 24) return;
  const token = newFazitToken(kind);
  line.tokens.push(token);
  if (kind === 'person') {
    openFazitTokenPersonPicker(lineId, token.id);
  } else {
    renderFazitLinesEditor();
  }
  updateFazitPreview();
}

function removeFazitToken(lineId, tokenId) {
  const line = findFazitLine(lineId);
  if (!line) return;
  line.tokens = line.tokens.filter(token => token.id !== String(tokenId));
  renderFazitLinesEditor();
  updateFazitPreview();
}

function moveFazitToken(lineId, tokenId, direction) {
  const line = findFazitLine(lineId);
  if (!line) return;
  const index = line.tokens.findIndex(token => token.id === String(tokenId));
  const targetIndex = index + (direction === 'right' ? 1 : -1);
  if (index < 0 || targetIndex < 0 || targetIndex >= line.tokens.length) return;
  [line.tokens[index], line.tokens[targetIndex]] = [line.tokens[targetIndex], line.tokens[index]];
  renderFazitLinesEditor();
  updateFazitPreview();
}

function updateFazitTokenIcon(lineId, tokenId, value) {
  const token = findFazitToken(lineId, tokenId);
  if (!token) return;
  token.icon = String(value || '').trim();
  updateFazitPreview();
}

function updateFazitTokenLabel(lineId, tokenId, value) {
  const token = findFazitToken(lineId, tokenId);
  if (!token) return;
  token.label = String(value || '').trim().slice(0, 80);
  updateFazitPreview();
}

function openFazitTokenIconPicker(lineId, tokenId) {
  const input = document.querySelector(`.fazit-token-icon-input[data-line-id="${CSS.escape(String(lineId))}"][data-token-id="${CSS.escape(String(tokenId))}"]`);
  if (!input) return;
  _fazitIconPickerTarget = { lineId: String(lineId), tokenId: String(tokenId) };
  if (typeof openIconDirectory === 'function') openIconDirectory();
  else _fazitIconPickerTarget = null;
}

function handleFazitIconSelected(event) {
  const target = _fazitIconPickerTarget;
  const src = String(event?.detail?.src || '').trim();
  _fazitIconPickerTarget = null;
  if (!target || !src) return;
  const token = findFazitToken(target.lineId, target.tokenId);
  if (!token) return;
  token.icon = src;
  renderFazitLinesEditor();
  updateFazitPreview();
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
  token.icon = String(character.portrait || '');
  token.label = String(character.name || '');
  token.characterId = String(character.id || '');
  _fazitPersonPickerTarget = null;
  renderFazitLinesEditor();
  updateFazitPreview();
}

function resetFazitForm() {
  _fazitLines = [];
  _fazitLineCounter = 0;
  _fazitTokenCounter = 0;
  _fazitPersonPickerTarget = null;
  _fazitPersonSearch = '';
  _editingFazitCommentId = null;
  if (typeof resetFazitHintPanel === 'function') resetFazitHintPanel();
  const title = document.getElementById('fz-title');
  if (title) title.value = 'Fazit';
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
  addFazitLine();
  activateDialog('fazit-form-overlay', { initialFocus: '#fz-title' });
  applyFazitPreviewWidth(_fazitPreviewWidth);
}

function closeFazitForm() {
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
  const title = document.getElementById('fz-title');
  if (title) title.value = item.title;
  _fazitLines = item.lines.map(line => ({
    id: `line-${(_fazitLineCounter += 1)}`,
    tokens: line.tokens.map(token => ({ ...token, id: `token-${(_fazitTokenCounter += 1)}` }))
  }));
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
