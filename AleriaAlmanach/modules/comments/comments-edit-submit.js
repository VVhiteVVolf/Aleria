// Save flow for editing an existing comment.
async function submitEditComment() {
  syncEditCommentSegmentsToLegacyText();
  const editSegments = buildEditCommentSegmentsForSave();
  const text = editSegments.map(segment => segment.text).join('\n\n').trim();
  const errEl = document.getElementById('ec-form-error');
  const btn = document.getElementById('ec-submit');
  if (!text) { errEl.textContent = 'Bitte Text eingeben.'; errEl.style.display='block'; return; }
  if (text.length > COMMENT_MAX_LENGTH) { errEl.textContent = `Bitte bei maximal ${COMMENT_MAX_LENGTH} Zeichen bleiben.`; errEl.style.display='block'; return; }

  let charName, charTitle, portrait, narrator;
  let commentMetadata = {};
  if (_editMode === 'narrator') {
    charName = 'Erzähler'; charTitle = ''; portrait = null; narrator = true;
    commentMetadata = { characterId: '', emoteIndex: null, avatarKind: 'narrator', commentMode: 'narrator', schemaVersion: 2 };
  } else if (_editSelectedCharId) {
    const c = getAvailableCommentCharacterById(_editSelectedCharId);
    if (!c) { errEl.textContent = _editMode === 'creature' ? 'Kreatur nicht gefunden.' : 'Charakter nicht gefunden.'; errEl.style.display='block'; return; }
    if (!commentActorMatchesComposerMode(c, _editMode)) {
      errEl.textContent = _editMode === 'creature' ? 'Bitte eine Kreatur aus dem Kreaturenregister auswählen.' : 'Bitte einen Charakter auswählen.';
      errEl.style.display='block'; return;
    }
    charName = c.name;
    charTitle = c.title || '';
    const actorMetadata = c.entityType === 'creature'
      ? { actorType: 'creature', creatureId: _editSelectedCharId }
      : { actorType: 'character', creatureId: '' };
    const actorCommentMode = c.entityType === 'creature' ? 'creature' : 'character';
    if (_editSelectedEmoteIdx !== null && c.emotes && c.emotes[_editSelectedEmoteIdx]) {
      portrait = c.emotes[_editSelectedEmoteIdx].img;
      commentMetadata = { characterId: _editSelectedCharId, emoteIndex: _editSelectedEmoteIdx, avatarKind: 'emote', commentMode: actorCommentMode, schemaVersion: 2, ...actorMetadata };
    } else if (normalizeSearchText(_editCommentData?.charName) === normalizeSearchText(c.name) && _editCommentData?.portrait) {
      portrait = normalizeImageUrlForStorage(_editCommentData.portrait) || c.portrait || null;
      commentMetadata = { characterId: _editSelectedCharId, emoteIndex: null, avatarKind: 'portrait', commentMode: actorCommentMode, schemaVersion: 2, ...actorMetadata };
    } else {
      portrait = c.portrait || null;
      commentMetadata = { characterId: _editSelectedCharId, emoteIndex: null, avatarKind: 'portrait', commentMode: actorCommentMode, schemaVersion: 2, ...actorMetadata };
    }
    narrator = false;
  } else if (_editManualMode) {
    charName = document.getElementById('ec-manual-name').value.trim();
    charTitle = document.getElementById('ec-manual-title').value.trim();
    portrait = _editPortraitUrl || normalizeImageUrlForStorage(_editCommentData?.portrait || '') || null;
    narrator = false;
    commentMetadata = { characterId: '', emoteIndex: null, avatarKind: portrait ? 'manual' : 'none', commentMode: 'manual', schemaVersion: 2 };
    if (!charName) { errEl.textContent = 'Bitte Namen eingeben.'; errEl.style.display='block'; return; }
  } else {
    errEl.textContent = _editMode === 'creature'
      ? 'Bitte eine Kreatur aus dem Kreaturenregister auswählen.'
      : 'Bitte Charakter wählen oder manuell eingeben.';
    errEl.style.display='block'; return;
  }
  const storedCombatSegments = (Array.isArray(_editCommentData?.commentSegments) ? _editCommentData.commentSegments : [])
    .filter(segment => segment?.combatResolution);
  const editedCombatSegments = editSegments.filter(segment => segment.commentKind === 'combataction');
  if (storedCombatSegments.length !== editedCombatSegments.length) {
    errEl.textContent = 'Gespeicherte Kampfauswertungen dürfen beim Bearbeiten nicht hinzugefügt oder entfernt werden. Lege dafür einen neuen Beitrag an.';
    errEl.style.display = 'block';
    return;
  }
  let combatIndex = 0;
  let combatMechanicsError = '';
  const preservedSegments = editSegments.map(segment => {
    if (segment.commentKind !== 'combataction') return segment;
    const stored = storedCombatSegments[combatIndex++];
    const storedAction = stored?.combatAction;
    const actorId = String(segment.sceneActorId || segment.characterId || '');
    const sameMechanics = storedAction
      && String(storedAction.actorId || '') === actorId
      && String(storedAction.targetId || '') === String(segment.combatTargetId || '')
      && String(storedAction.profileActionId || '') === String(segment.combatActionId || '');
    if (!sameMechanics) {
      combatMechanicsError = 'Ziel, Angreifer und aktiver Angriff einer bereits ausgewerteten Kampfhandlung sind unveränderlich. Erstelle für einen neuen Wurf einen neuen Beitrag.';
      return segment;
    }
    const { storedCombatAction, storedCombatResolution, ...cleanSegment } = segment;
    return {
      ...cleanSegment,
      combatAction: storedAction,
      combatResolution: stored.combatResolution
    };
  });
  if (combatMechanicsError) {
    errEl.textContent = combatMechanicsError;
    errEl.style.display = 'block';
    return;
  }
  commentMetadata.commentKind = normalizeCommentKind(_editCommentKind, narrator);
  commentMetadata.commentSegments = preservedSegments;
  const preservedCombat = preservedSegments.filter(segment => segment.combatResolution);
  commentMetadata.combatAction = preservedCombat.length === 1 ? preservedCombat[0].combatAction : null;
  commentMetadata.combatResolution = preservedCombat.length === 1 ? preservedCombat[0].combatResolution : null;

  errEl.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Speichere…';
  try {
    const backend = await getCommentBackend({ timeoutMs: 1200 });
    await backend.updateComment(_editTargetId, { text, charName, charTitle, portrait, narrator, ...commentMetadata });
    closeEditComment();
    await loadCommentsIntoPage(getCurrentCommentThreadId(), true);
    if (typeof refreshCurrentModuleCommenterHighlights === 'function') refreshCurrentModuleCommenterHighlights();
  } catch(e) {
    const message = getFriendlyErrorMessage(e, 'Fehler beim Speichern.');
    errEl.textContent = message;
    errEl.style.display = 'block';
    if (typeof showAppStatus === 'function') showAppStatus(message, 'error');
    btn.disabled = false;
    btn.textContent = 'Speichern';
  }
}
