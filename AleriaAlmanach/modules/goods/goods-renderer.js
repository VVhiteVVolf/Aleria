function getGoodsCategoryLabel(table, categoryId) {
  const category = (table.categories || []).find(item => item.id === categoryId);
  return category?.label || categoryId.replace(/-/g, ' ');
}

function buildGoodsImage(src, className, fallback = '', alt = '', options = {}) {
  const image = sanitizeImageSrc(src || '');
  const classes = [
    className,
    options.format || '',
    options.fit === 'cover' ? 'is-cover' : options.fit === 'contain' ? 'is-contain' : '',
    options.position ? `position-${options.position}` : ''
  ].filter(Boolean).join(' ');
  if (image) {
    return `<span class="${escapeHtml(classes)}"><img src="${image}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async"></span>`;
  }
  return `<span class="${escapeHtml(`${classes} placeholder`)}">${escapeHtml(fallback || '+')}</span>`;
}

function getGoodsInitialFilter(table) {
  const categories = Array.isArray(table.categories) ? table.categories : [];
  return categories[0]?.id || 'all';
}

function buildGoodsFilterControls(table, scopeId, activeCategory = getGoodsInitialFilter(table)) {
  const categories = Array.isArray(table.categories) ? table.categories : [];
  const buttons = [
    ...categories.map(category => {
      const activeClass = category.id === activeCategory ? ' active' : '';
      return `<button class="goods-filter-tab${activeClass}" type="button" data-goods-filter="${escapeHtml(category.id)}">${escapeHtml(category.label)}</button>`;
    }),
    `<button class="goods-filter-tab${activeCategory === 'all' ? ' active' : ''}" type="button" data-goods-filter="all">${escapeHtml(table.tableTitle || 'Alle Waren')}</button>`
  ].join('');
  return `<div class="goods-filter-tabs" data-goods-filter-scope="${escapeHtml(scopeId)}">${buttons}</div>`;
}

function getGoodsRowCellValue(row, columnId) {
  return String(row?.values?.[columnId] || '').trim();
}

function getGoodsItemImageStyle(row) {
  const size = Number(row?.imageSize);
  const safeSize = Number.isFinite(size) ? Math.max(42, Math.min(132, Math.round(size))) : 72;
  return `--goods-image-size:${safeSize}px;`;
}

function getGoodsItemImageOptions(row) {
  return {
    format: row?.imageFormat || 'landscape',
    fit: row?.imageFit || 'contain',
    position: row?.imagePosition || 'center'
  };
}

function buildGoodsCell(row, column, goods, table, rowIndex) {
  const value = getGoodsRowCellValue(row, column.id);
  if (column.id === 'name') {
    const fallback = getInitialChar(value || rowIndex + 1);
    return `
        <td class="goods-name-cell" style="${escapeHtml(getGoodsItemImageStyle(row))}">
          ${buildGoodsImage(row.image, 'goods-item-image', fallback, value, getGoodsItemImageOptions(row))}
          <strong>${escapeHtml(value || 'Ware')}</strong>
        </td>`;
  }
  if (column.id === 'price') {
    const coin = goods.coinIcon
      ? `<img class="goods-price-coin" src="${sanitizeImageSrc(goods.coinIcon)}" alt="" loading="lazy" decoding="async">`
      : '';
    return `<td class="goods-price-cell">${escapeHtml(value || '-')}${coin}</td>`;
  }
  if (column.id === 'kind') {
    return `<td><span class="goods-kind">${escapeHtml(value || getGoodsCategoryLabel(table, row.category))}</span></td>`;
  }
  if (column.id === 'description') return `<td class="goods-description-cell">${escapeHtml(value)}</td>`;
  if (column.id === 'availability') return `<td class="goods-stock-cell">${escapeHtml(value || '-')}</td>`;
  return `<td>${escapeHtml(value || '-')}</td>`;
}

function renderGoodsDetailText(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  const safeHtml = typeof sanitizeContentHtml === 'function' ? sanitizeContentHtml(text) : escapeHtml(text);
  if (/<[a-z][\s\S]*>/i.test(safeHtml)) return safeHtml;

  return text
    .split(/\n{2,}/)
    .map(part => `<p>${escapeHtml(part.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function buildGoodsRows(table, goods, activeCategory = 'all') {
  const rows = Array.isArray(table.rows) ? table.rows : [];
  const columns = Array.isArray(table.columns) && table.columns.length ? table.columns : getDefaultGoodsColumns();
  if (!rows.length) {
    return `<tr class="goods-empty-row"><td colspan="${escapeHtml(columns.length)}">Noch keine Waren eingetragen.</td></tr>`;
  }
  return rows.map((item, index) => {
    const category = slugify(item.category || 'sonstiges', 'sonstiges');
    const hiddenAttr = activeCategory !== 'all' && category !== activeCategory ? ' hidden' : '';
    const details = renderGoodsDetailText(item.details);
    const expandableClass = details ? ' is-expandable' : '';
    const expandableAttrs = details ? ' data-goods-detail-trigger tabindex="0" aria-expanded="false"' : '';
    return `
      <tr class="goods-product-row goods-category-${escapeHtml(category)}${expandableClass}"${expandableAttrs}${hiddenAttr}>
        ${columns.map(column => buildGoodsCell(item, column, goods, table, index)).join('')}
      </tr>
      ${details ? `
        <tr class="goods-detail-row goods-category-${escapeHtml(category)}" aria-hidden="true"${hiddenAttr}>
          <td colspan="${escapeHtml(columns.length)}">
            <div class="goods-detail-panel">
              <div class="goods-detail-content">${details}</div>
            </div>
          </td>
        </tr>` : ''}`;
  }).join('');
}

function buildGoodsTableBlock(table, goods, scopeId) {
  const columns = Array.isArray(table.columns) && table.columns.length ? table.columns : getDefaultGoodsColumns();
  const scrollClass = Array.isArray(table.rows) && table.rows.length > 8 ? ' scrollable' : '';
  const activeCategory = getGoodsInitialFilter(table);
  return `
    <section class="goods-table-block" data-goods-table-scope="${escapeHtml(scopeId)}">
      ${table.title ? `<h3 class="goods-table-title">${escapeHtml(table.title)}</h3>` : ''}
      ${buildGoodsFilterControls(table, scopeId, activeCategory)}
      <div class="goods-table-wrap${scrollClass}">
        <table class="goods-table">
          <thead>
            <tr>${columns.map(column => `<th>${escapeHtml(column.label)}</th>`).join('')}</tr>
          </thead>
          <tbody>${buildGoodsRows(table, goods, activeCategory)}</tbody>
        </table>
      </div>
    </section>`;
}

function applyGoodsTableFilter(tableBlock, categoryId) {
  if (!tableBlock) return;
  const activeCategory = String(categoryId || 'all').trim() || 'all';
  tableBlock.querySelectorAll('.goods-filter-tab').forEach(button => {
    button.classList.toggle('active', button.dataset.goodsFilter === activeCategory);
  });
  tableBlock.querySelectorAll('.goods-table tbody tr').forEach(row => {
    const shouldHide = activeCategory !== 'all' && !row.classList.contains(`goods-category-${activeCategory}`);
    row.hidden = shouldHide;
  });
}

function toggleGoodsDetailRow(row) {
  if (!row) return;
  const detailRow = row.nextElementSibling?.classList?.contains('goods-detail-row')
    ? row.nextElementSibling
    : null;
  if (!detailRow) return;
  const expanded = !row.classList.contains('expanded');
  row.classList.toggle('expanded', expanded);
  detailRow.classList.toggle('expanded', expanded);
  row.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  detailRow.setAttribute('aria-hidden', expanded ? 'false' : 'true');
}

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('.goods-filter-tab[data-goods-filter]');
  if (trigger) {
    const tableBlock = trigger.closest('.goods-table-block');
    if (!tableBlock) return;
    event.preventDefault();
    applyGoodsTableFilter(tableBlock, trigger.dataset.goodsFilter || 'all');
    return;
  }

  const detailTrigger = event.target?.closest?.('[data-goods-detail-trigger]');
  if (!detailTrigger || !detailTrigger.closest('.goods-table-block')) return;
  event.preventDefault();
  toggleGoodsDetailRow(detailTrigger);
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const detailTrigger = event.target?.closest?.('[data-goods-detail-trigger]');
  if (!detailTrigger || !detailTrigger.closest('.goods-table-block')) return;
  event.preventDefault();
  toggleGoodsDetailRow(detailTrigger);
});

function buildGoodsInfoRows(goods) {
  const rows = Array.isArray(goods.infoRows) ? goods.infoRows : [];
  if (!rows.length) return '';
  return `<div class="goods-info-list">${rows.map(row => `
    <div class="goods-info-row">
      ${buildGoodsImage(row.icon, 'goods-info-icon', '*', row.label)}
      <div><strong>${escapeHtml(row.label || '')}</strong><span>${escapeHtml(row.value || '')}</span></div>
    </div>`).join('')}</div>`;
}

function buildGoodsOffers(goods) {
  const offers = Array.isArray(goods.offers) ? goods.offers : [];
  if (!offers.length) return '';
  const coin = goods.coinIcon
    ? `<img class="goods-price-coin" src="${sanitizeImageSrc(goods.coinIcon)}" alt="" loading="lazy" decoding="async">`
    : '';
  return `
    <section class="goods-side-box goods-offers-box">
      <div class="goods-side-box-head">
        <h3>${escapeHtml(goods.offerTitle || 'Angebote')}</h3>
        ${goods.offerMeta ? `<span>${escapeHtml(goods.offerMeta)}</span>` : ''}
      </div>
      <div class="goods-offer-list">
        ${offers.map((offer, index) => `
          <div class="goods-offer-row">
            ${buildGoodsImage(offer.image, 'goods-offer-image', getInitialChar(offer.name || index + 1), offer.name)}
            <strong>${escapeHtml(offer.name || 'Angebot')}</strong>
            <span>${escapeHtml(offer.price || '-')}${coin}</span>
          </div>`).join('')}
      </div>
    </section>`;
}

function buildGoodsTablePage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const inlineCommentThread = getInlineCommentThreadForPage(page, entry, pageIndex);
  const goods = sanitizeGoodsTableData(page.goodsTable || {});
  const scopeId = `goods-${slugify(entry?.id || entry?.title || 'waren', 'waren')}-${pageIndex}`;
  const sideImage = sanitizeImageSrc(goods.sideImage || page.image || '');
  const embeddedComments = inlineCommentThread ? buildOrganicCommentsContinuation(inlineCommentThread) : '';
  const sym = entry.symbol ? `<img class="modal-symbol" src="${sanitizeImageSrc(entry.symbol)}" alt="" loading="lazy" decoding="async">` : '';

  return `
    ${nav}
    <div class="goods-page">
      <article class="goods-sheet">
        <header class="goods-header">
          ${buildGoodsImage(goods.headerIcon || entry.icon, 'goods-header-icon', 'W', goods.title)}
          <div class="goods-header-title">
            <h2>${escapeHtml(goods.title || entry.title || 'Warenverzeichnis')}</h2>
            <p>${escapeHtml(goods.subtitle || entry.subtitle || '')}</p>
          </div>
          ${goods.location ? `<div class="goods-location">${escapeHtml(goods.location)}</div>` : ''}
        </header>

        <main class="goods-layout">
          <section class="goods-table-panel">
            ${goods.tables.map((table, index) => buildGoodsTableBlock(table, goods, `${scopeId}-${index}`)).join('')}
          </section>

          <aside class="goods-sidebar">
            <section class="goods-side-box">
              <h3>${escapeHtml(goods.sideTitle)}</h3>
              ${sideImage ? `<img class="goods-side-image" src="${sideImage}" alt="${escapeHtml(goods.sideName || goods.sideTitle)}" loading="lazy" decoding="async">` : ''}
              ${goods.sideName ? `<h4>${escapeHtml(goods.sideName)}</h4>` : ''}
              ${goods.sideText ? `<p>${escapeHtml(goods.sideText)}</p>` : ''}
              ${buildGoodsInfoRows(goods)}
            </section>
            ${buildGoodsOffers(goods)}
            ${(goods.noteTitle || goods.noteText) ? `
              <section class="goods-side-box goods-note-box">
                ${goods.noteTitle ? `<h3>${escapeHtml(goods.noteTitle)}</h3>` : ''}
                ${goods.noteText ? `<p>${escapeHtml(goods.noteText)}</p>` : ''}
              </section>` : ''}
          </aside>
        </main>

        ${goods.footer ? `<footer class="goods-footer">${escapeHtml(goods.footer)}</footer>` : ''}
      </article>
    </div>
    ${embeddedComments}
    ${sym}`;
}
