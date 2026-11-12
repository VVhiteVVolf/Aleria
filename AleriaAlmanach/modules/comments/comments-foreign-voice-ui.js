// Shared controls and state changes for compose and edit. Events use the existing
// comment segment delegation; the main actor's image selection is never changed.
function getCommentForeignVoiceControls(segment, edit = false) {
  if (segment.kind !== 'foreignvoice') return '';
  const voice = AleriaCommentForeignVoice.normalize(segment);
  const prefix = edit ? 'set-edit-comment-segment' : 'set-comment-segment';
  const segmentId = escapeHtml(segment.id);
  return `
    <div class="comment-foreign-voice-controls">
      <label class="comment-foreign-voice-name">
        <span>Name der fremden Stimme (optional)</span>
        <input type="text" maxlength="${AleriaCommentForeignVoice.nameMaxLength}" value="${escapeHtml(voice.foreignVoiceName)}"
          placeholder="Fremde/r" autocomplete="off" data-action="${prefix}-foreign-voice-name" data-segment-id="${segmentId}">
      </label>
      <div class="comment-foreign-voice-avatars" role="group" aria-label="Silhouette der fremden Stimme wählen">
        ${AleriaCommentForeignVoice.avatars.map(avatar => `
          <button type="button" class="comment-segment-avatar comment-foreign-voice-avatar${avatar.id === voice.foreignVoiceAvatarId ? ' active' : ''}"
            data-action="${prefix}-foreign-voice-avatar" data-segment-id="${segmentId}" data-avatar-id="${avatar.id}"
            aria-pressed="${avatar.id === voice.foreignVoiceAvatarId}">
            <img src="${avatar.portrait}" alt="${avatar.label}" loading="lazy" decoding="async"><span>${avatar.label}</span>
          </button>`).join('')}
      </div>
    </div>`;
}

function setCommentSegmentForeignVoice(id, field, value, edit = false) {
  const segments = edit ? _editCommentSegments : _commentSegments;
  const segment = segments.find(item => item.id === id);
  if (segment?.kind !== 'foreignvoice') return;
  const key = field === 'avatar' ? 'foreignVoiceAvatarId' : 'foreignVoiceName';
  Object.assign(segment, AleriaCommentForeignVoice.normalize({ ...segment, [key]: value }));
  if (field === 'avatar') {
    if (edit) renderEditCommentSegmentList();
    else renderCommentSegmentList();
    const list = document.getElementById(edit ? 'ec-segment-list' : 'cf-segment-list');
    const selected = Array.from(list?.querySelectorAll?.('.comment-foreign-voice-avatar') || [])
      .find(button => button.dataset.segmentId === id && button.dataset.avatarId === segment.foreignVoiceAvatarId);
    selected?.focus?.();
  }
  if (edit) scheduleEditFormPreviewUpdate();
  else {
    scheduleCommentFormPreviewUpdate();
    persistCommentDraft();
  }
}
