import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import {
  ALDRIMAR_HOUSE_EMBLEMS,
  ALDRIMAR_HOUSE_PROFILES,
  ALDRIMAR_REGION_EMBLEMS
} from './aldrimar-house-profiles.js';

const KRONENTAL_ROOT = Object.freeze(['Aldrimar', 'Kronental']);
const HELDENWACHT_PATH = Object.freeze([
  ...KRONENTAL_ROOT,
  'Jarltümliche Herrschaft – Tal der Helden',
  'Heldenwacht'
]);
const SPINDELHEIM_PATH = Object.freeze([
  ...KRONENTAL_ROOT,
  'Jarltümliche Herrschaft – Tal der Helden',
  'Spindelheim'
]);
const MOEWENFELS_PATH = Object.freeze([...KRONENTAL_ROOT, 'Hesirentum von Möwenfels', 'Kastav']);
const WELLENKLANG_PATH = Object.freeze([...KRONENTAL_ROOT, 'Hesirentum von Wellenklang', 'Amol']);
const KLAGESCHILD_ROOT = Object.freeze([...KRONENTAL_ROOT, 'Klageschild-Inseln']);
const KLAGESCHILD_PATH = Object.freeze([...KLAGESCHILD_ROOT, 'Wellenruh']);
const EIBENSCHILD_PATH = Object.freeze([...KLAGESCHILD_ROOT, 'Vagaborg']);
const UNLOCATED_PATH = Object.freeze([...KRONENTAL_ROOT, 'Nicht verortet']);
const OUTLAW_PATH = Object.freeze([
  ...KRONENTAL_ROOT,
  'Abtrünnige Clans',
  'Sirenen-Zahn-Riff-Inselgruppe',
  'Vintrefjord'
]);
const EXTINCT_ROOT = Object.freeze([...KRONENTAL_ROOT, 'Ausgestorbene Clans']);

export const KRONENTAL_EXTINCT_CLAN_GROUPS = Object.freeze({
  norrnaigh: 'Norrnaigh (Nordmänner)',
  glaennath: 'Glaennath (Alben)'
});

export const KRONENTAL_REGION_EMBLEMS = Object.freeze({
  talDerHelden: 'assets/images/regions/aldrimar-kronental-tal-der-helden.png',
  moewenfels: 'assets/images/regions/aldrimar-kronental-moewenfels.png',
  wellenklang: 'assets/images/regions/aldrimar-kronental-wellenklang.png',
  klageschildInseln: 'assets/images/regions/aldrimar-kronental-klageschild-inseln.png',
  torrenwacht: 'assets/images/regions/aldrimar-kronental-torrenwacht.png',
  sirenenZahnRiff: 'assets/images/regions/aldrimar-kronental-sirenen-zahn-riff.png',
  city: 'assets/images/regions/aldrimar-stadt.png',
  extinct: 'assets/images/regions/Cenyr/Ährental/Ausgestorben.png'
});

const HOUSE_ROOT = 'assets/images/houses/Aldrimar/Kronental';
const PLACEHOLDER_EMBLEM = 'assets/images/placeholders/neutral-crest.png';

export const KRONENTAL_HOUSE_EMBLEMS = Object.freeze({
  vaeren: ALDRIMAR_HOUSE_EMBLEMS.vaeren,
  riesentod: `${HOUSE_ROOT}/clan-riesentod.png`,
  eisenbieger: `${HOUSE_ROOT}/clan-eisenbieger.png`,
  sturmgeborene: `${HOUSE_ROOT}/clan-sturmgeborene.png`,
  frostauge: `${HOUSE_ROOT}/clan-frostauge.png`,
  wellenschild: `${HOUSE_ROOT}/clan-wellenschild.png`,
  eibenschild: `${HOUSE_ROOT}/clan-eibenschild.png`,
  gullvig: `${HOUSE_ROOT}/clan-gullvig.png`,
  wellensaenger: `${HOUSE_ROOT}/clan-wellensaenger.png`,
  spindelschlag: `${HOUSE_ROOT}/clan-spindelschlag.png`,
  suedstahl: `${HOUSE_ROOT}/clan-suedstahl.png`,
  albholz: `${HOUSE_ROOT}/clan-albholz.png`,
  daemmerrufer: `${HOUSE_ROOT}/clan-daemmerrufer.png`,
  wellenkrone: `${HOUSE_ROOT}/clan-wellenkrone.png`,
  donnerblut: PLACEHOLDER_EMBLEM,
  moorbrand: PLACEHOLDER_EMBLEM,
  jormung: PLACEHOLDER_EMBLEM,
  nidfengr: PLACEHOLDER_EMBLEM,
  tarbhann: PLACEHOLDER_EMBLEM,
  bjarnvarg: PLACEHOLDER_EMBLEM,
  tauwind: PLACEHOLDER_EMBLEM,
  morchaon: PLACEHOLDER_EMBLEM,
  hvelgrson: PLACEHOLDER_EMBLEM,
  frostzorn: `${HOUSE_ROOT}/clan-frostzorn.png`,
  grimr: `${HOUSE_ROOT}/clan-grimr.png`,
  skaife: `${HOUSE_ROOT}/clan-skaife.png`,
  holmr: `${HOUSE_ROOT}/clan-holmr.png`,
  isvanyr: `${HOUSE_ROOT}/clan-isvanyr.png`,
  'mac-mamhar': `${HOUSE_ROOT}/clan-mac-mamhar.png`
});

const VAEREN_LIEGE = Object.freeze({
  liegeHouseId: 'house-vaeren',
  liegeHouseName: 'Clan Vaeren'
});

function freezeProfile(profile) {
  return Object.freeze({
    ...profile,
    secondarySeats: Object.freeze([...profile.secondarySeats]),
    ...(profile.folderPath ? { folderPath: Object.freeze([...profile.folderPath]) } : {}),
    ...(profile.folderIcons ? { folderIcons: Object.freeze([...profile.folderIcons]) } : {}),
    regionEmblems: Object.freeze({ ...profile.regionEmblems })
  });
}

function kronentalProfile(rankId, path, options = {}) {
  const folderIcons = options.folderIcons || [
    ALDRIMAR_REGION_EMBLEMS.aldrimar,
    ALDRIMAR_REGION_EMBLEMS.kronental,
    options.baronyEmblem || '',
    options.seatEmblem || KRONENTAL_REGION_EMBLEMS.city
  ];
  return freezeProfile(createHouseProfileFromFolderPath(path, {
    rankId,
    liegeHouseId: options.liegeHouseId === undefined ? VAEREN_LIEGE.liegeHouseId : options.liegeHouseId,
    liegeHouseName: options.liegeHouseName === undefined ? VAEREN_LIEGE.liegeHouseName : options.liegeHouseName,
    secondarySeats: options.secondarySeats || [],
    folderIcons,
    regionEmblems: {
      kingdom: ALDRIMAR_REGION_EMBLEMS.aldrimar,
      county: ALDRIMAR_REGION_EMBLEMS.kronental,
      barony: options.baronyEmblem || '',
      seat: options.seatEmblem || KRONENTAL_REGION_EMBLEMS.city
    }
  }));
}

function extinctProfile(slug, group, options = {}) {
  const location = options.location || [];
  const path = [...EXTINCT_ROOT, group, ...location];
  const locationIcons = location.map((_, index) => (
    index === 0 ? (options.territoryEmblem || KRONENTAL_REGION_EMBLEMS.extinct) : KRONENTAL_REGION_EMBLEMS.city
  ));
  return kronentalProfile('unknown', path, {
    liegeHouseId: '',
    liegeHouseName: '',
    secondarySeats: options.secondarySeats || [],
    folderIcons: [
      ALDRIMAR_REGION_EMBLEMS.aldrimar,
      ALDRIMAR_REGION_EMBLEMS.kronental,
      KRONENTAL_REGION_EMBLEMS.extinct,
      KRONENTAL_REGION_EMBLEMS.extinct,
      ...locationIcons
    ],
    baronyEmblem: KRONENTAL_REGION_EMBLEMS.extinct,
    seatEmblem: locationIcons.at(-1) || KRONENTAL_REGION_EMBLEMS.extinct
  });
}

const HELDENWACHT_HUSKARLS = Object.freeze(['suedstahl', 'albholz', 'daemmerrufer', 'wellenkrone']);
const UNLOCATED_HUSKARLS = Object.freeze(['donnerblut', 'moorbrand', 'jormung', 'nidfengr', 'tarbhann', 'bjarnvarg', 'tauwind']);

export const KRONENTAL_HOUSE_PROFILES = Object.freeze({
  vaeren: ALDRIMAR_HOUSE_PROFILES.vaeren,
  frostauge: kronentalProfile('hesire', HELDENWACHT_PATH, {
    baronyEmblem: KRONENTAL_REGION_EMBLEMS.talDerHelden
  }),
  sturmgeborene: kronentalProfile('hesire', HELDENWACHT_PATH, {
    baronyEmblem: KRONENTAL_REGION_EMBLEMS.talDerHelden
  }),
  eisenbieger: kronentalProfile('hesire', HELDENWACHT_PATH, {
    baronyEmblem: KRONENTAL_REGION_EMBLEMS.talDerHelden
  }),
  riesentod: kronentalProfile('hesire', HELDENWACHT_PATH, {
    baronyEmblem: KRONENTAL_REGION_EMBLEMS.talDerHelden
  }),
  gullvig: kronentalProfile('hesire', MOEWENFELS_PATH, {
    baronyEmblem: KRONENTAL_REGION_EMBLEMS.moewenfels
  }),
  wellensaenger: kronentalProfile('hesire', WELLENKLANG_PATH, {
    baronyEmblem: KRONENTAL_REGION_EMBLEMS.wellenklang
  }),
  wellenschild: kronentalProfile('hesire', KLAGESCHILD_PATH, {
    baronyEmblem: KRONENTAL_REGION_EMBLEMS.klageschildInseln
  }),
  eibenschild: kronentalProfile('huskarl', EIBENSCHILD_PATH, {
    liegeHouseId: 'house-wellenschild',
    liegeHouseName: 'Clan Wellenschild',
    baronyEmblem: KRONENTAL_REGION_EMBLEMS.klageschildInseln,
    folderIcons: [
      ALDRIMAR_REGION_EMBLEMS.aldrimar,
      ALDRIMAR_REGION_EMBLEMS.kronental,
      KRONENTAL_REGION_EMBLEMS.klageschildInseln,
      KRONENTAL_REGION_EMBLEMS.city
    ]
  }),
  spindelschlag: kronentalProfile('huskarl', SPINDELHEIM_PATH, {
    baronyEmblem: KRONENTAL_REGION_EMBLEMS.talDerHelden
  }),
  ...Object.fromEntries(HELDENWACHT_HUSKARLS.map(slug => [slug, kronentalProfile('huskarl', HELDENWACHT_PATH, {
    baronyEmblem: KRONENTAL_REGION_EMBLEMS.talDerHelden
  })])),
  ...Object.fromEntries(UNLOCATED_HUSKARLS.map(slug => [slug, kronentalProfile('huskarl', UNLOCATED_PATH, {
    seatEmblem: '',
    folderIcons: [
      ALDRIMAR_REGION_EMBLEMS.aldrimar,
      ALDRIMAR_REGION_EMBLEMS.kronental,
      ''
    ]
  })])),
  morchaon: kronentalProfile('commoner', UNLOCATED_PATH, {
    liegeHouseId: '',
    liegeHouseName: '',
    seatEmblem: '',
    folderIcons: [ALDRIMAR_REGION_EMBLEMS.aldrimar, ALDRIMAR_REGION_EMBLEMS.kronental, '']
  }),
  hvelgrson: kronentalProfile('commoner', UNLOCATED_PATH, {
    liegeHouseId: '',
    liegeHouseName: '',
    seatEmblem: '',
    folderIcons: [ALDRIMAR_REGION_EMBLEMS.aldrimar, ALDRIMAR_REGION_EMBLEMS.kronental, '']
  }),
  frostzorn: kronentalProfile('unknown', OUTLAW_PATH, {
    liegeHouseId: '',
    liegeHouseName: '',
    baronyEmblem: KRONENTAL_REGION_EMBLEMS.sirenenZahnRiff,
    folderIcons: [
      ALDRIMAR_REGION_EMBLEMS.aldrimar,
      ALDRIMAR_REGION_EMBLEMS.kronental,
      '',
      KRONENTAL_REGION_EMBLEMS.sirenenZahnRiff,
      KRONENTAL_REGION_EMBLEMS.city
    ]
  }),
  grimr: extinctProfile('grimr', KRONENTAL_EXTINCT_CLAN_GROUPS.norrnaigh, {
    location: ['Hesirentum von Torrenwacht', 'Torrenheim'],
    territoryEmblem: KRONENTAL_REGION_EMBLEMS.torrenwacht
  }),
  skaife: extinctProfile('skaife', KRONENTAL_EXTINCT_CLAN_GROUPS.norrnaigh, {
    location: ['Hesirentum von Torrenwacht', 'Torrenheim'],
    territoryEmblem: KRONENTAL_REGION_EMBLEMS.torrenwacht
  }),
  holmr: extinctProfile('holmr', KRONENTAL_EXTINCT_CLAN_GROUPS.norrnaigh, {
    location: ['Hesirentum von Torrenwacht', 'Torrenheim'],
    territoryEmblem: KRONENTAL_REGION_EMBLEMS.torrenwacht
  }),
  isvanyr: extinctProfile('isvanyr', KRONENTAL_EXTINCT_CLAN_GROUPS.norrnaigh),
  'mac-mamhar': extinctProfile('mac-mamhar', KRONENTAL_EXTINCT_CLAN_GROUPS.glaennath)
});
