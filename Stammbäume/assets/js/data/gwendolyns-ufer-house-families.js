import { GWENDOLYNS_UFER_VASSAL_PROFILES } from './celtigerns-wacht-house-profiles.js';
import { createFounderPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { HOUSE_ANNWYL_FAMILY } from './house-annwyl-family.js';
import { HOUSE_BARUS_FAMILY } from './house-barus-family.js';
import { HOUSE_CAERLAEN_FAMILY } from './house-caerlaen-family.js';
import { HOUSE_CAERTHWYN_FAMILY } from './house-caerthwyn-family.js';
import { HOUSE_CENFIG_FAMILY } from './house-cenfig-family.js';
import { HOUSE_CYSGODION_FAMILY } from './house-cysgodion-family.js';
import { HOUSE_DARAN_FAMILY } from './house-daran-family.js';
import { HOUSE_EDMY_FAMILY } from './house-edmy-family.js';
import { HOUSE_GWYNTOG_FAMILY } from './house-gwyntog-family.js';
import { HOUSE_PENWYN_FAMILY } from './house-penwyn-family.js';
import { HOUSE_RHUDDGAR_FAMILY } from './house-rhuddgar-family.js';
import { HOUSE_SELDRYN_FAMILY } from './house-seldryn-family.js';
import { HOUSE_SELOG_FAMILY } from './house-selog-family.js';
import { HOUSE_TARANVYR_FAMILY } from './house-taranvyr-family.js';
import { HOUSE_TAWELGAR_FAMILY } from './house-tawelgar-family.js';
import { HOUSE_TRYDAR_FAMILY } from './house-trydar-family.js';
import { HOUSE_YMLADD_FAMILY } from './house-ymladd-family.js';

const ELABORATED_GWENDOLYNS_UFER_FAMILIES = Object.freeze({
  annwyl: HOUSE_ANNWYL_FAMILY,
  barus: HOUSE_BARUS_FAMILY,
  caerlaen: HOUSE_CAERLAEN_FAMILY,
  caerthwyn: HOUSE_CAERTHWYN_FAMILY,
  cenfig: HOUSE_CENFIG_FAMILY,
  cysgodion: HOUSE_CYSGODION_FAMILY,
  daran: HOUSE_DARAN_FAMILY,
  edmy: HOUSE_EDMY_FAMILY,
  gwyntog: HOUSE_GWYNTOG_FAMILY,
  penwyn: HOUSE_PENWYN_FAMILY,
  rhuddgar: HOUSE_RHUDDGAR_FAMILY,
  seldryn: HOUSE_SELDRYN_FAMILY,
  selog: HOUSE_SELOG_FAMILY,
  taranvyr: HOUSE_TARANVYR_FAMILY,
  tawelgar: HOUSE_TAWELGAR_FAMILY,
  trydar: HOUSE_TRYDAR_FAMILY,
  ymladd: HOUSE_YMLADD_FAMILY
});

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
  GWENDOLYNS_UFER_HOUSE_DEFINITIONS.map(definition => (
    ELABORATED_GWENDOLYNS_UFER_FAMILIES[definition.slug]
    || createFounderPlaceholderHouseFamily({
      id: `haus-${definition.slug}`,
      title: `Haus ${definition.file}`,
      emblem: `assets/images/houses/Gwendolyns Ufer/${definition.folder}/${definition.file}.png`,
      houseProfile: GWENDOLYNS_UFER_VASSAL_PROFILES[definition.slug],
      description: `Vorbereitete Familienakte des Hauses ${definition.file} aus Gwendolyns Ufer.`
    })
  ))
);
