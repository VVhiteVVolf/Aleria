let _scenePollSubmitting = false;
let _scenePollEditingCommentId = '';
let _scenePollEditingData = null;
function getScenePollDialogPayload() {
  const optionInputs = Array.from(document.querySelectorAll('[data-scene-poll-option-label]'));
  const options = SCENE_POLL_DEFAULT_OPTIONS.map((option, index) => ({
    ...option,
    label: optionInputs[index]?.value || option.label
  }));
  return normalizeScenePoll({
    ...(_scenePollEditingData || {}),
    title: document.getElementById('scene-poll-title')?.value || '',
    question: document.getElementById('scene-poll-question')?.value || '',
    flavourText: document.getElementById('scene-poll-flavour')?.value || '',
    anonymous: !!document.getElementById('scene-poll-anonymous')?.checked,
    options,
    iconUrl: SCENE_POLL_ICON_URL
  });
}

function setScenePollStatus(message = '', type = 'info') {
  const status = document.querySelector('[data-scene-poll-status]');
  if (!status) return;
  status.dataset.status = type;
  status.textContent = message;
}

function renderScenePollDialogPreview() {
  const preview = document.querySelector('[data-scene-poll-preview]');
  if (!preview) return;
  preview.innerHTML = renderScenePollBlock(getScenePollDialogPayload(), { hideActions: true });
}

function resetScenePollDialog(poll = null) {
  const data = normalizeScenePoll(poll || {});
  document.getElementById('scene-poll-title').value = poll ? data.title : 'Vorlage zur Abstimmung';
  document.getElementById('scene-poll-question').value = poll ? data.question : '';
  document.getElementById('scene-poll-flavour').value = poll ? data.flavourText : '';
  document.getElementById('scene-poll-anonymous').checked = !!data.anonymous;
  document.querySelectorAll('[data-scene-poll-option-label]').forEach((input, index) => {
    input.value = data.options[index]?.label || SCENE_POLL_DEFAULT_OPTIONS[index]?.label || '';
  });
  setScenePollStatus('');
  renderScenePollDialogPreview();
}

function openScenePollDialog() {
  const thread = typeof getCurrentCommentThread === 'function' ? getCurrentCommentThread() : null;
  if (!thread || thread.kind !== 'session') {
    showAppStatus?.('Abstimmungen sind nur in interaktiven Szenen verfuegbar.', 'error');
    return;
  }
  _scenePollEditingCommentId = '';
  _scenePollEditingData = null;
  const overlay = ensureScenePollDialog();
  overlay.querySelector('[data-scene-poll-dialog-title]').textContent = 'Abstimmung anlegen';
  overlay.querySelector('[data-scene-poll-action="submit-poll"]').textContent = 'Eintragen';
  resetScenePollDialog();
  activateDialog('scene-poll-overlay', { initialFocus: '#scene-poll-title' });
}

function openScenePollEditDialog(commentId) {
  const comment = typeof findCachedCommentById === 'function' ? findCachedCommentById(commentId) : null;
  if (!comment || !isScenePollComment(comment)) {
    showAppStatus?.('Abstimmung konnte nicht gefunden werden.', 'error');
    return;
  }
  _scenePollEditingCommentId = String(commentId || '');
  _scenePollEditingData = normalizeScenePoll(comment.scenePoll || {});
  const overlay = ensureScenePollDialog();
  overlay.querySelector('[data-scene-poll-dialog-title]').textContent = 'Abstimmung bearbeiten';
  overlay.querySelector('[data-scene-poll-action="submit-poll"]').textContent = 'Speichern';
  resetScenePollDialog(_scenePollEditingData);
  activateDialog('scene-poll-overlay', { initialFocus: '#scene-poll-title' });
}

function closeScenePollDialog() {
  deactivateDialog('scene-poll-overlay');
  _scenePollEditingCommentId = '';
  _scenePollEditingData = null;
}

async function submitScenePoll() {
  if (_scenePollSubmitting) return;
  const threadId = getCurrentCommentThreadId();
  const poll = getScenePollDialogPayload();
  if (!threadId) {
    setScenePollStatus('Kein aktiver Szenen-Thread gefunden.', 'error');
    return;
  }
  if (!poll.title || !poll.question) {
    setScenePollStatus('Bitte Ueberschrift und Thema ausfuellen.', 'error');
    return;
  }

  const submit = document.querySelector('[data-scene-poll-action="submit-poll"]');
  _scenePollSubmitting = true;
  if (submit) {
    submit.disabled = true;
    submit.textContent = _scenePollEditingCommentId ? 'Speichert...' : 'Wird gespeichert...';
  }

  const text = getScenePollCommentText(poll);
  const metadata = {
    commentMode: 'scene-poll',
    commentKind: SCENE_POLL_KIND,
    scenePoll: poll,
    orderKey: _scenePollEditingCommentId ? undefined : getNextCommentOrderKey(threadId)
  };
  const wasEditing = !!_scenePollEditingCommentId;
  let backend = null;

  try {
    backend = await getCommentBackend({ timeoutMs: 1200 });
    if (_scenePollEditingCommentId) {
      await backend.updateComment(_scenePollEditingCommentId, {
        text,
        charName: 'Erzaehler',
        charTitle: '',
        portrait: null,
        narrator: true,
        commentMode: 'scene-poll',
        commentKind: SCENE_POLL_KIND,
        scenePoll: poll,
        schemaVersion: 2
      });
    } else {
      await backend.addComment(threadId, 'Erzaehler', '', null, text, COMMENT_DELETE_CODE, true, metadata);
      requestCommentAutoScroll(threadId);
    }
    closeScenePollDialog();
    await loadCommentsIntoPage(threadId, true, wasEditing ? {} : { page: 'last' });
    loadSidebarFeed?.();
  } catch (error) {
    if (!wasEditing && backend && !backend._localFallback) {
      try {
        const localBackend = getLocalCommentBackend();
        await localBackend.addComment(threadId, 'Erzaehler', '', null, text, COMMENT_DELETE_CODE, true, metadata);
        showCommentFallbackNotice();
        closeScenePollDialog();
        requestCommentAutoScroll(threadId);
        await loadCommentsIntoPage(threadId, true, { page: 'last' });
        return;
      } catch (localError) {
        console.warn('scene poll local fallback failed:', localError);
      }
    }
    console.error('scene poll submit failed:', error);
    setScenePollStatus(getFriendlyErrorMessage?.(error, 'Abstimmung konnte nicht gespeichert werden.') || 'Abstimmung konnte nicht gespeichert werden.', 'error');
  } finally {
    _scenePollSubmitting = false;
    if (submit) {
      submit.disabled = false;
      submit.textContent = _scenePollEditingCommentId ? 'Speichern' : 'Eintragen';
    }
  }
}

function getScenePollFromTrigger(trigger) {
  const card = trigger?.closest?.('.scene-poll');
  const commentId = card?.dataset.commentId || '';
  const comment = typeof findCachedCommentById === 'function' ? findCachedCommentById(commentId) : null;
  return { card, commentId, comment, poll: normalizeScenePoll(comment?.scenePoll || {}) };
}

function selectScenePollVoter(trigger) {
  const { card, poll } = getScenePollFromTrigger(trigger);
  const panel = trigger.closest('[data-scene-poll-vote-panel]');
  const voterId = getScenePollVoter(trigger.dataset.pollVoter || '').id;
  if (panel) {
    panel.dataset.selectedVoter = voterId;
    panel.dataset.selectedCharacter = '';
  }
  card?.querySelectorAll('[data-scene-poll-action="select-voter"]').forEach(button => {
    const active = button.dataset.pollVoter === voterId;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  const picker = card?.querySelector('[data-scene-poll-characters]');
  if (picker) picker.innerHTML = buildScenePollCharacterPicker(voterId, poll);
}

function selectScenePollCharacter(trigger) {
  const panel = trigger.closest('[data-scene-poll-vote-panel]');
  const characterId = String(trigger.dataset.characterId || '').trim();
  if (panel) panel.dataset.selectedCharacter = characterId;
  panel?.querySelectorAll('[data-scene-poll-action="select-character"]').forEach(button => {
    const active = button.dataset.characterId === characterId;
    button.classList.toggle('selected', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function setScenePollInlineStatus(card, message = '', type = 'info') {
  const status = card?.querySelector('[data-scene-poll-inline-status]');
  if (!status) return;
  status.dataset.status = type;
  status.textContent = message;
}

async function castScenePollVote(trigger) {
  const { card, commentId, comment, poll } = getScenePollFromTrigger(trigger);
  if (!card || !comment || !commentId) return;
  const panel = trigger.closest('[data-scene-poll-vote-panel]');
  const voterId = panel?.dataset.selectedVoter || 'patrick';
  const characterId = String(panel?.dataset.selectedCharacter || '').trim();
  if (!characterId) {
    setScenePollInlineStatus(card, 'Bitte zuerst eine Figur auswaehlen.', 'error');
    return;
  }
  const character = getScenePollCharactersForVoter(voterId)
    .find(item => String(item.id || '').trim() === characterId);
  if (!character) {
    setScenePollInlineStatus(card, 'Diese Figur ist fuer den ausgewaehlten Spieler nicht verfuegbar.', 'error');
    return;
  }

  const vote = buildScenePollVote(poll, character, voterId, trigger.dataset.pollOptionId || '');
  const nextPoll = normalizeScenePoll({
    ...poll,
    votes: {
      ...poll.votes,
      [vote.characterId]: vote
    }
  });

  trigger.disabled = true;
  setScenePollInlineStatus(card, 'Stimme wird gespeichert...');
  try {
    const backend = await getCommentBackend({ timeoutMs: 1200 });
    await backend.updateComment(commentId, {
      text: getScenePollCommentText(nextPoll),
      commentMode: 'scene-poll',
      commentKind: SCENE_POLL_KIND,
      scenePoll: nextPoll,
      activityAtClient: Date.now()
    });
    await loadCommentsIntoPage(getCurrentCommentThreadId(), true);
    loadSidebarFeed?.();
  } catch (error) {
    console.error('scene poll vote failed:', error);
    setScenePollInlineStatus(card, getFriendlyErrorMessage?.(error, 'Stimme konnte nicht gespeichert werden.') || 'Stimme konnte nicht gespeichert werden.', 'error');
  } finally {
    trigger.disabled = false;
  }
}

function toggleScenePollResults(trigger) {
  const card = trigger.closest('.scene-poll');
  const results = card?.querySelector('[data-scene-poll-results]');
  if (!card || !results) return;
  const open = results.hidden;
  results.hidden = !open;
  trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  card.classList.toggle('results-open', open);
}

function handleScenePollClick(event) {
  const trigger = event.target?.closest?.('[data-scene-poll-action]');
  if (!trigger) return;
  const action = trigger.dataset.scenePollAction;
  if (action === 'open-dialog') openScenePollDialog();
  else if (action === 'open-edit') openScenePollEditDialog(trigger.dataset.commentId || trigger.closest('[data-comment-id]')?.dataset.commentId || '');
  else if (action === 'close-dialog') closeScenePollDialog();
  else if (action === 'submit-poll') submitScenePoll();
  else if (action === 'select-voter') selectScenePollVoter(trigger);
  else if (action === 'select-character') selectScenePollCharacter(trigger);
  else if (action === 'cast-vote') castScenePollVote(trigger);
  else if (action === 'toggle-results') toggleScenePollResults(trigger);
  else return;
  event.preventDefault();
}

function handleScenePollInput(event) {
  if (!event.target?.closest?.('#scene-poll-overlay')) return;
  renderScenePollDialogPreview();
}

document.addEventListener('click', handleScenePollClick);
document.addEventListener('input', handleScenePollInput);
document.addEventListener('change', handleScenePollInput);
