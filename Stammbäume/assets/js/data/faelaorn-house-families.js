import { createTerritorialBlankFamily } from './territorial-family-factory.js';
import { FAELAORN_HOUSE_DEFINITIONS, FAELAORN_WAR_CONTEXT } from './faelaorn-territorial-catalog.js';
import { FAELAORN_HOUSE_PROFILES, FAELAORN_ADDITIONAL_PLACEMENTS } from './faelaorn-house-profiles.js';
import { FAELAORN_SOURCE_FAMILIES } from './faelaorn-source-families.js';
import { MATHGHAM_SOURCE_FAMILIES } from './mathgham-source-families.js';
import { BRAIGH_SOURCE_FAMILIES } from './braigh-source-families.js';
import { FAERNA_SOURCE_FAMILIES } from './faerna-source-families.js';
import { DAMH_SOURCE_FAMILIES } from './damh-source-families.js';
import { BRANN_SOURCE_FAMILIES } from './brann-source-families.js';

const sources = new Map([...FAELAORN_SOURCE_FAMILIES, ...MATHGHAM_SOURCE_FAMILIES, ...BRAIGH_SOURCE_FAMILIES, ...FAERNA_SOURCE_FAMILIES, ...DAMH_SOURCE_FAMILIES, ...BRANN_SOURCE_FAMILIES].map(family => [family.document.id, family]));

export const FAELAORN_HOUSE_FAMILIES = Object.freeze(FAELAORN_HOUSE_DEFINITIONS.map(definition => {
  if (sources.has(definition.familyId)) return sources.get(definition.familyId);
  const family = createTerritorialBlankFamily({
    definition, houseProfile: FAELAORN_HOUSE_PROFILES[definition.familyId], principality: 'Faelaorn',
    sourceInventory: 'assets/data/source-inventories/faelaorn-2026-10-08.json'
  });
  return Object.freeze({
    ...family,
    document: Object.freeze({
      ...family.document,
      description: `${family.document.description} Faelaorn ist im Krieg mit Skjaerheim und etwa zur Hälfte übernommen. Die Einordnung folgt den alten Herrschaftsverhältnissen.`
    }),
    extensions: Object.freeze({
      ...family.extensions,
      faelaornWarContext: FAELAORN_WAR_CONTEXT,
      registryAdditionalPlacements: FAELAORN_ADDITIONAL_PLACEMENTS[definition.familyId]
    })
  });
}));
