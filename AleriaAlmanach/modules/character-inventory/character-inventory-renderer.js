function characterInventoryText(text) {
  return escapeHtml(text || '').replace(/\n/g, '<br>');
}

function getCharacterInventoryImageClass(className, options = {}) {
  const settings = sanitizeCharacterInventoryImageSettings(options);
  return [
    className,
    `ci-img-${settings.format}`,
    `ci-fit-${settings.fit}`,
    `ci-pos-${settings.position}`
  ].join(' ');
}

function buildCharacterInventoryImage(src, alt, className, fallback = '*', options = {}) {
  const image = sanitizeImageSrc(src || '');
  const imageClass = getCharacterInventoryImageClass(className, options);
  if (image) return `<img class="${imageClass}" src="${escapeHtml(image)}" alt="${escapeHtml(alt || '')}" data-ci-image-fallback="${escapeHtml(fallback || '*')}" loading="lazy" decoding="async" referrerpolicy="no-referrer">`;
  return `<div class="${imageClass} ci-placeholder">${escapeHtml(fallback || '*')}</div>`;
}

function buildCharacterInventoryAttributeGrid(attributes = []) {
  return `
    <div class="ci-attribute-grid">
      ${attributes.map(attribute => `
        <div class="ci-attribute-chip">
          <span>${escapeHtml(attribute.label)}</span>
          <strong>${escapeHtml(String(attribute.value))}</strong>
        </div>`).join('')}
    </div>`;
}

function buildCharacterInventoryInfoRows(rows = []) {
  return rows.map(row => `
    <div class="ci-info-row">
      <span>${escapeHtml(row.icon || '*')}</span>
      <em>${escapeHtml(row.label)}</em>
      <strong>${escapeHtml(row.value)}</strong>
    </div>`).join('');
}

function getCharacterInventoryItemDbCategory(item = {}) {
  const category = normalizeCharacterInventoryCategoryId(item.category || item.type || '');
  if (category === 'weapon') return 'waffen';
  if (category === 'armor') return 'ruestungen';
  if (category === 'potions') return 'alchemie';
  if (category === 'equipment') return 'werkzeuge';
  return 'sonstiges';
}

function getCharacterInventoryCategoryFromItemDb(item = {}) {
  const category = String(item.category || '').trim();
  if (category === 'waffen') return 'weapon';
  if (category === 'ruestungen') return 'armor';
  if (category === 'alchemie' || category === 'getraenke') return 'potions';
  if (category === 'werkzeuge') return 'equipment';
  return 'other';
}

function getCharacterInventoryOwner(data = {}) {
  return {
    ownerCharacterId: String(data.characterId || data.ownerCharacterId || '').trim(),
    ownerCharacterName: String(data.name || data.ownerCharacterName || '').trim()
  };
}

function buildCharacterInventoryItemFromDbItem(dbItem = {}, data = {}) {
  const meta = dbItem.hiddenMeta || {};
  const owner = getCharacterInventoryOwner(data);
  return sanitizeCharacterInventoryItems([{
    id: makeCharacterInventoryId('item-db', 0),
    instanceId: '',
    templateId: dbItem.templateId || dbItem.id || dbItem.canonicalKey,
    templateName: dbItem.title || '',
    registerCategory: dbItem.category || '',
    itemDbKey: '',
    originItemDbKey: dbItem.templateId || dbItem.id || dbItem.canonicalKey,
    itemStorageMode: 'character',
    combatDefinition: dbItem.combatDefinition || null,
    valuation: dbItem.priceRange || null,
    ownerCharacterId: owner.ownerCharacterId,
    ownerCharacterName: owner.ownerCharacterName,
    acquiredAt: new Date().toISOString(),
    category: meta.characterInventoryCategory || getCharacterInventoryCategoryFromItemDb(dbItem),
    icon: meta.characterInventoryIcon || '',
    image: dbItem.image || '',
    imageFormat: 'square',
    imageFit: 'contain',
    imagePosition: 'center',
    name: dbItem.title || 'Gegenstand',
    type: dbItem.type || dbItem.categoryLabel || '',
    description: dbItem.description || dbItem.details || '',
    weight: meta.weight || '',
    quantity: '1',
    tags: (dbItem.tags || []).join(', '),
    infoRows: Array.isArray(meta.characterInventoryInfoRows) ? meta.characterInventoryInfoRows : [],
    attributes: dbItem.attributes || []
  }])[0];
}

function getCharacterInventoryItemDbMatch(item = {}) {
  const key = String(item.itemDbKey || '').trim();
  if (!key) return null;
  return window.AleriaItemRegister?.getByKey(key) || (typeof itemDbBuildIndex === 'function' ? itemDbBuildIndex().find(candidate => candidate.canonicalKey === key) : null) || null;
}

function mergeCharacterInventoryItemWithDb(item = {}) {
  const match = getCharacterInventoryItemDbMatch(item);
  if (!match) return item;
  const infoRows = Array.isArray(match.hiddenMeta?.characterInventoryInfoRows)
    ? match.hiddenMeta.characterInventoryInfoRows
    : item.infoRows;
  return sanitizeCharacterInventoryItems([{
    ...item,
    itemDbKey: match.canonicalKey,
    itemStorageMode: 'linked',
    icon: item.icon || match.hiddenMeta?.characterInventoryIcon || '',
    image: match.image || item.image,
    type: match.type || item.type,
    description: match.description || match.details || item.description,
    tags: (match.tags || []).join(', ') || item.tags,
    infoRows,
    attributes: match.attributes?.length ? match.attributes : item.attributes
  }])[0] || item;
}

function mergeCharacterInventoryDataWithItemDb(data = {}) {
  const safeData = sanitizeCharacterInventoryData(data);
  const merged = {
    ...safeData,
    items: safeData.items.map(item => item.itemDbKey ? mergeCharacterInventoryItemWithDb(item) : item)
  };
  return window.AleriaCharacterInventory?.resolve(merged) || merged;
}

function buildCharacterInventoryRadar(attributes = [], className = '') {
  const list = sanitizeCharacterInventoryAttributes(attributes);
  if (!list.length) return '';
  const size = 230;
  const center = size / 2;
  const maxRadius = 72;
  const points = list.map((attribute, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / list.length;
    const valueRadius = maxRadius * (attribute.value / 10);
    const labelRadius = maxRadius + 28;
    return {
      ...attribute,
      x: center + Math.cos(angle) * valueRadius,
      y: center + Math.sin(angle) * valueRadius,
      lx: center + Math.cos(angle) * labelRadius,
      ly: center + Math.sin(angle) * labelRadius
    };
  });
  const polygon = points.map(point => `${point.x},${point.y}`).join(' ');
  const rings = [0.25, 0.5, 0.75, 1].map(step => {
    const ring = list.map((_, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / list.length;
      return `${center + Math.cos(angle) * maxRadius * step},${center + Math.sin(angle) * maxRadius * step}`;
    }).join(' ');
    return `<polygon points="${ring}" fill="none" stroke="rgba(139,105,20,0.24)" stroke-width="1"/>`;
  }).join('');
  const axes = list.map((_, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / list.length;
    return `<line x1="${center}" y1="${center}" x2="${center + Math.cos(angle) * maxRadius}" y2="${center + Math.sin(angle) * maxRadius}" stroke="rgba(139,105,20,0.24)" stroke-width="1"/>`;
  }).join('');
  return `
    <div class="ci-radar ${className}">
      <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Attribute">
        ${rings}
        ${axes}
        <polygon points="${polygon}" fill="rgba(111,46,35,0.26)" stroke="#6f2e23" stroke-width="3"/>
        ${points.map(point => `<circle cx="${point.x}" cy="${point.y}" r="3.8" fill="#6f2e23"/>`).join('')}
        ${points.map(point => `<text x="${point.lx}" y="${point.ly}" text-anchor="middle">${escapeHtml(point.label)}</text>`).join('')}
      </svg>
      <div class="ci-radar-bars">
        ${list.map(attribute => `
          <div class="ci-radar-bar">
            <span>${escapeHtml(attribute.label)}</span>
            <i><b style="width:${attribute.value * 10}%"></b></i>
            <strong>${escapeHtml(String(attribute.value))}</strong>
          </div>`).join('')}
      </div>
    </div>`;
}

function buildCharacterInventoryCategoryIcon(category = {}) {
  const icon = String(category.icon || '').trim();
  const image = sanitizeImageSrc(icon);
  if (/^https?:\/\//i.test(image) || /^data:image\//i.test(image)) {
    return `<img src="${escapeHtml(image)}" alt="" loading="lazy" decoding="async">`;
  }
  return `<span>${escapeHtml(icon || '*')}</span>`;
}

function buildCharacterInventoryCategories(data, activeCategory = '') {
  const counts = {};
  (data.items || []).forEach(item => {
    counts[item.category] = (counts[item.category] || 0) + 1;
  });
  return `
    <div class="ci-tabs" role="group" aria-label="Inventarkategorien">
      ${[{ id: '', label: 'Alle', icon: '◈' }, ...data.categories].map(category => `
        <button type="button" class="${category.id === activeCategory ? 'active' : ''}" data-ci-action="filter-items" data-ci-category="${escapeHtml(category.id)}" aria-pressed="${category.id === activeCategory ? 'true' : 'false'}">
          ${buildCharacterInventoryCategoryIcon(category)}${escapeHtml(category.label)}<em class="ci-tab-count">${category.id ? counts[category.id] || 0 : data.items.length}</em>
        </button>`).join('')}
    </div>`;
}

function buildCharacterInventoryMoneyPanel(data = {}, options = {}) {
  const money = sanitizeCharacterInventoryMoney(data.moneyState || data.money);
  const readOnly = options.readOnly === true;
  if (readOnly) {
    return `
    <section class="ci-money-panel ci-money-panel-readonly" aria-label="Geldbeutel">
      <div class="ci-money-head">
        <div>
          <h3>Geldbeutel</h3>
          <p>1 Gold = 10 Silber = 1.000 Kupfer · 1 Kupfer = 100 Eisenpfennig</p>
        </div>
        <strong>${escapeHtml(String(money.totalCopper))} Kupfer</strong>
      </div>
      <div class="ci-money-summary">
        ${CHARACTER_INVENTORY_CURRENCIES.map(currency => `
          <div class="ci-money-summary-item ci-coin-${escapeHtml(currency.id)}">
            <img src="${escapeHtml(currency.icon)}" alt="${escapeHtml(currency.label)}" loading="lazy" decoding="async">
            <span>${escapeHtml(currency.label)}</span>
            <strong>${escapeHtml(String(money[currency.id] || 0))}</strong>
          </div>`).join('')}
      </div>
      ${data.moneyNotice ? `<p class="ci-money-status">${escapeHtml(data.moneyNotice)}</p>` : ''}
    </section>`;
  }
  return `
    <section class="ci-money-panel" aria-label="Geldbeutel">
      <div class="ci-money-head">
        <div>
          <h3>Geldbeutel</h3>
          <p>1 Gold = 10 Silber = 1.000 Kupfer · 1 Kupfer = 100 Eisenpfennig</p>
        </div>
        <strong>${escapeHtml(String(money.totalCopper))} Kupfer</strong>
      </div>
      <div class="ci-money-grid">
        ${CHARACTER_INVENTORY_CURRENCIES.map(currency => `
          <label class="ci-money-control ci-coin-${escapeHtml(currency.id)}">
            <img src="${escapeHtml(currency.icon)}" alt="${escapeHtml(currency.label)}" loading="lazy" decoding="async">
            <span>${escapeHtml(currency.label)}</span>
            <input type="number" min="0" step="1" inputmode="numeric" data-ci-money-field="${escapeHtml(currency.id)}" value="${escapeHtml(String(money[currency.id] || 0))}">
          </label>`).join('')}
      </div>
      <div class="ci-money-transaction">
        <div class="ci-money-transaction-fields">
          ${CHARACTER_INVENTORY_CURRENCIES.map(currency => `
            <label>
              <span>${escapeHtml(currency.short)}</span>
              <input type="number" min="0" step="1" inputmode="numeric" data-ci-transaction-field="${escapeHtml(currency.id)}" value="0">
            </label>`).join('')}
        </div>
        <div class="ci-money-actions">
          <button type="button" data-ci-action="apply-money-transaction" data-ci-transaction-direction="add">Einzahlen</button>
          <button type="button" data-ci-action="apply-money-transaction" data-ci-transaction-direction="subtract">Ausgeben</button>
        </div>
      </div>
      ${data.moneyNotice ? `<p class="ci-money-status">${escapeHtml(data.moneyNotice)}</p>` : ''}
    </section>`;
}

function buildCharacterInventoryEquipmentQuiz(data = {}) {
  const quiz = sanitizeCharacterInventoryEquipmentQuiz(data.equipmentQuiz);
  const questions = CHARACTER_INVENTORY_EQUIPMENT_QUIZ_QUESTIONS;
  const step = Math.max(0, Math.min(questions.length - 1, quiz.step));
  const answered = quiz.answers.filter(Boolean).length;
  return `
    <section class="ci-equipment-quiz${quiz.open ? ' open' : ''}">
      <div class="ci-equipment-quiz-head">
        <div>
          <h3>AleriaGPT-Ausrüstungsfragebogen</h3>
          <p>${answered} von ${questions.length} Antworten gespeichert</p>
        </div>
        <button type="button" data-ci-action="toggle-equipment-quiz">${quiz.open ? 'Schließen' : 'Öffnen'}</button>
      </div>
      ${quiz.open ? `
        <div class="ci-equipment-quiz-body">
          <label class="ci-equipment-question">
            <span>Frage ${step + 1} / ${questions.length}</span>
            <strong>${escapeHtml(questions[step])}</strong>
            <textarea data-ci-quiz-answer>${escapeHtml(quiz.answers[step] || '')}</textarea>
          </label>
          <div class="ci-equipment-quiz-actions">
            <button type="button" data-ci-action="quiz-prev"${step <= 0 ? ' disabled' : ''}>Zurück</button>
            <button type="button" data-ci-action="quiz-save-answer">Antwort speichern</button>
            <button type="button" data-ci-action="quiz-next"${step >= questions.length - 1 ? ' disabled' : ''}>Weiter</button>
            <button type="button" data-ci-action="quiz-run-ai">Mit AleriaGPT auswerten</button>
          </div>
          ${quiz.status ? `<p class="ci-equipment-quiz-status">${escapeHtml(quiz.status)}</p>` : ''}
          ${quiz.resultText ? `<div class="ci-equipment-quiz-result">${characterInventoryText(quiz.resultText)}</div>` : ''}
        </div>` : ''}
    </section>`;
}

function buildCharacterInventoryItems(data, activeCategory = '', options = {}) {
  const items = data.items.filter(item => !window.AleriaCharacterInventory?.isCompanion(item));
  return `<section class="ci-center">
    <div class="ci-item-tools"><div><span class="ci-section-kicker">01 / Besitz & Ausrüstung</span><h3>Dein Verzeichnis</h3></div>
      ${options.readOnly ? '' : '<button class="ci-register-action" type="button" data-ci-action="equip-item-from-register">+ Aus dem Register</button>'}</div>
    <label class="ci-search"><span aria-hidden="true">⌕</span><input type="search" data-ci-search placeholder="Gegenstand suchen …" aria-label="Inventar durchsuchen"></label>
    ${buildCharacterInventoryCategories({ ...data, items }, activeCategory)}
    <div class="ci-item-table"><div class="ci-item-head"><span>Gegenstand</span><span>Handelspreis</span><span>Zustand</span><span>Anzahl</span></div>
      <div class="ci-item-list">${items.map(item => `<div class="ci-item-row" data-ci-item-id="${escapeHtml(item.id)}" data-ci-category="${escapeHtml(item.category)}"${!activeCategory || item.category === activeCategory ? '' : ' hidden'}>
        <button class="ci-item-select" type="button" data-ci-action="select-item" data-ci-item-id="${escapeHtml(item.id)}" aria-pressed="false">
          ${buildCharacterInventoryImage(item.image, item.name, 'ci-item-icon', '◈', { format: 'square', fit: 'contain' })}
          <span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.type || 'Gegenstand')}${item.weight && item.weight !== 'Noch festlegen' ? ' · ' + escapeHtml(item.weight) : ''}</small></span>
        </button>
        <span class="ci-item-price" title="Handelspreis je Stück">${escapeHtml(window.AleriaCharacterInventory?.card(item).price || 'Preis offen')}</span>
        <span class="ci-item-state${item.equipped ? ' is-equipped' : ''}">${item.equipped ? 'Ausgerüstet' : 'Im Gepäck'}</span>
        <span class="ci-item-quantity">${escapeHtml(item.quantity)}×</span>
        <button class="ci-item-card-button" type="button" data-ci-action="show-item" data-ci-item-id="${escapeHtml(item.id)}" aria-label="Itemkarte: ${escapeHtml(item.name)}">↗</button>
      </div>`).join('')}</div>
      <div class="ci-item-empty" data-ci-empty${items.some(item => !activeCategory || item.category === activeCategory) ? ' hidden' : ''}>Keine passenden Gegenstände.</div>
    </div>
    ${options.readOnly ? '' : buildCharacterInventoryEquipmentQuiz(data)}
  </section>`;
}

function buildCharacterInventoryCompanions(data) {
  const companions = window.AleriaCharacterInventory?.companions(data) || data.companions;
  return `<section class="ci-companions"><div class="ci-section-heading"><div><span class="ci-section-kicker">03 / An deiner Seite</span><h3>Gefährten</h3></div><span class="ci-section-count">${companions.length}</span></div>
    <div class="ci-companion-list">${companions.map(companion => `<button class="ci-companion-card" type="button" data-ci-action="show-companion" data-ci-companion-id="${escapeHtml(companion.id)}">
      ${buildCharacterInventoryImage(companion.image, companion.name, 'ci-companion-image', '♞', { format: 'square', fit: 'contain' })}
      <div class="ci-companion-heading"><strong>${escapeHtml(companion.name)}</strong><span>${escapeHtml(companion.species || companion.role)}</span><small>${companion.creatureId ? 'Mit Kreaturbogen verbunden' : 'Gefährtenkarte öffnen'} ↗</small></div>
    </button>`).join('') || '<p class="ci-companion-empty">Noch keine Gefährten eingetragen.</p>'}</div>
  </section>`;
}



function getCharacterInventoryPageData(page) {
  try {
    return sanitizeCharacterInventoryData(JSON.parse(page?.dataset?.ciData || '{}'));
  } catch (error) {
    console.warn('Character inventory data could not be read:', error);
    return sanitizeCharacterInventoryData({});
  }
}

function collectCharacterInventoryModalItem(modal, fallback = {}) {
  const read = field => String(modal.querySelector(`[data-ci-modal-field="${field}"]`)?.value || '').trim();
  const infoRows = Array.from(modal.querySelectorAll('[data-ci-modal-info-row]')).map(row => ({
    icon: String(row.querySelector('[data-ci-modal-field="infoIcon"]')?.value || '').trim(),
    label: String(row.querySelector('[data-ci-modal-field="infoLabel"]')?.value || '').trim(),
    value: String(row.querySelector('[data-ci-modal-field="infoValue"]')?.value || '').trim()
  }));
  const attributes = Array.from(modal.querySelectorAll('[data-ci-modal-attribute-row]')).map(row => ({
    label: String(row.querySelector('[data-ci-modal-field="attributeLabel"]')?.value || '').trim(),
    value: Number(row.querySelector('[data-ci-modal-field="attributeValue"]')?.value || 0)
  }));
  const customized = !!fallback.itemDbKey;
  return sanitizeCharacterInventoryItems([{
    ...fallback,
    itemDbKey: customized ? '' : fallback.itemDbKey,
    originItemDbKey: customized ? fallback.itemDbKey : fallback.originItemDbKey,
    itemStorageMode: 'character',
    individualizedAt: customized ? new Date().toISOString() : fallback.individualizedAt,
    name: read('name') || fallback.name,
    valuation: collectCharacterInventoryPrice(read('priceMin'), read('priceMax')),
    valuationNote: read('valuationNote'),
    type: read('type'),
    image: read('image'),
    imageFormat: read('imageFormat') || fallback.imageFormat,
    imageFit: read('imageFit') || fallback.imageFit,
    imagePosition: read('imagePosition') || fallback.imagePosition,
    tags: read('tags'),
    description: read('description'),
    infoRows,
    attributes
  }])[0] || fallback;
}

function collectCharacterInventoryModalCompanion(modal, fallback = {}) {
  const read = field => String(modal.querySelector(`[data-ci-modal-field="${field}"]`)?.value || '').trim();
  const infoRows = Array.from(modal.querySelectorAll('[data-ci-modal-info-row]')).map(row => ({
    icon: String(row.querySelector('[data-ci-modal-field="infoIcon"]')?.value || '').trim(),
    label: String(row.querySelector('[data-ci-modal-field="infoLabel"]')?.value || '').trim(),
    value: String(row.querySelector('[data-ci-modal-field="infoValue"]')?.value || '').trim()
  }));
  const attributes = Array.from(modal.querySelectorAll('[data-ci-modal-attribute-row]')).map(row => ({
    label: String(row.querySelector('[data-ci-modal-field="attributeLabel"]')?.value || '').trim(),
    value: Number(row.querySelector('[data-ci-modal-field="attributeValue"]')?.value || 0)
  }));
  return sanitizeCharacterInventoryCompanions([{
    ...fallback,
    name: read('name') || fallback.name,
    species: read('species'),
    role: read('role'),
    status: read('status'),
    statusColor: read('statusColor') || fallback.statusColor,
    image: read('image'),
    imageFormat: read('imageFormat') || fallback.imageFormat,
    imageFit: read('imageFit') || fallback.imageFit,
    imagePosition: read('imagePosition') || fallback.imagePosition,
    summary: read('summary'),
    description: read('description'),
    infoRows,
    attributes
  }])[0] || fallback;
}

function updateCharacterInventoryModalPreview(modal) {
  if (!modal) return;
  const page = modal.closest('.character-inventory-page');
  const data = getCharacterInventoryPageData(page);
  const item = data.items.find(entry => entry.id === modal?.dataset.ciEditingItem);
  const companion = data.companions.find(entry => entry.id === modal?.dataset.ciEditingCompanion);
  if (!item && !companion) return;
  const current = item
    ? collectCharacterInventoryModalItem(modal, item)
    : collectCharacterInventoryModalCompanion(modal, companion);
  const preview = modal.querySelector('.ci-modal-live-preview');
  const infoPreview = modal.querySelector('.ci-modal-info-preview');
  if (preview) preview.innerHTML = item
    ? buildCharacterInventoryItemPreview(current)
    : buildCharacterInventoryCompanionPreview(current);
  if (infoPreview) infoPreview.innerHTML = buildCharacterInventoryInfoRows(current.infoRows);
  const summaryPreview = modal.querySelector('.ci-modal-summary-preview');
  if (summaryPreview && !item) summaryPreview.innerHTML = characterInventoryText(current.summary);
  const image = modal.querySelector('.ci-profile-image');
  if (image) {
    image.outerHTML = buildCharacterInventoryImage(current.image || current.icon, current.name, 'ci-profile-image', getInitialChar(current.name), {
      format: current.imageFormat || (item ? 'square' : 'portrait'),
      fit: current.imageFit || (item ? 'contain' : 'cover'),
      position: current.imagePosition || (item ? 'center' : 'top')
    });
  }
}

function getCharacterInventoryItemDbUpdates(item = {}) {
  return {
    title: item.name,
    category: getCharacterInventoryItemDbCategory(item),
    type: item.type,
    description: item.description,
    details: item.description,
    image: item.image || item.icon || '',
    tags: item.tags,
    attributes: item.attributes,
    priceRange: item.valuation,
    price: item.valuation ? String(item.valuation.minCopper === item.valuation.maxCopper ? item.valuation.minCopper : `${item.valuation.minCopper}–${item.valuation.maxCopper}`) : '',
    currency: 'K',
    hiddenMeta: {
      characterInventoryInfoRows: item.infoRows,
      characterInventoryCategory: item.category,
      characterInventoryIcon: item.icon || '',
      originItemDbKey: item.originItemDbKey || item.itemDbKey || '',
      ownerCharacterId: item.ownerCharacterId || '',
      ownerCharacterName: item.ownerCharacterName || ''
    }
  };
}

function saveCharacterInventoryItemToItemDb(item = {}) {
  // The character inventory is the authoritative individual list. Publishing a
  // second template here used to duplicate and detach customized possessions.
  return sanitizeCharacterInventoryItems([{
    ...item,
    instanceId: item.instanceId || item.id,
    templateId: item.templateId || item.originItemDbKey || item.itemDbKey || '',
    itemDbKey: '',
    originItemDbKey: item.originItemDbKey || item.itemDbKey || '',
    itemStorageMode: 'character',
    individualizedAt: item.individualizedAt || new Date().toISOString()
  }])[0] || item;
}

function updateCharacterInventoryPageItem(page, item) {
  const data = getCharacterInventoryPageData(page);
  const index = data.items.findIndex(entry => entry.id === item.id);
  if (index < 0) return item;
  data.items[index] = sanitizeCharacterInventoryItems([item])[0] || item;
  const merged = mergeCharacterInventoryDataWithItemDb(data);
  page.dataset.ciData = JSON.stringify(data);
  const active = page.querySelector('[data-ci-action="filter-items"].active')?.dataset.ciCategory || merged.categories[0]?.id || '';
  const center = page.querySelector('.ci-center');
  if (center) center.outerHTML = buildCharacterInventoryItems(merged, active, { readOnly: page.dataset.ciReadonly === 'true' });
  if (typeof filterCharacterInventoryItems === 'function') filterCharacterInventoryItems(page);
  if (typeof syncCharacterInventoryProfileDraftFromPage === 'function') syncCharacterInventoryProfileDraftFromPage(page);
  return merged.items.find(entry => entry.id === item.id) || item;
}

function addCharacterInventoryPageItem(page, item) {
  const data = getCharacterInventoryPageData(page);
  const safeItem = sanitizeCharacterInventoryItems([{
    ...item,
    ownerCharacterId: item.ownerCharacterId || data.characterId || '',
    ownerCharacterName: item.ownerCharacterName || data.name || ''
  }])[0];
  if (!safeItem) return null;
  data.items.push(safeItem);
  const merged = mergeCharacterInventoryDataWithItemDb(data);
  page.dataset.ciData = JSON.stringify(data);
  const itemCount = page.querySelector('[data-ci-item-count]');
  if (itemCount) itemCount.textContent = String(merged.items.length);
  const active = safeItem.category || page.querySelector('[data-ci-action="filter-items"].active')?.dataset.ciCategory || merged.categories[0]?.id || '';
  const center = page.querySelector('.ci-center');
  if (center) center.outerHTML = buildCharacterInventoryItems(merged, active, { readOnly: page.dataset.ciReadonly === 'true' });
  if (typeof filterCharacterInventoryItems === 'function') filterCharacterInventoryItems(page);
  if (typeof syncCharacterInventoryProfileDraftFromPage === 'function') syncCharacterInventoryProfileDraftFromPage(page);
  return merged.items.find(entry => entry.id === safeItem.id) || safeItem;
}

function openCharacterInventoryItemRegisterPicker(page) {
  if (typeof openItemDbPicker !== 'function') {
    if (typeof showAppStatus === 'function') showAppStatus('Item-Register ist nicht verfuegbar.', 'error');
    return;
  }
  const data = getCharacterInventoryPageData(page);
  openItemDbPicker({
    title: `Item für ${data.name || 'Charakter'} hinzufügen`,
    onSelect: item => {
      const equipped = buildCharacterInventoryItemFromDbItem(item, data);
      const added = addCharacterInventoryPageItem(page, equipped);
      if (added && typeof showAppStatus === 'function') showAppStatus(`${added.name} aus dem Register hinzugefügt.`, 'success');
    }
  });
}

function updateCharacterInventoryPageCompanion(page, companion) {
  const data = getCharacterInventoryPageData(page);
  const index = data.companions.findIndex(entry => entry.id === companion.id);
  if (index < 0) return companion;
  data.companions[index] = sanitizeCharacterInventoryCompanions([companion])[0] || companion;
  const merged = mergeCharacterInventoryDataWithItemDb(data);
  page.dataset.ciData = JSON.stringify(data);
  const companions = page.querySelector('.ci-companions');
  if (companions) companions.outerHTML = buildCharacterInventoryCompanions(merged);
  if (typeof syncCharacterInventoryProfileDraftFromPage === 'function') syncCharacterInventoryProfileDraftFromPage(page);
  return merged.companions.find(entry => entry.id === companion.id) || companion;
}

function getCharacterInventoryMoneyInputs(container) {
  const values = {};
  CHARACTER_INVENTORY_CURRENCIES.forEach(currency => {
    values[currency.id] = parseCharacterInventoryInt(container?.querySelector(`[data-ci-money-field="${currency.id}"]`)?.value || 0);
  });
  return values;
}

function getCharacterInventoryTransactionAmount(container) {
  return CHARACTER_INVENTORY_CURRENCIES.reduce((sum, currency) => {
    const value = parseCharacterInventoryInt(container?.querySelector(`[data-ci-transaction-field="${currency.id}"]`)?.value || 0);
    return sum + value * currency.value;
  }, 0);
}

function updateCharacterInventoryPageMoney(page, moneyState, notice = '') {
  const data = getCharacterInventoryPageData(page);
  data.moneyState = sanitizeCharacterInventoryMoney(moneyState);
  data.money = formatCharacterInventoryMoney(data.moneyState);
  data.moneyNotice = notice;
  const merged = mergeCharacterInventoryDataWithItemDb(data);
  page.dataset.ciData = JSON.stringify(data);
  const panel = page.querySelector('.ci-money-panel');
  if (panel) panel.outerHTML = buildCharacterInventoryMoneyPanel(merged);
  const infoRows = page.querySelector('.ci-character .ci-box');
  if (infoRows) infoRows.innerHTML = `<h3>Infotabelle</h3>${buildCharacterInventoryInfoRows(merged.infoRows)}`;
  if (typeof syncCharacterInventoryProfileDraftFromPage === 'function') syncCharacterInventoryProfileDraftFromPage(page);
  return merged.moneyState;
}

window.CharacterInventoryMoney = {
  currencies: CHARACTER_INVENTORY_CURRENCIES,
  getTotalCopper: getCharacterInventoryMoneyTotal,
  splitCopper: splitCharacterInventoryCopper,
  sanitize: sanitizeCharacterInventoryMoney,
  format: formatCharacterInventoryMoney
};

function buildCharacterInventoryPage(page, entry, pageIndex, total) {
  const nav = page?.hideNav ? '' : buildNav(page, pageIndex, total);
  const raw = sanitizeCharacterInventoryData(page.characterInventory || {});
  const data = mergeCharacterInventoryDataWithItemDb(raw);
  const readOnly = page?.characterInventoryReadOnly === true;
  const first = data.items.find(item => !window.AleriaCharacterInventory?.isCompanion(item));
  return `${nav}<div class="character-inventory-page${readOnly ? ' read-only' : ''}" data-ci-data="${escapeHtml(JSON.stringify(raw))}" data-ci-readonly="${readOnly}" data-ci-selected-id="${escapeHtml(first?.id || '')}">
    <header class="ci-header">
      <div class="ci-owner">${buildCharacterInventoryImage(data.portrait, data.name, 'ci-owner-avatar', getInitialChar(data.name), { format: 'square', fit: 'cover', position: 'top' })}<div><span class="ci-section-kicker">${escapeHtml(data.name)}</span><h2>${escapeHtml(data.title)}</h2><p>${escapeHtml(data.role)}</p></div></div>
      <div class="ci-overview"><span><strong data-ci-item-count>${data.items.length}</strong> Besitztümer</span><button type="button" data-ci-action="open-item-register">Handelsregister ↗</button></div>
    </header>
    <div class="ci-layout">
      <div class="ci-main-column">${buildCharacterInventoryItems(data, '', { readOnly })}${buildCharacterInventoryMoneyPanel(data, { readOnly })}${buildCharacterInventoryCompanions(data)}${data.showInfoTable ? '<details class="ci-box ci-character"><summary>Charakterinformationen</summary>' + buildCharacterInventoryInfoRows(data.infoRows) + '</details>' : ''}</div>
      <aside class="ci-live-preview" aria-label="Vorschau des ausgewählten Gegenstands" aria-live="polite">${first && window.AleriaCharacterInventory ? buildCharacterInventoryLivePreview(first) : ''}</aside>
    </div><dialog class="ci-profile-overlay" aria-label="Inventarkarte"></dialog>
  </div>`;
}
