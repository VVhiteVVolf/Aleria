// Rendering and normalization for modules embedded in scene comments.
function getCommentModuleTemplate(templateId = 'story') {
  if (typeof getModuleTemplateDefinition !== 'function') return null;
  return getModuleTemplateDefinition(templateId || 'story');
}

function createCommentModuleDefaultPage(templateId = 'story', pageTitle = '') {
  const template = getCommentModuleTemplate(templateId);
  const page = typeof template?.createPage === 'function'
    ? template.createPage(0)
    : (typeof template?.createPages === 'function' ? deepClone(template.createPages()[0] || {}) : createDefaultModulePage(0));
  if (pageTitle) page.pageTitle = pageTitle;
  return page;
}

function normalizeCommentModuleInsertItem(item) {
  if (typeof item === 'string') {
    try {
      return normalizeCommentModuleInsertItem(JSON.parse(item));
    } catch {
      return null;
    }
  }
  if (!item || typeof item !== 'object') return null;
  const defaultSize = typeof MODULE_SIZE_DEFAULT === 'number' ? MODULE_SIZE_DEFAULT : 100;
  if (item.entry && typeof item.entry === 'object') {
    const entry = sanitizeModuleEntry(item.entry);
    const pages = getPages(entry);
    if (!entry.title || !pages.length) return null;
    const firstPage = pages[0] || {};
    const templateId = String(item.templateId || inferModuleTemplateType(entry) || 'story').trim();
    return {
      templateId,
      title: String(entry.title || 'Neues Modul').trim(),
      subtitle: String(entry.subtitle || '').trim(),
      type: String(entry.type || 'Modul').trim(),
      category: String(entry.category || 'Interaktive Szene').trim(),
      stamp: String(entry.stamp || '').trim(),
      image: String(entry.image || firstPage.image || '').trim(),
      symbol: String(entry.symbol || '').trim(),
      icon: String(entry.icon || '').trim(),
      pageTitle: String(item.pageTitle || firstPage.pageTitle || '').trim(),
      teaser: String(item.teaser || firstPage.pageTitle || entry.subtitle || '').trim(),
      moduleWidth: Math.max(60, Math.min(100, Number(entry.moduleWidth) || defaultSize)),
      moduleHeight: Math.max(60, Math.min(100, Number(entry.moduleHeight) || defaultSize)),
      page: deepClone(firstPage),
      entry: sanitizeModuleEntry({
        ...entry,
        locked: false,
        appendCommentsPage: false,
        enablePageComments: false,
        sessionCast: [],
        sessionCastDetails: []
      })
    };
  }
  const template = getCommentModuleTemplate(item.templateId || item.template || 'story') || {};
  const templateId = template.id || 'story';
  const title = String(item.title || template.defaultTitle || 'Neues Modul').trim();
  if (!title) return null;
  const image = String(item.image || '').trim();
  const pageTitle = String(item.pageTitle || item.page?.pageTitle || template.pageLabel || 'I. - Modul').trim();
  const page = item.page && typeof item.page === 'object'
    ? deepClone(item.page)
    : createCommentModuleDefaultPage(templateId, pageTitle);
  page.pageTitle = pageTitle;
  if (image && !page.image) page.image = image;

  return {
    templateId,
    title,
    subtitle: String(item.subtitle || template.defaultSubtitle || '').trim(),
    type: String(item.type || template.entryType || 'Modul').trim(),
    category: String(item.category || 'Interaktive Szene').trim(),
    stamp: String(item.stamp || '').trim(),
    image,
    symbol: String(item.symbol || '').trim(),
    icon: String(item.icon || '').trim(),
    pageTitle,
    teaser: String(item.teaser || '').trim(),
    moduleWidth: Math.max(60, Math.min(100, Number(item.moduleWidth) || defaultSize)),
    moduleHeight: Math.max(60, Math.min(100, Number(item.moduleHeight) || defaultSize)),
    page
  };
}

function getCommentModuleInsertDisplaySize(item) {
  const normalized = normalizeCommentModuleInsertItem(item);
  if (!normalized) {
    return typeof getModuleDisplaySize === 'function'
      ? getModuleDisplaySize({})
      : { width: 100, height: 100 };
  }
  if (typeof getModuleDisplaySize === 'function') {
    return getModuleDisplaySize(normalized.entry || normalized);
  }
  const defaultSize = typeof MODULE_SIZE_DEFAULT === 'number' ? MODULE_SIZE_DEFAULT : 100;
  const clamp = value => Math.max(60, Math.min(100, Math.round(Number(value) || defaultSize)));
  return {
    width: clamp(normalized.entry?.moduleWidth || normalized.moduleWidth),
    height: clamp(normalized.entry?.moduleHeight || normalized.moduleHeight)
  };
}

function applyCommentModuleInsertProfileSize(card, item) {
  if (!card) return;
  const size = getCommentModuleInsertDisplaySize(item);
  card.style.setProperty('--comment-module-profile-width', `${size.width}vw`);
  card.style.setProperty('--comment-module-profile-height', `${size.height}vh`);
}

function getCommentModuleInsertItem(comment) {
  return normalizeCommentModuleInsertItem(comment?.moduleInsert)
    || normalizeCommentModuleInsertItem(comment?.insertedModule)
    || normalizeCommentModuleInsertItem(comment?.moduleInsertJson);
}

function buildCommentModuleEntry(item) {
  const normalized = normalizeCommentModuleInsertItem(item);
  if (!normalized) return null;
  if (normalized.entry) {
    return sanitizeModuleEntry({
      ...deepClone(normalized.entry),
      locked: false,
      appendCommentsPage: false,
      enablePageComments: false,
      sessionCast: [],
      sessionCastDetails: []
    });
  }
  return sanitizeModuleEntry({
    id: `scene-module-${Date.now()}`,
    title: normalized.title,
    subtitle: normalized.subtitle,
    type: normalized.type,
    category: normalized.category,
    stamp: normalized.stamp || normalized.category,
    image: normalized.image,
    symbol: normalized.symbol,
    icon: normalized.icon,
    moduleWidth: normalized.moduleWidth,
    moduleHeight: normalized.moduleHeight,
    multipage: true,
    appendCommentsPage: false,
    enablePageComments: false,
    pages: [normalized.page]
  });
}

const COMMENT_MODULE_REVEAL_VARIANTS = {
  character: { className: 'dossier', action: 'Akte öffnen' },
  biography: { className: 'dossier', action: 'Akte öffnen' },
  profile: { className: 'dossier', action: 'Akte öffnen' },
  map: { className: 'map', action: 'Karte entfalten' },
  quest: { className: 'notice', action: 'Auftrag prüfen' },
  bounty: { className: 'notice', action: 'Aushang prüfen' },
  artifact: { className: 'relic', action: 'Fundstück betrachten' },
  recipe: { className: 'relic', action: 'Rezept studieren' },
  bestiary: { className: 'bestiary', action: 'Kreatur studieren' },
  guild: { className: 'house', action: 'Gildenbuch öffnen' },
  house: { className: 'house', action: 'Siegelbuch öffnen' },
  session: { className: 'scene', action: 'Szene betreten' },
  story: { className: 'chronicle', action: 'Kapitel aufschlagen' }
};

function getCommentModuleRevealVariant(item = {}) {
  const source = [item.templateId, item.type, item.category].map(value => String(value || '').toLowerCase()).join(' ');
  const key = Object.keys(COMMENT_MODULE_REVEAL_VARIANTS).find(candidate => source.includes(candidate));
  return COMMENT_MODULE_REVEAL_VARIANTS[key] || COMMENT_MODULE_REVEAL_VARIANTS.story;
}

function getCommentModuleRevealText(value = '') {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\|\|(.*?)\|\|/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function getCommentModuleRevealTeaser(item = {}) {
  const page = item.page || item.entry?.pages?.[0] || {};
  const sceneText = Array.isArray(page.sceneBlocks) ? page.sceneBlocks.map(block => block?.text || '').find(Boolean) : '';
  const source = [item.teaser, page.description, page.sessionIntro, page.quote, page.commentText, sceneText, item.subtitle]
    .map(getCommentModuleRevealText)
    .find(text => text.length >= 24) || '';
  return source.length > 210 ? `${source.slice(0, 207).trim()}…` : source;
}

function getCommentModuleRevealPageCount(item = {}) {
  const entryPages = item.entry ? getPages(item.entry) : [];
  return Math.max(1, entryPages.length || (item.page ? 1 : 0));
}

function renderCommentModuleRevealMedia(item = {}) {
  const hero = sanitizeImageSrc(item.image || item.page?.image || item.entry?.image || '');
  const emblem = sanitizeImageSrc(item.symbol || item.icon || '');
  return `
    <span class="comment-module-reveal-media${hero ? ' has-image' : ''}">
      ${hero ? `<img class="comment-module-reveal-hero" src="${hero}" alt="" loading="lazy" decoding="async">` : ''}
      <span class="comment-module-reveal-wash" aria-hidden="true"></span>
      ${item.stamp ? `<span class="comment-module-reveal-stamp">${escapeHtml(item.stamp)}</span>` : ''}
      <span class="comment-module-reveal-emblem${emblem ? ' has-image' : ''}">
        ${emblem ? `<img src="${emblem}" alt="" loading="lazy" decoding="async">` : escapeHtml(getInitialChar(item.title || 'Modul'))}
      </span>
    </span>`;
}

function renderCommentModuleInsertCard(item, options = {}) {
  const variant = getCommentModuleRevealVariant(item);
  const teaser = getCommentModuleRevealTeaser(item);
  const pageCount = getCommentModuleRevealPageCount(item);
  const tag = options.interactive === false ? 'div' : 'button';
  const attrs = options.interactive === false
    ? ''
    : ` type="button" data-action="open-comment-module-insert-profile" data-comment-id="${escapeHtml(options.commentId || '')}"`;
  return `
    <${tag} class="comment-module-reveal-card comment-module-reveal-${variant.className}${options.interactive === false ? ' is-preview' : ''}"${attrs}>
      ${renderCommentModuleRevealMedia(item)}
      <span class="comment-module-reveal-content">
        <span class="comment-module-reveal-meta">${escapeHtml(item.type || 'Almanach-Eintrag')}${item.category ? ` · ${escapeHtml(item.category)}` : ''}</span>
        <span class="comment-module-reveal-title">${escapeHtml(item.title)}</span>
        ${item.subtitle ? `<span class="comment-module-reveal-subtitle">${escapeHtml(item.subtitle)}</span>` : ''}
        ${teaser ? `<span class="comment-module-reveal-teaser">${escapeHtml(teaser)}</span>` : ''}
        <span class="comment-module-reveal-foot">
          <span>${pageCount} ${pageCount === 1 ? 'Seite' : 'Seiten'}</span>
          <strong>${escapeHtml(variant.action)} <span aria-hidden="true">→</span></strong>
        </span>
      </span>
    </${tag}>`;
}

function clampCommentModulePreviewPageIndex(pages, pageIndex = 0) {
  if (!Array.isArray(pages) || !pages.length) return 0;
  const index = Number(pageIndex);
  return Math.max(0, Math.min(pages.length - 1, Number.isFinite(index) ? index : 0));
}

function renderCommentModulePreviewPage(entry, pageIndex = 0) {
  const pages = getPages(entry);
  if (!pages.length) return '';
  const index = clampCommentModulePreviewPageIndex(pages, pageIndex);
  const page = pages[index];
  return `
    <div class="comment-module-preview-page">
      ${pages.length > 1 ? `<div class="comment-module-preview-page-label">Seite ${index + 1} von ${pages.length}</div>` : ''}
      <div class="comment-module-preview-frame">${buildInlineModulePreview(page, entry, index, pages.length)}</div>
    </div>`;
}

function renderCommentModulePreviewPages(entry, options = {}) {
  const pages = getPages(entry);
  if (options.stacked) {
    return pages.map((page, index) => `
      <div class="comment-module-preview-page">
        ${pages.length > 1 ? `<div class="comment-module-preview-page-label">Seite ${index + 1} von ${pages.length}</div>` : ''}
        <div class="comment-module-preview-frame">${buildInlineModulePreview(page, entry, index, pages.length)}</div>
      </div>`).join('');
  }
  return renderCommentModulePreviewPage(entry, options.pageIndex);
}

function renderCommentModuleInsertProfileContent(item, options = {}) {
  const entry = buildCommentModuleEntry(item);
  if (!entry) return '<div class="comment-module-insert-empty">Modul konnte nicht geladen werden.</div>';
  return `
    <div class="comment-module-profile-card${options.preview ? ' comment-module-profile-preview' : ''}">
      <div class="comment-module-profile-head">
        <div>
          <div class="showcase-profile-kind">Modulvorschau</div>
          <h2>${escapeHtml(entry.title)}</h2>
          ${entry.subtitle ? `<div class="showcase-profile-subtitle">${escapeHtml(entry.subtitle)}</div>` : ''}
        </div>
        ${entry.stamp ? `<div class="showcase-profile-stamp">${escapeHtml(entry.stamp)}</div>` : ''}
      </div>
      <div class="comment-module-preview-stage">
        ${renderCommentModulePreviewPages(entry, {
          pageIndex: options.pageIndex,
          stacked: !!options.preview
        })}
      </div>
    </div>`;
}

function renderCommentModuleInsert(comment, idx, item) {
  const commentId = String(comment?.id || '');
  const safeCommentId = escapeHtml(commentId).replace(/'/g, '&#39;');
  const divider = idx > 0
    ? `<div class="comment-divider"><span class="comment-divider-icon">*</span></div>`
    : '';
  const actions = comment?._hideActions ? '' : `
      <div class="comment-narrator-actions">
        <button type="button" class="comment-narrator-edit" data-action="open-edit-module-insert-form" data-comment-id="${safeCommentId}" title="Bearbeiten">Bearbeiten</button>
        <button type="button" class="comment-narrator-edit" data-action="export-module-insert" data-comment-id="${safeCommentId}" title="Als Datei exportieren">Exportieren</button>
        <button type="button" class="comment-narrator-del" data-action="open-delete-confirm" data-comment-id="${safeCommentId}" title="Loeschen">Loeschen</button>
      </div>`;
  return `
    ${divider}
    <div class="comment-narrator comment-module-insert-entry" data-comment-id="${safeCommentId}">
      <div class="comment-module-reveal-divider"><span>Ein neuer Eintrag wird enthüllt</span></div>
      ${comment.text ? `<div class="comment-attachment-narration comment-module-reveal-narration">${parseCommentMarkup(comment.text)}</div>` : ''}
      ${renderCommentModuleInsertCard(item, { commentId: safeCommentId })}
      ${actions}
    </div>`;
}
