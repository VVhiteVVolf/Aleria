// Rendering and normalization for one-page modules embedded in scene comments.
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
  if (!item || typeof item !== 'object') return null;
  const defaultSize = typeof MODULE_SIZE_DEFAULT === 'number' ? MODULE_SIZE_DEFAULT : 100;
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

function getCommentModuleInsertItem(comment) {
  return normalizeCommentModuleInsertItem(comment?.moduleInsert || comment?.insertedModule);
}

function buildCommentModuleEntry(item) {
  const normalized = normalizeCommentModuleInsertItem(item);
  if (!normalized) return null;
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

function renderCommentModuleThumbnail(item) {
  const image = sanitizeImageSrc(item.image || item.page?.image || '');
  if (image) {
    return `<img class="comment-showcase-img comment-module-insert-img" src="${image}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async">`;
  }
  return `<div class="comment-showcase-img comment-showcase-img-placeholder comment-module-insert-img">M</div>`;
}

function renderCommentModuleInsertCard(item, options = {}) {
  const template = getCommentModuleTemplate(item.templateId) || {};
  const tag = options.interactive === false ? 'div' : 'button';
  const attrs = options.interactive === false
    ? ''
    : ` type="button" data-action="open-comment-module-insert-profile" data-comment-id="${escapeHtml(options.commentId || '')}"`;
  return `
    <${tag} class="comment-showcase-card comment-module-insert-card"${attrs}>
      ${renderCommentModuleThumbnail(item)}
      <span class="comment-showcase-copy">
        <span class="comment-showcase-kicker">Modul · ${escapeHtml(template.label || item.type || 'Template')}</span>
        <span class="comment-showcase-title">${escapeHtml(item.title)}</span>
        ${item.subtitle ? `<span class="comment-showcase-subtitle">${escapeHtml(item.subtitle)}</span>` : ''}
        <span class="comment-showcase-teaser">${escapeHtml(item.teaser || item.pageTitle || 'Einseitiges Modul aus vorhandener Vorlage')}</span>
      </span>
    </${tag}>`;
}

function renderCommentModuleInsertProfileContent(item, options = {}) {
  const entry = buildCommentModuleEntry(item);
  if (!entry) return '<div class="comment-module-insert-empty">Modul konnte nicht geladen werden.</div>';
  const page = getPages(entry)[0];
  const preview = buildInlineModulePreview(page, entry, 0, 1);
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
        <div class="comment-module-preview-frame">${preview}</div>
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
        <button type="button" class="comment-narrator-del" data-action="open-delete-confirm" data-comment-id="${safeCommentId}" title="Loeschen">Loeschen</button>
      </div>`;
  return `
    ${divider}
    <div class="comment-narrator comment-module-insert-entry" data-comment-id="${safeCommentId}">
      <div class="comment-kind-badge">Erzaehler · Modul</div>
      ${comment.text ? `<div class="comment-attachment-narration">${parseCommentMarkup(comment.text)}</div>` : ''}
      ${renderCommentModuleInsertCard(item, { commentId: safeCommentId })}
      ${actions}
    </div>`;
}
