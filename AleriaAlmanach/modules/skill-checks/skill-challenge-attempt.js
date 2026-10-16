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
  return { kind: selected.kind, mechanicMode: 'skill', skillId: selected.id,
    skillTargetActorKey: challenge.authorKey, skillTargetChallengeId: challenge.id, skillDifficulty: challenge.difficulty };
}
