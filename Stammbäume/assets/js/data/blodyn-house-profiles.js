import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

export const BLODYN_REGION_EMBLEMS = Object.freeze({
  vennyr: 'assets/images/regions/vennyr.png',
  bluetenland: 'assets/images/regions/bluetenland.png',
  hoyersKrone: 'assets/images/regions/hoyers-krone.png',
  lyndor: 'assets/images/regions/lyndor.png',
  cenyr: 'assets/images/regions/koenigreich-cenyr.png',
  klaueninsel: 'assets/images/regions/klaueninsel.png',
  blutklaue: 'assets/images/regions/blutklaue.webp',
  aberdail: 'assets/images/placeholders/neutral-crest.png'
});

function profile(folderPath, rankId, regionEmblems, options = {}) {
  return createHouseProfileFromFolderPath(folderPath, {
    rankId,
    liegeHouseId: options.liegeHouseId || '',
    liegeHouseName: options.liegeHouseName || '',
    regionEmblems
  });
}

export const BLODYN_HOUSE_PROFILES = Object.freeze({
  lyndor: profile(
    ['Vennyr', 'Blütenland', 'Baronie Hoyers Krone', 'Lyndor'],
    'royal',
    {
      kingdom: BLODYN_REGION_EMBLEMS.vennyr,
      county: BLODYN_REGION_EMBLEMS.bluetenland,
      barony: BLODYN_REGION_EMBLEMS.hoyersKrone,
      seat: BLODYN_REGION_EMBLEMS.lyndor
    }
  ),
  aberdail: profile(
    ['Cenyr', 'Klaueninsel', 'Blutklaue', 'Aberdail'],
    'barony',
    {
      kingdom: BLODYN_REGION_EMBLEMS.cenyr,
      county: BLODYN_REGION_EMBLEMS.klaueninsel,
      barony: BLODYN_REGION_EMBLEMS.blutklaue,
      seat: BLODYN_REGION_EMBLEMS.aberdail
    },
    { liegeHouseId: 'house-arth', liegeHouseName: 'Haus Arth' }
  )
});
