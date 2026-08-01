function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

/**
 * Collapsible checkbox list for a map's layers, backed by layer-manager.js.
 * @param {HTMLElement} container
 * @param {{layerDefinitions: object[], layerManager: object}} props
 */
export function renderLayerPanel(container, { layerDefinitions, layerManager }) {
  container.innerHTML = `
    <div class="layer-panel">
      <button class="layer-panel__toggle" data-action="toggle" aria-expanded="true">Ebenen ▾</button>
      <div class="layer-panel__list">
        ${layerDefinitions
          .map(
            (layer) => `
          <label class="layer-panel__item">
            <input type="checkbox" data-layer-id="${escapeHtml(layer.id)}" ${layerManager.isVisible(layer.id) ? 'checked' : ''}/>
            ${escapeHtml(layer.name)}
          </label>`,
          )
          .join('')}
      </div>
    </div>
  `;

  const list = container.querySelector('.layer-panel__list');
  const toggleButton = container.querySelector('[data-action="toggle"]');
  toggleButton.addEventListener('click', () => {
    const collapsed = list.classList.toggle('collapsed');
    toggleButton.setAttribute('aria-expanded', String(!collapsed));
  });

  container.querySelectorAll('input[data-layer-id]').forEach((input) => {
    input.addEventListener('change', () => {
      layerManager.toggle(input.dataset.layerId, input.checked);
    });
  });
}
