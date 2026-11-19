// Structure tools for the new-comment editor. All edits travel through the
// existing segment renderer, preview and draft serializer.
const commentSectionEditor = (() => {
  const editor = document.getElementById('comment-form-overlay');
  const pair = ['action', 'speech'];
  const templates = {
    short: Array.from({ length: 4 }, () => pair).flat(),
    long: Array.from({ length: 8 }, () => pair).flat(),
    combat: [...pair, 'action', 'combataction', ...pair, 'action', 'combataction',
      'action', 'speech-or-thought', 'action', 'combataction', 'action', 'speech-or-thought']
  };
  const selected = new Set();
  const removed = [];
  let draggedIds = null;
  let dropIndicator = null;

  function clearDrag() {
    dropIndicator?.classList.remove('comment-section-drop-target');
    dropIndicator = null;
    draggedIds = null;
  }

  function reset() {
    selected.clear();
    removed.length = 0;
    clearDrag();
    const status = editor?.querySelector('[data-comment-section-status]');
    if (status) status.textContent = '';
  }

  function createSegment(type, { fromTemplate = false } = {}) {
    const kind = type === 'speech-or-thought' ? 'speech' : type;
    const segment = makeCommentSegment(kind, '', null, 'left', SCENE_TIME_DEFAULT_SEGMENT_SECONDS, COMMENT_LANGUAGE_DEFAULT, '', {
      imageSetId: kind === 'action' ? '' : _selectedImageSetId,
      mechanicMode: fromTemplate && kind === 'combataction' ? 'combat' : 'normal'
    });
    if (type === 'speech-or-thought') segment.templateVoiceChoice = true;
    return segment;
  }

  function report(message) {
    const status = editor?.querySelector('[data-comment-section-status]');
    if (status) status.textContent = message;
  }

  function apply(segments) {
    _commentSegments = segments;
    renderCommentSegmentList();
    updateCommentFormPreview();
    persistCommentDraft();
  }

  function focusText(segment, position = 0) {
    const field = document.getElementById(getCommentSegmentTextareaId(segment, false));
    field?.focus();
    field?.setSelectionRange(position, position);
  }

  function insert(types, index, { fromTemplate = false, useEmpty = false } = {}) {
    const allowed = getAllowedCommentSegmentKinds();
    if (!Number.isInteger(index) || index < 0 || index > _commentSegments.length
      || !types.every(type => allowed.includes(type === 'speech-or-thought' ? 'speech' : type))) return;
    const inserted = types.map(type => createSegment(type, { fromTemplate }));
    const first = _commentSegments[0];
    const untouched = _commentSegments.length === 1 && first.kind === 'speech' && !first.text
      && first.mechanicMode === 'normal' && !first.skillChallengeEnabled && !first.inventoryItemId
      && first.emoteIndex === null && first.side === 'left'
      && getSceneTimeSegmentDuration(first) === SCENE_TIME_DEFAULT_SEGMENT_SECONDS;
    const next = _commentSegments.slice();
    if (useEmpty && untouched) next.splice(0, 1, ...inserted);
    else next.splice(index, 0, ...inserted);
    apply(next);
    focusText(inserted[0]);
    report('Abschnitte eingefügt.');
  }

  function append(kind) {
    if (!canEdit()) return;
    const allowed = getAllowedCommentSegmentKinds();
    insert([allowed.includes(kind) ? kind : 'action'], _commentSegments.length);
  }

  function remove(id) {
    if (!canEdit()) return;
    const index = _commentSegments.findIndex(segment => segment.id === id);
    if (index < 0) return;
    removed.push({ index, segment: _commentSegments[index], nextId: _commentSegments[index + 1]?.id });
    selected.delete(id);
    const remaining = _commentSegments.filter(segment => segment.id !== id);
    const fallback = _commentMode === 'narrator' ? 'action' : 'speech';
    apply(remaining.length ? remaining : [createSegment(fallback)]);
    editor?.querySelector('[data-action="restore-comment-section"]')?.focus({ preventScroll: true });
    report('Abschnitt entfernt.');
  }

  function restoreRemoval() {
    const previous = removed.pop();
    if (!previous) return;
    const index = _commentSegments.findIndex(segment => segment.id === previous.nextId);
    const next = _commentSegments.slice();
    next.splice(index < 0 ? Math.min(previous.index, next.length) : index, 0, previous.segment);
    apply(next);
    focusText(previous.segment);
    report('Abschnitt wiederhergestellt.');
  }

  function split(id) {
    const index = _commentSegments.findIndex(segment => segment.id === id);
    const original = _commentSegments[index];
    const field = original && document.getElementById(getCommentSegmentTextareaId(original, false));
    if (!field) return;
    const { start } = getCommentTextareaSelection(field);
    const head = field.value.slice(0, start);
    const tail = field.value.slice(start);
    if (!head.trim() || !tail.trim()) {
      field.focus();
      report('Setze den Cursor zwischen zwei Textteile.');
      return;
    }
    // The original owns its duration, challenge, inventory choice and any
    // combat action. The added text must never clone those operations.
    const plainKind = ['combataction', 'interact', 'consume'].includes(original.kind) || original.skillChallengeEnabled
      ? 'action' : original.kind;
    const second = makeCommentSegment(plainKind, tail, original.emoteIndex, original.side, 0,
      original.language, original.languageColor, {
        imageSetId: original.imageSetId, actorId: original.actorId,
        ...(plainKind === 'foreignvoice' ? AleriaCommentForeignVoice.normalize(original) : {})
      });
    const next = _commentSegments.slice();
    next.splice(index, 1, { ...original, text: head }, second);
    apply(next);
    focusText(second);
    report('Abschnitt geteilt.');
  }

  function idsFor(id) {
    return selected.has(id) ? selected : new Set([id]);
  }

  function move(ids, gap) {
    const moving = _commentSegments.filter(segment => ids.has(segment.id));
    const remaining = _commentSegments.filter(segment => !ids.has(segment.id));
    const index = _commentSegments.slice(0, gap).filter(segment => !ids.has(segment.id)).length;
    remaining.splice(index, 0, ...moving);
    if (remaining.every((segment, previousIndex) => segment === _commentSegments[previousIndex])) return;
    apply(remaining);
    report(moving.length > 1 ? 'Markierte Abschnitte verschoben.' : 'Abschnitt verschoben.');
  }

  function moveByStep(id, direction) {
    const ids = idsFor(id);
    const first = _commentSegments.findIndex(segment => ids.has(segment.id));
    const last = _commentSegments.findLastIndex(segment => ids.has(segment.id));
    if (direction < 0 && first > 0) move(ids, first - 1);
    if (direction > 0 && last < _commentSegments.length - 1) move(ids, last + 2);
    editor?.querySelector(`[data-action="mark-comment-section"][data-segment-id="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
  }

  function refresh() {
    if (!editor) return;
    for (const id of selected) if (!_commentSegments.some(segment => segment.id === id)) selected.delete(id);
    const templateRow = editor.querySelector('[data-comment-section-templates]');
    if (templateRow) templateRow.hidden = !getAllowedCommentSegmentKinds().includes('speech');
    const restoreButton = editor.querySelector('[data-action="restore-comment-section"]');
    if (restoreButton) restoreButton.hidden = !removed.length;
    const count = editor.querySelector('[data-comment-section-selection]');
    if (count) count.textContent = selected.size ? `${selected.size} markiert` : '';
    const firstMarked = _commentSegments.findIndex(segment => selected.has(segment.id));
    const lastMarked = _commentSegments.findLastIndex(segment => selected.has(segment.id));
    editor.querySelectorAll('#cf-segment-list .comment-segment-card').forEach((card, index) => {
      const marked = selected.has(card.dataset.segmentId);
      card.classList.toggle('comment-section-marked', marked);
      card.querySelector('[data-comment-section-step="up"]').disabled = (marked ? firstMarked : index) === 0;
      card.querySelector('[data-comment-section-step="down"]').disabled = (marked ? lastMarked : index) === _commentSegments.length - 1;
    });
  }

  function renderGap(index) {
    const kinds = getAllowedCommentSegmentKinds();
    const where = index ? `Nach Abschnitt ${index} einfügen` : 'Vor dem ersten Abschnitt einfügen';
    return `<div class="comment-section-gap" data-comment-section-gap="${index}">
      <select data-action="insert-comment-section" aria-label="${where}">
        <option value="">+ Abschnitt</option>
        ${kinds.map(kind => `<option value="${kind}">${escapeHtml(getCommentKindLabel(kind))}</option>`).join('')}
      </select>
      ${kinds.includes('speech') ? '<button type="button" data-action="insert-comment-pair">+ Handlung und Rede</button>' : ''}
    </div>`;
  }

  function renderControls(segment, index) {
    const id = escapeHtml(segment.id);
    const label = `Abschnitt ${index + 1}`;
    return `<div class="comment-section-controls">
      <span class="comment-section-grip" draggable="true" data-comment-section-grip aria-hidden="true" title="Abschnitt ziehen">⠿</span>
      <input type="checkbox" data-action="mark-comment-section" data-segment-id="${id}" aria-label="${label} markieren"${selected.has(segment.id) ? ' checked' : ''}>
      <button type="button" data-action="move-comment-section" data-comment-section-step="up" aria-label="${label} nach oben verschieben" title="Nach oben verschieben">↑</button>
      <button type="button" data-action="move-comment-section" data-comment-section-step="down" aria-label="${label} nach unten verschieben" title="Nach unten verschieben">↓</button>
      ${segment.kind === 'sceneitem' ? '' : '<button type="button" data-action="split-comment-section" title="Text am Cursor teilen">Teilen</button>'}
      ${segment.templateVoiceChoice && ['speech', 'thought'].includes(segment.kind) ? `<select data-action="choose-comment-section-voice" aria-label="${label} · Rede oder Gedanke">
        <option value="speech"${segment.kind === 'speech' ? ' selected' : ''}>Rede</option>
        <option value="thought"${segment.kind === 'thought' ? ' selected' : ''}>Gedanke</option>
      </select>` : ''}
    </div>`;
  }

  function canEdit() {
    return isCommentFormOpen() && isCommentFormActorsReady() && !_commentSubmitInFlight;
  }

  function gapAt(event) {
    const explicit = event.target.closest?.('[data-comment-section-gap]');
    if (explicit) return explicit;
    const card = event.target.closest?.('#cf-segment-list .comment-segment-card');
    if (!card) return null;
    const bounds = card.getBoundingClientRect();
    return event.clientY < bounds.top + bounds.height / 2 ? card.previousElementSibling : card.nextElementSibling;
  }

  editor?.addEventListener('click', event => {
    const button = event.target.closest?.('button[data-action]');
    if (!button || !canEdit()) return;
    const id = button.closest('.comment-segment-card')?.dataset.segmentId;
    switch (button.dataset.action) {
      case 'insert-comment-pair':
        insert(pair, Number(button.parentElement.dataset.commentSectionGap), { useEmpty: true });
        break;
      case 'apply-comment-template': {
        const template = templates[button.dataset.template];
        if (Array.isArray(template)) insert(template, _commentSegments.length, { fromTemplate: true, useEmpty: true });
        break;
      }
      case 'restore-comment-section': restoreRemoval(); break;
      case 'split-comment-section': split(id); break;
      case 'move-comment-section': moveByStep(id, button.dataset.commentSectionStep === 'up' ? -1 : 1); break;
    }
  });

  editor?.addEventListener('change', event => {
    if (!canEdit()) return;
    const field = event.target;
    const id = field.closest('.comment-segment-card')?.dataset.segmentId;
    switch (field.dataset.action) {
      case 'insert-comment-section':
        if (field.value) insert([field.value], Number(field.parentElement.dataset.commentSectionGap));
        break;
      case 'choose-comment-section-voice': setCommentSegmentKind(id, field.value); break;
      case 'mark-comment-section':
        if (field.checked) selected.add(id);
        else selected.delete(id);
        refresh();
        break;
    }
  });

  editor?.addEventListener('dragstart', event => {
    const grip = event.target.closest?.('[data-comment-section-grip]');
    if (!grip || !canEdit() || !event.dataTransfer) return;
    const id = grip.closest('.comment-segment-card').dataset.segmentId;
    draggedIds = idsFor(id);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
  });
  editor?.addEventListener('dragover', event => {
    if (!draggedIds || !canEdit()) return;
    const gap = gapAt(event);
    if (dropIndicator !== gap) {
      dropIndicator?.classList.remove('comment-section-drop-target');
      gap?.classList.add('comment-section-drop-target');
      dropIndicator = gap;
    }
    if (!gap) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  });
  editor?.addEventListener('drop', event => {
    if (!draggedIds || !canEdit()) return;
    const gap = gapAt(event);
    if (!gap) { clearDrag(); return; }
    event.preventDefault();
    const ids = draggedIds;
    clearDrag();
    move(ids, Number(gap.dataset.commentSectionGap));
  });
  editor?.addEventListener('dragend', clearDrag);

  return { append, remove, renderControls, renderGap, refresh, reset };
})();
