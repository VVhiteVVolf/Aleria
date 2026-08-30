import {
  createExtinctPlaceholderHouseFamily,
  createFounderPlaceholderHouseFamily
} from './blank-house-family-factory.js';
import { HOUSE_DAL_T_SAOR_FAMILY } from './house-dal-t-saor-family.js';
import { HOUSE_MAC_AIRT_FAMILY } from './house-mac-airt-family.js';
import { HOUSE_NIC_BLAR_LEITHEACH_FAMILY } from './house-nic-blar-family.js';
import { HOUSE_RUIN_LAIDIR_FAMILY } from './house-ruin-laidir-family.js';
import { HOUSE_UA_CHOINNICH_FAMILY } from './house-ua-choinnich-family.js';
import {
  TIR_AN_COMHCHUIBHIS_HOUSE_DEFINITIONS,
  TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS,
  TIR_AN_COMHCHUIBHIS_HOUSE_PROFILES,
  TIR_AN_COMHCHUIBHIS_MANAGED_PROFILE_FIELDS
} from './tir-an-comhchuibhis-house-profiles.js';

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
      ? 'Unbekannte Gemahlin des Mor Tiarna von Tir an Comhchuibhis'
      : 'Unbekannter Mor Tiarna von Tir an Comhchuibhis';
  }
  if (definition.rankId === 'dun-tiarna') {
    return spouse
      ? 'Unbekannte Gemahlin des Dún Tiarna von Claisean'
      : 'Unbekannter Dún Tiarna von Claisean';
  }
  if (definition.extinct) {
    return spouse
      ? 'Unbekannte Gemahlin eines ehemaligen Laird aus Sruthlann'
      : 'Unbekannter ehemaliger Laird aus Sruthlann';
  }
  return spouse
    ? `Unbekannte Gemahlin des Laird von ${definition.title}`
    : `Unbekannter Laird von ${definition.title}`;
}

function description(definition) {
  if (definition.extinct) {
    return 'Vorbereitete Hauptakte des erloschenen Laird-Clans Dal T’Saor aus Sruthlann.';
  }
  if (definition.rankId === 'mor-tiarna') {
    return 'Vorbereitete Hauptakte des Mor-Tiarna-Clans Mac Airt mit Hauptstadt Sruthlann.';
  }
  if (definition.rankId === 'dun-tiarna') {
    return 'Vorbereitete Hauptakte der Ruin’Laidir in ihrer Lehensherrschaft mit Sitz in Claisean.';
  }
  return `Vorbereitete Hauptakte des Laird-Clans ${definition.title} mit Sitz in Sruthlann.`;
}

function crestSubtitle(definition) {
  const rank = definition.rankId === 'mor-tiarna'
    ? 'Mor Tiarna'
    : definition.rankId === 'dun-tiarna'
      ? 'Dún Tiarna'
      : 'Laird';
  return `${definition.extinct ? 'Ausgestorben · ' : ''}${rank} · Tir an Comhchuibhis · ${definition.seat}`;
}

function createTirAnComhchuibhisHouseFamily(definition) {
  const factory = definition.extinct
    ? createExtinctPlaceholderHouseFamily
    : createFounderPlaceholderHouseFamily;
  const placeholder = factory({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS[definition.slug],
    houseProfile: TIR_AN_COMHCHUIBHIS_HOUSE_PROFILES[definition.slug],
    description: description(definition)
  });
  const base = applyPrimaryHouseId(placeholder, definition.primaryHouseId);

  return Object.freeze({
    ...base,
    persons: Object.freeze(base.persons.map(person => Object.freeze({
      ...person,
      title: personTitle(definition, person.sex),
      ...(definition.extinct
        ? {
            status: 'dead',
            death: '????',
            notes: 'Historische Platzhalterfigur des bereits erloschenen Clans Dal T’Saor.'
          }
        : {}),
      extensions: Object.freeze({
        ...person.extensions,
        registryManagedFields: Object.freeze(['houseId', 'title'])
      })
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
      sourceRevision: ['mac-airt', 'choinnich'].includes(definition.slug) ? 2 : 1,
      principality: 'Leitheach',
      territory: 'Tir an Comhchuibhis',
      territoryGloss: 'Land der Harmonie',
      albicRank: definition.rankId,
      historicalStatus: definition.extinct ? 'extinct' : 'active',
      administrativeRole: definition.administrativeRole,
      immediateLiegeHouseId: definition.liegeHouseId,
      immediateLiegeHouseName: definition.liegeHouseName,
      ...(definition.directBarony ? { directMorTiarnaBarony: true } : {}),
      ...(definition.legacyTitles
        ? { legacyTitles: Object.freeze([...definition.legacyTitles]) }
        : {}),
      sourceNote: 'Rang, unmittelbarer Lehnsherr, Herrschaftszweig, Sitz und Wappen folgen der bereitgestellten Übersicht von Tir an Comhchuibhis. Personennamen und Genealogie sind noch nicht vollständig überliefert und bleiben deshalb als Platzhalter gekennzeichnet.',
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
      registryManagedHouseProfileFields: TIR_AN_COMHCHUIBHIS_MANAGED_PROFILE_FIELDS,
      registryManagedLineageFields: Object.freeze(['houseId']),
      registryManagedRecordFields: Object.freeze(['folderPath'])
    })
  });
}

export const TIR_AN_COMHCHUIBHIS_HOUSE_FAMILIES = Object.freeze(
  TIR_AN_COMHCHUIBHIS_HOUSE_DEFINITIONS.map(definition => (
    definition.slug === 'mac-airt'
      ? HOUSE_MAC_AIRT_FAMILY
      : definition.slug === 'choinnich'
        ? HOUSE_UA_CHOINNICH_FAMILY
      : definition.slug === 'laidir'
        ? HOUSE_RUIN_LAIDIR_FAMILY
      : definition.slug === 'dal-t-saor'
        ? HOUSE_DAL_T_SAOR_FAMILY
      : definition.slug === 'nic-blar'
        ? HOUSE_NIC_BLAR_LEITHEACH_FAMILY
        : createTirAnComhchuibhisHouseFamily(definition)
  ))
);
