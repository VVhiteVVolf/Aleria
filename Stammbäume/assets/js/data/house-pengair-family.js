import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import {
  VORTIGERNS_RUH_HOUSE_EMBLEMS,
  VORTIGERNS_RUH_HOUSE_PROFILES
} from './vortigerns-ruh-house-profiles.js';

const base = createFounderTimeJumpPlaceholderHouseFamily({
  id: 'haus-pengair',
  title: 'Haus Pengair',
  emblem: VORTIGERNS_RUH_HOUSE_EMBLEMS.pengair,
  houseProfile: VORTIGERNS_RUH_HOUSE_PROFILES.pengair,
  description: 'Vorbereitete Familienakte des Mathragoner Ritterhauses Pengair. Das Haus betreibt die cenyrweite Volkszeitung Der Kronenspiegel; Namen und spätere Generationen werden erst mit der Ausarbeitung der Familie ergänzt.',
  toYear: '????',
  timeJumpLabel: 'Spätere Generationen noch nicht ausgearbeitet'
});

export const HOUSE_PENGAIR_FAMILY = Object.freeze({
  ...base,
  document: Object.freeze({
    ...base.document,
    motto: 'Hart, aber fair.'
  }),
  houses: Object.freeze(base.houses.map(house => Object.freeze({
    ...house,
    motto: 'Hart, aber fair.'
  }))),
  lineage: Object.freeze({
    ...base.lineage,
    crestSubtitle: 'Ritterhaus aus Mathragon · Herausgeber des Kronenspiegels'
  }),
  extensions: Object.freeze({
    ...base.extensions,
    sourceRevision: 1,
    sourceNote: 'Bewusst vorbereitete Akte: unbekanntes Gründerpaar, Hauswappen und danach genau ein serieller Zeitsprung ohne bereits erfundene Nachkommen.'
  })
});
