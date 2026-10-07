import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { DUNFAL_EMBLEM, DUNFAL_HOUSE_DEFINITIONS, DUNFAL_TERRITORIES } from './dunfal-territorial-catalog.js';

function createDunfalHouseProfile(definition) {
  const territory = DUNFAL_TERRITORIES.find(entry => entry.id === definition.territoryId);
  const liegeId = definition.extinct || definition.kind === 'sept' || definition.rankId === 'ard-tiarna'
    ? '' : definition.rankId === 'mor-tiarna' ? 'haus-chulainn' : territory.rulingFamilyId;
  const liege = DUNFAL_HOUSE_DEFINITIONS.find(entry => entry.familyId === liegeId);
  const realm = definition.extinct ? 'Ausgestorbene Clans' : definition.realm;
  const folderPath = ['Dunfal', territory.name, ...(realm ? [realm, definition.seat] : [])];
  return createHouseProfileFromFolderPath(folderPath, {
    rankId: definition.rankId,
    seat: definition.seat,
    liegeHouseId: liege?.familyId || '',
    liegeHouseName: liege?.title || '',
    folderIcons: [DUNFAL_EMBLEM, territory.emblem, definition.realmEmblem, ''],
    regionEmblems: {
      kingdom: DUNFAL_EMBLEM, county: territory.emblem, barony: definition.realmEmblem, seat: ''
    }
  });
}

export const DUNFAL_HOUSE_PROFILES = Object.freeze(Object.fromEntries(
  DUNFAL_HOUSE_DEFINITIONS.map(definition => [definition.familyId, createDunfalHouseProfile(definition)])
));
