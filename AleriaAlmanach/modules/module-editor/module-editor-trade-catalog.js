function getTradeCatalogAttributeStamp() {
  return window._tradeCatalogAttributeStamp || null;
}

function setTradeCatalogAttributeStamp(stamp) {
  window._tradeCatalogAttributeStamp = {
    attributesTitle: String(stamp?.attributesTitle || 'Attribute').trim() || 'Attribute',
    attributes: sanitizeTradeCatalogAttributeRows(stamp?.attributes || [])
  };
}

function buildTradeCatalogCategoryRows(categories = [], mode = 'module') {
  return (Array.isArray(categories) ? categories : []).map((category, index) => `
    <div class="trade-editor-row category ${mode === 'module' ? 'module-trade-category-row' : 'inline-trade-category-row'}">
      <input class="inline-edit-input ${mode === 'module' ? 'me-trade-category-id' : ''}" type="text" value="${escapeHtml(category.id || '')}" placeholder="id" ${mode === 'inline' ? `data-inline-action="update-trade-list-field" data-trade-list="categories" data-trade-index="${index}" data-trade-field="id"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-trade-category-label' : ''}" type="text" value="${escapeHtml(category.label || '')}" placeholder="Label" ${mode === 'inline' ? `data-inline-action="update-trade-list-field" data-trade-list="categories" data-trade-index="${index}" data-trade-field="label"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-trade-list-row" data-trade-list="categories" data-trade-index="${index}"` : 'data-module-editor-action="remove-trade-row" data-trade-list="categories"'}>Loeschen</button>
    </div>`).join('');
}

function buildTradeCatalogSelect(label, field, value, index, mode, options = []) {
  return `
    <label>
      <span>${escapeHtml(label)}</span>
      <select class="inline-edit-select ${mode === 'module' ? `me-trade-item-${field}` : ''}" ${mode === 'inline' ? `data-inline-action="update-trade-list-field" data-trade-list="items" data-trade-index="${index}" data-trade-field="${escapeHtml(field)}"` : ''}>
        ${options.map(option => `<option value="${escapeHtml(option.value)}"${String(value || '') === option.value ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}
      </select>
    </label>`;
}

function buildTradeCatalogInput(label, field, value, index, mode, type = 'text') {
  return `
    <label>
      <span>${escapeHtml(label)}</span>
      <input class="inline-edit-input ${mode === 'module' ? `me-trade-item-${field}` : ''}" type="${escapeHtml(type)}" value="${escapeHtml(value || '')}" ${mode === 'inline' ? `data-inline-action="update-trade-list-field" data-trade-list="items" data-trade-index="${index}" data-trade-field="${escapeHtml(field)}"` : ''}>
    </label>`;
}

function buildTradeCatalogTextarea(label, field, value, index, mode) {
  return `
    <label class="wide">
      <span>${escapeHtml(label)}</span>
      <textarea class="inline-edit-textarea ${mode === 'module' ? `me-trade-item-${field}` : ''}" ${mode === 'inline' ? `data-inline-action="update-trade-list-field" data-trade-list="items" data-trade-index="${index}" data-trade-field="${escapeHtml(field)}"` : ''}>${escapeHtml(value || '')}</textarea>
    </label>`;
}

function buildTradeCatalogFeatureRows(features = [], itemIndex = 0, mode = 'module') {
  return (Array.isArray(features) ? features : []).map((feature, featureIndex) => `
    <div class="trade-editor-row feature ${mode === 'module' ? 'module-trade-feature-row' : 'inline-trade-feature-row'}">
      <input class="inline-edit-input ${mode === 'module' ? 'me-trade-feature-icon' : ''}" type="text" value="${escapeHtml(feature.icon || '')}" placeholder="Icon oder Bild-URL" ${mode === 'inline' ? `data-inline-action="update-trade-list-field" data-trade-list="features" data-trade-index="${itemIndex}" data-trade-feature-index="${featureIndex}" data-trade-field="icon"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-trade-feature-text' : ''}" type="text" value="${escapeHtml(feature.text || '')}" placeholder="Eigenschaft" ${mode === 'inline' ? `data-inline-action="update-trade-list-field" data-trade-list="features" data-trade-index="${itemIndex}" data-trade-feature-index="${featureIndex}" data-trade-field="text"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-trade-list-row" data-trade-list="features" data-trade-index="${itemIndex}" data-trade-feature-index="${featureIndex}"` : 'data-module-editor-action="remove-trade-row" data-trade-list="features"'}>Loeschen</button>
    </div>`).join('');
}

function buildTradeCatalogAttributeRows(attributes = [], itemIndex = 0, mode = 'module') {
  return (Array.isArray(attributes) ? attributes : []).map((attribute, attributeIndex) => `
    <div class="trade-editor-row attribute ${mode === 'module' ? 'module-trade-attribute-row' : 'inline-trade-attribute-row'}">
      <input class="inline-edit-input ${mode === 'module' ? 'me-trade-attribute-label' : ''}" type="text" value="${escapeHtml(attribute.label || '')}" placeholder="Attribut" ${mode === 'inline' ? `data-inline-action="update-trade-list-field" data-trade-list="attributes" data-trade-index="${itemIndex}" data-trade-attribute-index="${attributeIndex}" data-trade-field="label"` : ''}>
      <input class="inline-edit-input ${mode === 'module' ? 'me-trade-attribute-value' : ''}" type="number" min="0" max="10" step="1" value="${escapeHtml(attribute.value ?? 5)}" placeholder="Wert 0-10" ${mode === 'inline' ? `data-inline-action="update-trade-list-field" data-trade-list="attributes" data-trade-index="${itemIndex}" data-trade-attribute-index="${attributeIndex}" data-trade-field="value"` : ''}>
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-trade-list-row" data-trade-list="attributes" data-trade-index="${itemIndex}" data-trade-attribute-index="${attributeIndex}"` : 'data-module-editor-action="remove-trade-row" data-trade-list="attributes"'}>Loeschen</button>
    </div>`).join('');
}

function buildTradeCatalogFeatureEditor(item, index, mode = 'module') {
  return `
    <div class="trade-editor-feature-panel wide">
      <div class="trade-editor-item-head compact">
        <div>
          <span>Eigenschaften</span>
          <small>Icon oder Bild-URL plus Text als Bullet-Liste.</small>
        </div>
        <button class="module-editor-mini-btn" type="button" ${mode === 'inline' ? `data-inline-action="add-trade-list-row" data-trade-list="features" data-trade-index="${index}"` : 'data-module-editor-action="add-trade-row" data-trade-list="features"'}>+ Eigenschaft</button>
      </div>
      <div class="trade-editor-list module-trade-features inline-trade-features">
        ${buildTradeCatalogFeatureRows(item.features, index, mode) || '<div class="inline-placeholder-note">Noch keine Eigenschaften.</div>'}
      </div>
    </div>`;
}

function buildTradeCatalogAttributeEditor(item, index, mode = 'module') {
  const stampButton = mode === 'inline'
    ? `data-inline-action="stamp-trade-attributes" data-trade-index="${index}"`
    : 'data-module-editor-action="stamp-trade-attributes"';
  const applyButton = mode === 'inline'
    ? `data-inline-action="apply-trade-attributes-stamp" data-trade-index="${index}"`
    : 'data-module-editor-action="apply-trade-attributes-stamp"';
  return `
    <div class="trade-editor-feature-panel trade-editor-attribute-panel wide">
      <div class="trade-editor-item-head compact">
        <div>
          <span>Optionales Diagramm</span>
          <small>Bleibt unsichtbar, solange weniger als drei Attribute eingetragen sind.</small>
        </div>
        <div class="trade-editor-stamp-actions">
          <button class="module-editor-mini-btn" type="button" ${stampButton}>Diagramm stempeln</button>
          <button class="module-editor-mini-btn" type="button" ${applyButton}>Stempel einsetzen</button>
          <button class="module-editor-mini-btn" type="button" ${mode === 'inline' ? `data-inline-action="add-trade-list-row" data-trade-list="attributes" data-trade-index="${index}"` : 'data-module-editor-action="add-trade-row" data-trade-list="attributes"'}>+ Attribut</button>
        </div>
      </div>
      <label>
        <span>Diagramm-Titel</span>
        <input class="inline-edit-input ${mode === 'module' ? 'me-trade-item-attributesTitle' : ''}" type="text" value="${escapeHtml(item.attributesTitle || 'Attribute')}" ${mode === 'inline' ? `data-inline-action="update-trade-list-field" data-trade-list="items" data-trade-index="${index}" data-trade-field="attributesTitle"` : ''}>
      </label>
      <div class="trade-editor-list module-trade-attributes inline-trade-attributes">
        ${buildTradeCatalogAttributeRows(item.attributes, index, mode) || '<div class="inline-placeholder-note">Kein Diagramm fuer dieses Gut.</div>'}
      </div>
    </div>`;
}

function buildTradeCatalogItemRows(items = [], mode = 'module') {
  return (Array.isArray(items) ? items : []).map((item, index) => `
    <section class="trade-editor-item ${mode === 'module' ? 'module-trade-item-row' : 'inline-trade-item-row'}">
      <div class="trade-editor-item-head">
        <div class="module-editor-kicker">Eintrag ${index + 1}</div>
        <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-trade-list-row" data-trade-list="items" data-trade-index="${index}"` : 'data-module-editor-action="remove-trade-row" data-trade-list="items"'}>Eintrag loeschen</button>
      </div>
      <div class="trade-editor-grid">
        ${buildTradeCatalogInput('Titel', 'title', item.title, index, mode)}
        ${buildTradeCatalogInput('Untertitel', 'subtitle', item.subtitle, index, mode)}
        ${buildTradeCatalogInput('Kategorie-ID', 'category', item.category, index, mode)}
        ${buildTradeCatalogInput('Bild', 'image', item.image, index, mode, 'url')}
        ${buildTradeCatalogSelect('Bildformat', 'imageFormat', item.imageFormat, index, mode, [
          { value: 'landscape', label: 'Querformat' },
          { value: 'portrait', label: 'Hochformat' },
          { value: 'square', label: 'Quadratisch' }
        ])}
        ${buildTradeCatalogSelect('Bildfuelle', 'imageFit', item.imageFit, index, mode, [
          { value: 'cover', label: 'Fuellen / croppen' },
          { value: 'contain', label: 'Ganzes Bild' }
        ])}
        ${buildTradeCatalogSelect('Bildausschnitt', 'imagePosition', item.imagePosition, index, mode, [
          { value: 'center', label: 'Mitte' },
          { value: 'top', label: 'Oben' },
          { value: 'bottom', label: 'Unten' },
          { value: 'left', label: 'Links' },
          { value: 'right', label: 'Rechts' }
        ])}
        ${buildTradeCatalogInput('Bildhoehe px', 'imageHeight', item.imageHeight, index, mode, 'number')}
        ${buildTradeCatalogInput('Band / Empfehlung', 'badge', item.badge, index, mode)}
        ${buildTradeCatalogInput('Tags, Komma-getrennt', 'tags', item.tags.join(', '), index, mode)}
        ${buildTradeCatalogTextarea('Beschreibung', 'description', item.description, index, mode)}
        ${buildTradeCatalogFeatureEditor(item, index, mode)}
        ${buildTradeCatalogAttributeEditor(item, index, mode)}
        ${buildTradeCatalogTextarea('Herkunft', 'origin', item.origin, index, mode)}
        ${buildTradeCatalogInput('Verwendung, Komma-getrennt', 'usageTags', item.usageTags.join(', '), index, mode)}
        ${buildTradeCatalogInput('Preis von', 'priceMin', item.priceMin, index, mode)}
        ${buildTradeCatalogInput('Preis bis', 'priceMax', item.priceMax, index, mode)}
        ${buildTradeCatalogInput('Preisbalken %', 'priceFill', item.priceFill, index, mode, 'range')}
        ${buildTradeCatalogInput('Waehrungsicon', 'currencyIcon', item.currencyIcon, index, mode)}
        ${buildTradeCatalogInput('Waehrungsname', 'currencyLabel', item.currencyLabel, index, mode)}
        ${buildTradeCatalogInput('Siegelbild', 'sealImage', item.sealImage, index, mode, 'url')}
      </div>
    </section>`).join('');
}

function getDefaultTradeCatalogRow(listName) {
  if (listName === 'categories') return { id: 'neue-kategorie', label: 'Neue Kategorie' };
  if (listName === 'items') return sanitizeTradeCatalogItems([{ title: 'Neues Handelsgut', category: 'tiere', description: 'Ausfuehrliche Beschreibung.' }])[0];
  if (listName === 'features') return { icon: '*', text: 'Neue Eigenschaft' };
  if (listName === 'attributes') return { label: 'Neues Attribut', value: 5 };
  if (listName === 'footerCards') return { icon: '*', title: 'Neuer Hinweis', text: 'Hinweistext.' };
  return {};
}

function addModuleTradeCatalogRow(button, listName) {
  const card = button.closest('.module-page-card');
  if (listName === 'features' || listName === 'attributes') {
    const item = button.closest('.module-trade-item-row');
    const wrap = item?.querySelector(listName === 'features' ? '.module-trade-features' : '.module-trade-attributes');
    if (!wrap) return;
    wrap.querySelector('.inline-placeholder-note')?.remove();
    wrap.insertAdjacentHTML(
      'beforeend',
      listName === 'features'
        ? buildTradeCatalogFeatureRows([getDefaultTradeCatalogRow('features')], 0, 'module')
        : buildTradeCatalogAttributeRows([getDefaultTradeCatalogRow('attributes')], 0, 'module')
    );
    syncModuleJsonPreview();
    return;
  }

  const map = {
    categories: { selector: '.module-trade-categories', row: item => buildTradeCatalogCategoryRows([item], 'module') },
    items: { selector: '.module-trade-items', row: item => buildTradeCatalogItemRows([item], 'module') }
  };
  const definition = map[listName];
  const wrap = definition ? card?.querySelector(definition.selector) : null;
  if (!wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', definition.row(getDefaultTradeCatalogRow(listName)));
  syncModuleJsonPreview();
}

function removeModuleTradeCatalogRow(button) {
  const row = button.closest('.trade-editor-row, .trade-editor-item');
  if (!row) return;
  const wrap = row.parentElement;
  row.remove();
  if (wrap && !wrap.querySelector('.trade-editor-row, .trade-editor-item')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Eintraege vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function stampModuleTradeCatalogAttributes(button) {
  const item = button.closest('.module-trade-item-row');
  if (!item) return;
  const stamp = {
    attributesTitle: getTrimmedFormValue(item, '.me-trade-item-attributesTitle') || 'Attribute',
    attributes: collectTradeCatalogAttributes(item)
  };
  if (!stamp.attributes.length) {
    if (typeof setModuleEditorStatus === 'function') setModuleEditorStatus('Dieses Gut hat noch keine Diagramm-Attribute.', true);
    return;
  }
  setTradeCatalogAttributeStamp(stamp);
  if (typeof setModuleEditorStatus === 'function') setModuleEditorStatus('Diagramm als Stempel gemerkt.');
}

function applyModuleTradeCatalogAttributeStamp(button) {
  const stamp = getTradeCatalogAttributeStamp();
  const item = button.closest('.module-trade-item-row');
  if (!stamp || !item) {
    if (typeof setModuleEditorStatus === 'function') setModuleEditorStatus('Noch kein Diagramm-Stempel vorhanden.', true);
    return;
  }
  const titleInput = item.querySelector('.me-trade-item-attributesTitle');
  if (titleInput) titleInput.value = stamp.attributesTitle || 'Attribute';
  const wrap = item.querySelector('.module-trade-attributes');
  if (wrap) {
    wrap.innerHTML = buildTradeCatalogAttributeRows(stamp.attributes, 0, 'module') || '<div class="inline-placeholder-note">Kein Diagramm fuer dieses Gut.</div>';
  }
  syncModuleJsonPreview();
  if (typeof setModuleEditorStatus === 'function') setModuleEditorStatus('Diagramm-Stempel eingesetzt.');
}

function collectTradeCatalogCategories(block) {
  return Array.from(block.querySelectorAll('.module-trade-category-row')).map(row => ({
    id: getTrimmedFormValue(row, '.me-trade-category-id'),
    label: getTrimmedFormValue(row, '.me-trade-category-label')
  }));
}

function collectTradeCatalogFeatures(row) {
  return Array.from(row.querySelectorAll('.module-trade-feature-row')).map(featureRow => ({
    icon: getTrimmedFormValue(featureRow, '.me-trade-feature-icon'),
    text: getTrimmedFormValue(featureRow, '.me-trade-feature-text')
  }));
}

function collectTradeCatalogAttributes(row) {
  return Array.from(row.querySelectorAll('.module-trade-attribute-row')).map(attributeRow => ({
    label: getTrimmedFormValue(attributeRow, '.me-trade-attribute-label'),
    value: getTrimmedFormValue(attributeRow, '.me-trade-attribute-value')
  }));
}

function collectTradeCatalogItems(block) {
  return Array.from(block.querySelectorAll('.module-trade-item-row')).map(row => ({
    title: getTrimmedFormValue(row, '.me-trade-item-title'),
    subtitle: getTrimmedFormValue(row, '.me-trade-item-subtitle'),
    category: getTrimmedFormValue(row, '.me-trade-item-category'),
    image: getTrimmedFormValue(row, '.me-trade-item-image'),
    imageFormat: getTrimmedFormValue(row, '.me-trade-item-imageFormat'),
    imageFit: getTrimmedFormValue(row, '.me-trade-item-imageFit'),
    imagePosition: getTrimmedFormValue(row, '.me-trade-item-imagePosition'),
    imageHeight: getTrimmedFormValue(row, '.me-trade-item-imageHeight'),
    badge: getTrimmedFormValue(row, '.me-trade-item-badge'),
    tags: getTrimmedFormValue(row, '.me-trade-item-tags'),
    description: getTrimmedFormValue(row, '.me-trade-item-description'),
    features: collectTradeCatalogFeatures(row),
    origin: getTrimmedFormValue(row, '.me-trade-item-origin'),
    usageTags: getTrimmedFormValue(row, '.me-trade-item-usageTags'),
    priceMin: getTrimmedFormValue(row, '.me-trade-item-priceMin'),
    priceMax: getTrimmedFormValue(row, '.me-trade-item-priceMax'),
    priceFill: getTrimmedFormValue(row, '.me-trade-item-priceFill'),
    currencyIcon: getTrimmedFormValue(row, '.me-trade-item-currencyIcon'),
    currencyLabel: getTrimmedFormValue(row, '.me-trade-item-currencyLabel'),
    attributesTitle: getTrimmedFormValue(row, '.me-trade-item-attributesTitle'),
    attributes: collectTradeCatalogAttributes(row),
    sealImage: getTrimmedFormValue(row, '.me-trade-item-sealImage')
  }));
}

function buildTradeCatalogModuleEditorFields(page) {
  const data = sanitizeTradeCatalogData(page?.tradeCatalog || {});
  return `
    <div class="module-page-type-block${inferModulePageType(page) === 'trade-catalog' ? ' visible' : ''}" data-page-type="trade-catalog">
      <div class="module-editor-grid">
        <div class="module-editor-field"><label>Titel</label><input class="me-trade-title" type="text" value="${escapeHtml(data.title)}"></div>
        <div class="module-editor-field"><label>Untertitel</label><input class="me-trade-subtitle" type="text" value="${escapeHtml(data.subtitle)}"></div>
        <div class="module-editor-field"><label>Kopf-Icon</label><input class="me-trade-header-icon" type="url" value="${escapeHtml(data.headerIcon)}"></div>
        <div class="module-editor-field"><label>Notiz-Icon</label><input class="me-trade-note-icon" type="text" value="${escapeHtml(data.noteIcon)}"></div>
        <div class="module-editor-field"><label>Preisnotiz-Titel</label><input class="me-trade-note-title" type="text" value="${escapeHtml(data.noteTitle)}"></div>
        <div class="module-editor-field"><label>Alle-Reiter</label><input class="me-trade-all-label" type="text" value="${escapeHtml(data.allLabel)}"></div>
        <div class="module-editor-field wide"><label>Preisnotiz-Text</label><textarea class="me-trade-note-text">${escapeHtml(data.noteText)}</textarea></div>

        <div class="module-editor-field wide">
          <div class="module-editor-inline" style="justify-content:space-between;"><label>Kategorien / Reiter</label><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-trade-row" data-trade-list="categories">+ Kategorie</button></div>
          <div class="trade-editor-list module-trade-categories">${buildTradeCatalogCategoryRows(data.categories, 'module')}</div>
        </div>

        <div class="module-editor-field wide">
          <div class="module-editor-inline" style="justify-content:space-between;"><label>Handelsgueter / Tiere</label><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-trade-row" data-trade-list="items">+ Eintrag</button></div>
          <div class="trade-editor-list module-trade-items">${buildTradeCatalogItemRows(data.items, 'module')}</div>
        </div>
      </div>
    </div>`;
}

function collectTradeCatalogModuleEditorPage(card, page) {
  const block = card.querySelector('[data-page-type="trade-catalog"]') || card;
  page.tradeCatalogPage = true;
  page.tradeCatalog = sanitizeTradeCatalogData({
    title: getTrimmedFormValue(block, '.me-trade-title'),
    subtitle: getTrimmedFormValue(block, '.me-trade-subtitle'),
    headerIcon: getTrimmedFormValue(block, '.me-trade-header-icon'),
    noteIcon: getTrimmedFormValue(block, '.me-trade-note-icon'),
    noteTitle: getTrimmedFormValue(block, '.me-trade-note-title'),
    noteText: getTrimmedFormValue(block, '.me-trade-note-text'),
    allLabel: getTrimmedFormValue(block, '.me-trade-all-label'),
    categories: collectTradeCatalogCategories(block),
    items: collectTradeCatalogItems(block),
    footerCards: [],
    advisorTitle: '',
    advisorText: '',
    advisorImage: ''
  });
  return page;
}
