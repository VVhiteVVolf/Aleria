globalThis.AleriaCommentTwins = (() => {
  const dialogue = globalThis.AleriaTwinDialogue;
  const picker = document.getElementById('cf-twin-picker');
  const toggle = document.getElementById('cf-twins-enabled');
  const fields = document.getElementById('cf-twin-fields');
  const leftName = document.getElementById('cf-twin-left-name');
  const rightSelect = document.getElementById('cf-twin-right');
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

  function isEmptyTwin(segment) {
    return segment.kind === 'twins' && !dialogue.readText(segment)
      && segment.twin.leftKind === 'speech' && segment.twin.rightKind === 'speech';
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
      first.twin = dialogue.normalize({ actors });
    }
    for (const segment of segments) {
      if (segment.kind === 'twins') segment.twin = dialogue.normalize({ ...segment.twin, actors });
    }
  }

  function renderLane(side, speaker, kind, text, textareaId, proseOnly) {
    const name = speaker?.charName || (side === 'left' ? 'Linke Figur' : 'Rechte Figur');
    const portrait = sanitizeImageSrc(speaker?.portrait);
    const label = value => escapeHtml(COMMENT_SEGMENT_COMPACT_LABELS[value] || getCommentKindLabel(value));
    const kindControl = proseOnly ? `<span class="comment-kind-badge">${label(kind)}</span>` :
      `<select data-comment-twin-kind="${side}" aria-label="${escapeHtml(name)} · Ausdruck">
        ${dialogue.voiceKinds.map(value => `<option value="${value}"${value === kind ? ' selected' : ''}>${label(value)}</option>`).join('')}
      </select>`;
    return `<div class="comment-twin-write-lane comment-twin-write-lane--${side}">
      <label class="comment-twin-writer" for="${textareaId}">${portrait
        ? `<img src="${portrait}" alt="" decoding="async">`
        : `<span aria-hidden="true">${escapeHtml(getInitialChar(name))}</span>`}<strong>${escapeHtml(name)}</strong></label>
      ${kindControl}
      <textarea id="${textareaId}" class="comment-segment-textarea" rows="3"
        data-comment-twin-side="${side}" placeholder="Leer lassen für eine Pause">${escapeHtml(text)}</textarea>
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

  function updateLane(event, edit) {
    const field = event.target;
    const side = event.type === 'input' ? field.dataset.commentTwinSide : field.dataset.commentTwinKind;
    if (!['left', 'right'].includes(side)) return;
    if (!edit && (_commentSubmitInFlight || !isCommentFormActorsReady())) return;
    const id = field.closest('[data-segment-id]')?.dataset.segmentId;
    const segment = (edit ? _editCommentSegments : _commentSegments).find(item => item.id === id && item.kind === 'twins');
    if (!segment) return;
    if (event.type === 'change') segment.twin[`${side}Kind`] = dialogue.voiceKind(field.value);
    else if (side === 'left') segment.text = field.value;
    else segment.twin.rightText = field.value;

    if (edit) {
      syncEditCommentSegmentsToLegacyText();
      scheduleEditFormPreviewUpdate();
    } else {
      syncCommentSegmentsToLegacyText();
      scheduleCommentFormPreviewUpdate();
      persistCommentDraft();
    }
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
    list?.addEventListener('change', event => updateLane(event, edit));
  }

  return Object.freeze({ restore, snapshot, canAdd, hasIncompletePair, refresh, isEmptyTwin, renderEditor, restoreStoredSegment });
})();
