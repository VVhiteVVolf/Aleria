import { getCheckCommentKind, getCheckDefinition } from './skill-check-model.js?v=20261015-check-options-v1';
import { getChallengeCheckRule } from '../herausforderung/herausforderung-check-policy.js?v=20261016-check-policy-v1';

// The existing contribution catalog remains the owner of skill/kind mapping.
export function getChallengeAttemptChoices(challenge) {
  const ids = Array.isArray(challenge?.preferredSkills) ? challenge.preferredSkills : [];
  return [...new Set(ids)].flatMap(id => {
    const skill = getCheckDefinition(id);
    const kind = getCheckCommentKind(id);
    const rule = getChallengeCheckRule(challenge, id);
    return skill && kind && rule.allowed ? [{ ...skill, kind, modifier: rule.modifier, penaltyReason: rule.reason }] : [];
  });
}

export function getChallengeAttemptSettings(challenge, selectedSkillId = '') {
  if (!challenge?.id) return null;
  const choices = getChallengeAttemptChoices(challenge);
  const selected = selectedSkillId ? choices.find(skill => skill.id === selectedSkillId) : choices[0];
  if (!selected) return null;
  return { kind: selected.kind, mechanicMode: 'skill', skillId: selected.id, actionIconId: challenge.actionIconId || '',
    skillTargetActorKey: challenge.authorKey, skillTargetChallengeId: challenge.id, skillDifficulty: challenge.difficulty,
    ...(challenge.reaction ? { actorId: challenge.reaction.actorId, skillSaveContext: challenge.reaction.saveContext } : {}) };
}

// Only the challenge's "Versuchen" entry point uses this insertion anchor.
// A regular comment keeps the existing append/manual-position behavior.
export function getChallengeReactionInsertAfterId(challenge, comments = []) {
  if (!challenge?.id) return null;
  const responds = comment => (comment.commentSegments || []).some(segment =>
    segment.skillResolution?.targetChallengeId === challenge.id);
  const index = comments.findIndex(responds);
  if (index < 0) return challenge.commentId || null;
  return comments[index].id || null;
}

// Group presentation replies without changing the order of committed mechanics.
// Callers keep named pages and scene-day boundaries outside each input group.
export function orderChallengeRepliesForDisplay(comments = []) {
  const source = Array.isArray(comments) ? comments : [];
  const byId = new Map(source.map(comment => [String(comment.id || ''), comment]));
  const children = new Map(), attached = new Set();
  for (const comment of source) {
    const parent = (comment.commentSegments || []).find(segment => segment.challengeReplyToCommentId)?.challengeReplyToCommentId;
    if (!parent || !byId.has(parent) || parent === comment.id) continue;
    if (!children.has(parent)) children.set(parent, []);
    children.get(parent).push(comment);
    attached.add(comment);
  }
  const result = [], seen = new Set();
  function append(first) {
    const pending = [first];
    while (pending.length) {
      const comment = pending.pop();
      if (seen.has(comment)) continue;
      seen.add(comment); result.push(comment);
      const replies = children.get(String(comment.id || '')) || [];
      for (let index = replies.length - 1; index >= 0; index -= 1) pending.push(replies[index]);
    }
  }
  source.filter(comment => !attached.has(comment)).forEach(append);
  source.forEach(append);
  return result;
}
