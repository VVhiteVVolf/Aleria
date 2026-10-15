import { getSkillIconPresentation } from '../skill-checks/skill-icon-registry.js';

export function renderCharacterSkillIcon(skill) {
  const icon = getSkillIconPresentation(skill);
  return `<img class="cp-sheet-skill-icon" data-character-skill-icon="${icon.id}" src="${icon.src}" alt="" width="44" height="44" loading="lazy" decoding="async">`;
}

export function updateCharacterSkillIcon(input) {
  if (input?.dataset?.combatCollection !== 'skills' || input.dataset.combatProperty !== 'name') return;
  const image = input.closest('.cp-sheet-skill-identity')?.querySelector('[data-character-skill-icon]');
  if (!image) return;
  const icon = getSkillIconPresentation(input.value);
  if (image.dataset.characterSkillIcon === icon.id) return;
  image.src = icon.src;
  image.dataset.characterSkillIcon = icon.id;
}
