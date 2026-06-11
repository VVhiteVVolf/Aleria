// Inline module editor state, lifecycle, and save/cancel flow.
// Kept separate from type-specific editor builders to limit side effects.

let _inlineModuleEdit = null;
let _inlinePreviewRefreshTimer = null;
let _inlineEditorEventSource = null;

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
  frame.innerHTML = buildInlineModulePreview(page, _inlineModuleEdit.draft, currentPage, getPages(_inlineModuleEdit.draft).length);
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
    const label = section.tab || section.key;
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
    desc: section.desc || ''
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
      desc: preferred.desc || ''
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
      desc: payload.section.desc || ''
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
        setModuleSectionMove(context.entryId, section);
      }
    } else {
      removeCustomModuleById(entry.id);
      delete _entryOverrides[entry.id];
      const builtin = findBuiltinSectionByEntryId(entry.id);
      if (builtin) {
        _entryOverrides[entry.id] = entry;
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

