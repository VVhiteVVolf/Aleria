// Comment segment editor.
// Shared by compose and edit flows for segmented speech/action/thought content.

function normalizeCommentSegmentSide(side) {
  return String(side || 'left') === 'right' ? 'right' : 'left';
}

function commentSegmentUsesSide(kind, edit = false) {
  const mode = edit ? _editMode : _commentMode;
  return mode !== 'narrator' && normalizeCommentKind(kind) !== 'action';
}

const COMMENT_SEGMENT_MECHANIC_MODES = new Set(['normal', 'skill', 'combat', 'magic']);

function normalizeCommentSegmentMechanicMode(value, kind = 'speech', settings = {}) {
  const mode = String(value || '').trim().toLowerCase();
  if (COMMENT_SEGMENT_MECHANIC_MODES.has(mode)) return mode;
  if (settings?.storedCombatResolution || settings?.storedCombatAction || settings?.combatResolution || settings?.combatAction) {
    return ['spell', 'prayer', 'song'].includes(normalizeCommentKind(kind)) ? 'magic' : 'combat';
  }
  return 'normal';
}

function commentSegmentUsesCombatResolution(segment = {}) {
  const mode = normalizeCommentSegmentMechanicMode(segment.mechanicMode, segment.kind || segment.commentKind, segment);
  return mode === 'combat' || mode === 'magic';
}

function makeCommentSegment(kind = 'speech', text = '', emoteIndex = null, side = 'left', durationSeconds = SCENE_TIME_DEFAULT_SEGMENT_SECONDS, language = COMMENT_LANGUAGE_DEFAULT, languageColor = '', combatSettings = {}) {
  const normalizedKind = normalizeCommentKind(kind);
  const mechanicMode = normalizeCommentSegmentMechanicMode(combatSettings?.mechanicMode, normalizedKind, combatSettings);
  const usesCombatResolution = mechanicMode === 'combat' || mechanicMode === 'magic';
  _commentSegmentSeq += 1;
  return {
    id: `seg-${Date.now().toString(36)}-${_commentSegmentSeq}`,
    kind: normalizedKind,
    text: String(text || ''),
    emoteIndex: Number.isInteger(emoteIndex) ? emoteIndex : null,
    imageSetId: String(combatSettings?.imageSetId || ''),
    side: normalizedKind === 'action' ? '' : normalizeCommentSegmentSide(side),
    durationSeconds: normalizeSceneTimeDurationSeconds(durationSeconds),
    language: normalizeCommentLanguage(language),
    languageColor: commentKindUsesLanguage(normalizedKind)
      ? normalizeCommentLanguageColor(languageColor, normalizedKind)
      : '',
    mechanicMode,
    skillId: String(combatSettings?.skillId || ''),
    skillCustomModifier: Number(combatSettings?.skillCustomModifier || 0),
    skillDifficulty: Number(combatSettings?.skillDifficulty || 10),
    skillRollMode: ['advantage', 'disadvantage'].includes(combatSettings?.skillRollMode) ? combatSettings.skillRollMode : 'normal',
    skillTargetActorKey: String(combatSettings?.skillTargetActorKey || ''),
    skillTargetChallengeId: String(combatSettings?.skillTargetChallengeId || ''),
    skillChallengeId: String(combatSettings?.skillChallengeId || ''),
    skillChallengeEnabled: !!combatSettings?.skillChallengeEnabled,
    skillChallengeTitle: String(combatSettings?.skillChallengeTitle || ''),
    skillChallengeRevealedText: String(combatSettings?.skillChallengeRevealedText || ''),
    skillChallengeDifficulty: Number(combatSettings?.skillChallengeDifficulty || 10),
    skillChallengePreferredSkills: Array.isArray(combatSettings?.skillChallengePreferredSkills) ? [...combatSettings.skillChallengePreferredSkills] : [],
    skillChallengePreferredModifier: Number(combatSettings?.skillChallengePreferredModifier ?? 2),
    skillChallengeAlternativeModifier: Number(combatSettings?.skillChallengeAlternativeModifier ?? -2),
    storedSkillResolution: combatSettings?.storedSkillResolution || null,
    storedSkillChallenge: combatSettings?.storedSkillChallenge || null,
    combatTargetId: usesCombatResolution ? String(combatSettings?.targetId || combatSettings?.combatTargetId || '') : '',
    combatActionId: usesCombatResolution ? String(combatSettings?.actionId || combatSettings?.combatActionId || '') : '',
    combatRollMode: usesCombatResolution && ['advantage', 'disadvantage'].includes(combatSettings?.rollMode || combatSettings?.combatRollMode)
      ? String(combatSettings.rollMode || combatSettings.combatRollMode)
      : 'normal',
    combatDistanceMeters: usesCombatResolution
      ? Math.max(0, Math.min(9999, Number(combatSettings?.distanceMeters ?? combatSettings?.combatDistanceMeters) || 0))
      : 0,
    combatPaymentMode: ['aura', 'cheat'].includes(combatSettings?.paymentMode || combatSettings?.combatPaymentMode)
      ? String(combatSettings.paymentMode || combatSettings.combatPaymentMode)
      : 'standard',
    combatPaymentConfirmed: usesCombatResolution && Boolean(combatSettings?.paymentConfirmed ?? combatSettings?.combatPaymentConfirmed),
    actorId: String(combatSettings?.actorId || combatSettings?.sceneActorId || ''),
    storedCombatAction: usesCombatResolution && combatSettings?.storedCombatAction
      ? combatSettings.storedCombatAction
      : null,
    storedCombatResolution: usesCombatResolution && combatSettings?.storedCombatResolution
      ? combatSettings.storedCombatResolution
      : null,
    inventoryItemId: String(combatSettings?.inventoryItemId || combatSettings?.storedInventoryUse?.item?.id || ''),
    inventoryUseMode: ['consume', 'use'].includes(combatSettings?.inventoryUseMode) ? combatSettings.inventoryUseMode : 'auto',
    storedInventoryUse: combatSettings?.storedInventoryUse || null
  };
}

function getCommentSegmentDurationControl(segment, edit = false) {
  const action = edit ? 'set-edit-comment-segment-duration' : 'set-comment-segment-duration';
  return `<label class="comment-segment-duration"><span>Dauer</span><input type="number" min="0" max="86400" step="1" value="${getSceneTimeSegmentDuration(segment)}" data-action="${action}" data-segment-id="${escapeHtml(segment.id)}"><span>Sek.</span></label>`;
}

function renderCommentDurationTotal(edit = false) {
  const segments = edit ? _editCommentSegments : _commentSegments;
  const total = segments.reduce((sum, segment) => sum + getSceneTimeSegmentDuration(segment), 0);
  return `<div class="comment-duration-total">Beitragsdauer: <strong>${total} Sek.</strong></div>`;
}

function getAllowedCommentSegmentKinds(edit = false) {
  const mode = edit ? _editMode : _commentMode;
  return mode === 'narrator'
    ? ['action']
    : ['speech', 'action', 'interact', 'consume', 'thought', 'whisper', 'shout', 'performance', 'combataction', 'foreign', 'song', 'telepathy', 'animal', 'spell', 'prayer', 'flirt', 'madness', 'secretaction'];
}

const COMMENT_SEGMENT_MODE_KINDS = Object.freeze({
  skill: Object.freeze(['speech', 'shout', 'performance', 'thought', 'animal', 'interact', 'flirt']),
  combat: Object.freeze(['combataction']),
  magic: Object.freeze(['spell', 'prayer', 'song'])
});

function getCommentSegmentKindsForMechanicMode(mode = 'normal', edit = false) {
  const normalizedMode = normalizeCommentSegmentMechanicMode(mode);
  const allowedForCommentMode = getAllowedCommentSegmentKinds(edit);
  const mechanicKinds = COMMENT_SEGMENT_MODE_KINDS[normalizedMode];
  return mechanicKinds
    ? mechanicKinds.filter(kind => allowedForCommentMode.includes(kind))
    : allowedForCommentMode;
}

function isCommentSegmentKindAllowedForMechanicMode(segment = {}, kind = segment.kind, edit = false) {
  if (segment.skillChallengeEnabled) return normalizeCommentKind(kind) === 'performance';
  return getCommentSegmentKindsForMechanicMode(segment.mechanicMode, edit).includes(normalizeCommentKind(kind));
}

function applyCommentSegmentMechanicMode(segment = {}, mode = 'normal', edit = false) {
  const normalizedMode = normalizeCommentSegmentMechanicMode(mode, segment.kind, segment);
  const allowedKinds = getCommentSegmentKindsForMechanicMode(normalizedMode, edit);
  segment.mechanicMode = normalizedMode;
  if (segment.skillChallengeEnabled) {
    segment.kind = 'performance';
    segment.mechanicMode = 'normal';
  } else if (!allowedKinds.includes(segment.kind)) {
    segment.kind = allowedKinds[0] || 'speech';
    segment.emoteIndex = null;
  }
  if (segment.kind === 'action') {
    segment.side = '';
    segment.emoteIndex = null;
  } else {
    segment.side = normalizeCommentSegmentSide(segment.side);
  }
  if (segment.mechanicMode !== 'combat' && segment.mechanicMode !== 'magic') {
    segment.combatPaymentConfirmed = false;
  }
  return segment;
}

globalThis.AleriaCommentSegmentModeRules = Object.freeze({
  applyMode: applyCommentSegmentMechanicMode,
  getAllowedKinds: getCommentSegmentKindsForMechanicMode,
  isKindAllowed: isCommentSegmentKindAllowedForMechanicMode
});

function coerceCommentSegmentsForMode(edit = false) {
  const segments = edit ? _editCommentSegments : _commentSegments;
  const allowed = getAllowedCommentSegmentKinds(edit);
  segments.forEach(segment => {
    if (!allowed.includes(segment.kind)) {
      segment.kind = allowed[0];
      segment.emoteIndex = null;
    }
    if (segment.kind === 'action') {
      segment.emoteIndex = null;
      segment.side = '';
    } else {
      segment.side = normalizeCommentSegmentSide(segment.side);
    }
    applyCommentSegmentMechanicMode(segment, segment.mechanicMode, edit);
  });
}

const COMMENT_SEGMENT_COMPACT_LABELS = Object.freeze({
  whisper: 'Flüstern',
  combataction: 'Kampf\u00ADbeschreibung'
});

function buildCommentSegmentKindButton(kind, { action, segmentId = '', active = false, add = false, disabled = false } = {}) {
  const segmentAttr = segmentId ? ` data-segment-id="${segmentId}"` : '';
  const label = COMMENT_SEGMENT_COMPACT_LABELS[kind] || getCommentKindLabel(kind);
  return `
    <button type="button" class="${add ? 'comment-segment-add' : 'comment-segment-type'}${active ? ' active' : ''}" data-action="${action}"${segmentAttr} data-kind="${kind}" title="${escapeHtml(getCommentKindLabel(kind))}"${disabled ? ' disabled aria-disabled="true"' : ''}>
      ${getCommentKindButtonIconMarkup(kind, 'comment-segment-type-icon')}
      <span>${add ? '+ ' : ''}${escapeHtml(label)}</span>
    </button>`;
}

function renderCommentSegmentActions(edit = false) {
  const selector = edit
    ? '#ec-segment-list + .comment-segment-actions'
    : '#cf-segment-list + .comment-segment-actions';
  const actions = document.querySelector(selector);
  if (!actions) return;
  const action = edit ? 'add-edit-comment-segment' : 'add-comment-segment';
  actions.innerHTML = getAllowedCommentSegmentKinds(edit)
    .map(kind => buildCommentSegmentKindButton(kind, { action, add: true }))
    .join('');
}

function getSegmentTypeButtons(segment, edit = false) {
  const action = edit ? 'set-edit-comment-segment-kind' : 'set-comment-segment-kind';
  const segmentId = escapeHtml(segment.id);
  const challengeDisguised = !!segment.skillChallengeEnabled;
  return getAllowedCommentSegmentKinds(edit).map(kind => buildCommentSegmentKindButton(kind, {
    action,
    segmentId,
    active: challengeDisguised ? kind === 'speech' : segment.kind === kind,
    disabled: challengeDisguised || !isCommentSegmentKindAllowedForMechanicMode(segment, kind, edit)
  })).join('');
}

function getCommentSegmentActor(segment, edit = false) {
  const sceneActor = window.AleriaCommentSceneCast?.getActor?.(segment?.actorId, edit);
  if (sceneActor) return sceneActor;
  const selectedId = edit ? _editSelectedCharId : _selectedCharId;
  const character = selectedId ? getAvailableCommentCharacterById(selectedId) : null;
  if (!character || character.entityType === 'creature') return character;
  const selectedSetId = edit ? _editSelectedImageSetId : _selectedImageSetId;
  return applyCharacterImageSetPresentation(character, segment?.imageSetId || selectedSetId || CHARACTER_IMAGE_SET_DEFAULT_ID);
}

function getCommentSegmentActorControl(segment, edit = false) {
  const mode = edit ? _editMode : _commentMode;
  if (mode !== 'creature' || segment.kind === 'action') return '';
  const actors = window.AleriaCommentSceneCast?.getActors?.(edit) || [];
  if (!actors.length) return '';
  if (!actors.some(actor => actor.id === segment.actorId)) segment.actorId = actors[0].id;
  const action = edit ? 'set-edit-comment-segment-actor' : 'set-comment-segment-actor';
  return `
    <label class="comment-segment-actor">
      <span>Sprecher / Instanz</span>
      <select data-action="${action}" data-segment-id="${escapeHtml(segment.id)}">
        ${actors.map(actor => `<option value="${escapeHtml(actor.id)}"${actor.id === segment.actorId ? ' selected' : ''}>${escapeHtml(actor.name)} · ${escapeHtml(actor.id)}</option>`).join('')}
      </select>
    </label>`;
}

function renderSegmentAvatarThumb(src, fallbackName, label) {
  const safeLabel = escapeHtml(label || fallbackName || 'Ausdruck');
  const safeSrc = sanitizeImageSrc(src || '');
  return safeSrc
    ? `<img src="${safeSrc}" alt="${safeLabel}" loading="lazy" decoding="async">`
    : `<span class="comment-segment-avatar-initial">${getInitialChar(fallbackName || label || '?')}</span>`;
}

function getSegmentEmotePalette(segment, edit = false) {
  const char = getCommentSegmentActor(segment, edit);
  if (!char) return '';

  const emotes = Array.isArray(char.emotes) ? char.emotes : [];
  const action = edit ? 'set-edit-comment-segment-emote' : 'set-comment-segment-emote';
  const segmentId = escapeHtml(segment.id);
  const selected = Number.isInteger(segment.emoteIndex) ? String(segment.emoteIndex) : '';
  const standardActive = selected === '';
  const standard = `
    <button type="button" class="comment-segment-avatar ${standardActive ? 'active' : ''}" data-action="${action}" data-segment-id="${segmentId}" data-emote-index="" title="Standardportrait">
      ${renderSegmentAvatarThumb(char.portrait, char.name, 'Standardportrait')}
      <span>Standard</span>
    </button>`;
  const avatars = emotes.map((emote, idx) => {
    const label = emote.label || `Ausdruck ${idx + 1}`;
    return `
      <button type="button" class="comment-segment-avatar ${selected === String(idx) ? 'active' : ''}" data-action="${action}" data-segment-id="${segmentId}" data-emote-index="${idx}" title="${escapeHtml(label)}">
        ${renderSegmentAvatarThumb(emote.img, char.name, label)}
        <span>${escapeHtml(emote.label || String(idx + 1))}</span>
      </button>`;
  }).join('');
  return `
    <div class="comment-segment-avatar-row" aria-label="Ausdruck wählen">
      ${standard}${avatars}
    </div>`;
}

function getCommentSegmentTextareaId(segment, edit = false) {
  return `${edit ? 'ec' : 'cf'}-segment-text-${String(segment?.id || '').replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

function getCommentSegmentPlaceholder(kind) {
  const normalized = normalizeCommentKind(kind);
  if (normalized === 'action') return 'Was geschieht?';
  if (normalized === 'interact') return 'Wie interagiert die Figur mit ihrer Umgebung oder einer anderen Person?';
  if (normalized === 'consume') return 'Wie benutzt oder verbraucht die Figur den ausgewählten Gegenstand?';
  if (normalized === 'performance') return 'Was spielt, behauptet oder führt die Figur vor?';
  if (normalized === 'thought') return 'Was denkt die Figur?';
  if (normalized === 'whisper') return 'Was wird geflüstert?';
  if (normalized === 'shout') return 'Was wird gerufen?';
  if (normalized === 'song') return 'Was wird gesungen?';
  if (normalized === 'telepathy') return 'Welche Gedanken werden gesendet?';
  if (normalized === 'animal') return 'Was wird in Tiersprache geäußert?';
  if (normalized === 'foreign') return 'Was wird in der gewählten Fremdsprache gesagt?';
  if (normalized === 'spell') return 'Welche Zauberformel wird gesprochen?';
  if (normalized === 'madness') return 'Was bricht aus dem Wahn hervor?';
  if (normalized === 'prayer') return 'Welches Gebet, welcher Schwur oder welche heilige Anrufung wird gewirkt?';
  if (normalized === 'flirt') return 'Was wird charmant gesagt?';
  if (normalized === 'combataction') return 'Beschreibe den Angriff rollenspielerisch. Ob er gelingt, entscheidet danach die Kampfauswertung.';
  if (normalized === 'secretaction') return 'Welche geheime Handlung geschieht, verborgen vor allen Blicken?';
  return 'Was wird gesagt?';
}

function getSegmentSideControl(segment, edit = false) {
  if (!commentSegmentUsesSide(segment.kind, edit)) return '';
  const action = edit ? 'set-edit-comment-segment-side' : 'set-comment-segment-side';
  const segmentId = escapeHtml(segment.id);
  const side = normalizeCommentSegmentSide(segment.side);
  return `
    <div class="comment-segment-side" aria-label="Sprechseite">
      <span>Seite</span>
      <button type="button" class="${side === 'left' ? 'active' : ''}" data-action="${action}" data-segment-id="${segmentId}" data-side="left">Links</button>
      <button type="button" class="${side === 'right' ? 'active' : ''}" data-action="${action}" data-segment-id="${segmentId}" data-side="right">Rechts</button>
    </div>`;
}

function buildCommentSegmentFormatToolbar(textareaId) {
  const targetId = escapeHtml(textareaId);
  return `
    <div class="fmt-toolbar comment-segment-format-toolbar" aria-label="Formatierung">
      <button type="button" class="fmt-btn fmt-bold" data-action="format-comment-segment-wrap" data-target-id="${targetId}" data-wrap-before="**" data-wrap-after="**" title="Fett">B</button>
      <button type="button" class="fmt-btn fmt-italic" data-action="format-comment-segment-wrap" data-target-id="${targetId}" data-wrap-before="*" data-wrap-after="*" title="Kursiv">I</button>
      <button type="button" class="fmt-btn fmt-under" data-action="format-comment-segment-wrap" data-target-id="${targetId}" data-wrap-before="__" data-wrap-after="__" title="Unterstrichen">U</button>
      <button type="button" class="fmt-btn" data-action="format-comment-segment-wrap" data-target-id="${targetId}" data-wrap-before="***" data-wrap-after="***" title="Fett+Kursiv" style="font-weight:700;font-style:italic;font-family:'EB Garamond',serif;">BI</button>
      <div class="fmt-separator"></div>
      <div class="fmt-color-row" title="Farbe wählen">
        <button type="button" class="fmt-color-swatch" style="background:#c0392b" data-action="format-comment-segment-color" data-target-id="${targetId}" data-color="rot" title="Rot" aria-label="Rot"></button>
        <button type="button" class="fmt-color-swatch" style="background:#d4b464" data-action="format-comment-segment-color" data-target-id="${targetId}" data-color="gold" title="Gold" aria-label="Gold"></button>
        <button type="button" class="fmt-color-swatch" style="background:#a8b8c8" data-action="format-comment-segment-color" data-target-id="${targetId}" data-color="silber" title="Silber" aria-label="Silber"></button>
        <button type="button" class="fmt-color-swatch" style="background:#5a8a5a" data-action="format-comment-segment-color" data-target-id="${targetId}" data-color="gruen" title="Gruen" aria-label="Gruen"></button>
        <button type="button" class="fmt-color-swatch" style="background:#4a7ab0" data-action="format-comment-segment-color" data-target-id="${targetId}" data-color="blau" title="Blau" aria-label="Blau"></button>
        <button type="button" class="fmt-color-swatch" style="background:#8b5fa0" data-action="format-comment-segment-color" data-target-id="${targetId}" data-color="lila" title="Lila" aria-label="Lila"></button>
        <button type="button" class="fmt-color-swatch" style="background:#e8e0d0" data-action="format-comment-segment-color" data-target-id="${targetId}" data-color="weiss" title="Weiss" aria-label="Weiss"></button>
        <button type="button" class="fmt-color-swatch" style="background:#888880" data-action="format-comment-segment-color" data-target-id="${targetId}" data-color="grau" title="Grau" aria-label="Grau"></button>
      </div>
      <div class="fmt-separator"></div>
      <button type="button" class="fmt-btn" data-action="format-comment-segment-wrap" data-target-id="${targetId}" data-wrap-before="||" data-wrap-after="||" title="Spoiler">Spoiler</button>
      <button type="button" class="fmt-btn" data-action="format-comment-segment-tooltip" data-target-id="${targetId}" title="Tooltip">Tooltip</button>
    </div>`;
}
