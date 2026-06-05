function createInlineCourtListItem(listName = 'overviewRows') {
  return deepClone(getCourtEditorListDefinition(listName).fallback || {});
}

function updateInlineCourtField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const field = input.dataset.courtField;
  if (!field) return;
  const value = String(input.value || '').trim();

  if (field === 'description') {
    page.description = value;
    scheduleInlineModuleLivePreviewRefresh();
    return;
  }

  const current = sanitizeCourtData(page.court || {});
  current[field] = value;
  page.court = sanitizeCourtData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineCourtListRow(listName = 'overviewRows') {
  const page = getInlineDraftPage();
  if (!page) return;
  const definition = getCourtEditorListDefinition(listName);
  const current = sanitizeCourtData(page.court || {});
  current[listName] = Array.isArray(current[listName]) ? current[listName] : [];
  current[listName].push(deepClone(definition.fallback || {}));
  page.court = sanitizeCourtData(current);
  renderPage(currentPage, 0);
}

function removeInlineCourtListRow(listName = 'overviewRows', index = 0) {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = sanitizeCourtData(page.court || {});
  if (!Array.isArray(current[listName])) return;
  current[listName].splice(index, 1);
  page.court = sanitizeCourtData(current);
  renderPage(currentPage, 0);
}

function updateInlineCourtListField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const listName = input.dataset.courtList || 'overviewRows';
  const field = input.dataset.courtListField;
  const index = Number(input.dataset.courtIndex || -1);
  if (!field || index < 0) return;

  const current = sanitizeCourtData(page.court || {});
  current[listName] = Array.isArray(current[listName]) ? current[listName] : [];
  if (!current[listName][index]) current[listName][index] = createInlineCourtListItem(listName);
  current[listName][index][field] = String(input.value || '').trim();
  page.court = sanitizeCourtData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function buildInlineCourtRows(items = [], listName = 'overviewRows') {
  const definition = getCourtEditorListDefinition(listName);
  const rows = Array.isArray(items) ? items : [];
  if (!rows.length) return '<div class="inline-placeholder-note">Noch keine Eintraege vorhanden.</div>';

  return rows.map((item, index) => `
    <div class="court-edit-row">
      ${definition.fields.map(([field, placeholder, type]) => {
        const value = escapeHtml(item?.[field] || '');
        const attrs = `data-inline-action="update-court-list-field" data-court-list="${escapeHtml(listName)}" data-court-index="${index}" data-court-list-field="${escapeHtml(field)}"`;
        if (type === 'textarea') {
          return `<textarea class="inline-edit-textarea" ${attrs} placeholder="${escapeHtml(placeholder)}">${value}</textarea>`;
        }
        return `<input class="inline-edit-input" type="${type}" ${attrs} value="${value}" placeholder="${escapeHtml(placeholder)}">`;
      }).join('')}
      <button
        class="module-editor-mini-btn module-editor-danger"
        type="button"
        data-inline-action="remove-court-list-row"
        data-court-list="${escapeHtml(listName)}"
        data-court-index="${index}">Loeschen</button>
    </div>`).join('');
}

function buildInlineCourtListSection(court, listName) {
  const definition = getCourtEditorListDefinition(listName);
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">${escapeHtml(definition.label)}</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-court-list-row" data-court-list="${escapeHtml(listName)}">+ ${escapeHtml(definition.addLabel)}</button>
      </div>
      <div class="inline-edit-field">
        <span class="inline-edit-label">Ueberschrift</span>
        <input class="inline-edit-input" type="text" data-inline-action="update-court-field" data-court-field="${escapeHtml(definition.titleField)}" value="${escapeHtml(court[definition.titleField] || '')}">
      </div>
      <div class="court-edit-list">
        ${buildInlineCourtRows(court[listName], listName)}
      </div>
    </div>`;
}

function buildInlineCourtEditor(page) {
  const court = sanitizeCourtData(page.court || {});
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Gerichtsakte</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Beschreibung</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-court-field" data-court-field="description">${escapeHtml(page.description || '')}</textarea>
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Archivzeile</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-court-field" data-court-field="archiveLabel" value="${escapeHtml(court.archiveLabel)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Aktennummer</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-court-field" data-court-field="caseNumber" value="${escapeHtml(court.caseNumber)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Gericht</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-court-field" data-court-field="courtName" value="${escapeHtml(court.courtName)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Ort</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-court-field" data-court-field="courtPlace" value="${escapeHtml(court.courtPlace)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Status</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-court-field" data-court-field="status" value="${escapeHtml(court.status)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Status-Ton</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-court-field" data-court-field="statusTone" value="${escapeHtml(court.statusTone)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Kopf-Icon-URL</span>
          <input class="inline-edit-input" type="url" data-inline-action="update-court-field" data-court-field="headerIcon" value="${escapeHtml(court.headerIcon)}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Siegel-URL</span>
          <input class="inline-edit-input" type="url" data-inline-action="update-court-field" data-court-field="sealImage" value="${escapeHtml(court.sealImage)}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Banner-URL</span>
          <input class="inline-edit-input" type="url" data-inline-action="update-court-field" data-court-field="bannerImage" value="${escapeHtml(court.bannerImage)}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Hintergrundbild-URL</span>
          <input class="inline-edit-input" type="url" data-inline-action="update-court-field" data-court-field="backgroundImage" value="${escapeHtml(court.backgroundImage)}" placeholder="https://i.imgur.com/...">
        </div>
      </div>
    </div>

    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Zusammenfassung</div>
      <div class="inline-edit-grid single">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Ueberschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-court-field" data-court-field="summaryTitle" value="${escapeHtml(court.summaryTitle)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Text</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-court-field" data-court-field="summaryText">${escapeHtml(court.summaryText)}</textarea>
        </div>
      </div>
    </div>

    ${COURT_EDITOR_LIST_ORDER.map(listName => buildInlineCourtListSection(court, listName)).join('')}

    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Aktennotiz & Footer</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Aktennotiz-Titel</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-court-field" data-court-field="noteTitle" value="${escapeHtml(court.noteTitle)}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Aktennotiz</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-court-field" data-court-field="noteText">${escapeHtml(court.noteText)}</textarea>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Footer</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-court-field" data-court-field="footer" value="${escapeHtml(court.footer)}">
        </div>
      </div>
    </div>`;
}
