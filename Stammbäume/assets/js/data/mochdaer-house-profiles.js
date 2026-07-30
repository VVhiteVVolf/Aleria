import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { WEIDEBUCHT_HOUSE_PROFILES } from './weidebucht-house-profiles.js';

export const MOCHDAER_REGION_EMBLEMS = Object.freeze({
  vennyr: 'assets/images/regions/vennyr.png',
  tirGorllewin: 'assets/images/regions/Vennyr/Tir Gorllewin.png',
  tirBrocair: 'assets/images/regions/Vennyr/Tir Brocair.png',
  // Für Gwyliau wurde kein eigenes Ortswappen geliefert.
  gwyliau: ''
});

const gwyliauProfile = createHouseProfileFromFolderPath(
  ['Vennyr', 'Tir Gorllewin', 'Tir Brocair', 'Gwyliau'],
  {
    rankId: 'knight-prince',
    regionEmblems: {
      kingdom: MOCHDAER_REGION_EMBLEMS.vennyr,
      county: MOCHDAER_REGION_EMBLEMS.tirGorllewin,
      barony: MOCHDAER_REGION_EMBLEMS.tirBrocair,
      seat: MOCHDAER_REGION_EMBLEMS.gwyliau
    }
  }
);

export const MOCHDAER_HOUSE_PROFILES = Object.freeze({
  gwyliau: Object.freeze({
    ...gwyliauProfile,
    secondarySeats: Object.freeze([...gwyliauProfile.secondarySeats]),
    regionEmblems: Object.freeze({ ...gwyliauProfile.regionEmblems })
  }),
  cerrigarth: WEIDEBUCHT_HOUSE_PROFILES.mochdaer
});
