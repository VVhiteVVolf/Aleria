function getCourtEditorRowConfig(listName) {
  const definition = getCourtEditorListDefinition(listName);
  const names = {
    overviewRows: ['module-court-overview-rows', 'module-court-overview-row', 'me-court-overview'],
    charges: ['module-court-charges', 'module-court-charge-row', 'me-court-charge'],
    dates: ['module-court-dates', 'module-court-date-row', 'me-court-date'],
    parties: ['module-court-parties', 'module-court-party-row', 'me-court-party'],
    evidence: ['module-court-evidence', 'module-court-evidence-row', 'me-court-evidence'],
    witnesses: ['module-court-witnesses', 'module-court-witness-row', 'me-court-witness'],
    chronology: ['module-court-chronology', 'module-court-chronology-row', 'me-court-chronology'],
    openQuestions: ['module-court-open-questions', 'module-court-question-row', 'me-court-question'],
    relatedEntries: ['module-court-related-entries', 'module-court-related-row', 'me-court-related']
  }[listName] || ['module-court-overview-rows', 'module-court-overview-row', 'me-court-overview'];
  return {
    ...definition,
    wrapClass: names[0],
    rowClass: names[1],
    prefix: names[2]
  };
}

function buildCourtEditorRows(items = [], listName = 'overviewRows') {
  const config = getCourtEditorRowConfig(listName);
  const rows = Array.isArray(items) && items.length ? items : [config.fallback];
  return rows.map(item => `
    <div class="court-edit-row ${config.rowClass}">
      ${config.fields.map(([field, placeholder, type]) => {
        const value = escapeHtml(item?.[field] || '');
        const className = `${config.prefix}-${field}`;
        if (type === 'textarea') {
          return `<textarea class="inline-edit-textarea ${className}" placeholder="${escapeHtml(placeholder)}">${value}</textarea>`;
        }
        return `<input class="inline-edit-input ${className}" type="${type}" value="${value}" placeholder="${escapeHtml(placeholder)}">`;
      }).join('')}
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-court-row">Loeschen</button>
    </div>`).join('');
}

function collectCourtEditorRows(card, listName, fields) {
  const config = getCourtEditorRowConfig(listName);
  return Array.from(card.querySelectorAll(`.${config.rowClass}`)).map(row => {
    const item = {};
    fields.forEach(field => {
      item[field] = getTrimmedFormValue(row, `.${config.prefix}-${field}`);
    });
    return item;
  }).filter(item => fields.some(field => item[field]));
}

function collectCourtEditorRowsByDefinition(card, listName) {
  return collectCourtEditorRows(
    card,
    listName,
    getCourtEditorListDefinition(listName).fields.map(([field]) => field)
  );
}

function addModuleCourtRow(button, listName) {
  const pageCard = button.closest('.module-page-card');
  const config = getCourtEditorRowConfig(listName);
  const wrap = pageCard?.querySelector(`.${config.wrapClass}`);
  if (!wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildCourtEditorRows([], listName));
  hydrateModuleRichEditors(wrap.lastElementChild || wrap);
  syncModuleJsonPreview();
}

function removeModuleCourtRow(button) {
  const row = button.closest('.court-edit-row');
  const wrap = row?.parentElement;
  if (!row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.court-edit-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Eintraege vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function buildCourtEditorListBlock(court, listName) {
  const config = getCourtEditorRowConfig(listName);
  const definition = getCourtEditorListDefinition(listName);
  return `
    <div class="module-editor-field wide">
      <div class="module-editor-inline" style="justify-content:space-between;">
        <label>${escapeHtml(definition.label)}</label>
        <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-court-row" data-court-list="${escapeHtml(listName)}">+ ${escapeHtml(definition.addLabel)}</button>
      </div>
      <input type="text" class="me-court-${escapeHtml(definition.titleField)}" value="${escapeHtml(court[definition.titleField] || '')}">
      <div class="court-edit-list ${config.wrapClass}">
        ${buildCourtEditorRows(court[listName], listName)}
      </div>
    </div>`;
}

function buildCourtModuleEditorFields(page) {
  const court = sanitizeCourtData(page?.court || {});
  return `
      <div class="module-page-type-block${inferModulePageType(page) === 'court' ? ' visible' : ''}" data-page-type="court">
        <div class="module-editor-grid">
          <div class="module-editor-field wide">
            <label>Beschreibung</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-court-description">${escapeHtml(page?.description || '')}</textarea>
          </div>
          <div class="module-editor-field">
            <label>Archivzeile</label>
            <input type="text" class="me-court-archive-label" value="${escapeHtml(court.archiveLabel)}">
          </div>
          <div class="module-editor-field">
            <label>Aktennummer</label>
            <input type="text" class="me-court-case-number" value="${escapeHtml(court.caseNumber)}">
          </div>
          <div class="module-editor-field">
            <label>Gericht</label>
            <input type="text" class="me-court-court-name" value="${escapeHtml(court.courtName)}">
          </div>
          <div class="module-editor-field">
            <label>Ort</label>
            <input type="text" class="me-court-court-place" value="${escapeHtml(court.courtPlace)}">
          </div>
          <div class="module-editor-field">
            <label>Status</label>
            <input type="text" class="me-court-status" value="${escapeHtml(court.status)}">
          </div>
          <div class="module-editor-field">
            <label>Status-Ton</label>
            <input type="text" class="me-court-status-tone" value="${escapeHtml(court.statusTone)}" placeholder="optional">
          </div>
          <div class="module-editor-field">
            <label>Kopf-Icon-URL</label>
            <input type="url" class="me-court-header-icon" value="${escapeHtml(court.headerIcon)}" placeholder="https://i.imgur.com/...">
          </div>
          <div class="module-editor-field">
            <label>Siegel-URL</label>
            <input type="url" class="me-court-seal-image" value="${escapeHtml(court.sealImage)}" placeholder="https://i.imgur.com/...">
          </div>
          <div class="module-editor-field">
            <label>Banner-URL</label>
            <input type="url" class="me-court-banner-image" value="${escapeHtml(court.bannerImage)}" placeholder="https://i.imgur.com/...">
          </div>
          <div class="module-editor-field wide">
            <label>Hintergrundbild-URL</label>
            <input type="url" class="me-court-background-image" value="${escapeHtml(court.backgroundImage)}" placeholder="https://i.imgur.com/...">
          </div>
          <div class="module-editor-field">
            <label>Zusammenfassungstitel</label>
            <input type="text" class="me-court-summary-title" value="${escapeHtml(court.summaryTitle)}">
          </div>
          <div class="module-editor-field wide">
            <label>Zusammenfassung</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-court-summary-text">${escapeHtml(court.summaryText)}</textarea>
          </div>
          ${COURT_EDITOR_LIST_ORDER.map(listName => buildCourtEditorListBlock(court, listName)).join('')}
          <div class="module-editor-field">
            <label>Aktennotiz-Titel</label>
            <input type="text" class="me-court-note-title" value="${escapeHtml(court.noteTitle)}">
          </div>
          <div class="module-editor-field wide">
            <label>Aktennotiz</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-court-note-text">${escapeHtml(court.noteText)}</textarea>
          </div>
          <div class="module-editor-field wide">
            <label>Footer</label>
            <input type="text" class="me-court-footer" value="${escapeHtml(court.footer)}">
          </div>
        </div>
      </div>`;
}

function collectCourtModuleEditorPage(card, page) {
  const courtBlock = card.querySelector('[data-page-type="court"]') || card;
  page.courtPage = true;
  page.description = getTrimmedFormValue(card, '.me-court-description');
  page.court = sanitizeCourtData({
    archiveLabel: getTrimmedFormValue(card, '.me-court-archive-label'),
    caseNumber: getTrimmedFormValue(card, '.me-court-case-number'),
    courtName: getTrimmedFormValue(card, '.me-court-court-name'),
    courtPlace: getTrimmedFormValue(card, '.me-court-court-place'),
    status: getTrimmedFormValue(card, '.me-court-status'),
    statusTone: getTrimmedFormValue(card, '.me-court-status-tone'),
    headerIcon: getTrimmedFormValue(card, '.me-court-header-icon'),
    sealImage: getTrimmedFormValue(card, '.me-court-seal-image'),
    bannerImage: getTrimmedFormValue(card, '.me-court-banner-image'),
    backgroundImage: getTrimmedFormValue(card, '.me-court-background-image'),
    overviewTitle: getTrimmedFormValue(card, '.me-court-overviewTitle'),
    overviewRows: collectCourtEditorRowsByDefinition(courtBlock, 'overviewRows'),
    summaryTitle: getTrimmedFormValue(card, '.me-court-summary-title'),
    summaryText: getTrimmedFormValue(card, '.me-court-summary-text'),
    chargesTitle: getTrimmedFormValue(card, '.me-court-chargesTitle'),
    charges: collectCourtEditorRowsByDefinition(courtBlock, 'charges'),
    datesTitle: getTrimmedFormValue(card, '.me-court-datesTitle'),
    dates: collectCourtEditorRowsByDefinition(courtBlock, 'dates'),
    partiesTitle: getTrimmedFormValue(card, '.me-court-partiesTitle'),
    parties: collectCourtEditorRowsByDefinition(courtBlock, 'parties'),
    evidenceTitle: getTrimmedFormValue(card, '.me-court-evidenceTitle'),
    evidence: collectCourtEditorRowsByDefinition(courtBlock, 'evidence'),
    witnessesTitle: getTrimmedFormValue(card, '.me-court-witnessesTitle'),
    witnesses: collectCourtEditorRowsByDefinition(courtBlock, 'witnesses'),
    chronologyTitle: getTrimmedFormValue(card, '.me-court-chronologyTitle'),
    chronology: collectCourtEditorRowsByDefinition(courtBlock, 'chronology'),
    openQuestionsTitle: getTrimmedFormValue(card, '.me-court-openQuestionsTitle'),
    openQuestions: collectCourtEditorRowsByDefinition(courtBlock, 'openQuestions'),
    relatedTitle: getTrimmedFormValue(card, '.me-court-relatedTitle'),
    relatedEntries: collectCourtEditorRowsByDefinition(courtBlock, 'relatedEntries'),
    noteTitle: getTrimmedFormValue(card, '.me-court-note-title'),
    noteText: getTrimmedFormValue(card, '.me-court-note-text'),
    footer: getTrimmedFormValue(card, '.me-court-footer')
  });
  return page;
}
