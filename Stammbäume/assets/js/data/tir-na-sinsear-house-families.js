import { createFounderPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { HOUSE_DAL_CEARDAIOCHT_FAMILY } from './house-dal-ceardaiocht-family.js';
import { HOUSE_FIR_AN_GALLCHOBHAIR_FAMILY } from './house-fir-an-gallchobhair-family.js';
import { HOUSE_NA_MHUIR_FAMILY } from './house-na-mhuir-family.js';
import { HOUSE_UA_CLEIR_FAMILY } from './house-ua-cleir-family.js';
import { HOUSE_UA_GHAISCIOCH_FAMILY } from './house-ua-ghaiscioch-family.js';
import { SEPT_GRUENHAND_FAMILY } from './sept-gruenhand-family.js';
import {
  TIR_NA_SINSEAR_HOUSE_DEFINITIONS,
  TIR_NA_SINSEAR_HOUSE_EMBLEMS,
  TIR_NA_SINSEAR_HOUSE_PROFILES,
  TIR_NA_SINSEAR_MANAGED_PROFILE_FIELDS
} from './tir-na-sinsear-house-profiles.js';

function personTitle(definition, sex) {
  if (definition.rankId === 'dun-tiarna') {
    return sex === 'female'
      ? 'Unbekannte Gemahlin des Dún Tiarna von Dun Laog'
      : 'Unbekannter Dún Tiarna von Dun Laog';
  }
  if (definition.rankId === 'sept-head') {
    return sex === 'female'
      ? `Unbekannte Gemahlin des Septoberhaupts von ${definition.title}`
      : `Unbekanntes Septoberhaupt von ${definition.title}`;
  }
  return sex === 'female'
    ? `Unbekannte Gemahlin des Laird von ${definition.title}`
    : `Unbekannter Laird von ${definition.title}`;
}

function sourceNote(definition) {
  const hierarchy = definition.rankId === 'dun-tiarna'
    ? 'Die Fir An’Gallchobhair stehen als Dún Tiarna unmittelbar unter Clan Ua’Gaelach.'
    : definition.slug === 'na-mhuir'
      ? 'Clan Na’Mhuir steht als Laird unmittelbar unter Clan Ua’Gaelach.'
      : definition.rankId === 'sept-head'
        ? `${definition.title} steht als bürgerliche Sept unmittelbar im Dienst des Clans Na’Mhuir.`
      : `${definition.title} steht als Laird unter den Fir An’Gallchobhair.`;
  const seatDiscrepancy = definition.sourceSeatDiscrepancy
    ? ` ${definition.sourceSeatDiscrepancy}`
    : '';
  return `${hierarchy} Rang, Lehnsherr, Herrschaftszweig, Sitz und Wappen folgen der bereitgestellten Übersicht.${seatDiscrepancy} Personennamen und Genealogie sind noch nicht überliefert und bleiben deshalb als Platzhalter gekennzeichnet.`;
}

function createTirNaSinsearHouseFamily(definition) {
  const base = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: TIR_NA_SINSEAR_HOUSE_EMBLEMS[definition.slug],
    houseProfile: TIR_NA_SINSEAR_HOUSE_PROFILES[definition.slug],
    description: definition.rankId === 'dun-tiarna'
      ? `Vorbereitete Hauptakte des Dún-Tiarna-Clans von Dun Laog in Tir na Sinsear.`
      : definition.rankId === 'sept-head'
        ? `Vorbereitete Hauptakte der Sept ${definition.title} in Tir na Fancha.`
        : `Vorbereitete Hauptakte des Laird-Clans ${definition.title} in Tir na Sinsear.`
  });

  return Object.freeze({
    ...base,
    persons: Object.freeze(base.persons.map(person => Object.freeze({
      ...person,
      title: personTitle(definition, person.sex)
    }))),
    houses: Object.freeze(base.houses.map(house => Object.freeze({
      ...house,
      extensions: Object.freeze({
        ...house.extensions,
        registryManagedFields: Object.freeze(['emblem'])
      })
    }))),
    lineage: Object.freeze({
      ...base.lineage,
      crestSubtitle: `${definition.rankId === 'dun-tiarna' ? 'Dún Tiarna' : definition.rankId === 'sept-head' ? 'Sept' : 'Laird'} · Tir na Sinsear · ${definition.seat}`,
      crestFrame: definition.rankId === 'sept-head' ? 'iron' : 'gold'
    }),
    extensions: Object.freeze({
      ...base.extensions,
      preparedMainLine: true,
      sourceRevision: 1,
      principality: 'Leitheach',
      territory: 'Tir na Sinsear',
      albicRank: definition.rankId,
      immediateLiegeHouseId: definition.liegeHouseId,
      immediateLiegeHouseName: definition.liegeHouseName,
      sourceNote: sourceNote(definition),
      ...(definition.sourceSeatDiscrepancy
        ? { sourceSeatDiscrepancy: definition.sourceSeatDiscrepancy }
        : {}),
      registryManagedDocumentFields: Object.freeze(['emblem']),
      registryManagedHouseProfileFields: TIR_NA_SINSEAR_MANAGED_PROFILE_FIELDS,
      registryManagedRecordFields: Object.freeze(['folderPath'])
    })
  });
}

const COMPLETED_TIR_NA_SINSEAR_FAMILIES = Object.freeze({
  gallchobhair: HOUSE_FIR_AN_GALLCHOBHAIR_FAMILY,
  cleir: HOUSE_UA_CLEIR_FAMILY,
  ghaiscioch: HOUSE_UA_GHAISCIOCH_FAMILY,
  'dal-ceardaiocht': HOUSE_DAL_CEARDAIOCHT_FAMILY,
  'na-mhuir': HOUSE_NA_MHUIR_FAMILY,
  gruenhand: SEPT_GRUENHAND_FAMILY
});

export const TIR_NA_SINSEAR_HOUSE_FAMILIES = Object.freeze(
  TIR_NA_SINSEAR_HOUSE_DEFINITIONS.map(definition => (
    COMPLETED_TIR_NA_SINSEAR_FAMILIES[definition.slug]
      || createTirNaSinsearHouseFamily(definition)
  ))
);
