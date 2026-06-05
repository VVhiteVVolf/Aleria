function collectModuleEditorPayload() {
  const sectionSelect = document.getElementById('me-section-select');
  const isNewSection = sectionSelect?.value === '__new__';
  let section;

  if (isNewSection) {
    const key = document.getElementById('me-new-section-key')?.value.trim() || '';
    const tab = document.getElementById('me-new-section-tab')?.value.trim() || key;
    if (!key) throw new Error('Bitte gib einen Namen für den neuen Bereich an.');
    section = {
      key,
      tab: tab || key,
      desc: document.getElementById('me-new-section-desc')?.value.trim() || ''
    };
  } else {
    const target = getValidSections().find(item => makeSectionSignature(item) === sectionSelect?.value);
    if (!target) throw new Error('Bitte wähle einen Zielbereich.');
    section = {
      key: target.key,
      tab: target.tab || target.key,
      desc: target.desc || ''
    };
  }

  const title = document.getElementById('me-title')?.value.trim() || '';
  if (!title) throw new Error('Das Modul braucht einen Titel.');

  const cards = Array.from(document.querySelectorAll('#me-pages .module-page-card'));
  if (!cards.length) throw new Error('Bitte lege mindestens eine Seite an.');

  const pages = cards.map((card, index) => {
    try {
      return collectModulePageFromCard(card);
    } catch (error) {
      throw new Error(`Seite ${index + 1}: ${error.message}`);
    }
  });

  const globalCast = parseModuleCastIds(document.getElementById('me-session-cast-global')?.value || '');
  const globalCastDetails = collectModuleCastDetailsFromField(document.getElementById('me-session-cast-global')?.closest('.me-cast-field'), globalCast);
  const entry = sanitizeModuleEntry({
    id: document.getElementById('me-entry-id')?.value.trim() || slugify(title || 'modul'),
    title,
    subtitle: document.getElementById('me-subtitle')?.value.trim() || '',
    type: document.getElementById('me-type')?.value.trim() || '',
    category: document.getElementById('me-category')?.value.trim() || '',
    moduleWidth: document.getElementById('me-module-width')?.value || MODULE_SIZE_DEFAULT,
    moduleHeight: document.getElementById('me-module-height')?.value || MODULE_SIZE_DEFAULT,
    image: document.getElementById('me-image')?.value.trim() || pages[0]?.image || '',
    stamp: document.getElementById('me-stamp')?.value.trim() || '',
    icon: document.getElementById('me-icon')?.value.trim() || '',
    symbol: document.getElementById('me-symbol')?.value.trim() || '',
    locked: !!document.getElementById('me-locked')?.checked,
    multipage: true,
    appendCommentsPage: !!document.getElementById('me-comments-page')?.checked,
    enablePageComments: !!document.getElementById('me-page-comments-enabled')?.checked,
    sessionCast: globalCast,
    sessionCastDetails: globalCastDetails,
    pages
  });

  return { section, entry };
}

function updateModuleSizeEditorLabels() {
  const width = clampModuleSizeValue(document.getElementById('me-module-width')?.value, MODULE_SIZE_DEFAULT);
  const height = clampModuleSizeValue(document.getElementById('me-module-height')?.value, MODULE_SIZE_DEFAULT);
  const widthLabel = document.getElementById('me-module-width-label');
  const heightLabel = document.getElementById('me-module-height-label');
  if (widthLabel) widthLabel.textContent = `${width}%`;
  if (heightLabel) heightLabel.textContent = `${height}%`;
}

function syncModuleJsonPreview() {
  const output = document.getElementById('me-json');
  if (!output) return;
  refreshModuleEditorCardTitles();
  updateModuleStoreSizePanel();
  try {
    const payload = collectModuleEditorPayload();
    output.value = modulePayloadToJson(payload);
    setModuleEditorStatus('');
    renderModuleEditorPreview(payload);
  } catch (error) {
    output.value = '';
    renderModuleEditorPreview(null, error.message || 'Vorschau konnte nicht erzeugt werden.');
  }
}

function populateModuleEditor(payload, context, options = {}) {
  _moduleEditorHydrating = true;
  _moduleEditorContext = context;
  const preferredSignature = makeSectionSignature(payload.section || getPreferredEditorSection());
  buildModuleEditorSectionOptions(context?.sectionSignature || preferredSignature);

  const knownSignatures = new Set(getValidSections().map(section => makeSectionSignature(section)));
  const effectiveSignature = context?.sectionSignature === '__new__'
    ? '__new__'
    : (knownSignatures.has(preferredSignature) ? preferredSignature : '__new__');

  document.getElementById('me-section-select').value = effectiveSignature;
  toggleModuleEditorSectionMode();

  document.getElementById('me-new-section-key').value = effectiveSignature === '__new__' ? (payload.section?.key || '') : '';
  document.getElementById('me-new-section-tab').value = effectiveSignature === '__new__' ? (payload.section?.tab || '') : '';
  document.getElementById('me-new-section-desc').value = effectiveSignature === '__new__' ? (payload.section?.desc || '') : '';

  document.getElementById('me-entry-id').value = payload.entry?.id || '';
  document.getElementById('me-entry-id').disabled = context?.mode === 'edit';
  document.getElementById('me-title').value = payload.entry?.title || '';
  document.getElementById('me-subtitle').value = payload.entry?.subtitle || '';
  if (document.getElementById('me-template')) {
    document.getElementById('me-template').innerHTML = buildModuleTemplateOptions(inferModuleTemplateType(payload.entry));
  }
  document.getElementById('me-type').value = payload.entry?.type || '';
  document.getElementById('me-category').value = payload.entry?.category || '';
  document.getElementById('me-module-width').value = clampModuleSizeValue(payload.entry?.moduleWidth, MODULE_SIZE_DEFAULT);
  document.getElementById('me-module-height').value = clampModuleSizeValue(payload.entry?.moduleHeight, MODULE_SIZE_DEFAULT);
  updateModuleSizeEditorLabels();
  document.getElementById('me-image').value = payload.entry?.image || '';
  document.getElementById('me-stamp').value = payload.entry?.stamp || '';
  document.getElementById('me-icon').value = payload.entry?.icon || '✦';
  document.getElementById('me-symbol').value = payload.entry?.symbol || '';
  document.getElementById('me-locked').checked = !!payload.entry?.locked;
  document.getElementById('me-comments-page').checked = payload.entry?.appendCommentsPage !== false;
  document.getElementById('me-page-comments-enabled').checked = !!payload.entry?.enablePageComments;
  document.getElementById('me-session-cast-global').value = getModuleCastIdsFromSource(payload.entry).join(', ');
  renderModuleGlobalCastPicker(getModuleCastIdsFromSource(payload.entry), getModuleCastDetailsFromSource(payload.entry));

  _moduleEditorPreviewPageIndex = 0;
  renderModuleEditorPages(payload.entry?.pages?.length ? payload.entry.pages : [createDefaultModulePage()]);
  document.getElementById('me-delete-btn').style.display = context?.mode === 'edit' ? 'inline-block' : 'none';
  document.getElementById('me-delete-btn').textContent = context?.sourceKind === 'custom' ? 'Modul löschen' : 'Änderungen verwerfen';
  setModuleEditorStatus('');
  syncModuleJsonPreview();
  if (options.resetBaseline === false) {
    setModuleEditorDirtyState(true);
  } else {
    setModuleEditorCleanBaseline();
  }
  _moduleEditorHydrating = false;
}

function showModuleEditorForm() {
  document.getElementById('module-editor-gate').style.display = _moduleEditorAuthorized ? 'none' : 'flex';
  document.getElementById('module-editor-body').classList.toggle('visible', _moduleEditorAuthorized);
  if (_moduleEditorAuthorized && _moduleEditorContext?.payload) {
    populateModuleEditor(_moduleEditorContext.payload, _moduleEditorContext);
  }
}

function openModuleEditor(payload, context) {
  _moduleEditorContext = { ...context, payload };
  _moduleEditorPendingCommentImport = null;
  clearModuleEditorUndoSnapshot();
  bindModuleEditorLiveSync();
  document.getElementById('me-code').value = '';
  document.getElementById('me-code-error').style.display = 'none';
  showModuleEditorForm();
  activateDialog('module-editor-overlay', {
    initialFocus: _moduleEditorAuthorized ? '#me-title, #me-json, button, input, textarea, select' : '#me-code'
  });
  scheduleModuleEditorPreviewRefresh();
}

function closeModuleEditor() {
  if (!confirmDiscardModuleEditorChanges('schließen')) return;
  deactivateDialog('module-editor-overlay');
  setModuleEditorStatus('');
  clearModuleDragMarkers();
  setModuleEditorDirtyState(false);
}

async function unlockModuleEditor() {
  const input = document.getElementById('me-code');
  const error = document.getElementById('me-code-error');
  const code = (input?.value || '').trim();
  if (!code) {
    error.style.display = 'block';
    error.textContent = 'Bitte Code eingeben.';
    return;
  }

  try {
    const hash = await hashModuleEditorCode(code);
    const storedHash = getStoredModuleEditorCodeHash();
    if (!storedHash) {
      setStoredModuleEditorCodeHash(hash);
      error.style.display = 'none';
      setModuleEditorStatus('Lokaler Redaktionscode fuer diesen Browser gesetzt.');
    } else if (hash !== storedHash) {
      error.style.display = 'block';
      error.textContent = 'Falscher Code.';
      return;
    } else {
      error.style.display = 'none';
    }
    if (window._fb?.setCommentAdminCode) {
      try {
        await window._fb.setCommentAdminCode(code);
      } catch (adminError) {
        console.error('comment admin code sync failed:', adminError);
        showFriendlyAppError(adminError, 'Redaktionscode wurde lokal akzeptiert, aber nicht als Kommentar-Admincode synchronisiert.');
      }
    }
  } catch (e) {
    error.style.display = 'block';
    error.textContent = getFriendlyErrorMessage(e, 'Code konnte nicht geprueft werden.');
    return;
  }

  _moduleEditorAuthorized = true;
  showModuleEditorForm();
  scheduleModuleEditorPreviewRefresh();
}


function refreshAfterModuleChange(entryIdToOpen) {
  const modalWasOpen = document.getElementById('modal-overlay')?.classList.contains('active');
  const previousPage = currentPage;
  const next = entryIdToOpen ? findCurrentSectionByEntryId(entryIdToOpen) : null;
  if (next) {
    _archiveSearch = '';
    _archiveSearchNeedle = '';
    _activeTab = next.section.tab || next.section.key || 'Alle';
  }
  renderAll();
  loadSidebarFeed();
  if (!modalWasOpen) return;
  if (next) {
    currentEntry = next.entry;
    currentPage = Math.min(previousPage, Math.max(0, getPages(currentEntry).length - 1));
    renderPage(currentPage, 0);
    activateDialog('modal-overlay', { initialFocus: '.modal-close' });
    document.body.style.overflow = 'hidden';
  } else {
    closeModal();
  }
}

async function saveModuleFromEditor() {
  try {
    const payload = collectModuleEditorPayload();
    const context = _moduleEditorContext || { mode: 'new', sourceKind: 'new', sourceEntryId: '' };
    if (context.mode === 'edit' && context.sourceEntryId) payload.entry.id = context.sourceEntryId;
    const validation = assertValidModulePayload(payload, context);
    const { section, entry } = validation;
    const builtin = findBuiltinSectionByEntryId(entry.id);
    const existingCustom = findCustomSectionByEntryId(entry.id);

    if (context.mode === 'edit') {
      if (context.sourceKind === 'custom') {
        entry.id = context.sourceEntryId;
        removeCustomModuleById(context.sourceEntryId);
        upsertCustomModule(section, entry);
      } else {
        entry.id = context.sourceEntryId;
        _entryOverrides[context.sourceEntryId] = entry;
      }
    } else if (builtin) {
      entry.id = builtin.entry.id;
      removeCustomModuleById(entry.id);
      _entryOverrides[entry.id] = entry;
    } else {
      if (existingCustom && !confirm('Ein eigenes Modul mit dieser ID existiert bereits. Soll es überschrieben werden?')) {
        return;
      }
      if (_entryOverrides[entry.id] && !confirm('Zu dieser ID existiert bereits eine gespeicherte Bearbeitung. Soll sie überschrieben werden?')) {
        return;
      }
      removeCustomModuleById(entry.id);
      delete _entryOverrides[entry.id];
      upsertCustomModule(section, entry);
    }

    saveModuleStore();
    const pendingCommentImport = _moduleEditorPendingCommentImport;
    let importedCommentSummary = null;
    if (pendingCommentImport) {
      setModuleEditorStatus('Modul gespeichert. Kommentare werden importiert...');
      importedCommentSummary = await importModuleCommentsBundle(pendingCommentImport, entry.id);
      _moduleEditorPendingCommentImport = null;
    }
    refreshAfterModuleChange(entry.id);
    const savedPayload = buildModuleExportPayload(entry.id);
    if (savedPayload) {
      const sourceKind = findCustomSectionByEntryId(entry.id)
        ? 'custom'
          : (_entryOverrides[entry.id] ? 'override' : 'builtin');
      populateModuleEditor(savedPayload, {
        mode: 'edit',
        sourceKind,
        sourceEntryId: entry.id,
        sectionSignature: makeSectionSignature(savedPayload.section)
      });
    }
    if (importedCommentSummary) {
      setModuleEditorStatus(`Modul gespeichert ✓ Kommentare importiert: ${importedCommentSummary.commentCount} Kommentare, ${importedCommentSummary.turnCount} Redestab-Stände.`);
      updateFirebaseSyncStatus('synced', 'Modulpaket importiert.');
    } else {
      setModuleEditorStatus('Modul gespeichert ✓');
    }
  } catch (error) {
    setModuleEditorStatus(error.message || 'Modul konnte nicht gespeichert werden.', true);
  }
}

function deleteModuleFromEditor() {
  const context = _moduleEditorContext;
  if (!context || context.mode !== 'edit') return;
  if (!confirm(context.sourceKind === 'custom'
      ? 'Dieses benutzerdefinierte Modul wirklich löschen?'
      : 'Die lokale Bearbeitung dieses Moduls wirklich verwerfen und auf den HTML-Stand zurücksetzen?')) {
    return;
  }

  if (context.sourceKind === 'custom') {
    removeCustomModuleById(context.sourceEntryId);
  } else {
    delete _entryOverrides[context.sourceEntryId];
  }

  saveModuleStore();
  setModuleEditorDirtyState(false);
  closeModuleEditor();
  refreshAfterModuleChange(context.sourceEntryId);
}
