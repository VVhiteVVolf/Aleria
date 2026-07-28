import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

export const AELDRUNMAR_REGION_EMBLEMS = Object.freeze({
  aeldrunmar: 'assets/images/regions/aeldrunmar.png'
});

export const AELDRUNMAR_HOUSE_PROFILES = Object.freeze({
  scandyn: createHouseProfileFromFolderPath(
    ['Aeldrunmar', 'Earltum der Tharn', 'Thaintum Trenmorath', 'Scandmere'],
    {
      rankId: 'knight',
      liegeHouseId: 'house-tharn',
      liegeHouseName: 'Haus Tharn',
      regionEmblems: {
        kingdom: AELDRUNMAR_REGION_EMBLEMS.aeldrunmar
      }
    }
  )
});
