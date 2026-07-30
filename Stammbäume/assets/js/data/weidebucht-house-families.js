import {
  createExtinctPlaceholderHouseFamily,
  createFounderPlaceholderHouseFamily
} from './blank-house-family-factory.js';
import {
  WEIDEBUCHT_HOUSE_EMBLEMS,
  WEIDEBUCHT_HOUSE_PROFILES
} from './weidebucht-house-profiles.js';
import { HOUSE_DINEFWR_FAMILY } from './house-dinefwr-family.js';
import { HOUSE_CREYR_FAMILY } from './house-creyr-family.js';
import { HOUSE_HWYADEN_FAMILY } from './house-hwyaden-family.js';
import { HOUSE_MOCHDAER_CERRIGARTH_FAMILY } from './house-mochdaer-family.js';
import { HOUSE_TIR_ADDAWOL_FAMILY } from './house-tir-addawol-family.js';
import { HOUSE_ASYN_FAMILY } from './house-asyn-family.js';
import { HOUSE_FHAIRE_FAMILY } from './house-fhaire-family.js';
import { HOUSE_UI_TRISCEIL_FAMILY } from './house-ui-trisceil-family.js';

export const WEIDEBUCHT_DEPENDENT_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'dinefwr', title: 'Dinefwr' }),
  Object.freeze({ slug: 'mochdaer', title: 'Mochdaer' }),
  Object.freeze({ slug: 'tir-addawol', title: 'Tir Addawol' }),
  Object.freeze({ slug: 'hwyaden', title: 'Hwyaden' }),
  Object.freeze({ slug: 'creyr', title: 'Creyr' }),
  Object.freeze({ slug: 'carwyn', title: 'Carwyn' }),
  Object.freeze({ slug: 'deyrn', title: 'Deyrn' }),
  Object.freeze({ slug: 'garan', title: 'Garan' }),
  Object.freeze({ slug: 'kelan', title: 'Kelan' }),
  Object.freeze({ slug: 'pellan', title: 'Pellan' }),
  Object.freeze({ slug: 'serin', title: 'Serin' }),
  Object.freeze({ slug: 'uldyn', title: 'Uldyn' }),
  Object.freeze({ slug: 'yllen', title: 'Yllen' }),
  Object.freeze({ slug: 'corlyn', title: 'Corlyn' }),
  Object.freeze({ slug: 'derlan', title: 'Derlan' }),
  Object.freeze({ slug: 'tannau', title: 'Tannau' }),
  Object.freeze({ slug: 'asyn', title: 'Asyn' }),
  Object.freeze({ slug: 'fhaire', title: 'Ua Fhaire', prefix: 'Clan', ancient: true }),
  Object.freeze({ slug: 'trisceil', title: 'Ui Trisceil', prefix: 'Clan', ancient: true })
]);

function crestFrameForRank(rankId) {
  if (rankId === 'commoner') return 'iron';
  if (rankId === 'knight') return 'silver';
  return 'gold';
}

function placeholderFamily(definition) {
  const profile = WEIDEBUCHT_HOUSE_PROFILES[definition.slug];
  const title = `${definition.prefix || 'Haus'} ${definition.title}`;
  const factory = definition.extinct
    ? createExtinctPlaceholderHouseFamily
    : createFounderPlaceholderHouseFamily;
  const base = factory({
    id: `haus-${definition.slug}`,
    title,
    emblem: WEIDEBUCHT_HOUSE_EMBLEMS[definition.slug],
    houseProfile: profile,
    description: definition.extinct
      ? `Vorbereitete Familienakte des erloschenen Hauses ${definition.title} aus Cerrigarth.`
      : definition.ancient
        ? `Vorbereitete Familienakte des antiken Clans ${definition.title} aus der Weidebucht.`
        : `Vorbereitete Familienakte des ${title} aus der Weidebucht.`
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
  'haus-asyn': HOUSE_ASYN_FAMILY,
  'haus-creyr': HOUSE_CREYR_FAMILY,
  'haus-dinefwr': HOUSE_DINEFWR_FAMILY,
  'haus-fhaire': HOUSE_FHAIRE_FAMILY,
  'haus-hwyaden': HOUSE_HWYADEN_FAMILY,
  'haus-mochdaer': HOUSE_MOCHDAER_CERRIGARTH_FAMILY,
  'haus-tir-addawol': HOUSE_TIR_ADDAWOL_FAMILY,
  'haus-trisceil': HOUSE_UI_TRISCEIL_FAMILY
});

// Haus Wylan bleibt als ausgearbeitete Grafenakte im zentralen Cenyr-Aggregat.
// Dieses Modul registriert ausschließlich seine abhängigen Häuser, damit keine
// zweite Wylan-Akte entsteht.
export const WEIDEBUCHT_DEPENDENT_HOUSE_FAMILIES = Object.freeze(
  WEIDEBUCHT_DEPENDENT_HOUSE_DEFINITIONS.map(definition => (
    COMPLETED_FAMILIES_BY_ID[`haus-${definition.slug}`] || placeholderFamily(definition)
  ))
);
