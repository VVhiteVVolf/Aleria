// Form, preview, save, and edit flow for modules embedded in scene comments.
let _moduleInsertAfterId = null;
let _editingModuleInsertCommentId = null;

function getSceneModuleInsertSection() {
  const preferred = typeof getPreferredEditorSection === 'function' ? getPreferredEditorSection() : null;
  if (preferred) {
    return {
      key: preferred.key,
      tab: preferred.tab || preferred.key,
      desc: preferred.desc || '',
      path: getSectionPathParts(preferred),
      nodeId: preferred.nodeId || ensureModuleNodeForSection(preferred),
      signature: preferred.signature || makeSectionSignature(preferred)
    };
  }
  return {
    key: 'Interaktive Szene',
    tab: 'Interaktive Szene',
    desc: 'Nur innerhalb der aktuellen interaktiven Szene sichtbar.',
    path: ['Interaktive Szene']
  };
}

function createSceneModuleInsertDraft(existing = {}) {
  const preferred = getSceneModuleInsertSection();
  const existingEntry = existing?.entry || existing || {};
  const draft = existingEntry?.pages?.length
    ? sanitizeModuleEntry(existingEntry)
    : createModuleTemplateDraft('story', preferred, {
        ...existingEntry,
        id: existingEntry.id || `scene-module-${Date.now()}`,
        category: existingEntry.category || preferred.key,
        stamp: existingEntry.stamp || preferred.key,
        appendCommentsPage: false,
        enablePageComments: false
      });
  draft.id = String(draft.id || `scene-module-${Date.now()}`).trim();
  draft.category = draft.category || preferred.key;
  return draft;
}

function buildSceneModuleInsertEditorPayload(item = null) {
  const section = getSceneModuleInsertSection();
  const entry = item?.entry
    ? createSceneModuleInsertDraft(item.entry)
    : createSceneModuleInsertDraft();
  return { section, entry };
}

function buildSceneModuleInsertContext(overrides = {}) {
  return {
    mode: overrides.mode || 'new',
    sourceKind: 'scene-comment-module',
    sourceEntryId: overrides.sourceEntryId || '',
    commentId: overrides.commentId || '',
    insertAfterId: overrides.insertAfterId || '',
    threadId: getCurrentCommentThreadId(),
    narratorText: overrides.narratorText || '',
    sectionSignature: overrides.sectionSignature || '',
    skipIdConflict: true
  };
}

function openSceneModuleInsertEditor(contextOverrides = {}, item = null) {
  const payload = buildSceneModuleInsertEditorPayload(item);
  const context = buildSceneModuleInsertContext({
    ...contextOverrides,
    sectionSignature: contextOverrides.sectionSignature || makeSectionSignature(payload.section)
  });
  openModuleEditor(payload, context);
  setModuleEditorStatus(context.mode === 'edit'
    ? 'Dieses Modul ist nur in dieser interaktiven Szene verankert.'
    : 'Neues Szenenmodul: Speicherung erfolgt nur in dieser interaktiven Szene.');
}

function buildSceneModuleInsertItemFromPayload(payload) {
  const entry = sanitizeModuleEntry(payload?.entry || {});
  const firstPage = getPages(entry)[0] || {};
  delete entry.sessionCast;
  delete entry.sessionCastDetails;
  entry.locked = false;
  entry.appendCommentsPage = false;
  entry.enablePageComments = false;
  return normalizeCommentModuleInsertItem({
    entry: {
      ...entry,
      appendCommentsPage: false,
      enablePageComments: false
    },
    templateId: inferModuleTemplateType(entry),
    teaser: firstPage.pageTitle || entry.subtitle || '',
    pageTitle: firstPage.pageTitle || '',
    page: firstPage
  });
}

function serializeSceneModuleInsertForStorage(item) {
  return JSON.stringify(item || null);
}

function buildSceneModuleInsertMetadata(item, orderKey) {
  const metadata = {
    commentMode: 'module-insert',
    commentKind: 'narrator',
    avatarKind: 'narrator',
    characterId: '',
    emoteIndex: null,
    commentSegments: null,
    itemShowcase: null,
    documentAttachment: null,
    moduleInsert: null,
    moduleInsertJson: serializeSceneModuleInsertForStorage(item),
    schemaVersion: 5
  };
  if (Number.isFinite(Number(orderKey))) metadata.orderKey = Number(orderKey);
  return metadata;
}

async function persistSceneModuleInsertFromEditor(payload, context = {}) {
  const threadId = context.threadId || getCurrentCommentThreadId();
  const item = buildSceneModuleInsertItemFromPayload(payload);
  if (!threadId) throw new Error('Das Modul konnte keiner Szene zugeordnet werden.');
  if (!item) throw new Error('Bitte mindestens einen Modultitel eintragen.');

  const text = String(context.narratorText || '').trim()
    || `Der Erzaehler fuegt ein Modul ein: ${item.title}`;
  if ((text + item.title + item.subtitle).length > COMMENT_MAX_LENGTH) {
    throw new Error(`Bitte bei maximal ${COMMENT_MAX_LENGTH} Zeichen bleiben.`);
  }

  const metadata = buildSceneModuleInsertMetadata(
    item,
    context.mode === 'edit' ? undefined : getNextCommentOrderKey(threadId, context.insertAfterId)
  );

  let backend = null;
  try {
    backend = await getCommentBackend({ timeoutMs: 1200, preferRemote: true });
    if (backend?._localFallback) {
      throw new Error('Firebase ist fuer Szenenmodule gerade nicht erreichbar. Bitte spaeter erneut speichern, damit nichts nur lokal verschwindet.');
    }
    if (context.mode === 'edit' && context.commentId) {
      await backend.updateComment(context.commentId, {
        text,
        charName: 'Erzaehler',
        charTitle: '',
        portrait: null,
        narrator: true,
        ...metadata
      });
    } else {
      await backend.addComment(threadId, 'Erzaehler', '', null, text, COMMENT_DELETE_CODE, true, metadata);
    }
  } catch (error) {
    console.error('scene module insert remote save failed:', error);
    throw error;
  }

  setModuleEditorDirtyState(false);
  closeModuleEditor();
  await loadCommentsIntoPage(threadId, true, context.insertAfterId ? {} : { page: 'last' });
  if (typeof refreshCurrentModuleCommenterHighlights === 'function') refreshCurrentModuleCommenterHighlights();
  loadSidebarFeed();
}

async function deleteSceneModuleInsertFromEditor(context = {}) {
  if (!context.commentId) return;
  if (!confirm('Dieses eingefuegte Modul wirklich aus der Szene loeschen?')) return;
  const threadId = context.threadId || getCurrentCommentThreadId();
  let backend = null;
  try {
    backend = await getCommentBackend({ timeoutMs: 1200 });
    await backend.deleteComment(context.commentId, COMMENT_DELETE_CODE);
  } catch (error) {
    if (!backend || backend._localFallback) throw error;
    const localBackend = getLocalCommentBackend();
    await localBackend.deleteComment(context.commentId, COMMENT_DELETE_CODE);
    showCommentFallbackNotice();
  }
  setModuleEditorDirtyState(false);
  closeModuleEditor();
  await loadCommentsIntoPage(threadId, true);
  if (typeof refreshCurrentModuleCommenterHighlights === 'function') refreshCurrentModuleCommenterHighlights();
  loadSidebarFeed();
}

function setModuleInsertFormValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = String(value || '');
}

function ensureModuleInsertTemplateOptions(selected = 'story') {
  const select = document.getElementById('mf-template');
  if (!select || typeof buildModuleTemplateOptions !== 'function') return;
  select.innerHTML = buildModuleTemplateOptions(selected || 'story');
}

function applyModuleInsertTemplateDefaults() {
  const template = getCommentModuleTemplate(document.getElementById('mf-template')?.value || 'story');
  if (!template) return;
  const page = createCommentModuleDefaultPage(template.id, '');
  setModuleInsertFormValue('mf-title', template.defaultTitle || 'Neues Modul');
  setModuleInsertFormValue('mf-subtitle', template.defaultSubtitle || '');
  setModuleInsertFormValue('mf-type', template.entryType || 'Modul');
  setModuleInsertFormValue('mf-page-title', page.pageTitle || template.pageLabel || 'I. - Modul');
}

function collectModuleInsertFormPayload() {
  const templateId = document.getElementById('mf-template')?.value || 'story';
  const pageTitle = document.getElementById('mf-page-title')?.value || '';
  const page = createCommentModuleDefaultPage(templateId, pageTitle);
  const image = normalizeImageUrlForStorage(document.getElementById('mf-image')?.value || '') || '';
  const symbol = normalizeImageUrlForStorage(document.getElementById('mf-symbol')?.value || '') || '';
  if (image) page.image = image;
  return normalizeCommentModuleInsertItem({
    templateId,
    title: document.getElementById('mf-title')?.value || '',
    subtitle: document.getElementById('mf-subtitle')?.value || '',
    type: document.getElementById('mf-type')?.value || '',
    category: document.getElementById('mf-category')?.value || '',
    stamp: document.getElementById('mf-stamp')?.value || '',
    image,
    symbol,
    pageTitle,
    teaser: document.getElementById('mf-teaser')?.value || '',
    page
  });
}

function getModuleInsertImageValidationError() {
  const imageRaw = String(document.getElementById('mf-image')?.value || '').trim();
  const symbolRaw = String(document.getElementById('mf-symbol')?.value || '').trim();
  if (imageRaw && !normalizeImageUrlForStorage(imageRaw)) return 'Die Bild-URL ist ungueltig oder nicht erlaubt.';
  if (symbolRaw && !normalizeImageUrlForStorage(symbolRaw)) return 'Die Symbol-URL ist ungueltig oder nicht erlaubt.';
  return '';
}

function updateModuleInsertPreview() {
  const preview = document.getElementById('mf-preview');
  if (!preview) return;
  const item = collectModuleInsertFormPayload() || normalizeCommentModuleInsertItem({
    templateId: document.getElementById('mf-template')?.value || 'story',
    title: 'Neues Modul',
    pageTitle: 'I. - Modul'
  });
  preview.innerHTML = `
    <div class="comment-live-preview-head">
      <div class="comment-live-preview-kicker">Vorschau in der Szene</div>
    </div>
    <div class="comment-showcase-preview comment-module-insert-preview">
      ${renderCommentModuleInsertCard(item, { interactive: false })}
    </div>
    <div class="comment-live-preview-head showcase-final-preview-head">
      <div class="comment-live-preview-kicker">Modul-Vorschau</div>
    </div>
    <div class="comment-module-form-preview-shell">
      ${renderCommentModuleInsertProfileContent(item, { preview: true })}
    </div>`;
}

function resetModuleInsertForm() {
  ensureModuleInsertTemplateOptions('story');
  setModuleInsertFormValue('mf-template', 'story');
  applyModuleInsertTemplateDefaults();
  setModuleInsertFormValue('mf-category', 'Interaktive Szene');
  setModuleInsertFormValue('mf-stamp', '');
  setModuleInsertFormValue('mf-image', '');
  setModuleInsertFormValue('mf-symbol', '');
  setModuleInsertFormValue('mf-teaser', '');
  setModuleInsertFormValue('mf-text', '');
  const note = document.getElementById('mf-note');
  if (note) note.textContent = '';
  const error = document.getElementById('mf-error');
  if (error) {
    error.textContent = '';
    error.style.display = 'none';
  }
  const submit = document.getElementById('mf-submit');
  if (submit) {
    submit.disabled = false;
    submit.textContent = 'Modul einfuegen';
  }
  updateModuleInsertPreview();
}

function openModuleInsertForm() {
  _moduleInsertAfterId = null;
  _editingModuleInsertCommentId = null;
  openSceneModuleInsertEditor();
}

function openModuleInsertFormAfter(commentId) {
  _moduleInsertAfterId = String(commentId || '');
  _editingModuleInsertCommentId = null;
  openSceneModuleInsertEditor({ insertAfterId: _moduleInsertAfterId });
}

function closeModuleInsertForm() {
  deactivateDialog('module-insert-form-overlay');
  _moduleInsertAfterId = null;
  _editingModuleInsertCommentId = null;
}

function openCommentModuleInsertProfile(commentId) {
  const comment = findCachedCommentById(commentId);
  const item = getCommentModuleInsertItem(comment);
  const overlay = document.getElementById('module-insert-profile-overlay');
  const body = document.getElementById('mp-body');
  if (!overlay || !body || !item) return;
  body.innerHTML = renderCommentModuleInsertProfileContent(item);
  activateDialog('module-insert-profile-overlay', { initialFocus: '.module-insert-profile-close' });
}

function closeCommentModuleInsertProfile() {
  deactivateDialog('module-insert-profile-overlay');
}

async function submitModuleInsertItem() {
  const errEl = document.getElementById('mf-error');
  const btn = document.getElementById('mf-submit');
  const threadId = getCurrentCommentThreadId();
  const item = collectModuleInsertFormPayload();
  const narratorText = String(document.getElementById('mf-text')?.value || '').trim();

  if (!item) {
    errEl.textContent = 'Bitte mindestens einen Modultitel eintragen.';
    errEl.style.display = 'block';
    return;
  }
  const imageError = getModuleInsertImageValidationError();
  if (imageError) {
    errEl.textContent = imageError;
    errEl.style.display = 'block';
    return;
  }
  if ((narratorText + item.title + item.subtitle).length > COMMENT_MAX_LENGTH) {
    errEl.textContent = `Bitte bei maximal ${COMMENT_MAX_LENGTH} Zeichen bleiben.`;
    errEl.style.display = 'block';
    return;
  }
  if (!threadId) {
    errEl.textContent = 'Das Modul konnte keiner Szene zugeordnet werden.';
    errEl.style.display = 'block';
    return;
  }

  errEl.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Wird gespeichert...';
  const text = narratorText || `Der Erzaehler fuegt ein Modul ein: ${item.title}`;
  const metadata = {
    commentMode: 'module-insert',
    commentKind: 'narrator',
    avatarKind: 'narrator',
    characterId: '',
    emoteIndex: null,
    commentSegments: null,
    moduleInsert: null,
    moduleInsertJson: serializeSceneModuleInsertForStorage(item),
    orderKey: getNextCommentOrderKey(threadId, _moduleInsertAfterId),
    schemaVersion: 5
  };

  let backend = null;
  try {
    backend = await getCommentBackend({ timeoutMs: 1200 });
    await backend.addComment(threadId, 'Erzaehler', '', null, text, COMMENT_DELETE_CODE, true, metadata);
    closeModuleInsertForm();
    await loadCommentsIntoPage(threadId, true, _moduleInsertAfterId ? {} : { page: 'last' });
    if (typeof refreshCurrentModuleCommenterHighlights === 'function') refreshCurrentModuleCommenterHighlights();
    loadSidebarFeed();
  } catch (error) {
    if (backend && !backend._localFallback) {
      try {
        const localBackend = getLocalCommentBackend();
        await localBackend.addComment(threadId, 'Erzaehler', '', null, text, COMMENT_DELETE_CODE, true, metadata);
        showCommentFallbackNotice();
        closeModuleInsertForm();
        await loadCommentsIntoPage(threadId, true, _moduleInsertAfterId ? {} : { page: 'last' });
        return;
      } catch (localError) {
        console.warn('local module insert fallback save failed:', localError);
      }
    }
    const message = getFriendlyErrorMessage(error, 'Modul konnte nicht gespeichert werden.');
    errEl.textContent = message;
    errEl.style.display = 'block';
    if (typeof showAppStatus === 'function') showAppStatus(message, 'error');
    btn.disabled = false;
    btn.textContent = 'Modul einfuegen';
  }
}

function openEditModuleInsertForm(commentId) {
  const comment = findCachedCommentById(commentId);
  const item = getCommentModuleInsertItem(comment);
  if (!comment || !item) {
    alert('Modul konnte nicht geladen werden.');
    return;
  }

  _editingModuleInsertCommentId = String(commentId || '');
  _moduleInsertAfterId = null;
  openSceneModuleInsertEditor({
    mode: 'edit',
    commentId: _editingModuleInsertCommentId,
    sourceEntryId: item.entry?.id || '',
    narratorText: comment.text || ''
  }, item);
  return;

  ensureModuleInsertTemplateOptions(item.templateId);
  setModuleInsertFormValue('mf-template', item.templateId);
  setModuleInsertFormValue('mf-title', item.title);
  setModuleInsertFormValue('mf-subtitle', item.subtitle);
  setModuleInsertFormValue('mf-page-title', item.pageTitle);
  setModuleInsertFormValue('mf-category', item.category);
  setModuleInsertFormValue('mf-type', item.type);
  setModuleInsertFormValue('mf-stamp', item.stamp);
  setModuleInsertFormValue('mf-image', item.image);
  setModuleInsertFormValue('mf-symbol', item.symbol);
  setModuleInsertFormValue('mf-teaser', item.teaser);
  setModuleInsertFormValue('mf-text', comment.text || '');

  const note = document.getElementById('mf-note');
  if (note) note.textContent = 'Bearbeitung des eingefuegten Moduls';
  const error = document.getElementById('mf-error');
  if (error) {
    error.textContent = '';
    error.style.display = 'none';
  }
  const submit = document.getElementById('mf-submit');
  if (submit) {
    submit.disabled = false;
    submit.textContent = 'Aenderungen speichern';
  }
  updateModuleInsertPreview();
  activateDialog('module-insert-form-overlay', { initialFocus: '#mf-title' });
}

async function submitEditModuleInsert() {
  if (!_editingModuleInsertCommentId) return submitModuleInsertItem();

  const errEl = document.getElementById('mf-error');
  const btn = document.getElementById('mf-submit');
  const threadId = getCurrentCommentThreadId();
  const item = collectModuleInsertFormPayload();
  const narratorText = String(document.getElementById('mf-text')?.value || '').trim();

  if (!item) {
    errEl.textContent = 'Bitte mindestens einen Modultitel eintragen.';
    errEl.style.display = 'block';
    return;
  }
  const imageError = getModuleInsertImageValidationError();
  if (imageError) {
    errEl.textContent = imageError;
    errEl.style.display = 'block';
    return;
  }
  if (!threadId) {
    errEl.textContent = 'Das Modul konnte keiner Szene zugeordnet werden.';
    errEl.style.display = 'block';
    return;
  }

  errEl.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Wird gespeichert...';
  const commentId = _editingModuleInsertCommentId;
  const text = narratorText || `Der Erzaehler fuegt ein Modul ein: ${item.title}`;
  const metadata = {
    commentMode: 'module-insert',
    commentKind: 'narrator',
    avatarKind: 'narrator',
    characterId: '',
    emoteIndex: null,
    commentSegments: null,
    itemShowcase: null,
    documentAttachment: null,
    moduleInsert: null,
    moduleInsertJson: serializeSceneModuleInsertForStorage(item),
    schemaVersion: 5
  };

  let backend = null;
  try {
    backend = await getCommentBackend({ timeoutMs: 1200 });
    await backend.updateComment(commentId, {
      text,
      charName: 'Erzaehler',
      charTitle: '',
      portrait: null,
      narrator: true,
      ...metadata
    });
    closeModuleInsertForm();
    _editingModuleInsertCommentId = null;
    await loadCommentsIntoPage(threadId, true);
    if (typeof refreshCurrentModuleCommenterHighlights === 'function') refreshCurrentModuleCommenterHighlights();
    loadSidebarFeed();
  } catch (error) {
    if (backend && !backend._localFallback) {
      try {
        const localBackend = getLocalCommentBackend();
        await localBackend.updateComment(commentId, {
          text,
          charName: 'Erzaehler',
          charTitle: '',
          portrait: null,
          narrator: true,
          ...metadata
        });
        showCommentFallbackNotice();
        closeModuleInsertForm();
        _editingModuleInsertCommentId = null;
        await loadCommentsIntoPage(threadId, true);
        return;
      } catch (localError) {
        console.warn('local module insert edit fallback save failed:', localError);
      }
    }
    const message = getFriendlyErrorMessage(error, 'Aenderungen konnten nicht gespeichert werden.');
    errEl.textContent = message;
    errEl.style.display = 'block';
    if (typeof showAppStatus === 'function') showAppStatus(message, 'error');
    btn.disabled = false;
    btn.textContent = 'Aenderungen speichern';
  }
}
