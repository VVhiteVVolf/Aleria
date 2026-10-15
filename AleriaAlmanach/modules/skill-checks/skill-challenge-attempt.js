import { COMMENT_KIND_SKILL_IDS, getSkillDefinition } from './skill-check-model.js?v=20260928-equipment-art-v4';

// The existing contribution catalog remains the owner of skill/kind mapping.
export function getChallengeAttemptChoices(challenge) {
  const ids = Array.isArray(challenge?.preferredSkills) ? challenge.preferredSkills : [];
  return [...new Set(ids)].flatMap(id => {
    const skill = getSkillDefinition(id);
    const kind = Object.keys(COMMENT_KIND_SKILL_IDS).find(kind => COMMENT_KIND_SKILL_IDS[kind].includes(id));
    return skill && kind ? [{ ...skill, kind }] : [];
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
