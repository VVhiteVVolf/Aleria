import { isTrustedSceneTimeComment } from '../generated/scene-time/scene-recovery-day.js';
export { isTrustedSceneTimeComment, getSceneRecoveryDay as getTrustedSceneDay } from '../generated/scene-time/scene-recovery-day.js';

function isImportedHistory(comment = {}) {
  return comment?.importedHistoricalMechanics === true;
}

export function isTrustedMechanicalComment(comment = {}) {
  return !isImportedHistory(comment) && comment?.serverValidatedMechanics === true;
}

export function isTrustedSceneContributionComment(comment = {}) {
  return !isImportedHistory(comment)
    && (comment?.serverCommitted === true || comment?.serverValidatedMechanics === true);
}

export function isTrustedSkillChallengeComment(comment = {}) {
  if (isImportedHistory(comment) || comment?.serverCommitted !== true || comment?.mechanicalAudit !== true) return false;
  return (Array.isArray(comment.commentSegments) ? comment.commentSegments : [])
    .some(segment => segment?.skillChallenge?.enabled !== false && segment?.skillChallenge?.id);
}

export function isTrustedHerausforderungComment(comment = {}) {
  if (isImportedHistory(comment) || comment?.serverValidatedMechanics !== true) return false;
  return !!(comment?.herausforderung && Array.isArray(comment.herausforderung.approaches) && comment.herausforderung.approaches.length);
}

export function getTrustedSceneCursorSeconds(comments = [], fallbackDay = 1, fallbackSeconds = 0) {
  const fallback = ((Math.max(1, Number(fallbackDay) || 1) - 1) * 86400)
    + Math.max(0, Math.min(86399, Number(fallbackSeconds) || 0));
  return (Array.isArray(comments) ? comments : [])
    .filter(isTrustedSceneTimeComment)
    .reduce((cursor, comment) => {
      const day = Number(comment.sceneTimeEvent?.anchorDay);
      const seconds = Number(comment.sceneTimeEvent?.anchorSeconds);
      if (!Number.isInteger(day) || day < 1 || !Number.isFinite(seconds) || seconds < 0 || seconds > 86399) return cursor;
      return Math.max(cursor, ((day - 1) * 86400) + Math.floor(seconds));
    }, fallback);
}

export function sortSceneHistory(comments = []) {
  return (Array.isArray(comments) ? comments : []).slice().sort((left, right) => (
    Number(left?.orderKey || left?.createdAtClient || 0) - Number(right?.orderKey || right?.createdAtClient || 0)
  ));
}
