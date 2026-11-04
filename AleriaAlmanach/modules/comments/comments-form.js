// Comment form dialog lifecycle.
let _commentFormInitialRenderToken = 0;

function isCommentFormActorsReady() {
  return document.getElementById('comment-form-overlay')?.dataset.actorLoading !== 'true';
}

function setCommentFormActorsLoading(loading) {
  const overlay = document.getElementById('comment-form-overlay');
  if (!overlay) return;
  overlay.dataset.actorLoading = String(loading);
  overlay.setAttribute('aria-busy', String(loading));
  overlay.querySelectorAll('.cf-mode-toggle, .comment-compose-layout').forEach(node => { node.inert = loading; });
  document.getElementById('cf-submit').disabled = loading;
  let status = overlay.querySelector('[data-comment-actor-loading]');
  const layout = overlay.querySelector('.comment-compose-layout');
  if (!status && layout) {
    status = document.createElement('p'); status.dataset.commentActorLoading = '';
    status.className = 'comment-form-draft'; status.setAttribute('role', 'status');
    status.textContent = 'Figuren werden geladen …'; layout.before(status);
  }
  if (status) status.hidden = !loading;
}

function scheduleCommentFormInitialRender(token) {
  const scheduleFrame = typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame
    : callback => setTimeout(callback, 0);
  scheduleFrame(() => setTimeout(() => {
    if (token !== _commentFormInitialRenderToken || !isCommentFormOpen()) return;
    renderCharPickerInForm();
    renderCommentSegmentList();
    setCommentFormCounter();
    updateCommentFormPreview();
    document.querySelector('#cf-segment-list textarea, #cf-editor, #cf-text')?.focus?.({ preventScroll: true });
  }, 0));
}

async function openCommentForm(options = {}) {
  const initialRenderToken = ++_commentFormInitialRenderToken;
  const thread = getCurrentCommentThread();
  const currentThreadId = () => typeof getCurrentCommentThreadId === 'function'
    ? getCurrentCommentThreadId() : String(getCurrentCommentThread()?.threadId || '');
  const threadId = currentThreadId();
  if (typeof setCommentPreviewPanelState === 'function') setCommentPreviewPanelState('split');
  _commentInsertAfterId = null;
  _portraitUrl = null;
  _selectedCharId = null;
  _selectedEmoteIdx = null;
  _selectedImageSetId = CHARACTER_IMAGE_SET_DEFAULT_ID;
  _manualMode = false;
  _commentMode = 'charakter';
  _commentKind = 'speech';
  _commentSegments = [makeCommentSegment('speech')];
  window.AleriaCommentSceneCast?.resetCreate?.();
  document.getElementById('cf-name').value    = '';
  document.getElementById('cf-title').value   = '';
  setRichEditorContent('cf-text', '');
  document.getElementById('cf-error').style.display = 'none';
  const prev = document.getElementById('cf-portrait-preview');
  if (prev) {
    prev.removeAttribute('src');
    prev.style.display = 'none';
  }
  const portraitUrlInput = document.getElementById('cf-portrait-url');
  if (portraitUrlInput) portraitUrlInput.value = '';
  document.getElementById('cf-manual-fields').style.display = 'none';
  document.getElementById('cf-manual-toggle').textContent = '+ Manuell eingeben';
  document.getElementById('cf-selected-name').textContent = '';
  document.getElementById('cf-char-search').value = '';
  setCommentPlayerFilter('', { render: false, persist: false });
  showCommentDraftNote('');
  document.getElementById('cf-submit').disabled = false;
  document.getElementById('cf-submit').textContent = 'Eintragen';
  if (typeof resetCommentAssistant === 'function') resetCommentAssistant();
  document.getElementById('comment-form-title').textContent = thread?.formTitle || '*  Stimme hinterlassen  *';
  document.getElementById('cf-text').placeholder = thread?.formPlaceholder || 'Schreibe aus der Sicht deines Charakters...';
  if (document.getElementById('cf-editor')) {
    document.getElementById('cf-editor').dataset.placeholder = thread?.formPlaceholder || 'Schreibe aus der Sicht deines Charakters...';
  }
  // Reset mode to charakter
  setCommentMode('charakter', { render: false, persist: false });
  setCommentKind('speech', { render: false, persist: false });
  if (typeof refreshCurrentModuleCommenterHighlights === 'function') {
    refreshCurrentModuleCommenterHighlights();
  }
  document.getElementById('cf-char-picker')?.replaceChildren();
  document.getElementById('cf-segment-list')?.replaceChildren();
  document.getElementById('cf-preview')?.replaceChildren();
  setCommentFormCounter();
  setCommentFormActorsLoading(true);
  activateDialog('comment-form-overlay', { initialFocus: '[data-action="close-comment-form"]' });
  if (typeof initCommentPreviewSplitter === 'function') initCommentPreviewSplitter();
  if (typeof applyCommentPreviewLayout === 'function') applyCommentPreviewLayout();
  try {
    if (typeof loadSceneActorData === 'function') await loadSceneActorData();
    if (initialRenderToken !== _commentFormInitialRenderToken || !isCommentFormOpen() || threadId !== currentThreadId()) return false;
    restoreCommentDraft({ render: false });
    setCommentFormActorsLoading(false);
    options.afterReady?.();
    scheduleCommentFormInitialRender(initialRenderToken);
    return true;
  } catch (error) {
    if (initialRenderToken !== _commentFormInitialRenderToken || !isCommentFormOpen() || threadId !== currentThreadId()) return false;
    const message = document.getElementById('cf-error');
    message.textContent = error.message || 'Figuren konnten nicht geladen werden. Bitte das Fenster erneut öffnen.';
    message.setAttribute('role', 'alert');
    const overlay = document.getElementById('comment-form-overlay');
    overlay.setAttribute('aria-busy', 'false');
    const status = overlay.querySelector('[data-comment-actor-loading]'); if (status) status.hidden = true;
    message.style.display = 'block'; return false;
  }
}

function openCommentFormAfter(commentId) {
  return openCommentForm({ afterReady() {
    _commentInsertAfterId = String(commentId || '');
    const title = document.getElementById('comment-form-title');
    if (title) title.textContent = '*  Nachträglich antworten  *';
    showCommentDraftNote('Antwort wird an der gewählten Stelle eingefügt');
  } });
}

// The comment composer owns its draft. Challenge features hand over a target;
// they do not reach into segment state or synthesize DOM change events.
function openCommentFormForSkillChallenge(challenge, skillId = '') {
  const settings = window.AleriaSkillChecks?.getChallengeAttemptSettings?.(challenge, skillId);
  if (!settings) return;
  return openCommentForm({ afterReady() {
    setCommentMode('charakter', { render: false, persist: false });
    const segment = makeCommentSegment(settings.kind, '', null, 'left', SCENE_TIME_DEFAULT_SEGMENT_SECONDS, COMMENT_LANGUAGE_DEFAULT, '', settings);
    const emptyDefault = _commentSegments.length === 1 && !_commentSegments[0].text.trim() && _commentSegments[0].mechanicMode === 'normal';
    if (emptyDefault) _commentSegments = [segment];
    else _commentSegments.push(segment);
    _commentKind = settings.kind;
    persistCommentDraft();
  } });
}

function closeCommentForm() {
  _commentFormInitialRenderToken += 1;
  window.AleriaCombat?.releaseComposer?.(document.getElementById('cf-segment-list'));
  deactivateDialog('comment-form-overlay');
  _commentInsertAfterId = null;
}


// Delete confirm helpers live in modules/comments/comments-delete.js.
// Showcase cards are narrator-side inserts for items, places, maps or people.
