function buildGoodsCategoryRows(categories = [], mode = 'module', tableIndex = 0) {
  const rows = Array.isArray(categories) && categories.length ? categories : [{ id: 'allgemein', label: 'Allgemein' }];
  return rows.map((item, index) => `
    <div class="goods-edit-row category ${mode === 'module' ? 'module-goods-category-row' : 'inline-goods-category-row'}" data-goods-category="${escapeHtml(item.id || '')}">
      <input class="inline-edit-input ${mode === 'module' ? 'me-goods-category-id' : ''}" type="text" value="${escapeHtml(item.id || '')}" placeholder="id-kurz" ${mode === 'inline' ? `data-inline-action="update-goods-list-field" data-goods-list="categories" data-goods-table-index="${tableIndex}" data-goods-index="${index}" data-goods-field="id"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-goods-category-label' : ''}" type="text" value="${escapeHtml(item.label || '')}" placeholder="Label" ${mode === 'inline' ? `data-inline-action="update-goods-list-field" data-goods-list="categories" data-goods-table-index="${tableIndex}" data-goods-index="${index}" data-goods-field="label"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-goods-list-row" data-goods-list="categories" data-goods-table-index="${tableIndex}" data-goods-index="${index}"` : 'data-module-editor-action="remove-goods-row" data-goods-list="categories"'}>Loeschen</button>
    </div>`).join('');
}

function buildGoodsColumnRows(columns = [], mode = 'module', tableIndex = 0) {
  const rows = Array.isArray(columns) && columns.length ? columns : getDefaultGoodsColumns();
  return rows.map((item, index) => `
    <div class="goods-edit-row column ${mode === 'module' ? 'module-goods-column-row' : 'inline-goods-column-row'}">
      <input class="inline-edit-input ${mode === 'module' ? 'me-goods-column-id' : ''}" type="text" value="${escapeHtml(item.id || '')}" placeholder="spalten-id" ${mode === 'inline' ? `data-inline-action="update-goods-list-field" data-goods-list="columns" data-goods-table-index="${tableIndex}" data-goods-index="${index}" data-goods-field="id"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-goods-column-label' : ''}" type="text" value="${escapeHtml(item.label || '')}" placeholder="Spaltenname" ${mode === 'inline' ? `data-inline-action="update-goods-list-field" data-goods-list="columns" data-goods-table-index="${tableIndex}" data-goods-index="${index}" data-goods-field="label"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-goods-list-row" data-goods-list="columns" data-goods-table-index="${tableIndex}" data-goods-index="${index}"` : 'data-module-editor-action="remove-goods-row" data-goods-list="columns"'}>Loeschen</button>
    </div>`).join('');
}

function buildGoodsImageSelect(label, field, value, rowIndex, mode, tableIndex, options = []) {
  return `
    <label>
      <span>${escapeHtml(label)}</span>
      <select class="inline-edit-select ${mode === 'module' ? `me-goods-item-${field}` : ''}" ${mode === 'inline' ? `data-inline-action="update-goods-list-field" data-goods-list="goods" data-goods-table-index="${tableIndex}" data-goods-index="${rowIndex}" data-goods-field="${escapeHtml(field)}"` : ''}>
        ${options.map(option => `<option value="${escapeHtml(option.value)}"${String(value || '') === option.value ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}
      </select>
    </label>`;
}

function buildGoodsImageSizeInput(value, rowIndex, mode, tableIndex) {
  return `
    <label>
      <span>Icon-Groesse</span>
      <input class="inline-edit-input ${mode === 'module' ? 'me-goods-item-imageSize' : ''}" type="number" min="42" max="132" step="1" value="${escapeHtml(value || 72)}" ${mode === 'inline' ? `data-inline-action="update-goods-list-field" data-goods-list="goods" data-goods-table-index="${tableIndex}" data-goods-index="${rowIndex}" data-goods-field="imageSize"` : ''}>
    </label>`;
}

function buildGoodsItemDetailsEditor(item, rowIndex, mode, tableIndex) {
  const inlineAttrs = mode === 'inline'
    ? `data-inline-action="update-goods-list-field" data-goods-list="goods" data-goods-table-index="${tableIndex}" data-goods-index="${rowIndex}" data-goods-field="details"`
    : '';
  return `
    <div class="goods-row-details-editor ${mode === 'module' ? 'module-editor-field' : 'inline-edit-field'}">
      <span>Ausklappbare Produktbeschreibung</span>
      ${mode === 'module' ? buildTextFormatToolbar() : ''}
      <textarea class="inline-edit-textarea ${mode === 'module' ? 'me-goods-item-details' : ''}" placeholder="Ausfuehrliche Beschreibung, die beim Klick auf die Ware aufklappt." ${inlineAttrs}>${escapeHtml(item.details || '')}</textarea>
    </div>`;
}

function buildGoodsItemRows(items = [], columns = getDefaultGoodsColumns(), mode = 'module', tableIndex = 0) {
  const safeColumns = sanitizeGoodsColumns(columns);
  const rows = Array.isArray(items) ? items : [];
  return rows.map((item, index) => {
    const values = item.values || {};
    const rowIndex = Number.isInteger(item.__goodsIndex) ? item.__goodsIndex : index;
    return `
    <div class="goods-edit-row item dynamic ${mode === 'module' ? 'module-goods-item-row' : 'inline-goods-item-row'}">
      <div class="goods-row-meta">
        <input class="inline-edit-input ${mode === 'module' ? 'me-goods-item-image' : ''}" type="url" value="${escapeHtml(item.image || '')}" placeholder="Bild-URL" ${mode === 'inline' ? `data-inline-action="update-goods-list-field" data-goods-list="goods" data-goods-table-index="${tableIndex}" data-goods-index="${rowIndex}" data-goods-field="image"` : ''}>
        <input class="inline-edit-input ${mode === 'module' ? 'me-goods-item-category' : ''}" type="text" value="${escapeHtml(item.category || '')}" placeholder="Kategorie-ID" ${mode === 'inline' ? `data-inline-action="update-goods-list-field" data-goods-list="goods" data-goods-table-index="${tableIndex}" data-goods-index="${rowIndex}" data-goods-field="category"` : ''}>
        <button class="module-editor-mini-btn" type="button" ${mode === 'inline' ? `data-inline-action="import-goods-item" data-goods-table-index="${tableIndex}" data-goods-index="${rowIndex}"` : 'data-module-editor-action="import-goods-item"'}>Item laden</button>
        <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-goods-list-row" data-goods-list="goods" data-goods-table-index="${tableIndex}" data-goods-index="${rowIndex}"` : 'data-module-editor-action="remove-goods-row" data-goods-list="goods"'}>Loeschen</button>
      </div>
      <div class="goods-row-image-controls">
        ${buildGoodsImageSelect('Bildformat', 'imageFormat', item.imageFormat || 'landscape', rowIndex, mode, tableIndex, [
          { value: 'landscape', label: 'Querformat' },
          { value: 'portrait', label: 'Hochformat' },
          { value: 'square', label: 'Quadratisch' }
        ])}
        ${buildGoodsImageSelect('Bildfuelle', 'imageFit', item.imageFit || 'contain', rowIndex, mode, tableIndex, [
          { value: 'contain', label: 'Ganzes Bild' },
          { value: 'cover', label: 'Fuellen / croppen' }
        ])}
        ${buildGoodsImageSelect('Ausschnitt', 'imagePosition', item.imagePosition || 'center', rowIndex, mode, tableIndex, [
          { value: 'center', label: 'Mitte' },
          { value: 'top', label: 'Oben' },
          { value: 'bottom', label: 'Unten' },
          { value: 'left', label: 'Links' },
          { value: 'right', label: 'Rechts' }
        ])}
        ${buildGoodsImageSizeInput(item.imageSize || 72, rowIndex, mode, tableIndex)}
      </div>
      <div class="goods-row-cell-grid">
        ${safeColumns.map(column => `
          <label>
            <span>${escapeHtml(column.label)}</span>
            <input class="inline-edit-input ${mode === 'module' ? 'me-goods-cell' : ''}" type="text" value="${escapeHtml(values[column.id] || '')}" data-goods-column-id="${escapeHtml(column.id)}" placeholder="${escapeHtml(column.label)}" ${mode === 'inline' ? `data-inline-action="update-goods-list-field" data-goods-list="goods" data-goods-table-index="${tableIndex}" data-goods-index="${rowIndex}" data-goods-field="value" data-goods-column-id="${escapeHtml(column.id)}"` : ''}>
          </label>`).join('')}
      </div>
      ${buildGoodsItemDetailsEditor(item, rowIndex, mode, tableIndex)}
    </div>`;
  }).join('');
}

function createDefaultGoodsRowForCategory(columns = getDefaultGoodsColumns(), categoryId = 'allgemein') {
  const values = {};
  sanitizeGoodsColumns(columns).forEach(column => {
    values[column.id] = column.id === 'name' ? 'Neue Ware' : '';
  });
  return {
    image: '',
    imageFormat: 'landscape',
    imageFit: 'contain',
    imagePosition: 'center',
    imageSize: 72,
    category: categoryId || 'allgemein',
    details: '',
    values
  };
}

function normalizeGoodsImportKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[\u00e4]/g, 'ae')
    .replace(/[\u00f6]/g, 'oe')
    .replace(/[\u00fc]/g, 'ue')
    .replace(/[\u00df]/g, 'ss')
    .replace(/[^a-z0-9]+/g, '');
}

function findGoodsImportColumn(columns = [], candidates = []) {
  const safeColumns = sanitizeGoodsColumns(columns);
  const wanted = candidates.map(normalizeGoodsImportKey);
  return safeColumns.find(column => {
    const id = normalizeGoodsImportKey(column.id);
    const label = normalizeGoodsImportKey(column.label);
    return wanted.includes(id) || wanted.includes(label);
  }) || null;
}

function formatGoodsImportPrice(item = {}) {
  const price = String(item.price || '').trim();
  const currency = String(item.currency || '').trim();
  if (!price) return currency;
  if (!currency || normalizeGoodsImportKey(price).includes(normalizeGoodsImportKey(currency))) return price;
  return `${price} ${currency}`;
}

function setGoodsImportValue(values, column, value) {
  if (!column) return;
  values[column.id] = String(value || '').trim();
}

function createGoodsRowFromItemDbItem(item = {}, columns = getDefaultGoodsColumns(), categoryId = 'allgemein') {
  const safeColumns = sanitizeGoodsColumns(columns);
  const values = {};
  safeColumns.forEach(column => { values[column.id] = ''; });
  setGoodsImportValue(values, findGoodsImportColumn(safeColumns, ['name', 'titel', 'title']), item.title);
  setGoodsImportValue(values, findGoodsImportColumn(safeColumns, ['kind', 'art', 'typ', 'type']), item.type || item.categoryLabel);
  setGoodsImportValue(values, findGoodsImportColumn(safeColumns, ['description', 'beschreibung', 'text']), item.description || item.details);
  setGoodsImportValue(values, findGoodsImportColumn(safeColumns, ['price', 'preis', 'kosten']), formatGoodsImportPrice(item));
  setGoodsImportValue(values, findGoodsImportColumn(safeColumns, ['availability', 'verfuegbar', 'verfuegbarkeit', 'bestand']), item.hiddenMeta?.availability || item.availability);
  if (!Object.values(values).some(Boolean) && safeColumns[0]) values[safeColumns[0].id] = String(item.title || '').trim();
  return sanitizeGoodsRows([{
    image: item.image || '',
    imageFormat: 'landscape',
    imageFit: 'contain',
    imagePosition: 'center',
    imageSize: 72,
    category: categoryId || 'allgemein',
    details: item.details || item.description || '',
    values
  }], safeColumns)[0] || createDefaultGoodsRowForCategory(safeColumns, categoryId);
}

function setModuleGoodsRowField(row, selector, value) {
  const field = row?.querySelector(selector);
  if (!field) return;
  field.value = value ?? '';
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
}

function fillModuleGoodsRowFromItem(row, item = {}, columns = getDefaultGoodsColumns()) {
  if (!row) return;
  const currentCategory = getTrimmedFormValue(row, '.me-goods-item-category') || row.closest('.goods-category-editor')?.dataset.goodsCategory || 'allgemein';
  const imported = createGoodsRowFromItemDbItem(item, columns, currentCategory);
  setModuleGoodsRowField(row, '.me-goods-item-image', imported.image);
  setModuleGoodsRowField(row, '.me-goods-item-category', imported.category);
  setModuleGoodsRowField(row, '.me-goods-item-imageFormat', imported.imageFormat);
  setModuleGoodsRowField(row, '.me-goods-item-imageFit', imported.imageFit);
  setModuleGoodsRowField(row, '.me-goods-item-imagePosition', imported.imagePosition);
  setModuleGoodsRowField(row, '.me-goods-item-imageSize', imported.imageSize);
  row.querySelectorAll('.me-goods-cell').forEach(input => {
    const columnId = String(input.dataset.goodsColumnId || '').trim();
    input.value = imported.values?.[columnId] || '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  setModuleGoodsRowField(row, '.me-goods-item-details', imported.details);
}

function buildGoodsCategoryItemSections(table, mode = 'module', tableIndex = 0) {
  const safeTable = sanitizeGoodsTableBlock(table, tableIndex);
  return safeTable.categories.map(category => {
    const rows = safeTable.rows
      .map((row, rowIndex) => ({ ...row, __goodsIndex: rowIndex }))
      .filter(row => row.category === category.id);
    return `
      <section class="goods-category-editor" data-goods-category="${escapeHtml(category.id)}">
        <div class="goods-category-editor-head">
          <div>
            <strong>${escapeHtml(category.label)}</strong>
            <span>${escapeHtml(category.id)}</span>
          </div>
          <div class="module-editor-inline">
            <button class="module-editor-mini-btn" type="button" ${mode === 'inline' ? 'data-inline-action="import-goods-item"' : 'data-module-editor-action="import-goods-item"'} data-goods-table-index="${tableIndex}" data-goods-category="${escapeHtml(category.id)}">Item laden</button>
            <button class="module-editor-mini-btn" type="button" ${mode === 'inline' ? 'data-inline-action="add-goods-list-row"' : 'data-module-editor-action="add-goods-row"'} data-goods-list="goods" data-goods-table-index="${tableIndex}" data-goods-category="${escapeHtml(category.id)}">+ Ware</button>
          </div>
        </div>
        <div class="goods-edit-list goods-category-items">
          ${rows.length
            ? buildGoodsItemRows(rows, safeTable.columns, mode, tableIndex)
            : '<div class="inline-placeholder-note">Noch keine Waren in diesem Reiter.</div>'}
        </div>
      </section>`;
  }).join('');
}

function buildGoodsInfoRowsEditor(rows = [], mode = 'module') {
  const items = Array.isArray(rows) && rows.length ? rows : [{ icon: '', label: '', value: '' }];
  return items.map((item, index) => `
    <div class="goods-edit-row info ${mode === 'module' ? 'module-goods-info-row' : 'inline-goods-info-row'}">
      <input class="inline-edit-input ${mode === 'module' ? 'me-goods-info-icon' : ''}" type="text" value="${escapeHtml(item.icon || '')}" placeholder="Icon/Bild" ${mode === 'inline' ? `data-inline-action="update-goods-list-field" data-goods-list="infoRows" data-goods-index="${index}" data-goods-field="icon"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-goods-info-label' : ''}" type="text" value="${escapeHtml(item.label || '')}" placeholder="Label" ${mode === 'inline' ? `data-inline-action="update-goods-list-field" data-goods-list="infoRows" data-goods-index="${index}" data-goods-field="label"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-goods-info-value' : ''}" type="text" value="${escapeHtml(item.value || '')}" placeholder="Wert" ${mode === 'inline' ? `data-inline-action="update-goods-list-field" data-goods-list="infoRows" data-goods-index="${index}" data-goods-field="value"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-goods-list-row" data-goods-list="infoRows" data-goods-index="${index}"` : 'data-module-editor-action="remove-goods-row"'}>Loeschen</button>
    </div>`).join('');
}

function buildGoodsOfferRows(offers = [], mode = 'module') {
  const rows = Array.isArray(offers) && offers.length ? offers : [{ image: '', name: '', price: '' }];
  return rows.map((item, index) => `
    <div class="goods-edit-row offer ${mode === 'module' ? 'module-goods-offer-row' : 'inline-goods-offer-row'}">
      <input class="inline-edit-input ${mode === 'module' ? 'me-goods-offer-image' : ''}" type="url" value="${escapeHtml(item.image || '')}" placeholder="Bild-URL" ${mode === 'inline' ? `data-inline-action="update-goods-list-field" data-goods-list="offers" data-goods-index="${index}" data-goods-field="image"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-goods-offer-name' : ''}" type="text" value="${escapeHtml(item.name || '')}" placeholder="Name" ${mode === 'inline' ? `data-inline-action="update-goods-list-field" data-goods-list="offers" data-goods-index="${index}" data-goods-field="name"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-goods-offer-price' : ''}" type="text" value="${escapeHtml(item.price || '')}" placeholder="Preis" ${mode === 'inline' ? `data-inline-action="update-goods-list-field" data-goods-list="offers" data-goods-index="${index}" data-goods-field="price"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-goods-list-row" data-goods-list="offers" data-goods-index="${index}"` : 'data-module-editor-action="remove-goods-row"'}>Loeschen</button>
    </div>`).join('');
}

function createDefaultGoodsEditorTable(index = 0) {
  return sanitizeGoodsTableBlock({
    id: `tabelle-${index + 1}`,
    title: `Tabelle ${index + 1}`,
    tableTitle: 'Alle Waren',
    categories: [{ id: 'allgemein', label: 'Allgemein' }],
    columns: getDefaultGoodsColumns(),
    rows: []
  }, index);
}

function buildGoodsTableEditor(table, index, mode = 'module') {
  const safeTable = sanitizeGoodsTableBlock(table, index);
  const action = mode === 'inline' ? 'data-inline-action' : 'data-module-editor-action';
  const addAction = mode === 'inline' ? 'add-goods-list-row' : 'add-goods-row';
  const removeAction = mode === 'inline' ? 'remove-goods-list-row' : 'remove-goods-row';
  const tableAttrs = `data-goods-list="tables" data-goods-index="${index}"`;
  return `
    <section class="goods-table-editor ${mode === 'module' ? 'module-goods-table-editor' : 'inline-goods-table-editor'}" data-goods-table-index="${index}">
      <div class="goods-table-editor-head">
        <div>
          <div class="module-editor-kicker">Tabelle ${index + 1}</div>
          <input class="inline-edit-input ${mode === 'module' ? 'me-goods-table-id' : ''}" type="text" value="${escapeHtml(safeTable.id)}" placeholder="tabellen-id" ${mode === 'inline' ? `data-inline-action="update-goods-list-field" data-goods-list="tables" data-goods-index="${index}" data-goods-field="id"` : ''}>
        </div>
        <button class="module-editor-mini-btn module-editor-danger" type="button" ${action}="${removeAction}" ${tableAttrs}>Tabelle loeschen</button>
      </div>
      <div class="goods-table-editor-grid">
        <label>
          <span>Titel ueber der Tabelle</span>
          <input class="inline-edit-input ${mode === 'module' ? 'me-goods-table-heading' : ''}" type="text" value="${escapeHtml(safeTable.title)}" ${mode === 'inline' ? `data-inline-action="update-goods-list-field" data-goods-list="tables" data-goods-index="${index}" data-goods-field="title"` : ''}>
        </label>
        <label>
          <span>Alle-Reiter</span>
          <input class="inline-edit-input ${mode === 'module' ? 'me-goods-table-all-label' : ''}" type="text" value="${escapeHtml(safeTable.tableTitle)}" ${mode === 'inline' ? `data-inline-action="update-goods-list-field" data-goods-list="tables" data-goods-index="${index}" data-goods-field="tableTitle"` : ''}>
        </label>
      </div>

      <div class="goods-nested-editor">
        <div class="module-editor-inline" style="justify-content:space-between;">
          <label>Reiter / Filter dieser Tabelle</label>
          <button class="module-editor-mini-btn" type="button" ${action}="${addAction}" data-goods-list="categories" data-goods-table-index="${index}">+ Reiter</button>
        </div>
        <div class="goods-edit-list module-goods-categories inline-goods-categories">${buildGoodsCategoryRows(safeTable.categories, mode, index)}</div>
      </div>

      <div class="goods-nested-editor">
        <div class="module-editor-inline" style="justify-content:space-between;">
          <label>Spalten dieser Tabelle</label>
          <button class="module-editor-mini-btn" type="button" ${action}="${addAction}" data-goods-list="columns" data-goods-table-index="${index}">+ Spalte</button>
        </div>
        <div class="module-editor-help">Die Spalten-ID bleibt kurz und technisch, der Spaltenname ist sichtbar. Beispiel: preis / Preis.</div>
        <div class="goods-edit-list module-goods-columns inline-goods-columns">${buildGoodsColumnRows(safeTable.columns, mode, index)}</div>
      </div>

      <div class="goods-nested-editor">
        <div class="module-editor-inline" style="justify-content:space-between;">
          <label>Waren / Dienste nach Reiter</label>
        </div>
        <div class="module-editor-help">Fuege Waren direkt im passenden Reiter hinzu. Die Zuordnung bleibt in der Warenzeile sichtbar und kann bei Bedarf geaendert werden.</div>
        <div class="module-goods-items inline-goods-items">${buildGoodsCategoryItemSections(safeTable, mode, index)}</div>
      </div>
    </section>`;
}

function getModuleGoodsListDefinition(button, listName) {
  const tableEditor = button.closest('.goods-table-editor');
  const tableIndex = Number(tableEditor?.dataset.goodsTableIndex || 0);
  const currentColumns = tableEditor ? collectModuleGoodsColumns(tableEditor) : getDefaultGoodsColumns();
  const categoryId = String(button.dataset.goodsCategory || '').trim() || 'allgemein';
  const nextCategoryIndex = (tableEditor?.querySelectorAll('.module-goods-category-row').length || 0) + 1;
  const nextCategoryId = `reiter-${nextCategoryIndex}`;
  const map = {
    tables: { selector: '.module-goods-tables', row: wrap => buildGoodsTableEditor(createDefaultGoodsEditorTable(wrap.querySelectorAll('.module-goods-table-editor').length), wrap.querySelectorAll('.module-goods-table-editor').length, 'module') },
    categories: { selector: '.module-goods-categories', row: () => buildGoodsCategoryRows([{ id: nextCategoryId, label: `Reiter ${nextCategoryIndex}` }], 'module', tableIndex) },
    columns: { selector: '.module-goods-columns', row: () => buildGoodsColumnRows([{ id: 'neue-spalte', label: 'Neue Spalte' }], 'module', tableIndex) },
    goods: { selector: '.module-goods-items', row: () => buildGoodsItemRows([createDefaultGoodsRowForCategory(currentColumns, categoryId)], currentColumns, 'module', tableIndex) },
    infoRows: { selector: '.module-goods-info-rows', row: () => buildGoodsInfoRowsEditor([{ icon: '*', label: 'Neuer Punkt', value: '' }], 'module') },
    offers: { selector: '.module-goods-offers', row: () => buildGoodsOfferRows([{ image: '', name: 'Neues Angebot', price: '' }], 'module') }
  };
  return map[listName] || null;
}

function addModuleGoodsRow(button, listName) {
  const pageCard = button.closest('.module-page-card');
  const tableEditor = button.closest('.goods-table-editor');
  const definition = getModuleGoodsListDefinition(button, listName);
  const scope = listName === 'tables' ? pageCard : tableEditor || pageCard;
  const categoryWrap = listName === 'goods'
    ? button.closest('.goods-category-editor')?.querySelector('.goods-category-items')
    : null;
  const wrap = categoryWrap || (definition ? scope?.querySelector(definition.selector) : null);
  if (!wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', definition.row(wrap));
  hydrateModuleRichEditors(wrap.lastElementChild || wrap);
  if (listName === 'categories' && tableEditor) {
    const categoryRows = tableEditor.querySelectorAll('.module-goods-category-row');
    const latestCategoryRow = categoryRows[categoryRows.length - 1];
    const id = getTrimmedFormValue(latestCategoryRow, '.me-goods-category-id') || 'allgemein';
    const label = getTrimmedFormValue(latestCategoryRow, '.me-goods-category-label') || id;
    const itemsWrap = tableEditor.querySelector('.module-goods-items');
    itemsWrap?.insertAdjacentHTML('beforeend', buildGoodsCategoryItemSections({
      categories: [{ id, label }],
      columns: collectModuleGoodsColumns(tableEditor),
      rows: []
    }, 'module', Number(tableEditor.dataset.goodsTableIndex || 0)));
  }
  syncModuleJsonPreview();
}

function importModuleGoodsItem(button) {
  if (typeof openItemDbPicker !== 'function') {
    if (typeof setModuleEditorStatus === 'function') setModuleEditorStatus('Itemdatenbank-Picker ist nicht geladen.', true);
    return;
  }
  const tableEditor = button.closest('.goods-table-editor');
  const itemRow = button.closest('.module-goods-item-row');
  const categoryEditor = button.closest('.goods-category-editor');
  const categoryId = String(button.dataset.goodsCategory || categoryEditor?.dataset.goodsCategory || '').trim() || 'allgemein';
  const wrap = categoryEditor?.querySelector('.goods-category-items');
  if (!tableEditor) return;
  openItemDbPicker({
    title: 'Ware aus Itemdatenbank laden',
    onSelect: item => {
      const columns = collectModuleGoodsColumns(tableEditor);
      if (itemRow) {
        fillModuleGoodsRowFromItem(itemRow, item, columns);
        syncModuleJsonPreview();
        if (typeof setModuleEditorStatus === 'function') setModuleEditorStatus(`Ware "${item.title}" eingefuegt.`);
        return;
      }
      if (!wrap) return;
      const row = createGoodsRowFromItemDbItem(item, columns, categoryId);
      wrap.querySelector('.inline-placeholder-note')?.remove();
      wrap.insertAdjacentHTML('beforeend', buildGoodsItemRows([row], columns, 'module', Number(tableEditor.dataset.goodsTableIndex || 0)));
      hydrateModuleRichEditors(wrap.lastElementChild || wrap);
      syncModuleJsonPreview();
      if (typeof setModuleEditorStatus === 'function') setModuleEditorStatus(`Ware "${item.title}" geladen.`);
    }
  });
}

function reassignGoodsFromRemovedCategory(categoryRow) {
  const tableEditor = categoryRow.closest('.goods-table-editor');
  if (!tableEditor) return;
  const removedId = getTrimmedFormValue(categoryRow, '.me-goods-category-id') || categoryRow.dataset.goodsCategory || '';
  const remainingRows = Array.from(tableEditor.querySelectorAll('.module-goods-category-row'))
    .filter(row => row !== categoryRow);
  const fallbackRow = remainingRows[0];
  const fallbackId = fallbackRow
    ? getTrimmedFormValue(fallbackRow, '.me-goods-category-id') || fallbackRow.dataset.goodsCategory || 'allgemein'
    : 'allgemein';
  const findSection = id => Array.from(tableEditor.querySelectorAll('.goods-category-editor'))
    .find(section => section.dataset.goodsCategory === id);
  let fallbackSection = findSection(fallbackId);
  if (!fallbackSection) {
    const itemsWrap = tableEditor.querySelector('.module-goods-items');
    itemsWrap?.insertAdjacentHTML('beforeend', buildGoodsCategoryItemSections({
      categories: [{ id: fallbackId, label: fallbackId }],
      columns: collectModuleGoodsColumns(tableEditor),
      rows: []
    }, 'module', Number(tableEditor.dataset.goodsTableIndex || 0)));
    fallbackSection = findSection(fallbackId);
  }
  const targetList = fallbackSection?.querySelector('.goods-category-items');
  const removedSection = findSection(removedId);
  if (!targetList || !removedSection) return;
  targetList.querySelector('.inline-placeholder-note')?.remove();
  removedSection.querySelectorAll('.module-goods-item-row').forEach(row => {
    const categoryInput = row.querySelector('.me-goods-item-category');
    if (categoryInput) categoryInput.value = fallbackId;
    targetList.appendChild(row);
  });
  removedSection.remove();
}

function removeModuleGoodsRow(button) {
  const target = button.dataset.goodsList === 'tables'
    ? button.closest('.goods-table-editor')
    : button.closest('.goods-edit-row') || button.closest('.goods-table-editor');
  if (!target) return;
  if (button.dataset.goodsList === 'categories' && target.classList.contains('module-goods-category-row')) {
    reassignGoodsFromRemovedCategory(target);
  }
  const wrap = target.parentElement;
  target.remove();
  if (wrap && !wrap.querySelector('.goods-table-editor, .goods-edit-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Eintraege vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function collectModuleGoodsCategories(tableEditor) {
  return Array.from(tableEditor.querySelector('.module-goods-categories')?.querySelectorAll('.module-goods-category-row') || []).map(row => ({
    id: getTrimmedFormValue(row, '.me-goods-category-id'),
    label: getTrimmedFormValue(row, '.me-goods-category-label')
  }));
}

function collectModuleGoodsColumns(tableEditor) {
  return Array.from(tableEditor.querySelector('.module-goods-columns')?.querySelectorAll('.module-goods-column-row') || []).map(row => ({
    id: getTrimmedFormValue(row, '.me-goods-column-id'),
    label: getTrimmedFormValue(row, '.me-goods-column-label')
  }));
}

function collectModuleGoodsItems(tableEditor) {
  return Array.from(tableEditor.querySelector('.module-goods-items')?.querySelectorAll('.module-goods-item-row') || []).map(row => {
    const values = {};
    row.querySelectorAll('.me-goods-cell').forEach(input => {
      const columnId = String(input.dataset.goodsColumnId || '').trim();
      if (columnId) values[columnId] = String(input.value || '').trim();
    });
    return {
      image: getTrimmedFormValue(row, '.me-goods-item-image'),
      imageFormat: getTrimmedFormValue(row, '.me-goods-item-imageFormat'),
      imageFit: getTrimmedFormValue(row, '.me-goods-item-imageFit'),
      imagePosition: getTrimmedFormValue(row, '.me-goods-item-imagePosition'),
      imageSize: getTrimmedFormValue(row, '.me-goods-item-imageSize'),
      category: getTrimmedFormValue(row, '.me-goods-item-category'),
      details: getTrimmedFormValue(row, '.me-goods-item-details'),
      values
    };
  });
}

function collectModuleGoodsTables(card) {
  return Array.from(card.querySelectorAll('.module-goods-table-editor')).map((tableEditor, index) => ({
    id: getTrimmedFormValue(tableEditor, '.me-goods-table-id') || `tabelle-${index + 1}`,
    title: getTrimmedFormValue(tableEditor, '.me-goods-table-heading'),
    tableTitle: getTrimmedFormValue(tableEditor, '.me-goods-table-all-label'),
    categories: collectModuleGoodsCategories(tableEditor),
    columns: collectModuleGoodsColumns(tableEditor),
    rows: collectModuleGoodsItems(tableEditor)
  }));
}

function collectModuleGoodsInfoRows(card) {
  return Array.from(card.querySelectorAll('.module-goods-info-row')).map(row => ({
    icon: getTrimmedFormValue(row, '.me-goods-info-icon'),
    label: getTrimmedFormValue(row, '.me-goods-info-label'),
    value: getTrimmedFormValue(row, '.me-goods-info-value')
  }));
}

function collectModuleGoodsOffers(card) {
  return Array.from(card.querySelectorAll('.module-goods-offer-row')).map(row => ({
    image: getTrimmedFormValue(row, '.me-goods-offer-image'),
    name: getTrimmedFormValue(row, '.me-goods-offer-name'),
    price: getTrimmedFormValue(row, '.me-goods-offer-price')
  }));
}

function buildGoodsModuleEditorFields(page) {
  const goods = sanitizeGoodsTableData(page?.goodsTable || {});
  return `
    <div class="module-page-type-block${inferModulePageType(page) === 'goods' ? ' visible' : ''}" data-page-type="goods">
      <div class="module-editor-grid">
        <div class="module-editor-field">
          <label>Titel</label>
          <input class="me-goods-title" type="text" value="${escapeHtml(goods.title)}">
        </div>
        <div class="module-editor-field">
          <label>Untertitel</label>
          <input class="me-goods-subtitle" type="text" value="${escapeHtml(goods.subtitle)}">
        </div>
        <div class="module-editor-field">
          <label>Ort / Kopfzeile</label>
          <input class="me-goods-location" type="text" value="${escapeHtml(goods.location)}">
        </div>
        <div class="module-editor-field">
          <label>Kopf-Icon</label>
          <input class="me-goods-header-icon" type="url" value="${escapeHtml(goods.headerIcon)}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="module-editor-field">
          <label>Muenze / Preis-Icon</label>
          <input class="me-goods-coin-icon" type="url" value="${escapeHtml(goods.coinIcon)}" placeholder="https://i.imgur.com/...">
        </div>

        <div class="module-editor-field wide">
          <div class="module-editor-inline" style="justify-content:space-between;">
            <label>Tabellen</label>
            <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-goods-row" data-goods-list="tables">+ Tabelle</button>
          </div>
          <div class="goods-table-editor-list module-goods-tables">
            ${goods.tables.map((table, index) => buildGoodsTableEditor(table, index, 'module')).join('')}
          </div>
        </div>

        <div class="module-editor-field">
          <label>Infobox-Ueberschrift</label>
          <input class="me-goods-side-title" type="text" value="${escapeHtml(goods.sideTitle)}">
        </div>
        <div class="module-editor-field">
          <label>Infobox-Name</label>
          <input class="me-goods-side-name" type="text" value="${escapeHtml(goods.sideName)}">
        </div>
        <div class="module-editor-field wide">
          <label>Infobox-Bild</label>
          <input class="me-goods-side-image" type="url" value="${escapeHtml(goods.sideImage)}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="module-editor-field wide">
          <label>Infobox-Text</label>
          <textarea class="me-goods-side-text">${escapeHtml(goods.sideText)}</textarea>
        </div>
        <div class="module-editor-field wide">
          <div class="module-editor-inline" style="justify-content:space-between;">
            <label>Infodetails</label>
            <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-goods-row" data-goods-list="infoRows">+ Detail</button>
          </div>
          <div class="goods-edit-list module-goods-info-rows">${buildGoodsInfoRowsEditor(goods.infoRows, 'module')}</div>
        </div>

        <div class="module-editor-field">
          <label>Angebote-Ueberschrift</label>
          <input class="me-goods-offer-title" type="text" value="${escapeHtml(goods.offerTitle)}">
        </div>
        <div class="module-editor-field">
          <label>Angebote-Meta</label>
          <input class="me-goods-offer-meta" type="text" value="${escapeHtml(goods.offerMeta)}">
        </div>
        <div class="module-editor-field wide">
          <div class="module-editor-inline" style="justify-content:space-between;">
            <label>Angebote</label>
            <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-goods-row" data-goods-list="offers">+ Angebot</button>
          </div>
          <div class="goods-edit-list module-goods-offers">${buildGoodsOfferRows(goods.offers, 'module')}</div>
        </div>

        <div class="module-editor-field">
          <label>Hinweis-Ueberschrift</label>
          <input class="me-goods-note-title" type="text" value="${escapeHtml(goods.noteTitle)}">
        </div>
        <div class="module-editor-field">
          <label>Fusszeile</label>
          <input class="me-goods-footer" type="text" value="${escapeHtml(goods.footer)}">
        </div>
        <div class="module-editor-field wide">
          <label>Hinweistext</label>
          <textarea class="me-goods-note-text">${escapeHtml(goods.noteText)}</textarea>
        </div>
      </div>
    </div>`;
}

function collectGoodsModuleEditorPage(card, page) {
  const block = card.querySelector('[data-page-type="goods"]') || card;
  page.goodsTablePage = true;
  page.goodsTable = sanitizeGoodsTableData({
    title: getTrimmedFormValue(block, '.me-goods-title'),
    subtitle: getTrimmedFormValue(block, '.me-goods-subtitle'),
    location: getTrimmedFormValue(block, '.me-goods-location'),
    headerIcon: getTrimmedFormValue(block, '.me-goods-header-icon'),
    coinIcon: getTrimmedFormValue(block, '.me-goods-coin-icon'),
    tables: collectModuleGoodsTables(block),
    sideTitle: getTrimmedFormValue(block, '.me-goods-side-title'),
    sideImage: getTrimmedFormValue(block, '.me-goods-side-image'),
    sideName: getTrimmedFormValue(block, '.me-goods-side-name'),
    sideText: getTrimmedFormValue(block, '.me-goods-side-text'),
    infoRows: collectModuleGoodsInfoRows(block),
    offerTitle: getTrimmedFormValue(block, '.me-goods-offer-title'),
    offerMeta: getTrimmedFormValue(block, '.me-goods-offer-meta'),
    offers: collectModuleGoodsOffers(block),
    noteTitle: getTrimmedFormValue(block, '.me-goods-note-title'),
    noteText: getTrimmedFormValue(block, '.me-goods-note-text'),
    footer: getTrimmedFormValue(block, '.me-goods-footer')
  });
  return page;
}
