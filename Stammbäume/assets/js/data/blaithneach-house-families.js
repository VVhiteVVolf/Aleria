import { createTerritorialBlankFamily } from './territorial-family-factory.js';
import { BLAITHNEACH_HOUSE_DEFINITIONS } from './blaithneach-territorial-catalog.js';
import { BLAITHNEACH_HOUSE_PROFILES } from './blaithneach-house-profiles.js';
import { BLAITHNEACH_SOURCE_FAMILIES } from './blaithneach-source-families.js';

const sources = new Map(BLAITHNEACH_SOURCE_FAMILIES.map(family => [family.document.id, family]));

export const BLAITHNEACH_HOUSE_FAMILIES = Object.freeze(BLAITHNEACH_HOUSE_DEFINITIONS
  .filter(definition => definition.createFamily)
  .map(definition => sources.get(definition.familyId) || createTerritorialBlankFamily({
    definition, houseProfile: BLAITHNEACH_HOUSE_PROFILES[definition.familyId], principality: 'Blaithneach',
    sourceInventory: 'assets/data/source-inventories/blaithneach-2026-10-07.json'
  })));
