function getInlineTradeCatalogDataForEdit(page) {
  return sanitizeTradeCatalogData(page?.tradeCatalog || {});
}

function updateInlineTradeCatalogField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const field = input.dataset.tradeField;
  if (!field) return;
  const data = getInlineTradeCatalogDataForEdit(page);
  data[field] = input.value;
  page.tradeCatalog = sanitizeTradeCatalogData(data);
  scheduleInlineModuleLivePreviewRefresh();
}

function updateInlineTradeCatalogListField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const listName = input.dataset.tradeList;
  const field = input.dataset.tradeField;
  const index = Number(input.dataset.tradeIndex || -1);
  if (!listName || !field || index < 0) return;
  const data = getInlineTradeCatalogDataForEdit(page);
  if (listName === 'features' || listName === 'attributes') {
    const nestedIndex = Number(
      listName === 'features'
        ? input.dataset.tradeFeatureIndex || -1
        : input.dataset.tradeAttributeIndex || -1
    );
    const item = { ...(data.items[index] || {}) };
    const rows = Array.isArray(item[listName]) ? [...item[listName]] : [];
    const row = { ...(rows[nestedIndex] || {}) };
    row[field] = input.value;
    rows[nestedIndex] = row;
    item[listName] = rows;
    data.items[index] = item;
    page.tradeCatalog = sanitizeTradeCatalogData(data);
    scheduleInlineModuleLivePreviewRefresh();
    return;
  }
  const list = Array.isArray(data[listName]) ? [...data[listName]] : [];
  const item = { ...(list[index] || {}) };
  item[field] = input.value;
  list[index] = item;
  data[listName] = list;
  page.tradeCatalog = sanitizeTradeCatalogData(data);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineTradeCatalogRow(listName, index = 0) {
  const page = getInlineDraftPage();
  if (!page || !listName) return;
  const data = getInlineTradeCatalogDataForEdit(page);
  if (listName === 'features' || listName === 'attributes') {
    const item = { ...(data.items[index] || {}) };
    item[listName] = Array.isArray(item[listName]) ? [...item[listName]] : [];
    item[listName].push(getDefaultTradeCatalogRow(listName));
    data.items[index] = item;
    page.tradeCatalog = sanitizeTradeCatalogData(data);
    renderPage(currentPage, 0);
    return;
  }
  const list = Array.isArray(data[listName]) ? [...data[listName]] : [];
  list.push(getDefaultTradeCatalogRow(listName));
  data[listName] = list;
  page.tradeCatalog = sanitizeTradeCatalogData(data);
  renderPage(currentPage, 0);
}

function importInlineTradeCatalogItem() {
  if (typeof openItemDbPicker !== 'function') return;
  const page = getInlineDraftPage();
  if (!page) return;
  openItemDbPicker({
    title: 'Handelsgut aus Itemdatenbank laden',
    onSelect: item => {
      const data = getInlineTradeCatalogDataForEdit(page);
      const list = Array.isArray(data.items) ? [...data.items] : [];
      list.push(createTradeCatalogItemFromItemDbItem(item, data.categories));
      data.items = list;
      page.tradeCatalog = sanitizeTradeCatalogData(data);
      renderPage(currentPage, 0);
    }
  });
}

function removeInlineTradeCatalogRow(listName, index, featureIndex = 0, attributeIndex = 0) {
  const page = getInlineDraftPage();
  if (!page || !listName) return;
  const data = getInlineTradeCatalogDataForEdit(page);
  if (listName === 'features' || listName === 'attributes') {
    const item = { ...(data.items[index] || {}) };
    const nestedIndex = listName === 'features' ? featureIndex : attributeIndex;
    item[listName] = Array.isArray(item[listName]) ? [...item[listName]] : [];
    item[listName].splice(nestedIndex, 1);
    data.items[index] = item;
    page.tradeCatalog = sanitizeTradeCatalogData(data);
    renderPage(currentPage, 0);
    return;
  }
  const list = Array.isArray(data[listName]) ? [...data[listName]] : [];
  const removed = list[index];
  list.splice(index, 1);
  data[listName] = list;
  if (listName === 'categories') {
    const fallback = list[0]?.id || 'tiere';
    data.items = data.items.map(item => item.category === removed?.id ? { ...item, category: fallback } : item);
  }
  page.tradeCatalog = sanitizeTradeCatalogData(data);
  renderPage(currentPage, 0);
}

function stampInlineTradeCatalogAttributes(index = 0) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = getInlineTradeCatalogDataForEdit(page);
  const item = data.items[index];
  if (!item || !Array.isArray(item.attributes) || !item.attributes.length) return;
  setTradeCatalogAttributeStamp({
    attributesTitle: item.attributesTitle || 'Attribute',
    attributes: item.attributes
  });
}

function applyInlineTradeCatalogAttributeStamp(index = 0) {
  const page = getInlineDraftPage();
  const stamp = getTradeCatalogAttributeStamp();
  if (!page || !stamp) return;
  const data = getInlineTradeCatalogDataForEdit(page);
  if (!data.items[index]) return;
  data.items[index] = {
    ...data.items[index],
    attributesTitle: stamp.attributesTitle || 'Attribute',
    attributes: stamp.attributes
  };
  page.tradeCatalog = sanitizeTradeCatalogData(data);
  renderPage(currentPage, 0);
}

function buildInlineTradeField(label, field, value, type = 'text', wide = false) {
  return `
    <div class="inline-edit-field${wide ? ' wide' : ''}">
      <span class="inline-edit-label">${escapeHtml(label)}</span>
      <input class="inline-edit-input" type="${escapeHtml(type)}" data-inline-action="update-trade-field" data-trade-field="${escapeHtml(field)}" value="${escapeHtml(value || '')}">
    </div>`;
}

function buildInlineTradeTextarea(label, field, value) {
  return `
    <div class="inline-edit-field wide">
      <span class="inline-edit-label">${escapeHtml(label)}</span>
      <textarea class="inline-edit-textarea" data-inline-action="update-trade-field" data-trade-field="${escapeHtml(field)}">${escapeHtml(value || '')}</textarea>
    </div>`;
}

function buildInlineTradeListSection(listName, label, rowsHtml, addLabel) {
  const importButton = listName === 'items'
    ? '<button class="module-editor-mini-btn" type="button" data-inline-action="import-trade-item">Item laden</button>'
    : '';
  return `
    <div class="inline-edit-field wide">
      <div class="inline-edit-head">
        <span class="inline-edit-label">${escapeHtml(label)}</span>
        <div class="module-editor-inline">
          ${importButton}
          <button class="module-editor-mini-btn" type="button" data-inline-action="add-trade-list-row" data-trade-list="${escapeHtml(listName)}">+ ${escapeHtml(addLabel)}</button>
        </div>
      </div>
      <div class="trade-editor-list">${rowsHtml}</div>
    </div>`;
}

function buildInlineTradeCatalogEditor(page) {
  const data = sanitizeTradeCatalogData(page.tradeCatalog || {});
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Handelsgut & Tiere</div>
      <div class="inline-edit-grid">
        ${buildInlineTradeField('Titel', 'title', data.title)}
        ${buildInlineTradeField('Untertitel', 'subtitle', data.subtitle)}
        ${buildInlineTradeField('Kopf-Icon', 'headerIcon', data.headerIcon, 'url')}
        ${buildInlineTradeField('Notiz-Icon', 'noteIcon', data.noteIcon)}
        ${buildInlineTradeField('Preisnotiz-Titel', 'noteTitle', data.noteTitle)}
        ${buildInlineTradeField('Alle-Reiter', 'allLabel', data.allLabel)}
        ${buildInlineTradeTextarea('Preisnotiz-Text', 'noteText', data.noteText)}
        ${buildInlineTradeListSection('categories', 'Kategorien / Reiter', buildTradeCatalogCategoryRows(data.categories, 'inline'), 'Kategorie')}
        ${buildInlineTradeListSection('items', 'Handelsgueter / Tiere', buildTradeCatalogItemRows(data.items, 'inline'), 'Eintrag')}
        ${buildInlineTradeListSection('footerCards', 'Fusskarten / Hinweise', buildTradeCatalogFooterCardRows(data.footerCards, 'inline'), 'Hinweis')}
        ${buildInlineTradeField('Berater-Titel', 'advisorTitle', data.advisorTitle)}
        ${buildInlineTradeField('Berater-Bild', 'advisorImage', data.advisorImage, 'url')}
        ${buildInlineTradeTextarea('Berater-Text', 'advisorText', data.advisorText)}
      </div>
    </div>`;
}
