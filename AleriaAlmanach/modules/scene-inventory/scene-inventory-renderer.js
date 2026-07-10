// Immersive giver-object-receiver card inside the scene timeline.
function renderSceneInventoryActor(actor = {}, side = '') {
  const portrait = sanitizeImageSrc(actor.portrait || '');
  return `<button type="button" class="scene-transfer-actor ${side}" data-action="open-speaker-profile" data-speaker-character-id="${escapeHtml(actor.id || '')}" data-speaker-name="${escapeHtml(actor.name || '')}" data-speaker-portrait="${escapeHtml(actor.portrait || '')}">
    <span class="scene-transfer-actor-portrait">${portrait ? `<img src="${portrait}" alt="">` : `<span>${escapeHtml(getInitialChar(actor.name || '?'))}</span>`}</span>
    <strong>${escapeHtml(actor.name || 'Unbekannt')}</strong>
    <small>${side === 'giver' ? 'Geber' : 'Empfänger'}</small>
  </button>`;
}

function renderSceneInventoryTransferComment(comment, idx = 0) {
  const transfer = comment.sceneInventoryTransfer || {};
  const object = transfer.object || {};
  const image = sanitizeImageSrc(object.visualIcon || object.image || object.icon || '');
  const divider = idx > 0 ? '<div class="comment-divider"><span class="comment-divider-icon">*</span></div>' : '';
  return `${divider}<article class="scene-transfer-event" data-comment-id="${escapeHtml(comment.id || '')}">
    <div class="scene-transfer-kicker">Inventar · Übergabe</div>
    <div class="scene-transfer-stage">
      ${renderSceneInventoryActor(transfer.giver, 'giver')}
      <div class="scene-transfer-object">
        <span class="scene-transfer-flow" aria-hidden="true">→</span>
        <span class="scene-transfer-object-visual">${image ? `<img src="${image}" alt="">` : `<span>${escapeHtml(object.icon || (object.kind === 'money' ? '◈' : '◆'))}</span>`}</span>
        <strong>${escapeHtml(object.name || 'Gegenstand')}</strong>
        ${object.description && object.description !== object.name ? `<p>${escapeHtml(object.description)}</p>` : ''}
        ${object.quantity > 1 && (object.kind === 'item' || object.kind === 'register-item') ? `<small>${escapeHtml(object.quantity)} Stück</small>` : ''}
        ${object.sourceLabel ? `<small class="scene-transfer-source">${escapeHtml(object.sourceLabel)}</small>` : ''}
      </div>
      ${renderSceneInventoryActor(transfer.receiver, 'receiver')}
    </div>
    ${transfer.flavour ? `<div class="scene-transfer-flavour">${parseCommentMarkup(transfer.flavour)}</div>` : ''}
    <button type="button" class="scene-transfer-delete" data-action="open-delete-confirm" data-comment-id="${escapeHtml(comment.id || '')}" aria-label="Übergabe aus der Chronik entfernen" title="Chronikeintrag entfernen">×</button>
  </article>`;
}
