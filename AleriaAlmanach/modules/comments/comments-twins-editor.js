globalThis.AleriaCommentTwins = (() => {
  const dialogue = globalThis.AleriaTwinDialogue;
  const picker = document.getElementById('cf-twin-picker');
  const toggle = document.getElementById('cf-twins-enabled');
  const fields = document.getElementById('cf-twin-fields');
  const leftName = document.getElementById('cf-twin-left-name');
  const rightSelect = document.getElementById('cf-twin-right');
  const avatarAction = 'set-comment-twin-avatar';
  let enabled = false;
  let rightId = '';
  let actors = [];

  function restore(value) {
    enabled = value?.enabled === true;
    rightId = String(value?.rightId || '').slice(0, 160);
    actors = [];
  }

  function snapshot() {
    return enabled || rightId ? { twinPair: { enabled, rightId } } : {};
  }

  function canAdd() {
    return actors.length === 2;
  }

  function isEligible(actor) {
    return !!actor && actor.entityType !== 'creature' && isCommentCharacterAllowedForActivePlayer(actor);
  }

  function presentation(actor) {
    return { characterId: actor.id, charName: actor.name, charTitle: actor.title, portrait: actor.portrait };
  }

  function keepAvatar(speaker, previous) {
    if (previous?.characterId !== speaker.characterId || !previous.imageSetId) return speaker;
    const { portrait, imageSetId, emoteIndex } = previous;
    return { ...speaker, portrait, imageSetId, emoteIndex };
  }

  function isEmptyTwin(segment) {
    return segment.kind === 'twins' && !dialogue.readText(segment)
      && segment.twin.leftKind === 'speech' && segment.twin.rightKind === 'speech'
      && !segment.twin.actors.some(speaker => speaker.imageSetId);
  }

  function hasIncompletePair(segments) {
    return _commentMode === 'charakter' && !_manualMode && enabled && !canAdd()
      && segments.some(segment => segment.kind === 'twins' && dialogue.readText(segment));
  }

  function refresh(segments) {
    if (!picker) return;
    const available = _commentMode === 'charakter' && !_manualMode;
    picker.hidden = !available;
    toggle.checked = enabled;
    fields.hidden = !enabled;
    actors = [];
    if (!available || !enabled) return;

    const selected = getAvailableCommentCharacterById(_selectedCharId);
    const left = isEligible(selected) ? selected : null;
    const choices = getAvailableCommentCharacters().filter(actor => isEligible(actor) && actor.id !== left?.id)
      .sort((a, b) => a.name.localeCompare(b.name, 'de'));
    rightSelect.replaceChildren(new Option('Figur auswählen', ''), ...choices.map(actor => new Option(actor.name, actor.id)));
    rightSelect.value = choices.some(actor => actor.id === rightId) ? rightId : '';
    leftName.textContent = left?.name || 'Oben auswählen';

    const right = choices.find(actor => actor.id === rightId);
    if (!left || !right) return;
    actors = [presentation(left), presentation(right)];
    const first = segments[0];
    if (segments.length === 1 && isUntouchedCommentSpeech(first)) {
      first.kind = 'twins';
      first.twin = dialogue.normalize();
    }
    for (const segment of segments) {
      if (segment.kind !== 'twins') continue;
      segment.twin = dialogue.normalize({
        ...segment.twin,
        actors: actors.map((speaker, index) => keepAvatar(speaker, segment.twin.actors[index]))
      });
    }
  }

  function renderWriterPortrait(speaker, name) {
    const portrait = sanitizeImageSrc(speaker?.portrait);
    return portrait ? `<img src="${portrait}" alt="" decoding="async">`
      : `<span aria-hidden="true">${escapeHtml(getInitialChar(name))}</span>`;
  }

  function renderLane(side, speaker, kind, text, textareaId, proseOnly) {
    const name = speaker?.charName || (side === 'left' ? 'Linke Figur' : 'Rechte Figur');
    const label = value => escapeHtml(COMMENT_SEGMENT_COMPACT_LABELS[value] || getCommentKindLabel(value));
    const kindControl = proseOnly ? `<span class="comment-kind-badge">${label(kind)}</span>` :
      `<label class="comment-twin-select">
        <span>Blasentyp</span>
        <select data-comment-twin-kind="${side}" aria-label="${escapeHtml(name)} · Blasentyp">
          ${dialogue.voiceKinds.map(value => `<option value="${value}"${value === kind ? ' selected' : ''}>${label(value)}</option>`).join('')}
        </select>
      </label>`;
    const avatarControl = !proseOnly && speaker?.characterId ? `
      <details class="comment-twin-avatar-picker" data-comment-twin-avatar="${side}">
        <summary>Avatar wählen<span class="comment-twin-visually-hidden"> für ${escapeHtml(name)}</span></summary>
        <div data-comment-twin-avatar-options></div>
      </details>` : '';
    return `<div class="comment-twin-write-lane comment-twin-write-lane--${side}">
      <label class="comment-twin-writer" for="${textareaId}">${renderWriterPortrait(speaker, name)}<strong>${escapeHtml(name)}</strong></label>
      ${kindControl}
      <textarea id="${textareaId}" class="comment-segment-textarea" rows="3"
        data-comment-twin-side="${side}" placeholder="Leer lassen für eine Pause">${escapeHtml(text)}</textarea>
      ${avatarControl}
      <details class="comment-twin-format">
        <summary>Formatierung<span class="comment-twin-visually-hidden"> für ${escapeHtml(name)}</span></summary>
        ${buildCommentSegmentFormatToolbar(textareaId)}
      </details>
    </div>`;
  }

  function renderEditor(segment, edit = false, { proseOnly = false } = {}) {
    const { actors: pair, leftKind, rightKind, rightText } = segment.twin;
    const id = getCommentSegmentTextareaId(segment, edit);
    return `<div class="comment-twin-editor">
      ${renderLane('left', pair[0], leftKind, segment.text, id, proseOnly)}
      ${renderLane('right', pair[1], rightKind, rightText, `${id}-twin-right`, proseOnly)}
    </div>`;
  }

  function restoreStoredSegment(segment) {
    const decoded = dialogue.decode(segment);
    if (!decoded) return null;
    return makeCommentSegment('twins', decoded.leftText, null, 'left', segment.durationSeconds,
      COMMENT_LANGUAGE_DEFAULT, '', { twin: decoded.twin });
  }

  function getTwinSegment(field, edit) {
    const id = field.closest('.comment-segment-card')?.dataset.segmentId;
    return (edit ? _editCommentSegments : _commentSegments).find(item => item.id === id && item.kind === 'twins');
  }

  function syncLaneChange(edit) {
    if (edit) {
      syncEditCommentSegmentsToLegacyText();
      scheduleEditFormPreviewUpdate();
    } else {
      syncCommentSegmentsToLegacyText();
      scheduleCommentFormPreviewUpdate();
      persistCommentDraft();
    }
  }

  function updateLane(event, edit) {
    const field = event.target;
    const side = event.type === 'input' ? field.dataset.commentTwinSide : field.dataset.commentTwinKind;
    if (!['left', 'right'].includes(side)) return;
    if (!edit && (_commentSubmitInFlight || !isCommentFormActorsReady())) return;
    const segment = getTwinSegment(field, edit);
    if (!segment) return;
    if (event.type === 'change') segment.twin[`${side}Kind`] = dialogue.voiceKind(field.value);
    else if (side === 'left') segment.text = field.value;
    else segment.twin.rightText = field.value;
    syncLaneChange(edit);
  }

  function getAvatarContext(picker, edit) {
    const segment = getTwinSegment(picker, edit);
    const index = picker.dataset.commentTwinAvatar === 'left' ? 0 : 1;
    const speaker = segment?.twin.actors[index];
    const character = speaker && getAvailableCommentCharacterById(speaker.characterId);
    if (!character) return null;
    const sets = normalizeCharacterImageSets(character);
    const set = sets.find(item => item.id === speaker.imageSetId)
      || sets.find(item => item.id === CHARACTER_IMAGE_SET_DEFAULT_ID);
    return { segment, index, speaker, sets, set };
  }

  function renderAvatarPalette(picker, segment, speaker, set) {
    // The saved portrait also identifies the choice if avatars have been reordered.
    const usesSetPortrait = speaker.portrait === set.portrait && speaker.emoteIndex == null;
    const index = usesSetPortrait ? -1 : set.emotes.findIndex(emote => emote.img === speaker.portrait);
    picker.querySelector('[data-comment-twin-avatar-palette]').innerHTML = renderCommentAvatarPalette(
      { name: speaker.charName, portrait: set.portrait, emotes: set.emotes }, index >= 0 ? index : null,
      { action: avatarAction, segmentId: segment.id, label: `Avatar für ${speaker.charName} wählen` }
    );
  }

  function openAvatarPicker(picker, edit) {
    if (!picker.matches('[data-comment-twin-avatar][open]')) return;
    const panel = picker.querySelector('[data-comment-twin-avatar-options]');
    if (panel.hasChildNodes()) return;
    const context = getAvatarContext(picker, edit);
    if (!context) {
      panel.textContent = 'Diese Figur ist derzeit nicht im Register verfügbar.';
      return;
    }
    const { segment, speaker, sets, set } = context;
    panel.innerHTML = `${sets.length > 1 ? `<label class="comment-twin-select">
      <span>Avatar-Set</span>
      <select data-comment-twin-image-set aria-label="${escapeHtml(speaker.charName)} · Avatar-Set">
        ${sets.map(item => `<option value="${escapeHtml(item.id)}"${item === set ? ' selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}
      </select>
    </label>` : ''}<div data-comment-twin-avatar-palette></div>`;
    renderAvatarPalette(picker, segment, speaker, set);
  }

  function updateAvatar(event, edit) {
    const changeSet = event.type === 'change';
    const field = event.target.closest(changeSet ? '[data-comment-twin-image-set]' : `[data-action="${avatarAction}"]`);
    if (!field || (!edit && (_commentSubmitInFlight || !isCommentFormActorsReady()))) return;
    const picker = field.closest('[data-comment-twin-avatar][open]');
    if (!picker) return;
    const context = getAvatarContext(picker, edit);
    if (!context) return;
    const { segment, index, speaker, sets } = context;
    const set = changeSet ? sets.find(item => item.id === field.value) : context.set;
    if (!set) return;

    const emoteIndex = !changeSet && field.dataset.emoteIndex !== '' ? Number(field.dataset.emoteIndex) : null;
    const emote = Number.isInteger(emoteIndex) ? set.emotes[emoteIndex] : null;
    const next = { ...speaker, portrait: emote?.img || set.portrait || '', imageSetId: set.id, emoteIndex: emote ? emoteIndex : null };
    segment.twin.actors[index] = next;
    const writer = picker.closest('.comment-twin-write-lane').querySelector('.comment-twin-writer');
    writer.firstElementChild.outerHTML = renderWriterPortrait(next, next.charName);
    if (changeSet) renderAvatarPalette(picker, segment, next, set);
    else {
      const previous = picker.querySelector('[data-emote-index][aria-pressed="true"]');
      previous?.classList.remove('active');
      previous?.setAttribute('aria-pressed', 'false');
      field.classList.add('active');
      field.setAttribute('aria-pressed', 'true');
    }
    syncLaneChange(edit);
  }

  picker?.addEventListener('change', event => {
    if (_commentSubmitInFlight || !isCommentFormActorsReady()) return;
    if (event.target === toggle) {
      enabled = toggle.checked;
      if (!enabled) {
        _commentSegments.forEach(segment => {
          if (!isEmptyTwin(segment)) return;
          segment.kind = 'speech';
          delete segment.twin;
        });
      }
    } else if (event.target === rightSelect) rightId = rightSelect.value;
    else return;
    renderCommentSegmentList();
    updateCommentFormPreview();
    persistCommentDraft();
  });

  for (const [id, edit] of [['cf-segment-list', false], ['ec-segment-list', true]]) {
    const list = document.getElementById(id);
    list?.addEventListener('input', event => updateLane(event, edit));
    list?.addEventListener('change', event => {
      updateLane(event, edit);
      updateAvatar(event, edit);
    });
    list?.addEventListener('click', event => updateAvatar(event, edit));
    list?.addEventListener('toggle', event => openAvatarPicker(event.target, edit), true);
  }

  return Object.freeze({ restore, snapshot, canAdd, hasIncompletePair, refresh, isEmptyTwin, renderEditor, restoreStoredSegment });
})();
