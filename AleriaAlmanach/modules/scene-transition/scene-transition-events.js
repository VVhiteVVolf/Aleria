let _sceneTransitionSelectedCharacterIds = new Set();
let _sceneTransitionSelectedIconKey = 'general';
let _sceneTransitionSubmitting = false;

function setSceneTransitionStatus(message = '', type = 'info') {
  const status = document.querySelector('[data-scene-transition-status]');
  if (!status) return;
  status.textContent = message;
  status.dataset.status = type;
}

function getSceneTransitionDialogPayload() {
  const source = getCurrentSceneTransitionEndpoint();
  const targetThreadId = document.getElementById('scene-transition-target')?.value || '';
  const target = getSceneTransitionEndpoints().find(endpoint => endpoint.threadId === targetThreadId);
  const byId = new Map((getVisibleCharacterRecords?.() || []).map(character => [String(character.id || ''), character]));
  const characters = Array.from(_sceneTransitionSelectedCharacterIds).map(id => {
    const character = byId.get(id);
    return character ? {
      id,
      name: character.name || 'Unbekannt',
      portrait: getSceneTransitionCharacterPortrait(character)
    } : null;
  }).filter(Boolean);
  return normalizeSceneTransition({
    transitionId: makeSceneTransitionId(),
    source,
    target,
    flavourText: document.getElementById('scene-transition-text')?.value || '',
    iconKey: _sceneTransitionSelectedIconKey,
    characters
  });
}

function renderSceneTransitionPreview() {
  const preview = document.querySelector('[data-scene-transition-preview]');
  if (!preview) return;
  const payload = getSceneTransitionDialogPayload();
  preview.innerHTML = payload.target.threadId
    ? renderSceneTransitionBlock(payload, { hideActions: true, threadId: payload.source.threadId })
    : '<div class="scene-transition-empty">Bitte zuerst eine Zielszene wählen.</div>';
}

function openSceneTransitionDialog() {
  const source = getCurrentSceneTransitionEndpoint();
  if (!source) {
    showAppStatus?.('Szenenwechsel sind nur in interaktiven Szenen verfügbar.', 'error');
    return;
  }
  const overlay = ensureSceneTransitionDialog();
  _sceneTransitionSelectedCharacterIds = new Set(getCurrentCommentCastIds?.() || []);
  _sceneTransitionSelectedIconKey = 'general';
  const target = overlay.querySelector('#scene-transition-target');
  if (target) target.innerHTML = buildSceneTransitionTargetOptions();
  const text = overlay.querySelector('#scene-transition-text');
  if (text) text.value = '';
  const picker = overlay.querySelector('[data-scene-transition-characters]');
  if (picker) picker.innerHTML = buildSceneTransitionCharacterPicker(Array.from(_sceneTransitionSelectedCharacterIds));
  const iconPicker = overlay.querySelector('[data-scene-transition-icons]');
  if (iconPicker) iconPicker.innerHTML = buildSceneTransitionIconPicker(_sceneTransitionSelectedIconKey);
  const search = overlay.querySelector('[data-scene-transition-action="filter-characters"]');
  if (search) search.value = '';
  setSceneTransitionStatus('');
  renderSceneTransitionPreview();
  activateDialog('scene-transition-overlay', { initialFocus: '#scene-transition-target' });
}

function closeSceneTransitionDialog() {
  deactivateDialog('scene-transition-overlay');
}

function toggleSceneTransitionCharacter(button) {
  const id = String(button.dataset.characterId || '').trim();
  if (!id) return;
  if (_sceneTransitionSelectedCharacterIds.has(id)) _sceneTransitionSelectedCharacterIds.delete(id);
  else _sceneTransitionSelectedCharacterIds.add(id);
  const selected = _sceneTransitionSelectedCharacterIds.has(id);
  button.classList.toggle('selected', selected);
  button.setAttribute('aria-pressed', String(selected));
  renderSceneTransitionPreview();
}

function filterSceneTransitionCharacters(input) {
  const needle = normalizeSearchText(input.value || '');
  input.closest('section')?.querySelectorAll('.scene-transition-character').forEach(button => {
    button.hidden = !!needle && !String(button.dataset.characterSearch || '').includes(needle);
  });
}

function selectSceneTransitionIcon(button) {
  _sceneTransitionSelectedIconKey = getSceneTransitionIconPreset(button.dataset.transitionIconKey || '').key;
  button.closest('[data-scene-transition-icons]')?.querySelectorAll('.scene-transition-icon-option').forEach(option => {
    const selected = option.dataset.transitionIconKey === _sceneTransitionSelectedIconKey;
    option.classList.toggle('selected', selected);
    option.setAttribute('aria-pressed', String(selected));
  });
  renderSceneTransitionPreview();
}

async function submitSceneTransition() {
  if (_sceneTransitionSubmitting) return;
  const payload = getSceneTransitionDialogPayload();
  if (!payload.source.threadId || !payload.target.threadId) {
    setSceneTransitionStatus('Bitte eine Zielszene wählen.', 'error');
    return;
  }
  if (!payload.flavourText) {
    setSceneTransitionStatus('Bitte den Flavourtext eintragen.', 'error');
    document.getElementById('scene-transition-text')?.focus();
    return;
  }
  if (payload.source.threadId === payload.target.threadId) {
    setSceneTransitionStatus('Quell- und Zielszene müssen verschieden sein.', 'error');
    return;
  }
  _sceneTransitionSubmitting = true;
  const submit = document.querySelector('[data-scene-transition-action="submit"]');
  if (submit) submit.disabled = true;
  const metadata = {
    commentMode: 'scene-transition',
    commentKind: SCENE_TRANSITION_KIND,
    sceneTransition: payload
  };
  try {
    const backend = await getCommentBackend({ timeoutMs: 1200 });
    if (typeof backend.addSceneTransition !== 'function') throw new Error('Szenenwechsel-Speicherung ist noch nicht verfügbar.');
    await backend.addSceneTransition(payload.source.threadId, payload.target.threadId, payload.flavourText, COMMENT_DELETE_CODE, metadata);
    closeSceneTransitionDialog();
    requestCommentAutoScroll(payload.source.threadId);
    await loadCommentsIntoPage(payload.source.threadId, true, { page: 'last' });
    loadSidebarFeed?.();
    showAppStatus?.('Szenenwechsel wurde in beiden Szenen eingetragen.', 'success');
  } catch (error) {
    console.error('scene transition submit failed:', error);
    setSceneTransitionStatus(getFriendlyErrorMessage?.(error, 'Szenenwechsel konnte nicht gespeichert werden.') || error.message, 'error');
  } finally {
    _sceneTransitionSubmitting = false;
    if (submit) submit.disabled = false;
  }
}

function handleSceneTransitionClick(event) {
  const trigger = event.target?.closest?.('[data-scene-transition-action]');
  if (!trigger) return;
  const action = trigger.dataset.sceneTransitionAction;
  if (action === 'open-dialog') openSceneTransitionDialog();
  else if (action === 'close-dialog') closeSceneTransitionDialog();
  else if (action === 'toggle-character') toggleSceneTransitionCharacter(trigger);
  else if (action === 'select-icon') selectSceneTransitionIcon(trigger);
  else if (action === 'open-target') openEntryById(trigger.dataset.transitionThreadId || '');
  else if (action === 'submit') submitSceneTransition();
  else return;
  event.preventDefault();
}

function handleSceneTransitionInput(event) {
  const action = event.target?.dataset?.sceneTransitionAction;
  if (action === 'filter-characters') filterSceneTransitionCharacters(event.target);
  if (action === 'update-preview') renderSceneTransitionPreview();
}

document.addEventListener('click', handleSceneTransitionClick);
document.addEventListener('input', handleSceneTransitionInput);
document.addEventListener('change', handleSceneTransitionInput);
