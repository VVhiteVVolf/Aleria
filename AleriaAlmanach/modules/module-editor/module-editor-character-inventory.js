function makeCharacterInventoryId(prefix = 'ci', index = 0) {
  return `${prefix}-${Date.now().toString(36)}-${index}-${Math.random().toString(36).slice(2, 6)}`;
}

function sanitizeCharacterInventoryNumber(value, fallback = 0, min = 0, max = 100) {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : fallback;
  return Math.max(min, Math.min(max, Math.round(safe)));
}

function sanitizeCharacterInventoryChoice(value, allowed = [], fallback = '') {
  const safe = String(value || '').trim();
  return allowed.includes(safe) ? safe : fallback;
}

function sanitizeCharacterInventoryImageSettings(data = {}) {
  return {
    format: sanitizeCharacterInventoryChoice(data.format, ['portrait', 'square', 'landscape', 'wide'], 'portrait'),
    fit: sanitizeCharacterInventoryChoice(data.fit, ['cover', 'contain'], 'cover'),
    position: sanitizeCharacterInventoryChoice(data.position, ['center', 'top', 'bottom', 'left', 'right'], 'top')
  };
}

function sanitizeCharacterInventoryRows(rows = [], fallback = [], maxRows = 40) {
  const source = Array.isArray(rows) ? rows : fallback;
  return source
    .map(row => ({
      icon: String(row?.icon || '').trim(),
      label: String(row?.label || '').trim(),
      value: String(row?.value || '').trim()
    }))
    .filter(row => row.icon || row.label || row.value)
    .slice(0, maxRows);
}

function sanitizeCharacterInventoryAttributes(items = [], fallback = []) {
  const source = Array.isArray(items) && items.length ? items : fallback;
  return source
    .map((item, index) => ({
      label: String(item?.label || `Attribut ${index + 1}`).trim(),
      value: sanitizeCharacterInventoryNumber(item?.value, 5, 0, 10)
    }))
    .filter(item => item.label)
    .slice(0, 8);
}

function sanitizeCharacterInventoryItems(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      id: String(item?.id || '').trim() || makeCharacterInventoryId('item', index),
      category: String(item?.category || 'equipment').trim(),
      icon: String(item?.icon || '').trim(),
      image: String(item?.image || '').trim(),
      imageFormat: sanitizeCharacterInventoryImageSettings({
        format: item?.imageFormat || 'square',
        fit: item?.imageFit || 'contain',
        position: item?.imagePosition || 'center'
      }).format,
      imageFit: sanitizeCharacterInventoryImageSettings({
        format: item?.imageFormat || 'square',
        fit: item?.imageFit || 'contain',
        position: item?.imagePosition || 'center'
      }).fit,
      imagePosition: sanitizeCharacterInventoryImageSettings({
        format: item?.imageFormat || 'square',
        fit: item?.imageFit || 'contain',
        position: item?.imagePosition || 'center'
      }).position,
      name: String(item?.name || `Gegenstand ${index + 1}`).trim(),
      type: String(item?.type || '').trim(),
      description: String(item?.description || '').trim(),
      weight: String(item?.weight || '').trim(),
      quantity: String(item?.quantity || '1').trim(),
      tags: String(item?.tags || '').trim(),
      infoRows: sanitizeCharacterInventoryRows(item?.infoRows, [
        { label: 'Qualitaet', value: 'Noch festlegen' },
        { label: 'Zustand', value: 'Noch festlegen' }
      ]),
      attributes: sanitizeCharacterInventoryAttributes(item?.attributes, [
        { label: 'Schaden', value: 5 },
        { label: 'Schutz', value: 3 },
        { label: 'Wert', value: 4 },
        { label: 'Seltenheit', value: 2 },
        { label: 'Zuverlaessigkeit', value: 6 },
        { label: 'Handhabung', value: 5 }
      ])
    }))
    .filter(item => item.name || item.icon || item.image)
    .slice(0, 80);
}

function sanitizeCharacterInventoryCompanions(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      id: String(item?.id || '').trim() || makeCharacterInventoryId('companion', index),
      image: String(item?.image || '').trim(),
      imageFormat: sanitizeCharacterInventoryImageSettings({
        format: item?.imageFormat || 'landscape',
        fit: item?.imageFit || 'cover',
        position: item?.imagePosition || 'top'
      }).format,
      imageFit: sanitizeCharacterInventoryImageSettings({
        format: item?.imageFormat || 'landscape',
        fit: item?.imageFit || 'cover',
        position: item?.imagePosition || 'top'
      }).fit,
      imagePosition: sanitizeCharacterInventoryImageSettings({
        format: item?.imageFormat || 'landscape',
        fit: item?.imageFit || 'cover',
        position: item?.imagePosition || 'top'
      }).position,
      name: String(item?.name || `Gefaehrte ${index + 1}`).trim(),
      species: String(item?.species || '').trim(),
      role: String(item?.role || '').trim(),
      status: String(item?.status || 'Gesund').trim(),
      statusColor: String(item?.statusColor || '#5c7f20').trim(),
      summary: String(item?.summary || '').trim(),
      description: String(item?.description || '').trim(),
      infoRows: sanitizeCharacterInventoryRows(item?.infoRows, [
        { label: 'Art', value: 'Noch festlegen' },
        { label: 'Besitzer', value: 'Noch festlegen' },
        { label: 'Rolle', value: 'Begleiter' }
      ]),
      attributes: sanitizeCharacterInventoryAttributes(item?.attributes, [
        { label: 'Schnelligkeit', value: 6 },
        { label: 'Ausdauer', value: 7 },
        { label: 'Staerke', value: 5 },
        { label: 'Agilitaet', value: 6 },
        { label: 'Sozialverhalten', value: 4 },
        { label: 'Robustheit', value: 5 }
      ])
    }))
    .filter(item => item.name || item.image)
    .slice(0, 24);
}

function sanitizeCharacterInventoryData(data = {}) {
  const categories = Array.isArray(data.categories) && data.categories.length
    ? data.categories
    : [
        { id: 'all', label: 'Alle', icon: '*' },
        { id: 'weapon', label: 'Waffen', icon: 'X' },
        { id: 'armor', label: 'Ruestung', icon: '#' },
        { id: 'equipment', label: 'Ausruestung', icon: '+' },
        { id: 'other', label: 'Sonstiges', icon: '?' }
      ];
  return {
    title: String(data.title || 'Charakter-Inventar').trim(),
    subtitle: String(data.subtitle || 'Ausrustung, Gegenstaende und Gefaehrten verwalten').trim(),
    portrait: String(data.portrait || '').trim(),
    portraitFormat: sanitizeCharacterInventoryImageSettings({
      format: data.portraitFormat || 'portrait',
      fit: data.portraitFit || 'cover',
      position: data.portraitPosition || 'top'
    }).format,
    portraitFit: sanitizeCharacterInventoryImageSettings({
      format: data.portraitFormat || 'portrait',
      fit: data.portraitFit || 'cover',
      position: data.portraitPosition || 'top'
    }).fit,
    portraitPosition: sanitizeCharacterInventoryImageSettings({
      format: data.portraitFormat || 'portrait',
      fit: data.portraitFit || 'cover',
      position: data.portraitPosition || 'top'
    }).position,
    name: String(data.name || 'Name des Charakters').trim(),
    role: String(data.role || 'Rolle').trim(),
    level: String(data.level || 'Stufe').trim(),
    status: String(data.status || 'Gesund').trim(),
    hitpoints: String(data.hitpoints || '48 / 52 TP').trim(),
    healthColor: String(data.healthColor || '#5c7f20').trim(),
    money: String(data.money || '1.245 GM').trim(),
    carryLabel: String(data.carryLabel || 'Traglast').trim(),
    carryValue: String(data.carryValue || '78,4 / 120 kg').trim(),
    categories: categories.map((category, index) => ({
      id: String(category?.id || `cat-${index}`).trim(),
      label: String(category?.label || `Kategorie ${index + 1}`).trim(),
      icon: String(category?.icon || '*').trim()
    })).filter(category => category.id && category.label).slice(0, 12),
    infoRows: sanitizeCharacterInventoryRows(data.infoRows, [
      { icon: '*', label: 'Status', value: String(data.status || 'Gesund').trim() },
      { icon: '*', label: 'TP / Zustand', value: String(data.hitpoints || '48 / 52 TP').trim() },
      { icon: '*', label: 'Geld', value: String(data.money || '1.245 GM').trim() },
      { icon: '*', label: 'Tragkapazitaet', value: `${String(data.carryLabel || 'Traglast').trim()} ${String(data.carryValue || '78,4 / 120 kg').trim()}`.trim() },
      { icon: '*', label: 'Volk', value: 'Mensch' },
      { icon: '*', label: 'Hintergrund', value: 'Noch festlegen' },
      { icon: '*', label: 'Aufenthalt', value: 'Noch festlegen' },
      { icon: '*', label: 'Ausrichtung', value: 'Neutral Gut' }
    ], 8),
    attributes: sanitizeCharacterInventoryAttributes(data.attributes, [
      { label: 'StA', value: 8 },
      { label: 'Ges', value: 6 },
      { label: 'Kon', value: 7 },
      { label: 'Int', value: 5 },
      { label: 'Wei', value: 6 },
      { label: 'Cha', value: 5 }
    ]),
    items: sanitizeCharacterInventoryItems(data.items),
    companions: sanitizeCharacterInventoryCompanions(data.companions)
  };
}

function createDefaultCharacterInventoryPage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} - Charakter-Inventar`,
    characterInventoryPage: true,
    characterInventory: sanitizeCharacterInventoryData({
      items: [
        { category: 'weapon', icon: '*', name: 'Langschwert +1', type: 'Waffe (Haupt)', description: 'Ein ausgewogenes Schwert aus gehaertetem Stahl.', weight: '1,5 kg', quantity: '1' },
        { category: 'armor', icon: '*', name: 'Plattenruestung', type: 'Ruestung (Koerper)', description: 'Schwere Ruestung aus Stahlplatten.', weight: '25,0 kg', quantity: '1' },
        { category: 'equipment', icon: '*', name: 'Heiltrank', type: 'Verbrauchsgut', description: 'Stellt Trefferpunkte wieder her.', weight: '0,3 kg', quantity: '3' }
      ],
      companions: [
        { name: 'Ardan', species: 'Kriegspferd', role: 'Reittier', summary: 'Treuer Begleiter auf langen Wegen.', status: 'Gesund' },
        { name: 'Rask', species: 'Wachhund', role: 'Gefaehrte', summary: 'Wachsam und spurensicher.', status: 'Wachsam' }
      ]
    }),
    stats: [],
    commentDivider: false,
    commentSequence: []
  };
}

function buildCharacterInventoryInput(label, className, value, type = 'text') {
  return `
    <label>
      <span>${escapeHtml(label)}</span>
      <input class="inline-edit-input ${className}" type="${escapeHtml(type)}" value="${escapeHtml(value || '')}" data-module-editor-action="refresh-ci-preview">
    </label>`;
}

function buildCharacterInventoryTextarea(label, className, value) {
  return `
    <label class="wide">
      <span>${escapeHtml(label)}</span>
      <textarea class="inline-edit-textarea ${className}" data-module-editor-action="refresh-ci-preview">${escapeHtml(value || '')}</textarea>
    </label>`;
}

function buildCharacterInventorySelect(label, className, value, options = []) {
  return `
    <label>
      <span>${escapeHtml(label)}</span>
      <select class="inline-edit-select ${className}" data-module-editor-action="refresh-ci-preview">
        ${options.map(option => `<option value="${escapeHtml(option.value)}"${option.value === value ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}
      </select>
    </label>`;
}

function buildCharacterInventoryImageControls(prefix, data) {
  return `
    ${buildCharacterInventorySelect('Bildformat', `me-ci-${prefix}-format`, data.format, [
      { value: 'portrait', label: 'Hochformat' },
      { value: 'square', label: 'Quadrat' },
      { value: 'landscape', label: 'Querformat' },
      { value: 'wide', label: 'Breitbild' }
    ])}
    ${buildCharacterInventorySelect('Bildmodus', `me-ci-${prefix}-fit`, data.fit, [
      { value: 'cover', label: 'Fuellen / croppen' },
      { value: 'contain', label: 'Ganzbild' }
    ])}
    ${buildCharacterInventorySelect('Bildposition', `me-ci-${prefix}-position`, data.position, [
      { value: 'top', label: 'Oben' },
      { value: 'center', label: 'Mitte' },
      { value: 'bottom', label: 'Unten' },
      { value: 'left', label: 'Links' },
      { value: 'right', label: 'Rechts' }
    ])}`;
}

function buildCharacterInventoryRowEditor(rows = [], kind = 'info') {
  return rows.map((row, index) => `
    <div class="ci-editor-row" data-ci-row-kind="${escapeHtml(kind)}">
      ${buildCharacterInventoryInput('Icon', `me-ci-${kind}-icon`, row.icon)}
      ${buildCharacterInventoryInput('Label', `me-ci-${kind}-label`, row.label)}
      ${buildCharacterInventoryInput('Wert', `me-ci-${kind}-value`, row.value)}
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-ci-row">Loeschen</button>
    </div>`).join('');
}

function buildCharacterInventoryAttributeEditor(attributes = [], kind = 'character') {
  return attributes.map(attribute => `
    <div class="ci-editor-row compact" data-ci-attribute-kind="${escapeHtml(kind)}">
      ${buildCharacterInventoryInput('Attribut', `me-ci-${kind}-attribute-label`, attribute.label)}
      ${buildCharacterInventoryInput('Wert 0-10', `me-ci-${kind}-attribute-value`, attribute.value, 'number')}
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-ci-attribute">Loeschen</button>
    </div>`).join('');
}

function buildCharacterInventoryCategoryOptions(categories = [], current = '') {
  return categories.map(category =>
    `<option value="${escapeHtml(category.id)}"${category.id === current ? ' selected' : ''}>${escapeHtml(category.label)}</option>`
  ).join('');
}

function buildCharacterInventoryCategoryEditor(categories = []) {
  return categories.map((category, index) => `
    <div class="ci-editor-row ci-category-row" data-ci-category-row>
      <input type="hidden" class="me-ci-category-original-id" value="${escapeHtml(category.id)}">
      ${buildCharacterInventoryInput('ID', 'me-ci-category-id', category.id)}
      ${buildCharacterInventoryInput('Name', 'me-ci-category-label', category.label)}
      ${buildCharacterInventoryInput('Icon', 'me-ci-category-icon', category.icon)}
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-ci-category"${categories.length <= 1 ? ' disabled' : ''}>Loeschen</button>
    </div>`).join('');
}

function buildCharacterInventoryItemEditor(item, index, categories) {
  const imageSettings = sanitizeCharacterInventoryImageSettings({
    format: item.imageFormat || 'square',
    fit: item.imageFit || 'contain',
    position: item.imagePosition || 'center'
  });
  return `
    <section class="ci-editor-card" data-ci-item-row>
      <input type="hidden" class="me-ci-item-id" value="${escapeHtml(item.id)}">
      <div class="ci-editor-card-head">
        <strong>Item ${index + 1}</strong>
        <div class="ci-editor-card-actions">
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-ci-item" data-ci-direction="-1">Hoch</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-ci-item" data-ci-direction="1">Runter</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="duplicate-ci-item">Duplizieren</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-ci-item">Loeschen</button>
        </div>
      </div>
      <div class="ci-editor-grid">
        ${buildCharacterInventoryInput('Name', 'me-ci-item-name', item.name)}
        <label><span>Kategorie</span><select class="inline-edit-select me-ci-item-category" data-module-editor-action="refresh-ci-preview">${buildCharacterInventoryCategoryOptions(categories, item.category)}</select></label>
        ${buildCharacterInventoryInput('Icon', 'me-ci-item-icon', item.icon)}
        ${buildCharacterInventoryInput('Bild', 'me-ci-item-image', item.image, 'url')}
        ${buildCharacterInventoryImageControls('item-image', imageSettings)}
        ${buildCharacterInventoryInput('Typ', 'me-ci-item-type', item.type)}
        ${buildCharacterInventoryInput('Gewicht', 'me-ci-item-weight', item.weight)}
        ${buildCharacterInventoryInput('Anzahl', 'me-ci-item-quantity', item.quantity)}
        ${buildCharacterInventoryInput('Tags', 'me-ci-item-tags', item.tags)}
        ${buildCharacterInventoryTextarea('Beschreibung', 'me-ci-item-description', item.description)}
      </div>
      <div class="ci-nested-editor">
        <div class="ci-editor-section-head"><h5>Item-Infobox</h5><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-ci-item-row">+ Zeile</button></div>
        <div class="ci-editor-list">${buildCharacterInventoryRowEditor(item.infoRows, 'item-info')}</div>
        <div class="ci-editor-section-head"><h5>Item-Attribute</h5><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-ci-item-attribute">+ Attribut</button></div>
        <div class="ci-editor-list">${buildCharacterInventoryAttributeEditor(item.attributes, 'item')}</div>
      </div>
    </section>`;
}

function buildCharacterInventoryCompanionEditor(companion, index) {
  const imageSettings = sanitizeCharacterInventoryImageSettings({
    format: companion.imageFormat || 'landscape',
    fit: companion.imageFit || 'cover',
    position: companion.imagePosition || 'top'
  });
  return `
    <section class="ci-editor-card" data-ci-companion-row>
      <input type="hidden" class="me-ci-companion-id" value="${escapeHtml(companion.id)}">
      <div class="ci-editor-card-head">
        <strong>Gefaehrte ${index + 1}</strong>
        <div class="ci-editor-card-actions">
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-ci-companion" data-ci-direction="-1">Hoch</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-ci-companion" data-ci-direction="1">Runter</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="duplicate-ci-companion">Duplizieren</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-ci-companion">Loeschen</button>
        </div>
      </div>
      <div class="ci-editor-grid">
        ${buildCharacterInventoryInput('Name', 'me-ci-companion-name', companion.name)}
        ${buildCharacterInventoryInput('Art / Spezies', 'me-ci-companion-species', companion.species)}
        ${buildCharacterInventoryInput('Rolle', 'me-ci-companion-role', companion.role)}
        ${buildCharacterInventoryInput('Status', 'me-ci-companion-status', companion.status)}
        ${buildCharacterInventoryInput('Statusfarbe', 'me-ci-companion-statusColor', companion.statusColor)}
        ${buildCharacterInventoryInput('Bild', 'me-ci-companion-image', companion.image, 'url')}
        ${buildCharacterInventoryImageControls('companion-image', imageSettings)}
        ${buildCharacterInventoryTextarea('Kurztext', 'me-ci-companion-summary', companion.summary)}
        ${buildCharacterInventoryTextarea('Profilbeschreibung', 'me-ci-companion-description', companion.description)}
      </div>
      <div class="ci-nested-editor">
        <div class="ci-editor-section-head"><h5>Gefaehrten-Infobox</h5><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-ci-companion-row">+ Zeile</button></div>
        <div class="ci-editor-list">${buildCharacterInventoryRowEditor(companion.infoRows, 'companion-info')}</div>
        <div class="ci-editor-section-head"><h5>Gefaehrten-Attribute</h5><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-ci-companion-attribute">+ Attribut</button></div>
        <div class="ci-editor-list">${buildCharacterInventoryAttributeEditor(companion.attributes, 'companion')}</div>
      </div>
    </section>`;
}

function buildCharacterInventoryModuleEditorFields(page) {
  const data = sanitizeCharacterInventoryData(page?.characterInventory || {});
  const portraitSettings = sanitizeCharacterInventoryImageSettings({
    format: data.portraitFormat || 'portrait',
    fit: data.portraitFit || 'cover',
    position: data.portraitPosition || 'top'
  });
  return `
    <div class="module-page-type-block${inferModulePageType(page) === 'character-inventory' ? ' visible' : ''}" data-page-type="character-inventory">
      <div class="ci-full-editor" data-ci-editor>
        <div class="ci-editor-pane">
          <div class="module-editor-grid">
            <div class="module-editor-field wide">
              <div class="module-editor-kicker">Charakter-Inventar</div>
              <div class="module-editor-help">Bearbeite Charakterdaten, Inventar, Detailprofile und Gefaehrten. Rechts siehst du eine Live-Vorschau.</div>
            </div>
          </div>
          <section class="ci-editor-section">
            <h4>Kopf & Charakter</h4>
            <div class="ci-editor-grid">
              ${buildCharacterInventoryInput('Titel', 'me-ci-title', data.title)}
              ${buildCharacterInventoryInput('Untertitel', 'me-ci-subtitle', data.subtitle)}
              ${buildCharacterInventoryInput('Portrait', 'me-ci-portrait', data.portrait, 'url')}
              ${buildCharacterInventoryImageControls('portrait', portraitSettings)}
              ${buildCharacterInventoryInput('Name', 'me-ci-name', data.name)}
              ${buildCharacterInventoryInput('Rolle', 'me-ci-role', data.role)}
              ${buildCharacterInventoryInput('Stufe', 'me-ci-level', data.level)}
              ${buildCharacterInventoryInput('Status', 'me-ci-status', data.status)}
              ${buildCharacterInventoryInput('TP / Zustand', 'me-ci-hitpoints', data.hitpoints)}
              ${buildCharacterInventoryInput('Statusfarbe', 'me-ci-healthColor', data.healthColor)}
              ${buildCharacterInventoryInput('Geld', 'me-ci-money', data.money)}
              ${buildCharacterInventoryInput('Traglast-Label', 'me-ci-carryLabel', data.carryLabel)}
              ${buildCharacterInventoryInput('Traglast-Wert', 'me-ci-carryValue', data.carryValue)}
            </div>
          </section>
          <section class="ci-editor-section">
            <div class="ci-editor-section-head"><h4>Infobox</h4><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-ci-row" data-ci-kind="info">+ Zeile</button></div>
            <div class="ci-editor-list">${buildCharacterInventoryRowEditor(data.infoRows, 'info')}</div>
          </section>
          <section class="ci-editor-section">
            <div class="ci-editor-section-head"><h4>Charakterattribute</h4><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-ci-attribute" data-ci-kind="character">+ Attribut</button></div>
            <div class="ci-editor-list">${buildCharacterInventoryAttributeEditor(data.attributes, 'character')}</div>
          </section>
          <section class="ci-editor-section">
            <div class="ci-editor-section-head"><h4>Inventar-Reiter</h4><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-ci-category">+ Reiter</button></div>
            <div class="ci-editor-list">${buildCharacterInventoryCategoryEditor(data.categories)}</div>
          </section>
          <section class="ci-editor-section">
            <div class="ci-editor-section-head"><h4>Items</h4><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-ci-item">+ Item</button></div>
            <div class="ci-editor-list">${data.items.map((item, index) => buildCharacterInventoryItemEditor(item, index, data.categories)).join('')}</div>
          </section>
          <section class="ci-editor-section">
            <div class="ci-editor-section-head"><h4>Gefaehrten</h4><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-ci-companion">+ Gefaehrte</button></div>
            <div class="ci-editor-list">${data.companions.map((companion, index) => buildCharacterInventoryCompanionEditor(companion, index)).join('')}</div>
          </section>
        </div>
        <div class="ci-editor-splitter" aria-hidden="true"></div>
        <div class="ci-preview-pane">
          <div class="ci-preview-head">Live-Vorschau</div>
          <div class="ci-preview-frame">${buildCharacterInventoryPage({ characterInventoryPage: true, characterInventory: data }, {}, 0, 1)}</div>
        </div>
      </div>
    </div>`;
}

function buildCharacterInventoryEmbeddedEditorMarkup(data = {}) {
  const page = {
    characterInventoryPage: true,
    characterInventory: sanitizeCharacterInventoryData(data)
  };
  return `
    <div class="character-inventory-embedded-editor" data-ci-embedded-card>
      ${buildCharacterInventoryModuleEditorFields(page)}
    </div>`;
}

function collectCharacterInventoryRows(card, selector, mapper) {
  return Array.from(card.querySelectorAll(selector)).map(mapper);
}

function collectCharacterInventoryModuleEditorPage(card, page) {
  const block = card.querySelector('[data-page-type="character-inventory"]') || card;
  page.characterInventoryPage = true;
  page.characterInventory = sanitizeCharacterInventoryData({
    title: getTrimmedFormValue(block, '.me-ci-title'),
    subtitle: getTrimmedFormValue(block, '.me-ci-subtitle'),
    portrait: getTrimmedFormValue(block, '.me-ci-portrait'),
    portraitFormat: getTrimmedFormValue(block, '.me-ci-portrait-format'),
    portraitFit: getTrimmedFormValue(block, '.me-ci-portrait-fit'),
    portraitPosition: getTrimmedFormValue(block, '.me-ci-portrait-position'),
    name: getTrimmedFormValue(block, '.me-ci-name'),
    role: getTrimmedFormValue(block, '.me-ci-role'),
    level: getTrimmedFormValue(block, '.me-ci-level'),
    status: getTrimmedFormValue(block, '.me-ci-status'),
    hitpoints: getTrimmedFormValue(block, '.me-ci-hitpoints'),
    healthColor: getTrimmedFormValue(block, '.me-ci-healthColor'),
    money: getTrimmedFormValue(block, '.me-ci-money'),
    carryLabel: getTrimmedFormValue(block, '.me-ci-carryLabel'),
    carryValue: getTrimmedFormValue(block, '.me-ci-carryValue'),
    infoRows: collectCharacterInventoryRows(block, '[data-ci-row-kind="info"]', row => ({
      icon: getTrimmedFormValue(row, '.me-ci-info-icon'),
      label: getTrimmedFormValue(row, '.me-ci-info-label'),
      value: getTrimmedFormValue(row, '.me-ci-info-value')
    })),
    attributes: collectCharacterInventoryRows(block, '[data-ci-attribute-kind="character"]', row => ({
      label: getTrimmedFormValue(row, '.me-ci-character-attribute-label'),
      value: getTrimmedFormValue(row, '.me-ci-character-attribute-value')
    })),
    categories: collectCharacterInventoryRows(block, '[data-ci-category-row]', row => ({
      id: getTrimmedFormValue(row, '.me-ci-category-id'),
      label: getTrimmedFormValue(row, '.me-ci-category-label'),
      icon: getTrimmedFormValue(row, '.me-ci-category-icon')
    })),
    items: collectCharacterInventoryRows(block, '[data-ci-item-row]', row => ({
      id: getTrimmedFormValue(row, '.me-ci-item-id'),
      category: getTrimmedFormValue(row, '.me-ci-item-category'),
      icon: getTrimmedFormValue(row, '.me-ci-item-icon'),
      image: getTrimmedFormValue(row, '.me-ci-item-image'),
      imageFormat: getTrimmedFormValue(row, '.me-ci-item-image-format'),
      imageFit: getTrimmedFormValue(row, '.me-ci-item-image-fit'),
      imagePosition: getTrimmedFormValue(row, '.me-ci-item-image-position'),
      name: getTrimmedFormValue(row, '.me-ci-item-name'),
      type: getTrimmedFormValue(row, '.me-ci-item-type'),
      description: getTrimmedFormValue(row, '.me-ci-item-description'),
      weight: getTrimmedFormValue(row, '.me-ci-item-weight'),
      quantity: getTrimmedFormValue(row, '.me-ci-item-quantity'),
      tags: getTrimmedFormValue(row, '.me-ci-item-tags'),
      infoRows: collectCharacterInventoryRows(row, '[data-ci-row-kind="item-info"]', infoRow => ({
        icon: getTrimmedFormValue(infoRow, '.me-ci-item-info-icon'),
        label: getTrimmedFormValue(infoRow, '.me-ci-item-info-label'),
        value: getTrimmedFormValue(infoRow, '.me-ci-item-info-value')
      })),
      attributes: collectCharacterInventoryRows(row, '[data-ci-attribute-kind="item"]', attributeRow => ({
        label: getTrimmedFormValue(attributeRow, '.me-ci-item-attribute-label'),
        value: getTrimmedFormValue(attributeRow, '.me-ci-item-attribute-value')
      }))
    })),
    companions: collectCharacterInventoryRows(block, '[data-ci-companion-row]', row => ({
      id: getTrimmedFormValue(row, '.me-ci-companion-id'),
      image: getTrimmedFormValue(row, '.me-ci-companion-image'),
      imageFormat: getTrimmedFormValue(row, '.me-ci-companion-image-format'),
      imageFit: getTrimmedFormValue(row, '.me-ci-companion-image-fit'),
      imagePosition: getTrimmedFormValue(row, '.me-ci-companion-image-position'),
      name: getTrimmedFormValue(row, '.me-ci-companion-name'),
      species: getTrimmedFormValue(row, '.me-ci-companion-species'),
      role: getTrimmedFormValue(row, '.me-ci-companion-role'),
      status: getTrimmedFormValue(row, '.me-ci-companion-status'),
      statusColor: getTrimmedFormValue(row, '.me-ci-companion-statusColor'),
      summary: getTrimmedFormValue(row, '.me-ci-companion-summary'),
      description: getTrimmedFormValue(row, '.me-ci-companion-description'),
      infoRows: collectCharacterInventoryRows(row, '[data-ci-row-kind="companion-info"]', infoRow => ({
        icon: getTrimmedFormValue(infoRow, '.me-ci-companion-info-icon'),
        label: getTrimmedFormValue(infoRow, '.me-ci-companion-info-label'),
        value: getTrimmedFormValue(infoRow, '.me-ci-companion-info-value')
      })),
      attributes: collectCharacterInventoryRows(row, '[data-ci-attribute-kind="companion"]', attributeRow => ({
        label: getTrimmedFormValue(attributeRow, '.me-ci-companion-attribute-label'),
        value: getTrimmedFormValue(attributeRow, '.me-ci-companion-attribute-value')
      }))
    }))
  });
  return page;
}

function buildInlineCharacterInventoryEditor(page) {
  const data = sanitizeCharacterInventoryData(page?.characterInventory || {});
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Charakter-Inventar</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field"><span class="inline-edit-label">Titel</span><input class="inline-edit-input" data-inline-action="update-ci-field" data-ci-field="title" value="${escapeHtml(data.title)}"></div>
        <div class="inline-edit-field"><span class="inline-edit-label">Untertitel</span><input class="inline-edit-input" data-inline-action="update-ci-field" data-ci-field="subtitle" value="${escapeHtml(data.subtitle)}"></div>
        <div class="inline-edit-field"><span class="inline-edit-label">Name</span><input class="inline-edit-input" data-inline-action="update-ci-field" data-ci-field="name" value="${escapeHtml(data.name)}"></div>
        <div class="inline-edit-field wide"><span class="inline-edit-label">Portrait</span><input class="inline-edit-input" data-inline-action="update-ci-field" data-ci-field="portrait" value="${escapeHtml(data.portrait)}"></div>
      </div>
      <div class="inline-placeholder-note">Items, Gefaehrten, Attribute und Detailprofile bearbeitest du im grossen Modul-Editor mit Live-Vorschau.</div>
    </div>`;
}

function updateInlineCharacterInventoryField(input) {
  const page = getInlineDraftPageForSource(input);
  if (!page) return;
  const data = sanitizeCharacterInventoryData(page.characterInventory || {});
  const field = input.dataset.ciField || '';
  if (!field) return;
  data[field] = String(input.value || '').trim();
  page.characterInventoryPage = true;
  page.characterInventory = sanitizeCharacterInventoryData(data);
}

function refreshCharacterInventoryEditorPreview(source) {
  const editor = source.closest('[data-ci-editor]');
  const card = source.closest('.module-page-card') || source.closest('[data-ci-embedded-card]');
  const frame = editor?.querySelector('.ci-preview-frame');
  if (!editor || !card || !frame) return;
  const page = card.matches('[data-ci-embedded-card]')
    ? collectCharacterInventoryModuleEditorPage(card, {})
    : collectModulePageFromCard(card);
  frame.innerHTML = buildCharacterInventoryPage(page, {}, 0, 1);
  if (typeof syncModuleJsonPreview === 'function') syncModuleJsonPreview();
}

function rerenderCharacterInventoryEditor(button, updater) {
  const card = button.closest('.module-page-card') || button.closest('[data-ci-embedded-card]');
  if (!card) return;
  const embedded = card.matches('[data-ci-embedded-card]');
  const page = embedded
    ? collectCharacterInventoryModuleEditorPage(card, {})
    : collectModulePageFromCard(card);
  const data = sanitizeCharacterInventoryData(page.characterInventory || {});
  updater(data);
  page.characterInventoryPage = true;
  page.characterInventory = sanitizeCharacterInventoryData(data);
  card.outerHTML = embedded
    ? buildCharacterInventoryEmbeddedEditorMarkup(page.characterInventory)
    : buildModulePageEditorMarkup(page, Number(card.dataset.pageIndex || 0));
  if (typeof syncModuleJsonPreview === 'function') syncModuleJsonPreview();
}

function getCharacterInventoryRowIndex(row, selector) {
  return Array.from(row?.parentElement?.querySelectorAll(selector) || []).indexOf(row);
}

function getCharacterInventoryFallbackCategory(categories = []) {
  return categories.find(category => category.id !== 'all')?.id || categories[0]?.id || 'equipment';
}

function addCharacterInventoryCategory(button) {
  rerenderCharacterInventoryEditor(button, data => {
    const index = data.categories.length + 1;
    data.categories.push({
      id: `category-${index}`,
      label: `Reiter ${index}`,
      icon: '*'
    });
  });
}

function removeCharacterInventoryCategory(button) {
  const row = button.closest('[data-ci-category-row]');
  const index = getCharacterInventoryRowIndex(row, '[data-ci-category-row]');
  rerenderCharacterInventoryEditor(button, data => {
    if (index < 0 || data.categories.length <= 1) return;
    const removed = data.categories[index]?.id;
    data.categories.splice(index, 1);
    const fallbackCategory = getCharacterInventoryFallbackCategory(data.categories);
    data.items.forEach(item => {
      if (item.category === removed) item.category = fallbackCategory;
    });
  });
}

function addCharacterInventoryRow(button) {
  const kind = button.dataset.ciKind || 'info';
  rerenderCharacterInventoryEditor(button, data => {
    if (kind === 'info' && data.infoRows.length < 8) {
      data.infoRows.push({ icon: '*', label: 'Neue Zeile', value: 'Wert' });
    }
  });
}

function removeCharacterInventoryRow(button) {
  const row = button.closest('[data-ci-row-kind]');
  const kind = row?.dataset.ciRowKind || 'info';
  const itemRow = row?.closest('[data-ci-item-row]');
  const companionRow = row?.closest('[data-ci-companion-row]');
  const index = Array.from(row?.parentElement?.querySelectorAll(`[data-ci-row-kind="${kind}"]`) || []).indexOf(row);
  rerenderCharacterInventoryEditor(button, data => {
    if (index < 0) return;
    if (kind === 'item-info' && itemRow) {
      const itemIndex = Array.from(itemRow.parentElement.querySelectorAll('[data-ci-item-row]')).indexOf(itemRow);
      data.items[itemIndex]?.infoRows?.splice(index, 1);
      return;
    }
    if (kind === 'companion-info' && companionRow) {
      const companionIndex = Array.from(companionRow.parentElement.querySelectorAll('[data-ci-companion-row]')).indexOf(companionRow);
      data.companions[companionIndex]?.infoRows?.splice(index, 1);
      return;
    }
    data.infoRows.splice(index, 1);
  });
}

function addCharacterInventoryAttribute(button) {
  rerenderCharacterInventoryEditor(button, data => {
    data.attributes.push({ label: 'Neues Attribut', value: 5 });
  });
}

function removeCharacterInventoryAttribute(button) {
  const row = button.closest('[data-ci-attribute-kind]');
  const kind = row?.dataset.ciAttributeKind || 'character';
  const itemRow = row?.closest('[data-ci-item-row]');
  const companionRow = row?.closest('[data-ci-companion-row]');
  const index = Array.from(row?.parentElement?.querySelectorAll(`[data-ci-attribute-kind="${kind}"]`) || []).indexOf(row);
  rerenderCharacterInventoryEditor(button, data => {
    if (index < 0) return;
    if (kind === 'item' && itemRow) {
      const itemIndex = Array.from(itemRow.parentElement.querySelectorAll('[data-ci-item-row]')).indexOf(itemRow);
      data.items[itemIndex]?.attributes?.splice(index, 1);
      return;
    }
    if (kind === 'companion' && companionRow) {
      const companionIndex = Array.from(companionRow.parentElement.querySelectorAll('[data-ci-companion-row]')).indexOf(companionRow);
      data.companions[companionIndex]?.attributes?.splice(index, 1);
      return;
    }
    data.attributes.splice(index, 1);
  });
}

function addCharacterInventoryNestedRow(button, targetKind) {
  const itemRow = button.closest('[data-ci-item-row]');
  const companionRow = button.closest('[data-ci-companion-row]');
  rerenderCharacterInventoryEditor(button, data => {
    if (targetKind === 'item' && itemRow) {
      const itemIndex = Array.from(itemRow.parentElement.querySelectorAll('[data-ci-item-row]')).indexOf(itemRow);
      data.items[itemIndex]?.infoRows?.push({ icon: '*', label: 'Neue Zeile', value: 'Wert' });
    }
    if (targetKind === 'companion' && companionRow) {
      const companionIndex = Array.from(companionRow.parentElement.querySelectorAll('[data-ci-companion-row]')).indexOf(companionRow);
      data.companions[companionIndex]?.infoRows?.push({ icon: '*', label: 'Neue Zeile', value: 'Wert' });
    }
  });
}

function addCharacterInventoryNestedAttribute(button, targetKind) {
  const itemRow = button.closest('[data-ci-item-row]');
  const companionRow = button.closest('[data-ci-companion-row]');
  rerenderCharacterInventoryEditor(button, data => {
    if (targetKind === 'item' && itemRow) {
      const itemIndex = Array.from(itemRow.parentElement.querySelectorAll('[data-ci-item-row]')).indexOf(itemRow);
      data.items[itemIndex]?.attributes?.push({ label: 'Neues Attribut', value: 5 });
    }
    if (targetKind === 'companion' && companionRow) {
      const companionIndex = Array.from(companionRow.parentElement.querySelectorAll('[data-ci-companion-row]')).indexOf(companionRow);
      data.companions[companionIndex]?.attributes?.push({ label: 'Neues Attribut', value: 5 });
    }
  });
}

function addCharacterInventoryItem(button) {
  rerenderCharacterInventoryEditor(button, data => {
    data.items.push({ name: 'Neuer Gegenstand', category: 'equipment', type: '', description: '', quantity: '1' });
  });
}

function removeCharacterInventoryItem(button) {
  const row = button.closest('[data-ci-item-row]');
  const index = getCharacterInventoryRowIndex(row, '[data-ci-item-row]');
  rerenderCharacterInventoryEditor(button, data => {
    if (index >= 0) data.items.splice(index, 1);
  });
}

function moveCharacterInventoryItem(button) {
  const row = button.closest('[data-ci-item-row]');
  const index = getCharacterInventoryRowIndex(row, '[data-ci-item-row]');
  const direction = Number(button.dataset.ciDirection || 0);
  rerenderCharacterInventoryEditor(button, data => {
    const target = index + direction;
    if (index < 0 || target < 0 || target >= data.items.length) return;
    const [item] = data.items.splice(index, 1);
    data.items.splice(target, 0, item);
  });
}

function duplicateCharacterInventoryItem(button) {
  const row = button.closest('[data-ci-item-row]');
  const index = getCharacterInventoryRowIndex(row, '[data-ci-item-row]');
  rerenderCharacterInventoryEditor(button, data => {
    const item = data.items[index];
    if (!item) return;
    const clone = JSON.parse(JSON.stringify(item));
    clone.id = '';
    clone.name = `${clone.name || 'Gegenstand'} Kopie`;
    data.items.splice(index + 1, 0, clone);
  });
}

function addCharacterInventoryCompanion(button) {
  rerenderCharacterInventoryEditor(button, data => {
    data.companions.push({ name: 'Neuer Gefaehrte', species: '', role: 'Begleiter', status: 'Gesund' });
  });
}

function removeCharacterInventoryCompanion(button) {
  const row = button.closest('[data-ci-companion-row]');
  const index = getCharacterInventoryRowIndex(row, '[data-ci-companion-row]');
  rerenderCharacterInventoryEditor(button, data => {
    if (index >= 0) data.companions.splice(index, 1);
  });
}

function moveCharacterInventoryCompanion(button) {
  const row = button.closest('[data-ci-companion-row]');
  const index = getCharacterInventoryRowIndex(row, '[data-ci-companion-row]');
  const direction = Number(button.dataset.ciDirection || 0);
  rerenderCharacterInventoryEditor(button, data => {
    const target = index + direction;
    if (index < 0 || target < 0 || target >= data.companions.length) return;
    const [companion] = data.companions.splice(index, 1);
    data.companions.splice(target, 0, companion);
  });
}

function duplicateCharacterInventoryCompanion(button) {
  const row = button.closest('[data-ci-companion-row]');
  const index = getCharacterInventoryRowIndex(row, '[data-ci-companion-row]');
  rerenderCharacterInventoryEditor(button, data => {
    const companion = data.companions[index];
    if (!companion) return;
    const clone = JSON.parse(JSON.stringify(companion));
    clone.id = '';
    clone.name = `${clone.name || 'Gefaehrte'} Kopie`;
    data.companions.splice(index + 1, 0, clone);
  });
}

let characterInventorySplitterState = null;

function startCharacterInventorySplitter(event, splitter) {
  const editor = splitter.closest('[data-ci-editor]');
  if (!editor) return;
  event.preventDefault();
  characterInventorySplitterState = { editor };
  document.body.classList.add('ci-resizing');
}

function moveCharacterInventorySplitter(event) {
  if (!characterInventorySplitterState?.editor) return;
  const editor = characterInventorySplitterState.editor;
  const rect = editor.getBoundingClientRect();
  const percent = Math.max(28, Math.min(68, ((event.clientX - rect.left) / rect.width) * 100));
  editor.style.setProperty('--ci-editor-width', `${percent}%`);
}

function stopCharacterInventorySplitter() {
  if (!characterInventorySplitterState) return;
  characterInventorySplitterState = null;
  document.body.classList.remove('ci-resizing');
}

document.addEventListener('pointerdown', event => {
  const splitter = event.target?.closest?.('.ci-editor-splitter');
  if (splitter) startCharacterInventorySplitter(event, splitter);
});
document.addEventListener('pointermove', moveCharacterInventorySplitter);
document.addEventListener('pointerup', stopCharacterInventorySplitter);
