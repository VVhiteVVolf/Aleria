// Renders the Aleria family dossier shell. Family Chart owns the mounted graph.

function buildFamilyLegend() {
  const items = [
    ['descent', 'Abstammung'],
    ['partnership', 'Ehe & Verbindung'],
    ['affair', 'Affäre'],
    ['social', 'Adoption & Pflege'],
    ['disputed', 'Ungeklärt']
  ];
  return `
    <div class="family-legend">
      ${items.map(([type, label]) => `
        <span class="family-legend-item family-relation-${escapeHtml(type)}">${escapeHtml(label)}</span>`).join('')}
    </div>`;
}

function buildFamilyPage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const data = sanitizeFamilyData(page.family || {});
  const emblem = sanitizeImageSrc(data.emblem || entry.symbol || '');
  const sideImage = sanitizeImageSrc(data.sideImage || page.image || '');
  const orientation = data.layoutMode === 'depth' ? 'horizontal' : 'vertical';
  const style = [
    `--hierarchy-card-font-scale:${data.cardFontScale / 100}`,
    `--hierarchy-portrait-scale:${data.portraitScale / 100}`,
    `--hierarchy-effective-card-font-scale:${data.cardFontScale / 100}`,
    `--hierarchy-effective-portrait-scale:${data.portraitScale / 100}`
  ].join(';');

  return `
    ${nav}
    <div class="hierarchy-page family-page" style="${style}" data-family-orientation="${escapeHtml(orientation)}">
      <header class="hierarchy-topbar">
        <div class="hierarchy-titlemark">
          ${emblem ? `<img src="${emblem}" alt="" loading="lazy" decoding="async">` : '<div class="hierarchy-emblem-placeholder"></div>'}
          <div>
            <h2>${escapeHtml(data.eyebrow)}</h2>
            <p>${escapeHtml(data.subtitle)}</p>
          </div>
        </div>
        <div class="hierarchy-center-label"><span>${escapeHtml(data.centerLabel)}</span></div>
        <div class="hierarchy-top-actions">
          <button class="hierarchy-view-button" type="button" data-hierarchy-fullscreen-toggle aria-pressed="false">Stammbaum Vollbild</button>
          <button class="hierarchy-view-button hierarchy-sidebar-toggle" type="button" data-hierarchy-sidebar-toggle aria-expanded="true">Sidebar einklappen</button>
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
            </div>
            ${data.description ? `<div class="hierarchy-description">${sanitizeContentHtml(data.description)}</div>` : ''}
          </div>

          <div class="hierarchy-sidebar-divider"></div>
          <section>
            <h4>${escapeHtml(data.detailsTitle)}</h4>
            <div class="hierarchy-details">${data.details.map(buildHierarchyDetailRow).join('')}</div>
          </section>
          <section>
            <h4>Beziehungen</h4>
            ${buildFamilyLegend()}
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
          <div class="hierarchy-view-controls family-chart-controls">
            <button class="hierarchy-view-button" type="button" data-hierarchy-intro-toggle aria-expanded="true">Aufbau-Text einklappen</button>
            <div class="family-chart-control family-chart-search-control">
              <span>Person</span>
              <div class="family-chart-search" data-family-search-host role="search" aria-label="Person im Stammbaum suchen"></div>
            </div>
            <label class="family-chart-control">
              <span>Ausrichtung</span>
              <select data-family-orientation-select aria-label="Ausrichtung des Stammbaums">
                <option value="vertical"${orientation === 'vertical' ? ' selected' : ''}>Vertikal</option>
                <option value="horizontal"${orientation === 'horizontal' ? ' selected' : ''}>Horizontal</option>
              </select>
            </label>
            <button class="hierarchy-view-button" type="button" data-family-action="fit-chart">Baum einpassen</button>
            <output class="family-chart-status" data-family-chart-status data-state="loading" aria-live="polite">Stammbaum wird geladen …</output>
          </div>
          <div class="hierarchy-ornament-line"></div>
          <div class="hierarchy-chart-viewport family-chart-viewport">
            <div class="family-chart-stage">
              <div class="family-chart-host" data-family-chart-host aria-label="Interaktiver Stammbaum"></div>
            </div>
          </div>
        </main>
      </div>

      ${data.footerNote ? `
        <footer class="hierarchy-footer">
          <div class="hierarchy-note">${sanitizeContentHtml(data.footerNote)}</div>
        </footer>` : ''}
    </div>`;
}
