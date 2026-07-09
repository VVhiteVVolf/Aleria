// Static module editor fields for the Häuser-Template (built on the biography template's
// mechanics: portrait/stats/quote shell, icon+text point list, extra sections, connections,
// documents — re-labelled for a noble house instead of a person).
//
// The four row-lists below (documents/sections/influences/connections) are schema-driven via
// module-editor-row-schemas.js — see registerRowSchema calls below. The "Infotabelle" stat rows
// were not part of that migration and remain their own small hand-written implementation.
//
// The hand-written editor this replaced (verified byte-identical against real data before
// removal) is archived at "Backup alter Code/module-editor-house.legacy.js" — not loaded, kept
// only for reference/restore.

function buildModuleHouseStatRows(stats = []) {
  const rows = Array.isArray(stats) && stats.length ? stats : [['Neuer Eintrag', 'Wert']];
  return rows.map(([label, value]) => `
    <div class="inline-stat-row module-house-stat-row">
      <input class="inline-edit-input me-house-stat-label" type="text" value="${escapeHtml(label || '')}" placeholder="Label">
      <input class="inline-edit-input me-house-stat-value" type="text" value="${escapeHtml(value || '')}" placeholder="Wert">
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-house-stat-row">Löschen</button>
    </div>`).join('');
}

function collectModuleHouseStats(card) {
  return Array.from(card.querySelectorAll('.module-house-stat-row'))
    .map(row => [
      getTrimmedFormValue(row, '.me-house-stat-label'),
      getTrimmedFormValue(row, '.me-house-stat-value')
    ])
    .filter(([label, value]) => label || value);
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

registerRowSchema('house.documents', {
  itemsKey: 'documents',
  dataNamespace: 'house',
  sanitizeFn: sanitizeHouseData,
  rowClass: 'biography-edit-row document',
  rowSelectorClass: 'module-house-document-row',
  listWrapClass: 'module-house-documents',
  emptyFallbackItem: () => ({ text: '', link: '' }),
  emptyMessage: 'Noch keine Dokumente vorhanden.',
  fields: [
    { key: 'text', kind: 'text', placeholder: 'Dokumenttitel', modalClass: 'me-house-document-text' },
    { key: 'link', kind: 'url', placeholder: 'Link zur Seite / URL', modalClass: 'me-house-document-link' }
  ],
  keepRow: item => item.text || item.link,
  newItem: () => ({ text: 'Neues Dokument', link: '' })
});

registerRowSchema('house.sections', {
  itemsKey: 'extraSections',
  dataNamespace: 'house',
  sanitizeFn: sanitizeHouseData,
  rowClass: 'biography-edit-section-row',
  rowSelectorClass: 'module-house-section-row',
  listWrapClass: 'module-house-sections',
  emptyFallbackItem: null, // unlike the other three lists, an empty section list renders no row at all
  emptyMessage: 'Noch keine Zusatzabschnitte vorhanden.',
  fields: [
    { key: 'position', kind: 'select', modalClass: 'me-house-section-position', default: 'afterIntro', options: [['afterIntro', 'Nach Haupttext'], ['afterWorks', 'Nach Abschnitt 3']] },
    { key: 'mode', kind: 'select', modalClass: 'me-house-section-mode', default: 'text', options: [['text', 'Text'], ['list', 'Bulletliste']] },
    { key: 'title', kind: 'text', placeholder: 'Ueberschrift', modalClass: 'me-house-section-title' },
    { key: 'text', kind: 'textarea', placeholder: 'Text oder je Zeile ein Listenpunkt', modalClass: 'me-house-section-text' }
  ],
  keepRow: item => item.title || item.text,
  newItem: (position) => ({
    position: position === 'afterWorks' ? 'afterWorks' : 'afterIntro',
    mode: 'text',
    title: 'Neue Ueberschrift',
    text: ''
  })
});

registerRowSchema('house.influences', {
  itemsKey: 'abilities', // UI label is "Einflussbereiche", but sanitizeHouseData/sanitizeBiographyData
                         // store this list under the field name "abilities" — verified in
                         // module-editor-data.js. Must stay "abilities", not "influences".
  dataNamespace: 'house',
  sanitizeFn: sanitizeHouseData,
  rowClass: 'biography-edit-row',
  rowSelectorClass: 'module-house-influence-row',
  listWrapClass: 'module-house-influences',
  emptyFallbackItem: null,
  emptyMessage: 'Noch keine Punkte vorhanden.',
  fields: [
    { key: 'icon', kind: 'icon', placeholder: 'Symbol oder Bild-URL', modalClass: 'me-house-influence-icon' },
    { key: 'title', kind: 'text', placeholder: 'Titel', modalClass: 'me-house-influence-title' },
    { key: 'detail', kind: 'text', placeholder: 'Beschreibung', modalClass: 'me-house-influence-detail' }
  ],
  keepRow: item => item.icon || item.title || item.detail,
  newItem: () => ({ icon: '*', title: 'Neuer Punkt', detail: '' })
});

registerRowSchema('house.connections', {
  itemsKey: 'connections',
  dataNamespace: 'house',
  sanitizeFn: sanitizeHouseData,
  rowClass: 'biography-edit-row',
  rowSelectorClass: 'module-house-connection-row',
  listWrapClass: 'module-house-connections',
  discriminatorKey: 'type',
  defaultVariant: 'connection',
  emptyFallbackItem: () => ({ type: 'connection', image: '', imageFormat: 'square', name: '', detail: '' }),
  emptyMessage: 'Noch keine Verbindungen vorhanden.',
  variants: {
    heading: {
      rowClass: 'connection-heading',
      fields: [
        { key: 'title', kind: 'text', placeholder: 'Ueberschrift', modalClass: 'me-house-connection-title' },
        { key: 'detail', kind: 'text', placeholder: 'Unterzeile optional', modalClass: 'me-house-connection-detail' }
      ],
      keepRow: item => item.title || item.detail,
      newItem: () => ({ type: 'heading', title: 'Neue Gruppe', detail: '' })
    },
    connection: {
      rowClass: 'connection',
      fields: [
        { key: 'image', kind: 'url', placeholder: 'Imgur-Bild (Wappen/Portrait)', modalClass: 'me-house-connection-image' },
        { key: 'imageFormat', kind: 'select', modalClass: 'me-house-connection-image-format', default: 'portrait', options: [['portrait', 'Hochformat'], ['landscape', 'Querformat'], ['square', 'Quadrat (Wappen)']] },
        { key: 'name', kind: 'text', placeholder: 'Name des Hauses', modalClass: 'me-house-connection-name' },
        { key: 'detail', kind: 'text', placeholder: 'Beziehung', modalClass: 'me-house-connection-detail' }
      ],
      keepRow: item => item.image || item.name || item.detail,
      newItem: () => ({ type: 'connection', image: '', imageFormat: 'square', name: 'Neue Verbindung', detail: '' })
    }
  }
});

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
            <label>Wappen des Hauses (Header rechts)</label>
            <input type="url" class="me-house-crest-image" value="${escapeHtml(house.crestImage)}" placeholder="https://i.imgur.com/...">
            <div class="module-editor-help">Eigenes, zweites Bildfeld für das Wappen im Kopfbereich — unabhängig vom Hauptbild links.</div>
          </div>
          <div class="module-editor-field">
            <label>Überschrift "Über dieses Haus"</label>
            <input type="text" class="me-house-title" value="${escapeHtml(house.biographyTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Linke Inhaltsbreite (%)</label>
            <input type="number" class="me-house-side-width" min="35" max="100" step="1" value="${escapeHtml(house.sideWidth)}">
            <div class="module-editor-help">Steuert Bild, Infotabelle und Zitatbox gemeinsam.</div>
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
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="schema-add-row" data-schema-key="house.influences">+ Punkt</button>
            </div>
            <div class="biography-edit-list module-house-influences">
              ${buildSchemaList('house.influences', house.abilities, 'module')}
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
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="schema-add-row" data-schema-key="house.sections" data-schema-arg="afterIntro">+ Nach Haupttext</button>
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="schema-add-row" data-schema-key="house.sections" data-schema-arg="afterWorks">+ Nach Abschnitt 3</button>
              </span>
            </div>
            <div class="module-editor-help">Fuer Textbloecke oder Bulletlisten zwischen den Hauptreitern (z.B. Wappenkunde, Sitz &amp; Ländereien, Titel &amp; Ränge).</div>
            <div class="biography-edit-list module-house-sections">
              ${buildSchemaList('house.sections', house.extraSections, 'module')}
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
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="schema-add-row" data-schema-key="house.connections" data-schema-arg="heading">+ Trenner</button>
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="schema-add-row" data-schema-key="house.connections" data-schema-arg="connection">+ Verbindung</button>
              </span>
            </div>
            <div class="biography-edit-list module-house-connections">
              ${buildSchemaList('house.connections', house.connections, 'module')}
            </div>
          </div>
          <div class="module-editor-field wide">
            <label>${escapeHtml(house.documentsTitle || 'Dokumente & Urkunden')}</label>
            <div class="module-editor-inline" style="justify-content:space-between;">
              <span class="module-editor-help">Der Link öffnet den Dokumenttitel in einer neuen Seite.</span>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="schema-add-row" data-schema-key="house.documents">+ Dokument</button>
            </div>
            <div class="biography-edit-list module-house-documents">
              ${buildSchemaList('house.documents', house.documents, 'module')}
            </div>
          </div>
          <div class="module-editor-field wide">
            <label>Hausmotto (erscheint im Header unter dem Titel)</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-house-quote small">${escapeHtml(page?.quote || '')}</textarea>
          </div>
          <div class="module-editor-field">
            <label>Motto zugeschrieben an</label>
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
    crestImage: getTrimmedFormValue(card, '.me-house-crest-image'),
    biographyTitle: getTrimmedFormValue(card, '.me-house-title'),
    biographyText: getTrimmedFormValue(card, '.me-house-text'),
    sideWidth: getFormValue(card, '.me-house-side-width'),
    abilitiesTitle: getTrimmedFormValue(card, '.me-house-influences-title'),
    abilities: collectSchemaRows(card, 'house.influences'),
    extraSections: collectSchemaRows(card, 'house.sections'),
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
    connections: collectSchemaRows(card, 'house.connections'),
    documentsTitle: getTrimmedFormValue(card, '.me-house-documents-title'),
    documents: collectSchemaRows(card, 'house.documents'),
    footer: getTrimmedFormValue(card, '.me-house-footer')
  });
  return page;
}
