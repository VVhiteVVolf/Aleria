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

function getSceneDiceDialogContext() {
  const participant = window.AleriaSceneDiceParticipants?.getSelection?.() || {
    id: '',
    name: String(document.getElementById('scene-dice-roller')?.value || '').trim() || 'Erzähler'
  };
  return {
    roller: String(participant.name || '').trim() || 'Erzähler',
    rollerId: participant.id === '__narrator__' ? '' : String(participant.id || '').trim(),
    purpose: String(document.getElementById('scene-dice-purpose')?.value || '').trim(),
    situation: String(document.getElementById('scene-dice-situation')?.value || '').trim().slice(0, 900),
    rollType: document.getElementById('scene-dice-roll-type')?.value || 'general',
    narrationMode: window.AleriaSceneDiceNarration?.normalizeMode?.(
      document.getElementById('scene-dice-narration-mode')?.value || 'immersive'
    ) || 'immersive',
    humorEnabled: document.getElementById('scene-dice-humor-enabled')?.checked === true,
    manualNarration: String(document.getElementById('scene-dice-manual-narration')?.value || '').trim().slice(0, 700)
  };
}

async function generateSceneDiceNarrationForRoll(roll) {
  if (!roll) return;
  const token = ++_sceneDiceNarrationToken;
  roll.narrationMode = window.AleriaSceneDiceNarration?.normalizeMode?.(roll.narrationMode) || 'immersive';
  roll.narration = '';
  roll.narrationError = '';
  const commit = document.querySelector('[data-scene-dice-action="commit"]');

  const manualNarration = String(roll.manualNarration || '').trim().slice(0, 700);
  if (manualNarration) {
    roll.narration = manualNarration;
    roll.narrationSource = 'manual';
    roll.narrationState = 'ready';
    renderSceneDicePendingRoll(roll);
    if (commit) commit.disabled = false;
    setSceneDiceStatus('Deine eigene Beschreibung wird für diesen Wurf verwendet.', 'info');
    return;
  }
  if (roll.narrationMode === 'standard') {
    roll.narration = window.AleriaSceneDiceNarration?.createStandard?.(roll, roll.roller)
      || `${roll.roller || 'Die Szene'} hat eine ${roll.natural || roll.total || 0} gewürfelt.`;
    roll.narrationSource = 'standard';
    roll.narrationState = 'ready';
    renderSceneDicePendingRoll(roll);
    if (commit) commit.disabled = false;
    setSceneDiceStatus('Standardwurf bereit. Es wird keine KI-Deutung verwendet.', 'info');
    return;
  }

  roll.narrationState = 'loading';
  roll.narrationSource = 'ai';
  renderSceneDicePendingRoll(roll);
  if (commit) commit.disabled = true;
  setSceneDiceStatus('AleriaGPT liest Szene, bisherigen Verlauf und Figurenkontext …', 'info');
  try {
    if (!window.AleriaSceneDiceNarration?.generate) {
      throw new Error('Die AleriaGPT-Würfelauswertung ist noch nicht geladen.');
    }
    const narration = await window.AleriaSceneDiceNarration.generate(roll, {
      situation: roll.situation || ''
    });
    if (token !== _sceneDiceNarrationToken || _sceneDicePendingRoll?.id !== roll.id) return;
    roll.narration = narration;
    roll.narrationSource = 'ai';
    roll.narrationState = 'ready';
    renderSceneDicePendingRoll(roll);
    setSceneDiceStatus('Erzähltext erstellt. Der Wurf kann in die Szene eingetragen werden.', 'info');
  } catch (error) {
    if (token !== _sceneDiceNarrationToken || _sceneDicePendingRoll?.id !== roll.id) return;
    roll.narrationState = 'error';
    roll.narrationError = error?.message || 'AleriaGPT konnte den Wurf gerade nicht auswerten.';
    renderSceneDicePendingRoll(roll);
    setSceneDiceStatus('Die KI-Beschreibung ist fehlgeschlagen. Du kannst sie erneut anfordern oder den Wurf ohne Beschreibung eintragen.', 'error');
  } finally {
    if (token === _sceneDiceNarrationToken && _sceneDicePendingRoll?.id === roll.id && commit) {
      commit.disabled = false;
    }
  }
}

async function runSceneDiceAnimation(notationOverride = '') {
  _sceneDiceNarrationToken += 1;
  const formulaInput = document.getElementById('scene-dice-formula');
  const formula = String(notationOverride || formulaInput?.value || '').trim();
  const context = getSceneDiceDialogContext();
  if (formulaInput && notationOverride) formulaInput.value = notationOverride;
  setSceneDiceStatus('');
  setSceneDiceEngineNote('');
  setSceneDiceStageStatus('Die Würfel fallen …', 'rolling');
  setSceneDiceBusy(true);
  try {
    const service = getSceneDiceService();
    const result = await service.roll(formula, document.getElementById('scene-dice-stage'), context);
    result.rollerId = context.rollerId;
    result.situation = context.situation;
    result.narrationMode = context.narrationMode;
    result.humorEnabled = context.humorEnabled;
    result.manualNarration = context.manualNarration;
    _sceneDicePendingRoll = result;
    _sceneDiceLastNotation = result.formula;
    renderSceneDicePendingRoll(result);
    renderSceneDiceHistory();
    const commit = document.querySelector('[data-scene-dice-action="commit"]');
    if (commit) commit.disabled = true;
    setSceneDiceStageStatus(result.visualMode === '3d' ? 'Wurf abgeschlossen.' : 'Textwurf abgeschlossen.', result.visualMode === '3d' ? 'ready' : 'fallback');
    if (result.aggregationCorrected) {
      setSceneDiceStatus('Die Ergebnisaggregation wurde vom Aleria-Adapter verifiziert und korrigiert.', 'info');
    }
    if (!service.getSettings().keepPool) {
      service.resetPool();
      _sceneDiceMode = 'normal';
      renderSceneDicePool();
      updateSceneDiceModeButtons();
      buildSceneDiceFormulaFromControls();
    }
    generateSceneDiceNarrationForRoll(result);
  } catch (error) {
    setSceneDiceStageStatus('Wurf nicht ausgeführt.', 'error');
    setSceneDiceStatus(error.message || 'Wurf konnte nicht ausgeführt werden.', 'error');
  } finally {
    setSceneDiceBusy(false);
  }
}

function clearSceneDiceResult() {
  _sceneDiceNarrationToken += 1;
  getSceneDiceService().clear();
  _sceneDicePendingRoll = null;
  const result = document.querySelector('[data-scene-dice-result]');
  if (result) {
    result.dataset.state = 'idle';
    result.innerHTML = '<div class="scene-dice-result-idle"><strong>Noch kein Schicksal geworfen</strong><span>Stelle rechts deinen Würfelpool zusammen.</span></div>';
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
  const context = getSceneDiceDialogContext();
  const roller = context.roller || _sceneDicePendingRoll.roller || 'Erzähler';
  const purpose = context.purpose || _sceneDicePendingRoll.purpose || '';
  const roll = {
    ..._sceneDicePendingRoll,
    roller,
    rollerId: context.rollerId || _sceneDicePendingRoll.rollerId || '',
    purpose,
    situation: context.situation || _sceneDicePendingRoll.situation || '',
    narrationMode: _sceneDicePendingRoll.narrationMode || context.narrationMode,
    humorEnabled: _sceneDicePendingRoll.humorEnabled === true,
    manualNarration: _sceneDicePendingRoll.manualNarration || ''
  };
  const commit = document.querySelector('[data-scene-dice-action="commit"]');
  if (!threadId) {
    setSceneDiceStatus('Kein aktiver Szenen-Thread gefunden.', 'error');
    return;
  }
  if (roll.narrationState === 'loading') {
    setSceneDiceStatus('AleriaGPT deutet diesen Wurf noch. Bitte warte einen Moment.', 'error');
    return;
  }
  if (commit) commit.disabled = true;
  const resultValue = Number.isFinite(Number(roll.natural)) && Number(roll.natural) > 0
    ? Number(roll.natural)
    : Number(roll.total) || 0;
  const totalSuffix = resultValue !== Number(roll.total) ? ` (Gesamt ${roll.total})` : '';
  const fallbackText = `${roller} würfelt${purpose ? ` auf ${purpose}` : ''}: ${resultValue}${totalSuffix}.`;
  const text = roll.narration || fallbackText;
  const metadata = {
    commentMode: 'scene-dice',
    commentKind: SCENE_DICE_EVENT_KIND,
    sceneDiceRoll: roll,
    orderKey: getNextCommentOrderKey(threadId)
  };
  let backend = null;
  try {
    backend = await getCommentBackend({ timeoutMs: 1200 });
    await backend.addComment(threadId, 'Erzähler', '', null, text, COMMENT_DELETE_CODE, true, metadata);
    closeSceneDiceDialog();
    requestCommentAutoScroll(threadId);
    await loadCommentsIntoPage(threadId, true, { page: 'last' });
    if (typeof loadSidebarFeed === 'function') loadSidebarFeed();
  } catch (error) {
    if (backend && !backend._localFallback) {
      try {
        await getLocalCommentBackend().addComment(threadId, 'Erzähler', '', null, text, COMMENT_DELETE_CODE, true, metadata);
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
  const reducedMotion = document.getElementById('scene-dice-reduced-motion')?.checked === true;
  const keepPool = document.getElementById('scene-dice-keep-pool')?.checked !== false;
  const throwStyle = document.getElementById('scene-dice-throw-style')?.value || 'balanced';
  const service = getSceneDiceService();
  const previousSettings = service.getSettings();
  await service.updateSettings({ animationEnabled, soundEnabled, reducedMotion, keepPool, throwStyle });
  if (!animationEnabled) {
    if (previousSettings.animationEnabled) service.clear();
    setSceneDiceStageStatus('Textmodus bereit.', 'fallback');
    setSceneDiceEngineNote('Die Animation ist deaktiviert; Würfe werden sicher im Textmodus ausgeführt.');
  } else {
    setSceneDiceEngineNote('');
    const engine = await service.prepare(document.getElementById('scene-dice-stage'));
    setSceneDiceStageStatus(engine.isFallback ? 'Textmodus bereit.' : '3D-Würfel bereit.', engine.isFallback ? 'fallback' : 'ready');
  }
}

function updateSceneDiceNarrationFromDialog() {
  syncSceneDiceNarrationModeUi();
  if (!_sceneDicePendingRoll) return;
  const context = getSceneDiceDialogContext();
  Object.assign(_sceneDicePendingRoll, {
    roller: context.roller,
    rollerId: context.rollerId,
    purpose: context.purpose,
    situation: context.situation,
    narrationMode: context.narrationMode,
    humorEnabled: context.humorEnabled,
    manualNarration: context.manualNarration
  });
  generateSceneDiceNarrationForRoll(_sceneDicePendingRoll);
}

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-scene-dice-action]');
  if (!trigger) return;
  event.preventDefault();
  const action = trigger.dataset.sceneDiceAction;
  if (action === 'open') openSceneDiceDialog();
  if (action === 'close') closeSceneDiceDialog();
  if (action === 'add-die') {
    getSceneDiceService().addPoolDie(Number(trigger.dataset.dieSides) || 20);
    renderSceneDicePool();
    buildSceneDiceFormulaFromControls();
  }
  if (action === 'remove-die') {
    getSceneDiceService().removePoolDie(Number(trigger.dataset.dieSides) || 20);
    renderSceneDicePool();
    buildSceneDiceFormulaFromControls();
  }
  if (action === 'reset-pool') {
    getSceneDiceService().resetPool();
    _sceneDiceMode = 'normal';
    renderSceneDicePool();
    updateSceneDiceModeButtons();
    buildSceneDiceFormulaFromControls();
  }
  if (action === 'set-mode') {
    _sceneDiceMode = trigger.dataset.diceMode || 'normal';
    if (_sceneDiceMode !== 'normal' && !getSceneDiceService().getPool().some(entry => entry.sides === 20)) {
      getSceneDiceService().addPoolDie(20);
      renderSceneDicePool();
    }
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
  if (action === 'toggle-roller') window.AleriaSceneDiceParticipants?.toggle?.();
  if (action === 'select-roller') window.AleriaSceneDiceParticipants?.select?.(trigger.dataset.characterId || '');
  if (action === 'retry-narration') generateSceneDiceNarrationForRoll(_sceneDicePendingRoll);
});

document.addEventListener('input', event => {
  if (event.target?.matches?.('[data-scene-dice-participant-search]')) {
    window.AleriaSceneDiceParticipants?.filter?.(event.target.value || '');
    return;
  }
  if (!event.target?.matches?.('#scene-dice-modifier')) return;
  buildSceneDiceFormulaFromControls();
});

document.addEventListener('change', event => {
  if (event.target?.matches?.('#scene-dice-narration-mode, #scene-dice-humor-enabled, #scene-dice-manual-narration')) {
    updateSceneDiceNarrationFromDialog();
    return;
  }
  if (!event.target?.matches?.('#scene-dice-animation-enabled, #scene-dice-sound-enabled, #scene-dice-reduced-motion, #scene-dice-keep-pool, #scene-dice-throw-style')) return;
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
