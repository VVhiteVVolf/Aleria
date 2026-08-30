import { createFounderPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { HOUSE_MAC_ARD_CUMHAILL_FAMILY } from './house-mac-ard-cumhaill-family.js';
import { HOUSE_RUIN_UA_LAOCH_FAMILY } from './house-ruin-ua-laoch-family.js';
import { HOUSE_UA_GAELACH_FAMILY } from './house-ua-gaelach-family.js';
import { HOUSE_UA_EIRCE_FAMILY } from './house-ua-eirce-family.js';
import { HOUSE_UI_FIACHRACH_FAMILY } from './house-ui-fiachrach-family.js';
import { TIR_NA_SINSEAR_HOUSE_FAMILIES } from './tir-na-sinsear-house-families.js';
import { TIR_NA_GORTANNA_HOUSE_FAMILIES } from './tir-na-gortanna-house-families.js';
import { TIR_NA_TONN_HOUSE_FAMILIES } from './tir-na-tonn-house-families.js';
import { TIR_AN_COMHCHUIBHIS_HOUSE_FAMILIES } from './tir-an-comhchuibhis-house-families.js';
import { TIR_NA_SRUTH_HOUSE_FAMILIES } from './tir-na-sruth-house-families.js';
import {
  LEITHEACH_CLAN_DEFINITIONS,
  LEITHEACH_HOUSE_EMBLEMS,
  LEITHEACH_HOUSE_PROFILES,
  LEITHEACH_MANAGED_PROFILE_FIELDS
} from './leitheach-house-profiles.js';

function personTitle(definition, sex) {
  if (definition.rankId === 'ard-tiarna') {
    return sex === 'female'
      ? 'Unbekannte Gemahlin des Ard Tiarna von Leitheach'
      : 'Unbekannter Ard Tiarna von Leitheach';
  }
  return sex === 'female'
    ? `Unbekannte Gemahlin des Mor Tiarna von ${definition.territory}`
    : `Unbekannter Mor Tiarna von ${definition.territory}`;
}

function createLeitheachClanFamily(definition) {
  const base = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: LEITHEACH_HOUSE_EMBLEMS[definition.slug],
    houseProfile: LEITHEACH_HOUSE_PROFILES[definition.slug],
    description: definition.rankId === 'ard-tiarna'
      ? `Vorbereitete Hauptakte des Fürstenclans von Leitheach mit Sitz in ${definition.seat}, ${definition.territory}.`
      : `Vorbereitete Hauptakte des Mor-Tiarna-Clans von ${definition.territory} (${definition.territoryGloss}) mit Sitz in ${definition.seat}.`
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
      crestSubtitle: definition.rankId === 'ard-tiarna'
        ? `Ard Tiarnatum Leitheach · ${definition.seat}`
        : `Mor Tiarnatum ${definition.territory} · ${definition.seat}`,
      crestFrame: 'gold'
    }),
    extensions: Object.freeze({
      ...base.extensions,
      preparedMainLine: true,
      sourceRevision: 1,
      principality: 'Leitheach',
      territory: definition.territory,
      territoryGloss: definition.territoryGloss,
      albicRank: definition.rankId,
      sourceNote: 'Clanname, Rangstufe, Herrschaftsgebiet, Stammsitz und Wappen folgen der bereitgestellten Leitheach-Verwaltungsübersicht. Personennamen und Genealogie sind noch nicht überliefert und bleiben deshalb als Platzhalter gekennzeichnet.',
      registryManagedDocumentFields: Object.freeze(['emblem']),
      registryManagedHouseProfileFields: LEITHEACH_MANAGED_PROFILE_FIELDS,
      registryManagedRecordFields: Object.freeze(['folderPath'])
    })
  });
}

export const LEITHEACH_HOUSE_FAMILIES = Object.freeze([
  HOUSE_MAC_ARD_CUMHAILL_FAMILY,
  HOUSE_UA_EIRCE_FAMILY,
  HOUSE_UI_FIACHRACH_FAMILY,
  HOUSE_RUIN_UA_LAOCH_FAMILY,
  HOUSE_UA_GAELACH_FAMILY,
  ...TIR_NA_SINSEAR_HOUSE_FAMILIES,
  ...TIR_NA_GORTANNA_HOUSE_FAMILIES,
  ...TIR_NA_TONN_HOUSE_FAMILIES,
  ...TIR_AN_COMHCHUIBHIS_HOUSE_FAMILIES,
  ...TIR_NA_SRUTH_HOUSE_FAMILIES,
  ...LEITHEACH_CLAN_DEFINITIONS
    .filter(definition => ![
      'mac-ard-cumhaill',
      'ua-gaelach',
      'dal-cruthin',
      'fir-an-tarvo',
      'mac-airt',
      'tir-an-cuinn'
    ].includes(definition.slug))
    .map(createLeitheachClanFamily)
]);
