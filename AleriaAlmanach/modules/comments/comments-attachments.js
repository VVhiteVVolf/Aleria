// Attachment form, preview, save, and edit flow.
// Attachment cards are small narrator-side document links from the Werkstatt.
let _attachmentInsertAfterId = null;
let _editingAttachmentCommentId = null;

function setAttachmentFormValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = String(value || '');
}

function collectAttachmentFormPayload() {
  const title = String(document.getElementById('af-title')?.value || '').trim();
  const rawUrl = String(document.getElementById('af-url')?.value || '').trim();
  const url = normalizeAttachmentUrlForStorage(rawUrl);
  if (!title || !url) return null;
  return {
    title,
    url,
    text: String(document.getElementById('af-preview-text')?.value || '').trim()
  };
}

function updateAttachmentPreview() {
  const preview = document.getElementById('af-preview');
  if (!preview) return;
  const title = String(document.getElementById('af-title')?.value || '').trim() || 'Unbenannter Anhang';
  const url = String(document.getElementById('af-url')?.value || '').trim() || './DokumentenWerkstatt.html';
  const text = String(document.getElementById('af-preview-text')?.value || '').trim() || 'Dokument aus der Werkstatt öffnen.';
  const narratorText = String(document.getElementById('af-text')?.value || '').trim() || 'Der Erzähler legt einen Anhang vor.';
  preview.innerHTML = `
    <div class="comment-live-preview-head">
      <div class="comment-live-preview-kicker">Vorschau in der Szene</div>
    </div>
    <div class="comment-attachment-preview-shell">
      ${renderCommentAttachment({
        id: 'attachment-preview',
        text: narratorText,
        _hideActions: true
      }, 0, { title, url, text })}
    </div>`;
}

function resetAttachmentForm() {
  setAttachmentFormValue('af-title', '');
  setAttachmentFormValue('af-url', '');
  setAttachmentFormValue('af-text', '');
  setAttachmentFormValue('af-preview-text', '');
  const note = document.getElementById('af-note');
  if (note) note.textContent = '';
  const error = document.getElementById('af-error');
  if (error) {
    error.textContent = '';
    error.style.display = 'none';
  }
  const submit = document.getElementById('af-submit');
  if (submit) {
    submit.disabled = false;
    submit.textContent = 'Anhang einfügen';
  }
  updateAttachmentPreview();
}

function openAttachmentForm() {
  _attachmentInsertAfterId = null;
  _editingAttachmentCommentId = null;
  resetAttachmentForm();
  activateDialog('attachment-form-overlay', { initialFocus: '#af-title' });
}

function openAttachmentFormAfter(commentId) {
  openAttachmentForm();
  _attachmentInsertAfterId = String(commentId || '');
  const note = document.getElementById('af-note');
  if (note) note.textContent = 'Anhang wird an der gewählten Stelle eingefügt.';
}

function closeAttachmentForm() {
  deactivateDialog('attachment-form-overlay');
  _attachmentInsertAfterId = null;
  _editingAttachmentCommentId = null;
}

async function submitAttachmentItem() {
  const errEl = document.getElementById('af-error');
  const btn = document.getElementById('af-submit');
  const threadId = getCurrentCommentThreadId();
  const attachment = collectAttachmentFormPayload();
  const narratorText = String(document.getElementById('af-text')?.value || '').trim();

  if (!attachment) {
    errEl.textContent = 'Bitte Titel und gültigen Dokument-Link eintragen.';
    errEl.style.display = 'block';
    return;
  }
  const text = narratorText || `Der Erzähler präsentiert: ${attachment.title}`;
  if ((text + attachment.text).length > COMMENT_MAX_LENGTH) {
    errEl.textContent = `Bitte bei maximal ${COMMENT_MAX_LENGTH} Zeichen bleiben.`;
    errEl.style.display = 'block';
    return;
  }
  if (!threadId) {
    errEl.textContent = 'Der Anhang konnte keiner Szene zugeordnet werden.';
    errEl.style.display = 'block';
    return;
  }

  errEl.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Wird gespeichert...';
  const metadata = {
    commentMode: 'attachment',
    commentKind: 'narrator',
    avatarKind: 'narrator',
    characterId: '',
    emoteIndex: null,
    commentSegments: null,
    documentAttachment: attachment,
    orderKey: getNextCommentOrderKey(threadId, _attachmentInsertAfterId),
    schemaVersion: 4
  };

  let backend = null;
  try {
    backend = await getCommentBackend({ timeoutMs: 1200 });
    await backend.addComment(threadId, 'Erzähler', '', null, text, COMMENT_DELETE_CODE, true, metadata);
    closeAttachmentForm();
    await loadCommentsIntoPage(threadId, true, _attachmentInsertAfterId ? {} : { page: 'last' });
    if (typeof refreshCurrentModuleCommenterHighlights === 'function') refreshCurrentModuleCommenterHighlights();
    loadSidebarFeed();
  } catch (error) {
    if (backend && !backend._localFallback) {
      try {
        const localBackend = getLocalCommentBackend();
        await localBackend.addComment(threadId, 'Erzähler', '', null, text, COMMENT_DELETE_CODE, true, metadata);
        showCommentFallbackNotice();
        closeAttachmentForm();
        await loadCommentsIntoPage(threadId, true, _attachmentInsertAfterId ? {} : { page: 'last' });
        return;
      } catch (localError) {
        console.warn('local attachment fallback save failed:', localError);
      }
    }
    const message = getFriendlyErrorMessage(error, 'Anhang konnte nicht gespeichert werden.');
    errEl.textContent = message;
    errEl.style.display = 'block';
    if (typeof showAppStatus === 'function') showAppStatus(message, 'error');
    btn.disabled = false;
    btn.textContent = 'Anhang einfügen';
  }
}

function openEditAttachmentForm(commentId) {
  const comment = findCachedCommentById(commentId);
  const attachment = getCommentAttachmentItem(comment);
  if (!comment || !attachment) {
    alert('Anhang konnte nicht geladen werden.');
    return;
  }

  _editingAttachmentCommentId = String(commentId || '');
  _attachmentInsertAfterId = null;
  setAttachmentFormValue('af-title', attachment.title);
  setAttachmentFormValue('af-url', attachment.url);
  setAttachmentFormValue('af-text', comment.text || '');
  setAttachmentFormValue('af-preview-text', attachment.text || '');

  const note = document.getElementById('af-note');
  if (note) note.textContent = 'Bearbeitung des Anhangs';
  const error = document.getElementById('af-error');
  if (error) {
    error.textContent = '';
    error.style.display = 'none';
  }
  const submit = document.getElementById('af-submit');
  if (submit) {
    submit.disabled = false;
    submit.textContent = 'Änderungen speichern';
  }
  updateAttachmentPreview();
  activateDialog('attachment-form-overlay', { initialFocus: '#af-title' });
}

async function submitEditAttachment() {
  if (!_editingAttachmentCommentId) return submitAttachmentItem();

  const errEl = document.getElementById('af-error');
  const btn = document.getElementById('af-submit');
  const threadId = getCurrentCommentThreadId();
  const attachment = collectAttachmentFormPayload();
  const narratorText = String(document.getElementById('af-text')?.value || '').trim();

  if (!attachment) {
    errEl.textContent = 'Bitte Titel und gültigen Dokument-Link eintragen.';
    errEl.style.display = 'block';
    return;
  }
  const text = narratorText || `Der Erzähler präsentiert: ${attachment.title}`;
  if ((text + attachment.text).length > COMMENT_MAX_LENGTH) {
    errEl.textContent = `Bitte bei maximal ${COMMENT_MAX_LENGTH} Zeichen bleiben.`;
    errEl.style.display = 'block';
    return;
  }
  if (!threadId) {
    errEl.textContent = 'Der Anhang konnte keiner Szene zugeordnet werden.';
    errEl.style.display = 'block';
    return;
  }

  errEl.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Wird gespeichert...';
  const commentId = _editingAttachmentCommentId;
  const metadata = {
    commentMode: 'attachment',
    commentKind: 'narrator',
    avatarKind: 'narrator',
    characterId: '',
    emoteIndex: null,
    commentSegments: null,
    documentAttachment: attachment,
    schemaVersion: 4
  };

  let backend = null;
  try {
    backend = await getCommentBackend({ timeoutMs: 1200 });
    await backend.updateComment(commentId, {
      text,
      charName: 'Erzähler',
      charTitle: '',
      portrait: null,
      narrator: true,
      ...metadata
    });
    closeAttachmentForm();
    _editingAttachmentCommentId = null;
    await loadCommentsIntoPage(threadId, true);
    if (typeof refreshCurrentModuleCommenterHighlights === 'function') refreshCurrentModuleCommenterHighlights();
    loadSidebarFeed();
  } catch (error) {
    if (backend && !backend._localFallback) {
      try {
        const localBackend = getLocalCommentBackend();
        await localBackend.updateComment(commentId, {
          text,
          charName: 'Erzähler',
          charTitle: '',
          portrait: null,
          narrator: true,
          ...metadata
        });
        showCommentFallbackNotice();
        closeAttachmentForm();
        _editingAttachmentCommentId = null;
        await loadCommentsIntoPage(threadId, true);
        return;
      } catch (localError) {
        console.warn('local attachment edit fallback save failed:', localError);
      }
    }
    const message = getFriendlyErrorMessage(error, 'Änderungen konnten nicht gespeichert werden.');
    errEl.textContent = message;
    errEl.style.display = 'block';
    if (typeof showAppStatus === 'function') showAppStatus(message, 'error');
    btn.disabled = false;
    btn.textContent = 'Änderungen speichern';
  }
}
