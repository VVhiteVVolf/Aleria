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
    const presentation = c.entityType === 'creature'
      ? c
      : applyCharacterImageSetPresentation(c, _editSelectedImageSetId);
    const selectedImageSetId = presentation.selectedImageSetId || '';
    const imageSetChanged = _editImageSetChangedByUser;
    if (_editSelectedEmoteIdx !== null && presentation.emotes && presentation.emotes[_editSelectedEmoteIdx]) {
      portrait = presentation.emotes[_editSelectedEmoteIdx].img;
      commentMetadata = { characterId: _editSelectedCharId, emoteIndex: _editSelectedEmoteIdx, imageSetId: selectedImageSetId, avatarKind: 'emote', commentMode: actorCommentMode, schemaVersion: 2, ...actorMetadata };
    } else if (!imageSetChanged && normalizeSearchText(_editCommentData?.charName) === normalizeSearchText(c.name) && _editCommentData?.portrait) {
      portrait = normalizeImageUrlForStorage(_editCommentData.portrait) || presentation.portrait || null;
      commentMetadata = { characterId: _editSelectedCharId, emoteIndex: null, imageSetId: selectedImageSetId, avatarKind: 'portrait', commentMode: actorCommentMode, schemaVersion: 2, ...actorMetadata };
    } else {
      portrait = presentation.portrait || null;
      commentMetadata = { characterId: _editSelectedCharId, emoteIndex: null, imageSetId: selectedImageSetId, avatarKind: 'portrait', commentMode: actorCommentMode, schemaVersion: 2, ...actorMetadata };
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
  const editedCombatSegments = editSegments.filter(segment => commentSegmentUsesCombatResolution(segment));
  if (storedCombatSegments.length !== editedCombatSegments.length) {
    errEl.textContent = 'Gespeicherte Kampfauswertungen dürfen beim Bearbeiten nicht hinzugefügt oder entfernt werden. Lege dafür einen neuen Beitrag an.';
    errEl.style.display = 'block';
    return;
  }
  let combatIndex = 0;
  let combatMechanicsError = '';
  const preservedSegments = editSegments.map(segment => {
    if (!commentSegmentUsesCombatResolution(segment)) return segment;
    const stored = storedCombatSegments[combatIndex++];
    const storedAction = stored?.combatAction;
    const actorId = String(segment.sceneActorId || segment.characterId || '');
    const sameMechanics = storedAction
      && String(storedAction.actorId || '') === actorId
      && String(storedAction.targetId || '') === String(segment.combatTargetId || '')
      && JSON.stringify(storedAction.targetIds || [storedAction.targetId].filter(Boolean)) === JSON.stringify(segment.combatTargetIds || [segment.combatTargetId].filter(Boolean))
      && JSON.stringify(storedAction.loadout || null) === JSON.stringify(segment.combatLoadout || null)
      && String(storedAction.profileActionId || '') === String(segment.combatActionId || '')
      && Number(storedAction.castLevel || 0) === Number(segment.combatCastLevel || 0)
      && String(storedAction.paymentMode || 'standard') === String(segment.combatPaymentMode || 'standard');
    if (!sameMechanics) {
      combatMechanicsError = 'Ziel, Angreifer und aktiver Angriff einer bereits ausgewerteten Kampfhandlung sind unveränderlich. Erstelle für einen neuen Wurf einen neuen Beitrag.';
      return segment;
    }
    const { storedCombatAction, storedCombatResolution, ...cleanSegment } = segment;
    return {
      ...cleanSegment,
      combatAction: storedAction,
      combatResolution: stored.combatResolution,
      ...(Array.isArray(stored.combatResolutions) ? { combatResolutions: stored.combatResolutions } : {})
    };
  });
  if (combatMechanicsError) {
    errEl.textContent = combatMechanicsError;
    errEl.style.display = 'block';
    return;
  }
  const originalSegments = Array.isArray(_editCommentData?.commentSegments) ? _editCommentData.commentSegments : [];
  let skillMechanicsError = '';
  const fullyPreservedSegments = preservedSegments.map((segment, index) => {
    const original = originalSegments[index] || {};
    const { storedSkillResolution, storedSkillChallenge, ...cleanSegment } = segment;
    if (original.skillResolution) {
      const actorId = String(segment.sceneActorId || segment.characterId || '');
      const sameSkillMechanics = normalizeCommentSegmentMechanicMode(segment.mechanicMode, segment.commentKind, segment) === 'skill'
        && String(original.skillResolution.actorId || '') === actorId
        && String(original.skillResolution.skillId || '') === String(segment.skillId || '')
        && String(original.skillResolution.targetChallengeId || '') === String(segment.skillTargetChallengeId || '');
      if (!sameSkillMechanics) {
        skillMechanicsError = 'Eine bereits ausgewertete Fertigkeit darf beim Bearbeiten nicht verändert oder neu gewürfelt werden. Erstelle dafür einen neuen Beitrag.';
      }
    } else if (normalizeCommentSegmentMechanicMode(segment.mechanicMode, segment.commentKind, segment) === 'skill') {
      skillMechanicsError = 'Neue Fertigkeitswürfe können nur beim Eintragen eines neuen Beitrags erzeugt werden.';
    }
    if (segment.skillChallengeEnabled && !original.skillChallenge) {
      skillMechanicsError = 'Neue verdeckte Herausforderungen können nur mit einem neuen Beitrag angelegt werden.';
    }
    return {
      ...cleanSegment,
      ...(original.skillResolution ? { skillResolution: original.skillResolution } : {}),
      ...(original.skillChallenge ? { skillChallenge: original.skillChallenge } : {})
    };
  });
  if (skillMechanicsError) {
    errEl.textContent = skillMechanicsError;
    errEl.style.display = 'block';
    return;
  }
  let inventoryUseError = '';
  const inventoryPreservedSegments = fullyPreservedSegments.map((segment, index) => {
    const original = originalSegments[index] || {};
    const storedUse = original.inventoryUse;
    const { storedInventoryUse, ...cleanSegment } = segment;
    if (storedUse) {
      const sameItem = String(segment.commentKind || segment.kind || '') === 'consume'
        && String(segment.inventoryItemId || storedInventoryUse?.item?.id || '') === String(storedUse.item?.id || '');
      if (!sameItem) {
        inventoryUseError = 'Ein bereits gespeicherter Inventarvorgang und sein Gegenstand sind unveränderlich. Erstelle für eine neue Benutzung einen neuen Beitrag.';
      }
      return { ...cleanSegment, inventoryUse: storedUse };
    }
    if (String(segment.commentKind || segment.kind || '') === 'consume') {
      inventoryUseError = 'Neue Inventarvorgänge können nur beim Eintragen eines neuen Beitrags erzeugt werden.';
    }
    return cleanSegment;
  });
  if (inventoryUseError) {
    errEl.textContent = inventoryUseError;
    errEl.style.display = 'block';
    return;
  }
  commentMetadata.commentKind = normalizeCommentKind(_editCommentKind, narrator);
  commentMetadata.commentSegments = inventoryPreservedSegments;
  const preservedCombat = inventoryPreservedSegments.filter(segment => segment.combatResolution);
  commentMetadata.combatAction = preservedCombat.length === 1 ? preservedCombat[0].combatAction : null;
  commentMetadata.combatResolution = preservedCombat.length === 1 ? preservedCombat[0].combatResolution : null;
  commentMetadata.inventoryTransaction = _editCommentData?.inventoryTransaction || null;

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
