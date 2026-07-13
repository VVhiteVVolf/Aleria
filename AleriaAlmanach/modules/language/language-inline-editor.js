function updateInlineLanguageData(mutator, { rerender = false } = {}) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = sanitizeLanguageData(page.language || {});
  mutator(data);
  page.languagePage = true;
  page.language = sanitizeLanguageData(data);
  if (rerender) renderPage(currentPage, 0);
  else scheduleInlineModuleLivePreviewRefresh();
}

function buildInlineLanguageLayerRows(layers = []) {
  return sanitizeLanguageAlphabetLayers(layers).map((layer, index) => `
    <section class="trade-editor-item inline-language-layer-row" data-language-layer-index="${index}">
      <div class="trade-editor-item-head compact"><div><span>Ebene ${index + 1}</span><small>Alphabetbild und Beschriftung</small></div></div>
      <div class="trade-editor-grid">
        <label><span>Schaltfläche</span><input class="inline-edit-input" type="text" value="${escapeHtml(layer.label)}" data-language-inline-layer-field="label"></label>
        <label class="wide"><span>Bild-URL</span><input class="inline-edit-input" type="url" value="${escapeHtml(layer.image)}" data-language-inline-layer-field="image"></label>
        <label><span>Alternativtext</span><input class="inline-edit-input" type="text" value="${escapeHtml(layer.alt)}" data-language-inline-layer-field="alt"></label>
        <label class="wide"><span>Bildunterschrift</span><textarea class="inline-edit-textarea" data-language-inline-layer-field="caption">${escapeHtml(layer.caption)}</textarea></label>
      </div>
    </section>`).join('');
}

function buildInlineLanguageSectionRows(sections = []) {
  return sanitizeLanguageDescriptionSections(sections).map((section, index) => `
    <section class="trade-editor-item inline-language-section-row" data-language-section-index="${index}">
      <div class="trade-editor-item-head compact">
        <div><span>Textabschnitt ${index + 1}</span><small>Unterhalb des Alphabets</small></div>
        <div class="module-page-actions">
          <button class="module-editor-mini-btn" type="button" data-language-inline-action="move-section" data-language-direction="-1">Hoch</button>
          <button class="module-editor-mini-btn" type="button" data-language-inline-action="move-section" data-language-direction="1">Runter</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-language-inline-action="remove-section">Löschen</button>
        </div>
      </div>
      <div class="trade-editor-grid">
        <label><span>Überschrift</span><input class="inline-edit-input" type="text" value="${escapeHtml(section.title)}" data-language-inline-section-field="title"></label>
        <label class="wide"><span>Beschreibung</span>${typeof buildTextFormatToolbar === 'function' ? buildTextFormatToolbar() : ''}<textarea class="inline-edit-textarea" data-language-inline-section-field="text">${escapeHtml(section.text)}</textarea></label>
      </div>
    </section>`).join('');
}

function buildInlineLanguageEditor(page) {
  const data = sanitizeLanguageData(page.language || {});
  const field = (label, key, value) => `<div class="inline-edit-field"><span class="inline-edit-label">${escapeHtml(label)}</span><input class="inline-edit-input" type="text" value="${escapeHtml(value)}" data-language-inline-field="${escapeHtml(key)}"></div>`;
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Sprachen-Template</div>
      <div class="inline-edit-grid">
        ${field('Archivzeile', 'archiveLabel', data.archiveLabel)}
        ${field('Eigenname / Schriftname', 'nativeName', data.nativeName)}
        ${field('Sprachfamilie', 'family', data.family)}
        ${field('Sprecher', 'speakers', data.speakers)}
        ${field('Verbreitung', 'regions', data.regions)}
        ${field('Schrifttyp', 'scriptType', data.scriptType)}
        ${field('Schreibrichtung', 'writingDirection', data.writingDirection)}
        ${field('Alphabet-Überschrift', 'alphabetTitle', data.alphabetTitle)}
        <div class="inline-edit-field wide"><span class="inline-edit-label">Kurze Einordnung</span>${typeof buildTextFormatToolbar === 'function' ? buildTextFormatToolbar() : ''}<textarea class="inline-edit-textarea" data-language-inline-field="introduction">${escapeHtml(data.introduction)}</textarea></div>
        <div class="inline-edit-field wide"><span class="inline-edit-label">Alphabet-Ebenen</span><div class="trade-editor-list">${buildInlineLanguageLayerRows(data.alphabetLayers)}</div></div>
        <div class="inline-edit-field wide">
          <div class="module-editor-inline" style="justify-content:space-between;"><span class="inline-edit-label">Beschreibungen</span><button class="module-editor-mini-btn" type="button" data-language-inline-action="add-section">+ Abschnitt</button></div>
          <div class="trade-editor-list">${buildInlineLanguageSectionRows(data.sections)}</div>
        </div>
        ${field('Fußzeile', 'footer', data.footer)}
      </div>
    </div>`;
}

function handleInlineLanguageField(event) {
  const field = event.target;
  if (!field?.closest?.('.inline-module-edit-pane')) return;

  const rootField = field.dataset.languageInlineField;
  if (rootField) {
    updateInlineLanguageData(data => { data[rootField] = field.value; });
    return;
  }

  const layerField = field.dataset.languageInlineLayerField;
  if (layerField) {
    const index = Number(field.closest('[data-language-layer-index]')?.dataset.languageLayerIndex || -1);
    if (index < 0) return;
    updateInlineLanguageData(data => { data.alphabetLayers[index][layerField] = field.value; });
    return;
  }

  const sectionField = field.dataset.languageInlineSectionField;
  if (sectionField) {
    const index = Number(field.closest('[data-language-section-index]')?.dataset.languageSectionIndex || -1);
    if (index < 0) return;
    updateInlineLanguageData(data => { data.sections[index][sectionField] = field.value; });
  }
}

document.addEventListener('input', handleInlineLanguageField);
document.addEventListener('change', handleInlineLanguageField);

document.addEventListener('click', event => {
  const button = event.target?.closest?.('[data-language-inline-action]');
  if (!button?.closest?.('.inline-module-edit-pane')) return;
  event.preventDefault();
  const action = button.dataset.languageInlineAction;
  if (action === 'add-section') {
    updateInlineLanguageData(data => {
      if (data.sections.length < LANGUAGE_DESCRIPTION_SECTION_LIMIT) data.sections.push({ title: 'Neue Überschrift', text: '' });
    }, { rerender: true });
    return;
  }
  const index = Number(button.closest('[data-language-section-index]')?.dataset.languageSectionIndex || -1);
  if (index < 0) return;
  if (action === 'remove-section') {
    updateInlineLanguageData(data => { data.sections.splice(index, 1); }, { rerender: true });
    return;
  }
  if (action === 'move-section') {
    const targetIndex = index + Number(button.dataset.languageDirection || 0);
    updateInlineLanguageData(data => {
      if (targetIndex < 0 || targetIndex >= data.sections.length) return;
      const [section] = data.sections.splice(index, 1);
      data.sections.splice(targetIndex, 0, section);
    }, { rerender: true });
  }
});
