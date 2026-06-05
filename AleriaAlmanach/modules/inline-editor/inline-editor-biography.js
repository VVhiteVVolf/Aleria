// Inline editor biography state and builder.
// Owns only biography-page editing behavior.

function getInlineBiographyDataForEdit(page) {
  return sanitizeBiographyData(page?.biography || {});
}

function getInlineBiographyLineListName(listName) {
  if (listName === 'trivia') return 'trivia';
  if (listName === 'quotes') return 'quotes';
  return 'works';
}

function updateInlineBiographyField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const field = input.dataset.biographyField;
  if (!field) return;
  const current = getInlineBiographyDataForEdit(page);
  const value = String(input.value || '').trim();

  if (field === 'quote') {
    page.quote = value;
  } else if (field === 'quoteBy') {
    page.quoteBy = value;
  } else {
    current[field] = value;
    if (field === 'biographyText') page.description = value;
  }

  page.biography = sanitizeBiographyData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineBiographyLineRow(listName) {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = getInlineBiographyDataForEdit(page);
  const safeList = getInlineBiographyLineListName(listName);
  const fallbackText = safeList === 'quotes' ? 'Neues Zitat' : safeList === 'trivia' ? 'Neuer Trivia-Eintrag' : 'Neues Werk';
  current[safeList] = [...(current[safeList] || []), fallbackText];
  page.biography = sanitizeBiographyData(current);
  renderPage(currentPage, 0);
}

function removeInlineBiographyLineRow(listName, index) {
  const page = getInlineDraftPage();
  if (!page || index < 0) return;
  const current = getInlineBiographyDataForEdit(page);
  const safeList = getInlineBiographyLineListName(listName);
  current[safeList] = (current[safeList] || []).filter((_, itemIndex) => itemIndex !== index);
  page.biography = sanitizeBiographyData(current);
  renderPage(currentPage, 0);
}

function updateInlineBiographyLineField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const index = Number(input.dataset.biographyLineIndex || -1);
  if (index < 0) return;
  const current = getInlineBiographyDataForEdit(page);
  const safeList = getInlineBiographyLineListName(input.dataset.biographyLineList);
  current[safeList][index] = String(input.value || '').trim();
  page.biography = sanitizeBiographyData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function buildInlineBiographyLineRows(items = [], listName = 'works') {
  const rows = Array.isArray(items) ? items : [];
  const safeList = getInlineBiographyLineListName(listName);
  const placeholder = safeList === 'quotes' ? 'Zitat' : safeList === 'trivia' ? 'Trivia' : 'Werk';
  return rows.length ? rows.map((item, index) => `
    <div class="inline-stat-row module-simple-line-row">
      <input
        class="inline-edit-input"
        type="text"
        data-inline-action="update-biography-line-field"
        data-biography-line-list="${escapeHtml(safeList)}"
        data-biography-line-index="${index}"
        value="${escapeHtml(item || '')}"
        placeholder="${placeholder}">
      <button
        class="module-editor-mini-btn module-editor-danger"
        type="button"
        data-inline-action="remove-biography-line-row"
        data-biography-line-list="${escapeHtml(safeList)}"
        data-biography-line-index="${index}">Löschen</button>
    </div>`).join('') : '<div class="inline-placeholder-note">Noch keine Einträge vorhanden.</div>';
}

function addInlineBiographyDocumentRow() {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = getInlineBiographyDataForEdit(page);
  current.documents.push({ text: 'Neues Dokument', link: '' });
  page.biography = sanitizeBiographyData(current);
  renderPage(currentPage, 0);
}

function removeInlineBiographyDocumentRow(index) {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = getInlineBiographyDataForEdit(page);
  current.documents.splice(index, 1);
  page.biography = sanitizeBiographyData(current);
  renderPage(currentPage, 0);
}

function updateInlineBiographyDocumentField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const index = Number(input.dataset.biographyDocumentIndex || -1);
  const field = input.dataset.biographyDocumentField;
  if (index < 0 || !field) return;
  const current = getInlineBiographyDataForEdit(page);
  current.documents = current.documents.length ? current.documents : [{ text: '', link: '' }];
  const item = current.documents[index] || { text: '', link: '' };
  item[field] = String(input.value || '').trim();
  current.documents[index] = item;
  page.biography = sanitizeBiographyData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function updateInlineBiographyAbilityField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const index = Number(input.dataset.biographyAbilityIndex || -1);
  const field = input.dataset.biographyAbilityField;
  if (index < 0 || !field) return;
  const current = getInlineBiographyDataForEdit(page);
  current.abilities = current.abilities.length ? current.abilities : [{ icon: '*', title: '', detail: '' }];
  const item = current.abilities[index] || { icon: '*', title: '', detail: '' };
  item[field] = String(input.value || '').trim();
  current.abilities[index] = item;
  page.biography = sanitizeBiographyData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function updateInlineBiographyConnectionField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const index = Number(input.dataset.biographyConnectionIndex || -1);
  const field = input.dataset.biographyConnectionField;
  if (index < 0 || !field) return;
  const current = getInlineBiographyDataForEdit(page);
  current.connections = current.connections.length ? current.connections : [{ image: '', name: '', detail: '' }];
  const item = current.connections[index] || { image: '', name: '', detail: '' };
  item[field] = String(input.value || '').trim();
  current.connections[index] = item;
  page.biography = sanitizeBiographyData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineBiographyConnectionRow() {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = getInlineBiographyDataForEdit(page);
  current.connections.push({ image: '', name: 'Neue Verbindung', detail: '' });
  page.biography = sanitizeBiographyData(current);
  renderPage(currentPage, 0);
}

function removeInlineBiographyConnectionRow(index) {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = getInlineBiographyDataForEdit(page);
  current.connections.splice(index, 1);
  page.biography = sanitizeBiographyData(current);
  renderPage(currentPage, 0);
}

function buildInlineBiographyEditor(page) {
  const biography = sanitizeBiographyData(page.biography || {});
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Biographie</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Biografie-Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-biography-field" data-biography-field="biographyTitle" value="${escapeHtml(biography.biographyTitle)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Fähigkeiten-Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-biography-field" data-biography-field="abilitiesTitle" value="${escapeHtml(biography.abilitiesTitle)}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Biografie</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-biography-field" data-biography-field="biographyText">${escapeHtml(biography.biographyText || page.description || '')}</textarea>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Fähigkeiten & Spezialgebiete</span>
          <div class="biography-edit-list">${buildBiographyAbilityRows(biography.abilities, 'inline')}</div>
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Geschichte-Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-biography-field" data-biography-field="historyTitle" value="${escapeHtml(biography.historyTitle)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Werke-Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-biography-field" data-biography-field="worksTitle" value="${escapeHtml(biography.worksTitle)}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Geschichte & Wirkung</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-biography-field" data-biography-field="historyText">${escapeHtml(biography.historyText)}</textarea>
        </div>
        <div class="inline-edit-field wide">
          <div class="inline-edit-head">
            <span class="inline-edit-label">Bekannte Werke</span>
            <button class="module-editor-mini-btn" type="button" data-inline-action="add-biography-line-row" data-biography-line-list="works">+ Werk</button>
          </div>
          <div class="inline-stat-editor">${buildInlineBiographyLineRows(biography.works, 'works')}</div>
        </div>
        <div class="inline-edit-field wide">
          <div class="inline-edit-head">
            <span class="inline-edit-label">Trivia</span>
            <button class="module-editor-mini-btn" type="button" data-inline-action="add-biography-line-row" data-biography-line-list="trivia">+ Trivia</button>
          </div>
          <div class="inline-stat-editor">${buildInlineBiographyLineRows(biography.trivia, 'trivia')}</div>
        </div>
        <div class="inline-edit-field wide">
          <div class="inline-edit-head">
            <span class="inline-edit-label">Zitate</span>
            <button class="module-editor-mini-btn" type="button" data-inline-action="add-biography-line-row" data-biography-line-list="quotes">+ Zitat</button>
          </div>
          <div class="inline-stat-editor">${buildInlineBiographyLineRows(biography.quotes, 'quotes')}</div>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Verbindungen</span>
          <div class="inline-edit-head">
            <div class="inline-placeholder-note">Bild, Name und Beziehung der verbundenen Person.</div>
            <button class="module-editor-mini-btn" type="button" data-inline-action="add-biography-connection">+ Verbindung</button>
          </div>
          <div class="biography-edit-list">${buildBiographyConnectionRows(biography.connections, 'inline')}</div>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Dokumente & Aufzeichnungen</span>
          <div class="inline-edit-head">
            <div class="inline-placeholder-note">Dokumenttitel werden anklickbar, sobald ein Link gesetzt ist.</div>
            <button class="module-editor-mini-btn" type="button" data-inline-action="add-biography-document">+ Dokument</button>
          </div>
          <div class="biography-edit-list">${buildBiographyDocumentRows(biography.documents, 'inline')}</div>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Zitatbox links</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-biography-field" data-biography-field="quote">${escapeHtml(page.quote || '')}</textarea>
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Zitat von</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-biography-field" data-biography-field="quoteBy" value="${escapeHtml(page.quoteBy || '')}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Fußzeile</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-biography-field" data-biography-field="footer" value="${escapeHtml(biography.footer)}">
        </div>
      </div>
    </div>`;
}
