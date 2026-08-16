import {
  createExtinctPlaceholderHouseFamily,
  createFounderPlaceholderHouseFamily
} from './blank-house-family-factory.js';
import {
  IVARSHEIM_EXTINCT_HOUSE_GROUPS,
  IVARSHEIM_HOUSE_EMBLEMS,
  IVARSHEIM_HOUSE_PROFILES
} from './ivarsheim-house-profiles.js';
import { HOUSE_FEUERHAAR_FAMILY } from './house-feuerhaar-family.js';
import { HOUSE_GRENDEL_FAMILY } from './house-grendel-family.js';
import { HOUSE_HYRMGARTHR_FAMILY } from './house-hyrmgarthr-family.js';
import { HOUSE_SILBERZUNGE_FAMILY } from './house-silberzunge-family.js';
import { HOUSE_SKOGG_FAMILY } from './house-skogg-family.js';
import {
  HOUSE_TRACHWYLL_IVARSFELS_FAMILY,
  HOUSE_TRACHWYLL_TALFRONWYN_FAMILY
} from './house-trachwyll-family.js';

export const IVARSHEIM_ACTIVE_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'feuerhaar', title: 'Clan Feuerhaar', rank: 'Thane', territory: 'Jägersruh' }),
  Object.freeze({ slug: 'skogg', title: 'Clan Skogg', rank: 'Thane', territory: 'Kornweiler' }),
  Object.freeze({ slug: 'silberzunge', title: 'Clan Silberzunge', rank: 'Hesire', territory: 'Ivarsfels' }),
  Object.freeze({ slug: 'trachwyll', title: 'Haus Trachwyll', rank: 'Hesire', territory: 'Ivarsfels' }),
  Object.freeze({ slug: 'grendel', title: 'Clan Grendel', rank: 'Hesire', territory: 'Hjerimsheim' }),
  Object.freeze({
    slug: 'hyrmgardr',
    title: 'Clan Hyrmgarthr',
    rank: 'Hesire',
    territory: 'Winterfeste',
    description: 'Vorbereitete Familienakte des Hesirenclans Hyrmgarthr aus Winterfeste. Winterwacht ist eine eigene Unterherrschaft des Thanentums Saatgrund und steht als Vasall unter Clan Skogg.'
  })
]);

export const IVARSHEIM_EXTINCT_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({
    slug: 'blutklinge',
    title: 'Haus Blutklinge',
    place: 'Ivarsfels',
    group: IVARSHEIM_EXTINCT_HOUSE_GROUPS.aldrimar,
    culture: 'Aldrimarer',
    recentlyExtinct: true
  }),
  Object.freeze({
    slug: 'windhueter',
    title: 'Haus Windhüter',
    place: 'Ivarsfels',
    group: IVARSHEIM_EXTINCT_HOUSE_GROUPS.aldrimar,
    culture: 'Aldrimarer',
    recentlyExtinct: true
  }),
  Object.freeze({
    slug: 'morkvard',
    title: 'Haus Morkvard',
    place: 'einem unbekannten Ort',
    group: IVARSHEIM_EXTINCT_HOUSE_GROUPS.norrnaigh,
    culture: 'Norrnaigh'
  }),
  Object.freeze({
    slug: 'mac-luin',
    title: 'Haus Mac Luin',
    place: 'Ard Eabhraig',
    group: IVARSHEIM_EXTINCT_HOUSE_GROUPS.glaennath,
    culture: 'Glaennath'
  }),
  Object.freeze({
    slug: 'an-borach',
    title: 'Haus An Borach',
    place: 'Kornweiler',
    group: IVARSHEIM_EXTINCT_HOUSE_GROUPS.glaennath,
    culture: 'Glaennath'
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
  const base = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: IVARSHEIM_HOUSE_EMBLEMS[definition.slug],
    houseProfile: IVARSHEIM_HOUSE_PROFILES[definition.slug],
    description: definition.description
      || `Vorbereitete Familienakte des ${definition.rank}-Geschlechts ${definition.title.replace(/^(Clan|Haus) /, '')} aus ${definition.territory} im Jarltum Ivarsheim.`
  });
  return withManagedSource(base, {
    preparedMainLine: true,
    jarltum: 'Ivarsheim',
    aldrimarRank: definition.rank,
    ...(definition.slug === 'trachwyll'
      ? { originFamilyId: 'haus-trachwyll-talfronwyn' }
      : {})
  });
}

function extinctHouseFamily(definition) {
  const extinctionDescription = definition.recentlyExtinct
    ? 'ein erst kürzlich erloschenes aldrimarisches Haus'
    : `ein erloschenes ${definition.culture}-Haus`;
  const base = createExtinctPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: IVARSHEIM_HOUSE_EMBLEMS[definition.slug],
    houseProfile: IVARSHEIM_HOUSE_PROFILES[definition.slug],
    description: `Vorbereitete historische Familienakte für ${definition.title}, ${extinctionDescription} aus ${definition.place} im Jarltum Ivarsheim.`
  });
  return withManagedSource(base, {
    extinctHouse: true,
    jarltum: 'Ivarsheim',
    extinctCulture: definition.culture,
    extinctGroup: definition.group,
    ...(definition.recentlyExtinct ? { recentlyExtinct: true } : {})
  });
}

export const IVARSHEIM_DEPENDENT_HOUSE_FAMILIES = Object.freeze([
  ...IVARSHEIM_ACTIVE_HOUSE_DEFINITIONS.map(definition => (
    definition.slug === 'feuerhaar'
      ? HOUSE_FEUERHAAR_FAMILY
      : definition.slug === 'skogg'
        ? HOUSE_SKOGG_FAMILY
        : definition.slug === 'silberzunge'
          ? HOUSE_SILBERZUNGE_FAMILY
          : definition.slug === 'trachwyll'
            ? HOUSE_TRACHWYLL_IVARSFELS_FAMILY
            : definition.slug === 'grendel'
              ? HOUSE_GRENDEL_FAMILY
              : definition.slug === 'hyrmgardr'
                ? HOUSE_HYRMGARTHR_FAMILY
                : activeHouseFamily(definition)
  )),
  ...IVARSHEIM_EXTINCT_HOUSE_DEFINITIONS.map(extinctHouseFamily)
]);

export const IVARSHEIM_ORIGIN_HOUSE_FAMILIES = Object.freeze([
  HOUSE_TRACHWYLL_TALFRONWYN_FAMILY
]);
