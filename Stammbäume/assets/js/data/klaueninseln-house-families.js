import { createFounderPlaceholderHouseFamily } from './blank-house-family-factory.js';
import {
  HOUSE_ARFORDIR_ABERDAIL_FAMILY,
  HOUSE_ARFORDIR_SERENLYN_FAMILY
} from './house-arfordir-family.js';
import { HOUSE_BERYN_FAMILY } from './house-beryn-family.js?v=eira-20261005';
import { HOUSE_DYGER_FAMILY } from './house-dyger-family.js?v=lynne-20261004';
import { LYNNE_CREW_HOUSE_FAMILIES } from './lynne-crew-house-families.js?v=lynne-20261005';
import { RHYDIAN_CREW_HOUSE_FAMILIES } from './rhydian-crew-house-families.js';
import { HOUSE_CRAFANC_FAMILY } from './house-crafanc-family.js';
import { HOUSE_CWINGOD_FAMILY } from './house-cwingod-family.js';
import {
  HOUSE_DIAFOL_TALGARTH_FAMILY,
  HOUSE_DIAFOL_TREFGOCH_FAMILY
} from './house-diafol-family.js';
import {
  HOUSE_DIANC_ABERDAIL_FAMILY,
  HOUSE_DIANC_GWYNLANN_FAMILY
} from './house-dianc-family.js';
import {
  HOUSE_DYFRGI_CAER_CRYFTLAWD_FAMILY,
  HOUSE_DYFRGI_MYNYDDHARBWR_FAMILY
} from './house-dyfrgi-family.js';
import { HOUSE_EIRTH_FAMILY } from './house-eirth-family.js';
import { HOUSE_MORTHWYLL_FAMILY } from './house-morthwyll-family.js';
import { HOUSE_PAWEN_FAMILY } from './house-pawen-family.js';
import { HOUSE_SELWYN_FAMILY } from './house-selwyn-family.js';
import { HOUSE_UNIGOL_FAMILY } from './house-unigol-family.js';
import {
  HOUSE_WALWRS_CAER_DEHEUOL_FAMILY,
  HOUSE_WALWRS_TRAETH_FAMILY
} from './house-walwrs-family.js';
import {
  KLAUENINSEL_HOUSE_EMBLEMS,
  KLAUENINSEL_HOUSE_PROFILES
} from './klaueninseln-house-profiles.js';

const SIMPLE_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'ard-follmhar', title: 'Haus Ard Follmhar', ancient: true })
]);

function targetCrestFrame(rankId) {
  return rankId === 'knight' ? 'silver' : 'gold';
}

function createSimpleFamily(definition) {
  const profile = KLAUENINSEL_HOUSE_PROFILES[definition.slug];
  const base = createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: definition.title,
    emblem: KLAUENINSEL_HOUSE_EMBLEMS[definition.slug],
    houseProfile: profile,
    description: definition.ancient
      ? 'Vorbereitete Familienakte des antiken Hauses Ard Follmhar aus Ard Dunrath.'
      : 'Vorbereitete Familienakte des niederen Ritterherrenhauses Beryn aus Talgarth.'
  });
  return Object.freeze({
    ...base,
    lineage: Object.freeze({ ...base.lineage, crestFrame: targetCrestFrame(profile.rankId) }),
    extensions: Object.freeze({ ...base.extensions, sourceRevision: 1 })
  });
}

export const KLAUENINSEL_DEPENDENT_HOUSE_FAMILIES = Object.freeze([
  HOUSE_PAWEN_FAMILY,
  HOUSE_CRAFANC_FAMILY,
  HOUSE_UNIGOL_FAMILY,
  HOUSE_MORTHWYLL_FAMILY,
  HOUSE_EIRTH_FAMILY,
  HOUSE_SELWYN_FAMILY,
  HOUSE_DIAFOL_TALGARTH_FAMILY,
  HOUSE_DIANC_ABERDAIL_FAMILY,
  HOUSE_ARFORDIR_ABERDAIL_FAMILY,
  HOUSE_DYFRGI_CAER_CRYFTLAWD_FAMILY,
  HOUSE_WALWRS_CAER_DEHEUOL_FAMILY,
  HOUSE_CWINGOD_FAMILY,
  HOUSE_BERYN_FAMILY,
  HOUSE_DYGER_FAMILY,
  ...LYNNE_CREW_HOUSE_FAMILIES,
  ...RHYDIAN_CREW_HOUSE_FAMILIES,
  ...SIMPLE_DEFINITIONS.map(createSimpleFamily)
]);

export const KLAUENINSEL_ORIGIN_HOUSE_FAMILIES = Object.freeze(
  [
    HOUSE_DIAFOL_TREFGOCH_FAMILY,
    HOUSE_DIANC_GWYNLANN_FAMILY,
    HOUSE_ARFORDIR_SERENLYN_FAMILY,
    HOUSE_DYFRGI_MYNYDDHARBWR_FAMILY,
    HOUSE_WALWRS_TRAETH_FAMILY
  ]
);
