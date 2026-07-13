function getVisibleLanguageAlphabetLayers(data) {
  const layers = sanitizeLanguageData(data).alphabetLayers;
  const visible = layers.filter(layer => layer.image);
  return visible.length ? visible : layers.slice(0, 1);
}

function setLanguageActiveLayer(page, index) {
  if (!page) return;
  const tabs = Array.from(page.querySelectorAll('[data-language-layer-tab]'));
  const safeIndex = Math.max(0, Math.min(tabs.length - 1, Number(index) || 0));
  tabs.forEach((button, buttonIndex) => {
    const active = buttonIndex === safeIndex;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', active ? 'true' : 'false');
    button.tabIndex = active ? 0 : -1;
  });
  page.querySelectorAll('[data-language-layer-panel]').forEach((panel, panelIndex) => {
    panel.hidden = panelIndex !== safeIndex;
  });
}

function buildLanguageLayerTabs(layers, scopeId) {
  if (layers.length < 2) return '';
  return `
    <div class="language-layer-tabs" role="tablist" aria-label="Alphabet-Ebenen">
      ${layers.map((layer, index) => `
        <button class="language-layer-tab${index === 0 ? ' active' : ''}" id="${escapeHtml(scopeId)}-tab-${index}" type="button" role="tab" aria-selected="${index === 0 ? 'true' : 'false'}" aria-controls="${escapeHtml(scopeId)}-panel-${index}" tabindex="${index === 0 ? '0' : '-1'}" data-language-layer-tab="${index}">
          ${escapeHtml(layer.label || `Ebene ${index + 1}`)}
        </button>`).join('')}
    </div>`;
}

function buildLanguageLayerPanels(layers, scopeId) {
  return layers.map((layer, index) => {
    const image = sanitizeImageSrc(layer.image || '');
    const body = image
      ? `<img src="${image}" alt="${escapeHtml(layer.alt || `${layer.label || `Ebene ${index + 1}`} des Alphabets`)}" loading="lazy" decoding="async">`
      : `<div class="language-alphabet-placeholder"><strong>${escapeHtml(layer.label || 'Ebene 1')}</strong><span>Alphabetbild im Bearbeitungsmodus hinterlegen.</span></div>`;
    return `
      <figure class="language-layer-panel" id="${escapeHtml(scopeId)}-panel-${index}" role="tabpanel" aria-labelledby="${escapeHtml(scopeId)}-tab-${index}" data-language-layer-panel="${index}"${index === 0 ? '' : ' hidden'}>
        <div class="language-alphabet-image-stage">${body}</div>
        ${layer.caption ? `<figcaption>${sanitizeContentHtml(layer.caption)}</figcaption>` : ''}
      </figure>`;
  }).join('');
}

function buildLanguageMeta(data) {
  const rows = [
    ['Sprachfamilie', data.family],
    ['Sprecher', data.speakers],
    ['Verbreitung', data.regions],
    ['Schrifttyp', data.scriptType],
    ['Schreibrichtung', data.writingDirection]
  ].filter(([, value]) => value);
  if (!rows.length) return '';
  return `<dl class="language-meta">${rows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>`;
}

function buildLanguageDescriptionSections(sections) {
  if (!sections.length) return '';
  return `
    <div class="language-description-sections">
      ${sections.map((section, index) => `
        <section class="language-description-section">
          <span class="language-section-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
          ${section.title ? `<h3>${escapeHtml(section.title)}</h3>` : ''}
          ${section.text ? `<div class="language-section-copy">${sanitizeContentHtml(section.text)}</div>` : ''}
        </section>`).join('')}
    </div>`;
}

function buildLanguagePage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const data = sanitizeLanguageData(page.language || {});
  const layers = getVisibleLanguageAlphabetLayers(data);
  const scopeId = `language-${slugify(entry?.id || entry?.title || 'sprache', 'sprache')}-${pageIndex}`;
  const inlineCommentThread = getInlineCommentThreadForPage(page, entry, pageIndex);
  const embeddedComments = inlineCommentThread ? buildOrganicCommentsContinuation(inlineCommentThread) : '';
  const sym = entry.symbol ? `<img class="modal-symbol" src="${sanitizeImageSrc(entry.symbol)}" alt="" loading="lazy" decoding="async">` : '';

  return `
    ${nav}
    <article class="language-page" data-language-page="${escapeHtml(scopeId)}">
      <header class="language-header">
        <div class="language-archive-label">${escapeHtml(data.archiveLabel)}</div>
        <p class="language-entry-category">${escapeHtml(entry.category || 'Sprache')}</p>
        <h2>${escapeHtml(entry.title)}</h2>
        ${data.nativeName ? `<p class="language-native-name">${escapeHtml(data.nativeName)}</p>` : ''}
        ${entry.subtitle ? `<p class="language-subtitle">${escapeHtml(entry.subtitle)}</p>` : ''}
        ${page.quote ? `<blockquote><p>${sanitizeContentHtml(page.quote)}</p>${page.quoteBy ? `<cite>${escapeHtml(page.quoteBy)}</cite>` : ''}</blockquote>` : ''}
      </header>

      <section class="language-alphabet" aria-labelledby="${escapeHtml(scopeId)}-alphabet-title">
        <div class="language-section-heading">
          <span>Schriftarchiv</span>
          <h3 id="${escapeHtml(scopeId)}-alphabet-title">${escapeHtml(data.alphabetTitle)}</h3>
        </div>
        ${buildLanguageLayerTabs(layers, scopeId)}
        ${buildLanguageLayerPanels(layers, scopeId)}
      </section>

      <div class="language-details">
        ${data.introduction ? `<section class="language-introduction"><h3>Überblick</h3><div>${sanitizeContentHtml(data.introduction)}</div></section>` : ''}
        ${buildLanguageMeta(data)}
        ${buildLanguageDescriptionSections(data.sections)}
      </div>
      ${data.footer ? `<footer class="language-footer">${escapeHtml(data.footer)}</footer>` : ''}
    </article>
    ${embeddedComments}
    ${sym}`;
}

document.addEventListener('click', event => {
  const tab = event.target?.closest?.('[data-language-layer-tab]');
  if (!tab) return;
  const page = tab.closest('.language-page');
  if (!page) return;
  event.preventDefault();
  setLanguageActiveLayer(page, Number(tab.dataset.languageLayerTab || 0));
});

document.addEventListener('keydown', event => {
  const tab = event.target?.closest?.('[data-language-layer-tab]');
  if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  const page = tab.closest('.language-page');
  const tabs = Array.from(page?.querySelectorAll('[data-language-layer-tab]') || []);
  if (!tabs.length) return;
  const current = tabs.indexOf(tab);
  let next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1);
  next = (next + tabs.length) % tabs.length;
  event.preventDefault();
  setLanguageActiveLayer(page, next);
  tabs[next].focus();
});
