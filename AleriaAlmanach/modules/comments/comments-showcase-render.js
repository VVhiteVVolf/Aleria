// Rendering and normalization for comment showcase cards.
const SHOWCASE_KIND_LABELS = {
  item: 'Item',
  place: 'Ort',
  map: 'Karte',
  person: 'Person',
  castle: 'Burg',
  lore: 'Eintrag',
  context: 'Kontext'
};

function normalizeShowcaseKind(kind) {
  const value = String(kind || 'item').toLowerCase();
  return SHOWCASE_KIND_LABELS[value] ? value : 'item';
}

function getShowcaseKindLabel(kind) {
  return SHOWCASE_KIND_LABELS[normalizeShowcaseKind(kind)] || SHOWCASE_KIND_LABELS.item;
}

function normalizeShowcaseInfoRows(value) {
  const rows = Array.isArray(value)
    ? value
    : String(value || '').split(/\r?\n/).map(line => {
        const raw = String(line || '').trim();
        if (!raw) return null;
        const match = raw.match(/^([^:=|]+)\s*[:=|]\s*(.+)$/);
        return match
          ? { label: match[1].trim(), value: match[2].trim() }
          : { label: 'Info', value: raw };
      });
  return rows
    .map(row => ({
      label: String(row?.label || '').trim(),
      value: String(row?.value || '').trim()
    }))
    .filter(row => row.label || row.value)
    .slice(0, 16);
}

function serializeShowcaseInfoRows(rows) {
  return normalizeShowcaseInfoRows(rows)
    .map(row => `${row.label || 'Info'}: ${row.value}`)
    .join('\n');
}

function normalizeCommentShowcaseItem(item) {
  if (!item || typeof item !== 'object') return null;
  const title = String(item.title || '').trim();
  if (!title) return null;
  const imageSize = Math.max(18, Math.min(52, Number(item.imageSize) || 34));
  const imageFormat = ['cover', 'contain', 'portrait', 'landscape', 'square', 'thumbnail']
    .includes(String(item.imageFormat || '').trim())
    ? String(item.imageFormat || '').trim()
    : 'cover';
  return {
    kind: normalizeShowcaseKind(item.kind),
    title,
    subtitle: String(item.subtitle || '').trim(),
    image: String(item.image || '').trim(),
    imageFormat,
    imageSize,
    teaser: String(item.teaser || '').trim(),
    description: String(item.description || '').trim(),
    details: String(item.details || '').trim(),
    infoRows: normalizeShowcaseInfoRows(item.infoRows || item.infoTable || ''),
    infoTable: serializeShowcaseInfoRows(item.infoRows || item.infoTable || ''),
    stamp: String(item.stamp || '').trim()
  };
}

function getCommentShowcaseItem(comment) {
  return normalizeCommentShowcaseItem(comment?.itemShowcase || comment?.showcaseItem);
}

function parseShowcaseMarkup(raw) {
  return parseCommentMarkup(raw, { compactLists: true });
}

function renderShowcaseImage(item, className = 'comment-showcase-img') {
  const src = sanitizeImageSrc(item.image || '');
  const format = ['cover', 'contain', 'portrait', 'landscape', 'square', 'thumbnail'].includes(item.imageFormat)
    ? item.imageFormat
    : 'cover';
  const classes = `${className} showcase-img-format-${format}`;
  return src
    ? `<img class="${classes}" src="${src}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async">`
    : `<div class="${classes} comment-showcase-img-placeholder">${escapeHtml(getShowcaseKindLabel(item.kind).slice(0, 1))}</div>`;
}

function renderShowcaseProfileContent(item, options = {}) {
  const imageSize = Math.max(18, Math.min(52, Number(item.imageSize) || 34));
  const previewClass = options.preview ? ' showcase-profile-preview-card' : '';
  const description = item.description
    ? parseShowcaseMarkup(item.description)
    : '<em>Keine Beschreibung vorhanden.</em>';
  const details = item.details ? parseShowcaseMarkup(item.details) : '';
  return `
    <div class="showcase-profile-card${previewClass}" style="--showcase-image-col:${imageSize}%">
      <div class="showcase-profile-media" data-format="${escapeHtml(item.imageFormat || 'cover')}">
        <div class="showcase-profile-image-frame">${renderShowcaseImage(item, 'showcase-profile-img')}</div>
        ${renderShowcaseInfoTable(item, options)}
      </div>
      <div class="showcase-profile-copy">
        <div class="showcase-profile-kind">${escapeHtml(getShowcaseKindLabel(item.kind))}</div>
        <h2>${escapeHtml(item.title)}</h2>
        ${item.subtitle ? `<div class="showcase-profile-subtitle">${escapeHtml(item.subtitle)}</div>` : ''}
        ${item.stamp ? `<div class="showcase-profile-stamp">${escapeHtml(item.stamp)}</div>` : ''}
        <div class="showcase-profile-description">${description}</div>
        ${details ? `<div class="showcase-profile-details">${details}</div>` : ''}
      </div>
    </div>`;
}

function renderShowcaseInfoTable(item, options = {}) {
  const rows = normalizeShowcaseInfoRows(item.infoRows || item.infoTable || '');
  if (!rows.length) {
    return options.preview
      ? '<div class="showcase-info-table showcase-info-table-empty">Infotabelle</div>'
      : '';
  }
  return `
    <div class="showcase-info-table">
      <div class="showcase-info-table-title">Infotafel</div>
      ${rows.map(row => `
        <div class="showcase-info-row">
          <div class="showcase-info-label">${escapeHtml(row.label || 'Info')}</div>
          <div class="showcase-info-value">${parseShowcaseMarkup(row.value || '')}</div>
        </div>`).join('')}
    </div>`;
}

function renderCommentShowcaseCard(item, options = {}) {
  const kindLabel = getShowcaseKindLabel(item.kind);
  const teaser = item.teaser || item.description || '';
  const tag = options.interactive === false ? 'div' : 'button';
  const attrs = options.interactive === false
    ? ''
    : ` type="button" data-action="open-comment-showcase-profile" data-comment-id="${escapeHtml(options.commentId || '')}"`;
  return `
    <${tag} class="comment-showcase-card"${attrs}>
      ${renderShowcaseImage(item)}
      <span class="comment-showcase-copy">
        <span class="comment-showcase-kicker">${escapeHtml(kindLabel)}</span>
        <span class="comment-showcase-title">${escapeHtml(item.title)}</span>
        ${item.subtitle ? `<span class="comment-showcase-subtitle">${escapeHtml(item.subtitle)}</span>` : ''}
        ${teaser ? `<span class="comment-showcase-teaser">${sanitizeContentHtml(teaser)}</span>` : ''}
      </span>
    </${tag}>`;
}

function renderCommentShowcase(comment, idx, item) {
  const commentId = String(comment?.id || '');
  const safeCommentId = escapeHtml(commentId).replace(/'/g, '&#39;');
  const divider = idx > 0
    ? `<div class="comment-divider"><span class="comment-divider-icon">*</span></div>`
    : '';
  const actions = comment?._hideActions ? '' : `
      <div class="comment-narrator-actions">
        <button type="button" class="comment-narrator-edit" data-action="open-edit-showcase-form" data-comment-id="${safeCommentId}" title="Bearbeiten">Bearbeiten</button>
        <button type="button" class="comment-narrator-del" data-action="open-delete-confirm" data-comment-id="${safeCommentId}" title="Löschen">Löschen</button>
      </div>`;
  return `
    ${divider}
    <div class="comment-narrator comment-showcase-entry" data-comment-id="${safeCommentId}">
      <div class="comment-kind-badge">Erzähler · Vorstellung</div>
      ${renderCommentShowcaseCard(item, { commentId: safeCommentId })}
      ${actions}
    </div>`;
}

