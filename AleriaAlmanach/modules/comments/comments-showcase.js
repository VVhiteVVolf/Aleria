// Showcase form, preview, editing, and profile overlay.
let _showcaseInsertAfterId = null;
let _editingShowcaseCommentId = null;

function setShowcaseFormValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = String(value || '');
}

function collectShowcaseInfoEditorRows() {
  const container = document.getElementById('sf-info-rows');
  if (!container) return [];
  return Array.from(container.querySelectorAll('.showcase-info-editor-row'))
    .map(row => ({
      label: row.querySelector('.showcase-info-label-input')?.value || '',
      value: row.querySelector('.showcase-info-value-input')?.value || ''
    }))
    .map(row => ({
      label: String(row.label || '').trim(),
      value: String(row.value || '').trim()
    }))
    .filter(row => row.label || row.value)
    .slice(0, 16);
}

function renderShowcaseInfoEditorRows(rows = []) {
  const container = document.getElementById('sf-info-rows');
  if (!container) return;
  const normalizedRows = (Array.isArray(rows) ? rows : normalizeShowcaseInfoRows(rows))
    .map(row => ({
      label: String(row?.label || '').trim(),
      value: String(row?.value || '').trim()
    }))
    .slice(0, 16);

  container.innerHTML = normalizedRows.map((row, index) => `
    <div class="showcase-info-editor-row" data-info-index="${index}">
      <input class="showcase-info-label-input" type="text" maxlength="48" value="${escapeHtml(row.label)}" placeholder="Name" data-action="update-showcase-preview">
      <textarea class="showcase-info-value-input" rows="1" maxlength="240" placeholder="Wert" data-action="update-showcase-preview">${escapeHtml(row.value)}</textarea>
      <button class="showcase-info-remove-btn" type="button" data-action="remove-showcase-info-row" data-info-index="${index}" title="Zeile entfernen" aria-label="Zeile entfernen">×</button>
    </div>
  `).join('');
}

function setShowcaseInfoRows(rows = []) {
  renderShowcaseInfoEditorRows(normalizeShowcaseInfoRows(rows));
}

function addShowcaseInfoRow(label = '', value = '') {
  const rows = collectShowcaseInfoEditorRows();
  if (rows.length >= 16) return;
  rows.push({ label, value });
  renderShowcaseInfoEditorRows(rows);
  updateShowcasePreview();
  const lastRow = document.querySelector('#sf-info-rows .showcase-info-editor-row:last-child');
  lastRow?.querySelector('.showcase-info-label-input')?.focus();
}

function removeShowcaseInfoRow(index) {
  const rows = collectShowcaseInfoEditorRows();
  rows.splice(Number(index), 1);
  renderShowcaseInfoEditorRows(rows);
  updateShowcasePreview();
}

function collectShowcaseFormPayload() {
  return normalizeCommentShowcaseItem({
    kind: document.getElementById('sf-kind')?.value || 'item',
    title: document.getElementById('sf-title')?.value || '',
    subtitle: document.getElementById('sf-subtitle')?.value || '',
    image: document.getElementById('sf-image')?.value || '',
    imageFormat: document.getElementById('sf-image-format')?.value || 'cover',
    imageSize: document.getElementById('sf-image-size')?.value || 34,
    teaser: document.getElementById('sf-teaser')?.value || '',
    description: document.getElementById('sf-description')?.value || '',
    details: document.getElementById('sf-details')?.value || '',
    infoRows: collectShowcaseInfoEditorRows(),
    stamp: document.getElementById('sf-stamp')?.value || ''
  });
}

function updateShowcasePreview() {
  const preview = document.getElementById('sf-preview');
  if (!preview) return;
  const item = collectShowcaseFormPayload() || {
    kind: normalizeShowcaseKind(document.getElementById('sf-kind')?.value || 'item'),
    title: document.getElementById('sf-title')?.value.trim() || 'Unbenannte Vorstellung',
    subtitle: document.getElementById('sf-subtitle')?.value.trim() || '',
    image: document.getElementById('sf-image')?.value.trim() || '',
    imageFormat: document.getElementById('sf-image-format')?.value || 'cover',
    imageSize: document.getElementById('sf-image-size')?.value || 34,
    teaser: document.getElementById('sf-teaser')?.value.trim() || 'Eine kurze Vorschau erscheint hier.',
    description: '',
    details: '',
    infoRows: collectShowcaseInfoEditorRows(),
    stamp: ''
  };
  const sizeLabel = document.getElementById('sf-image-size-label');
  if (sizeLabel) sizeLabel.textContent = `${Math.max(18, Math.min(52, Number(item.imageSize) || 34))}%`;
  preview.innerHTML = `
    <div class="comment-live-preview-head">
      <div class="comment-live-preview-kicker">Vorschau in der Szene</div>
    </div>
    <div class="comment-showcase-preview">
      ${renderCommentShowcaseCard(item, { interactive: false })}
    </div>
    <div class="comment-live-preview-head showcase-final-preview-head">
      <div class="comment-live-preview-kicker">Profil-Vorschau</div>
    </div>
    <div class="showcase-profile-preview-shell">
      ${renderShowcaseProfileContent(item, { preview: true })}
    </div>`;
}

function openShowcaseForm() {
  _showcaseInsertAfterId = null;
  _editingShowcaseCommentId = null;
  setShowcaseFormValue('sf-kind', 'item');
  setShowcaseFormValue('sf-title', '');
  setShowcaseFormValue('sf-subtitle', '');
  setShowcaseFormValue('sf-image', '');
  setShowcaseFormValue('sf-image-format', 'cover');
  setShowcaseFormValue('sf-image-size', '34');
  setShowcaseFormValue('sf-teaser', '');
  setShowcaseFormValue('sf-description', '');
  setShowcaseFormValue('sf-details', '');
  setShowcaseInfoRows([]);
  setShowcaseFormValue('sf-stamp', '');
  const note = document.getElementById('sf-note');
  if (note) note.textContent = '';
  const error = document.getElementById('sf-error');
  if (error) {
    error.textContent = '';
    error.style.display = 'none';
  }
  const submit = document.getElementById('sf-submit');
  if (submit) {
    submit.disabled = false;
    submit.textContent = 'Vorstellen';
  }
  updateShowcasePreview();
  activateDialog('showcase-form-overlay', { initialFocus: '#sf-title' });
}

function openShowcaseFormAfter(commentId) {
  openShowcaseForm();
  _showcaseInsertAfterId = String(commentId || '');
  const note = document.getElementById('sf-note');
  if (note) note.textContent = 'Vorstellung wird an der gewählten Stelle eingefügt.';
}

function closeShowcaseForm() {
  deactivateDialog('showcase-form-overlay');
  _showcaseInsertAfterId = null;
  _editingShowcaseCommentId = null;
}

function openEditShowcaseForm(commentId) {
  const comment = findCachedCommentById(commentId);
  if (!comment || !getCommentShowcaseItem(comment)) {
    alert('Vorstellung konnte nicht geladen werden.');
    return;
  }
  
  const item = getCommentShowcaseItem(comment);
  if (!item) {
    alert('Die Vorstellung ist beschädigt.');
    return;
  }
  
  _editingShowcaseCommentId = String(commentId || '');
  
  // Formularfelder mit den Daten füllen
  setShowcaseFormValue('sf-kind', item.kind);
  setShowcaseFormValue('sf-title', item.title);
  setShowcaseFormValue('sf-subtitle', item.subtitle);
  setShowcaseFormValue('sf-image', item.image);
  setShowcaseFormValue('sf-image-format', item.imageFormat || 'cover');
  setShowcaseFormValue('sf-image-size', item.imageSize || 34);
  setShowcaseFormValue('sf-teaser', item.teaser);
  setShowcaseFormValue('sf-description', item.description);
  setShowcaseFormValue('sf-details', item.details);
  setShowcaseInfoRows(item.infoRows || item.infoTable || []);
  setShowcaseFormValue('sf-stamp', item.stamp);
  
  const note = document.getElementById('sf-note');
  if (note) note.textContent = 'Bearbeitung der Vorstellung';
  
  const error = document.getElementById('sf-error');
  if (error) {
    error.textContent = '';
    error.style.display = 'none';
  }
  
  const submit = document.getElementById('sf-submit');
  if (submit) {
    submit.disabled = false;
    submit.textContent = 'Änderungen speichern';
  }
  
  updateShowcasePreview();
  activateDialog('showcase-form-overlay', { initialFocus: '#sf-title' });
}


