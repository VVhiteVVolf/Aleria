import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { CEITHEACH_REGION_EMBLEMS } from './ceitheach-house-profiles.js';
import {
  LEITHEACH_HOUSE_EMBLEMS,
  LEITHEACH_HOUSE_PROFILES,
  LEITHEACH_MANAGED_PROFILE_FIELDS,
  LEITHEACH_REGION_EMBLEMS
} from './leitheach-house-profiles.js';

const TERRITORY = 'Tir na Gortanna';
const FRISEALACH_REALM = 'Lehensherrschaft der Ard Frisealach';
const BROCH_AN_CLAIS_REALM = 'Herrschaft von Broch an Clais';

export { LEITHEACH_MANAGED_PROFILE_FIELDS as TIR_NA_GORTANNA_MANAGED_PROFILE_FIELDS };

export const TIR_NA_GORTANNA_HOUSE_EMBLEMS = Object.freeze({
  'dal-cruthin': LEITHEACH_HOUSE_EMBLEMS['dal-cruthin'],
  suileach: 'assets/images/houses/Leitheach/clan-mac-suileach.png',
  frisealach: 'assets/images/houses/Leitheach/clan-ard-frisealach.png',
  'ard-trodach': 'assets/images/houses/Leitheach/clan-ard-trodach.png',
  'nic-caoimhe': 'assets/images/houses/Leitheach/clan-nic-caoimhe.png',
  iomrach: 'assets/images/houses/Leitheach/clan-an-iomrach.png',
  somhairle: 'assets/images/houses/Leitheach/clan-sidhe-somhairle.png'
});

export const TIR_NA_GORTANNA_REGION_EMBLEMS = Object.freeze({
  [FRISEALACH_REALM]: 'assets/images/regions/Leitheach/lehensherrschaft-ard-frisealach.png',
  [BROCH_AN_CLAIS_REALM]: 'assets/images/regions/Leitheach/herrschaft-broch-an-clais.png'
});

export const SIDHE_SOMHAIRLE_ORIGIN = Object.freeze({
  principality: 'Ceitheach',
  territory: 'Tir na Dun',
  territoryGloss: 'Land der Festungen',
  seat: 'Glaennmor',
  principalityEmblem: CEITHEACH_REGION_EMBLEMS.ceitheach,
  territoryEmblem: CEITHEACH_REGION_EMBLEMS.tirNaDun
});

export const TIR_NA_GORTANNA_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({
    slug: 'dal-cruthin',
    title: 'Clan Dál’Cruthin',
    rankId: 'mor-tiarna',
    seat: 'Lochansail',
    liegeHouseId: 'haus-mac-ard-cumhaill',
    liegeHouseName: 'Clan Mac Ard Cumhaill',
    directBarony: true,
    administrativeRole: 'Aktiver Mor Tiarna von Tir na Gortanna'
  }),
  Object.freeze({
    slug: 'suileach',
    title: 'Mac Suileach',
    rankId: 'mor-tiarna',
    seat: 'Lochansail',
    liegeHouseId: 'haus-mac-ard-cumhaill',
    liegeHouseName: 'Clan Mac Ard Cumhaill',
    extinct: true,
    formerMorTiarna: true,
    directBarony: true,
    legacyTitles: Object.freeze(['Haus Suileach']),
    administrativeRole: 'Ehemaliger Mor Tiarna von Tir na Gortanna'
  }),
  Object.freeze({
    slug: 'frisealach',
    title: 'Ard Frisealach',
    rankId: 'dun-tiarna',
    realm: FRISEALACH_REALM,
    seat: 'Lasbun',
    liegeHouseId: 'haus-dal-cruthin',
    liegeHouseName: 'Clan Dál’Cruthin',
    legacyTitles: Object.freeze(['Haus Frisealach', 'Clan Frisealach']),
    administrativeRole: 'Dún Tiarna der Lehensherrschaft Ard Frisealach'
  }),
  Object.freeze({
    slug: 'ard-trodach',
    title: 'Ard Trodach',
    rankId: 'laird',
    seat: 'Lochansail',
    liegeHouseId: 'haus-dal-cruthin',
    liegeHouseName: 'Clan Dál’Cruthin',
    directBarony: true,
    administrativeRole: 'Laird innerhalb Lochansails'
  }),
  Object.freeze({
    slug: 'nic-caoimhe',
    title: 'Nic Caoimhe',
    rankId: 'laird',
    seat: 'Lochansail',
    liegeHouseId: 'haus-dal-cruthin',
    liegeHouseName: 'Clan Dál’Cruthin',
    directBarony: true,
    administrativeRole: 'Laird innerhalb Lochansails'
  }),
  Object.freeze({
    slug: 'iomrach',
    title: 'An’Iomrach',
    rankId: 'laird',
    realm: BROCH_AN_CLAIS_REALM,
    seat: 'Broch an Clais',
    liegeHouseId: 'haus-dal-cruthin',
    liegeHouseName: 'Clan Dál’Cruthin',
    extinct: true,
    legacyTitles: Object.freeze(['Haus Iomrach']),
    administrativeRole: 'Erloschener ehemaliger Laird von Broch an Clais'
  }),
  Object.freeze({
    slug: 'somhairle',
    title: 'Sidhe Somhairle',
    rankId: 'laird',
    realm: BROCH_AN_CLAIS_REALM,
    seat: 'Broch an Clais',
    liegeHouseId: 'haus-dal-cruthin',
    liegeHouseName: 'Clan Dál’Cruthin',
    administrativeRole: 'Laird und Verwalter von Broch an Clais',
    legacyTitles: Object.freeze(['Clan Somhairle']),
    origin: SIDHE_SOMHAIRLE_ORIGIN
  })
]);

function createTirNaGortannaHouseProfile(definition) {
  // Der territoriale Hauptclan bleibt dasselbe Profilobjekt wie im Leitheach-
  // Gesamtkatalog. So existiert Dál’Cruthin weder doppelt noch unter zwei Pfaden.
  if (definition.slug === 'dal-cruthin') return LEITHEACH_HOUSE_PROFILES['dal-cruthin'];

  const territoryEmblem = LEITHEACH_REGION_EMBLEMS.territories[TERRITORY];
  const realmEmblem = definition.realm
    ? TIR_NA_GORTANNA_REGION_EMBLEMS[definition.realm]
    : '';
  // Die nicht eigens benannte Mor-Tiarna-Eigenbaronie wird ohne erfundenen
  // Zwischenordner direkt über ihren überlieferten Hauptort Lochansail geführt.
  const folderPath = definition.realm
    ? ['Leitheach', TERRITORY, definition.realm, definition.seat]
    : ['Leitheach', TERRITORY];
  const profile = createHouseProfileFromFolderPath(folderPath, {
    rankId: definition.rankId,
    seat: definition.seat,
    liegeHouseId: definition.liegeHouseId,
    liegeHouseName: definition.liegeHouseName,
    folderIcons: definition.realm
      ? [LEITHEACH_REGION_EMBLEMS.principality, territoryEmblem, realmEmblem, '']
      : [LEITHEACH_REGION_EMBLEMS.principality, territoryEmblem, ''],
    regionEmblems: {
      kingdom: LEITHEACH_REGION_EMBLEMS.principality,
      county: territoryEmblem,
      barony: realmEmblem,
      seat: ''
    }
  });

  return Object.freeze({
    ...profile,
    secondarySeats: Object.freeze([...profile.secondarySeats]),
    folderIcons: Object.freeze([...profile.folderIcons]),
    regionEmblems: Object.freeze({ ...profile.regionEmblems })
  });
}

export const TIR_NA_GORTANNA_HOUSE_PROFILES = Object.freeze(Object.fromEntries(
  TIR_NA_GORTANNA_HOUSE_DEFINITIONS.map(definition => [
    definition.slug,
    createTirNaGortannaHouseProfile(definition)
  ])
));
