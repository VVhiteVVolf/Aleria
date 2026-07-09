// ============================================================================================
// BACKUP — ausrangierter Code, wird NICHT mehr geladen (kein <script>-Tag verweist hierher).
// Dies ist der komplette Stand von modules/inline-editor/inline-editor-house.js, BEVOR am
// 2026-07-09 die vier Zeilen-Listen (Einflussbereiche, Zusatzabschnitte, Verbindungen,
// Dokumente) auf den neuen, gemeinsamen Schema-Editor umgestellt wurden. Siehe
// "Backup alter Code/RESTORE-ANLEITUNG.docx" für den Hintergrund und wie man das hier bei
// Bedarf zurückspielt.
// ============================================================================================

// Inline editor house state and builder.
// Owns only house-page editing behavior (Häuser-Template, built on the biography mechanics).

function getInlineHouseDataForEdit(page) {
  return sanitizeHouseData(page?.house || {});
}

function getInlineHouseLineListName(listName) {
  if (listName === 'trivia') return 'trivia';
  if (listName === 'quotes') return 'quotes';
  return 'works';
}

function updateInlineHouseField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const field = input.dataset.houseField;
  if (!field) return;
  const current = getInlineHouseDataForEdit(page);
  const value = String(input.value || '').trim();

  if (field === 'quote') {
    page.quote = value;
  } else if (field === 'quoteBy') {
    page.quoteBy = value;
  } else {
    current[field] = value;
    if (field === 'biographyText') page.description = value;
  }

  page.house = sanitizeHouseData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineHouseLineRow(listName) {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = getInlineHouseDataForEdit(page);
  const safeList = getInlineHouseLineListName(listName);
  const fallbackText = safeList === 'quotes' ? 'Neues Hauswort' : safeList === 'trivia' ? 'Neue Besonderheit' : 'Neue Tat';
  current[safeList] = [...(current[safeList] || []), fallbackText];
  page.house = sanitizeHouseData(current);
  renderPage(currentPage, 0);
}

function removeInlineHouseLineRow(listName, index) {
  const page = getInlineDraftPage();
  if (!page || index < 0) return;
  const current = getInlineHouseDataForEdit(page);
  const safeList = getInlineHouseLineListName(listName);
  current[safeList] = (current[safeList] || []).filter((_, itemIndex) => itemIndex !== index);
  page.house = sanitizeHouseData(current);
  renderPage(currentPage, 0);
}

function updateInlineHouseLineField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const index = Number(input.dataset.houseLineIndex || -1);
  if (index < 0) return;
  const current = getInlineHouseDataForEdit(page);
  const safeList = getInlineHouseLineListName(input.dataset.houseLineList);
  current[safeList][index] = String(input.value || '').trim();
  page.house = sanitizeHouseData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function buildInlineHouseLineRows(items = [], listName = 'works') {
  const rows = Array.isArray(items) ? items : [];
  const safeList = getInlineHouseLineListName(listName);
  const placeholder = safeList === 'quotes' ? 'Hauswort' : safeList === 'trivia' ? 'Besonderheit' : 'Tat';
  return rows.length ? rows.map((item, index) => `
    <div class="inline-stat-row module-simple-line-row">
      <input
        class="inline-edit-input"
        type="text"
        data-inline-action="update-house-line-field"
        data-house-line-list="${escapeHtml(safeList)}"
        data-house-line-index="${index}"
        value="${escapeHtml(item || '')}"
        placeholder="${placeholder}">
      <button
        class="module-editor-mini-btn module-editor-danger"
        type="button"
        data-inline-action="remove-house-line-row"
        data-house-line-list="${escapeHtml(safeList)}"
        data-house-line-index="${index}">Löschen</button>
    </div>`).join('') : '<div class="inline-placeholder-note">Noch keine Einträge vorhanden.</div>';
}

function addInlineHouseDocumentRow() {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = getInlineHouseDataForEdit(page);
  current.documents.push({ text: 'Neues Dokument', link: '' });
  page.house = sanitizeHouseData(current);
  renderPage(currentPage, 0);
}

function removeInlineHouseDocumentRow(index) {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = getInlineHouseDataForEdit(page);
  current.documents.splice(index, 1);
  page.house = sanitizeHouseData(current);
  renderPage(currentPage, 0);
}

function updateInlineHouseDocumentField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const index = Number(input.dataset.houseDocumentIndex || -1);
  const field = input.dataset.houseDocumentField;
  if (index < 0 || !field) return;
  const current = getInlineHouseDataForEdit(page);
  current.documents = current.documents.length ? current.documents : [{ text: '', link: '' }];
  const item = current.documents[index] || { text: '', link: '' };
  item[field] = String(input.value || '').trim();
  current.documents[index] = item;
  page.house = sanitizeHouseData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function updateInlineHouseInfluenceField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const index = Number(input.dataset.houseInfluenceIndex || -1);
  const field = input.dataset.houseInfluenceField;
  if (index < 0 || !field) return;
  const current = getInlineHouseDataForEdit(page);
  current.abilities = current.abilities.length ? current.abilities : [{ icon: '*', title: '', detail: '' }];
  const item = current.abilities[index] || { icon: '*', title: '', detail: '' };
  item[field] = String(input.value || '').trim();
  current.abilities[index] = item;
  page.house = sanitizeHouseData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineHouseInfluenceRow() {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = getInlineHouseDataForEdit(page);
  current.abilities.push({ icon: '*', title: 'Neuer Punkt', detail: '' });
  page.house = sanitizeHouseData(current);
  renderPage(currentPage, 0);
}

function removeInlineHouseInfluenceRow(index) {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = getInlineHouseDataForEdit(page);
  current.abilities.splice(index, 1);
  page.house = sanitizeHouseData(current);
  renderPage(currentPage, 0);
}

function addInlineHouseSectionRow(position = 'afterIntro') {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = getInlineHouseDataForEdit(page);
  current.extraSections.push({
    position: position === 'afterWorks' ? 'afterWorks' : 'afterIntro',
    mode: 'text',
    title: 'Neue Ueberschrift',
    text: ''
  });
  page.house = sanitizeHouseData(current);
  renderPage(currentPage, 0);
}

function removeInlineHouseSectionRow(index) {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = getInlineHouseDataForEdit(page);
  current.extraSections.splice(index, 1);
  page.house = sanitizeHouseData(current);
  renderPage(currentPage, 0);
}

function updateInlineHouseSectionField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const index = Number(input.dataset.houseSectionIndex || -1);
  const field = input.dataset.houseSectionField;
  if (index < 0 || !field) return;
  const current = getInlineHouseDataForEdit(page);
  current.extraSections = current.extraSections.length ? current.extraSections : [];
  const item = current.extraSections[index] || { position: 'afterIntro', mode: 'text', title: '', text: '' };
  item[field] = String(input.value || '').trim();
  current.extraSections[index] = item;
  page.house = sanitizeHouseData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function updateInlineHouseConnectionField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const index = Number(input.dataset.houseConnectionIndex || -1);
  const field = input.dataset.houseConnectionField;
  if (index < 0 || !field) return;
  const current = getInlineHouseDataForEdit(page);
  current.connections = current.connections.length ? current.connections : [{ type: 'connection', image: '', imageFormat: 'square', name: '', detail: '' }];
  const item = current.connections[index] || { type: 'connection', image: '', imageFormat: 'square', name: '', detail: '' };
  item[field] = String(input.value || '').trim();
  current.connections[index] = item;
  page.house = sanitizeHouseData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineHouseConnectionRow(kind = 'connection') {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = getInlineHouseDataForEdit(page);
  current.connections.push(kind === 'heading'
    ? { type: 'heading', title: 'Neue Gruppe', detail: '' }
    : { type: 'connection', image: '', imageFormat: 'square', name: 'Neue Verbindung', detail: '' });
  page.house = sanitizeHouseData(current);
  renderPage(currentPage, 0);
}

function removeInlineHouseConnectionRow(index) {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = getInlineHouseDataForEdit(page);
  current.connections.splice(index, 1);
  page.house = sanitizeHouseData(current);
  renderPage(currentPage, 0);
}

function buildInlineHouseEditorLegacy(page) {
  const house = sanitizeHouseData(page.house || {});
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Haus</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Wappen des Hauses (Header rechts)</span>
          <input class="inline-edit-input" type="url" data-inline-action="update-house-field" data-house-field="crestImage" value="${escapeHtml(house.crestImage)}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Überschrift "Über dieses Haus"</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-house-field" data-house-field="biographyTitle" value="${escapeHtml(house.biographyTitle)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Einflussbereiche-Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-house-field" data-house-field="abilitiesTitle" value="${escapeHtml(house.abilitiesTitle)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Linke Inhaltsbreite (%)</span>
          <input class="inline-edit-input" type="number" min="35" max="100" step="1" data-inline-action="update-house-field" data-house-field="sideWidth" value="${escapeHtml(house.sideWidth)}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Über dieses Haus</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-house-field" data-house-field="biographyText">${escapeHtml(house.biographyText || page.description || '')}</textarea>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Einflussbereiche & Zuständigkeiten</span>
          <div class="inline-edit-head">
            <button class="module-editor-mini-btn" type="button" data-inline-action="add-house-influence">+ Punkt</button>
          </div>
          <div class="biography-edit-list">${house.abilities.length ? buildHouseInfluenceRows(house.abilities, 'inline') : '<div class="inline-placeholder-note">Noch keine Punkte vorhanden.</div>'}</div>
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Geschichte-Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-house-field" data-house-field="historyTitle" value="${escapeHtml(house.historyTitle)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Taten-Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-house-field" data-house-field="worksTitle" value="${escapeHtml(house.worksTitle)}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Geschichte des Hauses</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-house-field" data-house-field="historyText">${escapeHtml(house.historyText)}</textarea>
        </div>
        <div class="inline-edit-field wide">
          <div class="inline-edit-head">
            <span class="inline-edit-label">Bekannte Taten & Ereignisse</span>
            <button class="module-editor-mini-btn" type="button" data-inline-action="add-house-line-row" data-house-line-list="works">+ Tat</button>
          </div>
          <div class="inline-stat-editor">${buildInlineHouseLineRows(house.works, 'works')}</div>
        </div>
        <div class="inline-edit-field wide">
          <div class="inline-edit-head">
            <span class="inline-edit-label">Zusatzabschnitte im Hauptbereich</span>
            <span>
              <button class="module-editor-mini-btn" type="button" data-inline-action="add-house-section" data-house-section-position="afterIntro">+ Nach Haupttext</button>
              <button class="module-editor-mini-btn" type="button" data-inline-action="add-house-section" data-house-section-position="afterWorks">+ Nach Abschnitt 3</button>
            </span>
          </div>
          <div class="inline-placeholder-note">Textbloecke oder Bulletlisten im mittleren Haus-Bereich.</div>
          <div class="biography-edit-list">${house.extraSections.length ? buildHouseSectionRows(house.extraSections, 'inline') : '<div class="inline-placeholder-note">Noch keine Zusatzabschnitte vorhanden.</div>'}</div>
        </div>
        <div class="inline-edit-field wide">
          <div class="inline-edit-head">
            <span class="inline-edit-label">Besonderheiten</span>
            <button class="module-editor-mini-btn" type="button" data-inline-action="add-house-line-row" data-house-line-list="trivia">+ Besonderheit</button>
          </div>
          <div class="inline-stat-editor">${buildInlineHouseLineRows(house.trivia, 'trivia')}</div>
        </div>
        <div class="inline-edit-field wide">
          <div class="inline-edit-head">
            <span class="inline-edit-label">Hausworte & Zitate</span>
            <button class="module-editor-mini-btn" type="button" data-inline-action="add-house-line-row" data-house-line-list="quotes">+ Zitat</button>
          </div>
          <div class="inline-stat-editor">${buildInlineHouseLineRows(house.quotes, 'quotes')}</div>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Verbündete, Rivalen & Vasallen</span>
          <div class="inline-edit-head">
            <div class="inline-placeholder-note">Trenner fuer Gruppen oder Wappen/Portrait, Name und Beziehung.</div>
            <span>
              <button class="module-editor-mini-btn" type="button" data-inline-action="add-house-connection" data-house-connection-kind="heading">+ Trenner</button>
              <button class="module-editor-mini-btn" type="button" data-inline-action="add-house-connection" data-house-connection-kind="connection">+ Verbindung</button>
            </span>
          </div>
          <div class="biography-edit-list">${buildHouseConnectionRows(house.connections, 'inline')}</div>
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Verbündete/Rivalen-Ueberschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-house-field" data-house-field="connectionsTitle" value="${escapeHtml(house.connectionsTitle)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Wappenbild-Hoehe (px)</span>
          <input class="inline-edit-input" type="number" min="44" max="140" step="1" data-inline-action="update-house-field" data-house-field="connectionPortraitHeight" value="${escapeHtml(house.connectionPortraitHeight)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Verbindungstext-Versatz: ${escapeHtml(house.connectionTextOffset)}px</span>
          <input class="inline-image-range" type="range" min="0" max="80" step="1" data-inline-action="update-house-field" data-house-field="connectionTextOffset" value="${escapeHtml(house.connectionTextOffset)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Dokumente-Ueberschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-house-field" data-house-field="documentsTitle" value="${escapeHtml(house.documentsTitle)}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">${escapeHtml(house.documentsTitle || 'Dokumente & Urkunden')}</span>
          <div class="inline-edit-head">
            <div class="inline-placeholder-note">Dokumenttitel werden anklickbar, sobald ein Link gesetzt ist.</div>
            <button class="module-editor-mini-btn" type="button" data-inline-action="add-house-document">+ Dokument</button>
          </div>
          <div class="biography-edit-list">${buildHouseDocumentRows(house.documents, 'inline')}</div>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Hausmotto (erscheint im Header unter dem Titel)</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-house-field" data-house-field="quote">${escapeHtml(page.quote || '')}</textarea>
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Motto zugeschrieben an</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-house-field" data-house-field="quoteBy" value="${escapeHtml(page.quoteBy || '')}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Fußzeile</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-house-field" data-house-field="footer" value="${escapeHtml(house.footer)}">
        </div>
      </div>
    </div>`;
}
