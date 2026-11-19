// Comment draft persistence.
// Owns the editor snapshot used for automatic and explicitly saved drafts.
let _commentDraftId = '';

function resetCommentDraftIdentity() {
  clearTimeout(_commentDraftTimer);
  _commentDraftId = '';
}

function getCommentDraftId() {
  _commentDraftId ||= globalThis.crypto?.randomUUID?.() || `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return _commentDraftId;
}

function commentDraftHasContent(draft) {
  return !!(draft.text.trim() || draft.name.trim() || draft.title.trim() || draft.segments.length > 1
    || draft.twinPair?.enabled
    || draft.segments.some(segment => segment.sceneItemDraft || segment.text.trim() || segment.kind !== 'speech'));
}

function getCommentDraftPayload() {
  return {
    draftId: getCommentDraftId(),
    mode: _commentMode,
    commentKind: _commentKind,
    selectedCharId: _selectedCharId,
    selectedEmoteIdx: _selectedEmoteIdx,
    selectedImageSetId: _selectedImageSetId,
    manualMode: _manualMode,
    ...window.AleriaCommentTwins?.snapshot(),
    name: document.getElementById('cf-name')?.value || '',
    title: document.getElementById('cf-title')?.value || '',
    text: document.getElementById('cf-text')?.value || '',
    segments: _commentSegments.map(segment => ({
      kind: segment.kind,
      ...(segment.templateVoiceChoice ? { templateVoiceChoice: true } : {}),
      actionIconId: String(segment.actionIconId || '').slice(0, 40),
      challengeReplyToCommentId: String(segment.challengeReplyToCommentId || '').slice(0, 200),
      ...(segment.kind === 'foreignvoice' ? AleriaCommentForeignVoice.normalize(segment) : {}),
      ...(segment.kind === 'twins' ? { twin: AleriaTwinDialogue.normalize(segment.twin) } : {}),
      text: segment.text,
      sceneItemDraft: segment.sceneItemDraft || null,
      sceneItemOperationId: segment.sceneItemOperationId || '',
      emoteIndex: _commentMode !== 'narrator' && segment.kind !== 'foreignvoice' && Number.isInteger(segment.emoteIndex) ? segment.emoteIndex : null,
      imageSetId: _commentMode === 'narrator' || segment.kind === 'foreignvoice' ? '' : String(segment.imageSetId || ''),
      side: commentSegmentUsesSide(segment.kind, false) ? normalizeCommentSegmentSide(segment.side) : '',
      language: getCommentLanguage(segment),
      languageColor: commentKindUsesLanguage(segment.kind) ? getCommentLanguageColor(segment, segment.kind) : '',
      durationSeconds: getSceneTimeSegmentDuration(segment),
      actorId: _commentMode === 'narrator' || segment.kind === 'foreignvoice' ? '' : String(segment.actorId || ''),
      mechanicMode: normalizeCommentSegmentMechanicMode(segment.mechanicMode, segment.kind, segment),
      skillId: String(segment.skillId || ''),
      skillCustomModifier: Number(segment.skillCustomModifier || 0),
      skillDifficulty: Number(segment.skillDifficulty || 10),
      ...(segment?.skillSaveContext ? { skillSaveContext: normalizeCommentSkillSaveContext(segment.skillSaveContext) } : {}),
      ...(segment?.skillRequiredSense ? { skillRequiredSense: String(segment.skillRequiredSense).slice(0, 20) } : {}),
      skillRollMode: ['advantage', 'disadvantage'].includes(segment.skillRollMode) ? segment.skillRollMode : 'normal',
      skillTargetActorKey: String(segment.skillTargetActorKey || ''),
      skillTargetChallengeId: String(segment.skillTargetChallengeId || ''),
      skillChallengeId: String(segment.skillChallengeId || ''),
      skillChallengeEnabled: !!segment.skillChallengeEnabled,
      skillChallengeTitle: String(segment.skillChallengeTitle || ''),
      skillChallengeRevealedText: String(segment.skillChallengeRevealedText || ''),
      skillChallengeDifficulty: Number(segment.skillChallengeDifficulty || 10),
      skillChallengePreferredSkills: Array.isArray(segment.skillChallengePreferredSkills) ? [...segment.skillChallengePreferredSkills] : [],
      skillChallengePreferredModifier: Number(segment.skillChallengePreferredModifier ?? 0),
      skillChallengeAlternativeModifier: Number(segment.skillChallengeAlternativeModifier ?? 0),
      skillChallengeDefenseMode: segment.skillChallengeDefenseMode === 'fixed' ? 'fixed' : 'passive',
      skillChallengeDefenseSkillId: String(segment.skillChallengeDefenseSkillId || 'deception'),
      skillRuleSelections: Array.isArray(segment.skillRuleSelections) ? segment.skillRuleSelections.map(selection => ({ ...selection })) : [],
      ...(window.AleriaInventoryUse?.serializeSelection?.(segment) || {}),
      inventoryItemId: ['consume', 'interact'].includes(segment.kind) ? String(segment.inventoryItemId || '') : '',
      inventoryUseMode: ['consume', 'interact'].includes(segment.kind) && ['consume', 'use'].includes(segment.inventoryUseMode) ? segment.inventoryUseMode : 'auto',
      ...getCommentCombatSelection(commentSegmentUsesCombatResolution(segment) ? segment : {})
    })),
    sceneActors: window.AleriaCommentSceneCast?.serializeCreate?.() || [],
    portraitUrl: _portraitUrl || '',
    charSearch: '',
    ts: Date.now(),
  };
}

function persistCommentDraft(immediate = false) {
  if (!isCommentFormOpen()) return;
  if (typeof isCommentFormActorsReady === 'function' && !isCommentFormActorsReady()) return;
  const key = getCommentDraftKey();
  if (!key) return;

  const run = () => {
    if (!isCommentFormOpen()) return;
    if (typeof isCommentFormActorsReady === 'function' && !isCommentFormActorsReady()) return;
    if (key !== getCommentDraftKey()) return;
    try {
      const payload = getCommentDraftPayload();
      if (!commentDraftHasContent(payload) && !payload.selectedCharId && !payload.manualMode) {
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

function clearCommentDraft(threadId = getCurrentCommentThreadId(), draftId = '') {
  clearTimeout(_commentDraftTimer);
  try {
    const key = getCommentDraftKey(threadId);
    if (key) {
      const savedId = draftId && JSON.parse(localStorage.getItem(key))?.draftId;
      if (!savedId || savedId === draftId) localStorage.removeItem(key);
    }
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

function restoreCommentDraft(options = {}) {
  try {
    const key = getCommentDraftKey();
    const draft = options.draft || (key ? JSON.parse(localStorage.getItem(key)) : null);
    if (!draft || typeof draft !== 'object') return false;
    window.AleriaCommentTwins?.restore(draft.twinPair);
    if (typeof draft.draftId === 'string' && /^[\w-]{1,80}$/.test(draft.draftId)) _commentDraftId = draft.draftId;

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
          ...(segment.kind === 'foreignvoice' ? AleriaCommentForeignVoice.normalize(segment) : {}),
          twin: segment.twin,
          mechanicMode: segment.mechanicMode,
          sceneItemDraft: segment.sceneItemDraft,
          sceneItemOperationId: segment.sceneItemOperationId,
          imageSetId: segment.imageSetId,
          templateVoiceChoice: segment.templateVoiceChoice,
          actionIconId: segment.actionIconId,
          challengeReplyToCommentId: segment.challengeReplyToCommentId,
          skillId: segment.skillId,
          skillCustomModifier: segment.skillCustomModifier,
          skillDifficulty: segment.skillDifficulty,
          ...(segment?.skillSaveContext ? { skillSaveContext: normalizeCommentSkillSaveContext(segment.skillSaveContext) } : {}),
          ...(segment?.skillRequiredSense ? { skillRequiredSense: String(segment.skillRequiredSense).slice(0, 20) } : {}),
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
          skillChallengeDefenseMode: segment.skillChallengeDefenseMode,
          skillChallengeDefenseSkillId: segment.skillChallengeDefenseSkillId,
          skillRuleSelections: segment.skillRuleSelections,
          ...(window.AleriaInventoryUse?.serializeSelection?.(segment) || {}),
          inventoryItemId: segment.inventoryItemId,
          inventoryUseMode: segment.inventoryUseMode,
          ...getCommentCombatSelection(segment),
          actorId: segment.actorId
        }
      ));
    } else {
      _commentSegments = [makeCommentSegment(draft.commentKind || 'speech', String(draft.text || ''), Number.isInteger(draft.selectedEmoteIdx) ? draft.selectedEmoteIdx : null)];
    }
    setCommentKind(draft.commentKind || 'speech', { render: false, persist: false });
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
      setCommentMode('narrator', { render: false, persist: false });
    } else {
      const restoredActor = draft.selectedCharId ? getAvailableCommentCharacterById(draft.selectedCharId) : null;
      const restoredMode = draft.mode === 'creature' || restoredActor?.entityType === 'creature' ? 'creature' : 'charakter';
      setCommentMode(restoredMode, { render: false, persist: false });
      if (restoredActor && commentActorMatchesComposerMode(restoredActor, restoredMode)) {
        selectCharForComment(draft.selectedCharId, {
          imageSetId: draft.selectedImageSetId || CHARACTER_IMAGE_SET_DEFAULT_ID,
          preserveSegmentImageSets: true,
          render: false,
          persist: false
        });
        if (!hasSegmentDraft && Number.isInteger(draft.selectedEmoteIdx) && draft.selectedEmoteIdx >= 0) {
          selectEmote(draft.selectedEmoteIdx, { render: false, persist: false });
        }
      } else if (draft.manualMode) {
        if (!_manualMode) toggleManualMode({ render: false, persist: false });
      }
    }

    if (options.render !== false) {
      applyCommentCharacterFilter();
      renderCommentSegmentList();
      setCommentFormCounter();
      updateCommentFormPreview();
    }
    showCommentDraftNote('Entwurf wiederhergestellt');
    return true;
  } catch (e) {
    console.warn('comment draft restore failed:', e);
    return false;
  }
}

window.cleanupOldCommentDrafts = cleanupOldCommentDrafts;
