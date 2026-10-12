export const COMMENT_ACTIVITY_RECENT_LIMIT = 30;

function milliseconds(value) {
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (value && typeof value === 'object') {
    const seconds = Number(value.seconds ?? value._seconds);
    return Number.isFinite(seconds) ? seconds * 1000 + Number(value.nanoseconds ?? value._nanoseconds ?? 0) / 1e6 : NaN;
  }
  return typeof value === 'number' ? value : typeof value === 'string' ? Date.parse(value) : NaN;
}

function previewSpeaker(value = {}) {
  const portrait = String(value.portrait || '');
  return { charName: String(value.charName || value.name || '').slice(0, 300), narrator: !!value.narrator,
    portrait: portrait.startsWith('data:') ? '' : portrait.slice(0, 4096), text: String(value.text || '').slice(0, 1600) };
}

export function createCommentActivityPreview(comment) {
  const candidates = [Number(comment.activityAtClient), milliseconds(comment.activityAt), Number(comment.updatedAtClient), milliseconds(comment.updatedAt),
    milliseconds(comment.editedAt), Number(comment.createdAtClient), Number(comment.createdAtMs), milliseconds(comment.createdAt), milliseconds(comment.ts), Number(comment.orderKey)].filter(Number.isFinite);
  const latestSegment = [...(Array.isArray(comment.commentSegments) ? comment.commentSegments : [])].reverse().find(segment => segment?.text || segment?.charName || segment?.name);
  return { id: String(comment.id || ''), entryId: String(comment.entryId || ''), ...previewSpeaker(comment),
    activityAtClient: candidates.length ? Math.max(...candidates) : 0,
    ...(latestSegment ? { commentSegments: [previewSpeaker(latestSegment)] } : {}) };
}

export function buildCommentThreadActivity(threadId, comments) {
  const recentComments = comments.map(createCommentActivityPreview).sort((a, b) => b.activityAtClient - a.activityAtClient || b.id.localeCompare(a.id)).slice(0, COMMENT_ACTIVITY_RECENT_LIMIT);
  return { version: 1, threadId, commentCount: comments.length, recentComments };
}
