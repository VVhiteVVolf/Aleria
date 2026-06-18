function buildMapTemplateSelect(label, field, value, index, mode, options = []) {
  return `
    <label>
      <span>${escapeHtml(label)}</span>
      <select class="inline-edit-select ${mode === 'module' ? `me-map-tab-${field}` : ''}" ${mode === 'inline' ? `data-inline-action="update-map-template-tab-field" data-map-tab-index="${index}" data-map-tab-field="${escapeHtml(field)}"` : ''}>
        ${options.map(option => `<option value="${escapeHtml(option.value)}"${String(value || '') === option.value ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}
      </select>
    </label>`;
}

function buildMapTemplateInput(label, field, value, index, mode, type = 'text') {
  const rangeAttrs = field === 'imageScale' ? ' min="35" max="240" step="1"' : '';
  return `
    <label>
      <span>${escapeHtml(label)}</span>
      <input class="inline-edit-input ${mode === 'module' ? `me-map-tab-${field}` : ''}" type="${escapeHtml(type)}"${rangeAttrs} value="${escapeHtml(value || '')}" ${mode === 'inline' ? `data-inline-action="update-map-template-tab-field" data-map-tab-index="${index}" data-map-tab-field="${escapeHtml(field)}"` : ''}>
    </label>`;
}

function buildMapTemplateTabRows(tabs = [], mode = 'module') {
  return tabs.map((tab, index) => `
    <section class="trade-editor-item map-template-editor-tab ${mode === 'module' ? 'module-map-template-tab-row' : 'inline-map-template-tab-row'}">
      <div class="trade-editor-item-head compact">
        <div>
          <span>Reiter ${index + 1}</span>
          <small>Bild, Klickziel und Darstellung fuer diese Karte.</small>
        </div>
      </div>
      <div class="trade-editor-grid">
        ${buildMapTemplateInput('Reitername', 'label', tab.label, index, mode)}
        ${buildMapTemplateInput('Bild-URL', 'image', tab.image, index, mode, 'url')}
        ${buildMapTemplateInput('Klickziel / Seitenlink', 'imageLink', tab.imageLink, index, mode)}
        ${buildMapTemplateSelect('Bildformat', 'imageFormat', tab.imageFormat, index, mode, [
          { value: 'free', label: 'Freie Flaeche' },
          { value: 'landscape', label: 'Querformat' },
          { value: 'portrait', label: 'Hochformat' },
          { value: 'square', label: 'Quadrat' }
        ])}
        ${buildMapTemplateSelect('Bildfuelle', 'imageFit', tab.imageFit, index, mode, [
          { value: 'contain', label: 'Ganzes Bild' },
          { value: 'cover', label: 'Fuellen / croppen' }
        ])}
        ${buildMapTemplateSelect('Ausschnitt', 'imagePosition', tab.imagePosition, index, mode, [
          { value: 'center', label: 'Mitte' },
          { value: 'top', label: 'Oben' },
          { value: 'bottom', label: 'Unten' },
          { value: 'left', label: 'Links' },
          { value: 'right', label: 'Rechts' }
        ])}
        ${buildMapTemplateInput('Skalierung %', 'imageScale', tab.imageScale, index, mode, 'range')}
      </div>
    </section>`).join('');
}

function buildMapTemplateSectionRows(sections = [], mode = 'module') {
  return sections.map((section, index) => `
    <div class="trade-editor-item map-template-editor-section ${mode === 'module' ? 'module-map-template-section-row' : 'inline-map-template-section-row'}">
      <div class="trade-editor-grid">
        <label>
          <span>Ueberschrift ${index + 1}</span>
          <input class="inline-edit-input ${mode === 'module' ? 'me-map-section-title' : ''}" type="text" value="${escapeHtml(section.title || '')}" ${mode === 'inline' ? `data-inline-action="update-map-template-section-field" data-map-section-index="${index}" data-map-section-field="title"` : ''}>
        </label>
        <label class="wide">
          <span>Text ${index + 1}</span>
          <textarea class="inline-edit-textarea ${mode === 'module' ? 'me-map-section-text' : ''}" ${mode === 'inline' ? `data-inline-action="update-map-template-section-field" data-map-section-index="${index}" data-map-section-field="text"` : ''}>${escapeHtml(section.text || '')}</textarea>
        </label>
      </div>
    </div>`).join('');
}

function collectMapTemplateTabs(block) {
  return Array.from(block.querySelectorAll('.module-map-template-tab-row')).map(row => ({
    label: getTrimmedFormValue(row, '.me-map-tab-label'),
    image: getTrimmedFormValue(row, '.me-map-tab-image'),
    imageLink: getTrimmedFormValue(row, '.me-map-tab-imageLink'),
    imageFormat: getTrimmedFormValue(row, '.me-map-tab-imageFormat'),
    imageFit: getTrimmedFormValue(row, '.me-map-tab-imageFit'),
    imagePosition: getTrimmedFormValue(row, '.me-map-tab-imagePosition'),
    imageScale: getTrimmedFormValue(row, '.me-map-tab-imageScale')
  }));
}

function collectMapTemplateSections(block) {
  return Array.from(block.querySelectorAll('.module-map-template-section-row')).map(row => ({
    title: getTrimmedFormValue(row, '.me-map-section-title'),
    text: getTrimmedFormValue(row, '.me-map-section-text')
  }));
}

function buildMapTemplateModuleEditorFields(page) {
  const data = sanitizeMapTemplateData(page?.mapTemplate || {});
  return `
    <div class="module-page-type-block${inferModulePageType(page) === 'map-template' ? ' visible' : ''}" data-page-type="map-template">
      <div class="module-editor-grid">
        <div class="module-editor-field wide">
          <div class="module-editor-kicker">KartenTemplate</div>
          <div class="module-editor-help">Bis zu drei Kartenreiter. Jeder Reiter besitzt eigenes Bild, eigene Skalierung und ein eigenes Klickziel.</div>
        </div>
        <div class="module-editor-field wide">
          <label>Kartenreiter</label>
          <div class="trade-editor-list module-map-template-tabs">${buildMapTemplateTabRows(data.tabs, 'module')}</div>
        </div>
        <div class="module-editor-field wide">
          <label>Rechte Seitenleiste</label>
          <div class="trade-editor-list module-map-template-sections">${buildMapTemplateSectionRows(data.sections, 'module')}</div>
        </div>
      </div>
    </div>`;
}

function collectMapTemplateModuleEditorPage(card, page) {
  const block = card.querySelector('[data-page-type="map-template"]') || card;
  page.mapTemplatePage = true;
  page.mapTemplate = sanitizeMapTemplateData({
    tabs: collectMapTemplateTabs(block),
    sections: collectMapTemplateSections(block)
  });
  return page;
}
