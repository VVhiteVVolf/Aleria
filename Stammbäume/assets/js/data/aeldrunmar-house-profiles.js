import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

export const AELDRUNMAR_REGION_EMBLEMS = Object.freeze({
  aeldrunmar: 'assets/images/regions/aeldrunmar.png'
});

export const AELDRUNMAR_HOUSE_EMBLEMS = Object.freeze({
  beran: 'assets/images/houses/Aeldrunmar/haus-beran.png',
  earncynne: 'assets/images/houses/Aeldrunmar/haus-earncynne.png',
  estmere: 'assets/images/houses/Aeldrunmar/haus-estmere.png',
  frye: 'assets/images/houses/Aeldrunmar/haus-frye.png',
  kendryck: 'assets/images/houses/Aeldrunmar/haus-kendryck.png',
  seolfor: 'assets/images/houses/Aeldrunmar/haus-seolfor.png',
  tharn: 'assets/images/houses/Aeldrunmar/haus-tharn.png'
});

const createAeldrunmarProfile = (folderPath, options = {}) =>
  createHouseProfileFromFolderPath(folderPath, {
    ...options,
    regionEmblems: {
      kingdom: AELDRUNMAR_REGION_EMBLEMS.aeldrunmar,
      ...(options.regionEmblems || {})
    }
  });

export const AELDRUNMAR_HOUSE_PROFILES = Object.freeze({
  frye: createAeldrunmarProfile(['Aeldrunmar', 'Jarltum der Fyr'], {
    rankId: 'county'
  }),
  estmere: createAeldrunmarProfile(['Aeldrunmar', 'Jarltum der Estmere'], {
    rankId: 'county'
  }),
  earncynne: createAeldrunmarProfile(['Aeldrunmar', 'Jarltum der Earncynne'], {
    rankId: 'county'
  }),
  beran: createAeldrunmarProfile(['Aeldrunmar', 'Jarltum der Beran'], {
    rankId: 'county'
  }),
  kendryck: createAeldrunmarProfile(
    ['Aeldrunmar', 'Königliches Jarltum der Kendryck'],
    {
      rankId: 'royal',
      secondarySeats: ['Aeldrunhal']
    }
  ),
  seolfor: createAeldrunmarProfile(
    ['Aeldrunmar', 'Königliches Jarltum der Kendryck', 'Thainschaft der Seolfor'],
    {
      rankId: 'barony',
      liegeHouseId: 'house-kendryck',
      liegeHouseName: 'Haus Kendryck'
    }
  ),
  tharn: createAeldrunmarProfile(['Aeldrunmar', 'Jarltum der Tharn'], {
    rankId: 'county'
  }),
  scandyn: createAeldrunmarProfile(
    ['Aeldrunmar', 'Jarltum der Tharn', 'Thaintum Trenmorath', 'Scandmere'],
    {
      rankId: 'knight',
      liegeHouseId: 'house-tharn',
      liegeHouseName: 'Haus Tharn'
    }
  )
});
