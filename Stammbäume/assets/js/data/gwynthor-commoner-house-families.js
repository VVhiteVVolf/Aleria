import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { GWYNTHOR_COMMONER_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import { HOUSE_DRAENMELYN_FAMILY } from './house-draenmelyn-family.js';
import { HOUSE_PENDRWN_FAMILY } from './house-pendrwn-family.js';
import { HOUSE_SWYLL_FAMILY } from './house-swyll-family.js';
import { HOUSE_YSGRIF_FAMILY } from './house-ysgrif-family.js';

const EMBLEM_ROOT = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor';

export const GWYNTHOR_COMMONER_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'draenmelyn', title: 'Draenmelyn', file: 'Draenmelyn.png' }),
  Object.freeze({ slug: 'pendrwn', title: 'Pendrwn', file: 'Pendrwn.png' }),
  Object.freeze({ slug: 'swyll', title: 'Swyll', file: 'Swyll.png' }),
  Object.freeze({ slug: 'aelmor', title: 'Aelmor', file: 'Aelmor.png' }),
  Object.freeze({ slug: 'maerllys', title: 'Maerllys', file: 'Maerllys.png' }),
  Object.freeze({ slug: 'braglas', title: 'Braglas', file: 'Braglas.png' }),
  Object.freeze({ slug: 'tonnarth', title: 'Tonnarth', file: 'Tonnarth.png' }),
  Object.freeze({ slug: 'ysgrif', title: 'Ysgrif', file: 'Ysgrif.png' })
]);

const DEVELOPED_FAMILIES = Object.freeze({
  draenmelyn: HOUSE_DRAENMELYN_FAMILY,
  pendrwn: HOUSE_PENDRWN_FAMILY,
  swyll: HOUSE_SWYLL_FAMILY,
  ysgrif: HOUSE_YSGRIF_FAMILY
});

export const GWYNTHOR_COMMONER_HOUSE_FAMILIES = Object.freeze(
  GWYNTHOR_COMMONER_HOUSE_DEFINITIONS.map(definition => (
    DEVELOPED_FAMILIES[definition.slug] || createFounderTimeJumpPlaceholderHouseFamily({
      id: `haus-${definition.slug}`,
      title: `Haus ${definition.title}`,
      emblem: `${EMBLEM_ROOT}/${definition.file}`,
      houseProfile: GWYNTHOR_COMMONER_HOUSE_PROFILES[definition.slug],
      description: `Vorbereitete Familienakte des Bürgerhauses ${definition.title} aus Gwynthor. Nachkommen werden erst nach dem Abgleich mit den bestehenden Almanach-Charakteren ergänzt.`,
      toYear: '1600',
      timeJumpLabel: 'Überlieferung ab etwa 1600',
      pendingDescendantReview: true
    })
  ))
);
