import {
  createExtinctPlaceholderHouseFamily,
  createFounderPlaceholderHouseFamily
} from './blank-house-family-factory.js';
import {
  AEHRENTAL_HOUSE_EMBLEMS,
  AEHRENTAL_HOUSE_PROFILES
} from './aehrental-house-profiles.js';
import { HOUSE_MARCHOG_FAMILY } from './house-marchog-family.js';
import { HOUSE_MORCANHUC_FAMILY } from './house-morcanhuc-family.js';
import { HOUSE_BAEDD_FAMILY } from './house-baedd-family.js';
import { HOUSE_CIAROG_FAMILY } from './house-ciarog-family.js';
import { HOUSE_SGWARNOG_FAMILY } from './house-sgwarnog-family.js';
import { HOUSE_CHIFFYDDLON_FAMILY } from './house-chiffyddlon-family.js';
import { HOUSE_GWARCHOD_FAMILY } from './house-gwarchod-family.js';

export const AEHRENTAL_DEPENDENT_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'morcanhuc', title: 'Morcanhuc' }),
  Object.freeze({ slug: 'ciarog', title: 'Ciaróg' }),
  Object.freeze({ slug: 'chiffyddlon', title: 'Chiffyddlon', extinct: true }),
  Object.freeze({ slug: 'gwarchod', title: 'Gwarchod', extinct: true }),
  Object.freeze({ slug: 'baedd', title: 'Baedd' }),
  Object.freeze({ slug: 'sgwarnog', title: 'Sgwarnog' }),
  Object.freeze({ slug: 'marchog', title: 'Marchog' }),
  Object.freeze({ slug: 'gwythiad', title: 'Gwythiad' }),
  Object.freeze({ slug: 'aroglyn', title: 'Aroglyn' }),
  Object.freeze({ slug: 'cruithenaech', title: 'Cruithenaech', prefix: 'Clan', ancient: true }),
  Object.freeze({ slug: 'warthog', title: 'Warthog', prefix: 'Clan', ancient: true })
]);

function crestFrameForRank(rankId) {
  if (rankId === 'commoner') return 'iron';
  if (rankId === 'knight') return 'silver';
  return 'gold';
}

function placeholderFamily(definition) {
  const profile = AEHRENTAL_HOUSE_PROFILES[definition.slug];
  const title = `${definition.prefix || 'Haus'} ${definition.title}`;
  const factory = definition.extinct
    ? createExtinctPlaceholderHouseFamily
    : createFounderPlaceholderHouseFamily;
  const base = factory({
    id: `haus-${definition.slug}`,
    title,
    emblem: AEHRENTAL_HOUSE_EMBLEMS[definition.slug],
    houseProfile: profile,
    description: definition.extinct
      ? `Vorbereitete Familienakte des dynastisch erloschenen ${title}; nicht erbfähige Einzelpersonen können fortbestehen.`
      : definition.ancient
        ? `Vorbereitete Familienakte des antiken ${title} aus dem Ährental.`
        : `Vorbereitete Familienakte des ${title} aus dem Ährental.`
  });
  return Object.freeze({
    ...base,
    lineage: Object.freeze({
      ...base.lineage,
      crestFrame: crestFrameForRank(profile.rankId)
    })
  });
}

const COMPLETED_FAMILIES_BY_ID = Object.freeze({
  'haus-baedd': HOUSE_BAEDD_FAMILY,
  'haus-ciarog': HOUSE_CIAROG_FAMILY,
  'haus-chiffyddlon': HOUSE_CHIFFYDDLON_FAMILY,
  'haus-gwarchod': HOUSE_GWARCHOD_FAMILY,
  'haus-marchog': HOUSE_MARCHOG_FAMILY,
  'haus-morcanhuc': HOUSE_MORCANHUC_FAMILY,
  'haus-sgwarnog': HOUSE_SGWARNOG_FAMILY
});

// Haus Grawn bleibt als ausgearbeitete Grafenakte im zentralen Cenyr-Aggregat.
// Dieses Modul registriert ausschließlich die elf übrigen Ährental-Häuser.
export const AEHRENTAL_DEPENDENT_HOUSE_FAMILIES = Object.freeze(
  AEHRENTAL_DEPENDENT_HOUSE_DEFINITIONS.map(definition => (
    COMPLETED_FAMILIES_BY_ID[`haus-${definition.slug}`] || placeholderFamily(definition)
  ))
);
