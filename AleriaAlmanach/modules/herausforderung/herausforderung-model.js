export const HERAUSFORDERUNG_EVENT_KIND = 'herausforderung-event';
export const HERAUSFORDERUNG_SCHEMA_VERSION = 1;
export const MIN_HERAUSFORDERUNG_APPROACHES = 1;
export const MAX_HERAUSFORDERUNG_APPROACHES = 6;

function text(value, maximum = 240) {
  return String(value || '').trim().slice(0, maximum);
}

function integer(value, fallback, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.trunc(parsed)));
}

function makeApproachId() {
  return typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID().slice(0, 12)
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeHerausforderungApproach(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  const preferredSkills = [...new Set((Array.isArray(source.preferredSkills) ? source.preferredSkills : [])
    .map(skillId => text(skillId, 60))
    .filter(Boolean))];
  return {
    approachId: text(source.approachId, 40) || makeApproachId(),
    label: text(source.label, 160) || `Ansatz ${index + 1}`,
    preferredSkills,
    difficulty: integer(source.difficulty, 10, 1, 40),
    insight: text(source.insight, 2000)
  };
}

export function normalizeHerausforderungEvent(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const approaches = (Array.isArray(source.approaches) ? source.approaches : [])
    .slice(0, MAX_HERAUSFORDERUNG_APPROACHES)
    .map(normalizeHerausforderungApproach);
  return {
    kind: HERAUSFORDERUNG_EVENT_KIND,
    schemaVersion: HERAUSFORDERUNG_SCHEMA_VERSION,
    title: text(source.title, 180) || 'Herausforderung',
    publicDescription: text(source.publicDescription, 4000),
    approaches
  };
}

export function isHerausforderungComment(comment = {}) {
  return !!(comment?.herausforderung || comment?.commentKind === HERAUSFORDERUNG_EVENT_KIND || comment?.commentMode === 'herausforderung');
}

export function getHerausforderungApproachTargetId(commentId = '', approachId = '') {
  return `herausforderung:${text(commentId, 200)}:${text(approachId, 40)}`;
}

export function parseHerausforderungApproachTargetId(targetId = '') {
  const match = /^herausforderung:(.+):([^:]+)$/.exec(String(targetId || ''));
  if (!match) return null;
  return { commentId: match[1], approachId: match[2] };
}

export function collectHerausforderungApproaches(comments = []) {
  const approaches = [];
  (Array.isArray(comments) ? comments : []).forEach(comment => {
    if (!isHerausforderungComment(comment)) return;
    const event = normalizeHerausforderungEvent(comment.herausforderung || comment);
    const commentId = text(comment?.id, 200);
    if (!commentId) return;
    const authorKey = `herausforderung:${commentId}`;
    event.approaches.forEach((approach, index) => {
      approaches.push({
        schemaVersion: HERAUSFORDERUNG_SCHEMA_VERSION,
        source: 'herausforderung',
        id: getHerausforderungApproachTargetId(commentId, approach.approachId),
        commentId,
        approachId: approach.approachId,
        segmentIndex: 0,
        difficulty: approach.difficulty,
        preferredSkills: approach.preferredSkills,
        preferredModifier: 2,
        alternativeModifier: -2,
        defenseMode: 'fixed',
        defenseSkillId: 'deception',
        insight: approach.insight,
        authorId: '',
        authorKey,
        authorName: text(event.title, 180),
        authorPersistence: null,
        createdBy: text(comment?.createdBy, 200),
        visibleText: `${event.title} · ${approach.label}`,
        createdAt: comment?.createdAt || comment?.createdAtClient || null,
        contributionRank: index + 1
      });
    });
  });
  return approaches;
}

export const herausforderungInternals = Object.freeze({ text, integer, makeApproachId });
