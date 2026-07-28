import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

export const GOLDMUND_REGION_EMBLEMS = Object.freeze({
  goldmund: 'assets/images/regions/goldmund.png'
});

export const GOLDMUND_HOUSE_PROFILES = Object.freeze({
  hochreuth: createHouseProfileFromFolderPath(
    ['Goldmund', 'Unsortierte Häuser'],
    {
      rankId: 'knight',
      secondarySeats: ['Burg Hochreuth (1736 an Ottos Linie gefallen)'],
      liegeHouseId: 'haus-roden',
      liegeHouseName: 'Haus Roden',
      regionEmblems: {
        kingdom: GOLDMUND_REGION_EMBLEMS.goldmund
      }
    }
  )
});
