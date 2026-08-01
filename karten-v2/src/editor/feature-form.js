// Property editor for a PointFeature (region/route features reuse the
// shared name/description/visibility fields via the same renderer, minus
// the location-specific fields). Pure DOM - no framework - matching the
// rest of this codebase. Renders into a provided container and calls back
// on save/cancel/delete; it never talks to the map or the editor store
// directly, keeping this reusable/testable in isolation.

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function optionsHtml(items, selectedValue, { valueKey = 'id', labelKey = 'label' } = {}) {
  return items
    .map((item) => `<option value="${escapeHtml(item[valueKey])}"${item[valueKey] === selectedValue ? ' selected' : ''}>${escapeHtml(item[labelKey])}</option>`)
    .join('');
}

/**
 * @param {HTMLElement} container
 * @param {{feature: object, categories: object[], childMaps: object[], onSave: (patch:object)=>void, onCancel: ()=>void, onDelete: (()=>void)|null}} props
 */
export function renderFeatureForm(container, props) {
  const { feature, categories, childMaps = [], onSave, onCancel, onDelete } = props;
  const table = (feature.table || []).map((row) => ({ ...row }));

  container.innerHTML = `
    <form class="feature-form" novalidate>
      <div class="feature-form__row">
        <label>Name</label>
        <input name="name" maxlength="80" required value="${escapeHtml(feature.name)}"/>
      </div>
      <div class="feature-form__row feature-form__row--split">
        <div>
          <label>Typ</label>
          <input name="type" maxlength="40" value="${escapeHtml(feature.type || '')}" placeholder="z. B. settlement"/>
        </div>
        <div>
          <label>Kategorie</label>
          <select name="categoryId">
            <option value="">— keine —</option>
            ${optionsHtml(categories, feature.categoryId)}
          </select>
        </div>
      </div>
      <div class="feature-form__row">
        <label>Beschreibung</label>
        <textarea name="description" rows="3">${escapeHtml(feature.description || '')}</textarea>
      </div>
      <div class="feature-form__row feature-form__row--split">
        <div>
          <label>Region</label>
          <input name="region" maxlength="80" value="${escapeHtml(feature.region || '')}"/>
        </div>
        <div>
          <label>Herrschaft / Haus</label>
          <input name="house" maxlength="80" value="${escapeHtml(feature.house || '')}"/>
        </div>
      </div>
      <div class="feature-form__row feature-form__row--split">
        <div>
          <label>Fraktion</label>
          <input name="faction" maxlength="80" value="${escapeHtml(feature.faction || '')}"/>
        </div>
        <div>
          <label>Sichtbarkeit</label>
          <select name="visibility">
            <option value="public"${feature.visibility === 'public' ? ' selected' : ''}>Öffentlich</option>
            <option value="discovered"${feature.visibility === 'discovered' ? ' selected' : ''}>Nach Entdeckung</option>
            <option value="hidden"${feature.visibility === 'hidden' ? ' selected' : ''}>Verborgen</option>
            <option value="gm-only"${feature.visibility === 'gm-only' ? ' selected' : ''}>Nur Spielleitung</option>
          </select>
        </div>
      </div>
      <div class="feature-form__row">
        <label>Tags (Komma-getrennt)</label>
        <input name="tags" value="${escapeHtml((feature.tags || []).join(', '))}"/>
      </div>
      <div class="feature-form__row feature-form__row--split">
        <div>
          <label>Verknüpfte Unterkarte</label>
          <select name="linkedMapId">
            <option value="">— keine —</option>
            ${optionsHtml(childMaps, feature.linkedMapId, { valueKey: 'id', labelKey: 'title' })}
          </select>
        </div>
        <div>
          <label>Verknüpfter Lore-Eintrag (URL/ID)</label>
          <input name="linkedEntityId" value="${escapeHtml(feature.linkedEntityId || '')}"/>
        </div>
      </div>
      <div class="feature-form__row feature-form__row--split">
        <div>
          <label>Vorschaubild (URL)</label>
          <input name="image" value="${escapeHtml(feature.image || '')}" placeholder="https://…"/>
        </div>
        <div>
          <label>Wappen (URL)</label>
          <input name="crest" value="${escapeHtml(feature.crest || '')}" placeholder="https://…"/>
        </div>
      </div>
      <div class="feature-form__row">
        <label>Infotabelle</label>
        <div class="feature-form__table" data-role="table"></div>
        <button type="button" class="feature-form__add-row" data-action="add-row">+ Zeile</button>
      </div>
      <div class="feature-form__footer">
        ${onDelete ? '<button type="button" class="feature-form__delete" data-action="delete">Löschen</button>' : ''}
        <button type="button" class="feature-form__cancel" data-action="cancel">Abbrechen</button>
        <button type="submit" class="feature-form__save">✓ Speichern</button>
      </div>
    </form>
  `;

  const form = container.querySelector('form');
  const tableEl = form.querySelector('[data-role="table"]');

  function renderTable() {
    tableEl.innerHTML = table
      .map(
        (row, index) => `
      <div class="feature-form__table-row" data-index="${index}">
        <input class="feature-form__table-key" data-field="k" placeholder="Feld" value="${escapeHtml(row.k)}"/>
        <input class="feature-form__table-value" data-field="v" placeholder="Wert" value="${escapeHtml(row.v)}"/>
        <button type="button" class="feature-form__table-remove" data-action="remove-row" data-index="${index}">✕</button>
      </div>`,
      )
      .join('');
  }
  renderTable();

  tableEl.addEventListener('input', (event) => {
    const row = event.target.closest('.feature-form__table-row');
    if (!row) return;
    const index = Number(row.dataset.index);
    table[index][event.target.dataset.field] = event.target.value;
  });

  form.querySelector('[data-action="add-row"]').addEventListener('click', () => {
    table.push({ k: '', v: '' });
    renderTable();
  });

  tableEl.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="remove-row"]');
    if (!button) return;
    table.splice(Number(button.dataset.index), 1);
    renderTable();
  });

  form.querySelector('[data-action="cancel"]').addEventListener('click', () => onCancel());
  form.querySelector('[data-action="delete"]')?.addEventListener('click', () => onDelete());

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const patch = {
      name: (data.get('name') || 'Unbekannter Ort').toString().trim() || 'Unbekannter Ort',
      type: (data.get('type') || '').toString().trim(),
      categoryId: (data.get('categoryId') || '') || undefined,
      description: (data.get('description') || '').toString().trim(),
      region: (data.get('region') || '').toString().trim(),
      house: (data.get('house') || '').toString().trim(),
      faction: (data.get('faction') || '').toString().trim(),
      visibility: (data.get('visibility') || 'public').toString(),
      tags: (data.get('tags') || '')
        .toString()
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      linkedMapId: (data.get('linkedMapId') || '') || null,
      linkedEntityId: (data.get('linkedEntityId') || '').toString().trim(),
      image: (data.get('image') || '').toString().trim(),
      crest: (data.get('crest') || '').toString().trim(),
      table: table.filter((row) => row.k || row.v),
    };
    onSave(patch);
  });

  return {
    destroy() {
      container.innerHTML = '';
    },
  };
}
