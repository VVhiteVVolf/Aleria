// Dialog actions and persistence for scene dice events.
function openSceneDiceDialog() {
  const thread = typeof getCurrentCommentThread === 'function' ? getCurrentCommentThread() : null;
  if (!thread || thread.kind !== 'session') {
    if (typeof showAppStatus === 'function') showAppStatus('Würfel sind nur in interaktiven Szenen verfügbar.', 'error');
    return;
  }
  ensureSceneDiceDialog();
  resetSceneDiceDialog();
  activateDialog('scene-dice-overlay', { initialFocus: '#scene-dice-formula' });
}

function closeSceneDiceDialog() {
  deactivateDialog('scene-dice-overlay');
}

function runSceneDiceAnimation() {
  const formula = document.getElementById('scene-dice-formula')?.value || '';
  const mode = document.getElementById('scene-dice-mode')?.value || 'normal';
  const rollType = document.getElementById('scene-dice-roll-type')?.value || 'general';
  const target = document.querySelector('[data-scene-dice-result]');
  const rollButton = document.querySelector('[data-scene-dice-action="roll"]');
  try {
    parseSceneDiceFormula(formula);
    if (mode !== 'normal' && !canUseSceneDiceD20Mode(parseSceneDiceFormula(formula))) {
      throw new Error('Vorteil und Nachteil gelten nur für einen einzelnen W20-Test. Modifikatoren sind erlaubt.');
    }
  } catch (error) {
    setSceneDiceStatus(error.message || 'Ungültige Würfelformel.', 'error');
    return;
  }
  if (rollButton) rollButton.disabled = true;
  if (target) {
    target.dataset.state = 'rolling';
    target.innerHTML = `<div class="scene-dice-animation"><img src="${escapeHtml(getSceneDiceIcon(20))}" alt=""><span>Die Würfel fallen …</span></div>`;
  }
  setSceneDiceStatus('');
  window.setTimeout(() => {
    try {
      _sceneDicePendingRoll = rollSceneDiceFormula(formula, mode);
      _sceneDicePendingRoll.rollType = rollType;
      if (rollType === 'attack' && _sceneDicePendingRoll.natural === 20) {
        _sceneDicePendingRoll.critical = 'success';
        _sceneDicePendingRoll.special = 'Natürliche 20 · Kritischer Treffer';
      } else if (rollType === 'attack' && _sceneDicePendingRoll.natural === 1) {
        _sceneDicePendingRoll.critical = 'failure';
        _sceneDicePendingRoll.special = 'Natürliche 1 · Angriff verfehlt automatisch';
      } else if (rollType === 'death-save' && _sceneDicePendingRoll.natural === 20) {
        _sceneDicePendingRoll.critical = 'success';
        _sceneDicePendingRoll.special = 'Natürliche 20 · 1 Trefferpunkt zurückerlangt';
      } else if (rollType === 'death-save' && _sceneDicePendingRoll.natural === 1) {
        _sceneDicePendingRoll.critical = 'failure';
        _sceneDicePendingRoll.special = 'Natürliche 1 · Zwei Fehlschläge';
      }
      renderSceneDicePendingRoll(_sceneDicePendingRoll);
      const commit = document.querySelector('[data-scene-dice-action="commit"]');
      if (commit) commit.disabled = false;
    } catch (error) {
      setSceneDiceStatus(error.message || 'Wurf konnte nicht ausgeführt werden.', 'error');
    } finally {
      if (rollButton) rollButton.disabled = false;
    }
  }, 850);
}

async function commitSceneDiceRoll() {
  if (!_sceneDicePendingRoll) return;
  const threadId = getCurrentCommentThreadId();
  const roller = String(document.getElementById('scene-dice-roller')?.value || '').trim() || 'Unbekannte Hand';
  const purpose = String(document.getElementById('scene-dice-purpose')?.value || '').trim();
  const roll = { ..._sceneDicePendingRoll, roller, purpose };
  const commit = document.querySelector('[data-scene-dice-action="commit"]');
  if (!threadId) {
    setSceneDiceStatus('Kein aktiver Szenen-Thread gefunden.', 'error');
    return;
  }
  if (commit) commit.disabled = true;
  localStorage.setItem('aleria-scene-dice-roller-v1', roller);
  const text = `${roller} würfelt ${roll.formula}${purpose ? ` für ${purpose}` : ''}: ${roll.total}`;
  const metadata = {
    commentMode: 'scene-dice',
    commentKind: SCENE_DICE_EVENT_KIND,
    sceneDiceRoll: roll,
    orderKey: getNextCommentOrderKey(threadId)
  };
  let backend = null;
  try {
    backend = await getCommentBackend({ timeoutMs: 1200 });
    await backend.addComment(threadId, roller, '', null, text, COMMENT_DELETE_CODE, true, metadata);
    closeSceneDiceDialog();
    requestCommentAutoScroll(threadId);
    await loadCommentsIntoPage(threadId, true, { page: 'last' });
    if (typeof loadSidebarFeed === 'function') loadSidebarFeed();
  } catch (error) {
    if (backend && !backend._localFallback) {
      try {
        await getLocalCommentBackend().addComment(threadId, roller, '', null, text, COMMENT_DELETE_CODE, true, metadata);
        showCommentFallbackNotice();
        closeSceneDiceDialog();
        requestCommentAutoScroll(threadId);
        await loadCommentsIntoPage(threadId, true, { page: 'last' });
        return;
      } catch (fallbackError) {
        console.warn('scene dice local fallback failed:', fallbackError);
      }
    }
    const message = typeof getFriendlyErrorMessage === 'function'
      ? getFriendlyErrorMessage(error, 'Wurf konnte nicht gespeichert werden.')
      : 'Wurf konnte nicht gespeichert werden.';
    setSceneDiceStatus(message, 'error');
    if (commit) commit.disabled = false;
  }
}

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-scene-dice-action]');
  if (!trigger) return;
  event.preventDefault();
  const action = trigger.dataset.sceneDiceAction;
  if (action === 'open') openSceneDiceDialog();
  if (action === 'close') closeSceneDiceDialog();
  if (action === 'choose-die') {
    const sides = Number(trigger.dataset.dieSides) || 20;
    const input = document.getElementById('scene-dice-formula');
    const mode = document.getElementById('scene-dice-mode');
    if (input) input.value = `1d${sides}`;
    if (mode && sides !== 20) mode.value = 'normal';
  }
  if (action === 'roll') runSceneDiceAnimation();
  if (action === 'commit') commitSceneDiceRoll();
});

document.addEventListener('click', event => {
  if (event.target?.id === 'scene-dice-overlay') closeSceneDiceDialog();
});
