import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import {
  ALDRIMAR_HOUSE_EMBLEMS,
  ALDRIMAR_HOUSE_PROFILES,
  ALDRIMAR_REGION_EMBLEMS
} from './aldrimar-house-profiles.js';

const IVARSHEIM_ROOT = Object.freeze(['Aldrimar', 'Ivarsheim']);
const IVARSFELS_PATH = Object.freeze([...IVARSHEIM_ROOT, 'Ivarsklamm', 'Ivarsfels']);
const KORNWEILER_PATH = Object.freeze([...IVARSHEIM_ROOT, 'Saatgrund', 'Kornweiler']);
const WINTERFESTE_PATH = Object.freeze([
  ...IVARSHEIM_ROOT,
  'Saatgrund',
  'Winterwacht',
  'Winterfeste'
]);
const JAEGERSRUH_PATH = Object.freeze([...IVARSHEIM_ROOT, 'Rothain', 'Jägersruh']);
const HJERIMSHEIM_PATH = Object.freeze([...IVARSHEIM_ROOT, 'Klippenschlag', 'Hjerimsheim']);
const EXTINCT_ROOT = Object.freeze([...IVARSHEIM_ROOT, 'Ausgestorbene Häuser']);
const TRACHWYLL_ORIGIN_PATH = Object.freeze(['Vennyr', 'Tir Gogledd', 'Talfronwyn']);

export const IVARSHEIM_EXTINCT_HOUSE_GROUPS = Object.freeze({
  norrnaigh: 'Norrnaigh (Nordmänner)',
  glaennath: 'Glaennath (Alben)',
  aldrimar: 'Aldrimarer (jüngst ausgestorben)'
});

export const IVARSHEIM_REGION_EMBLEMS = Object.freeze({
  ivarsklamm: 'assets/images/regions/aldrimar-ivarsklamm.png',
  saatgrund: 'assets/images/regions/aldrimar-saatgrund.png',
  rothain: 'assets/images/regions/aldrimar-rothain.png',
  klippenschlag: 'assets/images/regions/aldrimar-klippenschlag.png',
  winterwacht: 'assets/images/regions/aldrimar-winterwacht.png',
  city: 'assets/images/regions/aldrimar-stadt.png',
  extinct: 'assets/images/regions/Cenyr/Ährental/Ausgestorben.png',
  vennyr: 'assets/images/regions/vennyr.png',
  tirGogledd: 'assets/images/regions/Vennyr/Tir Gogledd.png'
});

const HOUSE_ROOT = 'assets/images/houses/Aldrimar/Ivarsheim';

export const IVARSHEIM_HOUSE_EMBLEMS = Object.freeze({
  wargh: ALDRIMAR_HOUSE_EMBLEMS.wargh,
  feuerhaar: `${HOUSE_ROOT}/clan-feuerhaar.png`,
  skogg: `${HOUSE_ROOT}/clan-skogg.png`,
  silberzunge: `${HOUSE_ROOT}/clan-silberzunge.png`,
  trachwyll: `${HOUSE_ROOT}/haus-trachwyll.png`,
  grendel: `${HOUSE_ROOT}/clan-grendel.png`,
  hyrmgardr: `${HOUSE_ROOT}/clan-hyrmgarthr.png`,
  blutklinge: `${HOUSE_ROOT}/haus-blutklinge.png`,
  windhueter: `${HOUSE_ROOT}/haus-windhueter.png`,
  morkvard: `${HOUSE_ROOT}/haus-morkvard.png`,
  'mac-luin': `${HOUSE_ROOT}/haus-mac-luin.png`,
  'an-borach': `${HOUSE_ROOT}/haus-an-borach.png`
});

function freezeProfile(profile) {
  return Object.freeze({
    ...profile,
    secondarySeats: Object.freeze([...profile.secondarySeats]),
    ...(profile.folderPath ? { folderPath: Object.freeze([...profile.folderPath]) } : {}),
    regionEmblems: Object.freeze({ ...profile.regionEmblems })
  });
}

function ivarsheimProfile(rankId, path, options = {}) {
  return freezeProfile(createHouseProfileFromFolderPath(path, {
    rankId,
    liegeHouseId: options.liegeHouseId === undefined ? 'house-wargh' : options.liegeHouseId,
    liegeHouseName: options.liegeHouseName === undefined ? 'Clan Wargh' : options.liegeHouseName,
    secondarySeats: options.secondarySeats || [],
    regionEmblems: {
      kingdom: ALDRIMAR_REGION_EMBLEMS.aldrimar,
      county: ALDRIMAR_REGION_EMBLEMS.ivarsheim,
      barony: options.baronyEmblem || '',
      seat: options.seatEmblem || IVARSHEIM_REGION_EMBLEMS.city
    }
  }));
}

function extinctProfile(group, place) {
  return ivarsheimProfile('unknown', [...EXTINCT_ROOT, group], {
    liegeHouseId: '',
    liegeHouseName: '',
    secondarySeats: [place],
    baronyEmblem: IVARSHEIM_REGION_EMBLEMS.extinct,
    seatEmblem: IVARSHEIM_REGION_EMBLEMS.extinct
  });
}

export const IVARSHEIM_HOUSE_PROFILES = Object.freeze({
  wargh: ALDRIMAR_HOUSE_PROFILES.wargh,
  feuerhaar: ivarsheimProfile('thane', JAEGERSRUH_PATH, {
    baronyEmblem: IVARSHEIM_REGION_EMBLEMS.rothain
  }),
  skogg: ivarsheimProfile('thane', KORNWEILER_PATH, {
    baronyEmblem: IVARSHEIM_REGION_EMBLEMS.saatgrund
  }),
  silberzunge: ivarsheimProfile('hesire', IVARSFELS_PATH, {
    baronyEmblem: IVARSHEIM_REGION_EMBLEMS.ivarsklamm
  }),
  trachwyll: ivarsheimProfile('hesire', IVARSFELS_PATH, {
    baronyEmblem: IVARSHEIM_REGION_EMBLEMS.ivarsklamm
  }),
  grendel: ivarsheimProfile('hesire', HJERIMSHEIM_PATH, {
    baronyEmblem: IVARSHEIM_REGION_EMBLEMS.klippenschlag
  }),
  hyrmgardr: ivarsheimProfile('hesire', WINTERFESTE_PATH, {
    liegeHouseId: 'house-skogg',
    liegeHouseName: 'Clan Skogg',
    baronyEmblem: IVARSHEIM_REGION_EMBLEMS.saatgrund,
    seatEmblem: IVARSHEIM_REGION_EMBLEMS.winterwacht
  }),
  blutklinge: extinctProfile(IVARSHEIM_EXTINCT_HOUSE_GROUPS.aldrimar, 'Ivarsfels'),
  windhueter: extinctProfile(IVARSHEIM_EXTINCT_HOUSE_GROUPS.aldrimar, 'Ivarsfels'),
  morkvard: extinctProfile(IVARSHEIM_EXTINCT_HOUSE_GROUPS.norrnaigh, 'Ort unbekannt'),
  'mac-luin': extinctProfile(IVARSHEIM_EXTINCT_HOUSE_GROUPS.glaennath, 'Ard Eabhraig'),
  'an-borach': extinctProfile(IVARSHEIM_EXTINCT_HOUSE_GROUPS.glaennath, 'Kornweiler')
});

export const IVARSHEIM_ORIGIN_HOUSE_PROFILES = Object.freeze({
  'trachwyll-talfronwyn': freezeProfile(createHouseProfileFromFolderPath(
    TRACHWYLL_ORIGIN_PATH,
    {
      rankId: 'county',
      regionEmblems: {
        kingdom: IVARSHEIM_REGION_EMBLEMS.vennyr,
        county: IVARSHEIM_REGION_EMBLEMS.tirGogledd,
        barony: '',
        seat: ''
      }
    }
  ))
});
