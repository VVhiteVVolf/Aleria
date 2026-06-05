function renderCommentSegmentList() {
  const list = document.getElementById('cf-segment-list');
  if (!list) return;
  if (!_commentSegments.length) _commentSegments = [makeCommentSegment('speech')];
  coerceCommentSegmentsForMode(false);
  renderCommentSegmentActions(false);
  const charHasEmotes = !!(_selectedCharId && getAvailableCommentCharacterById(_selectedCharId)?.emotes?.length);
  list.innerHTML = _commentSegments.map((segment, idx) => {
    const canUseEmote = segment.kind !== 'action' && _commentMode !== 'narrator' && charHasEmotes;
    const textareaId = getCommentSegmentTextareaId(segment, false);
    return `
      <div class="comment-segment-card comment-segment-${segment.kind}" data-segment-id="${segment.id}">
        <div class="comment-segment-head">
          <div class="comment-segment-title">Abschnitt ${idx + 1}</div>
          <div class="comment-segment-types">${getSegmentTypeButtons(segment)}</div>
          ${_commentSegments.length > 1 ? `<button type="button" class="comment-segment-remove" data-action="remove-comment-segment" data-segment-id="${escapeHtml(segment.id)}" title="Abschnitt entfernen">x</button>` : ''}
        </div>
        ${getSegmentSideControl(segment, false)}
        ${canUseEmote ? getSegmentEmotePalette(segment, false) : ''}
        ${segment.kind === 'action' ? '<div class="comment-segment-note">Handlungen werden als Erzähler-Abschnitt ausgegeben.</div>' : ''}
        ${buildCommentSegmentFormatToolbar(textareaId)}
        <textarea id="${textareaId}" class="comment-segment-textarea" rows="3" placeholder="${getCommentSegmentPlaceholder(segment.kind)}" data-action="set-comment-segment-text" data-segment-id="${escapeHtml(segment.id)}">${escapeHtml(segment.text)}</textarea>
      </div>`;
  }).join('');
  syncCommentSegmentsToLegacyText();
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
  segment.kind = normalizeCommentKind(kind);
  if (segment.kind === 'action') {
    segment.emoteIndex = null;
    segment.side = '';
  } else {
    segment.side = normalizeCommentSegmentSide(segment.side);
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
  if (!segment) return;
  const idx = value === '' ? null : Number(value);
  segment.emoteIndex = Number.isInteger(idx) ? idx : null;
  updateCommentFormPreview();
  persistCommentDraft();
}

function addCommentSegment(kind = 'speech') {
  if (!getAllowedCommentSegmentKinds(false).includes(kind)) kind = 'action';
  _commentSegments.push(makeCommentSegment(kind));
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
  if (!_commentSegments.length) _commentSegments = [makeCommentSegment(_commentMode === 'narrator' ? 'action' : 'speech')];
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

function buildCommentSegmentsForSave() {
  const base = getBaseCommentActorState();
  return _commentSegments
    .map(segment => ({ ...segment, text: String(segment.text || '').trim() }))
    .filter(segment => segment.text)
    .map(segment => {
      if (_commentMode === 'narrator' || segment.kind === 'action') {
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
