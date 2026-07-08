// Static module editor fields for the Häuser-Template (built on the biography template's
// mechanics: portrait/stats/quote shell, icon+text point list, extra sections, connections,
// documents — re-labelled for a noble house instead of a person).

let _houseInfluenceIconTarget = null;

function buildHouseInfluenceIconField(item, index, mode) {
  const iconInputAttrs = mode === 'inline'
    ? `data-inline-action="update-house-influence-field" data-house-influence-index="${index}" data-house-influence-field="icon"`
    : 'data-module-editor-action="sync-json-preview"';
  const pickerAttrs = mode === 'inline'
    ? `data-inline-action="pick-house-influence-icon" data-house-influence-index="${index}"`
    : 'data-module-editor-action="pick-house-influence-icon"';
  return `
      <span class="biography-ability-icon-field">
        <input class="inline-edit-input ${mode === 'module' ? 'me-house-influence-icon' : ''}" type="text" value="${escapeHtml(item.icon || '')}" placeholder="Symbol oder Bild-URL" ${iconInputAttrs}>
        <button class="module-editor-mini-btn biography-ability-icon-picker" type="button" ${pickerAttrs} title="Icon-Verzeichnis oeffnen" aria-label="Icon-Verzeichnis oeffnen">Icon</button>
      </span>`;
}

function openHouseInfluenceIconPicker(button) {
  const row = button?.closest?.('.biography-edit-row');
  const target = row?.querySelector?.('.me-house-influence-icon, [data-house-influence-field="icon"]');
  if (!target) return;
  _houseInfluenceIconTarget = target;
  if (typeof openIconDirectory === 'function') {
    openIconDirectory();
    return;
  }
  _houseInfluenceIconTarget = null;
}

function handleHouseInfluenceIconSelected(event) {
  const target = _houseInfluenceIconTarget;
  const src = String(event?.detail?.src || '').trim();
  if (!target || !target.isConnected || !src) {
    _houseInfluenceIconTarget = null;
    return;
  }
  target.value = src;
  target.dispatchEvent(new Event('input', { bubbles: true }));
  target.dispatchEvent(new Event('change', { bubbles: true }));
  try {
    target.focus({ preventScroll: true });
  } catch {
    target.focus();
  }
  if (typeof closeIconDirectory === 'function') {
    closeIconDirectory();
  }
  _houseInfluenceIconTarget = null;
}

document.addEventListener('almanach-icon-selected', handleHouseInfluenceIconSelected);

function buildHouseInfluenceRows(influences = [], mode = 'module') {
  const rows = (Array.isArray(influences) && influences.length ? influences : [{ icon: '*', title: '', detail: '' }]);
  return rows.map((item, index) => `
    <div class="biography-edit-row ${mode === 'inline' ? '' : 'module-house-influence-row'}" ${mode === 'inline' ? `data-house-influence-index="${index}"` : ''}>
      ${buildHouseInfluenceIconField(item, index, mode)}
      <input class="inline-edit-input ${mode === 'module' ? 'me-house-influence-title' : ''}" type="text" value="${escapeHtml(item.title || '')}" placeholder="Titel" ${mode === 'inline' ? `data-inline-action="update-house-influence-field" data-house-influence-index="${index}" data-house-influence-field="title"` : 'data-module-editor-action="sync-json-preview"'}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-house-influence-detail' : ''}" type="text" value="${escapeHtml(item.detail || '')}" placeholder="Beschreibung" ${mode === 'inline' ? `data-inline-action="update-house-influence-field" data-house-influence-index="${index}" data-house-influence-field="detail"` : 'data-module-editor-action="sync-json-preview"'}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-house-influence" data-house-influence-index="${index}"` : 'data-module-editor-action="remove-house-influence-row"'}>Loeschen</button>
    </div>`).join('');
}

function buildHouseSectionRows(sections = [], mode = 'module') {
  const rows = Array.isArray(sections) ? sections : [];
  return rows.map((item, index) => `
    <div class="biography-edit-section-row ${mode === 'inline' ? '' : 'module-house-section-row'}" ${mode === 'inline' ? `data-house-section-index="${index}"` : ''}>
      <select class="inline-edit-input ${mode === 'module' ? 'me-house-section-position' : ''}" ${mode === 'inline' ? `data-inline-action="update-house-section-field" data-house-section-index="${index}" data-house-section-field="position"` : ''}>
        <option value="afterIntro"${item.position !== 'afterWorks' ? ' selected' : ''}>Nach Haupttext</option>
        <option value="afterWorks"${item.position === 'afterWorks' ? ' selected' : ''}>Nach Abschnitt 3</option>
      </select>
      <select class="inline-edit-input ${mode === 'module' ? 'me-house-section-mode' : ''}" ${mode === 'inline' ? `data-inline-action="update-house-section-field" data-house-section-index="${index}" data-house-section-field="mode"` : ''}>
        <option value="text"${item.mode !== 'list' ? ' selected' : ''}>Text</option>
        <option value="list"${item.mode === 'list' ? ' selected' : ''}>Bulletliste</option>
      </select>
      <input class="inline-edit-input ${mode === 'module' ? 'me-house-section-title' : ''}" type="text" value="${escapeHtml(item.title || '')}" placeholder="Ueberschrift" ${mode === 'inline' ? `data-inline-action="update-house-section-field" data-house-section-index="${index}" data-house-section-field="title"` : ''}>
      <textarea class="inline-edit-textarea ${mode === 'module' ? 'me-house-section-text' : ''}" placeholder="Text oder je Zeile ein Listenpunkt" ${mode === 'inline' ? `data-inline-action="update-house-section-field" data-house-section-index="${index}" data-house-section-field="text"` : ''}>${escapeHtml(item.text || '')}</textarea>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-house-section" data-house-section-index="${index}"` : 'data-module-editor-action="remove-house-section-row"'}>Loeschen</button>
    </div>`).join('');
}

function buildModuleHouseStatRows(stats = []) {
  const rows = Array.isArray(stats) && stats.length ? stats : [['Neuer Eintrag', 'Wert']];
  return rows.map(([label, value]) => `
    <div class="inline-stat-row module-house-stat-row">
      <input class="inline-edit-input me-house-stat-label" type="text" value="${escapeHtml(label || '')}" placeholder="Label">
      <input class="inline-edit-input me-house-stat-value" type="text" value="${escapeHtml(value || '')}" placeholder="Wert">
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-house-stat-row">Löschen</button>
    </div>`).join('');
}

function buildHouseDocumentRows(documents = [], mode = 'module') {
  const rows = (Array.isArray(documents) && documents.length ? documents : [{ text: '', link: '' }]);
  return rows.map((item, index) => `
    <div class="biography-edit-row document ${mode === 'inline' ? 'inline-house-document-row' : 'module-house-document-row'}">
      <input class="inline-edit-input ${mode === 'module' ? 'me-house-document-text' : ''}" type="text" value="${escapeHtml(item.text || '')}" placeholder="Dokumenttitel" ${mode === 'inline' ? `data-inline-action="update-house-document-field" data-house-document-index="${index}" data-house-document-field="text"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-house-document-link' : ''}" type="url" value="${escapeHtml(item.link || '')}" placeholder="Link zur Seite / URL" ${mode === 'inline' ? `data-inline-action="update-house-document-field" data-house-document-index="${index}" data-house-document-field="link"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-house-document" data-house-document-index="${index}"` : 'data-module-editor-action="remove-house-document-row"'}>Löschen</button>
    </div>`).join('');
}

function buildHouseConnectionRows(connections = [], mode = 'module') {
  const rows = (Array.isArray(connections) && connections.length ? connections : [{ type: 'connection', image: '', imageFormat: 'square', name: '', detail: '' }]);
  return rows.map((item, index) => {
    if (item.type === 'heading') {
      return `
    <div class="biography-edit-row connection-heading ${mode === 'inline' ? '' : 'module-house-connection-row'}" ${mode === 'inline' ? `data-house-connection-index="${index}"` : ''} data-house-connection-type="heading">
      <input class="inline-edit-input ${mode === 'module' ? 'me-house-connection-title' : ''}" type="text" value="${escapeHtml(item.title || '')}" placeholder="Ueberschrift" ${mode === 'inline' ? `data-inline-action="update-house-connection-field" data-house-connection-index="${index}" data-house-connection-field="title"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-house-connection-detail' : ''}" type="text" value="${escapeHtml(item.detail || '')}" placeholder="Unterzeile optional" ${mode === 'inline' ? `data-inline-action="update-house-connection-field" data-house-connection-index="${index}" data-house-connection-field="detail"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-house-connection" data-house-connection-index="${index}"` : 'data-module-editor-action="remove-house-connection-row"'}>Loeschen</button>
    </div>`;
    }
    return `
    <div class="biography-edit-row connection ${mode === 'inline' ? '' : 'module-house-connection-row'}" ${mode === 'inline' ? `data-house-connection-index="${index}"` : ''} data-house-connection-type="connection">
      <input type="hidden" class="me-house-connection-title" value="">
      <input class="inline-edit-input ${mode === 'module' ? 'me-house-connection-image' : ''}" type="url" value="${escapeHtml(item.image || '')}" placeholder="Imgur-Bild (Wappen/Portrait)" ${mode === 'inline' ? `data-inline-action="update-house-connection-field" data-house-connection-index="${index}" data-house-connection-field="image"` : ''}>
      <select class="inline-edit-input ${mode === 'module' ? 'me-house-connection-image-format' : ''}" ${mode === 'inline' ? `data-inline-action="update-house-connection-field" data-house-connection-index="${index}" data-house-connection-field="imageFormat"` : ''}>
        <option value="portrait"${item.imageFormat !== 'landscape' && item.imageFormat !== 'square' ? ' selected' : ''}>Hochformat</option>
        <option value="landscape"${item.imageFormat === 'landscape' ? ' selected' : ''}>Querformat</option>
        <option value="square"${item.imageFormat === 'square' ? ' selected' : ''}>Quadrat (Wappen)</option>
      </select>
      <input class="inline-edit-input ${mode === 'module' ? 'me-house-connection-name' : ''}" type="text" value="${escapeHtml(item.name || '')}" placeholder="Name des Hauses" ${mode === 'inline' ? `data-inline-action="update-house-connection-field" data-house-connection-index="${index}" data-house-connection-field="name"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-house-connection-detail' : ''}" type="text" value="${escapeHtml(item.detail || '')}" placeholder="Beziehung" ${mode === 'inline' ? `data-inline-action="update-house-connection-field" data-house-connection-index="${index}" data-house-connection-field="detail"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-house-connection" data-house-connection-index="${index}"` : 'data-module-editor-action="remove-house-connection-row"'}>Loeschen</button>
    </div>`;
  }).join('');
}

function collectModuleHouseStats(card) {
  return Array.from(card.querySelectorAll('.module-house-stat-row'))
    .map(row => [
      getTrimmedFormValue(row, '.me-house-stat-label'),
      getTrimmedFormValue(row, '.me-house-stat-value')
    ])
    .filter(([label, value]) => label || value);
}

function collectModuleHouseInfluences(card) {
  return Array.from(card.querySelectorAll('.module-house-influence-row')).map(row => ({
    icon: getTrimmedFormValue(row, '.me-house-influence-icon'),
    title: getTrimmedFormValue(row, '.me-house-influence-title'),
    detail: getTrimmedFormValue(row, '.me-house-influence-detail')
  })).filter(item => item.icon || item.title || item.detail);
}

function collectModuleHouseSections(card) {
  return Array.from(card.querySelectorAll('.module-house-section-row')).map(row => ({
    position: getFormValue(row, '.me-house-section-position'),
    mode: getFormValue(row, '.me-house-section-mode'),
    title: getTrimmedFormValue(row, '.me-house-section-title'),
    text: getTrimmedFormValue(row, '.me-house-section-text')
  })).filter(item => item.title || item.text);
}

function collectModuleHouseConnections(card) {
  return Array.from(card.querySelectorAll('.module-house-connection-row')).map(row => ({
    type: row.dataset.houseConnectionType === 'heading' ? 'heading' : 'connection',
    title: getTrimmedFormValue(row, '.me-house-connection-title'),
    image: getTrimmedFormValue(row, '.me-house-connection-image'),
    imageFormat: getFormValue(row, '.me-house-connection-image-format'),
    name: getTrimmedFormValue(row, '.me-house-connection-name'),
    detail: getTrimmedFormValue(row, '.me-house-connection-detail')
  })).filter(item => item.type === 'heading' ? item.title || item.detail : item.image || item.name || item.detail);
}

function collectModuleHouseDocuments(card) {
  return Array.from(card.querySelectorAll('.module-house-document-row')).map(row => ({
    text: getTrimmedFormValue(row, '.me-house-document-text'),
    link: getTrimmedFormValue(row, '.me-house-document-link')
  })).filter(item => item.text || item.link);
}

function addModuleHouseStatRow(button) {
  const pageCard = button.closest('.module-page-card');
  const wrap = button.closest('.module-editor-field')?.querySelector('.module-house-stats')
    || pageCard?.querySelector('.module-house-stats');
  if (!pageCard || !wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildModuleHouseStatRows([['Neuer Eintrag', 'Wert']]));
  syncModuleJsonPreview();
}

function removeModuleHouseStatRow(button) {
  const pageCard = button.closest('.module-page-card');
  const row = button.closest('.module-house-stat-row');
  const wrap = button.closest('.module-editor-field')?.querySelector('.module-house-stats')
    || pageCard?.querySelector('.module-house-stats');
  if (!pageCard || !row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.module-house-stat-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Infozeilen vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function addModuleHouseInfluenceRow(button) {
  const pageCard = button.closest('.module-page-card');
  const wrap = pageCard?.querySelector('.module-house-influences');
  if (!pageCard || !wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildHouseInfluenceRows([{ icon: '*', title: 'Neuer Punkt', detail: '' }], 'module'));
  syncModuleJsonPreview();
}

function removeModuleHouseInfluenceRow(button) {
  const pageCard = button.closest('.module-page-card');
  const row = button.closest('.module-house-influence-row');
  const wrap = pageCard?.querySelector('.module-house-influences');
  if (!pageCard || !row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.module-house-influence-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Punkte vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function addModuleHouseSectionRow(button, position = 'afterIntro') {
  const pageCard = button.closest('.module-page-card');
  const wrap = pageCard?.querySelector('.module-house-sections');
  if (!pageCard || !wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildHouseSectionRows([{
    position: position === 'afterWorks' ? 'afterWorks' : 'afterIntro',
    mode: 'text',
    title: 'Neue Ueberschrift',
    text: ''
  }], 'module'));
  syncModuleJsonPreview();
}

function removeModuleHouseSectionRow(button) {
  const pageCard = button.closest('.module-page-card');
  const row = button.closest('.module-house-section-row');
  const wrap = pageCard?.querySelector('.module-house-sections');
  if (!pageCard || !row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.module-house-section-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Zusatzabschnitte vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function addModuleHouseDocumentRow(button) {
  const pageCard = button.closest('.module-page-card');
  const wrap = pageCard?.querySelector('.module-house-documents');
  if (!pageCard || !wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildHouseDocumentRows([{ text: 'Neues Dokument', link: '' }], 'module'));
  syncModuleJsonPreview();
}

function removeModuleHouseDocumentRow(button) {
  const pageCard = button.closest('.module-page-card');
  const row = button.closest('.module-house-document-row');
  const wrap = pageCard?.querySelector('.module-house-documents');
  if (!pageCard || !row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.module-house-document-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Dokumente vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function addModuleHouseConnectionRow(button) {
  const pageCard = button.closest('.module-page-card');
  const wrap = pageCard?.querySelector('.module-house-connections');
  if (!pageCard || !wrap) return;
  const kind = button.dataset.houseConnectionKind === 'heading' ? 'heading' : 'connection';
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildHouseConnectionRows([kind === 'heading'
    ? { type: 'heading', title: 'Neue Gruppe', detail: '' }
    : { type: 'connection', image: '', imageFormat: 'square', name: 'Neue Verbindung', detail: '' }
  ], 'module'));
  syncModuleJsonPreview();
}

function removeModuleHouseConnectionRow(button) {
  const pageCard = button.closest('.module-page-card');
  const row = button.closest('.module-house-connection-row');
  const wrap = pageCard?.querySelector('.module-house-connections');
  if (!pageCard || !row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.module-house-connection-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Verbindungen vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function buildHouseModuleEditorFields(page) {
  const house = sanitizeHouseData(page?.house || {});
  return `
      <div class="module-page-type-block${inferModulePageType(page) === 'house' ? ' visible' : ''}" data-page-type="house">
        <div class="module-editor-grid">
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Infotabelle</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-house-stat-row">+ Zeile</button>
            </div>
            <div class="inline-stat-editor module-house-stats">
              ${buildModuleHouseStatRows(page?.stats || [])}
            </div>
          </div>
          <div class="module-editor-field">
            <label>Überschrift "Über dieses Haus"</label>
            <input type="text" class="me-house-title" value="${escapeHtml(house.biographyTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Linke Inhaltsbreite (%)</label>
            <input type="number" class="me-house-side-width" min="35" max="100" step="1" value="${escapeHtml(house.sideWidth)}">
            <div class="module-editor-help">Steuert Wappenbild, Infotabelle und Zitatbox gemeinsam.</div>
          </div>
          <div class="module-editor-field">
            <label>Einflussbereiche-Überschrift</label>
            <input type="text" class="me-house-influences-title" value="${escapeHtml(house.abilitiesTitle)}">
          </div>
          <div class="module-editor-field wide">
            <label>Über dieses Haus</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-house-text">${escapeHtml(house.biographyText || page?.description || '')}</textarea>
          </div>
          <div class="module-editor-field wide">
            <label>Einflussbereiche & Zuständigkeiten</label>
            <div class="module-editor-help">Icon per Bild-URL oder aus dem Icon-Verzeichnis (z.B. Organisationsicons: Militär, Diplomatie, Magie, Klerus, Spionage ...). Jederzeit ersetzbar.</div>
            <div class="module-editor-inline" style="justify-content:flex-end;">
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-house-influence-row">+ Punkt</button>
            </div>
            <div class="biography-edit-list module-house-influences">
              ${house.abilities.length ? buildHouseInfluenceRows(house.abilities, 'module') : '<div class="inline-placeholder-note">Noch keine Punkte vorhanden.</div>'}
            </div>
          </div>
          <div class="module-editor-field">
            <label>Geschichte-Überschrift</label>
            <input type="text" class="me-house-history-title" value="${escapeHtml(house.historyTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Taten-Überschrift</label>
            <input type="text" class="me-house-works-title" value="${escapeHtml(house.worksTitle)}">
          </div>
          <div class="module-editor-field wide">
            <label>Geschichte des Hauses</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-house-history-text">${escapeHtml(house.historyText)}</textarea>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Bekannte Taten & Ereignisse</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-simple-line-row" data-simple-line-list="houseDeeds">+ Tat</button>
            </div>
            ${buildModuleSimpleLineList(house.works, 'houseDeeds')}
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Zusatzabschnitte im Hauptbereich</label>
              <span>
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-house-section-row" data-house-section-position="afterIntro">+ Nach Haupttext</button>
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-house-section-row" data-house-section-position="afterWorks">+ Nach Abschnitt 3</button>
              </span>
            </div>
            <div class="module-editor-help">Fuer Textbloecke oder Bulletlisten zwischen den Hauptreitern (z.B. Wappenkunde, Sitz &amp; Ländereien, Titel &amp; Ränge).</div>
            <div class="biography-edit-list module-house-sections">
              ${house.extraSections.length ? buildHouseSectionRows(house.extraSections, 'module') : '<div class="inline-placeholder-note">Noch keine Zusatzabschnitte vorhanden.</div>'}
            </div>
          </div>
          <div class="module-editor-field">
            <label>Besonderheiten-Überschrift</label>
            <input type="text" class="me-house-trivia-title" value="${escapeHtml(house.triviaTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Hausworte-Überschrift</label>
            <input type="text" class="me-house-quotes-title" value="${escapeHtml(house.quotesTitle)}">
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Besonderheiten</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-simple-line-row" data-simple-line-list="houseTrivia">+ Besonderheit</button>
            </div>
            ${buildModuleSimpleLineList(house.trivia, 'houseTrivia')}
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Hausworte & Zitate</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-simple-line-row" data-simple-line-list="houseQuotes">+ Zitat</button>
            </div>
            ${buildModuleSimpleLineList(house.quotes, 'houseQuotes')}
          </div>
          <div class="module-editor-field">
            <label>Verbündete/Rivalen-Überschrift</label>
            <input type="text" class="me-house-connections-title" value="${escapeHtml(house.connectionsTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Wappenbild-Höhe (px)</label>
            <input type="number" class="me-house-connection-portrait-height" min="44" max="140" step="1" value="${escapeHtml(house.connectionPortraitHeight)}">
            <div class="module-editor-help">Macht die kleinen Wappen-/Portraitbilder bei Verbündeten und Rivalen höher oder kompakter.</div>
          </div>
          <div class="module-editor-field">
            <label>Verbindungstext-Versatz <span>${escapeHtml(house.connectionTextOffset)}px</span></label>
            <input class="module-size-range me-house-connection-text-offset" type="range" min="0" max="80" step="1" value="${escapeHtml(house.connectionTextOffset)}" data-module-editor-action="update-range-percent-label">
            <div class="module-editor-help">Rueckt den Text bei Verbündeten und Rivalen nach rechts.</div>
          </div>
          <div class="module-editor-field">
            <label>Dokumente-Überschrift</label>
            <input type="text" class="me-house-documents-title" value="${escapeHtml(house.documentsTitle)}">
          </div>
          <div class="module-editor-field wide">
            <label>Verbündete, Rivalen & Vasallen</label>
            <div class="module-editor-inline" style="justify-content:space-between;">
              <span class="module-editor-help">Wappen/Portrait, Name des anderen Hauses und Art der Beziehung.</span>
              <span>
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-house-connection-row" data-house-connection-kind="heading">+ Trenner</button>
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-house-connection-row" data-house-connection-kind="connection">+ Verbindung</button>
              </span>
            </div>
            <div class="biography-edit-list module-house-connections">
              ${buildHouseConnectionRows(house.connections, 'module')}
            </div>
          </div>
          <div class="module-editor-field wide">
            <label>${escapeHtml(house.documentsTitle || 'Dokumente & Urkunden')}</label>
            <div class="module-editor-inline" style="justify-content:space-between;">
              <span class="module-editor-help">Der Link öffnet den Dokumenttitel in einer neuen Seite.</span>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-house-document-row">+ Dokument</button>
            </div>
            <div class="biography-edit-list module-house-documents">
              ${buildHouseDocumentRows(house.documents, 'module')}
            </div>
          </div>
          <div class="module-editor-field wide">
            <label>Hauswort-Zitatbox links</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-house-quote small">${escapeHtml(page?.quote || '')}</textarea>
          </div>
          <div class="module-editor-field">
            <label>Zitat von</label>
            <input type="text" class="me-house-quote-by" value="${escapeHtml(page?.quoteBy || '')}">
          </div>
          <div class="module-editor-field wide">
            <label>Fußzeile</label>
            <input type="text" class="me-house-footer" value="${escapeHtml(house.footer)}">
          </div>
        </div>
      </div>`;
}

function collectHouseModuleEditorPage(card, page) {
  page.housePage = true;
  page.description = getTrimmedFormValue(card, '.me-house-text');
  page.stats = collectModuleHouseStats(card.querySelector('[data-page-type="house"]') || card);
  page.quote = getTrimmedFormValue(card, '.me-house-quote');
  page.quoteBy = getTrimmedFormValue(card, '.me-house-quote-by');
  page.house = sanitizeHouseData({
    biographyTitle: getTrimmedFormValue(card, '.me-house-title'),
    biographyText: getTrimmedFormValue(card, '.me-house-text'),
    sideWidth: getFormValue(card, '.me-house-side-width'),
    abilitiesTitle: getTrimmedFormValue(card, '.me-house-influences-title'),
    abilities: collectModuleHouseInfluences(card),
    extraSections: collectModuleHouseSections(card),
    historyTitle: getTrimmedFormValue(card, '.me-house-history-title'),
    historyText: getTrimmedFormValue(card, '.me-house-history-text'),
    worksTitle: getTrimmedFormValue(card, '.me-house-works-title'),
    works: collectModuleSimpleLineRows(card, 'houseDeeds'),
    triviaTitle: getTrimmedFormValue(card, '.me-house-trivia-title'),
    trivia: collectModuleSimpleLineRows(card, 'houseTrivia'),
    quotesTitle: getTrimmedFormValue(card, '.me-house-quotes-title'),
    quotes: collectModuleSimpleLineRows(card, 'houseQuotes'),
    connectionsTitle: getTrimmedFormValue(card, '.me-house-connections-title'),
    connectionPortraitHeight: getFormValue(card, '.me-house-connection-portrait-height'),
    connectionTextOffset: getFormValue(card, '.me-house-connection-text-offset'),
    connections: collectModuleHouseConnections(card),
    documentsTitle: getTrimmedFormValue(card, '.me-house-documents-title'),
    documents: collectModuleHouseDocuments(card),
    footer: getTrimmedFormValue(card, '.me-house-footer')
  });
  return page;
}
