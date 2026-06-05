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
  const tag = safeHref ? 'a' : 'div';
  const attrs = safeHref
    ? ` href="${safeHref}" target="_blank" rel="noopener noreferrer"`
    : '';
  const previewText = item.text
    ? parseCommentMarkup(item.text)
    : '<em>Dokument aus der Werkstatt öffnen.</em>';
  return `
    <${tag} class="comment-attachment-card"${attrs}>
      <span class="comment-attachment-kicker">Anhang</span>
      <span class="comment-attachment-title">${escapeHtml(item.title)}</span>
      <span class="comment-attachment-preview">${previewText}</span>
      <span class="comment-attachment-url">${escapeHtml(item.url)}</span>
    </${tag}>`;
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
      <div class="comment-kind-badge">Erzähler · Anhang</div>
      ${comment.text ? `<div class="comment-attachment-narration">${parseCommentMarkup(comment.text)}</div>` : ''}
      ${renderCommentAttachmentCard(item)}
      ${actions}
    </div>`;
}

