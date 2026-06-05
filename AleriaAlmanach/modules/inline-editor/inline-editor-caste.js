function createInlineCasteListItem(listName = 'infoRows') {
  return deepClone(getCasteEditorListDefinition(listName).fallback || {});
}

function updateInlineCasteField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const field = input.dataset.casteField;
  if (!field) return;
  const value = String(input.value || '').trim();

  if (field === 'description') {
    page.description = value;
    scheduleInlineModuleLivePreviewRefresh();
    return;
  }

  const current = sanitizeCasteData(page.caste || {});
  current[field] = value;
  page.caste = sanitizeCasteData(current);
  if (field === 'imageScale') {
    const label = input.closest('.inline-edit-field')?.querySelector('.inline-size-value');
    if (label) label.textContent = `${page.caste.imageScale}%`;
  }
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineCasteListRow(listName = 'infoRows') {
  const page = getInlineDraftPage();
  if (!page) return;
  const definition = getCasteEditorListDefinition(listName);
  const current = sanitizeCasteData(page.caste || {});
  current[listName] = Array.isArray(current[listName]) ? current[listName] : [];
  current[listName].push(deepClone(definition.fallback || {}));
  page.caste = sanitizeCasteData(current);
  renderPage(currentPage, 0);
}

function removeInlineCasteListRow(listName = 'infoRows', index = 0) {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = sanitizeCasteData(page.caste || {});
  if (!Array.isArray(current[listName])) return;
  current[listName].splice(index, 1);
  page.caste = sanitizeCasteData(current);
  renderPage(currentPage, 0);
}

function updateInlineCasteListField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const listName = input.dataset.casteList || 'infoRows';
  const field = input.dataset.casteListField;
  const index = Number(input.dataset.casteIndex || -1);
  if (!field || index < 0) return;

  const current = sanitizeCasteData(page.caste || {});
  current[listName] = Array.isArray(current[listName]) ? current[listName] : [];
  if (!current[listName][index]) current[listName][index] = createInlineCasteListItem(listName);
  current[listName][index][field] = String(input.value || '').trim();
  page.caste = sanitizeCasteData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function buildInlineCasteRows(items = [], listName = 'infoRows') {
  const definition = getCasteEditorListDefinition(listName);
  const rows = Array.isArray(items) ? items : [];
  if (!rows.length) return '<div class="inline-placeholder-note">Noch keine Eintraege vorhanden.</div>';

  return rows.map((item, index) => `
    <div class="caste-edit-row">
      ${definition.fields.map(([field, placeholder, type]) => {
        const value = escapeHtml(item?.[field] || '');
        const attrs = `data-inline-action="update-caste-list-field" data-caste-list="${escapeHtml(listName)}" data-caste-index="${index}" data-caste-list-field="${escapeHtml(field)}"`;
        if (type === 'textarea') {
          return `<textarea class="inline-edit-textarea" ${attrs} placeholder="${escapeHtml(placeholder)}">${value}</textarea>`;
        }
        return `<input class="inline-edit-input" type="${type}" ${attrs} value="${value}" placeholder="${escapeHtml(placeholder)}">`;
      }).join('')}
      <button
        class="module-editor-mini-btn module-editor-danger"
        type="button"
        data-inline-action="remove-caste-list-row"
        data-caste-list="${escapeHtml(listName)}"
        data-caste-index="${index}">Loeschen</button>
    </div>`).join('');
}

function buildInlineCasteListSection(caste, listName) {
  const definition = getCasteEditorListDefinition(listName);
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">${escapeHtml(definition.label)}</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-caste-list-row" data-caste-list="${escapeHtml(listName)}">+ ${escapeHtml(definition.addLabel)}</button>
      </div>
      <div class="inline-edit-field">
        <span class="inline-edit-label">Ueberschrift</span>
        <input class="inline-edit-input" type="text" data-inline-action="update-caste-field" data-caste-field="${escapeHtml(definition.titleField)}" value="${escapeHtml(caste[definition.titleField] || '')}">
      </div>
      <div class="caste-edit-list">
        ${buildInlineCasteRows(caste[listName], listName)}
      </div>
    </div>`;
}

function buildInlineCasteEditor(page) {
  const caste = sanitizeCasteData(page.caste || {});
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Kasten-Kopf</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Archivzeile</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-caste-field" data-caste-field="archiveLabel" value="${escapeHtml(caste.archiveLabel)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Dokumentnummer</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-caste-field" data-caste-field="documentCode" value="${escapeHtml(caste.documentCode)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Kategorie</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-caste-field" data-caste-field="categoryLabel" value="${escapeHtml(caste.categoryLabel)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Hauptsymbol-URL</span>
          <input class="inline-edit-input" type="url" data-inline-action="update-caste-field" data-caste-field="headerSymbol" value="${escapeHtml(caste.headerSymbol)}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Siegel-URL</span>
          <input class="inline-edit-input" type="url" data-inline-action="update-caste-field" data-caste-field="sealImage" value="${escapeHtml(caste.sealImage)}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Banner-URL</span>
          <input class="inline-edit-input" type="url" data-inline-action="update-caste-field" data-caste-field="bannerImage" value="${escapeHtml(caste.bannerImage)}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Kastenbilder <span class="inline-size-value">${escapeHtml(caste.imageScale)}%</span></span>
          <input class="inline-image-range" type="range" min="60" max="220" step="1" data-inline-action="update-caste-field" data-caste-field="imageScale" value="${escapeHtml(caste.imageScale)}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Hintergrundbild-URL</span>
          <input class="inline-edit-input" type="url" data-inline-action="update-caste-field" data-caste-field="backgroundImage" value="${escapeHtml(caste.backgroundImage)}" placeholder="https://i.imgur.com/...">
        </div>
      </div>
    </div>

    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Intro</div>
      <div class="inline-edit-grid single">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Intro-Ueberschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-caste-field" data-caste-field="introTitle" value="${escapeHtml(caste.introTitle)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Introtext</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-caste-field" data-caste-field="introText">${escapeHtml(caste.introText)}</textarea>
        </div>
      </div>
    </div>

    ${CASTE_EDITOR_LIST_ORDER.map(listName => buildInlineCasteListSection(caste, listName)).join('')}

    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Zitat & Footer</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Zitat / Leitsatz</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-caste-field" data-caste-field="quote">${escapeHtml(caste.quote)}</textarea>
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Zitat von</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-caste-field" data-caste-field="quoteBy" value="${escapeHtml(caste.quoteBy)}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Footer / Archivnotiz</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-caste-field" data-caste-field="footer" value="${escapeHtml(caste.footer)}">
        </div>
      </div>
    </div>`;
}
