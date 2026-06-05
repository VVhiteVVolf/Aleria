// Edit comment segment editor.
// Owns segmented edit rendering and save normalization for existing comments.

function renderEditCommentSegmentList() {
  const list = document.getElementById('ec-segment-list');
  if (!list) return;
  if (!_editCommentSegments.length) _editCommentSegments = [makeCommentSegment('speech')];
  coerceCommentSegmentsForMode(true);
  renderCommentSegmentActions(true);
  const charHasEmotes = !!(_editSelectedCharId && getAvailableCommentCharacterById(_editSelectedCharId)?.emotes?.length);
  list.innerHTML = _editCommentSegments.map((segment, idx) => {
    const canUseEmote = segment.kind !== 'action' && _editMode !== 'narrator' && charHasEmotes;
    const textareaId = getCommentSegmentTextareaId(segment, true);
    return `
      <div class="comment-segment-card comment-segment-${segment.kind}" data-segment-id="${segment.id}">
        <div class="comment-segment-head">
          <div class="comment-segment-title">Abschnitt ${idx + 1}</div>
          <div class="comment-segment-types">${getSegmentTypeButtons(segment, true)}</div>
          ${_editCommentSegments.length > 1 ? `<button type="button" class="comment-segment-remove" data-action="remove-edit-comment-segment" data-segment-id="${escapeHtml(segment.id)}" title="Abschnitt entfernen">&times;</button>` : ''}
        </div>
        ${getSegmentSideControl(segment, true)}
        ${canUseEmote ? getSegmentEmotePalette(segment, true) : ''}
        ${segment.kind === 'action' ? '<div class="comment-segment-note">Handlungen werden als Erzähler-Abschnitt ausgegeben.</div>' : ''}
        ${buildCommentSegmentFormatToolbar(textareaId)}
        <textarea id="${textareaId}" class="comment-segment-textarea" rows="3" placeholder="${getCommentSegmentPlaceholder(segment.kind)}" data-action="set-edit-comment-segment-text" data-segment-id="${escapeHtml(segment.id)}">${escapeHtml(segment.text)}</textarea>
      </div>`;
  }).join('');
  syncEditCommentSegmentsToLegacyText();
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
        };
      }
      const emote = base.char?.emotes?.[segment.emoteIndex] || null;
      return {
        kind: segment.kind,
        commentKind: segment.kind,
        text: segment.text,
        narrator: false,
        charName: base.name,
        charTitle: base.title,
        portrait: emote?.img || base.portrait || null,
        characterId: base.characterId || '',
        emoteIndex: emote ? segment.emoteIndex : null,
        avatarKind: emote ? 'emote' : base.avatarKind,
        side: normalizeCommentSegmentSide(segment.side)
      };
    });
}
