function buildBiographyAbilityRows(abilities = [], mode = 'module') {
  const rows = (Array.isArray(abilities) && abilities.length ? abilities : [{ icon: '✦', title: '', detail: '' }]);
  return rows.map((item, index) => `
    <div class="biography-edit-row ${mode === 'inline' ? '' : 'module-biography-ability-row'}" ${mode === 'inline' ? `data-biography-ability-index="${index}"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-biography-ability-icon' : ''}" type="text" value="${escapeHtml(item.icon || '')}" placeholder="Icon" ${mode === 'inline' ? `data-inline-action="update-biography-ability-field" data-biography-ability-index="${index}" data-biography-ability-field="icon"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-biography-ability-title' : ''}" type="text" value="${escapeHtml(item.title || '')}" placeholder="Titel" ${mode === 'inline' ? `data-inline-action="update-biography-ability-field" data-biography-ability-index="${index}" data-biography-ability-field="title"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-biography-ability-detail' : ''}" type="text" value="${escapeHtml(item.detail || '')}" placeholder="Beschreibung" ${mode === 'inline' ? `data-inline-action="update-biography-ability-field" data-biography-ability-index="${index}" data-biography-ability-field="detail"` : ''}>
    </div>`).join('');
}

function buildBiographyConnectionRows(connections = [], mode = 'module') {
  const rows = (Array.isArray(connections) && connections.length ? connections : [{ image: '', name: '', detail: '' }]);
  return rows.map((item, index) => `
    <div class="biography-edit-row connection ${mode === 'inline' ? '' : 'module-biography-connection-row'}" ${mode === 'inline' ? `data-biography-connection-index="${index}"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-biography-connection-image' : ''}" type="url" value="${escapeHtml(item.image || '')}" placeholder="Imgur-Bild" ${mode === 'inline' ? `data-inline-action="update-biography-connection-field" data-biography-connection-index="${index}" data-biography-connection-field="image"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-biography-connection-name' : ''}" type="text" value="${escapeHtml(item.name || '')}" placeholder="Name" ${mode === 'inline' ? `data-inline-action="update-biography-connection-field" data-biography-connection-index="${index}" data-biography-connection-field="name"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-biography-connection-detail' : ''}" type="text" value="${escapeHtml(item.detail || '')}" placeholder="Beziehung" ${mode === 'inline' ? `data-inline-action="update-biography-connection-field" data-biography-connection-index="${index}" data-biography-connection-field="detail"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-biography-connection" data-biography-connection-index="${index}"` : 'data-module-editor-action="remove-biography-connection-row"'}>Löschen</button>
    </div>`).join('');
}

function buildModuleBiographyStatRows(stats = []) {
  const rows = Array.isArray(stats) && stats.length ? stats : [['Neuer Eintrag', 'Wert']];
  return rows.map(([label, value]) => `
    <div class="inline-stat-row module-biography-stat-row">
      <input class="inline-edit-input me-biography-stat-label" type="text" value="${escapeHtml(label || '')}" placeholder="Label">
      <input class="inline-edit-input me-biography-stat-value" type="text" value="${escapeHtml(value || '')}" placeholder="Wert">
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-biography-stat-row">Löschen</button>
    </div>`).join('');
}

function buildBiographyDocumentRows(documents = [], mode = 'module') {
  const rows = (Array.isArray(documents) && documents.length ? documents : [{ text: '', link: '' }]);
  return rows.map((item, index) => `
    <div class="biography-edit-row document ${mode === 'inline' ? 'inline-biography-document-row' : 'module-biography-document-row'}">
      <input class="inline-edit-input ${mode === 'module' ? 'me-biography-document-text' : ''}" type="text" value="${escapeHtml(item.text || '')}" placeholder="Dokumenttitel" ${mode === 'inline' ? `data-inline-action="update-biography-document-field" data-biography-document-index="${index}" data-biography-document-field="text"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-biography-document-link' : ''}" type="url" value="${escapeHtml(item.link || '')}" placeholder="Link zur Seite / URL" ${mode === 'inline' ? `data-inline-action="update-biography-document-field" data-biography-document-index="${index}" data-biography-document-field="link"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-biography-document" data-biography-document-index="${index}"` : 'data-module-editor-action="remove-biography-document-row"'}>Löschen</button>
    </div>`).join('');
}

function collectModuleBiographyStats(card) {
  return Array.from(card.querySelectorAll('.module-biography-stat-row'))
    .map(row => [
      getTrimmedFormValue(row, '.me-biography-stat-label'),
      getTrimmedFormValue(row, '.me-biography-stat-value')
    ])
    .filter(([label, value]) => label || value);
}

function collectModuleBiographyAbilities(card) {
  return Array.from(card.querySelectorAll('.module-biography-ability-row')).map(row => ({
    icon: getTrimmedFormValue(row, '.me-biography-ability-icon'),
    title: getTrimmedFormValue(row, '.me-biography-ability-title'),
    detail: getTrimmedFormValue(row, '.me-biography-ability-detail')
  })).filter(item => item.icon || item.title || item.detail);
}

function collectModuleBiographyConnections(card) {
  return Array.from(card.querySelectorAll('.module-biography-connection-row')).map(row => ({
    image: getTrimmedFormValue(row, '.me-biography-connection-image'),
    name: getTrimmedFormValue(row, '.me-biography-connection-name'),
    detail: getTrimmedFormValue(row, '.me-biography-connection-detail')
  })).filter(item => item.image || item.name || item.detail);
}

function collectModuleBiographyDocuments(card) {
  return Array.from(card.querySelectorAll('.module-biography-document-row')).map(row => ({
    text: getTrimmedFormValue(row, '.me-biography-document-text'),
    link: getTrimmedFormValue(row, '.me-biography-document-link')
  })).filter(item => item.text || item.link);
}

function addModuleBiographyStatRow(button) {
  const pageCard = button.closest('.module-page-card');
  const wrap = button.closest('.module-editor-field')?.querySelector('.module-biography-stats')
    || pageCard?.querySelector('.module-biography-stats');
  if (!pageCard || !wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildModuleBiographyStatRows([['Neuer Eintrag', 'Wert']]));
  syncModuleJsonPreview();
}

function removeModuleBiographyStatRow(button) {
  const pageCard = button.closest('.module-page-card');
  const row = button.closest('.module-biography-stat-row');
  const wrap = button.closest('.module-editor-field')?.querySelector('.module-biography-stats')
    || pageCard?.querySelector('.module-biography-stats');
  if (!pageCard || !row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.module-biography-stat-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Infozeilen vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function addModuleBiographyDocumentRow(button) {
  const pageCard = button.closest('.module-page-card');
  const wrap = pageCard?.querySelector('.module-biography-documents');
  if (!pageCard || !wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildBiographyDocumentRows([{ text: 'Neues Dokument', link: '' }], 'module'));
  syncModuleJsonPreview();
}

function removeModuleBiographyDocumentRow(button) {
  const pageCard = button.closest('.module-page-card');
  const row = button.closest('.module-biography-document-row');
  const wrap = pageCard?.querySelector('.module-biography-documents');
  if (!pageCard || !row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.module-biography-document-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Dokumente vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function addModuleBiographyConnectionRow(button) {
  const pageCard = button.closest('.module-page-card');
  const wrap = pageCard?.querySelector('.module-biography-connections');
  if (!pageCard || !wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildBiographyConnectionRows([{ image: '', name: 'Neue Verbindung', detail: '' }], 'module'));
  syncModuleJsonPreview();
}

function removeModuleBiographyConnectionRow(button) {
  const pageCard = button.closest('.module-page-card');
  const row = button.closest('.module-biography-connection-row');
  const wrap = pageCard?.querySelector('.module-biography-connections');
  if (!pageCard || !row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.module-biography-connection-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Verbindungen vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function buildBiographyModuleEditorFields(page) {
  const biography = sanitizeBiographyData(page?.biography || {});
  return `
      <div class="module-page-type-block${inferModulePageType(page) === 'biography' ? ' visible' : ''}" data-page-type="biography">
        <div class="module-editor-grid">
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Infotabelle</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-biography-stat-row">+ Zeile</button>
            </div>
            <div class="inline-stat-editor module-biography-stats">
              ${buildModuleBiographyStatRows(page?.stats || [])}
            </div>
          </div>
          <div class="module-editor-field">
            <label>Biografie-Überschrift</label>
            <input type="text" class="me-biography-title" value="${escapeHtml(biography.biographyTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Fähigkeiten-Überschrift</label>
            <input type="text" class="me-biography-abilities-title" value="${escapeHtml(biography.abilitiesTitle)}">
          </div>
          <div class="module-editor-field wide">
            <label>Biografie</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-biography-text">${escapeHtml(biography.biographyText || page?.description || '')}</textarea>
          </div>
          <div class="module-editor-field wide">
            <label>Fähigkeiten & Spezialgebiete</label>
            <div class="biography-edit-list">${buildBiographyAbilityRows(biography.abilities, 'module')}</div>
          </div>
          <div class="module-editor-field">
            <label>Geschichte-Überschrift</label>
            <input type="text" class="me-biography-history-title" value="${escapeHtml(biography.historyTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Werke-Überschrift</label>
            <input type="text" class="me-biography-works-title" value="${escapeHtml(biography.worksTitle)}">
          </div>
          <div class="module-editor-field wide">
            <label>Geschichte & Wirkung</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-biography-history-text">${escapeHtml(biography.historyText)}</textarea>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Bekannte Werke</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-simple-line-row" data-simple-line-list="biographyWorks">+ Werk</button>
            </div>
            ${buildModuleSimpleLineList(biography.works, 'biographyWorks')}
          </div>
          <div class="module-editor-field">
            <label>Trivia-Überschrift</label>
            <input type="text" class="me-biography-trivia-title" value="${escapeHtml(biography.triviaTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Zitate-Überschrift</label>
            <input type="text" class="me-biography-quotes-title" value="${escapeHtml(biography.quotesTitle)}">
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Trivia</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-simple-line-row" data-simple-line-list="biographyTrivia">+ Trivia</button>
            </div>
            ${buildModuleSimpleLineList(biography.trivia, 'biographyTrivia')}
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Zitate</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-simple-line-row" data-simple-line-list="biographyQuotes">+ Zitat</button>
            </div>
            ${buildModuleSimpleLineList(biography.quotes, 'biographyQuotes')}
          </div>
          <div class="module-editor-field">
            <label>Verbindungen-Überschrift</label>
            <input type="text" class="me-biography-connections-title" value="${escapeHtml(biography.connectionsTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Dokumente-Überschrift</label>
            <input type="text" class="me-biography-documents-title" value="${escapeHtml(biography.documentsTitle)}">
          </div>
          <div class="module-editor-field wide">
            <label>Verbindungen</label>
            <div class="module-editor-inline" style="justify-content:space-between;">
              <span class="module-editor-help">Bild, Name und Beziehung der verbundenen Person.</span>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-biography-connection-row">+ Verbindung</button>
            </div>
            <div class="biography-edit-list module-biography-connections">
              ${buildBiographyConnectionRows(biography.connections, 'module')}
            </div>
          </div>
          <div class="module-editor-field wide">
            <label>Dokumente & Aufzeichnungen</label>
            <div class="module-editor-inline" style="justify-content:space-between;">
              <span class="module-editor-help">Der Link öffnet den Dokumenttitel in einer neuen Seite.</span>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-biography-document-row">+ Dokument</button>
            </div>
            <div class="biography-edit-list module-biography-documents">
              ${buildBiographyDocumentRows(biography.documents, 'module')}
            </div>
          </div>
          <div class="module-editor-field wide">
            <label>Zitatbox links</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-biography-quote small">${escapeHtml(page?.quote || '')}</textarea>
          </div>
          <div class="module-editor-field">
            <label>Zitat von</label>
            <input type="text" class="me-biography-quote-by" value="${escapeHtml(page?.quoteBy || '')}">
          </div>
          <div class="module-editor-field wide">
            <label>Fußzeile</label>
            <input type="text" class="me-biography-footer" value="${escapeHtml(biography.footer)}">
          </div>
        </div>
      </div>`;
}

function collectBiographyModuleEditorPage(card, page) {
  page.biographyPage = true;
  page.description = getTrimmedFormValue(card, '.me-biography-text');
  page.stats = collectModuleBiographyStats(card.querySelector('[data-page-type="biography"]') || card);
  page.quote = getTrimmedFormValue(card, '.me-biography-quote');
  page.quoteBy = getTrimmedFormValue(card, '.me-biography-quote-by');
  page.biography = sanitizeBiographyData({
    biographyTitle: getTrimmedFormValue(card, '.me-biography-title'),
    biographyText: getTrimmedFormValue(card, '.me-biography-text'),
    abilitiesTitle: getTrimmedFormValue(card, '.me-biography-abilities-title'),
    abilities: collectModuleBiographyAbilities(card),
    historyTitle: getTrimmedFormValue(card, '.me-biography-history-title'),
    historyText: getTrimmedFormValue(card, '.me-biography-history-text'),
    worksTitle: getTrimmedFormValue(card, '.me-biography-works-title'),
    works: collectModuleSimpleLineRows(card, 'biographyWorks'),
    triviaTitle: getTrimmedFormValue(card, '.me-biography-trivia-title'),
    trivia: collectModuleSimpleLineRows(card, 'biographyTrivia'),
    quotesTitle: getTrimmedFormValue(card, '.me-biography-quotes-title'),
    quotes: collectModuleSimpleLineRows(card, 'biographyQuotes'),
    connectionsTitle: getTrimmedFormValue(card, '.me-biography-connections-title'),
    connections: collectModuleBiographyConnections(card),
    documentsTitle: getTrimmedFormValue(card, '.me-biography-documents-title'),
    documents: collectModuleBiographyDocuments(card),
    footer: getTrimmedFormValue(card, '.me-biography-footer')
  });
  return page;
}
