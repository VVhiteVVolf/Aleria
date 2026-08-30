import { HOUSE_MAC_ARD_CUMHAILL_PORTRAITS } from './house-mac-ard-cumhaill-portraits.js';
import { HOUSE_NA_MHUIR_LOCAL_PORTRAITS } from './house-na-mhuir-local-portraits.js';
import { HOUSE_RUIN_UA_LAOCH_PORTRAITS } from './house-ruin-ua-laoch-portraits.js';
import { HOUSE_UA_EIRCE_PORTRAITS } from './house-ua-eirce-portraits.js';
import { HOUSE_UI_FIACHRACH_PORTRAITS } from './house-ui-fiachrach-portraits.js';

// Die Ua’Gaelach-Quellseite enthält veraltete Bilder. Bis neue Clanporträts
// vorliegen, werden ausschließlich bereits kanonische Bilder angeheirateter
// Personen aus ihren ausgearbeiteten Herkunftsakten wiederverwendet.
export const HOUSE_UA_GAELACH_REUSED_PORTRAIT_IDS = Object.freeze([
  'eithne-cumhail',
  'naran-laoch',
  'eigneachan-eirce',
  'flannait-laoch',
  'maoltuile-eirce',
  'uallach-fiachrach',
  'cathalan-gallchobhair',
  'shila-gallchobhair',
  'tuaman-mhuir',
  'giollanaimhe-frisealach',
  'uasalan-tordach',
  'troscan-ruitheach',
  'torlaith-blar',
  'meallchu-airgid'
]);

export const HOUSE_UA_GAELACH_PORTRAITS = Object.freeze({
  'eithne-cumhail': HOUSE_MAC_ARD_CUMHAILL_PORTRAITS['eithne-cumhail'],
  'naran-laoch': HOUSE_RUIN_UA_LAOCH_PORTRAITS['naran-laoch'],
  'eigneachan-eirce': HOUSE_UA_EIRCE_PORTRAITS['eigneachan-eirce'],
  'flannait-laoch': HOUSE_RUIN_UA_LAOCH_PORTRAITS['flannait-laoch'],
  'maoltuile-eirce': HOUSE_UA_EIRCE_PORTRAITS['maoltuile-eirce'],
  'uallach-fiachrach': HOUSE_UI_FIACHRACH_PORTRAITS['uallach-fiachrach'],
  'cathalan-gallchobhair': 'assets/images/portraits/haus-fir-an-gallchobhair/cathalan-gallchobhair.jpg',
  'shila-gallchobhair': 'assets/images/portraits/haus-fir-an-gallchobhair/shila-gallchobhair.jpg',
  'tuaman-mhuir': HOUSE_NA_MHUIR_LOCAL_PORTRAITS['tuaman-mhuir'],
  'giollanaimhe-frisealach': 'assets/images/portraits/haus-ard-frisealach/giollanaimhe-frisealach.png',
  'uasalan-tordach': 'assets/images/portraits/haus-ard-trodach/uasalan-tordach.png',
  'troscan-ruitheach': 'assets/images/portraits/haus-dal-ruitheach/troscan-ruitheach.jpg',
  'torlaith-blar': 'assets/images/portraits/haus-nic-blar/torlaith-blar.png',
  'meallchu-airgid': 'assets/images/portraits/haus-tir-an-airgid/meallchu-airgid.png'
});
