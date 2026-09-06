function renderCommentSegmentList() {
  const list = document.getElementById('cf-segment-list');
  if (!list) return;
  if (!_commentSegments.length) _commentSegments = [makeCommentSegment('speech')];
  coerceCommentSegmentsForMode(false);
  renderCommentSegmentActions(false);
  list.innerHTML = _commentSegments.map((segment, idx) => {
    const canUseEmote = segment.kind !== 'action' && _commentMode !== 'narrator' && !!getCommentSegmentActor(segment, false)?.emotes?.length;
    const canRemove = _commentSegments.length > 1;
    const textareaId = getCommentSegmentTextareaId(segment, false);
    return `
      <div class="comment-segment-card comment-segment-${segment.kind}" data-segment-id="${segment.id}">
        <div class="comment-segment-head${canRemove ? ' has-remove' : ''}">
          <div class="comment-segment-title">Abschnitt ${idx + 1}</div>
          ${getCommentSegmentDurationControl(segment, false)}
          <div class="comment-segment-types">${getSegmentTypeButtons(segment)}</div>
          ${canRemove ? `<button type="button" class="comment-segment-remove" data-action="remove-comment-segment" data-segment-id="${escapeHtml(segment.id)}" title="Abschnitt entfernen">x</button>` : ''}
        </div>
        ${getCommentSegmentActorControl(segment, false)}
        ${getSegmentSideControl(segment, false)}
        ${getCommentLanguageControls(segment, false)}
        ${getCommentSegmentImageSetPicker(segment, false)}
        ${canUseEmote ? getSegmentEmotePalette(segment, false) : ''}
        ${segment.kind === 'action' ? '<div class="comment-segment-note">Handlungen werden als Erzähler-Abschnitt ausgegeben.</div>' : ''}
        ${segment.kind === 'secretaction' ? '<div class="comment-segment-note">Erscheint anonym mit Silhouette statt Portrait und Name.</div>' : ''}
        <div class="comment-segment-mechanics-host" data-segment-mechanics-host></div>
        ${buildCommentSegmentFormatToolbar(textareaId)}
        <textarea id="${textareaId}" class="comment-segment-textarea" rows="3" placeholder="${getCommentSegmentPlaceholder(segment.kind)}" data-action="set-comment-segment-text" data-segment-id="${escapeHtml(segment.id)}">${escapeHtml(segment.text)}</textarea>
      </div>`;
  }).join('') + renderCommentDurationTotal(false);
  window.AleriaSkillChecks?.mountComposer?.(list, {
    segments: _commentSegments,
    selectedCharacterId: _selectedCharId || '',
    sceneActors: window.AleriaCommentSceneCast?.getActors?.(false) || [],
    threadId: getCurrentCommentThreadId()
  });
  window.AleriaCombat?.mountComposer?.(list, {
    segments: _commentSegments,
    selectedCharacterId: _selectedCharId || '',
    sceneActors: window.AleriaCommentSceneCast?.getActors?.(false) || [],
    threadId: getCurrentCommentThreadId()
  });
  window.AleriaInventoryUse?.mountComposer?.(list, {
    segments: _commentSegments,
    selectedCharacterId: _selectedCharId || '',
    sceneActors: window.AleriaCommentSceneCast?.getActors?.(false) || [],
    threadId: getCurrentCommentThreadId()
  });
  syncCommentSegmentsToLegacyText();
}

function setCommentSegmentDuration(id, value) {
  const segment = _commentSegments.find(item => item.id === id);
  if (!segment) return;
  segment.durationSeconds = normalizeSceneTimeDurationSeconds(value);
  renderCommentSegmentList();
  updateCommentFormPreview();
  persistCommentDraft();
}

function syncCommentSegmentsToLegacyText() {
  const text = _commentSegments.map(segment => String(segment.text || '').trim()).filter(Boolean).join('\n\n');
  const textarea = document.getElementById('cf-text');
  if (textarea) textarea.value = text;
  setCommentFormCounter();
}

function setCommentSegmentKind(id, kind) {
  const segment = _commentSegments.find(item => item.id === id);
  if (!segment) return;
  if (!getAllowedCommentSegmentKinds(false).includes(kind)) kind = 'action';
  if (!isCommentSegmentKindAllowedForMechanicMode(segment, kind, false)) return;
  segment.kind = normalizeCommentKind(kind);
  if (segment.kind !== 'performance') {
    segment.skillChallengeEnabled = false;
  }
  if (segment.kind === 'action') {
    segment.emoteIndex = null;
    segment.side = '';
  } else {
    segment.side = normalizeCommentSegmentSide(segment.side);
  }
  if (segment.kind === 'action') {
    segment.mechanicMode = 'normal';
    segment.combatTargetId = '';
    segment.combatTargetIds = [];
    segment.combatActionId = '';
    segment.combatLoadout = null;
    segment.combatCastLevel = 0;
    segment.combatRollMode = 'normal';
    segment.combatWeaponGrip = 'one-handed';
    segment.combatDistanceMeters = 0;
    segment.combatPaymentMode = 'standard';
    segment.combatPaymentConfirmed = false;
  }
  if (segment.kind !== 'consume') {
    segment.inventoryItemId = '';
    segment.inventoryUseMode = 'auto';
  }
  renderCommentSegmentList();
  updateCommentFormPreview();
  persistCommentDraft();
}

function setCommentSegmentText(id, value) {
  const segment = _commentSegments.find(item => item.id === id);
  if (!segment) return;
  segment.text = String(value || '');
  syncCommentSegmentsToLegacyText();
  scheduleCommentFormPreviewUpdate();
  persistCommentDraft();
}

function setCommentSegmentActor(id, actorId) {
  const segment = _commentSegments.find(item => item.id === id);
  const actor = window.AleriaCommentSceneCast?.getActor?.(actorId, false);
  if (!segment || !actor) return;
  segment.actorId = actor.id;
  segment.emoteIndex = null;
  segment.combatActionId = '';
  segment.combatCastLevel = 0;
  segment.combatPaymentConfirmed = false;
  if (segment.combatTargetId === actor.id) segment.combatTargetId = '';
  segment.combatTargetIds = (segment.combatTargetIds || []).filter(id => String(id) !== String(actor.id));
  renderCommentSegmentList();
  updateCommentFormPreview();
  persistCommentDraft();
}

function setCommentSegmentLanguage(id, value) {
  const segment = _commentSegments.find(item => item.id === id);
  if (!segment || !commentKindUsesLanguage(segment.kind)) return;
  segment.language = normalizeCommentLanguage(value);
  updateCommentFormPreview();
  persistCommentDraft();
}

function setCommentSegmentLanguageColor(id, value) {
  const segment = _commentSegments.find(item => item.id === id);
  if (!segment || !commentKindUsesLanguage(segment.kind)) return;
  segment.languageColor = normalizeCommentLanguageColor(value, segment.kind);
  updateCommentFormPreview();
  persistCommentDraft();
}

function setCommentSegmentSide(id, side) {
  const segment = _commentSegments.find(item => item.id === id);
  if (!segment || !commentSegmentUsesSide(segment.kind, false)) return;
  segment.side = normalizeCommentSegmentSide(side);
  renderCommentSegmentList();
  updateCommentFormPreview();
  persistCommentDraft();
}

function setCommentSegmentEmote(id, value) {
  const segment = _commentSegments.find(item => item.id === id);
  if (!applyCommentSegmentEmoteSelection(segment, value, false)) return;
  updateCommentFormPreview();
  persistCommentDraft();
}

function setCommentSegmentImageSet(id, setId) {
  const segment = _commentSegments.find(item => item.id === id);
  const context = segment ? getCommentSegmentImageSetContext(segment, false) : null;
  const selectedSet = context?.imageSets.find(set => set.id === String(setId || ''));
  if (!segment || !selectedSet) return;
  segment.imageSetId = selectedSet.id;
  segment.emoteIndex = null;
  renderCommentSegmentList();
  updateCommentFormPreview();
  persistCommentDraft();
}

function addCommentSegment(kind = 'speech') {
  if (!getAllowedCommentSegmentKinds(false).includes(kind)) kind = 'action';
  _commentSegments.push(makeCommentSegment(kind, '', null, 'left', SCENE_TIME_DEFAULT_SEGMENT_SECONDS, COMMENT_LANGUAGE_DEFAULT, '', {
    imageSetId: kind === 'action' ? '' : _selectedImageSetId
  }));
  renderCommentSegmentList();
  updateCommentFormPreview();
  persistCommentDraft();
  setTimeout(() => {
    const last = document.querySelector('#cf-segment-list .comment-segment-card:last-child textarea');
    last?.focus?.();
  }, 0);
}

function removeCommentSegment(id) {
  _commentSegments = _commentSegments.filter(segment => segment.id !== id);
  if (!_commentSegments.length) {
    const fallbackKind = _commentMode === 'narrator' ? 'action' : 'speech';
    _commentSegments = [makeCommentSegment(fallbackKind, '', null, 'left', SCENE_TIME_DEFAULT_SEGMENT_SECONDS, COMMENT_LANGUAGE_DEFAULT, '', {
      imageSetId: fallbackKind === 'action' ? '' : _selectedImageSetId
    })];
  }
  renderCommentSegmentList();
  updateCommentFormPreview();
  persistCommentDraft();
}

function getBaseCommentActorState() {
  if (_commentMode === 'narrator') {
    return { narrator: true, name: 'Erzähler', title: '', portrait: null, characterId: '', avatarKind: 'narrator' };
  }
  if (_selectedCharId) {
    const char = getAvailableCommentCharacterById(_selectedCharId);
    if (char) {
      return {
        narrator: false,
        name: char.name || 'Unbekannt',
        title: char.title || '',
        portrait: char.portrait || null,
        characterId: _selectedCharId,
        avatarKind: 'portrait',
        char
      };
    }
  }
  if (_manualMode) {
    return {
      narrator: false,
      name: document.getElementById('cf-name')?.value.trim() || 'Eigene Figur',
      title: document.getElementById('cf-title')?.value.trim() || '',
      portrait: _portraitUrl || null,
      characterId: '',
      avatarKind: _portraitUrl ? 'manual' : 'none'
    };
  }
  return { narrator: false, name: 'Noch keine Figur gewählt', title: 'Wähle eine Figur oder trage sie manuell ein', portrait: null, characterId: '', avatarKind: 'none' };
}

function getCommentSegmentActorState(segment, fallback) {
  const char = getCommentSegmentActor(segment, false);
  if (!char) return fallback;
  const sceneActor = window.AleriaCommentSceneCast?.getActor?.(segment.actorId, false);
  return {
    narrator: false,
    name: char.name || 'Unbekannt',
    title: char.title || '',
    portrait: char.portrait || null,
    characterId: char.id || '',
    avatarKind: 'portrait',
    char,
    sceneActorId: sceneActor?.id || '',
    sceneActorSourceId: sceneActor?.sourceCreatureId || '',
    sceneActorCombatTeam: sceneActor?.combatTeam || ''
  };
}

function buildCommentSegmentsForSave() {
  const base = getBaseCommentActorState();
  return _commentSegments
    .map(segment => ({ ...segment, text: String(segment.text || '').trim() }))
    .filter(segment => segment.text)
    .map(segment => {
      if (_commentMode === 'narrator' || segment.kind === 'action') {
        return {
          clientSegmentId: segment.id,
          kind: segment.kind === 'action' ? 'action' : 'narrator',
          commentKind: segment.kind === 'action' ? 'action' : 'narrator',
          text: segment.text,
          narrator: true,
          charName: 'Erzähler',
          charTitle: '',
          portrait: null,
          characterId: '',
          emoteIndex: null,
          imageSetId: '',
          avatarKind: 'narrator',
          side: ''
          ,durationSeconds: getSceneTimeSegmentDuration(segment)
        };
      }
      const actor = getCommentSegmentActorState(segment, base);
      const emote = actor.char?.emotes?.[segment.emoteIndex] || null;
      return {
        clientSegmentId: segment.id,
        kind: segment.kind,
        commentKind: segment.kind,
        text: segment.text,
        narrator: false,
        charName: actor.name,
        charTitle: actor.title,
        portrait: emote?.img || actor.portrait || null,
        characterId: actor.characterId || '',
        imageSetId: actor.char?.selectedImageSetId || '',
        ...(actor.sceneActorId ? {
          actorType: 'creature',
          creatureId: actor.sceneActorSourceId,
          sceneActorId: actor.sceneActorId,
          sceneActorSourceId: actor.sceneActorSourceId,
          combatTeam: actor.sceneActorCombatTeam
        } : {}),
        emoteIndex: emote ? segment.emoteIndex : null,
        avatarKind: emote ? 'emote' : actor.avatarKind,
        side: normalizeCommentSegmentSide(segment.side),
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
        ...(commentSegmentUsesCombatResolution(segment) ? {
          combatTargetId: String(segment.combatTargetId || ''),
          combatTargetIds: [...new Set((segment.combatTargetIds || [segment.combatTargetId]).map(String).filter(Boolean))],
          combatLoadout: segment.combatLoadout || null,
          combatActionId: String(segment.combatActionId || ''),
          combatCastLevel: Math.max(0, Math.min(10, Number(segment.combatCastLevel) || 0)),
          combatRollMode: ['advantage', 'disadvantage'].includes(segment.combatRollMode) ? segment.combatRollMode : 'normal',
          combatWeaponGrip: String(segment.combatWeaponGrip || '') === 'two-handed' ? 'two-handed' : 'one-handed',
          combatDistanceMeters: Math.max(0, Number(segment.combatDistanceMeters) || 0),
          combatPaymentMode: ['aura', 'cheat'].includes(segment.combatPaymentMode) ? segment.combatPaymentMode : 'standard',
          combatPaymentConfirmed: !!segment.combatPaymentConfirmed
        } : {}),
        ...(commentKindUsesLanguage(segment.kind) ? {
          language: getCommentLanguage(segment),
          languageColor: getCommentLanguageColor(segment, segment.kind)
        } : {}),
        durationSeconds: getSceneTimeSegmentDuration(segment)
      };
    });
}
