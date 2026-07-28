import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

export const MORGORN_REGION_EMBLEMS = Object.freeze({
  morgorn: 'assets/images/regions/morgorn.png'
});

export const MORGORN_HOUSE_PROFILES = Object.freeze({
  karreg: createHouseProfileFromFolderPath(
    ['Morgorn', 'Region Felsbreche', 'Felsbreche'],
    {
      rankId: 'knight',
      secondarySeats: ['Burg Karregwacht'],
      liegeHouseId: 'house-eisenherz',
      liegeHouseName: 'Haus Eisenherz',
      regionEmblems: {
        kingdom: MORGORN_REGION_EMBLEMS.morgorn
      }
    }
  )
});
