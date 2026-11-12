// Comment turn-state subscription and controls.
let _commentTurnThreadId = null;
let _commentTurnUnsubscribe = null;
let _commentTurnState = null;
let _commentTurnLoadGeneration = 0;
let _commentTurnLiveGeneration = 0;
const COMMENT_TURN_LABELS = {
  erdi: 'Erdi',
  patrick: 'Patrick',
  ended: 'Sitzung beendet'
};

function stopCommentTurnUpdates() {
  _commentTurnLoadGeneration++;
  _commentTurnLiveGeneration++;
  if (_commentTurnUnsubscribe) {
    _commentTurnUnsubscribe();
    _commentTurnUnsubscribe = null;
  }
  _commentTurnThreadId = null;
  _commentTurnState = null;
}

function renderCommentTurnState(threadId, state) {
  const current = ['erdi', 'patrick', 'ended'].includes(String(state?.current || ''))
    ? String(state.current)
    : '';
  document.querySelectorAll('.comment-turn-bar').forEach(bar => {
    if (bar.dataset.commentThreadId !== String(threadId || '')) return;
    bar.dataset.turnCurrent = current;
    const stateEl = bar.querySelector('[data-turn-state]');
    if (stateEl) {
      stateEl.textContent = current === 'ended'
        ? 'Diese Sitzung ist beendet.'
        : current
          ? `${COMMENT_TURN_LABELS[current]} ist in der Reihe.`
          : 'Redestab noch nicht gesetzt.';
    }
    bar.querySelectorAll('.comment-turn-btn').forEach(btn => {
      const active = btn.dataset.turnValue === current;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  });
  if (typeof refreshSessionStatusTurn === 'function') refreshSessionStatusTurn(threadId, state);
  window.AleriaSceneBackup?.renderStatus(threadId, state || {});
  applyCommentToolsVisibility();
}

async function loadCommentTurnIntoPage(threadId, forceRefresh = false) {
  if (!threadId) return;
  const loadGeneration = ++_commentTurnLoadGeneration;
  const backend = await getCommentBackend({ source: 'turn' });
  if (loadGeneration !== _commentTurnLoadGeneration) return;
  if (typeof getCurrentCommentThread === 'function' && getCurrentCommentThread()?.threadId !== threadId) return;

  if (_commentTurnThreadId === threadId && _commentTurnUnsubscribe && !forceRefresh) {
    renderCommentTurnState(threadId, _commentTurnState);
    return;
  }
  stopCommentTurnUpdates();
  const readGeneration = _commentTurnLoadGeneration;

  if (typeof backend.subscribeCommentTurn === 'function') {
    _commentTurnThreadId = threadId;
    const liveGeneration = _commentTurnLiveGeneration;
    const isCurrentThread = () => typeof getCurrentCommentThread !== 'function' || getCurrentCommentThread()?.threadId === threadId;
    const isCurrent = () => liveGeneration === _commentTurnLiveGeneration && _commentTurnThreadId === threadId && isCurrentThread();
    const unsubscribe = backend.subscribeCommentTurn(threadId, state => {
      if (!isCurrent()) return;
      _commentTurnState = state || { current: '' };
      renderCommentTurnState(threadId, _commentTurnState);
      document.dispatchEvent(new CustomEvent('aleria:comment-backend-connected', { detail: { source: 'turn' } }));
    }, async error => {
      if (!isCurrent()) return;
      const retainedState = _commentTurnState;
      stopCommentTurnUpdates();
      const fallbackGeneration = _commentTurnLoadGeneration;
      showCommentFallbackNotice(error, 'turn');
      const fallbackBackend = getLocalCommentBackend();
      const state = retainedState || await fallbackBackend.loadCommentTurn?.(threadId);
      if (fallbackGeneration !== _commentTurnLoadGeneration || !isCurrentThread()) return;
      _commentTurnState = state || { current: '' };
      renderCommentTurnState(threadId, _commentTurnState);
    });
    if (isCurrent()) _commentTurnUnsubscribe = unsubscribe;
    else unsubscribe?.();
    return;
  }

  const state = await backend.loadCommentTurn?.(threadId);
  if (readGeneration !== _commentTurnLoadGeneration) return;
  if (typeof getCurrentCommentThread === 'function' && getCurrentCommentThread()?.threadId !== threadId) return;
  _commentTurnState = state || { current: '' };
  renderCommentTurnState(threadId, _commentTurnState);
}

async function setCommentTurn(threadId, current) {
  if (!threadId) return;
  const backend = await getCommentBackend({ timeoutMs: 800 });
  if (current === 'ended' && parseCommentThreadLocation(threadId).kind === 'session') {
    if (!window.AleriaSceneBackup) throw new Error('Das Szenenbackup-Modul ist nicht geladen.');
    return window.AleriaSceneBackup.endSession(threadId, backend);
  }
  if (!backend?.saveCommentTurn) return;
  await backend.saveCommentTurn(threadId, current);
}

function setCommentTurnFromButton(button, current) {
  const threadId = button?.closest('.comment-turn-bar')?.dataset.commentThreadId || getCurrentCommentThreadId();
  setCommentTurn(threadId, current).catch(error => {
    if (typeof showFriendlyAppError === 'function') {
      showFriendlyAppError(error, 'Redestab konnte nicht gesetzt werden.');
    }
  });
}


