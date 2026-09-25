// Stateless rendering shared by classic character modules and ES-module creatures.
// The single namespace bridges both script formats; callers supply content safety.
(function (root) {
  function renderIcon(icon, { escape, imageSource }) {
    const value = String(icon || '').trim();
    const image = imageSource(value);
    return image ? `<img src="${image}" alt="" loading="lazy" decoding="async">` : (value ? escape(value) : '&#10022;');
  }

  function renderTrait(item, presentation) {
    return `<div class="biography-ability">
      <div class="biography-ability-icon">${renderIcon(item.icon, presentation)}</div>
      <div><strong>${presentation.escape(item.title || '')}</strong><span>${presentation.escape(item.detail || '')}</span></div>
    </div>`;
  }

  function renderConnection(item, presentation) {
    const { escape, imageSource } = presentation;
    if (item?.type === 'heading') return `<div class="biography-connection-heading">
      <strong>${escape(item.title || '')}</strong>${item.detail ? `<span>${escape(item.detail)}</span>` : ''}
    </div>`;
    const format = ['landscape', 'square'].includes(item?.imageFormat) ? item.imageFormat : 'portrait';
    const image = imageSource(item.image || '');
    const visual = image ? `<img class="${format}" src="${image}" alt="" loading="lazy" decoding="async">`
      : `<div class="biography-connection-placeholder ${format}">${item.icon ? renderIcon(item.icon, presentation) : escape((Array.from(String(item.name || '').trim())[0] || '?').toUpperCase())}</div>`;
    return `<div class="biography-connection ${format}">${visual}
      <div><strong>${escape(item.name || '')}</strong><span>${escape(item.detail || '')}</span></div>
    </div>`;
  }

  root.AleriaBiographyCards = Object.freeze({ renderIcon, renderTrait, renderConnection });
})(globalThis);
