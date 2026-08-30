import { createFounderPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { HOUSE_DAL_RUITHEACH_FAMILY } from './house-dal-ruitheach-family.js';
import { HOUSE_FIR_AN_TARVO_FAMILY } from './house-fir-an-tarvo-family.js';
import { HOUSE_RU_GORTACH_FAMILY } from './house-ru-gortach-family.js';
import {
  TIR_NA_TONN_HOUSE_DEFINITIONS,
  TIR_NA_TONN_HOUSE_EMBLEMS,
  TIR_NA_TONN_HOUSE_PROFILES,
  TIR_NA_TONN_MANAGED_PROFILE_FIELDS
} from './tir-na-tonn-house-profiles.js';

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
  if (definition.rankId === 'mor-tiarna') {
    return sex === 'female'
      ? 'Unbekannte Gemahlin des Mor Tiarna von Tir na Tonn'
      : 'Unbekannter Mor Tiarna von Tir na Tonn';
  }
  return sex === 'female'
    ? `Unbekannte Gemahlin des Laird von ${definition.title}`
    : `Unbekannter Laird von ${definition.title}`;
}

function createTirNaTonnHouseFamily(definition) {
  const placeholder = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: TIR_NA_TONN_HOUSE_EMBLEMS[definition.slug],
    houseProfile: TIR_NA_TONN_HOUSE_PROFILES[definition.slug],
    description: definition.rankId === 'mor-tiarna'
      ? 'Vorbereitete Hauptakte des Mor-Tiarna-Clans Fir An’Tarvo mit Hauptstadt Dun Rothar.'
      : `Vorbereitete Hauptakte des Laird-Hauses ${definition.title} mit Sitz in ${definition.seat}.`
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
      crestSubtitle: `${definition.rankId === 'mor-tiarna' ? 'Mor Tiarna' : 'Laird'} · Tir na Tonn · ${definition.seat}`,
      crestFrame: 'gold'
    }),
    extensions: Object.freeze({
      ...base.extensions,
      preparedMainLine: true,
      sourceRevision: definition.slug === 'fir-an-tarvo' ? 2 : 1,
      principality: 'Leitheach',
      territory: 'Tir na Tonn',
      territoryGloss: 'Land der Wellen',
      albicRank: definition.rankId,
      historicalStatus: 'active',
      administrativeRole: definition.administrativeRole,
      immediateLiegeHouseId: definition.liegeHouseId,
      immediateLiegeHouseName: definition.liegeHouseName,
      ...(definition.directBarony ? { directMorTiarnaBarony: true } : {}),
      ...(definition.legacyTitles
        ? { legacyTitles: Object.freeze([...definition.legacyTitles]) }
        : {}),
      sourceNote: 'Rang, unmittelbarer Lehnsherr, Herrschaftszweig, Sitz und Wappen folgen der bereitgestellten Übersicht von Tir na Tonn. Personennamen und Genealogie sind noch nicht überliefert und bleiben deshalb als Platzhalter gekennzeichnet.',
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
      registryManagedDocumentFields: Object.freeze(['emblem']),
      registryManagedHouseProfileFields: TIR_NA_TONN_MANAGED_PROFILE_FIELDS,
      registryManagedLineageFields: Object.freeze(['houseId']),
      registryManagedRecordFields: Object.freeze(['folderPath']),
      ...(definition.slug === 'fir-an-tarvo'
        ? {
            registryTombstones: Object.freeze({
              houses: Object.freeze(['house-fir-an-tarvo'])
            })
          }
        : {})
    })
  });
}

export const TIR_NA_TONN_HOUSE_FAMILIES = Object.freeze(
  TIR_NA_TONN_HOUSE_DEFINITIONS.map(definition => (
    definition.slug === 'fir-an-tarvo'
      ? HOUSE_FIR_AN_TARVO_FAMILY
      : definition.slug === 'ruitheach'
        ? HOUSE_DAL_RUITHEACH_FAMILY
      : definition.slug === 'gortach'
        ? HOUSE_RU_GORTACH_FAMILY
      : createTirNaTonnHouseFamily(definition)
  ))
);
