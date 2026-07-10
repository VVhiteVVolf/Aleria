// Full-size viewer and resilient image loading for scene image attachments.
function ensureCommentAttachmentViewer() {
  let overlay = document.getElementById('comment-attachment-viewer');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'comment-attachment-viewer';
  overlay.className = 'comment-attachment-viewer';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-labelledby', 'comment-attachment-viewer-title');
  overlay.innerHTML = `
    <div class="comment-attachment-viewer-shell">
      <header>
        <div><span>Bildanhang</span><h2 id="comment-attachment-viewer-title">Illustration</h2></div>
        <button type="button" data-attachment-viewer-action="close" aria-label="Bildansicht schließen">×</button>
      </header>
      <div class="comment-attachment-viewer-image"><img alt=""><span><b>Bild konnte nicht geladen werden.</b><small>Nutze den Link zum Imgur-Original.</small></span></div>
      <footer><a target="_blank" rel="noopener noreferrer">Original bei Imgur ansehen <span aria-hidden="true">→</span></a></footer>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

function openCommentAttachmentViewer(trigger) {
  const src = String(trigger?.dataset?.attachmentSrc || '').trim();
  const title = String(trigger?.dataset?.attachmentTitle || 'Illustration').trim();
  const imageSrc = getCommentAttachmentImageUrl(src);
  const href = getSafeAttachmentHref(src);
  if (!imageSrc || !href) return;
  const overlay = ensureCommentAttachmentViewer();
  overlay.classList.remove('has-image-error');
  overlay.querySelector('h2').textContent = title;
  const image = overlay.querySelector('img');
  image.src = imageSrc;
  image.alt = title;
  const link = overlay.querySelector('a');
  link.href = href;
  activateDialog('comment-attachment-viewer', { initialFocus: '[data-attachment-viewer-action="close"]' });
}

function closeCommentAttachmentViewer() {
  const overlay = document.getElementById('comment-attachment-viewer');
  deactivateDialog('comment-attachment-viewer');
  const image = overlay?.querySelector('img');
  if (image) image.removeAttribute('src');
}

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-attachment-viewer-action]');
  if (!trigger) return;
  event.preventDefault();
  if (trigger.dataset.attachmentViewerAction === 'open') openCommentAttachmentViewer(trigger);
  if (trigger.dataset.attachmentViewerAction === 'close') closeCommentAttachmentViewer();
});

document.addEventListener('click', event => {
  if (event.target?.id === 'comment-attachment-viewer') closeCommentAttachmentViewer();
});

document.addEventListener('error', event => {
  const image = event.target;
  const card = image?.closest?.('.comment-attachment-card');
  if (card) card.classList.add('has-image-error');
  const viewer = image?.closest?.('.comment-attachment-viewer');
  if (viewer) viewer.classList.add('has-image-error');
}, true);
