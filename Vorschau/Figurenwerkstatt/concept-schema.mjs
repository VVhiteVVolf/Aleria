import { CHARACTER_AND_HOUSE_TEMPLATES } from './concept-character-house-templates.mjs';
import { PLACE_TEMPLATE } from './concept-place-template.mjs';
import { FACTION_TEMPLATE } from './concept-faction-template.mjs';
import { CREATURE_TEMPLATE } from './concept-creature-template.mjs';
import { ITEM_TEMPLATE } from './concept-item-template.mjs';

export { STAGES } from './concept-template-sections.mjs';

export const CONCEPT_TYPES = {
  ...CHARACTER_AND_HOUSE_TEMPLATES,
  place: PLACE_TEMPLATE,
  faction: FACTION_TEMPLATE,
  creature: CREATURE_TEMPLATE,
  item: ITEM_TEMPLATE
};

export function conceptTitle(draft) {
  return draft.fields.name?.trim() || CONCEPT_TYPES[draft.kind].untitled;
}

export function variantTitle(row, index) {
  return row.name?.trim() || `Variante ${['I', 'II', 'III'][index]}`;
}
