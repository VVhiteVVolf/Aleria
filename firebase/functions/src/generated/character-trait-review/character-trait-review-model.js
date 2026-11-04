import { DEVELOPMENT_TRAITS } from '../character-development/development-traits.js';
import { isExactDevelopmentTraitCatalogCopy } from '../character-development/development-trait-revisions.js';
import { reviewedCharacterTraitAssignment } from './reviewed-character-traits.js';
const catalog = new Map(DEVELOPMENT_TRAITS.map(trait => [trait.id, trait]));
const biographyCard = trait => ({ title: trait.name, detail: trait.description, icon: trait.icon });
const hasExactCopies = (copies, assignment, project) => Boolean(assignment && Array.isArray(copies)
  && copies.length === assignment.traits.length
  && copies.every((copy, index) => isExactDevelopmentTraitCatalogCopy(copy, `development-trait-${assignment.traits[index]}`, project)));

export function reviewedCharacterTraits(assignment, existing) {
  if (!assignment || assignment.traits.length > 3) throw Error('Der sparsame Abgleich benötigt eine geprüfte Auswahl mit höchstens drei Traits.');
  if (hasExactReviewedTraitCopies(existing, assignment)) return existing;
  return assignment.traits.map(id => {
    const trait = catalog.get(`development-trait-${id}`);
    if (!trait) throw Error(`Unbekanntes geprüftes Merkmal: ${id}`);
    return structuredClone(trait);
  });
}
export function hasExactReviewedTraitCopies(copies, assignment) {
  return hasExactCopies(copies, assignment);
}
export function hasExactReviewedBiographyTraitCards(cards, id) {
  return hasExactCopies(cards, reviewedCharacterTraitAssignment(id), biographyCard);
}
export function reviewedBiographyTraitCards(id, copies) {
  const assignment = reviewedCharacterTraitAssignment(id);
  return assignment ? reviewedCharacterTraits(assignment, copies).map(biographyCard) : [];
}
export function hasAuthoredCombatProfile(character) {
  const profile = character?.combatProfile;
  if (!profile || !Object.keys(profile).length) return false;
  return Number(profile.progression?.level || 1) > 1
    || (profile.attributes || []).some(attribute => Number(attribute.score) !== 10)
    || ['techniques', 'abilities', 'quirks'].some(key => (profile[key] || []).length)
    || (profile.weapons || []).some(weapon => !['default-unarmed', 'unarmed'].includes(weapon.id) && weapon.weaponType !== 'unarmed')
    || (profile.armorItems || []).length > 0 || (profile.magic?.spells || []).length > 0;
}
export function replaceReviewedBiographyTraits(biography, cards) {
  if (!biography?.biography || biography.disabled === true) return biography;
  return { ...biography, biography: { ...biography.biography, abilitiesTitle: 'Eigenschaften', abilities: structuredClone(cards) } };
}
export function projectReviewedCharacterTraits(character, assignment) {
  if (![assignment.id, assignment.onlineId].includes(character.id) || character.name !== assignment.name) throw Error('Die geprüfte Figurenidentität stimmt nicht überein.');
  if (!hasAuthoredCombatProfile(character)) throw Error(`Kein ausgearbeiteter Kampfbogen: ${character.name}`);
  const remove = new Set(assignment.removeAbilityIds || []);
  const removeConditions = new Set(assignment.removeConditionIds || []);
  return { ...character, combatProfile: { ...character.combatProfile,
    quirks: reviewedCharacterTraits(assignment, character.combatProfile.quirks),
    ...(removeConditions.size ? { conditions: (character.combatProfile.conditions || []).filter(condition => !removeConditions.has(condition.id)) } : {}),
    ...(remove.size ? { abilities: (character.combatProfile.abilities || []).filter(ability => !remove.has(ability.id)) } : {}) },
    ...(character.biography?.biography ? { biography: hasExactReviewedBiographyTraitCards(character.biography.biography.abilities, assignment.id)
      ? character.biography : replaceReviewedBiographyTraits(character.biography, reviewedBiographyTraitCards(assignment.id)) } : {}) };
}
