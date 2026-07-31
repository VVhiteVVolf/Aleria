// Delegated actions and scene persistence for the dice dialog.
async function openSceneDiceDialog() {
  const thread = typeof getCurrentCommentThread === 'function' ? getCurrentCommentThread() : null;
  if (!thread || thread.kind !== 'session') {
    if (typeof showAppStatus === 'function') showAppStatus('Würfel sind nur in interaktiven Szenen verfügbar.', 'error');
    return;
  }
  ensureSceneDiceDialog();
  resetSceneDiceDialog();
  activateDialog('scene-dice-overlay', { initialFocus: '#scene-dice-formula' });
  try {
    const service = getSceneDiceService();
    const engine = await service.prepare(document.getElementById('scene-dice-stage'));
    const state = service.getEngineState();
    if (engine.isFallback) {
      setSceneDiceStageStatus('Textmodus bereit.', 'fallback');
      setSceneDiceEngineNote(state.message || 'Die 3D-Animation ist deaktiviert; Würfe bleiben vollständig funktionsfähig.');
    } else {
      setSceneDiceStageStatus('3D-Würfel bereit.', 'ready');
    }
  } catch (error) {
    setSceneDiceStageStatus('Textmodus bereit.', 'fallback');
    setSceneDiceEngineNote('Die 3D-Animation ist ausgefallen; der sichere Textmodus ist aktiv.');
    setSceneDiceStatus(error.message || '3D-Würfel konnten nicht vorbereitet werden.', 'error');
  }
}

function closeSceneDiceDialog() {
  try {
    if (getSceneDiceService().getEngineState().busy) {
      setSceneDiceStatus('Bitte warte, bis der laufende Wurf beendet ist.', 'error');
      return;
    }
  } catch { /* service may still load */ }
  deactivateDialog('scene-dice-overlay');
}

function applySceneDiceRollType(result, rollType) {
  result.rollType = rollType;
  if (rollType === 'attack' && result.natural === 20) result.special = 'Natürliche 20 · Kritischer Treffer';
  if (rollType === 'attack' && result.natural === 1) result.special = 'Natürliche 1 · Angriff verfehlt automatisch';
  if (rollType === 'death-save' && result.natural === 20) result.special = 'Natürliche 20 · 1 Trefferpunkt zurückerlangt';
  if (rollType === 'death-save' && result.natural === 1) result.special = 'Natürliche 1 · Zwei Fehlschläge';
  return result;
}

async function runSceneDiceAnimation(notationOverride = '') {
  const formulaInput = document.getElementById('scene-dice-formula');
  const formula = String(notationOverride || formulaInput?.value || '').trim();
  const rollType = document.getElementById('scene-dice-roll-type')?.value || 'general';
  if (formulaInput && notationOverride) formulaInput.value = notationOverride;
  setSceneDiceStatus('');
  setSceneDiceEngineNote('');
  setSceneDiceStageStatus('Die Würfel fallen …', 'rolling');
  setSceneDiceBusy(true);
  try {
    const service = getSceneDiceService();
    const result = applySceneDiceRollType(
      await service.roll(formula, document.getElementById('scene-dice-stage')),
      rollType
    );
    _sceneDicePendingRoll = result;
    _sceneDiceLastNotation = result.formula;
    renderSceneDicePendingRoll(result);
    renderSceneDiceHistory();
    const commit = document.querySelector('[data-scene-dice-action="commit"]');
    if (commit) commit.disabled = false;
    setSceneDiceStageStatus(result.visualMode === '3d' ? 'Wurf abgeschlossen.' : 'Textwurf abgeschlossen.', result.visualMode === '3d' ? 'ready' : 'fallback');
    if (result.aggregationCorrected) {
      setSceneDiceStatus('Die Ergebnisaggregation wurde vom Aleria-Adapter verifiziert und korrigiert.', 'info');
    }
  } catch (error) {
    setSceneDiceStageStatus('Wurf nicht ausgeführt.', 'error');
    setSceneDiceStatus(error.message || 'Wurf konnte nicht ausgeführt werden.', 'error');
  } finally {
    setSceneDiceBusy(false);
  }
}

function clearSceneDiceResult() {
  getSceneDiceService().clear();
  _sceneDicePendingRoll = null;
  const result = document.querySelector('[data-scene-dice-result]');
  if (result) {
    result.dataset.state = 'idle';
    result.innerHTML = '<div class="scene-dice-result-idle">Die Würfel warten auf deine Hand.</div>';
  }
  const commit = document.querySelector('[data-scene-dice-action="commit"]');
  if (commit) commit.disabled = true;
  setSceneDiceStatus('');
  setSceneDiceEngineNote('');
  setSceneDiceStageStatus('Bereit für deinen Wurf.', 'idle');
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

async function updateSceneDiceSettingsFromDialog() {
  const animationEnabled = document.getElementById('scene-dice-animation-enabled')?.checked !== false;
  const soundEnabled = document.getElementById('scene-dice-sound-enabled')?.checked === true;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const service = getSceneDiceService();
  await service.updateSettings({ animationEnabled, soundEnabled, reducedMotion });
  service.clear();
  if (!animationEnabled) {
    setSceneDiceStageStatus('Textmodus bereit.', 'fallback');
    setSceneDiceEngineNote('Die Animation ist deaktiviert; Würfe werden sicher im Textmodus ausgeführt.');
  } else {
    setSceneDiceEngineNote('');
    const engine = await service.prepare(document.getElementById('scene-dice-stage'));
    setSceneDiceStageStatus(engine.isFallback ? 'Textmodus bereit.' : '3D-Würfel bereit.', engine.isFallback ? 'fallback' : 'ready');
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
    _sceneDiceSelectedSides = Number(trigger.dataset.dieSides) || 20;
    _sceneDiceMode = 'normal';
    updateSceneDiceTypeButtons();
    updateSceneDiceModeButtons();
    runSceneDiceAnimation(buildSceneDiceFormulaFromControls());
  }
  if (action === 'set-mode') {
    _sceneDiceMode = trigger.dataset.diceMode || 'normal';
    if (_sceneDiceMode !== 'normal') {
      _sceneDiceSelectedSides = 20;
      const count = document.getElementById('scene-dice-count');
      if (count) count.value = '2';
    }
    updateSceneDiceTypeButtons();
    updateSceneDiceModeButtons();
    buildSceneDiceFormulaFromControls();
  }
  if (action === 'roll') runSceneDiceAnimation();
  if (action === 'repeat') runSceneDiceAnimation(_sceneDiceLastNotation);
  if (action === 'clear') clearSceneDiceResult();
  if (action === 'commit') commitSceneDiceRoll();
  if (action === 'reroll-history') runSceneDiceAnimation(trigger.dataset.notation || '1d20');
  if (action === 'delete-history') {
    getSceneDiceService().removeHistoryEntry(trigger.dataset.historyId || '');
    renderSceneDiceHistory();
  }
  if (action === 'clear-history') {
    getSceneDiceService().clearHistory();
    renderSceneDiceHistory();
  }
});

document.addEventListener('input', event => {
  if (!event.target?.matches?.('#scene-dice-count, #scene-dice-modifier')) return;
  buildSceneDiceFormulaFromControls();
});

document.addEventListener('change', event => {
  if (!event.target?.matches?.('#scene-dice-animation-enabled, #scene-dice-sound-enabled')) return;
  updateSceneDiceSettingsFromDialog().catch(error => setSceneDiceStatus(error.message || 'Einstellung konnte nicht übernommen werden.', 'error'));
});

document.addEventListener('keydown', event => {
  const overlay = document.getElementById('scene-dice-overlay');
  if (!overlay?.classList.contains('active')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeSceneDiceDialog();
    return;
  }
  if (event.key === 'Enter' && event.target?.id === 'scene-dice-formula') {
    event.preventDefault();
    runSceneDiceAnimation();
  }
});

document.addEventListener('click', event => {
  if (event.target?.id === 'scene-dice-overlay') closeSceneDiceDialog();
});
