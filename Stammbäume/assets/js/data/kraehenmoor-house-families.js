import {
  createExtinctPlaceholderHouseFamily,
  createFounderPlaceholderHouseFamily
} from './blank-house-family-factory.js';
import { HOUSE_HJERTE_FAMILY } from './house-hjerte-family.js';
import { HOUSE_JAERNBLOD_FAMILY } from './house-jaernblod-family.js';
import { HOUSE_BLUTSTAHL_FAMILY } from './house-blutstahl-family.js';
import { HOUSE_FEUERHERZ_FAMILY } from './house-feuerherz-family.js';
import { HOUSE_GOLDGLANZ_FAMILY } from './house-goldglanz-family.js';
import { HOUSE_KALTHERZ_FAMILY } from './house-kaltherz-family.js';
import { HOUSE_SCHATTENHERZ_FAMILY } from './house-schattenherz-family.js';
import { HOUSE_SCHWARZBLUT_FAMILY } from './house-schwarzblut-family.js';
import { HOUSE_SCHWARZSTOLZ_FAMILY } from './house-schwarzstolz-family.js';
import { HOUSE_SILBERBLUT_FAMILY } from './house-silberblut-family.js';
import { HOUSE_VRAGI_FAMILY } from './house-vragi-family.js';
import {
  KRAEHENMOOR_HOUSE_EMBLEMS,
  KRAEHENMOOR_HOUSE_PROFILES
} from './kraehenmoor-house-profiles.js';

export const KRAEHENMOOR_ACTIVE_CLAN_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'schattenherz', title: 'Clan Schattenherz', rank: 'Thane', territory: 'Rabenfurt', sourceFamilyId: 'haus-hjerte' }),
  Object.freeze({ slug: 'blutstahl', title: 'Clan Blutstahl', rank: 'Thane', territory: 'Silberquell', sourceFamilyId: 'haus-jaernblod' }),
  Object.freeze({ slug: 'silberblut', title: 'Clan Silberblut', rank: 'Thane', territory: 'Silberquell', sourceFamilyId: 'haus-jaernblod' }),
  Object.freeze({ slug: 'kaltherz', title: 'Clan Kaltherz', rank: 'Hesire', territory: 'Moortal', sourceFamilyId: 'haus-hjerte' }),
  Object.freeze({ slug: 'feuerherz', title: 'Clan Feuerherz', rank: 'Hesire', territory: 'Moortal', sourceFamilyId: 'haus-hjerte' }),
  Object.freeze({ slug: 'vragi', title: 'Clan Vragi', rank: 'Hesire', territory: 'Rabenhain' }),
  Object.freeze({ slug: 'schwarzblut', title: 'Clan Schwarzblut', rank: 'Hesire', territory: 'Nebelwacht', sourceFamilyId: 'haus-jaernblod' }),
  Object.freeze({ slug: 'goldglanz', title: 'Clan Goldglanz', rank: 'Hesire', territory: 'Silberquell' })
]);

export const KRAEHENMOOR_HUSKARL_CLAN_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'goldschwur', title: 'Clan Goldschwur', liege: 'Clan Varangr' }),
  Object.freeze({ slug: 'goldhand', title: 'Clan Goldhand', liege: 'Clan Varangr' }),
  Object.freeze({ slug: 'guldskar', title: 'Clan Guldskar', liege: 'Clan Varangr' }),
  Object.freeze({ slug: 'aurangr', title: 'Clan Aurangr', liege: 'Clan Varangr' }),
  Object.freeze({ slug: 'fenngrim', title: 'Clan Fenngrim', liege: 'Clan Feuerherz' }),
  Object.freeze({ slug: 'brackwasser', title: 'Clan Brackwasser', liege: 'Clan Feuerherz' }),
  Object.freeze({ slug: 'sumpfgeborener', title: 'Clan Sumpfgeborener', liege: 'Clan Feuerherz' }),
  Object.freeze({ slug: 'helmyr', title: 'Clan Helmyr', liege: 'Clan Kaltherz' }),
  Object.freeze({ slug: 'taufwolf', title: 'Clan Taufwolf', liege: 'Clan Kaltherz' }),
  Object.freeze({ slug: 'myrskarn', title: 'Clan Myrskarn', liege: 'Clan Kaltherz' })
]);

export const KRAEHENMOOR_CIVIL_CLAN_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'goldzunge', title: 'Clan Goldzunge', territory: 'Moortal' })
]);

export const KRAEHENMOOR_EXTINCT_CLAN_DEFINITIONS = Object.freeze([
  Object.freeze({
    slug: 'hjerte',
    title: 'Clan Hjerte',
    culture: 'Norrnaigh',
    successorFamilyIds: Object.freeze([
      'haus-kummerherz',
      'haus-schattenherz',
      'haus-feuerherz',
      'haus-kaltherz'
    ])
  }),
  Object.freeze({
    slug: 'jaernblod',
    title: 'Clan Järnblod',
    culture: 'Norrnaigh',
    successorFamilyIds: Object.freeze([
      'haus-blutstahl',
      'haus-silberblut',
      'haus-schwarzblut'
    ])
  }),
  Object.freeze({ slug: 'kaldhrafn', title: 'Clan Kaldhrafn', culture: 'Norrnaigh', successorFamilyIds: Object.freeze([]) }),
  Object.freeze({ slug: 'mac-morfhia', title: 'Clan Mac Môrfhia', culture: 'Glaennath', successorFamilyIds: Object.freeze([]) }),
  Object.freeze({ slug: 'mac-corcaigh', title: 'Clan Mac Corcaigh', culture: 'Glaennath', successorFamilyIds: Object.freeze([]) })
]);

const MANAGED_PROFILE_FIELDS = Object.freeze([
  'rankId',
  'seat',
  'barony',
  'county',
  'kingdom',
  'secondarySeats',
  'liegeHouseId',
  'liegeHouseName',
  'liegeHouses',
  'folderIcons',
  'regionEmblems'
]);

function withManagedCrest(base, extensions, crestFrame) {
  return Object.freeze({
    ...base,
    lineage: Object.freeze({ ...base.lineage, crestFrame }),
    extensions: Object.freeze({
      ...base.extensions,
      ...extensions,
      sourceRevision: 1,
      registryManagedHouseProfileFields: MANAGED_PROFILE_FIELDS,
      registryManagedRecordFields: Object.freeze(['folderPath'])
    })
  });
}

function activeClanFamily(definition) {
  if (definition.slug === 'schattenherz') return HOUSE_SCHATTENHERZ_FAMILY;
  if (definition.slug === 'blutstahl') return HOUSE_BLUTSTAHL_FAMILY;
  if (definition.slug === 'silberblut') return HOUSE_SILBERBLUT_FAMILY;
  if (definition.slug === 'kaltherz') return HOUSE_KALTHERZ_FAMILY;
  if (definition.slug === 'feuerherz') return HOUSE_FEUERHERZ_FAMILY;
  if (definition.slug === 'goldglanz') return HOUSE_GOLDGLANZ_FAMILY;
  if (definition.slug === 'vragi') return HOUSE_VRAGI_FAMILY;
  if (definition.slug === 'schwarzblut') return HOUSE_SCHWARZBLUT_FAMILY;
  const base = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: KRAEHENMOOR_HOUSE_EMBLEMS[definition.slug],
    houseProfile: KRAEHENMOOR_HOUSE_PROFILES[definition.slug],
    description: `Vorbereitete Familienakte des ${definition.rank}-Clans ${definition.title.replace(/^Clan /, '')} aus ${definition.territory} im Jarltum Krähenmoor. Nachkommen und Quellenlücken werden erst bei der gesonderten Ausarbeitung dieses Clans ergänzt.`
  });
  return withManagedCrest(base, {
    preparedMainLine: true,
    jarltum: 'Krähenmoor',
    aldrimarRank: definition.rank,
    ...(definition.sourceFamilyId ? { sourceFamilyId: definition.sourceFamilyId } : {})
  }, 'gold');
}

function huskarlClanFamily(definition) {
  const base = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: KRAEHENMOOR_HOUSE_EMBLEMS[definition.slug],
    houseProfile: KRAEHENMOOR_HOUSE_PROFILES[definition.slug],
    description: `Vorbereitete Familienakte des Huskarlclans ${definition.title.replace(/^Clan /, '')}. Der Clan ist bei seinem Lehnshaus ${definition.liege} im gemeinsamen Sitz Moortal verzeichnet.`
  });
  return withManagedCrest(base, {
    preparedMainLine: true,
    jarltum: 'Krähenmoor',
    aldrimarRank: 'Huskarl'
  }, 'silver');
}

function civilClanFamily(definition) {
  const base = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: KRAEHENMOOR_HOUSE_EMBLEMS[definition.slug],
    houseProfile: KRAEHENMOOR_HOUSE_PROFILES[definition.slug],
    description: `Vorbereitete Familienakte des bürgerlichen Clans ${definition.title.replace(/^Clan /, '')} aus ${definition.territory} im Jarltum Krähenmoor.`
  });
  return withManagedCrest(base, {
    preparedMainLine: true,
    jarltum: 'Krähenmoor',
    aldrimarRank: 'Bürgerlich'
  }, 'iron');
}

function extinctClanFamily(definition) {
  if (definition.slug === 'hjerte') return HOUSE_HJERTE_FAMILY;
  if (definition.slug === 'jaernblod') return HOUSE_JAERNBLOD_FAMILY;
  const base = createExtinctPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: KRAEHENMOOR_HOUSE_EMBLEMS[definition.slug],
    houseProfile: KRAEHENMOOR_HOUSE_PROFILES[definition.slug],
    description: `Vorbereitete historische Familienakte des ausgestorbenen ${definition.culture}-Clans ${definition.title.replace(/^Clan /, '')} aus Krähenmoor.`
  });
  return withManagedCrest(base, {
    extinctHouse: true,
    extinctCulture: definition.culture,
    successorFamilyIds: definition.successorFamilyIds
  }, 'gold');
}

export const KRAEHENMOOR_DEPENDENT_HOUSE_FAMILIES = Object.freeze([
  HOUSE_SCHWARZSTOLZ_FAMILY,
  ...KRAEHENMOOR_ACTIVE_CLAN_DEFINITIONS.map(activeClanFamily),
  ...KRAEHENMOOR_HUSKARL_CLAN_DEFINITIONS.map(huskarlClanFamily),
  ...KRAEHENMOOR_CIVIL_CLAN_DEFINITIONS.map(civilClanFamily),
  ...KRAEHENMOOR_EXTINCT_CLAN_DEFINITIONS.map(extinctClanFamily)
]);
