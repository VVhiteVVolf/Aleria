import { createBlankHouseFamily } from './blank-house-family-factory.js';
import { CENYR_TERRITORY_COMMONER_DEFINITIONS } from './cenyr-territory-commoner-definitions.js';

// These identities already existed on public territorial house cards. Their
// family records deliberately contain no invented founders or relationships.
export const CENYR_TERRITORY_COMMONER_FAMILIES = Object.freeze(
  CENYR_TERRITORY_COMMONER_DEFINITIONS.map(definition => {
    const family = createBlankHouseFamily({
      id: definition.id, title: definition.title,
      emblem: 'assets/images/placeholders/neutral-crest.png',
      houseProfile: definition.houseProfile,
      description: `${definition.title} ist eine bürgerliche Familie aus ${definition.houseProfile.seat}.`
    });
    return Object.freeze({
      ...family,
      lineage: Object.freeze({ ...family.lineage, crestFrame: 'iron' }),
      extensions: Object.freeze({
        ...family.extensions,
        sourceRevision: 1,
        heraldry: Object.freeze({ status: 'unknown', systemPlaceholder: true }),
        territorialHouseEvidence: definition.evidence
      })
    });
  })
);
