const MODULE_TEMPLATE_TRANSFER_TYPE = 'aleria-template-transfer';
const MODULE_TEMPLATE_TRANSFER_VERSION = 1;

const MODULE_TEMPLATE_TRANSFER_KINDS = {
  goods: {
    templateId: 'goods',
    pageType: 'goods',
    pageFlag: 'goodsTablePage',
    dataKey: 'goodsTable',
    label: 'Warenregister',
    fileLabel: 'warenregister',
    sanitize: data => sanitizeGoodsTableData(data || {})
  },
  hierarchy: {
    templateId: 'hierarchy',
    pageType: 'hierarchy',
    pageFlag: 'hierarchyPage',
    dataKey: 'hierarchy',
    label: 'Hierarchie',
    fileLabel: 'hierarchie',
    sanitize: data => sanitizeHierarchyData(data || {})
  },
  family: {
    templateId: 'family',
    pageType: 'family',
    pageFlag: 'familyPage',
    dataKey: 'family',
    label: 'Familie',
    fileLabel: 'familie',
    listed: false,
    sanitize: data => sanitizeFamilyData(data || {})
  },
  'trade-catalog': {
    templateId: 'trade-catalog',
    pageType: 'trade-catalog',
    pageFlag: 'tradeCatalogPage',
    dataKey: 'tradeCatalog',
    label: 'Handelsgut-Register',
    fileLabel: 'handelsgut-register',
    sanitize: data => sanitizeTradeCatalogData(data || {})
  }
};

let _pendingModuleTemplateTransferImport = null;
let _pendingInlineModuleTemplateTransferImport = null;

function getModuleTemplateTransferConfig(kind) {
  const key = String(kind || '').trim();
  return MODULE_TEMPLATE_TRANSFER_KINDS[key] || null;
}

function getModuleTemplateTransferPageIndex(trigger) {
  const card = trigger?.closest?.('.module-page-card');
  if (!card) return -1;
  const directIndex = Number(card.dataset.pageIndex);
  if (Number.isInteger(directIndex) && directIndex >= 0) return directIndex;
  return Array.from(document.querySelectorAll('#me-pages .module-page-card')).indexOf(card);
}

function getModuleTemplateTransferEditorTitle() {
  const moduleEditorTitle = document.getElementById('me-title')?.value || '';
  if (moduleEditorTitle) return moduleEditorTitle;
  if (typeof _inlineModuleEdit !== 'undefined' && _inlineModuleEdit?.draft?.title) return _inlineModuleEdit.draft.title;
  if (typeof currentEntry !== 'undefined' && currentEntry?.title) return currentEntry.title;
  return 'almanach-modul';
}

function hasModuleTemplateTransferData(page, config) {
  if (!page || !config) return false;
  return Boolean(page[config.pageFlag] && page[config.dataKey]);
}

function buildModuleTemplateTransferPanel(page, type = 'standard') {
  const rows = Object.entries(MODULE_TEMPLATE_TRANSFER_KINDS).filter(([, config]) => config.listed !== false).map(([kind, config]) => {
    const canExport = type === config.pageType || hasModuleTemplateTransferData(page, config);
    return `
      <div class="module-template-transfer-row">
        <div>
          <strong>${escapeHtml(config.label)}</strong>
          <span>Nur diese Seitenstruktur exportieren oder in diese Seite importieren.</span>
        </div>
        <div class="module-template-transfer-actions">
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="export-template-transfer" data-template-transfer-kind="${escapeHtml(kind)}"${canExport ? '' : ' disabled'}>${escapeHtml(config.label)} exportieren</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="open-template-transfer-import" data-template-transfer-kind="${escapeHtml(kind)}">${escapeHtml(config.label)} importieren</button>
        </div>
      </div>`;
  }).join('');

  return `
    <section class="module-template-transfer-panel" aria-label="Template-Transfer">
      <div class="module-editor-kicker">Template-Transfer</div>
      <div class="module-editor-help">Import ersetzt den Seitentyp dieser Seite und legt fehlende Felder automatisch an. Modul-Metadaten und andere Seiten bleiben unberuehrt.</div>
      <div class="module-template-transfer-list">${rows}</div>
    </section>`;
}

function buildInlineModuleTemplateTransferPanel(page, type = 'standard') {
  const rows = Object.entries(MODULE_TEMPLATE_TRANSFER_KINDS).filter(([, config]) => config.listed !== false).map(([kind, config]) => {
    const canExport = type === config.pageType || hasModuleTemplateTransferData(page, config);
    return `
      <div class="module-template-transfer-row">
        <div>
          <strong>${escapeHtml(config.label)}</strong>
          <span>Diese Vorlage direkt aus der aktuellen Seitenbearbeitung exportieren oder hier importieren.</span>
        </div>
        <div class="module-template-transfer-actions">
          <button class="module-editor-mini-btn" type="button" data-inline-action="export-template-transfer" data-template-transfer-kind="${escapeHtml(kind)}"${canExport ? '' : ' disabled'}>${escapeHtml(config.label)} exportieren</button>
          <button class="module-editor-mini-btn" type="button" data-inline-action="open-template-transfer-import" data-template-transfer-kind="${escapeHtml(kind)}">${escapeHtml(config.label)} importieren</button>
        </div>
      </div>`;
  }).join('');

  return `
    <section class="module-template-transfer-panel inline-template-transfer-panel" aria-label="Template-Transfer">
      <div class="inline-edit-kicker">Template-Transfer</div>
      <div class="module-editor-help">Import ersetzt nur diese Seite durch das gewaehlte Register. Andere Seiten und Moduldaten bleiben unveraendert.</div>
      <div class="module-template-transfer-list">${rows}</div>
      <div class="module-editor-help inline-template-transfer-status" aria-live="polite"></div>
    </section>`;
}

function extractModuleTemplateTransferData(page, config) {
  if (!page || !config) {
    throw new Error('Diese Vorlage ist nicht bekannt.');
  }
  if (!page[config.pageFlag] && !page[config.dataKey]) {
    throw new Error(`Diese Seite enthaelt kein ${config.label}.`);
  }
  return config.sanitize(page[config.dataKey] || {});
}

function downloadModuleTemplateTransferJson(bundle, config, pageIndex) {
  const json = JSON.stringify(bundle, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const moduleSlug = slugify(getModuleTemplateTransferEditorTitle(), 'almanach-modul');
  link.href = url;
  link.download = `${moduleSlug}-seite-${pageIndex + 1}-${config.fileLabel}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function setInlineModuleTemplateTransferStatus(message, isError = false) {
  const status = document.querySelector('.inline-template-transfer-status');
  if (status) {
    status.style.color = isError ? 'var(--red-wax)' : 'var(--gold)';
    status.textContent = message || '';
    return;
  }
  if (isError && message) alert(message);
}

function exportModuleTemplateTransferFromEditor(trigger) {
  const config = getModuleTemplateTransferConfig(trigger?.dataset?.templateTransferKind);
  if (!config) {
    setModuleEditorStatus('Unbekannter Template-Transfer.', true);
    return;
  }

  try {
    const pageIndex = getModuleTemplateTransferPageIndex(trigger);
    const payload = collectModuleEditorPayload();
    const page = payload.entry?.pages?.[pageIndex];
    const data = extractModuleTemplateTransferData(page, config);
    const bundle = {
      type: MODULE_TEMPLATE_TRANSFER_TYPE,
      version: MODULE_TEMPLATE_TRANSFER_VERSION,
      kind: config.templateId,
      label: config.label,
      exportedAt: new Date().toISOString(),
      data
    };
    downloadModuleTemplateTransferJson(bundle, config, pageIndex);
    setModuleEditorStatus(`${config.label} exportiert.`);
  } catch (error) {
    setModuleEditorStatus(error.message || `${config.label} konnte nicht exportiert werden.`, true);
  }
}

function openModuleTemplateTransferImport(trigger) {
  const config = getModuleTemplateTransferConfig(trigger?.dataset?.templateTransferKind);
  const pageIndex = getModuleTemplateTransferPageIndex(trigger);
  const input = document.getElementById('me-template-transfer-file');
  if (!config || pageIndex < 0 || !input) {
    setModuleEditorStatus('Template-Import konnte nicht vorbereitet werden.', true);
    return;
  }

  _pendingModuleTemplateTransferImport = { kind: config.templateId, pageIndex };
  input.value = '';
  input.click();
}

function getInlineTemplateTransferFileInput() {
  let input = document.getElementById('inline-template-transfer-file');
  if (input) return input;
  input = document.createElement('input');
  input.id = 'inline-template-transfer-file';
  input.type = 'file';
  input.accept = '.json,application/json';
  input.hidden = true;
  input.dataset.inlineAction = 'import-template-transfer-file';
  (document.getElementById('modal-overlay') || document.body).appendChild(input);
  return input;
}

function parseModuleTemplateTransferBundle(raw, expectedConfig) {
  const parsed = JSON.parse(raw || '{}');
  if (parsed?.type === MODULE_TEMPLATE_TRANSFER_TYPE) {
    if (parsed.kind !== expectedConfig.templateId) {
      throw new Error(`Diese Datei ist fuer "${parsed.label || parsed.kind}" und nicht fuer "${expectedConfig.label}".`);
    }
    return {
      kind: parsed.kind,
      data: expectedConfig.sanitize(parsed.data || {})
    };
  }

  if (parsed?.type) {
    throw new Error('Diese JSON-Datei ist kein Template-Transfer. Bitte exportiere zuerst unten im Seiteneditor eine passende Vorlage.');
  }

  return {
    kind: expectedConfig.templateId,
    data: expectedConfig.sanitize(parsed)
  };
}

function buildModuleTemplateTransferPage(currentPage, config, pageIndex, transferData) {
  const template = getModuleTemplateDefinition(config.templateId);
  const base = typeof template.createPage === 'function'
    ? template.createPage(pageIndex)
    : createDefaultModulePage(pageIndex);
  const next = {
    ...base,
    pageTitle: currentPage?.pageTitle || base.pageTitle || template.pageLabel || config.label,
    image: currentPage?.image || base.image || '',
    commentThreadKey: currentPage?.commentThreadKey || base.commentThreadKey || '',
    [config.pageFlag]: true,
    [config.dataKey]: config.sanitize(transferData)
  };

  if (currentPage?.enableComments) next.enableComments = true;
  if (Array.isArray(currentPage?.sessionCast) && currentPage.sessionCast.length) {
    next.sessionCast = currentPage.sessionCast;
  }
  if (Array.isArray(currentPage?.sessionCastDetails) && currentPage.sessionCastDetails.length) {
    next.sessionCastDetails = currentPage.sessionCastDetails;
  }

  return sanitizeModulePage(next, next.pageTitle || '') || next;
}

function exportInlineModuleTemplateTransfer(trigger) {
  const config = getModuleTemplateTransferConfig(trigger?.dataset?.templateTransferKind);
  if (!config) {
    setInlineModuleTemplateTransferStatus('Unbekannter Template-Transfer.', true);
    return;
  }

  try {
    const pageIndex = typeof getInlineEditorPageIndex === 'function'
      ? getInlineEditorPageIndex(trigger)
      : (typeof currentPage !== 'undefined' ? currentPage : 0);
    const page = typeof getInlineDraftPage === 'function'
      ? getInlineDraftPage(pageIndex)
      : null;
    const data = extractModuleTemplateTransferData(page, config);
    const bundle = {
      type: MODULE_TEMPLATE_TRANSFER_TYPE,
      version: MODULE_TEMPLATE_TRANSFER_VERSION,
      kind: config.templateId,
      label: config.label,
      exportedAt: new Date().toISOString(),
      data
    };
    downloadModuleTemplateTransferJson(bundle, config, pageIndex);
    setInlineModuleTemplateTransferStatus(`${config.label} exportiert.`);
  } catch (error) {
    setInlineModuleTemplateTransferStatus(error.message || `${config.label} konnte nicht exportiert werden.`, true);
  }
}

function openInlineModuleTemplateTransferImport(trigger) {
  const config = getModuleTemplateTransferConfig(trigger?.dataset?.templateTransferKind);
  const pageIndex = typeof getInlineEditorPageIndex === 'function'
    ? getInlineEditorPageIndex(trigger)
    : (typeof currentPage !== 'undefined' ? currentPage : 0);
  const input = getInlineTemplateTransferFileInput();
  if (!config || pageIndex < 0 || !input) {
    setInlineModuleTemplateTransferStatus('Template-Import konnte nicht vorbereitet werden.', true);
    return;
  }

  _pendingInlineModuleTemplateTransferImport = { kind: config.templateId, pageIndex };
  input.value = '';
  input.click();
}

function applyModuleTemplateTransferImport(config, pageIndex, data) {
  const currentPayload = collectModuleEditorPayload();
  const pages = Array.isArray(currentPayload.entry?.pages) && currentPayload.entry.pages.length
    ? currentPayload.entry.pages.slice()
    : [createDefaultModulePage(0)];
  const currentPage = pages[pageIndex] || createDefaultModulePage(pageIndex);

  if (!confirm(`${config.label} in Seite ${pageIndex + 1} importieren?\n\nDer Seitentyp dieser Seite wird auf "${config.label}" gesetzt. Andere Seiten bleiben unveraendert.`)) {
    return false;
  }

  setModuleEditorUndoSnapshot(currentPayload, _moduleEditorContext || {}, 'Template-Import');
  pages[pageIndex] = buildModuleTemplateTransferPage(currentPage, config, pageIndex, data);

  const nextPayload = {
    ...currentPayload,
    entry: {
      ...currentPayload.entry,
      pages
    }
  };
  populateModuleEditor(nextPayload, _moduleEditorContext || { mode: 'edit' });
  setModuleEditorStatus(`${config.label} in Seite ${pageIndex + 1} importiert.`);
  return true;
}

function applyInlineModuleTemplateTransferImport(config, pageIndex, data) {
  if (typeof _inlineModuleEdit === 'undefined' || !_inlineModuleEdit?.draft?.pages) {
    setInlineModuleTemplateTransferStatus('Inline-Bearbeitung ist nicht aktiv.', true);
    return false;
  }
  const pages = _inlineModuleEdit.draft.pages;
  const currentPageData = pages[pageIndex] || createDefaultModulePage(pageIndex);

  if (!confirm(`${config.label} in diese Seite importieren?\n\nDer Seitentyp dieser Seite wird auf "${config.label}" gesetzt. Andere Seiten bleiben unveraendert.`)) {
    return false;
  }

  pages[pageIndex] = buildModuleTemplateTransferPage(currentPageData, config, pageIndex, data);
  if (typeof currentPage !== 'undefined') currentPage = pageIndex;
  if (typeof currentEntry !== 'undefined') currentEntry = _inlineModuleEdit.draft;
  renderPage(pageIndex, 0);
  setInlineModuleTemplateTransferStatus(`${config.label} importiert.`);
  return true;
}

function handleModuleTemplateTransferImportFile(input) {
  const pending = _pendingModuleTemplateTransferImport;
  const file = input?.files?.[0];
  if (!pending || !file) return;

  const config = getModuleTemplateTransferConfig(pending.kind);
  if (!config) {
    setModuleEditorStatus('Template-Import hat kein gueltiges Ziel.', true);
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const bundle = parseModuleTemplateTransferBundle(String(reader.result || ''), config);
      applyModuleTemplateTransferImport(config, pending.pageIndex, bundle.data);
    } catch (error) {
      setModuleEditorStatus(error.message || `${config.label} konnte nicht importiert werden.`, true);
    } finally {
      _pendingModuleTemplateTransferImport = null;
      input.value = '';
    }
  };
  reader.onerror = () => {
    _pendingModuleTemplateTransferImport = null;
    input.value = '';
    setModuleEditorStatus('Template-Datei konnte nicht gelesen werden.', true);
  };
  reader.readAsText(file);
}

function handleInlineModuleTemplateTransferImportFile(input) {
  const pending = _pendingInlineModuleTemplateTransferImport;
  const file = input?.files?.[0];
  if (!pending || !file) return;

  const config = getModuleTemplateTransferConfig(pending.kind);
  if (!config) {
    setInlineModuleTemplateTransferStatus('Template-Import hat kein gueltiges Ziel.', true);
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const bundle = parseModuleTemplateTransferBundle(String(reader.result || ''), config);
      applyInlineModuleTemplateTransferImport(config, pending.pageIndex, bundle.data);
    } catch (error) {
      setInlineModuleTemplateTransferStatus(error.message || `${config.label} konnte nicht importiert werden.`, true);
    } finally {
      _pendingInlineModuleTemplateTransferImport = null;
      input.value = '';
    }
  };
  reader.onerror = () => {
    _pendingInlineModuleTemplateTransferImport = null;
    input.value = '';
    setInlineModuleTemplateTransferStatus('Template-Datei konnte nicht gelesen werden.', true);
  };
  reader.readAsText(file);
}
