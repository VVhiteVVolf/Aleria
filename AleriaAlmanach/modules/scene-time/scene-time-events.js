function openSceneTimeEventDialog() {
  const thread = typeof getCurrentCommentThread === 'function' ? getCurrentCommentThread() : null;
  if (!thread || thread.kind !== 'session') {
    if (typeof showAppStatus === 'function') {
      showAppStatus('Zeitereignisse sind nur in interaktiven Szenen verfuegbar.', 'error');
    }
    return;
  }
  ensureSceneTimeEventDialog();
  resetSceneTimeEventDialog();
  activateDialog('scene-time-event-overlay', { initialFocus: '#ste-title, button, input, textarea' });
}

function closeSceneTimeEventDialog() {
  deactivateDialog('scene-time-event-overlay');
}

function getSceneTimeEventCommentText(event) {
  return [event.title, event.dayLabel, event.timeLabel, event.body]
    .map(part => String(part || '').trim())
    .filter(Boolean)
    .join('\n\n');
}

async function submitSceneTimeEvent() {
  const threadId = getCurrentCommentThreadId();
  const event = getSceneTimeDialogPayload();
  if (!threadId) {
    setSceneTimeEventStatus('Kein aktiver Szenen-Thread gefunden.', 'error');
    return;
  }
  if (!event.title) {
    setSceneTimeEventStatus('Bitte einen Titel fuer das Zeitereignis eingeben.', 'error');
    document.getElementById('ste-title')?.focus();
    return;
  }

  const submit = document.querySelector('[data-scene-time-action="submit-event"]');
  if (submit) {
    submit.disabled = true;
    submit.textContent = 'Wird gespeichert...';
  }

  let backend = null;
  const orderKey = getNextCommentOrderKey(threadId);
  const text = getSceneTimeEventCommentText(event);
  const metadata = {
    commentMode: 'scene-time',
    commentKind: SCENE_TIME_EVENT_KIND,
    sceneTimeEvent: event,
    orderKey
  };

  try {
    backend = await getCommentBackend({ timeoutMs: 1200 });
    await backend.addComment(
      threadId,
      'Erzähler',
      '',
      null,
      text,
      COMMENT_DELETE_CODE,
      true,
      metadata
    );
    closeSceneTimeEventDialog();
    requestCommentAutoScroll(threadId);
    await loadCommentsIntoPage(threadId, true, { page: 'last' });
    if (typeof loadSidebarFeed === 'function') loadSidebarFeed();
    if (typeof showAppStatus === 'function') showAppStatus('Zeitereignis wurde in die Szene eingetragen.', 'success');
  } catch (error) {
    if (backend && !backend._localFallback) {
      try {
        const localBackend = getLocalCommentBackend();
        await localBackend.addComment(threadId, 'Erzähler', '', null, text, COMMENT_DELETE_CODE, true, metadata);
        showCommentFallbackNotice();
        closeSceneTimeEventDialog();
        requestCommentAutoScroll(threadId);
        await loadCommentsIntoPage(threadId, true, { page: 'last' });
        return;
      } catch (localError) {
        console.warn('scene time local fallback failed:', localError);
      }
    }
    console.error('scene time event submit failed:', error);
    const message = typeof getFriendlyErrorMessage === 'function'
      ? getFriendlyErrorMessage(error, 'Zeitereignis konnte nicht gespeichert werden.')
      : 'Zeitereignis konnte nicht gespeichert werden.';
    setSceneTimeEventStatus(message, 'error');
  } finally {
    if (submit) {
      submit.disabled = false;
      submit.textContent = 'Einlaeuten';
    }
  }
}

function handleSceneTimeEventClick(event) {
  const trigger = event.target?.closest?.('[data-scene-time-action]');
  if (!trigger) return;
  const action = trigger.dataset.sceneTimeAction;

  if (action === 'open-event-dialog') {
    event.preventDefault();
    openSceneTimeEventDialog();
    return;
  }
  if (action === 'close-dialog') {
    event.preventDefault();
    closeSceneTimeEventDialog();
    return;
  }
  if (action === 'select-preset') {
    event.preventDefault();
    setSceneTimePreset(trigger.dataset.sceneTimePreset || 'evening');
    return;
  }
  if (action === 'submit-event') {
    event.preventDefault();
    submitSceneTimeEvent();
  }
}

function handleSceneTimeEventInput(event) {
  if (!event.target?.closest?.('#scene-time-event-overlay')) return;
  if (event.target.id === 'ste-title' || event.target.id === 'ste-time-label') {
    event.target.dataset.userEdited = 'true';
  }
  renderSceneTimeDialogPreview();
}

document.addEventListener('click', handleSceneTimeEventClick);
document.addEventListener('input', handleSceneTimeEventInput);
