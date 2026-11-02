// Same five-second default and 24-hour segment limit as the interactive timeline.
// Only trusted contributions advance mechanics; wall-clock time is never used.
export const SCENE_CONTRIBUTION_SECONDS = 5;
export function isConditionClockContribution(comment = {}) {
  return comment.importedHistoricalMechanics !== true && (comment.serverValidatedMechanics === true || comment.serverCommitted === true);
}
export function sceneSegmentSeconds(segment = {}) {
  const value = Number(segment.durationSeconds);
  return Number.isFinite(value) ? Math.max(0, Math.min(86400, Math.round(value))) : SCENE_CONTRIBUTION_SECONDS;
}
export function advanceSceneConditionClock(clock = {}, comment = {}, segmentLimit = null) {
  if (!isConditionClockContribution(comment)) return clock;
  const event = comment.sceneTimeEvent;
  if (event && Number.isInteger(Number(event.anchorDay)) && Number(event.anchorDay) >= 1 && Number.isFinite(Number(event.anchorSeconds)) && Number(event.anchorSeconds) >= 0 && Number(event.anchorSeconds) < 86400) {
    const cursor = (Number(event.anchorDay) - 1) * 86400 + Math.floor(Number(event.anchorSeconds));
    return { cursor, seconds: Math.max(clock.seconds ?? cursor, cursor) };
  }
  if (!Number.isFinite(clock.cursor) || comment.combatStatus || comment.combatEncounter || comment.combatRulesRelease) return clock;
  const segments = Array.isArray(comment.commentSegments) ? comment.commentSegments : [];
  const seconds = segments.length ? segments.slice(0, segmentLimit ?? segments.length).filter(segment => String(segment.text || '').trim()).reduce((sum, segment) => sum + sceneSegmentSeconds(segment), 0)
    : segmentLimit === 0 ? 0 : ['character', 'charakter', 'manual', 'narrator'].includes(comment.commentMode || (comment.narrator ? 'narrator' : 'character')) && String(comment.text || '').trim() ? SCENE_CONTRIBUTION_SECONDS : 0;
  const cursor = clock.cursor + seconds;
  return { cursor, seconds: Math.max(clock.seconds, cursor) };
}
export function getSceneConditionClock(comments = []) {
  return comments.reduce((clock, comment) => advanceSceneConditionClock(clock, comment), {});
}
export function sceneClockBeforeSegment(clock, segments = [], index = 0) {
  return advanceSceneConditionClock(clock, { serverValidatedMechanics: true, commentSegments: segments }, index).seconds;
}
