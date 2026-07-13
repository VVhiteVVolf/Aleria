function buildLanguageModuleLayerRows(layers = []) {
  return sanitizeLanguageAlphabetLayers(layers).map((layer, index) => `
    <section class="trade-editor-item language-module-layer-row">
      <div class="trade-editor-item-head compact">
        <div>
          <span>Ebene ${index + 1}</span>
          <small>Ein zentrales Alphabetbild mit eigener Beschriftung.</small>
        </div>
      </div>
      <div class="trade-editor-grid">
        <label>
          <span>Schaltfläche</span>
          <input class="inline-edit-input me-language-layer-label" type="text" value="${escapeHtml(layer.label)}" placeholder="Ebene ${index + 1}">
        </label>
        <label class="wide">
          <span>Bild-URL</span>
          <input class="inline-edit-input me-language-layer-image" type="url" value="${escapeHtml(layer.image)}" placeholder="https://i.imgur.com/...">
        </label>
        <label>
          <span>Alternativtext</span>
          <input class="inline-edit-input me-language-layer-alt" type="text" value="${escapeHtml(layer.alt)}" placeholder="Beschreibung des Alphabetbilds">
        </label>
        <label class="wide">
          <span>Bildunterschrift</span>
          <textarea class="inline-edit-textarea me-language-layer-caption">${escapeHtml(layer.caption)}</textarea>
        </label>
      </div>
    </section>`).join('');
}

function buildLanguageModuleSectionRows(sections = []) {
  return sanitizeLanguageDescriptionSections(sections).map((section, index) => `
    <section class="trade-editor-item language-module-section-row">
      <div class="trade-editor-item-head compact">
        <div>
          <span>Textabschnitt ${index + 1}</span>
          <small>Wird unterhalb des Alphabets dargestellt.</small>
        </div>
        <div class="module-page-actions">
          <button class="module-editor-mini-btn" type="button" data-language-module-action="move-section" data-language-direction="-1" aria-label="Abschnitt nach oben verschieben">Hoch</button>
          <button class="module-editor-mini-btn" type="button" data-language-module-action="move-section" data-language-direction="1" aria-label="Abschnitt nach unten verschieben">Runter</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-language-module-action="remove-section">Löschen</button>
        </div>
      </div>
      <div class="trade-editor-grid">
        <label>
          <span>Überschrift</span>
          <input class="inline-edit-input me-language-section-title" type="text" value="${escapeHtml(section.title)}">
        </label>
        <label class="wide">
          <span>Beschreibung</span>
          ${typeof buildTextFormatToolbar === 'function' ? buildTextFormatToolbar() : ''}
          <textarea class="inline-edit-textarea me-language-section-text">${escapeHtml(section.text)}</textarea>
        </label>
      </div>
    </section>`).join('');
}

function collectLanguageModuleLayers(block) {
  return Array.from(block.querySelectorAll('.language-module-layer-row')).map(row => ({
    label: getTrimmedFormValue(row, '.me-language-layer-label'),
    image: getTrimmedFormValue(row, '.me-language-layer-image'),
    alt: getTrimmedFormValue(row, '.me-language-layer-alt'),
    caption: getTrimmedFormValue(row, '.me-language-layer-caption')
  }));
}

function collectLanguageModuleSections(block) {
  return Array.from(block.querySelectorAll('.language-module-section-row')).map(row => ({
    title: getTrimmedFormValue(row, '.me-language-section-title'),
    text: getTrimmedFormValue(row, '.me-language-section-text')
  }));
}

function buildLanguageModuleEditorFields(page) {
  const data = sanitizeLanguageData(page?.language || {});
  return `
    <div class="module-page-type-block${inferModulePageType(page) === 'language' ? ' visible' : ''}" data-page-type="language">
      <div class="module-editor-grid">
        <div class="module-editor-field wide">
          <div class="module-editor-kicker">Sprachen-Template</div>
          <div class="module-editor-help">Das Alphabet steht als zentrales Bild im Mittelpunkt. Hinterlegte Bilder werden automatisch als Ebene 1 bis 3 schaltbar.</div>
        </div>
        <div class="module-editor-field"><label>Archivzeile</label><input class="me-language-archive-label" type="text" value="${escapeHtml(data.archiveLabel)}"></div>
        <div class="module-editor-field"><label>Eigenname / Schriftname</label><input class="me-language-native-name" type="text" value="${escapeHtml(data.nativeName)}"></div>
        <div class="module-editor-field"><label>Sprachfamilie</label><input class="me-language-family" type="text" value="${escapeHtml(data.family)}"></div>
        <div class="module-editor-field"><label>Sprecher</label><input class="me-language-speakers" type="text" value="${escapeHtml(data.speakers)}"></div>
        <div class="module-editor-field"><label>Verbreitung</label><input class="me-language-regions" type="text" value="${escapeHtml(data.regions)}"></div>
        <div class="module-editor-field"><label>Schrifttyp</label><input class="me-language-script-type" type="text" value="${escapeHtml(data.scriptType)}"></div>
        <div class="module-editor-field"><label>Schreibrichtung</label><input class="me-language-writing-direction" type="text" value="${escapeHtml(data.writingDirection)}"></div>
        <div class="module-editor-field"><label>Alphabet-Überschrift</label><input class="me-language-alphabet-title" type="text" value="${escapeHtml(data.alphabetTitle)}"></div>
        <div class="module-editor-field wide">
          <label>Kurze Einordnung</label>
          ${typeof buildTextFormatToolbar === 'function' ? buildTextFormatToolbar() : ''}
          <textarea class="me-language-introduction">${escapeHtml(data.introduction)}</textarea>
        </div>
        <div class="module-editor-field wide">
          <label>Alphabet-Ebenen</label>
          <div class="module-editor-help">Es erscheinen nur Ebenen mit Bild. Ist noch kein Bild eingetragen, zeigt die Vorschau einen Platzhalter für Ebene 1.</div>
          <div class="trade-editor-list language-module-layers">${buildLanguageModuleLayerRows(data.alphabetLayers)}</div>
        </div>
        <div class="module-editor-field wide">
          <div class="module-editor-inline" style="justify-content:space-between;">
            <label>Beschreibungen unter dem Alphabet</label>
            <button class="module-editor-mini-btn" type="button" data-language-module-action="add-section">+ Abschnitt</button>
          </div>
          <div class="trade-editor-list language-module-sections">${buildLanguageModuleSectionRows(data.sections)}</div>
        </div>
        <div class="module-editor-field wide"><label>Fußzeile</label><input class="me-language-footer" type="text" value="${escapeHtml(data.footer)}"></div>
      </div>
    </div>`;
}

function collectLanguageModuleEditorPage(card, page) {
  const block = card.querySelector('[data-page-type="language"]') || card;
  page.languagePage = true;
  page.language = sanitizeLanguageData({
    archiveLabel: getTrimmedFormValue(block, '.me-language-archive-label'),
    nativeName: getTrimmedFormValue(block, '.me-language-native-name'),
    family: getTrimmedFormValue(block, '.me-language-family'),
    speakers: getTrimmedFormValue(block, '.me-language-speakers'),
    regions: getTrimmedFormValue(block, '.me-language-regions'),
    scriptType: getTrimmedFormValue(block, '.me-language-script-type'),
    writingDirection: getTrimmedFormValue(block, '.me-language-writing-direction'),
    alphabetTitle: getTrimmedFormValue(block, '.me-language-alphabet-title'),
    introduction: getTrimmedFormValue(block, '.me-language-introduction'),
    alphabetLayers: collectLanguageModuleLayers(block),
    sections: collectLanguageModuleSections(block),
    footer: getTrimmedFormValue(block, '.me-language-footer')
  });
  return page;
}

function addLanguageModuleSection(button) {
  const wrap = button.closest('[data-page-type="language"]')?.querySelector('.language-module-sections');
  if (!wrap || wrap.children.length >= LANGUAGE_DESCRIPTION_SECTION_LIMIT) return;
  wrap.insertAdjacentHTML('beforeend', buildLanguageModuleSectionRows([{ title: 'Neue Überschrift', text: '' }]));
  syncModuleJsonPreview();
}

function removeLanguageModuleSection(button) {
  const row = button.closest('.language-module-section-row');
  if (!row) return;
  if (typeof captureModuleEditorUndoSnapshot === 'function') captureModuleEditorUndoSnapshot('Sprachabschnitt löschen');
  row.remove();
  syncModuleJsonPreview();
}

function moveLanguageModuleSection(button) {
  const row = button.closest('.language-module-section-row');
  const direction = Number(button.dataset.languageDirection || 0);
  const sibling = direction < 0 ? row?.previousElementSibling : row?.nextElementSibling;
  if (!row || !sibling) return;
  if (direction < 0) row.parentElement.insertBefore(row, sibling);
  else row.parentElement.insertBefore(sibling, row);
  syncModuleJsonPreview();
}

document.addEventListener('click', event => {
  const button = event.target?.closest?.('[data-language-module-action]');
  if (!button?.closest?.('#module-editor-overlay')) return;
  event.preventDefault();
  const action = button.dataset.languageModuleAction;
  if (action === 'add-section') addLanguageModuleSection(button);
  if (action === 'remove-section') removeLanguageModuleSection(button);
  if (action === 'move-section') moveLanguageModuleSection(button);
});
