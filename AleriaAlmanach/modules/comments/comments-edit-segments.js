// Edit comment segment editor.
// Owns segmented edit rendering and save normalization for existing comments.

function renderEditCommentSegmentList() {
  const list = document.getElementById('ec-segment-list');
  if (!list) return;
  if (!_editCommentSegments.length) _editCommentSegments = [makeCommentSegment('speech')];
  coerceCommentSegmentsForMode(true);
  renderCommentSegmentActions(true);
  list.innerHTML = _editCommentSegments.map((segment, idx) => {
    const canUseEmote = segment.kind !== 'action' && _editMode !== 'narrator' && !!getCommentSegmentActor(segment, true)?.emotes?.length;
    const canRemove = _editCommentSegments.length > 1;
    const textareaId = getCommentSegmentTextareaId(segment, true);
    return `
      <div class="comment-segment-card comment-segment-${segment.kind}" data-segment-id="${segment.id}">
        <div class="comment-segment-head${canRemove ? ' has-remove' : ''}">
          <div class="comment-segment-title">Abschnitt ${idx + 1}</div>
          ${getCommentSegmentDurationControl(segment, true)}
          <div class="comment-segment-types">${getSegmentTypeButtons(segment, true)}</div>
          ${canRemove ? `<button type="button" class="comment-segment-remove" data-action="remove-edit-comment-segment" data-segment-id="${escapeHtml(segment.id)}" title="Abschnitt entfernen">&times;</button>` : ''}
        </div>
        ${getCommentSegmentActorControl(segment, true)}
        ${getSegmentSideControl(segment, true)}
        ${getCommentLanguageControls(segment, true)}
        ${canUseEmote ? getSegmentEmotePalette(segment, true) : ''}
        ${segment.kind === 'action' ? '<div class="comment-segment-note">Handlungen werden als Erzähler-Abschnitt ausgegeben.</div>' : ''}
        ${segment.kind === 'secretaction' ? '<div class="comment-segment-note">Erscheint anonym mit Silhouette statt Portrait und Name.</div>' : ''}
        ${buildCommentSegmentFormatToolbar(textareaId)}
        <textarea id="${textareaId}" class="comment-segment-textarea" rows="3" placeholder="${getCommentSegmentPlaceholder(segment.kind)}" data-action="set-edit-comment-segment-text" data-segment-id="${escapeHtml(segment.id)}">${escapeHtml(segment.text)}</textarea>
      </div>`;
  }).join('') + renderCommentDurationTotal(true);
  window.AleriaCombat?.mountComposer?.(list, {
    segments: _editCommentSegments,
    selectedCharacterId: _editSelectedCharId || '',
    sceneActors: window.AleriaCommentSceneCast?.getActors?.(true) || [],
    threadId: getCurrentCommentThreadId()
  });
  syncEditCommentSegmentsToLegacyText();
}

function setEditCommentSegmentDuration(id, value) {
  const segment = _editCommentSegments.find(item => item.id === id);
  if (!segment) return;
  segment.durationSeconds = normalizeSceneTimeDurationSeconds(value);
  renderEditCommentSegmentList();
  updateEditFormPreview();
}

function syncEditCommentSegmentsToLegacyText() {
  const text = _editCommentSegments.map(segment => String(segment.text || '').trim()).filter(Boolean).join('\n\n');
  const textarea = document.getElementById('ec-text');
  if (textarea) textarea.value = text;
  setEditFormCounter();
}

function setEditCommentSegmentKind(id, kind) {
  const segment = _editCommentSegments.find(item => item.id === id);
  if (!segment) return;
  if (!getAllowedCommentSegmentKinds(true).includes(kind)) kind = 'action';
  segment.kind = normalizeCommentKind(kind);
  if (segment.kind === 'action') {
    segment.emoteIndex = null;
    segment.side = '';
  } else {
    segment.side = normalizeCommentSegmentSide(segment.side);
  }
  if (segment.kind !== 'combataction') {
    segment.combatTargetId = '';
    segment.combatActionId = '';
    segment.combatRollMode = 'normal';
  }
  renderEditCommentSegmentList();
  updateEditFormPreview();
}

function setEditCommentSegmentText(id, value) {
  const segment = _editCommentSegments.find(item => item.id === id);
  if (!segment) return;
  segment.text = String(value || '');
  syncEditCommentSegmentsToLegacyText();
  updateEditFormPreview();
}

function setEditCommentSegmentActor(id, actorId) {
  const segment = _editCommentSegments.find(item => item.id === id);
  const actor = window.AleriaCommentSceneCast?.getActor?.(actorId, true);
  if (!segment || !actor) return;
  segment.actorId = actor.id;
  segment.emoteIndex = null;
  segment.combatActionId = '';
  if (segment.combatTargetId === actor.id) segment.combatTargetId = '';
  renderEditCommentSegmentList();
  updateEditFormPreview();
}

function setEditCommentSegmentLanguage(id, value) {
  const segment = _editCommentSegments.find(item => item.id === id);
  if (!segment || !commentKindUsesLanguage(segment.kind)) return;
  segment.language = normalizeCommentLanguage(value);
  updateEditFormPreview();
}

function setEditCommentSegmentLanguageColor(id, value) {
  const segment = _editCommentSegments.find(item => item.id === id);
  if (!segment || !commentKindUsesLanguage(segment.kind)) return;
  segment.languageColor = normalizeCommentLanguageColor(value, segment.kind);
  updateEditFormPreview();
}

function setEditCommentSegmentSide(id, side) {
  const segment = _editCommentSegments.find(item => item.id === id);
  if (!segment || !commentSegmentUsesSide(segment.kind, true)) return;
  segment.side = normalizeCommentSegmentSide(side);
  renderEditCommentSegmentList();
  updateEditFormPreview();
}

function setEditCommentSegmentEmote(id, value) {
  const segment = _editCommentSegments.find(item => item.id === id);
  if (!segment) return;
  const idx = value === '' ? null : Number(value);
  segment.emoteIndex = Number.isInteger(idx) ? idx : null;
  updateEditFormPreview();
}

function addEditCommentSegment(kind = 'speech') {
  if (!getAllowedCommentSegmentKinds(true).includes(kind)) kind = 'action';
  _editCommentSegments.push(makeCommentSegment(kind));
  renderEditCommentSegmentList();
  updateEditFormPreview();
  setTimeout(() => {
    const last = document.querySelector('#ec-segment-list .comment-segment-card:last-child textarea');
    last?.focus?.();
  }, 0);
}

function removeEditCommentSegment(id) {
  _editCommentSegments = _editCommentSegments.filter(segment => segment.id !== id);
  if (!_editCommentSegments.length) _editCommentSegments = [makeCommentSegment(_editMode === 'narrator' ? 'action' : 'speech')];
  renderEditCommentSegmentList();
  updateEditFormPreview();
}

function getEditBaseCommentActorState() {
  if (_editMode === 'narrator') {
    return { narrator: true, name: 'Erzähler', title: '', portrait: null, characterId: '', avatarKind: 'narrator' };
  }
  if (_editSelectedCharId) {
    const char = getAvailableCommentCharacterById(_editSelectedCharId);
    if (char) {
      return {
        narrator: false,
        name: char.name || 'Unbekannt',
        title: char.title || '',
        portrait: char.portrait || null,
        characterId: _editSelectedCharId,
        avatarKind: 'portrait',
        char
      };
    }
  }
  if (_editManualMode) {
    return {
      narrator: false,
      name: document.getElementById('ec-manual-name')?.value.trim() || 'Eigene Figur',
      title: document.getElementById('ec-manual-title')?.value.trim() || '',
      portrait: _editPortraitUrl || normalizeImageUrlForStorage(_editCommentData?.portrait || '') || null,
      characterId: '',
      avatarKind: (_editPortraitUrl || _editCommentData?.portrait) ? 'manual' : 'none'
    };
  }
  return { narrator: false, name: 'Noch keine Figur gewählt', title: 'Wähle eine Figur oder trage sie manuell ein', portrait: null, characterId: '', avatarKind: 'none' };
}

function getEditCommentSegmentActorState(segment, fallback) {
  const char = getCommentSegmentActor(segment, true);
  if (!char) return fallback;
  const sceneActor = window.AleriaCommentSceneCast?.getActor?.(segment.actorId, true);
  return {
    narrator: false,
    name: char.name || 'Unbekannt',
    title: char.title || '',
    portrait: char.portrait || null,
    characterId: char.id || '',
    avatarKind: 'portrait',
    char,
    sceneActorId: sceneActor?.id || '',
    sceneActorSourceId: sceneActor?.sourceCreatureId || ''
  };
}

function buildEditCommentSegmentsForSave() {
  const base = getEditBaseCommentActorState();
  return _editCommentSegments
    .map(segment => ({ ...segment, text: String(segment.text || '').trim() }))
    .filter(segment => segment.text)
    .map(segment => {
      if (_editMode === 'narrator' || segment.kind === 'action') {
        return {
          kind: segment.kind === 'action' ? 'action' : 'narrator',
          commentKind: segment.kind === 'action' ? 'action' : 'narrator',
          text: segment.text,
          narrator: true,
          charName: 'Erzähler',
          charTitle: '',
          portrait: null,
          characterId: '',
          emoteIndex: null,
          avatarKind: 'narrator',
          side: ''
          ,durationSeconds: getSceneTimeSegmentDuration(segment)
        };
      }
      const actor = getEditCommentSegmentActorState(segment, base);
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
        ...(actor.sceneActorId ? {
          actorType: 'creature',
          creatureId: actor.sceneActorSourceId,
          sceneActorId: actor.sceneActorId,
          sceneActorSourceId: actor.sceneActorSourceId
        } : {}),
        emoteIndex: emote ? segment.emoteIndex : null,
        avatarKind: emote ? 'emote' : actor.avatarKind,
        side: normalizeCommentSegmentSide(segment.side),
        ...(segment.kind === 'combataction' ? {
          combatTargetId: String(segment.combatTargetId || ''),
          combatActionId: String(segment.combatActionId || ''),
          combatRollMode: ['advantage', 'disadvantage'].includes(segment.combatRollMode) ? segment.combatRollMode : 'normal',
          storedCombatAction: segment.storedCombatAction || null,
          storedCombatResolution: segment.storedCombatResolution || null
        } : {}),
        ...(commentKindUsesLanguage(segment.kind) ? {
          language: getCommentLanguage(segment),
          languageColor: getCommentLanguageColor(segment, segment.kind)
        } : {}),
        durationSeconds: getSceneTimeSegmentDuration(segment)
      };
    });
}
