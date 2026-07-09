// Generic, declarative engine for "array of objects with N named fields, uniform row markup"
// module-editor field shapes (stat rows, icon+title+detail rows, extra sections, connection
// rows, document rows). Generalizes the config-object + generic-functions pattern already used
// by module-editor-simple-lines.js (single-field lists) to multi-field rows, and to rows that
// come in more than one shape ("variants", e.g. a connection row vs. a heading/divider row).
//
// A template registers one config per list via registerRowSchema(key, config) and gets
// build/collect/add/remove for free instead of writing its own copy of all four. Templates are
// migrated one list at a time; a template's OLD hand-written functions are left in place and
// only used while its schema-driven replacement is behind a disabled flag (see
// isSchemaEditorEnabled below) so both can be verified against real data before the old code is
// deleted.
//
// Field kinds: 'text' | 'url' | 'number' | 'textarea' | 'select' | 'icon'.
// A schema is either flat (`fields: [...]`) or a discriminated union
// (`discriminatorKey`, `defaultVariant`, `variants: { key: { fields, keepRow, newItem, rowClass } }`).

const MODULE_ROW_SCHEMAS = {};

function registerRowSchema(key, config) {
  MODULE_ROW_SCHEMAS[key] = config;
}

function getRowSchema(key) {
  const config = MODULE_ROW_SCHEMAS[key];
  if (!config) throw new Error(`Unbekanntes Row-Schema: ${key}`);
  return config;
}

function isSchemaEditorEnabled(templateId) {
  try {
    return localStorage.getItem(`almanach-schema-editor-${templateId}`) === '1';
  } catch {
    return false;
  }
}

function setSchemaEditorEnabled(templateId, enabled) {
  try {
    localStorage.setItem(`almanach-schema-editor-${templateId}`, enabled ? '1' : '0');
  } catch {
    // localStorage unavailable (e.g. private mode) — flag just won't persist across reloads.
  }
}

function getSchemaRowVariant(config, item) {
  if (!config.variants) return null;
  const raw = item?.[config.discriminatorKey];
  return raw && config.variants[raw] ? raw : config.defaultVariant;
}

function buildSchemaFieldMarkup(field, item, index, mode, schemaKey) {
  if (field.kind === 'icon') return buildSchemaIconField(field, item, index, mode, schemaKey);
  const value = item[field.key] ?? '';
  const modalClass = mode === 'module' ? (field.modalClass || '') : '';
  const inlineAttrs = mode === 'inline'
    ? `data-inline-action="schema-update-field" data-schema-key="${escapeHtml(schemaKey)}" data-schema-index="${index}" data-schema-field="${escapeHtml(field.key)}"`
    : 'data-module-editor-action="sync-json-preview"';

  if (field.kind === 'textarea') {
    return `<textarea class="inline-edit-textarea ${modalClass}" placeholder="${escapeHtml(field.placeholder || '')}" ${inlineAttrs}>${escapeHtml(value)}</textarea>`;
  }
  if (field.kind === 'select') {
    const current = value || field.default || '';
    const options = (field.options || []).map(([optValue, label]) =>
      `<option value="${escapeHtml(optValue)}"${current === optValue ? ' selected' : ''}>${escapeHtml(label)}</option>`).join('');
    return `<select class="inline-edit-input ${modalClass}" ${inlineAttrs}>${options}</select>`;
  }
  return `<input class="inline-edit-input ${modalClass}" type="${field.kind === 'url' ? 'url' : field.kind === 'number' ? 'number' : 'text'}" value="${escapeHtml(value)}" placeholder="${escapeHtml(field.placeholder || '')}" ${inlineAttrs}>`;
}

function buildSchemaRows(schemaKey, items = [], mode = 'module') {
  const config = getRowSchema(schemaKey);
  const list = Array.isArray(items) && items.length
    ? items
    : (config.emptyFallbackItem ? [config.emptyFallbackItem()] : []);
  return list.map((item, index) => {
    const variantKey = getSchemaRowVariant(config, item);
    const variantConfig = variantKey ? config.variants[variantKey] : null;
    const fields = variantConfig ? variantConfig.fields : config.fields;
    const rowClasses = [
      config.rowClass,
      mode === 'inline' ? '' : config.rowSelectorClass,
      variantConfig?.rowClass || ''
    ].filter(Boolean).join(' ');
    const rowAttrs = [
      mode === 'inline' ? `data-schema-index="${index}"` : '',
      variantKey ? `data-row-variant="${escapeHtml(variantKey)}"` : ''
    ].filter(Boolean).join(' ');
    const fieldsHtml = fields.map(field => buildSchemaFieldMarkup(field, item, index, mode, schemaKey)).join('\n      ');
    const removeAttrs = mode === 'inline'
      ? `data-inline-action="schema-remove-row" data-schema-key="${escapeHtml(schemaKey)}" data-schema-index="${index}"`
      : `data-module-editor-action="schema-remove-row" data-schema-key="${escapeHtml(schemaKey)}"`;
    return `
    <div class="${rowClasses}" ${rowAttrs}>
      ${fieldsHtml}
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${removeAttrs}>Löschen</button>
    </div>`;
  }).join('');
}

function buildSchemaList(schemaKey, items = [], mode = 'module') {
  const config = getRowSchema(schemaKey);
  const rows = buildSchemaRows(schemaKey, items, mode);
  return rows || `<div class="inline-placeholder-note">${escapeHtml(config.emptyMessage || 'Noch keine Eintraege vorhanden.')}</div>`;
}

function collectSchemaRows(card, schemaKey) {
  const config = getRowSchema(schemaKey);
  const rows = Array.from(card.querySelectorAll(`.${config.rowSelectorClass}`));
  return rows.map(row => {
    const variantKey = config.variants
      ? (row.dataset.rowVariant && config.variants[row.dataset.rowVariant] ? row.dataset.rowVariant : config.defaultVariant)
      : null;
    const variantConfig = variantKey ? config.variants[variantKey] : null;
    const fields = variantConfig ? variantConfig.fields : config.fields;
    const item = variantKey ? { [config.discriminatorKey]: variantKey } : {};
    fields.forEach(field => {
      item[field.key] = field.kind === 'select'
        ? getFormValue(row, `.${field.modalClass}`)
        : getTrimmedFormValue(row, `.${field.modalClass}`);
    });
    return item;
  }).filter(item => (variantOf(config, item).keepRow || config.keepRow)(item));
}

function variantOf(config, item) {
  const variantKey = getSchemaRowVariant(config, item);
  return variantKey ? config.variants[variantKey] : {};
}

function addSchemaRow(button, schemaKey, arg) {
  const config = getRowSchema(schemaKey);
  const pageCard = button.closest('.module-page-card');
  const wrap = pageCard?.querySelector(`.${config.listWrapClass}`);
  if (!pageCard || !wrap) return;
  const variant = arg && config.variants ? arg : null;
  const newItem = variant ? config.variants[variant].newItem(arg) : (config.newItem ? config.newItem(arg) : {});
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildSchemaRows(schemaKey, [newItem], 'module'));
  syncModuleJsonPreview();
}

function removeSchemaRow(button, schemaKey) {
  const config = getRowSchema(schemaKey);
  const pageCard = button.closest('.module-page-card');
  const row = button.closest(`.${config.rowSelectorClass}`);
  const wrap = pageCard?.querySelector(`.${config.listWrapClass}`);
  if (!pageCard || !row || !wrap) return;
  row.remove();
  if (!wrap.querySelector(`.${config.rowSelectorClass}`)) {
    wrap.innerHTML = `<div class="inline-placeholder-note">${escapeHtml(config.emptyMessage || 'Noch keine Eintraege vorhanden.')}</div>`;
  }
  syncModuleJsonPreview();
}
