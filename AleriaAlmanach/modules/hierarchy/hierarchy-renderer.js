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
  const nodes = Array.isArray(level.nodes) ? level.nodes.slice(0, 6) : [];
  if (!nodes.length) return '';
  return `
    <section class="hierarchy-chart-level cols-${Math.max(1, Math.min(6, nodes.length))}" data-hierarchy-level="${index}">
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

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-hierarchy-sidebar-toggle]');
  if (!trigger) return;
  const page = trigger.closest('.hierarchy-page');
  if (!page) return;
  const collapsed = !page.classList.contains('sidebar-collapsed');
  page.classList.toggle('sidebar-collapsed', collapsed);
  trigger.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  trigger.textContent = collapsed ? 'Sidebar anzeigen' : 'Sidebar einklappen';
});

function setHierarchyRuntimeScale(page, value) {
  const number = Number(value);
  const scalePercent = Number.isFinite(number) ? Math.max(55, Math.min(170, Math.round(number))) : 100;
  const chartScale = scalePercent / 100;
  const cardScale = Number(page.dataset.hierarchyCardScale || 0.92);
  const portraitScale = Number(page.dataset.hierarchyPortraitScale || 1);
  page.style.setProperty('--hierarchy-chart-scale', chartScale);
  page.style.setProperty('--hierarchy-effective-card-font-scale', cardScale * chartScale);
  page.style.setProperty('--hierarchy-effective-portrait-scale', portraitScale * chartScale);
  page.querySelectorAll('[data-hierarchy-scale-value]').forEach(label => {
    label.textContent = `${scalePercent}%`;
  });
}

document.addEventListener('input', event => {
  const input = event.target?.closest?.('[data-hierarchy-scale-input]');
  if (!input) return;
  const page = input.closest('.hierarchy-page');
  if (!page) return;
  setHierarchyRuntimeScale(page, input.value);
});

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-hierarchy-fullscreen-toggle]');
  if (!trigger) return;
  const page = trigger.closest('.hierarchy-page');
  if (!page) return;
  const active = !page.classList.contains('fullscreen-active');
  if (active) {
    page.dataset.hierarchySidebarWasCollapsed = page.classList.contains('sidebar-collapsed') ? 'true' : 'false';
  }
  page.classList.toggle('fullscreen-active', active);
  if (active) {
    page.classList.add('sidebar-collapsed');
  } else if (page.dataset.hierarchySidebarWasCollapsed === 'true') {
    page.classList.add('sidebar-collapsed');
  } else {
    page.classList.remove('sidebar-collapsed');
  }
  trigger.setAttribute('aria-pressed', active ? 'true' : 'false');
  trigger.textContent = active ? 'Vollbild verlassen' : 'Aufbau Vollbild';
  const sidebarToggle = page.querySelector('[data-hierarchy-sidebar-toggle]');
  if (sidebarToggle) {
    const collapsed = page.classList.contains('sidebar-collapsed');
    sidebarToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    sidebarToggle.textContent = collapsed ? 'Sidebar anzeigen' : 'Sidebar einklappen';
  }
});

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-hierarchy-intro-toggle]');
  if (!trigger) return;
  const page = trigger.closest('.hierarchy-page');
  if (!page) return;
  const collapsed = !page.classList.contains('intro-collapsed');
  page.classList.toggle('intro-collapsed', collapsed);
  trigger.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  trigger.textContent = collapsed ? 'Aufbau-Text anzeigen' : 'Aufbau-Text einklappen';
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const page = document.querySelector('.hierarchy-page.fullscreen-active');
  if (!page) return;
  page.classList.remove('fullscreen-active');
  if (page.dataset.hierarchySidebarWasCollapsed === 'true') {
    page.classList.add('sidebar-collapsed');
  } else {
    page.classList.remove('sidebar-collapsed');
  }
  const fullscreenToggle = page.querySelector('[data-hierarchy-fullscreen-toggle]');
  if (fullscreenToggle) {
    fullscreenToggle.setAttribute('aria-pressed', 'false');
    fullscreenToggle.textContent = 'Aufbau Vollbild';
  }
  const sidebarToggle = page.querySelector('[data-hierarchy-sidebar-toggle]');
  if (sidebarToggle) {
    const collapsed = page.classList.contains('sidebar-collapsed');
    sidebarToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    sidebarToggle.textContent = collapsed ? 'Sidebar anzeigen' : 'Sidebar einklappen';
  }
});

function buildHierarchyPage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const data = sanitizeHierarchyData(page.hierarchy || {});
  const emblem = sanitizeImageSrc(data.emblem || entry.symbol || '');
  const sideImage = sanitizeImageSrc(data.sideImage || page.image || '');
  const levels = data.levels.length ? data.levels : sanitizeHierarchyData({}).levels;
  const chartScale = data.chartScale / 100;
  const style = [
    `--hierarchy-card-font-scale:${data.cardFontScale / 100}`,
    `--hierarchy-portrait-scale:${data.portraitScale / 100}`,
    `--hierarchy-chart-scale:${chartScale}`,
    `--hierarchy-effective-card-font-scale:${(data.cardFontScale / 100) * chartScale}`,
    `--hierarchy-effective-portrait-scale:${(data.portraitScale / 100) * chartScale}`
  ].join(';');
  return `
    ${nav}
    <div class="hierarchy-page" style="${style}" data-hierarchy-card-scale="${data.cardFontScale / 100}" data-hierarchy-portrait-scale="${data.portraitScale / 100}">
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
          <button class="hierarchy-view-button" type="button" data-hierarchy-fullscreen-toggle aria-pressed="false">Aufbau Vollbild</button>
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
          <div class="hierarchy-view-controls">
            <button class="hierarchy-view-button" type="button" data-hierarchy-intro-toggle aria-expanded="true">Aufbau-Text einklappen</button>
            <label>
              <span>Ansicht</span>
              <input type="range" min="55" max="170" step="1" value="${escapeHtml(data.chartScale)}" data-hierarchy-scale-input>
              <strong data-hierarchy-scale-value>${escapeHtml(data.chartScale)}%</strong>
            </label>
          </div>
          <div class="hierarchy-ornament-line"></div>
          <div class="hierarchy-chart-viewport">
            <div class="hierarchy-chart mode-${escapeHtml(data.layoutMode)}">
              ${levels.map(buildHierarchyLevel).join('')}
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
