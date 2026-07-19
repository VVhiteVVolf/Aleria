import { RHONWENS_TRAENEN_VASSAL_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createExtinctPlaceholderHouseFamily,
  createFounderPlaceholderHouseFamily
} from './blank-house-family-factory.js';
import { HOUSE_GWARED_FAMILY } from './house-gwared-family.js';

// Vorbereitete Hausakten (Juli 2026) für die neu angelegten Wappen unter
// assets/images/houses/Rhonwens Tränen/. Die lose Datei "Illysywen.png" (kein
// Unterordner) wurde NICHT übernommen — Haus Illysywen existiert bereits
// ausgearbeitet (house-illysywen-family.js) und sitzt ebenfalls in Rhonwens Tränen.
// Morveth und Skellor liegen im "Ausgestorben"-Unterordner und bekommen daher sofort
// einen Ausgestorben-Knoten an ihrer Gründerehe (siehe
// createExtinctPlaceholderHouseFamily). "Bürgerliche" ist für diesen Sitz leer.
//
// Bereits ausgearbeitete Häuser ersetzen ihre vorbereitete Leerakte — analog zu
// ELABORATED_KNIGHT_FAMILIES in lower-knight-house-families.js.
const ELABORATED_RHONWENS_TRAENEN_FAMILIES = Object.freeze({
  gwared: HOUSE_GWARED_FAMILY
});

export const RHONWENS_TRAENEN_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'gwared', file: 'Gwared', rankId: 'knight', folder: 'Ritterliche', extinct: false }),
  Object.freeze({ slug: 'madryn', file: 'Madryn', rankId: 'knight', folder: 'Ritterliche', extinct: false }),
  Object.freeze({ slug: 'merek', file: 'Merek', rankId: 'knight', folder: 'Ritterliche', extinct: false }),
  Object.freeze({ slug: 'rhenna', file: 'Rhenna', rankId: 'knight', folder: 'Ritterliche', extinct: false }),
  Object.freeze({ slug: 'talinvyr', file: 'Talinvyr', rankId: 'knight', folder: 'Ritterliche', extinct: false }),
  Object.freeze({ slug: 'morveth', file: 'Morveth', rankId: 'knight', folder: 'Ausgestorben', extinct: true }),
  Object.freeze({ slug: 'skellor', file: 'Skellor', rankId: 'knight', folder: 'Ausgestorben', extinct: true })
]);

export const RHONWENS_TRAENEN_HOUSE_FAMILIES = Object.freeze(
  RHONWENS_TRAENEN_HOUSE_DEFINITIONS.map(definition => {
    if (ELABORATED_RHONWENS_TRAENEN_FAMILIES[definition.slug]) return ELABORATED_RHONWENS_TRAENEN_FAMILIES[definition.slug];
    const factory = definition.extinct ? createExtinctPlaceholderHouseFamily : createFounderPlaceholderHouseFamily;
    return factory({
      id: `haus-${definition.slug}`,
      title: `Haus ${definition.file}`,
      emblem: `assets/images/houses/Rhonwens Tränen/${definition.folder}/${definition.file}.png`,
      houseProfile: RHONWENS_TRAENEN_VASSAL_PROFILES[definition.slug],
      description: definition.extinct
        ? `Vorbereitete Familienakte des erloschenen Hauses ${definition.file} aus Rhonwens Tränen.`
        : `Vorbereitete Familienakte des Hauses ${definition.file} aus Rhonwens Tränen.`
    });
  })
);
