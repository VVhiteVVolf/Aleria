import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { AISLEARNEACH_EMBLEM, AISLEARNEACH_HOUSE_DEFINITIONS, AISLEARNEACH_TERRITORIES } from './aislearneach-territorial-catalog.js';

function createAislearneachHouseProfile(definition) {
  const territory = AISLEARNEACH_TERRITORIES.find(entry => entry.id === definition.territoryId);
  const liegeId = definition.houseStatus === 'expelled' || definition.kind === 'sept' || definition.rankId === 'ard-tiarna'
    ? '' : definition.rankId === 'mor-tiarna' ? 'haus-morna' : territory.rulingFamilyId;
  const liege = AISLEARNEACH_HOUSE_DEFINITIONS.find(entry => entry.familyId === liegeId);
  const ecclesiasticalLiege = territory.administration === 'ecclesiastical' && definition.kind !== 'sept';
  return createHouseProfileFromFolderPath(['Aislearneach', territory.name], {
    rankId: definition.rankId, seat: definition.seat,
    liegeHouseId: liege?.familyId || '',
    liegeHouseName: liege?.title || (ecclesiasticalLiege ? 'Sagarth von Foraoise (kirchliche Oberherrschaft)' : ''),
    folderIcons: [AISLEARNEACH_EMBLEM, territory.emblem, ''],
    regionEmblems: { kingdom: AISLEARNEACH_EMBLEM, county: territory.emblem, barony: '', seat: '' }
  });
}

export const AISLEARNEACH_HOUSE_PROFILES = Object.freeze(Object.fromEntries(
  AISLEARNEACH_HOUSE_DEFINITIONS.map(definition => [definition.familyId, createAislearneachHouseProfile(definition)])
));
