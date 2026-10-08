import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { BLAITHNEACH_EMBLEM, BLAITHNEACH_HOUSE_DEFINITIONS, BLAITHNEACH_TERRITORIES } from './blaithneach-territorial-catalog.js';

function createBlaithneachHouseProfile(definition) {
  const territory = BLAITHNEACH_TERRITORIES.find(entry => entry.id === definition.territoryId);
  const liegeId = definition.extinct || definition.houseStatus === 'expelled' || definition.rankId === 'ard-tiarna'
    ? '' : definition.rankId === 'mor-tiarna' ? 'haus-ronain' : territory.rulingFamilyId;
  const liege = BLAITHNEACH_HOUSE_DEFINITIONS.find(entry => entry.familyId === liegeId);
  return createHouseProfileFromFolderPath(['Blaithneach', territory.name], {
    rankId: definition.rankId, seat: definition.seat,
    liegeHouseId: liege?.familyId || '', liegeHouseName: liege?.title || '',
    folderIcons: [BLAITHNEACH_EMBLEM, territory.emblem, ''],
    regionEmblems: { kingdom: BLAITHNEACH_EMBLEM, county: territory.emblem, barony: '', seat: '' }
  });
}

export const BLAITHNEACH_HOUSE_PROFILES = Object.freeze(Object.fromEntries(
  BLAITHNEACH_HOUSE_DEFINITIONS.map(definition => [definition.familyId, createBlaithneachHouseProfile(definition)])
));

// Weitere territoriale Sicht auf vorhandene Akten; keine Änderung ihrer Genealogie.
export const BLAITHNEACH_ADDITIONAL_PLACEMENTS = Object.freeze(Object.fromEntries(
  BLAITHNEACH_HOUSE_DEFINITIONS.filter(definition => !definition.createFamily).map(definition => [
    definition.familyId, Object.freeze([Object.freeze({
      title: definition.title,
      houseProfile: BLAITHNEACH_HOUSE_PROFILES[definition.familyId],
      sourceNote: definition.sourceNote,
      sourceInventory: 'assets/data/source-inventories/blaithneach-2026-10-07.json'
    })])
  ])
));
