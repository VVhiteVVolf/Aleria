// Recovery periods use the authoritative scene clock, not the displayed
// Aleria calendar date. Keep existing persisted day keys stable across clients
// and server calls; a different calendar label must never refill a resource.
export function isTrustedSceneTimeComment(comment = {}) {
  if (comment?.importedHistoricalMechanics === true
    || !comment?.sceneTimeEvent || typeof comment.sceneTimeEvent !== 'object') return false;
  return comment.serverValidatedMechanics === true
    || (comment.serverCommitted === true && comment.mechanicalAudit === true);
}

export function getSceneRecoveryDay(comments = [], fallbackDay = 1) {
  return (Array.isArray(comments) ? comments : [])
    .filter(isTrustedSceneTimeComment)
    .reduce((day, comment) => {
      const candidate = Number(comment.sceneTimeEvent.anchorDay);
      return Number.isInteger(candidate) && candidate >= 1 ? Math.max(day, candidate) : day;
    }, Math.max(1, Number(fallbackDay) || 1));
}

export function getSceneRecoveryDayKey(threadId = '', comments = [], fallbackDay = 1) {
  return `scene:${String(threadId || 'unknown')}:day-${getSceneRecoveryDay(comments, fallbackDay)}`;
}
