function buildBestiaryAnatomyRows(items = [], mode = 'module') {
  const rows = sanitizeBestiaryAnatomy(items).length ? sanitizeBestiaryAnatomy(items) : [{ number: '1', title: 'Merkmal', detail: 'Beschreibung' }];
  return rows.map((item, index) => `
    <div class="bestiary-edit-row anatomy ${mode === 'module' ? 'module-bestiary-anatomy-row' : 'inline-bestiary-anatomy-row'}">
      <input class="inline-edit-input ${mode === 'module' ? 'me-bestiary-anatomy-number' : ''}" type="text" value="${escapeHtml(item.number || index + 1)}" placeholder="#" ${mode === 'inline' ? `data-inline-action="update-bestiary-list-field" data-bestiary-list="anatomy" data-bestiary-index="${index}" data-bestiary-field="number"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-bestiary-anatomy-title' : ''}" type="text" value="${escapeHtml(item.title || '')}" placeholder="Merkmal" ${mode === 'inline' ? `data-inline-action="update-bestiary-list-field" data-bestiary-list="anatomy" data-bestiary-index="${index}" data-bestiary-field="title"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-bestiary-anatomy-detail' : ''}" type="text" value="${escapeHtml(item.detail || '')}" placeholder="Detail" ${mode === 'inline' ? `data-inline-action="update-bestiary-list-field" data-bestiary-list="anatomy" data-bestiary-index="${index}" data-bestiary-field="detail"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-bestiary-list-row" data-bestiary-list="anatomy" data-bestiary-index="${index}"` : 'data-module-editor-action="remove-bestiary-row"'}>Löschen</button>
    </div>`).join('');
}

function buildBestiaryAnnotationRows(items = [], mode = 'module') {
  const rows = sanitizeBestiaryAnnotations(items).length ? sanitizeBestiaryAnnotations(items) : [{ number: '1', x: 50, y: 50, text: 'Beschriftung' }];
  return rows.map((item, index) => `
    <div class="bestiary-edit-row annotation ${mode === 'module' ? 'module-bestiary-annotation-row' : 'inline-bestiary-annotation-row'}">
      <input class="inline-edit-input ${mode === 'module' ? 'me-bestiary-annotation-number' : ''}" type="text" value="${escapeHtml(item.number || index + 1)}" placeholder="#" ${mode === 'inline' ? `data-inline-action="update-bestiary-list-field" data-bestiary-list="annotations" data-bestiary-index="${index}" data-bestiary-field="number"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-bestiary-annotation-x' : ''}" type="number" min="4" max="96" value="${escapeHtml(item.x)}" placeholder="X" ${mode === 'inline' ? `data-inline-action="update-bestiary-list-field" data-bestiary-list="annotations" data-bestiary-index="${index}" data-bestiary-field="x"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-bestiary-annotation-y' : ''}" type="number" min="4" max="96" value="${escapeHtml(item.y)}" placeholder="Y" ${mode === 'inline' ? `data-inline-action="update-bestiary-list-field" data-bestiary-list="annotations" data-bestiary-index="${index}" data-bestiary-field="y"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-bestiary-annotation-text' : ''}" type="text" value="${escapeHtml(item.text || '')}" placeholder="Beschriftung" ${mode === 'inline' ? `data-inline-action="update-bestiary-list-field" data-bestiary-list="annotations" data-bestiary-index="${index}" data-bestiary-field="text"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-bestiary-list-row" data-bestiary-list="annotations" data-bestiary-index="${index}"` : 'data-module-editor-action="remove-bestiary-row"'}>Löschen</button>
    </div>`).join('');
}

function buildBestiaryWeaknessRows(items = [], mode = 'module') {
  const rows = sanitizeBestiaryWeaknesses(items).length ? sanitizeBestiaryWeaknesses(items) : ['Neue Schwäche'];
  return rows.map((item, index) => `
    <div class="bestiary-edit-row weakness ${mode === 'module' ? 'module-bestiary-weakness-row' : 'inline-bestiary-weakness-row'}">
      <input class="inline-edit-input ${mode === 'module' ? 'me-bestiary-weakness-text' : ''}" type="text" value="${escapeHtml(item || '')}" placeholder="Schwäche / Beobachtung" ${mode === 'inline' ? `data-inline-action="update-bestiary-list-field" data-bestiary-list="weaknesses" data-bestiary-index="${index}" data-bestiary-field="text"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-bestiary-list-row" data-bestiary-list="weaknesses" data-bestiary-index="${index}"` : 'data-module-editor-action="remove-bestiary-row"'}>Löschen</button>
    </div>`).join('');
}

function collectModuleBestiaryAnatomy(card) {
  return sanitizeBestiaryAnatomy(Array.from(card.querySelectorAll('.module-bestiary-anatomy-row')).map(row => ({
    number: getTrimmedFormValue(row, '.me-bestiary-anatomy-number'),
    title: getTrimmedFormValue(row, '.me-bestiary-anatomy-title'),
    detail: getTrimmedFormValue(row, '.me-bestiary-anatomy-detail')
  })));
}

function collectModuleBestiaryAnnotations(card) {
  return sanitizeBestiaryAnnotations(Array.from(card.querySelectorAll('.module-bestiary-annotation-row')).map(row => ({
    number: getTrimmedFormValue(row, '.me-bestiary-annotation-number'),
    x: getTrimmedFormValue(row, '.me-bestiary-annotation-x'),
    y: getTrimmedFormValue(row, '.me-bestiary-annotation-y'),
    text: getTrimmedFormValue(row, '.me-bestiary-annotation-text')
  })));
}

function collectModuleBestiaryWeaknesses(card) {
  return sanitizeBestiaryWeaknesses(Array.from(card.querySelectorAll('.module-bestiary-weakness-row')).map(row =>
    getTrimmedFormValue(row, '.me-bestiary-weakness-text')
  ));
}

function addModuleBestiaryRow(button, listName) {
  const pageCard = button.closest('.module-page-card');
  const wrap = pageCard?.querySelector(`.module-bestiary-${listName}`);
  if (!wrap) return;
  const builders = {
    anatomy: () => buildBestiaryAnatomyRows([{ number: String(wrap.querySelectorAll('.module-bestiary-anatomy-row').length + 1), title: 'Merkmal', detail: '' }]),
    annotations: () => buildBestiaryAnnotationRows([{ number: String(wrap.querySelectorAll('.module-bestiary-annotation-row').length + 1), x: 50, y: 50, text: 'Beschriftung' }]),
    weaknesses: () => buildBestiaryWeaknessRows(['Neue Schwäche'])
  };
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', builders[listName]?.() || '');
  syncModuleJsonPreview();
}

function removeModuleBestiaryRow(button) {
  const row = button.closest('.bestiary-edit-row');
  const wrap = row?.parentElement;
  if (!row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.bestiary-edit-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Zeilen vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function buildBestiaryModuleEditorFields(page) {
  const bestiary = sanitizeBestiaryData(page?.bestiary || {});
  return `
      <div class="module-page-type-block${inferModulePageType(page) === 'bestiary' ? ' visible' : ''}" data-page-type="bestiary">
        <div class="module-editor-grid">
          <div class="module-editor-field">
            <label>Band / Archivzeile</label>
            <input type="text" class="me-bestiary-volume" value="${escapeHtml(bestiary.volume)}">
          </div>
          <div class="module-editor-field">
            <label>Kapitel</label>
            <input type="text" class="me-bestiary-chapter" value="${escapeHtml(bestiary.chapter)}">
          </div>
          <div class="module-editor-field">
            <label>Klasse</label>
            <input type="text" class="me-bestiary-classification" value="${escapeHtml(bestiary.classification)}">
          </div>
          <div class="module-editor-field">
            <label>Lateinischer Name</label>
            <input type="text" class="me-bestiary-latin-name" value="${escapeHtml(bestiary.latinName)}">
          </div>
          <div class="module-editor-field wide">
            <label>Beschreibung</label>
            <textarea class="me-bestiary-description">${escapeHtml(page?.description || '')}</textarea>
          </div>
          <div class="module-editor-field wide">
            <label>Hintergrund / Textur</label>
            <input type="url" class="me-bestiary-background" value="${escapeHtml(bestiary.backgroundImage)}" placeholder="Optional: https://i.imgur.com/...">
          </div>
          <div class="module-editor-field">
            <label>Bildgröße <span>${escapeHtml(bestiary.imageScale)}%</span></label>
            <input class="module-size-range me-bestiary-image-scale" type="range" min="45" max="180" step="1" value="${escapeHtml(bestiary.imageScale)}" data-module-editor-action="update-range-percent-label">
          </div>
          <div class="module-editor-field">
            <label>Bildposition X <span>${escapeHtml(bestiary.imageX)}%</span></label>
            <input class="module-size-range me-bestiary-image-x" type="range" min="0" max="100" step="1" value="${escapeHtml(bestiary.imageX)}" data-module-editor-action="update-range-percent-label">
          </div>
          <div class="module-editor-field">
            <label>Bildposition Y <span>${escapeHtml(bestiary.imageY)}%</span></label>
            <input class="module-size-range me-bestiary-image-y" type="range" min="0" max="100" step="1" value="${escapeHtml(bestiary.imageY)}" data-module-editor-action="update-range-percent-label">
          </div>
          <div class="module-editor-field wide">
            <label>Seitennotiz am Bild</label>
            <textarea class="me-bestiary-side-note small">${escapeHtml(bestiary.sideNote)}</textarea>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Kenndaten</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-biography-stat-row">+ Zeile</button>
            </div>
            <div class="inline-stat-editor module-biography-stats">
              ${buildModuleBiographyStatRows(page?.stats || [])}
            </div>
          </div>
          <div class="module-editor-field">
            <label>Notiz-Überschrift</label>
            <input type="text" class="me-bestiary-author-note-title" value="${escapeHtml(bestiary.authorNoteTitle)}">
          </div>
          <div class="module-editor-field wide">
            <label>Verfasser-Notiz</label>
            <textarea class="me-bestiary-author-note small">${escapeHtml(bestiary.authorNote)}</textarea>
          </div>
          <div class="module-editor-field">
            <label>Anatomie-Überschrift</label>
            <input type="text" class="me-bestiary-anatomy-title" value="${escapeHtml(bestiary.anatomyTitle)}">
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Anatomie-Liste</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-bestiary-row" data-bestiary-list="anatomy">+ Merkmal</button>
            </div>
            <div class="bestiary-edit-list module-bestiary-anatomy">
              ${buildBestiaryAnatomyRows(bestiary.anatomy)}
            </div>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Bildmarker</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-bestiary-row" data-bestiary-list="annotations">+ Marker</button>
            </div>
            <div class="module-editor-help">X/Y sind Prozentwerte im großen Bildbereich. Damit kannst du Marker direkt über dem transparenten Bild platzieren.</div>
            <div class="bestiary-edit-list module-bestiary-annotations">
              ${buildBestiaryAnnotationRows(bestiary.annotations)}
            </div>
          </div>
          <div class="module-editor-field">
            <label>Schwächen-Überschrift</label>
            <input type="text" class="me-bestiary-weaknesses-title" value="${escapeHtml(bestiary.weaknessesTitle)}">
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Schwächen</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-bestiary-row" data-bestiary-list="weaknesses">+ Schwäche</button>
            </div>
            <div class="bestiary-edit-list module-bestiary-weaknesses">
              ${buildBestiaryWeaknessRows(bestiary.weaknesses)}
            </div>
          </div>
          <div class="module-editor-field">
            <label>Zitat-Überschrift</label>
            <input type="text" class="me-bestiary-quote-title" value="${escapeHtml(bestiary.quoteTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Zitat-Portrait</label>
            <input type="url" class="me-bestiary-quote-portrait" value="${escapeHtml(bestiary.quotePortrait)}" placeholder="Optional: https://i.imgur.com/...">
          </div>
          <div class="module-editor-field wide">
            <label>Zitat</label>
            <textarea class="me-bestiary-quote small">${escapeHtml(page?.quote || '')}</textarea>
          </div>
          <div class="module-editor-field">
            <label>Zitat von</label>
            <input type="text" class="me-bestiary-quote-by" value="${escapeHtml(page?.quoteBy || '')}">
          </div>
          <div class="module-editor-field wide">
            <label>Fußzeile</label>
            <input type="text" class="me-bestiary-footer" value="${escapeHtml(bestiary.footer)}">
          </div>
        </div>
      </div>`;
}

function collectBestiaryModuleEditorPage(card, page) {
  page.bestiaryPage = true;
  page.description = getTrimmedFormValue(card, '.me-bestiary-description');
  page.stats = collectModuleBiographyStats(card.querySelector('[data-page-type="bestiary"]') || card);
  page.quote = getTrimmedFormValue(card, '.me-bestiary-quote');
  page.quoteBy = getTrimmedFormValue(card, '.me-bestiary-quote-by');
  page.bestiary = sanitizeBestiaryData({
    volume: getTrimmedFormValue(card, '.me-bestiary-volume'),
    chapter: getTrimmedFormValue(card, '.me-bestiary-chapter'),
    classification: getTrimmedFormValue(card, '.me-bestiary-classification'),
    latinName: getTrimmedFormValue(card, '.me-bestiary-latin-name'),
    backgroundImage: getTrimmedFormValue(card, '.me-bestiary-background'),
    imageScale: getTrimmedFormValue(card, '.me-bestiary-image-scale'),
    imageX: getTrimmedFormValue(card, '.me-bestiary-image-x'),
    imageY: getTrimmedFormValue(card, '.me-bestiary-image-y'),
    sideNote: getTrimmedFormValue(card, '.me-bestiary-side-note'),
    authorNoteTitle: getTrimmedFormValue(card, '.me-bestiary-author-note-title'),
    authorNote: getTrimmedFormValue(card, '.me-bestiary-author-note'),
    anatomyTitle: getTrimmedFormValue(card, '.me-bestiary-anatomy-title'),
    anatomy: collectModuleBestiaryAnatomy(card),
    annotations: collectModuleBestiaryAnnotations(card),
    weaknessesTitle: getTrimmedFormValue(card, '.me-bestiary-weaknesses-title'),
    weaknesses: collectModuleBestiaryWeaknesses(card),
    quoteTitle: getTrimmedFormValue(card, '.me-bestiary-quote-title'),
    quotePortrait: getTrimmedFormValue(card, '.me-bestiary-quote-portrait'),
    footer: getTrimmedFormValue(card, '.me-bestiary-footer')
  });
  return page;
}
