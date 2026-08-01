// Read-only "scroll" detail panel - the themed counterpart to the legacy
// module's parchment #scroll-card, kept as a real panel in the sidebar
// rather than a generic Leaflet popup (see FEATURE_PRESERVATION_MATRIX.md).
function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function formatLoreText(text) {
  if (!text) return '';
  let html = escapeHtml(text);
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/---/g, '<hr/>');
  return html
    .split(/\n\n+/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

/**
 * @param {HTMLElement} container
 * @param {{feature: object, category: object|null, onEdit: (()=>void)|null, onDelete: (()=>void)|null, onOpenLinkedMap: (()=>void)|null, onClose: ()=>void}} props
 */
export function renderFeatureDetails(container, props) {
  const { feature, category, onEdit, onDelete, onOpenLinkedMap, onClose } = props;
  const affiliations = [];
  if (feature.region) affiliations.push(['Region', feature.region]);
  if (feature.house) affiliations.push(['Herrschaft', feature.house]);
  if (feature.faction) affiliations.push(['Fraktion', feature.faction]);
  const rows = (feature.table || []).filter((row) => row.k || row.v);
  const color = category?.color || '#8a6510';

  container.innerHTML = `
    <div class="scroll-card">
      <button class="scroll-card__close" data-action="close" aria-label="Schliessen">✕</button>
      <div class="scroll-card__header">
        <div class="scroll-card__crest">${feature.crest ? `<img src="${escapeHtml(feature.crest)}" alt=""/>` : '<span class="scroll-card__crest-fallback">🏰</span>'}</div>
        <div class="scroll-card__heading">
          <div class="scroll-card__title">${escapeHtml(feature.name)}</div>
          <div class="scroll-card__badge" style="--cat-color:${color}">
            <span class="scroll-card__dot" style="background:${color}"></span>${escapeHtml(category?.label || 'Ohne Kategorie')}
          </div>
          ${
            affiliations.length
              ? `<div class="scroll-card__affiliations">${affiliations
                  .map(([label, value]) => `<span class="scroll-card__affil"><span>${escapeHtml(label)}</span> ${escapeHtml(value)}</span>`)
                  .join('')}</div>`
              : ''
          }
        </div>
      </div>
      ${
        feature.image || rows.length
          ? `<div class="scroll-card__body">
              ${feature.image ? `<div class="scroll-card__image"><img src="${escapeHtml(feature.image)}" alt="" onerror="this.parentElement.style.display='none'"/></div>` : ''}
              ${rows.length ? `<table class="scroll-card__table">${rows.map((row) => `<tr><td>${escapeHtml(row.k)}</td><td>${escapeHtml(row.v)}</td></tr>`).join('')}</table>` : ''}
            </div>`
          : ''
      }
      ${feature.description ? `<div class="scroll-card__lore"><div class="scroll-card__divider">❧ ✦ ❧</div>${formatLoreText(feature.description)}</div>` : ''}
      <div class="scroll-card__footer">
        ${feature.linkedMapId ? '<button class="scroll-card__btn" data-action="open-linked-map">🗺 Unterkarte öffnen</button>' : ''}
        ${onEdit ? '<button class="scroll-card__btn" data-action="edit">Bearbeiten</button>' : ''}
        ${onDelete ? '<button class="scroll-card__btn scroll-card__btn--danger" data-action="delete">Löschen</button>' : ''}
      </div>
    </div>
  `;

  container.querySelector('[data-action="close"]').addEventListener('click', () => onClose());
  container.querySelector('[data-action="edit"]')?.addEventListener('click', () => onEdit());
  container.querySelector('[data-action="delete"]')?.addEventListener('click', () => onDelete());
  container.querySelector('[data-action="open-linked-map"]')?.addEventListener('click', () => onOpenLinkedMap());
}
