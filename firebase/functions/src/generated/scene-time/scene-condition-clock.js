// Same five-second default and 24-hour segment limit as the interactive timeline.
// Only trusted contributions advance mechanics; wall-clock time is never used.
import { isSilentSceneRegeneration } from '../scene-regeneration/scene-regeneration-model.js';
import { isTrustedSceneTimeComment } from './scene-recovery-day.js';
import { getSceneConditionAnchor } from './scene-condition-anchor.js';
export const SCENE_CONTRIBUTION_SECONDS = 5;
export function isConditionClockContribution(comment = {}) {
  return !isSilentSceneRegeneration(comment) && comment.importedHistoricalMechanics !== true && (comment.serverValidatedMechanics === true || comment.serverCommitted === true);
}
export function sceneSegmentSeconds(segment = {}) {
  const supplied = segment.durationSeconds;
  const value = supplied == null || typeof supplied === 'boolean' || String(supplied).trim() === '' ? NaN : Number(supplied);
  return Number.isFinite(value) ? Math.max(0, Math.min(86400, Math.round(value))) : SCENE_CONTRIBUTION_SECONDS;
}
export function advanceSceneConditionClock(clock = {}, comment = {}, segmentLimit = null) {
  if (!isConditionClockContribution(comment)) return clock;
  const event = comment.sceneTimeEvent;
  if (event) {
    const anchor = isTrustedSceneTimeComment(comment) ? getSceneConditionAnchor(event) : null;
    return anchor ? { cursor: anchor.cursor, seconds: Math.max(clock.seconds ?? anchor.cursor, anchor.cursor) } : clock;
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
