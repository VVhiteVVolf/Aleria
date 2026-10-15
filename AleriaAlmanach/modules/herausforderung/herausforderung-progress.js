import { getHerausforderungApproachTargetId } from './herausforderung-model.js?v=20261015-graded-challenges-v1';

export const HERAUSFORDERUNG_TIER_LABELS = Object.freeze({
  'kritischer-erfolg': 'Kritischer Erfolg', erfolg: 'Erfolg', knapp: 'Teilhinweis', deutlich: 'Gescheitert'
});

export function collectHerausforderungProgress(comments = []) {
  const progress = new Map();
  for (const comment of comments) {
    for (const segment of comment.commentSegments || []) {
      const resolution = segment.skillResolution;
      const id = String(resolution?.targetChallengeId || '');
      if (!id.startsWith('herausforderung:')) continue;
      const previous = progress.get(id) || { attempts: 0, solved: false };
      const solved = resolution.herausforderungSolved ?? ['success', 'critical-success'].includes(resolution.outcome);
      // A later failed attempt must never replace an already published insight.
      progress.set(id, {
        ...previous,
        ...(!previous.solved ? { tier: resolution.herausforderungTier || (solved ? 'erfolg' : 'deutlich'), ...(resolution.herausforderungLabel ? { label: resolution.herausforderungLabel } : {}), actorName: resolution.actorName || '', revealedText: resolution.revealedText || '', reward: resolution.herausforderungReward || null } : {}),
        attempts: previous.attempts + 1,
        solved: previous.solved || solved
      });
    }
  }
  return progress;
}

export function getApproachProgress(progress, commentId, approachId) {
  return progress.get(getHerausforderungApproachTargetId(commentId, approachId)) || { attempts: 0, solved: false };
}
