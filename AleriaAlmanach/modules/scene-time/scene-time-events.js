// Beitrags-Id, NACH der das naechste Zeitereignis eingefuegt werden soll -
// gesetzt von openSceneTimeEventDialogAfter() fuers rueckwirkende
// Benennen eines Tages, sonst null (normales "jetzt ankuendigen").
let _sceneTimeInsertAfterId = null;

function openSceneTimeEventDialog() {
  _sceneTimeInsertAfterId = null;
  const thread = typeof getCurrentCommentThread === 'function' ? getCurrentCommentThread() : null;
  if (!thread || thread.kind !== 'session') {
    if (typeof showAppStatus === 'function') {
      showAppStatus('Zeitereignisse sind nur in interaktiven Szenen verfuegbar.', 'error');
    }
    return;
  }
  ensureSceneTimeEventDialog();
  resetSceneTimeEventDialog();
  setSceneTimeEventDialogMode(false);
  activateDialog('scene-time-event-overlay', { initialFocus: '#ste-title, button, input, textarea' });
}

// Oeffnet denselben Dialog, aber so, dass der Eintrag rueckwirkend NACH einem
// bereits bestehenden Beitrag einsortiert wird (Beitraege "zu einem Tag
// zusammenfuegen": alles ab hier bis zum naechsten Tag-Marker zaehlt zu
// diesem benannten Tag, der angeklickte Beitrag selbst bleibt beim vorigen
// Tag). Zeit/Tag der Zeitlinie werden automatisch so vorbefuellt, dass die
// bisherige Zeitrechnung nicht springt.
function openSceneTimeEventDialogAfter(commentId) {
  const safeCommentId = String(commentId || '').trim();
  if (!safeCommentId) return;
  const thread = typeof getCurrentCommentThread === 'function' ? getCurrentCommentThread() : null;
  if (!thread || thread.kind !== 'session') {
    if (typeof showAppStatus === 'function') {
      showAppStatus('Zeitereignisse sind nur in interaktiven Szenen verfuegbar.', 'error');
    }
    return;
  }
  const threadId = getCurrentCommentThreadId();
  const comments = _commentCache[String(threadId || '')] || [];
  const cursorSeconds = typeof getSceneTimelineCursorAfterComment === 'function'
    ? getSceneTimelineCursorAfterComment(comments, safeCommentId)
    : 0;
  _sceneTimeInsertAfterId = safeCommentId;
  ensureSceneTimeEventDialog();
  resetSceneTimeEventDialog();
  setSceneTimeEventDialogMode(true);
  prefillSceneTimeAnchorFromSeconds(cursorSeconds);
  setSceneTimePreset('next-day');
  activateDialog('scene-time-event-overlay', { initialFocus: '#ste-day-label, button, input, textarea' });
}

function prefillSceneTimeAnchorFromSeconds(totalSeconds) {
  const safeSeconds = Number.isFinite(totalSeconds) ? Math.max(0, totalSeconds) : 0;
  const day = Math.floor(safeSeconds / 86400) + 1;
  const secondsOfDay = Math.floor(safeSeconds) % 86400;
  const hh = String(Math.floor(secondsOfDay / 3600)).padStart(2, '0');
  const mm = String(Math.floor((secondsOfDay % 3600) / 60)).padStart(2, '0');
  const ss = String(secondsOfDay % 60).padStart(2, '0');
  const dayInput = document.getElementById('ste-anchor-day');
  const timeInput = document.getElementById('ste-anchor-time');
  if (dayInput) dayInput.value = String(day);
  if (timeInput) timeInput.value = `${hh}:${mm}:${ss}`;
}

function setSceneTimeEventDialogMode(isRetroactive) {
  const kicker = document.querySelector('#scene-time-event-overlay .scene-time-event-dialog-kicker');
  const title = document.getElementById('scene-time-event-title');
  const hint = document.querySelector('#scene-time-event-overlay [data-scene-time-mode-hint]');
  if (kicker) kicker.textContent = isRetroactive ? 'Rückwirkend' : 'Erzählerereignis';
  if (title) title.textContent = isRetroactive ? 'Tag rückwirkend benennen' : 'Szenenzeit ankündigen';
  if (hint) hint.style.display = isRetroactive ? '' : 'none';
}

function closeSceneTimeEventDialog() {
  _sceneTimeInsertAfterId = null;
  deactivateDialog('scene-time-event-overlay');
}

function getSceneTimeEventCommentText(event) {
  return [event.title, event.dayLabel, event.timeLabel, event.body]
    .map(part => String(part || '').trim())
    .filter(Boolean)
    .join('\n\n');
}

function getNextSceneTimeSegmentIndex(threadId, afterCommentId = null) {
  const comments = typeof sortCommentsByTimeline === 'function'
    ? sortCommentsByTimeline(_commentCache[String(threadId || '')] || [])
    : (_commentCache[String(threadId || '')] || []);
  const index = afterCommentId ? comments.findIndex(comment => String(comment.id) === String(afterCommentId)) : -1;
  const relevant = index >= 0 ? comments.slice(0, index + 1) : comments;
  return relevant.filter(comment => (
    isSceneTimeEventComment(comment) &&
    isSceneTimeSegmentBreakEvent(comment)
  )).length + 1;
}

function prepareSceneTimeEventForThread(eventInput, threadId, afterCommentId = null) {
  const event = normalizeSceneTimeEvent(eventInput);
  if (!isSceneTimeSegmentBreakEvent(event)) return event;
  const segmentLabel = getSceneTimeEventSegmentLabel(event, getNextSceneTimeSegmentIndex(threadId, afterCommentId));
  return normalizeSceneTimeEvent({
    ...event,
    segmentBreak: true,
    segmentLabel,
    dayLabel: event.dayLabel || segmentLabel
  });
}

async function submitSceneTimeEvent() {
  const threadId = getCurrentCommentThreadId();
  const insertAfterId = _sceneTimeInsertAfterId;
  const event = prepareSceneTimeEventForThread(getSceneTimeDialogPayload(), threadId, insertAfterId);
  if (!threadId) {
    setSceneTimeEventStatus('Kein aktiver Szenen-Thread gefunden.', 'error');
    return;
  }
  if (!event.title) {
    setSceneTimeEventStatus('Bitte einen Titel fuer das Zeitereignis eingeben.', 'error');
    document.getElementById('ste-title')?.focus();
    return;
  }
  if (!Number.isFinite(event.anchorSeconds)) {
    setSceneTimeEventStatus('Bitte eine verbindliche Uhrzeit angeben.', 'error');
    document.getElementById('ste-anchor-time')?.focus();
    return;
  }

  const submit = document.querySelector('[data-scene-time-action="submit-event"]');
  if (submit) {
    submit.disabled = true;
    submit.textContent = 'Wird gespeichert...';
  }

  let backend = null;
  const orderKey = getNextCommentOrderKey(threadId, insertAfterId || null);
  const text = getSceneTimeEventCommentText(event);
  const metadata = {
    commentMode: 'scene-time',
    commentKind: SCENE_TIME_EVENT_KIND,
    sceneTimeEvent: event,
    orderKey
  };

  try {
    backend = await getCommentBackend({ timeoutMs: 1200 });
    const saved = await backend.addComment(
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
    // Rueckwirkend eingefuegt heisst nicht zwangslaeufig "am Ende" - zur
    // tatsaechlichen Einfuegestelle springen statt blind auf die letzte Seite.
    if (insertAfterId && saved?.id) {
      await loadCommentsIntoPage(threadId, true);
      setCommentPageForCommentId(threadId, saved.id);
    } else {
      await loadCommentsIntoPage(threadId, true, { page: 'last' });
    }
    if (typeof loadSidebarFeed === 'function') loadSidebarFeed();
    if (typeof showAppStatus === 'function') showAppStatus('Zeitereignis wurde in die Szene eingetragen.', 'success');
  } catch (error) {
    if (backend && !backend._localFallback) {
      try {
        const localBackend = getLocalCommentBackend();
        const saved = await localBackend.addComment(threadId, 'Erzähler', '', null, text, COMMENT_DELETE_CODE, true, metadata);
        showCommentFallbackNotice();
        closeSceneTimeEventDialog();
        requestCommentAutoScroll(threadId);
        if (insertAfterId && saved?.id) {
          await loadCommentsIntoPage(threadId, true);
          setCommentPageForCommentId(threadId, saved.id);
        } else {
          await loadCommentsIntoPage(threadId, true, { page: 'last' });
        }
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
  if (event.target.id === 'ste-time-label') syncSceneTimeAnchorFromLabel();
  renderSceneTimeDialogPreview();
}

document.addEventListener('click', handleSceneTimeEventClick);
document.addEventListener('input', handleSceneTimeEventInput);
