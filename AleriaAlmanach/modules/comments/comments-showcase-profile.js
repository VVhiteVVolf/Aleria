// Showcase profile overlay rendering and lifecycle.
function openCommentShowcaseProfile(commentId) {
  const comment = findCachedCommentById(commentId);
  const item = getCommentShowcaseItem(comment);
  if (!item) return;
  const overlay = document.getElementById('showcase-profile-overlay');
  if (!overlay) return;
  const card = overlay.querySelector('.showcase-profile-card');
  if (card) card.style.setProperty('--showcase-image-col', `${Math.max(18, Math.min(52, Number(item.imageSize) || 34))}%`);
  overlay.querySelector('#sp-kind').textContent = getShowcaseKindLabel(item.kind);
  overlay.querySelector('#sp-title').textContent = item.title;
  overlay.querySelector('#sp-subtitle').textContent = item.subtitle || '';
  overlay.querySelector('#sp-subtitle').style.display = item.subtitle ? 'block' : 'none';
  overlay.querySelector('#sp-image-wrap').dataset.format = item.imageFormat || 'cover';
  overlay.querySelector('#sp-image-wrap').innerHTML = `
    <div class="showcase-profile-image-frame">${renderShowcaseImage(item, 'showcase-profile-img')}</div>
    ${renderShowcaseInfoTable(item)}`;
  overlay.querySelector('#sp-stamp').textContent = item.stamp || '';
  overlay.querySelector('#sp-stamp').style.display = item.stamp ? 'block' : 'none';
  overlay.querySelector('#sp-description').innerHTML = item.description
    ? parseShowcaseMarkup(item.description)
    : '<em>Keine Beschreibung vorhanden.</em>';
  overlay.querySelector('#sp-details').innerHTML = item.details ? parseShowcaseMarkup(item.details) : '';
  overlay.querySelector('#sp-details').style.display = item.details ? 'block' : 'none';
  activateDialog('showcase-profile-overlay', { initialFocus: '.showcase-profile-close' });
}

function closeCommentShowcaseProfile() {
  deactivateDialog('showcase-profile-overlay');
}

