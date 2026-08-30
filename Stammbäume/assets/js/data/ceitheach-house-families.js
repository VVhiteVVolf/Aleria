import { createFounderPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { HOUSE_NIC_BLAR_CEITHEACH_FAMILY } from './house-nic-blar-family.js';
import { SEPT_DAIRE_FAMILY } from './sept-daire-family.js';
import {
  CEITHEACH_CLAN_DEFINITIONS,
  CEITHEACH_HOUSE_EMBLEMS,
  CEITHEACH_HOUSE_PROFILES,
  CEITHEACH_MANAGED_PROFILE_FIELDS
} from './ceitheach-house-profiles.js';

function personTitle(definition, sex) {
  if (definition.rankId === 'ard-tiarna') {
    return sex === 'female'
      ? 'Unbekannte Gemahlin des Ard Tiarna von Ceitheach'
      : 'Unbekannter Ard Tiarna von Ceitheach';
  }
  return sex === 'female'
    ? `Unbekannte Gemahlin des Mor Tiarna von ${definition.territory}`
    : `Unbekannter Mor Tiarna von ${definition.territory}`;
}

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

function createCeitheachClanFamily(definition) {
  const placeholder = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: CEITHEACH_HOUSE_EMBLEMS[definition.slug],
    houseProfile: CEITHEACH_HOUSE_PROFILES[definition.slug],
    description: definition.rankId === 'ard-tiarna'
      ? `Vorbereitete Hauptakte des Fürstenclans von Ceitheach mit Sitz in ${definition.seat}, ${definition.territory}.`
      : `Vorbereitete Hauptakte des Mor-Tiarna-Clans von ${definition.territory} (${definition.territoryGloss}) mit Sitz in ${definition.seat}.`
  });
  const base = applyPrimaryHouseId(placeholder, definition.primaryHouseId);

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
        registryManagedFields: Object.freeze(['name', 'emblem'])
      })
    }))),
    lineage: Object.freeze({
      ...base.lineage,
      crestSubtitle: definition.rankId === 'ard-tiarna'
        ? `Ard Tiarnatum Ceitheach · ${definition.seat}`
        : `Mor Tiarnatum ${definition.territory} · ${definition.seat}`,
      crestFrame: 'gold'
    }),
    extensions: Object.freeze({
      ...base.extensions,
      preparedMainLine: true,
      sourceRevision: 1,
      principality: 'Ceitheach',
      territory: definition.territory,
      territoryGloss: definition.territoryGloss,
      albicRank: definition.rankId,
      administrativeRole: definition.rankId === 'ard-tiarna'
        ? 'Fürstenclan und Ard Tiarna von Ceitheach'
        : `Mor Tiarna von ${definition.territory}`,
      ...(definition.rankId === 'ard-tiarna'
        ? {}
        : {
            immediateLiegeHouseId: 'haus-ui-rochraide',
            immediateLiegeHouseName: 'Clan Ui’Rochraide'
          }),
      sourceNote: 'Clanname, Rangstufe, Oberherrschaft, Stammsitz und Wappen folgen der bereitgestellten Ceitheach-Verwaltungsübersicht. Die Zuordnung der fünf großen Clans zu den fünf nach Tir na Cruach aufgeführten Oberherrschaften folgt der gemeinsamen Spaltenreihenfolge der Quelle. Personennamen und Genealogie sind noch nicht überliefert und bleiben deshalb als Platzhalter gekennzeichnet.',
      registryManagedDocumentFields: Object.freeze(['emblem']),
      registryManagedHouseProfileFields: CEITHEACH_MANAGED_PROFILE_FIELDS,
      registryManagedLineageFields: Object.freeze(['houseId']),
      registryManagedRecordFields: Object.freeze(['folderPath'])
    })
  });
}

export const CEITHEACH_CLAN_FAMILIES = Object.freeze(
  CEITHEACH_CLAN_DEFINITIONS.map(definition => (
    definition.slug === 'nic-blar'
      ? HOUSE_NIC_BLAR_CEITHEACH_FAMILY
      : createCeitheachClanFamily(definition)
  ))
);

export const CEITHEACH_HOUSE_FAMILIES = Object.freeze([
  ...CEITHEACH_CLAN_FAMILIES,
  SEPT_DAIRE_FAMILY
]);
