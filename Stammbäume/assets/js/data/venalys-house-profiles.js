import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

export const VENALYS_REGION_EMBLEMS = Object.freeze({
  venalys: 'assets/images/regions/venalys.png'
});

export const VENALYS_HOUSE_PROFILES = Object.freeze({
  falveri: createHouseProfileFromFolderPath(
    ['Venalys'],
    {
      rankId: 'magnarian',
      regionEmblems: {
        kingdom: VENALYS_REGION_EMBLEMS.venalys
      }
    }
  )
});
