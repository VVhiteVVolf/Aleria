const ITEM_DB_CURRENCY_ICONS = {
  copper: 'https://i.imgur.com/j2khSBE.png',
  silver: 'https://i.imgur.com/SqqS6XQ.png',
  gold: 'https://i.imgur.com/kH2Ry56.png',
  pouch: 'https://i.imgur.com/XQDSA4h.png'
};

const ITEM_DB_RARITIES = [
  { id: 'gewoehnlich', label: 'Gewoehnlich' },
  { id: 'ungewoehnlich', label: 'Ungewoehnlich' },
  { id: 'selten', label: 'Selten' },
  { id: 'episch', label: 'Episch' },
  { id: 'legendaer', label: 'Legendaer' }
];

const ITEM_DB_DEFAULT_TABLE_COLUMNS = {
  alle: ['item', 'category', 'rarity', 'origin', 'price', 'stock'],
  waffen: ['item', 'rarity', 'material', 'weight', 'price', 'stock'],
  ruestungen: ['item', 'rarity', 'material', 'weight', 'condition', 'price'],
  alchemie: ['item', 'type', 'rarity', 'availability', 'price', 'source'],
  arkanes: ['item', 'rarity', 'origin', 'magical', 'price', 'source'],
  speisen: ['item', 'type', 'origin', 'availability', 'price', 'source'],
  getraenke: ['item', 'type', 'origin', 'availability', 'price', 'source'],
  vieh: ['item', 'type', 'origin', 'availability', 'price', 'source'],
  pferde: ['item', 'type', 'origin', 'weight', 'price', 'source'],
  werkzeuge: ['item', 'type', 'material', 'availability', 'price', 'source'],
  sonstiges: ['item', 'type', 'origin', 'availability', 'price', 'source']
};

const ITEM_DB_AVAILABLE_COLUMNS = [
  'item',
  'category',
  'type',
  'rarity',
  'origin',
  'material',
  'weight',
  'condition',
  'price',
  'stock',
  'availability',
  'magical',
  'source'
];

const ITEM_DB_COLUMN_LABELS = {
  item: 'Name',
  category: 'Kategorie',
  type: 'Gattung',
  rarity: 'Seltenheit',
  origin: 'Herkunft',
  material: 'Material',
  weight: 'Gewicht',
  condition: 'Zustand',
  price: 'Preis',
  stock: 'Bestand',
  availability: 'Verfuegbarkeit',
  magical: 'Magisch',
  source: 'Quelle'
};

let _itemDbState = {
  open: false,
  activeCategory: 'alle',
  search: '',
  rarityFilters: new Set(),
  origin: '',
  minPrice: '',
  maxPrice: '',
  availableOnly: false,
  selectedKey: '',
  loading: false,
  loadMessage: '',
  sortColumn: 'item',
  sortDirection: 'asc',
  editingKey: '',
  creating: false,
  categoryConfigOpen: false,
  importError: ''
};

function itemDbGetPanel() {
  let panel = document.getElementById('item-db-panel');
  if (panel) return panel;

  panel = document.createElement('section');
  panel.id = 'item-db-panel';
  panel.className = 'item-db-panel';
  panel.setAttribute('aria-label', 'Item- und Gueterdatenbank');
  panel.hidden = true;
  document.body.appendChild(panel);
  return panel;
}

function itemDbGetImportInput() {
  let input = document.getElementById('item-db-import-input');
  if (input) return input;
  input = document.createElement('input');
  input.id = 'item-db-import-input';
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.hidden = true;
  document.body.appendChild(input);
  return input;
}

function itemDbUiGetCategories() {
  return typeof itemDbGetCategories === 'function' ? itemDbGetCategories() : ITEM_DB_CATEGORIES;
}

function itemDbGetCategoryColumns(categoryId) {
  const configured = typeof itemDbGetCategorySettings === 'function'
    ? itemDbGetCategorySettings(categoryId).columns
    : [];
  const allowed = new Set(ITEM_DB_AVAILABLE_COLUMNS);
  const columns = configured.filter(column => allowed.has(column));
  return columns.length ? columns : (ITEM_DB_DEFAULT_TABLE_COLUMNS[categoryId] || ITEM_DB_DEFAULT_TABLE_COLUMNS.sonstiges);
}

function itemDbGetField(item, field) {
  const meta = item?.hiddenMeta || {};
  const source = item?.sourceRefs?.[0] || {};
  const values = {
    item: item?.title || '',
    category: item?.categoryLabel || '',
    type: item?.type || meta.originalCategory || '',
    rarity: meta.rarity || item?.type || '',
    origin: meta.origin || source.market || source.moduleTitle || '',
    material: meta.material || '',
    weight: meta.weight || '',
    condition: meta.condition || meta.zustand || '',
    price: item?.price || '',
    stock: meta.stock || meta.bestand || '',
    availability: meta.availability || '',
    magical: meta.magical || '',
    source: source.market || source.moduleTitle || source.kind || ''
  };
  return String(values[field] || '').trim();
}

function itemDbParseLocalizedNumber(value) {
  const cleaned = String(value || '').trim().replace(/\s/g, '');
  if (!cleaned) return null;
  let normalized = cleaned;
  if (cleaned.includes('.') && cleaned.includes(',')) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    normalized = cleaned.replace(',', '.');
  } else if (/\.\d{3}(?:\.|$)/.test(cleaned)) {
    normalized = cleaned.replace(/\./g, '');
  }
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function itemDbGetCurrencyMultiplier(context) {
  const raw = String(context || '');
  const normalized = itemDbNormalizeText(raw);
  if (/(^|[^a-z])g(t)?([^a-z]|$)/i.test(raw) || normalized.includes('gold')) return 1000;
  if (/(^|[^a-z])s(t)?([^a-z]|$)/i.test(raw) || normalized.includes('silber')) return 100;
  if (/(^|[^a-z])p(f)?([^a-z]|$)/i.test(raw) || normalized.includes('pfennig')) return 0.01;
  if (/(^|[^a-z])k(t|s)?([^a-z]|$)/i.test(raw) || normalized.includes('kupfer')) return 1;
  return 1;
}

function itemDbParsePriceToCopperValues(item) {
  const text = [itemDbGetField(item, 'price'), item?.currency].filter(Boolean).join(' ').trim();
  if (!text) return [];
  const fallbackMultiplier = itemDbGetCurrencyMultiplier(text);
  const matches = Array.from(text.matchAll(/-?\d+(?:[.,]\d+)*(?:\s*(?:Goldtaler|Silbertaler|Kupfertaler|Gold|Silber|Kupfer|Pfennig|GT|ST|KT|KS|G|S|K|P))?/gi));
  return matches
    .map(match => {
      const segment = match[0];
      const amount = itemDbParseLocalizedNumber(segment.match(/-?\d+(?:[.,]\d+)*/)?.[0] || '');
      if (amount == null) return null;
      const multiplier = itemDbGetCurrencyMultiplier(/[a-z]/i.test(segment.replace(/-?\d+(?:[.,]\d+)*/, '')) ? segment : text) || fallbackMultiplier;
      return amount * multiplier;
    })
    .filter(value => value != null);
}

function itemDbFormatCopperValue(value) {
  if (!Number.isFinite(value)) return '';
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

function itemDbFormatPriceAsCopper(item) {
  const values = itemDbParsePriceToCopperValues(item);
  if (!values.length) return '';
  const unique = values.filter((value, index) => index === 0 || value !== values[index - 1]);
  return `${unique.map(itemDbFormatCopperValue).join(' - ')} Kupfertaler`;
}

function itemDbGetRarityId(item) {
  const rarity = itemDbNormalizeText(itemDbGetField(item, 'rarity'));
  if (rarity.includes('legend')) return 'legendaer';
  if (rarity.includes('episch')) return 'episch';
  if (rarity.includes('selten')) return 'selten';
  if (rarity.includes('ungewohn') || rarity.includes('ungewoehn')) return 'ungewoehnlich';
  if (rarity.includes('gewohn') || rarity.includes('gewoehn')) return 'gewoehnlich';
  return '';
}

function itemDbGetRarityLabel(item) {
  const id = itemDbGetRarityId(item);
  return ITEM_DB_RARITIES.find(rarity => rarity.id === id)?.label || itemDbGetField(item, 'rarity') || 'Unbekannt';
}

function itemDbGetNumericPrice(item) {
  const values = itemDbParsePriceToCopperValues(item);
  return values.length ? Math.min(...values) : null;
}

function itemDbIsAvailable(item) {
  const value = itemDbNormalizeText([itemDbGetField(item, 'availability'), itemDbGetField(item, 'stock')].join(' '));
  if (!value) return true;
  if (value.includes('ausverkauft') || value.includes('nicht verfugbar') || value.includes('nicht verfuegbar')) return false;
  const stock = Number(itemDbGetField(item, 'stock'));
  return !Number.isFinite(stock) || stock > 0;
}

function itemDbGetFilterOptions(items, field) {
  const values = new Set();
  items.forEach(item => {
    const value = itemDbGetField(item, field);
    if (value) values.add(value);
  });
  return Array.from(values).sort((a, b) => a.localeCompare(b, 'de', { sensitivity: 'base' }));
}

function itemDbGetVisibleItems(items) {
  const needle = itemDbNormalizeText(_itemDbState.search);
  const min = _itemDbState.minPrice === '' ? null : Number(_itemDbState.minPrice);
  const max = _itemDbState.maxPrice === '' ? null : Number(_itemDbState.maxPrice);
  return itemDbSortItems(items.filter(item => {
    if (_itemDbState.activeCategory !== 'alle' && item.category !== _itemDbState.activeCategory) return false;
    if (_itemDbState.rarityFilters.size && !_itemDbState.rarityFilters.has(itemDbGetRarityId(item))) return false;
    if (_itemDbState.origin && itemDbGetField(item, 'origin') !== _itemDbState.origin) return false;
    if (_itemDbState.availableOnly && !itemDbIsAvailable(item)) return false;

    const price = itemDbGetNumericPrice(item);
    if (min != null && Number.isFinite(min) && (price == null || price < min)) return false;
    if (max != null && Number.isFinite(max) && (price == null || price > max)) return false;

    if (!needle) return true;
    return itemDbNormalizeText([
      item.title,
      item.categoryLabel,
      item.type,
      item.description,
      item.details,
      item.price,
      itemDbGetField(item, 'origin'),
      itemDbGetRarityLabel(item),
      item.tags?.join(' ')
    ].join(' ')).includes(needle);
  }));
}

function itemDbSortItems(items) {
  const column = _itemDbState.sortColumn || 'item';
  const direction = _itemDbState.sortDirection === 'desc' ? -1 : 1;
  return items.slice().sort((a, b) => {
    if (column === 'price') {
      const av = itemDbGetNumericPrice(a);
      const bv = itemDbGetNumericPrice(b);
      if (av != null || bv != null) return ((av ?? Number.MAX_SAFE_INTEGER) - (bv ?? Number.MAX_SAFE_INTEGER)) * direction;
    }
    const av = itemDbGetField(a, column) || a.title || '';
    const bv = itemDbGetField(b, column) || b.title || '';
    return av.localeCompare(bv, 'de', { numeric: true, sensitivity: 'base' }) * direction;
  });
}

function itemDbRenderImage(item, className = 'item-db-image') {
  const image = itemDbSanitizeImage(item?.image || '');
  if (image) {
    return `<span class="${className}"><img src="${image}" alt="${itemDbEscapeHtml(item.title)}" loading="lazy" decoding="async"></span>`;
  }
  const initial = typeof getInitialChar === 'function' ? getInitialChar(item?.title) : String(item?.title || '?').slice(0, 1).toUpperCase();
  return `<span class="${className} placeholder">${itemDbEscapeHtml(initial || '?')}</span>`;
}

function itemDbRenderMoney(itemOrValue) {
  const item = itemOrValue && typeof itemOrValue === 'object' ? itemOrValue : { price: itemOrValue };
  const text = itemDbFormatPriceAsCopper(item);
  if (!text) return '-';
  return `<span class="item-db-money">${itemDbEscapeHtml(text)} <img src="${ITEM_DB_CURRENCY_ICONS.copper}" alt="" loading="lazy" decoding="async"></span>`;
}

function itemDbRenderFilterSidebar(items) {
  const origins = itemDbGetFilterOptions(items, 'origin');
  return `
    <aside class="item-db-filter">
      <div class="item-db-panel-title">Filter & Suche</div>
      <label class="item-db-search">
        <span>Suche</span>
        <input type="search" value="${itemDbEscapeHtml(_itemDbState.search)}" placeholder="Suche nach Name ..." data-item-db-action="search">
      </label>
      <label>
        <span>Kategorie</span>
        <select data-item-db-action="set-category-select">
          ${itemDbUiGetCategories().map(category => `<option value="${itemDbEscapeHtml(category.id)}"${category.id === _itemDbState.activeCategory ? ' selected' : ''}>${itemDbEscapeHtml(category.id === 'alle' ? 'Alle Kategorien' : category.label)}</option>`).join('')}
        </select>
      </label>
      <fieldset>
        <legend>Seltenheit</legend>
        ${ITEM_DB_RARITIES.map(rarity => `
          <label class="item-db-check">
            <input type="checkbox" data-item-db-action="toggle-rarity" data-rarity="${itemDbEscapeHtml(rarity.id)}"${_itemDbState.rarityFilters.has(rarity.id) ? ' checked' : ''}>
            <span>${itemDbEscapeHtml(rarity.label)}</span>
          </label>
        `).join('')}
      </fieldset>
      <label>
        <span>Herkunft</span>
        <select data-item-db-action="set-origin">
          <option value="">Alle Herkuenfte</option>
          ${origins.map(origin => `<option value="${itemDbEscapeHtml(origin)}"${origin === _itemDbState.origin ? ' selected' : ''}>${itemDbEscapeHtml(origin)}</option>`).join('')}
        </select>
      </label>
      <div class="item-db-price-fields">
        <label><span>Min.</span><input type="number" inputmode="decimal" value="${itemDbEscapeHtml(_itemDbState.minPrice)}" data-item-db-action="set-min-price"></label>
        <label><span>Max.</span><input type="number" inputmode="decimal" value="${itemDbEscapeHtml(_itemDbState.maxPrice)}" data-item-db-action="set-max-price"></label>
      </div>
      <label class="item-db-check">
        <input type="checkbox" data-item-db-action="toggle-available"${_itemDbState.availableOnly ? ' checked' : ''}>
        <span>Nur verfuegbare anzeigen</span>
      </label>
      <button type="button" data-item-db-action="reset-filters">Filter zuruecksetzen</button>
    </aside>`;
}

function itemDbGetActiveColumns() {
  return itemDbGetCategoryColumns(_itemDbState.activeCategory);
}

function itemDbRenderTableCell(item, column) {
  if (column === 'item') {
    return `<div class="item-db-title-cell">${itemDbRenderImage(item)}<span><strong>${itemDbEscapeHtml(item.title)}</strong><small>${itemDbEscapeHtml(item.type || item.categoryLabel)}</small></span></div>`;
  }
  if (column === 'rarity') {
    const rarityId = itemDbGetRarityId(item);
    return `<span class="item-db-rarity" data-rarity="${itemDbEscapeHtml(rarityId || 'none')}">${itemDbEscapeHtml(itemDbGetRarityLabel(item))}</span>`;
  }
  if (column === 'price') return itemDbRenderMoney(item);
  if (column === 'source') return itemDbEscapeHtml(itemDbGetField(item, 'source') || '-');
  return itemDbEscapeHtml(itemDbGetField(item, column) || '-');
}

function itemDbRenderTable(items) {
  const columns = itemDbGetActiveColumns();
  if (!items.length) {
    return `<div class="item-db-empty">Keine Items fuer diesen Filter gefunden.</div>`;
  }

  return `<div class="item-db-table" role="table" aria-label="Items und Gueter" style="--item-db-col-count:${columns.length};">
    <div class="item-db-row item-db-head" role="row">
      ${columns.map(column => {
        const active = _itemDbState.sortColumn === column ? ` data-sort="${_itemDbState.sortDirection}"` : '';
        return `<button type="button" role="columnheader" data-item-db-action="sort" data-column="${itemDbEscapeHtml(column)}"${active}>${itemDbEscapeHtml(ITEM_DB_COLUMN_LABELS[column] || column)}</button>`;
      }).join('')}
    </div>
    ${items.map(item => {
      const selected = item.canonicalKey === _itemDbState.selectedKey ? ' selected' : '';
      return `<button class="item-db-row item-db-item${selected}" type="button" role="row" data-item-db-action="select-item" data-item-key="${itemDbEscapeHtml(item.canonicalKey)}">
        ${columns.map(column => `<div>${itemDbRenderTableCell(item, column)}</div>`).join('')}
      </button>`;
    }).join('')}
  </div>`;
}

function itemDbRenderSources(item) {
  if (!item?.sourceRefs?.length) return '<p class="item-db-muted">Keine Quellen hinterlegt.</p>';
  return `<ul class="item-db-source-list">
    ${item.sourceRefs.map(ref => `<li>
      <strong>${itemDbEscapeHtml(ref.kind || 'Quelle')}</strong>
      <span>${itemDbEscapeHtml(ref.moduleTitle || ref.market || 'Unbekannte Quelle')}</span>
      ${ref.pageTitle ? `<small>${itemDbEscapeHtml(ref.pageTitle)}</small>` : ''}
    </li>`).join('')}
  </ul>`;
}

function itemDbRenderDetail(item, options = {}) {
  if (!item) {
    return `<aside class="item-db-detail item-db-detail-empty">
      <div class="item-db-panel-title">Details</div>
      <p>Waehle ein Item aus, um die Live-Ansicht zu sehen.</p>
    </aside>`;
  }
  return `<aside class="item-db-detail">
    <div class="item-db-panel-title">Details</div>
    <div class="item-db-detail-art">
      ${itemDbRenderImage(item, 'item-db-detail-image')}
    </div>
    <h3>${itemDbEscapeHtml(item.title)}</h3>
    <div class="item-db-detail-rarity" data-rarity="${itemDbEscapeHtml(itemDbGetRarityId(item) || 'none')}">${itemDbEscapeHtml(itemDbGetRarityLabel(item))}</div>
    <section class="item-db-description-box">
      <h4>Beschreibung</h4>
      <p>${itemDbEscapeHtml(item.description || item.details || 'Keine Beschreibung hinterlegt.')}</p>
    </section>
    <dl class="item-db-detail-grid">
      <div><dt>Kategorie</dt><dd>${itemDbEscapeHtml(item.categoryLabel)}</dd></div>
      <div><dt>Herkunft</dt><dd>${itemDbEscapeHtml(itemDbGetField(item, 'origin') || '-')}</dd></div>
      <div><dt>Gewicht</dt><dd>${itemDbEscapeHtml(itemDbGetField(item, 'weight') || '-')}</dd></div>
      <div><dt>Zustand</dt><dd>${itemDbEscapeHtml(itemDbGetField(item, 'condition') || '-')}</dd></div>
      <div><dt>Preis</dt><dd>${itemDbRenderMoney(item)}</dd></div>
      <div><dt>Bestand</dt><dd>${itemDbEscapeHtml(itemDbGetField(item, 'stock') || '-')}</dd></div>
    </dl>
    ${item.tags?.length ? `<div class="item-db-tags">${item.tags.map(tag => `<span>${itemDbEscapeHtml(tag)}</span>`).join('')}</div>` : ''}
    ${options.hideActions ? '' : `<div class="item-db-detail-actions">
      <button type="button" data-item-db-action="open-edit" data-item-key="${itemDbEscapeHtml(item.canonicalKey)}">Bearbeiten</button>
      ${item.locallyCreated ? '' : `<button type="button" data-item-db-action="clear-override" data-item-key="${itemDbEscapeHtml(item.canonicalKey)}">Zuruecksetzen</button>`}
      <button type="button" class="danger" data-item-db-action="delete-item" data-item-key="${itemDbEscapeHtml(item.canonicalKey)}">Loeschen</button>
    </div>`}
    <section class="item-db-source-box">
      <h4>Quellen</h4>
      ${itemDbRenderSources(item)}
    </section>
  </aside>`;
}

function itemDbRenderEditorFields(item = {}) {
  const meta = item.hiddenMeta || {};
  return `
    <label>Titel<input type="text" data-item-edit="title" value="${itemDbEscapeHtml(item.title || '')}" placeholder="Name des Items"></label>
    <label>Kategorie<select data-item-edit="category">
      ${itemDbUiGetCategories().filter(category => category.id !== 'alle').map(category => `<option value="${itemDbEscapeHtml(category.id)}"${category.id === (item.category || ITEM_DB_DEFAULT_CATEGORY) ? ' selected' : ''}>${itemDbEscapeHtml(category.label)}</option>`).join('')}
    </select></label>
    <label>Gattung<input type="text" data-item-edit="type" value="${itemDbEscapeHtml(item.type || '')}"></label>
    <label>Seltenheit<input type="text" data-item-edit="rarity" value="${itemDbEscapeHtml(meta.rarity || '')}"></label>
    <label>Herkunft<input type="text" data-item-edit="origin" value="${itemDbEscapeHtml(meta.origin || '')}"></label>
    <label>Material<input type="text" data-item-edit="material" value="${itemDbEscapeHtml(meta.material || '')}"></label>
    <label>Gewicht<input type="text" data-item-edit="weight" value="${itemDbEscapeHtml(meta.weight || '')}"></label>
    <label>Zustand<input type="text" data-item-edit="condition" value="${itemDbEscapeHtml(meta.condition || '')}"></label>
    <label>Bestand<input type="text" data-item-edit="stock" value="${itemDbEscapeHtml(meta.stock || meta.bestand || '')}"></label>
    <label>Bild-URL<input type="url" data-item-edit="image" value="${itemDbEscapeHtml(item.image || '')}"></label>
    <label>Preis<input type="text" data-item-edit="price" value="${itemDbEscapeHtml(item.price || '')}"></label>
    <label>Waehrung<input type="text" data-item-edit="currency" value="${itemDbEscapeHtml(item.currency || '')}"></label>
    <label>Tags<input type="text" list="item-db-tags-list" data-item-edit="tags" value="${itemDbEscapeHtml((item.tags || []).join(', '))}"></label>
    <label class="wide">Beschreibung<textarea rows="4" data-item-edit="description">${itemDbEscapeHtml(item.description || '')}</textarea></label>
    <label class="wide">Details<textarea rows="4" data-item-edit="details">${itemDbEscapeHtml(item.details || '')}</textarea></label>`;
}

function itemDbRenderTagDatalist() {
  const tags = typeof itemDbGetDefinedTags === 'function' ? itemDbGetDefinedTags() : [];
  if (!tags.length) return '';
  return `<datalist id="item-db-tags-list">${tags.map(tag => `<option value="${itemDbEscapeHtml(tag)}"></option>`).join('')}</datalist>`;
}

function itemDbRenderCategoryConfigDialog() {
  if (!_itemDbState.categoryConfigOpen) return '';
  const categories = itemDbUiGetCategories().filter(category => category.id !== 'alle');
  const defaultIds = new Set(ITEM_DB_CATEGORIES.map(category => category.id));
  const globalTags = typeof itemDbGetDefinedTags === 'function' ? itemDbGetDefinedTags().join(', ') : '';
  return `<div class="item-db-edit-overlay" role="dialog" aria-modal="true" aria-label="Kategorien verwalten">
    <div class="item-db-config-dialog">
      <header>
        <div>
          <div class="item-db-kicker">Items und Gueter</div>
          <h3>Kategorien, Spalten & Tags</h3>
        </div>
        <button type="button" data-item-db-action="close-category-config" aria-label="Konfiguration schliessen">x</button>
      </header>
      <div class="item-db-config-body">
        <section class="item-db-config-new">
          <label>Name<input type="text" data-item-db-new-category="label" placeholder="Neue Kategorie"></label>
          <label>Spalten<input type="text" data-item-db-new-category="columns" placeholder="item, rarity, origin, price, stock"></label>
          <label>Tags<input type="text" data-item-db-new-category="tags" placeholder="Tag, weiterer Tag"></label>
          <button type="button" data-item-db-action="add-category-config">Kategorie erstellen</button>
        </section>
        <label class="item-db-config-global-tags">Globale Tags<textarea rows="3" data-item-db-config-global-tags>${itemDbEscapeHtml(globalTags)}</textarea></label>
        <div class="item-db-config-columns-note">
          Verfuegbare Spalten: ${ITEM_DB_AVAILABLE_COLUMNS.map(column => itemDbEscapeHtml(column)).join(', ')}
        </div>
        <div class="item-db-config-list">
          ${categories.map(category => {
            const settings = typeof itemDbGetCategorySettings === 'function' ? itemDbGetCategorySettings(category.id) : { columns: [], tags: [] };
            const columns = settings.columns.length ? settings.columns : itemDbGetCategoryColumns(category.id);
            const isDefault = defaultIds.has(category.id);
            return `<section class="item-db-config-row" data-item-db-config-category-row data-category-id="${itemDbEscapeHtml(category.id)}">
              <label>Kategorie<input type="text" data-item-db-config-field="label" value="${itemDbEscapeHtml(category.label)}"${isDefault ? ' readonly' : ''}></label>
              <label>Spalten<input type="text" data-item-db-config-field="columns" value="${itemDbEscapeHtml(columns.join(', '))}"></label>
              <label>Tags<input type="text" data-item-db-config-field="tags" value="${itemDbEscapeHtml(settings.tags.join(', '))}"></label>
              ${isDefault ? '' : `<button type="button" class="danger" data-item-db-action="delete-category-config" data-category="${itemDbEscapeHtml(category.id)}">Entfernen</button>`}
            </section>`;
          }).join('')}
        </div>
      </div>
      <footer>
        <button type="button" data-item-db-action="close-category-config">Abbrechen</button>
        <button class="primary" type="button" data-item-db-action="save-category-config">Speichern</button>
      </footer>
    </div>
  </div>`;
}

function itemDbRenderEditorDialog() {
  const item = _itemDbState.creating
    ? { category: _itemDbState.activeCategory === 'alle' ? ITEM_DB_DEFAULT_CATEGORY : _itemDbState.activeCategory }
    : itemDbBuildIndex().find(candidate => candidate.canonicalKey === _itemDbState.editingKey);
  if (!_itemDbState.creating && !item) return '';
  const title = _itemDbState.creating ? 'Neuer Eintrag' : 'Eintrag bearbeiten';
  return `<div class="item-db-edit-overlay" role="dialog" aria-modal="true" aria-label="${itemDbEscapeHtml(title)}">
    <div class="item-db-edit-dialog">
      <header>
        <div>
          <div class="item-db-kicker">Items und Gueter</div>
          <h3>${itemDbEscapeHtml(title)}</h3>
        </div>
        <button type="button" data-item-db-action="close-edit" aria-label="Editor schliessen">x</button>
      </header>
      <div class="item-db-edit-body">
        <form class="item-db-edit-form" data-item-db-editor>
          ${itemDbRenderEditorFields(item)}
        </form>
        <div class="item-db-edit-preview" data-item-db-edit-preview>
          ${itemDbRenderDetail(item, { hideActions: true })}
        </div>
      </div>
      <footer>
        <button type="button" data-item-db-action="close-edit">Abbrechen</button>
        <button class="primary" type="button" data-item-db-action="${_itemDbState.creating ? 'create-item' : 'save-item'}" data-item-key="${itemDbEscapeHtml(item?.canonicalKey || '')}">${_itemDbState.creating ? 'Eintrag anlegen' : 'Speichern'}</button>
      </footer>
    </div>
  </div>${itemDbRenderTagDatalist()}`;
}

function renderItemDatabasePanel() {
  const panel = itemDbGetPanel();
  const allItems = itemDbBuildIndex();
  const visibleItems = itemDbGetVisibleItems(allItems);
  const selected = allItems.find(item => item.canonicalKey === _itemDbState.selectedKey) || visibleItems[0] || null;
  if (selected && !_itemDbState.selectedKey) _itemDbState.selectedKey = selected.canonicalKey;
  const summary = itemDbGetSummary(allItems);

  panel.hidden = !_itemDbState.open;
  panel.innerHTML = `
    <div class="item-db-shell">
      <header class="item-db-header">
        <div class="item-db-brand-mark" aria-hidden="true">${itemDbRenderImage(selected || { title: 'Inventar' }, 'item-db-brand-icon')}</div>
        <div>
          <div class="item-db-kicker">Inventar-Register</div>
          <h2>Items und Gueter</h2>
          <p>${summary.itemCount} Eintraege aus ${summary.sourceCount} Quellen · ${summary.duplicateCount} zusammengefuehrte Dubletten</p>
        </div>
        <div class="item-db-header-actions">
          <button type="button" data-item-db-action="start-create">Neuer Eintrag</button>
          <button type="button" data-item-db-action="open-category-config">Kategorien</button>
          <button type="button" data-item-db-action="export-db">Export</button>
          <button type="button" data-item-db-action="open-import">Import</button>
          <button type="button" data-item-db-action="include-market-folder"${_itemDbState.loading ? ' disabled' : ''}>Marktordner einbeziehen</button>
          <button type="button" data-item-db-action="rescan"${_itemDbState.loading ? ' disabled' : ''}>${_itemDbState.loading ? 'Scan laeuft...' : 'Neu scannen'}</button>
          <button class="item-db-close" type="button" data-item-db-action="close" aria-label="Schliessen">x</button>
        </div>
      </header>
      <div class="item-db-body">
        ${itemDbRenderFilterSidebar(allItems)}
        <main class="item-db-main">
          <div class="item-db-main-head">
            <div><strong>Gegenstaende</strong><span>${visibleItems.length} von ${allItems.length} Eintraegen</span></div>
          </div>
          ${_itemDbState.loadMessage ? `<div class="item-db-status">${itemDbEscapeHtml(_itemDbState.loadMessage)}</div>` : ''}
          ${_itemDbState.importError ? `<div class="item-db-status error">${itemDbEscapeHtml(_itemDbState.importError)}</div>` : ''}
          ${itemDbRenderTable(visibleItems)}
        </main>
        ${itemDbRenderDetail(selected)}
      </div>
    </div>
    ${itemDbRenderEditorDialog()}
    ${itemDbRenderCategoryConfigDialog()}`;
}

async function itemDbRefreshSources(message = 'Marktquellen werden geladen...', options = {}) {
  if (_itemDbState.loading) return;
  const includeMarketOnly = options.marketOnly === true;
  _itemDbState.loading = true;
  _itemDbState.loadMessage = message;
  renderItemDatabasePanel();
  try {
    if (typeof itemDbLoadMarketSources === 'function') await itemDbLoadMarketSources();
    const candidates = includeMarketOnly && typeof itemDbCollectMarketCandidates === 'function'
      ? itemDbCollectMarketCandidates()
      : (typeof itemDbCollectSourceCandidates === 'function' ? itemDbCollectSourceCandidates() : []);
    const result = itemDbAppendScanCandidates(candidates);
    const summary = itemDbGetSummary();
    _itemDbState.loadMessage = `${result.added} neue Eintraege ergaenzt. ${summary.itemCount} Eintraege im Register.`;
  } catch (error) {
    console.error('Item database scan failed:', error);
    _itemDbState.loadMessage = 'Scan fehlgeschlagen. Details stehen in der Konsole.';
  } finally {
    _itemDbState.loading = false;
    renderItemDatabasePanel();
  }
}

function itemDbOpen() {
  _itemDbState.open = true;
  renderItemDatabasePanel();
  if (!itemDbReadScanCache().length) itemDbRefreshSources();
}

function itemDbClose() {
  _itemDbState.open = false;
  _itemDbState.creating = false;
  _itemDbState.editingKey = '';
  _itemDbState.categoryConfigOpen = false;
  renderItemDatabasePanel();
}

function itemDbCollectEditorValues(scope) {
  const valueFor = field => scope.querySelector(`[data-item-edit="${field}"]`)?.value || '';
  return {
    title: valueFor('title'),
    category: valueFor('category'),
    type: valueFor('type'),
    image: valueFor('image'),
    price: valueFor('price'),
    currency: valueFor('currency'),
    tags: valueFor('tags'),
    description: valueFor('description'),
    details: valueFor('details'),
    hiddenMeta: {
      rarity: valueFor('rarity'),
      origin: valueFor('origin'),
      material: valueFor('material'),
      weight: valueFor('weight'),
      condition: valueFor('condition'),
      stock: valueFor('stock')
    }
  };
}

function itemDbResetFilters() {
  _itemDbState.search = '';
  _itemDbState.activeCategory = 'alle';
  _itemDbState.rarityFilters = new Set();
  _itemDbState.origin = '';
  _itemDbState.minPrice = '';
  _itemDbState.maxPrice = '';
  _itemDbState.availableOnly = false;
  _itemDbState.selectedKey = '';
}

function itemDbDownloadExport() {
  const payload = itemDbExportDatabasePayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `aleria-item-gueter-datenbank-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function itemDbImportFromFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      itemDbImportDatabasePayload(JSON.parse(String(reader.result || '{}')));
      _itemDbState.importError = '';
      _itemDbState.selectedKey = '';
      renderItemDatabasePanel();
      if (typeof showAppStatus === 'function') showAppStatus('Items-und-Gueter-Datenbank importiert.', 'success');
    } catch (error) {
      _itemDbState.importError = error.message || 'Import fehlgeschlagen.';
      renderItemDatabasePanel();
    }
  };
  reader.onerror = () => {
    _itemDbState.importError = 'Datei konnte nicht gelesen werden.';
    renderItemDatabasePanel();
  };
  reader.readAsText(file, 'utf-8');
}

function itemDbBuildPreviewItemFromEditor() {
  const base = _itemDbState.creating
    ? {}
    : itemDbBuildIndex().find(candidate => candidate.canonicalKey === _itemDbState.editingKey) || {};
  return itemDbNormalizeItem({
    ...base,
    ...itemDbCollectEditorValues(document.querySelector('[data-item-db-editor]') || document)
  }) || base;
}

function itemDbUpdateEditPreview() {
  const preview = document.querySelector('[data-item-db-edit-preview]');
  if (!preview) return;
  preview.innerHTML = itemDbRenderDetail(itemDbBuildPreviewItemFromEditor(), { hideActions: true });
}

function itemDbCollectCategoryConfigRows() {
  return Array.from(document.querySelectorAll('[data-item-db-config-category-row]')).map(row => ({
    id: row.dataset.categoryId || '',
    label: row.querySelector('[data-item-db-config-field="label"]')?.value || '',
    columns: row.querySelector('[data-item-db-config-field="columns"]')?.value || '',
    tags: row.querySelector('[data-item-db-config-field="tags"]')?.value || ''
  }));
}

async function handleItemDatabaseClick(event) {
  const trigger = event.target?.closest?.('[data-item-db-action]');
  if (!trigger) return;
  const action = trigger.dataset.itemDbAction;

  if (action === 'open') {
    event.preventDefault();
    itemDbOpen();
    return;
  }
  if (action === 'close') {
    event.preventDefault();
    itemDbClose();
    return;
  }
  if (action === 'select-item') {
    _itemDbState.selectedKey = trigger.dataset.itemKey || '';
    renderItemDatabasePanel();
    return;
  }
  if (action === 'sort') {
    const column = trigger.dataset.column || 'item';
    if (_itemDbState.sortColumn === column) {
      _itemDbState.sortDirection = _itemDbState.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      _itemDbState.sortColumn = column;
      _itemDbState.sortDirection = 'asc';
    }
    renderItemDatabasePanel();
    return;
  }
  if (action === 'toggle-rarity') {
    const rarity = trigger.dataset.rarity || '';
    if (_itemDbState.rarityFilters.has(rarity)) _itemDbState.rarityFilters.delete(rarity);
    else _itemDbState.rarityFilters.add(rarity);
    _itemDbState.selectedKey = '';
    renderItemDatabasePanel();
    return;
  }
  if (action === 'toggle-available') {
    _itemDbState.availableOnly = !!trigger.checked;
    _itemDbState.selectedKey = '';
    renderItemDatabasePanel();
    return;
  }
  if (action === 'reset-filters') {
    itemDbResetFilters();
    renderItemDatabasePanel();
    return;
  }
  if (action === 'start-create') {
    _itemDbState.creating = true;
    _itemDbState.editingKey = '';
    renderItemDatabasePanel();
    document.querySelector('#item-db-panel [data-item-edit="title"]')?.focus();
    return;
  }
  if (action === 'open-edit') {
    _itemDbState.creating = false;
    _itemDbState.editingKey = trigger.dataset.itemKey || _itemDbState.selectedKey || '';
    renderItemDatabasePanel();
    document.querySelector('#item-db-panel [data-item-edit="title"]')?.focus();
    return;
  }
  if (action === 'close-edit') {
    _itemDbState.creating = false;
    _itemDbState.editingKey = '';
    renderItemDatabasePanel();
    return;
  }
  if (action === 'open-category-config') {
    _itemDbState.categoryConfigOpen = true;
    _itemDbState.creating = false;
    _itemDbState.editingKey = '';
    renderItemDatabasePanel();
    return;
  }
  if (action === 'close-category-config') {
    _itemDbState.categoryConfigOpen = false;
    renderItemDatabasePanel();
    return;
  }
  if (action === 'add-category-config') {
    try {
      const scope = trigger.closest('.item-db-config-new') || document;
      itemDbAddCustomCategory({
        label: scope.querySelector('[data-item-db-new-category="label"]')?.value || '',
        columns: scope.querySelector('[data-item-db-new-category="columns"]')?.value || '',
        tags: scope.querySelector('[data-item-db-new-category="tags"]')?.value || ''
      });
      renderItemDatabasePanel();
    } catch (error) {
      if (typeof showAppStatus === 'function') showAppStatus(error.message || 'Kategorie konnte nicht angelegt werden.', 'error');
    }
    return;
  }
  if (action === 'save-category-config') {
    itemDbSaveCategoryConfig(
      itemDbCollectCategoryConfigRows(),
      document.querySelector('[data-item-db-config-global-tags]')?.value || ''
    );
    _itemDbState.categoryConfigOpen = false;
    renderItemDatabasePanel();
    return;
  }
  if (action === 'delete-category-config') {
    itemDbDeleteCustomCategory(trigger.dataset.category || '');
    if (_itemDbState.activeCategory === trigger.dataset.category) _itemDbState.activeCategory = 'alle';
    renderItemDatabasePanel();
    return;
  }
  if (action === 'create-item') {
    const editor = document.querySelector('[data-item-db-editor]');
    try {
      const key = itemDbCreateCustomItem(itemDbCollectEditorValues(editor));
      _itemDbState.creating = false;
      _itemDbState.editingKey = '';
      _itemDbState.selectedKey = key;
      renderItemDatabasePanel();
    } catch (error) {
      if (typeof showAppStatus === 'function') showAppStatus(error.message || 'Item konnte nicht angelegt werden.', 'error');
    }
    return;
  }
  if (action === 'save-item') {
    const editor = document.querySelector('[data-item-db-editor]');
    const key = trigger.dataset.itemKey || _itemDbState.editingKey || '';
    itemDbSaveItem(key, itemDbCollectEditorValues(editor));
    _itemDbState.selectedKey = key;
    _itemDbState.editingKey = '';
    renderItemDatabasePanel();
    return;
  }
  if (action === 'clear-override') {
    itemDbClearOverride(trigger.dataset.itemKey);
    renderItemDatabasePanel();
    return;
  }
  if (action === 'delete-item') {
    const key = trigger.dataset.itemKey || '';
    const item = itemDbBuildIndex().find(candidate => candidate.canonicalKey === key);
    if (!item) return;
    if (!window.confirm(`"${item.title}" aus der Items- und Gueterdatenbank entfernen?`)) return;
    itemDbDeleteItem(key);
    _itemDbState.selectedKey = '';
    _itemDbState.creating = false;
    _itemDbState.editingKey = '';
    renderItemDatabasePanel();
    return;
  }
  if (action === 'rescan') {
    await itemDbRefreshSources('Markt- und Modulquellen werden ergaenzend gescannt...');
    return;
  }
  if (action === 'include-market-folder') {
    await itemDbRefreshSources('Marktordner werden direkt einbezogen...', { marketOnly: true });
    return;
  }
  if (action === 'export-db') {
    itemDbDownloadExport();
    return;
  }
  if (action === 'open-import') {
    const input = itemDbGetImportInput();
    input.value = '';
    input.click();
  }
}

function handleItemDatabaseInput(event) {
  const action = event.target?.dataset?.itemDbAction;
  const restoreInputFocus = selector => {
    const nextInput = document.querySelector(selector);
    if (!nextInput) return;
    nextInput.focus({ preventScroll: true });
    try {
      if (typeof nextInput.setSelectionRange === 'function') {
        nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
      }
    } catch (error) {
      // Number inputs do not expose a text selection range in every browser.
    }
  };
  if (action === 'search') {
    _itemDbState.search = event.target.value || '';
    _itemDbState.selectedKey = '';
    renderItemDatabasePanel();
    restoreInputFocus('#item-db-panel [data-item-db-action="search"]');
    return;
  }
  if (action === 'set-category-select') {
    _itemDbState.activeCategory = event.target.value || 'alle';
    _itemDbState.selectedKey = '';
    renderItemDatabasePanel();
    return;
  }
  if (action === 'set-origin') {
    _itemDbState.origin = event.target.value || '';
    _itemDbState.selectedKey = '';
    renderItemDatabasePanel();
    return;
  }
  if (action === 'set-min-price') {
    _itemDbState.minPrice = event.target.value || '';
    _itemDbState.selectedKey = '';
    renderItemDatabasePanel();
    restoreInputFocus('#item-db-panel [data-item-db-action="set-min-price"]');
    return;
  }
  if (action === 'set-max-price') {
    _itemDbState.maxPrice = event.target.value || '';
    _itemDbState.selectedKey = '';
    renderItemDatabasePanel();
    restoreInputFocus('#item-db-panel [data-item-db-action="set-max-price"]');
    return;
  }
  if (event.target?.closest?.('[data-item-db-editor]')) {
    itemDbUpdateEditPreview();
  }
}

function handleItemDatabaseImportChange(event) {
  if (event.target?.id !== 'item-db-import-input') return;
  itemDbImportFromFile(event.target.files?.[0]);
}

function handleItemDatabaseSubmit(event) {
  if (!event.target?.matches?.('[data-item-db-editor]')) return;
  event.preventDefault();
}

function initItemDatabaseUi() {
  document.addEventListener('click', handleItemDatabaseClick);
  document.addEventListener('input', handleItemDatabaseInput);
  document.addEventListener('change', handleItemDatabaseInput);
  document.addEventListener('change', handleItemDatabaseImportChange);
  document.addEventListener('submit', handleItemDatabaseSubmit);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initItemDatabaseUi);
} else {
  initItemDatabaseUi();
}
