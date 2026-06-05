// Inline editors for artifact and recipe module pages.
// Keeps specialized editor coverage next to the feature data it controls.

function buildInlineArtifactListRows(items = [], listName = 'properties') {
  const rows = Array.isArray(items) ? items : [];
  const placeholder = listName === 'risks' ? 'Risiko / Nebenwirkung' : 'Eigenschaft';
  return rows.length ? rows.map((item, index) => `
    <div class="inline-stat-row">
      <input
        class="inline-edit-input"
        type="text"
        data-inline-action="update-artifact-list-field"
        data-artifact-list="${escapeHtml(listName)}"
        data-artifact-index="${index}"
        value="${escapeHtml(item || '')}"
        placeholder="${placeholder}">
      <button
        class="module-editor-mini-btn module-editor-danger"
        type="button"
        data-inline-action="remove-artifact-list-row"
        data-artifact-list="${escapeHtml(listName)}"
        data-artifact-index="${index}">Loeschen</button>
    </div>`).join('') : '<div class="inline-placeholder-note">Noch keine Eintraege vorhanden.</div>';
}

function updateInlineArtifactField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const field = input.dataset.artifactField;
  if (!field) return;
  const current = sanitizeArtifactData(page.artifact || {});
  const value = String(input.value || '').trim();

  if (field === 'description') page.description = value;
  else if (field === 'quote') page.quote = value;
  else if (field === 'quoteBy') page.quoteBy = value;
  else current[field] = value;

  page.artifact = sanitizeArtifactData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineArtifactListRow(listName = '') {
  const page = getInlineDraftPage();
  if (!page) return;
  const safeList = listName === 'risks' ? 'risks' : 'properties';
  const current = sanitizeArtifactData(page.artifact || {});
  current[safeList] = Array.isArray(current[safeList]) ? current[safeList] : [];
  current[safeList].push(safeList === 'risks' ? 'Neues Risiko' : 'Neue Eigenschaft');
  page.artifact = sanitizeArtifactData(current);
  renderPage(currentPage, 0);
}

function removeInlineArtifactListRow(listName = '', index = 0) {
  const page = getInlineDraftPage();
  if (!page) return;
  const safeList = listName === 'risks' ? 'risks' : 'properties';
  const current = sanitizeArtifactData(page.artifact || {});
  current[safeList].splice(index, 1);
  page.artifact = sanitizeArtifactData(current);
  renderPage(currentPage, 0);
}

function updateInlineArtifactListField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const safeList = input.dataset.artifactList === 'risks' ? 'risks' : 'properties';
  const index = Number(input.dataset.artifactIndex || -1);
  if (index < 0) return;
  const current = sanitizeArtifactData(page.artifact || {});
  current[safeList][index] = String(input.value || '').trim();
  page.artifact = sanitizeArtifactData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function buildInlineArtifactEditor(page) {
  const artifact = sanitizeArtifactData(page.artifact || {});
  return `
    ${buildInlineStatsEditor(page)}
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Artefaktakte</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Archivzeile</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-artifact-field" data-artifact-field="archiveLabel" value="${escapeHtml(artifact.archiveLabel)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Klassifikation</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-artifact-field" data-artifact-field="classification" value="${escapeHtml(artifact.classification)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Herkunft</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-artifact-field" data-artifact-field="origin" value="${escapeHtml(artifact.origin)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Zustand</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-artifact-field" data-artifact-field="condition" value="${escapeHtml(artifact.condition)}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Verwahrung / Besitzer</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-artifact-field" data-artifact-field="keeper" value="${escapeHtml(artifact.keeper)}">
        </div>
      </div>
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Fund & Geschichte</div>
      <div class="inline-edit-grid single">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Fundumstaende</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-artifact-field" data-artifact-field="discovery">${escapeHtml(artifact.discovery)}</textarea>
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Geschichte-Ueberschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-artifact-field" data-artifact-field="historyTitle" value="${escapeHtml(artifact.historyTitle)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Geschichte</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-artifact-field" data-artifact-field="historyText">${escapeHtml(artifact.historyText)}</textarea>
        </div>
      </div>
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">Eigenschaften</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-artifact-list-row" data-artifact-list="properties">+ Eigenschaft</button>
      </div>
      <div class="inline-edit-field">
        <span class="inline-edit-label">Ueberschrift</span>
        <input class="inline-edit-input" type="text" data-inline-action="update-artifact-field" data-artifact-field="propertiesTitle" value="${escapeHtml(artifact.propertiesTitle)}">
      </div>
      <div class="inline-stat-editor">${buildInlineArtifactListRows(artifact.properties, 'properties')}</div>
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">Risiken</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-artifact-list-row" data-artifact-list="risks">+ Risiko</button>
      </div>
      <div class="inline-edit-field">
        <span class="inline-edit-label">Ueberschrift</span>
        <input class="inline-edit-input" type="text" data-inline-action="update-artifact-field" data-artifact-field="risksTitle" value="${escapeHtml(artifact.risksTitle)}">
      </div>
      <div class="inline-stat-editor">${buildInlineArtifactListRows(artifact.risks, 'risks')}</div>
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Zitat & Fusszeile</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Zitat</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-artifact-field" data-artifact-field="quote">${escapeHtml(page.quote || '')}</textarea>
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Zitat von</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-artifact-field" data-artifact-field="quoteBy" value="${escapeHtml(page.quoteBy || '')}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Fusszeile</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-artifact-field" data-artifact-field="footer" value="${escapeHtml(artifact.footer)}">
        </div>
      </div>
    </div>`;
}

function getInlineRecipeListConfig(listName = 'ingredients') {
  return {
    ingredients: {
      label: 'Zutaten',
      addLabel: 'Zutat',
      fallback: { icon: '', title: 'Zutat', amount: 'Menge' },
      fields: [
        ['icon', 'Icon-URL', 'url'],
        ['title', 'Zutat', 'text'],
        ['amount', 'Menge', 'text']
      ]
    },
    equipment: {
      label: 'Ausruestung',
      addLabel: 'Ausruestung',
      fallback: { icon: '', title: 'Ausruestung' },
      fields: [
        ['icon', 'Icon-URL', 'url'],
        ['title', 'Ausruestung', 'text']
      ]
    },
    steps: {
      label: 'Schritte',
      addLabel: 'Schritt',
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
      label: 'Hinweise & Warnungen',
      addLabel: 'Warnung',
      fallback: { icon: '', title: 'Warnung', text: 'Hinweistext' },
      fields: [
        ['icon', 'Icon-URL', 'url'],
        ['title', 'Titel', 'text'],
        ['text', 'Text', 'textarea']
      ]
    },
    properties: {
      label: 'Eigenschaften',
      addLabel: 'Eigenschaft',
      fallback: { icon: '', title: 'Eigenschaft', value: '+' },
      fields: [
        ['icon', 'Icon-URL', 'url'],
        ['title', 'Eigenschaft', 'text'],
        ['value', 'Wert / Stufe', 'text']
      ]
    },
    variants: {
      label: 'Varianten',
      addLabel: 'Variante',
      fallback: { icon: '', title: 'Variante', description: 'Beschreibung', additions: '-', effect: 'Geaenderter Effekt' },
      fields: [
        ['icon', 'Icon-URL', 'url'],
        ['title', 'Variante', 'text'],
        ['description', 'Beschreibung', 'text'],
        ['additions', 'Zusaetzliche Zutaten / Aenderungen', 'textarea'],
        ['effect', 'Geaenderter Effekt', 'textarea']
      ]
    }
  }[listName] || null;
}

function buildInlineRecipeRows(items = [], listName = 'ingredients') {
  const config = getInlineRecipeListConfig(listName);
  if (!config) return '';
  const rows = Array.isArray(items) ? items : [];
  return rows.length ? rows.map((item, index) => `
    <div class="recipe-edit-row">
      ${config.fields.map(([field, placeholder, type]) => {
        const value = escapeHtml(item?.[field] || '');
        const attrs = `data-inline-action="update-recipe-list-field" data-recipe-list="${escapeHtml(listName)}" data-recipe-index="${index}" data-recipe-field="${escapeHtml(field)}"`;
        if (type === 'textarea') {
          return `<textarea class="inline-edit-textarea" ${attrs} placeholder="${escapeHtml(placeholder)}">${value}</textarea>`;
        }
        return `<input class="inline-edit-input" type="${type}" ${attrs} value="${value}" placeholder="${escapeHtml(placeholder)}">`;
      }).join('')}
      <button
        class="module-editor-mini-btn module-editor-danger"
        type="button"
        data-inline-action="remove-recipe-list-row"
        data-recipe-list="${escapeHtml(listName)}"
        data-recipe-index="${index}">Loeschen</button>
    </div>`).join('') : '<div class="inline-placeholder-note">Noch keine Eintraege vorhanden.</div>';
}

function updateInlineRecipeField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const field = input.dataset.recipeField;
  if (!field) return;
  const current = sanitizeRecipeData(page.recipe || {});
  const value = String(input.value || '').trim();

  if (field === 'quote') page.quote = value;
  else if (field === 'quoteBy') page.quoteBy = value;
  else current[field] = value;

  page.recipe = sanitizeRecipeData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineRecipeListRow(listName = '') {
  const page = getInlineDraftPage();
  if (!page) return;
  const config = getInlineRecipeListConfig(listName);
  if (!config) return;
  const current = sanitizeRecipeData(page.recipe || {});
  current[listName] = Array.isArray(current[listName]) ? current[listName] : [];
  current[listName].push({ ...config.fallback });
  page.recipe = sanitizeRecipeData(current);
  renderPage(currentPage, 0);
}

function removeInlineRecipeListRow(listName = '', index = 0) {
  const page = getInlineDraftPage();
  if (!page) return;
  if (!getInlineRecipeListConfig(listName)) return;
  const current = sanitizeRecipeData(page.recipe || {});
  current[listName].splice(index, 1);
  page.recipe = sanitizeRecipeData(current);
  renderPage(currentPage, 0);
}

function updateInlineRecipeListField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const listName = input.dataset.recipeList || '';
  const config = getInlineRecipeListConfig(listName);
  if (!config) return;
  const index = Number(input.dataset.recipeIndex || -1);
  const field = input.dataset.recipeField || '';
  if (index < 0 || !config.fields.some(([name]) => name === field)) return;
  const current = sanitizeRecipeData(page.recipe || {});
  const row = current[listName][index] || { ...config.fallback };
  row[field] = String(input.value || '').trim();
  current[listName][index] = row;
  page.recipe = sanitizeRecipeData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function buildInlineRecipeListSection(recipe, listName, titleField) {
  const config = getInlineRecipeListConfig(listName);
  if (!config) return '';
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">${escapeHtml(config.label)}</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-recipe-list-row" data-recipe-list="${escapeHtml(listName)}">+ ${escapeHtml(config.addLabel)}</button>
      </div>
      <div class="inline-edit-field">
        <span class="inline-edit-label">Ueberschrift</span>
        <input class="inline-edit-input" type="text" data-inline-action="update-recipe-field" data-recipe-field="${escapeHtml(titleField)}" value="${escapeHtml(recipe[titleField] || '')}">
      </div>
      <div class="recipe-edit-list">${buildInlineRecipeRows(recipe[listName], listName)}</div>
    </div>`;
}

function buildInlineRecipeEditor(page) {
  const recipe = sanitizeRecipeData(page.recipe || {});
  return `
    ${buildInlineStatsEditor(page)}
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Rezeptur-Kopf</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Archivzeile</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-recipe-field" data-recipe-field="archiveLabel" value="${escapeHtml(recipe.archiveLabel)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Dokumenttyp</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-recipe-field" data-recipe-field="documentKind" value="${escapeHtml(recipe.documentKind)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Kategorie</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-recipe-field" data-recipe-field="category" value="${escapeHtml(recipe.category)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Schwierigkeit</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-recipe-field" data-recipe-field="difficulty" value="${escapeHtml(recipe.difficulty)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Dauer</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-recipe-field" data-recipe-field="duration" value="${escapeHtml(recipe.duration)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Ergebnis</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-recipe-field" data-recipe-field="result" value="${escapeHtml(recipe.result)}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Wirkung / Zweck</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-recipe-field" data-recipe-field="effect">${escapeHtml(recipe.effect)}</textarea>
        </div>
      </div>
    </div>
    ${buildInlineRecipeListSection(recipe, 'ingredients', 'ingredientsTitle')}
    ${buildInlineRecipeListSection(recipe, 'equipment', 'equipmentTitle')}
    ${buildInlineRecipeListSection(recipe, 'steps', 'stepsTitle')}
    ${buildInlineRecipeListSection(recipe, 'warnings', 'warningsTitle')}
    ${buildInlineRecipeListSection(recipe, 'properties', 'propertiesTitle')}
    ${buildInlineRecipeListSection(recipe, 'variants', 'variantsTitle')}
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Meister-Notiz & Zitat</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Notiz-Ueberschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-recipe-field" data-recipe-field="masterNoteTitle" value="${escapeHtml(recipe.masterNoteTitle)}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Notiz des Meisters</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-recipe-field" data-recipe-field="masterNote">${escapeHtml(recipe.masterNote)}</textarea>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Zitat</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-recipe-field" data-recipe-field="quote">${escapeHtml(page.quote || '')}</textarea>
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Zitat von</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-recipe-field" data-recipe-field="quoteBy" value="${escapeHtml(page.quoteBy || '')}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Fusszeile</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-recipe-field" data-recipe-field="footer" value="${escapeHtml(recipe.footer)}">
        </div>
      </div>
    </div>`;
}
