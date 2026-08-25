import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

export const CELTIGERNS_WACHT_REGION_EMBLEMS = Object.freeze({
  kingdom: 'assets/images/regions/koenigreich-cenyr.png',
  county: 'assets/images/regions/celtigerns-wacht.png',
  seats: Object.freeze({
    Abergwint: 'assets/images/regions/abergwint.png',
    Castellbryn: 'assets/images/regions/castellbryn.png',
    Gwynthor: 'assets/images/regions/gwynthor.png',
    Morddyn: 'assets/images/regions/Cenyr/Celtigerns Wacht/Gwendolyns Ufer/Morddyn.png',
    'Côr Mynyddfaen': 'assets/images/regions/Cenyr/Celtigerns Wacht/Gwendolyns Ufer/Côr Mynyddfaen.png',
    Garwfaen: 'assets/images/regions/Cenyr/Celtigerns Wacht/Gwendolyns Ufer/Garwfaen.png',
    Rhosmere: 'assets/images/regions/rhosmere.png',
    // Neue Sitz-Wappen liegen in einer nach der Orts-Hierarchie verschachtelten Ordnerstruktur.
    Aberllan: 'assets/images/regions/Cenyr/Celtigerns Wacht/Camruisge/Aberllan.png',
    Lynthor: 'assets/images/regions/Cenyr/Celtigerns Wacht/Llamreis Ankunft/Lynthor.png',
    Llysfaen: 'assets/images/regions/Cenyr/Celtigerns Wacht/Llamreis Ankunft/Llysfaen.png',
    // Antike, längst verfallene Sitze der Crannath-Clans tragen dasselbe Ruinen-Icon.
    Lycath: 'assets/images/regions/AntikeIcon.png',
    'Antikes Gwynthor': 'assets/images/regions/AntikeIcon.png'
  }),
  baronies: Object.freeze({
    'Artus Streben': 'assets/images/regions/artus-streben.png',
    'Camruisge': 'assets/images/regions/camruisge.png',
    'Gwendolyns Ufer': 'assets/images/regions/gwendolyns-ufer.png',
    'Llamreis Ankunft': 'assets/images/regions/llamreis-ankunft.png',
    'Rhonwens Tränen': 'assets/images/regions/rhonwens-traenen.png',
    'Antike Crannath Clans': 'assets/images/regions/AntikeIcon.png'
  })
});

function profile(rankId, folderPath, options = {}) {
  const barony = folderPath[2];
  const result = createHouseProfileFromFolderPath(folderPath, {
    rankId,
    secondarySeats: options.secondarySeats || [],
    liegeHouseId: options.liegeHouseId || '',
    liegeHouseName: options.liegeHouseName || '',
    regionEmblems: {
      seat: CELTIGERNS_WACHT_REGION_EMBLEMS.seats[folderPath[3]] || '',
      kingdom: CELTIGERNS_WACHT_REGION_EMBLEMS.kingdom,
      county: CELTIGERNS_WACHT_REGION_EMBLEMS.county,
      barony: CELTIGERNS_WACHT_REGION_EMBLEMS.baronies[barony] || ''
    }
  });
  return Object.freeze({
    ...result,
    secondarySeats: Object.freeze([...result.secondarySeats]),
    regionEmblems: Object.freeze({ ...result.regionEmblems })
  });
}

export const CELTIGERNS_WACHT_HOUSE_PROFILES = Object.freeze({
  arwydd: profile('knight-prince', ['Cenyr', 'Celtigerns Wacht', 'Rhonwens Tränen', 'Castellbryn']),
  illysywen: profile('knight-prince', ['Cenyr', 'Celtigerns Wacht', 'Rhonwens Tränen', 'Castellbryn']),
  draig: profile('county', ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']),
  gafyr: profile('knight-prince', ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']),
  gwefrydd: profile('barony', ['Cenyr', 'Celtigerns Wacht', 'Artus Streben', 'Rhosmere']),
  gwyvern: profile('barony', ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Abergwint']),
  saethwyr: profile('knight-prince', ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']),
  wyrm: profile('knight-prince', ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']),
  // Camruisge ist ein Herrschaftsgebiet direkt unter Celtigerns Wacht (wie Rhonwens Tränen);
  // für den Sitz Aberllan liegt noch kein Wappenbild vor.
  garrael: profile('knight', ['Cenyr', 'Celtigerns Wacht', 'Camruisge', 'Aberllan'], {
    liegeHouseId: 'haus-draig',
    liegeHouseName: 'Haus Draig'
  }),
  // Aus Clan Wolfshorn hervorgegangenes Ritterherrenhaus. Der neue Sitz liegt in
  // Gwynthor; Haus Draig ist nach Hrolfs Auswanderung der neue Lehnsherr.
  bleiddorn: profile('knight', ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'], {
    liegeHouseId: 'haus-draig',
    liegeHouseName: 'Haus Draig'
  }),
  // Neu begründete Gwynthor-Linie der aus Faelaorn ausgewanderten Sept Dubhan.
  dubhanGwynthor: profile('knight', ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'], {
    liegeHouseId: 'haus-draig',
    liegeHouseName: 'Haus Draig'
  }),
  // Von Aldo Falveri neu begründetes Ritterherrenhaus am eigenen Sitz Tŵr Traethlan.
  // Der Falveri-Ursprung bleibt in der Familienakte als Herkunftshaus verknüpft.
  cymrathOTraethlan: profile('knight', ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Tŵr Traethlan'], {
    liegeHouseId: 'haus-draig',
    liegeHouseName: 'Haus Draig'
  }),
  // Bürgerliches Haus, kein Rittergeschlecht: sitzt im generischen Gwynthor-Pfad, aber
  // außerhalb der LOWER_KNIGHT_HOUSE_DEFINITIONS (die ist strikt an rankId 'knight' gebunden).
  gwyllach: profile('commoner', ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'], {
    liegeHouseId: 'haus-draig',
    liegeHouseName: 'Haus Draig'
  }),
  // Bürgerliches Haus aus Lynthor, einem eigenen Sitz direkt unter Llamreis Ankunft
  // (Geschwister-Eintrag zu Gwynthor, nicht der generische Gwynthor-Pfad).
  sgrechiwr: profile('commoner', ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Lynthor'], {
    liegeHouseId: 'haus-draig',
    liegeHouseName: 'Haus Draig'
  }),
  // Sitzt seit dem Fall Illysywens (1720) am selben Sitz wie sein neuer Lehnsherr
  // Haus Arwydd; ersetzt den generischen dreistufigen Platzhalterpfad aus
  // RHONWENS_TRAENEN_VASSAL_PROFILES, sobald das Haus ausgearbeitet ist.
  gwared: profile('knight', ['Cenyr', 'Celtigerns Wacht', 'Rhonwens Tränen', 'Castellbryn'], {
    liegeHouseId: 'haus-arwydd',
    liegeHouseName: 'Haus Arwydd'
  }),
  // Antikes, vorcenyrisches Albenclan-Geschlecht, kein Vasall eines modernen Lehnsherrn.
  // 'Antike Crannath Clans' ist ein eigenes Herrschaftsgebiet direkt unter Celtigerns
  // Wacht (wie Camruisge/Rhonwens Tränen), Sitz Lycath laut Vorlage.
  ardConbhron: profile('dun-tiarna', ['Cenyr', 'Celtigerns Wacht', 'Antike Crannath Clans', 'Lycath']),
  // Einst das Fürstengeschlecht des vorcenyrischen "Fürstentums von Oseneach"; heute
  // vollständig in andere Häuser eingeheiratet und ausgestorben. Sitz laut Vorlage
  // "??? (Gwynthor)" — der genaue alte Name ist nicht überliefert, der Sitz entspricht
  // ungefähr dem heutigen Gwynthor, ist aber selbst nur noch Ruine ("Antikes Gwynthor"),
  // um ihn vom heutigen, gleichnamigen Sitz unter Llamreis Ankunft zu unterscheiden.
  uiTalamh: profile('ard-tiarna', ['Cenyr', 'Celtigerns Wacht', 'Antike Crannath Clans', 'Antikes Gwynthor'])
});

const GWYNTHOR_COMMONER_PATH = Object.freeze([
  'Cenyr',
  'Celtigerns Wacht',
  'Llamreis Ankunft',
  'Gwynthor'
]);

function gwynthorCommonerProfile() {
  return profile('commoner', GWYNTHOR_COMMONER_PATH, {
    liegeHouseId: 'haus-draig',
    liegeHouseName: 'Haus Draig'
  });
}

export const GWYNTHOR_COMMONER_HOUSE_PROFILES = Object.freeze({
  draenmelyn: gwynthorCommonerProfile(),
  pendrwn: gwynthorCommonerProfile(),
  swyll: gwynthorCommonerProfile(),
  aelmor: gwynthorCommonerProfile(),
  maerllys: gwynthorCommonerProfile(),
  braglas: gwynthorCommonerProfile(),
  tonnarth: gwynthorCommonerProfile(),
  ysgrif: gwynthorCommonerProfile()
});

const LLYSFAEN_COMMONER_PATH = Object.freeze([
  'Cenyr',
  'Celtigerns Wacht',
  'Llamreis Ankunft',
  'Llysfaen'
]);

function llysfaenCommonerProfile() {
  return profile('commoner', LLYSFAEN_COMMONER_PATH, {
    liegeHouseId: 'haus-wyrm',
    liegeHouseName: 'Haus Wyrm'
  });
}

export const LLYSFAEN_COMMONER_HOUSE_PROFILES = Object.freeze({
  argall: llysfaenCommonerProfile()
});

const LOWER_KNIGHT_PATH = Object.freeze(['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']);

function lowerKnightProfile(liegeHouseId, secondarySeats = []) {
  const name = liegeHouseId.slice(0, 1).toLocaleUpperCase('de') + liegeHouseId.slice(1);
  return profile('knight', LOWER_KNIGHT_PATH, {
    liegeHouseId: `haus-${liegeHouseId}`,
    liegeHouseName: `Haus ${name}`,
    secondarySeats
  });
}

// Neu angelegte, noch nicht ausgearbeitete Vasallenhäuser (Juli 2026). Rittergeschlecht
// ("Niedere Ritterliche" und "Ritterliche" sind laut Absprache dieselbe Rangstufe) =
// 'knight', Bürgerliche = 'commoner'. Kein Lehnsherr zugewiesen, bis das politisch
// geklärt ist. Artus Streben und Gwendolyns Ufer sitzen inzwischen (User-Vorgabe) am
// selben Sitz wie ihr jeweiliger Baron — Rhosmere (Haus Gwefrydd) bzw. Abergwint
// (Haus Gwyvern). Rhonwens Tränen bleibt vorerst ohne festen Sitz (dreistufiger Pfad).
const ARTUS_STREBEN_PATH = Object.freeze(['Cenyr', 'Celtigerns Wacht', 'Artus Streben', 'Rhosmere']);
const GWENDOLYNS_UFER_PATH = Object.freeze(['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Abergwint']);
const GWENDOLYNS_UFER_COR_MYNYDDFAEN_PATH = Object.freeze(['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Côr Mynyddfaen']);
const GWENDOLYNS_UFER_GARWFAEN_PATH = Object.freeze(['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Garwfaen']);
const GWENDOLYNS_UFER_MORDDYN_PATH = Object.freeze(['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Morddyn']);
const RHONWENS_TRAENEN_PATH = Object.freeze(['Cenyr', 'Celtigerns Wacht', 'Rhonwens Tränen']);

export const ARTUS_STREBEN_VASSAL_PROFILES = Object.freeze({
  almarch: profile('knight', ARTUS_STREBEN_PATH),
  althin: profile('knight', ARTUS_STREBEN_PATH),
  brinmarch: profile('knight', ARTUS_STREBEN_PATH),
  coedvarn: profile('knight', ARTUS_STREBEN_PATH),
  eirfael: profile('knight', ARTUS_STREBEN_PATH),
  ghorswyn: profile('knight', ARTUS_STREBEN_PATH),
  gwardin: profile('knight', ARTUS_STREBEN_PATH),
  gwynrhos: profile('knight', ARTUS_STREBEN_PATH),
  talmeirch: profile('knight', ARTUS_STREBEN_PATH),
  tirwyn: profile('knight', ARTUS_STREBEN_PATH),
  bekab: profile('commoner', ARTUS_STREBEN_PATH),
  iorwen: profile('commoner', ARTUS_STREBEN_PATH),
  maethan: profile('commoner', ARTUS_STREBEN_PATH),
  rhen: profile('commoner', ARTUS_STREBEN_PATH)
});

export const GWENDOLYNS_UFER_VASSAL_PROFILES = Object.freeze({
  annwyl: profile('knight', GWENDOLYNS_UFER_COR_MYNYDDFAEN_PATH, {
    liegeHouseId: 'haus-gwyvern',
    liegeHouseName: 'Haus Gwyvern'
  }),
  barus: profile('knight', GWENDOLYNS_UFER_PATH, {
    liegeHouseId: 'haus-gwyvern',
    liegeHouseName: 'Haus Gwyvern'
  }),
  cenfig: profile('knight', GWENDOLYNS_UFER_PATH, {
    liegeHouseId: 'haus-gwyvern',
    liegeHouseName: 'Haus Gwyvern'
  }),
  cysgodion: profile('knight', GWENDOLYNS_UFER_PATH, {
    liegeHouseId: 'haus-gwyvern',
    liegeHouseName: 'Haus Gwyvern'
  }),
  daran: profile('knight', GWENDOLYNS_UFER_GARWFAEN_PATH, {
    liegeHouseId: 'haus-gwyvern',
    liegeHouseName: 'Haus Gwyvern'
  }),
  edmy: profile('knight', GWENDOLYNS_UFER_PATH, {
    liegeHouseId: 'haus-gwyvern',
    liegeHouseName: 'Haus Gwyvern'
  }),
  gwyntog: profile('knight', GWENDOLYNS_UFER_PATH, {
    liegeHouseId: 'haus-gwyvern',
    liegeHouseName: 'Haus Gwyvern'
  }),
  penwyn: profile('knight', GWENDOLYNS_UFER_MORDDYN_PATH, {
    liegeHouseId: 'haus-draig',
    liegeHouseName: 'Haus Draig'
  }),
  rhuddgar: profile('knight', GWENDOLYNS_UFER_PATH, {
    liegeHouseId: 'haus-gwyvern',
    liegeHouseName: 'Haus Gwyvern'
  }),
  seldryn: profile('knight', GWENDOLYNS_UFER_PATH, {
    liegeHouseId: 'haus-gwyvern',
    liegeHouseName: 'Haus Gwyvern'
  }),
  selog: profile('knight', GWENDOLYNS_UFER_PATH, {
    liegeHouseId: 'haus-gwyvern',
    liegeHouseName: 'Haus Gwyvern',
    secondarySeats: ['Burg am Feuerstollen']
  }),
  taranvyr: profile('knight', GWENDOLYNS_UFER_PATH, {
    liegeHouseId: 'haus-gwyvern',
    liegeHouseName: 'Haus Gwyvern'
  }),
  tawelgar: profile('knight', GWENDOLYNS_UFER_PATH, {
    liegeHouseId: 'haus-gwyvern',
    liegeHouseName: 'Haus Gwyvern'
  }),
  trydar: profile('knight', GWENDOLYNS_UFER_PATH, {
    liegeHouseId: 'haus-gwyvern',
    liegeHouseName: 'Haus Gwyvern'
  }),
  ymladd: profile('knight', GWENDOLYNS_UFER_PATH, {
    liegeHouseId: 'haus-gwyvern',
    liegeHouseName: 'Haus Gwyvern'
  }),
  caerlaen: profile('commoner', GWENDOLYNS_UFER_PATH, {
    liegeHouseId: 'haus-gwyvern',
    liegeHouseName: 'Haus Gwyvern'
  }),
  caerthwyn: profile('commoner', GWENDOLYNS_UFER_PATH, {
    liegeHouseId: 'haus-gwyvern',
    liegeHouseName: 'Haus Gwyvern'
  })
});

// Morveth und Skellor liegen im "Ausgestorben"-Unterordner (bereits erloschene Linien),
// bekommen aber denselben Rang/Pfad wie die übrigen Rhonwens-Tränen-Rittergeschlechter.
// Gwared ist inzwischen ausgearbeitet und hat einen eigenen Eintrag in
// CELTIGERNS_WACHT_HOUSE_PROFILES (eigener Sitz, eigener Lehnsherr).
export const RHONWENS_TRAENEN_VASSAL_PROFILES = Object.freeze({
  madryn: profile('knight', RHONWENS_TRAENEN_PATH),
  merek: profile('knight', RHONWENS_TRAENEN_PATH),
  rhenna: profile('knight', RHONWENS_TRAENEN_PATH),
  talinvyr: profile('knight', RHONWENS_TRAENEN_PATH),
  morveth: profile('knight', RHONWENS_TRAENEN_PATH),
  skellor: profile('knight', RHONWENS_TRAENEN_PATH)
});

export const CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES = Object.freeze({
  tlawd: lowerKnightProfile('gafyr'),
  rhyddid: lowerKnightProfile('wyrm', ['Mwyncraig']),
  gelyn: lowerKnightProfile('draig', ['Gwynthstorm']),
  cludwyr: lowerKnightProfile('wyrm', ['Bronhir']),
  chwedlonol: lowerKnightProfile('saethwyr', ['Glastraeth']),
  balchder: lowerKnightProfile('draig'),
  eneiniog: lowerKnightProfile('saethwyr'),
  gostyn: lowerKnightProfile('gafyr', ['Bronfelen']),
  awenydd: lowerKnightProfile('draig'),
  awenor: lowerKnightProfile('draig'),
  loer: lowerKnightProfile('wyrm', ['Craithglyn'])
});
