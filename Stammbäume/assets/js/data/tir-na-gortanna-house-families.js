import {
  createExtinctPlaceholderHouseFamily,
  createFounderPlaceholderHouseFamily
} from './blank-house-family-factory.js';
import {
  TIR_NA_GORTANNA_HOUSE_DEFINITIONS,
  TIR_NA_GORTANNA_HOUSE_EMBLEMS,
  TIR_NA_GORTANNA_HOUSE_PROFILES,
  TIR_NA_GORTANNA_MANAGED_PROFILE_FIELDS
} from './tir-na-gortanna-house-profiles.js';
import { HOUSE_DAL_CRUTHIN_FAMILY } from './house-dal-cruthin-family.js';
import { HOUSE_ARD_FRISEALACH_FAMILY } from './house-ard-frisealach-family.js';
import { HOUSE_ARD_TRODACH_FAMILY } from './house-ard-trodach-family.js';
import { HOUSE_NIC_CAOIMHE_FAMILY } from './house-nic-caoimhe-family.js';
import { HOUSE_IOMRACH_FAMILY } from './house-iomrach-family.js';
import { HOUSE_SIDHE_SOMHAIRLE_FAMILY } from './house-sidhe-somhairle-family.js';

function personTitle(definition, sex) {
  const spouse = sex === 'female';
  if (definition.formerMorTiarna) {
    return spouse
      ? 'Unbekannte Gemahlin eines ehemaligen Mor Tiarna von Tir na Gortanna'
      : 'Unbekannter ehemaliger Mor Tiarna von Tir na Gortanna';
  }
  if (definition.rankId === 'mor-tiarna') {
    return spouse
      ? 'Unbekannte Gemahlin des Mor Tiarna von Tir na Gortanna'
      : 'Unbekannter Mor Tiarna von Tir na Gortanna';
  }
  if (definition.rankId === 'dun-tiarna') {
    return spouse
      ? 'Unbekannte Gemahlin des Dún Tiarna von Lasbun'
      : 'Unbekannter Dún Tiarna von Lasbun';
  }
  return spouse
    ? `Unbekannte Gemahlin des Laird von ${definition.title}`
    : `Unbekannter Laird von ${definition.title}`;
}

function description(definition) {
  if (definition.formerMorTiarna) {
    return 'Vorbereitete Hauptakte des erloschenen früheren Mor-Tiarna-Hauses Mac Suileach in Tir na Gortanna.';
  }
  if (definition.extinct) {
    return `Vorbereitete Hauptakte des erloschenen Laird-Clans ${definition.title} in Broch an Clais.`;
  }
  if (definition.rankId === 'mor-tiarna') {
    return 'Vorbereitete Hauptakte des Mor-Tiarna-Clans Dál’Cruthin mit Hauptstadt Lochansail.';
  }
  if (definition.rankId === 'dun-tiarna') {
    return 'Vorbereitete Hauptakte der Ard Frisealach in ihrer Lehensherrschaft mit Stadt Lasbun.';
  }
  return `Vorbereitete Hauptakte des Laird-Clans ${definition.title} in Tir na Gortanna.`;
}

function sourceNote(definition) {
  const status = definition.extinct
    ? `${definition.title} ist ausdrücklich als erloschen überliefert.`
    : `${definition.title} ist als gegenwärtig amtierendes Haus eingeordnet.`;
  const origin = definition.origin
    ? ` Der Clan stammt ursprünglich aus ${definition.origin.seat} in ${definition.origin.territory} (${definition.origin.territoryGloss}), Ceitheach.`
    : '';
  const directBarony = definition.directBarony
    ? ' Lochansail ist die Hauptstadt der nicht eigens benannten Eigenbaronie des Mor Tiarna.'
    : '';
  return `${status} Rang, unmittelbarer Lehnsherr, Herrschaftszweig, Sitz und Wappen folgen der bereitgestellten Übersicht.${directBarony}${origin} Personennamen und Genealogie sind noch nicht überliefert und bleiben deshalb als Platzhalter gekennzeichnet.`;
}

function crestSubtitle(definition) {
  const rank = definition.formerMorTiarna
    ? 'Ehemaliger Mor Tiarna'
    : definition.rankId === 'mor-tiarna'
      ? 'Mor Tiarna'
      : definition.rankId === 'dun-tiarna'
        ? 'Dún Tiarna'
        : 'Laird';
  return `${definition.extinct ? 'Ausgestorben · ' : ''}${rank} · Tir na Gortanna · ${definition.seat}`;
}

function createTirNaGortannaHouseFamily(definition) {
  const factory = definition.extinct
    ? createExtinctPlaceholderHouseFamily
    : createFounderPlaceholderHouseFamily;
  const base = factory({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: TIR_NA_GORTANNA_HOUSE_EMBLEMS[definition.slug],
    houseProfile: TIR_NA_GORTANNA_HOUSE_PROFILES[definition.slug],
    description: description(definition)
  });

  return Object.freeze({
    ...base,
    persons: Object.freeze(base.persons.map(person => Object.freeze({
      ...person,
      title: personTitle(definition, person.sex),
      ...(definition.extinct
        ? {
            status: 'dead',
            death: '????',
            notes: 'Historische Platzhalterfigur eines bereits erloschenen Hauses.'
          }
        : {})
    }))),
    houses: Object.freeze(base.houses.map(house => Object.freeze({
      ...house,
      status: definition.extinct ? 'extinct' : 'active',
      extensions: Object.freeze({
        ...house.extensions,
        registryManagedFields: Object.freeze(['name', 'emblem', 'status'])
      })
    }))),
    lineage: Object.freeze({
      ...base.lineage,
      crestSubtitle: crestSubtitle(definition),
      crestFrame: 'gold'
    }),
    extensions: Object.freeze({
      ...base.extensions,
      preparedMainLine: true,
      sourceRevision: 1,
      principality: 'Leitheach',
      territory: 'Tir na Gortanna',
      albicRank: definition.rankId,
      historicalStatus: definition.extinct ? 'extinct' : 'active',
      administrativeRole: definition.administrativeRole,
      immediateLiegeHouseId: definition.liegeHouseId,
      immediateLiegeHouseName: definition.liegeHouseName,
      ...(definition.directBarony ? { directMorTiarnaBarony: true } : {}),
      ...(definition.formerMorTiarna ? { formerMorTiarna: true } : {}),
      ...(definition.legacyTitles
        ? { legacyTitles: Object.freeze([...definition.legacyTitles]) }
        : {}),
      ...(definition.origin ? { originPlacement: Object.freeze({ ...definition.origin }) } : {}),
      sourceNote: sourceNote(definition),
      registryManagedDocumentFields: Object.freeze(['emblem']),
      registryManagedHouseProfileFields: TIR_NA_GORTANNA_MANAGED_PROFILE_FIELDS,
      registryManagedRecordFields: Object.freeze(['folderPath'])
    })
  });
}

export const TIR_NA_GORTANNA_HOUSE_FAMILIES = Object.freeze(
  TIR_NA_GORTANNA_HOUSE_DEFINITIONS.map(definition => (
    definition.slug === 'dal-cruthin'
      ? HOUSE_DAL_CRUTHIN_FAMILY
      : definition.slug === 'frisealach'
        ? HOUSE_ARD_FRISEALACH_FAMILY
        : definition.slug === 'ard-trodach'
          ? HOUSE_ARD_TRODACH_FAMILY
          : definition.slug === 'nic-caoimhe'
            ? HOUSE_NIC_CAOIMHE_FAMILY
            : definition.slug === 'iomrach'
              ? HOUSE_IOMRACH_FAMILY
              : definition.slug === 'somhairle'
                ? HOUSE_SIDHE_SOMHAIRLE_FAMILY
            : createTirNaGortannaHouseFamily(definition)
  ))
);
