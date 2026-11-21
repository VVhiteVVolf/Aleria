import { DROWNED_ENCOUNTERS } from './encounter-drowned.js';
import { LAND_TROLL_ENCOUNTERS } from './encounter-land-troll.js';
import { PREDATOR_ENCOUNTERS } from './encounter-predators.js';
import { MULINAR_ENCOUNTERS } from './encounter-mulinar.js';
import { HORNLING_ENCOUNTERS } from './encounter-hornlings.js';

export const BESTIARY_ENCOUNTER_CARDS = Object.freeze([
  ...DROWNED_ENCOUNTERS, ...LAND_TROLL_ENCOUNTERS, ...PREDATOR_ENCOUNTERS, ...MULINAR_ENCOUNTERS, ...HORNLING_ENCOUNTERS
]);

export function getBestiaryEncounterCard(id) {
  return BESTIARY_ENCOUNTER_CARDS.find(card => card.id === id) || null;
}
