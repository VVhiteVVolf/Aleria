import { createFounderPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { HOUSE_BLACH_FAMILY } from './house-blach-family.js';
import { HOUSE_GRIANLAOCH_FAMILY } from './house-grianlaoch-family.js';
import { HOUSE_ILLWATH_FAMILY } from './house-illwath-family.js';
import { HOUSE_LLWYNOG_FAMILY } from './house-llwynog-family.js';
import {
  HOUSE_MORFORWYN_FAMILY,
  HOUSE_MORFORWYN_LINKED_LINE_FAMILIES
} from './house-morforwyn-family.js';
import { HOUSE_TEYRNGARCH_FAMILY } from './house-teyrngarch-family.js';
import {
  SONNENKUESTE_HOUSE_EMBLEMS,
  SONNENKUESTE_HOUSE_PROFILES
} from './sonnenkueste-house-profiles.js';

export const SONNENKUESTE_DEPENDENT_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'teyrngarch', title: 'Teyrngarch' }),
  Object.freeze({ slug: 'blach', title: 'Blach' }),
  Object.freeze({ slug: 'llwynog', title: 'Llwynog' }),
  Object.freeze({ slug: 'illwath', title: 'Illwath' }),
  Object.freeze({ slug: 'morforwyn', title: 'Morforwyn' }),
  Object.freeze({ slug: 'grianlaoch', title: 'Grianlaoch' }),
  Object.freeze({ slug: 'gwaedryn', title: 'Gwaedryn' }),
  Object.freeze({ slug: 'rhavorn', title: 'Rhavorn' }),
  Object.freeze({ slug: 'pergarn', title: 'Pergarn' }),
  Object.freeze({ slug: 'donwyr', title: 'Donwyr' }),
  Object.freeze({ slug: 'uffyrn', title: 'Uffyrn' }),
  Object.freeze({ slug: 'pwllor', title: 'Pwllor' }),
  Object.freeze({ slug: 'llurien', title: 'Llurien' }),
  Object.freeze({ slug: 'neddair', title: 'Neddair' }),
  Object.freeze({ slug: 'cyrwain', title: 'Cyrwain' }),
  Object.freeze({ slug: 'donvael', title: 'Donvael' }),
  Object.freeze({ slug: 'rhenith', title: 'Rhenith' }),
  Object.freeze({ slug: 'bellyn', title: 'Bellyn' }),
  Object.freeze({ slug: 'fenor', title: 'Fenor' }),
  Object.freeze({ slug: 'loryn', title: 'Loryn' }),
  Object.freeze({ slug: 'orlen', title: 'Orlen' }),
  Object.freeze({ slug: 'renvyn', title: 'Renvyn' }),
  Object.freeze({ slug: 'nic-riordain', title: 'Nic Ríordáin' })
]);

function crestFrameForRank(rankId) {
  if (rankId === 'commoner') return 'iron';
  if (rankId === 'knight') return 'silver';
  return 'gold';
}

function placeholderFamily(definition) {
  const profile = SONNENKUESTE_HOUSE_PROFILES[definition.slug];
  const title = `Haus ${definition.title}`;
  const base = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title,
    emblem: SONNENKUESTE_HOUSE_EMBLEMS[definition.slug],
    houseProfile: profile,
    description: definition.slug === 'nic-riordain'
      ? 'Vorbereitete Familienakte des antiken Hauses Nic Ríordáin aus Dun Afalla.'
      : `Vorbereitete Familienakte des ${title} aus der Sonnenküste.`
  });
  return Object.freeze({
    ...base,
    lineage: Object.freeze({
      ...base.lineage,
      crestFrame: crestFrameForRank(profile.rankId)
    })
  });
}

const COMPLETED_DEPENDENT_FAMILIES = Object.freeze({
  blach: HOUSE_BLACH_FAMILY,
  grianlaoch: HOUSE_GRIANLAOCH_FAMILY,
  illwath: HOUSE_ILLWATH_FAMILY,
  llwynog: HOUSE_LLWYNOG_FAMILY,
  morforwyn: HOUSE_MORFORWYN_FAMILY,
  teyrngarch: HOUSE_TEYRNGARCH_FAMILY
});

// Das vollständig ausgearbeitete Grafenhaus Illewod bleibt im zentralen Cenyr-Aggregat.
// Hier stehen ausschließlich seine abhängigen Häuser, damit keine zweite Illewod-Akte entsteht.
export const SONNENKUESTE_DEPENDENT_HOUSE_FAMILIES = Object.freeze(
  SONNENKUESTE_DEPENDENT_HOUSE_DEFINITIONS.map(definition => (
    COMPLETED_DEPENDENT_FAMILIES[definition.slug] || placeholderFamily(definition)
  ))
);

// Diese genealogischen Nebenlinien sind keine zusätzlichen Häuser im Verzeichnis.
// Sie bleiben eigenständige Datensätze, damit ihre Wappen und Linien sauber getrennt
// sind, werden aber ausschließlich über die Linienknoten der Morforwyn-Stammakte geöffnet.
export const SONNENKUESTE_LINKED_LINE_FAMILIES = HOUSE_MORFORWYN_LINKED_LINE_FAMILIES;
