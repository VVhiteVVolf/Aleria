function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

/**
 * Top toolbar: map title, breadcrumb mount point, search mount point, and
 * the primary actions (reset view, fullscreen, edit toggle, undo, data
 * manager). Renders the shell once; callers re-render the breadcrumb/
 * search panels into the returned mount points as the map changes.
 * @param {HTMLElement} container
 * @param {{title: string, onResetView: ()=>void, onFullscreen: ()=>void, onToggleEdit: ()=>void, onUndo: ()=>void, onOpenDataManager: ()=>void}} props
 */
export function renderMapToolbar(container, props) {
  container.innerHTML = `
    <div class="map-toolbar">
      <div class="map-toolbar__row">
        <div class="map-toolbar__title" data-role="title">${escapeHtml(props.title)}</div>
        <div class="map-toolbar__sep"></div>
        <div class="map-toolbar__search" data-role="search"></div>
        <div class="map-toolbar__spacer"></div>
        <button type="button" class="map-toolbar__btn" data-action="reset-view" title="Ansicht zurücksetzen (f)">⤢ Zentrieren</button>
        <button type="button" class="map-toolbar__btn" data-action="fullscreen" title="Vollbild">⛶ Vollbild</button>
        <button type="button" class="map-toolbar__btn" data-action="undo" title="Rückgängig" hidden>↺ Rückgängig</button>
        <button type="button" class="map-toolbar__btn" data-action="data-manager" title="Import/Export">📦 Daten</button>
        <button type="button" class="map-toolbar__btn map-toolbar__btn--edit" data-action="toggle-edit">🔒 Bearbeiten</button>
      </div>
      <div class="map-toolbar__row map-toolbar__row--breadcrumb" data-role="breadcrumb"></div>
    </div>
  `;

  container.querySelector('[data-action="reset-view"]').addEventListener('click', props.onResetView);
  container.querySelector('[data-action="fullscreen"]').addEventListener('click', props.onFullscreen);
  container.querySelector('[data-action="toggle-edit"]').addEventListener('click', props.onToggleEdit);
  container.querySelector('[data-action="undo"]').addEventListener('click', props.onUndo);
  container.querySelector('[data-action="data-manager"]').addEventListener('click', props.onOpenDataManager);

  return {
    searchMount: container.querySelector('[data-role="search"]'),
    breadcrumbMount: container.querySelector('[data-role="breadcrumb"]'),
    titleEl: container.querySelector('[data-role="title"]'),
    editButton: container.querySelector('[data-action="toggle-edit"]'),
    undoButton: container.querySelector('[data-action="undo"]'),
    setEditMode(active) {
      const editButton = container.querySelector('[data-action="toggle-edit"]');
      editButton.textContent = active ? '🔓 Bearbeiten aktiv' : '🔒 Bearbeiten';
      editButton.classList.toggle('is-active', active);
      container.querySelector('[data-action="undo"]').hidden = !active;
    },
  };
}
