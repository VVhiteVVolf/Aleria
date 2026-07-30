import { createFounderPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { HOUSE_CATH_FAMILY } from './house-cath-family.js';
import { HOUSE_CEIRWYN_FAMILY } from './house-ceirwyn-family.js';
import { HOUSE_DIENYDDIWR_FAMILY } from './house-dienyddiwr-family.js';
import { HOUSE_DYNGWN_FAMILY } from './house-dyngwn-family.js';
import { HOUSE_GRAEL_FAMILY } from './house-grael-family.js';
import { HOUSE_MARWOLAETH_FAMILY } from './house-marwolaeth-family.js';
import { HOUSE_PENDERYN_FAMILY } from './house-penderyn-family.js';
import {
  VORTIGERNS_RUH_HOUSE_EMBLEMS,
  VORTIGERNS_RUH_HOUSE_PROFILES
} from './vortigerns-ruh-house-profiles.js';

export const VORTIGERNS_RUH_DEPENDENT_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'ceirwyn', title: 'Ceirwyn' }),
  Object.freeze({ slug: 'cath', title: 'Cath' }),
  Object.freeze({ slug: 'grael', title: 'Grael' }),
  Object.freeze({ slug: 'penderyn', title: 'Penderyn' }),
  Object.freeze({ slug: 'dienyddiwr', title: 'Dienyddiwr' }),
  Object.freeze({ slug: 'dyngwn', title: 'Dyngwn' }),
  Object.freeze({ slug: 'marwolaeth', title: 'Marwolaeth' }),
  Object.freeze({ slug: 'morwyn', title: 'Morwyn' }),
  Object.freeze({ slug: 'rhavaen', title: 'Rhavaen' }),
  Object.freeze({ slug: 'iwrell', title: 'Iwrell' }),
  Object.freeze({ slug: 'oenfyr', title: 'Oenfyr' }),
  Object.freeze({ slug: 'saivor', title: 'Saivor' }),
  Object.freeze({ slug: 'ynllym', title: 'Ynllym' }),
  Object.freeze({ slug: 'cyfrif', title: 'Cyfrif' }),
  Object.freeze({ slug: 'fiachraoin', title: 'Fiachraoin', prefix: 'Clan' })
]);

function crestFrameForRank(rankId) {
  if (rankId === 'commoner') return 'iron';
  if (rankId === 'knight') return 'silver';
  return 'gold';
}

function placeholderFamily(definition) {
  const profile = VORTIGERNS_RUH_HOUSE_PROFILES[definition.slug];
  const title = `${definition.prefix || 'Haus'} ${definition.title}`;
  const base = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title,
    emblem: VORTIGERNS_RUH_HOUSE_EMBLEMS[definition.slug],
    houseProfile: profile,
    description: definition.slug === 'fiachraoin'
      ? 'Vorbereitete Familienakte des antiken Clans Fiachraoin aus dem alten Calon.'
      : `Vorbereitete Familienakte des ${title} aus Vortigerns Ruh.`
  });
  return Object.freeze({
    ...base,
    lineage: Object.freeze({
      ...base.lineage,
      crestFrame: crestFrameForRank(profile.rankId)
    })
  });
}

const IMPLEMENTED_VORTIGERNS_RUH_FAMILIES = Object.freeze({
  cath: HOUSE_CATH_FAMILY,
  ceirwyn: HOUSE_CEIRWYN_FAMILY,
  dienyddiwr: HOUSE_DIENYDDIWR_FAMILY,
  dyngwn: HOUSE_DYNGWN_FAMILY,
  grael: HOUSE_GRAEL_FAMILY,
  marwolaeth: HOUSE_MARWOLAETH_FAMILY,
  penderyn: HOUSE_PENDERYN_FAMILY
});

// Haus Pendrag bleibt im zentralen Grafen-/Königshaus-Aggregat registriert. Dieses
// Modul besitzt ausschließlich die abhängigen Häuser der neu ausgebauten Grafschaft,
// sodass es im Familienregister keine zweite Pendrag-Akte geben kann.
export const VORTIGERNS_RUH_DEPENDENT_HOUSE_FAMILIES = Object.freeze(
  VORTIGERNS_RUH_DEPENDENT_HOUSE_DEFINITIONS.map(definition => (
    IMPLEMENTED_VORTIGERNS_RUH_FAMILIES[definition.slug] || placeholderFamily(definition)
  ))
);
