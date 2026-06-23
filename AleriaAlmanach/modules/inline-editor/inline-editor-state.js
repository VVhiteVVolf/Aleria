// Inline module editor state, lifecycle, and save/cancel flow.
// Kept separate from type-specific editor builders to limit side effects.

let _inlineModuleEdit = null;
let _inlinePreviewRefreshTimer = null;
let _inlineEditorEventSource = null;

function inlineEditorCssEscape(value) {
  const raw = String(value ?? '');
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(raw);
  return raw.replace(/["\\]/g, '\\$&');
}

function captureInlinePreviewRuntimeState(root = document) {
  const scope = root || document;
  return {
    goods: Array.from(scope.querySelectorAll('.goods-table-block[data-goods-table-scope]')).map((block, index) => ({
      key: block.dataset.goodsTableScope || String(index),
      filter: block.querySelector('.goods-filter-tab.active')?.dataset.goodsFilter || '',
      expanded: Array.from(block.querySelectorAll('.goods-product-row.is-expandable'))
        .map((row, rowIndex) => row.classList.contains('expanded') ? rowIndex : -1)
        .filter(rowIndex => rowIndex >= 0)
    })),
    trade: Array.from(scope.querySelectorAll('.trade-catalog-sheet')).map((sheet, index) => ({
      index,
      filter: sheet.querySelector('.trade-catalog-tab.active')?.dataset.tradeFilter || '',
      search: sheet.querySelector('[data-trade-search-input]')?.value || ''
    })),
    maps: Array.from(scope.querySelectorAll('.map-template-page[data-map-template-page]')).map((page, index) => ({
      key: page.dataset.mapTemplatePage || String(index),
      tab: Number(page.querySelector('.map-template-tab.active')?.dataset.mapTemplateTab || 0),
      sidebarCollapsed: page.classList.contains('sidebar-collapsed')
    })),
    hierarchies: Array.from(scope.querySelectorAll('.hierarchy-page')).map((page, index) => {
      const viewport = page.querySelector('.hierarchy-chart-viewport');
      return {
        index,
        tree: page.querySelector('[data-hierarchy-tree-tab].active')?.dataset.hierarchyTreeTab || '0',
        scale: page.querySelector('[data-hierarchy-scale-input]')?.value || '',
        sidebarCollapsed: page.classList.contains('sidebar-collapsed'),
        introCollapsed: page.classList.contains('intro-collapsed'),
        fullscreen: page.classList.contains('fullscreen-active'),
        chartTop: viewport?.scrollTop || 0,
        chartLeft: viewport?.scrollLeft || 0
      };
    }),
    inventories: Array.from(scope.querySelectorAll('.character-inventory-page')).map((page, index) => ({
      index,
      category: page.querySelector('[data-ci-action="filter-items"].active')?.dataset.ciCategory || ''
    }))
  };
}

function restoreInlinePreviewRuntimeState(state, root = document) {
  if (!state) return;
  const scope = root || document;

  (state.goods || []).forEach((saved, index) => {
    const block = saved.key
      ? scope.querySelector(`.goods-table-block[data-goods-table-scope="${inlineEditorCssEscape(saved.key)}"]`)
      : null;
    const target = block || scope.querySelectorAll('.goods-table-block[data-goods-table-scope]')[index];
    if (!target) return;
    if (saved.filter && typeof applyGoodsTableFilter === 'function') applyGoodsTableFilter(target, saved.filter);
    const rows = Array.from(target.querySelectorAll('.goods-product-row.is-expandable'));
    (saved.expanded || []).forEach(rowIndex => {
      const row = rows[rowIndex];
      const detailRow = row?.nextElementSibling?.classList?.contains('goods-detail-row') ? row.nextElementSibling : null;
      if (!row || !detailRow) return;
      row.classList.add('expanded');
      detailRow.classList.add('expanded');
      row.setAttribute('aria-expanded', 'true');
      detailRow.setAttribute('aria-hidden', 'false');
    });
  });

  (state.trade || []).forEach(saved => {
    const sheet = scope.querySelectorAll('.trade-catalog-sheet')[saved.index];
    if (!sheet) return;
    const tab = saved.filter ? sheet.querySelector(`.trade-catalog-tab[data-trade-filter="${inlineEditorCssEscape(saved.filter)}"]`) : null;
    if (tab) sheet.querySelectorAll('.trade-catalog-tab').forEach(button => button.classList.toggle('active', button === tab));
    const search = sheet.querySelector('[data-trade-search-input]');
    if (search) search.value = saved.search || '';
    if (typeof applyTradeCatalogFilters === 'function') applyTradeCatalogFilters(sheet);
  });

  (state.maps || []).forEach((saved, index) => {
    const page = saved.key
      ? scope.querySelector(`.map-template-page[data-map-template-page="${inlineEditorCssEscape(saved.key)}"]`)
      : null;
    const target = page || scope.querySelectorAll('.map-template-page[data-map-template-page]')[index];
    if (!target) return;
    if (typeof setMapTemplateActiveTab === 'function') setMapTemplateActiveTab(target, saved.tab || 0);
    target.classList.toggle('sidebar-collapsed', !!saved.sidebarCollapsed);
  });

  (state.hierarchies || []).forEach(saved => {
    const page = scope.querySelectorAll('.hierarchy-page')[saved.index];
    if (!page) return;
    page.querySelectorAll('[data-hierarchy-tree-tab]').forEach(button => {
      const active = button.dataset.hierarchyTreeTab === String(saved.tree || '0');
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    page.querySelectorAll('[data-hierarchy-tree-panel]').forEach(panel => {
      panel.classList.toggle('active', panel.dataset.hierarchyTreePanel === String(saved.tree || '0'));
    });
    page.classList.toggle('sidebar-collapsed', !!saved.sidebarCollapsed);
    page.classList.toggle('intro-collapsed', !!saved.introCollapsed);
    page.classList.toggle('fullscreen-active', !!saved.fullscreen);
    if (saved.scale && typeof setHierarchyRuntimeScale === 'function') setHierarchyRuntimeScale(page, saved.scale);
    const viewport = page.querySelector('.hierarchy-chart-viewport');
    if (viewport) {
      viewport.scrollTop = saved.chartTop || 0;
      viewport.scrollLeft = saved.chartLeft || 0;
    }
  });

  (state.inventories || []).forEach(saved => {
    const page = scope.querySelectorAll('.character-inventory-page')[saved.index];
    const tab = saved.category ? page?.querySelector(`[data-ci-action="filter-items"][data-ci-category="${inlineEditorCssEscape(saved.category)}"]`) : null;
    if (!page || !tab) return;
    page.querySelectorAll('[data-ci-action="filter-items"]').forEach(button => button.classList.toggle('active', button === tab));
    page.querySelectorAll('.ci-item-row').forEach(row => {
      row.hidden = row.dataset.ciCategory !== saved.category;
    });
  });
}

function captureInlineModuleViewportState() {
  if (!_inlineModuleEdit?.active) return null;
  const editPane = document.querySelector('.inline-module-edit-pane');
  const previewStage = document.querySelector('.inline-module-preview-stage');
  const previewFrame = document.querySelector('.inline-module-preview-frame');
  if (!editPane && !previewStage) return null;
  return {
    editTop: editPane?.scrollTop || 0,
    editLeft: editPane?.scrollLeft || 0,
    previewTop: previewStage?.scrollTop || 0,
    previewLeft: previewStage?.scrollLeft || 0,
    previewRuntime: captureInlinePreviewRuntimeState(previewFrame || previewStage || document)
  };
}

function restoreInlineModuleViewportState(state) {
  if (!state || !_inlineModuleEdit?.active) return;
  requestAnimationFrame(() => {
    const editPane = document.querySelector('.inline-module-edit-pane');
    const previewStage = document.querySelector('.inline-module-preview-stage');
    if (editPane) {
      editPane.scrollTop = state.editTop || 0;
      editPane.scrollLeft = state.editLeft || 0;
    }
    if (previewStage) {
      previewStage.scrollTop = state.previewTop || 0;
      previewStage.scrollLeft = state.previewLeft || 0;
    }
    restoreInlinePreviewRuntimeState(state.previewRuntime, document.querySelector('.inline-module-preview-frame') || document);
  });
}

function getInlineModuleEditSignature(context = _inlineModuleEdit) {
  if (!context?.draft) return '';
  try {
    return modulePayloadToJson({
      section: cleanCustomSection({ ...(context.section || getPreferredEditorSection()), entries: [] }),
      entry: sanitizeModuleEntry(context.draft)
    });
  } catch {
    return '';
  }
}

function setInlineModuleEditCleanBaseline() {
  if (!_inlineModuleEdit?.draft) return;
  _inlineModuleEdit.initialSignature = getInlineModuleEditSignature(_inlineModuleEdit);
}

function hasUnsavedInlineModuleEditChanges() {
  if (!_inlineModuleEdit?.active) return false;
  const currentSignature = getInlineModuleEditSignature(_inlineModuleEdit);
  return !!currentSignature && !!_inlineModuleEdit.initialSignature && currentSignature !== _inlineModuleEdit.initialSignature;
}

function confirmDiscardInlineModuleEditChanges(actionLabel = 'fortfahren') {
  if (!hasUnsavedInlineModuleEditChanges()) return true;
  return confirm(`Ungespeicherte Änderungen an diesem Modul gehen verloren.\n\nTrotzdem ${actionLabel}?`);
}

function isInlineEditingEntry(entry) {
  return !!(_inlineModuleEdit?.active && entry?.id && String(entry.id) === String(_inlineModuleEdit.entryId || ''));
}

function getRenderableEntry(entry) {
  return isInlineEditingEntry(entry) ? _inlineModuleEdit.draft : entry;
}

function getInlineDraftPage(pageIndex = null) {
  const resolvedIndex = pageIndex == null && _inlineEditorEventSource
    ? getInlineEditorPageIndex(_inlineEditorEventSource)
    : (pageIndex == null ? currentPage : pageIndex);
  return _inlineModuleEdit?.draft?.pages?.[resolvedIndex] || null;
}

function getInlineEditorPageIndex(source) {
  const index = Number(source?.closest?.('[data-inline-page-index]')?.dataset.inlinePageIndex);
  return Number.isInteger(index) && index >= 0 ? index : currentPage;
}

function getInlineDraftPageForSource(source) {
  return getInlineDraftPage(getInlineEditorPageIndex(source));
}

function refreshInlineModuleLivePreview() {
  if (!_inlineModuleEdit?.active) return;
  const frame = document.querySelector('.inline-module-preview-frame');
  const page = getInlineDraftPage();
  if (!frame || !page || !_inlineModuleEdit.draft) return;
  const runtimeState = captureInlinePreviewRuntimeState(frame);
  frame.innerHTML = buildInlineModulePreview(page, _inlineModuleEdit.draft, currentPage, getPages(_inlineModuleEdit.draft).length);
  restoreInlinePreviewRuntimeState(runtimeState, frame);
}

function scheduleInlineModuleLivePreviewRefresh() {
  if (!_inlineModuleEdit?.active) return;
  clearTimeout(_inlinePreviewRefreshTimer);
  _inlinePreviewRefreshTimer = setTimeout(refreshInlineModuleLivePreview, 0);
}

function bindInlineModuleLivePreviewSync() {
  if (document.body.dataset.inlinePreviewBound === '1') return;
  document.body.dataset.inlinePreviewBound = '1';
  document.addEventListener('input', event => {
    if (event.target?.closest?.('.inline-module-edit-pane')) scheduleInlineModuleLivePreviewRefresh();
  });
  document.addEventListener('change', event => {
    if (event.target?.closest?.('.inline-module-edit-pane')) scheduleInlineModuleLivePreviewRefresh();
  });
}

function buildInlineSectionOptions() {
  const currentSignature = makeSectionSignature(_inlineModuleEdit?.section || getPreferredEditorSection());
  const unique = [];
  const seen = new Set();
  getValidSections().forEach(section => {
    const signature = makeSectionSignature(section);
    if (seen.has(signature)) return;
    seen.add(signature);
    unique.push(section);
  });
  return unique.map(section => {
    const signature = makeSectionSignature(section);
    const label = getSectionOptionLabel(section);
    return `<option value="${escapeHtml(signature)}"${signature === currentSignature ? ' selected' : ''}>${escapeHtml(label)}</option>`;
  }).join('');
}

function buildInlineSectionPicker() {
  return `
    <div class="inline-edit-field wide">
      <span class="inline-edit-label">Ziel-Reiter</span>
      <select class="inline-edit-select" data-inline-action="set-module-section">
        ${buildInlineSectionOptions()}
      </select>
    </div>`;
}

function buildInlineModuleSizeControls(entry) {
  const size = getModuleDisplaySize(entry);
  return `
    <div class="inline-edit-field">
      <span class="inline-edit-label">Breite <span class="inline-size-value">${size.width}%</span></span>
      <input class="inline-size-range" type="range" min="${MODULE_SIZE_MIN}" max="${MODULE_SIZE_MAX}" step="1" value="${size.width}" data-inline-action="sync-module-size-field" data-entry-field="moduleWidth">
    </div>
    <div class="inline-edit-field">
      <span class="inline-edit-label">Höhe / Länge <span class="inline-size-value">${size.height}%</span></span>
      <input class="inline-size-range" type="range" min="${MODULE_SIZE_MIN}" max="${MODULE_SIZE_MAX}" step="1" value="${size.height}" data-inline-action="sync-module-size-field" data-entry-field="moduleHeight">
    </div>`;
}

function setInlineModuleSection(signature) {
  if (!_inlineModuleEdit) return;
  const section = getValidSections().find(candidate => makeSectionSignature(candidate) === signature);
  if (!section) return;
  _inlineModuleEdit.section = {
    key: section.key,
    tab: section.tab || section.key,
    desc: section.desc || '',
    path: getSectionPathParts(section),
    nodeId: section.nodeId || ensureModuleNodeForSection(section)
  };
  if (_inlineModuleEdit.draft && (!String(_inlineModuleEdit.draft.category || '').trim() || _inlineModuleEdit.mode === 'new')) {
    _inlineModuleEdit.draft.category = section.key;
  }
}

function applyInlineModuleTemplate(selectEl) {
  if (!_inlineModuleEdit?.draft) return;
  const templateId = selectEl?.value || 'story';
  if (!confirm(`Vorlage anwenden?\n\nDie aktuelle Seitenstruktur wird durch "${getModuleTemplateLabel(templateId)}" ersetzt.`)) {
    if (selectEl) selectEl.value = inferModuleTemplateType(_inlineModuleEdit.draft);
    return;
  }
  const existing = _inlineModuleEdit.draft;
  _inlineModuleEdit.draft = createModuleTemplateDraft(
    templateId,
    _inlineModuleEdit.section || getPreferredEditorSection(),
    existing
  );
  _inlineModuleEdit.entryId = _inlineModuleEdit.draft.id;
  currentEntry = _inlineModuleEdit.draft;
  currentPage = 0;
  renderPage(0, 0);
}

function openModuleEditorForImport() {
  const preferred = getPreferredEditorSection();
  const draft = createModuleTemplateDraft('story', preferred);
  openModuleEditor(
    { section: preferred, entry: draft },
    {
      mode: 'new',
      sourceKind: 'new',
      sourceEntryId: '',
      sectionSignature: preferred.signature
    }
  );
}

function openModuleEditorForNew() {
  const preferred = getPreferredEditorSection();
  const draft = createModuleTemplateDraft('story', preferred);

  _inlineModuleEdit = {
    active: true,
    mode: 'new',
    sourceKind: 'new',
    entryId: draft.id,
    section: {
      key: preferred.key,
      tab: preferred.tab,
      desc: preferred.desc || '',
      path: getSectionPathParts(preferred),
      nodeId: preferred.nodeId || ensureModuleNodeForSection(preferred)
    },
    draft
  };
  setInlineModuleEditCleanBaseline();

  currentEntry = draft;
  currentPage = 0;
  renderPage(0, 0);
  document.body.style.overflow = 'hidden';
  activateDialog('modal-overlay', { initialFocus: '.modal-close' });
}

function openModuleEditorForEntry(entryId) {
  const payload = buildModuleExportPayload(entryId);
  if (!payload) return;
  const sourceKind = findCustomSectionByEntryId(entryId)
    ? 'custom'
    : (_entryOverrides[entryId] ? 'override' : 'builtin');
  _inlineModuleEdit = {
    active: true,
    mode: 'edit',
    sourceKind,
    entryId,
    section: {
      key: payload.section.key,
      tab: payload.section.tab,
      desc: payload.section.desc || '',
      path: getSectionPathParts(payload.section),
      nodeId: payload.section.nodeId || ensureModuleNodeForSection(payload.section)
    },
    draft: sanitizeModuleEntry(payload.entry)
  };
  setInlineModuleEditCleanBaseline();
  renderPage(Math.min(currentPage, Math.max(0, getPages(_inlineModuleEdit.draft).length - 1)), 0);
}

function openModuleEditorForCurrent() {
  if (!currentEntry?.id) return;
  openModuleEditorForEntry(currentEntry.id);
}

function cancelInlineModuleEdit() {
  if (!_inlineModuleEdit) return;
  if (!confirmDiscardInlineModuleEditChanges('abbrechen')) return;
  const context = _inlineModuleEdit;
  _inlineModuleEdit = null;
  if (context.mode === 'new') {
    closeModal();
    renderAll();
    return;
  }
  const current = findCurrentSectionByEntryId(context.entryId);
  if (!current) {
    closeModal();
    return;
  }
  currentEntry = current.entry;
  currentPage = Math.min(currentPage, Math.max(0, getPages(currentEntry).length - 1));
  renderPage(currentPage, 0);
}

function saveInlineModuleEdit() {
  if (!_inlineModuleEdit?.draft) return;
  try {
    const context = _inlineModuleEdit;
    const payload = {
      section: cleanCustomSection({ ...context.section, entries: [] }),
      entry: sanitizeModuleEntry(context.draft)
    };
    if (context.mode === 'edit') payload.entry.id = context.entryId;
    const validation = assertValidModulePayload(payload, {
      mode: context.mode,
      sourceKind: context.sourceKind,
      sourceEntryId: context.entryId
    });
    const { section, entry } = validation;
    entry.id = String(entry.id || '').trim() || slugify(entry.title || 'modul');

    if (context.mode === 'edit') {
      if (context.sourceKind === 'custom') {
        removeCustomModuleById(context.entryId);
        upsertCustomModule(section, { ...entry, id: context.entryId });
        entry.id = context.entryId;
      } else {
        _entryOverrides[context.entryId] = { ...entry, id: context.entryId };
        entry.id = context.entryId;
        unhideModuleEntry(context.entryId);
        setModuleSectionMove(context.entryId, section);
      }
    } else {
      removeCustomModuleById(entry.id);
      delete _entryOverrides[entry.id];
      const builtin = findBuiltinSectionByEntryId(entry.id);
      if (builtin) {
        _entryOverrides[entry.id] = entry;
        unhideModuleEntry(entry.id);
        setModuleSectionMove(entry.id, section);
      }
      else upsertCustomModule(section, entry);
    }

    saveModuleStore();
    _inlineModuleEdit = null;
    refreshAfterModuleChange(entry.id);
  } catch (error) {
    alert(error.message || 'Modul konnte nicht gespeichert werden.');
  }
}

