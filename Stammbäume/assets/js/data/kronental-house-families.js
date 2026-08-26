import {
  createExtinctPlaceholderHouseFamily,
  createFounderPlaceholderHouseFamily
} from './blank-house-family-factory.js';
import {
  KRONENTAL_EXTINCT_CLAN_GROUPS,
  KRONENTAL_HOUSE_EMBLEMS,
  KRONENTAL_HOUSE_PROFILES
} from './kronental-house-profiles.js';
import { HOUSE_WELLENSCHILD_FAMILY } from './house-wellenschild-family.js';
import { HOUSE_EIBENSCHILD_FAMILY } from './house-eibenschild-family.js';
import { HOUSE_EISENBIEGER_FAMILY } from './house-eisenbieger-family.js';
import { HOUSE_FROSTAUGE_FAMILY } from './house-frostauge-family.js';
import { HOUSE_FROSTZORN_FAMILY } from './house-frostzorn-family.js';
import { HOUSE_GULLVIG_FAMILY } from './house-gullvig-family.js';
import { HOUSE_RIESENTOD_FAMILY } from './house-riesentod-family.js';
import { HOUSE_SPINDELSCHLAG_FAMILY } from './house-spindelschlag-family.js';
import { HOUSE_STURMGEBORENE_FAMILY } from './house-sturmgeborene-family.js';
import { HOUSE_SUEDSTAHL_FAMILY } from './house-suedstahl-family.js';
import { HOUSE_ALBHOLZ_FAMILY } from './house-albholz-family.js';
import { HOUSE_WELLENSAENGER_FAMILY } from './house-wellensaenger-family.js';

export const KRONENTAL_HESIRE_CLAN_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'riesentod', title: 'Clan Riesentod', territory: 'Heldenwacht' }),
  Object.freeze({ slug: 'eisenbieger', title: 'Clan Eisenbieger', territory: 'Heldenwacht' }),
  Object.freeze({ slug: 'sturmgeborene', title: 'Clan Sturmgeborene', territory: 'Heldenwacht' }),
  Object.freeze({ slug: 'frostauge', title: 'Clan Frostauge', territory: 'Heldenwacht' }),
  Object.freeze({ slug: 'wellenschild', title: 'Clan Wellenschild', territory: 'Klageschild-Inseln' }),
  Object.freeze({ slug: 'gullvig', title: 'Clan Gullvig', territory: 'Möwenfels' }),
  Object.freeze({ slug: 'wellensaenger', title: 'Clan Wellensänger', territory: 'Wellenklang' })
]);

export const KRONENTAL_HUSKARL_CLAN_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'eibenschild', title: 'Clan Eibenschild', territory: 'Vagaborg auf den Klageschild-Inseln' }),
  Object.freeze({ slug: 'suedstahl', title: 'Clan Südstahl', territory: 'Heldenwacht' }),
  Object.freeze({ slug: 'albholz', title: 'Clan Albholz', territory: 'Heldenwacht' }),
  Object.freeze({ slug: 'daemmerrufer', title: 'Clan Dämmerrufer', territory: 'Heldenwacht' }),
  Object.freeze({ slug: 'wellenkrone', title: 'Clan Wellenkrone', territory: 'Heldenwacht' }),
  Object.freeze({ slug: 'donnerblut', title: 'Clan Donnerblut', territory: 'Heldenwacht' }),
  Object.freeze({ slug: 'moorbrand', title: 'Clan Moorbrand', territory: 'Heldenwacht' }),
  Object.freeze({ slug: 'jormung', title: 'Clan Jormung', territory: 'Heldenwacht' }),
  Object.freeze({ slug: 'nidfengr', title: 'Clan Nidfengr', territory: 'Heldenwacht' }),
  Object.freeze({ slug: 'tarbhann', title: 'Clan Tarbhann', territory: 'Heldenwacht' }),
  Object.freeze({ slug: 'bjarnvarg', title: 'Clan Bjarnvarg', territory: 'Heldenwacht' }),
  Object.freeze({ slug: 'tauwind', title: 'Clan Tauwind', territory: 'Heldenwacht' })
]);

export const KRONENTAL_CIVIL_CLAN_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'spindelschlag', title: 'Clan Spindelschlag', territory: 'Spindelheim' }),
  Object.freeze({ slug: 'morchaon', title: 'Clan Morchaon' }),
  Object.freeze({ slug: 'hvelgrson', title: 'Clan Hvelgrson' })
]);

export const KRONENTAL_OUTLAW_CLAN_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'frostzorn', title: 'Clan Frostzorn', territory: 'Vintrefjord' })
]);

export const KRONENTAL_EXTINCT_CLAN_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'grimr', title: 'Clan Grimr', culture: 'Norrnaigh', group: KRONENTAL_EXTINCT_CLAN_GROUPS.norrnaigh, place: 'Torrenheim' }),
  Object.freeze({ slug: 'skaife', title: 'Clan Skaife', culture: 'Norrnaigh', group: KRONENTAL_EXTINCT_CLAN_GROUPS.norrnaigh, place: 'Torrenheim' }),
  Object.freeze({ slug: 'holmr', title: 'Clan Holmr', culture: 'Norrnaigh', group: KRONENTAL_EXTINCT_CLAN_GROUPS.norrnaigh, place: 'Torrenheim' }),
  Object.freeze({ slug: 'isvanyr', title: 'Clan Isvanyr', culture: 'Norrnaigh', group: KRONENTAL_EXTINCT_CLAN_GROUPS.norrnaigh, place: 'nicht überliefert' }),
  Object.freeze({ slug: 'mac-mamhar', title: 'Clan Mac Mamhar', culture: 'Glaennath', group: KRONENTAL_EXTINCT_CLAN_GROUPS.glaennath, place: 'nicht überliefert' })
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
  'folderIcons',
  'regionEmblems'
]);

const EMBLEM_SOURCE_REVISIONS = Object.freeze({
  donnerblut: 3,
  moorbrand: 3,
  jormung: 3,
  bjarnvarg: 3,
  tauwind: 3
});

function withManagedHouseEmblems(houses = []) {
  return Object.freeze(houses.map(house => Object.freeze({
    ...house,
    extensions: Object.freeze({
      ...house.extensions,
      registryManagedFields: Object.freeze([
        ...new Set([...(house.extensions?.registryManagedFields || []), 'emblem'])
      ])
    })
  })));
}

function withManagedSource(base, extensions, crestFrame, sourceRevision = 2) {
  return Object.freeze({
    ...base,
    houses: withManagedHouseEmblems(base.houses),
    lineage: Object.freeze({ ...base.lineage, crestFrame }),
    extensions: Object.freeze({
      ...base.extensions,
      ...extensions,
      sourceRevision,
      registryManagedDocumentFields: Object.freeze(['emblem']),
      registryManagedHouseProfileFields: MANAGED_PROFILE_FIELDS,
      registryManagedRecordFields: Object.freeze(['folderPath'])
    })
  });
}

function activeClanFamily(definition, rank, crestFrame) {
  const base = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: KRONENTAL_HOUSE_EMBLEMS[definition.slug],
    houseProfile: KRONENTAL_HOUSE_PROFILES[definition.slug],
    description: `Vorbereitete Familienakte des ${rank}-Clans ${definition.title.replace(/^Clan /, '')} aus ${definition.territory} im Königlichen Jarltum Kronental.`
  });
  return withManagedSource(base, {
    preparedMainLine: true,
    jarltum: 'Kronental',
    aldrimarRank: rank
  }, crestFrame, EMBLEM_SOURCE_REVISIONS[definition.slug] || 2);
}

function civilClanFamily(definition) {
  const base = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: KRONENTAL_HOUSE_EMBLEMS[definition.slug],
    houseProfile: KRONENTAL_HOUSE_PROFILES[definition.slug],
    description: `Vorbereitete Familienakte des bürgerlichen Clans ${definition.title.replace(/^Clan /, '')} aus dem Königlichen Jarltum Kronental. Der genaue Stammsitz ist in der Quelle noch nicht verzeichnet.`
  });
  return withManagedSource(base, {
    preparedMainLine: true,
    jarltum: 'Kronental',
    aldrimarRank: 'Bürgerlich'
  }, 'iron');
}

function outlawClanFamily(definition) {
  const base = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: KRONENTAL_HOUSE_EMBLEMS[definition.slug],
    houseProfile: KRONENTAL_HOUSE_PROFILES[definition.slug],
    description: `Vorbereitete Familienakte des abtrünnigen Clans ${definition.title.replace(/^Clan /, '')} aus ${definition.territory} im Königlichen Jarltum Kronental.`
  });
  return withManagedSource(base, {
    preparedMainLine: true,
    outlawHouse: true,
    jarltum: 'Kronental'
  }, 'iron');
}

function extinctClanFamily(definition) {
  const base = createExtinctPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: KRONENTAL_HOUSE_EMBLEMS[definition.slug],
    houseProfile: KRONENTAL_HOUSE_PROFILES[definition.slug],
    description: `Vorbereitete historische Familienakte des ausgestorbenen ${definition.culture}-Clans ${definition.title.replace(/^Clan /, '')}; letzter überlieferter Ort: ${definition.place}.`
  });
  return withManagedSource(base, {
    extinctHouse: true,
    extinctCulture: definition.culture,
    extinctGroup: definition.group,
    jarltum: 'Kronental'
  }, 'gold');
}

const SPECIAL_HESIRE_FAMILIES = Object.freeze({
  riesentod: HOUSE_RIESENTOD_FAMILY,
  eisenbieger: HOUSE_EISENBIEGER_FAMILY,
  sturmgeborene: HOUSE_STURMGEBORENE_FAMILY,
  frostauge: HOUSE_FROSTAUGE_FAMILY,
  wellenschild: HOUSE_WELLENSCHILD_FAMILY,
  gullvig: HOUSE_GULLVIG_FAMILY,
  wellensaenger: HOUSE_WELLENSAENGER_FAMILY
});

const SPECIAL_HUSKARL_FAMILIES = Object.freeze({
  eibenschild: HOUSE_EIBENSCHILD_FAMILY,
  suedstahl: HOUSE_SUEDSTAHL_FAMILY,
  albholz: HOUSE_ALBHOLZ_FAMILY
});

const SPECIAL_CIVIL_FAMILIES = Object.freeze({
  spindelschlag: HOUSE_SPINDELSCHLAG_FAMILY
});

const SPECIAL_OUTLAW_FAMILIES = Object.freeze({
  frostzorn: HOUSE_FROSTZORN_FAMILY
});

export const KRONENTAL_DEPENDENT_HOUSE_FAMILIES = Object.freeze([
  ...KRONENTAL_HESIRE_CLAN_DEFINITIONS.map(definition => (
    SPECIAL_HESIRE_FAMILIES[definition.slug]
      || activeClanFamily(definition, 'Hesire', 'gold')
  )),
  ...KRONENTAL_HUSKARL_CLAN_DEFINITIONS.map(definition => (
    SPECIAL_HUSKARL_FAMILIES[definition.slug]
      || activeClanFamily(definition, 'Huskarl', 'silver')
  )),
  ...KRONENTAL_CIVIL_CLAN_DEFINITIONS.map(definition => (
    SPECIAL_CIVIL_FAMILIES[definition.slug]
      || civilClanFamily(definition)
  )),
  ...KRONENTAL_OUTLAW_CLAN_DEFINITIONS.map(definition => (
    SPECIAL_OUTLAW_FAMILIES[definition.slug]
      || outlawClanFamily(definition)
  )),
  ...KRONENTAL_EXTINCT_CLAN_DEFINITIONS.map(extinctClanFamily)
]);
