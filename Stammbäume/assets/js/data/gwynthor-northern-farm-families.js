import { NORTHERN_FARMS } from '../../../../shared/gwynthor-northern-farms/northern-farms.mjs';
import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { CELTIGERNS_WACHT_REGION_EMBLEMS } from './celtigerns-wacht-house-profiles.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

const regions = CELTIGERNS_WACHT_REGION_EMBLEMS;

export const GWYNTHOR_NORTHERN_FARM_FAMILIES = Object.freeze(NORTHERN_FARMS.map(farm => {
  const family = createFounderTimeJumpPlaceholderHouseFamily({
    id: farm.familyId, title: farm.familyName, emblem: farm.emblem, description: farm.overview,
    houseProfile: createHouseProfileFromFolderPath(
      ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', farm.seat],
      {
        rankId: 'commoner', liegeHouseId: `house-${farm.liege.toLowerCase()}`, liegeHouseName: farm.liegeName,
        regionEmblems: { seat: regions.seats.Gwynthor, barony: regions.baronies['Llamreis Ankunft'], county: regions.county, kingdom: regions.kingdom }
      }
    ),
    toYear: 'unbekannt', timeJumpLabel: 'Weitere Generationen offen', pendingDescendantReview: true
  });
  return {
    ...family,
    persons: family.persons.map(person => ({
      ...person, name: person.sex === 'female' ? 'Unbekannte Gründerin' : 'Unbekannter Gründer',
      title: '', death: '', notes: 'Name und Lebensdaten sind bislang nicht überliefert.'
    })),
    partnerships: family.partnerships.map(pair => ({ ...pair, status: 'ended', certainty: 'unknown', notes: '' })),
    timeJumps: family.timeJumps.map(jump => ({ ...jump, fromYear: '', toYear: '' })),
    lineage: { ...family.lineage, crestSubtitle: farm.seat }
  };
}));
