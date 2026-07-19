import { GWENDOLYNS_UFER_VASSAL_PROFILES } from './celtigerns-wacht-house-profiles.js';
import { createFounderPlaceholderHouseFamily } from './blank-house-family-factory.js';

// Vorbereitete Hausakten (Juli 2026) für die neu angelegten Wappen unter
// assets/images/houses/Gwendolyns Ufer/. "Ritterliche" gilt laut Absprache als
// dieselbe Rangstufe wie "Niedere Ritterliche" (knight, silberner Wappenrahmen).
// Sobald ein Haus im Detail ausgearbeitet wird, ersetzt seine HOUSE_X_FAMILY den
// Eintrag hier — wie bereits bei den niederen Ritterhäusern in
// lower-knight-house-families.js vorgemacht.
export const GWENDOLYNS_UFER_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'annwyl', file: 'Annwyl', rankId: 'knight', folder: 'Ritterliche' }),
  Object.freeze({ slug: 'barus', file: 'Barus', rankId: 'knight', folder: 'Ritterliche' }),
  Object.freeze({ slug: 'cenfig', file: 'Cenfig', rankId: 'knight', folder: 'Ritterliche' }),
  Object.freeze({ slug: 'cysgodion', file: 'Cysgodion', rankId: 'knight', folder: 'Ritterliche' }),
  Object.freeze({ slug: 'daran', file: 'Daran', rankId: 'knight', folder: 'Ritterliche' }),
  Object.freeze({ slug: 'edmy', file: 'Edmy', rankId: 'knight', folder: 'Ritterliche' }),
  Object.freeze({ slug: 'gwyntog', file: 'Gwyntog', rankId: 'knight', folder: 'Ritterliche' }),
  Object.freeze({ slug: 'penwyn', file: 'Penwyn', rankId: 'knight', folder: 'Ritterliche' }),
  Object.freeze({ slug: 'rhuddgar', file: 'Rhuddgar', rankId: 'knight', folder: 'Ritterliche' }),
  Object.freeze({ slug: 'seldryn', file: 'Seldryn', rankId: 'knight', folder: 'Ritterliche' }),
  Object.freeze({ slug: 'selog', file: 'Selog', rankId: 'knight', folder: 'Ritterliche' }),
  Object.freeze({ slug: 'taranvyr', file: 'Taranvyr', rankId: 'knight', folder: 'Ritterliche' }),
  Object.freeze({ slug: 'tawelgar', file: 'Tawelgar', rankId: 'knight', folder: 'Ritterliche' }),
  Object.freeze({ slug: 'trydar', file: 'Trydar', rankId: 'knight', folder: 'Ritterliche' }),
  Object.freeze({ slug: 'ymladd', file: 'Ymladd', rankId: 'knight', folder: 'Ritterliche' }),
  Object.freeze({ slug: 'caerlaen', file: 'Caerlaen', rankId: 'commoner', folder: 'Bürgerliche' }),
  Object.freeze({ slug: 'caerthwyn', file: 'Caerthwyn', rankId: 'commoner', folder: 'Bürgerliche' })
]);

export const GWENDOLYNS_UFER_HOUSE_FAMILIES = Object.freeze(
  GWENDOLYNS_UFER_HOUSE_DEFINITIONS.map(definition => createFounderPlaceholderHouseFamily({
    id: `haus-${definition.slug}`,
    title: `Haus ${definition.file}`,
    emblem: `assets/images/houses/Gwendolyns Ufer/${definition.folder}/${definition.file}.png`,
    houseProfile: GWENDOLYNS_UFER_VASSAL_PROFILES[definition.slug],
    description: `Vorbereitete Familienakte des Hauses ${definition.file} aus Gwendolyns Ufer.`
  }))
);
