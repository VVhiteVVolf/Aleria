function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

/**
 * Breadcrumb (root..current) plus a "jump to child map" list, both driven
 * by map-registry.js. Clicking any crumb or child navigates via onNavigate.
 * @param {HTMLElement} container
 * @param {{registry: object, currentMapId: string, onNavigate: (mapId:string)=>void}} props
 */
export function renderMapSelector(container, { registry, currentMapId, onNavigate }) {
  const crumbs = registry.breadcrumb(currentMapId);
  const children = registry.children(currentMapId);

  container.innerHTML = `
    <nav class="map-breadcrumb" aria-label="Kartenhierarchie">
      ${crumbs
        .map(
          (map, index) => `
        <button type="button" class="map-breadcrumb__crumb${map.id === currentMapId ? ' is-current' : ''}" data-map-id="${escapeHtml(map.id)}" ${map.status !== 'active' ? 'data-planned="true"' : ''}>
          ${escapeHtml(map.title)}
        </button>${index < crumbs.length - 1 ? '<span class="map-breadcrumb__sep">›</span>' : ''}`,
        )
        .join('')}
    </nav>
    ${
      children.length
        ? `<div class="map-children">
            <span class="map-children__label">Unterkarten:</span>
            ${children
              .map(
                (map) => `
              <button type="button" class="map-children__item${map.status !== 'active' ? ' is-planned' : ''}" data-map-id="${escapeHtml(map.id)}">
                ${escapeHtml(map.title)}${map.status !== 'active' ? ' (geplant)' : ''}
              </button>`,
              )
              .join('')}
          </div>`
        : ''
    }
  `;

  container.querySelectorAll('[data-map-id]').forEach((button) => {
    button.addEventListener('click', () => onNavigate(button.dataset.mapId));
  });
}
