import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

export const CEITHEACH_REGION_EMBLEMS = Object.freeze({
  ceitheach: 'assets/images/regions/ceitheach.png',
  tirNaDorcha: 'assets/images/regions/tir-na-dorcha.png'
});

export const CEITHEACH_HOUSE_PROFILES = Object.freeze({
  daire: createHouseProfileFromFolderPath(
    ['Ceitheach', 'Tir na Dorcha', 'Tír na Droma', 'Tulachinis'],
    {
      rankId: 'commoner',
      liegeHouseId: 'clan-mac-tuirseach',
      liegeHouseName: 'Clan Mac Tuirseach',
      regionEmblems: {
        kingdom: CEITHEACH_REGION_EMBLEMS.ceitheach,
        county: CEITHEACH_REGION_EMBLEMS.tirNaDorcha
      }
    }
  )
});
