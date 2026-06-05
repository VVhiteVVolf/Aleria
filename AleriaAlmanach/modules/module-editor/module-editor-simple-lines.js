const MODULE_SIMPLE_LINE_CONFIGS = {
  artifactProperties: {
    placeholder: 'Eigenschaft',
    fallback: 'Neue Eigenschaft',
    empty: 'Noch keine Eigenschaften vorhanden.'
  },
  artifactRisks: {
    placeholder: 'Risiko / Nebenwirkung',
    fallback: 'Neues Risiko',
    empty: 'Noch keine Risiken vorhanden.'
  },
  biographyWorks: {
    placeholder: 'Werk / Beitrag',
    fallback: 'Neues Werk',
    empty: 'Noch keine Werke vorhanden.'
  },
  biographyTrivia: {
    placeholder: 'Trivia / Notiz',
    fallback: 'Neue Notiz',
    empty: 'Noch keine Trivia vorhanden.'
  },
  biographyQuotes: {
    placeholder: 'Zitat',
    fallback: 'Neues Zitat',
    empty: 'Noch keine Zitate vorhanden.'
  }
};

function getModuleSimpleLineConfig(listName) {
  return MODULE_SIMPLE_LINE_CONFIGS[listName] || {
    placeholder: 'Eintrag',
    fallback: 'Neuer Eintrag',
    empty: 'Noch keine Einträge vorhanden.'
  };
}

function buildModuleSimpleLineRows(items = [], listName = '') {
  const config = getModuleSimpleLineConfig(listName);
  const rows = Array.isArray(items) ? items : [];
  return rows.map(item => `
    <div class="inline-stat-row module-simple-line-row" data-simple-line-row="${escapeHtml(listName)}">
      <input class="inline-edit-input me-simple-line-text" type="text" value="${escapeHtml(item || '')}" placeholder="${escapeHtml(config.placeholder)}">
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-simple-line-row">Löschen</button>
    </div>`).join('');
}

function buildModuleSimpleLineList(items = [], listName = '') {
  const config = getModuleSimpleLineConfig(listName);
  const rows = buildModuleSimpleLineRows(items, listName);
  return `
    <div class="inline-stat-editor module-simple-line-list" data-simple-line-list="${escapeHtml(listName)}">
      ${rows || `<div class="inline-placeholder-note">${escapeHtml(config.empty)}</div>`}
    </div>`;
}

function collectModuleSimpleLineRows(card, listName) {
  return Array.from(card.querySelectorAll(`[data-simple-line-row="${listName}"]`))
    .map(row => getTrimmedFormValue(row, '.me-simple-line-text'))
    .filter(Boolean);
}

function addModuleSimpleLineRow(button, listName) {
  const config = getModuleSimpleLineConfig(listName);
  const pageCard = button.closest('.module-page-card');
  const wrap = pageCard?.querySelector(`[data-simple-line-list="${listName}"]`);
  if (!pageCard || !wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildModuleSimpleLineRows([config.fallback], listName));
  syncModuleJsonPreview();
}

function removeModuleSimpleLineRow(button) {
  const pageCard = button.closest('.module-page-card');
  const row = button.closest('.module-simple-line-row');
  const wrap = row?.parentElement;
  if (!pageCard || !row || !wrap) return;
  const listName = row.dataset.simpleLineRow || wrap.dataset.simpleLineList || '';
  row.remove();
  if (!wrap.querySelector('.module-simple-line-row')) {
    const config = getModuleSimpleLineConfig(listName);
    wrap.innerHTML = `<div class="inline-placeholder-note">${escapeHtml(config.empty)}</div>`;
  }
  syncModuleJsonPreview();
}
