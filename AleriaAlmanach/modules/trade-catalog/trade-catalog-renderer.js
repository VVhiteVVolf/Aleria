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
  const tabs = [
    `<button class="trade-catalog-tab active" type="button" data-trade-filter="all">${escapeHtml(data.allLabel)}</button>`,
    ...data.categories.map(category =>
      `<button class="trade-catalog-tab" type="button" data-trade-filter="${escapeHtml(category.id)}">${escapeHtml(category.label)}</button>`
    )
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

function buildTradeCatalogItem(item) {
  const searchText = [
    item.title,
    item.subtitle,
    item.category,
    item.description,
    item.origin,
    item.conditions,
    ...(item.tags || []),
    ...(item.usageTags || [])
  ].join(' ').toLowerCase();
  return `
    <article class="trade-catalog-item" data-trade-category="${escapeHtml(item.category)}" data-trade-search="${escapeHtml(searchText)}">
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
        ${buildTradeFeatureList(item)}
      </section>
      <aside class="trade-catalog-meta">
        <section class="trade-catalog-meta-block">
          <h4>${escapeHtml(item.originTitle)}</h4>
          <p>${sanitizeContentHtml(item.origin || '')}</p>
        </section>
        <section class="trade-catalog-meta-block">
          <h4>${escapeHtml(item.usageTitle)}</h4>
          ${buildTradeTagList(item.usageTags, 'trade-catalog-use-tags')}
        </section>
        ${buildTradePrice(item)}
        <section class="trade-catalog-meta-block">
          <h4>${escapeHtml(item.conditionsTitle)}</h4>
          <p>${sanitizeContentHtml(item.conditions || '')}</p>
        </section>
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
          ${data.items.length ? data.items.map(buildTradeCatalogItem).join('') : '<div class="trade-catalog-empty">Noch keine Handelsgueter eingetragen.</div>'}
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
