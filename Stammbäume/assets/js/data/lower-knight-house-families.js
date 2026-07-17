import { createBlankHouseFamily } from './blank-house-family-factory.js';
import { CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES } from './celtigerns-wacht-house-profiles.js';
import { HOUSE_TLAWD_FAMILY } from './house-tlawd-family.js';

// Bereits ausgearbeitete Ritterherrenhäuser ersetzen ihre vorbereitete Leerakte.
const ELABORATED_KNIGHT_FAMILIES = Object.freeze({
  tlawd: HOUSE_TLAWD_FAMILY
});

export const LOWER_KNIGHT_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'tlawd', liege: 'Gafyr' }),
  Object.freeze({ slug: 'rhyddid', liege: 'Wyrm', secondarySeats: Object.freeze(['Mwyncraig']) }),
  Object.freeze({ slug: 'gelyn', liege: 'Draig', secondarySeats: Object.freeze(['Gwynthstorm']) }),
  Object.freeze({ slug: 'cludwyr', liege: 'Wyrm', secondarySeats: Object.freeze(['Bronhir']) }),
  Object.freeze({ slug: 'chwedlonol', liege: 'Saethwyr', secondarySeats: Object.freeze(['Glastraeth']) }),
  Object.freeze({ slug: 'balchder', liege: 'Draig' }),
  Object.freeze({ slug: 'eneiniog', liege: 'Saethwyr' }),
  Object.freeze({ slug: 'gostyn', liege: 'Gafyr' }),
  Object.freeze({ slug: 'awenydd', liege: 'Draig' }),
  Object.freeze({ slug: 'awenor', liege: 'Draig' }),
  Object.freeze({ slug: 'loer', liege: 'Draig', secondarySeats: Object.freeze(['Craithglyn']) })
]);

function titleFromSlug(slug) {
  return slug.slice(0, 1).toLocaleUpperCase('de') + slug.slice(1);
}

export const LOWER_KNIGHT_HOUSE_FAMILIES = Object.freeze(
  LOWER_KNIGHT_HOUSE_DEFINITIONS.map(definition => {
    if (ELABORATED_KNIGHT_FAMILIES[definition.slug]) return ELABORATED_KNIGHT_FAMILIES[definition.slug];
    const houseName = titleFromSlug(definition.slug);
    return createBlankHouseFamily({
      id: `haus-${definition.slug}`,
      title: `Haus ${houseName}`,
      emblem: `assets/images/houses/haus-${definition.slug}.png`,
      houseProfile: CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES[definition.slug],
      description: `Vorbereitete Familienakte des niederen Rittergeschlechts unter Haus ${definition.liege}.`
    });
  })
);
