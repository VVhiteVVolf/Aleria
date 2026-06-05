// Comment turn-state subscription and controls.
let _commentTurnThreadId = null;
let _commentTurnUnsubscribe = null;
let _commentTurnState = null;
const COMMENT_TURN_LABELS = {
  erdi: 'Erdi',
  patrick: 'Patrick',
  ended: 'Sitzung beendet'
};

function stopCommentTurnUpdates() {
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
      btn.classList.toggle('active', btn.dataset.turnValue === current);
    });
  });
  applyCommentToolsVisibility();
}

async function loadCommentTurnIntoPage(threadId, forceRefresh = false) {
  if (!threadId) return;
  const backend = await getCommentBackend();

  if (_commentTurnThreadId === threadId && _commentTurnUnsubscribe && !forceRefresh) {
    renderCommentTurnState(threadId, _commentTurnState);
    return;
  }
  stopCommentTurnUpdates();

  if (typeof backend.subscribeCommentTurn === 'function') {
    _commentTurnThreadId = threadId;
    _commentTurnUnsubscribe = backend.subscribeCommentTurn(threadId, state => {
      _commentTurnState = state || { current: '' };
      renderCommentTurnState(threadId, _commentTurnState);
    }, async () => {
      showCommentFallbackNotice();
      const fallbackBackend = getLocalCommentBackend();
      const state = await fallbackBackend.loadCommentTurn?.(threadId);
      _commentTurnState = state || { current: '' };
      renderCommentTurnState(threadId, _commentTurnState);
    });
    return;
  }

  const state = await backend.loadCommentTurn?.(threadId);
  _commentTurnState = state || { current: '' };
  renderCommentTurnState(threadId, _commentTurnState);
}

async function setCommentTurn(threadId, current) {
  if (!threadId) return;
  const backend = await getCommentBackend({ timeoutMs: 800 });
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


