// Inline editor guild state and builder.
// Owns only guild-page editing behavior (Gilden-Template, built on the houses/biography
// mechanics). Row lists (documents/contracts/sections/traits/connections) are schema-driven
// via the shared guild.* schemas registered in module-editor-guild.js; the simple-line lists
// (guildMisc/guildTrivia) and scalar fields mirror the houses inline editor.

function getInlineGuildDataForEdit(page) {
  return sanitizeGuildData(page?.guild || {});
}

function getInlineGuildLineListName(listName) {
  if (listName === 'trivia') return 'trivia';
  return 'works';
}

function updateInlineGuildField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const field = input.dataset.guildField;
  if (!field) return;
  const current = getInlineGuildDataForEdit(page);
  const value = String(input.value || '').trim();

  if (field === 'quote') {
    page.quote = value;
  } else if (field === 'quoteBy') {
    page.quoteBy = value;
  } else {
    current[field] = value;
    if (field === 'biographyText') page.description = value;
  }

  page.guild = sanitizeGuildData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineGuildLineRow(listName) {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = getInlineGuildDataForEdit(page);
  const safeList = getInlineGuildLineListName(listName);
  const fallbackText = safeList === 'trivia' ? 'Neuer Eintrag' : 'Neuer Punkt';
  current[safeList] = [...(current[safeList] || []), fallbackText];
  page.guild = sanitizeGuildData(current);
  renderPage(currentPage, 0);
}

function removeInlineGuildLineRow(listName, index) {
  const page = getInlineDraftPage();
  if (!page || index < 0) return;
  const current = getInlineGuildDataForEdit(page);
  const safeList = getInlineGuildLineListName(listName);
  current[safeList] = (current[safeList] || []).filter((_, itemIndex) => itemIndex !== index);
  page.guild = sanitizeGuildData(current);
  renderPage(currentPage, 0);
}

function updateInlineGuildLineField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const index = Number(input.dataset.guildLineIndex || -1);
  if (index < 0) return;
  const current = getInlineGuildDataForEdit(page);
  const safeList = getInlineGuildLineListName(input.dataset.guildLineList);
  current[safeList][index] = String(input.value || '').trim();
  page.guild = sanitizeGuildData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function buildInlineGuildLineRows(items = [], listName = 'works') {
  const rows = Array.isArray(items) ? items : [];
  const safeList = getInlineGuildLineListName(listName);
  const placeholder = safeList === 'trivia' ? 'Eintrag' : 'Punkt';
  return rows.length ? rows.map((item, index) => `
    <div class="inline-stat-row module-simple-line-row">
      <input
        class="inline-edit-input"
        type="text"
        data-inline-action="update-guild-line-field"
        data-guild-line-list="${escapeHtml(safeList)}"
        data-guild-line-index="${index}"
        value="${escapeHtml(item || '')}"
        placeholder="${placeholder}">
      <button
        class="module-editor-mini-btn module-editor-danger"
        type="button"
        data-inline-action="remove-guild-line-row"
        data-guild-line-list="${escapeHtml(safeList)}"
        data-guild-line-index="${index}">Löschen</button>
    </div>`).join('') : '<div class="inline-placeholder-note">Noch keine Einträge vorhanden.</div>';
}

function buildInlineGuildEditor(page) {
  const guild = sanitizeGuildData(page.guild || {});
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Gilde</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Gildenzeichen / Emblem (Header rechts)</span>
          <input class="inline-edit-input" type="url" data-inline-action="update-guild-field" data-guild-field="crestImage" value="${escapeHtml(guild.crestImage)}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Bildformat links</span>
          <select class="inline-edit-input" data-inline-action="update-guild-field" data-guild-field="portraitFormat">
            <option value="portrait"${guild.portraitFormat === 'portrait' ? ' selected' : ''}>2:3 Hochformat</option>
            <option value="square"${guild.portraitFormat === 'square' ? ' selected' : ''}>1:1 Quadratisch</option>
          </select>
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Übersicht-Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-guild-field" data-guild-field="biographyTitle" value="${escapeHtml(guild.biographyTitle)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Eigenschaften-Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-guild-field" data-guild-field="abilitiesTitle" value="${escapeHtml(guild.abilitiesTitle)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Linke Inhaltsbreite (%)</span>
          <input class="inline-edit-input" type="number" min="35" max="100" step="1" data-inline-action="update-guild-field" data-guild-field="sideWidth" value="${escapeHtml(guild.sideWidth)}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Übersicht</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-guild-field" data-guild-field="biographyText">${escapeHtml(guild.biographyText || page.description || '')}</textarea>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Eigenschaften</span>
          <div class="inline-edit-head">
            <button class="module-editor-mini-btn" type="button" data-inline-action="schema-add-row" data-schema-key="guild.traits">+ Punkt</button>
          </div>
          <div class="biography-edit-list">${buildSchemaList('guild.traits', guild.abilities, 'inline')}</div>
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Geschichte-Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-guild-field" data-guild-field="historyTitle" value="${escapeHtml(guild.historyTitle)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Sonstiges-Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-guild-field" data-guild-field="worksTitle" value="${escapeHtml(guild.worksTitle)}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Geschichte</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-guild-field" data-guild-field="historyText">${escapeHtml(guild.historyText)}</textarea>
        </div>
        <div class="inline-edit-field wide">
          <div class="inline-edit-head">
            <span class="inline-edit-label">Sonstiges</span>
            <button class="module-editor-mini-btn" type="button" data-inline-action="add-guild-line-row" data-guild-line-list="works">+ Punkt</button>
          </div>
          <div class="inline-stat-editor">${buildInlineGuildLineRows(guild.works, 'works')}</div>
        </div>
        <div class="inline-edit-field wide">
          <div class="inline-edit-head">
            <span class="inline-edit-label">Zusatzabschnitte im Hauptbereich</span>
            <span>
              <button class="module-editor-mini-btn" type="button" data-inline-action="schema-add-row" data-schema-key="guild.sections" data-schema-arg="afterIntro">+ Nach Übersicht</button>
              <button class="module-editor-mini-btn" type="button" data-inline-action="schema-add-row" data-schema-key="guild.sections" data-schema-arg="afterWorks">+ Nach Sonstiges</button>
            </span>
          </div>
          <div class="inline-placeholder-note">Textblöcke oder Bulletlisten im mittleren Bereich (z.B. Ränge, Gildenregeln).</div>
          <div class="biography-edit-list">${buildSchemaList('guild.sections', guild.extraSections, 'inline')}</div>
        </div>
        <div class="inline-edit-field wide">
          <div class="inline-edit-head">
            <span class="inline-edit-label">Trivia</span>
            <button class="module-editor-mini-btn" type="button" data-inline-action="add-guild-line-row" data-guild-line-list="trivia">+ Eintrag</button>
          </div>
          <div class="inline-stat-editor">${buildInlineGuildLineRows(guild.trivia, 'trivia')}</div>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Führung & Beziehungen</span>
          <div class="inline-edit-head">
            <div class="inline-placeholder-note">Trenner für Gruppen (Führung, Beziehungen) oder Bild, Name und Rolle.</div>
            <span>
              <button class="module-editor-mini-btn" type="button" data-inline-action="schema-add-row" data-schema-key="guild.connections" data-schema-arg="heading">+ Trenner</button>
              <button class="module-editor-mini-btn" type="button" data-inline-action="schema-add-row" data-schema-key="guild.connections" data-schema-arg="connection">+ Eintrag</button>
            </span>
          </div>
          <div class="biography-edit-list">${buildSchemaList('guild.connections', guild.connections, 'inline')}</div>
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Führung/Beziehungen-Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-guild-field" data-guild-field="connectionsTitle" value="${escapeHtml(guild.connectionsTitle)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Bild-Höhe (px)</span>
          <input class="inline-edit-input" type="number" min="44" max="140" step="1" data-inline-action="update-guild-field" data-guild-field="connectionPortraitHeight" value="${escapeHtml(guild.connectionPortraitHeight)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Verbindungstext-Versatz: ${escapeHtml(guild.connectionTextOffset)}px</span>
          <input class="inline-image-range" type="range" min="0" max="80" step="1" data-inline-action="update-guild-field" data-guild-field="connectionTextOffset" value="${escapeHtml(guild.connectionTextOffset)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Verträge-Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-guild-field" data-guild-field="contractsTitle" value="${escapeHtml(guild.contractsTitle)}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">${escapeHtml(guild.contractsTitle || 'Verträge')}</span>
          <div class="inline-edit-head">
            <div class="inline-placeholder-note">Abkommen, Aufträge und Verpflichtungen; Icon per Bild-URL oder Zeichen, Link optional.</div>
            <button class="module-editor-mini-btn" type="button" data-inline-action="schema-add-row" data-schema-key="guild.contracts">+ Vertrag</button>
          </div>
          <div class="biography-edit-list">${buildSchemaList('guild.contracts', guild.contracts, 'inline')}</div>
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Besitz-Überschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-guild-field" data-guild-field="documentsTitle" value="${escapeHtml(guild.documentsTitle)}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">${escapeHtml(guild.documentsTitle || 'Eigentum & Besitz')}</span>
          <div class="inline-edit-head">
            <div class="inline-placeholder-note">Icon per Bild-URL oder Zeichen; Einträge werden anklickbar, sobald ein Link gesetzt ist.</div>
            <button class="module-editor-mini-btn" type="button" data-inline-action="schema-add-row" data-schema-key="guild.documents">+ Eintrag</button>
          </div>
          <div class="biography-edit-list">${buildSchemaList('guild.documents', guild.documents, 'inline')}</div>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Motto (erscheint im Header unter dem Titel)</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-guild-field" data-guild-field="quote">${escapeHtml(page.quote || '')}</textarea>
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Motto zugeschrieben an</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-guild-field" data-guild-field="quoteBy" value="${escapeHtml(page.quoteBy || '')}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Fußzeile</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-guild-field" data-guild-field="footer" value="${escapeHtml(guild.footer)}">
        </div>
      </div>
    </div>`;
}
