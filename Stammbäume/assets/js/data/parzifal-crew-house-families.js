import { createBlankHouseFamily } from './blank-house-family-factory.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { KLAUENINSEL_REGION_EMBLEMS } from './klaueninseln-house-profiles.js';
import { PARZIFAL_FAMILY_EXPANSIONS, PARZIFAL_NEW_HOUSES } from './parzifal-crew-families/catalog.js';
import { expandParzifalCrewFamily } from './parzifal-crew-families/family-expansion.js';
import { RHYDIAN_FAMILY_MEMBERS } from './parzifal-crew-families/rhydian-members.js';
import { withParzifalChaplainIdentityCorrection } from './parzifal-crew-families/identity-upgrade.js';

export function extendParzifalCrewHouse(base) {
  const definition = PARZIFAL_FAMILY_EXPANSIONS.find(row => `haus-${row.surname.toLowerCase()}` === base.document.id);
  if (!definition) return base;
  const crew = RHYDIAN_FAMILY_MEMBERS.filter(person => person.houseId === base.lineage.houseId);
  return withParzifalChaplainIdentityCorrection(expandParzifalCrewFamily(base, definition, crew));
}

function createParzifalHouse(definition) {
  const base = createBlankHouseFamily({
    id: `haus-${definition.surname.toLowerCase()}`, title: `Haus ${definition.surname}`,
    emblem: `assets/images/houses/Klaueninsel/parzifal-crew-2026-10-06/haus-${definition.surname.toLowerCase()}.png`,
    description: definition.description,
    houseProfile: createHouseProfileFromFolderPath(['Cenyr', 'Klaueninsel', 'Sturmklaue', 'Talgarth'], {
      rankId: 'commoner',
      regionEmblems: { kingdom: KLAUENINSEL_REGION_EMBLEMS.cenyr,
        county: KLAUENINSEL_REGION_EMBLEMS.county,
        barony: KLAUENINSEL_REGION_EMBLEMS.lordships.Sturmklaue }
    })
  });
  return extendParzifalCrewHouse({ ...base,
    lineage: { ...base.lineage, crestFrame: 'iron', crestSubtitle: 'Bürgerfamilie aus Talgarth' },
    extensions: { ...base.extensions, heraldryDescription: definition.heraldry }
  });
}

export const PARZIFAL_CREW_HOUSE_FAMILIES = Object.freeze(PARZIFAL_NEW_HOUSES.map(createParzifalHouse));
