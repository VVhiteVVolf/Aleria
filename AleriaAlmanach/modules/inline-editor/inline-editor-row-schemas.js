// Inline-editor counterpart to module-editor-row-schemas.js. Row HTML itself is already shared
// between modal/inline via buildSchemaRows(schemaKey, items, mode) — this file only supplies the
// inline-specific mutation functions: per-keystroke field updates (debounced preview refresh) and
// structural add/remove (full page re-render), kept as two separate code paths on purpose — see
// the risk notes in the refactor plan (cursor loss / stale indices if these were merged).
//
// registerRowSchema(...) config additionally needs, for inline use:
//   dataNamespace: page.<dataNamespace> holds the sanitized data object (e.g. 'house')
//   itemsKey:      the array field name on that data object (e.g. 'documents', matches the
//                  actual sanitize<Name>Data field name, NOT necessarily the UI label)
//   sanitizeFn:    the sanitize<Name>Data function to re-run after mutating the draft

function getInlineSchemaNamespaceData(page, config) {
  return config.sanitizeFn(page[config.dataNamespace] || {});
}

function updateInlineSchemaField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const schemaKey = input.dataset.schemaKey;
  const index = Number(input.dataset.schemaIndex);
  const fieldKey = input.dataset.schemaField;
  if (!schemaKey || !Number.isFinite(index) || index < 0 || !fieldKey) return;
  const config = getRowSchema(schemaKey);
  const current = getInlineSchemaNamespaceData(page, config);
  const items = Array.isArray(current[config.itemsKey]) ? current[config.itemsKey] : [];
  const fallback = config.emptyFallbackItem ? config.emptyFallbackItem() : {};
  const item = items[index] || fallback;
  item[fieldKey] = String(input.value || '').trim();
  items[index] = item;
  current[config.itemsKey] = items;
  page[config.dataNamespace] = config.sanitizeFn(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineSchemaRow(schemaKey, arg) {
  const page = getInlineDraftPage();
  if (!page) return;
  const config = getRowSchema(schemaKey);
  const current = getInlineSchemaNamespaceData(page, config);
  const items = Array.isArray(current[config.itemsKey]) ? current[config.itemsKey] : [];
  const variant = arg && config.variants ? arg : null;
  const newItem = variant ? config.variants[variant].newItem(arg) : (config.newItem ? config.newItem(arg) : {});
  items.push(newItem);
  current[config.itemsKey] = items;
  page[config.dataNamespace] = config.sanitizeFn(current);
  renderPage(currentPage, 0);
}

function removeInlineSchemaRow(schemaKey, index) {
  const page = getInlineDraftPage();
  if (!page || index < 0) return;
  const config = getRowSchema(schemaKey);
  const current = getInlineSchemaNamespaceData(page, config);
  const items = Array.isArray(current[config.itemsKey]) ? current[config.itemsKey] : [];
  items.splice(index, 1);
  current[config.itemsKey] = items;
  page[config.dataNamespace] = config.sanitizeFn(current);
  renderPage(currentPage, 0);
}
