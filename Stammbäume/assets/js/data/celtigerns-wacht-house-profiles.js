import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

export const CELTIGERNS_WACHT_REGION_EMBLEMS = Object.freeze({
  kingdom: 'assets/images/regions/koenigreich-cenyr.png',
  county: 'assets/images/regions/celtigerns-wacht.png',
  seats: Object.freeze({
    Abergwint: 'assets/images/regions/abergwint.png',
    Castellbryn: 'assets/images/regions/castellbryn.png',
    Gwynthor: 'assets/images/regions/gwynthor.png',
    Rhosmere: 'assets/images/regions/rhosmere.png'
  }),
  baronies: Object.freeze({
    'Artus Streben': 'assets/images/regions/artus-streben.png',
    'Gwendolyns Ufer': 'assets/images/regions/gwendolyns-ufer.png',
    'Llamreis Ankunft': 'assets/images/regions/llamreis-ankunft.png',
    'Rhonwens Tränen': 'assets/images/regions/rhonwens-traenen.png'
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
  wyrm: profile('knight-prince', ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'])
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
  loer: lowerKnightProfile('draig', ['Craithglyn'])
});
