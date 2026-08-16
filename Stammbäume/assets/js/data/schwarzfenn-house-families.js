import {
  createExtinctPlaceholderHouseFamily,
  createFounderPlaceholderHouseFamily
} from './blank-house-family-factory.js';
import {
  SCHWARZFENN_EXTINCT_HOUSE_GROUPS,
  SCHWARZFENN_HOUSE_EMBLEMS,
  SCHWARZFENN_HOUSE_PROFILES
} from './schwarzfenn-house-profiles.js';
import { HOUSE_HELGR_FAMILY } from './house-helgr-family.js';
import { HOUSE_EISBRAND_FAMILY } from './house-eisbrand-family.js';
import { HOUSE_TODBRAND_FAMILY } from './house-todbrand-family.js';
import { HOUSE_GRAUMAHNE_FAMILY } from './house-graumahne-family.js';
import { HOUSE_SCHMETTERSCHILD_FAMILY } from './house-schmetterschild-family.js';
import { HOUSE_HRAFN_FAMILY } from './house-hrafn-family.js';
import { HOUSE_KUMMERHERZ_FAMILY } from './house-kummerherz-family.js';
import { HOUSE_ARNVILD_FAMILY } from './house-arnvild-family.js';

export const SCHWARZFENN_ACTIVE_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'helgr', title: 'Clan Helgr', rank: 'Thane', territory: 'Finstermoor' }),
  Object.freeze({ slug: 'kummerherz', title: 'Clan Kummerherz', rank: 'Thane', territory: 'Trauerwald' }),
  Object.freeze({ slug: 'todbrand', title: 'Clan Todbrand', rank: 'Thane', territory: 'Dunkelmoor' }),
  Object.freeze({ slug: 'graumahne', title: 'Clan Graumähne', rank: 'Hesire', territory: 'Wolfsklamm' }),
  Object.freeze({ slug: 'schmetterschild', title: 'Clan Schmetterschild', rank: 'Hesire', territory: 'Wolfsklamm' }),
  Object.freeze({ slug: 'hrafn', title: 'Clan Hrafn', rank: 'Hesire', territory: 'Flusswall' })
]);

export const SCHWARZFENN_EXTINCT_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({
    slug: 'svartholmr',
    title: 'Clan Svartholmr',
    place: 'Stornborg',
    group: SCHWARZFENN_EXTINCT_HOUSE_GROUPS.norrnaigh,
    culture: 'Norrnaigh'
  }),
  Object.freeze({
    slug: 'arnvild',
    title: 'Clan Arnvild',
    place: 'Flusswall',
    group: SCHWARZFENN_EXTINCT_HOUSE_GROUPS.aldrimar,
    culture: 'Aldrimarer',
    recentlyExtinct: true
  }),
  Object.freeze({
    slug: 'mac-bronaigh',
    title: 'Clan Mac Bronaigh',
    place: 'Coil na Bróin',
    group: SCHWARZFENN_EXTINCT_HOUSE_GROUPS.crannath,
    culture: 'Crannath'
  })
]);

export const SCHWARZFENN_OUTLAW_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({
    slug: 'eisbrand',
    title: 'Haus Eisbrand',
    rank: 'Nicht anerkanntes Bastard- und Banditenhaus',
    territory: 'Hallsvalr'
  })
]);

function withManagedSource(base, extensions = {}) {
  return Object.freeze({
    ...base,
    lineage: Object.freeze({ ...base.lineage, crestFrame: 'gold' }),
    extensions: Object.freeze({
      ...base.extensions,
      ...extensions,
      sourceRevision: 1,
      registryManagedHouseProfileFields: Object.freeze([
        'rankId',
        'seat',
        'barony',
        'county',
        'kingdom',
        'secondarySeats',
        'liegeHouseId',
        'liegeHouseName',
        'regionEmblems'
      ]),
      registryManagedRecordFields: Object.freeze(['folderPath'])
    })
  });
}

function activeHouseFamily(definition) {
  if (definition.slug === 'helgr') return HOUSE_HELGR_FAMILY;
  if (definition.slug === 'kummerherz') return HOUSE_KUMMERHERZ_FAMILY;
  if (definition.slug === 'todbrand') return HOUSE_TODBRAND_FAMILY;
  if (definition.slug === 'graumahne') return HOUSE_GRAUMAHNE_FAMILY;
  if (definition.slug === 'schmetterschild') return HOUSE_SCHMETTERSCHILD_FAMILY;
  if (definition.slug === 'hrafn') return HOUSE_HRAFN_FAMILY;

  const base = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: SCHWARZFENN_HOUSE_EMBLEMS[definition.slug],
    houseProfile: SCHWARZFENN_HOUSE_PROFILES[definition.slug],
    description: `Vorbereitete Familienakte des ${definition.rank}-Geschlechts ${definition.title.replace('Clan ', '')} aus ${definition.territory} im Jarltum Schwarzfenn.`
  });
  return withManagedSource(base, {
    preparedMainLine: true,
    jarltum: 'Schwarzfenn',
    aldrimarRank: definition.rank
  });
}

function extinctHouseFamily(definition) {
  if (definition.slug === 'arnvild') return HOUSE_ARNVILD_FAMILY;

  const extinctionDescription = definition.recentlyExtinct
    ? 'ein erst kürzlich ausradiertes aldrimarisches Haus'
    : definition.culture === 'Crannath'
      ? 'ein antiker, erloschener Crannath-Clan'
      : `ein erloschener ${definition.culture}-Clan`;
  const base = createExtinctPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: SCHWARZFENN_HOUSE_EMBLEMS[definition.slug],
    houseProfile: SCHWARZFENN_HOUSE_PROFILES[definition.slug],
    description: `Vorbereitete historische Familienakte für ${definition.title}, ${extinctionDescription} aus ${definition.place} im Jarltum Schwarzfenn.`
  });
  return withManagedSource(base, {
    extinctHouse: true,
    jarltum: 'Schwarzfenn',
    extinctCulture: definition.culture,
    extinctGroup: definition.group,
    ...(definition.recentlyExtinct ? { recentlyExtinct: true } : {})
  });
}

function outlawHouseFamily(definition) {
  if (definition.slug === 'eisbrand') return HOUSE_EISBRAND_FAMILY;
  throw new Error(`Unbekannte Schwarzfenn-Banditenakte: ${definition.slug}`);
}

export const SCHWARZFENN_DEPENDENT_HOUSE_FAMILIES = Object.freeze([
  ...SCHWARZFENN_ACTIVE_HOUSE_DEFINITIONS.map(activeHouseFamily),
  ...SCHWARZFENN_OUTLAW_HOUSE_DEFINITIONS.map(outlawHouseFamily),
  ...SCHWARZFENN_EXTINCT_HOUSE_DEFINITIONS.map(extinctHouseFamily)
]);
