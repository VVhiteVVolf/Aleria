// Rendering and normalization for comment attachments.
function getSafeAttachmentHref(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  if (typeof sanitizeHref === 'function') return sanitizeHref(raw);
  if (/^(?:javascript|data|vbscript):/i.test(raw)) return '';
  if (/^https?:\/\//i.test(raw)) return escapeHtml(raw);
  if (/^(?:\.{0,2}\/|\/)(?!\/|\\)/.test(raw)) return escapeHtml(raw);
  return '';
}

function normalizeAttachmentUrlForStorage(value) {
  const raw = String(value || '').trim();
  return getSafeAttachmentHref(raw) ? raw : null;
}

function getCommentAttachmentImageUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  let candidate = raw;
  try {
    const parsed = new URL(raw, window.location.href);
    const host = parsed.hostname.toLowerCase();
    const match = parsed.pathname.match(/^\/([a-z0-9]+)(\.(?:png|jpe?g|gif|webp))?\/?$/i);
    if ((host === 'imgur.com' || host === 'www.imgur.com') && match) {
      candidate = `https://i.imgur.com/${match[1]}${match[2] || '.jpg'}`;
    }
  } catch {
    // Relative image paths remain supported for older scene attachments.
  }
  return typeof sanitizeImageSrc === 'function' ? sanitizeImageSrc(candidate) : '';
}

function normalizeCommentAttachmentItem(item) {
  if (!item || typeof item !== 'object') return null;
  const url = String(item.url || item.href || item.documentUrl || '').trim();
  const title = String(item.title || item.label || '').trim();
  if (!url || !title) return null;
  return {
    title,
    url,
    text: String(item.text || item.description || item.preview || '').trim()
  };
}

function getCommentAttachmentItem(comment) {
  return normalizeCommentAttachmentItem(comment?.documentAttachment || comment?.attachmentItem);
}

function renderCommentAttachmentCard(item) {
  const safeHref = getSafeAttachmentHref(item.url);
  const previewText = item.text
    ? parseCommentMarkup(item.text)
    : '<em>Eine Illustration aus den Aufzeichnungen.</em>';
  const image = getCommentAttachmentImageUrl(item.url);
  return `
    <article class="comment-attachment-card${image ? '' : ' is-unavailable'}">
      <button class="comment-attachment-image-stage" type="button" data-attachment-viewer-action="open" data-attachment-src="${escapeHtml(item.url)}" data-attachment-title="${escapeHtml(item.title)}" aria-label="${escapeHtml(item.title)} vergrößern"${image ? '' : ' disabled'}>
        ${image ? `<img src="${image}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async">` : ''}
        <span class="comment-attachment-image-fallback" aria-hidden="true"><b>Bild nicht verfügbar</b><small>Originalquelle öffnen</small></span>
        <span class="comment-attachment-corner" aria-hidden="true"></span>
      </button>
      <div class="comment-attachment-caption">
        <span class="comment-attachment-kicker">Bildanhang · Archivillustration</span>
        <strong class="comment-attachment-title">${escapeHtml(item.title)}</strong>
        <span class="comment-attachment-preview">${previewText}</span>
        ${safeHref ? `<a class="comment-attachment-original" href="${safeHref}" target="_blank" rel="noopener noreferrer">Original ansehen <span aria-hidden="true">→</span></a>` : ''}
      </div>
    </article>`;
}

function renderCommentAttachment(comment, idx, item) {
  const commentId = String(comment?.id || '');
  const safeCommentId = escapeHtml(commentId).replace(/'/g, '&#39;');
  const divider = idx > 0
    ? `<div class="comment-divider"><span class="comment-divider-icon">*</span></div>`
    : '';
  const actions = comment?._hideActions ? '' : `
      <div class="comment-narrator-actions">
        <button type="button" class="comment-narrator-edit" data-action="open-edit-attachment-form" data-comment-id="${safeCommentId}" title="Bearbeiten">Bearbeiten</button>
        <button type="button" class="comment-narrator-del" data-action="open-delete-confirm" data-comment-id="${safeCommentId}" title="Löschen">Löschen</button>
      </div>`;
  return `
    ${divider}
    <div class="comment-narrator comment-attachment-entry" data-comment-id="${safeCommentId}">
      <div class="comment-kind-badge">Erzähler · Bildanhang</div>
      ${comment.text ? `<div class="comment-attachment-narration">${parseCommentMarkup(comment.text)}</div>` : ''}
      ${renderCommentAttachmentCard(item)}
      ${actions}
    </div>`;
}
