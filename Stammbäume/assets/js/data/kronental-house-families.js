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
import { HOUSE_GULLVIG_FAMILY } from './house-gullvig-family.js';
import { HOUSE_RIESENTOD_FAMILY } from './house-riesentod-family.js';
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
  Object.freeze({ slug: 'spindelschlag', title: 'Clan Spindelschlag', territory: 'Spindelheim' }),
  Object.freeze({ slug: 'suedstahl', title: 'Clan Südstahl', territory: 'Heldenwacht' }),
  Object.freeze({ slug: 'albholz', title: 'Clan Albholz', territory: 'Heldenwacht' }),
  Object.freeze({ slug: 'daemmerrufer', title: 'Clan Dämmerrufer', territory: 'Heldenwacht' }),
  Object.freeze({ slug: 'wellenkrone', title: 'Clan Wellenkrone', territory: 'Heldenwacht' }),
  Object.freeze({ slug: 'donnerblut', title: 'Clan Donnerblut', territory: 'noch nicht verortet' }),
  Object.freeze({ slug: 'moorbrand', title: 'Clan Moorbrand', territory: 'noch nicht verortet' }),
  Object.freeze({ slug: 'jormung', title: 'Clan Jormung', territory: 'noch nicht verortet' }),
  Object.freeze({ slug: 'nidfengr', title: 'Clan Nidfengr', territory: 'noch nicht verortet' }),
  Object.freeze({ slug: 'tarbhann', title: 'Clan Tarbhann', territory: 'noch nicht verortet' }),
  Object.freeze({ slug: 'bjarnvarg', title: 'Clan Bjarnvarg', territory: 'noch nicht verortet' }),
  Object.freeze({ slug: 'tauwind', title: 'Clan Tauwind', territory: 'noch nicht verortet' })
]);

export const KRONENTAL_CIVIL_CLAN_DEFINITIONS = Object.freeze([
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

function withManagedSource(base, extensions, crestFrame) {
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
  }, crestFrame);
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

export const KRONENTAL_DEPENDENT_HOUSE_FAMILIES = Object.freeze([
  ...KRONENTAL_HESIRE_CLAN_DEFINITIONS.map(definition => (
    definition.slug === 'riesentod'
      ? HOUSE_RIESENTOD_FAMILY
      : definition.slug === 'wellenschild'
      ? HOUSE_WELLENSCHILD_FAMILY
      : definition.slug === 'gullvig'
        ? HOUSE_GULLVIG_FAMILY
        : definition.slug === 'wellensaenger'
          ? HOUSE_WELLENSAENGER_FAMILY
          : activeClanFamily(definition, 'Hesire', 'gold')
  )),
  ...KRONENTAL_HUSKARL_CLAN_DEFINITIONS.map(definition => (
    definition.slug === 'eibenschild'
      ? HOUSE_EIBENSCHILD_FAMILY
      : activeClanFamily(definition, 'Huskarl', 'silver')
  )),
  ...KRONENTAL_CIVIL_CLAN_DEFINITIONS.map(civilClanFamily),
  ...KRONENTAL_OUTLAW_CLAN_DEFINITIONS.map(outlawClanFamily),
  ...KRONENTAL_EXTINCT_CLAN_DEFINITIONS.map(extinctClanFamily)
]);
