import { createFounderPlaceholderHouseFamily } from './blank-house-family-factory.js';
import {
  SILBERINSEL_HOUSE_EMBLEMS,
  SILBERINSEL_HOUSE_PROFILES
} from './silberinsel-house-profiles.js';
import { HOUSE_CANWYLL_FAMILY } from './house-canwyll-family.js';
import { HOUSE_CREFYDDOL_FAMILY } from './house-crefyddol-family.js';
import { HOUSE_PYRTH_FAMILY } from './house-pyrth-family.js';
import { HOUSE_SAITH_FAMILY } from './house-saith-family.js';
import { HOUSE_TIWNA_FAMILY } from './house-tiwna-family.js';

export const SILBERINSEL_DEPENDENT_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'saith', title: 'Haus Saith' }),
  Object.freeze({ slug: 'crefyddol', title: 'Haus Crefyddol' }),
  Object.freeze({ slug: 'canwyll', title: 'Haus Canwyll' }),
  Object.freeze({ slug: 'pyrth', title: 'Haus Pyrth' }),
  Object.freeze({ slug: 'tiwna', title: 'Haus Tiwna' }),
  Object.freeze({ slug: 'ferlan', title: 'Haus Ferlan' }),
  Object.freeze({ slug: 'argyllan', title: 'Haus Argyllan' }),
  Object.freeze({ slug: 'delvor', title: 'Haus Delvor' }),
  Object.freeze({ slug: 'corant', title: 'Haus Corant' }),
  Object.freeze({ slug: 'faelcaran', title: 'Haus Faelcaran' }),
  Object.freeze({ slug: 'llyncar', title: 'Haus Llyncar' }),
  Object.freeze({ slug: 'maredwyn', title: 'Haus Maredwyn' }),
  Object.freeze({ slug: 'morfynn', title: 'Haus Morfynn' }),
  Object.freeze({ slug: 'selaeth', title: 'Haus Selaeth' }),
  Object.freeze({ slug: 'arven', title: 'Haus Arven' }),
  Object.freeze({ slug: 'brithfaen', title: 'Haus Brithfaen' }),
  Object.freeze({ slug: 'tir-an-muirghin', title: 'Tir An Muirghin', ancient: true })
]);

function crestFrameForRank(rankId) {
  if (rankId === 'commoner') return 'iron';
  if (rankId === 'knight') return 'silver';
  return 'gold';
}

function placeholderFamily(definition) {
  const profile = SILBERINSEL_HOUSE_PROFILES[definition.slug];
  const base = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: SILBERINSEL_HOUSE_EMBLEMS[definition.slug],
    houseProfile: profile,
    description: definition.ancient
      ? 'Vorbereitete Familienakte des antiken Crannath-Hauses Tir An Muirghin von der Silberinsel.'
      : `Vorbereitete Familienakte des ${definition.title} von der Silberinsel.`
  });
  return Object.freeze({
    ...base,
    lineage: Object.freeze({
      ...base.lineage,
      crestFrame: crestFrameForRank(profile.rankId)
    })
  });
}

const COMPLETED_HOUSE_FAMILIES = Object.freeze({
  saith: HOUSE_SAITH_FAMILY,
  crefyddol: HOUSE_CREFYDDOL_FAMILY,
  canwyll: HOUSE_CANWYLL_FAMILY,
  pyrth: HOUSE_PYRTH_FAMILY,
  tiwna: HOUSE_TIWNA_FAMILY
});

// Haus Neidr bleibt als ausgearbeitete Grafenakte im zentralen Cenyr-Aggregat.
// Dieses Modul registriert nur die 17 abhängigen beziehungsweise antiken Häuser,
// damit keine zweite Neidr-Familie im Verzeichnis entsteht.
export const SILBERINSEL_DEPENDENT_HOUSE_FAMILIES = Object.freeze(
  SILBERINSEL_DEPENDENT_HOUSE_DEFINITIONS.map(definition => (
    COMPLETED_HOUSE_FAMILIES[definition.slug] || placeholderFamily(definition)
  ))
);
