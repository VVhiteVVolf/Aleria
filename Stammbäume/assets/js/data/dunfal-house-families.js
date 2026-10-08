import { createTerritorialBlankFamily } from './territorial-family-factory.js';
import { DUNFAL_HOUSE_DEFINITIONS } from './dunfal-territorial-catalog.js';
import { DUNFAL_HOUSE_PROFILES } from './dunfal-house-profiles.js';
import { DUNFAL_SOURCE_FAMILIES } from './dunfal-source-families.js';

const sourceFamilies = new Map(DUNFAL_SOURCE_FAMILIES.map(family => [family.document.id, family]));

export const DUNFAL_HOUSE_FAMILIES = Object.freeze(DUNFAL_HOUSE_DEFINITIONS.map(definition =>
  sourceFamilies.get(definition.familyId) || createTerritorialBlankFamily({
    definition, houseProfile: DUNFAL_HOUSE_PROFILES[definition.familyId], principality: 'Dunfal',
    sourceInventory: 'assets/data/source-inventories/dunfal-2026-10-07.json'
  })
));
