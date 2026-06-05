// Event delegation for comment segment editors.
const COMMENT_SEGMENT_CLICK_ACTIONS = new Set([
  'add-comment-segment',
  'add-edit-comment-segment',
  'set-comment-segment-kind',
  'set-edit-comment-segment-kind',
  'set-comment-segment-side',
  'set-edit-comment-segment-side',
  'set-comment-segment-emote',
  'set-edit-comment-segment-emote',
  'remove-comment-segment',
  'remove-edit-comment-segment',
  'format-comment-segment-wrap',
  'format-comment-segment-color',
  'format-comment-segment-tooltip'
]);

function handleCommentSegmentActionClick(event) {
  const trigger = event.target?.closest?.('[data-action]');
  if (!trigger || !COMMENT_SEGMENT_CLICK_ACTIONS.has(trigger.dataset.action)) return;

  event.preventDefault();
  const action = trigger.dataset.action;
  const segmentId = trigger.dataset.segmentId || trigger.closest('.comment-segment-card')?.dataset.segmentId || '';
  const kind = trigger.dataset.kind || 'speech';

  if (action === 'add-comment-segment') {
    addCommentSegment(kind);
    return;
  }
  if (action === 'add-edit-comment-segment') {
    addEditCommentSegment(kind);
    return;
  }
  if (action === 'set-comment-segment-kind') {
    setCommentSegmentKind(segmentId, kind);
    return;
  }
  if (action === 'set-edit-comment-segment-kind') {
    setEditCommentSegmentKind(segmentId, kind);
    return;
  }
  if (action === 'set-comment-segment-side') {
    setCommentSegmentSide(segmentId, trigger.dataset.side || 'left');
    return;
  }
  if (action === 'set-edit-comment-segment-side') {
    setEditCommentSegmentSide(segmentId, trigger.dataset.side || 'left');
    return;
  }
  if (action === 'set-comment-segment-emote') {
    setCommentSegmentEmote(segmentId, trigger.dataset.emoteIndex || '');
    return;
  }
  if (action === 'set-edit-comment-segment-emote') {
    setEditCommentSegmentEmote(segmentId, trigger.dataset.emoteIndex || '');
    return;
  }
  if (action === 'remove-comment-segment') {
    removeCommentSegment(segmentId);
    return;
  }
  if (action === 'remove-edit-comment-segment') {
    removeEditCommentSegment(segmentId);
    return;
  }
  if (action === 'format-comment-segment-wrap') {
    fmtWrap(trigger.dataset.targetId || '', trigger.dataset.wrapBefore || '', trigger.dataset.wrapAfter || '');
    return;
  }
  if (action === 'format-comment-segment-color') {
    fmtColor(trigger.dataset.targetId || '', trigger.dataset.color || '');
    return;
  }
  if (action === 'format-comment-segment-tooltip') {
    fmtTooltip(trigger.dataset.targetId || '');
  }
}

function handleCommentSegmentActionMouseDown(event) {
  const trigger = event.target?.closest?.('[data-action]');
  if (!trigger || !COMMENT_SEGMENT_CLICK_ACTIONS.has(trigger.dataset.action)) return;
  if (!String(trigger.dataset.action || '').startsWith('format-comment-segment-')) return;
  event.preventDefault();
}

function handleCommentSegmentTextInput(event) {
  const field = event.target;
  if (!field?.matches?.('.comment-segment-textarea[data-action]')) return;
  rememberCommentTextareaSelection(field);

  const segmentId = field.dataset.segmentId || field.closest('.comment-segment-card')?.dataset.segmentId || '';
  if (field.dataset.action === 'set-comment-segment-text') {
    setCommentSegmentText(segmentId, field.value);
    return;
  }
  if (field.dataset.action === 'set-edit-comment-segment-text') {
    setEditCommentSegmentText(segmentId, field.value);
  }
}

function handleCommentSegmentSelection(event) {
  const field = event.target;
  if (!field?.matches?.('.comment-segment-textarea')) return;
  rememberCommentTextareaSelection(field);
}

document.addEventListener('mousedown', handleCommentSegmentActionMouseDown);
document.addEventListener('click', handleCommentSegmentActionClick);
document.addEventListener('input', handleCommentSegmentTextInput);
document.addEventListener('keyup', handleCommentSegmentSelection);
document.addEventListener('mouseup', handleCommentSegmentSelection);
document.addEventListener('select', handleCommentSegmentSelection);
document.addEventListener('focusin', handleCommentSegmentSelection);
document.addEventListener('selectionchange', () => {
  const field = document.activeElement;
  if (!field?.matches?.('.comment-segment-textarea')) return;
  rememberCommentTextareaSelection(field);
});
