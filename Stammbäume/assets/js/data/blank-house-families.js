import { CELTIGERNS_WACHT_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import { createBlankHouseFamily } from './blank-house-family-factory.js';

export const HOUSE_GWEFRYDD_FAMILY = createBlankHouseFamily({
  id: 'haus-gwefrydd',
  title: 'Haus Gwefrydd',
  emblem: 'assets/images/houses/haus-gwefrydd.png',
  houseProfile: CELTIGERNS_WACHT_HOUSE_PROFILES.gwefrydd
});

export const HOUSE_GWYVERN_FAMILY = createBlankHouseFamily({
  id: 'haus-gwyvern',
  title: 'Haus Gwyvern',
  emblem: 'assets/images/houses/haus-gwyvern.png',
  houseProfile: CELTIGERNS_WACHT_HOUSE_PROFILES.gwyvern
});
