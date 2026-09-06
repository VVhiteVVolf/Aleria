// Rendering and normalization helpers for the Aleria comment system.
// Loaded before the other comment modules as a classic script.
const COMMENT_KIND_LABELS = {
  speech: 'Rede',
  action: 'Handlung',
  interact: 'Interagieren',
  consume: 'Konsumieren',
  thought: 'Gedanke',
  whisper: 'Zu Flüstern',
  shout: 'Rufen',
  performance: 'Schauspiel',
  animal: 'Tiersprache',
  foreign: 'Fremdsprache',
  song: 'Gesang',
  spell: 'Zauberformel',
  madness: 'Wahnsinn',
  telepathy: 'Telepathie',
  prayer: 'Gebet',
  flirt: 'Flirt',
  secretaction: 'Geheimaktion',
  combataction: 'Kampfbeschreibung',
  narrator: 'Erzähler',
  'scene-time-event': 'Szenenzeit',
  'scene-rest-event': 'Rast',
  'combat-encounter-event': 'Kampfankündigung',
  'scene-transition-event': 'Szenenwechsel',
  'scene-poll-event': 'Abstimmung'
};

const COMMENT_KIND_ICONS = {
  speech: '../IconOrdner/Buttom Icons/Rede.PNG',
  thought: '../IconOrdner/Buttom Icons/Gedanke.PNG',
  whisper: '../IconOrdner/Buttom Icons/Flüstern.PNG',
  shout: '../IconOrdner/Buttom Icons/Rufen.PNG',
  performance: './public/assets/comment-icons/performance.png?v=20260803-auftreten-v1',
  interact: './public/assets/comment-icons/interact.png',
  consume: './public/assets/comment-icons/consume.png',
  animal: '../IconOrdner/Buttom Icons/Tiersprache.PNG',
  foreign: '../IconOrdner/Buttom Icons/Rede.PNG',
  song: '../IconOrdner/Buttom Icons/Singen.PNG',
  spell: '../IconOrdner/Buttom Icons/Zaubern.PNG',
  madness: '../IconOrdner/Buttom Icons/Wahn.PNG',
  telepathy: '../IconOrdner/Buttom Icons/Telepatie.PNG',
  prayer: '../IconOrdner/Buttom Icons/Beten.PNG',
  flirt: '../IconOrdner/Buttom Icons/Flirt.PNG',
  secretaction: '../IconOrdner/Buttom Icons/Geheimaktion.PNG',
  combataction: '../IconOrdner/Buttom Icons/Kampfhandlung.PNG'
};

// Editor buttons may use a different glyph than the decorative icon rendered on the published bubble.
const COMMENT_KIND_BUTTON_ICONS = {
  ...COMMENT_KIND_ICONS,
  performance: './public/assets/comment-icons/performance-button.png?v=20260803-schauspiel-button-v1'
};

const COMMENT_KIND_ALIASES = {
  ooc: 'whisper',
  fluestern: 'whisper',
  flüstern: 'whisper',
  rufen: 'shout',
  schauspiel: 'performance',
  auftreten: 'performance',
  performance: 'performance',
  interagieren: 'interact',
  interaktion: 'interact',
  interact: 'interact',
  konsumieren: 'consume',
  verbrauchen: 'consume',
  benutzen: 'consume',
  consume: 'consume',
  tiersprache: 'animal',
  tier: 'animal',
  animal: 'animal',
  fremdsprache: 'foreign',
  fremd: 'foreign',
  foreign: 'foreign',
  gesang: 'song',
  singen: 'song',
  zauber: 'spell',
  zauberformel: 'spell',
  wahn: 'madness',
  wahnsinn: 'madness',
  telepathie: 'telepathy',
  gebet: 'prayer',
  beten: 'prayer',
  flirty: 'flirt',
  geheimaktion: 'secretaction',
  geheimhandlung: 'secretaction',
  secret: 'secretaction',
  kampfhandlung: 'combataction',
  kampf: 'combataction',
  combat: 'combataction'
};

function normalizeCommentKind(kind, narrator = false) {
  if (narrator) return 'narrator';
  const value = String(kind || 'speech').toLowerCase();
  const normalized = COMMENT_KIND_ALIASES[value] || value;
  return Object.prototype.hasOwnProperty.call(COMMENT_KIND_LABELS, normalized)
    ? normalized
    : 'speech';
}

function getCommentKindLabel(kind) {
  return COMMENT_KIND_LABELS[normalizeCommentKind(kind)] || COMMENT_KIND_LABELS.speech;
}

function getCommentKindIconSrc(kind) {
  return COMMENT_KIND_ICONS[normalizeCommentKind(kind)] || '';
}

function getCommentKindIconMarkup(kind, className = 'comment-kind-icon') {
  const src = getCommentKindIconSrc(kind);
  return src
    ? `<img class="${escapeHtml(className)}" src="${sanitizeImageSrc(src)}" alt="" loading="lazy" decoding="async">`
    : '';
}

function getCommentKindButtonIconMarkup(kind, className = 'comment-kind-icon') {
  const src = COMMENT_KIND_BUTTON_ICONS[normalizeCommentKind(kind)] || '';
  return src
    ? `<img class="${escapeHtml(className)}" src="${sanitizeImageSrc(src)}" alt="" loading="lazy" decoding="async">`
    : '';
}

function commentKindUsesQuoteMark(kind) {
  return ['speech', 'foreign', 'shout', 'performance', 'song', 'telepathy', 'spell', 'madness', 'prayer', 'flirt'].includes(normalizeCommentKind(kind));
}

function buildAnimalCommentTextMarkup(text, commentId, partIdx) {
  const safeId = escapeHtml(`${commentId}-animal-${partIdx}`);
  const animalText = parseCommentMarkup(text);
  return `
    <button type="button" class="comment-animal-toggle" data-action="toggle-animal-comment" aria-expanded="false" aria-controls="${safeId}" title="Zum Übersetzen mit der Maus darüberfahren, antippen oder fokussieren">
      <span class="comment-animal-cipher" aria-hidden="true">${animalText}</span>
      <span id="${safeId}" class="comment-animal-plain">${animalText}</span>
    </button>`;
}

function getCommentCharacterForStoredComment(c) {
  if (typeof getAvailableCommentCharacterById === 'function' && c?.characterId) {
    const byId = getAvailableCommentCharacterById(c.characterId);
    if (byId) return byId;
  }
  if (typeof getAvailableCommentCharacterByName === 'function' && c?.charName) {
    return getAvailableCommentCharacterByName(c.charName);
  }
  return null;
}

function getCommentEmotePortrait(c, idx) {
  const char = getCommentCharacterForStoredComment(c);
  const emote = char?.emotes?.[idx];
  return emote?.img ? sanitizeImageSrc(emote.img) : '';
}

function safeRenderCombatEvaluation(source) {
  try {
    return window.AleriaCombat?.renderEvaluation?.(source) || '';
  } catch (error) {
    console.error('renderCombatEvaluation failed:', error);
    return '';
  }
}

function renderMechanicalUndoButton(commentId) {
  return `<button type="button" class="comment-delete-btn" data-action="undo-mechanical-comment" data-comment-id="${escapeHtml(commentId)}">Löschen</button>`;
}

function renderCommentTransactionLock(comment = {}) {
  const policy = window.AleriaCommentTransactions;
  if (!policy?.isImmutable?.(comment)) return '';
  const label = policy.getLabel?.(comment, { exclude: ['combat'] }) || '';
  if (!label) return '';
  return `<span class="comment-transaction-lock" title="Dieser Beitrag ist Teil des unveränderlichen Szenenverlaufs.">${escapeHtml(label)} geschützt</span>`;
}

function splitCommentByEmoteMarkers(c) {
  const source = String(c?.text || '');
  const parts = [];
  const marker = /\{emote:(\d+)\}/g;
  let currentPortrait = sanitizeImageSrc(c?.portrait || '');
  let cursor = 0;
  let match;

  while ((match = marker.exec(source)) !== null) {
    const text = source.slice(cursor, match.index).trim();
    if (text) parts.push({ text, portrait: currentPortrait });
    const nextPortrait = getCommentEmotePortrait(c, Number(match[1]));
    if (nextPortrait) currentPortrait = nextPortrait;
    cursor = marker.lastIndex;
  }

  const tail = source.slice(cursor).trim();
  if (tail || !parts.length) parts.push({ text: tail, portrait: currentPortrait });
  return parts;
}

function renderCommentBubble(c, idx) {
  if (c.combatStatus && window.AleriaCommentCombatMiniProfile?.renderStatusComment) {
    return window.AleriaCommentCombatMiniProfile.renderStatusComment(c);
  }
  if (window.AleriaCombatEncounter?.isComment?.(c)) {
    return window.AleriaCombatEncounter.renderComment(c, idx);
  }
  try {
    if (window.AleriaHerausforderung?.isComment?.(c)) {
      return window.AleriaHerausforderung.renderComment(c, idx) || '';
    }
  } catch (error) {
    console.error('herausforderung render failed:', error);
  }
  if (window.AleriaSceneRest?.isComment?.(c)) {
    return window.AleriaSceneRest.renderComment(c, idx);
  }
  if (typeof isSceneInventoryTransferComment === 'function' && isSceneInventoryTransferComment(c)) {
    return renderSceneInventoryTransferComment(c, idx);
  }
  if (typeof isSceneDiceEventComment === 'function' && isSceneDiceEventComment(c)) {
    return renderSceneDiceEventComment(c, idx);
  }
  if (typeof isScenePollComment === 'function' && isScenePollComment(c)) {
    return renderScenePollComment(c, idx);
  }
  if (typeof isSceneTransitionComment === 'function' && isSceneTransitionComment(c)) {
    return renderSceneTransitionComment(c, idx);
  }
  const showcaseItem = getCommentShowcaseItem(c);
  if (showcaseItem) return renderCommentShowcase(c, idx, showcaseItem);
  const fazitItem = getCommentFazitItem(c);
  if (fazitItem) return renderCommentFazit(c, idx, fazitItem);
  const moduleInsert = getCommentModuleInsertItem(c);
  if (moduleInsert) return renderCommentModuleInsert(c, idx, moduleInsert);
  const attachmentItem = getCommentAttachmentItem(c);
  if (attachmentItem) return renderCommentAttachment(c, idx, attachmentItem);
  if (typeof isSceneTimeEventComment === 'function' && isSceneTimeEventComment(c)) {
    return renderSceneTimeEventComment(c, idx);
  }

  if (Array.isArray(c.commentSegments) && c.commentSegments.some(segment => String(segment?.text || '').trim())) {
    const cleanSegments = c.commentSegments.filter(segment => String(segment?.text || '').trim());
    const mechanicalLock = window.AleriaCommentTransactions?.isImmutable?.(c) === true;
    const mechanicalKinds = window.AleriaCommentTransactions?.getKinds?.(c) || [];
    // Inventory changes are captured alongside hitPoints/resources in the server's undo snapshot, so a
    // combat+inventory-use comment is safely deletable too. Skill checks are not (separate claim record).
    const hasUnsupportedMechanics = c.commentSegments.some(segment => segment?.skillResolution || segment?.skillChallenge);
    const mechanicalUndoEligible = mechanicalKinds.includes('combat')
      && mechanicalKinds.every(kind => kind === 'combat' || kind === 'inventory')
      && !hasUnsupportedMechanics;
    return cleanSegments.map((segment, segmentIdx) => {
      const displayText = window.AleriaSkillChecks?.getDisplayText?.(segment) ?? segment.text ?? '';
      const displayKind = window.AleriaSkillChecks?.getDisplayKind?.(segment)
        || segment.commentKind || segment.kind || (segment.narrator ? 'narrator' : 'speech');
      const segmentComment = {
        ...c,
        ...segment,
        id: c.id,
        text: displayText,
        narrator: !!segment.narrator,
        commentKind: displayKind,
        kind: displayKind,
        charName: segment.charName || (segment.narrator ? 'Erzähler' : c.charName),
        charTitle: segment.charTitle || (segment.narrator ? '' : c.charTitle),
        portrait: segment.narrator ? null : (segment.portrait || c.portrait),
        commentSegments: null,
        combatAction: null,
        combatResolution: null,
        _combatTimelineCommentId: c.id,
        _combatTimelineSegmentIndex: segmentIdx,
        _mechanicalLocked: mechanicalLock,
        _mechanicalUndoEligible: mechanicalUndoEligible,
        _hideActions: !!c._hideActions || segmentIdx < cleanSegments.length - 1
      };
      const bubble = renderCommentBubble(segmentComment, idx + segmentIdx);
      const combatResolutions = Array.isArray(segment.combatResolutions)
        ? segment.combatResolutions
        : (segment.combatResolution ? [segment.combatResolution] : []);
      const combatEvaluation = combatResolutions.map(combatResolution => (
        safeRenderCombatEvaluation({ ...segment, combatResolution })
      )).join('');
      const skillEvaluation = segment.skillResolution
        ? (window.AleriaSkillChecks?.renderEvaluation?.(segment) || '')
        : '';
      const challengeStatus = segment.skillChallenge
        ? (window.AleriaSkillChecks?.renderChallengeStatus?.(segment) || '')
        : '';
      const inventoryUse = segment.inventoryUse
        ? (window.AleriaInventoryUse?.renderUsage?.(segment) || '')
        : '';
      return `${bubble}${inventoryUse}${combatEvaluation}${skillEvaluation}${challengeStatus}`;
    }).join('');
  }

  const commentId = escapeHtml(c.id);
  const charName = c.charName || 'Unbekannt';
  const safeCharName = escapeHtml(charName);
  const safeCharTitle = escapeHtml(c.charTitle || '');
  const speakerProfileAttrs = [
    'data-action="open-speaker-profile"',
    `data-speaker-name="${safeCharName}"`,
    `data-speaker-title="${safeCharTitle}"`,
    `data-speaker-portrait="${escapeHtml(c.portrait || '')}"`,
    `data-speaker-character-id="${escapeHtml(c.characterId || '')}"`
  ].join(' ');
  const commentKind = normalizeCommentKind(c.commentKind, c.narrator);
  const kindLabel = getCommentKindLabel(commentKind);
  const divider = idx > 0
    ? `<div class="comment-divider"><span class="comment-divider-icon">*</span></div>`
    : '';

  if (c.narrator) {
    const narratorActions = c._hideActions ? '' : (c._mechanicalLocked || window.AleriaCommentTransactions?.isImmutable?.(c))
      ? `<div class="comment-narrator-actions">${renderCommentTransactionLock(c)}</div>`
      : `
        <div class="comment-narrator-actions">
          <button type="button" class="comment-narrator-del" data-action="open-edit-comment" data-comment-id="${commentId}" title="Bearbeiten">Bearbeiten</button>
          <button type="button" class="comment-narrator-del" data-action="open-delete-confirm" data-comment-id="${commentId}" title="Löschen">Löschen</button>
        </div>`;
    return `
      ${divider}
      <div class="comment-narrator comment-kind-${commentKind}" data-comment-id="${commentId}">
        <div class="comment-kind-badge">${getCommentKindIconMarkup(commentKind)}<span>${kindLabel}</span></div>
        <div class="comment-narrator-text">${parseCommentMarkup(c.text)}</div>
        ${narratorActions}
      </div>`;
  }

  const side = ['left', 'right'].includes(String(c.side || '')) ? String(c.side) : (idx % 2 === 0 ? 'left' : 'right');
  const isSecretAction = commentKind === 'secretaction';
  const isFusedAction = isSecretAction || commentKind === 'combataction';
  const isCompactUsage = commentKind === 'interact' || commentKind === 'consume';
  const displayCharName = isSecretAction ? 'Unbekannte Gestalt' : charName;
  const safeDisplayCharName = escapeHtml(displayCharName);
  const parts = splitCommentByEmoteMarkers(c);
  const entries = parts.map((part, partIdx) => {
    const portraitMarkup = part.portrait
      ? `<img class="comment-portrait${isSecretAction ? ' comment-portrait-silhouette' : ''}" src="${part.portrait}" alt="${safeDisplayCharName}" loading="lazy" decoding="async" ${speakerProfileAttrs}>`
      : `<button type="button" class="comment-portrait-placeholder${isSecretAction ? ' comment-portrait-silhouette' : ''}" ${speakerProfileAttrs}>${isSecretAction ? '?' : getInitialChar(charName)}</button>`;
    const combatProfileCharacterId = String(c.sceneActorSourceId || c.creatureId || c.characterId || '').trim();
    const combatActorId = String(c.sceneActorId || c.characterId || combatProfileCharacterId).trim();
    const portrait = isCompactUsage ? portraitMarkup : (window.AleriaCommentCombatMiniProfile?.renderPortrait?.({
      portraitMarkup,
      characterId: combatProfileCharacterId,
      actorId: combatActorId,
      threadId: c.entryId || '',
      timelineCommentId: c._combatTimelineCommentId || c.id,
      timelineSegmentIndex: Number.isInteger(c._combatTimelineSegmentIndex) ? c._combatTimelineSegmentIndex : null,
      commentId: c.id,
      renderIndex: idx,
      partIndex: partIdx,
      displayName: displayCharName,
      secret: isSecretAction
    }) || portraitMarkup);
    const actions = !c._hideActions && partIdx === parts.length - 1
      ? c._mechanicalUndoEligible
        ? renderMechanicalUndoButton(c.id)
        : (c._mechanicalLocked || window.AleriaCommentTransactions?.isImmutable?.(c))
          ? renderCommentTransactionLock(c)
          : `<button class="comment-delete-btn" data-action="open-edit-comment" data-comment-id="${commentId}" style="margin-right:0.3rem;">Bearbeiten</button><button class="comment-delete-btn" data-action="open-delete-confirm" data-comment-id="${commentId}">Löschen</button>`
      : '';
    const textMarkup = commentKind === 'animal'
      ? buildAnimalCommentTextMarkup(part.text, commentId, partIdx)
      : commentKindUsesLanguage(commentKind)
        ? buildCommentLanguageTextMarkup(part.text, c, commentKind, commentId, partIdx)
        : `<span class="comment-text">${parseCommentMarkup(part.text)}</span>`;

    if (isCompactUsage) {
      return `
        <div class="comment-entry comment-entry-compact ${partIdx ? 'comment-subentry' : ''}" data-comment-id="${commentId}">
          <div class="comment-compact-portrait">${portrait}</div>
          <div class="comment-compact-bubble comment-body comment-kind-${commentKind}">
            <div class="comment-compact-head">
              <span class="comment-kind-badge">${getCommentKindIconMarkup(commentKind)}<span>${kindLabel}</span></span>
              <button type="button" class="comment-compact-name" ${speakerProfileAttrs}>${safeDisplayCharName}</button>
            </div>
            ${textMarkup}
            ${actions}
          </div>
        </div>`;
    }

    return `
      <div class="comment-entry ${side} ${partIdx ? 'comment-subentry' : ''}${isFusedAction ? ' comment-entry-fused' : ''}" data-comment-id="${commentId}">
        ${portrait}
        <div class="comment-content">
          <div class="comment-char-header">
            <button type="button" class="comment-char-name" ${speakerProfileAttrs}>${safeDisplayCharName}</button>
            ${(c.charTitle && !isSecretAction) ? `<div class="comment-char-title">${safeCharTitle}</div>` : ''}
          </div>
          <div class="comment-body comment-kind-${commentKind}"${getCommentLanguageBubbleAttributes(c, commentKind)}>
            <span class="comment-kind-badge">${getCommentKindIconMarkup(commentKind)}<span>${kindLabel}</span></span>
            ${commentKindUsesQuoteMark(commentKind) ? '<span class="comment-quote-mark">"</span>' : ''}${textMarkup}
            ${actions}
          </div>
        </div>
      </div>`;
  }).join('');

  const legacyEvaluation = commentKind === 'combataction' && c.combatResolution
    ? safeRenderCombatEvaluation(c)
    : '';
  return `${divider}${entries}${legacyEvaluation}`;
}
