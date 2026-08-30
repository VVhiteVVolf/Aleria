import { createFounderPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { HOUSE_TIR_AN_CUINN_FAMILY } from './house-tir-an-cuinn-family.js';
import { HOUSE_TIR_AN_AIRGID_FAMILY } from './house-tir-an-airgid-family.js';
import { HOUSE_UA_AMRHAN_FAMILY } from './house-ua-amrhan-family.js';
import {
  TIR_NA_SRUTH_HOUSE_DEFINITIONS,
  TIR_NA_SRUTH_HOUSE_EMBLEMS,
  TIR_NA_SRUTH_HOUSE_PROFILES,
  TIR_NA_SRUTH_MANAGED_PROFILE_FIELDS
} from './tir-na-sruth-house-profiles.js';

function applyPrimaryHouseId(base, primaryHouseId) {
  if (base.lineage.houseId === primaryHouseId) return base;
  const generatedHouseId = base.lineage.houseId;
  return {
    ...base,
    houses: base.houses.map(house => ({
      ...house,
      id: house.id === generatedHouseId ? primaryHouseId : house.id
    })),
    persons: base.persons.map(person => ({
      ...person,
      houseId: person.houseId === generatedHouseId ? primaryHouseId : person.houseId
    })),
    lineage: {
      ...base.lineage,
      houseId: primaryHouseId
    }
  };
}

function personTitle(definition, sex) {
  const spouse = sex === 'female';
  if (definition.rankId === 'mor-tiarna') {
    return spouse
      ? 'Unbekannte Gemahlin des Mor Tiarna von Tir na Sruth'
      : 'Unbekannter Mor Tiarna von Tir na Sruth';
  }
  if (definition.rankId === 'dun-tiarna') {
    return spouse
      ? 'Unbekannte Gemahlin des Dún Tiarna der Tir An’Airgid'
      : 'Unbekannter Dún Tiarna der Tir An’Airgid';
  }
  return spouse
    ? 'Unbekannte Gemahlin eines Laird der Ua’Amhran'
    : 'Unbekannter Laird der Ua’Amhran';
}

function description(definition) {
  if (definition.rankId === 'mor-tiarna') {
    return 'Vorbereitete Hauptakte des Mor-Tiarna-Clans Tir An’Cuinn mit Hauptstadt Ceanntire.';
  }
  if (definition.rankId === 'dun-tiarna') {
    return 'Vorbereitete Hauptakte der Tir An’Airgid als Dún Tiarna mit Sitz in Cel Leagan.';
  }
  return 'Vorbereitete Hauptakte der Ua’Amhran als unmittelbar in Ceanntire ansässige Lairds.';
}

function crestSubtitle(definition) {
  const rank = definition.rankId === 'mor-tiarna'
    ? 'Mor Tiarna'
    : definition.rankId === 'dun-tiarna'
      ? 'Dún Tiarna'
      : 'Laird';
  return `${rank} · Tir na Sruth · ${definition.seat}`;
}

function createTirNaSruthHouseFamily(definition) {
  const placeholder = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: TIR_NA_SRUTH_HOUSE_EMBLEMS[definition.slug],
    houseProfile: TIR_NA_SRUTH_HOUSE_PROFILES[definition.slug],
    description: description(definition)
  });
  const base = applyPrimaryHouseId(placeholder, definition.primaryHouseId);

  return Object.freeze({
    ...base,
    persons: Object.freeze(base.persons.map(person => Object.freeze({
      ...person,
      title: personTitle(definition, person.sex),
      extensions: Object.freeze({
        ...person.extensions,
        registryManagedFields: Object.freeze(['houseId', 'title'])
      })
    }))),
    houses: Object.freeze(base.houses.map(house => Object.freeze({
      ...house,
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
      sourceRevision: definition.slug === 'tir-an-cuinn' ? 2 : 1,
      principality: 'Leitheach',
      territory: 'Tir na Sruth',
      territoryGloss: 'Land des Stroms',
      albicRank: definition.rankId,
      historicalStatus: 'active',
      administrativeRole: definition.administrativeRole,
      immediateLiegeHouseId: definition.liegeHouseId,
      immediateLiegeHouseName: definition.liegeHouseName,
      ...(definition.directBarony ? { directMorTiarnaBarony: true } : {}),
      ...(definition.legacyTitles
        ? { legacyTitles: Object.freeze([...definition.legacyTitles]) }
        : {}),
      sourceNote: 'Rang, unmittelbarer Lehnsherr, Herrschaftszweig, Sitz und Wappen folgen der bereitgestellten Übersicht von Tir na Sruth. Ua’Amrhan wird direkt in Ceanntire geführt; nur Tir An’Airgid besitzt eine eigene Lehensherrschaft in Cel Leagan. Personennamen und Genealogie sind noch nicht überliefert und bleiben deshalb als Platzhalter gekennzeichnet.',
      registryManagedExtensionFields: Object.freeze([
        'preparedMainLine',
        'principality',
        'territory',
        'territoryGloss',
        'albicRank',
        'historicalStatus',
        'administrativeRole',
        'immediateLiegeHouseId',
        'immediateLiegeHouseName',
        'directMorTiarnaBarony',
        'legacyTitles',
        'sourceNote'
      ]),
      registryManagedDocumentFields: Object.freeze(['emblem', 'description']),
      registryManagedHouseProfileFields: TIR_NA_SRUTH_MANAGED_PROFILE_FIELDS,
      registryManagedLineageFields: Object.freeze(['houseId']),
      registryManagedRecordFields: Object.freeze(['folderPath']),
      ...(definition.slug === 'tir-an-cuinn'
        ? {
            registryTombstones: Object.freeze({
              houses: Object.freeze(['house-tir-an-cuinn'])
            })
          }
        : {})
    })
  });
}

export const TIR_NA_SRUTH_HOUSE_FAMILIES = Object.freeze(
  TIR_NA_SRUTH_HOUSE_DEFINITIONS.map(definition => (
    definition.slug === 'tir-an-cuinn'
      ? HOUSE_TIR_AN_CUINN_FAMILY
      : definition.slug === 'airgid'
        ? HOUSE_TIR_AN_AIRGID_FAMILY
      : definition.slug === 'amrhan'
        ? HOUSE_UA_AMRHAN_FAMILY
        : createTirNaSruthHouseFamily(definition)
  ))
);
