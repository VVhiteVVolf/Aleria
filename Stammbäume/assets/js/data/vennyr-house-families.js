import { createBlankHouseFamily } from './blank-house-family-factory.js';
import { normalizeHouseProfile } from '../domain/house-profile.js';
import { BLODYN_REGION_EMBLEMS } from './blodyn-house-profiles.js';
import { VENNYR_TERRITORIES, VENNYR_TERRITORIAL_HOUSES } from './vennyr-territorial-catalog.js';

function createTerritorialHouseFamily(house) {
  const territory = VENNYR_TERRITORIES.find(entry => entry.name === house.region);
  const houseProfile = normalizeHouseProfile({
    rankId: house.rankId,
    kingdom: 'Vennyr',
    county: house.region,
    barony: house.lordship || '',
    seat: house.seat,
    liegeHouseId: house.liegeFamilyId,
    liegeHouseName: house.liegeHouseName,
    regionEmblems: {
      kingdom: BLODYN_REGION_EMBLEMS.vennyr,
      county: territory.emblemPath,
      barony: house.lordship === 'Baronie Hoyers Krone' ? BLODYN_REGION_EMBLEMS.hoyersKrone : '',
      seat: house.seat === 'Lyndor' ? BLODYN_REGION_EMBLEMS.lyndor : ''
    }
  });
  const family = createBlankHouseFamily({
    id: house.familyId,
    title: `Haus ${house.name}`,
    emblem: house.emblemPath,
    houseProfile,
    description: `Haus ${house.name} mit Sitz in ${house.seat}, ${house.region}, Vennyr. Die Familiengeschichte wird gesondert ergänzt.`
  });
  return Object.freeze({
    ...family,
    extensions: Object.freeze({
      ...family.extensions,
      sourceRevision: 1,
      territorialSource: Object.freeze({
        attachmentId: house.attachmentId,
        row: house.sourceRow,
        column: house.sourceColumn
      }),
      sourceNote: 'Territoriale Hausakte nach der Vennyr-Oberherrschaftstabelle. Sitz, Oberherrschaft und Wappen sind belegt. Der Hausrang ist nicht vermerkt; Personen und Abstammungen folgen erst mit der gesonderten Stammbaumquelle.'
    })
  });
}

export const VENNYR_NEW_HOUSE_FAMILIES = Object.freeze(
  VENNYR_TERRITORIAL_HOUSES.filter(house => !house.existing).map(createTerritorialHouseFamily)
);
