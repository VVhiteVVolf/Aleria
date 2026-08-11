import {
  createExtinctPlaceholderHouseFamily,
  createFounderPlaceholderHouseFamily
} from './blank-house-family-factory.js';
import {
  RORIKSHEIM_HOUSE_EMBLEMS,
  RORIKSHEIM_HOUSE_PROFILES
} from './roriksheim-house-profiles.js';
import { HOUSE_BRATHFENGR_FAMILY } from './house-brathfengr-family.js';
import { HOUSE_FREIWINTER_FAMILY } from './house-freiwinter-family.js';
import { HOUSE_FROSTGEBORENE_FAMILY } from './house-frostgeborene-family.js';
import { HOUSE_EISENJUNGFER_FAMILY } from './house-eisenjungfer-family.js';
import { HOUSE_KAMPFGEBORENE_FAMILY } from './house-kampfgeborene-family.js';
import { HOUSE_NACHTJAEGER_FAMILY } from './house-nachtjaeger-family.js';
import { HOUSE_SCHWARZDORN_FAMILY } from './house-schwarzdorn-family.js';
import { HOUSE_SKAAL_FAMILY } from './house-skaal-family.js';
import { HOUSE_SKALD_FAMILY } from './house-skald-family.js';
import { HOUSE_SKJEGG_FAMILY } from './house-skjegg-family.js';
import { HOUSE_SOEKEREN_FAMILY } from './house-soekeren-family.js';
import { HOUSE_STERKR_FAMILY } from './house-sterkr-family.js';
import { HOUSE_VANGANDR_FAMILY } from './house-vangandr-family.js';

export const RORIKSHEIM_ACTIVE_CLAN_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'schwarzdorn', title: 'Clan Schwarzdorn', rank: 'Hesire', territory: 'Rorikshall' }),
  Object.freeze({ slug: 'kampfgeborene', title: 'Clan Kampfgeborene', rank: 'Hesire', territory: 'Rorikshall' }),
  Object.freeze({ slug: 'brathfengr', title: 'Clan Brathfengr', rank: 'Thane', territory: 'Klangheim' }),
  Object.freeze({ slug: 'sterkr', title: 'Clan Sterkr', rank: 'Hesire', territory: 'Klangheim' }),
  Object.freeze({ slug: 'soekeren', title: 'Clan Sökeren', rank: 'Hesire', territory: 'Klangheim' }),
  Object.freeze({ slug: 'skald', title: 'Clan Skald', rank: 'Hesire', territory: 'Klangheim' }),
  Object.freeze({ slug: 'vangandr', title: 'Clan Vangandr', rank: 'Thane', territory: 'Wolfspfad' }),
  Object.freeze({ slug: 'nachtjaeger', title: 'Clan Nachtjäger', rank: 'Hesire', territory: 'Horunn' }),
  Object.freeze({ slug: 'skaal', title: 'Clan Skaal', rank: 'Thane', territory: 'Schwertfall' }),
  Object.freeze({ slug: 'skjegg', title: 'Clan Skjegg', rank: 'Hesire', territory: 'Grabesruh' }),
  Object.freeze({ slug: 'freiwinter', title: 'Clan Freiwinter', rank: 'Hesire', territory: 'Wolfswacht' })
]);

export const RORIKSHEIM_HUSKARL_CLAN_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'gruenklang', title: 'Clan Grünklang', territory: 'Klangheim' }),
  Object.freeze({ slug: 'flammenschritt', title: 'Clan Flammenschritt', territory: 'Klangheim' }),
  Object.freeze({ slug: 'runensaenger', title: 'Clan Runensänger', territory: 'Klangheim' }),
  Object.freeze({ slug: 'sturmsaenger', title: 'Clan Sturmsänger', territory: 'Klangheim' }),
  Object.freeze({ slug: 'liedtrinker', title: 'Clan Liedtrinker', territory: 'Klangheim' }),
  Object.freeze({ slug: 'spottzunge', title: 'Clan Spottzunge', territory: 'Klangheim' }),
  Object.freeze({ slug: 'eisenjungfer', title: 'Clan Eisenjungfer', territory: 'Klangheim' }),
  Object.freeze({ slug: 'blutdorn', title: 'Clan Blutdorn', territory: 'Rorikshall' }),
  Object.freeze({ slug: 'dornacker', title: 'Clan Dornacker', territory: 'Rorikshall' }),
  Object.freeze({ slug: 'baerenherz', title: 'Clan Bärenherz', territory: 'Rorikshall' }),
  Object.freeze({ slug: 'kraehenrufer', title: 'Clan Krähenrufer', territory: 'Rorikshall' }),
  Object.freeze({ slug: 'unholdbann', title: 'Clan Unholdbann', territory: 'Rorikshall' }),
  Object.freeze({ slug: 'rotstahl', title: 'Clan Rotstahl', territory: 'Rorikshall' }),
  Object.freeze({ slug: 'bogenhand', title: 'Clan Bogenhand', territory: 'Rorikshall' })
]);

export const RORIKSHEIM_EXTINCT_CLAN_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'ulvasar', title: 'Clan Ulvasar', culture: 'Norrnaigh' }),
  Object.freeze({ slug: 'bjornskar', title: 'Clan Bjornskar', culture: 'Norrnaigh' }),
  Object.freeze({ slug: 'vanir', title: 'Clan Vanir', culture: 'Norrnaigh', successorFamilyId: 'haus-vangandr' }),
  Object.freeze({ slug: 'tiogar', title: 'Clan Tíogar', culture: 'Glaennath' }),
  Object.freeze({ slug: 'fiadhrach', title: 'Clan Fiadhrach', culture: 'Glaennath' })
]);

export const RORIKSHEIM_CIVIL_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'frostgeborene', title: 'Haus Frostgeborene', rank: 'Bürgerfamilie', territory: 'Rorikshall' })
]);

function withManagedCrest(base, extensions, crestFrame) {
  return Object.freeze({
    ...base,
    lineage: Object.freeze({ ...base.lineage, crestFrame }),
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

function withGoldCrest(base, extensions) {
  return withManagedCrest(base, extensions, 'gold');
}

function activeClanFamily(definition) {
  const base = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: RORIKSHEIM_HOUSE_EMBLEMS[definition.slug],
    houseProfile: RORIKSHEIM_HOUSE_PROFILES[definition.slug],
    description: `Vorbereitete Familienakte des ${definition.rank}-Clans ${definition.title.replace(/^Clan /, '')} aus ${definition.territory} im Jarltum Roriksheim. Nachkommen und Quellenlücken werden erst bei der gesonderten Ausarbeitung dieses Clans ergänzt.`
  });
  return withGoldCrest(base, {
    preparedMainLine: true,
    jarltum: 'Roriksheim',
    aldrimarRank: definition.rank
  });
}

function huskarlClanFamily(definition) {
  const base = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: RORIKSHEIM_HOUSE_EMBLEMS[definition.slug],
    houseProfile: RORIKSHEIM_HOUSE_PROFILES[definition.slug],
    description: `Vorbereitete Familienakte des Huskarlclans ${definition.title.replace(/^Clan /, '')} aus ${definition.territory} im Jarltum Roriksheim. Nachkommen und Quellenlücken werden erst bei der gesonderten Ausarbeitung dieses Clans ergänzt.`
  });
  return withManagedCrest(base, {
    preparedMainLine: true,
    jarltum: 'Roriksheim',
    aldrimarRank: 'Huskarl'
  }, 'silver');
}

function extinctClanFamily(definition) {
  const base = createExtinctPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: RORIKSHEIM_HOUSE_EMBLEMS[definition.slug],
    houseProfile: RORIKSHEIM_HOUSE_PROFILES[definition.slug],
    description: `Vorbereitete historische Familienakte des ausgestorbenen ${definition.culture}-Clans ${definition.title.replace(/^Clan /, '')} aus Roriksheim.`
  });
  return withGoldCrest(base, {
    extinctCulture: definition.culture,
    ...(definition.successorFamilyId ? { successorFamilyId: definition.successorFamilyId } : {})
  });
}

export const RORIKSHEIM_DEPENDENT_HOUSE_FAMILIES = Object.freeze([
  ...RORIKSHEIM_ACTIVE_CLAN_DEFINITIONS.map(definition => {
    if (definition.slug === 'schwarzdorn') return HOUSE_SCHWARZDORN_FAMILY;
    if (definition.slug === 'kampfgeborene') return HOUSE_KAMPFGEBORENE_FAMILY;
    if (definition.slug === 'brathfengr') return HOUSE_BRATHFENGR_FAMILY;
    if (definition.slug === 'freiwinter') return HOUSE_FREIWINTER_FAMILY;
    if (definition.slug === 'nachtjaeger') return HOUSE_NACHTJAEGER_FAMILY;
    if (definition.slug === 'skaal') return HOUSE_SKAAL_FAMILY;
    if (definition.slug === 'skald') return HOUSE_SKALD_FAMILY;
    if (definition.slug === 'skjegg') return HOUSE_SKJEGG_FAMILY;
    if (definition.slug === 'soekeren') return HOUSE_SOEKEREN_FAMILY;
    if (definition.slug === 'sterkr') return HOUSE_STERKR_FAMILY;
    if (definition.slug === 'vangandr') return HOUSE_VANGANDR_FAMILY;
    return activeClanFamily(definition);
  }),
  ...RORIKSHEIM_HUSKARL_CLAN_DEFINITIONS.map(definition => (
    definition.slug === 'eisenjungfer'
      ? HOUSE_EISENJUNGFER_FAMILY
      : huskarlClanFamily(definition)
  )),
  ...RORIKSHEIM_CIVIL_HOUSE_DEFINITIONS.map(definition => {
    if (definition.slug === 'frostgeborene') return HOUSE_FROSTGEBORENE_FAMILY;
    return activeClanFamily(definition);
  }),
  ...RORIKSHEIM_EXTINCT_CLAN_DEFINITIONS.map(extinctClanFamily)
]);
