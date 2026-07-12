// Static module editor fields for the Gilden-Template (built on the houses/biography
// mechanics: portrait/stats shell, icon+text point list, extra sections, connections,
// documents — re-labelled for a guild/organisation).
//
// Guild-only additions compared to the houses editor: a portrait format switch (2:3 / 1:1)
// for the left image, a second document-style list "Verträge" and no quotes list (the motto
// lives in the header).

function buildModuleGuildStatRows(stats = []) {
  const rows = Array.isArray(stats) && stats.length ? stats : [['Neuer Eintrag', 'Wert']];
  return rows.map(([label, value]) => `
    <div class="inline-stat-row module-guild-stat-row">
      <input class="inline-edit-input me-guild-stat-label" type="text" value="${escapeHtml(label || '')}" placeholder="Label">
      <input class="inline-edit-input me-guild-stat-value" type="text" value="${escapeHtml(value || '')}" placeholder="Wert">
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-guild-stat-row">Löschen</button>
    </div>`).join('');
}

function collectModuleGuildStats(card) {
  return Array.from(card.querySelectorAll('.module-guild-stat-row'))
    .map(row => [
      getTrimmedFormValue(row, '.me-guild-stat-label'),
      getTrimmedFormValue(row, '.me-guild-stat-value')
    ])
    .filter(([label, value]) => label || value);
}

function addModuleGuildStatRow(button) {
  const pageCard = button.closest('.module-page-card');
  const wrap = button.closest('.module-editor-field')?.querySelector('.module-guild-stats')
    || pageCard?.querySelector('.module-guild-stats');
  if (!pageCard || !wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildModuleGuildStatRows([['Neuer Eintrag', 'Wert']]));
  syncModuleJsonPreview();
}

function removeModuleGuildStatRow(button) {
  const pageCard = button.closest('.module-page-card');
  const row = button.closest('.module-guild-stat-row');
  const wrap = button.closest('.module-editor-field')?.querySelector('.module-guild-stats')
    || pageCard?.querySelector('.module-guild-stats');
  if (!pageCard || !row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.module-guild-stat-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Infozeilen vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

registerRowSchema('guild.documents', {
  itemsKey: 'documents',
  dataNamespace: 'guild',
  sanitizeFn: sanitizeGuildData,
  rowClass: 'biography-edit-row document',
  rowSelectorClass: 'module-guild-document-row',
  listWrapClass: 'module-guild-documents',
  emptyFallbackItem: () => ({ icon: '', title: '', text: '', link: '' }),
  emptyMessage: 'Noch keine Einträge vorhanden.',
  fields: [
    { key: 'icon', kind: 'icon', placeholder: 'Icon-URL oder Zeichen', modalClass: 'me-guild-document-icon' },
    { key: 'title', kind: 'text', placeholder: 'Überschrift', modalClass: 'me-guild-document-title' },
    { key: 'text', kind: 'text', placeholder: 'Untertext', modalClass: 'me-guild-document-text' },
    { key: 'link', kind: 'url', placeholder: 'Link zur Seite / URL (optional)', modalClass: 'me-guild-document-link' }
  ],
  keepRow: item => item.icon || item.title || item.text || item.link,
  newItem: () => ({ icon: '', title: 'Neuer Eintrag', text: '', link: '' })
});

registerRowSchema('guild.contracts', {
  itemsKey: 'contracts',
  dataNamespace: 'guild',
  sanitizeFn: sanitizeGuildData,
  rowClass: 'biography-edit-row document',
  rowSelectorClass: 'module-guild-contract-row',
  listWrapClass: 'module-guild-contracts',
  emptyFallbackItem: () => ({ icon: '', title: '', text: '', link: '' }),
  emptyMessage: 'Noch keine Verträge vorhanden.',
  fields: [
    { key: 'icon', kind: 'icon', placeholder: 'Icon-URL oder Zeichen', modalClass: 'me-guild-contract-icon' },
    { key: 'title', kind: 'text', placeholder: 'Vertrag / Abkommen', modalClass: 'me-guild-contract-title' },
    { key: 'text', kind: 'text', placeholder: 'Untertext', modalClass: 'me-guild-contract-text' },
    { key: 'link', kind: 'url', placeholder: 'Link zur Seite / URL (optional)', modalClass: 'me-guild-contract-link' }
  ],
  keepRow: item => item.icon || item.title || item.text || item.link,
  newItem: () => ({ icon: '', title: 'Neuer Vertrag', text: '', link: '' })
});

registerRowSchema('guild.sections', {
  itemsKey: 'extraSections',
  dataNamespace: 'guild',
  sanitizeFn: sanitizeGuildData,
  rowClass: 'biography-edit-section-row',
  rowSelectorClass: 'module-guild-section-row',
  listWrapClass: 'module-guild-sections',
  emptyFallbackItem: null,
  emptyMessage: 'Noch keine Zusatzabschnitte vorhanden.',
  fields: [
    { key: 'position', kind: 'select', modalClass: 'me-guild-section-position', default: 'afterIntro', options: [['afterIntro', 'Nach Übersicht'], ['afterWorks', 'Nach Sonstiges']] },
    { key: 'mode', kind: 'select', modalClass: 'me-guild-section-mode', default: 'text', options: [['text', 'Text'], ['list', 'Bulletliste']] },
    { key: 'title', kind: 'text', placeholder: 'Ueberschrift', modalClass: 'me-guild-section-title' },
    { key: 'text', kind: 'textarea', placeholder: 'Text oder je Zeile ein Listenpunkt', modalClass: 'me-guild-section-text' }
  ],
  keepRow: item => item.title || item.text,
  newItem: (position) => ({
    position: position === 'afterWorks' ? 'afterWorks' : 'afterIntro',
    mode: 'text',
    title: 'Neue Ueberschrift',
    text: ''
  })
});

registerRowSchema('guild.traits', {
  itemsKey: 'abilities', // UI label is "Eigenschaften"; stored under "abilities" in
                         // sanitizeGuildData/sanitizeBiographyData — must stay "abilities".
  dataNamespace: 'guild',
  sanitizeFn: sanitizeGuildData,
  rowClass: 'biography-edit-row',
  rowSelectorClass: 'module-guild-trait-row',
  listWrapClass: 'module-guild-traits',
  emptyFallbackItem: null,
  emptyMessage: 'Noch keine Punkte vorhanden.',
  fields: [
    { key: 'icon', kind: 'icon', placeholder: 'Symbol oder Bild-URL', modalClass: 'me-guild-trait-icon' },
    { key: 'title', kind: 'text', placeholder: 'Titel', modalClass: 'me-guild-trait-title' },
    { key: 'detail', kind: 'text', placeholder: 'Beschreibung', modalClass: 'me-guild-trait-detail' }
  ],
  keepRow: item => item.icon || item.title || item.detail,
  newItem: () => ({ icon: '*', title: 'Neuer Punkt', detail: '' })
});

registerRowSchema('guild.connections', {
  itemsKey: 'connections',
  dataNamespace: 'guild',
  sanitizeFn: sanitizeGuildData,
  rowClass: 'biography-edit-row',
  rowSelectorClass: 'module-guild-connection-row',
  listWrapClass: 'module-guild-connections',
  discriminatorKey: 'type',
  defaultVariant: 'connection',
  emptyFallbackItem: () => ({ type: 'connection', image: '', imageFormat: 'square', name: '', detail: '' }),
  emptyMessage: 'Noch keine Einträge vorhanden.',
  variants: {
    heading: {
      rowClass: 'connection-heading',
      fields: [
        { key: 'title', kind: 'text', placeholder: 'Trenner (z.B. Führung, Beziehungen)', modalClass: 'me-guild-connection-title' },
        { key: 'detail', kind: 'text', placeholder: 'Unterzeile optional', modalClass: 'me-guild-connection-detail' }
      ],
      keepRow: item => item.title || item.detail,
      newItem: () => ({ type: 'heading', title: 'Neue Gruppe', detail: '' })
    },
    connection: {
      rowClass: 'connection',
      fields: [
        { key: 'image', kind: 'url', placeholder: 'Bild (Portrait/Siegel)', modalClass: 'me-guild-connection-image' },
        { key: 'imageFormat', kind: 'select', modalClass: 'me-guild-connection-image-format', default: 'portrait', options: [['portrait', 'Hochformat'], ['landscape', 'Querformat'], ['square', 'Quadrat (Siegel)']] },
        { key: 'name', kind: 'text', placeholder: 'Name / Organisation', modalClass: 'me-guild-connection-name' },
        { key: 'detail', kind: 'text', placeholder: 'Rolle oder Beziehung', modalClass: 'me-guild-connection-detail' }
      ],
      keepRow: item => item.image || item.name || item.detail,
      newItem: () => ({ type: 'connection', image: '', imageFormat: 'square', name: 'Neuer Eintrag', detail: '' })
    }
  }
});

function buildGuildModuleEditorFields(page) {
  const guild = sanitizeGuildData(page?.guild || {});
  return `
      <div class="module-page-type-block${inferModulePageType(page) === 'guild' ? ' visible' : ''}" data-page-type="guild">
        <div class="module-editor-grid">
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Infotabelle</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-guild-stat-row">+ Zeile</button>
            </div>
            <div class="inline-stat-editor module-guild-stats">
              ${buildModuleGuildStatRows(page?.stats || [])}
            </div>
          </div>
          <div class="module-editor-field">
            <label>Gildenzeichen / Emblem (Header rechts)</label>
            <input type="url" class="me-guild-crest-image" value="${escapeHtml(guild.crestImage)}" placeholder="https://i.imgur.com/...">
            <div class="module-editor-help">Eigenes, zweites Bildfeld für das Emblem im Kopfbereich — unabhängig vom Hauptbild links.</div>
          </div>
          ${buildModuleImageTabsEditor(page)}
          <div class="module-editor-field">
            <label>Bildformat links</label>
            <select class="me-guild-portrait-format">
              <option value="portrait"${guild.portraitFormat === 'portrait' ? ' selected' : ''}>2:3 Hochformat</option>
              <option value="square"${guild.portraitFormat === 'square' ? ' selected' : ''}>1:1 Quadratisch</option>
            </select>
          </div>
          <div class="module-editor-field">
            <label>Übersicht-Überschrift</label>
            <input type="text" class="me-guild-title" value="${escapeHtml(guild.biographyTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Linke Inhaltsbreite (%)</label>
            <input type="number" class="me-guild-side-width" min="35" max="100" step="1" value="${escapeHtml(guild.sideWidth)}">
            <div class="module-editor-help">Steuert Bild und Infotabelle gemeinsam.</div>
          </div>
          <div class="module-editor-field">
            <label>Eigenschaften-Überschrift</label>
            <input type="text" class="me-guild-traits-title" value="${escapeHtml(guild.abilitiesTitle)}">
          </div>
          <div class="module-editor-field wide">
            <label>Übersicht</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-guild-text">${escapeHtml(guild.biographyText || page?.description || '')}</textarea>
          </div>
          <div class="module-editor-field wide">
            <label>Eigenschaften</label>
            <div class="module-editor-help">Icon per Bild-URL oder aus dem Icon-Verzeichnis (z.B. Organisationsicons). Jederzeit ersetzbar.</div>
            <div class="module-editor-inline" style="justify-content:flex-end;">
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="schema-add-row" data-schema-key="guild.traits">+ Punkt</button>
            </div>
            <div class="biography-edit-list module-guild-traits">
              ${buildSchemaList('guild.traits', guild.abilities, 'module')}
            </div>
          </div>
          <div class="module-editor-field">
            <label>Geschichte-Überschrift</label>
            <input type="text" class="me-guild-history-title" value="${escapeHtml(guild.historyTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Sonstiges-Überschrift</label>
            <input type="text" class="me-guild-works-title" value="${escapeHtml(guild.worksTitle)}">
          </div>
          <div class="module-editor-field wide">
            <label>Geschichte</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-guild-history-text">${escapeHtml(guild.historyText)}</textarea>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Sonstiges</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-simple-line-row" data-simple-line-list="guildMisc">+ Punkt</button>
            </div>
            ${buildModuleSimpleLineList(guild.works, 'guildMisc')}
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Zusatzabschnitte im Hauptbereich</label>
              <span>
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="schema-add-row" data-schema-key="guild.sections" data-schema-arg="afterIntro">+ Nach Übersicht</button>
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="schema-add-row" data-schema-key="guild.sections" data-schema-arg="afterWorks">+ Nach Sonstiges</button>
              </span>
            </div>
            <div class="module-editor-help">Für Textblöcke oder Bulletlisten zwischen den Hauptabschnitten (z.B. Ränge, Aufnahmeritual, Gildenregeln).</div>
            <div class="biography-edit-list module-guild-sections">
              ${buildSchemaList('guild.sections', guild.extraSections, 'module')}
            </div>
          </div>
          <div class="module-editor-field">
            <label>Trivia-Überschrift</label>
            <input type="text" class="me-guild-trivia-title" value="${escapeHtml(guild.triviaTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Führung/Beziehungen-Überschrift</label>
            <input type="text" class="me-guild-connections-title" value="${escapeHtml(guild.connectionsTitle)}">
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Trivia</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-simple-line-row" data-simple-line-list="guildTrivia">+ Eintrag</button>
            </div>
            ${buildModuleSimpleLineList(guild.trivia, 'guildTrivia')}
          </div>
          <div class="module-editor-field wide">
            <label>Führung & Beziehungen</label>
            <div class="module-editor-inline" style="justify-content:space-between;">
              <span class="module-editor-help">Trenner für Gruppen (Führung, Beziehungen) oder Bild, Name und Rolle/Beziehung.</span>
              <span>
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="schema-add-row" data-schema-key="guild.connections" data-schema-arg="heading">+ Trenner</button>
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="schema-add-row" data-schema-key="guild.connections" data-schema-arg="connection">+ Eintrag</button>
              </span>
            </div>
            <div class="biography-edit-list module-guild-connections">
              ${buildSchemaList('guild.connections', guild.connections, 'module')}
            </div>
          </div>
          <div class="module-editor-field">
            <label>Bild-Höhe Führung/Beziehungen (px)</label>
            <input type="number" class="me-guild-connection-portrait-height" min="44" max="140" step="1" value="${escapeHtml(guild.connectionPortraitHeight)}">
          </div>
          <div class="module-editor-field">
            <label>Verbindungstext-Versatz <span>${escapeHtml(guild.connectionTextOffset)}px</span></label>
            <input class="module-size-range me-guild-connection-text-offset" type="range" min="0" max="80" step="1" value="${escapeHtml(guild.connectionTextOffset)}" data-module-editor-action="update-range-percent-label">
          </div>
          <div class="module-editor-field">
            <label>Verträge-Überschrift</label>
            <input type="text" class="me-guild-contracts-title" value="${escapeHtml(guild.contractsTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Besitz-Überschrift</label>
            <input type="text" class="me-guild-documents-title" value="${escapeHtml(guild.documentsTitle)}">
          </div>
          <div class="module-editor-field wide">
            <label>${escapeHtml(guild.contractsTitle || 'Verträge')}</label>
            <div class="module-editor-inline" style="justify-content:space-between;">
              <span class="module-editor-help">Abkommen, Aufträge und Verpflichtungen der Gilde. Icon per Bild-URL oder Zeichen; Link optional.</span>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="schema-add-row" data-schema-key="guild.contracts">+ Vertrag</button>
            </div>
            <div class="biography-edit-list module-guild-contracts">
              ${buildSchemaList('guild.contracts', guild.contracts, 'module')}
            </div>
          </div>
          <div class="module-editor-field wide">
            <label>${escapeHtml(guild.documentsTitle || 'Eigentum & Besitz')}</label>
            <div class="module-editor-inline" style="justify-content:space-between;">
              <span class="module-editor-help">Icon per Bild-URL oder Zeichen; der optionale Link öffnet den Eintrag in einer neuen Seite.</span>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="schema-add-row" data-schema-key="guild.documents">+ Eintrag</button>
            </div>
            <div class="biography-edit-list module-guild-documents">
              ${buildSchemaList('guild.documents', guild.documents, 'module')}
            </div>
          </div>
          <div class="module-editor-field wide">
            <label>Motto (erscheint im Header unter dem Titel)</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-guild-quote small">${escapeHtml(page?.quote || '')}</textarea>
          </div>
          <div class="module-editor-field">
            <label>Motto zugeschrieben an</label>
            <input type="text" class="me-guild-quote-by" value="${escapeHtml(page?.quoteBy || '')}">
          </div>
          <div class="module-editor-field wide">
            <label>Fußzeile</label>
            <input type="text" class="me-guild-footer" value="${escapeHtml(guild.footer)}">
          </div>
        </div>
      </div>`;
}

function collectGuildModuleEditorPage(card, page) {
  page.guildPage = true;
  page.description = getTrimmedFormValue(card, '.me-guild-text');
  page.stats = collectModuleGuildStats(card.querySelector('[data-page-type="guild"]') || card);
  page.quote = getTrimmedFormValue(card, '.me-guild-quote');
  page.quoteBy = getTrimmedFormValue(card, '.me-guild-quote-by');
  collectModuleImageTabs(card, page);
  page.guild = sanitizeGuildData({
    crestImage: getTrimmedFormValue(card, '.me-guild-crest-image'),
    portraitFormat: getFormValue(card, '.me-guild-portrait-format'),
    biographyTitle: getTrimmedFormValue(card, '.me-guild-title'),
    biographyText: getTrimmedFormValue(card, '.me-guild-text'),
    sideWidth: getFormValue(card, '.me-guild-side-width'),
    abilitiesTitle: getTrimmedFormValue(card, '.me-guild-traits-title'),
    abilities: collectSchemaRows(card, 'guild.traits'),
    extraSections: collectSchemaRows(card, 'guild.sections'),
    historyTitle: getTrimmedFormValue(card, '.me-guild-history-title'),
    historyText: getTrimmedFormValue(card, '.me-guild-history-text'),
    worksTitle: getTrimmedFormValue(card, '.me-guild-works-title'),
    works: collectModuleSimpleLineRows(card, 'guildMisc'),
    triviaTitle: getTrimmedFormValue(card, '.me-guild-trivia-title'),
    trivia: collectModuleSimpleLineRows(card, 'guildTrivia'),
    connectionsTitle: getTrimmedFormValue(card, '.me-guild-connections-title'),
    connectionPortraitHeight: getFormValue(card, '.me-guild-connection-portrait-height'),
    connectionTextOffset: getFormValue(card, '.me-guild-connection-text-offset'),
    connections: collectSchemaRows(card, 'guild.connections'),
    contractsTitle: getTrimmedFormValue(card, '.me-guild-contracts-title'),
    contracts: collectSchemaRows(card, 'guild.contracts'),
    documentsTitle: getTrimmedFormValue(card, '.me-guild-documents-title'),
    documents: collectSchemaRows(card, 'guild.documents'),
    footer: getTrimmedFormValue(card, '.me-guild-footer')
  });
  return page;
}
