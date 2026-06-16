// Renders the dedicated hierarchy / organisation chart module template.

function buildHierarchyNodeCard(node) {
  const portrait = sanitizeImageSrc(node.portrait || '');
  return `
    <article class="hierarchy-node-card">
      <div class="hierarchy-node-portrait">
        ${portrait
          ? `<img src="${portrait}" alt="${escapeHtml(node.title)}" loading="lazy" decoding="async">`
          : '<div class="hierarchy-node-placeholder"></div>'}
      </div>
      <div class="hierarchy-node-copy">
        <h4>${escapeHtml(node.title || 'Unbenannter Rang')}</h4>
        ${node.subtitle ? `<div class="hierarchy-node-subtitle">${escapeHtml(node.subtitle)}</div>` : ''}
        ${node.text ? `<p>${sanitizeContentHtml(node.text)}</p>` : ''}
      </div>
    </article>`;
}

function buildHierarchyLevel(level, index) {
  const nodes = Array.isArray(level.nodes) ? level.nodes.slice(0, 4) : [];
  if (!nodes.length) return '';
  return `
    <section class="hierarchy-chart-level cols-${Math.max(1, Math.min(4, nodes.length))}" data-hierarchy-level="${index}">
      ${level.label ? `<div class="hierarchy-level-label">${escapeHtml(level.label)}</div>` : ''}
      <div class="hierarchy-level-nodes">
        ${nodes.map(buildHierarchyNodeCard).join('')}
      </div>
    </section>`;
}

function buildHierarchyDetailRow(row) {
  const icon = String(row.icon || '').trim();
  return `
    <div class="hierarchy-detail-row">
      <div class="hierarchy-detail-icon">${icon ? escapeHtml(icon) : '&bull;'}</div>
      <div>
        <span>${escapeHtml(row.label || 'Eintrag')}</span>
        <strong>${escapeHtml(row.value || '')}</strong>
      </div>
    </div>`;
}

function buildHierarchyPage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const data = sanitizeHierarchyData(page.hierarchy || {});
  const emblem = sanitizeImageSrc(data.emblem || entry.symbol || '');
  const sideImage = sanitizeImageSrc(data.sideImage || page.image || '');
  const levels = data.levels.length ? data.levels : sanitizeHierarchyData({}).levels;
  return `
    ${nav}
    <div class="hierarchy-page">
      <header class="hierarchy-topbar">
        <div class="hierarchy-titlemark">
          ${emblem ? `<img src="${emblem}" alt="" loading="lazy" decoding="async">` : '<div class="hierarchy-emblem-placeholder"></div>'}
          <div>
            <h2>${escapeHtml(data.eyebrow)}</h2>
            <p>${escapeHtml(data.subtitle)}</p>
          </div>
        </div>
        <div class="hierarchy-center-label"><span>${escapeHtml(data.centerLabel)}</span></div>
        <div class="hierarchy-actions" aria-hidden="true">
          <span>Export</span>
          <span>Bearbeiten</span>
          <span class="close-mark">X</span>
        </div>
      </header>

      <div class="hierarchy-document">
        <aside class="hierarchy-sidebar">
          <div class="hierarchy-side-head">
            <div class="hierarchy-side-image">
              ${sideImage ? `<img src="${sideImage}" alt="" loading="lazy" decoding="async">` : '<div class="hierarchy-watermark"></div>'}
            </div>
            <div class="hierarchy-side-copy">
              <h3>${escapeHtml(data.organizationTitle)}</h3>
              ${data.motto ? `<p class="hierarchy-motto">${escapeHtml(data.motto)}</p>` : ''}
              ${data.description ? `<div class="hierarchy-description">${sanitizeContentHtml(data.description)}</div>` : ''}
            </div>
          </div>

          <div class="hierarchy-sidebar-divider"></div>
          <section>
            <h4>${escapeHtml(data.detailsTitle)}</h4>
            <div class="hierarchy-details">${data.details.map(buildHierarchyDetailRow).join('')}</div>
          </section>
          ${data.quote ? `
            <blockquote class="hierarchy-quote">
              <span>${escapeHtml(data.quoteLabel)}</span>
              <p>${sanitizeContentHtml(data.quote)}</p>
            </blockquote>` : ''}
        </aside>

        <main class="hierarchy-main">
          <div class="hierarchy-section-head">
            <h3>${escapeHtml(data.chartTitle)}</h3>
            ${data.chartIntro ? `<p>${sanitizeContentHtml(data.chartIntro)}</p>` : ''}
          </div>
          <div class="hierarchy-ornament-line"></div>
          <div class="hierarchy-chart mode-${escapeHtml(data.layoutMode)}">
            ${levels.map(buildHierarchyLevel).join('')}
          </div>
        </main>
      </div>

      <footer class="hierarchy-footer">
        <button type="button" tabindex="-1">${escapeHtml(data.backLabel)}</button>
        ${data.footerNote ? `<div class="hierarchy-note">${sanitizeContentHtml(data.footerNote)}</div>` : '<div></div>'}
        <button type="button" tabindex="-1">${escapeHtml(data.printLabel)}</button>
      </footer>
    </div>`;
}
