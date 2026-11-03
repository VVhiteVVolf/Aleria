import { HOUSE_CAERDYN_FAMILY } from './house-caerdyn-family.js';
import { HOUSE_DREWI_FAMILY } from './house-drewi-family.js';
import { HOUSE_GWANRHYD_FAMILY } from './house-gwanrhyd-family.js';
import { HOUSE_BOCHDEW_FAMILY } from './house-bochdew-family.js';
import { HOUSE_UDGORN_FAMILY } from './house-udgorn-family.js';
import { HOUSE_BALAURIC_FAMILY } from './house-balauric-family.js';
import { HOUSE_MORGRYN_FAMILY } from './house-morgryn-family.js';
import { HOUSE_GWENYEN_FAMILY } from './house-gwenyen-family.js';
import { HOUSE_CRWYNOG_FAMILY } from './house-crwynog-family.js';
import { HOUSE_BLODYN_FAMILY } from './house-blodyn-family.js';
import { HOUSE_TRACHWYLL_IVARSFELS_FAMILY } from './house-trachwyll-family.js';
import { getHouseRank } from '../domain/house-profile.js';
import { normalizeHouseBiographyModule } from '../modules/house-biography/house-biography-model.js';
import { houseBiographyDefaultFingerprint } from '../modules/house-biography/house-biography-fingerprint.js';

function documentBiography(family) {
  const document = family.document;
  const profile = document.houseProfile;
  return normalizeHouseBiographyModule({
    pageTitle: document.title,
    description: document.description,
    quote: document.motto || '',
    quoteBy: '',
    stats: [
      ['Rang', getHouseRank(profile.rankId).label],
      ['Sitz', profile.seat],
      ['Land', profile.kingdom],
      ['Region', profile.county]
    ].filter(([, value]) => value),
    house: {
      crestImage: document.emblem,
      biographyTitle: 'Übersicht',
      biographyText: document.description
    }
  });
}

function warriorBiographyDefault(family, sourceRevision) {
  const previous = family.extensions.houseBiographyModule;
  return Object.freeze({
    sourceRevision,
    biography: Object.freeze({
      ...(previous || documentBiography(family)),
      image: `assets/images/references/${family.document.id}/krieger.png`
    }),
    replacedDefaultFingerprints: Object.freeze(previous
      ? [houseBiographyDefaultFingerprint(previous)]
      : [])
  });
}

// Explicit revisions are the pre-import registry baseline plus one, including
// existing territorial revisions that are not present on every raw family.
// Only the recognized shipped biography is replaced; all text stays unchanged.
export const VENNYR_WARRIOR_BIOGRAPHY_DEFAULTS = Object.freeze({
  'haus-caerdyn': warriorBiographyDefault(HOUSE_CAERDYN_FAMILY, 3),
  'haus-drewi': warriorBiographyDefault(HOUSE_DREWI_FAMILY, 5),
  'haus-gwanrhyd': warriorBiographyDefault(HOUSE_GWANRHYD_FAMILY, 3),
  'haus-bochdew': warriorBiographyDefault(HOUSE_BOCHDEW_FAMILY, 3),
  'haus-udgorn': warriorBiographyDefault(HOUSE_UDGORN_FAMILY, 3),
  'haus-balauric': warriorBiographyDefault(HOUSE_BALAURIC_FAMILY, 4),
  'haus-morgryn': warriorBiographyDefault(HOUSE_MORGRYN_FAMILY, 3),
  'haus-gwenyen': warriorBiographyDefault(HOUSE_GWENYEN_FAMILY, 3),
  'haus-crwynog': warriorBiographyDefault(HOUSE_CRWYNOG_FAMILY, 3),
  'haus-blodyn': warriorBiographyDefault(HOUSE_BLODYN_FAMILY, 8),
  'haus-trachwyll': warriorBiographyDefault(HOUSE_TRACHWYLL_IVARSFELS_FAMILY, 3)
});
