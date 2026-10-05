import { createBlankHouseFamily, createFounderPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { CEITHEACH_DEPENDENT_CLANS } from './ceitheach-territorial-catalog.js';
import { HOUSE_NIC_BLAR_CEITHEACH_FAMILY } from './house-nic-blar-family.js';
import { SEPT_DAIRE_FAMILY } from './sept-daire-family.js';
import { HOUSE_UI_ROCHRAIDE_FAMILY } from './house-ui-rochraide-family.js';
import { HOUSE_CRAOBHAN_FAMILY } from './house-craobhan-family.js';
import { HOUSE_ELDATH_FAMILY } from './house-eldath-family.js';
import { HOUSE_EAMHRA_FAMILY } from './house-eamhra-family.js';
import { HOUSE_SEAGHDA_FAMILY } from './house-seaghda-family.js';
import { HOUSE_MAC_TUIRSEACH_FAMILY } from './house-mac-tuirseach-family.js';
import { HOUSE_DAL_LEITE_FAMILY } from './house-dal-leite-family.js';
import { HOUSE_NIC_HOLLORAN_FAMILY } from './house-nic-holloran-family.js';
import { HOUSE_AN_MORCHOE_FAMILY } from './house-an-morchoe-family.js';
import { HOUSE_UA_NIC_CEINSELAIG_FAMILY } from './house-ua-nic-ceinselaig-family.js';
import { HOUSE_TIR_AN_TORDARROCH_FAMILY } from './house-tir-an-tordarroch-family.js';
import { HOUSE_AN_BHAIRD_FAMILY } from './house-an-bhaird-family.js';
import {
  CEITHEACH_CLAN_DEFINITIONS,
  CEITHEACH_HOUSE_EMBLEMS,
  CEITHEACH_HOUSE_PROFILES,
  CEITHEACH_MANAGED_PROFILE_FIELDS,
  getCeitheachDependentHouseProfile
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
    ({
      'nic-blar': HOUSE_NIC_BLAR_CEITHEACH_FAMILY,
      'ui-rochraide': HOUSE_UI_ROCHRAIDE_FAMILY,
      'mac-tuirseach': HOUSE_MAC_TUIRSEACH_FAMILY,
      'dal-leite': HOUSE_DAL_LEITE_FAMILY,
      'nic-holloran': HOUSE_NIC_HOLLORAN_FAMILY,
      'ua-nic-ceinselaig': HOUSE_UA_NIC_CEINSELAIG_FAMILY
    })[definition.slug] || createCeitheachClanFamily(definition)
  ))
);

function createDependentClanFamily(clan) {
  const family = createBlankHouseFamily({
    id: clan.familyId, title: clan.title, emblem: clan.emblemPath,
    houseProfile: getCeitheachDependentHouseProfile(clan.familyId),
    description: `${clan.title} mit Sitz in ${clan.seat}, ${clan.territory}, Ceitheach. Die Genealogie folgt mit der gesonderten Familienquelle.`
  });
  return Object.freeze({
    ...family,
    extensions: Object.freeze({
      ...family.extensions,
      sourceRevision: 1,
      territorialSource: Object.freeze({ attachmentId: clan.attachmentId, nameRow: clan.sourceNameRow, seatRow: clan.sourceSeatRow, emblemRow: clan.sourceEmblemRow, column: clan.sourceColumn }),
      sourceNote: 'Territoriale Clanakte nach der bereitgestellten Ceitheach-Oberherrschaftstabelle. Name, Sitz, Oberherrschaft und Wappen sind belegt; ein genauer Rang ist nicht genannt. Personen, Ehen und Abstammung werden erst mit der gesonderten Familienquelle ergänzt.'
    })
  });
}

export const CEITHEACH_NEW_DEPENDENT_FAMILIES = Object.freeze(
  CEITHEACH_DEPENDENT_CLANS.filter(clan => !clan.existing).map(clan => (
    ({
      'haus-craobhan': HOUSE_CRAOBHAN_FAMILY, 'haus-eldath': HOUSE_ELDATH_FAMILY, 'haus-eamhra': HOUSE_EAMHRA_FAMILY,
      'haus-seaghda': HOUSE_SEAGHDA_FAMILY, 'haus-an-morchoe': HOUSE_AN_MORCHOE_FAMILY,
      'haus-tir-an-tordarroch': HOUSE_TIR_AN_TORDARROCH_FAMILY, 'haus-an-bhaird': HOUSE_AN_BHAIRD_FAMILY
    })[clan.familyId]
      || createDependentClanFamily(clan)
  ))
);

export const CEITHEACH_HOUSE_FAMILIES = Object.freeze([
  ...CEITHEACH_CLAN_FAMILIES,
  SEPT_DAIRE_FAMILY,
  ...CEITHEACH_NEW_DEPENDENT_FAMILIES
]);
