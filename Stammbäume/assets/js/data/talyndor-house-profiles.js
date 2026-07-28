import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

export const TALYNDOR_REGION_EMBLEMS = Object.freeze({
  talyndor: 'assets/images/regions/talyndor.png'
});

export const TALYNDOR_HOUSE_PROFILES = Object.freeze({
  thornwick: createHouseProfileFromFolderPath(
    ['Talyndor', 'Earltum der Warren', 'Thaintum der Warren', 'Thornholt'],
    {
      rankId: 'knight',
      secondarySeats: ['Waldburg Thornholt (1720 verloren)'],
      liegeHouseId: 'house-warren',
      liegeHouseName: 'Haus Warren',
      regionEmblems: {
        kingdom: TALYNDOR_REGION_EMBLEMS.talyndor
      }
    }
  )
});
