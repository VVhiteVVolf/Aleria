function itemDbGetModuleEntries() {
  try {
    return Object.values(_entryOverrides || {}).filter(entry => entry && typeof entry === 'object');
  } catch (error) {
    console.warn('Item database could not read module entries:', error);
    return [];
  }
}

function itemDbBuildSourceRef(kind, entry = {}, page = {}, extra = {}) {
  return {
    kind,
    moduleId: String(entry.id || '').trim(),
    moduleTitle: String(entry.title || '').trim(),
    moduleType: String(entry.type || '').trim(),
    pageTitle: String(page.pageTitle || page.title || '').trim(),
    ...extra
  };
}

function itemDbGetGoodsCell(row = {}, columnId = '') {
  if (row.values && Object.prototype.hasOwnProperty.call(row.values, columnId)) {
    return String(row.values[columnId] || '').trim();
  }
  return String(row[columnId] || '').trim();
}

function itemDbExtractGoodsRegister(entry, page, pageIndex) {
  if (!page?.goodsTablePage || typeof sanitizeGoodsTableData !== 'function') return [];
  const goods = sanitizeGoodsTableData(page.goodsTable || {});
  const candidates = [];

  goods.tables.forEach((table, tableIndex) => {
    const kindColumn = table.columns.find(column => column.id === 'kind');
    const nameColumn = table.columns.find(column => column.id === 'name');
    const descColumn = table.columns.find(column => column.id === 'description');
    const priceColumn = table.columns.find(column => column.id === 'price');
    const availabilityColumn = table.columns.find(column => column.id === 'availability');

    table.rows.forEach((row, rowIndex) => {
      const category = table.categories.find(item => item.id === row.category);
      const title = itemDbGetGoodsCell(row, nameColumn?.id || 'name');
      if (!title) return;
      candidates.push({
        title,
        category: category?.label || row.category,
        categoryLabel: category?.label || '',
        type: itemDbGetGoodsCell(row, kindColumn?.id || 'kind'),
        description: itemDbGetGoodsCell(row, descColumn?.id || 'description'),
        details: row.details || '',
        price: itemDbGetGoodsCell(row, priceColumn?.id || 'price'),
        image: row.image || '',
        tags: [category?.label, itemDbGetGoodsCell(row, kindColumn?.id || 'kind')].filter(Boolean),
        sourceRefs: [itemDbBuildSourceRef('goods-register', entry, page, {
          pageIndex,
          tableId: table.id,
          tableTitle: table.title,
          rowIndex
        })],
        hiddenMeta: {
          sourceTemplate: 'Warenregister',
          availability: itemDbGetGoodsCell(row, availabilityColumn?.id || 'availability'),
          tableAllLabel: table.tableTitle || ''
        }
      });
    });
  });

  return candidates;
}

function itemDbBuildTradePrice(item = {}) {
  const min = String(item.priceMin || '').trim();
  const max = String(item.priceMax || '').trim();
  if (min && max && min !== max) return `${min} - ${max}`;
  return min || max || '';
}

function itemDbExtractTradeCatalog(entry, page, pageIndex) {
  if (!page?.tradeCatalogPage || typeof sanitizeTradeCatalogData !== 'function') return [];
  const catalog = sanitizeTradeCatalogData(page.tradeCatalog || {});

  return catalog.items.map((item, itemIndex) => {
    const category = catalog.categories.find(categoryItem => categoryItem.id === item.category);
    return {
      title: item.title,
      category: category?.label || item.category,
      categoryLabel: category?.label || '',
      type: item.subtitle,
      description: item.description,
      details: item.conditions || '',
      price: itemDbBuildTradePrice(item),
      currency: item.currencyLabel || item.currencyCode || '',
      image: item.image,
      tags: [...(item.tags || []), ...(item.usageTags || [])],
      attributes: item.attributes,
      sourceRefs: [itemDbBuildSourceRef('trade-catalog', entry, page, {
        pageIndex,
        itemId: item.id,
        itemIndex
      })],
      hiddenMeta: {
        sourceTemplate: 'Handelsgutregister',
        origin: item.origin,
        priceFill: item.priceFill,
        currencyCode: item.currencyCode,
        sealImage: item.sealImage
      }
    };
  });
}

function itemDbExtractFromModules() {
  const candidates = [];
  itemDbGetModuleEntries().forEach(entry => {
    (Array.isArray(entry.pages) ? entry.pages : []).forEach((page, pageIndex) => {
      candidates.push(...itemDbExtractGoodsRegister(entry, page, pageIndex));
      candidates.push(...itemDbExtractTradeCatalog(entry, page, pageIndex));
    });
  });
  return candidates;
}

const ITEM_DB_MARKET_SOURCES = [
  { path: '../Markt/Taverne/data/tavern-data.js', globalName: 'TAVERN_DATA' },
  { path: '../Markt/Viehmarkt/data/livestock-data.js', globalName: 'LIVESTOCK_DATA' },
  { path: '../Markt/Alchemist/data/alchemy-data.js', globalName: 'ALCHEMY_DATA' },
  { path: '../Markt/Arkanist/data/arcane-data.js', globalName: 'ARCANE_DATA' },
  { path: '../Markt/Schwarzmarkt/data/blackmarket-data.js', globalName: 'BLACKMARKET_DATA' },
  { path: '../Markt/Gemischtwarenhändler/data/goods-data.js', globalName: 'GOODS_DATA' },
  { path: '../Markt/WaffenRüstungen/data/shop-data.js', globalName: 'ARMORY_DATA' },
  { path: '../Markt/Rossmarkt/data/kontext-pferde.js', globalName: 'ROSSMARKT_PFERDE_KONTEXT_MD' }
];

const _itemDbMarketScriptPromises = new Map();

function itemDbCssEscape(value) {
  if (window.CSS?.escape) return CSS.escape(value);
  return String(value || '').replace(/["\\]/g, '\\$&');
}

function itemDbLoadScript(src) {
  const safeSrc = String(src || '').trim();
  if (!safeSrc) return Promise.resolve(false);
  if (_itemDbMarketScriptPromises.has(safeSrc)) return _itemDbMarketScriptPromises.get(safeSrc);

  const promise = new Promise(resolve => {
    if (document.querySelector(`script[data-item-db-source="${itemDbCssEscape(safeSrc)}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = safeSrc;
    script.defer = true;
    script.dataset.itemDbSource = safeSrc;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Item database market source could not be loaded:', safeSrc);
      resolve(false);
    };
    document.head.appendChild(script);
  });
  _itemDbMarketScriptPromises.set(safeSrc, promise);
  return promise;
}

function itemDbLoadMarketSources() {
  return Promise.all(ITEM_DB_MARKET_SOURCES.map(source => {
    if (window[source.globalName] != null) return Promise.resolve(true);
    return itemDbLoadScript(source.path);
  }));
}

function itemDbFormatMarketPrice(price) {
  if (price == null || price === '') return '';
  if (typeof price === 'number') return String(price);
  if (Array.isArray(price)) return price.length > 1 ? `${price[0]} - ${price[1]}` : String(price[0] || '');
  if (typeof price === 'object') {
    const min = String(price.min ?? '').trim();
    const max = String(price.max ?? '').trim();
    const unit = String(price.unit || '').trim();
    const value = min && max && min !== max ? `${min} - ${max}` : min || max;
    return [value, unit].filter(Boolean).join(' ');
  }
  return String(price || '').trim();
}

function itemDbMarketAttributes(stats, labels = []) {
  if (!Array.isArray(stats)) return [];
  return stats.map((value, index) => ({
    label: labels[index] || `Wert ${index + 1}`,
    value
  }));
}

function itemDbExtractMarketItems(data, config = {}) {
  const items = Array.isArray(data?.items) ? data.items : [];
  return items.map((item, index) => ({
    title: item.name || item.title,
    category: config.category || item.category || item.type,
    categoryLabel: config.categoryLabel || '',
    type: item.type || item.subtitle || item.rarity || item.category || '',
    description: item.kind || item.role || item.material || item.unit || '',
    details: item.detailDesc || item.desc || item.description || '',
    price: itemDbFormatMarketPrice(item.price),
    currency: item.price?.unit || '',
    image: item.image || data.defaultImage || '',
    tags: item.tags || [],
    attributes: itemDbMarketAttributes(item.stats, data.profileLabels),
    sourceRefs: [{ kind: 'market-folder', market: config.market, rowIndex: index }],
    hiddenMeta: {
      sourceTemplate: config.sourceTemplate,
      originalCategory: item.category || '',
      rarity: item.rarity || '',
      unit: item.unit || '',
      weight: item.weight || '',
      material: item.material || '',
      requirement: item.requirement || '',
      magical: item.magical || ''
    }
  })).filter(item => item.title);
}

function itemDbParseMarkdownTableRows(markdown) {
  const rows = [];
  String(markdown || '').split(/\r?\n/).forEach(line => {
    const text = line.trim();
    if (!text.startsWith('|') || !text.endsWith('|')) return;
    if (/^\|\s*-+/.test(text) || /rasse\s*\|/i.test(text)) return;
    const cells = text.split('|').slice(1, -1).map(cell => cell.trim());
    if (cells.length >= 4 && cells[0]) rows.push(cells);
  });
  return rows;
}

function itemDbExtractRossmarktContext() {
  const markdown = window.ROSSMARKT_PFERDE_KONTEXT_MD || '';
  const seen = new Set();
  return itemDbParseMarkdownTableRows(markdown)
    .map((cells, index) => {
      const title = cells[0];
      const key = itemDbSlugify(title);
      if (seen.has(key)) return null;
      seen.add(key);
      return {
        title,
        category: 'Pferde',
        type: cells[2] || 'Pferderasse',
        description: cells[1] ? `Herkunft: ${cells[1]}` : 'Pferderasse aus dem Rossmarkt-Kontext.',
        details: cells[4] ? `Alter: ${cells[4]}` : '',
        price: cells[3] || '',
        currency: cells[3]?.includes('Taler') ? 'Taler' : '',
        image: '',
        tags: ['Pferd', cells[1], cells[2]].filter(Boolean),
        sourceRefs: [{ kind: 'market-folder', market: 'Rossmarkt', rowIndex: index }],
        hiddenMeta: { sourceTemplate: 'Markt/Rossmarkt', rawRow: cells.join(' | ') }
      };
    })
    .filter(Boolean);
}

function itemDbExtractFromLoadedMarketData() {
  const candidates = [];

  if (window.TAVERN_DATA?.items) {
    candidates.push(...itemDbExtractMarketItems(window.TAVERN_DATA, {
      market: 'Taverne',
      sourceTemplate: 'Markt/Taverne'
    }));
  }

  if (window.LIVESTOCK_DATA?.animals) {
    candidates.push(...itemDbExtractMarketItems({ ...window.LIVESTOCK_DATA, items: window.LIVESTOCK_DATA.animals }, {
      market: 'Viehmarkt',
      sourceTemplate: 'Markt/Viehmarkt'
    }));
  }

  if (window.ALCHEMY_DATA?.items) {
    candidates.push(...itemDbExtractMarketItems(window.ALCHEMY_DATA, {
      market: 'Alchemist',
      sourceTemplate: 'Markt/Alchemist',
      category: 'Alchemie'
    }));
  }

  if (window.ARCANE_DATA?.items) {
    candidates.push(...itemDbExtractMarketItems(window.ARCANE_DATA, {
      market: 'Arkanist',
      sourceTemplate: 'Markt/Arkanist',
      category: 'Arkanes'
    }));
  }

  if (window.BLACKMARKET_DATA?.items) {
    candidates.push(...itemDbExtractMarketItems(window.BLACKMARKET_DATA, {
      market: 'Schwarzmarkt',
      sourceTemplate: 'Markt/Schwarzmarkt'
    }));
  }

  if (window.GOODS_DATA?.items) {
    candidates.push(...itemDbExtractMarketItems(window.GOODS_DATA, {
      market: 'Gemischtwarenhändler',
      sourceTemplate: 'Markt/Gemischtwarenhändler'
    }));
  }

  if (window.ARMORY_DATA?.items) {
    candidates.push(...itemDbExtractMarketItems(window.ARMORY_DATA, {
      market: 'Waffen & Rüstungen',
      sourceTemplate: 'Markt/WaffenRüstungen'
    }));
  }

  if (window.ROSSMARKT_PFERDE_KONTEXT_MD) {
    candidates.push(...itemDbExtractRossmarktContext());
  }

  return candidates;
}

function itemDbCollectSourceCandidates() {
  return [
    ...itemDbExtractFromModules(),
    ...itemDbExtractFromLoadedMarketData()
  ];
}
