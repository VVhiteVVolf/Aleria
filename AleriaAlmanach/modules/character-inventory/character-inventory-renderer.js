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
  if (image) return `<img class="${imageClass}" src="${image}" alt="${escapeHtml(alt || '')}" loading="lazy" decoding="async">`;
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
    itemDbKey: dbItem.canonicalKey,
    itemStorageMode: 'linked',
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
  if (typeof itemDbBuildIndex !== 'function') return null;
  const key = String(item.itemDbKey || '').trim();
  if (!key) return null;
  return itemDbBuildIndex().find(candidate => candidate.canonicalKey === key) || null;
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
  return {
    ...safeData,
    items: safeData.items.map(item => item.itemDbKey ? mergeCharacterInventoryItemWithDb(item) : item)
  };
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
      ${data.categories.map(category => `
        <button type="button" class="${category.id === activeCategory ? 'active' : ''}" data-ci-action="filter-items" data-ci-category="${escapeHtml(category.id)}" aria-pressed="${category.id === activeCategory ? 'true' : 'false'}">
          ${buildCharacterInventoryCategoryIcon(category)}${escapeHtml(category.label)}<em class="ci-tab-count">${counts[category.id] || 0}</em>
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
          <p>1 Gold = 10 Silber = 1.000 Kupfer</p>
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
          <p>1 Gold = 10 Silber = 1.000 Kupfer</p>
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
  const readOnly = options.readOnly === true;
  const tools = readOnly ? '' : `
      <div class="ci-item-tools">
        <div>
          <h3>Inventar</h3>
          <p>Gegenstände aus dem Register übernehmen oder direkt im Editor pflegen.</p>
        </div>
        <button class="ci-register-action" type="button" data-ci-action="equip-item-from-register">
          <span class="ci-register-action-icon" aria-hidden="true">+</span>
          <span>
            <strong>Item aus Register</strong>
            <small>zum Charakter hinzufügen</small>
          </span>
        </button>
      </div>`;
  return `
    <section class="ci-center">
      ${tools}
      ${buildCharacterInventoryCategories(data, activeCategory)}
      <div class="ci-item-table">
        <div class="ci-item-head">
          <span>Name</span><span>Typ</span><span>Beschreibung</span><span>Gewicht</span><span>Anzahl</span>
        </div>
        <div class="ci-item-list">
          ${data.items.map(item => `
            <button class="ci-item-row" type="button" data-ci-action="show-item" data-ci-item-id="${escapeHtml(item.id)}" data-ci-category="${escapeHtml(item.category)}"${item.category === activeCategory ? '' : ' hidden'}>
              <span class="ci-item-name">${buildCharacterInventoryImage(item.icon || item.image, item.name, 'ci-item-icon', '*', {
                format: item.imageFormat || 'square',
                fit: item.imageFit || 'contain',
                position: item.imagePosition || 'center'
              })}<strong>${escapeHtml(item.name)}</strong></span>
              <span class="ci-item-type" data-label="Typ">${escapeHtml(item.type || '—')}</span>
              <span class="ci-item-description" data-label="Beschreibung">${escapeHtml(item.description || '—')}</span>
              <span class="ci-item-weight" data-label="Gewicht">${escapeHtml(item.weight || '—')}</span>
              <span class="ci-item-quantity" data-label="Anzahl">${escapeHtml(item.quantity)}</span>
            </button>`).join('')}
        </div>
        <div class="ci-item-empty" data-ci-empty${data.items.some(item => item.category === activeCategory) ? ' hidden' : ''}>Keine Gegenstände in dieser Kategorie.</div>
      </div>
      ${buildCharacterInventoryMoneyPanel(data, { readOnly })}
      ${readOnly ? '' : buildCharacterInventoryEquipmentQuiz(data)}
    </section>`;
}

function buildCharacterInventoryCompanions(data) {
  return `
    <aside class="ci-companions">
      <h3>Gefährten <span class="ci-section-count">${data.companions.length}</span></h3>
      <div class="ci-companion-list">
        ${data.companions.map(companion => `
          <button class="ci-companion-card" type="button" data-ci-action="show-companion" data-ci-companion-id="${escapeHtml(companion.id)}" aria-label="${escapeHtml(companion.name)} – Gefährtenprofil öffnen">
            ${buildCharacterInventoryImage(companion.image, companion.name, 'ci-companion-image', getInitialChar(companion.name), {
              format: 'portrait', fit: 'contain', position: 'center'
            })}
            <div class="ci-companion-heading">
              <strong>${escapeHtml(companion.name)}</strong>
              <span>${escapeHtml(companion.species || companion.role)}</span>
            </div>
            <dl>
              <dt>Status</dt><dd style="--ci-status:${escapeHtml(companion.statusColor)}">${escapeHtml(companion.status)}</dd>
              ${companion.role ? `<dt>Rolle</dt><dd>${escapeHtml(companion.role)}</dd>` : ''}
            </dl>
            ${companion.summary ? `<p class="ci-companion-summary">${escapeHtml(companion.summary)}</p>` : ''}
            <small class="ci-companion-link">Profil ansehen <span aria-hidden="true">↗</span></small>
          </button>`).join('')}
        ${data.companions.length ? '' : '<p class="ci-companion-empty">Noch keine Gefährten eingetragen.</p>'}
      </div>
    </aside>`;
}

function buildCharacterInventoryLeft(data) {
  const infoBox = data.showInfoTable ? `
      <section class="ci-box">
        <h3>Infotabelle</h3>
        ${buildCharacterInventoryInfoRows(data.infoRows)}
      </section>` : '';
  return `
    <aside class="ci-character">
      <div class="ci-character-head">
        <strong>${escapeHtml(data.name)}</strong>
        <span>${escapeHtml([data.role, data.level].filter(Boolean).join(' - '))}</span>
      </div>
      ${buildCharacterInventoryImage(data.portrait, data.name, 'ci-character-portrait', getInitialChar(data.name), {
        format: data.portraitFormat || 'portrait',
        fit: data.portraitFit || 'cover',
        position: data.portraitPosition || 'top'
      })}
      ${infoBox}
    </aside>`;
}

function buildCharacterInventoryModalInfoRowsEditor(rows = [], owner = 'item') {
  const removeAction = owner === 'companion' ? 'remove-companion-info-row' : 'remove-item-info-row';
  return (Array.isArray(rows) ? rows : []).map(row => `
    <div class="ci-modal-edit-row" data-ci-modal-info-row>
      <input type="text" data-ci-modal-field="infoIcon" value="${escapeHtml(row.icon || '')}" placeholder="Icon">
      <input type="text" data-ci-modal-field="infoLabel" value="${escapeHtml(row.label || '')}" placeholder="Label">
      <input type="text" data-ci-modal-field="infoValue" value="${escapeHtml(row.value || '')}" placeholder="Wert">
      <button type="button" data-ci-action="${removeAction}">Löschen</button>
    </div>`).join('');
}

function buildCharacterInventoryModalAttributeEditor(attributes = [], owner = 'item') {
  const removeAction = owner === 'companion' ? 'remove-companion-attribute-row' : 'remove-item-attribute-row';
  return (Array.isArray(attributes) ? attributes : []).map(attribute => `
    <div class="ci-modal-edit-row compact" data-ci-modal-attribute-row>
      <input type="text" data-ci-modal-field="attributeLabel" value="${escapeHtml(attribute.label || '')}" placeholder="Diagramm-Reiter">
      <input type="number" min="0" max="10" step="1" data-ci-modal-field="attributeValue" value="${escapeHtml(attribute.value ?? 5)}" placeholder="Wert">
      <button type="button" data-ci-action="${removeAction}">Löschen</button>
    </div>`).join('');
}

function buildCharacterInventoryModalImageSettings(data = {}, fallback = {}) {
  const settings = sanitizeCharacterInventoryImageSettings({
    format: data.imageFormat || fallback.format,
    fit: data.imageFit || fallback.fit,
    position: data.imagePosition || fallback.position
  });
  const select = (field, label, value, options) => `
    <label>
      <span>${escapeHtml(label)}</span>
      <select data-ci-modal-field="${escapeHtml(field)}">
        ${options.map(option => `<option value="${escapeHtml(option.value)}"${option.value === value ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}
      </select>
    </label>`;
  return `
    ${select('imageFormat', 'Bildformat', settings.format, [
      { value: 'portrait', label: 'Hochformat' },
      { value: 'square', label: 'Quadratisch' },
      { value: 'landscape', label: 'Querformat' },
      { value: 'wide', label: 'Breitbild' }
    ])}
    ${select('imageFit', 'Bildfüllung', settings.fit, [
      { value: 'cover', label: 'Füllen / zuschneiden' },
      { value: 'contain', label: 'Ganzes Bild' }
    ])}
    ${select('imagePosition', 'Ausschnitt', settings.position, [
      { value: 'top', label: 'Oben' },
      { value: 'center', label: 'Mitte' },
      { value: 'bottom', label: 'Unten' },
      { value: 'left', label: 'Links' },
      { value: 'right', label: 'Rechts' }
    ])}`;
}

function buildCharacterInventoryItemPreview(item) {
  return `
    <div class="ci-profile-main">
      <h3>${escapeHtml(item.name)}</h3>
      <p>${characterInventoryText(item.description)}</p>
      ${item.tags ? `<div class="ci-tag-line">${escapeHtml(item.tags)}</div>` : ''}
    </div>
    <div class="ci-profile-radar">${buildCharacterInventoryRadar(item.attributes)}</div>`;
}

function buildCharacterInventoryItemEditModal(item) {
  const imageValue = item.image || (/^https?:\/\//i.test(String(item.icon || '')) ? item.icon : '');
  return `
    <article class="ci-profile-modal ci-profile-modal-editing" data-ci-editing-item="${escapeHtml(item.id)}">
      <button class="ci-modal-close" type="button" data-ci-action="close-profile">x</button>
      <div class="ci-profile-media">
        ${buildCharacterInventoryImage(item.image || item.icon, item.name, 'ci-profile-image', '*', {
          format: item.imageFormat || 'square',
          fit: item.imageFit || 'contain',
          position: item.imagePosition || 'center'
        })}
        <div class="ci-box ci-modal-info-preview">${buildCharacterInventoryInfoRows(item.infoRows)}</div>
      </div>
      <div class="ci-modal-edit-form">
        <h3>${escapeHtml(item.name)}</h3>
        <label><span>Name</span><input type="text" data-ci-modal-field="name" value="${escapeHtml(item.name)}"></label>
        <label><span>Typ</span><input type="text" data-ci-modal-field="type" value="${escapeHtml(item.type)}"></label>
        <label><span>Bild-URL</span><input type="url" data-ci-modal-field="image" value="${escapeHtml(imageValue)}" placeholder="https://..."></label>
        ${buildCharacterInventoryModalImageSettings(item, { format: 'square', fit: 'contain', position: 'center' })}
        <label><span>Tags</span><input type="text" data-ci-modal-field="tags" value="${escapeHtml(item.tags)}"></label>
        <label class="wide"><span>Beschreibung</span><textarea data-ci-modal-field="description">${escapeHtml(item.description)}</textarea></label>
        <section>
          <div class="ci-modal-edit-head"><strong>Infotabelle</strong><button type="button" data-ci-action="add-item-info-row">+ Zeile</button></div>
          <div class="ci-modal-edit-list" data-ci-modal-info-list>${buildCharacterInventoryModalInfoRowsEditor(item.infoRows)}</div>
        </section>
        <section>
          <div class="ci-modal-edit-head"><strong>Diagramm</strong><button type="button" data-ci-action="add-item-attribute-row">+ Wert</button></div>
          <div class="ci-modal-edit-list" data-ci-modal-attribute-list>${buildCharacterInventoryModalAttributeEditor(item.attributes)}</div>
        </section>
        <div class="ci-modal-actions">
          <button type="button" data-ci-action="cancel-item-edit">Abbrechen</button>
          <button type="button" data-ci-action="save-item-local">Im Charakter speichern</button>
          <button type="button" data-ci-action="save-item-global">Im Item-Verzeichnis speichern</button>
        </div>
      </div>
      <div class="ci-modal-live-preview" aria-live="polite">
        ${buildCharacterInventoryItemPreview(item)}
      </div>
    </article>`;
}

function buildCharacterInventoryItemModal(item, options = {}) {
  const actions = options.readOnly ? '' : `
      <div class="ci-modal-actions floating">
        <button type="button" data-ci-action="edit-item">Bearbeiten</button>
      </div>`;
  return `
    <article class="ci-profile-modal" data-ci-item-id="${escapeHtml(item.id)}">
      <button class="ci-modal-close" type="button" data-ci-action="close-profile">x</button>
      ${actions}
      <div class="ci-profile-media">
        ${buildCharacterInventoryImage(item.image || item.icon, item.name, 'ci-profile-image', '*', {
          format: item.imageFormat || 'square',
          fit: item.imageFit || 'contain',
          position: item.imagePosition || 'center'
        })}
        <div class="ci-box">${buildCharacterInventoryInfoRows(item.infoRows)}</div>
      </div>
      ${buildCharacterInventoryItemPreview(item)}
    </article>`;
}

function buildCharacterInventoryCompanionModal(companion, options = {}) {
  const actions = options.readOnly ? '' : `
      <div class="ci-modal-actions floating">
        <button type="button" data-ci-action="edit-companion">Bearbeiten</button>
      </div>`;
  return `
    <article class="ci-profile-modal companion" data-ci-companion-id="${escapeHtml(companion.id)}">
      <button class="ci-modal-close" type="button" data-ci-action="close-profile">x</button>
      ${actions}
      <div class="ci-profile-media">
        ${buildCharacterInventoryImage(companion.image, companion.name, 'ci-profile-image ci-companion-portrait', getInitialChar(companion.name), {
          format: 'portrait', fit: 'contain', position: 'center'
        })}
        <p>${characterInventoryText(companion.summary)}</p>
      </div>
      <div class="ci-profile-main">
        <h3>${escapeHtml(companion.name)}</h3>
        <div class="ci-box">${buildCharacterInventoryInfoRows(companion.infoRows)}</div>
        <p>${characterInventoryText(companion.description)}</p>
      </div>
      <div class="ci-profile-radar">${buildCharacterInventoryRadar(companion.attributes)}</div>
    </article>`;
}

function buildCharacterInventoryCompanionPreview(companion) {
  return `
    <div class="ci-profile-main">
      <h3>${escapeHtml(companion.name)}</h3>
      <div class="ci-box">${buildCharacterInventoryInfoRows(companion.infoRows)}</div>
      <p>${characterInventoryText(companion.description)}</p>
    </div>
    <div class="ci-profile-radar">${buildCharacterInventoryRadar(companion.attributes)}</div>`;
}

function buildCharacterInventoryCompanionEditModal(companion) {
  return `
    <article class="ci-profile-modal ci-profile-modal-editing companion" data-ci-editing-companion="${escapeHtml(companion.id)}">
      <button class="ci-modal-close" type="button" data-ci-action="close-profile">x</button>
      <div class="ci-profile-media">
        ${buildCharacterInventoryImage(companion.image, companion.name, 'ci-profile-image', getInitialChar(companion.name), {
          format: companion.imageFormat || 'portrait',
          fit: companion.imageFit || 'cover',
          position: companion.imagePosition || 'top'
        })}
        <p class="ci-modal-summary-preview">${characterInventoryText(companion.summary)}</p>
        <div class="ci-box ci-modal-info-preview">${buildCharacterInventoryInfoRows(companion.infoRows)}</div>
      </div>
      <div class="ci-modal-edit-form">
        <h3>${escapeHtml(companion.name)}</h3>
        <label><span>Name</span><input type="text" data-ci-modal-field="name" value="${escapeHtml(companion.name)}"></label>
        <label><span>Art / Spezies</span><input type="text" data-ci-modal-field="species" value="${escapeHtml(companion.species)}"></label>
        <label><span>Rolle</span><input type="text" data-ci-modal-field="role" value="${escapeHtml(companion.role)}"></label>
        <label><span>Status</span><input type="text" data-ci-modal-field="status" value="${escapeHtml(companion.status)}"></label>
        <label><span>Statusfarbe</span><input type="text" data-ci-modal-field="statusColor" value="${escapeHtml(companion.statusColor)}"></label>
        <label><span>Bild-URL</span><input type="url" data-ci-modal-field="image" value="${escapeHtml(companion.image)}" placeholder="https://..."></label>
        ${buildCharacterInventoryModalImageSettings(companion, { format: 'portrait', fit: 'cover', position: 'top' })}
        <label class="wide"><span>Kurztext</span><textarea data-ci-modal-field="summary">${escapeHtml(companion.summary)}</textarea></label>
        <label class="wide"><span>Beschreibung</span><textarea data-ci-modal-field="description">${escapeHtml(companion.description)}</textarea></label>
        <section>
          <div class="ci-modal-edit-head"><strong>Infotabelle</strong><button type="button" data-ci-action="add-companion-info-row">+ Zeile</button></div>
          <div class="ci-modal-edit-list" data-ci-modal-info-list>${buildCharacterInventoryModalInfoRowsEditor(companion.infoRows, 'companion')}</div>
        </section>
        <section>
          <div class="ci-modal-edit-head"><strong>Diagramm</strong><button type="button" data-ci-action="add-companion-attribute-row">+ Wert</button></div>
          <div class="ci-modal-edit-list" data-ci-modal-attribute-list>${buildCharacterInventoryModalAttributeEditor(companion.attributes, 'companion')}</div>
        </section>
        <div class="ci-modal-actions">
          <button type="button" data-ci-action="cancel-companion-edit">Abbrechen</button>
          <button type="button" data-ci-action="save-companion-profile">Gefährtenprofil speichern</button>
        </div>
      </div>
      <div class="ci-modal-live-preview" aria-live="polite">
        ${buildCharacterInventoryCompanionPreview(companion)}
      </div>
    </article>`;
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
  if (typeof itemDbCreateCustomItem !== 'function') return item;
  const updates = getCharacterInventoryItemDbUpdates(item);
  const key = itemDbCreateCustomItem(updates);
  return sanitizeCharacterInventoryItems([{
    ...item,
    itemDbKey: key,
    originItemDbKey: item.originItemDbKey || item.itemDbKey || '',
    itemStorageMode: 'linked',
    individualizedAt: item.individualizedAt || new Date().toISOString()
  }])[0] || item;
}

function updateCharacterInventoryPageItem(page, item) {
  const data = getCharacterInventoryPageData(page);
  const index = data.items.findIndex(entry => entry.id === item.id);
  if (index < 0) return item;
  data.items[index] = sanitizeCharacterInventoryItems([item])[0] || item;
  const merged = mergeCharacterInventoryDataWithItemDb(data);
  page.dataset.ciData = JSON.stringify(merged);
  const active = page.querySelector('[data-ci-action="filter-items"].active')?.dataset.ciCategory || merged.categories[0]?.id || '';
  const center = page.querySelector('.ci-center');
  if (center) center.outerHTML = buildCharacterInventoryItems(merged, active, { readOnly: page.dataset.ciReadonly === 'true' });
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
  page.dataset.ciData = JSON.stringify(merged);
  const itemCount = page.querySelector('[data-ci-item-count]');
  if (itemCount) itemCount.textContent = String(merged.items.length);
  const active = safeItem.category || page.querySelector('[data-ci-action="filter-items"].active')?.dataset.ciCategory || merged.categories[0]?.id || '';
  const center = page.querySelector('.ci-center');
  if (center) center.outerHTML = buildCharacterInventoryItems(merged, active, { readOnly: page.dataset.ciReadonly === 'true' });
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
  page.dataset.ciData = JSON.stringify(merged);
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
  page.dataset.ciData = JSON.stringify(merged);
  const panel = page.querySelector('.ci-money-panel');
  if (panel) panel.outerHTML = buildCharacterInventoryMoneyPanel(merged);
  const infoRows = page.querySelector('.ci-character .ci-box');
  if (infoRows) infoRows.innerHTML = `<h3>Infotabelle</h3>${buildCharacterInventoryInfoRows(merged.infoRows)}`;
  if (typeof syncCharacterInventoryProfileDraftFromPage === 'function') syncCharacterInventoryProfileDraftFromPage(page);
  return merged.moneyState;
}

function saveCharacterInventoryQuizAnswer(page) {
  const data = getCharacterInventoryPageData(page);
  const quiz = sanitizeCharacterInventoryEquipmentQuiz(data.equipmentQuiz);
  const answer = String(page.querySelector('[data-ci-quiz-answer]')?.value || '').trim();
  quiz.answers[quiz.step] = answer;
  quiz.updatedAt = new Date().toISOString();
  data.equipmentQuiz = quiz;
  const merged = mergeCharacterInventoryDataWithItemDb(data);
  page.dataset.ciData = JSON.stringify(merged);
  if (typeof syncCharacterInventoryProfileDraftFromPage === 'function') syncCharacterInventoryProfileDraftFromPage(page);
  return merged;
}

function updateCharacterInventoryQuiz(page, updater) {
  const data = getCharacterInventoryPageData(page);
  data.equipmentQuiz = sanitizeCharacterInventoryEquipmentQuiz(data.equipmentQuiz);
  updater(data.equipmentQuiz, data);
  data.equipmentQuiz.updatedAt = new Date().toISOString();
  const merged = mergeCharacterInventoryDataWithItemDb(data);
  page.dataset.ciData = JSON.stringify(merged);
  const quiz = page.querySelector('.ci-equipment-quiz');
  if (quiz) quiz.outerHTML = buildCharacterInventoryEquipmentQuiz(merged);
  if (typeof syncCharacterInventoryProfileDraftFromPage === 'function') syncCharacterInventoryProfileDraftFromPage(page);
  return merged;
}

async function buildCharacterInventoryMarketContext() {
  if (typeof itemDbLoadMarketSources === 'function') {
    try {
      await itemDbLoadMarketSources();
    } catch (error) {
      console.warn('Item- und Güterquellen konnten für AleriaGPT nicht geladen werden:', error);
    }
  }
  const items = typeof itemDbBuildIndex === 'function' ? itemDbBuildIndex() : [];
  const priced = items
    .filter(item => item?.title && (item.price || item.currency || item.description || item.details))
    .slice(0, 120)
    .map(item => `${item.title} | ${item.categoryLabel || item.category || 'Kategorie offen'} | ${[item.price, item.currency].filter(Boolean).join(' ') || 'Preis offen'} | ${item.description || item.details || ''}`.trim());
  return [
    'Währungsregel: 1 Goldtaler = 10 Silbertaler = 1.000 Kupfertaler. 1 Silbertaler = 100 Kupfertaler. Kupfer ist die Basis für Berechnungen.',
    'Preisanker: Ein billiges Pferd liegt ungefähr bei 100 bis 500 Kupfer. Ein Adelspferd kann bis zu 120 Goldtaler kosten, also bis zu 120.000 Kupfer. Alltagswaren wie Brot oder Öl sind im niedrigen Kupferbereich einzuordnen.',
    priced.length ? `Vorhandene Waren und Items:\n${priced.join('\n')}` : 'Im Item- und Güterverzeichnis wurden keine auswertbaren Preise gefunden.'
  ].join('\n\n');
}

function buildCharacterInventoryQuizFallback(data = {}) {
  const quiz = sanitizeCharacterInventoryEquipmentQuiz(data.equipmentQuiz);
  const joined = quiz.answers.join(' ').toLowerCase();
  let totalCopper = 300;
  if (/adel|adlig|haus|ritter|hof|patrizier|gilde/.test(joined)) totalCopper += 3200;
  if (/arm|bettler|schuld|flucht|waise/.test(joined)) totalCopper = Math.max(80, totalCopper - 220);
  if (/soldat|wache|söldner|kampf|krieg|ritter/.test(joined)) totalCopper += 900;
  if (/pferd|reittier|kutsche|wagen/.test(joined)) totalCopper += /adel|edl|ritter/.test(joined) ? 120000 : 500;
  const money = splitCharacterInventoryCopper(totalCopper);
  const suggestions = [
    /kampf|soldat|wache|ritter/.test(joined) ? 'eine passende Hauptwaffe, Ersatzriemen, Pflegeöl und ein einfacher Schutz' : 'ein Messer, robuste Kleidung und ein kleiner Vorratsbeutel',
    /reise|wandern|straße|karawane/.test(joined) ? 'Reiseausrüstung mit Seil, Feuerzeug, Öl, Brot, Wasserbeutel und wetterfestem Mantel' : 'Alltagswerkzeuge passend zum Beruf',
    /pferd|reittier/.test(joined) ? 'ein Reittier mit Sattelzeug; Qualität nach Stand und Vermögen staffeln' : 'kein Reittier, außer die Antworten nennen Besitz, Dienst oder adelige Versorgung'
  ];
  return [
    `Lokale Auswertung ohne AleriaGPT-Backend: Startgeld etwa ${money.gold} Gold, ${money.silver} Silber, ${money.copper} Kupfer (${money.totalCopper} Kupfer).`,
    `Plausible Ausrüstung: ${suggestions.join('; ')}.`,
    'Für eine genauere Liste sollte AleriaGPT mit dem Item- und Güterverzeichnis verbunden sein.'
  ].join('\n\n');
}

function buildCharacterInventoryQuizPrompt(data = {}, marketContext = '') {
  const quiz = sanitizeCharacterInventoryEquipmentQuiz(data.equipmentQuiz);
  const answers = CHARACTER_INVENTORY_EQUIPMENT_QUIZ_QUESTIONS.map((question, index) => (
    `${index + 1}. ${question}\nAntwort: ${quiz.answers[index] || 'Keine Antwort'}`
  )).join('\n\n');
  return [
    'Ermittle für diese Aleria-Charakterfigur eine glaubwürdige Startausrüstung und einen Geldbestand.',
    'Berücksichtige zwingend die Währungsregel, die Preisanker und die vorhandenen Warenpreise aus dem Kontext. Rechne Geld immer auch in Kupferbasis.',
    'Antworte strukturiert mit: Reichtumsstufe, Startgeld in Gold/Silber/Kupfer und Kupfergesamtwert, empfohlene Items nach Waffen/Rüstungen/Ausrüstung/Trinkturen/Dokumente/Sonstiges, teure Besitzwerte wie Pferde separat, kurze Begründung.',
    `Charakter: ${data.name || 'Unbenannt'} | Rolle: ${data.role || 'offen'} | Status: ${data.status || 'offen'}`,
    `Antworten:\n${answers}`,
    `Kontext:\n${marketContext}`
  ].join('\n\n');
}

async function runCharacterInventoryEquipmentQuiz(page) {
  saveCharacterInventoryQuizAnswer(page);
  updateCharacterInventoryQuiz(page, quiz => {
    quiz.open = true;
    quiz.status = 'AleriaGPT wertet Antworten und Warenpreise aus...';
  });
  const data = getCharacterInventoryPageData(page);
  const marketContext = await buildCharacterInventoryMarketContext();
  const prompt = buildCharacterInventoryQuizPrompt(data, marketContext);
  let resultText = '';
  let status = '';
  if (window.AleriaGptClient?.isConfigured?.()) {
    try {
      const response = await window.AleriaGptClient.sendChat(prompt, {
        promptContext: marketContext,
        chunks: [{ sourceType: 'character-inventory', kind: 'equipment-quiz', text: marketContext, score: 1 }]
      }, {
        answerStyle: 'structured',
        responseMode: 'chat',
        sourceLimit: 8,
        timeoutMs: 45000
      });
      resultText = response.ok && response.text ? response.text : buildCharacterInventoryQuizFallback(data);
      status = response.ok ? 'AleriaGPT-Auswertung abgeschlossen.' : 'AleriaGPT war nicht erreichbar; lokale Auswertung verwendet.';
    } catch (error) {
      console.warn('AleriaGPT-Ausrüstungsfragebogen fehlgeschlagen:', error);
      resultText = buildCharacterInventoryQuizFallback(data);
      status = 'AleriaGPT war nicht erreichbar; lokale Auswertung verwendet.';
    }
  } else {
    resultText = buildCharacterInventoryQuizFallback(data);
    status = 'AleriaGPT-Backend ist nicht konfiguriert; lokale Auswertung verwendet.';
  }
  updateCharacterInventoryQuiz(page, quiz => {
    quiz.open = true;
    quiz.resultText = resultText;
    quiz.status = status;
  });
}

window.CharacterInventoryMoney = {
  currencies: CHARACTER_INVENTORY_CURRENCIES,
  getTotalCopper: getCharacterInventoryMoneyTotal,
  splitCopper: splitCharacterInventoryCopper,
  sanitize: sanitizeCharacterInventoryMoney,
  format: formatCharacterInventoryMoney
};

document.addEventListener('click', async event => {
  const trigger = event.target?.closest?.('[data-ci-action]');
  if (!trigger) return;
  const page = trigger.closest('.character-inventory-page');
  if (!page) return;
  const action = trigger.dataset.ciAction;
  const pageReadOnly = page.dataset.ciReadonly === 'true';
  if (pageReadOnly && [
    'apply-money-transaction',
    'equip-item-from-register',
    'toggle-equipment-quiz',
    'quiz-prev',
    'quiz-next',
    'quiz-save-answer',
    'quiz-run-ai'
  ].includes(action)) {
    event.preventDefault();
    return;
  }
  if (action === 'apply-money-transaction') {
    event.preventDefault();
    const data = getCharacterInventoryPageData(page);
    const currentTotal = getCharacterInventoryMoneyTotal(data.moneyState);
    const amount = getCharacterInventoryTransactionAmount(trigger.closest('.ci-money-panel'));
    const direction = trigger.dataset.ciTransactionDirection || 'add';
    if (!amount) {
      updateCharacterInventoryPageMoney(page, data.moneyState, 'Keine Transaktion eingetragen.');
      return;
    }
    const nextTotal = direction === 'subtract' ? Math.max(0, currentTotal - amount) : currentTotal + amount;
    const missing = direction === 'subtract' && amount > currentTotal;
    updateCharacterInventoryPageMoney(
      page,
      splitCharacterInventoryCopper(nextTotal),
      missing ? 'Nicht genug Münzen vorhanden; Geldbeutel wurde auf 0 Kupfer gesetzt.' : 'Transaktion berechnet und gespeichert.'
    );
    return;
  }
  if (action === 'equip-item-from-register') {
    event.preventDefault();
    openCharacterInventoryItemRegisterPicker(page);
    return;
  }
  if (action === 'toggle-equipment-quiz') {
    event.preventDefault();
    updateCharacterInventoryQuiz(page, quiz => {
      quiz.open = !quiz.open;
    });
    return;
  }
  if (action === 'quiz-prev' || action === 'quiz-next' || action === 'quiz-save-answer') {
    event.preventDefault();
    saveCharacterInventoryQuizAnswer(page);
    updateCharacterInventoryQuiz(page, quiz => {
      if (action === 'quiz-prev') quiz.step = Math.max(0, quiz.step - 1);
      if (action === 'quiz-next') quiz.step = Math.min(CHARACTER_INVENTORY_EQUIPMENT_QUIZ_QUESTIONS.length - 1, quiz.step + 1);
      quiz.open = true;
      quiz.status = 'Antwort gespeichert.';
    });
    return;
  }
  if (action === 'quiz-run-ai') {
    event.preventDefault();
    await runCharacterInventoryEquipmentQuiz(page);
    return;
  }
  if (action === 'filter-items') {
    event.preventDefault();
    const category = trigger.dataset.ciCategory || '';
    page.querySelectorAll('[data-ci-action="filter-items"]').forEach(button => {
      const active = button === trigger;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    let anyVisible = false;
    page.querySelectorAll('.ci-item-row').forEach(row => {
      row.hidden = row.dataset.ciCategory !== category;
      if (!row.hidden) anyVisible = true;
    });
    const emptyNote = page.querySelector('[data-ci-empty]');
    if (emptyNote) emptyNote.hidden = anyVisible;
    return;
  }
  if (action === 'show-item' || action === 'show-companion') {
    event.preventDefault();
    const data = mergeCharacterInventoryDataWithItemDb(getCharacterInventoryPageData(page));
    const overlay = page.querySelector('.ci-profile-overlay');
    if (!overlay) return;
    if (action === 'show-item') {
      const item = data.items.find(entry => entry.id === trigger.dataset.ciItemId);
      overlay.innerHTML = item ? buildCharacterInventoryItemModal(item, { readOnly: pageReadOnly }) : '';
    } else {
      const companion = data.companions.find(entry => entry.id === trigger.dataset.ciCompanionId);
      overlay.innerHTML = companion ? buildCharacterInventoryCompanionModal(companion, { readOnly: pageReadOnly }) : '';
    }
    overlay.classList.toggle('active', !!overlay.innerHTML);
    if (overlay.innerHTML && !overlay.open) overlay.showModal();
    return;
  }
  if (action === 'edit-item') {
    event.preventDefault();
    if (pageReadOnly) return;
    const modal = trigger.closest('.ci-profile-modal');
    const overlay = page.querySelector('.ci-profile-overlay');
    const data = mergeCharacterInventoryDataWithItemDb(getCharacterInventoryPageData(page));
    const item = data.items.find(entry => entry.id === modal?.dataset.ciItemId);
    if (overlay && item) overlay.innerHTML = buildCharacterInventoryItemEditModal(item);
    return;
  }
  if (action === 'edit-companion') {
    event.preventDefault();
    if (pageReadOnly) return;
    const modal = trigger.closest('.ci-profile-modal');
    const overlay = page.querySelector('.ci-profile-overlay');
    const data = mergeCharacterInventoryDataWithItemDb(getCharacterInventoryPageData(page));
    const companion = data.companions.find(entry => entry.id === modal?.dataset.ciCompanionId);
    if (overlay && companion) overlay.innerHTML = buildCharacterInventoryCompanionEditModal(companion);
    return;
  }
  if (action === 'cancel-item-edit') {
    event.preventDefault();
    const modal = trigger.closest('[data-ci-editing-item]');
    const data = mergeCharacterInventoryDataWithItemDb(getCharacterInventoryPageData(page));
    const item = data.items.find(entry => entry.id === modal?.dataset.ciEditingItem);
    const overlay = page.querySelector('.ci-profile-overlay');
    if (overlay && item) overlay.innerHTML = buildCharacterInventoryItemModal(item);
    return;
  }
  if (action === 'cancel-companion-edit') {
    event.preventDefault();
    const modal = trigger.closest('[data-ci-editing-companion]');
    const data = mergeCharacterInventoryDataWithItemDb(getCharacterInventoryPageData(page));
    const companion = data.companions.find(entry => entry.id === modal?.dataset.ciEditingCompanion);
    const overlay = page.querySelector('.ci-profile-overlay');
    if (overlay && companion) overlay.innerHTML = buildCharacterInventoryCompanionModal(companion);
    return;
  }
  if (action === 'add-item-info-row') {
    event.preventDefault();
    const list = trigger.closest('.ci-modal-edit-form')?.querySelector('[data-ci-modal-info-list]');
    list?.insertAdjacentHTML('beforeend', buildCharacterInventoryModalInfoRowsEditor([{ icon: '*', label: 'Neue Zeile', value: 'Wert' }]));
    updateCharacterInventoryModalPreview(trigger.closest('[data-ci-editing-item]'));
    return;
  }
  if (action === 'add-companion-info-row') {
    event.preventDefault();
    const list = trigger.closest('.ci-modal-edit-form')?.querySelector('[data-ci-modal-info-list]');
    list?.insertAdjacentHTML('beforeend', buildCharacterInventoryModalInfoRowsEditor([{ icon: '*', label: 'Neue Zeile', value: 'Wert' }], 'companion'));
    updateCharacterInventoryModalPreview(trigger.closest('[data-ci-editing-companion]'));
    return;
  }
  if (action === 'remove-item-info-row') {
    event.preventDefault();
    const modal = trigger.closest('[data-ci-editing-item]');
    trigger.closest('[data-ci-modal-info-row]')?.remove();
    updateCharacterInventoryModalPreview(modal);
    return;
  }
  if (action === 'remove-companion-info-row') {
    event.preventDefault();
    const modal = trigger.closest('[data-ci-editing-companion]');
    trigger.closest('[data-ci-modal-info-row]')?.remove();
    updateCharacterInventoryModalPreview(modal);
    return;
  }
  if (action === 'add-item-attribute-row') {
    event.preventDefault();
    const list = trigger.closest('.ci-modal-edit-form')?.querySelector('[data-ci-modal-attribute-list]');
    list?.insertAdjacentHTML('beforeend', buildCharacterInventoryModalAttributeEditor([{ label: 'Neuer Wert', value: 5 }]));
    updateCharacterInventoryModalPreview(trigger.closest('[data-ci-editing-item]'));
    return;
  }
  if (action === 'add-companion-attribute-row') {
    event.preventDefault();
    const list = trigger.closest('.ci-modal-edit-form')?.querySelector('[data-ci-modal-attribute-list]');
    list?.insertAdjacentHTML('beforeend', buildCharacterInventoryModalAttributeEditor([{ label: 'Neuer Wert', value: 5 }], 'companion'));
    updateCharacterInventoryModalPreview(trigger.closest('[data-ci-editing-companion]'));
    return;
  }
  if (action === 'remove-item-attribute-row') {
    event.preventDefault();
    const modal = trigger.closest('[data-ci-editing-item]');
    trigger.closest('[data-ci-modal-attribute-row]')?.remove();
    updateCharacterInventoryModalPreview(modal);
    return;
  }
  if (action === 'remove-companion-attribute-row') {
    event.preventDefault();
    const modal = trigger.closest('[data-ci-editing-companion]');
    trigger.closest('[data-ci-modal-attribute-row]')?.remove();
    updateCharacterInventoryModalPreview(modal);
    return;
  }
  if (action === 'save-item-local') {
    event.preventDefault();
    const modal = trigger.closest('[data-ci-editing-item]');
    const data = getCharacterInventoryPageData(page);
    const fallback = data.items.find(entry => entry.id === modal?.dataset.ciEditingItem);
    if (!modal || !fallback) return;
    const edited = collectCharacterInventoryModalItem(modal, fallback);
    const current = updateCharacterInventoryPageItem(page, edited);
    const overlay = page.querySelector('.ci-profile-overlay');
    if (overlay) overlay.innerHTML = buildCharacterInventoryItemModal(current);
    if (typeof showAppStatus === 'function') showAppStatus('Item nur fuer diesen Charakter gespeichert.', 'success');
    return;
  }
  if (action === 'save-item-global') {
    event.preventDefault();
    const modal = trigger.closest('[data-ci-editing-item]');
    const data = getCharacterInventoryPageData(page);
    const fallback = data.items.find(entry => entry.id === modal?.dataset.ciEditingItem);
    if (!modal || !fallback) return;
    const edited = collectCharacterInventoryModalItem(modal, fallback);
    const saved = saveCharacterInventoryItemToItemDb(edited);
    const current = updateCharacterInventoryPageItem(page, saved);
    const overlay = page.querySelector('.ci-profile-overlay');
    if (overlay) overlay.innerHTML = buildCharacterInventoryItemModal(current);
    if (typeof showAppStatus === 'function') showAppStatus('Item im Items- und Güterverzeichnis gespeichert.', 'success');
    return;
  }
  if (action === 'save-companion-profile') {
    event.preventDefault();
    const modal = trigger.closest('[data-ci-editing-companion]');
    const data = getCharacterInventoryPageData(page);
    const fallback = data.companions.find(entry => entry.id === modal?.dataset.ciEditingCompanion);
    if (!modal || !fallback) return;
    const edited = collectCharacterInventoryModalCompanion(modal, fallback);
    const current = updateCharacterInventoryPageCompanion(page, edited);
    const overlay = page.querySelector('.ci-profile-overlay');
    if (overlay) overlay.innerHTML = buildCharacterInventoryCompanionModal(current);
    if (typeof showAppStatus === 'function') showAppStatus('Gefährtenprofil im Charakter-Inventar aktualisiert.', 'success');
    return;
  }
  if (action === 'close-profile') {
    event.preventDefault();
    const overlay = page.querySelector('.ci-profile-overlay');
    if (overlay) {
      overlay.close();
      overlay.classList.remove('active');
      overlay.innerHTML = '';
    }
  }
});

// Keep keyboard navigation inside the native detail dialog. In particular,
// Escape must not also close the surrounding archive or comment editor.
document.addEventListener('keydown', event => {
  if (event.target?.closest?.('.ci-profile-overlay[open]')) event.stopPropagation();
}, true);

document.addEventListener('close', event => {
  if (!event.target?.matches?.('dialog.ci-profile-overlay')) return;
  event.target.classList.remove('active');
}, true);

document.addEventListener('input', event => {
  const moneyField = event.target?.closest?.('[data-ci-money-field]');
  if (moneyField) {
    const page = moneyField.closest('.character-inventory-page');
    const panel = moneyField.closest('.ci-money-panel');
    if (!page || !panel) return;
    if (page.dataset.ciReadonly === 'true') return;
    const data = getCharacterInventoryPageData(page);
    const money = sanitizeCharacterInventoryMoney(getCharacterInventoryMoneyInputs(panel));
    data.moneyState = money;
    data.money = formatCharacterInventoryMoney(money);
    data.moneyNotice = '';
    const merged = mergeCharacterInventoryDataWithItemDb(data);
    page.dataset.ciData = JSON.stringify(merged);
    const total = panel.querySelector('.ci-money-head strong');
    if (total) total.textContent = `${money.totalCopper} Kupfer`;
    const infoRows = page.querySelector('.ci-character .ci-box');
    if (infoRows) infoRows.innerHTML = `<h3>Infotabelle</h3>${buildCharacterInventoryInfoRows(merged.infoRows)}`;
    if (typeof syncCharacterInventoryProfileDraftFromPage === 'function') syncCharacterInventoryProfileDraftFromPage(page);
    return;
  }
  const quizAnswer = event.target?.closest?.('[data-ci-quiz-answer]');
  if (quizAnswer) {
    const page = quizAnswer.closest('.character-inventory-page');
    if (!page) return;
    if (page.dataset.ciReadonly === 'true') return;
    saveCharacterInventoryQuizAnswer(page);
    return;
  }
  const modal = event.target?.closest?.('[data-ci-editing-item], [data-ci-editing-companion]');
  if (!modal) return;
  updateCharacterInventoryModalPreview(modal);
});

document.addEventListener('change', event => {
  const modal = event.target?.closest?.('[data-ci-editing-item], [data-ci-editing-companion]');
  if (!modal) return;
  updateCharacterInventoryModalPreview(modal);
});

function buildCharacterInventoryPage(page, entry, pageIndex, total) {
  const nav = page?.hideNav ? '' : buildNav(page, pageIndex, total);
  const data = mergeCharacterInventoryDataWithItemDb(page.characterInventory || {});
  const readOnly = page?.characterInventoryReadOnly === true;
  const activeCategory = data.categories[0]?.id || '';
  const encoded = escapeHtml(JSON.stringify(data));
  return `
    ${nav}
    <div class="character-inventory-page${readOnly ? ' read-only' : ''}" data-ci-data="${encoded}" data-ci-readonly="${readOnly ? 'true' : 'false'}">
      <header class="ci-header">
        <div>
          <h2>${escapeHtml(data.title)}</h2>
          <p>${escapeHtml(data.subtitle)}</p>
        </div>
        <div class="ci-overview" aria-label="Inventarübersicht">
          <span><strong data-ci-item-count>${data.items.length}</strong> Einträge</span>
          <span><strong>${data.companions.length}</strong> Gefährten</span>
        </div>
      </header>
      <div class="ci-layout">
        ${buildCharacterInventoryLeft(data)}
        ${buildCharacterInventoryItems(data, activeCategory, { readOnly })}
        ${buildCharacterInventoryCompanions(data)}
      </div>
      <dialog class="ci-profile-overlay" aria-label="Inventarprofil"></dialog>
    </div>`;
}
