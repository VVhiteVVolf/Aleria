import { isDeepStrictEqual } from 'node:util';
import { addYlvaDuelTechniques, YLVA_DUEL_OWNER_ID } from '../../../AleriaAlmanach/modules/characters/personal-techniques/ylva-duel-techniques.js';
import { GAIS_COMPANION, GAIS_OWNER_ID } from '../../../AleriaAlmanach/modules/creatures/catalog/gais-companion.js';
import { sanitizeCreature } from '../../../AleriaAlmanach/modules/creatures/creature-model.js';
import { attachCreatureToInventory } from '../../../AleriaAlmanach/modules/creatures/creature-companion-link.js';

export const GAIS_HORSE_BIOGRAPHY = '<p>Gais reitet <strong>Saithor</strong>, einen schwarzen <strong>Edelsale-Hengst aus Ceffyl und Sale</strong>. Der edle Hals und die enge Reiterbindung des Ceffyl verbinden sich mit der nordischen Ausdauer und Zuverlässigkeit des Sale. Lange schwarze Mähne und dichter Fesselbehang geben dem Ross einen würdevollen Auftritt; schwarzes Lederzeug und eine schwarz-goldene Satteldecke passen zu seinem Reiter.</p><p>Saithor ist ein verlässliches Reitpferd, kein unverwundbarer Held. Gais achtet auf seine Kräfte und seine Ausbildung. Ein Ross trägt für ihn auch das Ansehen seines Hauses – selbst wenn es gelegentlich versucht, ein sorgfältig gefaltetes Taschentuch zu verspeisen.</p>';

export function updateGaisHorseBiography(biography) {
  if (!biography || typeof biography !== 'object') return biography;
  const result = structuredClone(biography);
  for (const fact of result.stats || []) if (fact.label === 'Reittier') fact.value = 'Saithor · Edelsale-Hengst (Ceffyl × Sale)';
  for (const value of Object.values(result.biography || {})) if (Array.isArray(value)) {
    for (const section of value) if (section?.title === 'Ein Pferd, das gesehen werden soll') section.text = GAIS_HORSE_BIOGRAPHY;
  }
  return result;
}

// Pure, scoped one-time grant. Never normalize whole live profiles or refill pools.
export function planGameplayGuideRelease(character) {
  const patch = {};
  if (character.id === YLVA_DUEL_OWNER_ID && character.combatProfile) {
    const techniques = addYlvaDuelTechniques(character).combatProfile.techniques;
    if (!isDeepStrictEqual(techniques, character.combatProfile.techniques)) patch['combatProfile.techniques'] = techniques;
  }
  if (character.id === GAIS_OWNER_ID) {
    const inventory = attachCreatureToInventory(character, sanitizeCreature(GAIS_COMPANION));
    if (!isDeepStrictEqual(inventory, character.inventory)) patch.inventory = inventory;
    const biography = updateGaisHorseBiography(character.biography);
    if (!isDeepStrictEqual(biography, character.biography)) patch.biography = biography;
  }
  return Object.keys(patch).length ? patch : null;
}
