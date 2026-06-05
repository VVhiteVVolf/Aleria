function getCasteEditorRowConfig(listName) {
  const definition = getCasteEditorListDefinition(listName);
  const names = {
    infoRows: ['module-caste-info-rows', 'module-caste-info-row', 'me-caste-info'],
    symbols: ['module-caste-symbols', 'module-caste-symbol-row', 'me-caste-symbol'],
    roles: ['module-caste-roles', 'module-caste-role-row', 'me-caste-role'],
    skills: ['module-caste-skills', 'module-caste-skill-row', 'me-caste-skill'],
    privileges: ['module-caste-privileges', 'module-caste-privilege-row', 'me-caste-privilege'],
    restrictions: ['module-caste-restrictions', 'module-caste-restriction-row', 'me-caste-restriction'],
    organizationRows: ['module-caste-organization-rows', 'module-caste-organization-row', 'me-caste-organization'],
    representatives: ['module-caste-representatives', 'module-caste-representative-row', 'me-caste-representative'],
    relatedEntries: ['module-caste-related-entries', 'module-caste-related-row', 'me-caste-related']
  }[listName] || ['module-caste-info-rows', 'module-caste-info-row', 'me-caste-info'];
  return {
    ...definition,
    wrapClass: names[0],
    rowClass: names[1],
    prefix: names[2]
  };
}

function buildCasteEditorRows(items = [], listName = 'infoRows') {
  const config = getCasteEditorRowConfig(listName);
  const rows = Array.isArray(items) && items.length ? items : [config.fallback];
  return rows.map(item => `
    <div class="caste-edit-row ${config.rowClass}">
      ${config.fields.map(([field, placeholder, type]) => {
        const value = escapeHtml(item?.[field] || '');
        const className = `${config.prefix}-${field}`;
        if (type === 'textarea') {
          return `<textarea class="inline-edit-textarea ${className}" placeholder="${escapeHtml(placeholder)}">${value}</textarea>`;
        }
        return `<input class="inline-edit-input ${className}" type="${type}" value="${value}" placeholder="${escapeHtml(placeholder)}">`;
      }).join('')}
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-caste-row">Loeschen</button>
    </div>`).join('');
}

function collectCasteEditorRows(card, listName, fields) {
  const config = getCasteEditorRowConfig(listName);
  return Array.from(card.querySelectorAll(`.${config.rowClass}`)).map(row => {
    const item = {};
    fields.forEach(field => {
      item[field] = getTrimmedFormValue(row, `.${config.prefix}-${field}`);
    });
    return item;
  }).filter(item => fields.some(field => item[field]));
}

function collectCasteEditorRowsByDefinition(card, listName) {
  return collectCasteEditorRows(
    card,
    listName,
    getCasteEditorListDefinition(listName).fields.map(([field]) => field)
  );
}

function addModuleCasteRow(button, listName) {
  const pageCard = button.closest('.module-page-card');
  const config = getCasteEditorRowConfig(listName);
  const wrap = pageCard?.querySelector(`.${config.wrapClass}`);
  if (!wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildCasteEditorRows([], listName));
  hydrateModuleRichEditors(wrap.lastElementChild || wrap);
  syncModuleJsonPreview();
}

function removeModuleCasteRow(button) {
  const row = button.closest('.caste-edit-row');
  const wrap = row?.parentElement;
  if (!row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.caste-edit-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Eintraege vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function buildCasteEditorListBlock(caste, listName) {
  const config = getCasteEditorRowConfig(listName);
  const definition = getCasteEditorListDefinition(listName);
  return `
    <div class="module-editor-field wide">
      <div class="module-editor-inline" style="justify-content:space-between;">
        <label>${escapeHtml(definition.label)}</label>
        <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-caste-row" data-caste-list="${escapeHtml(listName)}">+ ${escapeHtml(definition.addLabel)}</button>
      </div>
      <input type="text" class="me-caste-${escapeHtml(definition.titleField)}" value="${escapeHtml(caste[definition.titleField] || '')}">
      <div class="caste-edit-list ${config.wrapClass}">
        ${buildCasteEditorRows(caste[listName], listName)}
      </div>
    </div>`;
}

function buildCasteModuleEditorFields(page) {
  const caste = sanitizeCasteData(page?.caste || {});
  return `
      <div class="module-page-type-block${inferModulePageType(page) === 'caste' ? ' visible' : ''}" data-page-type="caste">
        <div class="module-editor-grid">
          <div class="module-editor-field wide">
            <label>Beschreibung</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-caste-description">${escapeHtml(page?.description || '')}</textarea>
          </div>
          <div class="module-editor-field">
            <label>Archivzeile</label>
            <input type="text" class="me-caste-archive-label" value="${escapeHtml(caste.archiveLabel)}">
          </div>
          <div class="module-editor-field">
            <label>Dokumentnummer</label>
            <input type="text" class="me-caste-document-code" value="${escapeHtml(caste.documentCode)}">
          </div>
          <div class="module-editor-field">
            <label>Kategorie</label>
            <input type="text" class="me-caste-category-label" value="${escapeHtml(caste.categoryLabel)}">
          </div>
          <div class="module-editor-field">
            <label>Hauptsymbol-URL</label>
            <input type="url" class="me-caste-header-symbol" value="${escapeHtml(caste.headerSymbol)}" placeholder="https://i.imgur.com/...">
          </div>
          <div class="module-editor-field">
            <label>Siegel-URL</label>
            <input type="url" class="me-caste-seal-image" value="${escapeHtml(caste.sealImage)}" placeholder="https://i.imgur.com/...">
          </div>
          <div class="module-editor-field">
            <label>Banner-URL</label>
            <input type="url" class="me-caste-banner-image" value="${escapeHtml(caste.bannerImage)}" placeholder="https://i.imgur.com/...">
          </div>
          <div class="module-editor-field">
            <label>Kastenbilder <span>${escapeHtml(caste.imageScale)}%</span></label>
            <input class="module-size-range me-caste-image-scale" type="range" min="60" max="220" step="1" value="${escapeHtml(caste.imageScale)}" data-module-editor-action="update-range-percent-label">
          </div>
          <div class="module-editor-field wide">
            <label>Hintergrundbild-URL</label>
            <input type="url" class="me-caste-background-image" value="${escapeHtml(caste.backgroundImage)}" placeholder="https://i.imgur.com/...">
          </div>
          <div class="module-editor-field">
            <label>Intro-Ueberschrift</label>
            <input type="text" class="me-caste-intro-title" value="${escapeHtml(caste.introTitle)}">
          </div>
          <div class="module-editor-field wide">
            <label>Introtext</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-caste-intro-text">${escapeHtml(caste.introText)}</textarea>
          </div>
          ${CASTE_EDITOR_LIST_ORDER.map(listName => buildCasteEditorListBlock(caste, listName)).join('')}
          <div class="module-editor-field wide">
            <label>Zitat / Leitsatz</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-caste-quote small">${escapeHtml(caste.quote)}</textarea>
          </div>
          <div class="module-editor-field">
            <label>Zitat von</label>
            <input type="text" class="me-caste-quote-by" value="${escapeHtml(caste.quoteBy)}">
          </div>
          <div class="module-editor-field wide">
            <label>Footer / Archivnotiz</label>
            <input type="text" class="me-caste-footer" value="${escapeHtml(caste.footer)}">
          </div>
        </div>
      </div>`;
}

function collectCasteModuleEditorPage(card, page) {
  const casteBlock = card.querySelector('[data-page-type="caste"]') || card;
  page.castePage = true;
  page.description = getTrimmedFormValue(card, '.me-caste-description');
  page.caste = sanitizeCasteData({
    archiveLabel: getTrimmedFormValue(card, '.me-caste-archive-label'),
    documentCode: getTrimmedFormValue(card, '.me-caste-document-code'),
    categoryLabel: getTrimmedFormValue(card, '.me-caste-category-label'),
    headerSymbol: getTrimmedFormValue(card, '.me-caste-header-symbol'),
    sealImage: getTrimmedFormValue(card, '.me-caste-seal-image'),
    bannerImage: getTrimmedFormValue(card, '.me-caste-banner-image'),
    backgroundImage: getTrimmedFormValue(card, '.me-caste-background-image'),
    imageScale: getFormValue(card, '.me-caste-image-scale'),
    introTitle: getTrimmedFormValue(card, '.me-caste-intro-title'),
    introText: getTrimmedFormValue(card, '.me-caste-intro-text'),
    infoTitle: getTrimmedFormValue(card, '.me-caste-infoTitle'),
    infoRows: collectCasteEditorRowsByDefinition(casteBlock, 'infoRows'),
    symbolsTitle: getTrimmedFormValue(card, '.me-caste-symbolsTitle'),
    symbols: collectCasteEditorRowsByDefinition(casteBlock, 'symbols'),
    rolesTitle: getTrimmedFormValue(card, '.me-caste-rolesTitle'),
    roles: collectCasteEditorRowsByDefinition(casteBlock, 'roles'),
    skillsTitle: getTrimmedFormValue(card, '.me-caste-skillsTitle'),
    skills: collectCasteEditorRowsByDefinition(casteBlock, 'skills'),
    privilegesTitle: getTrimmedFormValue(card, '.me-caste-privilegesTitle'),
    privileges: collectCasteEditorRowsByDefinition(casteBlock, 'privileges'),
    restrictionsTitle: getTrimmedFormValue(card, '.me-caste-restrictionsTitle'),
    restrictions: collectCasteEditorRowsByDefinition(casteBlock, 'restrictions'),
    organizationTitle: getTrimmedFormValue(card, '.me-caste-organizationTitle'),
    organizationRows: collectCasteEditorRowsByDefinition(casteBlock, 'organizationRows'),
    representativesTitle: getTrimmedFormValue(card, '.me-caste-representativesTitle'),
    representatives: collectCasteEditorRowsByDefinition(casteBlock, 'representatives'),
    relatedTitle: getTrimmedFormValue(card, '.me-caste-relatedTitle'),
    relatedEntries: collectCasteEditorRowsByDefinition(casteBlock, 'relatedEntries'),
    quote: getTrimmedFormValue(card, '.me-caste-quote'),
    quoteBy: getTrimmedFormValue(card, '.me-caste-quote-by'),
    footer: getTrimmedFormValue(card, '.me-caste-footer')
  });
  return page;
}
