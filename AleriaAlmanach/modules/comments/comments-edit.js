// Edit existing comments: dialog lifecycle and code verification.
// ── KOMMENTAR BEARBEITEN ─────────────────────────────────────────────────────
function openEditComment(commentId) {
  if (typeof setCommentPreviewPanelState === 'function') setCommentPreviewPanelState('split');
  _editTargetId = commentId;
  _editCommentData = null;
  _editMode = 'charakter';
  _editCommentKind = 'speech';
  _editSelectedCharId = null;
  _editSelectedEmoteIdx = null;
  _editSelectedImageSetId = CHARACTER_IMAGE_SET_DEFAULT_ID;
  _editImageSetChangedByUser = false;
  _editManualMode = false;
  _editPortraitUrl = null;
  _editCommentSegments = [makeCommentSegment('speech')];
  window.AleriaCommentSceneCast?.setEditActorsFromSegments?.([]);
  // Reset to code step
  document.getElementById('ec-code').value = '';
  document.getElementById('ec-code-error').style.display = 'none';
  document.getElementById('ec-verify-btn').disabled = false;
  document.getElementById('ec-verify-btn').textContent = 'Weiter ->';
  document.getElementById('edit-step-code').style.display = 'flex';
  document.getElementById('edit-step-form').classList.remove('visible');
  document.getElementById('ec-form-error').style.display = 'none';
  document.getElementById('ec-char-search').value = '';
  document.getElementById('ec-selected-name').textContent = '';
  document.getElementById('ec-manual-name').value = '';
  document.getElementById('ec-manual-title').value = '';
  document.getElementById('ec-portrait-url').value = '';
  document.getElementById('ec-manual-fields').style.display = 'none';
  document.getElementById('ec-manual-toggle').textContent = '+ Manuell';
  document.getElementById('ec-portrait-preview').removeAttribute('src');
  document.getElementById('ec-portrait-preview').style.display = 'none';
  setRichEditorContent('ec-text', '');
  renderEditCommentSegmentList();
  setEditMode('charakter');
  setEditCommentKind('speech');
  setEditFormCounter();
  updateEditFormPreview();
  activateDialog('edit-comment-overlay', { initialFocus: '#ec-code' });
}

function closeEditComment() {
  deactivateDialog('edit-comment-overlay');
  _editTargetId = null;
  _editCommentData = null;
}

async function verifyEditCode() {
  const code = document.getElementById('ec-code').value.trim().toUpperCase();
  const errEl = document.getElementById('ec-code-error');
  const btn = document.getElementById('ec-verify-btn');
  if (!code) { errEl.textContent = 'Bitte Code eingeben.'; errEl.style.display='block'; return; }
  errEl.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Prüfe...';
  try {
    const backend = await getCommentBackend({ timeoutMs: 1200 });
    const data = await backend.verifyCommentCode(_editTargetId, code);
    const transactionPolicy = window.AleriaCommentTransactions;
    if (transactionPolicy?.isImmutable?.(data)) {
      throw new Error(transactionPolicy.getLockMessage(data, 'bearbeitet'));
    }
    _editCommentData = data;
    _editSelectedEmoteIdx = null;
    _editSelectedImageSetId = String(data.imageSetId || data.commentSegments?.[0]?.imageSetId || CHARACTER_IMAGE_SET_DEFAULT_ID);
    _editImageSetChangedByUser = false;
    _editPortraitUrl = normalizeImageUrlForStorage(data.portrait || '');
    setEditCommentKind(data.commentKind || 'speech');
    // Populate edit form
    setRichEditorContent('ec-text', data.text || '');
    if (Array.isArray(data.commentSegments) && data.commentSegments.length) {
      window.AleriaCommentSceneCast?.setEditActorsFromSegments?.(data.commentSegments);
      _editCommentSegments = data.commentSegments.map(segment => makeCommentSegment(
        segment.commentKind || segment.kind || (segment.narrator ? 'action' : 'speech'),
        segment.text || '',
        Number.isInteger(segment.emoteIndex) ? segment.emoteIndex : null,
        segment.side || 'left',
        segment.durationSeconds,
        segment.language || segment.spellFont,
        segment.languageColor,
        {
          imageSetId: segment.imageSetId || data.imageSetId || '',
          mechanicMode: segment.mechanicMode,
          skillId: segment.skillId || segment.skillResolution?.skillId,
          skillCustomModifier: segment.skillCustomModifier ?? segment.skillResolution?.customModifier,
          skillDifficulty: segment.skillDifficulty ?? segment.skillResolution?.difficulty,
          skillRollMode: segment.skillRollMode || segment.skillResolution?.rollMode,
          skillTargetActorKey: segment.skillTargetActorKey || '',
          skillTargetChallengeId: segment.skillTargetChallengeId || segment.skillResolution?.targetChallengeId,
          skillChallengeId: segment.skillChallenge?.id,
          skillChallengeEnabled: !!segment.skillChallenge,
          skillChallengeTitle: segment.skillChallenge?.title,
          skillChallengeRevealedText: segment.skillChallenge?.revealedText,
          skillChallengeDifficulty: segment.skillChallenge?.difficulty,
          skillChallengePreferredSkills: segment.skillChallenge?.preferredSkills,
          skillChallengePreferredModifier: segment.skillChallenge?.preferredModifier,
          skillChallengeAlternativeModifier: segment.skillChallenge?.alternativeModifier,
          skillChallengeDefenseMode: segment.skillChallenge?.defenseMode || segment.skillChallengeDefenseMode,
          skillChallengeDefenseSkillId: segment.skillChallenge?.defenseSkillId || segment.skillChallengeDefenseSkillId,
          skillRuleSelections: segment.skillRuleSelections,
          storedSkillResolution: segment.skillResolution || null,
          storedSkillChallenge: segment.skillChallenge || null,
          targetId: segment.combatTargetId || segment.combatAction?.targetId,
          targetIds: segment.combatTargetIds || segment.combatAction?.targetIds || [segment.combatTargetId || segment.combatAction?.targetId].filter(Boolean),
          loadout: segment.combatAction?.loadout || segment.combatLoadout || null,
          actionId: segment.combatActionId || segment.combatAction?.profileActionId,
          castLevel: segment.combatAction?.castLevel ?? segment.combatCastLevel ?? 0,
          rollMode: segment.combatRollMode || segment.combatAction?.rollMode,
          distanceMeters: segment.combatDistanceMeters ?? segment.combatResolution?.auraContext?.distanceMeters,
          paymentMode: segment.combatPaymentMode || segment.combatAction?.paymentMode,
          paymentConfirmed: true,
          actorId: segment.sceneActorId || segment.actorId || '',
          storedCombatAction: segment.combatAction || null,
          storedCombatResolution: segment.combatResolution || null,
          inventoryItemId: segment.inventoryUse?.item?.id || '',
          inventoryUseMode: segment.inventoryUse?.requestedMode || segment.inventoryUse?.mode || 'auto',
          storedInventoryUse: segment.inventoryUse || null
        }
      ));
    } else {
      _editCommentSegments = [makeCommentSegment(data.commentKind || 'speech', data.text || '', Number.isInteger(data.emoteIndex) ? data.emoteIndex : null)];
    }
    // Set mode. Creature metadata is persisted independently from the display name,
    // so duplicated or renamed instances still reopen in the correct picker.
    const creatureComment = !data.narrator && (
      data.actorType === 'creature' || !!data.creatureId || data.commentMode === 'creature'
    );
    const actorMode = data.narrator ? 'narrator' : (creatureComment ? 'creature' : 'charakter');
    setEditMode(actorMode);
    // Pre-select char if it exists
    _editSelectedCharId = null;
    if (!data.narrator) {
      const preferredId = creatureComment ? (data.creatureId || data.characterId) : data.characterId;
      const directMatch = preferredId ? getAvailableCommentCharacterById(preferredId) : null;
      const match = directMatch || getAvailableCommentCharacterByName(data.charName);
      if (match && commentActorMatchesComposerMode(match, actorMode)) {
        _editSelectedCharId = match.id;
        const presentation = match.entityType === 'creature'
          ? match
          : applyCharacterImageSetPresentation(match, _editSelectedImageSetId);
        _editSelectedImageSetId = presentation?.selectedImageSetId || '';
        if (data.portrait && Array.isArray(presentation?.emotes)) {
          const emoteIdx = presentation.emotes.findIndex(emote => String(emote?.img || '') === String(data.portrait || ''));
          _editSelectedEmoteIdx = emoteIdx >= 0 ? emoteIdx : null;
        }
      } else {
        _editManualMode = true;
      }
    }
    renderEditCharPicker();
    renderEditCommentSegmentList();
    document.getElementById('ec-char-search').value = '';
    document.getElementById('ec-manual-name').value = data.charName || '';
    document.getElementById('ec-manual-title').value = data.charTitle || '';
    document.getElementById('ec-portrait-url').value = _editPortraitUrl || '';
    const portraitPreview = document.getElementById('ec-portrait-preview');
    if (portraitPreview && _editPortraitUrl) {
      portraitPreview.src = _editPortraitUrl;
      portraitPreview.style.display = 'block';
    } else if (portraitPreview) {
      portraitPreview.style.display = 'none';
    }
    if (_editSelectedCharId) {
      const char = getAvailableCommentCharacterById(_editSelectedCharId);
      document.getElementById('ec-selected-name').textContent = char ? `Als ${char.name} bearbeiten` : '';
    } else {
      document.getElementById('ec-selected-name').textContent = '';
    }
    document.getElementById('edit-step-code').style.display = 'none';
    document.getElementById('edit-step-form').classList.add('visible');
    if (typeof applyCommentPreviewLayout === 'function') applyCommentPreviewLayout();
    applyEditCharacterFilter();
    setEditFormCounter();
    updateEditFormPreview();
    setTimeout(() => focusRichEditor('ec-text'), 30);
  } catch(e) {
    errEl.textContent = e.message === 'Falscher Code'
      ? 'Falscher Code.'
      : getFriendlyErrorMessage(e, 'Fehler beim Prüfen.');
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Weiter ->';
  }
}
