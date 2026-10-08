import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { FAELAORN_EMBLEM, FAELAORN_TERRITORIES, FAELAORN_HOUSE_DEFINITIONS, FAELAORN_ADDITIONAL_PLACEMENT_SOURCES } from './faelaorn-territorial-catalog.js';

const territories = new Map(FAELAORN_TERRITORIES.map(territory => [territory.id, territory]));
const definitions = new Map(FAELAORN_HOUSE_DEFINITIONS.map(definition => [definition.familyId, definition]));

function primaryProfile(definition) {
  const territory = territories.get(definition.territoryId);
  const liegeId = definition.liegeFamilyId || (definition.extinct || definition.kind === 'sept' || definition.rankId === 'ard-tiarna'
    ? '' : definition.rankId === 'mor-tiarna' ? 'haus-urquhart' : territory.rulingFamilyId);
  const liege = definitions.get(liegeId);
  return createHouseProfileFromFolderPath(['Faelaorn', territory.name], {
    rankId: definition.rankId, seat: definition.seat,
    liegeHouseId: liege?.familyId || '', liegeHouseName: liege?.title || '',
    folderIcons: [FAELAORN_EMBLEM, territory.emblem, ''],
    regionEmblems: { kingdom: FAELAORN_EMBLEM, county: territory.emblem, barony: '', seat: '' }
  });
}

export const FAELAORN_HOUSE_PROFILES = Object.freeze(Object.fromEntries(
  FAELAORN_HOUSE_DEFINITIONS.map(definition => [definition.familyId, primaryProfile(definition)])
));

function additionalPlacement(source) {
  const definition = definitions.get(source.familyId);
  const territory = territories.get(source.territoryId);
  const primary = FAELAORN_HOUSE_PROFILES[source.familyId];
  const folderPath = ['Faelaorn', territory.name,
    source.role === 'asylum' ? 'Clans im Asyl' : 'Exklaven', ...[source.seat].filter(Boolean)];
  const houseProfile = createHouseProfileFromFolderPath(['Faelaorn', territory.name], {
    rankId: primary.rankId, seat: source.seat,
    liegeHouseId: source.role === 'asylum' ? '' : primary.liegeHouseId,
    liegeHouseName: source.role === 'asylum' ? '' : primary.liegeHouseName,
    folderIcons: [FAELAORN_EMBLEM, territory.emblem, '', ''],
    regionEmblems: { kingdom: FAELAORN_EMBLEM, county: territory.emblem, barony: '', seat: '' }
  });
  return Object.freeze({
    title: definition.title, role: source.role, folderPath: Object.freeze(folderPath), houseProfile,
    sourceNote: source.sourceNote, territorialSource: source.source,
    sourceInventory: 'assets/data/source-inventories/faelaorn-2026-10-08.json'
  });
}

export const FAELAORN_ADDITIONAL_PLACEMENTS = Object.freeze(Object.fromEntries(
  FAELAORN_HOUSE_DEFINITIONS.map(definition => [definition.familyId, Object.freeze(
    FAELAORN_ADDITIONAL_PLACEMENT_SOURCES.filter(source => source.familyId === definition.familyId).map(additionalPlacement)
  )])
));
