function buildTradeCatalogImage(src, className, fallback = '') {
  const image = sanitizeImageSrc(src || '');
  if (image) return `<div class="${className}"><img src="${image}" alt="" loading="lazy" decoding="async"></div>`;
  return `<div class="${className} placeholder">${escapeHtml(fallback || '*')}</div>`;
}

function buildTradeCatalogSmallIcon(value, className = 'trade-small-icon') {
  const icon = String(value || '').trim();
  const image = sanitizeImageSrc(icon);
  if (image) return `<img class="${className}" src="${image}" alt="" loading="lazy" decoding="async">`;
  return `<span class="${className}">${escapeHtml(icon || '*')}</span>`;
}

function getTradeCatalogImageStyle(item) {
  return [
    `--trade-image-height:${Number(item.imageHeight) || 220}px`,
    `--trade-price-fill:${Number(item.priceFill) || 0}%`
  ].join(';');
}

function getTradeCatalogImageClasses(item) {
  return [
    item.imageFormat || 'landscape',
    item.imageFit === 'contain' ? 'is-contain' : 'is-cover',
    `position-${item.imagePosition || 'center'}`
  ].join(' ');
}

function buildTradeCatalogTabs(data, scopeId) {
  const activeCategory = data.categories[0]?.id || 'all';
  const tabs = [
    ...data.categories.map(category => {
      const activeClass = category.id === activeCategory ? ' active' : '';
      return `<button class="trade-catalog-tab${activeClass}" type="button" data-trade-filter="${escapeHtml(category.id)}">${escapeHtml(category.label)}</button>`;
    }),
    `<button class="trade-catalog-tab${activeCategory === 'all' ? ' active' : ''}" type="button" data-trade-filter="all">${escapeHtml(data.allLabel)}</button>`
  ].join('');
  return `<div class="trade-catalog-tabs" data-trade-filter-scope="${escapeHtml(scopeId)}">${tabs}</div>`;
}

function buildTradeTagList(tags = [], className = 'trade-catalog-tags') {
  if (!Array.isArray(tags) || !tags.length) return '';
  return `<div class="${className}">${tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>`;
}

function buildTradeFeatureList(item) {
  if (!Array.isArray(item.features) || !item.features.length) return '';
  return `
    <section class="trade-catalog-features">
      <h4>${escapeHtml(item.featuresTitle)}</h4>
      <ul>${item.features.map(feature => `
        <li>${buildTradeCatalogSmallIcon(feature.icon, 'trade-feature-icon')}<span>${escapeHtml(feature.text || '')}</span></li>`).join('')}</ul>
    </section>`;
}

function getTradeCatalogAttributePoint(attribute, index, total, radius = 58, center = 78) {
  const angle = (-90 + (360 / total) * index) * Math.PI / 180;
  const value = Math.max(0, Math.min(10, Number(attribute?.value) || 0));
  const distance = radius * (value / 10);
  return {
    x: center + Math.cos(angle) * distance,
    y: center + Math.sin(angle) * distance
  };
}

function getTradeCatalogAttributeLabelPoint(index, total, center = 120) {
  const angle = (-90 + (360 / total) * index) * Math.PI / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  let x = center + cos * 86;
  let anchor = 'middle';
  if (cos > 0.35) {
    x = 218;
    anchor = 'end';
  } else if (cos < -0.35) {
    x = 22;
    anchor = 'start';
  }
  let y = center + sin * 82;
  if (sin < -0.75) y = 20;
  if (sin > 0.75) y = 200;
  return {
    x: Math.max(22, Math.min(218, x)),
    y: Math.max(20, Math.min(200, y)),
    anchor
  };
}

function buildTradeAttributeChart(item) {
  const attributes = Array.isArray(item.attributes) ? item.attributes.filter(attribute => attribute.label) : [];
  if (attributes.length < 3) return '';
  const total = attributes.length;
  const center = 120;
  const radius = 50;
  const axisPoints = attributes.map((attribute, index) => getTradeCatalogAttributePoint({ ...attribute, value: 10 }, index, total, radius, center));
  const valuePoints = attributes.map((attribute, index) => getTradeCatalogAttributePoint(attribute, index, total, radius, center));
  const labelPoints = attributes.map((attribute, index) => getTradeCatalogAttributeLabelPoint(index, total, center));
  const polygon = valuePoints.map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
  const rings = [0.25, 0.5, 0.75, 1].map(scale => {
    const ring = attributes.map((attribute, index) => getTradeCatalogAttributePoint({ ...attribute, value: 10 * scale }, index, total, radius, center));
    return `<polygon points="${ring.map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ')}"></polygon>`;
  }).join('');

  return `
    <section class="trade-catalog-attributes">
      <h4>${escapeHtml(item.attributesTitle || 'Attribute')}</h4>
      <div class="trade-radar-wrap">
        <svg class="trade-radar-chart" viewBox="0 0 240 220" role="img" aria-label="${escapeHtml(item.attributesTitle || 'Attribute')}">
          <g class="trade-radar-rings">${rings}</g>
          <g class="trade-radar-axes">
            ${axisPoints.map(point => `<line x1="${center}" y1="${center}" x2="${point.x.toFixed(1)}" y2="${point.y.toFixed(1)}"></line>`).join('')}
          </g>
          <polygon class="trade-radar-value" points="${escapeHtml(polygon)}"></polygon>
          <g class="trade-radar-dots">
            ${valuePoints.map(point => `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="2.6"></circle>`).join('')}
          </g>
          <g class="trade-radar-labels">
            ${labelPoints.map((point, index) => `<text x="${point.x.toFixed(1)}" y="${point.y.toFixed(1)}" text-anchor="${point.anchor}">${escapeHtml(attributes[index].label)}</text>`).join('')}
          </g>
        </svg>
      </div>
      <div class="trade-attribute-bars">
        ${attributes.map(attribute => {
          const value = Math.max(0, Math.min(10, Number(attribute.value) || 0));
          return `
            <div class="trade-attribute-row">
              <span>${escapeHtml(attribute.label)}</span>
              <i><b style="width:${escapeHtml(`${value * 10}%`)}"></b></i>
              <strong>${escapeHtml(value)}</strong>
            </div>`;
        }).join('')}
      </div>
    </section>`;
}

function buildTradeDescriptionLower(item) {
  const features = buildTradeFeatureList(item);
  if (!features) return '';
  return `<div class="trade-description-lower">${features}</div>`;
}

function buildTradePrice(item) {
  const price = item.priceMin || item.priceMax
    ? `${escapeHtml(item.priceMin || '-')}${item.priceMax ? ` - ${escapeHtml(item.priceMax)}` : ''}`
    : '-';
  return `
    <section class="trade-catalog-meta-block trade-catalog-price">
      <h4>${escapeHtml(item.priceTitle)}</h4>
      <div class="trade-price-bar"><span style="width:${escapeHtml(`${Number(item.priceFill) || 0}%`)}"></span></div>
      <strong>${price}</strong>
      <div class="trade-currency">${buildTradeCatalogSmallIcon(item.currencyIcon, 'trade-currency-icon')}<span>${escapeHtml(item.currencyLabel)}</span></div>
      ${item.priceNote ? `<p>${escapeHtml(item.priceNote)}</p>` : ''}
    </section>`;
}

function buildTradeCatalogItem(item, activeCategory = 'all') {
  const searchText = [
    item.title,
    item.subtitle,
    item.category,
    item.description,
    item.origin,
    ...(item.tags || []),
    ...(item.usageTags || [])
  ].join(' ').toLowerCase();
  const hiddenAttr = activeCategory !== 'all' && item.category !== activeCategory ? ' hidden' : '';
  return `
    <article class="trade-catalog-item" data-trade-category="${escapeHtml(item.category)}" data-trade-search="${escapeHtml(searchText)}"${hiddenAttr}>
      <aside class="trade-catalog-visual">
        ${item.badge ? `<div class="trade-catalog-badge">${escapeHtml(item.badge)}</div>` : ''}
        <div class="trade-catalog-image-wrap ${escapeHtml(getTradeCatalogImageClasses(item))}" style="${escapeHtml(getTradeCatalogImageStyle(item))}">
          ${buildTradeCatalogImage(item.image, 'trade-catalog-image', getInitialChar(item.title))}
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        ${item.subtitle ? `<p>${escapeHtml(item.subtitle)}</p>` : ''}
        ${buildTradeTagList(item.tags)}
      </aside>
      <section class="trade-catalog-description">
        <h4>${escapeHtml(item.descriptionTitle)}</h4>
        <div>${sanitizeContentHtml(item.description || '')}</div>
        ${buildTradeDescriptionLower(item)}
      </section>
      <aside class="trade-catalog-meta">
        <section class="trade-catalog-meta-block">
          <h4>${escapeHtml(item.usageTitle)}</h4>
          ${buildTradeTagList(item.usageTags, 'trade-catalog-use-tags')}
        </section>
        ${buildTradePrice(item)}
        ${buildTradeAttributeChart(item)}
        ${item.sealImage ? `<img class="trade-catalog-seal" src="${sanitizeImageSrc(item.sealImage)}" alt="" loading="lazy" decoding="async">` : ''}
      </aside>
    </article>`;
}

function buildTradeCatalogFooter(data) {
  const cards = data.footerCards.map(card => `
    <section class="trade-catalog-footer-card">
      <div class="trade-footer-icon">${escapeHtml(card.icon || '*')}</div>
      <div><h4>${escapeHtml(card.title)}</h4><p>${sanitizeContentHtml(card.text || '')}</p></div>
    </section>`).join('');
  const advisor = data.advisorTitle || data.advisorText || data.advisorImage
    ? `<section class="trade-catalog-advisor">
        <div><h4>${escapeHtml(data.advisorTitle)}</h4><p>${sanitizeContentHtml(data.advisorText || '')}</p></div>
        ${buildTradeCatalogImage(data.advisorImage, 'trade-advisor-image', '')}
      </section>`
    : '';
  if (!cards && !advisor) return '';
  return `<footer class="trade-catalog-footer">${cards}${advisor}</footer>`;
}

function buildTradeCatalogPage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const data = sanitizeTradeCatalogData(page.tradeCatalog || {});
  const scopeId = `trade-${slugify(entry?.id || entry?.title || 'handelsgut', 'handelsgut')}-${pageIndex}`;
  const activeCategory = data.categories[0]?.id || 'all';
  return `
    ${nav}
    <div class="trade-catalog-page">
      <article class="trade-catalog-sheet">
        <header class="trade-catalog-header">
          ${buildTradeCatalogImage(data.headerIcon || entry.icon, 'trade-catalog-header-icon', 'H')}
          <div>
            <h2>${escapeHtml(data.title || entry.title || 'Handelsgut & Tiere')}</h2>
            <p>${escapeHtml(data.subtitle || entry.subtitle || '')}</p>
          </div>
          <aside class="trade-catalog-note">
            <div class="trade-note-icon">${escapeHtml(data.noteIcon || '*')}</div>
            <div><strong>${escapeHtml(data.noteTitle)}</strong><span>${sanitizeContentHtml(data.noteText || '')}</span></div>
          </aside>
        </header>
        <div class="trade-catalog-toolbar">
          ${buildTradeCatalogTabs(data, scopeId)}
          <label class="trade-catalog-search">
            <input type="search" placeholder="${escapeHtml(data.searchPlaceholder)}" data-trade-search-input>
            <span>${escapeHtml(data.filterLabel)}</span>
          </label>
        </div>
        <main class="trade-catalog-list">
          ${data.items.length ? data.items.map(item => buildTradeCatalogItem(item, activeCategory)).join('') : '<div class="trade-catalog-empty">Noch keine Handelsgueter eingetragen.</div>'}
        </main>
      </article>
    </div>`;
}

function applyTradeCatalogFilters(root) {
  const scope = root?.closest?.('.trade-catalog-sheet') || root;
  if (!scope) return;
  const active = scope.querySelector('.trade-catalog-tab.active')?.dataset.tradeFilter || 'all';
  const query = String(scope.querySelector('[data-trade-search-input]')?.value || '').trim().toLowerCase();
  scope.querySelectorAll('.trade-catalog-item').forEach(item => {
    const matchesCategory = active === 'all' || item.dataset.tradeCategory === active;
    const matchesSearch = !query || String(item.dataset.tradeSearch || '').includes(query);
    item.hidden = !(matchesCategory && matchesSearch);
  });
}

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('.trade-catalog-tab[data-trade-filter]');
  if (!trigger) return;
  const sheet = trigger.closest('.trade-catalog-sheet');
  if (!sheet) return;
  event.preventDefault();
  sheet.querySelectorAll('.trade-catalog-tab').forEach(tab => tab.classList.toggle('active', tab === trigger));
  applyTradeCatalogFilters(sheet);
});

document.addEventListener('input', event => {
  if (!event.target?.matches?.('[data-trade-search-input]')) return;
  applyTradeCatalogFilters(event.target);
});
