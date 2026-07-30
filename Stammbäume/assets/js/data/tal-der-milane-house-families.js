import { createFounderPlaceholderHouseFamily } from './blank-house-family-factory.js';
import {
  TAL_DER_MILANE_HOUSE_EMBLEMS,
  TAL_DER_MILANE_HOUSE_PROFILES
} from './tal-der-milane-house-profiles.js';

export const TAL_DER_MILANE_DEPENDENT_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'eryr', title: 'Haus Eryr' }),
  Object.freeze({ slug: 'tylluan', title: 'Haus Tylluan' }),
  Object.freeze({ slug: 'mwyalchen', title: 'Haus Mwyalchen' }),
  Object.freeze({ slug: 'ilyuncu', title: 'Haus Ilyuncu' }),
  Object.freeze({ slug: 'gaeth', title: 'Haus Gaeth' }),
  Object.freeze({ slug: 'hebog', title: 'Haus Hebog' }),
  Object.freeze({ slug: 'bronnor', title: 'Haus Bronnor' }),
  Object.freeze({ slug: 'caerfran', title: 'Haus Caerfrán' }),
  Object.freeze({ slug: 'coedrudd', title: 'Haus Coedrudd' }),
  Object.freeze({ slug: 'barcud', title: 'Haus Barcud' }),
  Object.freeze({ slug: 'durdynn', title: 'Haus Durdynn' }),
  Object.freeze({ slug: 'gwylen', title: 'Haus Gwylen' }),
  Object.freeze({ slug: 'faelwyn', title: 'Haus Faelwyn' }),
  Object.freeze({ slug: 'gwyntell', title: 'Haus Gwyntell' }),
  Object.freeze({ slug: 'gwyliadwr', title: 'Haus Gwyliadwr' }),
  Object.freeze({ slug: 'helyg', title: 'Haus Helyg' }),
  Object.freeze({ slug: 'ffwnarch', title: 'Haus Ffwnarch' }),
  Object.freeze({ slug: 'gormard', title: 'Clan Ui Gormárd', ancient: true }),
  Object.freeze({ slug: 'ua-fionnghal', title: 'Clan Ua Fíonnghal', ancient: true })
]);

function crestFrameForRank(rankId) {
  if (rankId === 'commoner') return 'iron';
  if (rankId === 'knight') return 'silver';
  return 'gold';
}

function placeholderFamily(definition) {
  const profile = TAL_DER_MILANE_HOUSE_PROFILES[definition.slug];
  const base = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: TAL_DER_MILANE_HOUSE_EMBLEMS[definition.slug],
    houseProfile: profile,
    description: definition.ancient
      ? `Vorbereitete Familienakte des antiken ${definition.title} aus dem Tal der Milane.`
      : `Vorbereitete Familienakte des ${definition.title} aus dem Tal der Milane.`
  });
  return Object.freeze({
    ...base,
    lineage: Object.freeze({
      ...base.lineage,
      crestFrame: crestFrameForRank(profile.rankId)
    })
  });
}

// Haus Aderyn bleibt als ausgearbeitete Grafenakte im zentralen Cenyr-Aggregat.
// Dieses Modul registriert ausschließlich die 19 abhängigen und antiken Häuser.
export const TAL_DER_MILANE_DEPENDENT_HOUSE_FAMILIES = Object.freeze(
  TAL_DER_MILANE_DEPENDENT_HOUSE_DEFINITIONS.map(placeholderFamily)
);
