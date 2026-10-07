registerRowSchema('guildServices.services', {
  itemsKey: 'services', dataNamespace: 'guildServices', sanitizeFn: sanitizeGuildServicesData,
  rowClass: 'guild-services-editor-row', rowSelectorClass: 'module-service-row',
  listWrapClass: 'module-service-list', emptyMessage: 'Noch keine Dienste eingetragen.',
  newItem: () => ({ title: 'Neuer Dienst' }), keepRow: item => item.title || item.description,
  fields: [
    { key: 'title', kind: 'text', placeholder: 'Bezeichnung', modalClass: 'me-service-title' },
    { key: 'icon', kind: 'icon', placeholder: 'Service-Icon', modalClass: 'me-service-icon' },
    { key: 'description', kind: 'textarea', placeholder: 'Leistung und Aufgabe', modalClass: 'me-service-description' },
    { key: 'clients', kind: 'text', placeholder: 'Auftraggeber', modalClass: 'me-service-clients' },
    { key: 'scope', kind: 'text', placeholder: 'Umfang und Dauer', modalClass: 'me-service-scope' },
    { key: 'terms', kind: 'text', placeholder: 'Bedingungen oder Vergütung', modalClass: 'me-service-terms' }
  ]
});

const GUILD_SERVICES_EDITOR_FIELDS = Object.freeze([
  ['title', 'Überschrift', false], ['introduction', 'Einleitung', true],
  ['process', 'Vom Anliegen zum Auftrag', true], ['conditions', 'Bedingungen & Grenzen', true], ['footer', 'Fußzeile', false]
]);

function buildGuildServicesEditorContent(page, mode) {
  const data = sanitizeGuildServicesData(page.guildServices);
  const inline = mode === 'inline';
  const action = inline ? 'data-inline-action' : 'data-module-editor-action';
  const sync = inline ? '' : 'data-module-editor-action="sync-json-preview"';
  return `<div class="${inline ? 'inline-edit-section' : 'module-editor-grid'}">
    ${GUILD_SERVICES_EDITOR_FIELDS.map(([key, label, rich]) => `<label class="${inline ? 'inline-edit-field' : 'module-editor-field'} wide"><span>${label}</span>${rich ? buildTextFormatToolbar() : ''}${rich ? `<textarea class="inline-edit-textarea me-services-${key}" data-guild-services-field="${key}" ${sync}>${escapeHtml(data[key])}</textarea>` : `<input class="inline-edit-input me-services-${key}" data-guild-services-field="${key}" ${sync} type="text" value="${escapeHtml(data[key])}">`}</label>`).join('')}
    <div class="${inline ? 'inline-edit-field' : 'module-editor-field'} wide"><div class="module-editor-inline"><strong>Dienstleistungen</strong><button type="button" class="module-editor-mini-btn" ${action}="schema-add-row" data-schema-key="guildServices.services">+ Dienst</button></div><div class="module-service-list">${buildSchemaList('guildServices.services', data.services, mode)}</div></div>
  </div>`;
}

function buildGuildServicesModuleEditorFields(page) {
  return `<div class="module-page-type-block${page.guildServicesPage ? ' visible' : ''}" data-page-type="guild-services">${buildGuildServicesEditorContent(page, 'module')}</div>`;
}
function buildInlineGuildServicesEditor(page) { return buildGuildServicesEditorContent(page, 'inline'); }
function collectGuildServicesModuleEditorPage(card, page) {
  const block = card.querySelector('[data-page-type="guild-services"]') || card;
  const data = Object.fromEntries(GUILD_SERVICES_EDITOR_FIELDS.map(([key]) => [key, getTrimmedFormValue(block, `.me-services-${key}`)]));
  page.guildServicesPage = true;
  page.guildServices = sanitizeGuildServicesData({ ...data, services: collectSchemaRows(block, 'guildServices.services') });
  return page;
}

document.addEventListener('input', event => {
  const field = event.target;
  const key = field?.dataset?.guildServicesField;
  if (!field?.closest?.('.inline-module-edit-pane') || !GUILD_SERVICES_EDITOR_FIELDS.some(([name]) => name === key)) return;
  const page = getInlineDraftPageForSource(field);
  if (!page?.guildServicesPage) return;
  page.guildServices = sanitizeGuildServicesData({ ...page.guildServices, [key]: field.value });
  scheduleInlineModuleLivePreviewRefresh();
});
