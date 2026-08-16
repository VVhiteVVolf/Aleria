// Comment draft persistence.
// Owns local draft serialization, restore, cleanup, and clearing.

function getCommentDraftPayload() {
  return {
    mode: _commentMode,
    commentKind: _commentKind,
    selectedCharId: _selectedCharId,
    selectedEmoteIdx: _selectedEmoteIdx,
    selectedImageSetId: _selectedImageSetId,
    manualMode: _manualMode,
    name: document.getElementById('cf-name')?.value || '',
    title: document.getElementById('cf-title')?.value || '',
    text: document.getElementById('cf-text')?.value || '',
    segments: _commentSegments.map(segment => ({
      kind: segment.kind,
      text: segment.text,
      emoteIndex: Number.isInteger(segment.emoteIndex) ? segment.emoteIndex : null,
      imageSetId: String(segment.imageSetId || ''),
      side: commentSegmentUsesSide(segment.kind, false) ? normalizeCommentSegmentSide(segment.side) : '',
      language: getCommentLanguage(segment),
      languageColor: commentKindUsesLanguage(segment.kind) ? getCommentLanguageColor(segment, segment.kind) : '',
      durationSeconds: getSceneTimeSegmentDuration(segment),
      actorId: String(segment.actorId || ''),
      mechanicMode: normalizeCommentSegmentMechanicMode(segment.mechanicMode, segment.kind, segment),
      skillId: String(segment.skillId || ''),
      skillCustomModifier: Number(segment.skillCustomModifier || 0),
      skillDifficulty: Number(segment.skillDifficulty || 10),
      skillRollMode: ['advantage', 'disadvantage'].includes(segment.skillRollMode) ? segment.skillRollMode : 'normal',
      skillTargetActorKey: String(segment.skillTargetActorKey || ''),
      skillTargetChallengeId: String(segment.skillTargetChallengeId || ''),
      skillChallengeId: String(segment.skillChallengeId || ''),
      skillChallengeEnabled: !!segment.skillChallengeEnabled,
      skillChallengeTitle: String(segment.skillChallengeTitle || ''),
      skillChallengeRevealedText: String(segment.skillChallengeRevealedText || ''),
      skillChallengeDifficulty: Number(segment.skillChallengeDifficulty || 10),
      skillChallengePreferredSkills: Array.isArray(segment.skillChallengePreferredSkills) ? [...segment.skillChallengePreferredSkills] : [],
      skillChallengePreferredModifier: Number(segment.skillChallengePreferredModifier ?? 2),
      skillChallengeAlternativeModifier: Number(segment.skillChallengeAlternativeModifier ?? -2),
      skillChallengeDefenseMode: segment.skillChallengeDefenseMode === 'fixed' ? 'fixed' : 'passive',
      skillChallengeDefenseSkillId: String(segment.skillChallengeDefenseSkillId || 'deception'),
      skillRuleSelections: Array.isArray(segment.skillRuleSelections) ? segment.skillRuleSelections.map(selection => ({ ...selection })) : [],
      inventoryItemId: segment.kind === 'consume' ? String(segment.inventoryItemId || '') : '',
      inventoryUseMode: segment.kind === 'consume' && ['consume', 'use'].includes(segment.inventoryUseMode) ? segment.inventoryUseMode : 'auto',
      combatTargetId: commentSegmentUsesCombatResolution(segment) ? String(segment.combatTargetId || '') : '',
      combatTargetIds: commentSegmentUsesCombatResolution(segment) ? [...new Set((segment.combatTargetIds || [segment.combatTargetId]).map(String).filter(Boolean))] : [],
      combatActionId: commentSegmentUsesCombatResolution(segment) ? String(segment.combatActionId || '') : '',
      combatRollMode: commentSegmentUsesCombatResolution(segment) && ['advantage', 'disadvantage'].includes(segment.combatRollMode) ? segment.combatRollMode : 'normal',
      combatCastLevel: commentSegmentUsesCombatResolution(segment) ? Math.max(0, Math.min(10, Number(segment.combatCastLevel) || 0)) : 0,
      combatDistanceMeters: commentSegmentUsesCombatResolution(segment) ? Math.max(0, Number(segment.combatDistanceMeters) || 0) : 0,
      combatPaymentMode: commentSegmentUsesCombatResolution(segment) && ['aura', 'cheat'].includes(segment.combatPaymentMode) ? segment.combatPaymentMode : 'standard',
      combatPaymentConfirmed: commentSegmentUsesCombatResolution(segment) && !!segment.combatPaymentConfirmed
    })),
    sceneActors: window.AleriaCommentSceneCast?.serializeCreate?.() || [],
    portraitUrl: _portraitUrl || '',
    charSearch: '',
    ts: Date.now(),
  };
}

function persistCommentDraft(immediate = false) {
  if (!isCommentFormOpen()) return;

  const run = () => {
    try {
      const key = getCommentDraftKey();
      if (!key) return;
      const payload = getCommentDraftPayload();
      if (!payload.text && !payload.name && !payload.title && !payload.selectedCharId && !payload.manualMode) {
        localStorage.removeItem(key);
        showCommentDraftNote('');
        return;
      }
      localStorage.setItem(key, JSON.stringify(payload));
      showCommentDraftNote('Entwurf gespeichert');
    } catch (e) {
      console.warn('comment draft save failed:', e);
    }
  };

  if (immediate) {
    clearTimeout(_commentDraftTimer);
    run();
    return;
  }

  clearTimeout(_commentDraftTimer);
  _commentDraftTimer = setTimeout(run, 180);
}

function clearCommentDraft(threadId = getCurrentCommentThreadId()) {
  try {
    const key = getCommentDraftKey(threadId);
    if (key) localStorage.removeItem(key);
  } catch (e) {
    console.warn('comment draft clear failed:', e);
  }
  showCommentDraftNote('');
}

function cleanupOldCommentDrafts(maxAgeDays = 30) {
  const maxAgeMs = Math.max(1, Number(maxAgeDays) || 30) * 24 * 60 * 60 * 1000;
  const now = Date.now();
  let removed = 0;
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(COMMENT_DRAFT_PREFIX)) continue;
      let ts = 0;
      try {
        const draft = JSON.parse(localStorage.getItem(key) || '{}');
        ts = Number(draft?.ts) || 0;
      } catch {
        ts = 0;
      }
      if (!ts || now - ts > maxAgeMs) {
        localStorage.removeItem(key);
        removed += 1;
      }
    }
  } catch (e) {
    console.warn('comment draft cleanup failed:', e);
  }
  return removed;
}

function restoreCommentDraft() {
  try {
    const key = getCommentDraftKey();
    if (!key) return false;
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const draft = JSON.parse(raw);
    if (!draft || typeof draft !== 'object') return false;

    setRichEditorContent('cf-text', String(draft.text || ''));
    const hasSegmentDraft = Array.isArray(draft.segments) && draft.segments.length > 0;
    if (hasSegmentDraft) {
      _commentSegments = draft.segments.map(segment => makeCommentSegment(
        segment.kind || 'speech',
        segment.text || '',
        Number.isInteger(segment.emoteIndex) ? segment.emoteIndex : null,
        segment.side || 'left',
        segment.durationSeconds,
        segment.language || segment.spellFont,
        segment.languageColor,
        {
          mechanicMode: segment.mechanicMode,
          imageSetId: segment.imageSetId,
          skillId: segment.skillId,
          skillCustomModifier: segment.skillCustomModifier,
          skillDifficulty: segment.skillDifficulty,
          skillRollMode: segment.skillRollMode,
          skillTargetActorKey: segment.skillTargetActorKey,
          skillTargetChallengeId: segment.skillTargetChallengeId,
          skillChallengeId: segment.skillChallengeId,
          skillChallengeEnabled: segment.skillChallengeEnabled,
          skillChallengeTitle: segment.skillChallengeTitle,
          skillChallengeRevealedText: segment.skillChallengeRevealedText,
          skillChallengeDifficulty: segment.skillChallengeDifficulty,
          skillChallengePreferredSkills: segment.skillChallengePreferredSkills,
          skillChallengePreferredModifier: segment.skillChallengePreferredModifier,
          skillChallengeAlternativeModifier: segment.skillChallengeAlternativeModifier,
          inventoryItemId: segment.inventoryItemId,
          inventoryUseMode: segment.inventoryUseMode,
          targetId: segment.combatTargetId,
          targetIds: segment.combatTargetIds,
          actionId: segment.combatActionId,
          castLevel: segment.combatCastLevel,
          rollMode: segment.combatRollMode,
          distanceMeters: segment.combatDistanceMeters,
          actorId: segment.actorId,
          paymentMode: segment.combatPaymentMode,
          paymentConfirmed: segment.combatPaymentConfirmed
        }
      ));
    } else {
      _commentSegments = [makeCommentSegment(draft.commentKind || 'speech', String(draft.text || ''), Number.isInteger(draft.selectedEmoteIdx) ? draft.selectedEmoteIdx : null)];
    }
    setCommentKind(draft.commentKind || 'speech');
    document.getElementById('cf-name').value = String(draft.name || '');
    document.getElementById('cf-title').value = String(draft.title || '');
    document.getElementById('cf-char-search').value = '';
    const restoredPortraitUrl = normalizeImageUrlForStorage(draft.portraitUrl || draft.portraitBase64 || '');
    document.getElementById('cf-portrait-url').value = restoredPortraitUrl || '';
    _portraitUrl = restoredPortraitUrl;
    const preview = document.getElementById('cf-portrait-preview');
    if (preview && restoredPortraitUrl) {
      preview.src = restoredPortraitUrl;
      preview.style.display = 'block';
    } else if (preview) {
      preview.removeAttribute('src');
      preview.style.display = 'none';
    }

    window.AleriaCommentSceneCast?.restoreCreate?.(draft.sceneActors || []);
    if (draft.mode === 'narrator') {
      setCommentMode('narrator');
    } else {
      const restoredActor = draft.selectedCharId ? getAvailableCommentCharacterById(draft.selectedCharId) : null;
      const restoredMode = draft.mode === 'creature' || restoredActor?.entityType === 'creature' ? 'creature' : 'charakter';
      setCommentMode(restoredMode);
      if (restoredActor && commentActorMatchesComposerMode(restoredActor, restoredMode)) {
        selectCharForComment(draft.selectedCharId, {
          imageSetId: draft.selectedImageSetId || CHARACTER_IMAGE_SET_DEFAULT_ID,
          preserveSegmentImageSets: true
        });
        if (!hasSegmentDraft && Number.isInteger(draft.selectedEmoteIdx) && draft.selectedEmoteIdx >= 0) {
          selectEmote(draft.selectedEmoteIdx);
        }
      } else if (draft.manualMode) {
        if (!_manualMode) toggleManualMode();
      }
    }

    applyCommentCharacterFilter();
    renderCommentSegmentList();
    setCommentFormCounter();
    updateCommentFormPreview();
    showCommentDraftNote('Entwurf wiederhergestellt');
    return true;
  } catch (e) {
    console.warn('comment draft restore failed:', e);
    return false;
  }
}

window.cleanupOldCommentDrafts = cleanupOldCommentDrafts;
