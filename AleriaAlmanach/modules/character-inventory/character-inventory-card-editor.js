function buildCharacterInventoryModalInfoRowsEditor(rows = [], owner = 'item') {
  const removeAction = owner === 'companion' ? 'remove-companion-info-row' : 'remove-item-info-row';
  return (Array.isArray(rows) ? rows : []).map(row => `
    <div class="ci-modal-edit-row" data-ci-modal-info-row>
      <input type="text" data-ci-modal-field="infoIcon" value="${escapeHtml(row.icon || '')}" placeholder="Icon">
      <input type="text" data-ci-modal-field="infoLabel" value="${escapeHtml(row.label || '')}" placeholder="Label">
      <input type="text" data-ci-modal-field="infoValue" value="${escapeHtml(row.value || '')}" placeholder="Wert">
      <button type="button" data-ci-action="${removeAction}">Löschen</button>
    </div>`).join('');
}

function buildCharacterInventoryModalAttributeEditor(attributes = [], owner = 'item') {
  const removeAction = owner === 'companion' ? 'remove-companion-attribute-row' : 'remove-item-attribute-row';
  return (Array.isArray(attributes) ? attributes : []).map(attribute => `
    <div class="ci-modal-edit-row compact" data-ci-modal-attribute-row>
      <input type="text" data-ci-modal-field="attributeLabel" value="${escapeHtml(attribute.label || '')}" placeholder="Diagramm-Reiter">
      <input type="number" min="0" max="10" step="1" data-ci-modal-field="attributeValue" value="${escapeHtml(attribute.value ?? 5)}" placeholder="Wert">
      <button type="button" data-ci-action="${removeAction}">Löschen</button>
    </div>`).join('');
}

function buildCharacterInventoryModalImageSettings(data = {}, fallback = {}) {
  const settings = sanitizeCharacterInventoryImageSettings({
    format: data.imageFormat || fallback.format,
    fit: data.imageFit || fallback.fit,
    position: data.imagePosition || fallback.position
  });
  const select = (field, label, value, options) => `
    <label>
      <span>${escapeHtml(label)}</span>
      <select data-ci-modal-field="${escapeHtml(field)}">
        ${options.map(option => `<option value="${escapeHtml(option.value)}"${option.value === value ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}
      </select>
    </label>`;
  return `
    ${select('imageFormat', 'Bildformat', settings.format, [
      { value: 'portrait', label: 'Hochformat' },
      { value: 'square', label: 'Quadratisch' },
      { value: 'landscape', label: 'Querformat' },
      { value: 'wide', label: 'Breitbild' }
    ])}
    ${select('imageFit', 'Bildfüllung', settings.fit, [
      { value: 'cover', label: 'Füllen / zuschneiden' },
      { value: 'contain', label: 'Ganzes Bild' }
    ])}
    ${select('imagePosition', 'Ausschnitt', settings.position, [
      { value: 'top', label: 'Oben' },
      { value: 'center', label: 'Mitte' },
      { value: 'bottom', label: 'Unten' },
      { value: 'left', label: 'Links' },
      { value: 'right', label: 'Rechts' }
    ])}`;
}

function buildCharacterInventoryItemPreview(item) {
  return `
    <div class="ci-profile-main">
      <h3>${escapeHtml(item.name)}</h3>
      <p>${characterInventoryText(item.description)}</p>
      ${item.tags ? `<div class="ci-tag-line">${escapeHtml(item.tags)}</div>` : ''}
    </div>
    <div class="ci-profile-radar">${buildCharacterInventoryRadar(item.attributes)}</div>`;
}

function buildCharacterInventoryItemEditModal(item) {
  const imageValue = item.image || (/^https?:\/\//i.test(String(item.icon || '')) ? item.icon : '');
  return `
    <article class="ci-profile-modal ci-profile-modal-editing" data-ci-editing-item="${escapeHtml(item.id)}">
      <button class="ci-modal-close" type="button" data-ci-action="close-profile">x</button>
      <div class="ci-profile-media">
        ${buildCharacterInventoryImage(item.image || item.icon, item.name, 'ci-profile-image', '*', {
          format: item.imageFormat || 'square',
          fit: item.imageFit || 'contain',
          position: item.imagePosition || 'center'
        })}
        <div class="ci-box ci-modal-info-preview">${buildCharacterInventoryInfoRows(item.infoRows)}</div>
      </div>
      <div class="ci-modal-edit-form">
        <h3>${escapeHtml(item.name)}</h3>
        <label><span>Name</span><input type="text" data-ci-modal-field="name" value="${escapeHtml(item.name)}"></label>
        <label><span>Typ</span><input type="text" data-ci-modal-field="type" value="${escapeHtml(item.type)}"></label>
        <label><span>Bild-URL</span><input type="url" data-ci-modal-field="image" value="${escapeHtml(imageValue)}" placeholder="https://..."></label>
        ${buildCharacterInventoryModalImageSettings(item, { format: 'square', fit: 'contain', position: 'center' })}
        <label><span>Tags</span><input type="text" data-ci-modal-field="tags" value="${escapeHtml(item.tags)}"></label>
        <label class="wide"><span>Beschreibung</span><textarea data-ci-modal-field="description">${escapeHtml(item.description)}</textarea></label>
        <label><span>Handelspreis je Stück · KT</span><input type="number" min="0" step="0.01" data-ci-modal-field="priceMin" value="${escapeHtml(item.valuation?.minCopper ?? '')}" placeholder="Preis offen"></label>
        <label><span>Bis · KT (optional)</span><input type="number" min="0" step="0.01" data-ci-modal-field="priceMax" value="${escapeHtml(item.valuation?.maxCopper ?? '')}"></label>
        <label class="wide"><span>Preisgrundlage</span><textarea data-ci-modal-field="valuationNote">${escapeHtml(item.valuationNote || '')}</textarea></label>
        <section>
          <div class="ci-modal-edit-head"><strong>Infotabelle</strong><button type="button" data-ci-action="add-item-info-row">+ Zeile</button></div>
          <div class="ci-modal-edit-list" data-ci-modal-info-list>${buildCharacterInventoryModalInfoRowsEditor(item.infoRows)}</div>
        </section>
        <section>
          <div class="ci-modal-edit-head"><strong>Diagramm</strong><button type="button" data-ci-action="add-item-attribute-row">+ Wert</button></div>
          <div class="ci-modal-edit-list" data-ci-modal-attribute-list>${buildCharacterInventoryModalAttributeEditor(item.attributes)}</div>
        </section>
        <div class="ci-modal-actions">
          <button type="button" data-ci-action="cancel-item-edit">Abbrechen</button>
          <button type="button" data-ci-action="save-item-local">Im Charakter speichern</button>
          <button type="button" data-ci-action="save-item-global">Im Item-Verzeichnis speichern</button>
        </div>
      </div>
      <div class="ci-modal-live-preview" aria-live="polite">
        ${buildCharacterInventoryItemPreview(item)}
      </div>
    </article>`;
}

function buildCharacterInventoryCompanionPreview(companion) {
  return `
    <div class="ci-profile-main">
      <h3>${escapeHtml(companion.name)}</h3>
      <div class="ci-box">${buildCharacterInventoryInfoRows(companion.infoRows)}</div>
      <p>${characterInventoryText(companion.description)}</p>
    </div>
    <div class="ci-profile-radar">${buildCharacterInventoryRadar(companion.attributes)}</div>`;
}

function buildCharacterInventoryCompanionEditModal(companion) {
  return `
    <article class="ci-profile-modal ci-profile-modal-editing companion" data-ci-editing-companion="${escapeHtml(companion.id)}">
      <button class="ci-modal-close" type="button" data-ci-action="close-profile">x</button>
      <div class="ci-profile-media">
        ${buildCharacterInventoryImage(companion.image, companion.name, 'ci-profile-image', getInitialChar(companion.name), {
          format: companion.imageFormat || 'portrait',
          fit: companion.imageFit || 'cover',
          position: companion.imagePosition || 'top'
        })}
        <p class="ci-modal-summary-preview">${characterInventoryText(companion.summary)}</p>
        <div class="ci-box ci-modal-info-preview">${buildCharacterInventoryInfoRows(companion.infoRows)}</div>
      </div>
      <div class="ci-modal-edit-form">
        <h3>${escapeHtml(companion.name)}</h3>
        <label><span>Name</span><input type="text" data-ci-modal-field="name" value="${escapeHtml(companion.name)}"></label>
        <label><span>Art / Spezies</span><input type="text" data-ci-modal-field="species" value="${escapeHtml(companion.species)}"></label>
        <label><span>Rolle</span><input type="text" data-ci-modal-field="role" value="${escapeHtml(companion.role)}"></label>
        <label><span>Status</span><input type="text" data-ci-modal-field="status" value="${escapeHtml(companion.status)}"></label>
        <label><span>Statusfarbe</span><input type="text" data-ci-modal-field="statusColor" value="${escapeHtml(companion.statusColor)}"></label>
        <label><span>Bild-URL</span><input type="url" data-ci-modal-field="image" value="${escapeHtml(companion.image)}" placeholder="https://..."></label>
        ${buildCharacterInventoryModalImageSettings(companion, { format: 'portrait', fit: 'cover', position: 'top' })}
        <label class="wide"><span>Kurztext</span><textarea data-ci-modal-field="summary">${escapeHtml(companion.summary)}</textarea></label>
        <label class="wide"><span>Beschreibung</span><textarea data-ci-modal-field="description">${escapeHtml(companion.description)}</textarea></label>
        <section>
          <div class="ci-modal-edit-head"><strong>Infotabelle</strong><button type="button" data-ci-action="add-companion-info-row">+ Zeile</button></div>
          <div class="ci-modal-edit-list" data-ci-modal-info-list>${buildCharacterInventoryModalInfoRowsEditor(companion.infoRows, 'companion')}</div>
        </section>
        <section>
          <div class="ci-modal-edit-head"><strong>Diagramm</strong><button type="button" data-ci-action="add-companion-attribute-row">+ Wert</button></div>
          <div class="ci-modal-edit-list" data-ci-modal-attribute-list>${buildCharacterInventoryModalAttributeEditor(companion.attributes, 'companion')}</div>
        </section>
        <div class="ci-modal-actions">
          <button type="button" data-ci-action="cancel-companion-edit">Abbrechen</button>
          <button type="button" data-ci-action="save-companion-profile">Gefährtenprofil speichern</button>
        </div>
      </div>
      <div class="ci-modal-live-preview" aria-live="polite">
        ${buildCharacterInventoryCompanionPreview(companion)}
      </div>
    </article>`;
}
