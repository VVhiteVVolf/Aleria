import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

export const WEISENFLUH_REGION_EMBLEMS = Object.freeze({
  weisenfluh: 'assets/images/regions/weisenfluh.png'
});

export const WEISENFLUH_HOUSE_PROFILES = Object.freeze({
  weinlaub: createHouseProfileFromFolderPath(
    ['Weisenfluh', 'Region Ewigensee', 'Ewigensee'],
    {
      rankId: 'knight',
      secondarySeats: ['Burg Rebenwacht nahe Ewigensee'],
      regionEmblems: {
        kingdom: WEISENFLUH_REGION_EMBLEMS.weisenfluh
      }
    }
  )
});
