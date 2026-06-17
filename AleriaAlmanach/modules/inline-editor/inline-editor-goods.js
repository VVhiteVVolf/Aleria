function getInlineGoodsDataForEdit(page) {
  return sanitizeGoodsTableData(page?.goodsTable || {});
}

function updateInlineGoodsField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const field = input.dataset.goodsField;
  if (!field) return;
  const current = getInlineGoodsDataForEdit(page);
  current[field] = input.value;
  page.goodsTable = sanitizeGoodsTableData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function updateInlineGoodsListField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const listName = input.dataset.goodsList;
  const field = input.dataset.goodsField;
  const index = Number(input.dataset.goodsIndex || -1);
  const tableIndex = Number(input.dataset.goodsTableIndex || -1);
  if (!listName || !field || index < 0) return;

  const current = getInlineGoodsDataForEdit(page);
  if (listName === 'tables') {
    const table = { ...(current.tables[index] || createDefaultGoodsEditorTable(index)) };
    table[field] = input.value;
    current.tables[index] = table;
    page.goodsTable = sanitizeGoodsTableData(current);
    scheduleInlineModuleLivePreviewRefresh();
    return;
  }

  if (tableIndex >= 0 && current.tables[tableIndex]) {
    const table = { ...current.tables[tableIndex] };
    const tableListName = listName === 'goods' ? 'rows' : listName;
    const list = Array.isArray(table[tableListName]) ? [...table[tableListName]] : [];
    const item = { ...(list[index] || {}) };
    if (listName === 'goods' && field === 'value') {
      item.values = { ...(item.values || {}) };
      item.values[input.dataset.goodsColumnId || ''] = input.value;
    } else {
      item[field] = input.value;
    }
    list[index] = item;
    table[tableListName] = list;
    current.tables[tableIndex] = table;
    page.goodsTable = sanitizeGoodsTableData(current);
    scheduleInlineModuleLivePreviewRefresh();
    return;
  }

  const list = Array.isArray(current[listName]) ? [...current[listName]] : [];
  const item = { ...(list[index] || {}) };
  item[field] = input.value;
  list[index] = item;
  current[listName] = list;
  page.goodsTable = sanitizeGoodsTableData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function getInlineGoodsDefaultRow(listName, table = null, nextIndex = 0, categoryId = 'allgemein') {
  if (listName === 'tables') return createDefaultGoodsEditorTable(nextIndex);
  if (listName === 'categories') return { id: 'neuer-reiter', label: 'Neuer Reiter' };
  if (listName === 'columns') return { id: 'neue-spalte', label: 'Neue Spalte' };
  if (listName === 'goods') {
    const values = {};
    (table?.columns || getDefaultGoodsColumns()).forEach(column => {
      values[column.id] = column.id === 'name' ? 'Neue Ware' : '';
    });
    return { image: '', category: categoryId || 'allgemein', values };
  }
  if (listName === 'infoRows') return { icon: '*', label: 'Neuer Punkt', value: '' };
  if (listName === 'offers') return { image: '', name: 'Neues Angebot', price: '' };
  return {};
}

function addInlineGoodsListRow(listName, source = null) {
  const page = getInlineDraftPage();
  if (!page || !listName) return;
  const current = getInlineGoodsDataForEdit(page);
  const tableIndex = Number(source?.dataset?.goodsTableIndex || -1);
  const categoryId = String(source?.dataset?.goodsCategory || '').trim() || 'allgemein';

  if (listName === 'tables') {
    current.tables.push(getInlineGoodsDefaultRow('tables', null, current.tables.length));
    page.goodsTable = sanitizeGoodsTableData(current);
    renderPage(currentPage, 0);
    return;
  }

  if (tableIndex >= 0 && current.tables[tableIndex]) {
    const table = { ...current.tables[tableIndex] };
    const tableListName = listName === 'goods' ? 'rows' : listName;
    const list = Array.isArray(table[tableListName]) ? [...table[tableListName]] : [];
    list.push(getInlineGoodsDefaultRow(listName, table, list.length, categoryId));
    table[tableListName] = list;
    current.tables[tableIndex] = table;
    page.goodsTable = sanitizeGoodsTableData(current);
    renderPage(currentPage, 0);
    return;
  }

  const list = Array.isArray(current[listName]) ? [...current[listName]] : [];
  list.push(getInlineGoodsDefaultRow(listName, null, list.length));
  current[listName] = list;
  page.goodsTable = sanitizeGoodsTableData(current);
  renderPage(currentPage, 0);
}

function removeInlineGoodsListRow(listName, index, source = null) {
  const page = getInlineDraftPage();
  if (!page || !listName) return;
  const current = getInlineGoodsDataForEdit(page);
  const tableIndex = Number(source?.dataset?.goodsTableIndex || -1);

  if (listName === 'tables') {
    current.tables.splice(index, 1);
    page.goodsTable = sanitizeGoodsTableData(current);
    renderPage(currentPage, 0);
    return;
  }

  if (tableIndex >= 0 && current.tables[tableIndex]) {
    const table = { ...current.tables[tableIndex] };
    const tableListName = listName === 'goods' ? 'rows' : listName;
    const list = Array.isArray(table[tableListName]) ? [...table[tableListName]] : [];
    const removedItem = list[index];
    list.splice(index, 1);
    table[tableListName] = list;
    if (listName === 'categories') {
      const removedId = String(removedItem?.id || '').trim();
      const fallbackId = String(list[0]?.id || 'allgemein').trim();
      table.rows = (Array.isArray(table.rows) ? table.rows : []).map(row => ({
        ...row,
        category: row.category === removedId ? fallbackId : row.category
      }));
    }
    current.tables[tableIndex] = table;
    page.goodsTable = sanitizeGoodsTableData(current);
    renderPage(currentPage, 0);
    return;
  }

  const list = Array.isArray(current[listName]) ? [...current[listName]] : [];
  list.splice(index, 1);
  current[listName] = list;
  page.goodsTable = sanitizeGoodsTableData(current);
  renderPage(currentPage, 0);
}

function buildInlineGoodsField(label, field, value, type = 'text', wide = false) {
  return `
    <div class="inline-edit-field${wide ? ' wide' : ''}">
      <span class="inline-edit-label">${escapeHtml(label)}</span>
      <input class="inline-edit-input" type="${escapeHtml(type)}" data-inline-action="update-goods-field" data-goods-field="${escapeHtml(field)}" value="${escapeHtml(value || '')}">
    </div>`;
}

function buildInlineGoodsTextArea(label, field, value) {
  return `
    <div class="inline-edit-field wide">
      <span class="inline-edit-label">${escapeHtml(label)}</span>
      <textarea class="inline-edit-textarea" data-inline-action="update-goods-field" data-goods-field="${escapeHtml(field)}">${escapeHtml(value || '')}</textarea>
    </div>`;
}

function buildInlineGoodsListSection(listName, label, rowsHtml, addLabel) {
  return `
    <div class="inline-edit-field wide">
      <div class="inline-edit-head">
        <span class="inline-edit-label">${escapeHtml(label)}</span>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-goods-list-row" data-goods-list="${escapeHtml(listName)}">+ ${escapeHtml(addLabel)}</button>
      </div>
      <div class="goods-edit-list">${rowsHtml}</div>
    </div>`;
}

function buildInlineGoodsEditor(page) {
  const goods = sanitizeGoodsTableData(page.goodsTable || {});
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Warenverzeichnis</div>
      <div class="inline-edit-grid">
        ${buildInlineGoodsField('Titel', 'title', goods.title)}
        ${buildInlineGoodsField('Untertitel', 'subtitle', goods.subtitle)}
        ${buildInlineGoodsField('Ort / Kopfzeile', 'location', goods.location)}
        ${buildInlineGoodsField('Kopf-Icon', 'headerIcon', goods.headerIcon, 'url')}
        ${buildInlineGoodsField('Muenze / Preis-Icon', 'coinIcon', goods.coinIcon, 'url')}
        <div class="inline-edit-field wide">
          <div class="inline-edit-head">
            <span class="inline-edit-label">Tabellen</span>
            <button class="module-editor-mini-btn" type="button" data-inline-action="add-goods-list-row" data-goods-list="tables">+ Tabelle</button>
          </div>
          <div class="goods-table-editor-list">
            ${goods.tables.map((table, index) => buildGoodsTableEditor(table, index, 'inline')).join('')}
          </div>
        </div>
        ${buildInlineGoodsField('Infobox-Ueberschrift', 'sideTitle', goods.sideTitle)}
        ${buildInlineGoodsField('Infobox-Name', 'sideName', goods.sideName)}
        ${buildInlineGoodsField('Infobox-Bild', 'sideImage', goods.sideImage, 'url', true)}
        ${buildInlineGoodsTextArea('Infobox-Text', 'sideText', goods.sideText)}
        ${buildInlineGoodsListSection('infoRows', 'Infodetails', buildGoodsInfoRowsEditor(goods.infoRows, 'inline'), 'Detail')}
        ${buildInlineGoodsField('Angebote-Ueberschrift', 'offerTitle', goods.offerTitle)}
        ${buildInlineGoodsField('Angebote-Meta', 'offerMeta', goods.offerMeta)}
        ${buildInlineGoodsListSection('offers', 'Angebote', buildGoodsOfferRows(goods.offers, 'inline'), 'Angebot')}
        ${buildInlineGoodsField('Hinweis-Ueberschrift', 'noteTitle', goods.noteTitle)}
        ${buildInlineGoodsField('Fusszeile', 'footer', goods.footer)}
        ${buildInlineGoodsTextArea('Hinweistext', 'noteText', goods.noteText)}
      </div>
    </div>`;
}
