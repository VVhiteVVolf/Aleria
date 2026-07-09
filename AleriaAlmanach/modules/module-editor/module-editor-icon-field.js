// Shared icon-or-image-URL field for the schema-driven row engine (module-editor-row-schemas.js /
// inline-editor-row-schemas.js). Replaces the per-template copy-pasted icon-picker boilerplate
// (own module-level target var + own "almanach-icon-selected" listener per template) with one
// shared target/listener used by every schema field of kind "icon".

let _schemaIconPickerTarget = null;

function buildSchemaIconField(field, item, index, mode, schemaKey) {
  const value = item[field.key] || '';
  const inputClass = mode === 'module' ? (field.modalClass || '') : '';
  const inputAttrs = mode === 'inline'
    ? `data-inline-action="schema-update-field" data-schema-key="${escapeHtml(schemaKey)}" data-schema-index="${index}" data-schema-field="${escapeHtml(field.key)}"`
    : 'data-module-editor-action="sync-json-preview"';
  const pickerAttrs = mode === 'inline'
    ? `data-inline-action="schema-pick-icon" data-schema-key="${escapeHtml(schemaKey)}" data-schema-field="${escapeHtml(field.key)}"`
    : `data-module-editor-action="schema-pick-icon" data-schema-key="${escapeHtml(schemaKey)}" data-schema-field="${escapeHtml(field.key)}"`;
  return `
      <span class="biography-ability-icon-field">
        <input class="inline-edit-input schema-icon-field ${inputClass}" type="text" value="${escapeHtml(value)}" placeholder="${escapeHtml(field.placeholder || 'Symbol oder Bild-URL')}" data-schema-field="${escapeHtml(field.key)}" ${inputAttrs}>
        <button class="module-editor-mini-btn biography-ability-icon-picker" type="button" ${pickerAttrs} title="Icon-Verzeichnis oeffnen" aria-label="Icon-Verzeichnis oeffnen">Icon</button>
      </span>`;
}

function openSchemaIconPicker(button) {
  const schemaKey = button?.dataset?.schemaKey || '';
  const fieldKey = button?.dataset?.schemaField || '';
  const row = button?.closest?.('[data-row-variant], .biography-edit-row, .module-house-influence-row');
  const target = row?.querySelector?.(`.schema-icon-field[data-schema-field="${fieldKey}"]`)
    || row?.querySelector?.('.schema-icon-field');
  if (!target) return;
  _schemaIconPickerTarget = target;
  if (typeof openIconDirectory === 'function') {
    openIconDirectory();
    return;
  }
  _schemaIconPickerTarget = null;
}

function handleSchemaIconSelected(event) {
  const target = _schemaIconPickerTarget;
  const src = String(event?.detail?.src || '').trim();
  if (!target || !target.isConnected || !src) {
    _schemaIconPickerTarget = null;
    return;
  }
  target.value = src;
  target.dispatchEvent(new Event('input', { bubbles: true }));
  target.dispatchEvent(new Event('change', { bubbles: true }));
  try {
    target.focus({ preventScroll: true });
  } catch {
    target.focus();
  }
  if (typeof closeIconDirectory === 'function') {
    closeIconDirectory();
  }
  _schemaIconPickerTarget = null;
}

document.addEventListener('almanach-icon-selected', handleSchemaIconSelected);
