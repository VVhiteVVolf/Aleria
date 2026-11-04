import { DEVELOPMENT_TRAITS } from './development-traits.js';
import { PREVIOUS_DEVELOPMENT_TRAITS } from './development-trait-revision-source.js';

const current = new Map(DEVELOPMENT_TRAITS.map(trait => [trait.id, trait]));
export const DEVELOPMENT_TRAIT_BIOGRAPHY_REVISIONS = Object.freeze(PREVIOUS_DEVELOPMENT_TRAITS.flatMap(previous => {
  const revised = current.get(previous.id);
  return revised && revised.name === previous.name && revised.icon === previous.icon && revised.description !== previous.description
    ? [{ title: previous.name, detail: previous.description, icon: previous.icon, revisedDetail: revised.description }]
    : [];
}));

// A complete old catalog card is the evidence for a revision. Individual text,
// names, icons and every other biography field remain owned by their authors.
// These pure functions are also embedded in the classic biography runtime.
export function reviseDevelopmentTraitBiographyCards(cards, revisions = DEVELOPMENT_TRAIT_BIOGRAPHY_REVISIONS) {
  if (!Array.isArray(cards)) return cards;
  let changed = false;
  const revised = cards.map(card => {
    const match = card && revisions.find(previous => card.title === previous.title && card.detail === previous.detail && card.icon === previous.icon);
    if (!match) return card;
    changed = true;
    return { ...card, detail: match.revisedDetail };
  });
  return changed ? revised : cards;
}

export function reviseDevelopmentTraitBiography(biography, revisions = DEVELOPMENT_TRAIT_BIOGRAPHY_REVISIONS) {
  if (!biography || typeof biography !== 'object') return biography;
  const abilities = reviseDevelopmentTraitBiographyCards(biography.abilities, revisions);
  return abilities === biography.abilities ? biography : { ...biography, abilities };
}
