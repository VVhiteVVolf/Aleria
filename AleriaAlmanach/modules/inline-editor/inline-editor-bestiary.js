// Inline editor bestiary state and builder.
// Owns only bestiary-page editing behavior.

function getInlineBestiaryDataForEdit(page) {
  return sanitizeBestiaryData(page?.bestiary || {});
}

function updateInlineBestiaryField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const field = input.dataset.bestiaryField;
  if (!field) return;
  const current = getInlineBestiaryDataForEdit(page);
  const value = input.type === 'checkbox' ? !!input.checked : String(input.value || '').trim();

  if (field === 'description') {
    page.description = value;
  } else if (field === 'quote') {
    page.quote = value;
  } else if (field === 'quoteBy') {
    page.quoteBy = value;
  } else if (['imageScale', 'imageX', 'imageY'].includes(field)) {
    const min = field === 'imageScale' ? 45 : 0;
    const max = field === 'imageScale' ? 180 : 100;
    const fallback = field === 'imageScale' ? 100 : 50;
    current[field] = clampBestiaryNumber(input.value, fallback, min, max);
    const label = input.closest('.inline-edit-field')?.querySelector('.inline-size-value');
    if (label) label.textContent = `${current[field]}%`;
  } else {
    current[field] = value;
  }

  page.bestiary = sanitizeBestiaryData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineBestiaryListRow(listName) {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = getInlineBestiaryDataForEdit(page);
  if (listName === 'anatomy') {
    current.anatomy.push({ number: String(current.anatomy.length + 1), title: 'Merkmal', detail: '' });
  } else if (listName === 'annotations') {
    current.annotations.push({ number: String(current.annotations.length + 1), x: 50, y: 50, text: 'Beschriftung' });
  } else if (listName === 'weaknesses') {
    current.weaknesses.push('Neue Schwäche');
  }
  page.bestiary = sanitizeBestiaryData(current);
  renderPage(currentPage, 0);
}

function removeInlineBestiaryListRow(listName, index) {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = getInlineBestiaryDataForEdit(page);
  if (Array.isArray(current[listName])) current[listName].splice(Number(index), 1);
  page.bestiary = sanitizeBestiaryData(current);
  renderPage(currentPage, 0);
}

function updateInlineBestiaryListField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const listName = input.dataset.bestiaryList;
  const index = Number(input.dataset.bestiaryIndex || -1);
  const field = input.dataset.bestiaryField;
  if (!listName || index < 0 || !field) return;
  const current = getInlineBestiaryDataForEdit(page);

  if (listName === 'weaknesses') {
    current.weaknesses[index] = String(input.value || '').trim();
  } else if (listName === 'anatomy') {
    const item = current.anatomy[index] || { number: String(index + 1), title: '', detail: '' };
    item[field] = String(input.value || '').trim();
    current.anatomy[index] = item;
  } else if (listName === 'annotations') {
    const item = current.annotations[index] || { number: String(index + 1), x: 50, y: 50, text: '' };
    item[field] = field === 'x' || field === 'y'
      ? clampBestiaryNumber(input.value, field === 'x' ? item.x : item.y, 4, 96)
      : String(input.value || '').trim();
    current.annotations[index] = item;
  }

  page.bestiary = sanitizeBestiaryData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function buildInlineBestiaryEditor(entry, page) {
  const bestiary = sanitizeBestiaryData(page.bestiary || {});
  const meta = `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Bestiarium</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Titel</span>
          <input class="inline-edit-input" type="text" data-inline-action="rerender-entry-field" data-entry-field="title" value="${escapeHtml(entry.title || '')}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Untertitel</span>
          <input class="inline-edit-input" type="text" data-inline-action="rerender-entry-field" data-entry-field="subtitle" value="${escapeHtml(entry.subtitle || '')}">
        </div>
        ${buildInlineSectionPicker()}
        ${buildInlineTemplatePicker('bestiary')}
        ${buildInlineModuleSizeControls(entry)}
        <div class="inline-edit-field">
          <span class="inline-edit-label">Typ</span>
          <input class="inline-edit-input" type="text" data-inline-action="rerender-entry-field" data-entry-field="type" value="${escapeHtml(entry.type || '')}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Stempel</span>
          <input class="inline-edit-input" type="text" data-inline-action="rerender-entry-field" data-entry-field="stamp" value="${escapeHtml(entry.stamp || '')}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Seitentitel</span>
          <input class="inline-edit-input" type="text" data-inline-action="rerender-page-field" data-page-field="pageTitle" value="${escapeHtml(page.pageTitle || '')}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Beschreibung</span>
          <textarea class="inline-edit-textarea" data-inline-action="update-bestiary-field" data-bestiary-field="description">${escapeHtml(page.description || '')}</textarea>
        </div>
      </div>
    </div>`;
  const imageControls = `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Bild & Blatt</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Band / Archivzeile</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-bestiary-field" data-bestiary-field="volume" value="${escapeHtml(bestiary.volume)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Kapitel</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-bestiary-field" data-bestiary-field="chapter" value="${escapeHtml(bestiary.chapter)}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Hintergrund / Textur</span>
          <input class="inline-edit-input" type="url" data-inline-action="update-bestiary-field" data-bestiary-field="backgroundImage" value="${escapeHtml(bestiary.backgroundImage)}" placeholder="Optional: https://i.imgur.com/...">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Bildgröße <span class="inline-size-value">${bestiary.imageScale}%</span></span>
          <input class="inline-size-range" type="range" min="45" max="180" step="1" data-inline-action="update-bestiary-field" data-bestiary-field="imageScale" value="${bestiary.imageScale}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Position X <span class="inline-size-value">${bestiary.imageX}%</span></span>
          <input class="inline-size-range" type="range" min="0" max="100" step="1" data-inline-action="update-bestiary-field" data-bestiary-field="imageX" value="${bestiary.imageX}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Position Y <span class="inline-size-value">${bestiary.imageY}%</span></span>
          <input class="inline-size-range" type="range" min="0" max="100" step="1" data-inline-action="update-bestiary-field" data-bestiary-field="imageY" value="${bestiary.imageY}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Seitennotiz</span>
          <textarea class="inline-edit-textarea" data-inline-action="update-bestiary-field" data-bestiary-field="sideNote">${escapeHtml(bestiary.sideNote)}</textarea>
        </div>
      </div>
    </div>`;
  const taxonomy = `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Einordnung</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Klasse</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-bestiary-field" data-bestiary-field="classification" value="${escapeHtml(bestiary.classification)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Lateinischer Name</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-bestiary-field" data-bestiary-field="latinName" value="${escapeHtml(bestiary.latinName)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Notiz-Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-bestiary-field" data-bestiary-field="authorNoteTitle" value="${escapeHtml(bestiary.authorNoteTitle)}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Verfasser-Notiz</span>
          <textarea class="inline-edit-textarea" data-inline-action="update-bestiary-field" data-bestiary-field="authorNote">${escapeHtml(bestiary.authorNote)}</textarea>
        </div>
      </div>
    </div>`;
  const lists = `
    ${buildInlineStatsEditor(page)}
    <div class="inline-edit-section">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">Anatomie</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-bestiary-list-row" data-bestiary-list="anatomy">+ Merkmal</button>
      </div>
      <div class="inline-edit-field">
        <span class="inline-edit-label">Überschrift</span>
        <input class="inline-edit-input" type="text" data-inline-action="update-bestiary-field" data-bestiary-field="anatomyTitle" value="${escapeHtml(bestiary.anatomyTitle)}">
      </div>
      <div class="bestiary-edit-list">${buildBestiaryAnatomyRows(bestiary.anatomy, 'inline')}</div>
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">Bildmarker</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-bestiary-list-row" data-bestiary-list="annotations">+ Marker</button>
      </div>
      <div class="inline-placeholder-note">X/Y sind Prozentwerte auf dem großen Bildbereich.</div>
      <div class="bestiary-edit-list">${buildBestiaryAnnotationRows(bestiary.annotations, 'inline')}</div>
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">Schwächen</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-bestiary-list-row" data-bestiary-list="weaknesses">+ Schwäche</button>
      </div>
      <div class="inline-edit-field">
        <span class="inline-edit-label">Überschrift</span>
        <input class="inline-edit-input" type="text" data-inline-action="update-bestiary-field" data-bestiary-field="weaknessesTitle" value="${escapeHtml(bestiary.weaknessesTitle)}">
      </div>
      <div class="bestiary-edit-list">${buildBestiaryWeaknessRows(bestiary.weaknesses, 'inline')}</div>
    </div>`;
  const quote = `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Zitat & Fußzeile</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Zitat-Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-bestiary-field" data-bestiary-field="quoteTitle" value="${escapeHtml(bestiary.quoteTitle)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Zitat von</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-bestiary-field" data-bestiary-field="quoteBy" value="${escapeHtml(page.quoteBy || '')}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Zitat</span>
          <textarea class="inline-edit-textarea" data-inline-action="update-bestiary-field" data-bestiary-field="quote">${escapeHtml(page.quote || '')}</textarea>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Zitat-Portrait</span>
          <input class="inline-edit-input" type="url" data-inline-action="update-bestiary-field" data-bestiary-field="quotePortrait" value="${escapeHtml(bestiary.quotePortrait)}" placeholder="Optional: https://i.imgur.com/...">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Fußzeile</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-bestiary-field" data-bestiary-field="footer" value="${escapeHtml(bestiary.footer)}">
        </div>
      </div>
    </div>`;
  return `${meta}${imageControls}${taxonomy}${lists}${quote}`;
}
