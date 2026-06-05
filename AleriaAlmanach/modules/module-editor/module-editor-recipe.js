function buildRecipeIconRows(items = [], listName = 'ingredients') {
  const configs = {
    ingredients: {
      rowClass: 'module-recipe-ingredient-row',
      fallback: { icon: '', title: 'Zutat', amount: 'Menge' },
      fields: [
        ['icon', 'Icon-URL', 'url'],
        ['title', 'Zutat', 'text'],
        ['amount', 'Menge', 'text']
      ]
    },
    equipment: {
      rowClass: 'module-recipe-equipment-row',
      fallback: { icon: '', title: 'Ausrüstung' },
      fields: [
        ['icon', 'Icon-URL', 'url'],
        ['title', 'Ausrüstung', 'text']
      ]
    },
    steps: {
      rowClass: 'module-recipe-step-row',
      fallback: { icon: '', title: 'Arbeitsschritt', text: 'Beschreibe den Ablauf.', duration: '5 Min.', note: '' },
      fields: [
        ['icon', 'Icon-URL', 'url'],
        ['title', 'Schritt-Titel', 'text'],
        ['duration', 'Dauer', 'text'],
        ['text', 'Beschreibung', 'textarea'],
        ['note', 'Hinweis / Warnung', 'text']
      ]
    },
    warnings: {
      rowClass: 'module-recipe-warning-row',
      fallback: { icon: '', title: 'Warnung', text: 'Hinweistext' },
      fields: [
        ['icon', 'Icon-URL', 'url'],
        ['title', 'Titel', 'text'],
        ['text', 'Text', 'textarea']
      ]
    },
    properties: {
      rowClass: 'module-recipe-property-row',
      fallback: { icon: '', title: 'Eigenschaft', value: '+' },
      fields: [
        ['icon', 'Icon-URL', 'url'],
        ['title', 'Eigenschaft', 'text'],
        ['value', 'Wert / Stufe', 'text']
      ]
    },
    variants: {
      rowClass: 'module-recipe-variant-row',
      fallback: { icon: '', title: 'Variante', description: 'Beschreibung', additions: '-', effect: 'Geänderter Effekt' },
      fields: [
        ['icon', 'Icon-URL', 'url'],
        ['title', 'Variante', 'text'],
        ['description', 'Beschreibung', 'text'],
        ['additions', 'Zusätzliche Zutaten / Änderungen', 'textarea'],
        ['effect', 'Geänderter Effekt', 'textarea']
      ]
    }
  };
  const config = configs[listName] || configs.ingredients;
  const rows = Array.isArray(items) && items.length ? items : [config.fallback];
  return rows.map(item => `
    <div class="recipe-edit-row ${config.rowClass}">
      ${config.fields.map(([field, placeholder, type]) => {
        const value = escapeHtml(item?.[field] || '');
        const className = `me-recipe-${listName}-${field}`;
        if (type === 'textarea') {
          return `<textarea class="inline-edit-textarea ${className}" placeholder="${escapeHtml(placeholder)}">${value}</textarea>`;
        }
        return `<input class="inline-edit-input ${className}" type="${type}" value="${value}" placeholder="${escapeHtml(placeholder)}">`;
      }).join('')}
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-recipe-row">Löschen</button>
    </div>`).join('');
}

function collectRecipeIconRows(card, listName, fields) {
  const singular = {
    ingredients: 'ingredient',
    equipment: 'equipment',
    steps: 'step',
    warnings: 'warning',
    properties: 'property',
    variants: 'variant'
  }[listName] || listName.replace(/s$/, '');
  return Array.from(card.querySelectorAll(`.module-recipe-${singular}-row`)).map(row => {
    const item = {};
    fields.forEach(field => {
      item[field] = getTrimmedFormValue(row, `.me-recipe-${listName}-${field}`);
    });
    return item;
  }).filter(item => fields.some(field => item[field]));
}

function addModuleRecipeRow(button, listName) {
  const pageCard = button.closest('.module-page-card');
  const wrap = pageCard?.querySelector(`.module-recipe-${listName}`);
  if (!wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildRecipeIconRows([], listName));
  hydrateModuleRichEditors(wrap.lastElementChild || wrap);
  syncModuleJsonPreview();
}

function removeModuleRecipeRow(button) {
  const row = button.closest('.recipe-edit-row');
  const wrap = row?.parentElement;
  if (!row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.recipe-edit-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Einträge vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function buildRecipeModuleEditorFields(page) {
  const recipe = sanitizeRecipeData(page?.recipe || {});
  return `
      <div class="module-page-type-block${inferModulePageType(page) === 'recipe' ? ' visible' : ''}" data-page-type="recipe">
        <div class="module-editor-grid">
          <div class="module-editor-field wide">
            <label>Beschreibung</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-recipe-description">${escapeHtml(page?.description || '')}</textarea>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Kopfdaten / Stats</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-biography-stat-row">+ Zeile</button>
            </div>
            <div class="inline-stat-editor module-biography-stats">
              ${buildModuleBiographyStatRows(page?.stats || [])}
            </div>
          </div>
          <div class="module-editor-field">
            <label>Archivzeile</label>
            <input type="text" class="me-recipe-archive-label" value="${escapeHtml(recipe.archiveLabel)}">
          </div>
          <div class="module-editor-field">
            <label>Dokumenttyp</label>
            <input type="text" class="me-recipe-document-kind" value="${escapeHtml(recipe.documentKind)}">
          </div>
          <div class="module-editor-field">
            <label>Kategorie</label>
            <input type="text" class="me-recipe-category" value="${escapeHtml(recipe.category)}">
          </div>
          <div class="module-editor-field">
            <label>Schwierigkeit</label>
            <input type="text" class="me-recipe-difficulty" value="${escapeHtml(recipe.difficulty)}">
          </div>
          <div class="module-editor-field">
            <label>Dauer</label>
            <input type="text" class="me-recipe-duration" value="${escapeHtml(recipe.duration)}">
          </div>
          <div class="module-editor-field">
            <label>Ergebnis</label>
            <input type="text" class="me-recipe-result" value="${escapeHtml(recipe.result)}">
          </div>
          <div class="module-editor-field wide">
            <label>Wirkung / Zweck</label>
            <textarea class="me-recipe-effect small">${escapeHtml(recipe.effect)}</textarea>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Zutaten</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-recipe-row" data-recipe-list="ingredients">+ Zutat</button>
            </div>
            <input type="text" class="me-recipe-ingredients-title" value="${escapeHtml(recipe.ingredientsTitle)}">
            <div class="recipe-edit-list module-recipe-ingredients">
              ${buildRecipeIconRows(recipe.ingredients, 'ingredients')}
            </div>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Ausrüstung</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-recipe-row" data-recipe-list="equipment">+ Ausrüstung</button>
            </div>
            <input type="text" class="me-recipe-equipment-title" value="${escapeHtml(recipe.equipmentTitle)}">
            <div class="recipe-edit-list module-recipe-equipment">
              ${buildRecipeIconRows(recipe.equipment, 'equipment')}
            </div>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Schritte / Ablauf</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-recipe-row" data-recipe-list="steps">+ Schritt</button>
            </div>
            <input type="text" class="me-recipe-steps-title" value="${escapeHtml(recipe.stepsTitle)}">
            <div class="recipe-edit-list module-recipe-steps">
              ${buildRecipeIconRows(recipe.steps, 'steps')}
            </div>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Hinweise & Warnungen</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-recipe-row" data-recipe-list="warnings">+ Warnung</button>
            </div>
            <input type="text" class="me-recipe-warnings-title" value="${escapeHtml(recipe.warningsTitle)}">
            <div class="recipe-edit-list module-recipe-warnings">
              ${buildRecipeIconRows(recipe.warnings, 'warnings')}
            </div>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Eigenschaften</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-recipe-row" data-recipe-list="properties">+ Eigenschaft</button>
            </div>
            <input type="text" class="me-recipe-properties-title" value="${escapeHtml(recipe.propertiesTitle)}">
            <div class="recipe-edit-list module-recipe-properties">
              ${buildRecipeIconRows(recipe.properties, 'properties')}
            </div>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Varianten</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-recipe-row" data-recipe-list="variants">+ Variante</button>
            </div>
            <input type="text" class="me-recipe-variants-title" value="${escapeHtml(recipe.variantsTitle)}">
            <div class="recipe-edit-list module-recipe-variants">
              ${buildRecipeIconRows(recipe.variants, 'variants')}
            </div>
          </div>
          <div class="module-editor-field">
            <label>Notiz-Überschrift</label>
            <input type="text" class="me-recipe-master-note-title" value="${escapeHtml(recipe.masterNoteTitle)}">
          </div>
          <div class="module-editor-field">
            <label>Fußzeile</label>
            <input type="text" class="me-recipe-footer" value="${escapeHtml(recipe.footer)}">
          </div>
          <div class="module-editor-field wide">
            <label>Notiz des Meisters</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-recipe-master-note">${escapeHtml(recipe.masterNote)}</textarea>
          </div>
          <div class="module-editor-field wide">
            <label>Zitat</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-recipe-quote small">${escapeHtml(page?.quote || '')}</textarea>
          </div>
          <div class="module-editor-field">
            <label>Zitat von</label>
            <input type="text" class="me-recipe-quote-by" value="${escapeHtml(page?.quoteBy || '')}">
          </div>
        </div>
      </div>`;
}

function collectRecipeModuleEditorPage(card, page) {
  const recipeBlock = card.querySelector('[data-page-type="recipe"]') || card;
  page.recipePage = true;
  page.description = getTrimmedFormValue(card, '.me-recipe-description');
  page.stats = collectModuleBiographyStats(recipeBlock);
  page.quote = getTrimmedFormValue(card, '.me-recipe-quote');
  page.quoteBy = getTrimmedFormValue(card, '.me-recipe-quote-by');
  page.recipe = sanitizeRecipeData({
    archiveLabel: getTrimmedFormValue(card, '.me-recipe-archive-label'),
    documentKind: getTrimmedFormValue(card, '.me-recipe-document-kind'),
    category: getTrimmedFormValue(card, '.me-recipe-category'),
    difficulty: getTrimmedFormValue(card, '.me-recipe-difficulty'),
    duration: getTrimmedFormValue(card, '.me-recipe-duration'),
    result: getTrimmedFormValue(card, '.me-recipe-result'),
    effect: getTrimmedFormValue(card, '.me-recipe-effect'),
    ingredientsTitle: getTrimmedFormValue(card, '.me-recipe-ingredients-title'),
    ingredients: collectRecipeIconRows(card, 'ingredients', ['icon', 'title', 'amount']),
    equipmentTitle: getTrimmedFormValue(card, '.me-recipe-equipment-title'),
    equipment: collectRecipeIconRows(card, 'equipment', ['icon', 'title']),
    stepsTitle: getTrimmedFormValue(card, '.me-recipe-steps-title'),
    steps: collectRecipeIconRows(card, 'steps', ['icon', 'title', 'text', 'duration', 'note']),
    warningsTitle: getTrimmedFormValue(card, '.me-recipe-warnings-title'),
    warnings: collectRecipeIconRows(card, 'warnings', ['icon', 'title', 'text']),
    propertiesTitle: getTrimmedFormValue(card, '.me-recipe-properties-title'),
    properties: collectRecipeIconRows(card, 'properties', ['icon', 'title', 'value']),
    variantsTitle: getTrimmedFormValue(card, '.me-recipe-variants-title'),
    variants: collectRecipeIconRows(card, 'variants', ['icon', 'title', 'description', 'additions', 'effect']),
    masterNoteTitle: getTrimmedFormValue(card, '.me-recipe-master-note-title'),
    masterNote: getTrimmedFormValue(card, '.me-recipe-master-note'),
    footer: getTrimmedFormValue(card, '.me-recipe-footer')
  });
  return page;
}
