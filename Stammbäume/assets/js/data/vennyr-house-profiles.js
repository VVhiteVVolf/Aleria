import { normalizeHouseProfile } from '../domain/house-profile.js';
import { BLODYN_REGION_EMBLEMS } from './blodyn-house-profiles.js';
import { VENNYR_TERRITORIES, VENNYR_TERRITORIAL_HOUSES } from './vennyr-territorial-catalog.js';

export function getVennyrTerritorialHouse(familyId) {
  const house = VENNYR_TERRITORIAL_HOUSES.find(entry => entry.familyId === familyId);
  if (!house) throw new Error(`Keine territoriale Vennyr-Quelle für ${familyId}.`);
  return house;
}

export function getVennyrHouseProfile(familyId) {
  const house = getVennyrTerritorialHouse(familyId);
  const territory = VENNYR_TERRITORIES.find(entry => entry.name === house.region);
  return normalizeHouseProfile({
    rankId: house.rankId,
    kingdom: 'Vennyr', county: house.region, barony: house.lordship || '', seat: house.seat,
    liegeHouseId: house.liegeFamilyId, liegeHouseName: house.liegeHouseName,
    regionEmblems: {
      kingdom: BLODYN_REGION_EMBLEMS.vennyr, county: territory.emblemPath,
      barony: house.lordship === 'Baronie Hoyers Krone' ? BLODYN_REGION_EMBLEMS.hoyersKrone : '',
      seat: house.seat === 'Lyndor' ? BLODYN_REGION_EMBLEMS.lyndor : ''
    }
  });
}
