import { createFounderPlaceholderHouseFamily } from './blank-house-family-factory.js';
import {
  ALDRIMAR_HOUSE_EMBLEMS,
  ALDRIMAR_HOUSE_PROFILES
} from './aldrimar-house-profiles.js';
import { HOUSE_VARULV_FAMILY } from './house-varulv-family.js';

export const ALDRIMAR_JARL_CLAN_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'vaeren', title: 'Clan Vaeren', jarltum: 'Kronental', royal: true }),
  Object.freeze({ slug: 'wargh', title: 'Clan Wargh', jarltum: 'Ivarsheim' }),
  Object.freeze({ slug: 'ragnulf', title: 'Clan Ragnulf', jarltum: 'Schwarzfenn' }),
  Object.freeze({ slug: 'varangr', title: 'Clan Varangr', jarltum: 'Krähenmoor' }),
  Object.freeze({ slug: 'varulv', title: 'Clan Varulv', jarltum: 'Roriksheim' })
]);

function createJarlClanPlaceholder(definition) {
  const base = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: ALDRIMAR_HOUSE_EMBLEMS[definition.slug],
    houseProfile: ALDRIMAR_HOUSE_PROFILES[definition.slug],
    description: definition.royal
      ? `Vorbereitete Hauptakte des Königsclans Vaeren und seines eigenen Jarltums ${definition.jarltum}. Die genealogischen Einzelheiten folgen bei der Ausarbeitung des Jarltums.`
      : `Vorbereitete Hauptakte des Jarlsclans ${definition.title.replace(/^Clan /, '')} aus dem Jarltum ${definition.jarltum}. Die genealogischen Einzelheiten folgen bei der Ausarbeitung des Jarltums.`
  });

  return Object.freeze({
    ...base,
    lineage: Object.freeze({
      ...base.lineage,
      crestFrame: 'gold'
    }),
    extensions: Object.freeze({
      ...base.extensions,
      preparedMainLine: true,
      jarltum: definition.jarltum,
      sourceRevision: 1,
      registryManagedHouseProfileFields: Object.freeze([
        'rankId',
        'seat',
        'barony',
        'county',
        'kingdom',
        'secondarySeats',
        'liegeHouseId',
        'liegeHouseName',
        'regionEmblems'
      ]),
      registryManagedRecordFields: Object.freeze(['folderPath'])
    })
  });
}

export const ALDRIMAR_HOUSE_FAMILIES = Object.freeze(
  ALDRIMAR_JARL_CLAN_DEFINITIONS.map(definition => (
    definition.slug === 'varulv'
      ? HOUSE_VARULV_FAMILY
      : createJarlClanPlaceholder(definition)
  ))
);
