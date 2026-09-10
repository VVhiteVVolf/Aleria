// Both editors share the existing row-schema engine; only scalar fields are owned here.
registerRowSchema('organizationNetwork.sites', {
  itemsKey: 'sites', dataNamespace: 'organizationNetwork', sanitizeFn: sanitizeOrganizationNetworkData,
  rowClass: 'organization-network-editor-site', rowSelectorClass: 'module-network-site-row',
  listWrapClass: 'module-network-sites', emptyMessage: 'Noch keine Standorte eingetragen.',
  newItem: () => ({ name: 'Neuer Standort', kind: 'branch' }),
  keepRow: site => site.name || site.description,
  fields: [
    { key: 'name', kind: 'text', placeholder: 'Standortname', modalClass: 'me-network-site-name' },
    { key: 'region', kind: 'text', placeholder: 'Region', modalClass: 'me-network-site-region' },
    { key: 'kind', kind: 'select', default: 'branch', options: ORGANIZATION_NETWORK_KINDS, modalClass: 'me-network-site-kind' },
    { key: 'image', kind: 'icon', placeholder: 'Wappen oder Ortsbild', modalClass: 'me-network-site-image' },
    { key: 'description', kind: 'textarea', placeholder: 'Aufgabe und Besonderheiten', modalClass: 'me-network-site-description' },
    { key: 'href', kind: 'url', placeholder: 'Link zum Ort (optional)', modalClass: 'me-network-site-href' },
    { key: 'publicationHref', kind: 'url', placeholder: 'Link zur Publikation (optional)', modalClass: 'me-network-site-publication-href' }
  ]
});

const ORGANIZATION_NETWORK_EDITOR_FIELDS = Object.freeze([
  ['title', 'Überschrift', false], ['introduction', 'Einleitung', true],
  ['reach', 'Wirkungsgebiet', false], ['model', 'Zusammenarbeit', true],
  ['note', 'Einordnung', true], ['footer', 'Fußzeile', false]
]);

function buildOrganizationNetworkEditorContent(page, mode) {
  const data = sanitizeOrganizationNetworkData(page.organizationNetwork);
  const inline = mode === 'inline';
  const action = inline ? 'data-inline-action' : 'data-module-editor-action';
  const syncAction = inline ? '' : 'data-module-editor-action="sync-json-preview"';
  return `<div class="${inline ? 'inline-edit-section' : 'module-editor-grid'}">
    ${ORGANIZATION_NETWORK_EDITOR_FIELDS.map(([key, label, rich]) => `<label class="${inline ? 'inline-edit-field' : 'module-editor-field'} wide"><span>${label}</span>${rich ? buildTextFormatToolbar() : ''}${rich ? `<textarea class="inline-edit-textarea me-network-${key}" data-network-field="${key}" ${syncAction}>${escapeHtml(data[key])}</textarea>` : `<input class="inline-edit-input me-network-${key}" data-network-field="${key}" ${syncAction} type="text" value="${escapeHtml(data[key])}">`}</label>`).join('')}
    <div class="${inline ? 'inline-edit-field' : 'module-editor-field'} wide">
      <div class="module-editor-inline"><strong>Standorte</strong><button type="button" class="module-editor-mini-btn" ${action}="schema-add-row" data-schema-key="organizationNetwork.sites">+ Standort</button></div>
      <div class="module-network-sites">${buildSchemaList('organizationNetwork.sites', data.sites, mode)}</div>
    </div>
  </div>`;
}

function buildOrganizationNetworkModuleEditorFields(page) {
  return `<div class="module-page-type-block${page.organizationNetworkPage ? ' visible' : ''}" data-page-type="organization-network">${buildOrganizationNetworkEditorContent(page, 'module')}</div>`;
}

function buildInlineOrganizationNetworkEditor(page) {
  return buildOrganizationNetworkEditorContent(page, 'inline');
}

function collectOrganizationNetworkModuleEditorPage(card, page) {
  const block = card.querySelector('[data-page-type="organization-network"]') || card;
  const data = Object.fromEntries(ORGANIZATION_NETWORK_EDITOR_FIELDS.map(([key]) => [key, getTrimmedFormValue(block, `.me-network-${key}`)]));
  page.organizationNetworkPage = true;
  page.organizationNetwork = sanitizeOrganizationNetworkData({ ...data, sites: collectSchemaRows(block, 'organizationNetwork.sites') });
  return page;
}

document.addEventListener('input', event => {
  const field = event.target;
  const key = field?.dataset?.networkField;
  if (!field?.closest?.('.inline-module-edit-pane') || !ORGANIZATION_NETWORK_EDITOR_FIELDS.some(([name]) => name === key)) return;
  const page = getInlineDraftPageForSource(field);
  if (!page?.organizationNetworkPage) return;
  page.organizationNetwork = sanitizeOrganizationNetworkData({ ...page.organizationNetwork, [key]: field.value });
  scheduleInlineModuleLivePreviewRefresh();
});
