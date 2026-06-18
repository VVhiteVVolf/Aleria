function getMapTemplateActiveTabs(data) {
  const tabs = sanitizeMapTemplateData(data).tabs;
  const visible = tabs.filter(tab => tab.label || tab.image || tab.imageLink);
  return visible.length ? visible : tabs.slice(0, 1);
}

function getMapTemplateImageClasses(tab) {
  return [
    'map-template-image',
    `format-${tab.imageFormat || 'free'}`,
    tab.imageFit === 'cover' ? 'fit-cover' : 'fit-contain',
    `position-${tab.imagePosition || 'center'}`
  ].join(' ');
}

function getMapTemplateImageStyle(tab) {
  const scale = clampMapTemplateNumber(tab.imageScale, 100, 35, 240);
  return `--map-image-scale:${scale / 100};`;
}

function getMapTemplateInternalTarget(value) {
  const target = String(value || '').trim();
  if (!target || /^(?:https?:)?\/\//i.test(target) || /^(?:\.{0,2}\/|\/)/.test(target)) return '';
  return target.replace(/^#/, '');
}

function buildMapTemplateImageBody(tab, index) {
  const image = sanitizeImageSrc(tab.image || '');
  if (!image) {
    return `
      <div class="map-template-placeholder">
        <strong>${escapeHtml(tab.label || `Karte ${index + 1}`)}</strong>
        <span>Bild-URL im Bearbeitungsmodus hinterlegen.</span>
      </div>`;
  }
  return `<img class="${escapeHtml(getMapTemplateImageClasses(tab))}" src="${image}" alt="${escapeHtml(tab.label || `Karte ${index + 1}`)}" loading="lazy" decoding="async">`;
}

function buildMapTemplateImageLink(tab, index) {
  const body = buildMapTemplateImageBody(tab, index);
  const rawLink = String(tab.imageLink || '').trim();
  const internalTarget = getMapTemplateInternalTarget(rawLink);
  const style = getMapTemplateImageStyle(tab);

  if (internalTarget) {
    return `
      <button class="map-template-image-link" type="button" style="${escapeHtml(style)}" data-archive-action="open-entry" data-entry-id="${escapeHtml(internalTarget)}">
        ${body}
      </button>`;
  }

  const href = sanitizeHref(rawLink);
  if (href) {
    const externalAttrs = /^https?:\/\//i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a class="map-template-image-link" href="${href}"${externalAttrs} style="${escapeHtml(style)}">${body}</a>`;
  }

  return `<div class="map-template-image-link" style="${escapeHtml(style)}">${body}</div>`;
}

function buildMapTemplateTabs(tabs, scopeId) {
  return `
    <div class="map-template-tabs" role="tablist" aria-label="Kartenreiter">
      ${tabs.map((tab, index) => `
        <button class="map-template-tab${index === 0 ? ' active' : ''}" type="button" role="tab" aria-selected="${index === 0 ? 'true' : 'false'}" data-map-template-tab="${index}" data-map-template-scope="${escapeHtml(scopeId)}">
          ${escapeHtml(tab.label || `Karte ${index + 1}`)}
        </button>`).join('')}
    </div>`;
}

function buildMapTemplatePanels(tabs, scopeId) {
  return tabs.map((tab, index) => `
    <section class="map-template-panel" role="tabpanel" data-map-template-panel="${index}" data-map-template-scope="${escapeHtml(scopeId)}"${index === 0 ? '' : ' hidden'}>
      ${buildMapTemplateImageLink(tab, index)}
    </section>`).join('');
}

function buildMapTemplateSidebar(sections) {
  return `
    <aside class="map-template-sidebar">
      ${sections.map(section => `
        <section class="map-template-info">
          <h3>${escapeHtml(section.title || '')}</h3>
          <p>${escapeHtml(section.text || '')}</p>
        </section>`).join('')}
    </aside>`;
}

function toggleMapTemplateSidebar(page) {
  if (!page) return;
  const collapsed = page.classList.toggle('sidebar-collapsed');
  const button = page.querySelector('[data-map-template-sidebar-toggle]');
  if (button) {
    button.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    button.textContent = collapsed ? 'Info anzeigen' : 'Info einklappen';
  }
}

function setMapTemplateActiveTab(page, index) {
  if (!page) return;
  page.querySelectorAll('[data-map-template-tab]').forEach(button => {
    const active = Number(button.dataset.mapTemplateTab || -1) === index;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  page.querySelectorAll('[data-map-template-panel]').forEach(panel => {
    panel.hidden = Number(panel.dataset.mapTemplatePanel || -1) !== index;
  });
}

document.addEventListener('click', event => {
  const sidebarToggle = event.target?.closest?.('[data-map-template-sidebar-toggle]');
  if (sidebarToggle) {
    const page = sidebarToggle.closest('.map-template-page');
    event.preventDefault();
    toggleMapTemplateSidebar(page);
    return;
  }

  const tab = event.target?.closest?.('[data-map-template-tab]');
  if (!tab) return;
  const page = tab.closest('.map-template-page');
  if (!page) return;
  event.preventDefault();
  setMapTemplateActiveTab(page, Number(tab.dataset.mapTemplateTab || 0));
});

function buildMapTemplatePage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const inlineCommentThread = getInlineCommentThreadForPage(page, entry, pageIndex);
  const data = sanitizeMapTemplateData(page.mapTemplate || {});
  const tabs = getMapTemplateActiveTabs(data);
  const scopeId = `map-template-${slugify(entry?.id || entry?.title || 'karte', 'karte')}-${pageIndex}`;
  const embeddedComments = inlineCommentThread ? buildOrganicCommentsContinuation(inlineCommentThread) : '';
  const collapsedClass = data.sidebarDefaultCollapsed ? ' sidebar-collapsed' : '';
  const sym = entry.symbol ? `<img class="modal-symbol" src="${sanitizeImageSrc(entry.symbol)}" alt="" loading="lazy" decoding="async">` : '';

  return `
    ${nav}
    <div class="map-template-page${collapsedClass}" data-map-template-page="${escapeHtml(scopeId)}">
      <div class="map-template-toolbar">
        ${buildMapTemplateTabs(tabs, scopeId)}
        <button class="map-template-sidebar-toggle" type="button" data-map-template-sidebar-toggle aria-expanded="${data.sidebarDefaultCollapsed ? 'false' : 'true'}">
          ${data.sidebarDefaultCollapsed ? 'Info anzeigen' : 'Info einklappen'}
        </button>
      </div>
      <div class="map-template-layout">
        <main class="map-template-stage">
          ${buildMapTemplatePanels(tabs, scopeId)}
        </main>
        ${buildMapTemplateSidebar(data.sections)}
      </div>
    </div>
    ${embeddedComments}
    ${sym}`;
}
