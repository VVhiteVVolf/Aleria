// Inline editor house state and builder.
// Owns only house-page editing behavior (Häuser-Template, built on the biography mechanics).
//
// The four row-lists (documents/sections/influences/connections) are schema-driven via
// inline-editor-row-schemas.js. The "houseDeeds"/"houseTrivia"/"houseQuotes" simple-line lists
// and the plain scalar fields (title, crest image, quote, etc.) were not part of that migration
// and remain their own small hand-written implementation below.
//
// The hand-written editor this replaced (verified byte-identical against real data before
// removal) is archived at "Backup alter Code/inline-editor-house.legacy.js" — not loaded, kept
// only for reference/restore.

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

function buildInlineHouseEditor(page) {
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
            <button class="module-editor-mini-btn" type="button" data-inline-action="schema-add-row" data-schema-key="house.influences">+ Punkt</button>
          </div>
          <div class="biography-edit-list">${buildSchemaList('house.influences', house.abilities, 'inline')}</div>
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
              <button class="module-editor-mini-btn" type="button" data-inline-action="schema-add-row" data-schema-key="house.sections" data-schema-arg="afterIntro">+ Nach Haupttext</button>
              <button class="module-editor-mini-btn" type="button" data-inline-action="schema-add-row" data-schema-key="house.sections" data-schema-arg="afterWorks">+ Nach Abschnitt 3</button>
            </span>
          </div>
          <div class="inline-placeholder-note">Textbloecke oder Bulletlisten im mittleren Haus-Bereich.</div>
          <div class="biography-edit-list">${buildSchemaList('house.sections', house.extraSections, 'inline')}</div>
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
              <button class="module-editor-mini-btn" type="button" data-inline-action="schema-add-row" data-schema-key="house.connections" data-schema-arg="heading">+ Trenner</button>
              <button class="module-editor-mini-btn" type="button" data-inline-action="schema-add-row" data-schema-key="house.connections" data-schema-arg="connection">+ Verbindung</button>
            </span>
          </div>
          <div class="biography-edit-list">${buildSchemaList('house.connections', house.connections, 'inline')}</div>
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
          <span class="inline-edit-label">Besitz-/Dokumente-Ueberschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-house-field" data-house-field="documentsTitle" value="${escapeHtml(house.documentsTitle)}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">${escapeHtml(house.documentsTitle || 'Eigentum & Besitz')}</span>
          <div class="inline-edit-head">
            <div class="inline-placeholder-note">Icon per Bild-URL oder Zeichen; Einträge werden anklickbar, sobald ein Link gesetzt ist.</div>
            <button class="module-editor-mini-btn" type="button" data-inline-action="schema-add-row" data-schema-key="house.documents">+ Eintrag</button>
          </div>
          <div class="biography-edit-list">${buildSchemaList('house.documents', house.documents, 'inline')}</div>
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
